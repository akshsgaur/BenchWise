/**
 * Check and display Plaid integration status for debugging
 */
require('dotenv').config();
const mongoose = require('mongoose');
const Integration = require('../Models/Integration');

async function checkPlaidTokens() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    const integrations = await Integration.find({ 'plaid.isIntegrated': true });

    console.log(`Found ${integrations.length} Plaid integrations:\n`);

    for (const integration of integrations) {
      console.log('─────────────────────────────────────────');
      console.log('User ID:', integration.userId);
      console.log('Institution:', integration.plaid.institutionName || 'Unknown');

      // Check for access token
      let token = null;
      if (integration.plaid.bankConnections && integration.plaid.bankConnections.length > 0) {
        token = integration.plaid.bankConnections[0].accessToken;
        console.log('Token (new format):', token ? `${token.substring(0, 20)}...` : 'Missing');
        console.log('Accounts:', integration.plaid.bankConnections[0].accounts?.length || 0);
      } else if (integration.plaid.accessToken) {
        token = integration.plaid.accessToken;
        console.log('Token (old format):', token ? `${token.substring(0, 20)}...` : 'Missing');
      } else {
        console.log('⚠️  No access token found!');
      }

      console.log('Last Synced:', integration.plaid.lastSync || 'Never');
      console.log('Created:', integration.createdAt);
    }

    console.log('─────────────────────────────────────────\n');

    if (integrations.length === 0) {
      console.log('⚠️  No Plaid integrations found. You need to connect a bank account first.');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

checkPlaidTokens();
