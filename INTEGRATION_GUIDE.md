# BenchWise AI Integration Guide

Complete integration of Plaid + Azure OpenAI + Node.js + MongoDB

## Architecture

```
User Request → Node.js API → Python FastAPI → Plaid API
                ↓                    ↓
            MongoDB ← AI Analysis ← Azure OpenAI
```

---

## Prerequisites

- **Python 3.8+** installed
- **Node.js 14+** and npm
- **MongoDB** (local or Atlas)
- **Plaid account** (sandbox credentials)
- **Azure OpenAI** account and API key

---

## Setup Instructions

### 1. Python AI Service Setup

Navigate to the services directory:

```bash
cd services
```

#### Install Dependencies

```bash
pip install -r requirements.txt
```

#### Configure Environment Variables

Create a `.env` file in the `services` directory:

```env
# Plaid Configuration
PLAID_CLIENT_ID=6827e23aecb61e00241e6d64
PLAID_SECRET=00a7ea202002871c639076a234658c
PLAID_ENV=sandbox

# Azure OpenAI Configuration
AZURE_OPENAI_API_KEY=your-azure-openai-api-key
ENDPOINT_URL=https://your-resource.openai.azure.com/
DEPLOYMENT_NAME=gpt-4.1

# API Security
BENCHWISE_AI_API_KEY=benchwise-ai-secret-key-change-in-production
```

#### Start Python AI Service

```bash
python api.py
```

The service will start on **http://localhost:8000**

Verify it's running:
```bash
curl http://localhost:8000/health
```

---

### 2. Node.js Backend Setup

Navigate to the server directory:

```bash
cd ../server
```

#### Install Dependencies

```bash
npm install
```

If you need to add axios:
```bash
npm install axios
```

#### Configure Environment Variables

Your `.env` file should already have the AI service configuration added. Ensure these lines exist:

```env
# AI Service Configuration
AI_SERVICE_URL=http://localhost:8000
BENCHWISE_AI_API_KEY=benchwise-ai-secret-key-change-in-production
```

#### Start Node.js Server

```bash
npm run dev
```

The server will start on **http://localhost:5001**

---

## API Endpoints

All endpoints require authentication (Bearer token in `Authorization` header).

### 1. Get Monthly Analysis

**Endpoint:** `GET /api/v1/analysis/monthly`

**Query Parameters:**
- `month`: Month number (1-12)
- `year`: Year (e.g., 2025)

**Example:**
```bash
curl -X GET "http://localhost:5001/api/v1/analysis/monthly?month=10&year=2025" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response:**
```json
{
  "success": true,
  "analysis": {
    "user_id": "...",
    "analysis_date": "2025-10-03T...",
    "period": {
      "start_date": "2025-10-01",
      "end_date": "2025-10-31"
    },
    "transactions": {
      "count": 45,
      "total_spent": 1234.56,
      "total_income": 3000.00
    },
    "ai_analysis": {
      "transaction_count": 45,
      "analysis_period": "...",
      "ai_insights": "..."
    }
  },
  "message": "Monthly analysis completed and saved"
}
```

---

### 2. Get Personalized Financial Advice

**Endpoint:** `POST /api/v1/analysis/advice`

**Body:**
```json
{
  "question": "How can I reduce my spending on transportation?"
}
```

**Example:**
```bash
curl -X POST http://localhost:5001/api/v1/analysis/advice \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"question":"How can I save more money each month?"}'
```

**Response:**
```json
{
  "success": true,
  "advice": {
    "question": "How can I save more money each month?",
    "advice": "Based on your recent transactions...",
    "has_financial_context": true
  },
  "message": "Financial advice generated successfully"
}
```

---

### 3. Get Historical Analyses

**Endpoint:** `GET /api/v1/analysis/history`

**Query Parameters:**
- `limit`: Number of analyses to retrieve (default: 12)

**Example:**
```bash
curl -X GET "http://localhost:5001/api/v1/analysis/history?limit=6" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response:**
```json
{
  "success": true,
  "count": 6,
  "analyses": [
    {
      "user_id": "...",
      "analysis_date": "...",
      "period": {...},
      "transactions": {...},
      "ai_analysis": {...}
    }
  ],
  "message": "Historical analyses retrieved successfully"
}
```

---

### 4. Get Batch Insights

**Endpoint:** `GET /api/v1/analysis/insights`

**Query Parameters:**
- `startDate`: Start date (YYYY-MM-DD)
- `endDate`: End date (YYYY-MM-DD)

**Example:**
```bash
curl -X GET "http://localhost:5001/api/v1/analysis/insights?startDate=2025-09-01&endDate=2025-10-03" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response:**
```json
{
  "success": true,
  "insights": {
    "user_id": "...",
    "period": {...},
    "financial_summary": {
      "total_liquid_assets": 5000.00,
      "total_debt": 1500.00,
      "net_worth": 3500.00,
      "debt_to_asset_ratio": 30.0
    },
    "spending_analysis": {
      "total_spent": 2345.67,
      "transaction_count": 78,
      "top_categories": [...]
    },
    "accounts_breakdown": [...]
  },
  "message": "Batch insights generated successfully"
}
```

---

## Testing the Integration

### 1. First, authenticate and get a user token:

```bash
# Register a new user
curl -X POST http://localhost:5001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123"
  }'

# Login
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'

# Save the token from the response
export TOKEN="your-jwt-token-here"
```

### 2. Connect Plaid Account (if not already connected)

Use your existing Plaid integration endpoints to connect a bank account.

### 3. Test AI Analysis Endpoints

```bash
# Get monthly analysis
curl -X GET "http://localhost:5001/api/v1/analysis/monthly?month=10&year=2025" \
  -H "Authorization: Bearer $TOKEN"

# Get personalized advice
curl -X POST http://localhost:5001/api/v1/analysis/advice \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"question":"What are my biggest expenses?"}'

# Get historical analyses
curl -X GET "http://localhost:5001/api/v1/analysis/history?limit=5" \
  -H "Authorization: Bearer $TOKEN"

# Get batch insights
curl -X GET "http://localhost:5001/api/v1/analysis/insights?startDate=2025-09-01&endDate=2025-10-03" \
  -H "Authorization: Bearer $TOKEN"
```

---

## Database Models

### Analysis Collection

Stores AI-powered transaction analyses:

```javascript
{
  userId: ObjectId,
  analysisDate: Date,
  period: {
    startDate: String,
    endDate: String
  },
  transactions: {
    count: Number,
    totalSpent: Number,
    totalIncome: Number
  },
  aiAnalysis: Mixed,
  rawTransactions: [Mixed],
  accountsSnapshot: [Mixed],
  createdAt: Date (auto-expires after 90 days)
}
```

### Advice Collection

Stores personalized financial advice:

```javascript
{
  userId: ObjectId,
  question: String,
  advice: Mixed,
  createdAt: Date,
  expiresAt: Date (auto-expires after 30 days)
}
```

---

## Error Handling

All endpoints return consistent error responses:

```json
{
  "error": "Error type",
  "message": "Detailed error message"
}
```

Common error codes:
- **400**: Missing required parameters
- **403**: Invalid API key
- **404**: No bank integration found
- **500**: Internal server error

---

## Production Deployment

### Environment Variables to Update

**Python Service:**
- `AZURE_OPENAI_API_KEY`: Your production Azure key
- `ENDPOINT_URL`: Your production Azure endpoint
- `BENCHWISE_AI_API_KEY`: Generate a strong random key
- `PLAID_ENV`: Change to `production`
- `PLAID_SECRET`: Use production secret

**Node.js Service:**
- `AI_SERVICE_URL`: URL of deployed Python service
- `BENCHWISE_AI_API_KEY`: Same as Python service
- `MONGODB_URI`: Production MongoDB connection string
- `PLAID_ENV`: Change to `production`

### Docker Deployment

A `docker-compose.yml` can be created to run both services together.

---

## Troubleshooting

### Python Service Issues

**Issue:** Module not found errors
```bash
pip install -r requirements.txt
```

**Issue:** Azure OpenAI connection fails
- Verify `AZURE_OPENAI_API_KEY` and `ENDPOINT_URL`
- Check deployment name matches

**Issue:** Plaid API errors
- Verify Plaid credentials are correct
- Ensure environment is set to `sandbox` for testing

### Node.js Service Issues

**Issue:** Cannot connect to Python service
- Ensure Python service is running on port 8000
- Check `AI_SERVICE_URL` in `.env`

**Issue:** Authentication errors
- Verify JWT token is being sent in Authorization header
- Check token hasn't expired

**Issue:** No bank integration found
- User must connect their bank account via Plaid first
- Check Integration collection in MongoDB

---

## Next Steps

1. **Frontend Integration**: Create UI components to call these APIs
2. **Caching**: Implement Redis caching for frequently accessed analyses
3. **Webhooks**: Set up Plaid webhooks for real-time updates
4. **Notifications**: Add email/push notifications for insights
5. **Scheduling**: Create cron jobs for automatic monthly analyses
6. **Analytics**: Track usage metrics and user engagement

---

## Support

For issues or questions:
- Check server logs for both Python and Node.js services
- Verify all environment variables are set correctly
- Ensure MongoDB connection is stable
- Test Plaid and Azure OpenAI credentials independently

---

## File Structure

```
BenchWise/
├── services/                      # Python AI Service
│   ├── api.py                    # FastAPI application
│   ├── plaid_ai_service.py       # Plaid + AI logic
│   ├── requirements.txt          # Python dependencies
│   ├── .env                      # Python environment variables
│   └── .env.example              # Example environment file
│
└── server/                        # Node.js Backend
    ├── src/
    │   ├── Controllers/
    │   │   └── v1/
    │   │       └── aiAnalysisController.js
    │   ├── Models/
    │   │   ├── Analysis.js
    │   │   ├── Advice.js
    │   │   ├── Integration.js
    │   │   └── User.js
    │   ├── Routes/
    │   │   └── v1/
    │   │       └── aiAnalysisRoutes.js
    │   └── index.js              # Main server file
    ├── .env                       # Node.js environment variables
    ├── .env.example               # Example environment file
    └── package.json
```

---

**Integration Complete! 🚀**

Both services are now ready to work together to provide AI-powered financial insights.
