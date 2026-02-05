import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Bell, MessageSquare, Video, FileText, Calendar, AlertCircle, CheckCircle, XCircle, Clock } from '../../components/SimpleIcons';
import { useAuth } from '../../contexts/AuthContext';
import { notificationAPI } from '../../services/api';

const NotificationsScreen = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notificationSettings, setNotificationSettings] = useState({
    dailyFeedback: true,
    weeklyVideo: true,
    quarterlyReport: true,
    scheduleChanges: true,
    paymentReminders: true,
    generalAnnouncements: true,
  });

  // Reload notifications when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      console.log('Parent notifications screen focused - reloading notifications');
      loadNotifications();
    }, [])
  );

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const response = await notificationAPI.getNotifications();
      if (response.success && Array.isArray(response.data)) {
        setNotifications(response.data);
      } else {
        setNotifications([]);
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
      Alert.alert('Error', 'Failed to load notifications');
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'feedback':
        return <MessageSquare size={20} color="#007AFF" />;
      case 'video':
        return <Video size={20} color="#AF52DE" />;
      case 'report':
        return <FileText size={20} color="#34C759" />;
      case 'schedule':
        return <Calendar size={20} color="#FF9500" />;
      case 'payment':
        return <Bell size={20} color="#FF3B30" />;
      default:
        return <Bell size={20} color="#8E8E93" />;
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
      case 'payment':
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

  const markAsRead = async (id) => {
    try {
      const response = await notificationAPI.markAsRead(id);
      if (response.success) {
        setNotifications(notifications.map(notification => 
          notification._id === id ? { ...notification, isRead: true } : notification
        ));
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const unreadNotifications = notifications.filter(n => !n.isRead);
      for (const notification of unreadNotifications) {
        await notificationAPI.markAsRead(notification._id);
      }
      setNotifications(notifications.map(notification => 
        ({ ...notification, isRead: true })
      ));
      Alert.alert('Success', 'All notifications marked as read');
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      Alert.alert('Error', 'Failed to mark all notifications as read');
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading notifications...</Text>
      </View>
    );
  }

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
          {Object.entries(notificationSettings).map(([key, value]) => (
            <View key={key} style={styles.settingRow}>
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
              key={notification._id} 
              style={[
                styles.notificationCard, 
                !notification.read && styles.unreadNotification,
                { borderLeftColor: getBackgroundColor(notification.type).replace('#e8f5e9', '#007AFF').replace('#f3e5f5', '#AF52DE').replace('#fff3e0', '#FF9500').replace('#ffebee', '#FF3B30').replace('#f5f5f5', '#8E8E93') }
              ]}
              onPress={() => markAsRead(notification._id)}
            >
              <View style={[styles.iconContainer, { backgroundColor: getBackgroundColor(notification.type) }]}>
                {getIcon(notification.type)}
              </View>
              
              <View style={styles.notificationContent}>
                <View style={styles.notificationHeader}>
                  <Text style={styles.notificationTitle}>{notification.title}</Text>
                  {!notification.isRead && <View style={styles.unreadDot} />}
                </View>
                
                <Text style={styles.notificationMessage} numberOfLines={2}>
                  {notification.message}
                </Text>
                
                <View style={styles.notificationFooter}>
                  <Text style={styles.notificationTime}>{new Date(notification.createdAt).toLocaleDateString()}</Text>
                  <Text style={styles.notificationChild}>{notification.childName || 'System'}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
          
          {notifications.length === 0 && (
            <View style={styles.emptyState}>
              <Bell size={40} color="#8E8E93" />
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
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
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  unreadNotification: {
    backgroundColor: '#f0f8ff',
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
  notificationHeader: {
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
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#007AFF',
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
  },
  notificationTime: {
    fontSize: 12,
    color: '#8E8E93',
  },
  notificationChild: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '500',
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