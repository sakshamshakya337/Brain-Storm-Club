import mongoose from 'mongoose';
import { EMAIL_REGEX, NAME_REGEX } from '../utils/validation.js';

const ideaSchema = new mongoose.Schema({
  name:        { type: String, required: true, trim: true, match: [NAME_REGEX, 'Invalid name format'], minlength: 2, maxlength: 100 },
  course:      { type: String, required: true, trim: true, maxlength: 100 },
  section:     { type: String, required: true, trim: true, maxlength: 50 },
  contact:     { type: String, required: true, trim: true, minlength: 5, maxlength: 100 },
  email:       { type: String, trim: true, lowercase: true, match: [EMAIL_REGEX, 'Invalid email address'] },
  title:       { type: String, required: true, trim: true, minlength: 5, maxlength: 200 },
  description: { type: String, required: true, trim: true, minlength: 10, maxlength: 5000 },
  outcome:     { type: String, required: true, trim: true, minlength: 10, maxlength: 2000 },
  category:    { type: String, trim: true, default: '', maxlength: 50 },

  // PDF attachment (optional)
  pdfPublicId:       { type: String, default: null },
  pdfOriginalName:   { type: String, default: null },
  pdfSizeBytes:      { type: Number, default: null },
  pdfMimeType:       { type: String, default: 'application/pdf' },
  pdfSecureUrl:      { type: String, default: null },  // signed on-demand, not stored permanently

  status: {
    type: String,
    enum: ['New', 'Reviewed', 'Shortlisted', 'Implemented', 'Rejected'],
    default: 'New'
  },
  adminNotes: { type: String, default: '' },
  linkedEventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event' }
}, { timestamps: true });

export default mongoose.model('Idea', ideaSchema);
