import mongoose from 'mongoose';

const memberSchema = new mongoose.Schema({
  // ── Member type ──────────────────────────────────────────────────────────
  memberType: {
    type: String,
    enum: ['student', 'faculty'],
    default: 'student',
  },

  // ── Core identity ─────────────────────────────────────────────────────────
  fullName: { type: String, required: true, trim: true },

  // registrationNumber: required for students, optional for faculty.
  registrationNumber: {
    type: String,
    trim: true,
    uppercase: true,
  },

  // ── Academic (student) fields ─────────────────────────────────────────────
  course:  { type: String, default: '' },
  section: { type: String, default: '' },

  // ── Faculty-specific fields ───────────────────────────────────────────────
  employeeId:   { type: String, trim: true },
  department:   { type: String, default: '' },   // e.g. "School of Computer Applications"
  designation:  { type: String, default: '' },   // e.g. "Assistant Professor"

  // ── Contact ───────────────────────────────────────────────────────────────
  email:    { type: String, default: '', lowercase: true, trim: true },
  phone:    { type: String, default: '' },
  whatsapp: { type: String, default: '' },

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
