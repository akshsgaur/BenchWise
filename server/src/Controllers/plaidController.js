const { Configuration, PlaidApi, PlaidEnvironments } = require('plaid');
const Integration = require('../Models/Integration');
const User = require('../Models/User');
const jwt = require('jsonwebtoken');

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

// Middleware to get user from token
const getCurrentUser = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

// Create link token for Plaid Link
const createLinkToken = async (req, res) => {
  try {
    const { user } = req;
    
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

// Exchange public token for access token
const exchangePublicToken = async (req, res) => {
  try {
    const { public_token } = req.body;
    const { user } = req;

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

    // Delete any existing integration record to avoid schema conflicts
    await Integration.deleteOne({ userId: user._id });

    // Create integration record using direct MongoDB operations to avoid schema validation issues
    const integrationData = {
      userId: user._id,
      plaid: {
        isIntegrated: true,
        accessToken: access_token,
        itemId: item_id,
        institutionId: accountsResponse.data.item.institution_id,
        institutionName: institutionResponse.data.institution.name,
        lastSync: new Date(),
        accounts: accounts
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };

    console.log('Integration data being saved:', JSON.stringify(integrationData, null, 2));

    // Use insertOne to bypass Mongoose schema validation
    const result = await Integration.collection.insertOne(integrationData);
    console.log('Database insertion result:', result);
    
    const integration = await Integration.findById(result.insertedId);
    console.log('Retrieved integration:', JSON.stringify(integration, null, 2));

    res.json({
      message: 'Bank account successfully integrated',
      integration: {
        isIntegrated: integration.plaid.isIntegrated,
        institutionName: integration.plaid.institutionName,
        accountsCount: integration.plaid.accounts ? integration.plaid.accounts.length : 0
      }
    });
  } catch (error) {
    console.error('Error exchanging public token:', error);
    res.status(500).json({
      message: 'Failed to integrate bank account',
      error: error.message
    });
  }
};

// Get user's accounts
const getAccounts = async (req, res) => {
  try {
    const { user } = req;

    const integration = await Integration.findOne({ userId: user._id });
    
    if (!integration || !integration.plaid.isIntegrated) {
      return res.status(404).json({ message: 'No bank integration found' });
    }

    res.json({
      accounts: integration.plaid.accounts,
      institutionName: integration.plaid.institutionName,
      lastSync: integration.plaid.lastSync
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
    
    if (!integration) {
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

    console.log('Integration found:', {
      isIntegrated: integration.plaid.isIntegrated,
      institutionName: integration.plaid.institutionName,
      accountsCount: integration.plaid.accounts ? integration.plaid.accounts.length : 0
    });

    res.json({
      isIntegrated: integration.plaid.isIntegrated,
      hasPlaid: integration.plaid.isIntegrated,
      institutionName: integration.plaid.institutionName,
      accountsCount: integration.plaid.accounts ? integration.plaid.accounts.length : 0,
      lastSync: integration.plaid.lastSync
    });
  } catch (error) {
    console.error('Error getting integration status:', error);
    res.status(500).json({
      message: 'Failed to get integration status',
      error: error.message
    });
  }
};

module.exports = {
  createLinkToken: [getCurrentUser, createLinkToken],
  exchangePublicToken: [getCurrentUser, exchangePublicToken],
  getAccounts: [getCurrentUser, getAccounts],
  getIntegrationStatus: [getCurrentUser, getIntegrationStatus]
};
