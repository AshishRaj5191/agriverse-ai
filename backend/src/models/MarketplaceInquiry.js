const mongoose = require('mongoose');

const marketplaceInquirySchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
    buyer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    message: { type: String, required: true, trim: true, minlength: 3, maxlength: 2000 },
    status: { type: String, enum: ['pending', 'responded', 'closed'], default: 'pending' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('MarketplaceInquiry', marketplaceInquirySchema);
