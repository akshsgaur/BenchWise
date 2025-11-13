const axios = require('axios');
const ChatMessage = require('../Models/ChatMessage');

const PYTHON_AI_SERVICE_URL = process.env.PYTHON_AI_SERVICE_URL || 'http://localhost:8001';

/**
 * Ask the AI advisor a question about user's finances
 */
const askQuestion = async (req, res) => {
  // Declare variables outside try block so they're accessible in catch block
  const userId = req.user._id.toString();
  let userMessageSaved = false;
  // Note: Render has a 30-second gateway timeout, so we use 25 seconds to avoid 502 errors
  const timeout = process.env.NODE_ENV === 'production' ? 25000 : 60000;
  
  // Validate Python service URL is configured (especially in production)
  const isProduction = process.env.NODE_ENV === 'production';
  const isLocalhost = PYTHON_AI_SERVICE_URL?.includes('localhost') ?? false;
  
  if (isProduction && isLocalhost) {
    const errorMsg = `Python AI Service URL is not configured for production. Current value: ${PYTHON_AI_SERVICE_URL}. Please set PYTHON_AI_SERVICE_URL environment variable in Render dashboard.`;
    console.error(`[ERROR] ${errorMsg}`);
    return res.status(500).json({
      success: false,
      message: 'AI service is not configured. Please contact support.',
      error: 'SERVICE_NOT_CONFIGURED',
      details: errorMsg
    });
  }
  
  try {
    const { question } = req.body;

    console.log('[INFO] AI Advisor Request:', {
      userId,
      question: question?.substring(0, 100),
      pythonServiceUrl: PYTHON_AI_SERVICE_URL,
      timeout: `${timeout}ms`,
      nodeEnv: process.env.NODE_ENV
    });

    if (!question || !question.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Question is required'
      });
    }

    // Save user message to database (even if request fails later)
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
    console.log(`[INFO] Calling Python service at ${PYTHON_AI_SERVICE_URL}/api/v1/chatbot/query (timeout: ${timeout}ms)`);
    const response = await axios.post(
      `${PYTHON_AI_SERVICE_URL}/api/v1/chatbot/query`,
      {
        user_id: userId,
        question: question.trim(),
        conversation_history: req.body.conversation_history || null
      },
      {
        timeout: timeout,
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

    // Handle timeout errors (common on Render due to 30-second gateway timeout)
    if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT' || error.message?.includes('timeout')) {
      console.error(`[ERROR] Request to Python service timed out after ${timeout}ms`);
      
      // Save error message to database
      if (userMessageSaved) {
        try {
          await ChatMessage.create({
            userId: userId,
            role: 'error',
            content: 'The AI service took too long to respond. This may happen if the service is starting up or processing a complex query. Please try again in a moment.',
            metadata: {
              responseType: 'plain',
              error: 'TIMEOUT'
            }
          });
        } catch (dbError) {
          console.error('[ERROR] Failed to save error message:', dbError);
        }
      }
      
      return res.status(504).json({
        success: false,
        message: 'The AI service took too long to respond. This may happen if the service is starting up or processing a complex query. Please try again in a moment.',
        error: 'TIMEOUT'
      });
    }

    // Handle 502 Bad Gateway (Render gateway timeout or service unavailable)
    if (error.response?.status === 502 || error.code === 'ERR_BAD_RESPONSE') {
      const fullUrl = `${PYTHON_AI_SERVICE_URL}/api/v1/chatbot/query`;
      console.error(`[ERROR] Received 502 Bad Gateway from Python service.`);
      console.error(`[ERROR] Service URL: ${fullUrl}`);
      console.error(`[ERROR] This usually means:`);
      console.error(`[ERROR]   1. The Python service is not deployed or not running`);
      console.error(`[ERROR]   2. The PYTHON_AI_SERVICE_URL is incorrect: ${PYTHON_AI_SERVICE_URL}`);
      console.error(`[ERROR]   3. The service is spinning up (first request after inactivity on free tier)`);
      console.error(`[ERROR]   4. The service crashed on startup`);
      console.error(`[ERROR] Check Render dashboard logs for the Python service to diagnose.`);
      
      // Save error message to database
      if (userMessageSaved) {
        try {
          await ChatMessage.create({
            userId: userId,
            role: 'error',
            content: 'The AI service is temporarily unavailable. This may happen if the service is starting up or the service URL is misconfigured. Please try again in a moment.',
            metadata: {
              responseType: 'plain',
              error: 'BAD_GATEWAY',
              serviceUrl: PYTHON_AI_SERVICE_URL
            }
          });
        } catch (dbError) {
          console.error('[ERROR] Failed to save error message:', dbError);
        }
      }
      
      return res.status(502).json({
        success: false,
        message: 'The AI service is temporarily unavailable. This may happen if the service is starting up or the service URL is misconfigured. Please try again in a moment.',
        error: 'BAD_GATEWAY',
        diagnostic: {
          serviceUrl: PYTHON_AI_SERVICE_URL,
          suggestion: 'Check that: 1) Python service is deployed on Render, 2) PYTHON_AI_SERVICE_URL is set correctly in Node.js server environment variables, 3) Python service is running (check Render logs)'
        }
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
