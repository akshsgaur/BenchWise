const cron = require('node-cron');
const Integration = require('../Models/Integration');
const Transaction = require('../Models/Transaction');
const { PlaidApi, Configuration, PlaidEnvironments } = require('plaid');

// Initialize Plaid client
const configuration = new Configuration({
  basePath: PlaidEnvironments[process.env.PLAID_ENV || 'sandbox'],
  baseOptions: {
    headers: {
      'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID,
      'PLAID-SECRET': process.env.PLAID_SECRET,
    },
  },
});

const plaidClient = new PlaidApi(configuration);

class TransactionSyncService {
  constructor() {
    this.isRunning = false;
  }

  // Main sync method that fetches transactions for all users
  async syncAllTransactions() {
    if (this.isRunning) {
      console.log('Transaction sync already running, skipping...');
      return;
    }

    this.isRunning = true;
    console.log('Starting transaction sync for all users...');

    try {
      // Get all integrations with Plaid connections
      const integrations = await Integration.find({
        'plaid.isIntegrated': true,
        'plaid.bankConnections': { $exists: true, $not: { $size: 0 } }
      }).populate('userId');

      console.log(`Found ${integrations.length} integrations to sync`);

      for (const integration of integrations) {
        try {
          await this.syncUserTransactions(integration);
        } catch (error) {
          console.error(`Error syncing transactions for user ${integration.userId._id}:`, error.message);
          // Continue with other users even if one fails
        }
      }

      console.log('Transaction sync completed successfully');
    } catch (error) {
      console.error('Error in transaction sync:', error);
    } finally {
      this.isRunning = false;
    }
  }

  // Sync transactions for a specific user
  async syncUserTransactions(integration) {
    const userId = integration.userId._id;
    console.log(`Syncing transactions for user: ${userId}`);

    for (const bankConnection of integration.plaid.bankConnections) {
      try {
        await this.syncBankTransactions(userId, bankConnection);
      } catch (error) {
        console.error(`Error syncing bank ${bankConnection.institutionName} for user ${userId}:`, error.message);
        // Continue with other banks even if one fails
      }
    }
  }

  // Sync transactions for a specific bank connection
  async syncBankTransactions(userId, bankConnection) {
    const { accessToken, institutionId, institutionName, lastSync } = bankConnection;
    
    if (!accessToken) {
      console.log(`No access token for institution ${institutionName}, skipping...`);
      return;
    }

    // Calculate date range for incremental sync
    const endDate = new Date().toISOString().split('T')[0];
    let startDate;
    
    if (lastSync) {
      // If we have a lastSync date, check if it's recent (within last 7 days)
      const lastSyncDate = new Date(lastSync);
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      
      if (lastSyncDate > sevenDaysAgo) {
        // If lastSync is recent, fetch from 60 days ago to get comprehensive historical data
        startDate = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        console.log(`Last sync was recent (${lastSyncDate.toISOString().split('T')[0]}), fetching from 60 days ago to get comprehensive historical data`);
      } else {
        // If lastSync is older, use it as start date
        startDate = lastSyncDate.toISOString().split('T')[0];
      }
    } else {
      // No lastSync, fetch last 60 days for initial sync
      startDate = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      console.log(`No previous sync found, fetching last 60 days for initial sync`);
    }

    console.log(`Syncing transactions for ${institutionName} from ${startDate} to ${endDate}`);

    try {
      // Fetch transactions from Plaid
      const transactionsResponse = await plaidClient.transactionsGet({
        access_token: accessToken,
        start_date: startDate,
        end_date: endDate,
        client_id: process.env.PLAID_CLIENT_ID,
        secret: process.env.PLAID_SECRET,
      });

      const transactions = transactionsResponse.data.transactions || [];
      console.log(`Found ${transactions.length} transactions for ${institutionName}`);

      if (transactions.length === 0) {
        // Update lastSync even if no transactions
        await this.updateLastSync(userId, institutionId);
        return;
      }

      // Process and save transactions
      const savedCount = await this.saveTransactions(userId, institutionId, transactions);
      console.log(`Saved ${savedCount} new transactions for ${institutionName}`);

      // Update lastSync timestamp
      await this.updateLastSync(userId, institutionId);

    } catch (error) {
      console.error(`Plaid API error for ${institutionName}:`, error.message);
      throw error;
    }
  }

  // Save transactions to database (upsert to avoid duplicates)
  async saveTransactions(userId, institutionId, transactions) {
    let savedCount = 0;

    for (const transaction of transactions) {
      try {
        const transactionData = {
          userId,
          institutionId,
          transaction_id: transaction.transaction_id,
          account_id: transaction.account_id,
          amount: transaction.amount,
          date: transaction.date,
          name: transaction.name,
          merchant_name: transaction.merchant_name,
          category: transaction.category || [],
          subcategory: transaction.subcategory || [],
          account_owner: transaction.account_owner,
          iso_currency_code: transaction.iso_currency_code,
          unofficial_currency_code: transaction.unofficial_currency_code,
          syncedAt: new Date()
        };

        // Use upsert to avoid duplicates
        await Transaction.findOneAndUpdate(
          { transaction_id: transaction.transaction_id },
          transactionData,
          { upsert: true, new: true }
        );

        savedCount++;
      } catch (error) {
        console.error(`Error saving transaction ${transaction.transaction_id}:`, error.message);
        // Continue with other transactions
      }
    }

    return savedCount;
  }

  // Update lastSync timestamp for a bank connection
  async updateLastSync(userId, institutionId) {
    try {
      await Integration.findOneAndUpdate(
        { 
          userId,
          'plaid.bankConnections.institutionId': institutionId 
        },
        { 
          $set: { 
            'plaid.bankConnections.$.lastSync': new Date() 
          } 
        }
      );
    } catch (error) {
      console.error(`Error updating lastSync for institution ${institutionId}:`, error.message);
    }
  }

  // Start the cron job
  startCronJob() {
    // Run every 2 hours
    const cronExpression = '0 */2 * * *';
    
    console.log('Starting transaction sync cron job (every 2 hours)...');
    
    cron.schedule(cronExpression, async () => {
      console.log('Cron job triggered: Starting transaction sync...');
      await this.syncAllTransactions();
    }, {
      scheduled: true,
      timezone: "America/New_York"
    });

    console.log('Transaction sync cron job started successfully');
  }

  // Manual sync method for testing
  async manualSync() {
    console.log('Manual transaction sync triggered...');
    await this.syncAllTransactions();
  }
}

module.exports = new TransactionSyncService();
