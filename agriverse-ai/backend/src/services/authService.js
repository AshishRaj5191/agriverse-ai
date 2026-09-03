const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const generateToken = require('../utils/generateToken');

const memoryUsers = new Map();

function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

function serializeUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    isActive: user.isActive,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

function buildMemoryUser({ name, email, passwordHash, role }) {
  return {
    _id: `local_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`,
    name,
    email: normalizeEmail(email),
    passwordHash,
    role,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

async function registerUser({ name, email, password, role }) {
  const normalizedEmail = normalizeEmail(email);

  if (mongoose.connection.readyState === 1) {
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      throw new ApiError(409, 'Email is already registered.');
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({
      name,
      email: normalizedEmail,
      passwordHash,
      role,
    });

    const token = generateToken({ userId: user._id, role: user.role });

    return {
      token,
      user: serializeUser(user),
    };
  }

  const existing = memoryUsers.get(normalizedEmail);
  if (existing) {
    throw new ApiError(409, 'Email is already registered.');
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const user = buildMemoryUser({ name, email: normalizedEmail, passwordHash, role });
  memoryUsers.set(normalizedEmail, user);

  const token = generateToken({ userId: user._id, role: user.role });

  return {
    token,
    user: serializeUser(user),
  };
}

async function loginUser({ email, password }) {
  const normalizedEmail = normalizeEmail(email);

  if (mongoose.connection.readyState === 1) {
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      throw new ApiError(401, 'Invalid email or password.');
    }

    if (!user.isActive) {
      throw new ApiError(403, 'This account is inactive.');
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new ApiError(401, 'Invalid email or password.');
    }

    const token = generateToken({ userId: user._id, role: user.role });

    return {
      token,
      user: serializeUser(user),
    };
  }

  const user = memoryUsers.get(normalizedEmail);
  if (!user) {
    throw new ApiError(401, 'Invalid email or password.');
  }

  if (!user.isActive) {
    throw new ApiError(403, 'This account is inactive.');
  }

  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
  if (!isPasswordValid) {
    throw new ApiError(401, 'Invalid email or password.');
  }

  const token = generateToken({ userId: user._id, role: user.role });

  return {
    token,
    user: serializeUser(user),
  };
}

module.exports = {
  registerUser,
  loginUser,
};
