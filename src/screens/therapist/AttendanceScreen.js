import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Calendar, Clock, User, CheckCircle, XCircle } from '../../components/SimpleIcons';
import { useAuth } from '../../contexts/AuthContext';
import { childAPI, sessionAPI } from '../../services/api';

const AttendanceScreen = () => {
  const { user } = useAuth();
  const [children, setChildren] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedChild, setSelectedChild] = useState(null);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [childrenRes, sessionsRes] = await Promise.all([
        childAPI.getChildren(),
        sessionAPI.getSessions({
          startDate: new Date().toISOString().split('T')[0]
        })
      ]);

      if (childrenRes.success) setChildren(childrenRes.data);
      if (sessionsRes.success) {
        setSessions(sessionsRes.data.map(s => ({ ...s, status: s.status || 'scheduled' })));
      }
    } catch (error) {
      console.error('Attendance fetch error:', error);
      Alert.alert('Error', 'Failed to load attendance data');
    } finally {
      setLoading(false);
    }
  };

  const markAttendance = async (sessionId, status) => {
    try {
      const response = await sessionAPI.updateSession(sessionId, { status });
      if (response.success) {
        setSessions(sessions.map(s =>
          s._id === sessionId ? { ...s, status } : s
        ));
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update attendance');
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'present':
        return <CheckCircle size={16} color="#34C759" />;
      case 'absent':
        return <XCircle size={16} color="#FF3B30" />;
      default:
        return <Clock size={16} color="#8E8E93" />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'present': return 'Present';
      case 'absent': return 'Absent';
      case 'scheduled': return 'Scheduled';
      default: return status;
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'present': return styles.presentStatus;
      case 'absent': return styles.absentStatus;
      default: return styles.notMarkedStatus;
    }
  };

  const filteredHistory = selectedChild
    ? sessions.filter(s => s.childId?._id === selectedChild)
    : sessions;

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Attendance Tracking</Text>

      {/* Today's Attendance */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Today's Sessions - {new Date().toLocaleDateString()}</Text>
        <View style={styles.todayAttendanceContainer}>
          {sessions.filter(s => {
            const today = new Date().toISOString().split('T')[0];
            return s.startTime?.startsWith(today);
          }).map((session) => (
            <View key={session._id} style={styles.attendanceCard}>
              <View style={styles.childInfo}>
                <View style={styles.avatar}>
                  <User size={20} color="#fff" />
                </View>
                <View>
                  <Text style={styles.childName}>{session.childId?.firstName} {session.childId?.lastName}</Text>
                  <Text style={styles.sessionTime}>
                    {new Date(session.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </View>
              </View>

              <View style={styles.statusButtons}>
                <TouchableOpacity
                  style={[
                    styles.statusButton,
                    session.status === 'present' && styles.presentButton
                  ]}
                  onPress={() => markAttendance(session._id, 'present')}
                >
                  <CheckCircle size={20} color={session.status === 'present' ? '#fff' : '#34C759'} />
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.statusButton,
                    session.status === 'absent' && styles.absentButton
                  ]}
                  onPress={() => markAttendance(session._id, 'absent')}
                >
                  <XCircle size={20} color={session.status === 'absent' ? '#fff' : '#FF3B30'} />
                </TouchableOpacity>
              </View>
            </View>
          ))}

          {sessions.filter(s => s.startTime?.startsWith(new Date().toISOString().split('T')[0])).length === 0 && (
            <Text style={styles.emptyText}>No sessions scheduled for today</Text>
          )}
        </View>
      </View>

      {/* Child Selection for History */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Filter by Child</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.childSelector}>
          <TouchableOpacity
            style={[
              styles.childButton,
              !selectedChild && styles.selectedChildButton
            ]}
            onPress={() => setSelectedChild(null)}
          >
            <Text style={[
              styles.childButtonText,
              !selectedChild && styles.selectedChildButtonText
            ]}>
              All
            </Text>
          </TouchableOpacity>

          {children.map((child) => (
            <TouchableOpacity
              key={child._id}
              style={[
                styles.childButton,
                selectedChild === child._id && styles.selectedChildButton
              ]}
              onPress={() => setSelectedChild(child._id)}
            >
              <Text style={[
                styles.childButtonText,
                selectedChild === child._id && styles.selectedChildButtonText
              ]}>
                {child.firstName}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Attendance Records */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Session History</Text>
        <View style={styles.recordsList}>
          {filteredHistory.map((record) => (
            <View key={record._id} style={styles.recordCard}>
              <View style={styles.recordHeader}>
                <Text style={styles.recordChild}>{record.childId?.firstName} {record.childId?.lastName}</Text>
                <Text style={styles.recordDate}>{new Date(record.startTime).toLocaleDateString()}</Text>
              </View>

              <View style={styles.recordDetails}>
                <Text style={styles.recordTime}>
                  {new Date(record.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
                <View style={[styles.statusBadge, getStatusStyle(record.status)]}>
                  {getStatusIcon(record.status)}
                  <Text style={styles.statusText}>{getStatusText(record.status)}</Text>
                </View>
              </View>
            </View>
          ))}

          {filteredHistory.length === 0 && (
            <View style={styles.emptyState}>
              <Calendar size={40} color="#8E8E93" />
              <Text style={styles.emptyStateText}>No sessions found</Text>
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
    backgroundColor: '#F8F9FB',
    padding: 16,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
    paddingTop: 40,
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
  todayAttendanceContainer: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  attendanceCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  childInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  childName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  sessionTime: {
    fontSize: 14,
    color: '#666',
  },
  statusButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  statusButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
  },
  presentButton: {
    backgroundColor: '#34C759',
  },
  absentButton: {
    backgroundColor: '#FF3B30',
  },
  childSelector: {
    paddingRight: 16,
    gap: 8,
  },
  childButton: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#eee',
  },
  selectedChildButton: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  childButtonText: {
    color: '#666',
    fontWeight: '600',
  },
  selectedChildButtonText: {
    color: '#fff',
  },
  recordsList: {
    gap: 12,
  },
  recordCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  recordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  recordChild: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  recordDate: {
    fontSize: 14,
    color: '#666',
  },
  recordDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  recordTime: {
    fontSize: 14,
    color: '#666',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    gap: 5,
  },
  presentStatus: {
    backgroundColor: '#E8F5E9',
  },
  absentStatus: {
    backgroundColor: '#FFEBEE',
  },
  notMarkedStatus: {
    backgroundColor: '#F5F5F5',
  },
  statusText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    paddingVertical: 20,
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
    backgroundColor: '#fff',
    borderRadius: 20,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#999',
    marginTop: 10,
  },
});

export default AttendanceScreen;