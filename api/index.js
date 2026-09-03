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

let cachedConnection = null;

const connectToDB = async () => {
  if (cachedConnection && mongoose.connection.readyState === 1) {
    return cachedConnection;
  }
  cachedConnection = await mongoose.connect(process.env.MONGODB_URI, {
    bufferCommands: false,
    maxPoolSize: 5
  });
  return cachedConnection;
};

const createApp = () => {
  const app = express();

  app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false
  }));

  const corsOrigin = process.env.CORS_ORIGIN || process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : 'http://localhost:5000';

  app.use(cors({
    origin: process.env.CORS_ORIGIN || [corsOrigin, /vercel\.app$/],
    credentials: true
  }));

  app.use(express.json({ limit: '10kb' }));
  app.use(express.urlencoded({ extended: true, limit: '10kb' }));
  app.use(cookieParser());

  app.use(mongoSanitize());
  app.use(xss());

  const limiter = rateLimit({
    windowMs: (parseInt(process.env.RATE_LIMIT_WINDOW_MIN, 10) || 15) * 60 * 1000,
    max: parseInt(process.env.RATE_LIMIT_MAX, 10) || 100,
    message: 'Too many requests from this IP, please try again later.'
  });
  app.use('/api', limiter);

  app.use('/api/images', imageRoutes);
  app.use('/api/auth', authRoutes);
  app.use('/api/admin', adminRoutes);

  app.get('/api/site/status', async (req, res) => {
    try {
      const maintenanceMode = await getMaintenanceState();
      res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      res.status(200).json({
        success: true,
        data: { maintenanceMode }
      });
    } catch (error) {
      console.error('[Site Status Error]', error);
      res.status(200).json({ success: true, data: { maintenanceMode: false } });
    }
  });

  app.use(maintenanceGuard);
  app.use('/api/public', publicRoutes);

  app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'success', message: 'API is running' });
  });

  app.all('/api/*', (req, res) => {
    res.status(404).json({
      success: false,
      message: 'API endpoint not found'
    });
  });

  return app;
};

let cachedHandler = null;
const getHandler = async () => {
  if (cachedHandler) return cachedHandler;
  await connectToDB();
  const app = createApp();
  cachedHandler = serverless(app, {
    binary: ['image/*', 'application/pdf']
  });
  return cachedHandler;
};

export default async (req, res) => {
  try {
    const handler = await getHandler();
    return handler(req, res);
  } catch (err) {
    console.error('[Vercel API Handler Error]', err);
    res.status(500).json({
      success: false,
      message: 'Internal server error during initialization.'
    });
  }
};
