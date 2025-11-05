const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const User = require('../Models/User');
const Integration = require('../Models/Integration');

async function checkIntegration() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    const integration = await Integration.findOne({ 'plaid.isIntegrated': true }).populate('userId');

    if (!integration) {
      console.log('❌ No integration found');
      return;
    }

    console.log('Integration found:');
    console.log('User:', integration.userId?.email);
    console.log('Plaid integrated:', integration.plaid?.isIntegrated);
    console.log('Bank connections count:', integration.plaid?.bankConnections?.length || 0);
    console.log('\nFull integration object:');
    console.log(JSON.stringify(integration, null, 2));

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.connection.close();
  }
}

checkIntegration();
