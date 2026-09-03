import mongoose from 'mongoose';

const eventRegistrationSchema = new mongoose.Schema({
  eventId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Event',
    required: true 
  },
  registrationNumber: { 
    type: String, 
    required: true,
    trim: true,
    uppercase: true
  },
  fullName: { type: String, required: true },
  course: { type: String, required: true },
  section: { type: String, required: true },
  email: { type: String, required: true, lowercase: true },
  phone: { type: String, required: true },
  whatsapp: { type: String }, // Optional but good for broadcast lists
  hasWhatsapp: { type: Boolean, default: false },
  status: {
    type: String,
    enum: ['Registered', 'Participated', 'Completed', 'No-show', 'Certificate Issued'],
    default: 'Registered'
  },
  consentGivenAt: { type: Date, required: true, default: Date.now }
}, { timestamps: true });

// CRITICAL: Prevent duplicate registration per event
eventRegistrationSchema.index({ eventId: 1, registrationNumber: 1 }, { unique: true });

export default mongoose.model('EventRegistration', eventRegistrationSchema);
