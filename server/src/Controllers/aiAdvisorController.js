const ChatMessage = require('../Models/ChatMessage');
const ChatbotAgent = require('../Services/chatbotAgentService');

// Initialize chatbot agent instance
const chatbotAgent = new ChatbotAgent(
  process.env.MONGODB_URI,
  process.env.MONGODB_DB_NAME || 'benchwise'
);

/**
 * Ask the AI advisor a question about user's finances
 */
const askQuestion = async (req, res) => {
  const userId = req.user._id.toString();
  let userMessageSaved = false;

  try {
    const { question, conversation_history } = req.body;

    console.log('[INFO] AI Advisor Request:', {
      userId,
      question: question?.substring(0, 100)
    });

    if (!question || !question.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Question is required'
      });
    }

    // Save user message to database
    try {
      await ChatMessage.create({
        userId: userId,
        role: 'user',
        content: question.trim(),
        metadata: {
          responseType: 'plain'
        }
      });
      userMessageSaved = true;
    } catch (dbError) {
      console.error('[ERROR] Failed to save user message:', dbError);
    }

    // Call TypeScript chatbot agent directly
    console.log('[INFO] Calling TypeScript ChatbotAgent service');
    const result = await chatbotAgent.answerQuestion(
      userId,
      question.trim(),
      conversation_history || null
    );

    const responseType = result.response_type || (typeof result.answer === 'object' ? 'structured' : 'plain');

    // Save assistant response to database
    try {
      await ChatMessage.create({
        userId: userId,
        role: 'assistant',
        content: result.answer,
        metadata: {
          toolsUsed: result.tools_used || 0,
          iterations: result.answer?.iterations || 0,
          responseType: responseType
        }
      });
    } catch (dbError) {
      console.error('[ERROR] Failed to save assistant message:', dbError);
    }

    res.json({
      success: true,
      data: {
        agent_response: result.answer,
        query: result.query,
        tools_used: result.tools_used || 0,
        response_type: responseType
      }
    });

  } catch (error) {
    console.error('Error in AI Advisor askQuestion:', error.message);
    console.error('Error stack:', error.stack);

    // Save error message to database
    if (userMessageSaved) {
      try {
        await ChatMessage.create({
          userId: userId,
          role: 'error',
          content: error.message || 'AI service error',
          metadata: {
            responseType: 'plain',
            error: error.message
          }
        });
      } catch (dbError) {
        console.error('[ERROR] Failed to save error message:', dbError);
      }
    }

    res.status(500).json({
      success: false,
      message: 'Failed to get AI response',
      error: error.message
    });
  }
};

/**
 * Get chat history for the user
 */
const getChatHistory = async (req, res) => {
  try {
    const userId = req.user._id;
    const limit = parseInt(req.query.limit) || 50; // Default to last 50 messages
    const skip = parseInt(req.query.skip) || 0; // For pagination

    // Fetch chat messages for the user, sorted by most recent first
    const messages = await ChatMessage.find({ userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .lean();

    // Get total count for pagination info
    const totalCount = await ChatMessage.countDocuments({ userId });

    // Reverse to show oldest first (chronological order)
    const history = messages.reverse().map(msg => ({
      id: msg._id.toString(),
      type: msg.role === 'assistant' ? 'assistant' : msg.role === 'error' ? 'error' : 'user',
      content: msg.content,
      timestamp: msg.createdAt,
      metadata: msg.metadata || {}
    }));

    res.json({
      success: true,
      data: {
        history: history,
        count: history.length,
        totalCount: totalCount,
        hasMore: (skip + limit) < totalCount,
        currentPage: Math.floor(skip / limit) + 1,
        totalPages: Math.ceil(totalCount / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching chat history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch chat history',
      error: error.message
    });
  }
};

/**
 * Cleanup old chat messages (optional maintenance endpoint)
 * Can be called periodically or manually to prevent database bloat
 */
const cleanupOldMessages = async (req, res) => {
  try {
    const userId = req.user._id;
    const daysToKeep = parseInt(req.query.days) || 90; // Default: keep last 90 days
    const maxMessagesToKeep = parseInt(req.query.maxMessages) || 1000; // Default: keep max 1000 messages

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    // Get total count before cleanup
    const totalBefore = await ChatMessage.countDocuments({ userId });

    // Delete messages older than cutoff date
    const deleteByDateResult = await ChatMessage.deleteMany({
      userId,
      createdAt: { $lt: cutoffDate }
    });

    // If still too many messages, keep only the most recent N messages
    const currentCount = await ChatMessage.countDocuments({ userId });
    if (currentCount > maxMessagesToKeep) {
      // Get IDs of messages to keep (most recent)
      const messagesToKeep = await ChatMessage.find({ userId })
        .sort({ createdAt: -1 })
        .limit(maxMessagesToKeep)
        .select('_id')
        .lean();

      const idsToKeep = messagesToKeep.map(m => m._id);

      // Delete messages not in the keep list
      const deleteByCountResult = await ChatMessage.deleteMany({
        userId,
        _id: { $nin: idsToKeep }
      });

      res.json({
        success: true,
        data: {
          deletedByDate: deleteByDateResult.deletedCount,
          deletedByCount: deleteByCountResult.deletedCount,
          totalDeleted: deleteByDateResult.deletedCount + deleteByCountResult.deletedCount,
          messagesRemaining: maxMessagesToKeep,
          totalBefore,
          message: `Cleanup complete. Kept ${maxMessagesToKeep} most recent messages.`
        }
      });
    } else {
      res.json({
        success: true,
        data: {
          deletedByDate: deleteByDateResult.deletedCount,
          deletedByCount: 0,
          totalDeleted: deleteByDateResult.deletedCount,
          messagesRemaining: currentCount,
          totalBefore,
          message: `Cleanup complete. Deleted messages older than ${daysToKeep} days.`
        }
      });
    }

  } catch (error) {
    console.error('Error cleaning up old messages:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cleanup old messages',
      error: error.message
    });
  }
};

/**
 * Delete all chat messages for the user
 */
const deleteAllMessages = async (req, res) => {
  try {
    const userId = req.user._id;

    // Get count before deletion
    const totalBefore = await ChatMessage.countDocuments({ userId });

    // Delete all messages for this user
    const deleteResult = await ChatMessage.deleteMany({ userId });

    res.json({
      success: true,
      data: {
        deletedCount: deleteResult.deletedCount,
        totalBefore,
        message: `Successfully deleted ${deleteResult.deletedCount} message(s)`
      }
    });

  } catch (error) {
    console.error('Error deleting chat messages:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete chat messages',
      error: error.message
    });
  }
};

/**
 * Diagnostic endpoint to test AI service connectivity
 */
const testPythonService = async (req, res) => {
  try {
    console.log('[DIAGNOSTIC] Testing TypeScript AI service...');
    
    const results = {
      serviceType: 'TypeScript (Direct Integration)',
      timestamp: new Date().toISOString(),
      tests: {}
    };
    
    // Test 1: Service initialization
    try {
      results.tests.serviceInitialization = {
        status: 'success',
        message: 'ChatbotAgent service initialized successfully',
        hasOpenAIClient: !!chatbotAgent.openaiClient,
        modelName: chatbotAgent.modelName || 'Not configured'
      };
    } catch (initError) {
      results.tests.serviceInitialization = {
        status: 'failed',
        error: initError.message,
        message: 'Service initialization failed'
      };
    }
    
    // Test 2: OpenAI configuration
    const hasApiKey = !!(process.env.AZURE_OPENAI_API_KEY || process.env.OPENAI_API_KEY);
    const hasModel = !!(process.env.DEPLOYMENT_NAME || process.env.OPENAI_MODEL);
    results.tests.openAIConfig = {
      status: hasApiKey && hasModel ? 'success' : 'warning',
      hasApiKey: hasApiKey,
      hasModel: hasModel,
      message: hasApiKey && hasModel 
        ? 'OpenAI credentials configured' 
        : 'OpenAI credentials not fully configured'
    };
    
    // Overall status
    const allTestsPassed = Object.values(results.tests).every(test => test.status === 'success');
    results.overallStatus = allTestsPassed ? 'healthy' : 'unhealthy';
    
    res.json({
      success: true,
      data: results,
      recommendation: allTestsPassed 
        ? 'TypeScript AI service is ready'
        : 'Check OpenAI configuration in environment variables'
    });
    
  } catch (error) {
    console.error('[DIAGNOSTIC] Error testing AI service:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to test AI service',
      error: error.message
    });
  }
};

module.exports = {
  askQuestion,
  getChatHistory,
  cleanupOldMessages,
  deleteAllMessages,
  testPythonService // Kept for backward compatibility, but now tests TypeScript service
};
