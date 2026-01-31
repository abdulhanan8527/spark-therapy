import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { notificationAPI } from '../../services/api';

const BroadcastNotificationsScreen = () => {
  const { user } = useAuth();
  const [notificationTitle, setNotificationTitle] = useState('');
  const [notificationMessage, setNotificationMessage] = useState('');
  const [targetGroups, setTargetGroups] = useState({
    parents: true,
    therapists: true,
    all: true,
  });
  const [scheduledTime, setScheduledTime] = useState('');
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    loadNotifications();
  }, []);
  
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
  const handleSendNotification = async () => {
    if (!notificationTitle.trim() || !notificationMessage.trim()) {
      Alert.alert('Error', 'Please enter both title and message');
      return;
    }

    // Check if at least one group is selected
    if (!targetGroups.parents && !targetGroups.therapists && !targetGroups.all) {
      Alert.alert('Error', 'Please select at least one recipient group');
      return;
    }

    try {
      // Prepare notification data for backend
      const notificationData = {
        title: notificationTitle,
        message: notificationMessage,
        recipientType: targetGroups.all ? 'all' : (targetGroups.parents && targetGroups.therapists ? 'both' : targetGroups.parents ? 'parents' : 'therapists'),
        scheduledTime: scheduledTime || null,
        isBroadcast: true
      };
      
      const response = await notificationAPI.createNotification(notificationData);
      if (response.success) {
        // Reload notifications to get the new one
        loadNotifications();
        Alert.alert('Success', 'Notification sent successfully!');
        
        // Reset form
        setNotificationTitle('');
        setNotificationMessage('');
        setTargetGroups({
          parents: true,
          therapists: true,
          all: true,
        });
        setScheduledTime('');
      } else {
        throw new Error(response.message || 'Failed to send notification');
      }
    } catch (error) {
      console.error('Error sending notification:', error);
      Alert.alert('Error', error.message || 'Failed to send notification');
    }
  };

  const toggleGroup = (group) => {
    setTargetGroups({
      ...targetGroups,
      [group]: !targetGroups[group],
    });
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Broadcast Notifications</Text>
      
      {/* Create Notification */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Create New Notification</Text>
        <View style={styles.formContainer}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Title</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Enter notification title"
              value={notificationTitle}
              onChangeText={setNotificationTitle}
            />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Message</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              placeholder="Enter notification message..."
              value={notificationMessage}
              onChangeText={setNotificationMessage}
              multiline
              numberOfLines={5}
            />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Recipients</Text>
            <View style={styles.recipientsContainer}>
              <View style={styles.recipientRow}>
                <Text style={styles.recipientText}>All Users</Text>
                <Switch
                  value={targetGroups.all}
                  onValueChange={() => toggleGroup('all')}
                  trackColor={{ false: '#ccc', true: '#007AFF' }}
                />
              </View>
              
              <View style={styles.recipientRow}>
                <Text style={styles.recipientText}>Parents</Text>
                <Switch
                  value={targetGroups.parents}
                  onValueChange={() => toggleGroup('parents')}
                  trackColor={{ false: '#ccc', true: '#34C759' }}
                />
              </View>
              
              <View style={styles.recipientRow}>
                <Text style={styles.recipientText}>Therapists</Text>
                <Switch
                  value={targetGroups.therapists}
                  onValueChange={() => toggleGroup('therapists')}
                  trackColor={{ false: '#ccc', true: '#FF9500' }}
                />
              </View>
            </View>
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Schedule (Optional)</Text>
            <TextInput
              style={styles.textInput}
              placeholder="YYYY-MM-DD HH:MM (leave blank for immediate)"
              value={scheduledTime}
              onChangeText={setScheduledTime}
            />
          </View>
          
          <TouchableOpacity style={styles.sendButton} onPress={handleSendNotification}>
            <Ionicons name="send" size={20} color="#fff" />
            <Text style={styles.sendButtonText}>Send Notification</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Notification History */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notification History ({notifications.length})</Text>
        <View style={styles.notificationsList}>
          {notifications.map((notification) => (
            <View key={notification.id} style={styles.notificationCard}>
              <View style={styles.notificationHeader}>
                <Text style={styles.notificationTitle}>{notification.title}</Text>
                <View style={styles.notificationStatus}>
                  <Ionicons name="notifications" size={16} color="#34C759" />
                  <Text style={styles.statusText}>Sent</Text>
                </View>
              </View>
              
              <Text style={styles.notificationMessage}>{notification.message}</Text>
              
              <View style={styles.notificationDetails}>
                <View style={styles.detailRow}>
                  <Ionicons name="people" size={16} color="#8E8E93" />
                  <Text style={styles.detailText}>{notification.recipients}</Text>
                </View>
                
                <View style={styles.detailRow}>
                  <Ionicons name="calendar" size={16} color="#8E8E93" />
                  <Text style={styles.detailText}>{notification.date} at {notification.time}</Text>
                </View>
              </View>
            </View>
          ))}
          
          {notifications.length === 0 && (
            <View style={styles.emptyState}>
              <Ionicons name="notifications-outline" size={40} color="#8E8E93" />
              <Text style={styles.emptyStateText}>No notifications sent</Text>
              <Text style={styles.emptyStateSubtext}>Create and send a notification to get started</Text>
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
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  formContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
    color: '#333',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  recipientsContainer: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 12,
  },
  recipientRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  recipientRowLast: {
    borderBottomWidth: 0,
  },
  recipientText: {
    fontSize: 16,
    color: '#333',
  },
  sendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  notificationsList: {
    gap: 12,
  },
  notificationCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    marginRight: 8,
  },
  notificationStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e8f5e9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
    color: '#333',
  },
  notificationMessage: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 12,
  },
  notificationDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
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

export default BroadcastNotificationsScreen;