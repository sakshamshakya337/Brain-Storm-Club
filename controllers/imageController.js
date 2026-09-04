import Image from '../models/Image.js';
import { generateSignedUrl } from '../services/cloudinaryService.js';

export const getProtectedImage = async (req, res) => {
  try {
    const { id: imageId } = req.params;
    const { variant } = req.query;

    if (!imageId) {
      return res.status(400).json({ message: 'Image ID is required' });
    }

    // Check if ID is a valid UUID v4 format
    const uuidRegex =
      /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-4[0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/;
    if (!uuidRegex.test(imageId)) {
      return res.status(400).json({ message: 'Invalid image ID format' });
    }

    if (!variant) {
      return res.status(400).json({ message: 'Variant parameter is required' });
    }

    const imageDoc = await Image.findOne({ imageId });

    if (!imageDoc) {
      return res.status(404).json({ message: 'Image not found' });
    }

    // Security: Only approved public/protected images can be viewed publicly.
    // Private images or pending/rejected images require active admin authentication.
    if (imageDoc.visibility === 'private' || imageDoc.status !== 'approved') {
      if (!req.admin) {
        return res.status(403).json({ message: 'Access denied. Administrator privileges required.' });
      }
    }

    const signedUrl = generateSignedUrl(imageDoc.publicId, variant);

    if (!signedUrl) {
      return res
        .status(400)
        .json({ message: 'Invalid variant requested or error generating URL' });
    }

    // Security and CORS headers
    res.setHeader('X-Robots-Tag', 'noindex');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    if (req.headers.origin) {
      res.setHeader('Access-Control-Allow-Origin', req.headers.origin);
      res.setHeader('Access-Control-Allow-Credentials', 'true');
    } else {
      res.setHeader('Access-Control-Allow-Origin', '*');
    }
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');

    // Cache control
    if (imageDoc.visibility === 'private' || imageDoc.status !== 'approved') {
      res.setHeader('Cache-Control', 'private, no-store, no-cache, must-revalidate, max-age=0');
      res.setHeader('Pragma', 'no-cache');
    } else {
      res.setHeader('Cache-Control', 'public, max-age=1800'); // 30 minutes
    }

    // -----------------------------------------------------------------------
    // PIPE the image data through our server rather than redirecting.
    // This keeps the Cloudinary signed URL server-side only and avoids
    // cross-origin fetch issues in the browser (e.g. CORS on signed redirects).
    // -----------------------------------------------------------------------
    const upstream = await fetch(signedUrl);
    if (!upstream.ok) {
      return res.status(502).json({ message: 'Failed to fetch image from storage' });
    }

    const contentType = upstream.headers.get('content-type') || 'image/jpeg';
    res.setHeader('Content-Type', contentType);

    // Stream the response body to the client
    const { Readable } = await import('stream');
    const nodeStream = Readable.fromWeb(upstream.body);
    nodeStream.pipe(res);
  } catch (error) {
    console.error('Image retrieval error:', error);
    if (!res.headersSent) {
      res.status(500).json({ message: 'Error retrieving image' });
    }
  }
};
