import mongoose from 'mongoose';

const teamSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true, 
    trim: true,
    minlength: 2,
    maxlength: 100
  },
  normalizedTeamName: { 
    type: String, 
    required: true, 
    unique: true 
  }
}, { timestamps: true });

export default mongoose.model('Team', teamSchema);
