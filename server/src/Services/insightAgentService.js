const OpenAI = require('openai');
const InsightDataRepository = require('./insightDataRepository');

/**
 * Autonomous analytics agent that generates BenchWise insights.
 * Migrated from Python insight_agent_service.py
 */
class InsightAgentService {
  constructor(mongoUri = null, dbName = null) {
    this.repository = new InsightDataRepository(mongoUri, dbName);

    const apiKey = (process.env.AZURE_OPENAI_API_KEY || process.env.OPENAI_API_KEY || '').trim();
    const baseUrl = (process.env.ENDPOINT_URL || '').trim();
    const deployment = (process.env.DEPLOYMENT_NAME || process.env.OPENAI_MODEL || '').trim();

    this.openaiClient = null;
    this.modelName = null;

    if (apiKey && (deployment || process.env.OPENAI_MODEL)) {
      const base = baseUrl ? `${baseUrl.replace(/\/$/, '')}/openai/v1/` : undefined;
      this.openaiClient = new OpenAI({
        apiKey: apiKey,
        baseURL: base
      });
      this.modelName = deployment || process.env.OPENAI_MODEL;
    } else {
      console.warn('⚠️ InsightAgentService initialized without OpenAI credentials; falling back to heuristics.');
    }

    this.tools = this._defineTools();
  }

  /**
   * Generate insights for all users
   */
  async generateForAllUsers(periodDays = 60) {
    const integrations = await this.repository.findIntegrationsWithPlaid();
    console.log(`[INFO] Generating insights for ${integrations.length} users (window=${periodDays}d)`);
    for (const integration of integrations) {
      const userId = integration.userId.toString();
      try {
        await this.generateForUser(userId, periodDays);
      } catch (exc) {
        console.error(`[ERROR] Insight generation failed for user ${userId}: ${exc.message}`);
      }
    }
  }

  /**
   * Generate insights for a specific user
   */
  async generateForUser(userId, periodDays = 60) {
    const snapshot = await this.repository.getSnapshot(userId, periodDays);

    if (snapshot.transactionCount === 0) {
      const placeholder = this._buildPlaceholderDocument(snapshot);
      await this.repository.saveInsightDocument(userId, placeholder);
      console.log(`[INFO] No transactions for user ${userId}. Stored placeholder insight.`);
      return { status: 'placeholder', userId: userId };
    }

    if (!this.openaiClient || !this.modelName) {
      const fallback = this._buildFallbackDocument(snapshot);
      await this.repository.saveInsightDocument(userId, fallback);
      console.log(`[WARNING] Stored heuristic insight for user ${userId} (OpenAI unavailable).`);
      return { status: 'heuristic', userId: userId };
    }

    const structuredResponse = await this._runAgent(userId, snapshot);

    if (!structuredResponse) {
      const fallback = this._buildFallbackDocument(snapshot);
      await this.repository.saveInsightDocument(userId, fallback);
      console.log(`[WARNING] Agent returned no response for user ${userId}; stored heuristic insight.`);
      return { status: 'heuristic', userId: userId };
    }

    const document = this._buildInsightDocument(snapshot, structuredResponse);
    await this.repository.saveInsightDocument(userId, document);
    console.log(`[SUCCESS] Stored AI insight for user ${userId} with ${document.keyMetrics.length} metrics.`);
    return { status: 'success', userId: userId, insight: structuredResponse };
  }

  /**
   * Define tools available to the agent
   */
  _defineTools() {
    return [
      {
        type: 'function',
        function: {
          name: 'get_account_overview',
          description: 'Summarize balances, debt, and net worth across connected accounts.',
          parameters: {
            type: 'object',
            properties: {
              user_id: { type: 'string' },
              period_days: { type: 'integer', description: 'Lookback window' }
            },
            required: ['user_id']
          }
        }
      },
      {
        type: 'function',
        function: {
          name: 'get_cashflow_summary',
          description: 'Return income, spending, net cashflow, and savings rate with baseline comparison.',
          parameters: {
            type: 'object',
            properties: {
              user_id: { type: 'string' },
              period_days: { type: 'integer' }
            },
            required: ['user_id']
          }
        }
      },
      {
        type: 'function',
        function: {
          name: 'get_spending_trends',
          description: 'Fetch top spending categories and trend changes from the prior period.',
          parameters: {
            type: 'object',
            properties: {
              user_id: { type: 'string' },
              period_days: { type: 'integer' },
              top: { type: 'integer', description: 'Number of categories', default: 10 }
            },
            required: ['user_id']
          }
        }
      },
      {
        type: 'function',
        function: {
          name: 'get_recurring_expenses',
          description: 'Identify recurring merchants and their average spend.',
          parameters: {
            type: 'object',
            properties: {
              user_id: { type: 'string' },
              window_days: {
                type: 'integer',
                description: 'Lookback window for recurring detection',
                default: 90
              }
            },
            required: ['user_id']
          }
        }
      },
      {
        type: 'function',
        function: {
          name: 'get_anomaly_transactions',
          description: 'List unusually large transactions that exceed statistical thresholds.',
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
          name: 'get_opportunity_signals',
          description: 'Surface heuristic insights such as high recurring spend or low savings rate.',
          parameters: {
            type: 'object',
            properties: {
              user_id: { type: 'string' },
              period_days: { type: 'integer' }
            },
            required: ['user_id']
          }
        }
      }
    ];
  }

  /**
   * Execute a tool
   */
  async _executeTool(toolName, arguments_) {
    const userId = arguments_.user_id;
    const periodDays = arguments_.period_days || 60;

    if (toolName === 'get_account_overview') {
      const snapshot = await this.repository.getSnapshot(userId, periodDays);
      return snapshot.accountSummary;
    }

    if (toolName === 'get_cashflow_summary') {
      const snapshot = await this.repository.getSnapshot(userId, periodDays);
      return snapshot.cashflow;
    }

    if (toolName === 'get_spending_trends') {
      const snapshot = await this.repository.getSnapshot(userId, periodDays);
      const top = arguments_.top || 10;
      return {
        topCategories: snapshot.categoryBreakdown.slice(0, top),
        totalSpend: snapshot.totalSpend
      };
    }

    if (toolName === 'get_recurring_expenses') {
      const windowDays = arguments_.window_days || 90;
      const snapshot = await this.repository.getSnapshot(userId, periodDays);
      return {
        windowDays: windowDays,
        recurring: snapshot.recurringCharges
      };
    }

    if (toolName === 'get_anomaly_transactions') {
      const limit = arguments_.limit || 5;
      const snapshot = await this.repository.getSnapshot(userId, periodDays);
      return {
        anomalies: snapshot.anomalies.slice(0, limit),
        topTransactions: snapshot.topTransactions.slice(0, limit)
      };
    }

    if (toolName === 'get_opportunity_signals') {
      const snapshot = await this.repository.getSnapshot(userId, periodDays);
      return { signals: snapshot.opportunitySignals };
    }

    return { error: `Unknown tool: ${toolName}` };
  }

  /**
   * Run the agent loop
   */
  async _runAgent(userId, snapshot, maxIterations = 6) {
    const baseContext = {
      periodDays: snapshot.periodDays,
      dateRange: snapshot.dateRange,
      accountSummary: snapshot.accountSummary,
      cashflow: snapshot.cashflow,
      categoryHighlights: snapshot.categoryBreakdown.slice(0, 5),
      opportunitySignals: snapshot.opportunitySignals,
      netCashflow: snapshot.netCashflow,
      transactionCount: snapshot.transactionCount
    };

    const systemPrompt = (
      "You are BenchWise's senior financial analyst. Always ground advice in the provided data " +
      "and supplement it with tool calls to gather missing context. Quantify insights using USD, " +
      "highlight both risks and wins, and close with clear next steps the user can take."
    );

    const instructions = (
      "Analyze the financial context and produce actionable insights. Use tools to fill gaps. " +
      "When data is insufficient, clearly state assumptions or missing pieces. " +
      "Always populate key_metrics with label, value, and displayValue, and include alerts even if empty."
    );

    const contextPayload = this._makeJsonSafe(baseContext);

    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `${instructions}\n\nContext:\n${JSON.stringify(contextPayload, null, 2)}` }
    ];

    const toolsUsed = [];

    for (let iteration = 0; iteration < maxIterations; iteration++) {
      const response = await this.openaiClient.chat.completions.create({
        model: this.modelName,
        messages: messages,
        tools: this.tools,
        tool_choice: 'auto',
        temperature: 0.2
      });

      const responseMessage = response.choices[0].message;
      messages.push({
        role: responseMessage.role,
        content: responseMessage.content,
        tool_calls: responseMessage.tool_calls
      });

      if (!responseMessage.tool_calls) {
        const finalRequest = [
          ...messages,
          {
            role: 'user',
            content: (
              'Synthesize a structured insight report using the schema. Include quick stats, insights, ' +
              'recommendations, and alerts.'
            )
          }
        ];

        const finalResponse = await this.openaiClient.chat.completions.create({
          model: this.modelName,
          messages: finalRequest,
          response_format: this._responseSchema(),
          temperature: 0.2
        });

        const rawContent = finalResponse.choices[0].message.content;
        try {
          const parsed = JSON.parse(rawContent);
          parsed.tools_used = toolsUsed;
          parsed.iterations = iteration + 1;
          return parsed;
        } catch (error) {
          console.warn('[WARNING] Failed to parse agent response as JSON.');
          return null;
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

        functionArgs.user_id = functionArgs.user_id || userId;
        functionArgs.period_days = functionArgs.period_days || snapshot.periodDays;

        const toolResult = await this._executeTool(functionName, functionArgs);
        toolsUsed.push(functionName);

        messages.push({
          tool_call_id: toolCall.id,
          role: 'tool',
          name: functionName,
          content: JSON.stringify(this._makeJsonSafe(toolResult))
        });
      }
    }

    console.warn('[WARNING] Agent reached maximum iterations without final response.');
    return null;
  }

  /**
   * Response schema for structured output
   */
  _responseSchema() {
    return {
      type: 'json_schema',
      json_schema: {
        name: 'benchwise_insight_response',
        schema: {
          type: 'object',
          properties: {
            summary: {
              type: 'object',
              properties: {
                headline: { type: 'string' },
                narrative: { type: 'string' }
              },
              required: ['headline', 'narrative'],
              additionalProperties: false
            },
            key_metrics: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  label: { type: 'string' },
                  value: { type: ['number', 'null'] },
                  displayValue: { type: ['string', 'null'] }
                },
                required: ['label', 'value', 'displayValue'],
                additionalProperties: false
              }
            },
            highlights: {
              type: 'array',
              items: { type: 'string' }
            },
            recommendations: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  title: { type: 'string' },
                  detail: { type: 'string' },
                  impact: { type: ['string', 'null'] },
                  action: { type: ['string', 'null'] },
                  category: { type: ['string', 'null'] }
                },
                required: ['title', 'detail', 'impact', 'action', 'category'],
                additionalProperties: false
              }
            },
            alerts: {
              type: 'array',
              items: { type: 'string' }
            }
          },
          required: ['summary', 'key_metrics', 'recommendations', 'highlights', 'alerts'],
          additionalProperties: false
        },
        strict: true
      }
    };
  }

  /**
   * Build placeholder document when no transactions
   */
  _buildPlaceholderDocument(snapshot) {
    return {
      summary: {
        headline: 'Connect accounts to unlock insights',
        narrative: (
          'No financial data available for analysis. Connect your accounts to get personalized AI insights and recommendations.'
        )
      },
      keyMetrics: [],
      highlights: [],
      recommendations: [],
      alerts: [],
      context: {
        periodDays: snapshot.periodDays,
        dateRange: snapshot.dateRange,
        transactionCount: 0,
        totalIncome: 0,
        totalSpend: 0,
        netCashflow: 0,
        generatedFrom: 'typescript-ai-agent-v1'
      },
      generatedAt: new Date(),
      version: 1
    };
  }

  /**
   * Build fallback document when OpenAI unavailable
   */
  _buildFallbackDocument(snapshot) {
    const cashflow = snapshot.cashflow.current;
    const accountSummary = snapshot.accountSummary;
    const trend = cashflow.netCashflow >= 0 ? 'positive' : 'negative';

    const summaryText = (
      `BenchWise analyzed the last ${snapshot.periodDays} days. Net cashflow is ${trend} at ` +
      `$${Math.abs(cashflow.netCashflow).toLocaleString('en-US', { maximumFractionDigits: 0 })}. ` +
      `Total assets stand at $${accountSummary.totalAssets.toLocaleString('en-US', { maximumFractionDigits: 0 })} ` +
      `vs. debt of $${accountSummary.totalDebt.toLocaleString('en-US', { maximumFractionDigits: 0 })}.`
    );

    return {
      summary: {
        headline: 'Fresh insights based on recent activity',
        narrative: summaryText
      },
      keyMetrics: this._baselineMetrics(snapshot),
      highlights: snapshot.opportunitySignals.slice(0, 3),
      recommendations: [],
      alerts: [],
      context: {
        periodDays: snapshot.periodDays,
        dateRange: snapshot.dateRange,
        transactionCount: snapshot.transactionCount,
        totalIncome: snapshot.totalIncome,
        totalSpend: snapshot.totalSpend,
        netCashflow: snapshot.netCashflow,
        generatedFrom: 'typescript-ai-agent-v1'
      },
      generatedAt: new Date(),
      version: 1
    };
  }

  /**
   * Build insight document from AI response
   */
  _buildInsightDocument(snapshot, response) {
    const baselineMetrics = this._baselineMetrics(snapshot);
    const agentMetrics = response.key_metrics || [];
    const mergedMetrics = this._mergeMetrics(baselineMetrics, agentMetrics);

    const recommendations = [];
    for (const rec of (response.recommendations || []).slice(0, 6)) {
      recommendations.push({
        title: rec.title || 'Recommendation',
        detail: rec.detail || '',
        impact: rec.impact || null,
        action: rec.action || null,
        category: rec.category || null
      });
    }

    return {
      summary: {
        headline: response.summary?.headline || 'Financial insight update',
        narrative: response.summary?.narrative || ''
      },
      keyMetrics: mergedMetrics,
      highlights: (response.highlights || []).slice(0, 6),
      recommendations: recommendations,
      alerts: (response.alerts || []).slice(0, 6),
      context: {
        periodDays: snapshot.periodDays,
        dateRange: snapshot.dateRange,
        transactionCount: snapshot.transactionCount,
        totalIncome: snapshot.totalIncome,
        totalSpend: snapshot.totalSpend,
        netCashflow: snapshot.netCashflow,
        generatedFrom: 'typescript-ai-agent-v1'
      },
      generatedAt: new Date(),
      version: 1
    };
  }

  /**
   * Generate baseline metrics
   */
  _baselineMetrics(snapshot) {
    const accountSummary = snapshot.accountSummary;
    const cashflow = snapshot.cashflow.current;
    return [
      {
        label: 'Net worth',
        value: accountSummary.netWorth,
        displayValue: this._formatCurrency(accountSummary.netWorth)
      },
      {
        label: 'Total assets',
        value: accountSummary.totalAssets,
        displayValue: this._formatCurrency(accountSummary.totalAssets)
      },
      {
        label: 'Total debt',
        value: accountSummary.totalDebt,
        displayValue: this._formatCurrency(accountSummary.totalDebt)
      },
      {
        label: `${snapshot.periodDays}d income`,
        value: cashflow.totalIncome,
        displayValue: this._formatCurrency(cashflow.totalIncome)
      },
      {
        label: `${snapshot.periodDays}d spend`,
        value: cashflow.totalSpend,
        displayValue: this._formatCurrency(cashflow.totalSpend)
      },
      {
        label: 'Net cashflow',
        value: cashflow.netCashflow,
        displayValue: this._formatCurrency(cashflow.netCashflow)
      },
      {
        label: 'Savings rate',
        value: cashflow.savingsRate,
        displayValue: `${cashflow.savingsRate.toFixed(1)}%`
      }
    ];
  }

  /**
   * Merge baseline and agent metrics
   */
  _mergeMetrics(baselineMetrics, agentMetrics) {
    const merged = [...baselineMetrics];
    const existingLabels = new Set(baselineMetrics.map(m => m.label.toLowerCase()));

    for (const metric of agentMetrics) {
      const label = metric.label;
      if (!label) continue;
      if (existingLabels.has(label.toLowerCase())) continue;

      let numericValue = null;
      const rawValue = metric.value;
      if (typeof rawValue === 'number') {
        numericValue = rawValue;
      } else if (typeof rawValue === 'string') {
        const parsed = parseFloat(rawValue);
        numericValue = isNaN(parsed) ? null : parsed;
      }

      let display = metric.display || metric.displayValue;
      if (!display && numericValue !== null) {
        display = this._formatCurrency(numericValue);
      }

      merged.push({
        label: label,
        value: numericValue,
        displayValue: display
      });
      existingLabels.add(label.toLowerCase());
    }

    return merged.slice(0, 10);
  }

  /**
   * Format currency
   */
  _formatCurrency(value) {
    return `$${value.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
  }

  /**
   * Make payload JSON safe
   */
  _makeJsonSafe(payload) {
    if (typeof payload === 'object' && payload !== null) {
      if (Array.isArray(payload)) {
        return payload.map(item => this._makeJsonSafe(item));
      }
      if (payload instanceof Date) {
        return payload.toISOString();
      }
      const result = {};
      for (const [key, value] of Object.entries(payload)) {
        result[key] = this._makeJsonSafe(value);
      }
      return result;
    }
    if (typeof payload === 'number' || typeof payload === 'string' || typeof payload === 'boolean' || payload === null) {
      return payload;
    }
    return String(payload);
  }
}

module.exports = InsightAgentService;

