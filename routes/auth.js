import express from 'express';
import rateLimit from 'express-rate-limit';
import { requestOTP, verifyOTP, logout, forgotPassword, resetPassword } from '../controllers/authController.js';

const router = express.Router();

const otpLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 3, // Limit each IP to 3 OTP requests per window
  message: { message: 'Too many OTP requests from this IP, please try again after 5 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Strict rate limiter on OTP verification to prevent 6-digit brute force attacks
const otpVerifyLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 5, // Limit each IP to 5 verification attempts per window
  message: { message: 'Too many verification attempts from this IP. Please try again after 10 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter on password reset endpoints to stop email flooding
const passwordResetLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per window
  message: { message: 'Too many password reset requests from this IP. Please try again after 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/request-otp', otpLimiter, requestOTP);
router.post('/verify-otp', otpVerifyLimiter, verifyOTP);
router.post('/logout', logout);
router.post('/forgot-password', passwordResetLimiter, forgotPassword);
router.post('/reset-password', passwordResetLimiter, resetPassword);

export default router;
