const mongoose = require('mongoose');

const buyerProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    name: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    state: {
      type: String,
      trim: true,
    },
    district: {
      type: String,
      trim: true,
    },
    preferredLocation: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

buyerProfileSchema.index({ state: 1, district: 1 });

const BuyerProfile = mongoose.model('BuyerProfile', buyerProfileSchema);

module.exports = BuyerProfile;
