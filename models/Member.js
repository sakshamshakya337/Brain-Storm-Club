import mongoose from 'mongoose';
import { REGISTRATION_NUMBER_REGEX, PHONE_REGEX, EMAIL_REGEX, NAME_REGEX } from '../utils/validation.js';

const memberSchema = new mongoose.Schema({
  // ── Member type ──────────────────────────────────────────────────────────
  memberType: {
    type: String,
    enum: ['student', 'faculty'],
    default: 'student',
  },

  // ── Core identity ─────────────────────────────────────────────────────────
  fullName: { type: String, required: true, trim: true, match: [NAME_REGEX, 'Invalid name format'], minlength: 2, maxlength: 100 },

  // registrationNumber: required for students, optional for faculty.
  registrationNumber: {
    type: String,
    trim: true,
    uppercase: true,
    match: [REGISTRATION_NUMBER_REGEX, 'Invalid registration number']
  },

  // ── Academic (student) fields ─────────────────────────────────────────────
  course:  { type: String, default: '', trim: true, maxlength: 100 },
  section: { type: String, default: '', trim: true, maxlength: 50 },

  // ── Faculty-specific fields ───────────────────────────────────────────────
  employeeId:   { type: String, trim: true, maxlength: 50 },
  department:   { type: String, default: '', trim: true, maxlength: 150 },   // e.g. "School of Computer Applications"
  designation:  { type: String, default: '', trim: true, maxlength: 100 },   // e.g. "Assistant Professor"

  // ── Contact ───────────────────────────────────────────────────────────────
  email:    { type: String, default: '', lowercase: true, trim: true, match: [EMAIL_REGEX, 'Invalid email address'] },
  phone:    { type: String, default: '', trim: true, match: [PHONE_REGEX, 'Invalid phone number'] },
  whatsapp: { type: String, default: '', trim: true, match: [PHONE_REGEX, 'Invalid WhatsApp number'] },

  // ── Domain & Role / position ───────────────────────────────────────────────
  domain: { type: String, trim: true, default: '' },
  role:   { type: String, required: true, trim: true },

  // ── Photo ─────────────────────────────────────────────────────────────────
  photoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Image',
    default: null,
  },

  // ── Workflow ──────────────────────────────────────────────────────────────
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected'],
    default: 'Pending',
  },
  approvedBy:      { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
  approvedAt:      { type: Date },
  rejectionReason: { type: String },
  consentGivenAt:  { type: Date, default: Date.now },
}, { timestamps: true });

// ── Indexes ──────────────────────────────────────────────────────────────────
// Unique on registrationNumber and employeeId only when non-empty string.
memberSchema.index(
  { registrationNumber: 1 },
  { unique: true, partialFilterExpression: { registrationNumber: { $type: 'string' } } }
);
memberSchema.index(
  { employeeId: 1 },
  { unique: true, partialFilterExpression: { employeeId: { $type: 'string' } } }
);

export default mongoose.model('Member', memberSchema);
