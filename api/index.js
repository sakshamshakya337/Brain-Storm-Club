import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import xss from 'xss-clean';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';
import serverless from 'serverless-http';

import authRoutes from '../routes/auth.js';
import adminRoutes from '../routes/admin.js';
import publicRoutes from '../routes/public.js';
import imageRoutes from '../routes/image.js';
import { maintenanceGuard, getMaintenanceState } from '../middleware/maintenance.js';

// ─── MongoDB Connection (with proper caching to survive warm invocations) ────────
// We store the pending Promise itself so that concurrent cold-start invocations
// all await the SAME promise rather than each kicking off their own connect().
let connectionPromise = null;

const connectToDB = () => {
  // Already connected — return immediately
  if (mongoose.connection.readyState === 1) {
    return Promise.resolve();
  }
  // Connection is in progress — join the existing promise
  if (connectionPromise) {
    return connectionPromise;
  }
  // First call — start connecting and cache the promise
  connectionPromise = mongoose
    .connect(process.env.MONGODB_URI, {
      bufferCommands: false,
      maxPoolSize: 5,
      minPoolSize: 1,
      serverSelectionTimeoutMS: 8000,  // Fail fast: give up after 8s
      socketTimeoutMS: 30000,
      connectTimeoutMS: 10000,
      heartbeatFrequencyMS: 30000,
    })
    .then(() => {
      console.log('[MongoDB] Connected successfully');
    })
    .catch((err) => {
      // Reset so the next request can retry the connection
      connectionPromise = null;
      console.error('[MongoDB] Connection failed:', err.message);
      throw err;
    });

  return connectionPromise;
};

// ─── Express App Factory ──────────────────────────────────────────────────────
const createApp = () => {
  const app = express();

  app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false
  }));

  // Allow both the explicit CORS_ORIGIN env var AND any *.vercel.app subdomain
  // (covers preview deployments without needing to update the env var each time)
  const allowedOrigins = [
    process.env.CORS_ORIGIN,
    process.env.CLIENT_URL,
    'https://brain-storm-club.vercel.app',
  ].filter(Boolean);

  app.use(cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (curl, Postman, server-to-server)
      if (!origin) return callback(null, true);
      if (
        allowedOrigins.includes(origin) ||
        /\.vercel\.app$/.test(origin)
      ) {
        return callback(null, true);
      }
      callback(new Error(`CORS: origin '${origin}' not allowed`));
    },
    credentials: true
  }));

  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  app.use(cookieParser());
  app.use(mongoSanitize());
  app.use(xss());

  const limiter = rateLimit({
    windowMs: (parseInt(process.env.RATE_LIMIT_WINDOW_MIN, 10) || 15) * 60 * 1000,
    max: parseInt(process.env.RATE_LIMIT_MAX, 10) || 200,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: 'Too many requests. Please try again later.' }
  });
  app.use('/api', limiter);

  app.use('/api/images', imageRoutes);
  app.use('/api/auth', authRoutes);
  app.use('/api/admin', adminRoutes);

  app.get('/api/site/status', async (req, res) => {
    try {
      const maintenanceMode = await getMaintenanceState();
      res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      res.status(200).json({ success: true, data: { maintenanceMode } });
    } catch (error) {
      console.error('[Site Status Error]', error);
      res.status(200).json({ success: true, data: { maintenanceMode: false } });
    }
  });

  app.use(maintenanceGuard);
  app.use('/api/public', publicRoutes);

  app.get('/api/health', (req, res) => {
    const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
    res.status(200).json({
      success: true,
      api: 'ok',
      database: dbStatus,
      readyState: mongoose.connection.readyState
    });
  });

  // 404 catch-all for unmatched /api/* routes
  app.all('/api/*', (req, res) => {
    res.status(404).json({ success: false, message: 'API endpoint not found' });
  });

  return app;
};

// ─── Serverless Handler (cached across warm invocations) ─────────────────────
let cachedHandler = null;

const getHandler = async () => {
  if (cachedHandler) return cachedHandler;

  try {
    await connectToDB();
  } catch (dbError) {
    console.error('[Handler Init] DB connection failed:', dbError.message);
    // Return a proper error handler instead of timing out silently
    return (req, res) => {
      res.status(503).json({
        success: false,
        message: 'Database temporarily unavailable. Please try again in a moment.',
        error: process.env.NODE_ENV !== 'production' ? dbError.message : undefined
      });
    };
  }

  const app = createApp();
  cachedHandler = serverless(app, {
    binary: ['image/*', 'application/pdf', 'application/octet-stream']
  });

  return cachedHandler;
};

// ─── Vercel Entry Point ───────────────────────────────────────────────────────
export default async (req, res) => {
  try {
    const handler = await getHandler();
    return handler(req, res);
  } catch (err) {
    console.error('[Vercel Entry Error]', err);
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: 'Internal server error during initialization.'
      });
    }
  }
};
