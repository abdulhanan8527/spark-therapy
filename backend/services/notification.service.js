const Notification = require('../models/Notification');

class NotificationService {
  // Get notifications for a user - returns { success, data, message } for controller to use
  static async getNotificationsByUser(userId) {
    try {
      const notifications = await Notification.find({
        recipientId: userId,
        $or: [{ expiresAt: { $exists: false } }, { expiresAt: null }, { expiresAt: { $gte: new Date() } }]
      }).sort({ createdAt: -1 }).lean();
      return { success: true, data: notifications || [], message: 'Notifications retrieved successfully' };
    } catch (error) {
      console.error('NotificationService getNotificationsByUser error:', error);
      return { success: false, message: error.message, statusCode: 500 };
    }
  }

  // Get notification by ID
  static async getNotificationById(notificationId) {
    try {
      const notification = await Notification.findById(notificationId);
      if (!notification) {
        return { success: false, message: 'Notification not found', statusCode: 404 };
      }
      return { success: true, data: notification, message: 'Notification retrieved successfully' };
    } catch (error) {
      return { success: false, message: error.message, statusCode: 500 };
    }
  }

  // Create notification
  static async createNotification(notificationData) {
    try {
      const notification = new Notification(notificationData);
      const savedNotification = await notification.save();
      return { success: true, data: savedNotification, message: 'Notification created successfully', statusCode: 201 };
    } catch (error) {
      return { success: false, message: error.message, statusCode: 500 };
    }
  }

  // Mark notification as read
  static async markAsRead(notificationId) {
    try {
      const notification = await Notification.findById(notificationId);
      if (!notification) {
        return { success: false, message: 'Notification not found', statusCode: 404 };
      }

      notification.isRead = true;
      notification.readAt = new Date();
      const updatedNotification = await notification.save();
      return { success: true, data: updatedNotification, message: 'Notification marked as read' };
    } catch (error) {
      return { success: false, message: error.message, statusCode: 500 };
    }
  }

  // Mark all notifications as read for a user
  static async markAllAsRead(userId) {
    try {
      const result = await Notification.updateMany(
        { recipientId: userId, isRead: false },
        { isRead: true, readAt: new Date() }
      );
      return { success: true, data: { modifiedCount: result.modifiedCount }, message: 'All notifications marked as read' };
    } catch (error) {
      return { success: false, message: error.message, statusCode: 500 };
    }
  }

  // Delete notification
  static async deleteNotification(notificationId) {
    try {
      const notification = await Notification.findByIdAndDelete(notificationId);
      if (!notification) {
        return { success: false, message: 'Notification not found', statusCode: 404 };
      }
      return { success: true, data: {}, message: 'Notification deleted successfully' };
    } catch (error) {
      return { success: false, message: error.message, statusCode: 500 };
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
      return { success: true, data: savedNotifications, message: 'Broadcast notifications created successfully', statusCode: 201 };
    } catch (error) {
      return { success: false, message: error.message, statusCode: 500 };
    }
  }

  // Get unread notifications count for a user
  static async getUnreadCount(userId) {
    try {
      const count = await Notification.countDocuments({
        recipientId: userId,
        isRead: false,
        $or: [{ expiresAt: { $exists: false } }, { expiresAt: null }, { expiresAt: { $gte: new Date() } }]
      });
      return { success: true, data: { count }, message: 'Unread count retrieved successfully' };
    } catch (error) {
      return { success: false, message: error.message, statusCode: 500 };
    }
  }
}

module.exports = NotificationService;