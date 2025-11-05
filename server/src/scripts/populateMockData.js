/**
 * Populate mock analyses and advice data for testing
 * Run with: node src/scripts/populateMockData.js
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const User = require('../Models/User');
const Integration = require('../Models/Integration');
const Analysis = require('../Models/Analysis');
const Advice = require('../Models/Advice');

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

// Generate mock analysis data
function generateMockAnalysis(period) {
  const mockCategories = [
    { category: 'Food and Drink', amount: 450.23, count: 15 },
    { category: 'Transportation', amount: 230.50, count: 8 },
    { category: 'Shopping', amount: 180.75, count: 6 },
    { category: 'Entertainment', amount: 120.00, count: 4 },
    { category: 'Utilities', amount: 95.30, count: 3 }
  ];

  const totalSpent = mockCategories.reduce((sum, cat) => sum + cat.amount, 0);
  const totalIncome = 2500.00;

  return {
    transaction_count: 36,
    analysis_period: `${period} days`,
    total_spent: totalSpent,
    total_income: totalIncome,
    net_cash_flow: totalIncome - totalSpent,
    top_categories: mockCategories,
    ai_insights: `# Financial Analysis Report (${period} Days)

## Overview
- **Period**: Last ${period} days
- **Total Transactions**: 36
- **Total Spent**: $${totalSpent.toFixed(2)}
- **Total Income**: $${totalIncome.toFixed(2)}
- **Net Cash Flow**: $${(totalIncome - totalSpent).toFixed(2)}

## Spending Breakdown

### Top Spending Categories
${mockCategories.map((c, i) =>
  `${i + 1}. **${c.category}**: $${c.amount.toFixed(2)} (${(c.amount / totalSpent * 100).toFixed(1)}%) - ${c.count} transactions`
).join('\n')}

## Key Insights

### 1. Spending Pattern Analysis
Your largest expense category is **Food and Drink**, accounting for ${(mockCategories[0].amount / totalSpent * 100).toFixed(1)}% of total spending. This is within a reasonable range for this category.

### 2. Positive Cash Flow ✅
You maintained a positive net cash flow of $${(totalIncome - totalSpent).toFixed(2)}, which is excellent. You're saving ${((totalIncome - totalSpent) / totalIncome * 100).toFixed(1)}% of your income.

### 3. Financial Health
Your spending is well-balanced across categories with no concerning patterns.

## Recommendations

1. **Build Emergency Fund**: Aim to save 3-6 months of expenses
2. **Track Spending**: Continue monitoring to maintain positive cash flow
3. **Optimize Categories**: Look for small savings in your top spending categories

## Financial Health Score: 8.5/10

**Great job!** You're maintaining healthy financial habits. Keep up the good work!`,
    raw_transactions: []
  };
}

// Generate mock advice
function generateMockAdvice(period, topCategory) {
  const question = `Based on my ${period}-day spending, how can I reduce my ${topCategory} expenses?`;

  const advice = `# Personalized Financial Advice: Reducing ${topCategory} Expenses

## Your Current Situation
Over the past ${period} days, you've spent significant amounts on ${topCategory}. Here's how to optimize this category.

## Immediate Actions You Can Take Today

### 1. Set a Weekly Budget
- Track ${topCategory} purchases daily
- Use banking app alerts for spending limits
- Review progress weekly

### 2. Implement the 24-Hour Rule
Before making any non-essential ${topCategory} purchase, wait 24 hours. This helps eliminate impulse buys.

### 3. Find Alternatives
Look for cost-effective alternatives without sacrificing quality:
- Compare prices before purchasing
- Use cashback/rewards programs
- Look for sales and discounts

## Long-Term Strategies

### Build Better Habits
1. **Track everything** for 30 days to understand patterns
2. **Set specific goals**: Measurable targets for reduction
3. **Celebrate wins**: Reward yourself when hitting goals (within budget!)

### Expected Financial Impact

By implementing these changes consistently, you could save:
- **30 days**: $50-100
- **Year 1**: $600-1,200

## Your Action Plan

✅ Monday: Set up weekly budget alerts
✅ Tuesday: Research cost-saving alternatives
✅ Wednesday: Implement the 24-hour rule
✅ Thursday: Review first 3 days of spending
✅ Friday: Weekly review and adjust
✅ Weekend: Plan for next week

## Remember
Small changes compound over time. Focus on sustainable habits rather than drastic cuts. You've got this! 💪`;

  return {
    question,
    advice,
    has_financial_context: true
  };
}

async function populateMockData() {
  try {
    console.log('\n🚀 Populating Mock Financial Data');
    console.log('═'.repeat(80));

    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    const integration = await Integration.findOne({ 'plaid.isIntegrated': true }).populate('userId');

    if (!integration) {
      console.log('❌ No integration found');
      return;
    }

    const user = integration.userId;
    console.log(`👤 User: ${user.email}\n`);

    const periods = [7, 30, 60];

    for (const period of periods) {
      console.log(`\n📊 Processing ${period}-day period`);
      console.log('─'.repeat(80));

      const { startDate, endDate } = getDateRange(period);
      console.log(`   Period: ${startDate} to ${endDate}`);

      try {
        // Generate mock analysis
        const analysis = generateMockAnalysis(period);

        // Save analysis
        const analysisDoc = new Analysis({
          userId: user._id,
          days: period,
          analysisDate: new Date(),
          period: { startDate, endDate },
          transactions: {
            count: analysis.transaction_count,
            totalSpent: analysis.total_spent,
            totalIncome: analysis.total_income
          },
          aiAnalysis: analysis,
          rawTransactions: [],
          accountsSnapshot: []
        });

        await analysisDoc.save();
        console.log(`   ✅ Analysis saved`);

        // Generate advice
        const adviceContent = generateMockAdvice(period, analysis.top_categories[0].category);

        const adviceDoc = new Advice({
          userId: user._id,
          days: period,
          question: adviceContent.question,
          advice: adviceContent,
          createdAt: new Date(),
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        });

        await adviceDoc.save();
        console.log(`   ✅ Advice saved`);
        console.log(`   ✨ ${period}-day period complete!`);

      } catch (error) {
        console.error(`   ❌ Error: ${error.message}`);
      }
    }

    const analysisCount = await Analysis.countDocuments({ userId: user._id });
    const adviceCount = await Advice.countDocuments({ userId: user._id });

    console.log('\n\n' + '═'.repeat(80));
    console.log('📈 FINAL SUMMARY');
    console.log('═'.repeat(80));
    console.log(`\n✅ Total Analyses: ${analysisCount}`);
    console.log(`✅ Total Advice: ${adviceCount}`);
    console.log('\n🎉 Data population complete!');
    console.log('\n💡 Refresh MongoDB Atlas and your frontend to see the data\n');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
  }
}

populateMockData();
