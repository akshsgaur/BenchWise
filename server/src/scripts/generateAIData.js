/**
 * Generate AI-powered analyses and advice for 7, 30, and 60 day periods
 * This script:
 * 1. Fetches real transactions from Plaid
 * 2. Sends data to Azure OpenAI for analysis
 * 3. Gets personalized financial advice
 * 4. Stores everything in MongoDB
 *
 * Run with: node src/scripts/generateAIData.js
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const plaid = require('plaid');
const { OpenAI } = require('openai');

// Load environment variables
dotenv.config();

// Import models
const User = require('../Models/User');
const Integration = require('../Models/Integration');
const Analysis = require('../Models/Analysis');
const Advice = require('../Models/Advice');

// Initialize Plaid client
const plaidEnvironmentMap = {
  'sandbox': plaid.Environment.Sandbox,
  'production': plaid.Environment.Production
};

const plaidConfig = new plaid.Configuration({
  basePath: plaidEnvironmentMap[process.env.PLAID_ENV] || plaid.Environment.Sandbox,
  baseOptions: {
    headers: {
      'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID,
      'PLAID-SECRET': process.env.PLAID_SECRET,
      'Plaid-Version': '2020-09-14'
    }
  }
});

const plaidClient = new plaid.PlaidApi(plaidConfig);

// Initialize Azure OpenAI client
const openaiClient = new OpenAI({
  baseURL: `${process.env.AZURE_OPENAI_ENDPOINT}openai/deployments/${process.env.AZURE_OPENAI_DEPLOYMENT}`,
  apiKey: process.env.AZURE_OPENAI_API_KEY,
  defaultQuery: { 'api-version': '2023-05-15' },
  defaultHeaders: { 'api-key': process.env.AZURE_OPENAI_API_KEY }
});

// Helper function to get date range
function getDateRange(days) {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  return {
    startDate: startDate.toISOString().split('T')[0],
    endDate: endDate.toISOString().split('T')[0]
  };
}

// Fetch transactions from Plaid
async function fetchPlaidTransactions(accessToken, startDate, endDate) {
  try {
    console.log(`   Fetching transactions from ${startDate} to ${endDate}...`);

    const request = {
      access_token: accessToken,
      start_date: startDate,
      end_date: endDate,
      options: {
        count: 500,
        offset: 0
      }
    };

    const response = await plaidClient.transactionsGet(request);

    console.log(`   ✅ Fetched ${response.data.transactions.length} transactions`);

    return {
      transactions: response.data.transactions,
      accounts: response.data.accounts,
      total: response.data.total_transactions
    };
  } catch (error) {
    console.error('   ❌ Error fetching Plaid transactions:', error.message);
    throw error;
  }
}

// Generate AI analysis using Azure OpenAI
async function generateAIAnalysis(transactions, period) {
  try {
    console.log(`   Generating AI analysis for ${period} day period...`);

    // Prepare transaction summary for AI
    const transactionSummary = transactions.map(t => ({
      name: t.name,
      amount: t.amount,
      category: t.category ? t.category[0] : 'Uncategorized',
      date: t.date,
      merchant: t.merchant_name
    }));

    // Calculate statistics
    const totalSpent = transactions.reduce((sum, t) => sum + (t.amount > 0 ? t.amount : 0), 0);
    const totalIncome = Math.abs(transactions.reduce((sum, t) => sum + (t.amount < 0 ? t.amount : 0), 0));

    // Categorize spending
    const categorySpending = {};
    transactions.forEach(t => {
      if (t.amount > 0) {
        const category = t.category ? t.category[0] : 'Uncategorized';
        categorySpending[category] = (categorySpending[category] || 0) + t.amount;
      }
    });

    const topCategories = Object.entries(categorySpending)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([category, amount]) => ({ category, amount }));

    // Create AI prompt
    const prompt = `Analyze the following ${transactions.length} financial transactions from the past ${period} days:

Total Spent: $${totalSpent.toFixed(2)}
Total Income: $${totalIncome.toFixed(2)}
Net Cash Flow: $${(totalIncome - totalSpent).toFixed(2)}

Top Spending Categories:
${topCategories.map(c => `- ${c.category}: $${c.amount.toFixed(2)}`).join('\n')}

Recent Transactions Sample (showing first 20):
${transactionSummary.slice(0, 20).map(t =>
  `${t.date}: ${t.name} - $${t.amount.toFixed(2)} (${t.category})`
).join('\n')}

Please provide a detailed financial analysis including:
1. Spending pattern insights
2. Unusual or concerning spending
3. Opportunities for savings
4. Budget recommendations
5. Financial health score (1-10)
6. Specific actionable advice

Format your response as a structured analysis.`;

    const completion = await openaiClient.chat.completions.create({
      model: process.env.AZURE_OPENAI_DEPLOYMENT,
      messages: [
        {
          role: 'system',
          content: 'You are a professional financial advisor AI. Provide detailed, actionable insights based on transaction data.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 1000
    });

    const aiInsights = completion.choices[0].message.content;

    console.log(`   ✅ AI analysis generated`);

    return {
      transaction_count: transactions.length,
      analysis_period: `${period} days`,
      total_spent: totalSpent,
      total_income: totalIncome,
      net_cash_flow: totalIncome - totalSpent,
      top_categories: topCategories,
      ai_insights: aiInsights,
      raw_transactions: transactionSummary
    };
  } catch (error) {
    console.error('   ❌ Error generating AI analysis:', error.message);
    throw error;
  }
}

// Generate personalized financial advice
async function generateFinancialAdvice(transactions, accounts, period) {
  try {
    console.log(`   Generating financial advice for ${period} day period...`);

    const totalSpent = transactions.reduce((sum, t) => sum + (t.amount > 0 ? t.amount : 0), 0);
    const avgDailySpending = totalSpent / period;

    // Get top spending category
    const categorySpending = {};
    transactions.forEach(t => {
      if (t.amount > 0) {
        const category = t.category ? t.category[0] : 'Uncategorized';
        categorySpending[category] = (categorySpending[category] || 0) + t.amount;
      }
    });

    const topCategory = Object.entries(categorySpending)
      .sort((a, b) => b[1] - a[1])[0];

    const question = `Based on my ${period}-day spending pattern, how can I reduce expenses in ${topCategory ? topCategory[0] : 'general spending'}?`;

    const prompt = `User's Financial Context (${period} days):

Total Spent: $${totalSpent.toFixed(2)}
Average Daily Spending: $${avgDailySpending.toFixed(2)}
Top Spending Category: ${topCategory ? topCategory[0] : 'N/A'} ($${topCategory ? topCategory[1].toFixed(2) : '0'})

Account Balances:
${accounts.map(a => `- ${a.name}: $${a.balances.current || 0}`).join('\n')}

Recent Transactions:
${transactions.slice(0, 15).map(t =>
  `${t.date}: ${t.name} - $${t.amount.toFixed(2)}`
).join('\n')}

User Question: ${question}

Provide personalized, actionable financial advice with:
1. Immediate actions they can take
2. Long-term strategies
3. Specific money-saving tips
4. Expected savings estimates
5. Budget recommendations

Be specific, encouraging, and practical.`;

    const completion = await openaiClient.chat.completions.create({
      model: process.env.AZURE_OPENAI_DEPLOYMENT,
      messages: [
        {
          role: 'system',
          content: 'You are a helpful, empathetic financial advisor. Provide personalized, actionable advice.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.4,
      max_tokens: 800
    });

    const advice = completion.choices[0].message.content;

    console.log(`   ✅ Financial advice generated`);

    return {
      question,
      advice,
      has_financial_context: true
    };
  } catch (error) {
    console.error('   ❌ Error generating advice:', error.message);
    throw error;
  }
}

// Main function
async function generateAllData() {
  try {
    console.log('\n🚀 Starting AI Data Generation');
    console.log('═'.repeat(80));

    // Connect to MongoDB
    console.log('\n📦 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Connected to MongoDB\n');

    // Find user with Plaid integration
    const integration = await Integration.findOne({ 'plaid.isIntegrated': true }).populate('userId');

    if (!integration) {
      console.log('❌ No Plaid integration found. Please connect a bank account first.');
      return;
    }

    const user = integration.userId;
    const accessToken = integration.plaid.accessToken;

    console.log(`👤 User: ${user.email}`);
    console.log(`🔑 Access Token: ${accessToken.substring(0, 20)}...`);
    console.log('\n' + '─'.repeat(80) + '\n');

    // Periods to process
    const periods = [7, 30, 60];

    for (const period of periods) {
      console.log(`\n📊 Processing ${period}-day period`);
      console.log('─'.repeat(80));

      // Get date range
      const { startDate, endDate } = getDateRange(period);
      console.log(`   Period: ${startDate} to ${endDate}`);

      try {
        // 1. Fetch Plaid transactions
        const plaidData = await fetchPlaidTransactions(accessToken, startDate, endDate);

        if (plaidData.transactions.length === 0) {
          console.log(`   ⚠️  No transactions found for ${period}-day period. Skipping...`);
          continue;
        }

        // 2. Generate AI analysis
        const aiAnalysis = await generateAIAnalysis(plaidData.transactions, period);

        // 3. Create and save Analysis document
        console.log(`   Saving analysis to MongoDB...`);
        const analysis = new Analysis({
          userId: user._id,
          analysisDate: new Date(),
          period: {
            startDate,
            endDate
          },
          transactions: {
            count: plaidData.transactions.length,
            totalSpent: aiAnalysis.total_spent,
            totalIncome: aiAnalysis.total_income
          },
          aiAnalysis: aiAnalysis,
          rawTransactions: plaidData.transactions,
          accountsSnapshot: plaidData.accounts
        });

        await analysis.save();
        console.log(`   ✅ Analysis saved!`);

        // 4. Generate financial advice
        const adviceContent = await generateFinancialAdvice(
          plaidData.transactions,
          plaidData.accounts,
          period
        );

        // 5. Create and save Advice document
        console.log(`   Saving advice to MongoDB...`);
        const advice = new Advice({
          userId: user._id,
          question: adviceContent.question,
          advice: adviceContent,
          createdAt: new Date(),
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        });

        await advice.save();
        console.log(`   ✅ Advice saved!`);

        console.log(`\n   ✨ ${period}-day period completed successfully!`);

      } catch (error) {
        console.error(`\n   ❌ Error processing ${period}-day period:`, error.message);
        console.error('   Continuing with next period...');
      }
    }

    // Summary
    console.log('\n\n' + '═'.repeat(80));
    console.log('📈 FINAL SUMMARY');
    console.log('═'.repeat(80));

    const analysisCount = await Analysis.countDocuments({ userId: user._id });
    const adviceCount = await Advice.countDocuments({ userId: user._id });

    console.log(`\n✅ Total Analyses Created: ${analysisCount}`);
    console.log(`✅ Total Advice Created: ${adviceCount}`);
    console.log(`👤 User: ${user.email}`);

    console.log('\n🎉 AI Data Generation Complete!');
    console.log('\n💡 Next Steps:');
    console.log('   1. Refresh MongoDB Atlas to see all documents');
    console.log('   2. Check frontend dashboard for AI insights');
    console.log('   3. View with: node src/scripts/viewCollections.js\n');

  } catch (error) {
    console.error('\n❌ Fatal Error:', error.message);
    console.error(error.stack);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 MongoDB connection closed\n');
  }
}

// Run the script
generateAllData();
