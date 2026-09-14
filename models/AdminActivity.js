import mongoose from 'mongoose';

const adminActivitySchema = new mongoose.Schema({
  action: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  targetId: {
    type: mongoose.Schema.Types.ObjectId,
    required: false,
  },
  targetModel: {
    type: String,
    enum: ['Member', 'JoinUs', 'Event', 'ContactQuery', 'Admin'],
    required: false,
  },
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: false, // sometimes system-generated, e.g., new join request
  },
  status: {
    type: String,
    enum: ['SUCCESS', 'FAILED', 'INFO'],
    default: 'INFO'
  },
  ipAddress: {
    type: String,
    required: false
  },
  userAgent: {
    type: String,
    required: false
  },
  emailAttempted: {
    type: String,
    required: false
  },
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

// Index for fetching recent activity efficiently and auto-deleting after 30 days
adminActivitySchema.index({ createdAt: -1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });

export default mongoose.models.AdminActivity || mongoose.model('AdminActivity', adminActivitySchema);
