import Event from '../models/Event.js';

export const isValidImageUrl = (url) => {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim();
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== 'https:' && (process.env.NODE_ENV === 'production' || parsed.protocol !== 'http:')) {
      return false;
    }
    if (process.env.NODE_ENV === 'production') {
      if (parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1' || parsed.hostname.endsWith('.local')) {
        return false;
      }
    }
    return true;
  } catch {
    return false;
  }
};

const processEventPayload = (body) => {
  const payload = { ...body };
  
  if (Array.isArray(payload.images)) {
    payload.images = payload.images.map((img, idx) => {
      if (typeof img === 'string') {
        return {
          url: img.trim(),
          source: 'external',
          order: idx,
          isCover: idx === 0,
        };
      }
      const rawImageId = img.imageId?._id || img.imageId;
      return {
        url: (img.url || '').trim(),
        source: img.source === 'external' ? 'external' : 'cloudinary',
        publicId: img.publicId || '',
        imageId: rawImageId || null,
        alt: img.alt || '',
        order: typeof img.order === 'number' ? img.order : idx,
        isCover: !!img.isCover,
      };
    });

    // Validate external URLs
    for (const img of payload.images) {
      if (img.source === 'external' && img.url) {
        if (!isValidImageUrl(img.url)) {
          throw new Error(`Invalid image URL format: "${img.url}". Only secure HTTPS image URLs are supported.`);
        }
      }
    }

    // Sync cover image
    const coverItem = payload.images.find(img => img.isCover) || payload.images[0];
    if (coverItem) {
      coverItem.isCover = true;
      const rawCoverImgId = coverItem.imageId?._id || coverItem.imageId;
      payload.coverImage = {
        url: coverItem.url,
        source: coverItem.source,
        publicId: coverItem.publicId,
        imageId: rawCoverImgId || null,
        alt: coverItem.alt,
      };
      if (rawCoverImgId) {
        payload.posterId = rawCoverImgId;
      }
    }
  }

  if (payload.posterId?._id) {
    payload.posterId = payload.posterId._id;
  }

  if (payload.coverImage && payload.coverImage.source === 'external' && payload.coverImage.url) {
    if (!isValidImageUrl(payload.coverImage.url)) {
      throw new Error(`Invalid cover image URL: "${payload.coverImage.url}"`);
    }
  }

  return payload;
};

export const getAllEventsAdmin = async (req, res) => {
  try {
    const events = await Event.find()
      .populate('posterId')
      .populate('coverImage.imageId')
      .populate('images.imageId')
      .sort({ date: -1 });
    res.status(200).json({ status: 'success', data: { events } });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching events' });
  }
};

export const createEvent = async (req, res) => {
  try {
    const payload = processEventPayload(req.body);
    const event = await Event.create(payload);
    res.status(201).json({ status: 'success', data: { event } });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Event with this slug already exists' });
    }
    res.status(400).json({ message: error.message || 'Error creating event' });
  }
};

export const updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const payload = processEventPayload(req.body);
    const event = await Event.findByIdAndUpdate(id, payload, { new: true, runValidators: true })
      .populate('posterId')
      .populate('coverImage.imageId')
      .populate('images.imageId');
    
    if (!event) return res.status(404).json({ message: 'Event not found' });
    
    res.status(200).json({ status: 'success', data: { event } });
  } catch (error) {
    res.status(400).json({ message: error.message || 'Error updating event' });
  }
};

export const deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const event = await Event.findById(id);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    
    // Delete owned Cloudinary assets if exist
    const Image = (await import('../models/Image.js')).default;
    const { deleteImageFromCloudinary } = await import('../services/cloudinaryService.js');

    const publicIdsToDelete = new Set();
    const imageDocIdsToDelete = new Set();

    if (event.posterId) {
      imageDocIdsToDelete.add(event.posterId.toString());
      const posterImg = await Image.findById(event.posterId);
      if (posterImg?.publicId) publicIdsToDelete.add(posterImg.publicId);
    }

    if (Array.isArray(event.images)) {
      for (const img of event.images) {
        if (img.source === 'cloudinary') {
          if (img.publicId) publicIdsToDelete.add(img.publicId);
          if (img.imageId) imageDocIdsToDelete.add(img.imageId.toString());
        }
      }
    }

    for (const pubId of publicIdsToDelete) {
      await deleteImageFromCloudinary(pubId).catch(console.error);
    }
    for (const docId of imageDocIdsToDelete) {
      await Image.findByIdAndDelete(docId).catch(console.error);
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

    const Image = (await import('../models/Image.js')).default;
    const newImageDoc = await Image.findById(req.body.protectedImageId);

    const coverObj = {
      source: 'cloudinary',
      imageId: req.body.protectedImageId,
      publicId: newImageDoc?.publicId || '',
      isCover: true,
      order: 0,
      alt: oldEvent.title
    };

    let updatedImages = (oldEvent.images || []).map(img => ({
      ...(img.toObject ? img.toObject() : img),
      isCover: false
    }));

    const existingIdx = updatedImages.findIndex(img => 
      (img.imageId?._id?.toString() || img.imageId?.toString()) === req.body.protectedImageId.toString()
    );

    if (existingIdx >= 0) {
      updatedImages[existingIdx] = { ...updatedImages[existingIdx], isCover: true, publicId: newImageDoc?.publicId || updatedImages[existingIdx].publicId };
    } else {
      updatedImages.unshift(coverObj);
    }

    const event = await Event.findByIdAndUpdate(
      id, 
      { 
        posterId: req.body.protectedImageId,
        coverImage: coverObj,
        images: updatedImages
      }, 
      { new: true }
    ).populate('posterId').populate('coverImage.imageId').populate('images.imageId');

    if (!event) return res.status(404).json({ message: 'Event not found' });

    res.status(200).json({ status: 'success', data: { event } });
  } catch (error) {
    console.error('Error uploading poster:', error);
    res.status(500).json({ message: 'Error uploading poster' });
  }
};

export const uploadEventGalleryImage = async (req, res) => {
  try {
    const { id } = req.params;
    if (!req.body.protectedImageId) {
      return res.status(400).json({ message: 'No image file provided' });
    }

    const event = await Event.findById(id);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    const Image = (await import('../models/Image.js')).default;
    const imageDoc = await Image.findById(req.body.protectedImageId);
    if (!imageDoc) return res.status(404).json({ message: 'Image record not found' });

    const isFirst = !event.images || event.images.length === 0;
    const isCover = req.body.isCover === 'true' || req.body.isCover === true || isFirst;

    if (isCover) {
      if (event.images) {
        event.images.forEach(img => { img.isCover = false; });
      }
      event.posterId = imageDoc._id;
      event.coverImage = {
        source: 'cloudinary',
        imageId: imageDoc._id,
        publicId: imageDoc.publicId,
        isCover: true,
        order: event.images?.length || 0,
        alt: req.body.alt || event.title
      };
    }

    const newImageItem = {
      source: 'cloudinary',
      imageId: imageDoc._id,
      publicId: imageDoc.publicId,
      isCover,
      order: event.images?.length || 0,
      alt: req.body.alt || event.title
    };

    if (!event.images) event.images = [];
    event.images.push(newImageItem);

    await event.save();

    const populated = await Event.findById(id)
      .populate('posterId')
      .populate('coverImage.imageId')
      .populate('images.imageId');

    res.status(200).json({
      status: 'success',
      data: {
        event: populated,
        uploadedImage: {
          ...newImageItem,
          imageId: {
            _id: imageDoc._id,
            imageId: imageDoc.imageId
          }
        }
      }
    });
  } catch (error) {
    console.error('Error uploading gallery image:', error);
    res.status(500).json({ message: error.message || 'Error uploading gallery image' });
  }
};

export const uploadEventImageStandalone = async (req, res) => {
  try {
    if (!req.body.protectedImageId) {
      return res.status(400).json({ message: 'No image file provided' });
    }

    const Image = (await import('../models/Image.js')).default;
    const imageDoc = await Image.findById(req.body.protectedImageId);
    if (!imageDoc) return res.status(404).json({ message: 'Image record not found' });

    res.status(200).json({
      status: 'success',
      data: {
        _id: imageDoc._id,
        imageId: imageDoc.imageId,
        publicId: imageDoc.publicId,
        source: 'cloudinary'
      }
    });
  } catch (error) {
    console.error('Error in standalone image upload:', error);
    res.status(500).json({ message: error.message || 'Error processing uploaded image' });
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

export const getEventEntriesAdmin = async (req, res) => {
  try {
    const { id: eventId } = req.params;
    const event = await Event.findById(eventId).populate('posterId');
    if (!event) return res.status(404).json({ message: 'Event not found' });
    
    const { search, status, page = 1, limit = 20 } = req.query;
    const query = { eventId };
    
    if (status && status !== 'All') query.status = status;
    
    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { registrationNumber: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const EventRegistration = (await import('../models/EventRegistration.js')).default;
    
    const total = await EventRegistration.countDocuments(query);
    const entries = await EventRegistration.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Stats
    const statsQuery = { eventId };
    const allEntries = await EventRegistration.find(statsQuery).select('status');
    const stats = {
      total: allEntries.length,
      confirmed: allEntries.filter(e => e.status === 'Registered' || e.status === 'Participated' || e.status === 'Completed').length,
      pending: 0, // No pending in enum by default, just keeping stat structure
      cancelled: allEntries.filter(e => e.status === 'No-show').length
    };

    res.status(200).json({
      status: 'success',
      data: {
        event,
        registrations: entries,
        stats,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching registrations' });
  }
};

export const deleteEventEntryAdmin = async (req, res) => {
  try {
    const { id: eventId, registrationId } = req.params;
    const EventRegistration = (await import('../models/EventRegistration.js')).default;
    
    const entry = await EventRegistration.findOneAndDelete({ _id: registrationId, eventId });
    if (!entry) return res.status(404).json({ message: 'Registration not found' });
    
    res.status(204).json({ status: 'success', data: null });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting registration' });
  }
};

export const updateEventEntryStatusAdmin = async (req, res) => {
  try {
    const { id: eventId, registrationId } = req.params;
    const { status } = req.body;
    
    const EventRegistration = (await import('../models/EventRegistration.js')).default;
    
    const entry = await EventRegistration.findOneAndUpdate(
      { _id: registrationId, eventId },
      { status },
      { new: true, runValidators: true }
    );
    
    if (!entry) return res.status(404).json({ message: 'Registration not found' });
    
    res.status(200).json({ status: 'success', data: { entry } });
  } catch (error) {
    res.status(500).json({ message: 'Error updating registration' });
  }
};
