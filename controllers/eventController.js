import Event from '../models/Event.js';

export const getAllEventsAdmin = async (req, res) => {
  try {
    const events = await Event.find()
      .populate('posterId')
      .sort({ date: -1 });
    res.status(200).json({ status: 'success', data: { events } });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching events' });
  }
};

export const createEvent = async (req, res) => {
  try {
    const event = await Event.create(req.body);
    res.status(201).json({ status: 'success', data: { event } });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Event with this slug already exists' });
    }
    res.status(500).json({ message: 'Error creating event' });
  }
};

export const updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const event = await Event.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
    
    if (!event) return res.status(404).json({ message: 'Event not found' });
    
    res.status(200).json({ status: 'success', data: { event } });
  } catch (error) {
    res.status(500).json({ message: 'Error updating event' });
  }
};

export const deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const event = await Event.findById(id);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    
    // Delete Cloudinary asset if exists
    if (event.posterId) {
      const Image = (await import('../models/Image.js')).default;
      const { deleteImageFromCloudinary } = await import('../services/cloudinaryService.js');
      const image = await Image.findById(event.posterId);
      if (image && image.publicId) {
        await deleteImageFromCloudinary(image.publicId);
        await Image.findByIdAndDelete(event.posterId);
      }
    }
    
    await Event.findByIdAndDelete(id);
    
    res.status(204).json({ status: 'success', data: null });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting event' });
  }
};

export const uploadEventPoster = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!req.body.protectedImageId) {
      return res.status(400).json({ message: 'No image file provided' });
    }

    const oldEvent = await Event.findById(id);
    if (!oldEvent) return res.status(404).json({ message: 'Event not found' });

    // Cleanup old image if exists
    if (oldEvent.posterId && oldEvent.posterId.toString() !== req.body.protectedImageId) {
      const Image = (await import('../models/Image.js')).default;
      const { deleteImageFromCloudinary } = await import('../services/cloudinaryService.js');
      const oldImage = await Image.findById(oldEvent.posterId);
      if (oldImage && oldImage.publicId) {
        await deleteImageFromCloudinary(oldImage.publicId);
        await Image.findByIdAndDelete(oldEvent.posterId);
      }
    }

    const event = await Event.findByIdAndUpdate(
      id, 
      { posterId: req.body.protectedImageId }, 
      { new: true }
    ).populate('posterId');

    if (!event) return res.status(404).json({ message: 'Event not found' });

    res.status(200).json({ status: 'success', data: { event } });
  } catch (error) {
    res.status(500).json({ message: 'Error uploading poster' });
  }
};

export const toggleEventRegistration = async (req, res) => {
  try {
    const { id } = req.params;
    const { registrationOpen } = req.body;

    if (typeof registrationOpen !== 'boolean') {
      return res.status(400).json({ success: false, message: 'Invalid registrationOpen value. Must be boolean.' });
    }

    const event = await Event.findByIdAndUpdate(
      id,
      { registrationOpen },
      { new: true, runValidators: true }
    );

    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });

    // Try creating an AdminActivity (optional auditing based on prompt)
    const action = registrationOpen ? 'Enabled' : 'Disabled';
    const AdminActivity = (await import('../models/AdminActivity.js')).default;
    await AdminActivity.create({
      adminId: req.user._id,
      action: `${action} registration for event: ${event.title}`,
    }).catch(err => console.error('Failed to log admin activity', err));

    res.status(200).json({
      success: true,
      registrationOpen: event.registrationOpen,
      message: `Event registration ${registrationOpen ? 'enabled' : 'disabled'}.`
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error toggling event registration' });
  }
};
