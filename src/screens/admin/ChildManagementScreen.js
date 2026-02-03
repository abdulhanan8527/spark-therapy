import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert, ActivityIndicator, Modal, FlatList, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { childAPI, therapistAPI, userAPI } from '../../services/api';

const ChildManagementScreen = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [children, setChildren] = useState([]);

  // Selection states
  const [parents, setParents] = useState([]);
  const [therapists, setTherapists] = useState([]);
  const [showParentPicker, setShowParentPicker] = useState(false);
  const [showTherapistPicker, setShowTherapistPicker] = useState(false);
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [isEditingMode, setIsEditingMode] = useState(false); // To track if we are selecting for add or edit

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
      // Check if user is admin before fetching data
      console.log("Checking if user is admin...")
      if (user?.role !== 'admin') {
        Alert.alert('Access Denied', 'You must be logged in as an admin to access this screen.');
        return;
      }
      // Fetch children first, then users
      console.log("Fetching children and users for admin screen...")
      await fetchChildren();
      await fetchUsers();
    };

    checkAuthAndFetch();
  }, [user]);

  const fetchChildren = async () => {
    console.log('Fetching children...');
    try {
      setLoading(true);
      const res = await childAPI.getChildren();
      console.log('Children API response:', res);
      // Handle response based on its actual structure
      if (res && typeof res === 'object') {
        if (res.success === true) {
          console.log('Children API response success:', res.data);
          // Standard response format
          setChildren(Array.isArray(res.data) ? res.data : []);
        } else if (Array.isArray(res)) {
          // Direct array response
          setChildren(res);
        } else if (res.data && Array.isArray(res.data)) {
          // Fallback: response has data property that is an array
          setChildren(res.data);
        } else {
          // Unexpected format, set to empty array
          console.warn('Unexpected response format when fetching children:', res);
          setChildren([]);
          if (res.message) {
            Alert.alert('Warning', res.message || 'Unexpected response format');
          }
        }
      } else {
        // Non-object response
        console.error('Non-object response when fetching children:', res);
        setChildren([]);
        Alert.alert('Error', 'Received unexpected response format from server');
      }
    } catch (error) {
      console.error('Error fetching children:', error?.message || error);
      console.error('Error details:', {
        message: error?.message,
        status: error?.response?.status,
        data: error?.response?.data,
        url: error?.request?.responseURL
      });

      // Use the error message from the API service which should now be more descriptive
      Alert.alert('Error', error?.message || 'Failed to fetch children list');
      setChildren([]); // Ensure children list is cleared on error
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      console.log('Fetching users for selection...');
      
      // Fetch parents
      const parentsRes = await userAPI.getUsersByRole('parent');
      console.log('Parents API response:', parentsRes);
      
      if (parentsRes?.success) {
        // Handle different response structures for parents
        let parentList = [];
        if (Array.isArray(parentsRes.data)) {
          parentList = parentsRes.data;
        } else if (parentsRes.data?.users && Array.isArray(parentsRes.data.users)) {
          parentList = parentsRes.data.users;
        } else if (parentsRes.data?.data && Array.isArray(parentsRes.data.data)) {
          parentList = parentsRes.data.data;
        } else {
          parentList = [parentsRes.data]; // Fallback single object
        }
        setParents(Array.isArray(parentList) ? parentList : []);
        console.log('Set parents:', Array.isArray(parentList) ? parentList.length : 0);
      } else {
        console.log('Parents API response not successful:', parentsRes);
        setParents([]);
      }

      // Fetch therapists
      const therapistsRes = await therapistAPI.getAllTherapists();
      console.log('Therapists API response:', therapistsRes);
      
      if (therapistsRes?.success) {
        // Handle different response structures for therapists
        let therapistList = [];
        if (Array.isArray(therapistsRes.data)) {
          therapistList = therapistsRes.data;
        } else if (therapistsRes.data?.therapists && Array.isArray(therapistsRes.data.therapists)) {
          therapistList = therapistsRes.data.therapists;
        } else if (therapistsRes.data?.data && Array.isArray(therapistsRes.data.data)) {
          therapistList = therapistsRes.data.data;
        } else {
          therapistList = [therapistsRes.data]; // Fallback single object
        }
        setTherapists(Array.isArray(therapistList) ? therapistList : []);
        console.log('Set therapists:', Array.isArray(therapistList) ? therapistList.length : 0);
      } else {
        console.log('Therapists API response not successful:', therapistsRes);
        setTherapists([]);
      }
    } catch (error) {
      console.error('Error fetching users for selection:', error);
      console.error('Error details:', {
        message: error?.message,
        stack: error?.stack,
        status: error?.response?.status,
        data: error?.response?.data
      });
      Alert.alert('Error', 'Failed to load list of parents or therapists. Check console for details.');
      setParents([]);
      setTherapists([]);
    }
  };

  const getUserName = (id, list) => {
    if (!id) return '';
    const found = list.find(u => u._id === id);
    return found ? `${found.name} (${found.email})` : id;
  };

  const handleSelectUser = (user, type) => {
    if (isEditingMode) {
      if (type === 'parent') {
        setEditingChildData(prev => ({ ...prev, parentId: user._id }));
        setShowParentPicker(false);
      } else {
        setEditingChildData(prev => ({ ...prev, therapistId: user._id }));
        setShowTherapistPicker(false);
      }
    } else {
      if (type === 'parent') {
        setNewChild(prev => ({ ...prev, parentId: user._id }));
        setShowParentPicker(false);
      } else {
        setNewChild(prev => ({ ...prev, therapistId: user._id }));
        setShowTherapistPicker(false);
      }
    }
    setUserSearchQuery('');
  };

  const openPicker = (type, isEdit) => {
    setIsEditingMode(isEdit);
    setUserSearchQuery('');
    if (type === 'parent') setShowParentPicker(true);
    else setShowTherapistPicker(true);
  };

  const renderUserPickerModal = (visible, onClose, data, type) => {
    const filteredData = data.filter(u =>
      u.name.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearchQuery.toLowerCase())
    );

    return (
      <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select {type === 'parent' ? 'Parent' : 'Therapist'}</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalSearch}>
              <Ionicons name="search" size={20} color="#888" />
              <TextInput
                style={styles.modalSearchInput}
                placeholder="Search by name or email..."
                value={userSearchQuery}
                onChangeText={setUserSearchQuery}

                autoFocus={false}
              />
            </View>

            <FlatList
              data={filteredData}
              keyExtractor={item => item._id}
              initialNumToRender={10}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.userItem}
                  onPress={() => handleSelectUser(item, type)}
                >
                  <View style={[styles.avatar, { backgroundColor: type === 'parent' ? '#007AFF' : '#34C759' }]}>
                    <Text style={{ color: '#fff', fontWeight: 'bold' }}>
                      {item.name.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <View>
                    <Text style={styles.userName}>{item.name}</Text>
                    <Text style={styles.userEmail}>{item.email}</Text>
                    {item.specialization && <Text style={styles.userMeta}>{item.specialization}</Text>}
                  </View>
                </TouchableOpacity>
              )}
              ListEmptyComponent={() => (
                <View style={styles.emptyState}>
                  <Text style={{ color: '#888' }}>No users found</Text>
                </View>
              )}
            />
          </View>
        </SafeAreaView>
      </Modal>
    );
  }
  
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
      Alert.alert('Error', 'Please enter a parent ID');
      return;
    }
    
    // Validate date format if provided
    if (newChild.dateOfBirth && !isValidDate(newChild.dateOfBirth)) {
      Alert.alert('Error', 'Please enter a valid date of birth (YYYY-MM-DD)');
      return;
    }
    
    // Validate name format
    if (!/^[a-zA-Z\s'-]+$/.test(newChild.firstName.trim())) {
      Alert.alert('Error', 'First name can only contain letters, spaces, hyphens, and apostrophes');
      return;
    }
    if (!/^[a-zA-Z\s'-]+$/.test(newChild.lastName.trim())) {
      Alert.alert('Error', 'Last name can only contain letters, spaces, hyphens, and apostrophes');
      return;
    }
    
    // Validate parent ID format (MongoDB ObjectId)
    if (!/^[0-9a-fA-F]{24}$/.test(newChild.parentId.trim())) {
      Alert.alert('Error', 'Please enter a valid parent ID (24-character hexadecimal)');
      return;
    }
    
    // Validate therapist ID format if provided
    if (newChild.therapistId && newChild.therapistId.trim() && !/^[0-9a-fA-F]{24}$/.test(newChild.therapistId.trim())) {
      Alert.alert('Error', 'Please enter a valid therapist ID (24-character hexadecimal)');
      return;
    }
    
    try {
    // Prepare child data with properly formatted date
    const childDataToSend = {
      ...newChild,
      // Format date for API if provided
      ...(newChild.dateOfBirth && { dateOfBirth: formatDateForAPI(newChild.dateOfBirth) }),
    };

    const res = await childAPI.createChild(childDataToSend);
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
      fetchChildren();
    } else {
      Alert.alert('Error', res.message || 'Failed to add child');
    }
  } catch (error) {
    console.error('Error adding child:', error?.message || error);
    Alert.alert('Error', error?.message || 'Failed to add child');
  }
  };

  const isValidDate = (dateString) => {
    if (!dateString) return false;

    // Check if date is in YYYY-MM-DD format
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(dateString)) {
      return false;
    }

    // Parse the date and check if it's valid
    const date = new Date(dateString);
    const timestamp = date.getTime();

    if (typeof timestamp !== 'number' || Number.isNaN(timestamp)) {
      return false;
    }

    // Check if the date string matches the input (to avoid invalid dates like 2023-02-30)
    // Also handle timezone offset differences
    const isoString = date.toISOString().split('T')[0];
    return isoString === dateString;
  };

  // Function to convert date string to ISO format for API
  const formatDateForAPI = (dateString) => {
    if (!dateString) return null;

    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return null;
    }

    // Return ISO string which is what the backend expects
    return date.toISOString();
  };

  // Function to format date input as user types
  const formatDateString = (input) => {
    // Remove any non-digit characters
    const cleanedInput = input.replace(/\D/g, '');

    if (cleanedInput.length <= 4) {
      return cleanedInput;
    } else if (cleanedInput.length <= 6) {
      return `${cleanedInput.slice(0, 4)}-${cleanedInput.slice(4)}`;
    } else {
      return `${cleanedInput.slice(0, 4)}-${cleanedInput.slice(4, 6)}-${cleanedInput.slice(6, 8)}`;
    }
  };

  // Handler for date input changes
  const handleDateChange = (text, setFunction, field) => {
    // Only allow digits and hyphens
    const cleanText = text.replace(/[^\d-]/g, '');

    // Format the date as user types
    const formattedText = formatDateString(cleanText);

    // Update the state
    setFunction(prev => ({
      ...prev,
      [field]: formattedText
    }));
  };

  // Handler for editing child date input changes
  const handleEditDateChange = (text) => {
    // Only allow digits and hyphens
    const cleanText = text.replace(/[^\d-]/g, '');

    // Format the date as user types
    const formattedText = formatDateString(cleanText);

    // Update the state
    setEditingChildData(prev => ({
      ...prev,
      dateOfBirth: formattedText
    }));
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
      firstName: child.firstName,
      lastName: child.lastName,
      dateOfBirth: child.dateOfBirth || '',
      diagnosis: child.diagnosis,
      parentId: child.parentId,
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
      Alert.alert('Error', 'Please enter a parent ID');
      return;
    }

    // Validate date format if provided
    if (editingChildData.dateOfBirth && !isValidDate(editingChildData.dateOfBirth)) {
      Alert.alert('Error', 'Please enter a valid date of birth (YYYY-MM-DD)');
      return;
    }

    // Validate name format
    if (!/^[a-zA-Z\s'-]+$/.test(editingChildData.firstName.trim())) {
      Alert.alert('Error', 'First name can only contain letters, spaces, hyphens, and apostrophes');
      return;
    }
    if (!/^[a-zA-Z\s'-]+$/.test(editingChildData.lastName.trim())) {
      Alert.alert('Error', 'Last name can only contain letters, spaces, hyphens, and apostrophes');
      return;
    }

    // Validate parent ID format (MongoDB ObjectId)
    if (!/^[0-9a-fA-F]{24}$/.test(editingChildData.parentId.trim())) {
      Alert.alert('Error', 'Please enter a valid parent ID (24-character hexadecimal)');
      return;
    }

    // Validate therapist ID format if provided
    if (editingChildData.therapistId && editingChildData.therapistId.trim() && !/^[0-9a-fA-F]{24}$/.test(editingChildData.therapistId.trim())) {
      Alert.alert('Error', 'Please enter a valid therapist ID (24-character hexadecimal)');
      return;
    }

    try {
      // Prepare child data with properly formatted date
      const childDataToSend = {
        ...editingChildData,
        // Format date for API if provided
        ...(editingChildData.dateOfBirth && { dateOfBirth: formatDateForAPI(editingChildData.dateOfBirth) }),
      };

      const res = await childAPI.updateChild(editingChild, childDataToSend);
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

  const filteredChildren = Array.isArray(children) ? children.filter(child =>
    child &&
    (`${child.firstName || ''} ${child.lastName || ''}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (child.diagnosis || '').toLowerCase().includes(searchQuery.toLowerCase()))
  ) : [];

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Child Management</Text>

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
            <Ionicons name="person-add" size={20} color="#fff" />
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
                onChangeText={(text) => handleDateChange(text, setNewChild, 'dateOfBirth')}
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
              <Text style={styles.label}>Parent (Required)</Text>
              <TouchableOpacity
                style={styles.selectorButton}
                onPress={() => openPicker('parent', false)}
              >
                <Text style={[styles.selectorText, !newChild.parentId && styles.placeholderText]}>
                  {newChild.parentId ? getUserName(newChild.parentId, parents) : 'Select Parent'}
                </Text>
                <Ionicons name="chevron-down" size={20} color="#666" />
              </TouchableOpacity>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Therapist (Optional)</Text>
              <TouchableOpacity
                style={styles.selectorButton}
                onPress={() => openPicker('therapist', false)}
              >
                <Text style={[styles.selectorText, !newChild.therapistId && styles.placeholderText]}>
                  {newChild.therapistId ? getUserName(newChild.therapistId, therapists) : 'Select Therapist'}
                </Text>
                <Ionicons name="chevron-down" size={20} color="#666" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.submitButton} onPress={handleAddChild}>
              <Ionicons name="person-add" size={20} color="#fff" />
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
                onChangeText={handleEditDateChange}
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
              <Text style={styles.label}>Parent (Required)</Text>
              <TouchableOpacity
                style={styles.selectorButton}
                onPress={() => openPicker('parent', true)}
              >
                <Text style={[styles.selectorText, !editingChildData.parentId && styles.placeholderText]}>
                  {editingChildData.parentId ? getUserName(editingChildData.parentId, parents) : 'Select Parent'}
                </Text>
                <Ionicons name="chevron-down" size={20} color="#666" />
              </TouchableOpacity>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Therapist (Optional)</Text>
              <TouchableOpacity
                style={styles.selectorButton}
                onPress={() => openPicker('therapist', true)}
              >
                <Text style={[styles.selectorText, !editingChildData.therapistId && styles.placeholderText]}>
                  {editingChildData.therapistId ? getUserName(editingChildData.therapistId, therapists) : 'Select Therapist'}
                </Text>
                <Ionicons name="chevron-down" size={20} color="#666" />
              </TouchableOpacity>
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
                  <Text style={styles.detailText}>Parent ID: {parents.find(p => p._id === child.parentId)?.name || 'N/A'}</Text>
                </View>

                <View style={styles.detailRow}>
                  <Ionicons name="person" size={16} color="#8E8E93" />
                  <Text style={styles.detailText}>Therapist ID: {therapists.find(t => t._id === child.therapistId)?.name || 'Unassigned'}</Text>
                </View>

                <View style={styles.detailRow}>
                  <Ionicons name="calendar" size={16} color="#8E8E93" />
                  <Text style={styles.detailText}>
                    DOB: {child.dateOfBirth ? (() => {
                      try {
                        const date = new Date(child.dateOfBirth);
                        if (isNaN(date.getTime())) {
                          return 'Invalid Date';
                        }
                        return date.toLocaleDateString();
                      } catch (e) {
                        return 'Invalid Date';
                      }
                    })() : 'N/A'}
                  </Text>
                </View>
              </View>
            </View>
          ))}

          {filteredChildren.length === 0 && (
            <View style={styles.emptyState}>
              <Ionicons name="people" size={40} color="#8E8E93" />
              <Text style={styles.emptyStateText}>No children found</Text>
              <Text style={styles.emptyStateSubtext}>Try adjusting your search criteria</Text>
            </View>
          )}
        </View>
      </View>


      {/* Pickers */}
      {renderUserPickerModal(showParentPicker, () => setShowParentPicker(false), parents, 'parent')}
      {renderUserPickerModal(showTherapistPicker, () => setShowTherapistPicker(false), therapists, 'therapist')}

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
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  childrenList: {
    gap: 12,
  },
  childCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  childHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  childInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#34C759',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  childName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  childDetails: {
    fontSize: 14,
    color: '#666',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  iconButton: {
    padding: 8,
  },

  selectorButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#fff',
  },
  selectorText: {
    fontSize: 16,
    color: '#333',
  },
  placeholderText: {
    color: '#999',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 20,
    height: '80%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 4,
  },
  modalSearch: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f1f1',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 16,
  },
  modalSearchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f1f1',
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
  },
  userMeta: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  childDetailsContainer: {
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
  childStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
  editButtonContainer: {
    flexDirection: 'row',
    marginTop: 8,
  },
  actionButton: {
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  actionText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ChildManagementScreen;