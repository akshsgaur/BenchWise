"""
AI Chatbot service using insight_agent_service pattern.
Provides conversational interface to user's financial data.
"""

import json
import os
from datetime import datetime
from typing import Any, Dict, List, Optional

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from openai import OpenAI

from insight_data_repository import InsightDataRepository

load_dotenv()

app = FastAPI(title="BenchWise AI Chatbot", version="1.0.0")

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your domains
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ChatRequest(BaseModel):
    user_id: str
    question: str
    conversation_history: Optional[List[Dict[str, str]]] = None


class ChatbotAgent:
    """Conversational AI agent for personalized financial advice."""

    def __init__(self, mongo_uri: Optional[str] = None, db_name: Optional[str] = None):
        self.repository = InsightDataRepository(mongo_uri=mongo_uri, db_name=db_name)

        api_key = os.getenv("AZURE_OPENAI_API_KEY") or os.getenv("OPENAI_API_KEY")
        base_url = os.getenv("ENDPOINT_URL")
        deployment = os.getenv("DEPLOYMENT_NAME") or os.getenv("OPENAI_MODEL")

        self.openai_client: Optional[OpenAI] = None
        self.model_name: Optional[str] = None

        if api_key and deployment:
            base = f"{base_url.rstrip('/')}/openai/v1/" if base_url else None
            self.openai_client = OpenAI(api_key=api_key, base_url=base)
            self.model_name = deployment
        else:
            print("⚠️ ChatbotAgent initialized without OpenAI credentials")

        self.tools = self._define_tools()

    def _define_tools(self) -> List[Dict[str, Any]]:
        """Define financial analysis tools available to the agent."""
        return [
            {
                "type": "function",
                "function": {
                    "name": "get_account_balances",
                    "description": "Get current account balances, assets, debt, and net worth.",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "user_id": {"type": "string"},
                            "period_days": {"type": "integer", "description": "Lookback window for analysis"},
                        },
                        "required": ["user_id"],
                    },
                },
            },
            {
                "type": "function",
                "function": {
                    "name": "get_income_and_spending",
                    "description": "Get income, spending, net cashflow, and savings rate for a period.",
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
                    "description": "Analyze spending broken down by categories with trends.",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "user_id": {"type": "string"},
                            "period_days": {"type": "integer"},
                            "top": {"type": "integer", "description": "Number of top categories", "default": 10},
                        },
                        "required": ["user_id"],
                    },
                },
            },
            {
                "type": "function",
                "function": {
                    "name": "get_recurring_subscriptions",
                    "description": "Identify recurring charges and subscriptions.",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "user_id": {"type": "string"},
                            "window_days": {"type": "integer", "default": 90},
                        },
                        "required": ["user_id"],
                    },
                },
            },
            {
                "type": "function",
                "function": {
                    "name": "get_unusual_transactions",
                    "description": "Find unusually large or suspicious transactions.",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "user_id": {"type": "string"},
                            "period_days": {"type": "integer"},
                            "limit": {"type": "integer", "default": 5},
                        },
                        "required": ["user_id"],
                    },
                },
            },
            {
                "type": "function",
                "function": {
                    "name": "calculate_savings_goal_timeline",
                    "description": "Project timeline to reach a savings goal based on current savings rate.",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "user_id": {"type": "string"},
                            "goal_amount": {"type": "number", "description": "Target savings amount in USD"},
                            "period_days": {"type": "integer", "default": 60},
                        },
                        "required": ["user_id", "goal_amount"],
                    },
                },
            },
        ]

    def _execute_tool(self, tool_name: str, arguments: Dict[str, Any]) -> Dict[str, Any]:
        """Execute a tool and return results."""
        user_id = arguments.get("user_id")
        period_days = arguments.get("period_days", 60)

        try:
            snapshot = self.repository.get_snapshot(user_id, period_days)

            if tool_name == "get_account_balances":
                return {
                    "accountSummary": snapshot["accountSummary"],
                    "netWorth": snapshot["accountSummary"]["netWorth"],
                    "totalAssets": snapshot["accountSummary"]["totalAssets"],
                    "totalDebt": snapshot["accountSummary"]["totalDebt"],
                }

            elif tool_name == "get_income_and_spending":
                cashflow = snapshot["cashflow"]["current"]
                return {
                    "periodDays": period_days,
                    "totalIncome": cashflow["totalIncome"],
                    "totalSpend": cashflow["totalSpend"],
                    "netCashflow": cashflow["netCashflow"],
                    "savingsRate": cashflow["savingsRate"],
                }

            elif tool_name == "get_spending_by_category":
                top = arguments.get("top", 10)
                return {
                    "categories": snapshot["categoryBreakdown"][:top],
                    "totalSpend": snapshot["totalSpend"],
                }

            elif tool_name == "get_recurring_subscriptions":
                return {
                    "recurring": snapshot["recurringCharges"],
                    "totalMonthlyRecurring": sum(r.get("averageAmount", 0) for r in snapshot["recurringCharges"]),
                }

            elif tool_name == "get_unusual_transactions":
                limit = arguments.get("limit", 5)
                return {
                    "anomalies": snapshot["anomalies"][:limit],
                    "largestTransactions": snapshot["topTransactions"][:limit],
                }

            elif tool_name == "calculate_savings_goal_timeline":
                goal_amount = arguments["goal_amount"]
                cashflow = snapshot["cashflow"]["current"]
                current_assets = snapshot["accountSummary"]["totalAssets"]
                monthly_savings = cashflow["netCashflow"] * (30 / period_days)

                if goal_amount <= current_assets:
                    return {
                        "goalAmount": goal_amount,
                        "currentSavings": current_assets,
                        "message": "Goal already achieved!",
                        "monthsToGoal": 0,
                    }

                amount_needed = goal_amount - current_assets
                if monthly_savings <= 0:
                    return {
                        "goalAmount": goal_amount,
                        "currentSavings": current_assets,
                        "monthlySavings": monthly_savings,
                        "message": "Currently not saving. Need to increase income or reduce expenses.",
                        "monthsToGoal": None,
                    }

                months_to_goal = amount_needed / monthly_savings
                return {
                    "goalAmount": goal_amount,
                    "currentSavings": current_assets,
                    "amountNeeded": amount_needed,
                    "monthlySavings": monthly_savings,
                    "monthsToGoal": round(months_to_goal, 1),
                    "yearsToGoal": round(months_to_goal / 12, 1),
                }

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
        """Answer a user's financial question using agentic workflow."""

        if not self.openai_client or not self.model_name:
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

        # Get initial context
        snapshot = self.repository.get_snapshot(user_id, period_days=60)

        system_prompt = """You are BenchWise's AI Financial Advisor. You help users understand their finances through conversational Q&A.

Your role:
- Answer user questions about their spending, income, savings, subscriptions, and financial goals
- Use tools to fetch real financial data from their accounts
- Provide specific, actionable insights with dollar amounts and percentages
- Be conversational and friendly while remaining professional
- Always ground advice in actual data from tools

Guidelines:
- Call relevant tools to get accurate, up-to-date information
- Explain financial concepts in simple terms
- Highlight both risks and opportunities
- Provide concrete next steps the user can take
- If data is missing, explain what you need
"""

        # Build conversation messages
        messages: List[Dict[str, Any]] = [{"role": "system", "content": system_prompt}]

        # Add conversation history if provided
        if conversation_history:
            messages.extend(conversation_history[-6:])  # Keep last 3 exchanges

        # Add current question
        messages.append({"role": "user", "content": question})

        tools_used: List[str] = []

        # Agent loop
        for iteration in range(max_iterations):
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

            # No more tools to call - generate final structured answer
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
                    structured_answer["iterations"] = iteration + 1
                    return {"answer": structured_answer, "query": question, "tools_used": len(tools_used)}
                except json.JSONDecodeError:
                    # Fallback to plain text response
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

            # Execute tool calls
            for tool_call in response_message.tool_calls:
                function_name = tool_call.function.name
                try:
                    function_args = json.loads(tool_call.function.arguments or "{}")
                except json.JSONDecodeError:
                    function_args = {}

                # Inject user_id if not present
                function_args.setdefault("user_id", user_id)

                tool_result = self._execute_tool(function_name, function_args)
                tools_used.append(function_name)

                messages.append(
                    {
                        "tool_call_id": tool_call.id,
                        "role": "tool",
                        "name": function_name,
                        "content": json.dumps(tool_result, default=str),
                    }
                )

        # Max iterations reached
        return {
            "answer": {
                "summary": "Analysis incomplete",
                "analysis": {"key_metrics": [], "insights": ["Reached maximum analysis depth"]},
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
                        "summary": {"type": "string", "description": "Brief 1-2 sentence answer"},
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
chatbot_agent = ChatbotAgent(
    mongo_uri=os.getenv("MONGODB_URI"),
    db_name=os.getenv("MONGODB_DB_NAME", "benchwise"),
)


@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "BenchWise AI Chatbot", "timestamp": datetime.utcnow().isoformat()}


@app.post("/api/v1/chatbot/query")
def chat_query(request: ChatRequest):
    """Answer user's financial question using agentic AI."""
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
