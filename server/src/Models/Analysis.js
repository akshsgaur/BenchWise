const mongoose = require('mongoose');

const analysisSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  analysisDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  days: {
    type: Number,
    required: true,
    enum: [7, 30, 60]
  },
  period: {
    startDate: String,
    endDate: String
  },
  transactions: {
    count: Number,
    totalSpent: Number,
    totalIncome: Number
  },
  aiAnalysis: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  rawTransactions: [mongoose.Schema.Types.Mixed],
  accountsSnapshot: [mongoose.Schema.Types.Mixed]
}, {
  timestamps: true
});

// Indexes for efficient queries
analysisSchema.index({ userId: 1, analysisDate: -1 });
analysisSchema.index({ createdAt: 1 }, { expireAfterSeconds: 7776000 });

module.exports = mongoose.model('Analysis', analysisSchema);
