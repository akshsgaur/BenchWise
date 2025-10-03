"""
Plaid AI Service

This service integrates with the Plaid API and uses Azure OpenAI models
to provide intelligent financial data analysis and insights.
"""

import os
import json
import time
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any


# Import Plaid
import plaid
from plaid.api import plaid_api
from plaid.model.link_token_create_request import LinkTokenCreateRequest
from plaid.model.link_token_create_request_user import LinkTokenCreateRequestUser
from plaid.model.products import Products
from plaid.model.country_code import CountryCode
from plaid.model.transactions_get_request import TransactionsGetRequest
from plaid.model.transactions_get_request_options import TransactionsGetRequestOptions
from plaid.model.accounts_get_request import AccountsGetRequest
from plaid.model.item_get_request import ItemGetRequest
from plaid.model.institutions_get_by_id_request import InstitutionsGetByIdRequest

# Import OpenAI for Azure
from openai import OpenAI
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class PlaidAIService:
    """Service that combines Plaid financial data with Azure OpenAI intelligence."""

    def __init__(self):
        # Plaid credentials
        self.plaid_client_id = os.getenv('PLAID_CLIENT_ID')
        self.plaid_secret = os.getenv('PLAID_SECRET')
        self.plaid_env = os.getenv('PLAID_ENV', 'sandbox')

        # Azure OpenAI credentials
        self.azure_api_key = os.getenv('AZURE_OPENAI_API_KEY')
        self.azure_endpoint = os.getenv('ENDPOINT_URL')
        self.deployment_name = os.getenv('DEPLOYMENT_NAME', 'gpt-4.1')

        # Initialize clients
        self._init_plaid_client()
        self._init_azure_client()

        # Hardcoded user ID for Supabase operations
        self.user_id = "1"

    def _init_plaid_client(self):
        """Initialize Plaid API client."""
        plaid_environment_map = {
            'sandbox': plaid.Environment.Sandbox,
            'production': plaid.Environment.Production
        }

        configuration = plaid.Configuration(
            host=plaid_environment_map.get(self.plaid_env, plaid.Environment.Sandbox),
            api_key={
                'clientId': self.plaid_client_id,
                'secret': self.plaid_secret,
                'plaidVersion': '2020-09-14'
            }
        )
        api_client = plaid.ApiClient(configuration)
        self.plaid_client = plaid_api.PlaidApi(api_client)

    def _init_azure_client(self):
        """Initialize Azure OpenAI client."""
        self.openai_client = OpenAI(
            base_url=f"{self.azure_endpoint}openai/v1/",
            api_key=self.azure_api_key
        )

    def check_credentials(self) -> Dict[str, bool]:
        """Check if all credentials are properly configured."""
        return {
            "plaid_configured": all([self.plaid_client_id, self.plaid_secret]),
            "azure_configured": all([self.azure_api_key, self.azure_endpoint]),
            "plaid_environment": self.plaid_env,
            "azure_deployment": self.deployment_name
        }

    # ----- Plaid Link Methods -----

    def get_sandbox_access_token(self) -> Dict[str, str]:
        """Create a sandbox access token directly (for testing only)."""
        try:
            from plaid.model.sandbox_public_token_create_request import SandboxPublicTokenCreateRequest
            from plaid.model.item_public_token_exchange_request import ItemPublicTokenExchangeRequest

            # Create a sandbox public token
            public_token_request = SandboxPublicTokenCreateRequest(
                institution_id="ins_109508",  # Chase sandbox institution
                initial_products=[Products("transactions")]
            )

            public_token_response = self.plaid_client.sandbox_public_token_create(public_token_request)
            public_token = public_token_response['public_token']

            # Exchange it for an access token
            exchange_request = ItemPublicTokenExchangeRequest(
                public_token=public_token
            )

            exchange_response = self.plaid_client.item_public_token_exchange(exchange_request)
            access_token = exchange_response['access_token']
            item_id = exchange_response['item_id']

            # Fire sandbox transactions to make them available
            print("Firing sandbox transactions...")
            self._fire_sandbox_transactions(access_token)

            # Wait a moment for transactions to be processed
            print("Waiting for transactions to be processed...")
            time.sleep(3)

            return {
                "access_token": access_token,
                "item_id": item_id,
                "note": "This is a sandbox access token for testing only"
            }
        except plaid.ApiException as e:
            error_response = json.loads(e.body)
            raise Exception(f"Failed to create sandbox token: {error_response['error_code']}")

    def _fire_sandbox_transactions(self, access_token: str):
        """Fire sandbox transactions to make them available for retrieval."""
        try:
            from plaid.model.sandbox_transactions_fire_request import SandboxTransactionsFireRequest

            # Fire transactions for the sandbox item
            fire_request = SandboxTransactionsFireRequest(
                access_token=access_token
            )

            response = self.plaid_client.sandbox_transactions_fire(fire_request)
            print(f"Successfully fired {len(response.get('transactions', []))} sandbox transactions")

        except plaid.ApiException as e:
            print(f"Warning: Could not fire sandbox transactions: {e}")
            # Don't raise the exception, just warn - transactions might still work
        except Exception as e:
            print(f"Warning: Error firing sandbox transactions: {e}")

    def create_link_token(self) -> Dict[str, str]:
        """Create a Plaid Link token."""
        try:
            request = LinkTokenCreateRequest(
                user=LinkTokenCreateRequestUser(
                    client_user_id="unique-user-id"
                ),
                client_name="BenchWise",
                products=[Products("transactions")],
                country_codes=[CountryCode("US")],
                language="en"
            )

            response = self.plaid_client.link_token_create(request)

            return {
                "link_token": response['link_token'],
                "expiration": response['expiration']
            }
        except plaid.ApiException as e:
            error_response = json.loads(e.body)
            raise Exception(f"Failed to create link token: {error_response['error_code']}")

    def exchange_public_token(self, public_token: str) -> Dict[str, str]:
        """Exchange a public token for an access token."""
        try:
            from plaid.model.item_public_token_exchange_request import ItemPublicTokenExchangeRequest

            request = ItemPublicTokenExchangeRequest(
                public_token=public_token
            )

            response = self.plaid_client.item_public_token_exchange(request)

            return {
                "access_token": response['access_token'],
                "item_id": response['item_id']
            }
        except plaid.ApiException as e:
            error_response = json.loads(e.body)
            raise Exception(f"Failed to exchange public token: {error_response['error_code']}")

    # ----- Account Information Methods -----

    def get_accounts(self, access_token: str) -> Dict[str, Any]:
        """Get account information for the specified access token."""
        try:
            request = AccountsGetRequest(access_token=access_token)
            response = self.plaid_client.accounts_get(request)

            return {
                "accounts": response['accounts'],
                "item": response['item']
            }
        except plaid.ApiException as e:
            error_response = json.loads(e.body)
            raise Exception(f"Failed to retrieve accounts: {error_response['error_code']}")

    def get_item_info(self, access_token: str) -> Dict[str, Any]:
        """Get information about the item associated with the access token."""
        try:
            request = ItemGetRequest(access_token=access_token)
            response = self.plaid_client.item_get(request)

            return {
                "item": response['item'],
                "status": response['status']
            }
        except plaid.ApiException as e:
            error_response = json.loads(e.body)
            raise Exception(f"Failed to retrieve item info: {error_response['error_code']}")

    def get_institution(self, institution_id: str) -> Dict[str, Any]:
        """Get information about a financial institution."""
        try:
            request = InstitutionsGetByIdRequest(
                institution_id=institution_id,
                country_codes=[CountryCode("US")]
            )

            response = self.plaid_client.institutions_get_by_id(request)

            return {
                "institution": response['institution']
            }
        except plaid.ApiException as e:
            error_response = json.loads(e.body)
            raise Exception(f"Failed to retrieve institution: {error_response['error_code']}")

    # ----- Transaction Data Methods -----

    def get_transactions(self, access_token: str, start_date: str, end_date: str, retry_count: int = 0) -> Dict[str, Any]:
        """Get transactions for a specified time period."""
        max_retries = 3
        retry_delay = 2  # seconds

        try:
            print("Before request.")
            request = TransactionsGetRequest(
                access_token=access_token,
                start_date=datetime.strptime(start_date, "%Y-%m-%d").date(),
                end_date=datetime.strptime(end_date, "%Y-%m-%d").date(),
                options=TransactionsGetRequestOptions(
                    count=100,
                    offset=0
                )
            )
            print("Request", request)
            print("Making API call to Plaid...")
            response = self.plaid_client.transactions_get(request)
            print("Response received successfully")

            return {
                "accounts": response['accounts'],
                "transactions": response['transactions'],
                "total_transactions": response['total_transactions']
            }
        except plaid.ApiException as e:
            print(f"Plaid API Exception: {e}")
            error_response = json.loads(e.body)
            print(f"Error response: {error_response}")

            # Retry for PRODUCT_NOT_READY in sandbox environment
            if (error_response.get('error_code') == 'PRODUCT_NOT_READY' and
                self.plaid_env == 'sandbox' and
                retry_count < max_retries):

                print(f"PRODUCT_NOT_READY - retrying in {retry_delay} seconds... (attempt {retry_count + 1}/{max_retries})")
                time.sleep(retry_delay)
                return self.get_transactions(access_token, start_date, end_date, retry_count + 1)

            raise Exception(f"Failed to retrieve transactions: {error_response['error_code']} - {error_response.get('error_message', '')}")
        except Exception as e:
            print(f"General Exception in get_transactions: {e}")
            raise Exception(f"Failed to retrieve transactions: {str(e)}")

    def search_transactions(self, access_token: str, query: str, start_date: Optional[str] = None, end_date: Optional[str] = None) -> Dict[str, Any]:
        """Search transactions using a query string."""
        # Default to last 30 days if dates not provided
        if not start_date:
            start_date = (datetime.now() - timedelta(days=30)).strftime("%Y-%m-%d")
        if not end_date:
            end_date = datetime.now().strftime("%Y-%m-%d")

        try:
            # Get all transactions
            request = TransactionsGetRequest(
                access_token=access_token,
                start_date=datetime.strptime(start_date, "%Y-%m-%d").date(),
                end_date=datetime.strptime(end_date, "%Y-%m-%d").date(),
                options=TransactionsGetRequestOptions(
                    count=100,
                    offset=0
                )
            )

            response = self.plaid_client.transactions_get(request)

            # Filter transactions by query
            query = query.lower()
            matching_transactions = [
                t for t in response['transactions']
                if query in t['name'].lower() or
                query in (t['category'] if 'category' in t and t['category'] else '') or
                query in (t['merchant_name'].lower() if 'merchant_name' in t and t['merchant_name'] else '')
            ]

            return {
                "matching_transactions": matching_transactions,
                "count": len(matching_transactions)
            }
        except plaid.ApiException as e:
            error_response = json.loads(e.body)
            raise Exception(f"Failed to search transactions: {error_response['error_code']}")

    # ----- AI-Powered Analysis Methods -----

    def analyze_spending_patterns(self, access_token: str, days: int = 30) -> Dict[str, Any]:
        """Analyze spending patterns using Azure OpenAI."""
        try:
            # Get recent transactions
            end_date = datetime.now().strftime("%Y-%m-%d")
            start_date = (datetime.now() - timedelta(days=days)).strftime("%Y-%m-%d")

            transactions_data = self.get_transactions(access_token, start_date, end_date)
            transactions = transactions_data['transactions']

            # Prepare data for AI analysis
            transaction_summary = []
            for t in transactions:
                transaction_summary.append({
                    'amount': t['amount'],
                    'category': t.get('category', ['Unknown'])[0] if t.get('category') else 'Unknown',
                    'name': t['name'],
                    'date': t['date']
                })

            # Create prompt for AI analysis
            prompt = f"""
            Analyze the following {len(transactions)} financial transactions from the past {days} days:

            {json.dumps(transaction_summary, indent=2)}

            Please provide:
            1. Top spending categories and amounts
            2. Unusual or concerning spending patterns
            3. Opportunities for savings
            4. Overall financial health insights
            5. Specific actionable recommendations

            Format your response as structured JSON with clear sections.
            """

            # Get AI analysis
            completion = self.openai_client.chat.completions.create(
                model=self.deployment_name,
                messages=[
                    {
                        "role": "system",
                        "content": "You are a financial advisor AI that analyzes spending patterns and provides actionable insights."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                temperature=0.3
            )

            ai_analysis = completion.choices[0].message.content

            return {
                "transaction_count": len(transactions),
                "analysis_period": f"{start_date} to {end_date}",
                "ai_insights": ai_analysis,
                "raw_transactions": transaction_summary
            }

        except Exception as e:
            raise Exception(f"Failed to analyze spending patterns: {str(e)}")

    def get_financial_advice(self, question: str, access_token: Optional[str] = None) -> Dict[str, Any]:
        """Get personalized financial advice using Azure OpenAI."""
        try:
            context = ""

            # If access token provided, get recent financial context
            print("Access_token: ", access_token)
            if access_token:
                try:
                    accounts_data = self.get_accounts(access_token)
                    print("accounts_data: ",accounts_data)
                    recent_transactions = self.get_transactions(
                        access_token,
                        (datetime.now() - timedelta(days=365)).strftime("%Y-%m-%d"),
                        datetime.now().strftime("%Y-%m-%d")
                    )
                    print("recent_transactions: ",recent_transactions)

                    context = f"""
                    User's Financial Context:
                    - Accounts: {accounts_data.get('accounts', [])}
                    - Recent transactions (last 7 days): {recent_transactions.get('transactions', [])}
                    """
                except Exception as e:
                    print(f"Error getting financial context: {e}")
                    context = "No recent financial data available."
            print("Context: ", context)
            prompt = f"""
            {context}

            User Question: {question}

            Please provide helpful, personalized financial advice based on the question and available context.
            Be specific, actionable, and educational in your response.
            """
            print("Prompt inside get_financial_advice: ", prompt)
            completion = self.openai_client.chat.completions.create(
                model=self.deployment_name,
                messages=[
                    {
                        "role": "system",
                        "content": "You are a helpful financial advisor AI. Provide clear, actionable financial advice while being mindful that you're not a licensed financial advisor."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                temperature=0.4
            )

            print("completion.choices[0].message.content: ", completion.choices[0].message.content)
            return {
                "question": question,
                "advice": completion.choices[0].message.content,
                "has_financial_context": bool(access_token and context != "No recent financial data available.")
            }

        except Exception as e:
            raise Exception(f"Failed to get financial advice: {str(e)}")

    # ----- Goal Management Methods -----

    def create_goal(self, description: str) -> Dict[str, Any]:
        """Create a new financial goal for the user."""
        try:
            from supabase_client import supabase

            response = supabase.table("goals").insert({
                "description": description,
                "id_user": self.user_id
            }).execute()

            if response.data and len(response.data) > 0:
                return {
                    "success": True,
                    "goal": response.data[0]
                }
            else:
                raise Exception("No data returned from goal creation")

        except Exception as e:
            raise Exception(f"Failed to create goal: {str(e)}")

    def edit_goal(self, goal_id: str, description: str) -> Dict[str, Any]:
        """Edit an existing financial goal for the user."""
        try:
            from supabase_client import supabase

            response = supabase.table("goals").update({
                "description": description
            }).eq("id", goal_id).eq("id_user", self.user_id).execute()

            if response.data and len(response.data) > 0:
                return {
                    "success": True,
                    "goal": response.data[0]
                }
            else:
                raise Exception(f"Goal with ID {goal_id} not found or not owned by user {self.user_id}")

        except Exception as e:
            raise Exception(f"Failed to update goal: {str(e)}")

    def delete_goal(self, goal_id: str) -> Dict[str, bool]:
        """Delete a goal for the user."""
        try:
            from supabase_client import supabase

            response = supabase.table("goals").delete().eq("id", goal_id).eq("id_user", self.user_id).execute()

            if response.data and len(response.data) > 0:
                return {"success": True}
            else:
                return {
                    "success": False,
                    "message": f"Goal with ID {goal_id} not found or not owned by user {self.user_id}"
                }

        except Exception as e:
            raise Exception(f"Failed to delete goal: {str(e)}")

    def get_all_goals(self) -> Dict[str, Any]:
        """Retrieve all goals for the user."""
        try:
            from supabase_client import supabase

            response = supabase.table("goals").select("*").eq("id_user", self.user_id).execute()

            return {
                "goals": response.data
            }
        except Exception as e:
            raise Exception(f"Failed to retrieve goals: {str(e)}")

    def analyze_goals_progress(self, access_token: str) -> Dict[str, Any]:
        """Analyze progress towards financial goals using AI."""
        try:
            # Get user goals
            goals_data = self.get_all_goals()
            goals = goals_data.get('goals', [])

            if not goals:
                return {
                    "message": "No goals found for analysis",
                    "goals_count": 0
                }

            # Get recent financial data
            transactions_data = self.get_transactions(
                access_token,
                (datetime.now() - timedelta(days=30)).strftime("%Y-%m-%d"),
                datetime.now().strftime("%Y-%m-%d")
            )

            # Prepare data for AI analysis
            prompt = f"""
            Analyze progress towards these financial goals based on recent transaction data:

            Goals:
            {json.dumps([goal['description'] for goal in goals], indent=2)}

            Recent Transactions (last 30 days):
            {json.dumps([{
                'amount': t['amount'],
                'category': t.get('category', ['Unknown'])[0] if t.get('category') else 'Unknown',
                'name': t['name']
            } for t in transactions_data.get('transactions', [])], indent=2)}

            Please provide:
            1. Progress assessment for each goal
            2. Specific recommendations to achieve goals faster
            3. Potential obstacles or concerns
            4. Suggested adjustments to spending habits

            Format as structured JSON.
            """

            completion = self.openai_client.chat.completions.create(
                model=self.deployment_name,
                messages=[
                    {
                        "role": "system",
                        "content": "You are a financial advisor AI specializing in goal-based financial planning."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                temperature=0.3
            )

            return {
                "goals_count": len(goals),
                "analysis_period": "Last 30 days",
                "progress_analysis": completion.choices[0].message.content,
                "goals": goals
            }

        except Exception as e:
            raise Exception(f"Failed to analyze goals progress: {str(e)}")


# Create a singleton instance for easy import
plaid_ai_service = PlaidAIService()