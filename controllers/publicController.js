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
      .select('title slug date venue category status registrationOpen posterId')
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
    const event = await Event.findOne({ slug }).populate('posterId', 'imageId');
    
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
      .select('fullName course section role photoId')
      .sort({ createdAt: 1 }); // Sort logic could be enhanced for hierarchy
      
    res.status(200).json({ status: 'success', results: members.length, data: { members } });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching members' });
  }
};
