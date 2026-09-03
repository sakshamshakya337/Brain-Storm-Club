import mongoose from 'mongoose';

const imageSchema = new mongoose.Schema({
  originalFilename: {
    type: String,
    required: true,
  },
  imageId: {
    type: String,
    required: true,
    unique: true,
  },
  publicId: {
    type: String,
    required: true,
  },
  assetId: {
    type: String,
  },
  format: {
    type: String,
  },
  width: {
    type: Number,
  },
  height: {
    type: Number,
  },
  bytes: {
    type: Number,
  },
  // Legacy fields (kept for migration/existing records)
  filename: {
    type: String,
  },
  mimeType: {
    type: String,
  },
  size: {
    type: Number,
  },
  deliveryType: {
    type: String,
    default: 'authenticated',
  },
  resourceType: {
    type: String,
    default: 'image',
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'archived'],
    default: 'approved', // Default approved so admin uploads are instantly live
  },
  ownerType: {
    type: String,
    enum: ['member', 'event', 'gallery', 'joinUs', 'about', 'admin'],
  },
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
  },
  uploadedAt: {
    type: Date,
    default: Date.now,
  },
  approvedAt: {
    type: Date,
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
  },
  // Legacy fields
  visibility: {
    type: String,
    enum: ['public', 'protected', 'private'],
    default: 'protected',
  },
  uploadedByOld: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    default: null
  }
}, { timestamps: true });

export default mongoose.model('Image', imageSchema);
