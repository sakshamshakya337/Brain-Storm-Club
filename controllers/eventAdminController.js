import Admin from '../models/Admin.js';
import Event from '../models/Event.js';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

export const createEventAdmin = async (req, res) => {
  try {
    const { name, email, eventId, expiresAt } = req.body;

    if (!email || !eventId || !expiresAt) {
      return res.status(400).json({ message: 'Email, Event, and Expiration are required.' });
    }

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found.' });
    }

    const expirationDate = new Date(expiresAt);
    if (expirationDate <= new Date()) {
      return res.status(400).json({ message: 'Expiration date must be in the future.' });
    }

    const existingAdmin = await Admin.findOne({ email: new RegExp(`^${email.trim()}$`, 'i') });
    if (existingAdmin) {
      return res.status(400).json({ message: 'An admin account with this email already exists. You cannot override an existing account.' });
    }

    // Generate strong temporary password
    const tempPassword = crypto.randomBytes(8).toString('hex') + 'Ea#9'; 
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(tempPassword, salt);

    const eventAdmin = new Admin({
      name,
      email: email.trim().toLowerCase(),
      passwordHash,
      role: 'event_admin',
      assignedEventId: eventId,
      expiresAt: expirationDate,
      isActive: true
    });

    await eventAdmin.save();

    res.status(201).json({
      message: 'Event Admin created successfully.',
      tempPassword,
      eventAdmin: {
        id: eventAdmin._id,
        name: eventAdmin.name,
        email: eventAdmin.email,
        assignedEventId: eventAdmin.assignedEventId,
        expiresAt: eventAdmin.expiresAt
      }
    });

  } catch (error) {
    console.error('Error creating event admin:', error);
    res.status(500).json({ message: 'Failed to create Event Admin.' });
  }
};

export const getEventAdmins = async (req, res) => {
  try {
    const admins = await Admin.find({ role: 'event_admin' })
      .populate('assignedEventId', 'title')
      .select('-passwordHash -otpHash -resetPasswordToken');
      
    res.status(200).json(admins);
  } catch (error) {
    console.error('Error fetching event admins:', error);
    res.status(500).json({ message: 'Failed to fetch Event Admins.' });
  }
};

export const disableEventAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const admin = await Admin.findById(id);
    
    if (!admin || admin.role !== 'event_admin') {
      return res.status(404).json({ message: 'Event Admin not found.' });
    }

    admin.isActive = !admin.isActive;
    await admin.save();

    res.status(200).json({ message: `Event Admin ${admin.isActive ? 'enabled' : 'disabled'} successfully.`, admin });
  } catch (error) {
    console.error('Error disabling event admin:', error);
    res.status(500).json({ message: 'Failed to update Event Admin status.' });
  }
};

export const resetEventAdminPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const admin = await Admin.findById(id);
    
    if (!admin || admin.role !== 'event_admin') {
      return res.status(404).json({ message: 'Event Admin not found.' });
    }

    const tempPassword = crypto.randomBytes(8).toString('hex') + 'Rp#9'; 
    const salt = await bcrypt.genSalt(10);
    admin.passwordHash = await bcrypt.hash(tempPassword, salt);
    
    // Invalidate existing sessions/otps
    admin.otpHash = undefined;
    admin.otpExpiresAt = undefined;
    
    await admin.save();

    res.status(200).json({ 
      message: 'Password reset successfully.',
      tempPassword 
    });
  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(500).json({ message: 'Failed to reset password.' });
  }
};

export const extendEventAdminExpiration = async (req, res) => {
  try {
    const { id } = req.params;
    const { expiresAt } = req.body;

    if (!expiresAt) {
      return res.status(400).json({ message: 'New expiration date is required.' });
    }

    const expirationDate = new Date(expiresAt);
    if (expirationDate <= new Date()) {
      return res.status(400).json({ message: 'Expiration date must be in the future.' });
    }

    const admin = await Admin.findById(id);
    
    if (!admin || admin.role !== 'event_admin') {
      return res.status(404).json({ message: 'Event Admin not found.' });
    }

    admin.expiresAt = expirationDate;
    await admin.save();

    res.status(200).json({ message: 'Expiration extended successfully.', admin });
  } catch (error) {
    console.error('Error extending expiration:', error);
    res.status(500).json({ message: 'Failed to extend expiration.' });
  }
};
