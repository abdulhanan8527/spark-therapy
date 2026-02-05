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
      console.log('=== CREATE BROADCAST NOTIFICATION ===');
      console.log('notificationData:', notificationData);
      console.log('recipientIds count:', recipientIds.length);
      
      const notifications = recipientIds.map(recipientId => ({
        ...notificationData,
        recipientId,
        type: 'broadcast', // Explicitly set type
        isBroadcast: true // Additional flag for clarity
      }));
      
      console.log('Sample notification to be created:', notifications[0]);

      const savedNotifications = await Notification.insertMany(notifications);
      console.log('Saved', savedNotifications.length, 'broadcast notifications');
      console.log('Sample saved notification:', savedNotifications[0]);
      
      return { success: true, data: savedNotifications, message: 'Broadcast notifications created successfully', statusCode: 201 };
    } catch (error) {
      console.error('Error creating broadcast notifications:', error);
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

  // Get broadcast notification history (grouped by broadcast)
  static async getBroadcastHistory(senderId) {
    try {
      console.log('=== GET BROADCAST HISTORY ===');
      console.log('Getting broadcast history for sender:', senderId);
      console.log('Sender type:', typeof senderId);
      
      // Convert senderId to ObjectId if it's a string
      const mongoose = require('mongoose');
      const senderObjectId = new mongoose.Types.ObjectId(senderId);
      console.log('Converted to ObjectId:', senderObjectId);
      
      // First, let's see ALL notifications with type broadcast
      const allBroadcasts = await Notification.find({ type: 'broadcast' }).lean();
      console.log('Total broadcast notifications in DB:', allBroadcasts.length);
      console.log('Sample broadcast notification:', allBroadcasts[0]);
      
      // Get all notifications sent by this admin with type 'broadcast'
      // Group them by createdAt (within 1 second) to identify broadcast groups
      const notifications = await Notification.aggregate([
        {
          $match: {
            senderId: senderObjectId,
            type: 'broadcast'
          }
        },
        {
          $sort: { createdAt: -1 }
        },
        {
          $group: {
            _id: {
              title: '$title',
              message: '$message',
              // Group by minute to catch broadcasts sent at the same time
              createdMinute: {
                $dateToString: {
                  format: '%Y-%m-%d %H:%M',
                  date: '$createdAt'
                }
              }
            },
            title: { $first: '$title' },
            message: { $first: '$message' },
            type: { $first: '$type' },
            priority: { $first: '$priority' },
            createdAt: { $first: '$createdAt' },
            recipientCount: { $sum: 1 },
            notificationIds: { $push: '$_id' }
          }
        },
        {
          $sort: { createdAt: -1 }
        },
        {
          $project: {
            _id: { $arrayElemAt: ['$notificationIds', 0] }, // Use first notification ID as the group ID
            title: 1,
            message: 1,
            type: 1,
            priority: 1,
            createdAt: 1,
            recipientCount: 1,
            recipientType: 'broadcast' // Add a field to indicate it's a broadcast
          }
        }
      ]);
      
      console.log(`Aggregation query returned ${notifications.length} broadcast groups`);
      console.log('Broadcast groups:', notifications);
      console.log(`Found ${notifications.length} broadcast groups`);
      return { 
        success: true, 
        data: notifications, 
        message: 'Broadcast history retrieved successfully' 
      };
    } catch (error) {
      console.error('Get broadcast history error:', error);
      return { success: false, message: error.message, statusCode: 500 };
    }
  }
}

module.exports = NotificationService;