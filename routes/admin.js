import express from 'express';
import { protectAdmin, requireGlobalAdmin, requireEventAccess } from '../middleware/auth.js';
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
  deleteIdea,
  getSecurityLogs,
  getTeams,
  createTeam
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
  updateEventEntryStatusAdmin,
  scanEventQR
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

import {
  createEventAdmin,
  getEventAdmins,
  disableEventAdmin,
  resetEventAdminPassword,
  extendEventAdminExpiration
} from '../controllers/eventAdminController.js';

const router = express.Router();

// Apply auth middleware to ALL admin routes
router.use(protectAdmin);

// Dashboard
router.get('/stats', requireGlobalAdmin, getDashboardStats);

// Security Logs
router.get('/security-logs', requireGlobalAdmin, getSecurityLogs);

// Event Admins
router.route('/event-admins')
  .get(requireGlobalAdmin, getEventAdmins)
  .post(requireGlobalAdmin, createEventAdmin);
router.patch('/event-admins/:id/disable', requireGlobalAdmin, disableEventAdmin);
router.patch('/event-admins/:id/reset-password', requireGlobalAdmin, resetEventAdminPassword);
router.patch('/event-admins/:id/extend', requireGlobalAdmin, extendEventAdminExpiration);


// Join Us Requests
router.route('/join-us')
  .get(requireGlobalAdmin, getJoinRequests);
router.route('/join-us/:id')
  .patch(requireGlobalAdmin, updateJoinRequestStatus)
  .put(requireGlobalAdmin, updateJoinRequest)
  .delete(requireGlobalAdmin, deleteJoinRequest);

// Teams
router.route('/teams')
  .get(requireGlobalAdmin, getTeams)
  .post(requireGlobalAdmin, createTeam);

// Contact Queries
router.route('/contact')
  .get(requireGlobalAdmin, getContactQueries);
router.route('/contact/:id')
  .patch(requireGlobalAdmin, updateContactQueryStatus);
router.post('/contact/:id/reply', requireGlobalAdmin, replyToContactQuery);

// Members
router.route('/members')
  .get(requireGlobalAdmin, getAllMembersAdmin)
  .post(
    requireGlobalAdmin,
    uploadImage.single('profileImage'),
    processAndProtectImage('protected'),
    createMember
  );

router.route('/members/:id')
  .patch(
    requireGlobalAdmin,
    uploadImage.single('profileImage'),
    processAndProtectImage('protected'),
    updateMember
  )
  .delete(requireGlobalAdmin, deleteMember);

router.patch('/members/:id/approve', requireGlobalAdmin, approveMember);
router.patch('/members/:id/reject', requireGlobalAdmin, rejectMember);

// Events
router.post(
  '/events/upload-image',
  requireGlobalAdmin,
  uploadImage.single('image'),
  processAndProtectImage('public'),
  uploadEventImageStandalone
);

router.route('/events')
  .get(requireGlobalAdmin, getAllEventsAdmin)
  .post(requireGlobalAdmin, createEvent);

router.route('/events/:id')
  .patch(requireGlobalAdmin, updateEvent)
  .delete(requireGlobalAdmin, deleteEvent);

router.patch('/events/:id/registration', requireGlobalAdmin, toggleEventRegistration);

router.route('/events/:id/entries')
  .get(requireEventAccess, getEventEntriesAdmin);

router.route('/events/:id/entries/:registrationId')
  .patch(requireGlobalAdmin, updateEventEntryStatusAdmin)
  .delete(requireGlobalAdmin, deleteEventEntryAdmin);

router.post('/events/:id/scan', requireEventAccess, scanEventQR);

router.post(
  '/events/:id/poster',
  requireGlobalAdmin, 
  uploadImage.single('poster'), 
  processAndProtectImage('public'), // Event posters are meant for public display
  uploadEventPoster
);

router.post(
  '/events/:id/images',
  requireGlobalAdmin,
  uploadImage.single('image'),
  processAndProtectImage('public'),
  uploadEventGalleryImage
);

// Exports
router.get('/exports', requireGlobalAdmin, exportData);

// Links
router.route('/links')
  .get(requireGlobalAdmin, getAdminLinks)
  .post(
    requireGlobalAdmin,
    uploadImage.single('customIcon'),
    processAndProtectImage('public'), // Link icons are public
    createLink
  );
router.patch('/links/reorder', requireGlobalAdmin, reorderLinks);
router.route('/links/:id')
  .patch(
    requireGlobalAdmin,
    uploadImage.single('customIcon'),
    processAndProtectImage('public'),
    updateLink
  )
  .delete(requireGlobalAdmin, deleteLink);


// Settings
router.route('/settings')
  .get(requireGlobalAdmin, getSettings)
  .put(requireGlobalAdmin, updateSettings);

// Notifications
router.route('/notifications')
  .get(requireGlobalAdmin, getNotifications);
router.patch('/notifications/read-all', requireGlobalAdmin, markAllAsRead);
router.patch('/notifications/:id/read', requireGlobalAdmin, markAsRead);

// Ideas
router.route('/ideas').get(requireGlobalAdmin, getIdeas);
router.route('/ideas/:id').get(requireGlobalAdmin, getIdeaById).patch(requireGlobalAdmin, updateIdeaStatus).delete(requireGlobalAdmin, deleteIdea);
router.route('/ideas/:id/pdf').get(requireGlobalAdmin, getIdeaPdf);

export default router;
