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

router.post('/request-otp', otpLimiter, requestOTP);
router.post('/verify-otp', verifyOTP);
router.post('/logout', logout);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

export default router;
