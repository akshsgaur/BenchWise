const OpenAI = require('openai');
const Transaction = require('../Models/Transaction');

class SubscriptionAnalysisService {
  constructor() {
    // Initialize OpenAI client
    const apiKey = process.env.AZURE_OPENAI_API_KEY || process.env.OPENAI_API_KEY;
    const baseUrl = process.env.ENDPOINT_URL;
    const deployment = process.env.DEPLOYMENT_NAME || process.env.OPENAI_MODEL || 'gpt-4';

    this.openaiClient = null;
    this.modelName = deployment;

    if (apiKey && deployment) {
      const base = baseUrl ? `${baseUrl.replace(/\/$/, '')}/openai/v1/` : undefined;
      this.openaiClient = new OpenAI({
        apiKey: apiKey,
        baseURL: base
      });
      console.log(`[INFO] SubscriptionAnalysisService initialized with OpenAI model: ${deployment}`);
    } else {
      console.warn('⚠️ SubscriptionAnalysisService initialized without OpenAI credentials');
    }
  }

  /**
   * Fetch all transactions for a user
   */
  async fetchUserTransactions(userId) {
    try {
      const transactions = await Transaction.find({ userId })
        .sort({ date: -1 })
        .lean();

      console.log(`[INFO] Fetched ${transactions.length} transactions for user ${userId}`);
      return transactions;
    } catch (error) {
      console.error(`[ERROR] Failed to fetch transactions for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Analyze transactions using OpenAI to identify subscriptions
   */
  async analyzeSubscriptions(userId) {
    if (!this.openaiClient) {
      throw new Error('OpenAI service is not configured. Please set AZURE_OPENAI_API_KEY or OPENAI_API_KEY and DEPLOYMENT_NAME environment variables.');
    }

    try {
      // Fetch all transactions
      const transactions = await this.fetchUserTransactions(userId);

      if (!transactions || transactions.length === 0) {
        throw new Error('No transactions found for analysis. Please connect your bank account and sync transactions.');
      }

      // Prepare transaction data for AI analysis
      const transactionData = transactions.map(tx => ({
        name: tx.name,
        merchant_name: tx.merchant_name,
        amount: tx.amount,
        date: tx.date,
        category: tx.category || [],
        subcategory: tx.subcategory || []
      }));

      // Calculate date range
      const dates = transactions.map(tx => tx.date).sort();
      const dateRange = {
        start: dates[dates.length - 1] || new Date().toISOString().split('T')[0],
        end: dates[0] || new Date().toISOString().split('T')[0]
      };

      // Create prompt for OpenAI
      const systemPrompt = `You are a financial analysis AI that identifies recurring subscriptions and recurring charges from transaction data.

Your task is to analyze transaction data and identify:
1. Recurring subscriptions (Netflix, Spotify, gym memberships, etc.)
2. Recurring bills (utilities, phone, internet, etc.)
3. Subscription frequency (monthly, yearly, weekly, etc.)
4. Category classification (Entertainment, Productivity, Utilities, Health & Fitness, etc.)

Return a JSON response with the following structure:
{
  "subscriptions": [
    {
      "name": "Subscription name",
      "merchant": "Merchant name",
      "amount": 9.99,
      "frequency": "monthly",
      "category": "Entertainment",
      "nextBillingDate": "2024-02-15",
      "lastTransactionDate": "2024-01-15",
      "transactionCount": 3,
      "isActive": true,
      "confidence": 0.95,
      "notes": "Any additional notes"
    }
  ],
  "summary": {
    "totalMonthlySpending": 150.00,
    "totalYearlySpending": 1800.00,
    "activeSubscriptions": 5,
    "savingsPotential": 25.00,
    "averageMonthlyPerSubscription": 30.00
  },
  "insights": {
    "recommendations": ["Consider canceling unused subscriptions", "Bundle services for savings"],
    "warnings": ["Multiple streaming services detected"],
    "opportunities": ["Annual plans may save 20%"]
  }
}

Guidelines:
- Only identify transactions that show clear recurring patterns (same merchant, similar amounts, regular intervals)
- Set confidence score based on pattern strength (0.0 to 1.0)
- Calculate monthly spending by converting all frequencies to monthly equivalents
- Identify potential savings opportunities
- Group subscriptions by category`;

      const userPrompt = `Analyze the following transaction data and identify all recurring subscriptions and bills:

Transaction Data:
${JSON.stringify(transactionData, null, 2)}

Date Range: ${dateRange.start} to ${dateRange.end}
Total Transactions: ${transactions.length}

Please provide a comprehensive analysis of subscriptions found in this data. Return your response as valid JSON only, following the structure specified in the system prompt.`;

      console.log(`[INFO] Calling OpenAI API for subscription analysis (${transactions.length} transactions)`);

      // Call OpenAI API
      const response = await this.openaiClient.chat.completions.create({
        model: this.modelName,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.3,
        max_tokens: 4000
      });

      let analysisResult;
      try {
        analysisResult = JSON.parse(response.choices[0].message.content);
      } catch (parseError) {
        console.error('[ERROR] Failed to parse OpenAI response as JSON:', parseError);
        console.error('[ERROR] Response content:', response.choices[0].message.content);
        throw new Error('Failed to parse AI analysis response. The response was not valid JSON.');
      }

      // Validate and structure the response
      const structuredResult = {
        summary: analysisResult.summary || {
          totalMonthlySpending: 0,
          totalYearlySpending: 0,
          activeSubscriptions: 0,
          savingsPotential: 0,
          averageMonthlyPerSubscription: 0
        },
        subscriptions: analysisResult.subscriptions || [],
        categories: this.groupSubscriptionsByCategory(analysisResult.subscriptions || []),
        insights: analysisResult.insights || {
          recommendations: [],
          warnings: [],
          opportunities: []
        },
        analysisMetadata: {
          transactionCount: transactions.length,
          dateRange: dateRange,
          analyzedAt: new Date(),
          modelVersion: this.modelName
        }
      };

      console.log(`[INFO] Subscription analysis completed: ${structuredResult.subscriptions.length} subscriptions found`);

      return structuredResult;
    } catch (error) {
      console.error('[ERROR] Subscription analysis failed:', error);
      throw error;
    }
  }

  /**
   * Group subscriptions by category
   */
  groupSubscriptionsByCategory(subscriptions) {
    const categoryMap = {};

    subscriptions.forEach(sub => {
      const category = sub.category || 'Other';
      if (!categoryMap[category]) {
        categoryMap[category] = {
          category: category,
          totalAmount: 0,
          subscriptionCount: 0,
          subscriptions: []
        };
      }
      categoryMap[category].subscriptions.push(sub);
      categoryMap[category].subscriptionCount += 1;
      
      // Convert amount to monthly equivalent
      let monthlyAmount = sub.amount;
      if (sub.frequency === 'yearly') {
        monthlyAmount = sub.amount / 12;
      } else if (sub.frequency === 'weekly') {
        monthlyAmount = sub.amount * 4.33;
      } else if (sub.frequency === 'bi-weekly') {
        monthlyAmount = sub.amount * 2.17;
      } else if (sub.frequency === 'quarterly') {
        monthlyAmount = sub.amount / 3;
      }
      
      categoryMap[category].totalAmount += monthlyAmount;
    });

    return Object.values(categoryMap);
  }
}

module.exports = new SubscriptionAnalysisService();

