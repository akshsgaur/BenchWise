const Insight = require('../Models/Insight');
const Integration = require('../Models/Integration');
const Transaction = require('../Models/Transaction');

const formatAccountSummary = integration => {
  if (!integration?.plaid?.bankConnections) {
    return { banks: [], accounts: [], totals: { assets: 0, debt: 0, netWorth: 0 } };
  }

  const banks = [];
  const accounts = [];
  let assets = 0;
  let debt = 0;

  for (const connection of integration.plaid.bankConnections) {
    const connectionAccounts = connection.accounts || [];
    const bank = {
      institutionId: connection.institutionId,
      institutionName: connection.institutionName,
      accountCount: connectionAccounts.length,
      lastSync: connection.lastSync
    };

    banks.push(bank);

    for (const account of connectionAccounts) {
      const balance = account.balances?.current || 0;
      const type = account.type || 'unknown';

      accounts.push({
        institutionId: connection.institutionId,
        institutionName: connection.institutionName,
        accountId: account.accountId,
        name: account.name,
        type,
        subtype: account.subtype,
        balance
      });

      if (['depository', 'investment', 'brokerage', 'cash_management'].includes(type)) {
        assets += balance;
      } else if (['credit', 'loan', 'mortgage'].includes(type)) {
        debt += balance;
      }
    }
  }

  return {
    banks,
    accounts,
    totals: {
      assets,
      debt,
      netWorth: assets - debt
    }
  };
};

const getLatestInsight = async (req, res) => {
  try {
    const userId = req.user._id;
    const insight = await Insight.findOne({ userId }).sort({ generatedAt: -1 }).lean();

    if (!insight) {
      return res.json({
        success: true,
        data: {
          summary: {
            headline: 'Connect accounts to unlock insights',
            narrative: 'No financial data available for analysis. Connect your accounts to get personalized AI insights and recommendations.'
          },
          keyMetrics: [],
          highlights: [],
          recommendations: [],
          alerts: [],
          context: null,
          generatedAt: null
        }
      });
    }

    res.json({ success: true, data: insight });
  } catch (error) {
    console.error('Error fetching latest insight:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to load insights',
      error: error.message
    });
  }
};

const getDashboardOverview = async (req, res) => {
  try {
    const userId = req.user._id;

    const [integration, insight, transactions] = await Promise.all([
      Integration.findOne({ userId }).lean(),
      Insight.findOne({ userId }).sort({ generatedAt: -1 }).lean(),
      Transaction.find({ userId }).sort({ date: -1, syncedAt: -1 }).limit(20).lean()
    ]);

    const summary = formatAccountSummary(integration);

    const insightPayload = insight || {
      summary: {
        headline: 'Connect accounts to unlock insights',
        narrative: 'No financial data available for analysis. Connect your accounts to get personalized AI insights and recommendations.'
      },
      keyMetrics: [],
      highlights: [],
      recommendations: [],
      alerts: [],
      context: null,
      generatedAt: null
    };

    res.json({
      success: true,
      data: {
        banks: summary.banks,
        accounts: summary.accounts,
        totals: summary.totals,
        recentTransactions: transactions,
        insight: insightPayload
      }
    });
  } catch (error) {
    console.error('Error building dashboard overview:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to load dashboard data',
      error: error.message
    });
  }
};

module.exports = {
  getLatestInsight,
  getDashboardOverview
};
