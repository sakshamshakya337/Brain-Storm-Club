import Admin from '../models/Admin.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { sendPasswordResetEmail, sendAdminLoginOTP } from '../utils/email.js';

export const requestOTP = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    // 1. Look up admin safely
    const normalizedEmail = email.trim().toLowerCase();
    const admin = await Admin.findOne({ email: new RegExp(`^${normalizedEmail}$`, 'i') });
    
    if (!admin || !admin.isActive) {
      // Return generic error to prevent email enumeration
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, admin.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // 2. Generate secure 6 digit OTP
    const rawOtp = crypto.randomInt(100000, 1000000).toString();
    const expiresAt = new Date(Date.now() + (process.env.OTP_EXPIRES_MIN || 5) * 60000);

    // 3. Hash OTP
    const otpHash = crypto.createHash('sha256').update(rawOtp).digest('hex');

    // 4. Save securely
    admin.otpHash = otpHash;
    admin.otpExpiresAt = expiresAt;
    admin.otpAttempts = 0;
    admin.otpCreatedAt = new Date();
    await admin.save();

    // 5. Send real email
    try {
      await sendAdminLoginOTP(admin.email, rawOtp);
    } catch (emailError) {
      return res.status(503).json({ 
        message: 'Unable to send verification email. Please try again later.' 
      });
    }

    // 6. Return safe generic response
    res.status(200).json({ 
      success: true,
      message: 'If the administrator account exists, an OTP has been sent to the registered email address.' 
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error during login' });
  }
};

export const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: 'Please provide email and OTP' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const admin = await Admin.findOne({ email: new RegExp(`^${normalizedEmail}$`, 'i') });
    
    if (!admin || !admin.otpHash) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    // Check expiration
    if (new Date() > admin.otpExpiresAt) {
      // Clear expired OTP securely
      admin.otpHash = undefined;
      admin.otpExpiresAt = undefined;
      admin.otpAttempts = 0;
      await admin.save();
      return res.status(400).json({ message: 'OTP has expired. Please request a new one.' });
    }

    // Check attempt limit
    if (admin.otpAttempts >= 5) {
      admin.otpHash = undefined;
      admin.otpExpiresAt = undefined;
      await admin.save();
      return res.status(400).json({ message: 'Maximum attempts reached. Please request a new OTP.' });
    }

    // Hash the submitted OTP and compare
    const submittedHash = crypto.createHash('sha256').update(otp).digest('hex');
    
    // Secure comparison (timing-safe)
    const storedHashBuffer = Buffer.from(admin.otpHash);
    const submittedHashBuffer = Buffer.from(submittedHash);
    
    let isMatch = false;
    if (storedHashBuffer.length === submittedHashBuffer.length) {
      isMatch = crypto.timingSafeEqual(storedHashBuffer, submittedHashBuffer);
    }

    if (!isMatch) {
      admin.otpAttempts += 1;
      await admin.save();
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    // OTP valid. Clear it securely.
    admin.otpHash = undefined;
    admin.otpExpiresAt = undefined;
    admin.otpAttempts = 0;
    await admin.save();

    // Issue JWT
    const token = jwt.sign(
      { id: admin._id, role: admin.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
    );

    const cookieOptions = {
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Strict'
    };

    res.cookie('jwt', token, cookieOptions);

    res.status(200).json({
      status: 'success',
      data: {
        admin: {
          id: admin._id,
          email: admin.email,
          role: admin.role
        }
      }
    });

  } catch (error) {
    res.status(500).json({ message: 'Server error during OTP verification' });
  }
};

export const logout = (req, res) => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });
  res.status(200).json({ status: 'success' });
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required.' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const admin = await Admin.findOne({ email: new RegExp(`^${normalizedEmail}$`, 'i') });

    if (!admin || !admin.isActive) {
      return res.status(200).json({ 
        success: true,
        message: 'If that email exists in our system, a password reset link has been sent.' 
      });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    
    admin.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    admin.resetPasswordExpires = Date.now() + 10 * 60 * 1000;

    await admin.save();

    const origin = process.env.APP_URL || req.headers.origin || process.env.CORS_ORIGIN || 'http://localhost:5173';
    const resetUrl = `${origin}/control/reset-password/${resetToken}`;

    try {
      await sendPasswordResetEmail(admin.email, resetUrl);
    } catch (emailErr) {
      return res.status(503).json({ 
        success: false,
        message: 'Password recovery is temporarily unavailable. Please try again later.' 
      });
    }

    res.status(200).json({ 
      success: true,
      message: 'If that email exists in our system, a password reset link has been sent.' 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Unable to send password recovery email. Please try again later.' 
    });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({ message: 'Token and new password are required' });
    }

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const admin = await Admin.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!admin) {
      return res.status(400).json({ message: 'Token is invalid or has expired' });
    }

    const salt = await bcrypt.genSalt(10);
    admin.passwordHash = await bcrypt.hash(password, salt);
    
    admin.resetPasswordToken = undefined;
    admin.resetPasswordExpires = undefined;
    
    // Clear existing OTP sessions
    admin.otpHash = undefined;
    admin.otpExpiresAt = undefined;
    admin.otpAttempts = 0;

    await admin.save();

    res.status(200).json({ message: 'Password successfully reset' });
  } catch (error) {
    res.status(500).json({ message: 'Error resetting password' });
  }
};
