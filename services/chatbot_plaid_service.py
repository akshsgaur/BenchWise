"""
Hybrid Chatbot service that fetches from Plaid when MongoDB is empty.
"""

import json
import os
from datetime import datetime, timedelta
from typing import Any, Dict, List, Optional

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from openai import OpenAI
from plaid.api import plaid_api
from plaid.model.transactions_get_request import TransactionsGetRequest
from plaid.model.accounts_get_request import AccountsGetRequest
from plaid.model.products import Products
from plaid.model.sandbox_public_token_create_request import SandboxPublicTokenCreateRequest
from plaid.model.item_public_token_exchange_request import ItemPublicTokenExchangeRequest
from plaid.model.sandbox_item_fire_webhook_request import SandboxItemFireWebhookRequest
from plaid.model.webhook_type import WebhookType
from plaid import ApiClient, Configuration
import plaid
from bson import ObjectId
from pymongo import MongoClient

# Load environment variables from parent directory or current directory
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
PARENT_DIR = os.path.dirname(CURRENT_DIR)

# Try loading from multiple locations
env_paths = [
    os.path.join(CURRENT_DIR, '.env'),
    os.path.join(PARENT_DIR, '.env'),
    os.path.join(PARENT_DIR, 'server', '.env'),
]

env_loaded = False
for env_path in env_paths:
    if os.path.exists(env_path):
        load_dotenv(env_path, override=False)
        env_loaded = True
        break

if not env_loaded:
    load_dotenv()

app = FastAPI(title="BenchWise AI Chatbot", version="1.0.0")

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Plaid client
PLAID_CLIENT_ID = os.getenv('PLAID_CLIENT_ID')
PLAID_SECRET = os.getenv('PLAID_SECRET')
PLAID_ENV = os.getenv('PLAID_ENV', 'sandbox')


configuration = Configuration(
    host=plaid.Environment.Sandbox if PLAID_ENV == 'sandbox' else plaid.Environment.Production,
    api_key={
        'clientId': PLAID_CLIENT_ID,
        'secret': PLAID_SECRET,
    }
)
api_client = ApiClient(configuration)
plaid_client = plaid_api.PlaidApi(api_client)

# MongoDB connection
MONGODB_URI = os.getenv('MONGODB_URI')
MONGODB_DB_NAME = os.getenv('MONGODB_DB_NAME', 'benchwise')

if not MONGODB_URI:
    print("WARNING: MONGODB_URI is not set - MongoDB connection will fail!")

try:
    mongo_client = MongoClient(MONGODB_URI)
    db = mongo_client.get_database(MONGODB_DB_NAME)
except Exception as e:
    print(f"ERROR: MongoDB connection failed: {e}")
    mongo_client = None
    db = None


class ChatRequest(BaseModel):
    user_id: str
    question: str
    conversation_history: Optional[List[Dict[str, str]]] = None


class PlaidChatbotAgent:
    """Chatbot that fetches directly from Plaid when needed."""

    def __init__(self):
        api_key = (os.getenv("AZURE_OPENAI_API_KEY") or os.getenv("OPENAI_API_KEY") or "").strip()
        base_url = (os.getenv("ENDPOINT_URL") or "").strip()
        deployment = (os.getenv("DEPLOYMENT_NAME") or os.getenv("OPENAI_MODEL") or "").strip()

        self.openai_client: Optional[OpenAI] = None
        self.model_name: Optional[str] = None

        if api_key and deployment:
            base = f"{base_url.rstrip('/')}/openai/v1/" if base_url else None
            self.openai_client = OpenAI(api_key=api_key, base_url=base)
            self.model_name = deployment
        else:
            print("WARNING: ChatbotAgent initialized without OpenAI credentials")

        self.tools = self._define_tools()

    def _create_sandbox_access_token(self) -> Optional[str]:
        """Create a fresh sandbox access token (for testing only)."""
        try:
            print("Creating fresh sandbox access token...")

            # Create a sandbox public token
            public_token_request = SandboxPublicTokenCreateRequest(
                institution_id="ins_109508",  # Chase sandbox institution
                initial_products=[Products("transactions")]
            )

            public_token_response = plaid_client.sandbox_public_token_create(public_token_request)
            public_token = public_token_response['public_token']

            print(f"Created public token: {public_token[:20]}...")

            # Exchange it for an access token
            exchange_request = ItemPublicTokenExchangeRequest(
                public_token=public_token
            )

            exchange_response = plaid_client.item_public_token_exchange(exchange_request)
            access_token = exchange_response['access_token']
            item_id = exchange_response['item_id']

            # For sandbox, transactions need to be initialized
            # The first call to get transactions triggers the initialization
            import time
            time.sleep(3)  # Wait for transactions to be ready

            return access_token

        except Exception as e:
            print(f"Error creating sandbox token: {e}")
            import traceback
            traceback.print_exc()
            return None

    def _get_plaid_access_token(self, user_id: str) -> Optional[str]:
        """Get Plaid access token - always creates fresh sandbox token for reliability."""
        print(f"User ID: {user_id} - Creating fresh Plaid sandbox access token...")

        # For Plaid Sandbox, always create a fresh token to avoid expiration issues
        if PLAID_ENV == 'sandbox':
            return self._create_sandbox_access_token()

        # For production, try MongoDB first
        try:
            print(f"Looking up access token for user_id: {user_id}")

            # Check if db is available
            if db is None:
                print("WARNING: MongoDB is not available - cannot fetch access token")
                return None

            # Try to convert to ObjectId
            try:
                user_object_id = ObjectId(user_id)
                query = {'userId': user_object_id}
            except Exception:
                # If not a valid ObjectId, try searching by string
                query = {'userId': user_id}

            integration = db['integrations'].find_one(query)

            print(f"Integration found: {integration is not None}")

            if integration:
                # Try new format first
                if integration.get('plaid', {}).get('bankConnections'):
                    token = integration['plaid']['bankConnections'][0]['accessToken']
                    print(f"Found token in bankConnections: {token[:10]}..." if token else "No token")
                    if token:
                        return token

                # Fallback to old format
                token = integration.get('plaid', {}).get('accessToken')
                print(f"Found token in old format: {token[:10]}..." if token else "No token")
                if token:
                    return token

            print("WARNING: No valid token in MongoDB")
            return None

        except Exception as e:
            print(f"Error getting access token: {e}")
            import traceback
            traceback.print_exc()
            return None

    def _fetch_accounts_from_plaid(self, access_token: str) -> Dict[str, Any]:
        """Fetch accounts directly from Plaid."""
        try:
            request = AccountsGetRequest(access_token=access_token)
            response = plaid_client.accounts_get(request)

            accounts = response['accounts']
            total_assets = 0
            total_debt = 0

            for account in accounts:
                balance = account['balances']['current']
                acc_type = account['type']

                if acc_type in ['depository', 'investment']:
                    total_assets += balance
                elif acc_type in ['credit', 'loan']:
                    total_debt += balance

            return {
                'accounts': [
                    {
                        'name': acc['name'],
                        'type': acc['type'],
                        'balance': acc['balances']['current']
                    } for acc in accounts
                ],
                'totalAssets': total_assets,
                'totalDebt': total_debt,
                'netWorth': total_assets - total_debt
            }
        except Exception as e:
            print(f"Error fetching accounts from Plaid: {e}")
            return {'error': str(e)}

    def _fetch_transactions_from_plaid(self, access_token: str, days: int = 60) -> Dict[str, Any]:
        """Fetch transactions directly from Plaid with retry for PRODUCT_NOT_READY."""
        try:
            end_date = datetime.now().date()
            start_date = end_date - timedelta(days=days)

            request = TransactionsGetRequest(
                access_token=access_token,
                start_date=start_date,
                end_date=end_date
            )

            # Retry logic for PRODUCT_NOT_READY in sandbox
            max_retries = 3
            retry_delay = 2  # seconds

            for attempt in range(max_retries):
                try:
                    response = plaid_client.transactions_get(request)
                    transactions = response['transactions']
                    break  # Success, exit retry loop
                except Exception as e:
                    error_body = str(e)
                    if 'PRODUCT_NOT_READY' in error_body and attempt < max_retries - 1:
                        print(f"⏳ Transactions not ready, retrying in {retry_delay}s (attempt {attempt + 1}/{max_retries})...")
                        import time
                        time.sleep(retry_delay)
                        continue
                    else:
                        raise  # Re-raise if not PRODUCT_NOT_READY or max retries reached

            if not transactions:
                transactions = response['transactions']

            # Calculate metrics
            total_income = 0
            total_spend = 0
            category_spending = {}

            for txn in transactions:
                amount = txn['amount']

                if amount < 0:  # Income (Plaid uses negative for income)
                    total_income += abs(amount)
                else:  # Spending
                    total_spend += amount

                    category = txn.get('category', ['Uncategorized'])[0] if txn.get('category') else 'Uncategorized'
                    if category not in category_spending:
                        category_spending[category] = {'total': 0, 'count': 0}
                    category_spending[category]['total'] += amount
                    category_spending[category]['count'] += 1

            # Sort categories
            top_categories = sorted(
                [{'category': k, 'amount': v['total'], 'count': v['count']}
                 for k, v in category_spending.items()],
                key=lambda x: x['amount'],
                reverse=True
            )[:10]

            net_cashflow = total_income - total_spend
            savings_rate = (net_cashflow / total_income * 100) if total_income > 0 else 0

            return {
                'transactions': [
                    {
                        'date': str(t['date']),
                        'name': t['name'],
                        'amount': t['amount'],
                        'category': t.get('category', ['Unknown'])[0] if t.get('category') else 'Unknown'
                    }
                    for t in transactions[:50]
                ],
                'totalIncome': total_income,
                'totalSpend': total_spend,
                'netCashflow': net_cashflow,
                'savingsRate': savings_rate,
                'categoryBreakdown': top_categories,
                'transactionCount': len(transactions)
            }
        except Exception as e:
            print(f"Error fetching transactions from Plaid: {e}")
            return {'error': str(e)}

    def _define_tools(self) -> List[Dict[str, Any]]:
        """Define financial analysis tools."""
        return [
            {
                "type": "function",
                "function": {
                    "name": "get_account_balances",
                    "description": "Get current account balances, assets, debt, and net worth from connected bank accounts.",
                    "parameters": {
                        "type": "object",
                        "properties": {"user_id": {"type": "string"}},
                        "required": ["user_id"],
                    },
                },
            },
            {
                "type": "function",
                "function": {
                    "name": "get_income_and_spending",
                    "description": "Get income, spending, net cashflow, and savings rate for a period from bank transactions.",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "user_id": {"type": "string"},
                            "period_days": {"type": "integer", "description": "Number of days (7, 30, 60, or 90)"},
                        },
                        "required": ["user_id"],
                    },
                },
            },
            {
                "type": "function",
                "function": {
                    "name": "get_spending_by_category",
                    "description": "Analyze spending broken down by categories from bank transactions.",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "user_id": {"type": "string"},
                            "period_days": {"type": "integer"},
                        },
                        "required": ["user_id"],
                    },
                },
            },
            {
                "type": "function",
                "function": {
                    "name": "get_recent_transactions",
                    "description": "Retrieve recent transactions for the last 7, 30, or 60 days.",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "user_id": {"type": "string"},
                            "period": {
                                "type": "string",
                                "enum": ["7", "30", "60"],
                                "description": "Number of days of transactions to retrieve"
                            }
                        },
                        "required": ["user_id", "period"],
                    },
                },
            },
        ]

    def _execute_tool(self, tool_name: str, arguments: Dict[str, Any]) -> Dict[str, Any]:
        """Execute a tool by fetching from Plaid."""
        user_id = arguments.get("user_id")
        period_days = arguments.get("period_days", 60)

        if tool_name == "get_recent_transactions":
            period = arguments.get("period", "7")
            period_map = {"7": 7, "30": 30, "60": 60}
            period_days = period_map.get(str(period), 7)

        # Get Plaid access token
        access_token = self._get_plaid_access_token(user_id)
        if not access_token:
            return {"error": "No Plaid integration found. Please connect your bank account first."}

        try:
            if tool_name == "get_account_balances":
                return self._fetch_accounts_from_plaid(access_token)

            elif tool_name in ["get_income_and_spending", "get_spending_by_category", "get_recent_transactions"]:
                return self._fetch_transactions_from_plaid(access_token, period_days)

            else:
                return {"error": f"Unknown tool: {tool_name}"}

        except Exception as exc:
            return {"error": str(exc)}

    def answer_question(
        self,
        user_id: str,
        question: str,
        conversation_history: Optional[List[Dict[str, str]]] = None,
        max_iterations: int = 8,
    ) -> Dict[str, Any]:
        """Answer a user's financial question using agentic workflow with Plaid data."""


        if not self.openai_client or not self.model_name:
            print("ERROR: OpenAI client not configured!")
            return {
                "answer": {
                    "summary": "AI service unavailable",
                    "analysis": {"key_metrics": [], "insights": ["OpenAI service is not configured"]},
                    "recommendations": [],
                    "tools_used": [],
                },
                "query": question,
                "iterations": 0,
            }

        system_prompt = """You are BenchWise's AI Financial Advisor. You help users understand their finances through conversational Q&A.

Your role:
- Answer user questions about their spending, income, savings, and financial goals
- Use tools to fetch real financial data directly from their connected bank accounts
- Provide specific, actionable insights with dollar amounts and percentages
- Be conversational and friendly while remaining professional

Guidelines:
- Call relevant tools to get accurate, up-to-date information from Plaid
- Explain financial concepts in simple terms
- Highlight both risks and opportunities
- Provide concrete next steps the user can take
"""

        messages: List[Dict[str, Any]] = [{"role": "system", "content": system_prompt}]

        if conversation_history:
            print(f"📚 Including {len(conversation_history[-6:])} previous messages from history")
            messages.extend(conversation_history[-6:])

        messages.append({"role": "user", "content": question})

        tools_used: List[str] = []

        print(f"🛠️  Available Tools: {len(self.tools)}")
        for tool in self.tools:
            print(f"   - {tool['function']['name']}: {tool['function']['description'][:60]}...")
        print()

        for iteration in range(max_iterations):
            print(f"\n{'─'*80}")
            print(f"🔁 ITERATION {iteration + 1}/{max_iterations}")
            print(f"{'─'*80}")

            print(f"💭 Calling OpenAI with {len(messages)} messages...")
            response = self.openai_client.chat.completions.create(
                model=self.model_name,
                messages=messages,
                tools=self.tools,
                tool_choice="auto",
                temperature=0.3,
            )

            response_message = response.choices[0].message

            messages.append(
                {
                    "role": response_message.role,
                    "content": response_message.content,
                    "tool_calls": response_message.tool_calls,
                }
            )

            if not response_message.tool_calls:
                final_response = self.openai_client.chat.completions.create(
                    model=self.model_name,
                    messages=messages
                    + [
                        {
                            "role": "user",
                            "content": "Provide a structured response with summary, key metrics, insights, and recommendations.",
                        }
                    ],
                    response_format=self._response_schema(),
                    temperature=0.3,
                )

                try:
                    structured_answer = json.loads(final_response.choices[0].message.content)
                    structured_answer["tools_used"] = tools_used
                    return {"answer": structured_answer, "query": question, "tools_used": len(tools_used)}
                except json.JSONDecodeError as e:
                    print(f"ERROR: Failed to parse structured response: {e}")
                    return {
                        "answer": {
                            "summary": response_message.content or "Analysis complete",
                            "analysis": {"key_metrics": [], "insights": []},
                            "recommendations": [],
                            "tools_used": tools_used,
                        },
                        "query": question,
                        "iterations": iteration + 1,
                    }

            for idx, tool_call in enumerate(response_message.tool_calls, 1):
                function_name = tool_call.function.name
                
                try:
                    function_args = json.loads(tool_call.function.arguments or "{}")
                except json.JSONDecodeError:
                    function_args = {}
                    print(f"WARNING: Failed to parse arguments for {function_name}")

                function_args.setdefault("user_id", user_id)
                tool_result = self._execute_tool(function_name, function_args)

                if isinstance(tool_result, dict) and 'error' in tool_result:
                    print(f"ERROR in {function_name}: {tool_result['error']}")

                tools_used.append(function_name)

                messages.append(
                    {
                        "tool_call_id": tool_call.id,
                        "role": "tool",
                        "name": function_name,
                        "content": json.dumps(tool_result, default=str),
                    }
                )

        print(f"WARNING: AGENT REACHED MAX ITERATIONS ({max_iterations})")

        return {
            "answer": {
                "summary": "Analysis incomplete - reached maximum iterations",
                "analysis": {"key_metrics": [], "insights": ["Agent reached maximum analysis depth"]},
                "recommendations": [],
                "tools_used": tools_used,
            },
            "query": question,
            "iterations": max_iterations,
        }

    @staticmethod
    def _response_schema() -> Dict[str, Any]:
        """Schema for structured chatbot responses."""
        return {
            "type": "json_schema",
            "json_schema": {
                "name": "chatbot_response",
                "strict": True,
                "schema": {
                    "type": "object",
                    "properties": {
                        "summary": {"type": "string"},
                        "analysis": {
                            "type": "object",
                            "properties": {
                                "key_metrics": {
                                    "type": "array",
                                    "items": {
                                        "type": "object",
                                        "properties": {
                                            "metric": {"type": "string"},
                                            "value": {"type": "string"},
                                            "assessment": {"type": "string"},
                                        },
                                        "required": ["metric", "value", "assessment"],
                                        "additionalProperties": False,
                                    },
                                },
                                "insights": {"type": "array", "items": {"type": "string"}},
                            },
                            "required": ["key_metrics", "insights"],
                            "additionalProperties": False,
                        },
                        "recommendations": {
                            "type": "array",
                            "items": {
                                "type": "object",
                                "properties": {
                                    "action": {"type": "string"},
                                    "priority": {"type": "string", "enum": ["high", "medium", "low"]},
                                    "expected_impact": {"type": "string"},
                                },
                                "required": ["action", "priority", "expected_impact"],
                                "additionalProperties": False,
                            },
                        },
                    },
                    "required": ["summary", "analysis", "recommendations"],
                    "additionalProperties": False,
                },
            },
        }


# Global chatbot instance
chatbot_agent = PlaidChatbotAgent()


@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "BenchWise AI Chatbot (Plaid)", "timestamp": datetime.utcnow().isoformat()}


@app.post("/api/v1/chatbot/query")
def chat_query(request: ChatRequest):
    """Answer user's financial question using agentic AI with Plaid data."""
    try:
        result = chatbot_agent.answer_question(
            user_id=request.user_id,
            question=request.question,
            conversation_history=request.conversation_history,
        )

        return {
            "success": True,
            "data": {
                "agent_response": result["answer"],
                "query": result["query"],
                "tools_used": result.get("tools_used", 0),
            },
        }

    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8001)
