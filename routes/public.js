import express from 'express';
import rateLimit from 'express-rate-limit';
import { uploadImage, processAndProtectImage, uploadPdf, processPdfUpload } from '../middleware/upload.js';
import { getPublicEvents, getPublicEventDetails, getPublicMembers } from '../controllers/publicController.js';
import { 
  submitMemberRegistration, 
  submitJoinUs, 
  submitContact, 
  submitIdea,
  submitEventRegistration
} from '../controllers/formController.js';

const router = express.Router();

// General public form submission rate limiter (15 requests per 15 min per IP)
const formSubmissionLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many submissions from this IP. Please try again after 15 minutes.' }
});

// File upload rate limiter (6 uploads per 15 min per IP to prevent Cloudinary/storage abuse)
const fileUploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 6,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Upload limit reached for this IP. Please try again after 15 minutes.' }
});

import { getPublicLinks, trackLinkVisit } from '../controllers/linkController.js';

// Read-only public data
router.get('/events', getPublicEvents);
router.get('/events/:slug', getPublicEventDetails);
router.get('/members', getPublicMembers);
router.get('/links', getPublicLinks);
router.get('/links/:id/visit', trackLinkVisit);

// Form submissions (rate limited & sanitized)
router.post(
  '/join-us',
  fileUploadLimiter,
  uploadImage.single('profileImage'),
  processAndProtectImage('protected'),
  submitJoinUs
);
router.post('/contact', formSubmissionLimiter, submitContact);
router.post('/ideas', fileUploadLimiter, uploadPdf.single('pdf'), processPdfUpload, submitIdea);
router.post('/events/register', formSubmissionLimiter, submitEventRegistration);

// Member Registration requires file upload (Protected visibility by default)
router.post(
  '/members/register', 
  fileUploadLimiter,
  uploadImage.single('profileImage'), 
  processAndProtectImage('protected'),
  submitMemberRegistration
);

export default router;
