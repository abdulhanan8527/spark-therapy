import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert, ActivityIndicator, FlatList } from 'react-native';
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

  useEffect(() => {
    const checkAuthAndFetch = async () => {
      if (user?.role !== 'admin') {
        Alert.alert('Access Denied', 'You must be logged in as an admin to access this screen.');
        return;
      }
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
      const therapistsRes = await therapistAPI.getAllTherapists();
      if (therapistsRes.success) {
        setTherapists(Array.isArray(therapistsRes.data) ? therapistsRes.data : []);
      } else {
        setTherapists([]);
        console.error('Failed to fetch therapists:', therapistsRes.message);
      }

      // Fetch parents from API
      try {
        const parentsRes = await userAPI.getUsersByRole('parent');
        if (parentsRes.success) {
          setParents(Array.isArray(parentsRes.data) ? parentsRes.data : []);
        } else {
          setParents([]);
          console.error('Failed to fetch parents:', parentsRes.message);
        }
      } catch (error) {
        console.error('Error fetching parents:', error?.message || error);
        setParents([]);
      }
    } catch (error) {
      console.error('Error fetching data:', error?.message || error);
      Alert.alert('Error', 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleAddChild = async () => {
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

    try {
      const res = await childAPI.createChild(newChild);
      if (res.success) {
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
        fetchData(); // Refresh the list
      } else {
        Alert.alert('Error', res.message || 'Failed to add child');
      }
    } catch (error) {
      console.error('Error adding child:', error?.message || error);
      Alert.alert('Error', error?.message || 'Failed to add child');
    }
  };

  const handleDeleteChild = (childId) => {
    Alert.alert(
      'Delete Child',
      'Are you sure you want to delete this child? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const res = await childAPI.deleteChild(childId);
              if (res.success) {
                setChildren(children.filter(c => c._id !== childId));
                Alert.alert('Success', 'Child deleted successfully!');
              } else {
                Alert.alert('Error', res.message || 'Failed to delete child');
              }
            } catch (error) {
              console.error('Error deleting child:', error?.message || error);
              Alert.alert('Error', error?.message || 'Failed to delete child');
            }
          }
        }
      ]
    );
  };

  // State for editing child
  const [editingChild, setEditingChild] = useState(null);
  const [editingChildData, setEditingChildData] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    diagnosis: '',
    parentId: '',
    therapistId: '',
  });

  const handleEditChild = (child) => {
    setEditingChildData({
      firstName: child.firstName || '',
      lastName: child.lastName || '',
      dateOfBirth: child.dateOfBirth || '',
      diagnosis: child.diagnosis || '',
      parentId: child.parentId || '',
      therapistId: child.therapistId || '',
    });
    setEditingChild(child._id);
  };

  const handleUpdateChild = async () => {
    if (!editingChild) return;

    // Validate required fields
    if (!editingChildData.firstName?.trim()) {
      Alert.alert('Error', 'Please enter a first name');
      return;
    }
    if (!editingChildData.lastName?.trim()) {
      Alert.alert('Error', 'Please enter a last name');
      return;
    }
    if (!editingChildData.diagnosis?.trim()) {
      Alert.alert('Error', 'Please enter a diagnosis');
      return;
    }
    if (!editingChildData.parentId?.trim()) {
      Alert.alert('Error', 'Please select a parent');
      return;
    }

    try {
      const res = await childAPI.updateChild(editingChild, editingChildData);
      if (res.success) {
        Alert.alert('Success', 'Child updated successfully!');

        // Update the child in the local state
        setChildren(prevChildren => 
          prevChildren.map(c => 
            c._id === editingChild ? { ...c, ...editingChildData } : c
          )
        );

        setEditingChild(null);
        setEditingChildData({
          firstName: '',
          lastName: '',
          dateOfBirth: '',
          diagnosis: '',
          parentId: '',
          therapistId: '',
        });
      } else {
        Alert.alert('Error', res.message || 'Failed to update child');
      }
    } catch (error) {
      console.error('Error updating child:', error?.message || error);
      Alert.alert('Error', error?.message || 'Failed to update child');
    }
  };

  const cancelEdit = () => {
    setEditingChild(null);
    setEditingChildData({
      firstName: '',
      lastName: '',
      dateOfBirth: '',
      diagnosis: '',
      parentId: '',
      therapistId: '',
    });
  };

  const filteredChildren = children.filter(child =>
    child &&
    (`${child.firstName || ''} ${child.lastName || ''}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (child.diagnosis || '').toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading children data...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
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

          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setShowAddForm(!showAddForm)}
          >
            <Ionicons name="add" size={20} color="#fff" />
            <Text style={styles.addButtonText}>
              {showAddForm ? 'Cancel' : 'Add Child'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Add Child Form */}
      {showAddForm && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Add New Child</Text>
          <View style={styles.formContainer}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>First Name</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Enter first name"
                value={newChild.firstName}
                onChangeText={(text) => setNewChild({ ...newChild, firstName: text })}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Last Name</Text>
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
              <Text style={styles.label}>Diagnosis</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Enter diagnosis"
                value={newChild.diagnosis}
                onChangeText={(text) => setNewChild({ ...newChild, diagnosis: text })}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Parent</Text>
              <View style={styles.dropdown}>
                <TextInput
                  style={styles.dropdownInput}
                  placeholder="Select parent"
                  value={parents.find(p => p._id === newChild.parentId)?.name || ''}
                  editable={false}
                />
                <TouchableOpacity
                  style={styles.dropdownButton}
                  onPress={() => Alert.alert('Select Parent', 'In a full implementation, this would show a dropdown')}
                >
                  <Text style={styles.dropdownButtonText}>Select</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Assigned Therapist</Text>
              <View style={styles.dropdown}>
                <TextInput
                  style={styles.dropdownInput}
                  placeholder="Select therapist"
                  value={therapists.find(t => t._id === newChild.therapistId)?.name || ''}
                  editable={false}
                />
                <TouchableOpacity
                  style={styles.dropdownButton}
                  onPress={() => Alert.alert('Select Therapist', 'In a full implementation, this would show a dropdown')}
                >
                  <Text style={styles.dropdownButtonText}>Select</Text>
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity style={styles.submitButton} onPress={handleAddChild}>
              <Ionicons name="add" size={20} color="#fff" />
              <Text style={styles.submitButtonText}>Add Child</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Edit Child Form */}
      {editingChild && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Edit Child</Text>
          <View style={styles.formContainer}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>First Name</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Enter first name"
                value={editingChildData.firstName}
                onChangeText={(text) => setEditingChildData({ ...editingChildData, firstName: text })}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Last Name</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Enter last name"
                value={editingChildData.lastName}
                onChangeText={(text) => setEditingChildData({ ...editingChildData, lastName: text })}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Date of Birth</Text>
              <TextInput
                style={styles.textInput}
                placeholder="YYYY-MM-DD"
                value={editingChildData.dateOfBirth}
                onChangeText={(text) => setEditingChildData({ ...editingChildData, dateOfBirth: text })}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Diagnosis</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Enter diagnosis"
                value={editingChildData.diagnosis}
                onChangeText={(text) => setEditingChildData({ ...editingChildData, diagnosis: text })}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Parent</Text>
              <View style={styles.dropdown}>
                <TextInput
                  style={styles.dropdownInput}
                  placeholder="Select parent"
                  value={parents.find(p => p._id === editingChildData.parentId)?.name || ''}
                  editable={false}
                />
                <TouchableOpacity
                  style={styles.dropdownButton}
                  onPress={() => Alert.alert('Select Parent', 'In a full implementation, this would show a dropdown')}
                >
                  <Text style={styles.dropdownButtonText}>Select</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Assigned Therapist</Text>
              <View style={styles.dropdown}>
                <TextInput
                  style={styles.dropdownInput}
                  placeholder="Select therapist"
                  value={therapists.find(t => t._id === editingChildData.therapistId)?.name || ''}
                  editable={false}
                />
                <TouchableOpacity
                  style={styles.dropdownButton}
                  onPress={() => Alert.alert('Select Therapist', 'In a full implementation, this would show a dropdown')}
                >
                  <Text style={styles.dropdownButtonText}>Select</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.editButtonContainer}>
              <TouchableOpacity style={[styles.actionButton, { flex: 1, marginRight: 8 }]} onPress={cancelEdit}>
                <Text style={styles.actionText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.submitButton, { flex: 1, marginLeft: 8 }]} onPress={handleUpdateChild}>
                <Text style={styles.submitButtonText}>Update</Text>
              </TouchableOpacity>
            </View>
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

                <View style={styles.actionButtons}>
                  <TouchableOpacity
                    style={[styles.iconButton, { marginRight: 8 }]}
                    onPress={() => handleEditChild(child)}
                  >
                    <Ionicons name="create" size={20} color="#007AFF" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.iconButton}
                    onPress={() => handleDeleteChild(child._id)}
                  >
                    <Ionicons name="trash" size={20} color="#FF3B30" />
                  </TouchableOpacity>
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

                <View style={styles.detailRow}>
                  <Ionicons name="checkbox" size={16} color="#8E8E93" />
                  <Text style={styles.detailText}>IEP Progress: {child.iepProgress || 'Not tracked'}</Text>
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
  editButtonContainer: {
    flexDirection: 'row',
    marginTop: 10,
  },
  actionButton: {
    backgroundColor: '#F2F2F7',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionText: {
    color: '#1A1A1A',
    fontWeight: '500',
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
  actionButtons: {
    flexDirection: 'row',
  },
  iconButton: {
    padding: 5,
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
});

export default ChildrenSection;