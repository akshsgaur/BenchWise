const mongoose = require('mongoose');

const recommendationSchema = new mongoose.Schema({
  title: { type: String, required: true },
  detail: { type: String, required: true },
  impact: { type: String, required: false },
  action: { type: String, required: false },
  category: { type: String, required: false }
}, { _id: false });

const metricSchema = new mongoose.Schema({
  label: { type: String, required: true },
  value: { type: Number, required: false },
  displayValue: { type: String, required: false }
}, { _id: false });

const insightSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true,
    required: true
  },
  summary: {
    headline: { type: String, required: true },
    narrative: { type: String, required: true }
  },
  keyMetrics: [metricSchema],
  recommendations: [recommendationSchema],
  highlights: [{ type: String }],
  alerts: [{ type: String }],
  context: {
    periodDays: { type: Number, default: 60 },
    dateRange: {
      start: { type: String },
      end: { type: String }
    },
    transactionCount: { type: Number, default: 0 },
    totalIncome: { type: Number, default: 0 },
    totalSpend: { type: Number, default: 0 },
    netCashflow: { type: Number, default: 0 },
    generatedFrom: {
      type: String,
      default: 'ai-agent-v1'
    }
  },
  generatedAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  version: {
    type: Number,
    default: 1
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Insight', insightSchema);
