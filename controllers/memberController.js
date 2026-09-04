import Member from '../models/Member.js';

// ─── Role constants ────────────────────────────────────────────────────────────
// Admin-assignable roles. Public registration is blocked from using ADMIN_ONLY_ROLES.
const ADMIN_ONLY_ROLES = [
  'Faculty Advisor', 'Faculty Coordinator', 'HOS',
  'President', 'Vice President', 'Secretary',
  'Head Coordinator', 'Technical Head', 'Social Media Head',
];
const PUBLIC_STUDENT_ROLES = ['Technical Team', 'Media Team', 'Anchor', 'Coordinator'];
export const ALL_ADMIN_ROLES = [...ADMIN_ONLY_ROLES, ...PUBLIC_STUDENT_ROLES];

// Create a member manually (admin only)
export const createMember = async (req, res) => {
  try {
    const {
      memberType = 'student',
      fullName, email, phone, whatsapp, domain,
      // student
      registrationNumber, course, section,
      // faculty
      employeeId, department, designation,
      // shared
      role, status = 'Approved',
      protectedImageId,
    } = req.body;

    const trimmedName = fullName?.trim();
    if (!trimmedName) return res.status(400).json({ message: 'Full name is required.' });

    const trimmedRole = role?.trim();
    if (!trimmedRole) return res.status(400).json({ message: 'Role is required.' });

    const validTypes = ['student', 'faculty'];
    if (!validTypes.includes(memberType)) {
      return res.status(400).json({ message: 'memberType must be "student" or "faculty".' });
    }

    const trimmedEmail = email?.trim() ? email.trim().toLowerCase() : '';
    // Email required for students; optional for faculty
    if (memberType === 'student' && !trimmedEmail) {
      return res.status(400).json({ message: 'Email is required for student members.' });
    }

    const trimmedReg = (memberType === 'student' && registrationNumber?.trim())
      ? registrationNumber.trim().toUpperCase()
      : null;

    if (memberType === 'student' && !trimmedReg) {
      return res.status(400).json({ message: 'Registration number is required for students.' });
    }

    const trimmedEmpId = (memberType === 'faculty' && employeeId?.trim())
      ? employeeId.trim()
      : null;

    // Duplicate checks
    if (memberType === 'student' && trimmedReg) {
      const existingReg = await Member.findOne({ registrationNumber: trimmedReg });
      if (existingReg) {
        return res.status(409).json({ message: `Registration number ${trimmedReg} already exists.` });
      }
    }
    if (memberType === 'faculty' && trimmedEmpId) {
      const existingEmp = await Member.findOne({ employeeId: trimmedEmpId });
      if (existingEmp) {
        return res.status(409).json({ message: `Employee ID ${trimmedEmpId} already exists.` });
      }
    }
    if (trimmedEmail) {
      const existingEmail = await Member.findOne({ email: trimmedEmail });
      if (existingEmail) {
        return res.status(409).json({ message: `Email ${trimmedEmail} is already registered.` });
      }
    }

    const memberData = {
      memberType,
      fullName: trimmedName,
      email: trimmedEmail,
      phone: phone?.trim() || '',
      whatsapp: whatsapp?.trim() || '',
      domain: domain?.trim() || (memberType === 'faculty' ? 'Faculty' : ''),
      role: trimmedRole,
      status: memberType === 'faculty' ? 'Approved' : (status || 'Approved'),
      approvedBy: (memberType === 'faculty' || status === 'Approved') ? req.admin._id : undefined,
      approvedAt: (memberType === 'faculty' || status === 'Approved') ? new Date() : undefined,
      photoId: protectedImageId || null,
      // Student fields
      ...(memberType === 'student' && {
        registrationNumber: trimmedReg,
        course: course?.trim() || '',
        section: section?.trim() || '',
      }),
      // Faculty fields
      ...(memberType === 'faculty' && {
        ...(trimmedEmpId ? { employeeId: trimmedEmpId } : {}),
        department: department?.trim() || '',
        designation: designation?.trim() || '',
      }),
    };

    const member = await Member.create(memberData);
    await member.populate('photoId');

    return res.status(201).json({ status: 'success', message: 'Member created successfully.', data: { member } });
  } catch (error) {
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern || {})[0] || 'field';
      return res.status(409).json({ message: `Duplicate value for ${field}. This record already exists.` });
    }
    console.error('[createMember error]', error);
    return res.status(500).json({ message: 'Error creating member.' });
  }
};

export const getAllMembersAdmin = async (req, res) => {
  try {
    const { status, role } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (role) filter.role = role;

    const members = await Member.find(filter)
      .populate('photoId')
      .sort({ createdAt: -1 });
    res.status(200).json({ status: 'success', results: members.length, data: { members } });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching members' });
  }
};

// Approve a pending member
export const approveMember = async (req, res) => {
  try {
    const { id } = req.params;
    const member = await Member.findById(id);

    if (!member) return res.status(404).json({ message: 'Member not found' });
    if (member.status === 'Approved') return res.status(400).json({ message: 'Member is already approved' });

    member.status = 'Approved';
    member.approvedBy = req.admin._id;
    member.approvedAt = Date.now();
    await member.save();

    res.status(200).json({ status: 'success', message: 'Member approved successfully', data: { member } });
  } catch (error) {
    res.status(500).json({ message: 'Error approving member' });
  }
};

// Reject a pending member
export const rejectMember = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    
    const member = await Member.findById(id);

    if (!member) return res.status(404).json({ message: 'Member not found' });

    member.status = 'Rejected';
    member.rejectionReason = reason || 'Not specified';
    await member.save();

    res.status(200).json({ status: 'success', message: 'Member rejected', data: { member } });
  } catch (error) {
    res.status(500).json({ message: 'Error rejecting member' });
  }
};

// Update member details
export const updateMember = async (req, res) => {
  try {
    const { id } = req.params;
    // Prevent updating sensitive fields like registrationNumber via this general route if needed
    const updatedMember = await Member.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
    
    if (!updatedMember) return res.status(404).json({ message: 'Member not found' });
    
    res.status(200).json({ status: 'success', data: { member: updatedMember } });
  } catch (error) {
    res.status(500).json({ message: 'Error updating member' });
  }
};

// Delete member
export const deleteMember = async (req, res) => {
  try {
    const { id } = req.params;
    const member = await Member.findById(id);
    
    if (!member) return res.status(404).json({ message: 'Member not found' });
    
    if (member.photoId) {
      const Image = (await import('../models/Image.js')).default;
      const { deleteImageFromCloudinary } = await import('../services/cloudinaryService.js');
      const image = await Image.findById(member.photoId);
      if (image && image.publicId) {
        await deleteImageFromCloudinary(image.publicId);
        await Image.findByIdAndDelete(member.photoId);
      }
    }

    await Member.findByIdAndDelete(id);
    
    res.status(204).json({ status: 'success', data: null });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting member' });
  }
};
