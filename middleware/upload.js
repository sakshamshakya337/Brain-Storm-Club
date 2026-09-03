import multer from 'multer';
import sharp from 'sharp';
import crypto from 'crypto';
import Image from '../models/Image.js';
import { uploadImageToCloudinary } from '../services/cloudinaryService.js';

// Use memory storage to process image BEFORE saving it
const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  // Broadly accept images, we will validate with sharp later
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only images are allowed.'), false);
  }
};

export const uploadImage = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB raw limit
  }
});

// Middleware to resize and sanitize the image using Sharp
export const processAndProtectImage = (visibility = 'protected') => async (req, res, next) => {
  if (!req.file) return next();

  // Guard: prevent sending a response more than once if multiple error paths fire
  let responded = false;
  const sendError = (status, message, err) => {
    if (responded) return;
    responded = true;
    console.error(`[processAndProtectImage] ${message}`, err?.message || err || '');
    res.status(status).json({ message });
  };

  try {
    // 1. Resize to max 1200×1200, convert to WebP at 80% quality
    let processedBuffer;
    try {
      processedBuffer = await sharp(req.file.buffer)
        .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
        .toFormat('webp')
        .webp({ quality: 80 })
        .toBuffer();
    } catch (sharpErr) {
      return sendError(500, 'Image processing failed. Please try a different image.', sharpErr);
    }

    // 2. Enforce < 2MB post-compression
    if (processedBuffer.length > 2097152) {
      return sendError(400, 'Image size exceeds 2MB limit after compression. Please upload a smaller image.', null);
    }

    // 3. Upload to Cloudinary
    const folder = req.baseUrl.includes('members') || req.path.includes('join-us')
      ? 'brainstorm/members'
      : 'brainstorm/events';

    let cloudinaryResult;
    try {
      cloudinaryResult = await uploadImageToCloudinary(processedBuffer, folder);
    } catch (cloudErr) {
      return sendError(502, 'Image upload failed. Please try again.', cloudErr);
    }

    // 4. Save image record to DB
    const imageId = crypto.randomUUID();

    let ownerType = 'admin';
    if (req.path.includes('join-us')) ownerType = 'joinUs';
    else if (req.baseUrl.includes('events')) ownerType = 'event';
    else if (req.baseUrl.includes('members')) ownerType = 'member';

    let imageDoc;
    try {
      imageDoc = await Image.create({
        originalFilename: req.file.originalname,
        imageId,
        publicId: cloudinaryResult.public_id,
        assetId: cloudinaryResult.asset_id,
        format: cloudinaryResult.format,
        width: cloudinaryResult.width,
        height: cloudinaryResult.height,
        bytes: cloudinaryResult.bytes,
        mimeType: 'image/webp',
        size: processedBuffer.length,
        visibility,
        deliveryType: 'authenticated',
        resourceType: 'image',
        status: 'approved',
        ownerType,
        uploadedByOld: req.admin ? req.admin._id : null
      });
    } catch (dbErr) {
      return sendError(500, 'Failed to save image record. Please try again.', dbErr);
    }

    // 5. Attach image ID for the next controller and continue
    req.body.protectedImageId = imageDoc._id;
    next();

  } catch (error) {
    // Catch-all for any unexpected error not caught above
    sendError(500, 'Unexpected error processing image. Please try again.', error);
  }
};
