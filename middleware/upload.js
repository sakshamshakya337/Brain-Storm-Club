import multer from 'multer';
import sharp from 'sharp';
import path from 'path';
import crypto from 'crypto';
import fs from 'fs/promises';
import { existsSync } from 'fs';
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

  try {
    // Process image with Sharp
    // 1. Resize to max 1200px width/height while maintaining aspect ratio
    // 2. Convert to WebP for modern web delivery (Cloudinary will auto-format anyway, but good for base)
    // 3. Compress to 80% quality
    const processedBuffer = await sharp(req.file.buffer)
      .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
      .toFormat('webp')
      .webp({ quality: 80 })
      .toBuffer(); 
      
    // Enforce < 2MB limit (2 * 1024 * 1024 bytes)
    if (processedBuffer.length > 2097152) {
      return res.status(400).json({ message: 'Image size exceeds 2MB limit after compression. Please upload a smaller image.' });
    }

    // Upload to Cloudinary
    // Determine folder based on route or visibility if needed, defaulting to brainstorm
    const folder = req.baseUrl.includes('members') || req.path.includes('join-us') ? 'brainstorm/members' : 'brainstorm/events';
    
    const cloudinaryResult = await uploadImageToCloudinary(processedBuffer, folder);

    // Create Image Record in Database
    const imageId = crypto.randomUUID();
    
    // Determine ownerType based on route
    let ownerType = 'admin';
    if (req.path.includes('join-us')) ownerType = 'joinUs';
    else if (req.baseUrl.includes('events')) ownerType = 'event';
    else if (req.baseUrl.includes('members')) ownerType = 'member';

    const imageDoc = await Image.create({
      originalFilename: req.file.originalname,
      imageId: imageId,
      publicId: cloudinaryResult.public_id,
      assetId: cloudinaryResult.asset_id,
      format: cloudinaryResult.format,
      width: cloudinaryResult.width,
      height: cloudinaryResult.height,
      bytes: cloudinaryResult.bytes,
      mimeType: 'image/webp',
      size: processedBuffer.length,
      visibility: visibility,
      deliveryType: 'authenticated',
      resourceType: 'image',
      status: 'approved',
      ownerType: ownerType,
      uploadedByOld: req.admin ? req.admin._id : null
    });

    // Attach the Image document ID to the request for the next controller to use
    req.body.protectedImageId = imageDoc._id;
    
    next();
  } catch (error) {
    console.error('Image processing error:', error);
    res.status(500).json({ message: 'Error processing image' });
  }
};
