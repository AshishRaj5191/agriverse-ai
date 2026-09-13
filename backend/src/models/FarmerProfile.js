const mongoose = require('mongoose');

const farmerProfileSchema = new mongoose.Schema(
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
    village: {
      type: String,
      trim: true,
    },
    pincode: {
      type: String,
      trim: true,
    },
    farmSize: {
      type: String,
      trim: true,
    },
    soilType: {
      type: String,
      trim: true,
    },
    irrigationType: {
      type: String,
      trim: true,
    },
    primaryCrops: {
      type: String,
      trim: true,
    },
    preferredLanguage: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

farmerProfileSchema.index({ state: 1, district: 1 });

const FarmerProfile = mongoose.model('FarmerProfile', farmerProfileSchema);

module.exports = FarmerProfile;
