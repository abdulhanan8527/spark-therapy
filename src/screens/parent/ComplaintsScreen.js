import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { AlertCircle, Send, Clock, CheckCircle, XCircle } from '../../components/SimpleIcons';
import { useAuth } from '../../contexts/AuthContext';
import { childAPI, complaintAPI } from '../../services/api';

const ComplaintsScreen = () => {
  const { user } = useAuth();
  const [selectedChild, setSelectedChild] = useState(null);
  const [children, setChildren] = useState([]);
  const [complaintType, setComplaintType] = useState('');
  const [complaintSubject, setComplaintSubject] = useState('');
  const [complaintDescription, setComplaintDescription] = useState('');
  const [previousComplaints, setPreviousComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load children
      const childrenRes = await childAPI.getChildren();
      if (childrenRes.success) {
        setChildren(childrenRes.data);
        if (childrenRes.data.length > 0) {
          setSelectedChild(childrenRes.data[0]);
        }
      }
      
      // Load previous complaints
      const complaintsRes = await complaintAPI.getComplaintsByParentId(user.id);
      if (complaintsRes.success) {
        setPreviousComplaints(Array.isArray(complaintsRes.data) ? complaintsRes.data : []);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Error', 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const complaintTypes = [
    'Service Issue',
    'Staff Issue',
    'Financial Issue',
    'Facility Issue',
    'Other'
  ];

  const handleSubmit = async () => {
    if (!selectedChild || !complaintType || !complaintSubject || !complaintDescription) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      setSubmitting(true);
      
      const complaintData = {
        childId: selectedChild._id,
        type: complaintType,
        subject: complaintSubject,
        description: complaintDescription,
        parentId: user.id
      };

      const response = await complaintAPI.createComplaint(complaintData);
      if (response.success) {
        Alert.alert('Success', 'Your complaint has been submitted successfully. We will respond within 24-48 hours.');
        
        // Reload complaints
        const complaintsRes = await complaintAPI.getComplaintsByParentId(user.id);
        if (complaintsRes.success) {
          setPreviousComplaints(Array.isArray(complaintsRes.data) ? complaintsRes.data : []);
        }

        // Reset form
        setComplaintType('');
        setComplaintSubject('');
        setComplaintDescription('');
      } else {
        Alert.alert('Error', response.message || 'Failed to submit complaint');
      }
    } catch (error) {
      console.error('Error submitting complaint:', error);
      Alert.alert('Error', 'Failed to submit complaint');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status.toLowerCase()) {
      case 'resolved':
        return <CheckCircle size={16} color="#34C759" />;
      case 'in-progress':
        return <Clock size={16} color="#FF9500" />;
      case 'pending':
        return <Clock size={16} color="#8E8E93" />;
      default:
        return <Clock size={16} color="#8E8E93" />;
    }
  };

  const getStatusText = (status) => {
    return status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ');
  };

  const getStatusStyle = (status) => {
    switch (status.toLowerCase()) {
      case 'resolved':
        return styles.resolvedStatus;
      case 'in-progress':
        return styles.inProgressStatus;
      case 'pending':
        return styles.pendingStatus;
      default:
        return styles.pendingStatus;
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading complaints...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Complaints & Feedback</Text>

      {/* Submit New Complaint */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Submit New Complaint</Text>
        <View style={styles.formContainer}>
          {/* Child Selection */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Select Child</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={selectedChild?._id}
                style={styles.picker}
                onValueChange={(itemValue) => {
                  const child = children.find(c => c._id === itemValue);
                  setSelectedChild(child || null);
                }}
              >
                <Picker.Item label="Select a child" value={null} />
                {children.map((child) => (
                  <Picker.Item key={child._id} label={`${child.firstName} ${child.lastName}`} value={child._id} />
                ))}
              </Picker>
            </View>
          </View>

          {/* Complaint Type */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Complaint Type</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={complaintType}
                style={styles.picker}
                onValueChange={(itemValue) => setComplaintType(itemValue)}
              >
                <Picker.Item label="Select complaint type" value="" />
                {complaintTypes.map((type, index) => (
                  <Picker.Item key={index} label={type} value={type} />
                ))}
              </Picker>
            </View>
          </View>

          {/* Subject */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Subject</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Enter complaint subject"
              value={complaintSubject}
              onChangeText={setComplaintSubject}
            />
          </View>

          {/* Description */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              placeholder="Describe your complaint in detail"
              value={complaintDescription}
              onChangeText={setComplaintDescription}
              multiline
              numberOfLines={4}
            />
          </View>

          {/* Submit Button */}
          <TouchableOpacity 
            style={[styles.submitButton, submitting && styles.disabledButton]} 
            onPress={handleSubmit}
            disabled={submitting}
          >
            <Send size={20} color="#fff" />
            <Text style={styles.submitButtonText}>
              {submitting ? 'Submitting...' : 'Submit Complaint'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Previous Complaints */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Previous Complaints</Text>
        <View style={styles.complaintsList}>
          {previousComplaints.map((complaint) => (
            <View key={complaint._id} style={styles.complaintCard}>
              <View style={styles.complaintHeader}>
                <Text style={styles.complaintSubject}>{complaint.subject}</Text>
                <View style={[styles.statusBadge, getStatusStyle(complaint.status)]}>
                  {getStatusIcon(complaint.status)}
                  <Text style={styles.statusText}>{getStatusText(complaint.status)}</Text>
                </View>
              </View>

              <View style={styles.complaintDetails}>
                <Text style={styles.complaintType}>{complaint.type}</Text>
                <Text style={styles.complaintDate}>{new Date(complaint.createdAt).toLocaleDateString()}</Text>
              </View>

              <Text style={styles.complaintDescription} numberOfLines={2}>
                {complaint.description}
              </Text>

              {complaint.response && (
                <View style={styles.responseContainer}>
                  <Text style={styles.responseLabel}>Response:</Text>
                  <Text style={styles.responseText}>{complaint.response}</Text>
                </View>
              )}
            </View>
          ))}
          
          {previousComplaints.length === 0 && (
            <View style={styles.emptyState}>
              <AlertCircle size={40} color="#8E8E93" />
              <Text style={styles.emptyStateText}>No complaints submitted</Text>
              <Text style={styles.emptyStateSubtext}>Submit your first complaint using the form above</Text>
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
    borderRadius: 8,
    padding: 16,
    marginTop: 8,
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
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
    marginBottom: 8,
  },
  complaintSubject: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    marginRight: 8,
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
  inProgressStatus: {
    backgroundColor: '#fff3e0',
  },
  pendingStatus: {
    backgroundColor: '#f5f5f5',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
  complaintDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  complaintType: {
    fontSize: 14,
    color: '#666',
  },
  complaintDate: {
    fontSize: 14,
    color: '#666',
  },
  complaintDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  responseContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  responseLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  responseText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});

export default ComplaintsScreen;