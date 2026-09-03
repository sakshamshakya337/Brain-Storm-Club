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
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

// Index for fetching recent activity efficiently
adminActivitySchema.index({ createdAt: -1 });

export default mongoose.models.AdminActivity || mongoose.model('AdminActivity', adminActivitySchema);
