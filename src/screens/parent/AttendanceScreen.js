import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Calendar, CheckCircle, XCircle } from '../../components/SimpleIcons';
import { useAuth } from '../../contexts/AuthContext';
import { sessionAPI, childAPI } from '../../services/api';

const AttendanceScreen = () => {
  const { user } = useAuth();
  const [selectedChild, setSelectedChild] = useState(null);
  const [children, setChildren] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchChildren();
  }, []);

  useEffect(() => {
    if (selectedChild) {
      fetchSessions(selectedChild._id);
    }
  }, [selectedChild]);

  const fetchChildren = async () => {
    try {
      setLoading(true);
      const res = await childAPI.getChildren();
      if (res.success) {
        setChildren(res.data);
        if (res.data.length > 0) {
          setSelectedChild(res.data[0]);
        } else {
          // If no children found, show a message
          Alert.alert('No Children Found', 'You do not have any children associated with your account. Please contact your administrator.');
        }
      } else {
        console.error('Failed to fetch children:', res.message);
        Alert.alert('Error', 'Failed to load children data: ' + (res.message || 'Unknown error'));
        setChildren([]);
      }
    } catch (error) {
      console.error('Error fetching children:', error);
      Alert.alert('Error', 'Failed to fetch children data: ' + (error.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const fetchSessions = async (childId) => {
    try {
      setLoading(true);
      // Only fetch sessions for the selected child and parent
      const res = await sessionAPI.getSessions({ childId, parentId: user.id });
      if (res.success) {
        // Ensure sessions is always an array
        const sessionsData = res.data || [];
        // Make sure sessionsData is an array and filter for completed/past sessions
        const sessionsArray = Array.isArray(sessionsData) ? sessionsData : [];
        // Filter to show only past sessions (before today) for attendance tracking
        const pastSessions = sessionsArray.filter(session => 
          new Date(session.startTime) < new Date()
        );
        setSessions(pastSessions);
      } else {
        console.error('Failed to fetch sessions:', res.message);
        setSessions([]);
      }
    } catch (error) {
      console.error('Error fetching sessions:', error);
      Alert.alert('Error', 'Failed to fetch attendance records: ' + (error.message || 'Unknown error'));
      setSessions([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    // Map session status to attendance status
    const attendanceStatus = getAttendanceStatus(status);
    switch (attendanceStatus) {
      case 'present':
        return <CheckCircle size={20} color="#34C759" />;
      case 'absent':
        return <XCircle size={20} color="#FF3B30" />;
      case 'no-show':
        return <XCircle size={20} color="#FF3B30" />;
      case 'scheduled':
        return <Calendar size={20} color="#8E8E93" />;
      default:
        return <Calendar size={20} color="#8E8E93" />;
    }
  };

  const getStatusText = (status) => {
    // Map session status to attendance display text
    const attendanceStatus = getAttendanceStatus(status);
    switch (attendanceStatus) {
      case 'present':
        return 'Present';
      case 'absent':
        return 'Absent';
      case 'no-show':
        return 'No Show';
      case 'scheduled':
        return 'Scheduled';
      default:
        return status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Scheduled';
    }
  };

  const getStatusStyle = (status) => {
    // Map session status to attendance status for styling
    const attendanceStatus = getAttendanceStatus(status);
    switch (attendanceStatus) {
      case 'present':
        return styles.presentBox;
      case 'absent':
        return styles.absentBox;
      case 'no-show':
        return styles.absentBox;
      case 'scheduled':
        return styles.scheduledBox;
      default:
        return styles.noRecordBox;
    }
  };

  const getAttendanceStatus = (sessionStatus) => {
    if (!sessionStatus) {
      return 'scheduled';
    }
    switch (sessionStatus.toLowerCase()) {
      case 'completed':
        return 'present';
      case 'no-show':
        return 'no-show';
      case 'cancelled':
        return 'absent';
      case 'attended':
        return 'present';
      case 'absent':
        return 'absent';
      case 'scheduled':
        return 'scheduled';
      default:
        return 'scheduled';
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Attendance Tracking</Text>

      {/* Child Selection */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Select Child</Text>
        <View style={styles.childSelector}>
          {children.map((child) => (
            <TouchableOpacity
              key={child._id}
              style={[
                styles.childButton,
                selectedChild?._id === child._id && styles.selectedChildButton
              ]}
              onPress={() => setSelectedChild(child)}
            >
              <Text style={[
                styles.childButtonText,
                selectedChild?._id === child._id && styles.selectedChildButtonText
              ]}>
                {child.firstName}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Attendance Summary */}
      {selectedChild && Array.isArray(sessions) && sessions.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Attendance Summary</Text>
          <View style={styles.summaryContainer}>
            <View style={styles.summaryBox}>
              <Text style={styles.summaryValue}>
                {(() => {
                  const attended = Array.isArray(sessions) ? 
                    sessions.filter(s => getAttendanceStatus(s.status) === 'present').length : 0;
                  return attended;
                })()}
              </Text>
              <Text style={styles.summaryLabel}>Sessions Attended</Text>
            </View>
            <View style={styles.summaryBox}>
              <Text style={styles.summaryValue}>
                {(() => {
                  const missed = Array.isArray(sessions) ? 
                    sessions.filter(s => getAttendanceStatus(s.status) === 'no-show' || getAttendanceStatus(s.status) === 'absent').length : 0;
                  return missed;
                })()}
              </Text>
              <Text style={styles.summaryLabel}>Sessions Missed</Text>
            </View>
            <View style={styles.summaryBox}>
              <Text style={styles.summaryValue}>
                {(() => {
                  if (Array.isArray(sessions) && sessions.length > 0) {
                    const attended = sessions.filter(s => getAttendanceStatus(s.status) === 'present').length;
                    const rate = Math.round((attended / sessions.length) * 100);
                    return `${rate}%`;
                  }
                  return '0%';
                })()}
              </Text>
              <Text style={styles.summaryLabel}>Attendance Rate</Text>
            </View>
          </View>
        </View>
      )}

      {/* Session History */}
      {selectedChild && Array.isArray(sessions) && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Session History</Text>
          <View style={styles.historyContainer}>
            {Array.isArray(sessions) && sessions.length > 0 ? (
              sessions.map((session, index) => (
                <View key={session._id || index} style={styles.historyRow}>
                  <View style={styles.dateInfo}>
                    <Text style={styles.dateText}>{new Date(session.startTime).toLocaleDateString()}</Text>
                    <Text style={styles.timeText}>{new Date(session.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - {new Date(session.endTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</Text>
                  </View>
                  <View style={[styles.statusBadge, getStatusStyle(session.status)]}>
                    {getStatusIcon(session.status)}
                    <Text style={styles.statusBadgeText}>{getStatusText(session.status)}</Text>
                  </View>
                </View>
              ))
            ) : (
              <View style={styles.emptyHistory}>
                <Text style={styles.emptyText}>No session records found for this child.</Text>
              </View>
            )}

          </View>
        </View>
      )}

      {/* Legend */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Legend</Text>
        <View style={styles.legendContainer}>
          <View style={styles.legendItem}>
            <CheckCircle size={18} color="#34C759" />
            <Text style={styles.legendText}>Attended</Text>
          </View>
          <View style={styles.legendItem}>
            <XCircle size={18} color="#FF3B30" />
            <Text style={styles.legendText}>No Show</Text>
          </View>
          <View style={styles.legendItem}>
            <Calendar size={18} color="#8E8E93" />
            <Text style={styles.legendText}>Scheduled</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 24,
    color: '#1a1a1a',
  },
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 14,
    color: '#333',
  },
  childSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  childButton: {
    backgroundColor: '#e9ecef',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 22,
  },
  selectedChildButton: {
    backgroundColor: '#007AFF',
  },
  childButtonText: {
    color: '#495057',
    fontWeight: '600',
  },
  selectedChildButtonText: {
    color: '#fff',
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  summaryBox: {
    alignItems: 'center',
    flex: 1,
  },
  summaryValue: {
    fontSize: 26,
    fontWeight: '800',
    color: '#007AFF',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#6c757d',
    marginTop: 6,
    fontWeight: '600',
  },
  historyContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  historyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f3f5',
  },
  dateInfo: {
    flex: 1,
  },
  dateText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#212529',
  },
  timeText: {
    fontSize: 13,
    color: '#6c757d',
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    minWidth: 90,
    justifyContent: 'center',
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 6,
  },
  presentBox: {
    backgroundColor: '#d1e7dd',
  },
  absentBox: {
    backgroundColor: '#f8d7da',
  },
  weekendBox: {
    backgroundColor: '#e9ecef',
  },
  scheduledBox: {
    backgroundColor: '#e9ecef',
  },
  noRecordBox: {
    backgroundColor: '#f8f9fa',
  },
  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    elevation: 1,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendText: {
    fontSize: 13,
    color: '#495057',
    fontWeight: '500',
  },
  emptyHistory: {
    padding: 30,
    alignItems: 'center',
  },
  emptyText: {
    color: '#adb5bd',
    textAlign: 'center',
  },
});

export default AttendanceScreen;