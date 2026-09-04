import express from 'express';
import rateLimit from 'express-rate-limit';
import slowDown from 'express-slow-down';
import { getProtectedImage } from '../controllers/imageController.js';
import { protectAdmin, optionalAdminAuth } from '../middleware/auth.js';

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

// Route for fetching images:
// Public callers can fetch approved/public/protected images.
// Authenticated admins (via optionalAdminAuth) can also view private and pending images.
router.get('/:id', optionalAdminAuth, getProtectedImage);

// Explicit admin route for fetching any image including private ones
router.get('/admin/:id', protectAdmin, getProtectedImage);

export default router;
