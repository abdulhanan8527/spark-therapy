import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { notificationAPI } from '../../services/api';

const AdminNotificationsScreen = () => {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Reload notifications when screen comes into focus
    useFocusEffect(
      useCallback(() => {
        console.log('Admin notifications screen focused - reloading');
        loadNotifications();
      }, [])
    );
    
    const loadNotifications = async () => {
      try {
        console.log('=== LOADING NOTIFICATIONS ===');
        console.log('User:', user);
        setLoading(true);
        
        // For admins, merge regular notifications with broadcast history
        if (user.role === 'admin') {
          console.log('Loading admin notifications + broadcast history');
          
          // Load both regular notifications and broadcast history in parallel
          const [notificationsRes, broadcastRes] = await Promise.all([
            notificationAPI.getNotifications(),
            notificationAPI.getBroadcastHistory()
          ]);
          
          console.log('Regular notifications response:', notificationsRes);
          console.log('Broadcast history response:', broadcastRes);
          
          let regularNotifs = [];
          let broadcastNotifs = [];
          
          // Extract regular notifications
          if (notificationsRes.success && Array.isArray(notificationsRes.data)) {
            regularNotifs = notificationsRes.data;
          } else if (notificationsRes.success && notificationsRes.data && Array.isArray(notificationsRes.data.notifications)) {
            regularNotifs = notificationsRes.data.notifications;
          }
          
          // Extract broadcast notifications
          if (broadcastRes.success && Array.isArray(broadcastRes.data)) {
            broadcastNotifs = broadcastRes.data.map(b => ({
              ...b,
              isBroadcast: true,
              type: 'broadcast'
            }));
          }
          
          // Merge and sort by date
          const allNotifications = [...regularNotifs, ...broadcastNotifs]
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          
          console.log(`Loaded ${regularNotifs.length} regular + ${broadcastNotifs.length} broadcast = ${allNotifications.length} total`);
          setNotifications(allNotifications);
        } else {
          // For non-admins, just load regular notifications
          const response = await notificationAPI.getNotifications();
          console.log('Notifications API response:', response);
          
          if (response.success && Array.isArray(response.data)) {
            console.log(`Successfully loaded ${response.data.length} notifications`);
            setNotifications(response.data);
          } else if (response.success && response.data && Array.isArray(response.data.notifications)) {
            console.log(`Successfully loaded ${response.data.notifications.length} notifications (nested)`);
            setNotifications(response.data.notifications);
          } else {
            console.warn('Unexpected response format:', response);
            setNotifications([]);
          }
        }
      } catch (error) {
        console.error('Error loading notifications:', error);
        console.error('Error details:', {
          message: error?.message,
          response: error?.response?.data,
          status: error?.response?.status
        });
        setNotifications([]);
      } finally {
        setLoading(false);
        console.log('=== NOTIFICATIONS LOAD COMPLETE ===');
      }
    };
    
    useEffect(() => {
      loadNotifications();
    }, []);

    const getIcon = (type) => {
        switch (type) {
            case 'complaint':
                return <Ionicons name="alert-circle" size={20} color="#FF3B30" />;
            case 'leave':
                return <Ionicons name="calendar" size={20} color="#FF9500" />;
            case 'registration':
                return <Ionicons name="person" size={20} color="#007AFF" />;
            default:
                return <Ionicons name="notifications-outline" size={20} color="#8E8E93" />;
        }
    };

    const markAsRead = async (id) => {
      try {
        const response = await notificationAPI.markAsRead(id);
        if (response.success) {
          setNotifications(notifications.map(n => n._id === id ? { ...n, isRead: true } : n));
        }
      } catch (error) {
        console.error('Error marking notification as read:', error);
      }
    };

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.header}>Notifications</Text>

            {loading && (
                <View style={{ padding: 20, alignItems: 'center' }}>
                    <Text style={{ color: '#666' }}>Loading notifications...</Text>
                </View>
            )}

            <View style={styles.list}>
                {notifications.map((notification) => (
                    <TouchableOpacity
                        key={notification._id || notification.id}
                        style={[styles.card, !notification.read && styles.unreadCard]}
                        onPress={() => markAsRead(notification._id || notification.id)}
                    >
                        <View style={styles.iconContainer}>
                            {getIcon(notification.type)}
                        </View>
                        <View style={styles.content}>
                            <View style={styles.titleRow}>
                                <Text style={styles.title}>{notification.title}</Text>
                                {!notification.isRead && <View style={styles.unreadDot} />}
                            </View>
                            <Text style={styles.message}>{notification.message}</Text>
                            <Text style={styles.time}>{notification.createdAt ? new Date(notification.createdAt).toLocaleDateString() : notification.time || 'Just now'}</Text>
                        </View>
                    </TouchableOpacity>
                ))}
                
                {!loading && notifications.length === 0 && (
                    <View style={{ padding: 30, alignItems: 'center' }}>
                        <Ionicons name="notifications-outline" size={48} color="#ccc" />
                        <Text style={{ color: '#999', fontSize: 16, marginTop: 10 }}>No notifications yet</Text>
                        <Text style={{ color: '#ccc', fontSize: 14, marginTop: 5 }}>You'll see notifications here when you receive them</Text>
                    </View>
                )}
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
    list: {
        gap: 12,
    },
    card: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    unreadCard: {
        backgroundColor: '#f0faff',
        borderLeftWidth: 4,
        borderLeftColor: '#007AFF',
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#f0f0f0',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    content: {
        flex: 1,
    },
    titleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    title: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    unreadDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#007AFF',
    },
    message: {
        fontSize: 14,
        color: '#666',
        lineHeight: 20,
        marginBottom: 8,
    },
    time: {
        fontSize: 12,
        color: '#999',
    },
});

export default AdminNotificationsScreen;
