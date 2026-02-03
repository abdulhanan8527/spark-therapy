import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert, ActivityIndicator, FlatList, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { childAPI, therapistAPI, userAPI } from '../../services/api';

const ChildrenSection = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [children, setChildren] = useState([]);
  const [therapists, setTherapists] = useState([]);
  const [parents, setParents] = useState([]);
  
  const [newChild, setNewChild] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    diagnosis: '',
    parentId: '',
    therapistId: '',
  });
  
  // Picker states
  const [showParentPicker, setShowParentPicker] = useState(false);
  const [showTherapistPicker, setShowTherapistPicker] = useState(false);

  useEffect(() => {
    console.log('ChildrenSection mounted/updated, user:', user);
    const checkAuthAndFetch = async () => {
      if (user?.role !== 'admin') {
        Alert.alert('Access Denied', 'You must be logged in as an admin to access this screen.');
        return;
      }
      console.log('Fetching data for admin user');
      fetchData();
    };
    
    checkAuthAndFetch();
  }, [user]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch children data
      const childrenRes = await childAPI.getChildren();
      if (childrenRes.success) {
        setChildren(Array.isArray(childrenRes.data) ? childrenRes.data : []);
      } else {
        setChildren([]);
        console.error('Failed to fetch children:', childrenRes.message);
      }

      // Fetch therapists for assignment dropdown
      try {
        const therapistsRes = await therapistAPI.getAllTherapists();
        console.log('Therapists API Response:', therapistsRes);
        if (therapistsRes?.success) {
          // Handle deeply nested response structure: { success: true, data: { success: true, data: [...] } }
          let therapistList = [];
          
          // Check the most nested level first
          if (therapistsRes.data?.data && Array.isArray(therapistsRes.data.data)) {
            therapistList = therapistsRes.data.data;
          } 
          // Check middle level
          else if (therapistsRes.data?.therapists && Array.isArray(therapistsRes.data.therapists)) {
            therapistList = therapistsRes.data.therapists;
          }
          // Check direct array
          else if (Array.isArray(therapistsRes.data)) {
            therapistList = therapistsRes.data;
          }
          // Check single object
          else if (therapistsRes.data && typeof therapistsRes.data === 'object') {
            therapistList = [therapistsRes.data];
          }
          
          console.log('Processed therapists list:', therapistList);
          setTherapists(Array.isArray(therapistList) ? therapistList : []);
        } else {
          console.error('Therapists API not successful:', therapistsRes);
          setTherapists([]);
          Alert.alert('Error', 'Failed to load therapists: ' + (therapistsRes?.message || 'Unknown error'));
        }
      } catch (error) {
        console.error('Error fetching therapists:', error);
        console.error('Error details:', {
          message: error?.message,
          status: error?.response?.status,
          data: error?.response?.data
        });
        setTherapists([]);
        Alert.alert('Error', 'Failed to load therapists: ' + (error?.message || 'Network error'));
      }

      // Fetch parents from API
      try {
        const parentsRes = await userAPI.getUsersByRole('parent');
        console.log('Parents API Response:', parentsRes);
        if (parentsRes?.success) {
          // Handle different response structures for parents
          let parentList = [];
          if (Array.isArray(parentsRes.data)) {
            parentList = parentsRes.data;
          } else if (parentsRes.data?.users && Array.isArray(parentsRes.data.users)) {
            parentList = parentsRes.data.users;
          } else if (parentsRes.data?.data && Array.isArray(parentsRes.data.data)) {
            parentList = parentsRes.data.data;
          } else if (parentsRes.data && typeof parentsRes.data === 'object') {
            parentList = [parentsRes.data];
          }
          console.log('Processed parents list:', parentList);
          setParents(Array.isArray(parentList) ? parentList : []);
        } else {
          console.error('Parents API not successful:', parentsRes);
          setParents([]);
          Alert.alert('Error', 'Failed to load parents: ' + (parentsRes?.message || 'Unknown error'));
        }
      } catch (error) {
        console.error('Error fetching parents:', error?.message || error);
        console.error('Error details:', {
          message: error?.message,
          status: error?.response?.status,
          data: error?.response?.data
        });
        setParents([]);
        Alert.alert('Error', 'Failed to load parents: ' + (error?.message || 'Network error'));
      }
    } catch (error) {
      console.error('Error fetching data:', error?.message || error);
      Alert.alert('Error', 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleParentSelect = (parentId) => {
    setNewChild({ ...newChild, parentId });
    setShowParentPicker(false);
  };

  const handleTherapistSelect = (therapistId) => {
    setNewChild({ ...newChild, therapistId });
    setShowTherapistPicker(false);
  };

  const handleAddChild = async () => {
    console.log('=== HANDLE ADD CHILD STARTED ===');
    console.log('Current newChild state:', newChild);
    console.log('All form field values:');
    console.log('- firstName:', newChild.firstName);
    console.log('- lastName:', newChild.lastName);
    console.log('- dateOfBirth:', newChild.dateOfBirth);
    console.log('- diagnosis:', newChild.diagnosis);
    console.log('- parentId:', newChild.parentId);
    console.log('- therapistId:', newChild.therapistId);
    
    // Validate required fields
    if (!newChild.firstName?.trim()) {
      Alert.alert('Error', 'Please enter a first name');
      return;
    }
    if (!newChild.lastName?.trim()) {
      Alert.alert('Error', 'Please enter a last name');
      return;
    }
    if (!newChild.diagnosis?.trim()) {
      Alert.alert('Error', 'Please enter a diagnosis');
      return;
    }
    if (!newChild.parentId?.trim()) {
      Alert.alert('Error', 'Please select a parent');
      return;
    }
    
    // Therapist is optional, so we don't validate it
    
    console.log('=== FORM VALIDATION PASSED ===');
    console.log('Raw newChild data:', newChild);
    console.log('DateOfBirth analysis:');
    console.log('- Raw value:', newChild.dateOfBirth);
    console.log('- Type:', typeof newChild.dateOfBirth);
    console.log('- Is null:', newChild.dateOfBirth === null);
    console.log('- Is undefined:', newChild.dateOfBirth === undefined);
    console.log('- Length:', newChild.dateOfBirth?.length);
    console.log('- Trimmed value:', newChild.dateOfBirth?.trim ? newChild.dateOfBirth.trim() : 'NO TRIM METHOD');
    console.log('- Boolean value:', !!newChild.dateOfBirth);
    console.log('- Empty check:', newChild.dateOfBirth === '');
    
    try {
      // Log the request being made
      console.log('Calling childAPI.createChild with:', newChild);
      
      // COMPLETE RECONSTRUCTION - Build clean object to avoid any prototype issues
      console.log('=== BUILDING CLEAN CHILD OBJECT ===');
      
      // Create a completely new object with only the fields we want
      const cleanChildData = {};
      
      // Always include required fields
      cleanChildData.firstName = newChild.firstName?.trim() || '';
      cleanChildData.lastName = newChild.lastName?.trim() || '';
      cleanChildData.diagnosis = newChild.diagnosis?.trim() || '';
      cleanChildData.parentId = newChild.parentId?.trim() || '';
      
      // Handle dateOfBirth specially
      if (newChild.dateOfBirth && typeof newChild.dateOfBirth === 'string' && newChild.dateOfBirth.trim() !== '') {
        cleanChildData.dateOfBirth = newChild.dateOfBirth.trim();
        console.log('Setting dateOfBirth to string value:', cleanChildData.dateOfBirth);
      } else {
        cleanChildData.dateOfBirth = undefined;
        console.log('Setting dateOfBirth to undefined');
      }
      
      // Handle optional therapist
      if (newChild.therapistId && newChild.therapistId.trim() !== '') {
        cleanChildData.therapistId = newChild.therapistId.trim();
      }
      
      console.log('Clean child data being sent:', cleanChildData);
      console.log('Final dateOfBirth type:', typeof cleanChildData.dateOfBirth);
      console.log('Final dateOfBirth value:', cleanChildData.dateOfBirth);
      const res = await childAPI.createChild(cleanChildData);
      console.log('API Response:', res);
      
      if (res.success) {
        console.log('Child created successfully!', res.data);
        Alert.alert('Success', 'Child added successfully!');
        setNewChild({
          firstName: '',
          lastName: '',
          dateOfBirth: '',
          diagnosis: '',
          parentId: '',
          therapistId: '',
        });
        setShowAddForm(false);
        console.log('Refreshing children list...');
        // Aggressive refresh to ensure UI updates
        setTimeout(() => {
          fetchData();
          console.log('Children list refreshed');
        }, 500);
      } else {
        console.error('API returned failure:', res);
        Alert.alert('Error', res.message || 'Failed to add child');
      }
    } catch (error) {
      console.error('Error adding child - Full error object:', error);
      console.error('Error details:', {
        message: error?.message,
        response: error?.response,
        request: error?.request,
        config: error?.config
      });
      Alert.alert('Error', error?.message || 'Failed to add child');
    }
  };

  const filteredChildren = children.filter(child =>
    child.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    child.lastName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView>
        <Text style={styles.header}>Children Management</Text>
        
        {/* Search and Add */}
        <View style={styles.section}>
          <View style={styles.searchAndAdd}>
            <View style={styles.searchContainer}>
              <Ionicons name="search" size={20} color="#8E8E93" />
              <TextInput
                style={styles.searchInput}
                placeholder="Search children..."
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>
            <View style={{flexDirection: 'row', gap: 10}}>
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => setShowAddForm(!showAddForm)}
              >
                <Ionicons name="add" size={20} color="#fff" />
                <Text style={styles.addButtonText}>Add</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.addButton, {backgroundColor: '#34C759'}]}
                onPress={() => {
                  console.log('Manual refresh triggered');
                  fetchData();
                }}
              >
                <Ionicons name="refresh" size={20} color="#fff" />
                <Text style={styles.addButtonText}>Refresh</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Add Child Form */}
        {showAddForm && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Add New Child</Text>
            <View style={styles.formContainer}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>First Name *</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Enter first name"
                  value={newChild.firstName}
                  onChangeText={(text) => setNewChild({ ...newChild, firstName: text })}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Last Name *</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Enter last name"
                  value={newChild.lastName}
                  onChangeText={(text) => setNewChild({ ...newChild, lastName: text })}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Date of Birth</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="YYYY-MM-DD"
                  value={newChild.dateOfBirth}
                  onChangeText={(text) => setNewChild({ ...newChild, dateOfBirth: text })}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Diagnosis *</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Enter diagnosis"
                  value={newChild.diagnosis}
                  onChangeText={(text) => setNewChild({ ...newChild, diagnosis: text })}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Parent *</Text>
                <TouchableOpacity
                  style={styles.dropdown}
                  onPress={() => setShowParentPicker(true)}
                >
                  <TextInput
                    style={styles.dropdownInput}
                    placeholder="Select parent"
                    value={parents.find(p => p._id === newChild.parentId)?.name || ''}
                    editable={false}
                  />
                  <View style={styles.dropdownButton}>
                    <Text style={styles.dropdownButtonText}>▼</Text>
                  </View>
                </TouchableOpacity>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Assigned Therapist (Optional)</Text>
                <TouchableOpacity
                  style={styles.dropdown}
                  onPress={() => {
                    console.log('Therapists available:', therapists);
                    if (therapists.length === 0) {
                      Alert.alert('Info', 'No therapists available in the system. You can create a child without assigning a therapist.');
                      return;
                    }
                    setShowTherapistPicker(true);
                  }}
                >
                  <TextInput
                    style={styles.dropdownInput}
                    placeholder="Select therapist (optional)"
                    value={therapists.find(t => t._id === newChild.therapistId)?.name || ''}
                    editable={false}
                  />
                  <View style={styles.dropdownButton}>
                    <Text style={styles.dropdownButtonText}>▼</Text>
                  </View>
                </TouchableOpacity>
              </View>

              <TouchableOpacity style={styles.submitButton} onPress={handleAddChild}>
                <Text style={styles.submitButtonText}>Add Child</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Children List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Children ({filteredChildren.length})</Text>
          <View style={styles.childrenList}>
            {filteredChildren.map((child) => (
              <View key={child._id} style={styles.childCard}>
                <View style={styles.childHeader}>
                  <View style={styles.childInfo}>
                    <View style={styles.avatar}>
                      <Ionicons name="person" size={24} color="#fff" />
                    </View>
                    <View>
                      <Text style={styles.childName}>{child.firstName} {child.lastName}</Text>
                      <Text style={styles.childDetails}>{child.diagnosis}</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.childDetailsContainer}>
                  <View style={styles.detailRow}>
                    <Ionicons name="person" size={16} color="#8E8E93" />
                    <Text style={styles.detailText}>Parent: {parents.find(p => p._id === child.parentId)?.name || 'N/A'}</Text>
                  </View>

                  <View style={styles.detailRow}>
                    <Ionicons name="person" size={16} color="#8E8E93" />
                    <Text style={styles.detailText}>Therapist: {therapists.find(t => t._id === child.therapistId)?.name || 'Unassigned'}</Text>
                  </View>

                  <View style={styles.detailRow}>
                    <Ionicons name="calendar" size={16} color="#8E8E93" />
                    <Text style={styles.detailText}>
                      DOB: {child.dateOfBirth ? new Date(child.dateOfBirth).toLocaleDateString() : 'N/A'}
                    </Text>
                  </View>
                </View>
              </View>
            ))}

            {filteredChildren.length === 0 && (
              <View style={styles.emptyState}>
                <Ionicons name="person" size={40} color="#8E8E93" />
                <Text style={styles.emptyStateText}>No children found</Text>
                <Text style={styles.emptyStateSubtext}>Try adjusting your search criteria</Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Parent Picker Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showParentPicker}
        onRequestClose={() => setShowParentPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Parent</Text>
              <TouchableOpacity 
                onPress={() => setShowParentPicker(false)}
                style={styles.closeButton}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>
            
            <FlatList
              data={parents}
              keyExtractor={(item) => item._id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.pickerItem}
                  onPress={() => handleParentSelect(item._id)}
                >
                  <Text style={styles.pickerItemText}>{item.name}</Text>
                  {item._id === newChild.parentId && (
                    <Text style={styles.checkmark}>✓</Text>
                  )}
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <View style={styles.emptyPicker}>
                  <Text style={styles.emptyPickerText}>No parents available</Text>
                </View>
              }
            />
          </View>
        </View>
      </Modal>

      {/* Therapist Picker Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showTherapistPicker}
        onRequestClose={() => setShowTherapistPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Therapist</Text>
              <TouchableOpacity 
                onPress={() => setShowTherapistPicker(false)}
                style={styles.closeButton}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>
            
            <FlatList
              data={therapists}
              keyExtractor={(item) => item._id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.pickerItem}
                  onPress={() => handleTherapistSelect(item._id)}
                >
                  <Text style={styles.pickerItemText}>{item.name}</Text>
                  {item._id === newChild.therapistId && (
                    <Text style={styles.checkmark}>✓</Text>
                  )}
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <View style={styles.emptyPicker}>
                  <Text style={styles.emptyPickerText}>No therapists available</Text>
                </View>
              }
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#8E8E93',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A1A1A',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  section: {
    marginHorizontal: 20,
    marginVertical: 10,
  },
  searchAndAdd: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 15,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
  },
  addButton: {
    backgroundColor: '#007AFF',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    marginLeft: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 15,
  },
  formContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  inputGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1A1A1A',
    marginBottom: 5,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
  },
  dropdown: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 8,
  },
  dropdownInput: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
  },
  dropdownButton: {
    backgroundColor: '#F2F2F7',
    paddingHorizontal: 12,
    justifyContent: 'center',
  },
  dropdownButtonText: {
    color: '#007AFF',
    fontWeight: '500',
  },
  submitButton: {
    backgroundColor: '#007AFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 10,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    marginLeft: 5,
  },
  childrenList: {
    marginBottom: 20,
  },
  childCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  childHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  childInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  childName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  childDetails: {
    fontSize: 14,
    color: '#8E8E93',
  },
  childDetailsContainer: {
    borderTopWidth: 1,
    borderTopColor: '#F2F2F7',
    paddingTop: 10,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#8E8E93',
    marginLeft: 8,
    flex: 1,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#8E8E93',
    marginTop: 10,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#AEAEB2',
    marginTop: 5,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  closeButton: {
    padding: 5,
  },
  closeButtonText: {
    fontSize: 20,
    color: '#8E8E93',
    fontWeight: '500',
  },
  pickerItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  pickerItemText: {
    fontSize: 16,
    color: '#1A1A1A',
  },
  checkmark: {
    fontSize: 18,
    color: '#007AFF',
    fontWeight: '500',
  },
  emptyPicker: {
    padding: 30,
    alignItems: 'center',
  },
  emptyPickerText: {
    fontSize: 16,
    color: '#8E8E93',
  },
});

export default ChildrenSection;