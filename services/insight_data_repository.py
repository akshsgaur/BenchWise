import os
import math
from datetime import datetime, timedelta
from typing import Dict, List, Any, Tuple
from urllib.parse import urlparse

from bson import ObjectId
from pymongo import MongoClient


class InsightDataRepository:
    """Handles MongoDB access and aggregates analytics-ready snapshots."""

    def __init__(self, mongo_uri: str | None = None, db_name: str | None = None):
        self.mongo_uri = mongo_uri or os.getenv("MONGODB_URI")
        if not self.mongo_uri:
            raise ValueError("MONGODB_URI is not set")

        self.client = MongoClient(self.mongo_uri)
        self.db = self._resolve_database(db_name)
        self._snapshot_cache: Dict[Tuple[str, int], Dict[str, Any]] = {}

    def _resolve_database(self, explicit_db: str | None):
        if explicit_db:
            return self.client[explicit_db]

        default_db = None
        try:
            default_db = self.client.get_default_database()
        except Exception:  # get_default_database raises if none is configured
            default_db = None

        if default_db is not None:
            return default_db

        env_db = os.getenv("MONGODB_DB_NAME")
        if env_db:
            return self.client[env_db]

        parsed = urlparse(self.mongo_uri)
        db_from_uri = parsed.path.lstrip("/")
        if db_from_uri:
            return self.client[db_from_uri]

        raise ValueError("Unable to determine MongoDB database name")

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------
    def find_integrations_with_plaid(self) -> List[Dict[str, Any]]:
        cursor = self.db["integrations"].find({
            "plaid.isIntegrated": True,
            "plaid.bankConnections": {"$exists": True, "$not": {"$size": 0}},
        })
        return list(cursor)

    def get_snapshot(self, user_id: str, period_days: int = 60) -> Dict[str, Any]:
        cache_key = (user_id, period_days)
        if cache_key in self._snapshot_cache:
            return self._snapshot_cache[cache_key]

        snapshot = self._build_snapshot(user_id, period_days)
        self._snapshot_cache[cache_key] = snapshot
        return snapshot

    def save_insight_document(self, user_id: str, document: Dict[str, Any]) -> None:
        user_object_id = ObjectId(user_id)
        document_to_save = {
            **document,
            "userId": user_object_id,
        }

        self.db["insights"].update_one(
            {"userId": user_object_id},
            {"$set": document_to_save},
            upsert=True,
        )

    # ------------------------------------------------------------------
    # Snapshot construction
    # ------------------------------------------------------------------
    def _build_snapshot(self, user_id: str, period_days: int) -> Dict[str, Any]:
        user_object_id = ObjectId(user_id)

        now = datetime.utcnow().date()
        end_date = now
        start_date = now - timedelta(days=period_days - 1)
        prior_end = start_date - timedelta(days=1)
        prior_start = prior_end - timedelta(days=period_days - 1)
        ninety_start = now - timedelta(days=90)

        start_str = start_date.isoformat()
        end_str = end_date.isoformat()
        prior_start_str = prior_start.isoformat()
        prior_end_str = prior_end.isoformat()
        ninety_start_str = ninety_start.isoformat()

        transactions_collection = self.db["transactions"]

        period_txns = list(
            transactions_collection.find(
                {
                    "userId": user_object_id,
                    "date": {"$gte": start_str, "$lte": end_str},
                }
            )
        )

        prior_txns = list(
            transactions_collection.find(
                {
                    "userId": user_object_id,
                    "date": {"$gte": prior_start_str, "$lte": prior_end_str},
                }
            )
        )

        ninety_txns = list(
            transactions_collection.find(
                {
                    "userId": user_object_id,
                    "date": {"$gte": ninety_start_str, "$lte": end_str},
                }
            )
        )

        integration = self.db["integrations"].find_one({"userId": user_object_id})

        account_summary = self._compute_account_summary(integration)
        cashflow = self._compute_cashflow(period_txns)
        baseline_cashflow = self._compute_cashflow(prior_txns)
        categories = self._compute_category_breakdown(period_txns, prior_txns)
        recurring = self._compute_recurring_charges(ninety_txns)
        anomalies = self._compute_anomalies(period_txns)
        top_transactions = self._top_transactions(period_txns)
        opportunity_signals = self._opportunity_signals(
            account_summary, cashflow, categories, recurring, anomalies
        )

        snapshot = {
            "userId": user_id,
            "periodDays": period_days,
            "dateRange": {
                "start": start_str,
                "end": end_str,
            },
            "transactions": {
                "current": self._simplify_transactions(period_txns),
                "baseline": self._simplify_transactions(prior_txns),
                "recent": self._simplify_transactions(period_txns)[:20],
            },
            "accountSummary": account_summary,
            "cashflow": {
                "current": cashflow,
                "baseline": baseline_cashflow,
            },
            "categoryBreakdown": categories,
            "recurringCharges": recurring,
            "anomalies": anomalies,
            "topTransactions": top_transactions,
            "opportunitySignals": opportunity_signals,
        }

        snapshot["transactionCount"] = len(period_txns)
        snapshot["totalIncome"] = cashflow["totalIncome"]
        snapshot["totalSpend"] = cashflow["totalSpend"]
        snapshot["netCashflow"] = cashflow["netCashflow"]

        return snapshot

    # ------------------------------------------------------------------
    # Computation helpers
    # ------------------------------------------------------------------
    @staticmethod
    def _compute_account_summary(integration: Dict[str, Any] | None) -> Dict[str, Any]:
        if not integration:
            return {
                "totalAssets": 0.0,
                "totalDebt": 0.0,
                "netWorth": 0.0,
                "institutions": [],
                "accounts": [],
            }

        bank_connections = integration.get("plaid", {}).get("bankConnections", [])
        institutions = []
        accounts = []
        assets = 0.0
        debt = 0.0

        for connection in bank_connections:
            connection_accounts = connection.get("accounts", [])
            institution_assets = 0.0
            institution_debt = 0.0

            for account in connection_accounts:
                balance = InsightDataRepository._to_number(
                    account.get("balance", account.get("balances", {}).get("current"))
                )
                account_type = account.get("type", "unknown")

                account_payload = {
                    "institutionId": connection.get("institutionId"),
                    "institutionName": connection.get("institutionName"),
                    "accountId": account.get("accountId"),
                    "name": account.get("name"),
                    "type": account_type,
                    "subtype": account.get("subtype"),
                    "balance": balance,
                }
                accounts.append(account_payload)

                if account_type in {"depository", "investment", "brokerage", "cash_management"}:
                    assets += balance
                    institution_assets += balance
                elif account_type in {"credit", "loan", "mortgage"}:
                    debt += balance
                    institution_debt += balance

            institutions.append(
                {
                    "institutionId": connection.get("institutionId"),
                    "institutionName": connection.get("institutionName"),
                    "accountCount": len(connection_accounts),
                    "assetTotal": institution_assets,
                    "debtTotal": institution_debt,
                    "lastSync": connection.get("lastSync"),
                }
            )

        return {
            "totalAssets": assets,
            "totalDebt": debt,
            "netWorth": assets - debt,
            "institutions": institutions,
            "accounts": accounts,
        }

    @staticmethod
    def _compute_cashflow(transactions: List[Dict[str, Any]]) -> Dict[str, Any]:
        if not transactions:
            return {
                "totalIncome": 0.0,
                "totalSpend": 0.0,
                "netCashflow": 0.0,
                "savingsRate": 0.0,
            }

        total_spend = 0.0
        total_income = 0.0

        for txn in transactions:
            amount = InsightDataRepository._to_number(txn.get("amount"))
            if amount >= 0:
                total_spend += amount
            else:
                total_income += abs(amount)

        net_cashflow = total_income - total_spend
        savings_rate = (net_cashflow / total_income * 100) if total_income > 0 else 0.0

        return {
            "totalIncome": total_income,
            "totalSpend": total_spend,
            "netCashflow": net_cashflow,
            "savingsRate": savings_rate,
        }

    @staticmethod
    def _compute_category_breakdown(
        current_transactions: List[Dict[str, Any]],
        baseline_transactions: List[Dict[str, Any]],
    ) -> List[Dict[str, Any]]:
        def summarize(txns: List[Dict[str, Any]]):
            summary: Dict[str, Dict[str, float]] = {}
            for txn in txns:
                amount = InsightDataRepository._to_number(txn.get("amount"))
                if amount <= 0:
                    continue
                category = txn.get("category") or []
                primary_category = category[0] if category else "Uncategorized"
                info = summary.setdefault(primary_category, {"total": 0.0, "count": 0.0})
                info["total"] += amount
                info["count"] += 1
            return summary

        current_summary = summarize(current_transactions)
        baseline_summary = summarize(baseline_transactions)

        breakdown = []
        for category, info in current_summary.items():
            baseline_total = baseline_summary.get(category, {}).get("total", 0.0)
            delta = info["total"] - baseline_total
            percent_change = (delta / baseline_total * 100) if baseline_total > 0 else None
            breakdown.append(
                {
                    "category": category,
                    "total": info["total"],
                    "count": info["count"],
                    "average": info["total"] / info["count"] if info["count"] else 0.0,
                    "baselineTotal": baseline_total,
                    "change": delta,
                    "changePct": percent_change,
                }
            )

        # Also include categories that only exist in baseline to show drops
        for category, info in baseline_summary.items():
            if category in current_summary:
                continue
            breakdown.append(
                {
                    "category": category,
                    "total": 0.0,
                    "count": 0.0,
                    "average": 0.0,
                    "baselineTotal": info["total"],
                    "change": -info["total"],
                    "changePct": -100.0,
                }
            )

        breakdown.sort(key=lambda entry: entry["total"], reverse=True)
        return breakdown[:15]

    @staticmethod
    def _compute_recurring_charges(transactions: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        merchant_map: Dict[str, List[Dict[str, Any]]] = {}
        for txn in transactions:
            amount = InsightDataRepository._to_number(txn.get("amount"))
            if amount <= 0:
                continue
            merchant = txn.get("merchant_name") or txn.get("name")
            if not merchant:
                continue
            merchant_map.setdefault(merchant, []).append(
                {
                    "amount": amount,
                    "date": txn.get("date"),
                }
            )

        recurring = []
        for merchant, entries in merchant_map.items():
            if len(entries) < 2:
                continue
            amounts = [entry["amount"] for entry in entries]
            avg_amount = sum(amounts) / len(amounts)
            std_dev = InsightDataRepository._std_dev(amounts, avg_amount)
            is_consistent = std_dev <= max(1, avg_amount * 0.1)
            recurring.append(
                {
                    "merchant": merchant,
                    "averageAmount": avg_amount,
                    "transactions": len(entries),
                    "totalSpent": sum(amounts),
                    "isConsistent": is_consistent,
                }
            )

        recurring.sort(key=lambda entry: entry["totalSpent"], reverse=True)
        return recurring[:15]

    @staticmethod
    def _compute_anomalies(transactions: List[Dict[str, Any]], sigma: float = 2.0) -> List[Dict[str, Any]]:
        expenses = [
            InsightDataRepository._to_number(txn.get("amount"))
            for txn in transactions
            if InsightDataRepository._to_number(txn.get("amount")) > 0
        ]
        if not expenses:
            return []

        mean = sum(expenses) / len(expenses)
        std_dev = InsightDataRepository._std_dev(expenses, mean)
        if std_dev == 0:
            threshold = mean * 2
        else:
            threshold = mean + sigma * std_dev

        anomalies = []
        for txn in transactions:
            amount = InsightDataRepository._to_number(txn.get("amount"))
            if amount > threshold:
                anomalies.append(
                    {
                        "date": txn.get("date"),
                        "amount": amount,
                        "name": txn.get("name"),
                        "merchant": txn.get("merchant_name"),
                        "category": (txn.get("category") or ["Uncategorized"])[0],
                        "threshold": threshold,
                    }
                )

        anomalies.sort(key=lambda entry: entry["amount"], reverse=True)
        return anomalies[:10]

    @staticmethod
    def _top_transactions(transactions: List[Dict[str, Any]], limit: int = 5) -> List[Dict[str, Any]]:
        expenses = [
            txn for txn in transactions if InsightDataRepository._to_number(txn.get("amount")) > 0
        ]
        expenses.sort(
            key=lambda txn: InsightDataRepository._to_number(txn.get("amount")),
            reverse=True,
        )
        top = []
        for txn in expenses[:limit]:
            top.append(
                {
                    "date": txn.get("date"),
                    "amount": InsightDataRepository._to_number(txn.get("amount")),
                    "name": txn.get("name"),
                    "merchant": txn.get("merchant_name"),
                    "category": (txn.get("category") or ["Uncategorized"])[0],
                }
            )
        return top

    @staticmethod
    def _opportunity_signals(
        account_summary: Dict[str, Any],
        cashflow: Dict[str, Any],
        categories: List[Dict[str, Any]],
        recurring: List[Dict[str, Any]],
        anomalies: List[Dict[str, Any]],
    ) -> List[str]:
        signals = []

        if cashflow["netCashflow"] < 0:
            signals.append("Net cashflow is negative; spending exceeds income in the current period.")
        elif cashflow["savingsRate"] < 10:
            signals.append("Savings rate is below 10%; consider trimming discretionary spend to boost savings.")

        if account_summary["totalDebt"] > 0 and account_summary["totalAssets"] > 0:
            debt_ratio = account_summary["totalDebt"] / max(account_summary["totalAssets"], 1)
            if debt_ratio > 0.6:
                signals.append("Debt represents more than 60% of assets; monitor leverage closely.")

        if recurring:
            top_recurring = recurring[0]
            if top_recurring["totalSpent"] > 300:
                signals.append(
                    f"High recurring spend detected with {top_recurring['merchant']} at {top_recurring['totalSpent']:.2f} over three months."
                )

        if anomalies:
            largest = anomalies[0]
            signals.append(
                f"Unusually large transaction of {largest['amount']:.2f} on {largest['date']} ({largest['name']})."
            )

        if categories:
            top_category = categories[0]
            share_of_spend = (top_category["total"] / max(cashflow["totalSpend"], 1)) * 100 if cashflow["totalSpend"] else 0
            if share_of_spend > 35:
                signals.append(
                    f"{top_category['category']} accounts for {share_of_spend:.1f}% of spending; explore optimization opportunities."
                )

        return signals

    @staticmethod
    def _simplify_transactions(transactions: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        simplified = []
        for txn in sorted(transactions, key=lambda t: t.get("date", ""), reverse=True):
            simplified.append(
                {
                    "transactionId": txn.get("transaction_id"),
                    "date": txn.get("date"),
                    "amount": InsightDataRepository._to_number(txn.get("amount")),
                    "name": txn.get("name"),
                    "merchant": txn.get("merchant_name"),
                    "category": txn.get("category"),
                    "institutionId": txn.get("institutionId"),
                    "accountId": txn.get("account_id"),
                }
            )
        return simplified

    @staticmethod
    def _to_number(value: Any) -> float:
        if value is None:
            return 0.0
        if isinstance(value, (int, float)):
            return float(value)
        if isinstance(value, str):
            try:
                return float(value)
            except ValueError:
                return 0.0
        if isinstance(value, dict):
            for key in ("current", "amount", "balance", "value", "available"):
                if key in value:
                    nested = InsightDataRepository._to_number(value[key])
                    if nested != 0.0:
                        return nested
            return 0.0
        return 0.0

    @staticmethod
    def _std_dev(values: List[float], mean: float) -> float:
        if not values:
            return 0.0
        variance = sum((value - mean) ** 2 for value in values) / len(values)
        return math.sqrt(variance)


__all__ = ["InsightDataRepository"]
