import mongoose from 'mongoose';

const linkItemSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    maxlength: 50,
  },
  url: {
    type: String,
    required: true,
  },
  iconType: {
    type: String,
    enum: ['preset', 'custom'],
    default: 'preset',
  },
  presetIcon: {
    type: String,
    default: 'Globe',
  },
  customImageId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Image',
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  order: {
    type: Number,
    default: 0,
  },
  clickCount: {
    type: Number,
    default: 0,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
  }
}, { timestamps: true });

export default mongoose.model('LinkItem', linkItemSchema);
