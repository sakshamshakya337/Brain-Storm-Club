import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import xss from 'xss-clean';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';

import authRoutes from '../routes/auth.js';
import adminRoutes from '../routes/admin.js';
import publicRoutes from '../routes/public.js';
import imageRoutes from '../routes/image.js';
import { maintenanceGuard, getMaintenanceState } from '../middleware/maintenance.js';
import SystemSettings from '../models/SystemSettings.js';

import { connectDB } from '../utils/db.js';

// ─── Database Middleware (Per-Route Connection) ──────────────────────────────
// Only database-dependent routes await this; ping/health/status remain independent.
const ensureDB = async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error('[DB Middleware Error]', err.message);
    return res.status(503).json({
      success: false,
      error: 'Database temporarily unavailable. Please try again in a moment.'
    });
  }
};

// ─── Express App Factory ──────────────────────────────────────────────────────
const createApp = () => {
  const app = express();

  // Security: Disable Express fingerprinting header
  app.disable('x-powered-by');

  // URL Normalization: handle Vercel rewrite headers (x-matched-path)
  app.use((req, res, next) => {
    const matchedPath = req.headers['x-matched-path'];
    if (matchedPath && (req.path === '/api/index.js' || req.path === '/api/index' || req.path === '/api')) {
      const queryIdx = req.url.indexOf('?');
      const query = queryIdx !== -1 ? req.url.slice(queryIdx) : '';
      req.url = matchedPath + query;
    }
    next();
  });

  app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
    xFrameOptions: { action: 'deny' },
    xContentTypeOptions: true,
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  }));

  // Additional defense-in-depth security headers
  app.use((req, res, next) => {
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    next();
  });

  // Allow explicit CORS_ORIGIN, CLIENT_URL, and any *.vercel.app domain
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

  // ─── Database-Independent Diagnostic Endpoints ──────────────────────────────
  // Minimal ping endpoint: zero dependencies, executes immediately
  app.get('/api/ping', (req, res) => {
    res.status(200).json({
      success: true,
      message: 'pong',
      timestamp: Date.now()
    });
  });

  // General API health check
  app.get('/api/health', (req, res) => {
    const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
    res.status(200).json({
      success: true,
      api: 'ok',
      database: dbStatus,
      readyState: mongoose.connection.readyState
    });
  });

  // Database health check (bounded timeout)
  app.get('/api/health/db', async (req, res) => {
    try {
      await connectDB();
      res.status(200).json({
        success: true,
        database: 'connected'
      });
    } catch (err) {
      res.status(503).json({
        success: false,
        database: 'unavailable',
        error: process.env.NODE_ENV !== 'production' ? err.message : undefined
      });
    }
  });

  // ─── Site Status ─────────────────────────────────────────────────────────────
  app.get('/api/site/status', async (req, res) => {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    try {
      // Always connect — this is a lightweight cached connection, not a cold connect each time
      await connectDB();

      const [maintenanceMode, settings] = await Promise.all([
        getMaintenanceState(),
        SystemSettings.findOne().select('memberRegistrationOpen').lean().catch(() => null),
      ]);

      res.status(200).json({
        success: true,
        data: {
          maintenanceMode:        !!maintenanceMode,
          memberRegistrationOpen: !!(settings?.memberRegistrationOpen),
        }
      });
    } catch (error) {
      console.error('[Site Status Error]', error);
      res.status(200).json({
        success: true,
        data: { maintenanceMode: false, memberRegistrationOpen: false }
      });
    }
  });

  // ─── Database-Dependent Routes ──────────────────────────────────────────────
  app.use('/api/images', ensureDB, imageRoutes);
  app.use('/api/auth', ensureDB, authRoutes);
  app.use('/api/admin', ensureDB, adminRoutes);

  app.use(maintenanceGuard);
  app.use('/api/public', ensureDB, publicRoutes);

  // ─── 404 Catch-all for API Routes (Always JSON, never index.html) ───────────
  app.all('/api/*', (req, res) => {
    res.status(404).json({
      success: false,
      error: 'API route not found'
    });
  });

  // ─── Global JSON Error Handler ──────────────────────────────────────────────
  app.use((err, req, res, next) => {
    console.error('[API Error]', err.message || err);
    if (res.headersSent) {
      return next(err);
    }
    res.status(err.status || 500).json({
      success: false,
      error: process.env.NODE_ENV === 'production' ? 'Internal server error' : (err.message || 'Unknown error')
    });
  });

  return app;
};

// ─── Vercel Entry Point ───────────────────────────────────────────────────────
// Export Express app directly — Vercel natively calls app(req, res).
const app = createApp();

export default (req, res) => {
  return app(req, res);
};
