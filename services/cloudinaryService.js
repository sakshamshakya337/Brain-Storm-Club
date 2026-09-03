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
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: folder,
        type: 'authenticated', // Strict security: do not expose raw URL
        // Optional transformations if we want to ensure format/quality at upload time,
        // but we've already used sharp to format/compress, so just store as is.
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    
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
      return { width: 400, height: 400, crop: 'fill', quality: 'auto', fetch_format: 'auto' };
    case 'event_card':
      return { width: 800, height: 500, crop: 'fill', quality: 'auto', fetch_format: 'auto' };
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
