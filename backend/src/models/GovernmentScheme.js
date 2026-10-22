const mongoose = require('mongoose');

const governmentSchemeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    governmentLevel: {
      type: String,
      enum: ['Central Government', 'State Government'],
      default: 'Central Government',
    },
    state: {
      type: String,
      default: 'All India',
      trim: true,
    },
    districts: {
      type: [String],
      default: [],
    },
    category: {
      type: String,
      enum: ['Financial Support', 'Agricultural Loan', 'Crop Insurance', 'Farm Equipment', 'Irrigation', 'Agriculture Infrastructure', 'Agriculture Support', 'Farmer Training', 'Other'],
      default: 'Other',
    },
    targetFarmers: {
      type: String,
      default: 'Farmers and agricultural households',
    },
    benefits: [String],
    eligibility: [String],
    documents: [String],
    applicationSteps: [String],
    officialWebsite: {
      type: String,
      trim: true,
    },
    officialStatusUrl: {
      type: String,
      trim: true,
    },
    officialApplicationUrl: {
      type: String,
      trim: true,
    },
    lastVerifiedAt: {
      type: Date,
      default: Date.now,
    },
    sourceName: {
      type: String,
      default: 'Official Government Portal',
    },
    sourceUrl: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

governmentSchemeSchema.index({ governmentLevel: 1, category: 1, state: 1 });

const GovernmentScheme = mongoose.model('GovernmentScheme', governmentSchemeSchema);

module.exports = GovernmentScheme;
