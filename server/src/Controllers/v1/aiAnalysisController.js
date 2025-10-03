const axios = require('axios');
const Analysis = require('../../Models/Analysis');
const Advice = require('../../Models/Advice');
const Integration = require('../../Models/Integration');

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';
const AI_API_KEY = process.env.BENCHWISE_AI_API_KEY || 'benchwise-ai-secret-key';

// Get monthly analysis
const getMonthlyAnalysis = async (req, res) => {
  try {
    const { user } = req;
    const { month, year } = req.query;

    // Get user's Plaid integration
    const integration = await Integration.findOne({ userId: user._id });

    if (!integration || !integration.plaid.isIntegrated) {
      return res.status(404).json({
        error: 'No bank integration found',
        message: 'Please connect your bank account first'
      });
    }

    // Calculate date range
    const startDate = `${year}-${month.padStart(2, '0')}-01`;
    const endOfMonth = new Date(year, month, 0).getDate();
    const endDate = `${year}-${month.padStart(2, '0')}-${endOfMonth}`;

    // Call Python AI service
    const response = await axios.post(
      `${AI_SERVICE_URL}/api/v1/analyze/monthly`,
      {
        access_token: integration.plaid.accessToken,
        start_date: startDate,
        end_date: endDate,
        user_id: user._id.toString()
      },
      {
        headers: {
          'X-API-Key': AI_API_KEY,
          'Content-Type': 'application/json'
        }
      }
    );

    // Save to MongoDB
    const analysis = new Analysis(response.data.data);
    await analysis.save();

    res.json({
      success: true,
      analysis: response.data.data,
      message: 'Monthly analysis completed and saved'
    });

  } catch (error) {
    console.error('Monthly analysis error:', error);
    res.status(500).json({
      error: 'Analysis failed',
      message: error.response?.data?.detail || error.message
    });
  }
};

// Get personalized advice
const getPersonalizedAdvice = async (req, res) => {
  try {
    const { user } = req;
    const { question } = req.body;

    if (!question) {
      return res.status(400).json({
        error: 'Missing question',
        message: 'Please provide a financial question'
      });
    }

    // Get user's Plaid integration
    const integration = await Integration.findOne({ userId: user._id });

    if (!integration || !integration.plaid.isIntegrated) {
      return res.status(404).json({
        error: 'No bank integration found',
        message: 'Please connect your bank account first'
      });
    }

    // Call Python AI service
    const response = await axios.post(
      `${AI_SERVICE_URL}/api/v1/advice/personalized`,
      {
        access_token: integration.plaid.accessToken,
        question: question,
        user_id: user._id.toString()
      },
      {
        headers: {
          'X-API-Key': AI_API_KEY,
          'Content-Type': 'application/json'
        }
      }
    );

    // Save to MongoDB
    const advice = new Advice(response.data.data);
    await advice.save();

    res.json({
      success: true,
      advice: response.data.data.advice,
      message: 'Financial advice generated successfully'
    });

  } catch (error) {
    console.error('Advice generation error:', error);
    res.status(500).json({
      error: 'Failed to generate advice',
      message: error.response?.data?.detail || error.message
    });
  }
};

// Get historical analyses
const getHistoricalAnalyses = async (req, res) => {
  try {
    const { user } = req;
    const { limit = 12 } = req.query;

    const analyses = await Analysis.find({ userId: user._id })
      .sort({ analysisDate: -1 })
      .limit(parseInt(limit))
      .select('-rawTransactions -accountsSnapshot'); // Exclude large fields

    res.json({
      success: true,
      count: analyses.length,
      analyses: analyses,
      message: 'Historical analyses retrieved successfully'
    });

  } catch (error) {
    console.error('Get historical analyses error:', error);
    res.status(500).json({
      error: 'Failed to retrieve analyses',
      message: error.message
    });
  }
};

// Get batch insights
const getBatchInsights = async (req, res) => {
  try {
    const { user } = req;
    const { startDate, endDate } = req.query;

    const integration = await Integration.findOne({ userId: user._id });

    if (!integration || !integration.plaid.isIntegrated) {
      return res.status(404).json({
        error: 'No bank integration found'
      });
    }

    const response = await axios.post(
      `${AI_SERVICE_URL}/api/v1/insights/batch`,
      {
        access_token: integration.plaid.accessToken,
        start_date: startDate,
        end_date: endDate,
        user_id: user._id.toString()
      },
      {
        headers: {
          'X-API-Key': AI_API_KEY,
          'Content-Type': 'application/json'
        }
      }
    );

    res.json({
      success: true,
      insights: response.data.data,
      message: 'Batch insights generated successfully'
    });

  } catch (error) {
    console.error('Batch insights error:', error);
    res.status(500).json({
      error: 'Failed to generate insights',
      message: error.response?.data?.detail || error.message
    });
  }
};

module.exports = {
  getMonthlyAnalysis,
  getPersonalizedAdvice,
  getHistoricalAnalyses,
  getBatchInsights
};
