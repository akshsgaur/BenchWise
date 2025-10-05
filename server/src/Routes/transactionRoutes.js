const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const transactionController = require('../Controllers/transactionController');

// Get cached transactions from database
router.get('/', authenticateToken, transactionController.getCachedTransactions);

// Get transaction summary/statistics
router.get('/summary', authenticateToken, transactionController.getTransactionSummary);

// Trigger manual sync (for testing)
router.post('/sync', authenticateToken, transactionController.triggerManualSync);

module.exports = router;
