import json
import os
from datetime import datetime
from typing import Any, Dict, List, Optional

from openai import OpenAI

from insight_data_repository import InsightDataRepository


class InsightAgentService:
    """Autonomous analytics agent that generates BenchWise insights."""

    def __init__(self, mongo_uri: Optional[str] = None, db_name: Optional[str] = None):
        self.repository = InsightDataRepository(mongo_uri=mongo_uri, db_name=db_name)

        api_key = os.getenv("AZURE_OPENAI_API_KEY") or os.getenv("OPENAI_API_KEY")
        base_url = os.getenv("ENDPOINT_URL")
        deployment = os.getenv("DEPLOYMENT_NAME") or os.getenv("OPENAI_MODEL")

        self.openai_client: Optional[OpenAI] = None
        self.model_name: Optional[str] = None

        if api_key and (deployment or os.getenv("OPENAI_MODEL")):
            base = f"{base_url.rstrip('/')}/openai/v1/" if base_url else None
            self.openai_client = OpenAI(api_key=api_key, base_url=base)
            self.model_name = deployment or os.getenv("OPENAI_MODEL")
        else:
            print("⚠️ InsightAgentService initialized without OpenAI credentials; falling back to heuristics.")

        self.tools = self._define_tools()

    # ------------------------------------------------------------------
    # Public entry points
    # ------------------------------------------------------------------
    def generate_for_all_users(self, period_days: int = 60) -> None:
        integrations = self.repository.find_integrations_with_plaid()
        print(f"🧠 Generating insights for {len(integrations)} users (window={period_days}d)")
        for integration in integrations:
            user_id = str(integration["userId"])
            try:
                self.generate_for_user(user_id=user_id, period_days=period_days)
            except Exception as exc:  # pylint: disable=broad-except
                print(f"❌ Insight generation failed for user {user_id}: {exc}")

    def generate_for_user(self, user_id: str, period_days: int = 60) -> Dict[str, Any]:
        snapshot = self.repository.get_snapshot(user_id, period_days)

        if snapshot["transactionCount"] == 0:
            placeholder = self._build_placeholder_document(snapshot)
            self.repository.save_insight_document(user_id, placeholder)
            print(f"ℹ️ No transactions for user {user_id}. Stored placeholder insight.")
            return {"status": "placeholder", "userId": user_id}

        if not self.openai_client or not self.model_name:
            fallback = self._build_fallback_document(snapshot)
            self.repository.save_insight_document(user_id, fallback)
            print(f"⚠️ Stored heuristic insight for user {user_id} (OpenAI unavailable).")
            return {"status": "heuristic", "userId": user_id}

        structured_response = self._run_agent(user_id, snapshot)

        if not structured_response:
            fallback = self._build_fallback_document(snapshot)
            self.repository.save_insight_document(user_id, fallback)
            print(f"⚠️ Agent returned no response for user {user_id}; stored heuristic insight.")
            return {"status": "heuristic", "userId": user_id}

        document = self._build_insight_document(snapshot, structured_response)
        self.repository.save_insight_document(user_id, document)
        print(f"✅ Stored AI insight for user {user_id} with {len(document['keyMetrics'])} metrics.")
        return {"status": "success", "userId": user_id, "insight": structured_response}

    # ------------------------------------------------------------------
    # Tool definitions & execution
    # ------------------------------------------------------------------
    def _define_tools(self) -> List[Dict[str, Any]]:
        return [
            {
                "type": "function",
                "function": {
                    "name": "get_account_overview",
                    "description": "Summarize balances, debt, and net worth across connected accounts.",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "user_id": {"type": "string"},
                            "period_days": {"type": "integer", "description": "Lookback window"},
                        },
                        "required": ["user_id"],
                    },
                },
            },
            {
                "type": "function",
                "function": {
                    "name": "get_cashflow_summary",
                    "description": "Return income, spending, net cashflow, and savings rate with baseline comparison.",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "user_id": {"type": "string"},
                            "period_days": {"type": "integer"},
                        },
                        "required": ["user_id"],
                    },
                },
            },
            {
                "type": "function",
                "function": {
                    "name": "get_spending_trends",
                    "description": "Fetch top spending categories and trend changes from the prior period.",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "user_id": {"type": "string"},
                            "period_days": {"type": "integer"},
                            "top": {"type": "integer", "description": "Number of categories", "default": 10},
                        },
                        "required": ["user_id"],
                    },
                },
            },
            {
                "type": "function",
                "function": {
                    "name": "get_recurring_expenses",
                    "description": "Identify recurring merchants and their average spend.",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "user_id": {"type": "string"},
                            "window_days": {
                                "type": "integer",
                                "description": "Lookback window for recurring detection",
                                "default": 90,
                            },
                        },
                        "required": ["user_id"],
                    },
                },
            },
            {
                "type": "function",
                "function": {
                    "name": "get_anomaly_transactions",
                    "description": "List unusually large transactions that exceed statistical thresholds.",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "user_id": {"type": "string"},
                            "period_days": {"type": "integer"},
                            "limit": {"type": "integer", "default": 5},
                        },
                        "required": ["user_id"],
                    },
                },
            },
            {
                "type": "function",
                "function": {
                    "name": "get_opportunity_signals",
                    "description": "Surface heuristic insights such as high recurring spend or low savings rate.",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "user_id": {"type": "string"},
                            "period_days": {"type": "integer"},
                        },
                        "required": ["user_id"],
                    },
                },
            },
        ]

    def _execute_tool(self, tool_name: str, arguments: Dict[str, Any]) -> Dict[str, Any]:
        user_id = arguments.get("user_id")
        period_days = arguments.get("period_days", 60)

        if tool_name == "get_account_overview":
            snapshot = self.repository.get_snapshot(user_id, period_days)
            return snapshot["accountSummary"]

        if tool_name == "get_cashflow_summary":
            snapshot = self.repository.get_snapshot(user_id, period_days)
            return snapshot["cashflow"]

        if tool_name == "get_spending_trends":
            snapshot = self.repository.get_snapshot(user_id, period_days)
            top = arguments.get("top", 10)
            return {
                "topCategories": snapshot["categoryBreakdown"][:top],
                "totalSpend": snapshot["totalSpend"],
            }

        if tool_name == "get_recurring_expenses":
            window_days = arguments.get("window_days", 90)
            snapshot = self.repository.get_snapshot(user_id, period_days)
            return {
                "windowDays": window_days,
                "recurring": snapshot["recurringCharges"],
            }

        if tool_name == "get_anomaly_transactions":
            limit = arguments.get("limit", 5)
            snapshot = self.repository.get_snapshot(user_id, period_days)
            return {
                "anomalies": snapshot["anomalies"][:limit],
                "topTransactions": snapshot["topTransactions"][:limit],
            }

        if tool_name == "get_opportunity_signals":
            snapshot = self.repository.get_snapshot(user_id, period_days)
            return {"signals": snapshot["opportunitySignals"]}

        return {"error": f"Unknown tool: {tool_name}"}

    # ------------------------------------------------------------------
    # Agent runtime
    # ------------------------------------------------------------------
    def _run_agent(self, user_id: str, snapshot: Dict[str, Any], max_iterations: int = 6) -> Optional[Dict[str, Any]]:
        base_context = {
            "periodDays": snapshot["periodDays"],
            "dateRange": snapshot["dateRange"],
            "accountSummary": snapshot["accountSummary"],
            "cashflow": snapshot["cashflow"],
            "categoryHighlights": snapshot["categoryBreakdown"][:5],
            "opportunitySignals": snapshot["opportunitySignals"],
            "netCashflow": snapshot["netCashflow"],
            "transactionCount": snapshot["transactionCount"],
        }

        system_prompt = (
            "You are BenchWise's senior financial analyst. Always ground advice in the provided data "
            "and supplement it with tool calls to gather missing context. Quantify insights using USD, "
            "highlight both risks and wins, and close with clear next steps the user can take."
        )

        instructions = (
            "Analyze the financial context and produce actionable insights. Use tools to fill gaps. "
            "When data is insufficient, clearly state assumptions or missing pieces. "
            "Always populate key_metrics with label, value, and displayValue, and include alerts even if empty."
        )

        context_payload = self._make_json_safe(base_context)

        messages: List[Dict[str, Any]] = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": f"{instructions}\n\nContext:\n{json.dumps(context_payload, indent=2)}"},
        ]

        tools_used: List[str] = []

        for iteration in range(max_iterations):
            response = self.openai_client.chat.completions.create(
                model=self.model_name,
                messages=messages,
                tools=self.tools,
                tool_choice="auto",
                temperature=0.2,
            )

            response_message = response.choices[0].message
            messages.append(
                {
                    "role": response_message.role,
                    "content": response_message.content,
                    "tool_calls": response_message.tool_calls,
                }
            )

            if not response_message.tool_calls:
                final_request = messages + [
                    {
                        "role": "user",
                        "content": (
                            "Synthesize a structured insight report using the schema. Include quick stats, insights, "
                            "recommendations, and alerts."
                        ),
                    }
                ]

                final_response = self.openai_client.chat.completions.create(
                    model=self.model_name,
                    messages=final_request,
                    response_format=self._response_schema(),
                    temperature=0.2,
                )

                raw_content = final_response.choices[0].message.content
                try:
                    parsed = json.loads(raw_content)
                    parsed["tools_used"] = tools_used
                    parsed["iterations"] = iteration + 1
                    return parsed
                except json.JSONDecodeError:
                    print("⚠️ Failed to parse agent response as JSON.")
                    return None

            for tool_call in response_message.tool_calls:
                function_name = tool_call.function.name
                try:
                    function_args = json.loads(tool_call.function.arguments or "{}")
                except json.JSONDecodeError:
                    function_args = {}

                function_args.setdefault("user_id", user_id)
                function_args.setdefault("period_days", snapshot["periodDays"])

                tool_result = self._execute_tool(function_name, function_args)
                tools_used.append(function_name)

                messages.append(
                    {
                        "tool_call_id": tool_call.id,
                        "role": "tool",
                        "name": function_name,
                        "content": json.dumps(self._make_json_safe(tool_result), default=str),
                    }
                )

        print("⚠️ Agent reached maximum iterations without final response.")
        return None

    @staticmethod
    def _response_schema() -> Dict[str, Any]:
        return {
            "type": "json_schema",
            "json_schema": {
                "name": "benchwise_insight_response",
                "schema": {
                    "type": "object",
                    "properties": {
                        "summary": {
                            "type": "object",
                            "properties": {
                                "headline": {"type": "string"},
                                "narrative": {"type": "string"},
                            },
                            "required": ["headline", "narrative"],
                            "additionalProperties": False,
                        },
                        "key_metrics": {
                            "type": "array",
                            "items": {
                                "type": "object",
                                "properties": {
                                    "label": {"type": "string"},
                                    "value": {"type": ["number", "null"]},
                                    "displayValue": {"type": ["string", "null"]},
                                },
                                "required": ["label", "value", "displayValue"],
                                "additionalProperties": False,
                            },
                        },
                        "highlights": {
                            "type": "array",
                            "items": {"type": "string"},
                        },
                        "recommendations": {
                            "type": "array",
                            "items": {
                                "type": "object",
                                "properties": {
                                    "title": {"type": "string"},
                                    "detail": {"type": "string"},
                                    "impact": {"type": ["string", "null"]},
                                    "action": {"type": ["string", "null"]},
                                    "category": {"type": ["string", "null"]},
                                },
                                "required": ["title", "detail", "impact", "action", "category"],
                                "additionalProperties": False,
                            },
                        },
                        "alerts": {
                            "type": "array",
                            "items": {"type": "string"},
                        },
                    },
                    "required": ["summary", "key_metrics", "recommendations", "highlights", "alerts"],
                    "additionalProperties": False,
                },
                "strict": True,
            },
        }

    # ------------------------------------------------------------------
    # Insight document builders
    # ------------------------------------------------------------------
    @staticmethod
    def _build_placeholder_document(snapshot: Dict[str, Any]) -> Dict[str, Any]:
        return {
            "summary": {
                "headline": "Connect accounts to unlock insights",
                "narrative": (
                    "No financial data available for analysis. Connect your accounts to get personalized AI insights and recommendations."
                ),
            },
            "keyMetrics": [],
            "highlights": [],
            "recommendations": [],
            "alerts": [],
            "context": {
                "periodDays": snapshot["periodDays"],
                "dateRange": snapshot["dateRange"],
                "transactionCount": 0,
                "totalIncome": 0,
                "totalSpend": 0,
                "netCashflow": 0,
                "generatedFrom": "python-ai-agent-v1",
            },
            "generatedAt": datetime.utcnow(),
            "version": 1,
        }

    @staticmethod
    def _build_fallback_document(snapshot: Dict[str, Any]) -> Dict[str, Any]:
        cashflow = snapshot["cashflow"]["current"]
        account_summary = snapshot["accountSummary"]
        trend = "positive" if cashflow["netCashflow"] >= 0 else "negative"

        summary_text = (
            f"BenchWise analyzed the last {snapshot['periodDays']} days. Net cashflow is {trend} at "
            f"${abs(cashflow['netCashflow']):,.0f}. Total assets stand at ${account_summary['totalAssets']:,.0f} "
            f"vs. debt of ${account_summary['totalDebt']:,.0f}."
        )

        return {
            "summary": {
                "headline": "Fresh insights based on recent activity",
                "narrative": summary_text,
            },
            "keyMetrics": InsightAgentService._baseline_metrics(snapshot),
            "highlights": snapshot["opportunitySignals"][:3],
            "recommendations": [],
            "alerts": [],
            "context": {
                "periodDays": snapshot["periodDays"],
                "dateRange": snapshot["dateRange"],
                "transactionCount": snapshot["transactionCount"],
                "totalIncome": snapshot["totalIncome"],
                "totalSpend": snapshot["totalSpend"],
                "netCashflow": snapshot["netCashflow"],
                "generatedFrom": "python-ai-agent-v1",
            },
            "generatedAt": datetime.utcnow(),
            "version": 1,
        }

    def _build_insight_document(self, snapshot: Dict[str, Any], response: Dict[str, Any]) -> Dict[str, Any]:
        baseline_metrics = self._baseline_metrics(snapshot)
        agent_metrics = response.get("key_metrics") or []
        merged_metrics = self._merge_metrics(baseline_metrics, agent_metrics)

        recommendations = []
        for rec in response.get("recommendations", [])[:6]:
            recommendations.append(
                {
                    "title": rec.get("title", "Recommendation"),
                    "detail": rec.get("detail", ""),
                    "impact": rec.get("impact"),
                    "action": rec.get("action"),
                    "category": rec.get("category"),
                }
            )

        return {
            "summary": {
                "headline": response.get("summary", {}).get("headline", "Financial insight update"),
                "narrative": response.get("summary", {}).get("narrative", ""),
            },
            "keyMetrics": merged_metrics,
            "highlights": response.get("highlights", [])[:6],
            "recommendations": recommendations,
            "alerts": response.get("alerts", [])[:6],
            "context": {
                "periodDays": snapshot["periodDays"],
                "dateRange": snapshot["dateRange"],
                "transactionCount": snapshot["transactionCount"],
                "totalIncome": snapshot["totalIncome"],
                "totalSpend": snapshot["totalSpend"],
                "netCashflow": snapshot["netCashflow"],
                "generatedFrom": "python-ai-agent-v1",
            },
            "generatedAt": datetime.utcnow(),
            "version": 1,
        }

    @staticmethod
    def _baseline_metrics(snapshot: Dict[str, Any]) -> List[Dict[str, Any]]:
        account_summary = snapshot["accountSummary"]
        cashflow = snapshot["cashflow"]["current"]
        return [
            {
                "label": "Net worth",
                "value": account_summary["netWorth"],
                "displayValue": InsightAgentService._format_currency(account_summary["netWorth"]),
            },
            {
                "label": "Total assets",
                "value": account_summary["totalAssets"],
                "displayValue": InsightAgentService._format_currency(account_summary["totalAssets"]),
            },
            {
                "label": "Total debt",
                "value": account_summary["totalDebt"],
                "displayValue": InsightAgentService._format_currency(account_summary["totalDebt"]),
            },
            {
                "label": f"{snapshot['periodDays']}d income",
                "value": cashflow["totalIncome"],
                "displayValue": InsightAgentService._format_currency(cashflow["totalIncome"]),
            },
            {
                "label": f"{snapshot['periodDays']}d spend",
                "value": cashflow["totalSpend"],
                "displayValue": InsightAgentService._format_currency(cashflow["totalSpend"]),
            },
            {
                "label": "Net cashflow",
                "value": cashflow["netCashflow"],
                "displayValue": InsightAgentService._format_currency(cashflow["netCashflow"]),
            },
            {
                "label": "Savings rate",
                "value": cashflow["savingsRate"],
                "displayValue": f"{cashflow['savingsRate']:.1f}%",
            },
        ]

    @staticmethod
    def _merge_metrics(
        baseline_metrics: List[Dict[str, Any]], agent_metrics: List[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        merged = baseline_metrics[:]
        existing_labels = {metric["label"].lower() for metric in baseline_metrics}
        for metric in agent_metrics:
            label = metric.get("label")
            if not label:
                continue
            if label.lower() in existing_labels:
                continue
            raw_value = metric.get("value")
            numeric_value: Optional[float] = None
            if isinstance(raw_value, (int, float)):
                numeric_value = float(raw_value)
            elif isinstance(raw_value, str):
                try:
                    numeric_value = float(raw_value)
                except ValueError:
                    numeric_value = None

            display = metric.get("display") or metric.get("displayValue")
            if display is None and numeric_value is not None:
                display = InsightAgentService._format_currency(numeric_value)

            merged.append(
                {
                    "label": label,
                    "value": numeric_value,
                    "displayValue": display,
                }
            )
            existing_labels.add(label.lower())
        return merged[:10]

    @staticmethod
    def _format_currency(value: float | int) -> str:
        return f"${value:,.0f}"

    @staticmethod
    def _make_json_safe(payload: Any) -> Any:
        if isinstance(payload, dict):
            return {key: InsightAgentService._make_json_safe(value) for key, value in payload.items()}
        if isinstance(payload, list):
            return [InsightAgentService._make_json_safe(item) for item in payload]
        if isinstance(payload, (int, float, str, bool)) or payload is None:
            return payload
        if hasattr(payload, 'isoformat'):
            try:
                return payload.isoformat()
            except Exception:
                return str(payload)
        return str(payload)


__all__ = ["InsightAgentService"]
