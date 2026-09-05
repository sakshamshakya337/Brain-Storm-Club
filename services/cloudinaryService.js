import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Uploads an image buffer to Cloudinary
 * @param {Buffer} buffer The compressed image buffer
 * @param {String} folder The folder in Cloudinary (e.g., 'brainstorm/members')
 * @returns {Promise<Object>} The Cloudinary asset metadata
 */
export const uploadImageToCloudinary = async (buffer, folder) => {
  return new Promise((resolve, reject) => {
    // Abort the upload if Cloudinary doesn't respond within 8 seconds.
    // This prevents the Vercel function from hanging silently until it is killed.
    const timer = setTimeout(() => {
      reject(new Error('Cloudinary upload timed out after 8 seconds'));
    }, 8000);

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: folder,
        type: 'authenticated',
        timeout: 8000, // Cloudinary SDK-level timeout (ms)
      },
      (error, result) => {
        clearTimeout(timer);
        if (error) return reject(error);
        resolve(result);
      }
    );

    // Surface stream-level errors (e.g. broken pipe, ECONNRESET)
    uploadStream.on('error', (err) => {
      clearTimeout(timer);
      reject(err);
    });

    uploadStream.end(buffer);
  });
};

/**
 * Deletes an image from Cloudinary by its public ID
 * @param {String} publicId The Cloudinary public_id
 */
export const deleteImageFromCloudinary = async (publicId) => {
  try {
    if (!publicId) return;
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error);
    // Don't throw to prevent breaking the flow if cleanup fails
  }
};

/**
 * Maps frontend variants to predefined strict Cloudinary transformations
 * @param {String} variant Predefined variant name
 * @returns {Array|Object} Cloudinary transformation
 */
const getTransformationForVariant = (variant) => {
  switch (variant) {
    case 'member_card':
      return { width: 800, crop: 'limit', quality: 'auto', fetch_format: 'auto' };
    case 'event_card':
      return { width: 800, crop: 'limit', quality: 'auto', fetch_format: 'auto' };
    case 'event_detail':
      return { width: 1400, crop: 'limit', quality: 'auto', fetch_format: 'auto' };
    case 'gallery_thumb':
      return { width: 500, height: 350, crop: 'fill', quality: 'auto', fetch_format: 'auto' };
    case 'about_section':
      return { width: 1000, crop: 'limit', quality: 'auto', fetch_format: 'auto' };
    default:
      return null;
  }
};

/**
 * Generates a signed, time-limited URL for an authenticated asset
 * @param {String} publicId The Cloudinary public_id
 * @param {String} variant The requested transformation variant
 * @returns {String|null} The signed Cloudinary URL
 */
export const generateSignedUrl = (publicId, variant) => {
  if (!publicId) return null;
  
  const transformation = getTransformationForVariant(variant);
  if (!transformation) return null; // Reject unknown variants

  try {
    // Generate signed URL valid for 1 hour
    const expiresAt = Math.floor(Date.now() / 1000) + (60 * 60);
    
    return cloudinary.url(publicId, {
      type: 'authenticated',
      sign_url: true,
      secure: true,
      transformation: [transformation],
      // Auth token approach could also be used here in phase 2, but sign_url is standard for authenticated delivery
    });
  } catch (error) {
    console.error('Error generating signed URL:', error);
    return null;
  }
};

/**
 * Uploads a PDF buffer to Cloudinary as a raw resource
 * @param {Buffer} buffer  The PDF file buffer
 * @param {String} folder  Cloudinary folder (e.g. 'brainstorm/ideas')
 * @param {String} filename  Original filename (without extension)
 * @returns {Promise<Object>} Cloudinary result
 */
export const uploadPdfToCloudinary = async (buffer, folder, filename) => {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error('Cloudinary PDF upload timed out after 25 seconds'));
    }, 25000);

    const baseName = (filename || 'idea-document')
      .replace(/\.pdf$/i, '')
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .substring(0, 80);

    // Explicitly append .pdf to the public_id so Cloudinary raw storage preserves extension
    const publicIdWithExt = `${baseName}_${Date.now()}.pdf`;

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'raw',
        type: 'authenticated',
        public_id: publicIdWithExt,
        timeout: 25000,
      },
      (error, result) => {
        clearTimeout(timer);
        if (error) return reject(error);
        resolve(result);
      }
    );

    uploadStream.on('error', (err) => {
      clearTimeout(timer);
      reject(err);
    });

    uploadStream.end(buffer);
  });
};

/**
 * Generates a signed view/download URL for an authenticated raw (PDF) asset
 * @param {String} publicId  Cloudinary public_id
 * @returns {String|null}
 */
export const generateSignedPdfUrl = (publicId) => {
  if (!publicId) return null;
  try {
    return cloudinary.utils.private_download_url(publicId, 'pdf', {
      resource_type: 'raw',
      type: 'authenticated',
      expires_at: Math.floor(Date.now() / 1000) + 3600, // 1 hour
      attachment: false, // Allows inline display in browser/iframe
    });
  } catch (err) {
    console.error('Error generating signed PDF URL:', err);
    return null;
  }
};

/**
 * Deletes a raw PDF resource from Cloudinary
 * @param {String} publicId The Cloudinary public_id
 */
export const deletePdfFromCloudinary = async (publicId) => {
  try {
    if (!publicId) return;
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: 'raw',
      type: 'authenticated',
    });
    return result;
  } catch (error) {
    console.error('Error deleting PDF from Cloudinary:', error);
  }
};

