# BenchWise AI Integration Setup Instructions

## Current Status

✅ **Completed:**
- Node.js API endpoints for analysis (`/api/v1/analysis/period`)
- Python FastAPI service with AI integration endpoints
- Frontend components updated to fetch and display analysis
- MongoDB models for Analysis and Advice
- Integration structure supports both old and new formats

⚠️ **Action Required:**

## Step 1: Fix Azure OpenAI Credentials

Your Azure OpenAI credentials are not configured. Update `services/.env`:

```env
# Replace these with your actual Azure OpenAI credentials:
AZURE_OPENAI_API_KEY=your-actual-azure-key
AZURE_OPENAI_ENDPOINT=https://your-actual-resource.openai.azure.com/
AZURE_OPENAI_DEPLOYMENT=gpt-4
```

To get these credentials:
1. Go to https://portal.azure.com
2. Navigate to your Azure OpenAI resource
3. Copy the API key and endpoint
4. Update the `.env` file in the `services/` directory

## Step 2: Reconnect Your Bank Account

Your current Plaid access token is **invalid/expired**. You need to:

1. **Start your frontend:**
   ```bash
   cd client
   npm start
   ```

2. **Log in** to your account (gautam222000@gmail.com)

3. **Reconnect your bank** by clicking "Connect Another Bank" or the reconnect button

4. **Complete the Plaid Link flow** - this will generate a fresh access token

## Step 3: Start the Python AI Service

```bash
cd services
python api.py
```

You should see:
```
INFO:     Uvicorn running on http://0.0.0.0:8000
```

## Step 4: Start the Node.js Backend

```bash
cd server
npm run dev
```

You should see:
```
Server is running on port 5000
MongoDB connected successfully
```

## Step 5: Test the Complete Flow

1. **Open your frontend** (http://localhost:3000)
2. **Log in** with your account
3. **Navigate to Financial Overview**
4. **Look at the "Analyze Spending" section**
5. **Select a period** (7, 30, or 60 days) from the dropdown

The system will:
1. Frontend calls Node.js API: `GET /api/v1/analysis/period?days=30`
2. Node.js calls Python FastAPI: `POST /api/v1/analyze/period`
3. Python FastAPI:
   - Fetches transactions from Plaid
   - Sends to Azure OpenAI for analysis
   - Returns structured JSON
4. Node.js saves to MongoDB (Analysis & Advice tables)
5. Frontend displays the analysis

## Data Flow

```
User → React Component
        ↓
    Node.js API (/api/v1/analysis/period)
        ↓
    Get access token from MongoDB Integration
        ↓
    Python FastAPI (/api/v1/analyze/period)
        ↓
    Plaid API (fetch transactions)
        ↓
    Azure OpenAI (analyze with AI)
        ↓
    Return structured analysis
        ↓
    Node.js saves to MongoDB (Analysis + Advice)
        ↓
    Frontend displays data
```

## Troubleshooting

### Error: "AI service unavailable"
- Make sure Python FastAPI service is running on port 8000
- Check `services/api.py` is running

### Error: "Invalid access token" or "INVALID_ACCESS_TOKEN"
- Your Plaid access token expired
- Reconnect your bank account through the frontend

### Error: "No data available"
- Check if Python service is running
- Check Azure OpenAI credentials are correct
- Check MongoDB connection
- Check browser console for errors

### Analysis/Advice tables are empty
- Make sure you successfully reconnected your bank
- Make sure Python service is running
- Try selecting a different period from the dropdown
- Check backend logs for errors

## Verify Everything Works

After completing the setup:

1. **Check MongoDB:**
   ```bash
   cd server
   node src/scripts/viewCollections.js
   ```
   You should see:
   - User with email gautam222000@gmail.com
   - Integration with a valid access token
   - Analysis documents (after triggering the analysis)
   - Advice documents (after triggering the analysis)

2. **Check Python Service:**
   ```bash
   curl http://localhost:8000/health
   ```
   Should return healthy status

3. **Check Node.js API:**
   ```bash
   curl http://localhost:5000/api/health
   ```
   Should return OK status

## Current Architecture

**Files Modified/Created:**
- ✅ `server/src/Controllers/v1/aiAnalysisController.js` - Added `getAnalysisByPeriod`
- ✅ `server/src/Routes/v1/aiAnalysisRoutes.js` - Added route for `/period`
- ✅ `server/src/Models/Integration.js` - Supports both old and new structures
- ✅ `services/api.py` - Added `/api/v1/analyze/period` endpoint
- ✅ `client/src/services/api.js` - Added `analysisAPI.getAnalysisByPeriod`
- ✅ `client/src/components/FinancialOverview.js` - Fetches and displays analysis

## Next Steps

Once you've completed the setup above:
1. The system will automatically populate Analysis and Advice tables when users view the Analyze Spending section
2. Data is cached for 24 hours to reduce API calls
3. Users can select different periods (7, 30, 60 days) to see different analyses
