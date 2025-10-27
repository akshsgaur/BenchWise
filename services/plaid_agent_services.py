import os
import json
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional
from plaid_ai_service import PlaidAIService
from openai import OpenAI
from dotenv import load_dotenv


load_dotenv()

class PlaidAgentService: 
    """
    Agentic financial advisor that autonomously uses multiple tools
    """
    def __init__(self):

        # Initialize base plaid service
        self.plaid_service = PlaidAIService()

        self.openai_client = OpenAI(
            base_url = f"{os.getenv('ENDPOINT_URL')}openai/v1/",
            api_key = os.getenv('AZURE_OPENAI_API_KEY')
        )
        self.deployment_name =  os.getenv('DEPLOYMENT_NAME', 'gpt-4.1')

        # Initialize tools
        self.tools = self._define_tools()

    def _define_tools(self) -> List[Dict]:
            """ Define all the tools the agent requires"""
            return [
                {
                    "type": "function", 
                    "function": {
                        "name": "get_account_balances", 
                        "description": "Get current account balances for all user account (checking, savings, credit cards, loans, investments)",
                        "parameters": {
                            "type": "object",
                            "properties": {
                                "access_token": {
                                    "type": "string", 
                                    "description": "Plaid access token for the user"

                                }

                            },
                        "required": ["access_token"]
                        } 
                    }
                },
                {
                "type": "function",
                "function": {
                    "name": "get_recent_transactions",
                    "description": "Retrieve transactions from the past N days",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "access_token": {
                                "type": "string",
                                "description": "Plaid access token"
                            },
                            "days": {
                                "type": "integer",
                                "description": "Number of days back to retrieve (7, 30, 60, or 90)",
                                "enum": [7, 30, 60, 90]
                            }
                        },
                        "required": ["access_token", "days"]
                    }
                }

                },

                {
                    "type": "function",
                "function": {
                    "name": "analyze_spending_by_category",
                    "description": "Analyze and categorize spending patterns",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "access_token": {
                                "type": "string",
                                "description": "Plaid access token"
                            },
                            "days": {
                                "type": "integer",
                                "description": "Analysis period in days"
                            }
                        },
                        "required": ["access_token", "days"]
                    }
                }


                }, 

                {
                    
                "type": "function",
                "function": {
                    "name": "calculate_debt_to_income_ratio",
                    "description": "Calculate user's debt-to-income ratio and assess financial health",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "access_token": {
                                "type": "string",
                                "description": "Plaid access token"
                            }
                        },
                        "required": ["access_token"]
                    }
                }
                

                }, 
                {
                    "type": "function", 
                    "function": {
                        "name": "identify_recurring_charges", 
                        "description": "recurring subscriptions and regular bills", 
                        "parameters": {
                            "type": "object", 
                            "properties": {
                                "access_token": {
                                    "type": "string",
                                    "description": "Plaid access token"
                                }
                            },
                            "required": ["access_token"]
                        }
                    }
                },
                {
                "type": "function",
                "function": {
                    "name": "project_financial_timeline",
                    "description": "Project when user can achieve a financial goal based on current savings rate",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "access_token": {
                                "type": "string",
                                "description": "Plaid access token"
                            },
                            "goal_amount": {
                                "type": "number",
                                "description": "Target amount to save"
                            }
                        },
                        "required": ["access_token", "goal_amount"]
                    }
                }
            }
            ]
        


    def get_account_balances(self, access_token: str) -> Dict[str,Any]:
        """ Get current account balances"""
        try:
            accounts_data = self.plaid_service.get_accounts(access_token)
            accounts = accounts_data.get('accounts', [])

            summary = {
                "total_assets": 0,
                "total_debt": 0,
                "accounts_by_type": {},
                "detailed_accounts": []
            }
            for account in accounts:
                acc_type = account['type']
                balance = account['balances']['current']
                if acc_type not in summary['accounts_by_type']:
                    summary['accounts_by_type'][acc_type] = []
                summary['accounts_by_type'][acc_type].append({
                    "name": account["name"],
                    "balance": balance,
                    "subtype": account.get('subtype', 'unknown')
                })
                if acc_type == 'depository' or acc_type == 'investment':
                    summary['total_assets'] += balance

                elif acc_type in ['credit','loan']:
                    summary['total_debt'] += balance

                summary['detailed_accounts'].append({
                    "name": account['name'],
                    "type": acc_type,
                    "balance": balance
                })

            summary['net_worth'] = summary['total_assets'] - summary['total_debt']

            return summary

        except Exception as e:
            return {"error": str(e)}
    

    def get_recent_transactions(self, access_token: str, days: int) -> Dict[str, Any]:
        """Get transactions from past N days."""
        try:
            end_date = datetime.now().strftime("%Y-%m-%d")
            start_date = (datetime.now() - timedelta(days=days)).strftime("%Y-%m-%d")
            
            transactions_data = self.plaid_service.get_transactions(
                access_token, start_date, end_date
            )
            
            transactions = transactions_data.get('transactions', [])
            
            return {
                "transaction_count": len(transactions),
                "period": f"{days} days",
                "transactions": [
                    {
                        "date": str(t['date']),
                        "amount": t['amount'],
                        "name": t['name'],
                        "category": t.get('category', ['Unknown'])[0] if t.get('category') else 'Unknown'
                    }
                    for t in transactions[:50]  # Limit for context window
                ]
            }
            
        except Exception as e:
            return {"error": str(e)}

    def analyze_spending_by_category(self, access_token: str, days: int) -> Dict[str, Any]:
        """ Analyze spending broken down by category"""

        try:
            end_date = datetime.now().strftime("%Y-%m-%d")
            start_date = (datetime.now() - timedelta(days=days)).strftime("%Y-%m-%d")
            transaction_data = self.plaid_service.get_transactions(
                access_token, start_date, end_date
            )

            transactions = transaction_data.get('transactions',[])
            category_spending = {}
            total_spent = 0
            for t in transactions:
                if t['amount'] > 0:
                    category = t.get('category', ['Uncategorized'])[0] if t.get('category') else 'Uncategorized'

                    if category not in category_spending:
                        category_spending[category] = {
                            'total': 0,
                            'count': 0,
                            'transactions': []
                        }

                    category_spending[category]['total'] += t['amount']
                    category_spending[category]['count'] += 1
                    total_spent += t['amount']

                    category_spending[category]['transactions'].append({
                        'name': t['name'],
                        'amount': t['amount'],
                    })

            sorted_categories = sorted(
                category_spending.items(),
                key = lambda x: x[1]['total'],
                reverse = True
            )

            return {
                "total_spent": total_spent,
                "period_days": days,
                "categories": [
                    {
                        "name": cat[0],
                        "total": cat[1]['total'],
                        "count": cat[1]['count'],
                        "percentage": (cat[1]['total'] / total_spent * 100) if total_spent > 0 else 0,
                        "average_per_transaction": cat[1]['total'] / cat[1]['count']
                    }
                    for cat in sorted_categories[:10]  # Top 10 categories
                ]
            }


        except Exception as e:
            return {"error": str(e)}

    def calculate_debt_to_income_ratio(self, access_token: str) -> Dict[str, Any]:
        """Calculate debt-to-income ratio"""
        try:
            accounts_data = self.plaid_service.get_accounts(access_token)
            accounts = accounts_data.get('accounts', [])

            end_date = datetime.now().strftime('%Y-%m-%d')
            start_date = (datetime.now() - timedelta(days=60)).strftime("%Y-%m-%d")

            transactions_data = self.plaid_service.get_transactions(
                access_token, start_date, end_date
            )

            transactions = transactions_data.get('transactions', [])

            total_debt = sum(
                acc['balances']['current']
                for acc in accounts
                if acc['type'] in ['credit', 'loan']
            )

            income_transactions = [t for t in transactions if t['amount'] < 0]
            total_income_2mo = abs(sum(t['amount'] for t in income_transactions))
            estimated_monthly_income = total_income_2mo / 2

            monthly_debt_payment = 0
            for acc in accounts:
                if acc['type'] == 'credit':
                    # Assume 2% minimum payment for credit cards
                    monthly_debt_payment += acc['balances']['current'] * 0.02
                elif acc['subtype'] == 'student':
                    # Assume $250/month for student loans (simplified)
                    monthly_debt_payment += 250
                elif acc['subtype'] == 'mortgage':
                    # Assume typical mortgage payment is ~30% of balance / 360
                    monthly_debt_payment += acc['balances']['current'] / 360

            dti_ratio = (monthly_debt_payment / estimated_monthly_income * 100) if estimated_monthly_income > 0 else 0

            return {
                "total_debt": total_debt,
                "estimated_monthly_income": estimated_monthly_income,
                "estimated_monthly_debt_payment": monthly_debt_payment,
                "debt_to_income_ratio": dti_ratio,
                "assessment": "Good" if dti_ratio < 36 else "Needs Improvement" if dti_ratio < 50 else "High Risk"
            }
        except Exception as e:
            return {"error": str(e)}

    def identify_recurring_charges(self, access_token: str) -> Dict[str, Any]:
        """ Identify recurring subscriptions and bills"""
        try:
            end_date = datetime.now().strftime("%Y-%m-%d")
            start_date = (datetime.now() - timedelta(days=90)).strftime("%Y-%m-%d")

            transactions_data = self.plaid_service.get_transactions(
                access_token, start_date, end_date
            )

            transactions = transactions_data.get('transactions', [])

            merchant_transactions = {}
            for t in transactions:
                if t['amount'] > 0:
                    merchant = t.get('merchant_name') or t['name']
                    if merchant not in merchant_transactions:
                        merchant_transactions[merchant] = []

                    merchant_transactions[merchant].append({
                        'amount': t['amount'],
                        'date': t['date']
                    })

            recurring = []
            for merchant, txns in merchant_transactions.items():
                if len(txns) >= 2:
                    amounts = [t['amount'] for t in txns]
                    avg_amount = sum(amounts) / len(amounts)

                    is_consistent = all(
                        abs(amt - avg_amount) < 0.1
                        for amt in amounts
                    )

                    if is_consistent:
                        recurring.append({
                            "merchant": merchant,
                            "average_amount": avg_amount,
                            "frequency": len(txns),
                            "total_spent_90days": sum(amounts),
                            "likely_subscription": is_consistent
                        })

            recurring.sort(key=lambda x: x['total_spent_90days'], reverse=True)

            return {
                "recurring_charges": recurring,
                "total_recurring_monthly": sum(r['average_amount'] for r in recurring),
                "count": len(recurring)
            }

        except Exception as e:
            return {"error": str(e)}

    def calculate_savings_rate(self, access_token: str, months: int = 3) -> Dict[str, Any]:
        """Calculate monthly savings rate."""
        try:
            days = months * 30
            end_date = datetime.now().strftime("%Y-%m-%d")
            start_date = (datetime.now() - timedelta(days=days)).strftime("%Y-%m-%d")

            transactions_data = self.plaid_service.get_transactions(
                access_token, start_date, end_date
            )
            transactions = transactions_data.get('transactions', [])

            # Calculate income and expenses
            total_income = abs(sum(t['amount'] for t in transactions if t['amount'] < 0))
            total_expenses = sum(t['amount'] for t in transactions if t['amount'] > 0)

            monthly_income = total_income / months
            monthly_expenses = total_expenses / months
            monthly_savings = monthly_income - monthly_expenses

            savings_rate = (monthly_savings / monthly_income * 100) if monthly_income > 0 else 0

            return {
                "period_months": months,
                "average_monthly_income": monthly_income,
                "average_monthly_expenses": monthly_expenses,
                "average_monthly_savings": monthly_savings,
                "savings_rate_percentage": savings_rate,
                "assessment": "Excellent" if savings_rate >= 20 else "Good" if savings_rate >= 10 else "Needs Improvement"
            }

        except Exception as e:
            return {"error": str(e)}
        
    def project_financial_timeline(self, access_token: str, goal_amount: float) -> Dict[str, Any]:
        """Project timeline to reach a financial goal."""
        try:
            # First get current savings rate
            savings_data = self.calculate_savings_rate(access_token, months=3)
            
            if 'error' in savings_data:
                return savings_data
            
            monthly_savings = savings_data['average_monthly_savings']
            
            # Get current liquid assets
            accounts_data = self.get_account_balances(access_token)
            current_savings = accounts_data.get('total_assets', 0)
            
            # Calculate time to goal
            amount_needed = goal_amount - current_savings
            
            if amount_needed <= 0:
                return {
                    "goal_amount": goal_amount,
                    "current_savings": current_savings,
                    "message": "Goal already achieved!",
                    "months_to_goal": 0
                }
            
            if monthly_savings <= 0:
                return {
                    "goal_amount": goal_amount,
                    "current_savings": current_savings,
                    "monthly_savings": monthly_savings,
                    "message": "Currently not saving. Need to reduce expenses to reach goal.",
                    "months_to_goal": None
                }
            
            months_to_goal = amount_needed / monthly_savings
            
            return {
                "goal_amount": goal_amount,
                "current_savings": current_savings,
                "amount_needed": amount_needed,
                "monthly_savings": monthly_savings,
                "months_to_goal": round(months_to_goal, 1),
                "estimated_date": (datetime.now() + timedelta(days=months_to_goal * 30)).strftime("%Y-%m-%d"),
                "recommendation": "Increase monthly savings to reach goal faster" if months_to_goal > 24 else "On track to reach goal"
            }
            
        except Exception as e:
            return {"error": str(e)}    

    
    def _execute_tool(self, tool_name: str, arguments: Dict[str, Any]) -> str: 
        """ Execute a tool and return the result as JSON string"""

        try: 
            if tool_name == "get_account_balances":
                result = self.get_account_balances(**arguments)
            elif tool_name == "get_recent_transactions":
                result = self.get_recent_transactions(**arguments)
            elif tool_name == "analyze_spending_by_category":
                result = self.analyze_spending_by_category(**arguments)
            elif tool_name == "calculate_debt_to_income_ratio":
                result = self.calculate_debt_to_income_ratio(**arguments)
            elif tool_name == "identify_recurring_charges":
                result = self.identify_recurring_charges(**arguments)
            elif tool_name == "calculate_savings_rate":
                result = self.calculate_savings_rate(**arguments)
            elif tool_name == "project_financial_timeline":
                result = self.project_financial_timeline(**arguments)
            else:
                result = {"error": f"Unknown tool: {tool_name}"}
        
            return json.dumps(result)
        
        except Exception as e: 
            return json.dumps({"error": f"Unknown tool: {tool_name}"})

    
    def _get_response_schema(self) -> Dict[str, Any]:
        """Define the structured output schema for final responses."""
        return {
            "type": "json_schema",
            "json_schema": {
                "name": "financial_advice_response",
                "strict": True,
                "schema": {
                    "type": "object",
                    "properties": {
                        "summary": {
                            "type": "string",
                            "description": "Brief 1-2 sentence summary of the key finding"
                        },
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
                                            "assessment": {"type": "string"}
                                        },
                                        "required": ["metric", "value", "assessment"],
                                        "additionalProperties": False
                                    }
                                },
                                "insights": {
                                    "type": "array",
                                    "items": {"type": "string"},
                                    "description": "Key insights from the data"
                                }
                            },
                            "required": ["key_metrics", "insights"],
                            "additionalProperties": False
                        },
                        "recommendations": {
                            "type": "array",
                            "items": {
                                "type": "object",
                                "properties": {
                                    "action": {"type": "string"},
                                    "priority": {"type": "string", "enum": ["high", "medium", "low"]},
                                    "expected_impact": {"type": "string"}
                                },
                                "required": ["action", "priority", "expected_impact"],
                                "additionalProperties": False
                            }
                        },
                        "tools_used": {
                            "type": "array",
                            "items": {"type": "string"},
                            "description": "List of tools called during analysis"
                        }
                    },
                    "required": ["summary", "analysis", "recommendations", "tools_used"],
                    "additionalProperties": False
                }
            }
        }

    def run_agent(self, user_query: str, access_token: str, max_iterations: int = 10) -> Dict[str, Any]:
        """
        Run the agentic workflow.

        The agent will:
        1. Analyze the user's query
        2. Decide which tools to call
        3. Execute tools in sequence
        4. Synthesize results into a structured response
        """

        messages =  [
            {
                "role": "system",
                "content": f"""You are an expert financial advisor AI agent with access to the user's financial data through Plaid.

Your role:
1. Understand the user's question and identify what financial data is needed
2. Call the appropriate tools to gather comprehensive data
3. Analyze the data holistically across multiple dimensions
4. Provide specific, actionable recommendations with dollar amounts and timelines

Analysis Strategy:
- For spending questions: Check balances, analyze categories, identify recurring charges
- For savings/goals: Calculate savings rate, project timeline, assess current position
- For affordability: Review balances, debt-to-income ratio, and spending patterns
- For optimization: Identify recurring charges, analyze spending categories, suggest alternatives

Guidelines:
- Always call multiple tools to get a complete picture
- Be specific with numbers, percentages, and timelines
- Prioritize recommendations by impact and feasibility
- Base all advice on actual data, not assumptions
- If data is missing or a tool fails, acknowledge it clearly

Use the access_token: {access_token}

"""
            },
            {
                "role": "user",
                "content": user_query
            }
        ]

        tool_call_count = 0
        tools_called = []

        for iteration in range(max_iterations):

            response = self.openai_client.chat.completions.create(
                model=self.deployment_name,
                messages=messages,
                tools=self.tools,
                tool_choice="auto",
                temperature=0.3
            )
            print("Response: ", response)

            response_message = response.choices[0].message
            messages.append(response_message)

            if not response_message.tool_calls:
                # No more tools to call, generate structured final answer
                final_response = self.openai_client.chat.completions.create(
                    model=self.deployment_name,
                    messages=messages + [{
                        "role": "user",
                        "content": f"Based on all the data gathered, provide a structured financial analysis. Tools used: {', '.join(tools_called)}"
                    }],
                    response_format=self._get_response_schema(),
                    temperature=0.3
                )

                structured_answer = json.loads(final_response.choices[0].message.content)

                return {
                    "query": user_query,
                    "answer": structured_answer,
                    "tools_used": tool_call_count,
                    "iterations": iteration + 1
                }

            # Execute each tool call
            for tool_call in response_message.tool_calls:
                function_name = tool_call.function.name
                function_args = json.loads(tool_call.function.arguments)

                # Inject access_token if not present
                if 'access_token' not in function_args:
                    function_args['access_token'] = access_token

                print(f"🔧 Calling tool: {function_name}")
                print(f"   Arguments: {json.dumps(function_args, indent=2)}")

                # Track tools used
                if function_name not in tools_called:
                    tools_called.append(function_name)

                # Execute the tool
                function_response = self._execute_tool(function_name, function_args)

                print(f"   Result: {function_response[:200]}...")

                # Add the tool response to messages
                messages.append({
                    "tool_call_id": tool_call.id,
                    "role": "tool",
                    "name": function_name,
                    "content": function_response
                })

                tool_call_count += 1
        
        # If we 
        # hit max iterations, return what we have
        return {
            "query": user_query,
            "answer": "Analysis incomplete - reached maximum tool calls",
            "tools_used": tool_call_count,
            "iterations": max_iterations
        }




        

        



