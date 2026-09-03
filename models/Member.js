import mongoose from 'mongoose';

const memberSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  registrationNumber: { 
    type: String, 
    required: true, 
    unique: true, // Crucial: Unique index enforced
    trim: true,
    uppercase: true
  },
  course: { type: String, required: true },
  section: { type: String, required: true },
  email: { type: String, required: true, lowercase: true },
  phone: { type: String, required: true },
  whatsapp: { type: String, required: true },
  role: { type: String, required: true },
  photoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Image',
    required: true,
  }, // URL path
  status: { 
    type: String, 
    enum: ['Pending', 'Approved', 'Rejected'],
    default: 'Pending'
  },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
  approvedAt: { type: Date },
  rejectionReason: { type: String },
  consentGivenAt: { type: Date, required: true, default: Date.now },
}, { timestamps: true });

export default mongoose.model('Member', memberSchema);
