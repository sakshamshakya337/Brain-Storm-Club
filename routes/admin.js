import express from 'express';
import { protectAdmin } from '../middleware/auth.js';
import { uploadImage, processAndProtectImage } from '../middleware/upload.js';
import { 
  getDashboardStats, 
  getJoinRequests, 
  updateJoinRequestStatus,
  updateJoinRequest,
  deleteJoinRequest,
  getContactQueries,
  updateContactQueryStatus,
  replyToContactQuery,
  getIdeas,
  getIdeaById,
  getIdeaPdf,
  updateIdeaStatus,
  deleteIdea
} from '../controllers/adminController.js';
import { 
  getAllMembersAdmin, 
  approveMember, 
  rejectMember, 
  updateMember, 
  deleteMember,
  createMember
} from '../controllers/memberController.js';
import {
  getAllEventsAdmin,
  createEvent,
  updateEvent,
  deleteEvent,
  uploadEventPoster,
  uploadEventGalleryImage,
  uploadEventImageStandalone,
  toggleEventRegistration,
  getEventEntriesAdmin,
  deleteEventEntryAdmin,
  updateEventEntryStatusAdmin
} from '../controllers/eventController.js';
import { exportData } from '../controllers/exportController.js';
import {
  getAdminLinks,
  createLink,
  updateLink,
  deleteLink,
  reorderLinks
} from '../controllers/linkController.js';

import { getSettings, updateSettings } from '../controllers/settingsController.js';
import { getNotifications, markAsRead, markAllAsRead } from '../controllers/notificationController.js';

const router = express.Router();

// Apply auth middleware to ALL admin routes
router.use(protectAdmin);

// Dashboard
router.get('/stats', getDashboardStats);

// Join Us Requests
router.route('/join-us')
  .get(getJoinRequests);
router.route('/join-us/:id')
  .patch(updateJoinRequestStatus)
  .put(updateJoinRequest)
  .delete(deleteJoinRequest);

// Contact Queries
router.route('/contact')
  .get(getContactQueries);
router.route('/contact/:id')
  .patch(updateContactQueryStatus);
router.post('/contact/:id/reply', replyToContactQuery);

// Members
router.route('/members')
  .get(getAllMembersAdmin)
  .post(
    uploadImage.single('profileImage'),
    processAndProtectImage('protected'),
    createMember
  );

router.route('/members/:id')
  .patch(
    uploadImage.single('profileImage'),
    processAndProtectImage('protected'),
    updateMember
  )
  .delete(deleteMember);

router.patch('/members/:id/approve', approveMember);
router.patch('/members/:id/reject', rejectMember);

// Events
router.post(
  '/events/upload-image',
  uploadImage.single('image'),
  processAndProtectImage('public'),
  uploadEventImageStandalone
);

router.route('/events')
  .get(getAllEventsAdmin)
  .post(createEvent);

router.route('/events/:id')
  .patch(updateEvent)
  .delete(deleteEvent);

router.patch('/events/:id/registration', toggleEventRegistration);

router.route('/events/:id/entries')
  .get(getEventEntriesAdmin);

router.route('/events/:id/entries/:registrationId')
  .patch(updateEventEntryStatusAdmin)
  .delete(deleteEventEntryAdmin);

router.post(
  '/events/:id/poster', 
  uploadImage.single('poster'), 
  processAndProtectImage('public'), // Event posters are meant for public display
  uploadEventPoster
);

router.post(
  '/events/:id/images',
  uploadImage.single('image'),
  processAndProtectImage('public'),
  uploadEventGalleryImage
);

// Exports
router.get('/exports', exportData);

// Links
router.route('/links')
  .get(getAdminLinks)
  .post(
    uploadImage.single('customIcon'),
    processAndProtectImage('public'), // Link icons are public
    createLink
  );
router.patch('/links/reorder', reorderLinks);
router.route('/links/:id')
  .patch(
    uploadImage.single('customIcon'),
    processAndProtectImage('public'),
    updateLink
  )
  .delete(deleteLink);


// Settings
router.route('/settings')
  .get(getSettings)
  .put(updateSettings);

// Notifications
router.route('/notifications')
  .get(getNotifications);
router.patch('/notifications/read-all', markAllAsRead);
router.patch('/notifications/:id/read', markAsRead);

// Ideas
router.route('/ideas').get(getIdeas);
router.route('/ideas/:id').get(getIdeaById).patch(updateIdeaStatus).delete(deleteIdea);
router.route('/ideas/:id/pdf').get(getIdeaPdf);

export default router;
