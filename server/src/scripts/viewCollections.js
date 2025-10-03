/**
 * Script to view MongoDB collections data
 * Run with: node src/scripts/viewCollections.js
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Import models
const User = require('../Models/User');
const Integration = require('../Models/Integration');
const Analysis = require('../Models/Analysis');
const Advice = require('../Models/Advice');

async function viewCollections() {
  try {
    console.log('\n🔗 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('✅ Connected successfully\n');

    // View Users
    console.log('👥 USERS:');
    console.log('─'.repeat(80));
    const users = await User.find().select('name email createdAt').limit(5);
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name || 'N/A'} (${user.email})`);
      console.log(`   Created: ${user.createdAt}`);
      console.log(`   ID: ${user._id}\n`);
    });

    // View Integrations
    console.log('\n🔗 INTEGRATIONS:');
    console.log('─'.repeat(80));
    const integrations = await Integration.find().populate('userId', 'name email');
    integrations.forEach((integration, index) => {
      console.log(`${index + 1}. User: ${integration.userId?.name || 'Unknown'} (${integration.userId?.email || 'N/A'})`);
      console.log(`   Plaid Integrated: ${integration.plaid.isIntegrated ? '✅' : '❌'}`);
      if (integration.plaid.isIntegrated) {
        console.log(`   Access Token: ${integration.plaid.accessToken.substring(0, 20)}...`);
        console.log(`   Item ID: ${integration.plaid.itemId}`);
      }
      console.log('');
    });

    // View Analyses
    console.log('\n📊 ANALYSES (AI Transaction Analysis):');
    console.log('─'.repeat(80));
    const analyses = await Analysis.find()
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
      .limit(5);

    if (analyses.length === 0) {
      console.log('   📭 No analyses yet. Create one by calling:');
      console.log('   GET /api/v1/analysis/monthly?month=10&year=2025\n');
    } else {
      analyses.forEach((analysis, index) => {
        console.log(`${index + 1}. User: ${analysis.userId?.name || 'Unknown'}`);
        console.log(`   Period: ${analysis.period?.startDate} to ${analysis.period?.endDate}`);
        console.log(`   Transactions: ${analysis.transactions?.count || 0}`);
        console.log(`   Total Spent: $${analysis.transactions?.totalSpent?.toFixed(2) || '0.00'}`);
        console.log(`   Total Income: $${analysis.transactions?.totalIncome?.toFixed(2) || '0.00'}`);
        console.log(`   Created: ${analysis.createdAt}`);
        console.log('');
      });
    }

    // View Advice
    console.log('\n💡 ADVICE (Personalized Financial Advice):');
    console.log('─'.repeat(80));
    const advice = await Advice.find()
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
      .limit(5);

    if (advice.length === 0) {
      console.log('   📭 No advice yet. Create one by calling:');
      console.log('   POST /api/v1/analysis/advice');
      console.log('   Body: {"question": "How can I save more money?"}\n');
    } else {
      advice.forEach((item, index) => {
        console.log(`${index + 1}. User: ${item.userId?.name || 'Unknown'}`);
        console.log(`   Question: ${item.question}`);
        console.log(`   Advice Preview: ${item.advice?.advice?.substring(0, 100) || 'N/A'}...`);
        console.log(`   Created: ${item.createdAt}`);
        console.log(`   Expires: ${item.expiresAt}`);
        console.log('');
      });
    }

    // Summary
    console.log('\n📈 SUMMARY:');
    console.log('─'.repeat(80));
    const userCount = await User.countDocuments();
    const integrationCount = await Integration.countDocuments();
    const analysisCount = await Analysis.countDocuments();
    const adviceCount = await Advice.countDocuments();

    console.log(`Total Users: ${userCount}`);
    console.log(`Total Integrations: ${integrationCount}`);
    console.log(`Total Analyses: ${analysisCount} ${analysisCount === 0 ? '(Create with API)' : '✅'}`);
    console.log(`Total Advice: ${adviceCount} ${adviceCount === 0 ? '(Create with API)' : '✅'}`);

    console.log('\n✅ View complete!\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Connection closed\n');
  }
}

// Run the viewer
viewCollections();
