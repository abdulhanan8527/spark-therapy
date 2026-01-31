const NotificationService = require('../services/notification.service');
const UserService = require('../services/user.service');
const { successResponse, errorResponse } = require('../utils/responseHandler');
const { isValidObjectId } = require('../utils/validation');

// @desc    Get all notifications for current user
// @route   GET /api/notifications
// @access  Private (All users)
const getNotifications = async (req, res) => {
  try {
    const result = await NotificationService.getNotificationsByUser(req.user._id);
    
    if (result.success) {
      successResponse(res, result.data, result.message);
    } else {
      errorResponse(res, result.message, result.statusCode);
    }
  } catch (error) {
    errorResponse(res, error.message, 500);
  }
};

// @desc    Get notification by ID
// @route   GET /api/notifications/:id
// @access  Private (Recipient)
const getNotificationById = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ObjectId
    if (!isValidObjectId(id)) {
      return errorResponse(res, 'Invalid notification ID', 400);
    }

    const result = await NotificationService.getNotificationById(id);
    
    if (result.success) {
      const notification = result.data;
      // Check if user is the recipient
      if (notification.recipientId.toString() !== req.user._id.toString()) {
        return errorResponse(res, 'Not authorized to access this notification', 403);
      }
      
      successResponse(res, result.data, result.message);
    } else {
      errorResponse(res, result.message, result.statusCode);
    }
  } catch (error) {
    errorResponse(res, error.message, 500);
  }
};

// @desc    Create new notification (Admin/Broadcast)
// @route   POST /api/notifications
// @access  Private (Admin)
const createNotification = async (req, res) => {
  try {
    // Only admins can create broadcast notifications
    if (req.user.role !== 'admin') {
      return errorResponse(res, 'Not authorized to create notifications', 403);
    }

    const { recipientId } = req.body;

    // Validate recipientId if specified
    if (recipientId && !isValidObjectId(recipientId)) {
      return errorResponse(res, 'Invalid recipient ID', 400);
    }

    // If recipientId is specified, check if user exists
    if (recipientId) {
      const userResult = await UserService.getUserById(recipientId);
      if (!userResult.success) {
        return errorResponse(res, 'Recipient not found', 404);
      }
    }

    const notificationData = {
      ...req.body,
      senderId: req.user._id
    };

    const result = await NotificationService.createNotification(notificationData);
    
    if (result.success) {
      successResponse(res, result.data, result.message, result.statusCode);
    } else {
      errorResponse(res, result.message, result.statusCode);
    }
  } catch (error) {
    errorResponse(res, error.message, 500);
  }
};

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private (Recipient)
const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ObjectId
    if (!isValidObjectId(id)) {
      return errorResponse(res, 'Invalid notification ID', 400);
    }

    // Check if notification exists
    const notificationResult = await NotificationService.getNotificationById(id);
    if (!notificationResult.success) {
      return errorResponse(res, notificationResult.message, notificationResult.statusCode);
    }

    const notification = notificationResult.data;
    // Check if user is the recipient
    if (notification.recipientId.toString() !== req.user._id.toString()) {
      return errorResponse(res, 'Not authorized to update this notification', 403);
    }

    const result = await NotificationService.markAsRead(id);
    
    if (result.success) {
      successResponse(res, result.data, result.message);
    } else {
      errorResponse(res, result.message, result.statusCode);
    }
  } catch (error) {
    errorResponse(res, error.message, 500);
  }
};

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private (User)
const markAllAsRead = async (req, res) => {
  try {
    const result = await NotificationService.markAllAsRead(req.user._id);
    
    if (result.success) {
      successResponse(res, result.data, result.message);
    } else {
      errorResponse(res, result.message, result.statusCode);
    }
  } catch (error) {
    errorResponse(res, error.message, 500);
  }
};

// @desc    Delete notification
// @route   DELETE /api/notifications/:id
// @access  Private (Recipient, Admin)
const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ObjectId
    if (!isValidObjectId(id)) {
      return errorResponse(res, 'Invalid notification ID', 400);
    }

    // Check if notification exists
    const notificationResult = await NotificationService.getNotificationById(id);
    if (!notificationResult.success) {
      return errorResponse(res, notificationResult.message, notificationResult.statusCode);
    }

    const notification = notificationResult.data;
    // Check if user is authorized to delete
    if (req.user.role !== 'admin' && 
        notification.recipientId.toString() !== req.user._id.toString()) {
      return errorResponse(res, 'Not authorized to delete this notification', 403);
    }

    const result = await NotificationService.deleteNotification(id);
    
    if (result.success) {
      successResponse(res, result.data, result.message);
    } else {
      errorResponse(res, result.message, result.statusCode);
    }
  } catch (error) {
    errorResponse(res, error.message, 500);
  }
};

module.exports = {
  getNotifications,
  getNotificationById,
  createNotification,
  markAsRead,
  markAllAsRead,
  deleteNotification
};