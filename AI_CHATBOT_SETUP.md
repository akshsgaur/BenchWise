# AI Chatbot Setup Guide

## Overview

You now have an AI-powered financial chatbot integrated into BenchWise! The chatbot uses the **insight_agent_service** pattern with agentic AI to autonomously answer user questions about their finances.

## Architecture

```
React Frontend (AIAdvisor component)
         ↓
Node.js Backend (aiAdvisorController.js)
         ↓
Python FastAPI (chatbot_service.py on port 8001)
         ↓
InsightAgentService (uses Azure OpenAI + MongoDB)
```

## Setup Instructions

### 1. Environment Variables

Make sure your `services/.env` file has:

```bash
# MongoDB
MONGODB_URI=mongodb://localhost:27017
MONGODB_DB_NAME=benchwise

# Azure OpenAI
AZURE_OPENAI_API_KEY=your-key-here
ENDPOINT_URL=https://your-resource.openai.azure.com/
DEPLOYMENT_NAME=gpt-4.1
```

And your `server/.env` file has:

```bash
# Python AI Service URL
PYTHON_AI_SERVICE_URL=http://localhost:8001
```

### 2. Start the Services

**Terminal 1 - Python Chatbot Service:**
```bash
cd services
python chatbot_service.py
```

The chatbot service will start on **http://localhost:8001**

**Terminal 2 - Node.js Backend:**
```bash
cd server
npm start
```

The Node.js server will start on **http://localhost:5000**

**Terminal 3 - React Frontend:**
```bash
cd client
npm start
```

The React app will start on **http://localhost:3000**

### 3. Access the Chatbot

1. Log in to BenchWise
2. Navigate to **Dashboard**
3. Click the **"AI Advisor"** tab
4. Start chatting with your AI financial advisor!

## Features

The AI chatbot can:

- ✅ **Analyze account balances** - Get current assets, debt, and net worth
- ✅ **Track income and spending** - See cashflow and savings rate
- ✅ **Break down spending by category** - Identify top spending areas
- ✅ **Find recurring subscriptions** - Detect zombie subscriptions
- ✅ **Identify unusual transactions** - Flag anomalies and large purchases
- ✅ **Project savings goals** - Calculate timeline to reach financial targets

## Example Questions

Try asking:

- "How much am I spending on subscriptions?"
- "What's my savings rate?"
- "Can I save $10,000 in a year?"
- "What are my biggest spending categories?"
- "Show me my unusual transactions"
- "What's my net worth?"
- "How much debt do I have?"

## How It Works

1. **User asks a question** in the React chatbot UI
2. **Node.js backend** proxies the request to Python service
3. **Python chatbot_service.py** initializes the agentic workflow
4. **AI agent** autonomously decides which tools to call:
   - get_account_balances
   - get_income_and_spending
   - get_spending_by_category
   - get_recurring_subscriptions
   - get_unusual_transactions
   - calculate_savings_goal_timeline
5. **Tools fetch real data** from MongoDB via InsightDataRepository
6. **AI synthesizes response** with summary, metrics, insights, and recommendations
7. **React UI displays** the structured response in a beautiful chat interface

## Files Created

### Frontend:
- `client/src/components/AIAdvisor.js` - Chat UI component
- `client/src/components/AIAdvisor.css` - Styling
- `client/src/components/Dashboard.js` - Added AI Advisor tab
- `client/src/services/api.js` - Added aiAdvisorAPI

### Backend:
- `server/src/Controllers/aiAdvisorController.js` - Proxy to Python service
- `server/src/Routes/aiAdvisorRoutes.js` - Express routes
- `server/src/index.js` - Registered routes

### Python Service:
- `services/chatbot_service.py` - FastAPI chatbot service with agentic AI

## Troubleshooting

### "AI service is currently unavailable"

**Solution:** Make sure the Python chatbot service is running:
```bash
cd services
python chatbot_service.py
```

### "OpenAI service is not configured"

**Solution:** Check your `services/.env` file has correct Azure OpenAI credentials.

### No data returned

**Solution:** Make sure you've connected your bank account and have transactions in MongoDB.

## Next Steps

- Add chat history storage in MongoDB
- Implement streaming responses for real-time typing
- Add voice input/output
- Create pre-built financial analysis templates
- Add multi-language support

## Testing

Test the complete flow:

```bash
# 1. Start Python service
cd services && python chatbot_service.py

# 2. In another terminal, test the endpoint
curl http://localhost:8001/health

# 3. Start Node.js server
cd server && npm start

# 4. Start React app
cd client && npm start

# 5. Open browser to http://localhost:3000
# 6. Navigate to Dashboard > AI Advisor
# 7. Ask: "What's my spending this month?"
```

## Support

If you encounter issues:

1. Check all services are running
2. Verify environment variables are set
3. Check MongoDB connection
4. Review console logs for errors
5. Ensure you have connected bank accounts with transaction data

---

**Built with ❤️ using Azure OpenAI, FastAPI, React, and MongoDB**
