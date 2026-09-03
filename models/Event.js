import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  date: { type: Date, required: true },
  venue: { type: String, required: true },
  category: { type: String, required: true }, // e.g. Hackathon, Workshop
  posterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Image',
  },
  status: { 
    type: String, 
    enum: ['Upcoming', 'Ongoing', 'Completed'],
    default: 'Upcoming'
  },
  registrationOpen: { type: Boolean, default: true },
  gallery: [{ type: String }],
  schedule: [{
    time: String,
    activity: String
  }],
  coordinators: [{
    name: String,
    role: String
  }]
}, { timestamps: true });

export default mongoose.model('Event', eventSchema);
