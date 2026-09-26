const mongoose = require('mongoose');

const verificationStatusValues = ['pending', 'verified', 'rejected'];

const expertProfileSchema = new mongoose.Schema(
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
      match: [/^\+?[0-9][0-9\s-]{9,14}$/, 'Please provide a valid phone number.'],
    },
    specialization: {
      type: String,
      trim: true,
      required: true,
      maxlength: 80,
    },
    experience: {
      type: Number,
      min: 0,
      max: 60,
    },
    qualification: {
      type: String,
      trim: true,
      required: true,
      maxlength: 120,
    },
    state: {
      type: String,
      trim: true,
      required: true,
    },
    district: {
      type: String,
      trim: true,
      required: true,
    },
    serviceRadius: {
      type: Number,
      min: 1,
      max: 1000,
    },
    bio: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
    verificationStatus: {
      type: String,
      enum: verificationStatusValues,
      default: 'pending',
    },
  },
  {
    timestamps: true,
  }
);

expertProfileSchema.index({ verificationStatus: 1, state: 1 });
expertProfileSchema.index({ verificationStatus: 1, state: 1, district: 1, specialization: 1 });

const ExpertProfile = mongoose.model('ExpertProfile', expertProfileSchema);

module.exports = ExpertProfile;
