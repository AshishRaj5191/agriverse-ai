const mongoose = require('mongoose');

const marketplaceConversationSchema = new mongoose.Schema(
  {
    listing: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
    buyer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    lastMessageAt: { type: Date, default: Date.now, index: true },
    lastMessage: { type: String, trim: true, maxlength: 2000, default: '' },
    unreadForBuyer: { type: Number, default: 0, min: 0 },
    unreadForSeller: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true }
);

marketplaceConversationSchema.index({ listing: 1, buyer: 1, seller: 1 }, { unique: true });

module.exports = mongoose.model('MarketplaceConversation', marketplaceConversationSchema);
