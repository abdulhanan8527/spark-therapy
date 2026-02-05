const express = require('express');
const {
  getNotifications,
  getNotificationById,
  createNotification,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getBroadcastHistory
} = require('../controllers/notification.controller');
const { protect, authorize } = require('../middleware/auth.middleware');
const { createValidator } = require('../middleware/validation.middleware');
const { notificationSchemas } = require('../helpers/validation');

const router = express.Router();

// Broadcast history route must come before /:id to avoid path conflicts
router.route('/broadcast/history')
  .get(protect, authorize('admin'), getBroadcastHistory);

router.route('/')
  .get(protect, getNotifications)
  .post(protect, authorize('admin'), createValidator(notificationSchemas.create), createNotification);

router.route('/:id')
  .get(protect, getNotificationById)
  .delete(protect, deleteNotification);

router.route('/:id/read')
  .put(protect, markAsRead);

router.route('/read-all')
  .put(protect, markAllAsRead);

module.exports = router;