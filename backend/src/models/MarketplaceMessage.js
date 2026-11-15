const mongoose = require('mongoose');

const marketplaceMessageSchema = new mongoose.Schema(
  {
    conversation: { type: mongoose.Schema.Types.ObjectId, ref: 'MarketplaceConversation', required: true, index: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    message: { type: String, required: true, trim: true, minlength: 1, maxlength: 2000 },
    readAt: { type: Date, default: null },
  },
  { timestamps: true }
);

marketplaceMessageSchema.index({ conversation: 1, createdAt: 1 });

module.exports = mongoose.model('MarketplaceMessage', marketplaceMessageSchema);
