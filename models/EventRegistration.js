import mongoose from 'mongoose';
import { REGISTRATION_NUMBER_REGEX, PHONE_REGEX, EMAIL_REGEX, NAME_REGEX, TRANSACTION_ID_REGEX } from '../utils/validation.js';

const eventRegistrationSchema = new mongoose.Schema({
  eventId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Event',
    required: true 
  },
  registrationType: {
    type: String,
    enum: ['individual', 'team'],
    required: true,
    default: 'individual'
  },
  teamSize: {
    type: Number,
    required: true,
    default: 1,
    min: 1,
    max: 10
  },
  teamName: {
    type: String,
    trim: true,
    maxlength: 100
  },
  leader: {
    registrationNumber: { type: String, required: true, trim: true, uppercase: true, match: [REGISTRATION_NUMBER_REGEX, 'Invalid registration number'] },
    fullName: { type: String, required: true, trim: true, match: [NAME_REGEX, 'Invalid name format'], minlength: 2, maxlength: 100 },
    course: { type: String, trim: true, maxlength: 100 }, 
    section: { type: String, required: true, trim: true, maxlength: 50 },
    email: { type: String, required: true, lowercase: true, trim: true, match: [EMAIL_REGEX, 'Invalid email address'] },
    phone: { type: String, required: true, trim: true, match: [PHONE_REGEX, 'Invalid phone number'] },
    whatsapp: { type: String, trim: true, match: [PHONE_REGEX, 'Invalid WhatsApp number'] },
  },
  members: [{
    registrationNumber: { type: String, required: true, trim: true, uppercase: true, match: [REGISTRATION_NUMBER_REGEX, 'Invalid registration number'] },
    fullName: { type: String, required: true, trim: true, match: [NAME_REGEX, 'Invalid name format'], minlength: 2, maxlength: 100 },
    phone: { type: String, required: true, trim: true, match: [PHONE_REGEX, 'Invalid phone number'] },
  }],
  transactionId: { type: String, trim: true, match: [TRANSACTION_ID_REGEX, 'Invalid transaction ID'] },
  paymentScreenshot: { type: mongoose.Schema.Types.ObjectId, ref: 'Image' },
  paymentStatus: {
    type: String,
    enum: ['pending', 'verified', 'rejected'],
    default: 'pending'
  },
  status: {
    type: String,
    enum: ['Registered', 'Participated', 'Completed', 'No-show', 'Certificate Issued'],
    default: 'Registered'
  },
  consentGivenAt: { type: Date, required: true, default: Date.now },
  
  // Registration QR Token for scanning attendance
  qrToken: { type: String, unique: true, sparse: true, index: true },
  
  // Audit details
  participatedAt: { type: Date },
  participatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },

  // Legacy fields to maintain backward compatibility for older entries that don't have a 'leader' object:
  registrationNumber: { type: String, trim: true, uppercase: true },
  fullName: { type: String },
  course: { type: String },
  section: { type: String },
  email: { type: String, lowercase: true },
  phone: { type: String },
  whatsapp: { type: String },
  hasWhatsapp: { type: Boolean, default: false }

}, { timestamps: true });

// Note: Compound unique index removed. Duplication checks (across leader + members) 
// must be enforced at the application layer.

export default mongoose.model('EventRegistration', eventRegistrationSchema);
