const Transaction = require('../Models/Transaction');
const Integration = require('../Models/Integration');

// Get transactions from database (cached data)
const getCachedTransactions = async (req, res) => {
  try {
    const { user } = req;
    const { institutionId, startDate, endDate, limit = 200, skip = 0 } = req.query;

    // Build query
    const query = { userId: user._id };
    
    if (institutionId) {
      query.institutionId = institutionId;
    }

    if (startDate && endDate) {
      // Since date is stored as string in database, compare as strings
      query.date = {
        $gte: startDate,
        $lte: endDate
      };
    }

    // Get transactions from database with pagination
    const transactions = await Transaction.find(query)
      .sort({ date: -1, syncedAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip))
      .lean();

    // Get total count for pagination info
    const totalCount = await Transaction.countDocuments(query);

    // Get bank connections for additional context
    const integration = await Integration.findOne({ userId: user._id });
    const bankConnections = integration?.plaid?.bankConnections || [];

    res.json({
      success: true,
      data: {
        transactions,
        bankConnections,
        totalCount,
        currentPage: Math.floor(parseInt(skip) / parseInt(limit)) + 1,
        totalPages: Math.ceil(totalCount / parseInt(limit)),
        hasMore: (parseInt(skip) + parseInt(limit)) < totalCount,
        cached: true,
        lastSync: integration?.plaid?.bankConnections?.find(
          conn => conn.institutionId === institutionId
        )?.lastSync || null
      }
    });

  } catch (error) {
    console.error('Error fetching cached transactions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch transactions',
      error: error.message
    });
  }
};

// Get transaction summary/statistics
const getTransactionSummary = async (req, res) => {
  try {
    const { user } = req;
    const { startDate, endDate } = req.query;

    // Build date filter
    const dateFilter = {};
    if (startDate && endDate) {
      // Since date is stored as string in database, compare as strings
      dateFilter.date = {
        $gte: startDate,
        $lte: endDate
      };
    }

    // Get transaction statistics
    const pipeline = [
      { $match: { userId: user._id, ...dateFilter } },
      {
        $group: {
          _id: null,
          totalTransactions: { $sum: 1 },
          totalAmount: { $sum: '$amount' },
          avgAmount: { $avg: '$amount' },
          categories: { $addToSet: '$category' },
          institutions: { $addToSet: '$institutionId' }
        }
      }
    ];

    const summary = await Transaction.aggregate(pipeline);
    const result = summary[0] || {
      totalTransactions: 0,
      totalAmount: 0,
      avgAmount: 0,
      categories: [],
      institutions: []
    };

    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Error fetching transaction summary:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch transaction summary',
      error: error.message
    });
  }
};

// Manual sync trigger (for testing)
const triggerManualSync = async (req, res) => {
  try {
    const transactionSyncService = require('../Services/transactionSyncService');
    
    // Run sync in background
    transactionSyncService.manualSync().catch(error => {
      console.error('Manual sync error:', error);
    });

    res.json({
      success: true,
      message: 'Manual sync triggered successfully'
    });

  } catch (error) {
    console.error('Error triggering manual sync:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to trigger manual sync',
      error: error.message
    });
  }
};

module.exports = {
  getCachedTransactions,
  getTransactionSummary,
  triggerManualSync
};

