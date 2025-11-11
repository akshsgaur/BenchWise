const axios = require('axios');
const ChatMessage = require('../Models/ChatMessage');

const PYTHON_AI_SERVICE_URL = process.env.PYTHON_AI_SERVICE_URL || 'http://localhost:8001';

/**
 * Ask the AI advisor a question about user's finances
 */
const askQuestion = async (req, res) => {
  try {
    const userId = req.user._id.toString();
    const { question } = req.body;

    console.log('AI Advisor - User ID:', userId);
    console.log('AI Advisor - Question:', question);
    console.log('AI Advisor - User object:', req.user);

    if (!question || !question.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Question is required'
      });
    }

    // Save user message to database (even if request fails later)
    let userMessageSaved = false;
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
      // Continue even if save fails
    }

    // Call Python AI chatbot service
    console.log(`[INFO] Calling Python service at ${PYTHON_AI_SERVICE_URL}/api/v1/chatbot/query`);
    const response = await axios.post(
      `${PYTHON_AI_SERVICE_URL}/api/v1/chatbot/query`,
      {
        user_id: userId,
        question: question.trim(),
        conversation_history: req.body.conversation_history || null
      },
      {
        timeout: 60000, // 60 second timeout for AI processing
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('[INFO] Python service response received:', {
      success: response.data.success,
      hasData: !!response.data.data,
      toolsUsed: response.data.data?.tools_used,
      responseType: response.data.data?.response_type
    });

    if (response.data.success) {
      const responseData = response.data.data;
      const agentResponse = responseData.agent_response;
      const responseType = responseData.response_type || (typeof agentResponse === 'object' ? 'structured' : 'plain');
      
      // Save user message to database (if not already saved)
      if (!userMessageSaved) {
        try {
          await ChatMessage.create({
            userId: userId,
            role: 'user',
            content: question.trim(),
            metadata: {
              responseType: 'plain'
            }
          });
        } catch (dbError) {
          console.error('[ERROR] Failed to save user message:', dbError);
        }
      }

      // Save assistant response to database
      try {
        await ChatMessage.create({
          userId: userId,
          role: 'assistant',
          content: agentResponse,
          metadata: {
            toolsUsed: responseData.tools_used || [],
            iterations: agentResponse?.iterations || 0,
            responseType: responseType
          }
        });
      } catch (dbError) {
        console.error('[ERROR] Failed to save assistant message:', dbError);
        // Continue even if save fails
      }

      res.json({
        success: true,
        data: responseData
      });
    } else {
      throw new Error(response.data.message || 'AI service returned error');
    }

  } catch (error) {
    console.error('Error in AI Advisor askQuestion:', error.message);
    console.error('Error details:', {
      code: error.code,
      response: error.response?.data,
      status: error.response?.status,
      config: {
        url: error.config?.url,
        method: error.config?.method
      }
    });

    // Handle different error types
    if (error.code === 'ECONNREFUSED') {
      console.error(`[ERROR] Cannot connect to Python service at ${PYTHON_AI_SERVICE_URL}`);
      
      // Save error message to database
      if (userMessageSaved) {
        try {
          await ChatMessage.create({
            userId: userId,
            role: 'error',
            content: 'AI service is currently unavailable. Please make sure the Python service is running on port 8001.',
            metadata: {
              responseType: 'plain',
              error: 'SERVICE_UNAVAILABLE'
            }
          });
        } catch (dbError) {
          console.error('[ERROR] Failed to save error message:', dbError);
        }
      }
      
      return res.status(503).json({
        success: false,
        message: 'AI service is currently unavailable. Please make sure the Python service is running on port 8001.',
        error: 'SERVICE_UNAVAILABLE'
      });
    }

    if (error.response) {
      // Python service returned an error
      const errorMessage = error.response.data?.detail || 'AI service error';
      
      // Save error message to database
      if (userMessageSaved) {
        try {
          await ChatMessage.create({
            userId: userId,
            role: 'error',
            content: errorMessage,
            metadata: {
              responseType: 'plain',
              error: error.response.data
            }
          });
        } catch (dbError) {
          console.error('[ERROR] Failed to save error message:', dbError);
        }
      }
      
      return res.status(error.response.status || 500).json({
        success: false,
        message: errorMessage,
        error: error.response.data
      });
    }

    // Generic error
    const errorMessage = 'Failed to get AI response';
    
    // Save error message to database
    if (userMessageSaved) {
      try {
        await ChatMessage.create({
          userId: userId,
          role: 'error',
          content: error.message || errorMessage,
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
      message: errorMessage,
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

module.exports = {
  askQuestion,
  getChatHistory,
  cleanupOldMessages,
  deleteAllMessages
};
