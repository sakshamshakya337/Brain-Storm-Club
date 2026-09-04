import Event from '../models/Event.js';
import Member from '../models/Member.js';

// Get all events for the public page
export const getPublicEvents = async (req, res) => {
  try {
    const { status, category } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (category) filter.category = category;

    // Only fetch necessary fields for the public list
    const events = await Event.find(filter)
      .populate('posterId', 'imageId')
      .populate('coverImage.imageId', 'imageId')
      .populate('images.imageId', 'imageId')
      .select('title slug date venue category status registrationOpen posterId coverImage images')
      .sort({ date: 1 });
      
    res.status(200).json({ status: 'success', results: events.length, data: { events } });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching events' });
  }
};

// Get single event by slug
export const getPublicEventDetails = async (req, res) => {
  try {
    const { slug } = req.params;
    const event = await Event.findOne({ slug })
      .populate('posterId', 'imageId')
      .populate('coverImage.imageId', 'imageId')
      .populate('images.imageId', 'imageId');
    
    if (!event) return res.status(404).json({ message: 'Event not found' });
    
    res.status(200).json({ status: 'success', data: { event } });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching event details' });
  }
};

// Get all approved members for the public directory
export const getPublicMembers = async (req, res) => {
  try {
    const { role } = req.query;
    
    // ONLY fetch Approved members for public viewing
    const filter = { status: 'Approved' };
    if (role) filter.role = role;

    // Project ONLY public safe fields (EXCLUDE phone, whatsapp, email)
    const members = await Member.find(filter)
      .populate('photoId', 'imageId')
      .select('fullName course section role photoId memberType designation department domain');

    // Hierarchy sort: Faculty -> President -> Vice President -> Secretary -> Core Heads -> Coordinators -> Team members
    const ROLE_RANK = [
      'president',
      'vice president',
      'vice-president',
      'secretary',
      'head coordinator',
      'technical head',
      'social media head',
      'coordinator',
      'technical team',
      'media team',
      'anchor'
    ];

    const getMemberRank = (m) => {
      if (m.memberType === 'faculty' || ['hos', 'faculty advisor', 'faculty coordinator', 'faculty'].includes((m.role || '').toLowerCase())) {
        return -1; // Top priority: Faculty
      }
      const roleStr = (m.role || '').trim().toLowerCase();
      const idx = ROLE_RANK.indexOf(roleStr);
      return idx === -1 ? 999 : idx;
    };

    members.sort((a, b) => {
      const rA = getMemberRank(a);
      const rB = getMemberRank(b);
      if (rA !== rB) return rA - rB;
      return (a.fullName || '').localeCompare(b.fullName || '');
    });
      
    res.status(200).json({ status: 'success', results: members.length, data: { members } });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching members' });
  }
};
