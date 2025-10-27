const axios = require('axios');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const User = require('../Models/User');
const Integration = require('../Models/Integration');
const Analysis = require('../Models/Analysis');

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';
const AI_API_KEY = process.env.BENCHWISE_AI_API_KEY || 'benchwise-ai-secret-key-change-in-production';

async function testAnalysisFlow() {
  try {
    console.log('\n🧪 Testing Complete Analysis Flow\n');

    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Get latest integration
    const integration = await Integration.findOne({ 'plaid.isIntegrated': true }).sort({ updatedAt: -1 }).populate('userId');

    if (!integration) {
      console.log('❌ No integration found');
      return;
    }

    console.log(`\n👤 User: ${integration.userId.email}`);
    console.log(`🔑 Access Token: ${integration.plaid.accessToken.substring(0, 30)}...`);

    // Calculate date range for 30 days
    const endDate = new Date().toISOString().split('T')[0];
    const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    console.log(`\n📅 Period: ${startDate} to ${endDate}`);
    console.log('\n🚀 Calling Python AI Service...');

    // Call Python AI service
    const response = await axios.post(
      `${AI_SERVICE_URL}/api/v1/analyze/period`,
      {
        access_token: integration.plaid.accessToken,
        start_date: startDate,
        end_date: endDate,
        days: 30,
        user_id: integration.userId._id.toString()
      },
      {
        headers: {
          'X-API-Key': AI_API_KEY,
          'Content-Type': 'application/json'
        },
        timeout: 60000
      }
    );

    console.log('\n✅ Analysis received from Python service');
    console.log(`   Transaction count: ${response.data.data.transactions.count}`);
    console.log(`   Total spent: $${response.data.data.transactions.totalSpent.toFixed(2)}`);
    console.log(`   Total income: $${response.data.data.transactions.totalIncome.toFixed(2)}`);

    // Save to MongoDB
    const analysis = new Analysis({
      userId: integration.userId._id,
      days: 30,
      analysisDate: new Date(),
      period: { startDate, endDate },
      ...response.data.data
    });

    await analysis.save();
    console.log('\n✅ Analysis saved to MongoDB');

    console.log('\n🎉 SUCCESS! Complete flow working:');
    console.log('   1. ✅ Fetched Plaid access token from MongoDB');
    console.log('   2. ✅ Called Python FastAPI service');
    console.log('   3. ✅ Python fetched real Plaid transactions');
    console.log('   4. ✅ Python generated AI analysis');
    console.log('   5. ✅ Saved to MongoDB Analysis collection');
    console.log('\n💡 Now refresh your frontend to see the data!\n');

  } catch (error) {
    console.error('\n❌ Error:', error.response?.data || error.message);
    if (error.response?.data?.detail) {
      console.error('   Detail:', error.response.data.detail);
    }
  } finally {
    await mongoose.connection.close();
  }
}

testAnalysisFlow();
