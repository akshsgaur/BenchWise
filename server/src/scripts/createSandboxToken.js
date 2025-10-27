/**
 * Create a Plaid Sandbox access token for testing
 */
require('dotenv').config();
const mongoose = require('mongoose');
const plaid = require('plaid');
const Integration = require('../Models/Integration');
const User = require('../Models/User');

const PLAID_CLIENT_ID = process.env.PLAID_CLIENT_ID;
const PLAID_SECRET = process.env.PLAID_SECRET;
const PLAID_ENV = process.env.PLAID_ENV || 'sandbox';

const configuration = new plaid.Configuration({
  basePath: plaid.PlaidEnvironments[PLAID_ENV],
  baseOptions: {
    headers: {
      'PLAID-CLIENT-ID': PLAID_CLIENT_ID,
      'PLAID-SECRET': PLAID_SECRET,
    },
  },
});

const plaidClient = new plaid.PlaidApi(configuration);

async function createSandboxToken() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Find a user (preferably the first one)
    const user = await User.findOne();
    if (!user) {
      console.log('❌ No users found in database. Please register first.');
      process.exit(1);
    }

    console.log('Creating Plaid Sandbox token for user:', user.email);

    // Create a Sandbox public token
    const createResponse = await plaidClient.sandboxPublicTokenCreate({
      institution_id: 'ins_109508',
      initial_products: ['transactions'],
    });

    const publicToken = createResponse.data.public_token;
    console.log('✅ Created sandbox public token:', publicToken);

    // Exchange for access token
    const exchangeResponse = await plaidClient.itemPublicTokenExchange({
      public_token: publicToken,
    });

    const accessToken = exchangeResponse.data.access_token;
    const itemId = exchangeResponse.data.item_id;

    console.log('✅ Access token:', accessToken.substring(0, 20) + '...');
    console.log('✅ Item ID:', itemId);

    // Get accounts
    const accountsResponse = await plaidClient.accountsGet({
      access_token: accessToken,
    });

    const accounts = accountsResponse.data.accounts;
    console.log(`✅ Found ${accounts.length} accounts`);

    // Update or create integration
    const integration = await Integration.findOneAndUpdate(
      { userId: user._id },
      {
        userId: user._id,
        plaid: {
          isIntegrated: true,
          accessToken: accessToken,
          itemId: itemId,
          institutionId: 'ins_109508',
          institutionName: 'First Platypus Bank',
          lastSync: new Date(),
          bankConnections: [
            {
              accessToken: accessToken,
              itemId: itemId,
              institutionId: 'ins_109508',
              institutionName: 'First Platypus Bank',
              accounts: accounts.map(acc => ({
                accountId: acc.account_id,
                name: acc.name,
                mask: acc.mask,
                type: acc.type,
                subtype: acc.subtype,
                balances: {
                  available: acc.balances.available,
                  current: acc.balances.current,
                  limit: acc.balances.limit,
                },
              })),
              lastSync: new Date(),
            },
          ],
        },
      },
      { upsert: true, new: true }
    );

    console.log('\n✅ Integration saved to MongoDB!');
    console.log('User ID:', user._id);
    console.log('Institution:', integration.plaid.institutionName);
    console.log('Accounts:', integration.plaid.bankConnections[0].accounts.length);
    console.log('\n✅ You can now use the AI Chatbot!');

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

createSandboxToken();
