const { Configuration, PlaidApi, PlaidEnvironments } = require('plaid');

// Initialize Plaid client with proper configuration
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

// Debug: Log the actual values being used
console.log('Plaid Configuration Debug:');
console.log('PLAID_CLIENT_ID:', process.env.PLAID_CLIENT_ID);
console.log('PLAID_SECRET:', process.env.PLAID_SECRET ? 'Set (length: ' + process.env.PLAID_SECRET.length + ')' : 'Not set');
console.log('PLAID_ENV:', process.env.PLAID_ENV);

// Validate required environment variables
if (!process.env.PLAID_CLIENT_ID || !process.env.PLAID_SECRET) {
  console.error('ERROR: Missing required Plaid environment variables!');
  console.error('PLAID_CLIENT_ID:', process.env.PLAID_CLIENT_ID ? 'Set' : 'MISSING');
  console.error('PLAID_SECRET:', process.env.PLAID_SECRET ? 'Set' : 'MISSING');
  console.error('Please check your .env file in the server directory');
}

// Create link token for Plaid Link
const createLinkToken = async (req, res) => {
  try {
    const user = req.user;
    
    console.log('Creating link token for user:', user._id);
    console.log('Plaid Client ID:', process.env.PLAID_CLIENT_ID ? 'Set' : 'Not set');
    console.log('Plaid Secret:', process.env.PLAID_SECRET ? 'Set' : 'Not set');
    console.log('Plaid Environment:', process.env.PLAID_ENV);

    const request = {
      user: {
        client_user_id: user._id.toString(),
      },
      client_name: 'BenchWise',
      products: ['transactions', 'auth', 'investments'],
      country_codes: ['US'],
      language: 'en',
      // Include credentials in request body as alternative to headers
      client_id: process.env.PLAID_CLIENT_ID,
      secret: process.env.PLAID_SECRET,
      // Disable phone verification for sandbox testing
      webhook: null,
      update: null,
    };

    const response = await plaidClient.linkTokenCreate(request);
    
    console.log('Link token created successfully');
    res.json({
      link_token: response.data.link_token,
      expiration: response.data.expiration
    });
  } catch (error) {
    console.error('Error creating link token:', error);
    res.status(500).json({
      message: 'Failed to create link token',
      error: error.message
    });
  }
};

// Exchange public token for access token and get account/institution data
const exchangePublicToken = async (req, res) => {
  try {
    const { public_token } = req.body;
    const user = req.user;

    if (!public_token) {
      return res.status(400).json({ message: 'Public token is required' });
    }

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

    // Return the data for the integration controller to handle
    res.json({
      message: 'Plaid token exchange successful',
      bankConnectionData: bankConnectionData
    });

  } catch (error) {
    console.error('Error exchanging public token:', error);
    res.status(500).json({
      message: 'Failed to exchange token with Plaid',
      error: error.message
    });
  }
};

// Get transactions data for a bank connection
const getTransactions = async (req, res) => {
  try {
    const { accessToken, startDate, endDate } = req.body;

    if (!accessToken) {
      return res.status(400).json({ message: 'Access token is required' });
    }

    // Set default date range if not provided (last 30 days)
    const end_date = endDate || new Date().toISOString().split('T')[0];
    const start_date = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    console.log(`Fetching transactions from ${start_date} to ${end_date}`);

    // Get transactions from Plaid
    const transactionsResponse = await plaidClient.transactionsGet({
      access_token: accessToken,
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
      message: 'Failed to fetch transactions from Plaid',
      error: error.message
    });
  }
};

// Get accounts directly from Plaid (for verification/refresh)
const getPlaidAccounts = async (req, res) => {
  try {
    const { accessToken } = req.body;

    if (!accessToken) {
      return res.status(400).json({ message: 'Access token is required' });
    }

    // Get account information from Plaid
    const accountsResponse = await plaidClient.accountsGet({
      access_token: accessToken,
      // Include credentials in request body
      client_id: process.env.PLAID_CLIENT_ID,
      secret: process.env.PLAID_SECRET,
    });

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

    res.json({
      accounts: accounts,
      itemId: accountsResponse.data.item.item_id,
      institutionId: accountsResponse.data.item.institution_id
    });

  } catch (error) {
    console.error('Error fetching accounts from Plaid:', error);
    res.status(500).json({
      message: 'Failed to fetch accounts from Plaid',
      error: error.message
    });
  }
};

module.exports = {
  createLinkToken,
  exchangePublicToken,
  getTransactions,
  getPlaidAccounts
};