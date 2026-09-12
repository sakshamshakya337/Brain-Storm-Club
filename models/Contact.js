import mongoose from 'mongoose';
import { EMAIL_REGEX, NAME_REGEX } from '../utils/validation.js';

const contactSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, match: [NAME_REGEX, 'Invalid name format'], minlength: 2, maxlength: 100 },
  email: { type: String, required: true, lowercase: true, trim: true, match: [EMAIL_REGEX, 'Invalid email address'] },
  subject: { type: String, required: true, trim: true, minlength: 2, maxlength: 150 },
  message: { type: String, required: true, trim: true, minlength: 10, maxlength: 2000 },
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
