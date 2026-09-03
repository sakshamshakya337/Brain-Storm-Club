import mongoose from 'mongoose';

const systemSettingsSchema = new mongoose.Schema({
  maintenanceMode: { type: Boolean, default: false },
  publicSiteActive: { type: Boolean, default: true },
  registrationOpen: { type: Boolean, default: true },
  notificationsEnabled: {
    memberRegistration: { type: Boolean, default: true },
    joinUs: { type: Boolean, default: true },
    contactQuery: { type: Boolean, default: true },
    eventRegistration: { type: Boolean, default: true }
  }
}, { timestamps: true });

export default mongoose.model('SystemSettings', systemSettingsSchema);
