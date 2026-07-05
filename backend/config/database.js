/**
 * config/database.js — MongoDB connection using Mongoose
 */

const mongoose = require('mongoose');
const logger = require('./logger');

const connectDB = async () => {
  try {
    // Set connection timeout to 5 seconds
    const conn = await Promise.race([
      mongoose.connect(process.env.MONGODB_URI, {
        serverSelectionTimeoutMS: 5000,
        connectTimeoutMS: 5000,
      }),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('MongoDB connection timeout')), 6000)
      ),
    ]);
    logger.info(`✅ MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    logger.error(`❌ MongoDB connection error: ${error.message}`);
    // If we're in development, attempt to start an in-memory MongoDB
    if (process.env.NODE_ENV === 'development') {
      try {
        logger.info('⚠️ MongoDB not reachable — attempting in-memory MongoDB for development...');
        // require dynamically so production without the package won't fail
        const { MongoMemoryServer } = require('mongodb-memory-server');
        const mongoServer = await MongoMemoryServer.create();
        const uri = mongoServer.getUri();
        const conn = await mongoose.connect(uri, {
          serverSelectionTimeoutMS: 5000,
          connectTimeoutMS: 5000,
        });
        logger.info(`✅ In-memory MongoDB started: ${conn.connection.host}`);
        // keep a reference so the process doesn't GC the server (optional)
        connectDB._mongoServer = mongoServer;
        return;
      } catch (memErr) {
        logger.error(`❌ In-memory MongoDB failed: ${memErr.message}`);
        logger.warn('⚠️ Server will continue running without database. Some features may be unavailable.');
        logger.warn('To enable local DB, install mongodb-memory-server or start MongoDB and set MONGODB_URI.');
        return;
      }
    }

    logger.warn('⚠️ Server will continue running without database. Some features may be unavailable.');
  }
};

module.exports = connectDB;
