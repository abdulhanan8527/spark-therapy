import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { complaintAPI } from '../../services/api';

const ComplaintsScreen = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [responseText, setResponseText] = useState('');
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const loadComplaints = async () => {
    try {
      setLoading(true);
      const response = await complaintAPI.getAllComplaints();
      if (response.success && Array.isArray(response.data)) {
        setComplaints(response.data);
      } else {
        setComplaints([]);
        console.error('Failed to load complaints:', response.message);
      }
    } catch (error) {
      console.error('Error loading complaints:', error);
      setComplaints([]);
      Alert.alert('Error', 'Failed to load complaints');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    loadComplaints();
  }, []);

  const handleRespond = async (complaintId) => {
    if (!responseText.trim()) {
      Alert.alert('Error', 'Please enter a response');
      return;
    }
    
    try {
      const response = await complaintAPI.updateComplaint(complaintId, {
        status: 'resolved',
        response: responseText
      });
      
      if (response.success) {
        // Update the local state to reflect the change
        setComplaints(complaints.map(complaint => 
          complaint._id === complaintId 
            ? { ...complaint, status: 'resolved', response: responseText }
            : complaint
        ));
        
        Alert.alert('Success', 'Response sent successfully!');
        setResponseText('');
        setSelectedComplaint(null);
      } else {
        Alert.alert('Error', response.message || 'Failed to update complaint');
      }
    } catch (error) {
      console.error('Error responding to complaint:', error);
      Alert.alert('Error', 'Failed to respond to complaint');
    }
  };


  const getStatusIcon = (status) => {
    switch (status) {
      case 'resolved':
        return <Ionicons name="checkmark-circle" size={16} color="#34C759" />;
      case 'under-review':
        return <Ionicons name="time" size={16} color="#FF9500" />;
      case 'pending':
        return <Ionicons name="alert-circle" size={16} color="#8E8E93" />;
      default:
        return <Ionicons name="time" size={16} color="#8E8E93" />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'resolved':
        return 'Resolved';
      case 'under-review':
        return 'Under Review';
      case 'pending':
        return 'Pending';
      default:
        return 'Unknown';
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'resolved':
        return styles.resolvedStatus;
      case 'under-review':
        return styles.underReviewStatus;
      case 'pending':
        return styles.pendingStatus;
      default:
        return styles.pendingStatus;
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

  const filteredComplaints = complaints.filter(complaint =>
    complaint.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    complaint.parentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    complaint.childName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    complaint.subject.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Complaints Management</Text>
      
      {/* Search */}
      <View style={styles.section}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#8E8E93" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search complaints..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Complaints List */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Complaints ({filteredComplaints.length})</Text>
        <View style={styles.complaintsList}>
          {filteredComplaints.map((complaint) => (
            <View key={complaint.id} style={styles.complaintCard}>
              <View style={styles.complaintHeader}>
                <View style={styles.complaintInfo}>
                  <Text style={styles.complaintId}>{complaint.id}</Text>
                  <Text style={styles.complaintSubject}>{complaint.subject}</Text>
                </View>
                
                <View style={[styles.statusBadge, getStatusStyle(complaint.status)]}>
                  {getStatusIcon(complaint.status)}
                  <Text style={styles.statusText}>{getStatusText(complaint.status)}</Text>
                </View>
              </View>
              
              <View style={styles.complaintDetails}>
                <View style={styles.detailRow}>
                  <Ionicons name="person" size={16} color="#8E8E93" />
                  <Text style={styles.detailText}>{complaint.parentName} • {complaint.childName}</Text>
                </View>
                
                <View style={styles.detailRow}>
                  <Ionicons name="chatbubble-ellipses-outline" size={16} color="#8E8E93" />
                  <Text style={styles.detailText}>{complaint.description}</Text>
                </View>
                
                <View style={styles.complaintFooter}>
                  <Text style={styles.complaintDate}>{complaint.date}</Text>
                  <View style={[styles.priorityIndicator, { backgroundColor: getPriorityColor(complaint.priority) }]} />
                </View>
              </View>
              
              {complaint.status !== 'resolved' && (
                <TouchableOpacity 
                  style={styles.respondButton}
                  onPress={() => setSelectedComplaint(selectedComplaint === complaint.id ? null : complaint.id)}
                >
                  <Ionicons name="send" size={16} color="#fff" />
                  <Text style={styles.respondButtonText}>
                    {selectedComplaint === complaint.id ? 'Cancel Response' : 'Respond'}
                  </Text>
                </TouchableOpacity>
              )}
              
              {selectedComplaint === complaint.id && (
                <View style={styles.responseSection}>
                  <TextInput
                    style={[styles.textInput, styles.responseInput]}
                    placeholder="Enter your response..."
                    value={responseText}
                    onChangeText={setResponseText}
                    multiline
                    numberOfLines={4}
                  />
                  <TouchableOpacity 
                    style={styles.sendResponseButton} 
                    onPress={() => handleRespond(complaint.id)}
                  >
                    <Ionicons name="send" size={16} color="#fff" />
                    <Text style={styles.sendResponseText}>Send Response</Text>
                  </TouchableOpacity>
                </View>
              )}
              
              {complaint.response && (
                <View style={styles.responseContainer}>
                  <Text style={styles.responseLabel}>Response:</Text>
                  <Text style={styles.responseText}>{complaint.response}</Text>
                </View>
              )}
            </View>
          ))}
          
          {filteredComplaints.length === 0 && (
            <View style={styles.emptyState}>
              <Ionicons name="alert-circle" size={40} color="#8E8E93" />
              <Text style={styles.emptyStateText}>No complaints found</Text>
              <Text style={styles.emptyStateSubtext}>Try adjusting your search criteria</Text>
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  complaintsList: {
    gap: 12,
  },
  complaintCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  complaintHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  complaintInfo: {
    flex: 1,
  },
  complaintId: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 4,
  },
  complaintSubject: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  resolvedStatus: {
    backgroundColor: '#e8f5e9',
  },
  underReviewStatus: {
    backgroundColor: '#fff3e0',
  },
  pendingStatus: {
    backgroundColor: '#f5f5f5',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
    color: '#333',
  },
  complaintDetails: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  detailRowLast: {
    marginBottom: 0,
  },
  detailText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
    flex: 1,
  },
  complaintFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  complaintDate: {
    fontSize: 12,
    color: '#8E8E93',
  },
  priorityIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  respondButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  respondButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  responseSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  responseInput: {
    height: 100,
    textAlignVertical: 'top',
    marginBottom: 12,
  },
  sendResponseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#34C759',
    borderRadius: 8,
    padding: 12,
  },
  sendResponseText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  responseContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e8f5e9',
    backgroundColor: '#f9fff9',
    borderRadius: 8,
    padding: 12,
  },
  responseLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#34C759',
    marginBottom: 4,
  },
  responseText: {
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
});

export default ComplaintsScreen;