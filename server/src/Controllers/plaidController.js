const { Configuration, PlaidApi, PlaidEnvironments } = require('plaid');
const Integration = require('../Models/Integration');
const User = require('../Models/User');
const jwt = require('jsonwebtoken');

// Initialize Plaid client
const configuration = new Configuration({
  basePath: PlaidEnvironments.sandbox, // Use sandbox for development
  baseOptions: {
    headers: {
      'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID,
      'PLAID-SECRET': process.env.PLAID_SECRET,
    },
  },
});

const plaidClient = new PlaidApi(configuration);

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

    const request = {
      user: {
        client_user_id: user._id.toString(),
      },
      client_name: 'BenchWise',
      products: ['transactions', 'accounts', 'investments'],
      country_codes: ['US'],
      language: 'en',
    };

    const response = await plaidClient.linkTokenCreate(request);
    
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
    });

    const { access_token, item_id } = response.data;

    // Get account information
    const accountsResponse = await plaidClient.accountsGet({
      access_token: access_token,
    });

    const accounts = accountsResponse.data.accounts.map(account => ({
      accountId: account.account_id,
      name: account.name,
      type: account.type,
      subtype: account.subtype,
      balance: {
        available: account.balances.available,
        current: account.balances.current
      },
      mask: account.mask
    }));

    // Get institution information
    const institutionResponse = await plaidClient.institutionsGetById({
      institution_id: accountsResponse.data.item.institution_id,
    });

    // Create or update integration record
    const integration = await Integration.findOneAndUpdate(
      { userId: user._id },
      {
        userId: user._id,
        plaid: {
          isIntegrated: true,
          accessToken: access_token,
          itemId: item_id,
          institutionId: accountsResponse.data.item.institution_id,
          institutionName: institutionResponse.data.institution.name,
          lastSync: new Date(),
          accounts: accounts
        }
      },
      { upsert: true, new: true }
    );

    res.json({
      message: 'Bank account successfully integrated',
      integration: {
        isIntegrated: integration.plaid.isIntegrated,
        institutionName: integration.plaid.institutionName,
        accountsCount: integration.plaid.accounts.length
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

    const integration = await Integration.findOne({ userId: user._id });
    
    if (!integration) {
      console.log('No integration found for user:', user._id);
      return res.json({
        isIntegrated: false,
        hasPlaid: false
      });
    }

    console.log('Integration found:', {
      isIntegrated: integration.plaid.isIntegrated,
      institutionName: integration.plaid.institutionName,
      accountsCount: integration.plaid.accounts.length
    });

    res.json({
      isIntegrated: integration.plaid.isIntegrated,
      hasPlaid: integration.plaid.isIntegrated,
      institutionName: integration.plaid.institutionName,
      accountsCount: integration.plaid.accounts.length,
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
