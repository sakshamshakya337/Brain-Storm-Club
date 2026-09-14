import mongoose from 'mongoose';

const feedbackSchema = new mongoose.Schema({
  eventId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Event', 
    required: true 
  },
  name: { 
    type: String, 
    default: 'Anonymous' 
  },
  rating: { 
    type: Number, 
    min: 1, 
    max: 5, 
    required: true 
  },
  comment: { 
    type: String, 
    default: '' 
  }
}, { timestamps: true });

export default mongoose.model('Feedback', feedbackSchema);
