import mongoose from 'mongoose';

const adminSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  passwordHash: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    default: 'admin',
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  otpHash: String,
  otpExpiresAt: Date,
  otpAttempts: {
    type: Number,
    default: 0
  },
  otpCreatedAt: Date,
  resetPasswordToken: String,
  resetPasswordExpires: Date
}, { timestamps: true });

export default mongoose.model('Admin', adminSchema);
