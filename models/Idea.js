import mongoose from 'mongoose';

const ideaSchema = new mongoose.Schema({
  name:        { type: String, required: true, trim: true },
  course:      { type: String, required: true, trim: true },
  section:     { type: String, required: true, trim: true },
  contact:     { type: String, required: true, trim: true },
  title:       { type: String, required: true, trim: true },
  description: { type: String, required: true, trim: true },
  outcome:     { type: String, required: true, trim: true },
  category:    { type: String, trim: true, default: '' },

  // PDF attachment (optional)
  pdfPublicId:       { type: String, default: null },
  pdfOriginalName:   { type: String, default: null },
  pdfSizeBytes:      { type: Number, default: null },
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
