import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { therapistAPI } from '../../services/api';

const TherapistDeactivationScreen = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [deactivationReason, setDeactivationReason] = useState('');
  const [selectedTherapist, setSelectedTherapist] = useState(null);
  const [therapists, setTherapists] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const loadTherapists = async () => {
    try {
      setLoading(true);
      const response = await therapistAPI.getAllTherapists();
      if (response.success && Array.isArray(response.data)) {
        // Map the response data to match the expected format
        const mappedTherapists = response.data.map(therapist => ({
          id: therapist._id,
          name: `${therapist.firstName} ${therapist.lastName}`,
          email: therapist.email,
          specialization: therapist.specialization || 'N/A',
          status: therapist.isActive ? 'active' : 'inactive',
          assignedChildren: therapist.assignedChildrenCount || 0,
          sessionsThisWeek: therapist.sessionCount || 0,
          startDate: therapist.createdAt ? new Date(therapist.createdAt).toISOString().split('T')[0] : 'N/A',
        }));
        setTherapists(mappedTherapists);
      } else {
        setTherapists([]);
        console.error('Failed to load therapists:', response.message);
      }
    } catch (error) {
      console.error('Error loading therapists:', error);
      setTherapists([]);
      Alert.alert('Error', 'Failed to load therapists');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    loadTherapists();
  }, []);

  const handleDeactivate = async (therapistId) => {
    if (!deactivationReason.trim()) {
      Alert.alert('Error', 'Please enter a reason for deactivation');
      return;
    }
    
    try {
      const response = await therapistAPI.deactivateTherapist(therapistId);
      
      if (response.success) {
        Alert.alert('Success', 'Therapist deactivated successfully!');
        setDeactivationReason('');
        setSelectedTherapist(null);
        
        // Refresh from server to ensure consistency
        await loadTherapists();
      } else {
        Alert.alert('Error', response.message || 'Failed to deactivate therapist');
      }
    } catch (error) {
      console.error('Error deactivating therapist:', error);
      Alert.alert('Error', 'Failed to deactivate therapist');
    }
  };

  const handleReactivate = async (therapistId) => {
    try {
      const response = await therapistAPI.reactivateTherapist(therapistId);
      
      if (response.success) {
        Alert.alert('Success', 'Therapist reactivated successfully!');
        
        // Refresh from server to ensure consistency
        await loadTherapists();
      } else {
        Alert.alert('Error', response.message || 'Failed to reactivate therapist');
      }
    } catch (error) {
      console.error('Error reactivating therapist:', error);
      Alert.alert('Error', 'Failed to reactivate therapist');
    }
  };

  const getStatusIcon = (status) => {
    return status === 'active' 
      ? <Ionicons name="checkmark-circle" size={16} color="#34C759" />
      : <Ionicons name="close-circle" size={16} color="#FF3B30" />;
  };

  const getStatusText = (status) => {
    return status === 'active' ? 'Active' : 'Inactive';
  };

  const getStatusStyle = (status) => {
    return status === 'active' ? styles.activeStatus : styles.inactiveStatus;
  };

  const filteredTherapists = therapists.filter(therapist =>
    therapist.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    therapist.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    therapist.specialization.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Therapist Deactivation</Text>
      
      {/* Search */}
      <View style={styles.section}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#8E8E93" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search therapists..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Therapists List */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Therapists ({filteredTherapists.length})</Text>
        <View style={styles.therapistsList}>
          {filteredTherapists.map((therapist) => (
            <View key={therapist.id} style={styles.therapistCard}>
              <View style={styles.therapistHeader}>
                <View style={styles.therapistInfo}>
                  <View style={styles.avatar}>
                    <Ionicons name="person" size={24} color="#fff" />
                  </View>
                  <View>
                    <Text style={styles.therapistName}>{therapist.name}</Text>
                    <Text style={styles.therapistSpecialization}>{therapist.specialization}</Text>
                  </View>
                </View>
                
                <View style={[styles.statusBadge, getStatusStyle(therapist.status)]}>
                  {getStatusIcon(therapist.status)}
                  <Text style={styles.statusText}>{getStatusText(therapist.status)}</Text>
                </View>
              </View>
              
              <View style={styles.therapistDetails}>
                <Text style={styles.detailText}>{therapist.email}</Text>
                <Text style={styles.detailText}>Start Date: {therapist.startDate}</Text>
              </View>
              
              <View style={styles.therapistStats}>
                <View style={styles.statBox}>
                  <Text style={styles.statValue}>{therapist.assignedChildren}</Text>
                  <Text style={styles.statLabel}>Children</Text>
                </View>
                
                <View style={styles.statBox}>
                  <Text style={styles.statValue}>{therapist.sessionsThisWeek}</Text>
                  <Text style={styles.statLabel}>Sessions This Week</Text>
                </View>
              </View>
              
              <View style={styles.actionButtons}>
                {therapist.status === 'active' ? (
                  <TouchableOpacity 
                    style={[styles.actionButton, styles.deactivateButton]}
                    onPress={() => setSelectedTherapist(selectedTherapist === therapist.id ? null : therapist.id)}
                  >
                    <Ionicons name="person-remove" size={16} color="#FF3B30" />
                    <Text style={styles.actionText}>Deactivate</Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity 
                    style={[styles.actionButton, styles.reactivateButton]}
                    onPress={() => handleReactivate(therapist.id)}
                  >
                    <Ionicons name="checkmark-circle" size={16} color="#34C759" />
                    <Text style={styles.actionText}>Reactivate</Text>
                  </TouchableOpacity>
                )}
              </View>
              
              {selectedTherapist === therapist.id && therapist.status === 'active' && (
                <View style={styles.deactivationSection}>
                  <Text style={styles.deactivationLabel}>Reason for Deactivation</Text>
                  <TextInput
                    style={[styles.textInput, styles.reasonInput]}
                    placeholder="Enter reason for deactivation..."
                    value={deactivationReason}
                    onChangeText={setDeactivationReason}
                    multiline
                    numberOfLines={3}
                  />
                  <View style={styles.deactivationActions}>
                    <TouchableOpacity 
                      style={styles.cancelButton}
                      onPress={() => {
                        setSelectedTherapist(null);
                        setDeactivationReason('');
                      }}
                    >
                      <Text style={styles.cancelText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={styles.confirmDeactivateButton}
                      onPress={() => handleDeactivate(therapist.id)}
                    >
                      <Ionicons name="person-remove" size={16} color="#fff" />
                      <Text style={styles.confirmText}>Confirm Deactivation</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
          ))}
          
          {filteredTherapists.length === 0 && (
            <View style={styles.emptyState}>
              <Ionicons name="person-remove" size={40} color="#8E8E93" />
              <Text style={styles.emptyStateText}>No therapists found</Text>
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
  therapistsList: {
    gap: 12,
  },
  therapistCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  therapistHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  therapistInfo: {
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
  therapistSpecialization: {
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
  activeStatus: {
    backgroundColor: '#e8f5e9',
  },
  inactiveStatus: {
    backgroundColor: '#ffebee',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
    color: '#333',
  },
  therapistDetails: {
    marginBottom: 12,
  },
  detailText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  detailTextLast: {
    marginBottom: 0,
  },
  therapistStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statBox: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  actionButtons: {
    alignItems: 'flex-start',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    padding: 10,
  },
  deactivateButton: {
    backgroundColor: '#fff0f0',
  },
  reactivateButton: {
    backgroundColor: '#e8f5e9',
  },
  actionText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 4,
  },
  deactivationSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  deactivationLabel: {
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
  deactivationActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  cancelButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  cancelText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  confirmDeactivateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF3B30',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  confirmText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
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

export default TherapistDeactivationScreen;