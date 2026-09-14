import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  type: { 
    type: String, 
    required: true,
    enum: ['MEMBER_REGISTRATION', 'JOIN_US', 'CONTACT_QUERY', 'EVENT_REGISTRATION', 'IDEA_SUBMISSION', 'SYSTEM']
  },
  title: { type: String, required: true },
  message: { type: String, required: true },
  entityType: { type: String }, // e.g. 'Member', 'JoinUs', 'Contact', 'EventRegistration'
  entityId: { type: mongoose.Schema.Types.ObjectId },
  isRead: { type: Boolean, default: false },
}, { timestamps: true });

// Auto-delete notifications after 30 days
notificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });

export default mongoose.model('Notification', notificationSchema);
