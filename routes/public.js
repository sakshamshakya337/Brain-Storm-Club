import express from 'express';
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

import { getPublicLinks, trackLinkVisit } from '../controllers/linkController.js';

// Read-only public data
router.get('/events', getPublicEvents);
router.get('/events/:slug', getPublicEventDetails);
router.get('/members', getPublicMembers);
router.get('/links', getPublicLinks);
router.get('/links/:id/visit', trackLinkVisit);

// Form submissions
router.post(
  '/join-us',
  uploadImage.single('profileImage'),
  processAndProtectImage('protected'),
  submitJoinUs
);
router.post('/contact', submitContact);
router.post('/ideas', uploadPdf.single('pdf'), processPdfUpload, submitIdea);
router.post('/events/register', submitEventRegistration);

// Member Registration requires file upload (Protected visibility by default)
router.post(
  '/members/register', 
  uploadImage.single('profileImage'), 
  processAndProtectImage('protected'),
  submitMemberRegistration
);

export default router;
