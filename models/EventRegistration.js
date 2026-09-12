import mongoose from 'mongoose';

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
  leader: {
    registrationNumber: { type: String, required: true, trim: true, uppercase: true },
    fullName: { type: String, required: true },
    course: { type: String }, // Optional for backward compatibility, required logically via UI if needed
    section: { type: String, required: true },
    email: { type: String, required: true, lowercase: true },
    phone: { type: String, required: true },
    whatsapp: { type: String },
  },
  members: [{
    registrationNumber: { type: String, required: true, trim: true, uppercase: true },
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
  }],
  transactionId: { type: String },
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
