import mongoose from 'mongoose';
import { REGISTRATION_NUMBER_REGEX, PHONE_REGEX, EMAIL_REGEX, NAME_REGEX } from '../utils/validation.js';

const joinUsSchema = new mongoose.Schema({
  fullName: { type: String, required: true, trim: true, match: [NAME_REGEX, 'Invalid name format'], minlength: 2, maxlength: 100 },
  registrationNumber: { 
    type: String, 
    required: true, 
    unique: true, 
    trim: true, 
    uppercase: true,
    match: [REGISTRATION_NUMBER_REGEX, 'Invalid registration number']
  },
  course: { type: String, required: true, trim: true, maxlength: 100 },
  section: { type: String, required: true, trim: true, maxlength: 50 },
  email: { type: String, required: true, lowercase: true, trim: true, match: [EMAIL_REGEX, 'Invalid email address'] },
  phone: { type: String, required: true, trim: true, match: [PHONE_REGEX, 'Invalid phone number'] },
  whatsapp: { type: String, trim: true, match: [PHONE_REGEX, 'Invalid WhatsApp number'] },
  whyJoin: { type: String, required: true, trim: true, minlength: 10, maxlength: 1000 },
  interests: [{ type: String }],
  domain: {
    type: String,
    enum: ['Technical', 'Anchor', 'Media', 'Coordinator'],
    default: 'Technical',
    required: true
  },
  status: {
    type: String,
    enum: ['New', 'Pending', 'Contacted', 'Approved', 'Onboarded', 'Rejected'],
    default: 'New'
  },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
  approvedAt: { type: Date },
  rejectionReason: { type: String },
  photoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Image',
    required: true,
  },
  consentGivenAt: { type: Date, required: true, default: Date.now }
}, { timestamps: true });

export default mongoose.model('JoinUs', joinUsSchema);
