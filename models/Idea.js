import mongoose from 'mongoose';

const ideaSchema = new mongoose.Schema({
  name: { type: String, required: true },
  course: { type: String, required: true },
  section: { type: String, required: true },
  contact: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  outcome: { type: String, required: true },
  status: {
    type: String,
    enum: ['New', 'Reviewed', 'Shortlisted', 'Implemented', 'Rejected'],
    default: 'New'
  },
  linkedEventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event' } // For analytics conversion rate
}, { timestamps: true });

export default mongoose.model('Idea', ideaSchema);
