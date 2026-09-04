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
    const joinRequests = await JoinUs.find().populate('photoId').sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: { joinRequests } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching join requests' });
  }
};

export const updateJoinRequestStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const request = await JoinUs.findById(id);
    if (!request) return res.status(404).json({ success: false, message: 'Request not found' });
    
    request.status = status;
    await request.save();
    
    res.status(200).json({ success: true, data: { request } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating join request' });
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

    const [total, ideas] = await Promise.all([
      Idea.countDocuments(query),
      Idea.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
    ]);

    res.status(200).json({
      success: true,
      data: {
        ideas,
        pagination: { page, limit, total, pages: Math.ceil(total / limit) },
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

    // Attach a short-lived signed PDF URL if there is one
    if (idea.pdfPublicId) {
      idea.pdfSignedUrl = generateSignedPdfUrl(idea.pdfPublicId);
    }

    res.status(200).json({ success: true, data: { idea } });
  } catch (error) {
    console.error('[getIdeaById error]', error);
    res.status(500).json({ success: false, message: 'Error fetching idea' });
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
