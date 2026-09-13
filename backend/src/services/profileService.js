const User = require('../models/User');
const FarmerProfile = require('../models/FarmerProfile');
const ExpertProfile = require('../models/ExpertProfile');
const BuyerProfile = require('../models/BuyerProfile');
const ApiError = require('../utils/ApiError');

function ensureDatabaseReady() {
  const mongoose = require('mongoose');
  if (mongoose.connection.readyState !== 1) {
    throw new ApiError(503, 'Database is currently unavailable. Please check MongoDB connection and try again.');
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

async function getFarmerProfile(userId) {
  ensureDatabaseReady();
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
  const payload = sanitizeProfilePayload(profileData);
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, 'User not found.');
  }

  const profile = await ExpertProfile.findOneAndUpdate(
    { user: userId },
    {
      user: userId,
      name: user.name,
      email: user.email,
      verificationStatus: payload.verificationStatus || 'pending',
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

async function getBuyerProfile(userId) {
  ensureDatabaseReady();
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
};
