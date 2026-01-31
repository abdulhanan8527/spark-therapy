import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { leaveAPI } from '../../services/api';

const LeaveRequestsScreen = () => {
  const { user } = useAuth();
  const [leaveType, setLeaveType] = useState('vacation');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchLeaveRequests();
  }, []);

  const fetchLeaveRequests = async () => {
    try {
      setLoading(true);
      const res = await leaveAPI.getLeaveRequestsByTherapistId(user._id);
      if (res.success) {
        // Ensure res.data is an array
        const leaveRequestsData = Array.isArray(res.data) ? res.data : [];
        setLeaveRequests(leaveRequestsData);
      } else {
        setLeaveRequests([]);
      }
    } catch (error) {
      console.error('Error fetching leave requests:', error);
      Alert.alert('Error', 'Failed to fetch leave requests history');
      setLeaveRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const leaveTypes = [
    { label: 'Vacation', value: 'vacation' },
    { label: 'Sick Leave', value: 'sick' },
    { label: 'Personal', value: 'personal' },
    { label: 'Maternity', value: 'maternity' },
    { label: 'Paternity', value: 'paternity' },
  ];

  const handleSubmit = async () => {
    if (!leaveType || !startDate || !endDate || !reason) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    // Validate date format (simple check)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(startDate) || !dateRegex.test(endDate)) {
      Alert.alert('Error', 'Please use YYYY-MM-DD format for dates');
      return;
    }

    if (new Date(startDate) >= new Date(endDate)) {
      Alert.alert('Error', 'End date must be after start date');
      return;
    }

    try {
      setSubmitting(true);
      const res = await leaveAPI.createLeaveRequest({
        leaveType,
        startDate,
        endDate,
        reason,
        status: 'pending'
      });

      if (res.success) {
        Alert.alert('Success', 'Leave request submitted successfully!');
        // Reset form
        setStartDate('');
        setEndDate('');
        setReason('');
        // Refresh list
        fetchLeaveRequests();
      }
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to submit leave request');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return <Ionicons name="checkmark-circle" size={16} color="#34C759" />;
      case 'pending':
        return <Ionicons name="time" size={16} color="#FF9500" />;
      case 'rejected':
        return <Ionicons name="alert-circle" size={16} color="#FF3B30" />;
      default:
        return <Ionicons name="time" size={16} color="#8E8E93" />;
    }
  };

  const getStatusText = (status) => {
    if (!status) return 'Unknown';
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const getStatusStyle = (status) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return styles.approvedStatus;
      case 'pending':
        return styles.pendingStatus;
      case 'rejected':
        return styles.rejectedStatus;
      default:
        return styles.pendingStatus;
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
      <Text style={styles.header}>Leave Requests</Text>

      {/* Submit Leave Request */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Submit New Request</Text>
        <View style={styles.formContainer}>
          {/* Leave Type */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Leave Type</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={leaveType}
                style={styles.picker}
                onValueChange={(itemValue) => setLeaveType(itemValue)}
              >
                {leaveTypes.map((type, index) => (
                  <Picker.Item key={index} label={type.label} value={type.value} />
                ))}
              </Picker>
            </View>
          </View>

          {/* Start Date */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Start Date</Text>
            <TextInput
              style={styles.textInput}
              placeholder="YYYY-MM-DD"
              value={startDate}
              onChangeText={setStartDate}
            />
          </View>

          {/* End Date */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>End Date</Text>
            <TextInput
              style={styles.textInput}
              placeholder="YYYY-MM-DD"
              value={endDate}
              onChangeText={setEndDate}
            />
          </View>

          {/* Reason */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Reason</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              placeholder="Please provide details for your leave request..."
              value={reason}
              onChangeText={setReason}
              multiline
              numberOfLines={4}
            />
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.submitButton, submitting && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="send" size={20} color="#fff" />
                <Text style={styles.submitButtonText}>Submit Request</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Leave Requests History */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Request History</Text>
        <View style={styles.requestsList}>
          {(Array.isArray(leaveRequests) ? leaveRequests : []).map((request) => (
            <View key={request._id} style={styles.requestCard}>
              <View style={styles.requestHeader}>
                <View style={styles.requestInfo}>
                  <Text style={styles.requestType}>{getStatusText(request.leaveType)}</Text>
                  <Text style={styles.requestDates}>
                    {new Date(request.startDate).toLocaleDateString()} to {new Date(request.endDate).toLocaleDateString()}
                  </Text>
                </View>
                <View style={[styles.statusBadge, getStatusStyle(request.status)]}>
                  {getStatusIcon(request.status)}
                  <Text style={styles.statusText}>{getStatusText(request.status)}</Text>
                </View>
              </View>

              <View style={styles.requestDetails}>
                <Text style={styles.reasonLabel}>Reason:</Text>
                <Text style={styles.reasonText}>{request.reason}</Text>
              </View>

              <View style={styles.requestFooter}>
                <Text style={styles.submittedDate}>
                  Submitted: {new Date(request.createdAt).toLocaleDateString()}
                </Text>
              </View>

              {request.status === 'rejected' && request.rejectionReason && (
                <View style={styles.rejectionContainer}>
                  <Text style={styles.rejectionLabel}>Rejection Reason:</Text>
                  <Text style={styles.rejectionText}>{request.rejectionReason}</Text>
                </View>
              )}
            </View>
          ))}

          {(Array.isArray(leaveRequests) ? leaveRequests : []).length === 0 && (
            <View style={styles.emptyState}>
              <Ionicons name="calendar" size={40} color="#8E8E93" />
              <Text style={styles.emptyStateText}>No leave requests yet</Text>
              <Text style={styles.emptyStateSubtext}>Submit a leave request to get started</Text>
            </View>
          )}
        </View>
      </View>

      {/* Instructions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Instructions</Text>
        <View style={styles.instructionsContainer}>
          <Text style={styles.instructionText}>
            1. Select the type of leave you're requesting
          </Text>
          <Text style={styles.instructionText}>
            2. Enter the start and end dates for your leave (YYYY-MM-DD)
          </Text>
          <Text style={styles.instructionText}>
            3. Provide a detailed reason for your request
          </Text>
          <Text style={styles.instructionText}>
            4. Submit your request for approval
          </Text>
          <Text style={styles.instructionText}>
            5. Check the status of your requests in the history section
          </Text>
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
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
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
  requestsList: {
    gap: 12,
  },
  requestCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  requestInfo: {
    flex: 1,
  },
  requestType: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  requestDates: {
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
  approvedStatus: {
    backgroundColor: '#e8f5e9',
  },
  pendingStatus: {
    backgroundColor: '#fff3e0',
  },
  rejectedStatus: {
    backgroundColor: '#ffebee',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
    color: '#333',
  },
  requestDetails: {
    marginBottom: 12,
  },
  reasonLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  reasonText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  requestFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  submittedDate: {
    fontSize: 12,
    color: '#8E8E93',
  },
  rejectionContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#ffebee',
    backgroundColor: '#fff9f9',
    borderRadius: 8,
    padding: 12,
  },
  rejectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF3B30',
    marginBottom: 4,
  },
  rejectionText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
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
  instructionsContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  instructionText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
    paddingLeft: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#007AFF',
  },
  instructionTextLast: {
    marginBottom: 0,
  },
});

export default LeaveRequestsScreen;