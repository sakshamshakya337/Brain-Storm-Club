import express from 'express';
import rateLimit from 'express-rate-limit';
import slowDown from 'express-slow-down';
import { getProtectedImage } from '../controllers/imageController.js';
import { protectAdmin } from '../middleware/auth.js';

const router = express.Router();

// Rate limiters for anti-scraping
const speedLimiter = slowDown({
  windowMs: 5 * 60 * 1000, // 5 minutes
  delayAfter: 60, // allow 60 requests per 5 minutes, then...
  delayMs: (hits) => (hits - 60) * 100, // add 100ms of delay per request above 60
});

const rateLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 120, // limit each IP to 120 requests per windowMs
  message: { message: 'Too many image requests from this IP, please try again after 5 minutes.' },
});

router.use(speedLimiter);
router.use(rateLimiter);

// Public route for fetching allowed images (public/protected visibility)
router.get('/:id', getProtectedImage);

// Admin route for fetching any image including private ones
// In our updated logic, we pass the JWT via cookies or headers if possible, or just rely on the same endpoint
// The spec says: "/api/images/:imageId ... allows status: pending when requester holds valid admin JWT"
// So we can mount it twice or handle it in one route using a soft auth middleware
// For now, keep the explicit admin route if needed, or just let the main route handle it if protectAdmin is optional
router.get('/admin/:id', protectAdmin, getProtectedImage);

export default router;
