const OpenAI = require('openai');
const InsightDataRepository = require('./insightDataRepository');

/**
 * Conversational AI agent for personalized financial advice.
 * Migrated from Python chatbot_service.py
 */
class ChatbotAgent {
  constructor(mongoUri = null, dbName = null) {
    console.log(`[INFO] Initializing ChatbotAgent with MongoDB URI: ${mongoUri ? mongoUri.substring(0, 50) : 'Not provided'}...`);
    this.repository = new InsightDataRepository(mongoUri, dbName);
    console.log('[INFO] InsightDataRepository initialized');

    const apiKey = process.env.AZURE_OPENAI_API_KEY || process.env.OPENAI_API_KEY;
    const baseUrl = process.env.ENDPOINT_URL;
    const deployment = process.env.DEPLOYMENT_NAME || process.env.OPENAI_MODEL;

    this.openaiClient = null;
    this.modelName = null;

    if (apiKey && deployment) {
      const base = baseUrl ? `${baseUrl.replace(/\/$/, '')}/openai/v1/` : undefined;
      this.openaiClient = new OpenAI({
        apiKey: apiKey,
        baseURL: base
      });
      this.modelName = deployment;
      console.log(`[INFO] OpenAI client initialized with model: ${deployment}`);
    } else {
      console.warn('⚠️ ChatbotAgent initialized without OpenAI credentials');
      console.log(`[DEBUG] API Key present: ${!!apiKey}, Deployment: ${deployment}`);
    }

    this.tools = this._defineTools();
    console.log(`[INFO] Defined ${this.tools.length} tools for the agent`);
  }

  /**
   * Define financial analysis tools available to the agent
   */
  _defineTools() {
    return [
      {
        type: 'function',
        function: {
          name: 'get_account_balances',
          description: 'Get current account balances, assets, debt, and net worth.',
          parameters: {
            type: 'object',
            properties: {
              user_id: { type: 'string' },
              period_days: { type: 'integer', description: 'Lookback window for analysis' }
            },
            required: ['user_id']
          }
        }
      },
      {
        type: 'function',
        function: {
          name: 'get_income_and_spending',
          description: 'Get income, spending, net cashflow, and savings rate for a period.',
          parameters: {
            type: 'object',
            properties: {
              user_id: { type: 'string' },
              period_days: { type: 'integer', description: 'Number of days (7, 30, 60, or 90)' }
            },
            required: ['user_id']
          }
        }
      },
      {
        type: 'function',
        function: {
          name: 'get_spending_by_category',
          description: 'Analyze spending broken down by categories with trends.',
          parameters: {
            type: 'object',
            properties: {
              user_id: { type: 'string' },
              period_days: { type: 'integer' },
              top: { type: 'integer', description: 'Number of top categories', default: 10 }
            },
            required: ['user_id']
          }
        }
      },
      {
        type: 'function',
        function: {
          name: 'get_recurring_subscriptions',
          description: 'Identify recurring charges and subscriptions.',
          parameters: {
            type: 'object',
            properties: {
              user_id: { type: 'string' },
              window_days: { type: 'integer', default: 90 }
            },
            required: ['user_id']
          }
        }
      },
      {
        type: 'function',
        function: {
          name: 'get_unusual_transactions',
          description: 'Find unusually large or suspicious transactions.',
          parameters: {
            type: 'object',
            properties: {
              user_id: { type: 'string' },
              period_days: { type: 'integer' },
              limit: { type: 'integer', default: 5 }
            },
            required: ['user_id']
          }
        }
      },
      {
        type: 'function',
        function: {
          name: 'calculate_savings_goal_timeline',
          description: 'Project timeline to reach a savings goal based on current savings rate.',
          parameters: {
            type: 'object',
            properties: {
              user_id: { type: 'string' },
              goal_amount: { type: 'number', description: 'Target savings amount in USD' },
              period_days: { type: 'integer', default: 60 }
            },
            required: ['user_id', 'goal_amount']
          }
        }
      }
    ];
  }

  /**
   * Execute a tool and return results
   */
  async _executeTool(toolName, arguments_) {
    const userId = arguments_.user_id || arguments_.user;
    const periodDays = arguments_.period_days || 60;

    if (!userId) {
      console.error(`[ERROR] Tool ${toolName} called without user_id. Arguments:`, arguments_);
      return { error: 'user_id is required' };
    }

    console.log(`[DEBUG] Executing tool ${toolName} for user_id: ${userId}, period_days: ${periodDays}`);

    let snapshot;
    try {
      snapshot = await this.repository.getSnapshot(userId, periodDays);
    } catch (exc) {
      console.error(`[ERROR] Failed to get snapshot in tool ${toolName} for user ${userId}:`, exc);
      return { error: `Failed to retrieve financial data: ${exc.message}` };
    }

    try {

      if (toolName === 'get_account_balances') {
        return {
          accountSummary: snapshot.accountSummary,
          netWorth: snapshot.accountSummary.netWorth,
          totalAssets: snapshot.accountSummary.totalAssets,
          totalDebt: snapshot.accountSummary.totalDebt
        };
      }

      if (toolName === 'get_income_and_spending') {
        const cashflow = snapshot.cashflow.current;
        return {
          periodDays: periodDays,
          totalIncome: cashflow.totalIncome,
          totalSpend: cashflow.totalSpend,
          netCashflow: cashflow.netCashflow,
          savingsRate: cashflow.savingsRate
        };
      }

      if (toolName === 'get_spending_by_category') {
        const top = arguments_.top || 10;
        return {
          categories: snapshot.categoryBreakdown.slice(0, top),
          totalSpend: snapshot.totalSpend
        };
      }

      if (toolName === 'get_recurring_subscriptions') {
        return {
          recurring: snapshot.recurringCharges,
          totalMonthlyRecurring: snapshot.recurringCharges.reduce((sum, r) => sum + (r.averageAmount || 0), 0)
        };
      }

      if (toolName === 'get_unusual_transactions') {
        const limit = arguments_.limit || 5;
        return {
          anomalies: snapshot.anomalies.slice(0, limit),
          largestTransactions: snapshot.topTransactions.slice(0, limit)
        };
      }

      if (toolName === 'calculate_savings_goal_timeline') {
        const goalAmount = arguments_.goal_amount;
        const cashflow = snapshot.cashflow.current;
        const currentAssets = snapshot.accountSummary.totalAssets;
        const monthlySavings = cashflow.netCashflow * (30 / periodDays);

        if (goalAmount <= currentAssets) {
          return {
            goalAmount: goalAmount,
            currentSavings: currentAssets,
            message: 'Goal already achieved!',
            monthsToGoal: 0
          };
        }

        const amountNeeded = goalAmount - currentAssets;
        if (monthlySavings <= 0) {
          return {
            goalAmount: goalAmount,
            currentSavings: currentAssets,
            monthlySavings: monthlySavings,
            message: 'Currently not saving. Need to increase income or reduce expenses.',
            monthsToGoal: null
          };
        }

        const monthsToGoal = amountNeeded / monthlySavings;
        return {
          goalAmount: goalAmount,
          currentSavings: currentAssets,
          amountNeeded: amountNeeded,
          monthlySavings: monthlySavings,
          monthsToGoal: Math.round(monthsToGoal * 10) / 10,
          yearsToGoal: Math.round((monthsToGoal / 12) * 10) / 10
        };
      }

      return { error: `Unknown tool: ${toolName}` };
    } catch (exc) {
      console.error(`[ERROR] Error executing tool ${toolName}:`, exc);
      return { error: `Tool execution failed: ${exc.message}` };
    }
  }

  /**
   * Answer a user's financial question using agentic workflow
   */
  async answerQuestion(userId, question, conversationHistory = null, maxIterations = 8) {
    console.log(`[INFO] answer_question called - User ID: ${userId}, Question: ${question.substring(0, 100)}`);

    if (!this.openaiClient || !this.modelName) {
      console.warn('[WARNING] OpenAI client not configured');
      return {
        answer: {
          summary: 'AI service unavailable',
          analysis: { key_metrics: [], insights: ['OpenAI service is not configured'] },
          recommendations: [],
          tools_used: []
        },
        query: question,
        iterations: 0
      };
    }

    console.log(`[INFO] Starting agent loop for user ${userId}`);

    const systemPrompt = `You are BenchWise's AI Financial Advisor. You help users understand their finances through conversational Q&A.

Your role:
- Answer user questions about their spending, income, savings, subscriptions, and financial goals
- Use tools to fetch real financial data from their accounts
- Provide specific, actionable insights with dollar amounts and percentages
- Be conversational and friendly while remaining professional
- Always ground advice in actual data from tools

Guidelines:
- Call relevant tools to get accurate, up-to-date information
- When calling tools, ALWAYS use the parameter name "user_id" (not "user" or any other variant)
- The user_id parameter will be automatically provided - you don't need to include it in your tool calls
- Explain financial concepts in simple terms
- Highlight both risks and opportunities
- Provide concrete next steps the user can take
- If data is missing, explain what you need`;

    const messages = [{ role: 'system', content: systemPrompt }];

    if (conversationHistory) {
      messages.push(...conversationHistory.slice(-6));
    }

    messages.push({ role: 'user', content: question });

    const toolsUsed = [];

    for (let iteration = 0; iteration < maxIterations; iteration++) {
      console.log(`[INFO] Agent iteration ${iteration + 1}/${maxIterations} for user ${userId}`);
      const response = await this.openaiClient.chat.completions.create({
        model: this.modelName,
        messages: messages,
        tools: this.tools,
        tool_choice: 'auto',
        temperature: 0.3
      });

      const responseMessage = response.choices[0].message;
      messages.push({
        role: responseMessage.role,
        content: responseMessage.content,
        tool_calls: responseMessage.tool_calls
      });

      if (!responseMessage.tool_calls) {
        console.log(`[INFO] No more tool calls, generating final response for user ${userId}`);

        if (toolsUsed.length > 0) {
          console.log(`[INFO] Tools were used (${toolsUsed.length}), generating structured response`);
          const finalResponse = await this.openaiClient.chat.completions.create({
            model: this.modelName,
            messages: [
              ...messages,
              {
                role: 'user',
                content: 'Provide a structured response with summary, key metrics, insights, and recommendations.'
              }
            ],
            response_format: this._responseSchema(),
            temperature: 0.3
          });

          try {
            const structuredAnswer = JSON.parse(finalResponse.choices[0].message.content);
            structuredAnswer.tools_used = toolsUsed;
            structuredAnswer.iterations = iteration + 1;
            structuredAnswer.response_type = 'structured';
            return {
              answer: structuredAnswer,
              query: question,
              tools_used: toolsUsed.length,
              response_type: 'structured'
            };
          } catch (error) {
            const plainText = responseMessage.content || 'Analysis complete';
            return {
              answer: plainText,
              query: question,
              tools_used: toolsUsed.length,
              response_type: 'plain'
            };
          }
        } else {
          console.log('[INFO] No tools used, returning plain text response');
          const plainText = responseMessage.content || "I'm here to help with your financial questions!";
          return {
            answer: plainText,
            query: question,
            tools_used: 0,
            response_type: 'plain'
          };
        }
      }

      for (const toolCall of responseMessage.tool_calls) {
        const functionName = toolCall.function.name;
        let functionArgs = {};
        try {
          functionArgs = JSON.parse(toolCall.function.arguments || '{}');
        } catch (error) {
          functionArgs = {};
        }

        if ('user' in functionArgs && !('user_id' in functionArgs)) {
          functionArgs.user_id = functionArgs.user;
          delete functionArgs.user;
        }

        functionArgs.user_id = userId;

        console.log(`[DEBUG] Executing tool ${functionName} with args:`, JSON.stringify({ ...functionArgs, user_id: '***' }));

        const toolResult = await this._executeTool(functionName, functionArgs);
        toolsUsed.push(functionName);

        if (toolResult && typeof toolResult === 'object' && 'error' in toolResult) {
          console.warn(`[WARNING] Tool ${functionName} returned error:`, toolResult.error);
        }

        messages.push({
          tool_call_id: toolCall.id,
          role: 'tool',
          name: functionName,
          content: JSON.stringify(toolResult)
        });
      }
    }

    return {
      answer: "I've reached the maximum analysis depth. Please try rephrasing your question or breaking it into smaller parts.",
      query: question,
      tools_used: toolsUsed.length,
      response_type: 'plain'
    };
  }

  /**
   * Schema for structured chatbot responses
   */
  _responseSchema() {
    return {
      type: 'json_schema',
      json_schema: {
        name: 'chatbot_response',
        strict: true,
        schema: {
          type: 'object',
          properties: {
            summary: { type: 'string', description: 'Brief 1-2 sentence answer' },
            analysis: {
              type: 'object',
              properties: {
                key_metrics: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      metric: { type: 'string' },
                      value: { type: 'string' },
                      assessment: { type: 'string' }
                    },
                    required: ['metric', 'value', 'assessment'],
                    additionalProperties: false
                  }
                },
                insights: { type: 'array', items: { type: 'string' } }
              },
              required: ['key_metrics', 'insights'],
              additionalProperties: false
            },
            recommendations: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  action: { type: 'string' },
                  priority: { type: 'string', enum: ['high', 'medium', 'low'] },
                  expected_impact: { type: 'string' }
                },
                required: ['action', 'priority', 'expected_impact'],
                additionalProperties: false
              }
            }
          },
          required: ['summary', 'analysis', 'recommendations'],
          additionalProperties: false
        }
      }
    };
  }
}

module.exports = ChatbotAgent;

