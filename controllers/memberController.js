import Member from '../models/Member.js';

// Get all members (Admin view - includes Pending/Rejected)
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
