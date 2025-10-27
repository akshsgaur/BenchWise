const axios = require('axios');

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

    // Call Python AI chatbot service
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

    if (response.data.success) {
      res.json({
        success: true,
        data: response.data.data
      });
    } else {
      throw new Error(response.data.message || 'AI service returned error');
    }

  } catch (error) {
    console.error('Error in AI Advisor askQuestion:', error.message);

    // Handle different error types
    if (error.code === 'ECONNREFUSED') {
      return res.status(503).json({
        success: false,
        message: 'AI service is currently unavailable. Please make sure the Python service is running on port 8001.',
        error: 'SERVICE_UNAVAILABLE'
      });
    }

    if (error.response) {
      // Python service returned an error
      return res.status(error.response.status || 500).json({
        success: false,
        message: error.response.data?.detail || 'AI service error',
        error: error.response.data
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to get AI response',
      error: error.message
    });
  }
};

/**
 * Get chat history for the user (future enhancement)
 */
const getChatHistory = async (req, res) => {
  try {
    const userId = req.user._id;

    // TODO: Implement chat history storage in MongoDB
    // For now, return empty history

    res.json({
      success: true,
      data: {
        history: [],
        message: 'Chat history feature coming soon'
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

module.exports = {
  askQuestion,
  getChatHistory
};
