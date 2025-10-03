# AI Data Generation Guide

## 🎯 What This Script Does

The `generateAIData.js` script creates **real AI-powered financial analyses and advice** by:

1. **Fetching real transaction data** from your Plaid-connected bank account
2. **Sending data to Azure OpenAI** for intelligent analysis
3. **Generating personalized financial advice** based on spending patterns
4. **Storing everything in MongoDB** for your frontend to display

---

## 📋 Prerequisites

Before running the script, you need:

### 1. Azure OpenAI Credentials

You need to update these in `/server/.env`:

```env
AZURE_OPENAI_API_KEY=your-actual-azure-key
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/
AZURE_OPENAI_DEPLOYMENT=gpt-4
```

**How to get these:**
1. Go to [Azure Portal](https://portal.azure.com/)
2. Navigate to your Azure OpenAI resource
3. Copy the **API Key** and **Endpoint**
4. Note your **Deployment Name** (e.g., `gpt-4`, `gpt-35-turbo`)

### 2. Plaid Integration

- Must have a connected bank account (already done ✅)
- Access token stored in MongoDB (already done ✅)

---

## 🚀 How to Run

### Step 1: Update Azure OpenAI Credentials

Edit `/server/.env` and replace:

```env
AZURE_OPENAI_API_KEY=your-azure-openai-api-key-here
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/
AZURE_OPENAI_DEPLOYMENT=gpt-4
```

With your actual Azure OpenAI credentials.

### Step 2: Run the Script

```bash
cd server
node src/scripts/generateAIData.js
```

### Step 3: Watch the Magic Happen

The script will:

```
🚀 Starting AI Data Generation
══════════════════════════════════════════════════════════

📦 Connecting to MongoDB...
✅ Connected to MongoDB

👤 User: gautam222000@gmail.com
🔑 Access Token: access-sandbox-3607c...

────────────────────────────────────────────────────────

📊 Processing 7-day period
────────────────────────────────────────────────────────
   Period: 2025-09-26 to 2025-10-03
   Fetching transactions from Plaid...
   ✅ Fetched 45 transactions
   Generating AI analysis for 7 day period...
   ✅ AI analysis generated
   Saving analysis to MongoDB...
   ✅ Analysis saved!
   Generating financial advice for 7 day period...
   ✅ Financial advice generated
   Saving advice to MongoDB...
   ✅ Advice saved!

   ✨ 7-day period completed successfully!

📊 Processing 30-day period
────────────────────────────────────────────────────────
   [... same process ...]

📊 Processing 60-day period
────────────────────────────────────────────────────────
   [... same process ...]

══════════════════════════════════════════════════════════
📈 FINAL SUMMARY
══════════════════════════════════════════════════════════

✅ Total Analyses Created: 3
✅ Total Advice Created: 3
👤 User: gautam222000@gmail.com

🎉 AI Data Generation Complete!
```

---

## 📊 What Gets Created

### For Each Period (7, 30, 60 days):

#### 1. Analysis Document (in `analyses` collection)

```javascript
{
  userId: ObjectId,
  analysisDate: "2025-10-03T...",
  period: {
    startDate: "2025-09-26",
    endDate: "2025-10-03"
  },
  transactions: {
    count: 45,
    totalSpent: 1234.56,
    totalIncome: 3000.00
  },
  aiAnalysis: {
    transaction_count: 45,
    analysis_period: "7 days",
    total_spent: 1234.56,
    total_income: 3000.00,
    net_cash_flow: 1765.44,
    top_categories: [
      { category: "Food and Drink", amount: 450.23 },
      { category: "Transportation", amount: 200.00 }
    ],
    ai_insights: "**DETAILED AI ANALYSIS FROM AZURE OPENAI**

      1. Spending Pattern Insights:
         - Your spending shows a consistent pattern...

      2. Unusual Spending:
         - Higher than average restaurant expenses...

      3. Savings Opportunities:
         - Reduce dining out by 20% could save $90/month...

      4. Budget Recommendations:
         - Allocate $400/month for groceries...

      5. Financial Health Score: 7.5/10

      6. Actionable Advice:
         - Start meal prepping on Sundays...
         - Use budgeting app to track spending...",
    raw_transactions: [...]
  },
  rawTransactions: [...],  // Full Plaid transaction data
  accountsSnapshot: [...]   // Account balances
}
```

#### 2. Advice Document (in `advice` collection)

```javascript
{
  userId: ObjectId,
  question: "Based on my 7-day spending pattern, how can I reduce expenses in Food and Drink?",
  advice: {
    question: "...",
    advice: "**PERSONALIZED ADVICE FROM AZURE OPENAI**

      Based on your 7-day analysis showing $450.23 spent on Food and Drink:

      Immediate Actions:
      1. Meal Planning
         - Dedicate 30 minutes each Sunday...
         - Expected savings: $80-100/month

      2. Coffee Strategy
         - Reduce Starbucks visits from 5x to 2x per week...
         - Expected savings: $60/month

      3. Grocery Shopping
         - Shop at discount grocers instead of Whole Foods...
         - Expected savings: $120/month

      Long-term Strategies:
      - Learn 5 quick recipes...
      - Use meal prep containers...

      Total Expected Monthly Savings: $260-280",
    has_financial_context: true
  },
  createdAt: "2025-10-03T...",
  expiresAt: "2025-11-02T..."  // 30 days expiration
}
```

---

## 🎨 What the AI Analyzes

### For Spending Analysis:

1. **Spending Patterns** - Identifies trends and habits
2. **Category Breakdown** - Shows where money goes
3. **Unusual Activity** - Flags unexpected purchases
4. **Savings Opportunities** - Specific areas to cut back
5. **Budget Recommendations** - Realistic budget suggestions
6. **Financial Health Score** - Overall financial wellness (1-10)
7. **Actionable Advice** - Specific steps to improve

### For Financial Advice:

1. **Context-Aware** - Uses real transaction data
2. **Immediate Actions** - Things to do right away
3. **Long-term Strategies** - Sustainable changes
4. **Savings Estimates** - Expected dollar amounts
5. **Budget Tips** - Practical money management
6. **Encouraging Tone** - Motivational and supportive

---

## 🔍 Verify the Results

### Option 1: MongoDB Atlas

1. Go to https://cloud.mongodb.com/
2. Browse Collections → `benchwise` database
3. Check:
   - **analyses** collection → Should have 3 documents (7, 30, 60 days)
   - **advice** collection → Should have 3 documents (7, 30, 60 days)

### Option 2: View Script

```bash
cd server
node src/scripts/viewCollections.js
```

Should show:
```
📊 ANALYSES (AI Transaction Analysis):
1. User: gautam222000@gmail.com
   Period: 2025-09-26 to 2025-10-03 (7 days)
   Transactions: 45
   Total Spent: $1234.56

2. User: gautam222000@gmail.com
   Period: 2025-09-04 to 2025-10-03 (30 days)
   Transactions: 120
   Total Spent: $3456.78

3. User: gautam222000@gmail.com
   Period: 2025-08-04 to 2025-10-03 (60 days)
   Transactions: 250
   Total Spent: $6789.01

💡 ADVICE (Personalized Financial Advice):
1. User: gautam222000@gmail.com
   Question: Based on my 7-day spending pattern...
   [AI-generated advice]

[...same for 30 and 60 days...]
```

---

## 🐛 Troubleshooting

### Error: "No Plaid integration found"

**Solution:** Connect a bank account via Plaid Link first

### Error: "Azure OpenAI authentication failed"

**Solution:** Check your Azure credentials in `.env`:
- Verify `AZURE_OPENAI_API_KEY` is correct
- Ensure `AZURE_OPENAI_ENDPOINT` ends with `/`
- Confirm `AZURE_OPENAI_DEPLOYMENT` matches your deployment name

### Error: "No transactions found"

**Solution:** In sandbox mode, Plaid might not have transaction history. The script will skip empty periods and continue.

### Error: "Rate limit exceeded"

**Solution:** Azure OpenAI has rate limits. Wait a few minutes and try again, or reduce the number of periods.

---

## 🔄 Re-running the Script

**Note:** Running the script multiple times will create **duplicate** documents.

To start fresh:

```bash
# Delete existing analyses and advice
cd server
node -e "
const mongoose = require('mongoose');
require('dotenv').config();
(async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  const Analysis = require('./src/Models/Analysis');
  const Advice = require('./src/Models/Advice');
  await Analysis.deleteMany({});
  await Advice.deleteMany({});
  console.log('✅ Deleted all analyses and advice');
  await mongoose.connection.close();
})();
"

# Then run the generation script again
node src/scripts/generateAIData.js
```

---

## 📱 Frontend Display

After running this script, your frontend dashboard will show:

1. **View Transactions** widget - Real transaction data from Plaid
2. **Analyze Spending** widget - AI-powered insights from Azure OpenAI
3. Dropdown to switch between 7, 30, 60 day periods
4. All data fetched from MongoDB

---

## 💡 Cost Considerations

**Azure OpenAI Usage:**
- 3 periods × 2 AI calls (analysis + advice) = **6 API calls** per run
- Each call uses ~500-1000 tokens
- Total: ~6,000 tokens per full run
- Cost: Approximately $0.10-0.20 per run (GPT-4) or $0.01-0.02 (GPT-3.5)

---

## ✅ Summary

This script provides:
- ✅ **Real transaction data** from Plaid
- ✅ **AI-powered analysis** from Azure OpenAI
- ✅ **Personalized advice** based on spending patterns
- ✅ **3 time periods** (7, 30, 60 days)
- ✅ **6 total documents** in MongoDB (3 analyses + 3 advice)
- ✅ **Ready for frontend display**

**You're all set! Just add your Azure OpenAI credentials and run the script!** 🚀
