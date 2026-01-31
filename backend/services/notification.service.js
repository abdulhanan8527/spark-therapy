const Notification = require('../models/Notification');
const { successResponse, errorResponse } = require('../utils/responseHandler');

class NotificationService {
  // Get notifications for a user
  static async getNotificationsByUser(userId) {
    try {
      const notifications = await Notification.find({ 
        recipientId: userId,
        expiresAt: { $gte: new Date() }
      }).sort({ createdAt: -1 });
      return successResponse(null, notifications, 'Notifications retrieved successfully');
    } catch (error) {
      return errorResponse(null, error.message, 500);
    }
  }

  // Get notification by ID
  static async getNotificationById(notificationId) {
    try {
      const notification = await Notification.findById(notificationId);
      if (!notification) {
        return errorResponse(null, 'Notification not found', 404);
      }
      return successResponse(null, notification, 'Notification retrieved successfully');
    } catch (error) {
      return errorResponse(null, error.message, 500);
    }
  }

  // Create notification
  static async createNotification(notificationData) {
    try {
      const notification = new Notification(notificationData);
      const savedNotification = await notification.save();
      return successResponse(null, savedNotification, 'Notification created successfully', 201);
    } catch (error) {
      return errorResponse(null, error.message, 500);
    }
  }

  // Mark notification as read
  static async markAsRead(notificationId) {
    try {
      const notification = await Notification.findById(notificationId);
      if (!notification) {
        return errorResponse(null, 'Notification not found', 404);
      }

      notification.isRead = true;
      notification.readAt = new Date();
      const updatedNotification = await notification.save();
      return successResponse(null, updatedNotification, 'Notification marked as read');
    } catch (error) {
      return errorResponse(null, error.message, 500);
    }
  }

  // Mark all notifications as read for a user
  static async markAllAsRead(userId) {
    try {
      const result = await Notification.updateMany(
        { recipientId: userId, isRead: false },
        { isRead: true, readAt: new Date() }
      );
      return successResponse(null, { modifiedCount: result.modifiedCount }, 'All notifications marked as read');
    } catch (error) {
      return errorResponse(null, error.message, 500);
    }
  }

  // Delete notification
  static async deleteNotification(notificationId) {
    try {
      const notification = await Notification.findByIdAndDelete(notificationId);
      if (!notification) {
        return errorResponse(null, 'Notification not found', 404);
      }
      return successResponse(null, {}, 'Notification deleted successfully');
    } catch (error) {
      return errorResponse(null, error.message, 500);
    }
  }

  // Create broadcast notification
  static async createBroadcastNotification(notificationData, recipientIds) {
    try {
      const notifications = recipientIds.map(recipientId => ({
        ...notificationData,
        recipientId
      }));

      const savedNotifications = await Notification.insertMany(notifications);
      return successResponse(null, savedNotifications, 'Broadcast notifications created successfully', 201);
    } catch (error) {
      return errorResponse(null, error.message, 500);
    }
  }

  // Get unread notifications count for a user
  static async getUnreadCount(userId) {
    try {
      const count = await Notification.countDocuments({
        recipientId: userId,
        isRead: false,
        expiresAt: { $gte: new Date() }
      });
      return successResponse(null, { count }, 'Unread count retrieved successfully');
    } catch (error) {
      return errorResponse(null, error.message, 500);
    }
  }
}

module.exports = NotificationService;