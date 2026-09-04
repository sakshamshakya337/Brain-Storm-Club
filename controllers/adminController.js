import Event from '../models/Event.js';
import Member from '../models/Member.js';
import JoinUs from '../models/JoinUs.js';
import Contact from '../models/Contact.js';
import AdminActivity from '../models/AdminActivity.js';

export const getDashboardStats = async (req, res) => {
  try {
    const [
      totalMembers,
      pendingRequests,
      unreadContactQueries,
      totalEvents,
      upcomingEvents,
      completedEvents,
      recentJoinRequests,
      recentActivity
    ] = await Promise.all([
      // Stats
      Member.countDocuments({ status: 'Approved' }),
      JoinUs.countDocuments({ status: 'New' }),
      Contact.countDocuments({ status: 'Unread' }),
      Event.countDocuments(),
      Event.countDocuments({ status: 'Upcoming' }),
      Event.countDocuments({ status: 'Completed' }),
      
      // Recent lists
      JoinUs.find().sort({ createdAt: -1 }).limit(5).populate('photoId'),
      AdminActivity.find().sort({ createdAt: -1 }).limit(10).populate('adminId', 'email')
    ]);

    // Note: If Member status is actually 'Active' or 'Approved', we should adjust the count query.
    // The prompt says "approved/live members". We will use 'Active' or 'Approved' depending on the model.
    // Let's do a fallback for both common statuses.
    const liveMembersCount = await Member.countDocuments({ status: 'Approved' });

    res.status(200).json({
      success: true,
      data: {
        stats: {
          totalMembers: liveMembersCount,
          pendingRequests,
          contactQueries: unreadContactQueries,
          totalEvents,
          upcomingEvents,
          completedEvents
        },
        recentJoinRequests,
        recentActivity
      }
    });
  } catch (error) {
    console.error('[Dashboard Stats Error]', error);
    res.status(500).json({ success: false, message: 'Error fetching dashboard stats' });
  }
};

export const getJoinRequests = async (req, res) => {
  try {
    const page   = Math.max(1, parseInt(req.query.page,  10) || 1);
    const limit  = Math.min(100, parseInt(req.query.limit, 10) || 50);
    const status = req.query.status;
    const search = req.query.search;

    const query = {};
    if (status && status !== 'All') query.status = status;
    if (search) {
      query.$or = [
        { fullName:           { $regex: search, $options: 'i' } },
        { registrationNumber: { $regex: search, $options: 'i' } },
        { course:             { $regex: search, $options: 'i' } },
        { email:              { $regex: search, $options: 'i' } },
      ];
    }

    const [total, joinRequests] = await Promise.all([
      JoinUs.countDocuments(query),
      JoinUs.find(query)
        .populate('photoId')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
    ]);

    res.status(200).json({
      success: true,
      data: {
        joinRequests,
        pagination: { page, limit, total, pages: Math.ceil(total / limit) },
      },
    });
  } catch (error) {
    console.error('[getJoinRequests error]', error);
    res.status(500).json({ success: false, message: 'Error fetching join requests' });
  }
};

const VALID_JOIN_STATUSES = ['New', 'Pending', 'Contacted', 'Approved', 'Onboarded', 'Rejected'];

export const updateJoinRequestStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, rejectionReason } = req.body;

    if (!VALID_JOIN_STATUSES.includes(status)) {
      return res.status(400).json({ success: false, message: `Invalid status. Must be one of: ${VALID_JOIN_STATUSES.join(', ')}` });
    }

    const request = await JoinUs.findById(id);
    if (!request) return res.status(404).json({ success: false, message: 'Request not found' });

    request.status = status;

    if (status === 'Onboarded' || status === 'Approved') {
      request.approvedBy = req.admin._id;
      request.approvedAt = new Date();
    }
    if (status === 'Rejected' && rejectionReason) {
      request.rejectionReason = rejectionReason.trim();
    }

    await request.save();
    res.status(200).json({ success: true, data: { request } });
  } catch (error) {
    console.error('[updateJoinRequestStatus error]', error);
    res.status(500).json({ success: false, message: 'Error updating join request status' });
  }
};

export const updateJoinRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { fullName, course, section, email, phone, whatsapp, whyJoin } = req.body;

    const request = await JoinUs.findById(id);
    if (!request) return res.status(404).json({ success: false, message: 'Request not found' });

    if (fullName)  request.fullName  = fullName.trim();
    if (course)    request.course    = course.trim();
    if (section)   request.section   = section.trim();
    if (email)     request.email     = email.trim().toLowerCase();
    if (phone)     request.phone     = phone.trim();
    if (whatsapp !== undefined) request.whatsapp = whatsapp.trim();
    if (whyJoin)   request.whyJoin   = whyJoin.trim();

    await request.save();
    res.status(200).json({ success: true, data: { request } });
  } catch (error) {
    console.error('[updateJoinRequest error]', error);
    res.status(500).json({ success: false, message: 'Error updating join request' });
  }
};

export const deleteJoinRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const request = await JoinUs.findByIdAndDelete(id);
    if (!request) return res.status(404).json({ success: false, message: 'Request not found' });
    res.status(200).json({ success: true, message: 'Request deleted successfully' });
  } catch (error) {
    console.error('[deleteJoinRequest error]', error);
    res.status(500).json({ success: false, message: 'Error deleting join request' });
  }
};

export const getContactQueries = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const status = req.query.status;
    const search = req.query.search;
    
    let query = {};
    if (status && status !== 'All') {
      query.status = status;
    }
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { subject: { $regex: search, $options: 'i' } }
      ];
    }

    const total = await Contact.countDocuments(query);
    const queries = await Contact.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.status(200).json({ 
      success: true, 
      data: { 
        queries,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      } 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching contact queries' });
  }
};

export const updateContactQueryStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const query = await Contact.findById(id);
    if (!query) return res.status(404).json({ success: false, message: 'Query not found' });
    
    query.status = status;
    await query.save();
    
    res.status(200).json({ success: true, data: { query } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating contact query' });
  }
};

// ─── Ideas ────────────────────────────────────────────────────────────────────
import Idea from '../models/Idea.js';
import { generateSignedPdfUrl } from '../services/cloudinaryService.js';

export const getIdeas = async (req, res) => {
  try {
    const page   = Math.max(1, parseInt(req.query.page,  10) || 1);
    const limit  = Math.min(50, parseInt(req.query.limit, 10) || 20);
    const status = req.query.status;
    const search = req.query.search;

    const query = {};
    if (status && status !== 'All') query.status = status;
    if (search) {
      query.$or = [
        { title:       { $regex: search, $options: 'i' } },
        { name:        { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { course:      { $regex: search, $options: 'i' } },
      ];
    }

    const [total, ideas, statusCountsAgg] = await Promise.all([
      Idea.countDocuments(query),
      Idea.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Idea.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ])
    ]);

    const statusCounts = {
      New: 0,
      Reviewed: 0,
      Shortlisted: 0,
      Implemented: 0,
      Rejected: 0
    };
    if (Array.isArray(statusCountsAgg)) {
      statusCountsAgg.forEach(item => {
        if (item._id && statusCounts[item._id] !== undefined) {
          statusCounts[item._id] = item.count;
        }
      });
    }

    // Ensure all ideas have .pdf extension on pdfOriginalName for display
    ideas.forEach(idea => {
      if (idea.pdfOriginalName && !/\.pdf$/i.test(idea.pdfOriginalName)) {
        idea.pdfOriginalName = `${idea.pdfOriginalName}.pdf`;
      }
    });

    res.status(200).json({
      success: true,
      data: {
        ideas,
        pagination: { page, limit, total, pages: Math.ceil(total / limit) },
        statusCounts
      },
    });
  } catch (error) {
    console.error('[getIdeas error]', error);
    res.status(500).json({ success: false, message: 'Error fetching ideas' });
  }
};

export const getIdeaById = async (req, res) => {
  try {
    const idea = await Idea.findById(req.params.id).lean();
    if (!idea) return res.status(404).json({ success: false, message: 'Idea not found' });

    // Ensure pdfOriginalName strictly has .pdf extension
    if (idea.pdfOriginalName && !/\.pdf$/i.test(idea.pdfOriginalName)) {
      idea.pdfOriginalName = `${idea.pdfOriginalName}.pdf`;
    }

    // Attach authenticated proxy PDF URL so browser renders inline and downloads with .pdf
    if (idea.pdfPublicId) {
      idea.pdfSignedUrl = `/api/admin/ideas/${idea._id}/pdf`;
    }

    res.status(200).json({ success: true, data: { idea } });
  } catch (error) {
    console.error('[getIdeaById error]', error);
    res.status(500).json({ success: false, message: 'Error fetching idea' });
  }
};

export const getIdeaPdf = async (req, res) => {
  try {
    const idea = await Idea.findById(req.params.id).lean();
    if (!idea || !idea.pdfPublicId) {
      return res.status(404).json({ success: false, message: 'PDF not found' });
    }
    const signedUrl = generateSignedPdfUrl(idea.pdfPublicId);
    if (!signedUrl) {
      return res.status(500).json({ success: false, message: 'Could not generate signed PDF URL' });
    }

    const cloudRes = await fetch(signedUrl);
    if (!cloudRes.ok) {
      return res.status(502).json({ success: false, message: 'Failed to fetch PDF from storage' });
    }

    let fileName = idea.pdfOriginalName || 'document.pdf';
    if (!/\.pdf$/i.test(fileName)) {
      fileName = `${fileName}.pdf`;
    }

    const disposition = req.query.download === '1' ? 'attachment' : 'inline';

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `${disposition}; filename="${fileName.replace(/"/g, '')}"; filename*="UTF-8''${encodeURIComponent(fileName)}"`
    );
    res.setHeader('Cache-Control', 'private, max-age=3600');

    const arrayBuffer = await cloudRes.arrayBuffer();
    return res.status(200).send(Buffer.from(arrayBuffer));
  } catch (error) {
    console.error('[getIdeaPdf error]', error);
    res.status(500).json({ success: false, message: 'Error retrieving PDF' });
  }
};

export const updateIdeaStatus = async (req, res) => {
  try {
    const { status, adminNotes } = req.body;
    const allowed = ['New', 'Reviewed', 'Shortlisted', 'Implemented', 'Rejected'];
    if (!allowed.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status value' });
    }

    const idea = await Idea.findByIdAndUpdate(
      req.params.id,
      { status, ...(adminNotes !== undefined && { adminNotes }) },
      { new: true, runValidators: true }
    );
    if (!idea) return res.status(404).json({ success: false, message: 'Idea not found' });

    res.status(200).json({ success: true, data: { idea } });
  } catch (error) {
    console.error('[updateIdeaStatus error]', error);
    res.status(500).json({ success: false, message: 'Error updating idea status' });
  }
};
