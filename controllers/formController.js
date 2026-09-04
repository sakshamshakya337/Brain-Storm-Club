import Member from '../models/Member.js';
import JoinUs from '../models/JoinUs.js';
import Contact from '../models/Contact.js';
import Idea from '../models/Idea.js';
import EventRegistration from '../models/EventRegistration.js';
import Event from '../models/Event.js';
import Notification from '../models/Notification.js';
import SystemSettings from '../models/SystemSettings.js';
import { getMaintenanceState } from '../middleware/maintenance.js';

const getSystemSettings = async () => {
  try {
    const s = await SystemSettings.findOne().select('maintenanceMode registrationOpen').lean();
    return s ?? { maintenanceMode: false, registrationOpen: true };
  } catch {
    return { maintenanceMode: false, registrationOpen: true };
  }
};

export const submitMemberRegistration = async (req, res) => {
  try {
    const { registrationNumber } = req.body;

    const PUBLIC_ROLES = ['Technical Team', 'Media Team', 'Anchor', 'Coordinator'];
    if (!PUBLIC_ROLES.includes(req.body.role)) {
      return res.status(403).json({
        message: 'Invalid role selection. Leadership roles are assigned by administrators only.'
      });
    }

    if (!req.body.protectedImageId) {
      return res.status(400).json({ message: 'Profile image is required' });
    }

    const normalizedRegNo = registrationNumber.trim().toUpperCase();

    const existing = await Member.findOne({ registrationNumber: normalizedRegNo });
    if (existing) {
      return res.status(409).json({ message: 'A registration for this number already exists.' });
    }

    const memberData = {
      ...req.body,
      registrationNumber: normalizedRegNo,
      photoId: req.body.protectedImageId,
      status: 'Pending'
    };

    const member = await Member.create(memberData);
    
    await Notification.create({
      type: 'MEMBER_REGISTRATION',
      title: 'New Member Registration',
      message: `A new member registration (${normalizedRegNo}) is waiting for approval.`,
      entityType: 'Member',
      entityId: member._id
    }).catch(err => console.error('Failed to create notification', err));

    res.status(201).json({ status: 'success', message: 'Registration submitted for approval.', data: { member } });

  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ message: 'A registration for this number already exists.' });
    res.status(500).json({ message: 'Error submitting registration' });
  }
};

export const submitJoinUs = async (req, res) => {
  try {
    const { registrationNumber } = req.body;
    const normalizedRegNo = registrationNumber.trim().toUpperCase();

    if (!req.body.protectedImageId) {
      return res.status(400).json({ message: 'Profile image is required' });
    }

    const joinUsData = { 
      ...req.body, 
      registrationNumber: normalizedRegNo,
      interests: req.body['interests[]'] || req.body.interests,
      photoId: req.body.protectedImageId
    };
    const entry = await JoinUs.create(joinUsData);

    await Notification.create({
      type: 'JOIN_US',
      title: 'New Join Us Request',
      message: `A new Join Us application has been submitted by ${entry.fullName}.`,
      entityType: 'JoinUs',
      entityId: entry._id
    }).catch(err => console.error('Failed to create notification', err));

    res.status(201).json({ status: 'success', message: 'Application received!', data: { entry } });
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ message: 'You have already applied.' });
    res.status(500).json({ message: 'Error submitting application' });
  }
};

export const submitContact = async (req, res) => {
  try {
    const contact = await Contact.create(req.body);

    await Notification.create({
      type: 'CONTACT_QUERY',
      title: 'New Contact Query',
      message: `New message received from ${contact.name}.`,
      entityType: 'Contact',
      entityId: contact._id
    }).catch(err => console.error('Failed to create notification', err));

    res.status(201).json({ status: 'success', message: 'Message sent successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Error sending message' });
  }
};

export const submitIdea = async (req, res) => {
  try {
    const { name, course, section, contact, title, description, outcome, category } = req.body;

    // Required field validation
    if (!name || !course || !section || !contact || !title || !description || !outcome) {
      return res.status(400).json({ message: 'All required fields must be filled in.' });
    }

    const ideaData = {
      name: name.trim(),
      course: course.trim(),
      section: section.trim(),
      contact: contact.trim(),
      title: title.trim(),
      description: description.trim(),
      outcome: outcome.trim(),
      category: category ? category.trim() : '',
    };

    // Attach PDF metadata if upload middleware ran
    if (req.pdfPublicId) {
      ideaData.pdfPublicId     = req.pdfPublicId;
      ideaData.pdfOriginalName = req.pdfOriginalName;
      ideaData.pdfSizeBytes    = req.pdfSizeBytes;
    }

    const idea = await Idea.create(ideaData);

    await Notification.create({
      type: 'IDEA_SUBMISSION',
      title: 'New Idea Submitted',
      message: `A new idea "${idea.title}" has been submitted by ${idea.name}.`,
      entityType: 'Idea',
      entityId: idea._id
    }).catch(err => console.error('Failed to create notification:', err));

    res.status(201).json({ status: 'success', message: 'Idea submitted successfully.', data: { id: idea._id } });
  } catch (error) {
    console.error('[submitIdea error]', error);
    res.status(500).json({ message: 'Error submitting idea. Please try again.' });
  }
};

export const submitEventRegistration = async (req, res) => {
  try {
    const { eventId, registrationNumber } = req.body;
    
    const settings = await getSystemSettings();

    if (settings.maintenanceMode) {
      return res.status(503).json({
        success: false,
        message: 'The Brainstorm website is temporarily unavailable for maintenance.'
      });
    }

    if (!settings.registrationOpen) {
      return res.status(409).json({
        success: false,
        message: 'Global event registration is currently closed.'
      });
    }

    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });
    if (!event.registrationOpen) {
      return res.status(409).json({ success: false, message: 'Registration is currently closed for this event.' });
    }

    const normalizedRegNo = registrationNumber.trim().toUpperCase();
    const regData = { ...req.body, registrationNumber: normalizedRegNo };

    const registration = await EventRegistration.create(regData);

    await Notification.create({
      type: 'EVENT_REGISTRATION',
      title: 'New Event Registration',
      message: `A student registered for the event: ${event.title}.`,
      entityType: 'EventRegistration',
      entityId: registration._id
    }).catch(err => console.error('Failed to create notification', err));

    res.status(201).json({ status: 'success', message: 'Successfully registered for event.' });
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ message: 'You are already registered for this event.' });
    res.status(500).json({ message: 'Error registering for event' });
  }
};
