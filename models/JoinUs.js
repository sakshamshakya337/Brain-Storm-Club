import mongoose from 'mongoose';

const joinUsSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  registrationNumber: { 
    type: String, 
    required: true, 
    unique: true, 
    trim: true, 
    uppercase: true 
  },
  course: { type: String, required: true },
  section: { type: String, required: true },
  email: { type: String, required: true, lowercase: true },
  phone: { type: String, required: true },
  whatsapp: { type: String },
  whyJoin: { type: String, required: true },
  interests: [{ type: String }],
  status: {
    type: String,
    enum: ['New', 'Contacted', 'Onboarded', 'Rejected'],
    default: 'New'
  },
  photoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Image',
    required: true,
  },
  consentGivenAt: { type: Date, required: true, default: Date.now }
}, { timestamps: true });

export default mongoose.model('JoinUs', joinUsSchema);
