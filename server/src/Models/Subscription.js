const mongoose = require('mongoose');

const subscriptionItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  merchant: { type: String },
  amount: { type: Number, required: true },
  frequency: { type: String, enum: ['monthly', 'yearly', 'weekly', 'bi-weekly', 'quarterly'], default: 'monthly' },
  category: { type: String },
  nextBillingDate: { type: String },
  lastTransactionDate: { type: String },
  transactionCount: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  confidence: { type: Number, min: 0, max: 1 }, // AI confidence score
  notes: { type: String }
}, { _id: false });

const categorySummarySchema = new mongoose.Schema({
  category: { type: String, required: true },
  totalAmount: { type: Number, required: true },
  subscriptionCount: { type: Number, default: 0 },
  subscriptions: [subscriptionItemSchema]
}, { _id: false });

const subscriptionAnalysisSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  summary: {
    totalMonthlySpending: { type: Number, default: 0 },
    totalYearlySpending: { type: Number, default: 0 },
    activeSubscriptions: { type: Number, default: 0 },
    savingsPotential: { type: Number, default: 0 },
    averageMonthlyPerSubscription: { type: Number, default: 0 }
  },
  subscriptions: [subscriptionItemSchema],
  categories: [categorySummarySchema],
  insights: {
    recommendations: [{ type: String }],
    warnings: [{ type: String }],
    opportunities: [{ type: String }]
  },
  analysisMetadata: {
    transactionCount: { type: Number, default: 0 },
    dateRange: {
      start: { type: String },
      end: { type: String }
    },
    analyzedAt: { type: Date, default: Date.now },
    modelVersion: { type: String, default: 'gpt-4' }
  }
}, {
  timestamps: true
});

// Compound index for efficient querying
subscriptionAnalysisSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('SubscriptionAnalysis', subscriptionAnalysisSchema);

