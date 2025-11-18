const mongoose = require('mongoose');
const Transaction = require('../Models/Transaction');
const Integration = require('../Models/Integration');

/**
 * Handles MongoDB access and aggregates analytics-ready snapshots.
 * Migrated from Python insight_data_repository.py
 */
class InsightDataRepository {
  constructor(mongoUri = null, dbName = null) {
    this.mongoUri = mongoUri || process.env.MONGODB_URI;
    if (!this.mongoUri) {
      throw new Error('MONGODB_URI is not set');
    }
    this.dbName = dbName || process.env.MONGODB_DB_NAME;
    this._snapshotCache = new Map();
  }

  /**
   * Find all integrations with Plaid connected
   */
  async findIntegrationsWithPlaid() {
    const integrations = await Integration.find({
      'plaid.isIntegrated': true,
      'plaid.bankConnections': { $exists: true, $not: { $size: 0 } }
    }).lean();
    return integrations;
  }

  /**
   * Get financial snapshot for a user
   */
  async getSnapshot(userId, periodDays = 60) {
    const cacheKey = `${userId}_${periodDays}`;
    if (this._snapshotCache.has(cacheKey)) {
      return this._snapshotCache.get(cacheKey);
    }

    const snapshot = await this._buildSnapshot(userId, periodDays);
    this._snapshotCache.set(cacheKey, snapshot);
    return snapshot;
  }

  /**
   * Save insight document to database
   */
  async saveInsightDocument(userId, document) {
    const Insight = require('../Models/Insight');
    const userObjectId = new mongoose.Types.ObjectId(userId);
    
    const documentToSave = {
      ...document,
      userId: userObjectId
    };

    await Insight.updateOne(
      { userId: userObjectId },
      { $set: documentToSave },
      { upsert: true }
    );
  }

  /**
   * Build financial snapshot from transactions and accounts
   */
  async _buildSnapshot(userId, periodDays) {
    const userObjectId = new mongoose.Types.ObjectId(userId);

    const now = new Date();
    const endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - (periodDays - 1));
    
    const priorEnd = new Date(startDate);
    priorEnd.setDate(priorEnd.getDate() - 1);
    const priorStart = new Date(priorEnd);
    priorStart.setDate(priorStart.getDate() - (periodDays - 1));
    
    const ninetyStart = new Date(endDate);
    ninetyStart.setDate(ninetyStart.getDate() - 90);

    const startStr = startDate.toISOString().split('T')[0];
    const endStr = endDate.toISOString().split('T')[0];
    const priorStartStr = priorStart.toISOString().split('T')[0];
    const priorEndStr = priorEnd.toISOString().split('T')[0];
    const ninetyStartStr = ninetyStart.toISOString().split('T')[0];

    // Fetch transactions
    const periodTxns = await Transaction.find({
      userId: userObjectId,
      date: { $gte: startStr, $lte: endStr }
    }).lean();

    const priorTxns = await Transaction.find({
      userId: userObjectId,
      date: { $gte: priorStartStr, $lte: priorEndStr }
    }).lean();

    const ninetyTxns = await Transaction.find({
      userId: userObjectId,
      date: { $gte: ninetyStartStr, $lte: endStr }
    }).lean();

    // Fetch integration
    const integration = await Integration.findOne({ userId: userObjectId }).lean();

    // Compute analytics
    const accountSummary = this._computeAccountSummary(integration);
    const cashflow = this._computeCashflow(periodTxns);
    const baselineCashflow = this._computeCashflow(priorTxns);
    const categories = this._computeCategoryBreakdown(periodTxns, priorTxns);
    const recurring = this._computeRecurringCharges(ninetyTxns);
    const anomalies = this._computeAnomalies(periodTxns);
    const topTransactions = this._topTransactions(periodTxns);
    const opportunitySignals = this._opportunitySignals(
      accountSummary, cashflow, categories, recurring, anomalies
    );

    const snapshot = {
      userId: userId,
      periodDays: periodDays,
      dateRange: {
        start: startStr,
        end: endStr
      },
      transactions: {
        current: this._simplifyTransactions(periodTxns),
        baseline: this._simplifyTransactions(priorTxns),
        recent: this._simplifyTransactions(periodTxns).slice(0, 20)
      },
      accountSummary: accountSummary,
      cashflow: {
        current: cashflow,
        baseline: baselineCashflow
      },
      categoryBreakdown: categories,
      recurringCharges: recurring,
      anomalies: anomalies,
      topTransactions: topTransactions,
      opportunitySignals: opportunitySignals
    };

    snapshot.transactionCount = periodTxns.length;
    snapshot.totalIncome = cashflow.totalIncome;
    snapshot.totalSpend = cashflow.totalSpend;
    snapshot.netCashflow = cashflow.netCashflow;

    return snapshot;
  }

  /**
   * Compute account summary from integration data
   */
  _computeAccountSummary(integration) {
    if (!integration) {
      return {
        totalAssets: 0.0,
        totalDebt: 0.0,
        netWorth: 0.0,
        institutions: [],
        accounts: []
      };
    }

    const bankConnections = integration.plaid?.bankConnections || [];
    const institutions = [];
    const accounts = [];
    let assets = 0.0;
    let debt = 0.0;

    for (const connection of bankConnections) {
      const connectionAccounts = connection.accounts || [];
      let institutionAssets = 0.0;
      let institutionDebt = 0.0;

      for (const account of connectionAccounts) {
        const balance = this._toNumber(
          account.balance?.current || account.balance?.available || account.balance
        );
        const accountType = account.type || 'unknown';

        const accountPayload = {
          institutionId: connection.institutionId,
          institutionName: connection.institutionName,
          accountId: account.accountId,
          name: account.name,
          type: accountType,
          subtype: account.subtype,
          balance: balance
        };
        accounts.push(accountPayload);

        if (['depository', 'investment', 'brokerage', 'cash_management'].includes(accountType)) {
          assets += balance;
          institutionAssets += balance;
        } else if (['credit', 'loan', 'mortgage'].includes(accountType)) {
          debt += balance;
          institutionDebt += balance;
        }
      }

      institutions.push({
        institutionId: connection.institutionId,
        institutionName: connection.institutionName,
        accountCount: connectionAccounts.length,
        assetTotal: institutionAssets,
        debtTotal: institutionDebt,
        lastSync: connection.lastSync
      });
    }

    return {
      totalAssets: assets,
      totalDebt: debt,
      netWorth: assets - debt,
      institutions: institutions,
      accounts: accounts
    };
  }

  /**
   * Compute cashflow from transactions
   */
  _computeCashflow(transactions) {
    if (!transactions || transactions.length === 0) {
      return {
        totalIncome: 0.0,
        totalSpend: 0.0,
        netCashflow: 0.0,
        savingsRate: 0.0
      };
    }

    let totalSpend = 0.0;
    let totalIncome = 0.0;

    for (const txn of transactions) {
      const amount = this._toNumber(txn.amount);
      if (amount >= 0) {
        totalSpend += amount;
      } else {
        totalIncome += Math.abs(amount);
      }
    }

    const netCashflow = totalIncome - totalSpend;
    const savingsRate = totalIncome > 0 ? (netCashflow / totalIncome * 100) : 0.0;

    return {
      totalIncome: totalIncome,
      totalSpend: totalSpend,
      netCashflow: netCashflow,
      savingsRate: savingsRate
    };
  }

  /**
   * Compute category breakdown with trends
   */
  _computeCategoryBreakdown(currentTransactions, baselineTransactions) {
    const summarize = (txns) => {
      const summary = {};
      for (const txn of txns) {
        const amount = this._toNumber(txn.amount);
        if (amount <= 0) continue;
        const category = (txn.category && txn.category.length > 0) ? txn.category[0] : 'Uncategorized';
        if (!summary[category]) {
          summary[category] = { total: 0.0, count: 0.0 };
        }
        summary[category].total += amount;
        summary[category].count += 1;
      }
      return summary;
    };

    const currentSummary = summarize(currentTransactions);
    const baselineSummary = summarize(baselineTransactions);

    const breakdown = [];
    for (const [category, info] of Object.entries(currentSummary)) {
      const baselineTotal = baselineSummary[category]?.total || 0.0;
      const delta = info.total - baselineTotal;
      const percentChange = baselineTotal > 0 ? (delta / baselineTotal * 100) : null;
      breakdown.push({
        category: category,
        total: info.total,
        count: info.count,
        average: info.count > 0 ? info.total / info.count : 0.0,
        baselineTotal: baselineTotal,
        change: delta,
        changePct: percentChange
      });
    }

    // Include categories that only exist in baseline
    for (const [category, info] of Object.entries(baselineSummary)) {
      if (currentSummary[category]) continue;
      breakdown.push({
        category: category,
        total: 0.0,
        count: 0.0,
        average: 0.0,
        baselineTotal: info.total,
        change: -info.total,
        changePct: -100.0
      });
    }

    breakdown.sort((a, b) => b.total - a.total);
    return breakdown.slice(0, 15);
  }

  /**
   * Compute recurring charges
   */
  _computeRecurringCharges(transactions) {
    const merchantMap = {};
    for (const txn of transactions) {
      const amount = this._toNumber(txn.amount);
      if (amount <= 0) continue;
      const merchant = txn.merchant_name || txn.name;
      if (!merchant) continue;
      if (!merchantMap[merchant]) {
        merchantMap[merchant] = [];
      }
      merchantMap[merchant].push({
        amount: amount,
        date: txn.date
      });
    }

    const recurring = [];
    for (const [merchant, entries] of Object.entries(merchantMap)) {
      if (entries.length < 2) continue;
      const amounts = entries.map(e => e.amount);
      const avgAmount = amounts.reduce((a, b) => a + b, 0) / amounts.length;
      const stdDev = this._stdDev(amounts, avgAmount);
      const isConsistent = stdDev <= Math.max(1, avgAmount * 0.1);
      recurring.push({
        merchant: merchant,
        averageAmount: avgAmount,
        transactions: entries.length,
        totalSpent: amounts.reduce((a, b) => a + b, 0),
        isConsistent: isConsistent
      });
    }

    recurring.sort((a, b) => b.totalSpent - a.totalSpent);
    return recurring.slice(0, 15);
  }

  /**
   * Compute anomaly transactions
   */
  _computeAnomalies(transactions, sigma = 2.0) {
    const expenses = transactions
      .map(txn => this._toNumber(txn.amount))
      .filter(amount => amount > 0);
    
    if (expenses.length === 0) return [];

    const mean = expenses.reduce((a, b) => a + b, 0) / expenses.length;
    const stdDev = this._stdDev(expenses, mean);
    const threshold = stdDev === 0 ? mean * 2 : mean + sigma * stdDev;

    const anomalies = [];
    for (const txn of transactions) {
      const amount = this._toNumber(txn.amount);
      if (amount > threshold) {
        anomalies.push({
          date: txn.date,
          amount: amount,
          name: txn.name,
          merchant: txn.merchant_name,
          category: (txn.category && txn.category.length > 0) ? txn.category[0] : 'Uncategorized',
          threshold: threshold
        });
      }
    }

    anomalies.sort((a, b) => b.amount - a.amount);
    return anomalies.slice(0, 10);
  }

  /**
   * Get top transactions
   */
  _topTransactions(transactions, limit = 5) {
    const expenses = transactions.filter(txn => this._toNumber(txn.amount) > 0);
    expenses.sort((a, b) => this._toNumber(b.amount) - this._toNumber(a.amount));
    const top = [];
    for (const txn of expenses.slice(0, limit)) {
      top.push({
        date: txn.date,
        amount: this._toNumber(txn.amount),
        name: txn.name,
        merchant: txn.merchant_name,
        category: (txn.category && txn.category.length > 0) ? txn.category[0] : 'Uncategorized'
      });
    }
    return top;
  }

  /**
   * Generate opportunity signals
   */
  _opportunitySignals(accountSummary, cashflow, categories, recurring, anomalies) {
    const signals = [];

    if (cashflow.netCashflow < 0) {
      signals.push('Net cashflow is negative; spending exceeds income in the current period.');
    } else if (cashflow.savingsRate < 10) {
      signals.push('Savings rate is below 10%; consider trimming discretionary spend to boost savings.');
    }

    if (accountSummary.totalDebt > 0 && accountSummary.totalAssets > 0) {
      const debtRatio = accountSummary.totalDebt / Math.max(accountSummary.totalAssets, 1);
      if (debtRatio > 0.6) {
        signals.push('Debt represents more than 60% of assets; monitor leverage closely.');
      }
    }

    if (recurring.length > 0) {
      const topRecurring = recurring[0];
      if (topRecurring.totalSpent > 300) {
        signals.push(
          `High recurring spend detected with ${topRecurring.merchant} at ${topRecurring.totalSpent.toFixed(2)} over three months.`
        );
      }
    }

    if (anomalies.length > 0) {
      const largest = anomalies[0];
      signals.push(
        `Unusually large transaction of ${largest.amount.toFixed(2)} on ${largest.date} (${largest.name}).`
      );
    }

    if (categories.length > 0) {
      const topCategory = categories[0];
      const shareOfSpend = cashflow.totalSpend > 0 
        ? (topCategory.total / cashflow.totalSpend * 100) 
        : 0;
      if (shareOfSpend > 35) {
        signals.push(
          `${topCategory.category} accounts for ${shareOfSpend.toFixed(1)}% of spending; explore optimization opportunities.`
        );
      }
    }

    return signals;
  }

  /**
   * Simplify transactions for snapshot
   */
  _simplifyTransactions(transactions) {
    const simplified = [];
    const sorted = [...transactions].sort((a, b) => (b.date || '').localeCompare(a.date || ''));
    for (const txn of sorted) {
      simplified.push({
        transactionId: txn.transaction_id,
        date: txn.date,
        amount: this._toNumber(txn.amount),
        name: txn.name,
        merchant: txn.merchant_name,
        category: txn.category,
        institutionId: txn.institutionId,
        accountId: txn.account_id
      });
    }
    return simplified;
  }

  /**
   * Convert value to number
   */
  _toNumber(value) {
    if (value === null || value === undefined) return 0.0;
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
      const parsed = parseFloat(value);
      return isNaN(parsed) ? 0.0 : parsed;
    }
    if (typeof value === 'object') {
      for (const key of ['current', 'amount', 'balance', 'value', 'available']) {
        if (key in value) {
          const nested = this._toNumber(value[key]);
          if (nested !== 0.0) return nested;
        }
      }
      return 0.0;
    }
    return 0.0;
  }

  /**
   * Calculate standard deviation
   */
  _stdDev(values, mean) {
    if (values.length === 0) return 0.0;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    return Math.sqrt(variance);
  }
}

module.exports = InsightDataRepository;

