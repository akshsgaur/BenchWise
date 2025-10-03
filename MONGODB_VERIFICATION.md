# MongoDB Schema Verification Guide

## ✅ Schemas Successfully Created!

Your new database schemas have been pushed to MongoDB and are ready to use.

---

## 📊 Collections in MongoDB

Based on the verification script, your MongoDB database now has these collections:

### Existing Collections:
1. **users** - User accounts (4 documents)
2. **integrations** - Plaid integrations (1 document)

### 🆕 New AI Analysis Collections:
3. **analyses** - AI-powered transaction analyses (0 documents - ready for data)
4. **advice** - Personalized financial advice (0 documents - ready for data)

---

## 🔍 View Your Collections in MongoDB

### Option 1: MongoDB Atlas (Web Interface)

1. Go to [MongoDB Atlas](https://cloud.mongodb.com/)
2. Sign in with your credentials
3. Navigate to your cluster: **benchwisecluster**
4. Click **"Browse Collections"**
5. Select database: **benchwise**
6. You should see all 4 collections:
   - ✅ users
   - ✅ integrations
   - ✅ **analyses** (NEW)
   - ✅ **advice** (NEW)

### Option 2: MongoDB Compass (Desktop App)

1. Download [MongoDB Compass](https://www.mongodb.com/products/compass)
2. Connect using your connection string:
   ```
   mongodb+srv://gautam:1234@benchwisecluster.osuhtnq.mongodb.net/benchwise
   ```
3. Navigate to database: **benchwise**
4. View all collections and their schemas

### Option 3: Command Line (mongosh)

```bash
# Install MongoDB Shell
brew install mongosh

# Connect to your database
mongosh "mongodb+srv://gautam:1234@benchwisecluster.osuhtnq.mongodb.net/benchwise"

# List all collections
show collections

# View analysis schema
db.analyses.findOne()

# View advice schema
db.advice.findOne()
```

---

## 📋 Schema Details

### Analysis Collection

**Purpose:** Stores AI-powered monthly transaction analyses

**Schema:**
```javascript
{
  userId: ObjectId,              // Reference to User
  analysisDate: Date,            // When analysis was performed
  period: {
    startDate: String,           // Analysis period start (YYYY-MM-DD)
    endDate: String              // Analysis period end (YYYY-MM-DD)
  },
  transactions: {
    count: Number,               // Number of transactions
    totalSpent: Number,          // Total spending
    totalIncome: Number          // Total income
  },
  aiAnalysis: {                  // AI-generated insights
    transaction_count: Number,
    analysis_period: String,
    ai_insights: String,         // OpenAI analysis
    raw_transactions: Array
  },
  rawTransactions: Array,        // Full transaction data
  accountsSnapshot: Array,       // Account balances
  createdAt: Date,              // Auto-generated timestamp
  updatedAt: Date               // Auto-generated timestamp
}
```

**Indexes:**
- `userId` (ascending)
- `createdAt` (ascending, TTL: 90 days - auto-deletes old data)
- `userId + analysisDate` (compound index for efficient queries)

**Auto-Expiration:** Documents automatically delete after 90 days

---

### Advice Collection

**Purpose:** Stores personalized financial advice from AI

**Schema:**
```javascript
{
  userId: ObjectId,              // Reference to User
  question: String,              // User's financial question
  advice: {                      // AI-generated advice
    question: String,
    advice: String,              // OpenAI response
    has_financial_context: Boolean
  },
  createdAt: Date,              // Auto-generated timestamp
  updatedAt: Date,              // Auto-generated timestamp
  expiresAt: Date               // When this advice expires
}
```

**Indexes:**
- `userId` (ascending)
- `expiresAt` (ascending, TTL - auto-deletes expired advice)

**Auto-Expiration:** Documents automatically delete based on `expiresAt` field (default: 30 days)

---

## 🧪 Populate Collections with Sample Data

Since both new collections are currently empty (0 documents), here's how to add data:

### Method 1: Use the API Endpoints

You already have a Plaid integration. Now you can call the AI analysis endpoints:

#### 1. Get your authentication token:

```bash
# Login (you already have a user account)
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "your-email@example.com",
    "password": "your-password"
  }'

# Save the token
export TOKEN="paste-your-jwt-token-here"
```

#### 2. Start the Python AI service:

```bash
cd services
python api.py
```

This will start on http://localhost:8000

#### 3. Generate Monthly Analysis:

```bash
curl -X GET "http://localhost:5001/api/v1/analysis/monthly?month=10&year=2025" \
  -H "Authorization: Bearer $TOKEN"
```

This will:
- Fetch transactions from Plaid
- Analyze them with Azure OpenAI
- Save results to **analyses** collection
- Return the analysis

#### 4. Get Personalized Advice:

```bash
curl -X POST http://localhost:5001/api/v1/analysis/advice \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "question": "How can I reduce my monthly spending?"
  }'
```

This will:
- Get your recent financial context from Plaid
- Ask Azure OpenAI for advice
- Save to **advice** collection
- Return the advice

---

## 🖥️ Verify Data in MongoDB

After calling the APIs above, check MongoDB:

### MongoDB Atlas:
1. Refresh the Collections view
2. Click on **analyses** → Should show 1 document
3. Click on **advice** → Should show 1 document
4. Click "View" to see the full document structure

### MongoDB Compass:
1. Refresh the database
2. Click **analyses** collection
3. See the analysis document with AI insights
4. Click **advice** collection
5. See the advice document with OpenAI response

---

## 📊 Monitor Collections in Real-Time

### Option 1: API Endpoint to View History

```bash
# Get all historical analyses
curl -X GET "http://localhost:5001/api/v1/analysis/history?limit=10" \
  -H "Authorization: Bearer $TOKEN"
```

### Option 2: Create a Simple Monitoring Script

```javascript
// server/src/scripts/viewCollections.js
const mongoose = require('mongoose');
require('dotenv').config();
const Analysis = require('../Models/Analysis');
const Advice = require('../Models/Advice');

async function viewData() {
  await mongoose.connect(process.env.MONGODB_URI);

  const analyses = await Analysis.find().sort({ createdAt: -1 }).limit(5);
  const advice = await Advice.find().sort({ createdAt: -1 }).limit(5);

  console.log('Recent Analyses:', JSON.stringify(analyses, null, 2));
  console.log('Recent Advice:', JSON.stringify(advice, null, 2));

  await mongoose.connection.close();
}

viewData();
```

Run with:
```bash
node src/scripts/viewCollections.js
```

---

## 🎯 Next Steps for Frontend

Now that the schemas are in MongoDB, you can:

### 1. Create Frontend Components

```typescript
// Example: Fetch monthly analysis
async function getMonthlyAnalysis(month: number, year: number) {
  const response = await fetch(
    `http://localhost:5001/api/v1/analysis/monthly?month=${month}&year=${year}`,
    {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    }
  );

  const data = await response.json();
  return data.analysis;
}

// Example: Get personalized advice
async function getFinancialAdvice(question: string) {
  const response = await fetch(
    'http://localhost:5001/api/v1/analysis/advice',
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ question })
    }
  );

  const data = await response.json();
  return data.advice;
}
```

### 2. Display AI Insights

Create UI components to show:
- Monthly spending analysis
- AI-generated insights
- Financial advice chat interface
- Historical analysis trends

### 3. Real-time Updates

Set up polling or WebSockets to:
- Show new analyses as they're generated
- Update when new advice is available
- Display progress indicators

---

## 🔧 Troubleshooting

### Collections not showing in MongoDB?

**Solution:** Make sure the Node.js server is running. Collections are created when models are first loaded.

```bash
cd server
npm run dev
```

### No data in collections?

**Solution:**
1. Ensure Python AI service is running (port 8000)
2. Call the API endpoints to generate data
3. Check that you have a Plaid integration connected

### Can't see new fields in MongoDB Atlas?

**Solution:**
1. Click "Refresh" in MongoDB Atlas
2. Wait a few seconds for the UI to update
3. Try clearing your browser cache

---

## 📝 Summary

✅ **analyses** collection created - Ready for AI transaction analyses
✅ **advice** collection created - Ready for financial advice
✅ Proper indexes configured for performance
✅ Auto-expiration (TTL) set up for data management
✅ All schemas registered with Mongoose

**Collections are live and ready to accept data!**

To populate them:
1. Start Python AI service: `cd services && python api.py`
2. Call API endpoints with your JWT token
3. View results in MongoDB Atlas or Compass

---

## 🎉 Success!

Your MongoDB schemas are now live and ready for the frontend to consume!

**Database:** benchwisecluster.osuhtnq.mongodb.net/benchwise
**Collections:** 4 total (2 new: analyses, advice)
**Status:** ✅ Ready for production use
