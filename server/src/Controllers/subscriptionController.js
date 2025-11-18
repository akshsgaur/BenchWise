const SubscriptionAnalysis = require('../Models/Subscription');
const subscriptionAnalysisService = require('../Services/subscriptionAnalysisService');

/**
 * Analyze subscriptions for the logged-in user
 */
const analyzeSubscriptions = async (req, res) => {
  try {
    const userId = req.user._id;

    console.log(`[INFO] Subscription analysis requested for user ${userId}`);

    // Perform AI analysis
    const analysisResult = await subscriptionAnalysisService.analyzeSubscriptions(userId.toString());

    // Save analysis result to database
    const subscriptionAnalysis = await SubscriptionAnalysis.create({
      userId: userId,
      ...analysisResult
    });

    console.log(`[INFO] Subscription analysis saved with ID: ${subscriptionAnalysis._id}`);

    res.json({
      success: true,
      data: {
        analysis: subscriptionAnalysis,
        message: 'Subscription analysis completed successfully'
      }
    });

  } catch (error) {
    console.error('[ERROR] Subscription analysis failed:', error);
    
    // Handle specific error cases
    if (error.message.includes('No transactions found')) {
      return res.status(404).json({
        success: false,
        message: error.message,
        error: 'NO_TRANSACTIONS'
      });
    }

    if (error.message.includes('OpenAI service is not configured')) {
      return res.status(503).json({
        success: false,
        message: 'AI analysis service is not available. Please configure OpenAI credentials.',
        error: 'SERVICE_NOT_CONFIGURED'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to analyze subscriptions',
      error: error.message
    });
  }
};

/**
 * Get the latest subscription analysis for the logged-in user
 */
const getSubscriptionAnalysis = async (req, res) => {
  try {
    const userId = req.user._id;

    // Get the most recent analysis
    const latestAnalysis = await SubscriptionAnalysis.findOne({ userId })
      .sort({ createdAt: -1 })
      .lean();

    if (!latestAnalysis) {
      return res.json({
        success: true,
        data: {
          analysis: null,
          message: 'No subscription analysis found. Click "Analyze Subscriptions" to generate one.'
        }
      });
    }

    res.json({
      success: true,
      data: {
        analysis: latestAnalysis
      }
    });

  } catch (error) {
    console.error('[ERROR] Failed to fetch subscription analysis:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch subscription analysis',
      error: error.message
    });
  }
};

/**
 * Get all subscription analyses for the logged-in user (history)
 */
const getSubscriptionHistory = async (req, res) => {
  try {
    const userId = req.user._id;
    const limit = parseInt(req.query.limit) || 10;

    const analyses = await SubscriptionAnalysis.find({ userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    res.json({
      success: true,
      data: {
        analyses: analyses,
        count: analyses.length
      }
    });

  } catch (error) {
    console.error('[ERROR] Failed to fetch subscription history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch subscription history',
      error: error.message
    });
  }
};

module.exports = {
  analyzeSubscriptions,
  getSubscriptionAnalysis,
  getSubscriptionHistory
};

