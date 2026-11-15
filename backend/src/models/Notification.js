const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true, maxlength: 300 },
    readAt: { type: Date, default: null },
    consultation: { type: mongoose.Schema.Types.ObjectId, ref: 'ConsultationRequest', default: null },
    marketplaceInquiry: { type: mongoose.Schema.Types.ObjectId, ref: 'MarketplaceInquiry', default: null },
    marketplaceConversation: { type: mongoose.Schema.Types.ObjectId, ref: 'MarketplaceConversation', default: null },
  },
  { timestamps: true }
);

notificationSchema.index({ recipient: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
