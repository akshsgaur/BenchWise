const mongoose = require('mongoose');

const chatMessageSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  role: {
    type: String,
    enum: ['user', 'assistant', 'error'],
    required: true
  },
  content: {
    type: mongoose.Schema.Types.Mixed, // Can be string or object for structured responses
    required: true
  },
  metadata: {
    toolsUsed: [String],
    iterations: Number,
    responseType: {
      type: String,
      enum: ['plain', 'structured'],
      default: 'plain'
    }
  },
  conversationId: {
    type: String,
    index: true
  }
}, {
  timestamps: true
});

// Compound index for efficient querying by user and time
chatMessageSchema.index({ userId: 1, createdAt: -1 });
chatMessageSchema.index({ userId: 1, conversationId: 1, createdAt: -1 });

module.exports = mongoose.model('ChatMessage', chatMessageSchema);


