import mongoose from 'mongoose';
import 'dotenv/config';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env');
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development and warm invocations in serverless environments.
 * This prevents connections from growing exponentially.
 */
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export const connectDB = async () => {
  if (cached.conn) {
    if (process.env.NODE_ENV !== 'production') {
      console.log('[MongoDB] Using existing cached connection');
    }
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      maxPoolSize: 2, // Conservative limit for Serverless environments. Each function uses 1 connection concurrently, so 2 is safe and prevents the connection limit alert from triggering.
      minPoolSize: 0, // Allows the pool to shrink to 0 when idle.
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 20000,
      connectTimeoutMS: 5000,
      heartbeatFrequencyMS: 30000,
    };

    console.log('[MongoDB] Creating new connection pool');
    cached.promise = mongoose.connect(MONGODB_URI, opts)
      .then((mongooseInstance) => {
        console.log('[MongoDB] Connected successfully');
        return mongooseInstance;
      })
      .catch((err) => {
        // Reset promise so subsequent requests can retry
        cached.promise = null;
        console.error('[MongoDB] Connection failed:', err.message);
        throw err;
      });
  } else {
    if (process.env.NODE_ENV !== 'production') {
      console.log('[MongoDB] Connection is in progress, joining existing promise');
    }
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
};
