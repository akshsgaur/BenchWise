const Insight = require('../Models/Insight');
const Integration = require('../Models/Integration');
const Transaction = require('../Models/Transaction');
const transactionSyncService = require('../Services/transactionSyncService');
const insightGenerationService = require('../Services/insightGenerationService');

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

/**
 * Generate AI insights for the logged-in user (without syncing transactions)
 */
const generateInsights = async (req, res) => {
  try {
    const userId = req.user._id.toString();
    
    console.log(`[INFO] Generate insights requested for user ${userId}`);

    // Generate AI insights
    console.log(`[INFO] Generating AI insights for user ${userId}`);
    try {
      const result = await insightGenerationService.generateForUser(userId, 60);
      console.log(`[INFO] AI insight generation completed for user ${userId}: ${result.status}`);

      // Fetch the latest insight to return
      const latestInsight = await Insight.findOne({ userId: req.user._id }).sort({ generatedAt: -1 }).lean();

      res.json({
        success: true,
        data: {
          message: 'AI insights generated successfully',
          insight: latestInsight,
          insightStatus: result.status
        }
      });
    } catch (insightError) {
      console.error(`[ERROR] AI insight generation failed for user ${userId}:`, insightError);
      res.status(500).json({
        success: false,
        message: 'Failed to generate AI insights',
        error: insightError.message
      });
    }

  } catch (error) {
    console.error('[ERROR] Generate insights failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate insights',
      error: error.message
    });
  }
};

/**
 * Sync transactions and generate AI insights for the logged-in user
 */
const syncAndAnalyze = async (req, res) => {
  try {
    const userId = req.user._id.toString();
    
    console.log(`[INFO] Sync and analyze requested for user ${userId}`);

    // Step 1: Sync transactions from Plaid
    console.log(`[INFO] Step 1: Syncing transactions for user ${userId}`);
    try {
      const integration = await Integration.findOne({ userId: req.user._id }).lean();
      
      if (!integration || !integration.plaid?.isIntegrated || !integration.plaid?.bankConnections?.length) {
        return res.status(400).json({
          success: false,
          message: 'No bank accounts connected. Please connect your bank account first.',
          error: 'NO_BANK_CONNECTIONS'
        });
      }

      // Sync transactions for all bank connections
      for (const bankConnection of integration.plaid.bankConnections) {
        try {
          await transactionSyncService.syncBankTransactions(userId, bankConnection);
        } catch (syncError) {
          console.error(`[ERROR] Failed to sync transactions for ${bankConnection.institutionName}:`, syncError);
          // Continue with other banks even if one fails
        }
      }
      console.log(`[INFO] Transaction sync completed for user ${userId}`);
    } catch (syncError) {
      console.error(`[ERROR] Transaction sync failed for user ${userId}:`, syncError);
      return res.status(500).json({
        success: false,
        message: 'Failed to sync transactions',
        error: syncError.message
      });
    }

    // Step 2: Generate AI insights
    console.log(`[INFO] Step 2: Generating AI insights for user ${userId}`);
    try {
      const result = await insightGenerationService.generateForUser(userId, 60);
      console.log(`[INFO] AI insight generation completed for user ${userId}: ${result.status}`);

      // Fetch the latest insight to return
      const latestInsight = await Insight.findOne({ userId: req.user._id }).sort({ generatedAt: -1 }).lean();

      res.json({
        success: true,
        data: {
          message: 'Transactions synced and AI insights generated successfully',
          insight: latestInsight,
          syncStatus: 'completed',
          insightStatus: result.status
        }
      });
    } catch (insightError) {
      console.error(`[ERROR] AI insight generation failed for user ${userId}:`, insightError);
      // Even if insight generation fails, transactions were synced, so return partial success
      res.json({
        success: true,
        data: {
          message: 'Transactions synced successfully, but AI insight generation failed',
          syncStatus: 'completed',
          insightStatus: 'failed',
          error: insightError.message
        }
      });
    }

  } catch (error) {
    console.error('[ERROR] Sync and analyze failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to sync transactions and generate insights',
      error: error.message
    });
  }
};

module.exports = {
  getLatestInsight,
  getDashboardOverview,
  syncAndAnalyze,
  generateInsights
};
