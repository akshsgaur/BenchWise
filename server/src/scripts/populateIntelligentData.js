/**
 * Populate database with intelligent analyses and advice
 * Based on real Plaid transaction data
 * Run with: node src/scripts/populateIntelligentData.js
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const { Configuration, PlaidApi, PlaidEnvironments } = require('plaid');

dotenv.config();

const User = require('../Models/User');
const Integration = require('../Models/Integration');
const Analysis = require('../Models/Analysis');
const Advice = require('../Models/Advice');

// Initialize Plaid
const plaidConfig = new Configuration({
  basePath: PlaidEnvironments.sandbox,
  baseOptions: {
    headers: {
      'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID,
      'PLAID-SECRET': process.env.PLAID_SECRET
    }
  }
});

const plaidClient = new PlaidApi(plaidConfig);

function getDateRange(days) {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  return {
    startDate: startDate.toISOString().split('T')[0],
    endDate: endDate.toISOString().split('T')[0]
  };
}

async function fetchTransactions(accessToken, startDate, endDate) {
  const request = {
    access_token: accessToken,
    start_date: startDate,
    end_date: endDate,
    options: { count: 500, offset: 0 }
  };

  const response = await plaidClient.transactionsGet(request);
  return {
    transactions: response.data.transactions,
    accounts: response.data.accounts
  };
}

function analyzeTransactions(transactions, period) {
  const spent = transactions.filter(t => t.amount > 0);
  const income = transactions.filter(t => t.amount < 0);

  const totalSpent = spent.reduce((sum, t) => sum + t.amount, 0);
  const totalIncome = Math.abs(income.reduce((sum, t) => sum + t.amount, 0));

  // Categorize spending
  const categorySpending = {};
  spent.forEach(t => {
    const cat = t.category?.[0] || 'Uncategorized';
    categorySpending[cat] = (categorySpending[cat] || 0) + t.amount;
  });

  const topCategories = Object.entries(categorySpending)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([category, amount]) => ({ category, amount, count: spent.filter(t => t.category?.[0] === category).length }));

  // Generate intelligent insights
  const avgDaily = totalSpent / period;
  const topCategory = topCategories[0];
  const topCategoryPercent = (topCategory.amount / totalSpent * 100).toFixed(1);

  const insights = `# Financial Analysis Report (${period} Days)

## Overview
- **Period**: Last ${period} days
- **Total Transactions**: ${transactions.length}
- **Total Spent**: $${totalSpent.toFixed(2)}
- **Total Income**: $${totalIncome.toFixed(2)}
- **Net Cash Flow**: $${(totalIncome - totalSpent).toFixed(2)}
- **Average Daily Spending**: $${avgDaily.toFixed(2)}

## Spending Breakdown

### Top Spending Categories
${topCategories.map((c, i) =>
  `${i + 1}. **${c.category}**: $${c.amount.toFixed(2)} (${(c.amount / totalSpent * 100).toFixed(1)}%) - ${c.count} transactions`
).join('\n')}

## Key Insights

### 1. Spending Pattern Analysis
Your largest expense category is **${topCategory.category}**, accounting for ${topCategoryPercent}% of total spending. ${
  topCategoryPercent > 35 ?
    `This is notably high and presents a significant opportunity for savings.` :
    `This is within a reasonable range for this category.`
}

${totalIncome > totalSpent ?
  `### 2. Positive Cash Flow ✅\nYou maintained a positive net cash flow of $${(totalIncome - totalSpent).toFixed(2)}, which is excellent. You're saving ${((totalIncome - totalSpent) / totalIncome * 100).toFixed(1)}% of your income.` :
  `### 2. Negative Cash Flow ⚠️\nYou're spending more than earning by $${(totalSpent - totalIncome).toFixed(2)}. This needs immediate attention.`
}

### 3. Transaction Frequency
You made ${spent.length} purchase transactions over ${period} days (${(spent.length / period).toFixed(1)} per day on average). ${
  spent.length / period > 5 ?
    `This high transaction frequency suggests impulse purchases. Consider consolidating shopping trips.` :
    `Your transaction frequency is well-controlled.`
}

## Recommendations

### Immediate Actions
${topCategoryPercent > 35 ?
  `1. **Reduce ${topCategory.category} expenses by 20%**: This could save you $${(topCategory.amount * 0.2).toFixed(2)} over the next ${period} days.\n2. Track every purchase in this category for the next week to identify patterns.` :
  `1. Continue monitoring ${topCategory.category} spending to maintain control.\n2. Look for opportunities to optimize without major lifestyle changes.`
}

3. **Set up automatic savings**: Transfer ${Math.max(10, ((totalIncome - totalSpent) / totalIncome * 100 * 0.5).toFixed(0))}% of income to savings immediately after payday.

### Long-term Strategy
- **Budget Allocation**: Aim for ${topCategory.category} to be max ${Math.min(30, topCategoryPercent * 0.8).toFixed(0)}% of spending
- **Emergency Fund**: Build to 3-6 months of expenses ($${(totalSpent * 3).toFixed(0)})
- **Monthly Review**: Track spending weekly to catch overspending early

## Financial Health Score: ${Math.min(10, Math.max(1, (
  (totalIncome > totalSpent ? 5 : 2) +
  (topCategoryPercent < 35 ? 3 : 1) +
  (spent.length / period < 5 ? 2 : 1)
))).toFixed(1)}/10

${totalIncome > totalSpent && topCategoryPercent < 35 ?
  `**Excellent financial management!** Keep up the good work and focus on building long-term wealth.` :
  totalIncome > totalSpent ?
    `**Good foundation** with positive cash flow. Focus on optimizing category spending for even better results.` :
    `**Needs improvement.** Focus on reducing expenses and increasing income to achieve positive cash flow.`
}`;

  return {
    transaction_count: transactions.length,
    analysis_period: `${period} days`,
    total_spent: totalSpent,
    total_income: totalIncome,
    net_cash_flow: totalIncome - totalSpent,
    top_categories: topCategories,
    ai_insights: insights,
    raw_transactions: transactions.slice(0, 50).map(t => ({
      name: t.name,
      amount: t.amount,
      date: t.date,
      category: t.category?.[0] || 'Uncategorized'
    }))
  };
}

function generateAdvice(transactions, period, topCategory) {
  const totalSpent = transactions.filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0);
  const categoryAmount = topCategory.amount;

  const question = `Based on my ${period}-day spending, how can I reduce my ${topCategory.category} expenses?`;

  const advice = `# Personalized Financial Advice: Reducing ${topCategory.category} Expenses

## Your Current Situation
Over the past ${period} days, you've spent **$${categoryAmount.toFixed(2)}** on ${topCategory.category} across ${topCategory.count} transactions. This represents ${(categoryAmount / totalSpent * 100).toFixed(1)}% of your total spending.

**Average per transaction**: $${(categoryAmount / topCategory.count).toFixed(2)}
**Daily average**: $${(categoryAmount / period).toFixed(2)}

## Immediate Actions You Can Take Today

### 1. Set a Weekly Budget
- **Current weekly spending**: $${(categoryAmount / (period / 7)).toFixed(2)}
- **Recommended target**: $${(categoryAmount / (period / 7) * 0.8).toFixed(2)} (20% reduction)
- **Potential savings**: $${(categoryAmount * 0.2).toFixed(2)} over ${period} days

**How to do it:**
- Use your banking app to track ${topCategory.category} purchases
- Get alerts when you're approaching your weekly limit
- Review every Friday to stay on track

### 2. Implement the 24-Hour Rule
Before making any ${topCategory.category} purchase over $${(categoryAmount / topCategory.count).toFixed(0)}, wait 24 hours. This simple rule can eliminate impulse purchases.

**Expected impact**: Reduce transactions by 3-5 per ${period} days, saving approximately $${((categoryAmount / topCategory.count) * 4).toFixed(2)}

### 3. Find Alternatives
${topCategory.category === 'Food and Drink' || topCategory.category.includes('Food') ?
  `**Meal Planning Strategy:**
- Prep meals on Sunday for the week
- Shop with a list (never hungry!)
- Use apps like Mealime for budget recipes
- **Expected monthly savings**: $${(categoryAmount * 0.3).toFixed(2)}` :
  topCategory.category.includes('Transportation') || topCategory.category === 'Travel' ?
  `**Transportation Optimization:**
- Combine errands into single trips
- Consider public transit 2-3x per week
- Use gas rewards programs
- **Expected monthly savings**: $${(categoryAmount * 0.25).toFixed(2)}` :
  `**Smart ${topCategory.category} Strategies:**
- Research before purchasing
- Use cashback/rewards credit cards
- Look for sales and discounts
- **Expected monthly savings**: $${(categoryAmount * 0.2).toFixed(2)}`
}

## Long-Term Strategies (Next 3 Months)

### Build Better Habits
1. **Track everything** for 30 days to understand patterns
2. **Set specific goals**: "I will reduce ${topCategory.category} by $${(categoryAmount * 0.25).toFixed(0)} monthly"
3. **Celebrate wins**: When you hit goals, reward yourself (within budget!)

### Create Sustainable Changes
${topCategory.category.includes('Food') ?
  `- Learn 10 quick, cheap recipes
- Invest in meal prep containers ($30 saves $300+/month)
- Make coffee at home (saves $5-8/day)` :
  `- Research cheaper alternatives that maintain quality
- Use the "cost per use" calculation for purchases
- Build an accountability system`
}

## Expected Financial Impact

### 30-Day Projection
- **Current trajectory**: $${(categoryAmount / period * 30).toFixed(2)}
- **With recommendations**: $${(categoryAmount / period * 30 * 0.75).toFixed(2)}
- **Monthly savings**: $${(categoryAmount / period * 30 * 0.25).toFixed(2)}

### Annual Impact
By implementing these changes consistently, you could save:
- **Year 1**: $${(categoryAmount / period * 365 * 0.25).toFixed(2)}
- **Year 5**: $${(categoryAmount / period * 365 * 0.25 * 5).toFixed(2)} (assuming consistent habits)

## Your Action Plan (Start This Week)

✅ **Monday**: Set up weekly budget alerts in your banking app
✅ **Tuesday**: Research 3 cost-saving alternatives for ${topCategory.category}
✅ **Wednesday**: Implement the 24-hour rule for purchases
✅ **Thursday**: Review first 3 days of spending
✅ **Friday**: Weekly review and adjust for next week
✅ **Weekend**: ${topCategory.category.includes('Food') ? 'Meal prep for next week' : 'Plan budget-friendly activities'}

## Remember
Small changes compound over time. A 20% reduction might not feel dramatic, but it's **$${(categoryAmount / period * 365 * 0.2).toFixed(2)} per year** in your pocket. That could be:
- A vacation
- Emergency fund boost
- Investment for your future
- Debt payoff acceleration

You've got this! Start with one change and build from there. 💪`;

  return {
    question,
    advice,
    has_financial_context: true
  };
}

async function populateData() {
  try {
    console.log('\n🚀 Populating Intelligent Financial Data');
    console.log('═'.repeat(80));

    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    const integration = await Integration.findOne({ 'plaid.isIntegrated': true }).populate('userId');

    if (!integration) {
      console.log('❌ No Plaid integration found');
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
        const { transactions, accounts } = await fetchTransactions(integration.plaid.accessToken, startDate, endDate);

        if (transactions.length === 0) {
          console.log(`   ⚠️  No transactions, skipping...`);
          continue;
        }

        console.log(`   ✅ Fetched ${transactions.length} transactions`);

        // Generate analysis
        const analysis = analyzeTransactions(transactions, period);

        // Save analysis
        await new Analysis({
          userId: user._id,
          analysisDate: new Date(),
          period: { startDate, endDate },
          transactions: {
            count: transactions.length,
            totalSpent: analysis.total_spent,
            totalIncome: analysis.total_income
          },
          aiAnalysis: analysis,
          rawTransactions: transactions,
          accountsSnapshot: accounts
        }).save();

        console.log(`   ✅ Analysis saved`);

        // Generate advice
        const adviceContent = generateAdvice(
          transactions,
          period,
          analysis.top_categories[0]
        );

        // Save advice
        await new Advice({
          userId: user._id,
          question: adviceContent.question,
          advice: adviceContent,
          createdAt: new Date(),
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        }).save();

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
    console.log('\n💡 Refresh MongoDB Atlas to see the data\n');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
  }
}

populateData();
