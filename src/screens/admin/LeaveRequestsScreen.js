import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Calendar, Clock, XCircle, User, Send, CheckCircle } from '../../components/SimpleIcons';
import { useAuth } from '../../contexts/AuthContext';
import { leaveAPI } from '../../services/api';

const LeaveRequestsScreen = () => {
  const { user } = useAuth();
  const [responseText, setResponseText] = useState('');
  const [selectedRequest, setSelectedRequest] = useState(null);
  // Ultimate safeguard: initialize with guaranteed array
  const [leaveRequests, setLeaveRequests] = useState(() => {
    // Immediately return empty array to ensure it's never undefined/null
    return [];
  });
  
  // Custom setter that ensures leaveRequests is always an array
  const setLeaveRequestsSafely = (newValue) => {
    // Ultimate safeguard: ensure newValue is always an array
    let safeValue = [];
    
    if (Array.isArray(newValue)) {
      safeValue = newValue;
    } else if (newValue && typeof newValue === 'object') {
      // Handle objects that might contain arrays
      if (Array.isArray(newValue.data)) {
        safeValue = newValue.data;
      } else if (Array.isArray(newValue.leaveRequests)) {
        safeValue = newValue.leaveRequests;
      } else if (newValue.success === true && Array.isArray(newValue.data)) {
        safeValue = newValue.data;
      }
    }
    
    setLeaveRequests(safeValue);
  };
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaveRequests();
  }, []);

  // Ultimate safeguard effect: validate leaveRequests state on every render
  useEffect(() => {
    // Immediate validation on component mount and any state change
    if (!Array.isArray(leaveRequests)) {
      console.error('CRITICAL: leaveRequests is not an array in LeaveRequestsScreen:', leaveRequests);
      // Force immediate correction
      setLeaveRequests([]);
    }
  });
  
  // Additional validation effect that runs only when leaveRequests changes
  useEffect(() => {
    if (!Array.isArray(leaveRequests)) {
      console.error('leaveRequests is not an array in LeaveRequestsScreen:', leaveRequests);
      // Force a safe state if somehow it's not an array
      setLeaveRequestsSafely([]);
    }
  }, [leaveRequests]);

  // Helper function to normalize API response to an array
  const normalizeApiResponse = (response) => {
    console.log('Normalizing API response:', response);
    
    // If it's already an array, return it
    if (Array.isArray(response)) {
      return response;
    }
    
    // If it's null or undefined, return empty array
    if (response === null || response === undefined) {
      console.warn('API response is null or undefined');
      return [];
    }
    
    // If it's an object with a data property that's an array (fixed backend format)
    if (typeof response === 'object' && Array.isArray(response.data)) {
      console.log('Found data array:', response.data);
      return response.data;
    }
    
    // If it's an object with nested data.leaveRequests
    if (typeof response === 'object' && response.data && Array.isArray(response.data.leaveRequests)) {
      console.log('Found nested leaveRequests:', response.data.leaveRequests);
      return response.data.leaveRequests;
    }
    
    // If it's an object with a leaveRequests property that's an array
    if (typeof response === 'object' && Array.isArray(response.leaveRequests)) {
      return response.leaveRequests;
    }
    
    // If it's an object with a data property that's an array
    if (typeof response === 'object' && Array.isArray(response.data)) {
      return response.data;
    }
    
    // If it's an object with a success property and data property that's an array
    if (typeof response === 'object' && response.success === true && Array.isArray(response.data)) {
      return response.data;
    }
    
    // If it's a Promise or other non-standard response
    if (typeof response === 'object' && response.then) {
      console.warn('API response is a Promise, not resolved properly');
      return [];
    }
    
    // Return empty array as ultimate fallback
    console.warn('Unexpected API response format:', response);
    return [];
  };
  
  const fetchLeaveRequests = async () => {
    try {
      setLoading(true);
      const response = await leaveAPI.getAllLeaveRequests();
      const normalizedData = normalizeApiResponse(response);
      setLeaveRequestsSafely(normalizedData);
    } catch (error) {
      console.error('Error fetching leave requests:', error);
      Alert.alert('Error', 'Failed to fetch leave requests');
      setLeaveRequestsSafely([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (requestId) => {
    try {
      console.log('Approving leave request:', requestId);
      
      // Update the request on the server
      const response = await leaveAPI.updateLeaveRequest(requestId, { status: 'approved' });
      
      if (response.success) {
        Alert.alert('Success', 'Leave request approved successfully');
        // Refresh the list
        fetchLeaveRequests();
      } else {
        Alert.alert('Error', response.message || 'Failed to approve leave request');
      }
    } catch (error) {
      console.error('Error approving leave request:', error);
      Alert.alert('Error', 'Failed to approve leave request');
    }
  };

  const handleReject = async (requestId) => {
    if (!responseText.trim()) {
      Alert.alert('Error', 'Please enter a reason for rejection');
      return;
    }

    try {
      console.log('Rejecting leave request:', requestId);
      
      // Update the request on the server
      const response = await leaveAPI.updateLeaveRequest(requestId, { 
        status: 'rejected', 
        rejectionReason: responseText 
      });
      
      if (response.success) {
        Alert.alert('Success', 'Leave request rejected successfully');
        setResponseText('');
        setSelectedRequest(null);
        // Refresh the list
        fetchLeaveRequests();
      } else {
        Alert.alert('Error', response.message || 'Failed to reject leave request');
      }
    } catch (error) {
      console.error('Error rejecting leave request:', error);
      Alert.alert('Error', 'Failed to reject leave request');
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved':
        return <CheckCircle size={16} color="#34C759" />;
      case 'pending':
        return <Clock size={16} color="#FF9500" />;
      case 'rejected':
        return <XCircle size={16} color="#FF3B30" />;
      default:
        return <Clock size={16} color="#8E8E93" />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'approved':
        return 'Approved';
      case 'pending':
        return 'Pending';
      case 'rejected':
        return 'Rejected';
      default:
        return 'Unknown';
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
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
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading leave requests...</Text>
      </View>
    );
  }

  // ULTIMATE SAFEGUARD: Triple-protection array validation before rendering
  const safeLeaveRequests = (() => {
    // First level: Direct array check
    if (Array.isArray(leaveRequests)) {
      return leaveRequests;
    }
    
    // Second level: Object property extraction
    if (leaveRequests && typeof leaveRequests === 'object') {
      if (Array.isArray(leaveRequests.data)) {
        return leaveRequests.data;
      }
      if (Array.isArray(leaveRequests.leaveRequests)) {
        return leaveRequests.leaveRequests;
      }
      if (leaveRequests.success === true && Array.isArray(leaveRequests.data)) {
        return leaveRequests.data;
      }
    }
    
    // Third level: Ultimate fallback with error logging
    console.error('CRITICAL SAFEGUARD TRIGGERED: leaveRequests is not an array and cannot be normalized:', leaveRequests);
    console.error('Current leaveRequests type:', typeof leaveRequests);
    console.error('Current leaveRequests value:', leaveRequests);
    
    // Force immediate state correction
    setTimeout(() => {
      setLeaveRequests([]);
    }, 0);
    
    return [];
  })();

  // FINAL SAFEGUARD: Don't render if we can't guarantee an array
  if (!Array.isArray(safeLeaveRequests)) {
    console.error('FINAL SAFEGUARD: safeLeaveRequests is not an array:', safeLeaveRequests);
    // Show loading state instead of risking the error
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Initializing leave requests...</Text>
      </View>
    );
  }
  
  // ULTIMATE FINAL SAFEGUARD: Ensure we have a valid array for all operations
  const finalSafeLeaveRequests = Array.isArray(safeLeaveRequests) ? safeLeaveRequests : [];
  
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Leave Requests</Text>
      
      {/* Leave Requests List */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Pending Requests ({finalSafeLeaveRequests.filter(r => r.status === 'pending').length})</Text>
        <View style={styles.requestsList}>
          {finalSafeLeaveRequests.map((request) => (
            <View key={request._id} style={styles.requestCard}>
              <View style={styles.requestHeader}>
                <View style={styles.requestInfo}>
                  <View style={styles.avatar}>
                    <User size={24} color="#fff" />
                  </View>
                  <View>
                    <Text style={styles.therapistName}>
                      {request.therapistId?.name || 'Unknown Therapist'}
                    </Text>
                    <Text style={styles.requestType}>{request.leaveType || 'Unknown Type'}</Text>
                  </View>
                </View>
                
                <View style={[styles.statusBadge, getStatusStyle(request.status)]}>
                  {getStatusIcon(request.status)}
                  <Text style={styles.statusText}>{getStatusText(request.status)}</Text>
                </View>
              </View>
              
              <View style={styles.requestDetails}>
                <Text style={styles.detailText}>
                  Dates: {new Date(request.startDate).toLocaleDateString()} to {new Date(request.endDate).toLocaleDateString()}
                </Text>
                <Text style={styles.detailText}>
                  Submitted: {new Date(request.createdAt).toLocaleDateString()}
                </Text>
                <Text style={styles.reasonLabel}>Reason:</Text>
                <Text style={styles.reasonText}>{request.reason}</Text>
              </View>
              
              {request.status === 'pending' && (
                <View style={styles.actionButtons}>
                  <TouchableOpacity 
                    style={[styles.actionButton, styles.approveButton]} 
                    onPress={() => handleApprove(request._id)}
                  >
                    <CheckCircle size={16} color="#fff" />
                    <Text style={styles.actionText}>Approve</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[styles.actionButton, styles.rejectButton]} 
                    onPress={() => setSelectedRequest(selectedRequest === request._id ? null : request._id)}
                  >
                    <XCircle size={16} color="#fff" />
                    <Text style={styles.actionText}>Reject</Text>
                  </TouchableOpacity>
                </View>
              )}
              
              {selectedRequest === request._id && request.status === 'pending' && (
                <View style={styles.rejectionSection}>
                  <Text style={styles.rejectionLabel}>Reason for Rejection</Text>
                  <TextInput
                    style={[styles.textInput, styles.reasonInput]}
                    placeholder="Enter reason for rejection..."
                    value={responseText}
                    onChangeText={setResponseText}
                    multiline
                    numberOfLines={3}
                  />
                  <TouchableOpacity 
                    style={styles.sendRejectionButton}
                    onPress={() => handleReject(request._id)}
                  >
                    <Send size={16} color="#fff" />
                    <Text style={styles.sendRejectionText}>Send Rejection</Text>
                  </TouchableOpacity>
                </View>
              )}
              
              {request.status === 'rejected' && request.rejectionReason && (
                <View style={styles.rejectionContainer}>
                  <Text style={styles.rejectionLabel}>Rejection Reason:</Text>
                  <Text style={styles.rejectionText}>{request.rejectionReason}</Text>
                </View>
              )}
            </View>
          ))}
          
          {finalSafeLeaveRequests.length === 0 && (
            <View style={styles.emptyState}>
              <Calendar size={40} color="#8E8E93" />
              <Text style={styles.emptyStateText}>No leave requests</Text>
              <Text style={styles.emptyStateSubtext}>All leave requests have been processed</Text>
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
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  therapistName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  requestType: {
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
  detailText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  reasonLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginTop: 8,
    marginBottom: 4,
  },
  reasonText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    padding: 10,
  },
  approveButton: {
    backgroundColor: '#34C759',
  },
  rejectButton: {
    backgroundColor: '#FF3B30',
  },
  actionText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '500',
    marginLeft: 4,
  },
  rejectionSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  rejectionLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
    color: '#333',
  },
  reasonInput: {
    height: 80,
    textAlignVertical: 'top',
    marginBottom: 12,
  },
  sendRejectionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF3B30',
    borderRadius: 8,
    padding: 12,
  },
  sendRejectionText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
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
  rejectionText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
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
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
});

export default LeaveRequestsScreen;