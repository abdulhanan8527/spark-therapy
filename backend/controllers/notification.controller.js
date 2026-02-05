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

    const { recipientId, recipientType, title, message, type, priority, isBroadcast } = req.body;
    
    console.log('=== CREATE NOTIFICATION CONTROLLER ===');
    console.log('Request body:', req.body);
    console.log('User:', req.user._id, req.user.role);

    // Handle broadcast notifications based on recipientType
    if (isBroadcast || recipientType) {
      console.log('Processing broadcast notification');
      
      // Get recipient IDs based on recipientType
      let recipientIds = [];
      
      if (recipientType === 'all') {
        // Get all users except the admin sending it
        const allUsersResult = await UserService.getAllUsers();
        if (allUsersResult.success) {
          recipientIds = allUsersResult.data
            .filter(u => u._id.toString() !== req.user._id.toString())
            .map(u => u._id);
        }
      } else if (recipientType === 'parents' || recipientType === 'therapists' || recipientType === 'both') {
        // Get users by role
        const roles = [];
        if (recipientType === 'parents' || recipientType === 'both') roles.push('parent');
        if (recipientType === 'therapists' || recipientType === 'both') roles.push('therapist');
        
        for (const role of roles) {
          const usersResult = await UserService.getUsersByRole(role);
          if (usersResult.success) {
            recipientIds.push(...usersResult.data.map(u => u._id));
          }
        }
      }
      
      console.log(`Found ${recipientIds.length} recipients for broadcast`);
      
      if (recipientIds.length === 0) {
        return errorResponse(res, 'No recipients found for the selected group', 400);
      }
      
      // Create broadcast notification
      const notificationData = {
        title: title || 'Broadcast Notification',
        message,
        type: type || 'broadcast',
        priority: priority || 'normal',
        senderId: req.user._id
      };
      
      const result = await NotificationService.createBroadcastNotification(notificationData, recipientIds);
      
      if (result.success) {
        console.log(`Broadcast notification created for ${result.data.length} recipients`);
        successResponse(res, result.data, result.message, result.statusCode);
      } else {
        console.error('Broadcast notification creation failed:', result.message);
        errorResponse(res, result.message, result.statusCode);
      }
    } else if (recipientId) {
      // Single recipient notification
      console.log('Processing single recipient notification');
      
      // Validate recipientId
      if (!isValidObjectId(recipientId)) {
        return errorResponse(res, 'Invalid recipient ID', 400);
      }

      // Check if user exists
      const userResult = await UserService.getUserById(recipientId);
      if (!userResult.success) {
        return errorResponse(res, 'Recipient not found', 404);
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
    } else {
      return errorResponse(res, 'Either recipientId or recipientType is required', 400);
    }
  } catch (error) {
    console.error('Create notification error:', error);
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
    
    // Check authorization:
    // - User can mark as read if they are the recipient
    // - Admin can mark as read if they are the sender (for broadcast notifications)
    const isRecipient = notification.recipientId.toString() === req.user._id.toString();
    const isSender = notification.senderId && notification.senderId.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    
    if (!isRecipient && !(isSender && isAdmin)) {
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

// @desc    Get broadcast notification history (admin only)
// @route   GET /api/notifications/broadcast/history
// @access  Private (Admin)
const getBroadcastHistory = async (req, res) => {
  try {
    // Only admins can view broadcast history
    if (req.user.role !== 'admin') {
      return errorResponse(res, 'Not authorized to view broadcast history', 403);
    }

    console.log('=== GET BROADCAST HISTORY ===');
    console.log('Admin user:', req.user._id);
    
    // Get all notifications where senderId matches the admin
    // Group by title and message to identify broadcast groups
    const result = await NotificationService.getBroadcastHistory(req.user._id);
    
    if (result.success) {
      console.log(`Found ${result.data.length} broadcast notification groups`);
      successResponse(res, result.data, result.message);
    } else {
      errorResponse(res, result.message, result.statusCode);
    }
  } catch (error) {
    console.error('Get broadcast history error:', error);
    errorResponse(res, error.message, 500);
  }
};

module.exports = {
  getNotifications,
  getNotificationById,
  createNotification,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getBroadcastHistory
};