const User = require('../models/User');
const FarmerProfile = require('../models/FarmerProfile');
const ExpertProfile = require('../models/ExpertProfile');
const BuyerProfile = require('../models/BuyerProfile');
const ApiError = require('../utils/ApiError');
const { isValidLocation, normalizeLocation } = require('../constants/indianLocations');

function ensureDatabaseReady() {
  const mongoose = require('mongoose');
  if (mongoose.connection.readyState !== 1) {
    throw new ApiError(503, 'Database is currently unavailable. Please check MongoDB connection and try again.');
  }
}

function ensureValidUserId(userId) {
  const mongoose = require('mongoose');
  if (!mongoose.isValidObjectId(userId)) {
    throw new ApiError(401, 'Your session is no longer valid. Please log in again.');
  }
}

function sanitizeProfilePayload(payload = {}) {
  const cleaned = { ...payload };
  Object.keys(cleaned).forEach((key) => {
    if (cleaned[key] === undefined || cleaned[key] === null) {
      cleaned[key] = '';
    }
    if (typeof cleaned[key] === 'string') {
      cleaned[key] = cleaned[key].trim();
    }
  });
  return cleaned;
}

const expertProfileFields = [
  'phone',
  'specialization',
  'experience',
  'qualification',
  'state',
  'district',
  'serviceRadius',
  'bio',
];

function sanitizeExpertProfilePayload(payload = {}) {
  const cleaned = {};
  expertProfileFields.forEach((field) => {
    if (payload[field] !== undefined && payload[field] !== null) {
      cleaned[field] = typeof payload[field] === 'string' ? payload[field].trim() : payload[field];
    }
  });

  if (cleaned.phone && !/^\+?[0-9][0-9\s-]{9,14}$/.test(cleaned.phone)) {
    throw new ApiError(400, 'Please provide a valid phone number.');
  }

  if (!cleaned.specialization || !cleaned.qualification) {
    throw new ApiError(400, 'Specialization and qualification are required.');
  }

  const experience = Number(cleaned.experience);
  if (!Number.isInteger(experience) || experience < 0 || experience > 60) {
    throw new ApiError(400, 'Experience must be a whole number between 0 and 60 years.');
  }
  cleaned.experience = experience;

  const serviceRadius = Number(cleaned.serviceRadius);
  if (!Number.isFinite(serviceRadius) || serviceRadius < 1 || serviceRadius > 1000) {
    throw new ApiError(400, 'Service radius must be between 1 and 1000 kilometers.');
  }
  cleaned.serviceRadius = serviceRadius;

  cleaned.state = normalizeLocation(cleaned.state);
  cleaned.district = normalizeLocation(cleaned.district);
  if (!isValidLocation(cleaned.state, cleaned.district)) {
    throw new ApiError(400, 'Please select a valid district for the selected state.');
  }

  if (cleaned.bio && cleaned.bio.length > 1000) {
    throw new ApiError(400, 'Bio cannot exceed 1000 characters.');
  }

  return cleaned;
}

function createExactCaseInsensitiveRegex(value) {
  const escaped = value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`^${escaped}$`, 'i');
}

async function getFarmerProfile(userId) {
  ensureDatabaseReady();
  ensureValidUserId(userId);
  const user = await User.findById(userId).lean();
  if (!user) {
    throw new ApiError(404, 'User not found.');
  }

  const profile = await FarmerProfile.findOne({ user: userId }).lean();
  return {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
    profile: profile || {},
  };
}

async function updateFarmerProfile(userId, profileData) {
  ensureDatabaseReady();
  ensureValidUserId(userId);
  const payload = sanitizeProfilePayload(profileData);
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, 'User not found.');
  }

  const profile = await FarmerProfile.findOneAndUpdate(
    { user: userId },
    {
      user: userId,
      name: user.name,
      email: user.email,
      ...payload,
    },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  ).lean();

  return {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
    profile,
  };
}

async function getExpertProfile(userId) {
  ensureDatabaseReady();
  ensureValidUserId(userId);
  const user = await User.findById(userId).lean();
  if (!user) {
    throw new ApiError(404, 'User not found.');
  }

  const profile = await ExpertProfile.findOne({ user: userId }).lean();
  return {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
    profile: profile || {},
  };
}

async function updateExpertProfile(userId, profileData) {
  ensureDatabaseReady();
  ensureValidUserId(userId);
  const payload = sanitizeExpertProfilePayload(profileData);
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, 'User not found.');
  }

  const existingProfile = await ExpertProfile.findOne({ user: userId }).select('verificationStatus').lean();
  const profile = await ExpertProfile.findOneAndUpdate(
    { user: userId },
    {
      user: userId,
      name: user.name,
      email: user.email,
      ...payload,
      verificationStatus: existingProfile?.verificationStatus || 'pending',
    },
    { new: true, upsert: true, setDefaultsOnInsert: true, runValidators: true }
  ).lean();

  return {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
    profile,
  };
}

async function getVerifiedExperts(filters = {}) {
  ensureDatabaseReady();
  const query = { verificationStatus: 'verified' };
  const state = normalizeLocation(filters.state);
  const district = normalizeLocation(filters.district);
  const specialization = normalizeLocation(filters.specialization);

  if (state) query.state = createExactCaseInsensitiveRegex(state);
  if (district) query.district = createExactCaseInsensitiveRegex(district);
  if (specialization) query.specialization = createExactCaseInsensitiveRegex(specialization);
  if (district && !state) {
    throw new ApiError(400, 'State is required when filtering by district.');
  }
  if (state && district && !isValidLocation(state, district)) {
    throw new ApiError(400, 'Please select a valid district for the selected state.');
  }

  console.info('[EXPERT SEARCH]', {
    state: state || 'all',
    district: district || 'all',
    specialization: specialization || 'all',
    verificationStatus: 'verified',
  });

  const profiles = await ExpertProfile.find(query)
    .populate('user', 'name email role isActive')
    .sort({ name: 1 })
    .lean();

  const results = profiles.map((profile) => ({
    id: profile._id,
    userId: profile.user?._id || null,
    name: profile.name || profile.user?.name || 'Agricultural Expert',
    email: profile.email || profile.user?.email || '',
    phone: profile.phone || '',
    specialization: profile.specialization,
    experience: profile.experience,
    qualification: profile.qualification,
    state: profile.state,
    district: profile.district,
    serviceRadius: profile.serviceRadius,
    bio: profile.bio || '',
    verificationStatus: profile.verificationStatus,
  }));

  console.info('[EXPERT SEARCH] verified experts found:', results.length);
  return results;
}

async function updateExpertVerification(profileId, verificationStatus) {
  ensureDatabaseReady();
  if (!['pending', 'verified', 'rejected'].includes(verificationStatus)) {
    throw new ApiError(400, 'Verification status must be pending, verified, or rejected.');
  }

  const profile = await ExpertProfile.findByIdAndUpdate(
    profileId,
    { verificationStatus },
    { new: true, runValidators: true }
  ).lean();
  if (!profile) {
    throw new ApiError(404, 'Expert profile not found.');
  }
  return profile;
}

async function getBuyerProfile(userId) {
  ensureDatabaseReady();
  ensureValidUserId(userId);
  const user = await User.findById(userId).lean();
  if (!user) {
    throw new ApiError(404, 'User not found.');
  }

  const profile = await BuyerProfile.findOne({ user: userId }).lean();
  return {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
    profile: profile || {},
  };
}

async function updateBuyerProfile(userId, profileData) {
  ensureDatabaseReady();
  ensureValidUserId(userId);
  const payload = sanitizeProfilePayload(profileData);
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, 'User not found.');
  }

  const profile = await BuyerProfile.findOneAndUpdate(
    { user: userId },
    {
      user: userId,
      name: user.name,
      email: user.email,
      ...payload,
    },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  ).lean();

  return {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
    profile,
  };
}

async function getAdminUsers() {
  ensureDatabaseReady();
  const users = await User.find({}).select('_id name email role isActive createdAt updatedAt').sort({ createdAt: -1 }).lean();
  return users.map((user) => ({
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    isActive: user.isActive,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  }));
}

async function getAdminExperts() {
  ensureDatabaseReady();
  const expertProfiles = await ExpertProfile.find({}).populate('user', 'name email role isActive').sort({ createdAt: -1 }).lean();

  return expertProfiles.map((profile) => ({
    id: profile._id,
    userId: profile.user?._id || null,
    name: profile.name || profile.user?.name || 'Unknown',
    email: profile.email || profile.user?.email || '',
    role: profile.user?.role || 'expert',
    specialization: profile.specialization || '',
    experience: profile.experience || '',
    qualification: profile.qualification || '',
    state: profile.state || '',
    district: profile.district || '',
    verificationStatus: profile.verificationStatus || 'pending',
    createdAt: profile.createdAt,
  }));
}

module.exports = {
  getFarmerProfile,
  updateFarmerProfile,
  getExpertProfile,
  updateExpertProfile,
  getBuyerProfile,
  updateBuyerProfile,
  getAdminUsers,
  getAdminExperts,
  getVerifiedExperts,
  updateExpertVerification,
};
