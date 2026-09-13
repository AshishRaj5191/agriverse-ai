const mongoose = require('mongoose');
const env = require('./env');

// Disable command buffering so disconnected DB calls fail fast instead of timing out.
mongoose.set('bufferCommands', false);

async function connectDatabase() {
  if (!env.mongodbUri) {
    console.error('[DB] MONGODB_URI is missing. Running without database connection.');
    return;
  }

  try {
    await mongoose.connect(env.mongodbUri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log('[DB] MongoDB connected successfully.');
  } catch (error) {
    console.error('[DB] MongoDB connection failed:', error.message);
    console.error('[DB] Server will continue to run. Retry after fixing MongoDB.');
  }
}

module.exports = connectDatabase;
