import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  type: { 
    type: String, 
    required: true,
    enum: ['MEMBER_REGISTRATION', 'JOIN_US', 'CONTACT_QUERY', 'EVENT_REGISTRATION', 'SYSTEM']
  },
  title: { type: String, required: true },
  message: { type: String, required: true },
  entityType: { type: String }, // e.g. 'Member', 'JoinUs', 'Contact', 'EventRegistration'
  entityId: { type: mongoose.Schema.Types.ObjectId },
  isRead: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.model('Notification', notificationSchema);
