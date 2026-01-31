import React, { useState } from 'react';
import { Bell, X, Paperclip, Eye, Check, Mail } from 'lucide-react';
import { Card } from './Card';
import { StatusBadge } from './StatusBadge';
import { UserNotification, NotificationPriority } from '../../components/admin/NotificationTypes';

interface NotificationsCenterProps {
  onClose: () => void;
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  notifications: UserNotification[];
}

export function NotificationsCenter({ 
  onClose, 
  onMarkAsRead, 
  onMarkAllAsRead,
  notifications 
}: NotificationsCenterProps) {
  const [selectedNotification, setSelectedNotification] = useState<UserNotification | null>(null);

  // Filter unread notifications
  const unreadCount = notifications.filter(n => !n.read).length;

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // View notification details
  const viewNotification = (notification: UserNotification) => {
    setSelectedNotification(notification);
    // Mark as read when viewing
    if (!notification.read) {
      onMarkAsRead(notification.id);
    }
  };

  // Close notification detail view
  const closeDetailView = () => {
    setSelectedNotification(null);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col">
        {!selectedNotification ? (
          <>
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-gray-700" />
                <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
                {unreadCount > 0 && (
                  <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </div>
              <div className="flex gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={onMarkAllAsRead}
                    className="text-xs text-purple-600 hover:text-purple-800"
                  >
                    Mark All Read
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Notifications List */}
            <div className="overflow-y-auto flex-1">
              {notifications.length === 0 ? (
                <div className="text-center py-12">
                  <Mail className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <h3 className="text-gray-900 mb-1">No notifications</h3>
                  <p className="text-gray-500 text-sm">You're all caught up!</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {notifications.map(notification => (
                    <div 
                      key={notification.id}
                      className={`p-4 cursor-pointer hover:bg-gray-50 ${
                        !notification.read ? 'bg-blue-50' : ''
                      }`}
                      onClick={() => viewNotification(notification)}
                    >
                      <div className="flex justify-between">
                        <h4 className="text-gray-900 font-medium text-sm">
                          {notification.title}
                        </h4>
                        {!notification.read && (
                          <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                        )}
                      </div>
                      <p className="text-gray-600 text-sm mt-1 line-clamp-2">
                        {notification.message}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-gray-500">
                          {formatDate(notification.timestamp)}
                        </span>
                        <div className="flex items-center gap-1">
                          {notification.priority === 'Important' && (
                            <StatusBadge status="Important" variant="danger" />
                          )}
                          {notification.attachmentUrl && (
                            <Paperclip className="w-3 h-3 text-gray-400" />
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            {/* Detail View Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <button
                onClick={closeDetailView}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div className="flex gap-2">
                {!selectedNotification.read && (
                  <button
                    onClick={() => onMarkAsRead(selectedNotification.id)}
                    className="text-xs text-purple-600 hover:text-purple-800 flex items-center gap-1"
                  >
                    <Check className="w-3 h-3" />
                    Mark Read
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Notification Detail */}
            <div className="p-4 overflow-y-auto flex-1">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-gray-900 font-medium">{selectedNotification.title}</h3>
                {selectedNotification.priority === 'Important' && (
                  <StatusBadge status="Important" variant="danger" />
                )}
              </div>
              
              <div className="text-gray-600 text-sm mb-4">
                <p className="mb-3">From: {selectedNotification.senderName}</p>
                <p className="text-xs text-gray-500">
                  Received: {formatDate(selectedNotification.timestamp)}
                </p>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-3 mb-4">
                <p className="text-gray-700 text-sm whitespace-pre-wrap">
                  {selectedNotification.message}
                </p>
              </div>
              
              {selectedNotification.attachmentUrl && (
                <div className="border border-gray-200 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Paperclip className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-700 text-sm">
                        {selectedNotification.attachmentName}
                      </span>
                    </div>
                    <button className="text-purple-600 hover:text-purple-800 text-sm flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      View
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </Card>
    </div>
  );
}