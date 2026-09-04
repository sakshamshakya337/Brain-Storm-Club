import mongoose from 'mongoose';

const contactSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, lowercase: true },
  subject: { type: String, required: true },
  message: { type: String, required: true },
  status: {
    type: String,
    enum: ['Unread', 'Read', 'Replied', 'Resolved'],
    default: 'Unread'
  },
  replies: [{
    message: { type: String, required: true },
    adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
    adminName: { type: String },
    sentAt: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

export default mongoose.model('Contact', contactSchema);
