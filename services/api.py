from fastapi import FastAPI, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List, Dict
from datetime import datetime, timedelta
import os
from plaid_ai_service import PlaidAIService

app = FastAPI(title="BenchWise AI Service", version="1.0.0")

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your Node.js server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize service
ai_service = PlaidAIService()

# API Key validation
API_KEY = os.getenv('BENCHWISE_AI_API_KEY', 'benchwise-ai-secret-key')

def verify_api_key(x_api_key: str = Header(...)):
    if x_api_key != API_KEY:
        raise HTTPException(status_code=403, detail="Invalid API Key")
    return x_api_key

# Request/Response Models
class AnalyzeTransactionsRequest(BaseModel):
    access_token: str
    start_date: str  # YYYY-MM-DD
    end_date: str    # YYYY-MM-DD
    user_id: str

class FinancialAdviceRequest(BaseModel):
    access_token: str
    question: str
    user_id: str

class TransactionAnalysis(BaseModel):
    user_id: str
    analysis_date: str
    total_spent: float
    total_income: float
    net_cash_flow: float
    top_spending_categories: List[Dict]
    spending_trend: str
    recommendations: List[str]
    risk_alerts: List[Dict]
    metadata: Dict

# Health check
@app.get("/health")
def health_check():
    creds = ai_service.check_credentials()
    return {
        "status": "healthy",
        "service": "BenchWise AI",
        "credentials": creds,
        "timestamp": datetime.now().isoformat()
    }

# Analyze monthly transactions
@app.post("/api/v1/analyze/monthly")
def analyze_monthly_transactions(
    request: AnalyzeTransactionsRequest,
    api_key: str = Header(..., alias="X-API-Key")
):
    try:
        verify_api_key(api_key)

        # Get transactions from Plaid
        transactions_data = ai_service.get_transactions(
            access_token=request.access_token,
            start_date=request.start_date,
            end_date=request.end_date
        )

        # Analyze spending patterns
        analysis = ai_service.analyze_spending_patterns(
            access_token=request.access_token,
            days=30
        )

        # Structure the response for MongoDB
        structured_analysis = {
            "user_id": request.user_id,
            "analysis_date": datetime.now().isoformat(),
            "period": {
                "start_date": request.start_date,
                "end_date": request.end_date
            },
            "transactions": {
                "count": len(transactions_data.get('transactions', [])),
                "total_spent": sum(
                    t['amount'] for t in transactions_data.get('transactions', [])
                    if t['amount'] > 0
                ),
                "total_income": abs(sum(
                    t['amount'] for t in transactions_data.get('transactions', [])
                    if t['amount'] < 0
                )),
            },
            "ai_analysis": analysis,
            "raw_transactions": transactions_data.get('transactions', []),
            "accounts_snapshot": transactions_data.get('accounts', []),
            "created_at": datetime.now().isoformat()
        }

        return {
            "success": True,
            "data": structured_analysis,
            "message": "Monthly analysis completed successfully"
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Get personalized financial advice
@app.post("/api/v1/advice/personalized")
def get_personalized_advice(
    request: FinancialAdviceRequest,
    api_key: str = Header(..., alias="X-API-Key")
):
    try:
        verify_api_key(api_key)

        # Get financial advice with context
        advice = ai_service.get_financial_advice(
            question=request.question,
            access_token=request.access_token
        )

        # Structure for MongoDB
        structured_advice = {
            "user_id": request.user_id,
            "question": request.question,
            "advice": advice,
            "created_at": datetime.now().isoformat(),
            "expires_at": (datetime.now() + timedelta(days=30)).isoformat()
        }

        return {
            "success": True,
            "data": structured_advice,
            "message": "Financial advice generated successfully"
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Batch process transactions for insights
@app.post("/api/v1/insights/batch")
def batch_process_insights(
    request: AnalyzeTransactionsRequest,
    api_key: str = Header(..., alias="X-API-Key")
):
    try:
        verify_api_key(api_key)

        # Get accounts
        accounts = ai_service.get_accounts(request.access_token)

        # Get transactions
        transactions = ai_service.get_transactions(
            access_token=request.access_token,
            start_date=request.start_date,
            end_date=request.end_date
        )

        # Categorize spending
        spending_by_category = {}
        for transaction in transactions.get('transactions', []):
            if transaction['amount'] > 0:  # Expenses only
                merchant = transaction.get('merchant_name') or transaction.get('name', 'Unknown')
                category = transaction.get('category', ['Uncategorized'])[0] if transaction.get('category') else 'Uncategorized'

                if category not in spending_by_category:
                    spending_by_category[category] = {
                        'total': 0,
                        'count': 0,
                        'transactions': []
                    }

                spending_by_category[category]['total'] += transaction['amount']
                spending_by_category[category]['count'] += 1
                spending_by_category[category]['transactions'].append({
                    'merchant': merchant,
                    'amount': transaction['amount'],
                    'date': str(transaction['date'])
                })

        # Sort categories by spending
        top_categories = sorted(
            spending_by_category.items(),
            key=lambda x: x[1]['total'],
            reverse=True
        )[:5]

        # Calculate metrics
        total_balance = sum(
            acc['balances']['current']
            for acc in accounts.get('accounts', [])
            if acc['type'] == 'depository'
        )

        total_debt = sum(
            acc['balances']['current']
            for acc in accounts.get('accounts', [])
            if acc['type'] in ['credit', 'loan']
        )

        insights = {
            "user_id": request.user_id,
            "period": {
                "start_date": request.start_date,
                "end_date": request.end_date
            },
            "financial_summary": {
                "total_liquid_assets": total_balance,
                "total_debt": total_debt,
                "net_worth": total_balance - total_debt,
                "debt_to_asset_ratio": (total_debt / total_balance * 100) if total_balance > 0 else 0
            },
            "spending_analysis": {
                "total_spent": sum(cat[1]['total'] for cat in top_categories),
                "transaction_count": len(transactions.get('transactions', [])),
                "top_categories": [
                    {
                        "category": cat[0],
                        "total": cat[1]['total'],
                        "count": cat[1]['count'],
                        "average_per_transaction": cat[1]['total'] / cat[1]['count']
                    }
                    for cat in top_categories
                ]
            },
            "accounts_breakdown": [
                {
                    "name": acc['name'],
                    "type": acc['type'],
                    "subtype": acc['subtype'],
                    "balance": acc['balances']['current'],
                    "mask": acc['mask']
                }
                for acc in accounts.get('accounts', [])
            ],
            "created_at": datetime.now().isoformat()
        }

        return {
            "success": True,
            "data": insights,
            "message": "Batch insights generated successfully"
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
