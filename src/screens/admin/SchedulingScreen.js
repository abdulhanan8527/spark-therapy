import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { scheduleAPI, childAPI, authAPI, sessionAPI, therapistAPI } from '../../services/api';

const SchedulingScreen = () => {
  const { user } = useAuth();
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [childrenList, setChildrenList] = useState([]);
  const [therapistsList, setTherapistsList] = useState([]);
  const [sessions, setSessions] = useState([]);

  const [newSession, setNewSession] = useState({
    childId: '',
    therapistId: '',
    date: '',
    time: '',
    duration: '60',
  });

  useEffect(() => {
    const checkAuthAndFetch = async () => {
      // Check if user is loaded and is admin before fetching data
      if (!user) {
        // User not loaded yet, wait for authentication
        return;
      }
      if (user?.role !== 'admin') {
        Alert.alert('Access Denied', 'You must be logged in as an admin to access this screen.');
        return;
      }
      fetchInitialData();
    };
    
    checkAuthAndFetch();
  }, [user]);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      
      // Fetch data with individual error handling
      const childrenPromise = childAPI.getChildren().catch(err => {
        console.error('Error fetching children:', err?.message || err);
        // Check if it's an authentication issue
        if (err?.message?.includes('401') || err?.message?.includes('403')) {
          Alert.alert('Authentication Error', 'Access denied. Please ensure you are logged in as an admin user.');
        } else {
          console.warn('Failed to load children:', err?.message || 'Unknown error');
          // Show a more specific error message for server errors
          if (err?.message?.includes('500') || err?.message?.includes('Server error')) {
            console.warn('Server error when loading children. Please check if the backend server is running and accessible.');
          }
        }
        return { success: false, data: [] };
      });
      
      console.log('Children promise created');
      
      const therapistsPromise = therapistAPI.getAllTherapists().catch(err => {
        console.error('Error fetching therapists:', err?.message || err);
        // Check if it's an authentication issue
        if (err?.message?.includes('401') || err?.message?.includes('403')) {
          Alert.alert('Authentication Error', 'Access denied. Please ensure you are logged in as an admin user.');
        } else {
          console.warn('Failed to load therapists:', err?.message || 'Unknown error');
          // The error message from the API service should now be more descriptive
        }
        return { success: false, data: [] };
      });
      
      console.log('Therapists promise created');
      
      const sessionsPromise = sessionAPI.getSessions().catch(err => {
        console.error('Error fetching sessions:', err?.message || err);
        // Check if it's an authentication issue
        if (err?.message?.includes('401') || err?.message?.includes('403')) {
          console.warn('Authentication issue when loading sessions');
        } else {
          console.warn('Failed to load sessions:', err?.message || 'Unknown error');
          // The error message from the API service should now be more descriptive
        }
        return { success: false, data: [] };
      });
      
      console.log('Waiting for all promises to resolve...');
      const [childrenRes, therapistsRes, sessionsRes] = await Promise.all([
        childrenPromise,
        therapistsPromise,
        sessionsPromise
      ]);
      console.log('All promises resolved:', { childrenRes, therapistsRes, sessionsRes });

      // Safely set data ensuring arrays are used
      console.log('Processing children result:', childrenRes);
      if (childrenRes.success) {
        const childrenData = Array.isArray(childrenRes.data) ? childrenRes.data : [];
        console.log('Setting children list:', childrenData);
        setChildrenList(childrenData);
      } else {
        console.log('Children fetch failed, setting empty array');
        setChildrenList([]);
      }
      
      console.log('Processing therapists result:', therapistsRes);
      if (therapistsRes.success) {
        // Handle different response structures for therapists
        let therapistList = [];
        if (Array.isArray(therapistsRes.data)) {
          therapistList = therapistsRes.data;
        } else if (therapistsRes.data?.therapists && Array.isArray(therapistsRes.data.therapists)) {
          therapistList = therapistsRes.data.therapists;
        } else if (therapistsRes.data?.data && Array.isArray(therapistsRes.data.data)) {
          therapistList = therapistsRes.data.data;
        } else if (therapistsRes.data && typeof therapistsRes.data === 'object') {
          therapistList = [therapistsRes.data];
        }
        console.log('Setting therapists list:', therapistList);
        setTherapistsList(Array.isArray(therapistList) ? therapistList : []);
      } else {
        console.log('Therapists fetch failed, setting empty array');
        setTherapistsList([]);
      }
      
      console.log('Processing sessions result:', sessionsRes);
      if (sessionsRes.success) {
        const sessionsData = Array.isArray(sessionsRes.data) ? sessionsRes.data : [];
        console.log('Setting sessions:', sessionsData);
        setSessions(sessionsData);
      } else {
        console.log('Sessions fetch failed, setting empty array');
        setSessions([]);
      }
      
    } catch (error) {
      console.error('Unexpected error fetching scheduling data:', error);
      Alert.alert('Error', 'An unexpected error occurred while loading data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const durations = [
    { value: '30', label: '30 minutes' },
    { value: '45', label: '45 minutes' },
    { value: '60', label: '60 minutes' },
    { value: '90', label: '90 minutes' },
  ];

  const handleAddSession = async () => {
    const { childId, therapistId, date, time, duration } = newSession;
    
    console.log('Scheduling session with data:', newSession);
    
    // Validate required fields
    if (!childId?.trim()) {
      Alert.alert('Error', 'Please select a child');
      return;
    }
    if (!therapistId?.trim()) {
      Alert.alert('Error', 'Please select a therapist');
      return;
    }
    if (!date?.trim()) {
      Alert.alert('Error', 'Please enter a date');
      return;
    }
    if (!time?.trim()) {
      Alert.alert('Error', 'Please enter a time');
      return;
    }
    
    // Validate date format (YYYY-MM-DD)
    if (!isValidDate(date)) {
      Alert.alert('Error', 'Please enter a valid date (YYYY-MM-DD)');
      return;
    }
    
    // Validate time format (HH:MM)
    if (!isValidTime(time)) {
      Alert.alert('Error', 'Please enter a valid time (HH:MM in 24-hour format)');
      return;
    }
    
    // Validate duration is a valid number
    const durationNum = parseInt(duration);
    if (isNaN(durationNum) || durationNum <= 0) {
      Alert.alert('Error', 'Please enter a valid duration');
      return;
    }
    
    // Validate duration is within acceptable range
    if (durationNum < 15 || durationNum > 240) { // 15 min to 4 hours
      Alert.alert('Error', 'Duration must be between 15 minutes and 240 minutes (4 hours)');
      return;
    }
    
    // Validate that date is not in the past
    const now = new Date();
    const sessionDate = new Date(`${date}T${time}:00`);
    if (sessionDate < now) {
      Alert.alert('Error', 'Cannot schedule a session in the past');
      return;
    }

    try {
      setSubmitting(true);
      // Format startTime and endTime
      const start = new Date(`${date}T${time}:00`);
      const end = new Date(start.getTime() + durationNum * 60000);

      const sessionData = {
        childId,
        therapistId,
        parentId: childrenList.find(c => c._id === childId)?.parentId,
        startTime: start.toISOString(),
        endTime: end.toISOString(),
        duration: durationNum,
        status: 'scheduled'
      };
      
      console.log('Creating session with data:', sessionData);
      
      const res = await sessionAPI.createSession(sessionData);
      
      console.log('Session creation response:', res);

      if (res.success) {
        console.log('Session created successfully:', res.data);
        Alert.alert('Success', 'Session scheduled successfully!');
        setNewSession({ childId: '', therapistId: '', date: '', time: '', duration: '60' });
        setShowAddForm(false);
        console.log('Refreshing session data...');
        
        // Immediate UI update with the new session
        if (res.data) {
          setSessions(prevSessions => [...prevSessions, res.data]);
        }
        
        // Aggressive refresh strategy to ensure backend sync
        setTimeout(async () => {
          console.log('First refresh attempt...');
          await fetchInitialData();
          console.log('First refresh complete');
          
          // Second refresh after a delay to ensure backend processing
          setTimeout(async () => {
            console.log('Second refresh attempt...');
            await fetchInitialData();
            console.log('Second refresh complete');
            forceRefresh(); // Force component re-render
          }, 1000);
        }, 500);
        
      } else {
        console.error('Session API returned failure:', res);
        Alert.alert('Error', res.message || 'Failed to schedule session');
      }
    } catch (error) {
      console.error('Error scheduling session - Full error:', error);
      console.error('Error details:', {
        message: error?.message,
        response: error?.response,
        request: error?.request,
        config: error?.config
      });
      Alert.alert('Error', error.message || 'Failed to schedule session');
    } finally {
      setSubmitting(false);
    }
  };
  
  const isValidDate = (dateString) => {
    // Check if date is in YYYY-MM-DD format
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(dateString)) {
      return false;
    }
    
    // Check if it's a valid date
    const date = new Date(dateString);
    const timestamp = date.getTime();
    
    if (typeof timestamp !== 'number' || Number.isNaN(timestamp)) {
      return false;
    }
    
    // Check if the date string matches the input (to avoid invalid dates like 2023-02-30)
    return date.toISOString().slice(0, 10) === dateString;
  };
  
  const isValidTime = (timeString) => {
    // Check if time is in HH:MM format
    const regex = /^\d{2}:\d{2}$/;
    if (!regex.test(timeString)) {
      return false;
    }
    
    // Split the time string
    const [hours, minutes] = timeString.split(':').map(Number);
    
    // Validate hours and minutes
    if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
      return false;
    }
    
    return true;
  };

  const handleDeleteSession = (sessionId) => {
    Alert.alert(
      'Delete Session',
      'Are you sure you want to delete this session?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              // Optimistically update UI to improve UX
              setSessions(sessions.filter(s => s._id !== sessionId));
              
              const res = await sessionAPI.deleteSession(sessionId);
              
              // Success message only if API call succeeded
              if (res.success) {
                Alert.alert('Success', 'Session deleted successfully!');
              }
            } catch (error) {
              console.error('Error deleting session:', error?.message || error);
              
              // If API call failed, restore the session in the UI
              const sessionToDelete = sessions.find(s => s._id === sessionId);
              if (sessionToDelete) {
                setSessions(prevSessions => [...prevSessions, sessionToDelete]);
              }
              
              // Check if it's a server error (500) or authentication error (401/403)
              if (error?.message?.includes('Server error') || error?.message?.includes('500')) {
                Alert.alert('Server Error', 'Unable to delete session. The server is experiencing issues. Please ensure the backend server is running and has been restarted after any recent changes. If the issue continues, please contact support.');
              } else if (error?.message?.includes('401') || error?.message?.includes('403')) {
                Alert.alert('Authentication Error', 'Access denied. Please ensure you are logged in as an admin user.');
              } else {
                Alert.alert('Error', error?.message || 'Failed to delete session');
              }
            }
          }
        }
      ]
    );
  };

  const getStatusIcon = (status) => {
    return <Ionicons name="checkmark-circle" size={16} color="#34C759" />;
  };

  const getStatusText = (status) => {
    if (!status) return 'Scheduled';
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  // Force refresh mechanism
  const [refreshKey, setRefreshKey] = useState(0);
  
  const forceRefresh = () => {
    console.log('Force refreshing component...');
    setRefreshKey(prev => prev + 1);
    fetchInitialData();
  };
  
  // Group sessions by date
  console.log('Processing sessions data:', sessions);
  const groupedSessions = sessions.reduce((groups, session) => {
    try {
      const date = new Date(session.startTime).toISOString().split('T')[0];
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(session);
    } catch (error) {
      console.error('Error processing session:', session, error);
    }
    return groups;
  }, {});
  console.log('Grouped sessions:', groupedSessions);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} key={`schedule-${refreshKey}`}>
      <Text style={styles.header}>Session Scheduling</Text>

      {/* Add Session Button */}
      <View style={styles.section}>
        <View style={{flexDirection: 'row', gap: 10}}>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setShowAddForm(!showAddForm)}
          >
            <Ionicons name="add" width={20} height={20} color="#fff" />
            <Text style={styles.addButtonText}>
              {showAddForm ? 'Cancel' : 'Add Session'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.addButton, {backgroundColor: '#34C759'}]}
            onPress={forceRefresh}
          >
            <Ionicons name="refresh" width={20} height={20} color="#fff" />
            <Text style={styles.addButtonText}>Refresh</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Add Session Form */}
      {showAddForm && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Schedule New Session</Text>
          <View style={styles.formContainer}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Child</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={newSession.childId}
                  style={styles.picker}
                  onValueChange={(itemValue) => setNewSession({ ...newSession, childId: itemValue })}
                >
                  <Picker.Item label="Select child" value="" />
                  {(childrenList || []).map((child) => (
                    <Picker.Item key={child._id} label={`${child.firstName} ${child.lastName}`} value={child._id} />
                  ))}
                </Picker>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Therapist</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={newSession.therapistId}
                  style={styles.picker}
                  onValueChange={(itemValue) => setNewSession({ ...newSession, therapistId: itemValue })}
                >
                  <Picker.Item label="Select therapist" value="" />
                  {(therapistsList || []).map((therapist) => (
                    <Picker.Item key={therapist._id} label={therapist.name} value={therapist._id} />
                  ))}
                </Picker>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Date</Text>
              <TextInput
                style={styles.textInput}
                placeholder="YYYY-MM-DD"
                value={newSession.date}
                onChangeText={(text) => setNewSession({ ...newSession, date: text })}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Time</Text>
              <TextInput
                style={styles.textInput}
                placeholder="HH:MM (24-hour format)"
                value={newSession.time}
                onChangeText={(text) => setNewSession({ ...newSession, time: text })}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Duration</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={newSession.duration}
                  style={styles.picker}
                  onValueChange={(itemValue) => setNewSession({ ...newSession, duration: itemValue })}
                >
                  {durations.map((duration) => (
                    <Picker.Item key={duration.value} label={duration.label} value={duration.value} />
                  ))}
                </Picker>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.submitButton, submitting && styles.buttonDisabled]}
              onPress={handleAddSession}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Ionicons name="calendar" width={20} height={20} color="#fff" />
                  <Text style={styles.submitButtonText}>Schedule Session</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Scheduled Sessions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Scheduled Sessions</Text>
        <View style={styles.sessionsList}>
          {Object.keys(groupedSessions).sort().map((date) => (
            <View key={date} style={styles.dateGroup}>
              <Text style={styles.dateHeader}>{new Date(date).toDateString()}</Text>
              {groupedSessions[date].map((session) => (
                <View key={session._id} style={styles.sessionCard}>
                  <View style={styles.sessionHeader}>
                    <View style={styles.sessionInfo}>
                      <Text style={styles.sessionChild}>
                        {typeof session.childId === 'object' && session.childId?.firstName 
                          ? `${session.childId.firstName} ${session.childId.lastName || ''}`
                          : typeof session.childId === 'string' 
                            ? `Child ID: ${session.childId.substring(0, 8)}...`
                            : 'Unknown Child'}
                      </Text>
                      <Text style={styles.sessionTherapist}>
                        {typeof session.therapistId === 'object' && session.therapistId?.name 
                          ? session.therapistId.name
                          : typeof session.therapistId === 'string' 
                            ? `Therapist ID: ${session.therapistId.substring(0, 8)}...`
                            : 'Unknown Therapist'}
                      </Text>
                    </View>

                    <View style={[styles.statusBadge, styles.scheduledStatus]}>
                      {getStatusIcon(session.status)}
                      <Text style={styles.statusText}>{getStatusText(session.status)}</Text>
                    </View>
                  </View>

                  <View style={styles.sessionDetails}>
                    <View style={styles.detailRow}>
                      <Ionicons name="time" size={16} color="#8E8E93" />
                      <Text style={styles.detailText}>
                        {new Date(session.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {session.duration} min
                      </Text>
                    </View>

                    <View style={styles.detailRow}>
                      <Ionicons name="person" size={16} color="#8E8E93" />
                      <Text style={styles.detailText}>{session.therapistId?.name || 'Therapist Name'}</Text>
                    </View>
                  </View>

                  <View style={styles.actionButtons}>
                    <TouchableOpacity
                      style={[styles.actionButton, styles.deleteButton]}
                      onPress={() => handleDeleteSession(session._id)}
                    >
                      <Ionicons name="trash" size={16} color="#FF3B30" />
                      <Text style={styles.actionText}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          ))}

          {sessions.length === 0 && (
            <View style={styles.emptyState}>
              <Ionicons name="calendar" size={40} color="#8E8E93" />
              <Text style={styles.emptyStateText}>No sessions scheduled</Text>
              <Text style={styles.emptyStateSubtext}>Click "Add Session" to schedule a new session</Text>
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
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    borderRadius: 12,
    padding: 16,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
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
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  picker: {
    height: 50,
    width: '100%',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#34C759',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  sessionsList: {
    gap: 24,
  },
  dateGroup: {
    gap: 12,
  },
  dateHeader: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  sessionCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  sessionInfo: {
    flex: 1,
  },
  sessionChild: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  sessionTherapist: {
    fontSize: 14,
    color: '#666',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  scheduledStatus: {
    backgroundColor: '#e8f5e9',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
    color: '#333',
  },
  sessionDetails: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailRowLast: {
    marginBottom: 0,
  },
  detailText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    padding: 10,
  },
  deleteButton: {
    backgroundColor: '#fff0f0',
  },
  actionText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
    marginLeft: 4,
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

export default SchedulingScreen;