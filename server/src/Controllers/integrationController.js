const Integration = require('../Models/Integration');
const { Configuration, PlaidApi, PlaidEnvironments } = require('plaid');

// Initialize Plaid client
const configuration = new Configuration({
  basePath: process.env.PLAID_ENV === 'production' ? PlaidEnvironments.production : PlaidEnvironments.sandbox,
  baseOptions: {
    headers: {
      'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID,
      'PLAID-SECRET': process.env.PLAID_SECRET,
    },
  },
});

const plaidClient = new PlaidApi(configuration);

// Get user's accounts
const getAccounts = async (req, res) => {
  try {
    const { user } = req;

    const integration = await Integration.findOne({ userId: user._id });
    
    if (!integration || !integration.plaid.isIntegrated) {
      return res.status(404).json({ message: 'No bank integration found' });
    }

    // Flatten all accounts from all bank connections
    const allAccounts = [];
    const institutions = [];
    
    integration.plaid.bankConnections.forEach(connection => {
      institutions.push({
        institutionName: connection.institutionName,
        institutionId: connection.institutionId,
        lastSync: connection.lastSync
      });
      allAccounts.push(...connection.accounts);
    });

    res.json({
      accounts: allAccounts,
      bankConnections: institutions,
      totalConnections: integration.plaid.bankConnections.length
    });
  } catch (error) {
    console.error('Error getting accounts:', error);
    res.status(500).json({
      message: 'Failed to get accounts',
      error: error.message
    });
  }
};

// Get integration status
const getIntegrationStatus = async (req, res) => {
  try {
    const { user } = req;
    console.log('Getting integration status for user:', user._id);

    const integration = await Integration.findOne({ userId: user._id });
    console.log('Integration query result:', integration);
    
    if (!integration || !integration.plaid.isIntegrated) {
      console.log('No integration found for user:', user._id);
      console.log('User ID type:', typeof user._id);
      console.log('User ID string:', user._id.toString());
      
      // Let's also check if there are any integrations in the database
      const allIntegrations = await Integration.find({});
      console.log('All integrations in database:', allIntegrations.map(i => ({ userId: i.userId, isIntegrated: i.plaid?.isIntegrated })));
      
      return res.json({
        isIntegrated: false,
        hasPlaid: false
      });
    }

    const totalAccounts = integration.plaid.bankConnections.reduce(
      (total, connection) => total + connection.accounts.length, 0
    );

    console.log('Integration found:', {
      isIntegrated: integration.plaid.isIntegrated,
      bankConnectionsCount: integration.plaid.bankConnections.length,
      totalAccounts: totalAccounts
    });

    res.json({
      isIntegrated: integration.plaid.isIntegrated,
      hasPlaid: integration.plaid.isIntegrated,
      bankConnectionsCount: integration.plaid.bankConnections.length,
      bankConnections: integration.plaid.bankConnections.map(conn => ({
        institutionName: conn.institutionName,
        institutionId: conn.institutionId,
        accountsCount: conn.accounts.length,
        lastSync: conn.lastSync
      })),
      totalAccounts: totalAccounts
    });
  } catch (error) {
    console.error('Error getting integration status:', error);
    res.status(500).json({
      message: 'Failed to get integration status',
      error: error.message
    });
  }
};

// Manage bank integration after token exchange
const manageBankIntegration = async (req, res) => {
  try {
    const { user, bankConnectionData } = req;

    if (!bankConnectionData) {
      return res.status(400).json({ message: 'Bank connection data is required' });
    }

    // Check if user already has an integration record
    let integration = await Integration.findOne({ userId: user._id });

    if (integration) {
      // Check if this institution is already connected
      const existingConnection = integration.plaid.bankConnections.find(
        conn => conn.institutionId === bankConnectionData.institutionId
      );
      
      if (existingConnection) {
        // Update existing connection
        existingConnection.accessToken = bankConnectionData.accessToken;
        existingConnection.lastSync = new Date();
        existingConnection.accounts = bankConnectionData.accounts;
      } else {
        // Add new bank connection
        integration.plaid.bankConnections.push(bankConnectionData);
      }
      integration.plaid.isIntegrated = true;
      await integration.save();
    } else {
      // Create new integration record
      integration = new Integration({
        userId: user._id,
        plaid: {
          isIntegrated: true,
          bankConnections: [bankConnectionData]
        }
      });
      await integration.save();
    }

    console.log('Integration updated successfully:', JSON.stringify(integration, null, 2));

    res.json({
      message: 'Bank account successfully integrated',
      integration: {
        isIntegrated: integration.plaid.isIntegrated,
        institutionName: bankConnectionData.institutionName,
        bankConnectionsCount: integration.plaid.bankConnections.length,
        accountsCount: bankConnectionData.accounts.length
      }
    });
  } catch (error) {
    console.error('Error managing bank integration:', error);
    res.status(500).json({
      message: 'Failed to manage bank integration',
      error: error.message
    });
  }
};

// Get bank connection by institution ID
const getBankConnection = async (req, res) => {
  try {
    const { user } = req;
    const { institutionId } = req.params;

    if (!institutionId) {
      return res.status(400).json({ message: 'Institution ID is required' });
    }

    const integration = await Integration.findOne({ userId: user._id });
    
    if (!integration || !integration.plaid.isIntegrated) {
      return res.status(404).json({ message: 'No bank integration found' });
    }

    // Find the specific bank connection
    const bankConnection = integration.plaid.bankConnections.find(
      conn => conn.institutionId === institutionId
    );

    if (!bankConnection) {
      return res.status(404).json({ message: 'Bank connection not found' });
    }

    res.json({
      bankConnection: {
        institutionId: bankConnection.institutionId,
        institutionName: bankConnection.institutionName,
        lastSync: bankConnection.lastSync,
        accountsCount: bankConnection.accounts.length
      }
    });
  } catch (error) {
    console.error('Error getting bank connection:', error);
    res.status(500).json({
      message: 'Failed to get bank connection',
      error: error.message
    });
  }
};

// Complete token exchange and integration management flow
const exchangeTokenAndManageIntegration = async (req, res) => {
  try {
    const { public_token } = req.body;
    const { user } = req;

    if (!public_token) {
      return res.status(400).json({ message: 'Public token is required' });
    }

    console.log('Starting complete token exchange flow for user:', user._id);

    // Exchange public token for access token
    const response = await plaidClient.itemPublicTokenExchange({
      public_token: public_token,
      // Include credentials in request body
      client_id: process.env.PLAID_CLIENT_ID,
      secret: process.env.PLAID_SECRET,
    });

    const { access_token, item_id } = response.data;

    // Get account information
    const accountsResponse = await plaidClient.accountsGet({
      access_token: access_token,
      // Include credentials in request body
      client_id: process.env.PLAID_CLIENT_ID,
      secret: process.env.PLAID_SECRET,
    });

    console.log('Accounts response:', JSON.stringify(accountsResponse.data, null, 2));

    const accounts = accountsResponse.data.accounts ? accountsResponse.data.accounts.map(account => ({
      accountId: account.account_id,
      name: account.name,
      type: account.type,
      subtype: account.subtype,
      balance: {
        available: account.balances.available,
        current: account.balances.current
      },
      mask: account.mask
    })) : [];

    console.log('Processed accounts:', JSON.stringify(accounts, null, 2));

    // Get institution information
    const institutionResponse = await plaidClient.institutionsGetById({
      institution_id: accountsResponse.data.item.institution_id,
      country_codes: ['US'],
      // Include credentials in request body
      client_id: process.env.PLAID_CLIENT_ID,
      secret: process.env.PLAID_SECRET,
    });

    // Create bank connection data structure
    const bankConnectionData = {
      accessToken: access_token,
      itemId: item_id,
      institutionId: accountsResponse.data.item.institution_id,
      institutionName: institutionResponse.data.institution.name,
      lastSync: new Date(),
      accounts: accounts
    };

    // Manage the integration in database
    let integration = await Integration.findOne({ userId: user._id });

    if (integration) {
      // Check if this institution is already connected
      const existingConnection = integration.plaid.bankConnections.find(
        conn => conn.institutionId === bankConnectionData.institutionId
      );
      
      if (existingConnection) {
        // Update existing connection
        existingConnection.accessToken = bankConnectionData.accessToken;
        existingConnection.lastSync = new Date();
        existingConnection.accounts = bankConnectionData.accounts;
      } else {
        // Add new bank connection
        integration.plaid.bankConnections.push(bankConnectionData);
      }
      integration.plaid.isIntegrated = true;
      await integration.save();
    } else {
      // Create new integration record
      integration = new Integration({
        userId: user._id,
        plaid: {
          isIntegrated: true,
          bankConnections: [bankConnectionData]
        }
      });
      await integration.save();
    }

    console.log('Integration updated successfully:', JSON.stringify(integration, null, 2));

    res.json({
      message: 'Bank account successfully integrated',
      integration: {
        isIntegrated: integration.plaid.isIntegrated,
        institutionName: bankConnectionData.institutionName,
        bankConnectionsCount: integration.plaid.bankConnections.length,
        accountsCount: accounts.length
      }
    });

  } catch (error) {
    console.error('Error in complete token exchange:', error);
    res.status(500).json({
      message: 'Failed to integrate bank account',
      error: error.message
    });
  }
};

// Get transactions through integration access tokens
const getTransactions = async (req, res) => {
  try {
    const { user } = req;
    const { institutionId, startDate, endDate } = req.body;

    if (!institutionId) {
      return res.status(400).json({ message: 'Institution ID is required' });
    }

    const integration = await Integration.findOne({ userId: user._id });
    
    if (!integration || !integration.plaid.isIntegrated) {
      return res.status(404).json({ message: 'No bank integration found' });
    }

    // Find the specific bank connection
    const bankConnection = integration.plaid.bankConnections.find(
      conn => conn.institutionId === institutionId
    );

    if (!bankConnection) {
      return res.status(404).json({ message: 'Bank connection not found' });
    }

    // Set default date range if not provided (last 30 days)
    const end_date = endDate || new Date().toISOString().split('T')[0];
    const start_date = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    console.log(`Fetching transactions for institution ${institutionId} from ${start_date} to ${end_date}`);

    // Get transactions from Plaid
    const transactionsResponse = await plaidClient.transactionsGet({
      access_token: bankConnection.accessToken,
      start_date: start_date,
      end_date: end_date,
      // Include credentials in request body
      client_id: process.env.PLAID_CLIENT_ID,
      secret: process.env.PLAID_SECRET,
    });

    const transactions = transactionsResponse.data.transactions || [];

    // Process and format the transactions data
    const formattedTransactions = transactions.map(transaction => ({
      transaction_id: transaction.transaction_id,
      account_id: transaction.account_id,
      amount: transaction.amount,
      date: transaction.date,
      name: transaction.name,
      merchant_name: transaction.merchant_name,
      category: transaction.category,
      subcategory: transaction.subcategory,
      account_owner: transaction.account_owner,
      iso_currency_code: transaction.iso_currency_code,
      unofficial_currency_code: transaction.unofficial_currency_code
    }));

    res.json({
      institutionId,
      institutionName: bankConnection.institutionName,
      dateRange: {
        startDate: start_date,
        endDate: end_date
      },
      transactions: formattedTransactions,
      totalTransactionCount: formattedTransactions.length
    });

  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({
      message: 'Failed to fetch transactions',
      error: error.message
    });
  }
};

module.exports = {
  getAccounts,
  getIntegrationStatus,
  manageBankIntegration,
  getBankConnection,
  exchangeTokenAndManageIntegration,
  getTransactions
};
