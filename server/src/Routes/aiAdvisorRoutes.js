const express = require('express');
const router = express.Router();
const { askQuestion, getChatHistory } = require('../Controllers/aiAdvisorController');
const { authenticateToken } = require('../middleware/auth');

// All routes require authentication
router.use(authenticateToken);

// POST /api/v1/ai-advisor/query - Ask AI advisor a question
router.post('/query', askQuestion);

// GET /api/v1/ai-advisor/history - Get chat history
router.get('/history', getChatHistory);

module.exports = router;
