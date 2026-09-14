import mongoose from 'mongoose';

const adminSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true
  },
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
    enum: ['admin', 'event_admin'],
    default: 'admin',
  },
  assignedEventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    default: null
  },
  expiresAt: {
    type: Date,
    default: null
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

// Index for TTL (Time To Live). Documents will automatically be deleted when expiresAt passes.
// If expiresAt is null or absent, the document will not be deleted (perfect for global admins).
adminSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model('Admin', adminSchema);
