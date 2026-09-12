import multer from 'multer';
import sharp from 'sharp';
import crypto from 'crypto';
import heicDecode from 'heic-decode';
import Image from '../models/Image.js';
import { uploadImageToCloudinary, uploadPdfToCloudinary } from '../services/cloudinaryService.js';

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

    // Unapproved applicant photos (join-us or public self-registration) start as pending and private.
    // Admin uploads or event posters start as approved with requested visibility.
    const isApplicantOrPublicRegister = ownerType === 'joinUs' || (ownerType === 'member' && !req.admin);
    const initialStatus = isApplicantOrPublicRegister ? 'pending' : 'approved';
    const initialVisibility = isApplicantOrPublicRegister ? 'private' : visibility;

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
        visibility: initialVisibility,
        deliveryType: 'authenticated',
        resourceType: 'image',
        status: initialStatus,
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

// ─── Payment Screenshot Middleware ─────────────────────────────────────────────

export const processPaymentScreenshot = async (req, res, next) => {
  if (!req.file) return next();

  let responded = false;
  const sendError = (status, message) => {
    if (responded) return;
    responded = true;
    res.status(status).json({ message });
  };

  try {
    let buffer = req.file.buffer;

    // 1. Validate magic bytes to ensure it's an image (JPG, PNG, HEIC)
    const header = buffer.toString('hex', 0, 12).toLowerCase();
    const isJpeg = header.startsWith('ffd8ff');
    const isPng = header.startsWith('89504e47');
    const isHeic = buffer.toString('utf8', 4, 12).includes('ftypmif1') || 
                   buffer.toString('utf8', 4, 12).includes('ftypheic') ||
                   buffer.toString('utf8', 4, 12).includes('ftypheix');

    if (!isJpeg && !isPng && !isHeic) {
      return sendError(400, 'Invalid file content. Uploaded file is not a valid JPG, PNG, or HEIC image.');
    }

    // 2. Decode HEIC to raw pixel data if needed
    if (isHeic) {
      try {
        const { data, width, height } = await heicDecode({ buffer });
        buffer = await sharp(data, {
          raw: { width, height, channels: 4 }
        }).jpeg().toBuffer();
      } catch (err) {
        return sendError(500, 'Failed to process HEIC image.');
      }
    }

    // 3. Compress to JPEG (max 1200x1200, quality 80)
    let processedBuffer;
    try {
      processedBuffer = await sharp(buffer)
        .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: 80 })
        .toBuffer();
    } catch (err) {
      return sendError(500, 'Image processing failed.');
    }

    // 4. Enforce 2MB limit (it should almost always be < 2MB after resizing to 1200x1200)
    if (processedBuffer.length > 2097152) {
      return sendError(400, 'Image size exceeds 2MB limit after compression. Please upload a smaller image.');
    }

    // 5. Upload to Cloudinary
    let cloudinaryResult;
    try {
      cloudinaryResult = await uploadImageToCloudinary(processedBuffer, 'brainstorm/events/payments');
    } catch (err) {
      return sendError(502, 'Image upload failed. Please try again.');
    }

    // 6. Save image record to DB
    const imageId = crypto.randomUUID();
    const imageDoc = await Image.create({
      originalFilename: req.file.originalname,
      imageId,
      publicId: cloudinaryResult.public_id,
      assetId: cloudinaryResult.asset_id,
      format: cloudinaryResult.format,
      width: cloudinaryResult.width,
      height: cloudinaryResult.height,
      bytes: cloudinaryResult.bytes,
      mimeType: 'image/jpeg',
      size: processedBuffer.length,
      visibility: 'protected',
      deliveryType: 'authenticated',
      resourceType: 'image',
      status: 'pending',
      ownerType: 'event',
      uploadedByOld: req.admin ? req.admin._id : null
    });

    req.body.paymentScreenshot = imageDoc._id;
    next();

  } catch (error) {
    sendError(500, 'Unexpected error processing payment screenshot.');
  }
};


// ─── PDF Upload Middleware ────────────────────────────────────────────────────

const pdfFilter = (req, file, cb) => {
  const isPdfMime = file.mimetype === 'application/pdf';
  const hasPdfExt = /\.pdf$/i.test(file.originalname || '');
  if (isPdfMime || hasPdfExt) {
    cb(null, true);
  } else {
    cb(new Error('Only PDF files are accepted.'), false);
  }
};

export const uploadPdf = multer({
  storage: multer.memoryStorage(),
  fileFilter: pdfFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB raw limit — server rejects truly huge files
});

/**
 * Validates the PDF buffer size, authenticates PDF magic bytes, and uploads to Cloudinary.
 * Attaches req.pdfPublicId, req.pdfOriginalName (with .pdf), req.pdfSizeBytes, req.pdfMimeType on success.
 * Responds with 400 if the final file exceeds 2 MB or is not a genuine PDF.
 */
export const processPdfUpload = async (req, res, next) => {
  // No file attached — optional field, skip
  if (!req.file) return next();

  const MAX_BYTES = 2 * 1024 * 1024; // 2 MB

  // 1. Enforce 2 MB limit
  if (req.file.size > MAX_BYTES) {
    return res.status(400).json({
      message: `PDF file is ${(req.file.size / (1024 * 1024)).toFixed(2)} MB. Maximum allowed size is 2 MB. Please upload a smaller PDF.`
    });
  }

  // 2. Validate PDF magic bytes (%PDF-) to reject renamed non-PDF files
  const isPdfHeader = req.file.buffer && req.file.buffer.length >= 4 && req.file.buffer.toString('utf8', 0, 4) === '%PDF';
  if (!isPdfHeader) {
    return res.status(400).json({
      message: 'Invalid file content. Uploaded file is not a valid PDF document.'
    });
  }

  try {
    // Ensure filename strictly preserves .pdf extension
    let originalName = req.file.originalname || 'document.pdf';
    if (!/\.pdf$/i.test(originalName)) {
      originalName = `${originalName}.pdf`;
    }

    const baseName = originalName.replace(/\.pdf$/i, '');
    const result = await uploadPdfToCloudinary(req.file.buffer, 'brainstorm/ideas', baseName);

    req.pdfPublicId     = result.public_id;
    req.pdfOriginalName = originalName;
    req.pdfSizeBytes    = req.file.size;
    req.pdfMimeType     = 'application/pdf';

    next();
  } catch (err) {
    console.error('[processPdfUpload error]', err.message);
    return res.status(502).json({ message: 'PDF upload failed. Please try again.' });
  }
};
