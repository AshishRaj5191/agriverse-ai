const path = require('path');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const User = require('../src/models/User');

const envPath = path.resolve(__dirname, '../.env');
dotenv.config({ path: envPath });

const adminDetails = {
  name: 'AgriVerse Admin',
  email: 'admin@agriverse.ai',
  password: 'Admin@12345',
  role: 'admin',
};

async function createAdmin() {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Admin seed is development-only and cannot run in production.');
  }

  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI is required to create the development admin.');
  }

  await mongoose.connect(process.env.MONGODB_URI, {
    serverSelectionTimeoutMS: 5000,
  });

  const existingUser = await User.findOne({ email: adminDetails.email });
  if (existingUser) {
    console.log(`Admin account already exists: ${adminDetails.email}`);
    return;
  }

  const passwordHash = await bcrypt.hash(adminDetails.password, 12);
  await User.create({
    name: adminDetails.name,
    email: adminDetails.email,
    passwordHash,
    role: adminDetails.role,
  });

  console.log(`Development admin created: ${adminDetails.email}`);
}

createAdmin()
  .catch((error) => {
    console.error('[CREATE ADMIN] Failed:', error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
  });
