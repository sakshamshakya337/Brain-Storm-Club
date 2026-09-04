import 'dotenv/config';
import express from 'express';
import ViteExpress from 'vite-express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import xss from 'xss-clean';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';

// Routes
import authRoutes from './routes/auth.js';
import adminRoutes from './routes/admin.js';
import publicRoutes from './routes/public.js';
import imageRoutes from './routes/image.js';
import { maintenanceGuard, getMaintenanceState } from './middleware/maintenance.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(helmet({
  contentSecurityPolicy: false, // disabled for dev, needs strict config for prod
  crossOriginEmbedderPolicy: false
}));

app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5000',
  credentials: true
}));

app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// Rate Limiter
const limiter = rateLimit({
  windowMs: (process.env.RATE_LIMIT_WINDOW_MIN || 15) * 60 * 1000,
  max: process.env.RATE_LIMIT_MAX || 100,
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api', limiter);

// Mount Routes
app.use('/api/images', imageRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);

app.get('/api/site/status', async (req, res) => {
  try {
    const maintenanceMode = await getMaintenanceState();
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.status(200).json({
      success: true,
      data: {
        maintenanceMode
      }
    });
  } catch (error) {
    console.error('[Site Status Error]', error);
    res.status(200).json({
      success: true,
      data: {
        maintenanceMode: false
      }
    });
  }
});

app.use(maintenanceGuard);
app.use('/api/public', publicRoutes);

// Health check (must be before the 404 catchall)
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'success', message: 'API is running' });
});

// Minimal ping diagnostic endpoint (zero dependencies)
app.get('/api/ping', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'pong',
    timestamp: Date.now()
  });
});

// Database health check
app.get('/api/health/db', (req, res) => {
  if (mongoose.connection.readyState === 1) {
    res.status(200).json({ success: true, database: 'connected' });
  } else {
    res.status(503).json({ success: false, database: 'unavailable' });
  }
});

// Explicit 404 Handler for unmatched API routes
// This MUST come after all API routes and before ViteExpress
// so that unmatched API requests return JSON instead of the SPA index.html
app.all('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found'
  });
});

// Global API error handler
app.use((err, req, res, next) => {
  console.error('[API Error]', err);
  if (res.headersSent) {
    return next(err);
  }
  res.status(err.status || 500).json({
    success: false,
    error: process.env.NODE_ENV === 'production' ? 'Internal server error' : (err.message || 'Unknown error')
  });
});

// Database Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    // ViteExpress binds Vite with Express, serving frontend and backend on same port
    ViteExpress.listen(app, port, () => {
      console.log(`Server is listening on port ${port}...`);
    });
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB', err);
    process.exit(1);
  });
