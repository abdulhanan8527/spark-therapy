import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { notificationAPI } from '../../services/api';

const AdminNotificationsScreen = () => {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    
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
        setNotifications([]);
      } finally {
        setLoading(false);
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
          setNotifications(notifications.map(n => n._id === id ? { ...n, read: true } : n));
        }
      } catch (error) {
        console.error('Error marking notification as read:', error);
      }
    };

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.header}>Notifications</Text>

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
                                {!notification.read && <View style={styles.unreadDot} />}
                            </View>
                            <Text style={styles.message}>{notification.message}</Text>
                            <Text style={styles.time}>{notification.createdAt ? new Date(notification.createdAt).toLocaleDateString() : notification.time || 'Just now'}</Text>
                        </View>
                    </TouchableOpacity>
                ))}
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
