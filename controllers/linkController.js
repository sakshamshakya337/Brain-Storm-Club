import LinkItem from '../models/LinkItem.js';

// --- Public Controllers ---

// Get active links for public page
export const getPublicLinks = async (req, res) => {
  try {
    const links = await LinkItem.find({ isActive: true })
      .sort({ order: 1 })
      .populate('customImageId', 'imageId visibility status')
      .select('title url iconType presetIcon customImageId order');

    res.status(200).json({ status: 'success', data: { links } });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching links' });
  }
};

// Track link click and redirect
export const trackLinkVisit = async (req, res) => {
  try {
    const { id } = req.params;
    const link = await LinkItem.findByIdAndUpdate(
      id,
      { $inc: { clickCount: 1 } },
      { new: true }
    );
    
    if (!link) {
      return res.status(404).json({ message: 'Link not found' });
    }

    res.redirect(link.url);
  } catch (error) {
    res.status(500).json({ message: 'Error tracking link visit' });
  }
};

// --- Admin Controllers ---

// Get all links for admin
export const getAdminLinks = async (req, res) => {
  try {
    const links = await LinkItem.find()
      .sort({ order: 1 })
      .populate('customImageId', 'imageId')
      .populate('createdBy', 'email')
      .populate('updatedBy', 'email');

    res.status(200).json({ status: 'success', data: { links } });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching links' });
  }
};

// Create a new link
export const createLink = async (req, res) => {
  try {
    const { title, url, iconType, presetIcon, isActive } = req.body;
    
    // Server-side URL validation
    const urlPattern = /^(https?:\/\/)/;
    if (!urlPattern.test(url)) {
      return res.status(400).json({ message: 'URL must start with http:// or https://' });
    }

    // Determine the next order value
    const lastLink = await LinkItem.findOne().sort({ order: -1 });
    const order = lastLink ? lastLink.order + 1 : 0;

    const linkData = {
      title,
      url,
      iconType: iconType || 'preset',
      presetIcon,
      isActive: isActive === undefined ? true : isActive,
      order,
      createdBy: req.admin._id
    };

    // If a custom image was uploaded, processAndProtectImage sets protectedImageId
    if (req.body.protectedImageId) {
      linkData.customImageId = req.body.protectedImageId;
    }

    const link = await LinkItem.create(linkData);
    await link.populate('customImageId', 'imageId');

    res.status(201).json({ status: 'success', message: 'Link created successfully', data: { link } });
  } catch (error) {
    res.status(500).json({ message: 'Error creating link' });
  }
};

// Update a link
export const updateLink = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, url, iconType, presetIcon, isActive } = req.body;

    // Server-side URL validation
    if (url) {
      const urlPattern = /^(https?:\/\/)/;
      if (!urlPattern.test(url)) {
        return res.status(400).json({ message: 'URL must start with http:// or https://' });
      }
    }

    const updateData = {
      title,
      url,
      iconType,
      presetIcon,
      isActive,
      updatedBy: req.admin._id
    };

    // Remove undefined values
    Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);

    if (req.body.protectedImageId) {
      updateData.customImageId = req.body.protectedImageId;
    }

    const link = await LinkItem.findByIdAndUpdate(id, updateData, { new: true, runValidators: true })
      .populate('customImageId', 'imageId');

    if (!link) {
      return res.status(404).json({ message: 'Link not found' });
    }

    res.status(200).json({ status: 'success', message: 'Link updated successfully', data: { link } });
  } catch (error) {
    res.status(500).json({ message: 'Error updating link' });
  }
};

// Delete a link
export const deleteLink = async (req, res) => {
  try {
    const { id } = req.params;
    const link = await LinkItem.findByIdAndDelete(id);
    
    if (!link) {
      return res.status(404).json({ message: 'Link not found' });
    }
    
    res.status(200).json({ status: 'success', message: 'Link deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting link' });
  }
};

// Reorder links
export const reorderLinks = async (req, res) => {
  try {
    const { linkIds } = req.body; // Array of link IDs in the new order

    if (!Array.isArray(linkIds)) {
      return res.status(400).json({ message: 'Invalid data format. Expected array of IDs.' });
    }

    // Perform bulk write to update the order of all provided links
    const bulkOps = linkIds.map((id, index) => ({
      updateOne: {
        filter: { _id: id },
        update: { order: index, updatedBy: req.admin._id }
      }
    }));

    if (bulkOps.length > 0) {
      await LinkItem.bulkWrite(bulkOps);
    }

    res.status(200).json({ status: 'success', message: 'Links reordered successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error reordering links' });
  }
};
