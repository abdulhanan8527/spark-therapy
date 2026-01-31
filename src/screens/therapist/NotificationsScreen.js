import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';

const NotificationsScreen = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([
    // Mock data for demonstration
    {
      id: 1,
      type: 'feedback',
      title: 'Feedback Reminder',
      message: 'Please submit daily feedback for Emma Johnson\'s session today.',
      time: '2 hours ago',
      read: false,
      priority: 'high',
    },
    {
      id: 2,
      type: 'video',
      title: 'Video Upload Due',
      message: 'Weekly video for Liam Chen is due by tomorrow.',
      time: '5 hours ago',
      read: true,
      priority: 'medium',
    },
    {
      id: 3,
      type: 'report',
      title: 'Quarterly Report',
      message: 'Q4 report for Emma Johnson needs to be submitted by Dec 31.',
      time: '1 day ago',
      read: false,
      priority: 'high',
    },
    {
      id: 4,
      type: 'schedule',
      title: 'Session Rescheduled',
      message: 'Emma Johnson\'s session on Dec 20 has been rescheduled to Dec 22.',
      time: '1 day ago',
      read: true,
      priority: 'low',
    },
    {
      id: 5,
      type: 'admin',
      title: 'Admin Announcement',
      message: 'Therapist meeting scheduled for Dec 25 at 2:00 PM.',
      time: '2 days ago',
      read: false,
      priority: 'medium',
    },
  ]);
  const [notificationSettings, setNotificationSettings] = useState({
    dailyFeedback: true,
    weeklyVideo: true,
    quarterlyReport: true,
    scheduleChanges: true,
    adminAnnouncements: true,
    parentMessages: true,
  });

  const getIcon = (type) => {
    switch (type) {
      case 'feedback':
        return <Ionicons name="chatbubble-ellipses-outline" size={20} color="#007AFF" />;
      case 'video':
        return <Ionicons name="videocam-outline" size={20} color="#AF52DE" />;
      case 'report':
        return <Ionicons name="document-text-outline" size={20} color="#34C759" />;
      case 'schedule':
        return <Ionicons name="calendar-outline" size={20} color="#FF9500" />;
      case 'admin':
        return <Ionicons name="notifications-outline" size={20} color="#FF3B30" />;
      default:
        return <Ionicons name="notifications-outline" size={20} color="#8E8E93" />;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return '#FF3B30';
      case 'medium':
        return '#FF9500';
      case 'low':
        return '#34C759';
      default:
        return '#8E8E93';
    }
  };

  const getBackgroundColor = (type) => {
    switch (type) {
      case 'feedback':
        return '#e8f5e9';
      case 'video':
        return '#f3e5f5';
      case 'report':
        return '#e8f5e9';
      case 'schedule':
        return '#fff3e0';
      case 'admin':
        return '#ffebee';
      default:
        return '#f5f5f5';
    }
  };

  const toggleNotificationSetting = (setting) => {
    setNotificationSettings({
      ...notificationSettings,
      [setting]: !notificationSettings[setting],
    });
  };

  const markAsRead = (id) => {
    setNotifications(notifications.map(notification => 
      notification.id === id ? { ...notification, read: true } : notification
    ));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(notification => 
      ({ ...notification, read: true })
    ));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Notifications</Text>
      
      {/* Unread Count */}
      <View style={styles.unreadContainer}>
        <Text style={styles.unreadText}>You have {unreadCount} unread notifications</Text>
        {unreadCount > 0 && (
          <TouchableOpacity onPress={markAllAsRead}>
            <Text style={styles.markAllText}>Mark all as read</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Notification Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notification Settings</Text>
        <View style={styles.settingsContainer}>
          {Object.entries(notificationSettings).map(([key, value], index) => (
            <View 
              key={key} 
              style={[
                styles.settingRow, 
                index === Object.keys(notificationSettings).length - 1 && styles.settingRowLast
              ]}
            >
              <Text style={styles.settingText}>
                {key.split(/(?=[A-Z])/).map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
              </Text>
              <Switch
                value={value}
                onValueChange={() => toggleNotificationSetting(key)}
                trackColor={{ false: '#ccc', true: '#007AFF' }}
                thumbColor={value ? '#fff' : '#f4f3f4'}
              />
            </View>
          ))}
        </View>
      </View>

      {/* Notifications List */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Notifications</Text>
        <View style={styles.notificationsList}>
          {notifications.map((notification) => (
            <TouchableOpacity 
              key={notification.id} 
              style={[
                styles.notificationCard, 
                !notification.read && styles.unreadNotification
              ]}
              onPress={() => markAsRead(notification.id)}
            >
              <View style={styles.notificationHeader}>
                <View style={[styles.iconContainer, { backgroundColor: getBackgroundColor(notification.type) }]}>
                  {getIcon(notification.type)}
                </View>
                <View style={styles.notificationContent}>
                  <View style={styles.notificationTitleRow}>
                    <Text style={styles.notificationTitle}>{notification.title}</Text>
                    <View style={[styles.priorityIndicator, { backgroundColor: getPriorityColor(notification.priority) }]} />
                  </View>
                  
                  <Text style={styles.notificationMessage} numberOfLines={2}>
                    {notification.message}
                  </Text>
                  
                  <View style={styles.notificationFooter}>
                    <Text style={styles.notificationTime}>{notification.time}</Text>
                    {!notification.read && <View style={styles.unreadDot} />}
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))}
          
          {notifications.length === 0 && (
            <View style={styles.emptyState}>
              <Ionicons name="notifications-outline" size={40} color="#8E8E93" />
              <Text style={styles.emptyStateText}>No notifications yet</Text>
              <Text style={styles.emptyStateSubtext}>We'll notify you when there's important information</Text>
            </View>
          )}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  unreadContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  unreadText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  markAllText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  settingsContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingRowLast: {
    borderBottomWidth: 0,
  },
  settingText: {
    fontSize: 16,
    color: '#333',
  },
  notificationsList: {
    gap: 12,
  },
  notificationCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  unreadNotification: {
    backgroundColor: '#f0f8ff',
  },
  notificationHeader: {
    flexDirection: 'row',
    padding: 16,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  priorityIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  notificationMessage: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 8,
  },
  notificationFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  notificationTime: {
    fontSize: 12,
    color: '#8E8E93',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#007AFF',
  },
  emptyState: {
    alignItems: 'center',
    padding: 30,
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginTop: 12,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },
});

export default NotificationsScreen;