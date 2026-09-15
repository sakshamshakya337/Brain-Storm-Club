import crypto from 'crypto';
import Member from '../models/Member.js';
import JoinUs from '../models/JoinUs.js';
import Contact from '../models/Contact.js';
import Idea from '../models/Idea.js';
import EventRegistration from '../models/EventRegistration.js';
import Event from '../models/Event.js';
import Team from '../models/Team.js';
import Notification from '../models/Notification.js';
import SystemSettings from '../models/SystemSettings.js';
import Feedback from '../models/Feedback.js';
import { getMaintenanceState } from '../middleware/maintenance.js';
import { sendIdeaConfirmationEmail } from '../utils/email.js';
import { 
  validateRegistrationNumber, 
  validatePhone, 
  validateEmail, 
  validateName, 
  validateRequiredText, 
  validateTransactionId,
  PHONE_REGEX
} from '../utils/validation.js';

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
    const { registrationNumber, fullName, course, section, email, phone, whatsapp, role } = req.body;

    const PUBLIC_ROLES = ['Technical Team', 'Media Team', 'Anchor', 'Coordinator'];
    if (!PUBLIC_ROLES.includes(role)) {
      return res.status(403).json({
        message: 'Invalid role selection. Leadership roles are assigned by administrators only.'
      });
    }

    if (!req.body.protectedImageId) {
      return res.status(400).json({ message: 'Profile image is required' });
    }

    const errors = [
      validateRegistrationNumber(registrationNumber),
      validateName(fullName, 'Full name'),
      validateRequiredText(course, 'Course', 2, 100),
      validateRequiredText(section, 'Section', 2, 50),
      validateEmail(email),
      validatePhone(phone, 'Phone number'),
      whatsapp ? validatePhone(whatsapp, 'WhatsApp number') : null
    ].filter(Boolean);

    if (errors.length > 0) {
      return res.status(400).json({ message: errors[0], errors });
    }

    const normalizedRegNo = registrationNumber.trim().toUpperCase();

    const existing = await Member.findOne({ registrationNumber: normalizedRegNo });
    if (existing) {
      return res.status(409).json({ message: 'A registration for this number already exists.' });
    }

    const memberData = {
      ...req.body,
      fullName: fullName.trim(),
      course: course.trim(),
      section: section.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      whatsapp: whatsapp ? whatsapp.trim() : '',
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
    const { registrationNumber, fullName, course, section, email, phone, whatsapp, whyJoin } = req.body;

    // ── Server-side rules acknowledgement gate ─────────────────────────────
    if (req.body.rulesAccepted !== 'true' && req.body.rulesAccepted !== true) {
      return res.status(422).json({
        message: 'You must read and accept the Club Rules & Guidelines before submitting your application.'
      });
    }

    if (!req.body.protectedImageId) {
      return res.status(400).json({ message: 'Profile image is required' });
    }

    const errors = [
      validateRegistrationNumber(registrationNumber),
      validateName(fullName, 'Full name'),
      validateRequiredText(course, 'Course', 2, 100),
      validateRequiredText(section, 'Section', 2, 50),
      validateEmail(email),
      validatePhone(phone, 'Phone number'),
      whatsapp ? validatePhone(whatsapp, 'WhatsApp number') : null,
      validateRequiredText(whyJoin, 'Why join', 10, 1000)
    ].filter(Boolean);

    if (errors.length > 0) {
      return res.status(400).json({ message: errors[0], errors });
    }

    const normalizedRegNo = registrationNumber.trim().toUpperCase();

    // Check if student is already a registered member
    const existingMember = await Member.findOne({ registrationNumber: normalizedRegNo });
    if (existingMember) {
      return res.status(409).json({ message: 'You are already an active member of Brainstorm Club.' });
    }

    // Controlled domain validation (enforce allowed enum; default to Technical)
    const ALLOWED_DOMAINS = ['Technical', 'Anchor', 'Media', 'Coordinator'];
    const domainCandidate = req.body.domain ? req.body.domain.trim() : '';
    const validDomain = ALLOWED_DOMAINS.includes(domainCandidate) ? domainCandidate : 'Technical';

    const joinUsData = { 
      fullName: fullName.trim(),
      registrationNumber: normalizedRegNo,
      course: course.trim(),
      section: section.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      whatsapp: whatsapp ? whatsapp.trim() : phone.trim(),
      whyJoin: whyJoin.trim(),
      domain: validDomain,
      interests: req.body['interests[]'] || req.body.interests || [],
      photoId: req.body.protectedImageId,
      status: 'New'
    };

    const entry = await JoinUs.create(joinUsData);

    await Notification.create({
      type: 'JOIN_US',
      title: 'New Join Us Request',
      message: `A new Join Us application has been submitted by ${entry.fullName} (${validDomain} Domain).`,
      entityType: 'JoinUs',
      entityId: entry._id
    }).catch(err => console.error('Failed to create notification', err));

    res.status(201).json({ status: 'success', message: 'Application received!', data: { entry } });
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ message: 'You have already applied.' });
    console.error('[submitJoinUs error]', error);
    res.status(500).json({ message: 'Error submitting application' });
  }
};

export const submitContact = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    const errors = [
      validateName(name, 'Name'),
      validateEmail(email),
      validateRequiredText(subject, 'Subject', 2, 150),
      validateRequiredText(message, 'Message', 10, 2000)
    ].filter(Boolean);

    if (errors.length > 0) {
      return res.status(400).json({ message: errors[0], errors });
    }

    const contact = await Contact.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      subject: subject.trim(),
      message: message.trim()
    });

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

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isContactEmail = emailRegex.test((contact || '').trim());
    const isContactPhone = PHONE_REGEX.test((contact || '').trim());

    const errors = [
      validateName(name, 'Name'),
      validateRequiredText(course, 'Course', 2, 100),
      validateRequiredText(section, 'Section', 2, 50),
      (!isContactEmail && !isContactPhone) ? 'Contact must be a valid email or 10-digit phone number.' : null,
      validateRequiredText(title, 'Idea Title', 5, 200),
      validateRequiredText(description, 'Description', 10, 5000),
      validateRequiredText(outcome, 'Outcome', 10, 2000)
    ].filter(Boolean);

    if (errors.length > 0) {
      return res.status(400).json({ message: errors[0], errors });
    }

    let submitterEmail = (req.body.email || '').trim().toLowerCase();
    if (!submitterEmail && isContactEmail) {
      submitterEmail = contact.trim().toLowerCase();
    }

    if (submitterEmail && !emailRegex.test(submitterEmail)) {
      return res.status(400).json({ message: 'Invalid email address provided.' });
    }

    const ideaData = {
      name: name.trim(),
      course: course.trim(),
      section: section.trim(),
      contact: contact.trim(),
      email: submitterEmail || undefined,
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
      ideaData.pdfMimeType     = req.pdfMimeType || 'application/pdf';
    }

    const idea = await Idea.create(ideaData);

    await Notification.create({
      type: 'IDEA_SUBMISSION',
      title: 'New Idea Submitted',
      message: `A new idea "${idea.title}" has been submitted by ${idea.name}.`,
      entityType: 'Idea',
      entityId: idea._id
    }).catch(err => console.error('Failed to create notification:', err));

    // Send confirmation email asynchronously (only after successful DB save & file storage)
    if (submitterEmail && emailRegex.test(submitterEmail)) {
      sendIdeaConfirmationEmail({
        email: submitterEmail,
        name: idea.name,
        title: idea.title,
        submissionDate: idea.createdAt,
        referenceId: idea._id.toString(),
        hasPdf: !!idea.pdfPublicId,
        pdfName: idea.pdfOriginalName
      }).catch(mailErr => {
        console.error('[submitIdea] Email notification error:', mailErr.message);
      });
    }

    res.status(201).json({ status: 'success', message: 'Idea submitted successfully.', data: { id: idea._id } });
  } catch (error) {
    console.error('[submitIdea error]', error);
    res.status(500).json({ message: 'Error submitting idea. Please try again.' });
  }
};

export const submitFeedback = async (req, res) => {
  try {
    const { eventId, name, rating, comment } = req.body;
    
    if (!eventId || !rating) {
      return res.status(400).json({ message: 'Event ID and rating are required.' });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5.' });
    }
    
    await Feedback.create({
      eventId,
      name: name?.trim() || 'Anonymous',
      rating: Number(rating),
      comment: comment?.trim() || ''
    });
    
    res.status(201).json({ success: true, message: 'Feedback submitted successfully.' });
  } catch (error) {
    console.error('Submit Feedback Error:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

export const submitEventRegistration = async (req, res) => {
  try {
    const { eventId, registrationType, transactionId, paymentScreenshot } = req.body;
    let dataPayload = req.body.data ? JSON.parse(req.body.data) : req.body;
    
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
    if (event.paymentRequired && (!transactionId || !paymentScreenshot)) {
      return res.status(400).json({ success: false, message: 'Payment screenshot and transaction ID are required for this event.' });
    }
    
    if (event.paymentRequired && transactionId) {
      const tErr = validateTransactionId(transactionId);
      if (tErr) return res.status(400).json({ success: false, message: tErr });
    }

    if (registrationType === 'individual' && !event.allowIndividualRegistration) {
      return res.status(400).json({ success: false, message: 'Individual registration is not allowed for this event.' });
    }
    if (registrationType === 'team' && !event.allowTeamRegistration) {
      return res.status(400).json({ success: false, message: 'Team registration is not allowed for this event.' });
    }

    const teamSize = Number(dataPayload.teamSize) || 1;
    if (teamSize < 1) {
      return res.status(400).json({ success: false, message: 'Team size must be at least 1.' });
    }
    if (event.allowTeamRegistration && teamSize > (event.maxTeamSize || 5)) {
      return res.status(400).json({ success: false, message: `Maximum team size is ${event.maxTeamSize || 5} members.` });
    }

    if (event.paymentRequired && event.allowTeamRegistration) {
      // Validate that a payment QR exists for this team size unless there's a fallback legacy QR
      const sizeQrConfig = event.paymentQrCodes?.find(qr => qr.teamSize === teamSize);
      if (!sizeQrConfig && !event.paymentQrImage) {
        return res.status(400).json({ success: false, message: `Payment configuration for ${teamSize}-member registration is currently unavailable. Please choose another registration size or contact the organizer.` });
      }
    }

    const rawLeader = dataPayload.leader || {};
    const leaderErrors = [
      validateName(rawLeader.fullName, 'Leader name'),
      validateRegistrationNumber(rawLeader.registrationNumber),
      validateRequiredText(rawLeader.course, 'Leader course', 2, 100),
      validateRequiredText(rawLeader.section, 'Leader section', 2, 50),
      validateEmail(rawLeader.email),
      validatePhone(rawLeader.phone, 'Leader phone'),
      rawLeader.whatsapp ? validatePhone(rawLeader.whatsapp, 'Leader WhatsApp') : null
    ].filter(Boolean);

    if (leaderErrors.length > 0) {
      return res.status(400).json({ success: false, message: leaderErrors[0], errors: leaderErrors });
    }

    const leader = {
      ...rawLeader,
      fullName: rawLeader.fullName.trim(),
      course: rawLeader.course.trim(),
      section: rawLeader.section.trim(),
      email: rawLeader.email.trim().toLowerCase(),
      phone: rawLeader.phone.trim(),
      whatsapp: rawLeader.whatsapp ? rawLeader.whatsapp.trim() : '',
      registrationNumber: rawLeader.registrationNumber.trim().toUpperCase()
    };
    
    let members = [];
    let trimmedTeamName = '';
    
    // Check team name if event allows teams (applies to both Individual and Team mode)
    if (event.allowTeamRegistration) {
      if (!dataPayload.teamName || dataPayload.teamName.trim() === '') {
        return res.status(400).json({ success: false, message: 'Team name is required for this event.' });
      }
      
      trimmedTeamName = dataPayload.teamName.trim();
      const normalizedTeamName = trimmedTeamName.toLowerCase().replace(/\s+/g, ' ');
      
      // Check if team already exists globally
      const existingTeam = await Team.findOne({ normalizedTeamName });
      if (existingTeam) {
        return res.status(409).json({ success: false, message: 'Team name already exists. Please choose a different name.' });
      }
    }

    if (event.allowTeamRegistration) {
      const expectedMembers = teamSize - 1;
      const totalProvidedMembers = dataPayload.members ? dataPayload.members.length : 0;
      
      if (totalProvidedMembers !== expectedMembers) {
        return res.status(400).json({ success: false, message: `Expected ${expectedMembers} additional members for a team size of ${teamSize}, but got ${totalProvidedMembers}.` });
      }

      if (dataPayload.members) {
        for (let i = 0; i < dataPayload.members.length; i++) {
          const m = dataPayload.members[i];
          const mErrors = [
            validateName(m.fullName, `Member ${i+1} name`),
            validateRegistrationNumber(m.registrationNumber),
            validatePhone(m.phone, `Member ${i+1} phone`)
          ].filter(Boolean);

          if (mErrors.length > 0) {
            return res.status(400).json({ success: false, message: mErrors[0], errors: mErrors });
          }
          
          members.push({
            ...m,
            fullName: m.fullName.trim(),
            phone: m.phone.trim(),
            registrationNumber: m.registrationNumber.trim().toUpperCase()
          });
        }
      }
    }

    // Application level deduplication
    const allRegNumbers = [leader.registrationNumber, ...members.map(m => m.registrationNumber)];
    const uniqueRegNumbers = new Set(allRegNumbers);
    if (uniqueRegNumbers.size !== allRegNumbers.length) {
      return res.status(400).json({ message: 'Duplicate registration numbers found within the team.' });
    }
    
    const existingReg = await EventRegistration.findOne({
      eventId,
      $or: [
        { 'leader.registrationNumber': { $in: allRegNumbers } },
        { 'members.registrationNumber': { $in: allRegNumbers } },
        { registrationNumber: { $in: allRegNumbers } }
      ]
    });
    
    if (existingReg) {
      return res.status(409).json({ message: 'One or more members are already registered for this event.' });
    }

    const qrToken = `BSC-EVT-2026-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;

    const regData = {
      eventId,
      registrationType: registrationType || 'individual',
      teamSize,
      teamName: event.allowTeamRegistration ? trimmedTeamName : undefined,
      leader,
      members,
      transactionId,
      paymentScreenshot,
      paymentStatus: event.paymentRequired ? 'pending' : 'verified',
      qrToken,
      // Map leader to legacy root fields to satisfy old MongoDB unique indexes
      registrationNumber: leader.registrationNumber,
      fullName: leader.fullName,
      email: leader.email,
      phone: leader.phone,
      course: leader.course,
      section: leader.section
    };

    const registration = await EventRegistration.create(regData);

    // Create the team globally if team registration is allowed
    if (event.allowTeamRegistration && trimmedTeamName) {
      const normalizedTeamName = trimmedTeamName.toLowerCase().replace(/\s+/g, ' ');
      // Handle potential race conditions gracefully
      await Team.updateOne(
        { normalizedTeamName },
        { $setOnInsert: { name: trimmedTeamName, normalizedTeamName } },
        { upsert: true }
      );
    }

    await Notification.create({
      type: 'EVENT_REGISTRATION',
      title: 'New Event Registration',
      message: `${registrationType === 'team' ? 'A team' : 'A student'} registered for the event: ${event.title}.`,
      entityType: 'EventRegistration',
      entityId: registration._id
    }).catch(err => console.error('Failed to create notification', err));

    res.status(201).json({ status: 'success', message: 'Successfully registered for event.', data: { registration } });
  } catch (error) {
    console.error('[submitEventRegistration error]', error);
    if (error.code === 11000) return res.status(409).json({ message: 'You are already registered for this event.' });
    res.status(500).json({ message: 'Error registering for event' });
  }
};
