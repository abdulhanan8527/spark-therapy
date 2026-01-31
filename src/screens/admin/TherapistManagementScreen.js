import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { therapistAPI, authAPI } from '../../services/api';

const TherapistManagementScreen = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [editingTherapist, setEditingTherapist] = useState(null);
  const [editingTherapistData, setEditingTherapistData] = useState({
    name: '',
    email: '',
    phone: '',
    specialization: '',
  });
  const [newTherapist, setNewTherapist] = useState({
    name: '',
    email: '',
    phone: '',
    specialization: '',
  });
  const [therapists, setTherapists] = useState([]);

  useEffect(() => {
    const checkAuthAndFetch = async () => {
      // Check if user is admin before fetching data
      if (user?.role !== 'admin') {
        Alert.alert('Access Denied', 'You must be logged in as an admin to access this screen.');
        return;
      }
      fetchTherapists();
    };
    
    checkAuthAndFetch();
  }, [user]);

  const fetchTherapists = async () => {
    try {
      setLoading(true);
      console.log('Fetching therapists...');
      const response = await therapistAPI.getAllTherapists();
      console.log('Fetch therapists response:', response);
      
      if (response.success) {
        // Handle different possible response formats
        let therapistData = response.data;
        // If data is nested in a property like 'therapists', use that
        if (response.data && Array.isArray(response.data.therapists)) {
          therapistData = response.data.therapists;
        } else if (response.data && !Array.isArray(response.data)) {
          // If data is an object with therapists array inside
          therapistData = response.data.data || [];
        }
        // Ensure we're setting an array
        const therapistsArray = Array.isArray(therapistData) ? therapistData : [];
        console.log(`Setting ${therapistsArray.length} therapists in state`);
        setTherapists(therapistsArray);
      } else {
        Alert.alert('Error', response.message || 'Failed to fetch therapists');
        setTherapists([]); // Ensure therapists is an array even on error
      }
    } catch (error) {
      console.error('Error fetching therapists:', error);
      Alert.alert('Error', error?.message || 'Failed to fetch therapists');
      setTherapists([]); // Ensure therapists is an array even on error
    } finally {
      setLoading(false);
    }
  };

  const handleAddTherapist = async () => {
    // Validate required fields
    if (!newTherapist.name?.trim()) {
      Alert.alert('Error', 'Please enter a name');
      return;
    }
    if (!newTherapist.email?.trim()) {
      Alert.alert('Error', 'Please enter an email');
      return;
    }
    
    // Validate email format with more comprehensive regex
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    if (!emailRegex.test(newTherapist.email.trim())) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }
    
    // Validate name format
    if (!/^[a-zA-Z\s'-]+$/.test(newTherapist.name.trim())) {
      Alert.alert('Error', 'Name can only contain letters, spaces, hyphens, and apostrophes');
      return;
    }
    
    // Validate phone if provided
    if (newTherapist.phone && newTherapist.phone.trim() && !/^\+?\d{1,4}?[-.\s]?\(?\d{1,3}?\)?[-.\s]?\d{1,4}[-.\s]?\d{1,9}$/.test(newTherapist.phone.trim())) {
      Alert.alert('Error', 'Please enter a valid phone number');
      return;
    }
    
    // Validate specialization if provided
    if (newTherapist.specialization && newTherapist.specialization.trim().length < 2) {
      Alert.alert('Error', 'Specialization should be at least 2 characters');
      return;
    }

    try {
      setSubmitting(true);
      
      // Create therapist via auth API with proper data structure
      const therapistData = {
        name: newTherapist.name.trim(),
        email: newTherapist.email.trim(),
        phone: newTherapist.phone?.trim() || '',
        specialization: newTherapist.specialization?.trim() || '',
        role: 'therapist',
        password: 'SparkTherapy2024!' // Strong default password
      };
      
      const response = await authAPI.register(therapistData);
      
      if (response.success) {
        Alert.alert('Success', 'Therapist added successfully! Default password is: SparkTherapy2024!');
        
        // Refresh the therapist list to ensure data consistency
        await fetchTherapists();
        
        // Reset form
        setNewTherapist({
          name: '',
          email: '',
          phone: '',
          specialization: '',
        });
        setShowAddForm(false);
      } else {
        Alert.alert('Error', response.message || 'Failed to add therapist');
      }
    } catch (error) {
      console.error('Error adding therapist:', error);
      let errorMessage = 'Failed to add therapist';
      
      // Handle specific error cases
      if (error.message) {
        if (error.message.includes('already exists')) {
          errorMessage = 'A user with this email already exists';
        } else if (error.message.includes('email')) {
          errorMessage = 'Please enter a valid email address';
        } else if (error.message.includes('password')) {
          errorMessage = 'Password must be at least 6 characters';
        } else {
          errorMessage = error.message;
        }
      }
      
      Alert.alert('Error', errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditTherapist = async (therapistId) => {
    const therapist = therapists.find(t => t._id === therapistId);
    if (!therapist) {
      Alert.alert('Error', 'Therapist not found');
      return;
    }
    
    // Set the therapist data for editing
    setEditingTherapistData({
      name: therapist.name,
      email: therapist.email,
      phone: therapist.phone || '',
      specialization: therapist.specialization || '',
    });
    setEditingTherapist(therapistId);
  };
  
  const handleUpdateTherapist = async () => {
    if (!editingTherapist) return;
    
    try {
      setSubmitting(true);
      
      const response = await therapistAPI.updateTherapist(editingTherapist, editingTherapistData);
      if (response && response.success === true) {
        Alert.alert('Success', 'Therapist updated successfully!');
        
        setEditingTherapist(null);
        setEditingTherapistData({
          name: '',
          email: '',
          phone: '',
          specialization: '',
        });
        
        // Refresh from server to ensure consistency
        await fetchTherapists();
      } else {
        const errorMessage = (response && response.message) || 'Failed to update therapist';
        Alert.alert('Error', errorMessage);
      }
    } catch (error) {
      console.error('Error updating therapist:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response,
        status: error.response?.status,
        data: error.response?.data
      });
      
      let errorMessage = 'Failed to update therapist';
      
      if (error.response) {
        if (error.response.data && error.response.data.message) {
          errorMessage = error.response.data.message;
        } else if (error.response.status === 404) {
          errorMessage = 'Therapist not found';
        } else if (error.response.status === 403) {
          errorMessage = 'Access denied. Admin privileges required.';
        } else if (error.response.status === 401) {
          errorMessage = 'Authentication required. Please log in again.';
        } else {
          errorMessage = `Server error (${error.response.status})`;
        }
      } else if (error.request) {
        errorMessage = 'Network error. Please check your connection.';
      } else {
        errorMessage = error.message || 'Unknown error occurred';
      }
      
      Alert.alert('Error', errorMessage);
    } finally {
      setSubmitting(false);
    }
  };
  
  const cancelEdit = () => {
    setEditingTherapist(null);
    setEditingTherapistData({
      name: '',
      email: '',
      phone: '',
      specialization: '',
    });
  };

  const handleDeleteTherapist = async (therapistId) => {
    Alert.alert(
      'Delete Therapist',
      'Are you sure you want to permanently delete this therapist? This action cannot be undone and will remove all associated data.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              setSubmitting(true);
              console.log('Deleting therapist with ID:', therapistId);
              
              const response = await therapistAPI.deleteTherapist(therapistId);
              console.log('Delete API response:', response);
              
              // Check if response has the expected structure
              if (response && response.success === true) {
                Alert.alert('Success', 'Therapist deleted successfully!');
                console.log('Delete successful, refreshing therapist list...');
                
                // Just refresh from server to ensure consistency
                await fetchTherapists(); // Refresh from server to ensure consistency
                console.log('Therapist list refreshed from server');
              } else {
                const errorMessage = (response && response.message) || 'Failed to delete therapist';
                Alert.alert('Error', errorMessage);
                console.error('Delete API error:', errorMessage);
                console.error('Response structure:', response);
              }
            } catch (error) {
              console.error('Error deleting therapist:', error);
              console.error('Error details:', {
                message: error.message,
                response: error.response,
                status: error.response?.status,
                data: error.response?.data
              });
              
              let errorMessage = 'Failed to delete therapist';
              
              // Handle different error scenarios
              if (error.response) {
                // Server responded with error status
                if (error.response.data && error.response.data.message) {
                  errorMessage = error.response.data.message;
                } else if (error.response.status === 404) {
                  errorMessage = 'Therapist not found';
                } else if (error.response.status === 403) {
                  errorMessage = 'Access denied. Admin privileges required.';
                } else if (error.response.status === 401) {
                  errorMessage = 'Authentication required. Please log in again.';
                } else {
                  errorMessage = `Server error (${error.response.status})`;
                }
              } else if (error.request) {
                // Request was made but no response received
                errorMessage = 'Network error. Please check your connection.';
              } else {
                // Something else happened
                errorMessage = error.message || 'Unknown error occurred';
              }
              
              Alert.alert('Error', errorMessage);
            } finally {
              setSubmitting(false);
            }
          }
        }
      ]
    );
  };

  const toggleTherapistStatus = async (therapistId) => {
    try {
      const therapist = therapists.find(t => t._id === therapistId);
      if (!therapist) {
        Alert.alert('Error', 'Therapist not found');
        return;
      }
      
      if (therapist.isActive !== false) {
        // Deactivate therapist
        const response = await therapistAPI.deactivateTherapist(therapistId);
        if (response && response.success === true) {
          Alert.alert('Success', 'Therapist deactivated successfully!');
          
          // Refresh from server to ensure consistency
          await fetchTherapists();
        } else {
          const errorMessage = (response && response.message) || 'Failed to deactivate therapist';
          Alert.alert('Error', errorMessage);
        }
      } else {
        // Reactivate therapist
        const response = await therapistAPI.reactivateTherapist(therapistId);
        if (response && response.success === true) {
          Alert.alert('Success', 'Therapist reactivated successfully!');
          
          // Refresh from server to ensure consistency
          await fetchTherapists();
        } else {
          const errorMessage = (response && response.message) || 'Failed to reactivate therapist';
          Alert.alert('Error', errorMessage);
        }
      }
    } catch (error) {
      console.error('Error toggling therapist status:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response,
        status: error.response?.status,
        data: error.response?.data
      });
      
      let errorMessage = 'Failed to update therapist status';
      
      if (error.response) {
        if (error.response.data && error.response.data.message) {
          errorMessage = error.response.data.message;
        } else if (error.response.status === 404) {
          errorMessage = 'Therapist not found';
        } else if (error.response.status === 403) {
          errorMessage = 'Access denied. Admin privileges required.';
        } else {
          errorMessage = `Server error (${error.response.status})`;
        }
      } else if (error.request) {
        errorMessage = 'Network error. Please check your connection.';
      } else {
        errorMessage = error.message || 'Unknown error occurred';
      }
      
      Alert.alert('Error', errorMessage);
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

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  // Safely filter therapists after loading check
  const filteredTherapists = Array.isArray(therapists) ? therapists.filter(therapist =>
    (therapist.name && therapist.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (therapist.email && therapist.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (therapist.specialization && therapist.specialization.toLowerCase().includes(searchQuery.toLowerCase()))
  ) : [];

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Therapist Management</Text>
      
      {/* Search and Add */}
      <View style={styles.section}>
        <View style={styles.searchAndAdd}>
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color="#8E8E93" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search therapists..."
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          
          <TouchableOpacity 
            style={styles.addButton} 
            onPress={() => setShowAddForm(!showAddForm)}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="person-add" size={20} color="#fff" />
                <Text style={styles.addButtonText}>
                  {showAddForm ? 'Cancel' : 'Add Therapist'}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Add Therapist Form */}
      {showAddForm && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Add New Therapist</Text>
          <View style={styles.formContainer}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Full Name</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Enter full name"
                value={newTherapist.name}
                onChangeText={(text) => setNewTherapist({...newTherapist, name: text})}
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Enter email address"
                value={newTherapist.email}
                onChangeText={(text) => setNewTherapist({...newTherapist, email: text})}
                keyboardType="email-address"
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Phone</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Enter phone number"
                value={newTherapist.phone}
                onChangeText={(text) => setNewTherapist({...newTherapist, phone: text})}
                keyboardType="phone-pad"
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Specialization</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Enter specialization"
                value={newTherapist.specialization}
                onChangeText={(text) => setNewTherapist({...newTherapist, specialization: text})}
              />
            </View>
            
            <TouchableOpacity style={styles.submitButton} onPress={handleAddTherapist}>
              <Ionicons name="person-add" size={20} color="#fff" />
              <Text style={styles.submitButtonText}>Add Therapist</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Edit Therapist Form */}
      {editingTherapist && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Edit Therapist</Text>
          <View style={styles.formContainer}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Full Name</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Enter full name"
                value={editingTherapistData.name}
                onChangeText={(text) => setEditingTherapistData({...editingTherapistData, name: text})}
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Enter email address"
                value={editingTherapistData.email}
                onChangeText={(text) => setEditingTherapistData({...editingTherapistData, email: text})}
                keyboardType="email-address"
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Phone</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Enter phone number"
                value={editingTherapistData.phone}
                onChangeText={(text) => setEditingTherapistData({...editingTherapistData, phone: text})}
                keyboardType="phone-pad"
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Specialization</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Enter specialization"
                value={editingTherapistData.specialization}
                onChangeText={(text) => setEditingTherapistData({...editingTherapistData, specialization: text})}
              />
            </View>
            
            <View style={styles.submitButtonContainer}>
              <TouchableOpacity style={[styles.actionButton, { flex: 1, marginRight: 8 }]} onPress={cancelEdit}>
                <Text style={styles.actionText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.submitButton, { flex: 1, marginLeft: 8 }]} onPress={handleUpdateTherapist}>
                <Text style={styles.submitButtonText}>Update</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {/* Therapists List */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Therapists ({filteredTherapists.length})</Text>
        <View style={styles.therapistsList}>
          {filteredTherapists.map((therapist) => (
            <View key={therapist._id} style={styles.therapistCard}>
              <View style={styles.therapistHeader}>
                <View style={styles.therapistInfo}>
                  <View style={styles.avatar}>
                    <Ionicons name="person" size={24} color="#fff" />
                  </View>
                  <View>
                    <Text style={styles.therapistName}>{therapist.name}</Text>
                    <Text style={styles.therapistSpecialization}>{therapist.specialization || therapist.role}</Text>
                  </View>
                </View>
                
                <View style={[styles.statusBadge, getStatusStyle(therapist.isActive !== false ? 'active' : 'inactive')]}> 
                  {getStatusIcon(therapist.isActive !== false ? 'active' : 'inactive')}
                  <Text style={styles.statusText}>{getStatusText(therapist.isActive !== false ? 'active' : 'inactive')}</Text>
                </View>
              </View>
              
              <View style={styles.therapistDetails}>
                <View style={styles.detailRow}>
                  <Ionicons name="mail" size={16} color="#8E8E93" />
                  <Text style={styles.detailText}>{therapist.email}</Text>
                </View>
                
                <View style={styles.detailRow}>
                  <Ionicons name="call" size={16} color="#8E8E93" />
                  <Text style={styles.detailText}>{therapist.phone || 'N/A'}</Text>
                </View>
              </View>
              
              <View style={styles.therapistStats}>
                <View style={styles.statBox}>
                  <Text style={styles.statValue}>{therapist.assignedChildren || 0}</Text>
                  <Text style={styles.statLabel}>Children</Text>
                </View>
                
                <View style={styles.statBox}>
                  <Text style={styles.statValue}>{therapist.sessionsThisWeek || 0}</Text>
                  <Text style={styles.statLabel}>Sessions This Week</Text>
                </View>
              </View>
              
              <View style={styles.actionButtons}>
                <TouchableOpacity 
                  style={styles.actionButton} 
                  onPress={() => handleEditTherapist(therapist._id)}
                >
                  <Ionicons name="create" size={16} color="#007AFF" />
                  <Text style={styles.actionText}>Edit</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.actionButton} 
                  onPress={() => toggleTherapistStatus(therapist._id)}
                >
                  {therapist.isActive !== false ? 
                    <Ionicons name="close-circle" size={16} color="#FF9500" />
                    : <Ionicons name="checkmark-circle" size={16} color="#34C759" />}
                  <Text style={styles.actionText}>
                    {therapist.isActive !== false ? 'Deactivate' : 'Activate'}
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.actionButton, styles.deleteButton]} 
                  onPress={() => handleDeleteTherapist(therapist._id)}
                >
                  <Ionicons name="trash" size={16} color="#FF3B30" />
                  <Text style={styles.actionText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
          
          {filteredTherapists.length === 0 && (
            <View style={styles.emptyState}>
              <Ionicons name="person" size={40} color="#8E8E93" />
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
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
  searchAndAdd: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  searchContainer: {
    flex: 1,
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
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
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
  
  submitButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    padding: 10,
    flex: 1,
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

export default TherapistManagementScreen;