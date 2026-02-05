import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, FlatList, Modal, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { programAPI, therapistAPI } from '../../services/api';

// Import ABLLS-R Skills from the types file
// Note: We'll need to adapt the types for React Native
import { ABLLS_SKILLS, DOMAIN_COLORS_MAP } from '../../components/therapist/ProgramBuilderTypes';

export default function ProgramBuilderScreen({ route }) {
  const { user } = useAuth();
  const { childId: routeChildId, childName: routeChildName } = route.params || {};
  
  // State for child selection
  const [children, setChildren] = useState([]);
  const [selectedChild, setSelectedChild] = useState(null);
  const [loadingChildren, setLoadingChildren] = useState(true);
  
  // Use selected child or route params
  const childId = selectedChild?._id || routeChildId;
  const childName = selectedChild ? `${selectedChild.firstName} ${selectedChild.lastName}` : routeChildName;
  
  // State for programs
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);

  // State for form inputs
  const [searchQuery, setSearchQuery] = useState('');
  const [showABLLSForm, setShowABLLSForm] = useState(false);
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [newProgramCodes, setNewProgramCodes] = useState('');
  const [customProgram, setCustomProgram] = useState({
    title: '',
    category: '',
    shortDescription: '',
    longDescription: '',
    masteryCriteria: '',
    dataCollectionMethod: 'frequency'
  });
  
  // State for autocomplete
  const [autocompleteSuggestions, setAutocompleteSuggestions] = useState([]);
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [newTarget, setNewTarget] = useState('');

  // Load therapist's children on mount
  useEffect(() => {
    loadChildren();
  }, []);

  // Load programs when child is selected
  useEffect(() => {
    if (childId && typeof childId === 'string' && childId.length === 24) {
      loadPrograms();
    } else {
      setPrograms([]);
      setLoading(false);
    }
  }, [childId]);

  const loadChildren = async () => {
    try {
      setLoadingChildren(true);
      console.log('Loading therapist children for user:', user._id);
      const response = await therapistAPI.getChildren(user._id);
      console.log('Children response:', response);
      
      if (response.success && Array.isArray(response.data)) {
        setChildren(response.data);
        // Auto-select first child if coming from route or only one child
        if (routeChildId) {
          const child = response.data.find(c => c._id === routeChildId);
          if (child) setSelectedChild(child);
        } else if (response.data.length === 1) {
          setSelectedChild(response.data[0]);
        }
      }
    } catch (error) {
      console.error('Error loading children:', error);
      Alert.alert('Error', 'Failed to load children');
    } finally {
      setLoadingChildren(false);
    }
  };

  const loadPrograms = async () => {
    if (!childId || typeof childId !== 'string' || childId.length !== 24) {
      setPrograms([]);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const response = await programAPI.getProgramsByChild(childId).catch(() => ({ success: false, data: [] }));
      if (response?.success && Array.isArray(response?.data)) {
        // Map backend response to match frontend expectations
        const mappedPrograms = response.data.map(program => ({
          id: program._id || program.id,
          childId: program.childId,
          therapistId: user?._id || 'unknown',
          title: program.title,
          code: program.abllsCode, // Map abllsCode to code
          domain: program.category && ABLLS_SKILLS.some(skill => skill.code === program.category) ? program.category : undefined, // Determine if it's an ABLLS program
          category: program.category && ABLLS_SKILLS.some(skill => skill.code === program.category) ? undefined : program.category, // Only set category if not an ABLLS code
          shortDescription: program.shortDescription,
          longDescription: program.longDescription,
          masteryCriteria: program.masteryCriteria,
          dataCollectionMethod: program.dataCollectionMethod || 'frequency',
          targets: program.targets ? program.targets.map(t => ({
            id: t._id || t.id,
            description: t.description,
            mastered: t.isMastered,
            masteryDate: t.masteredDate
          })) : [],
          isActive: !program.isArchived,
          archivedAt: program.archivedDate,
          createdAt: program.createdAt,
          updatedAt: program.updatedAt
        }));
        setPrograms(mappedPrograms);
      }
    } catch (error) {
      console.error('Error loading programs:', error);
      Alert.alert('Error', 'Failed to load programs: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Filter programs based on search
  const filteredPrograms = useMemo(() => {
    if (!searchQuery) return programs;
    
    return programs.filter(program => 
      program.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      program.shortDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (program.category && program.category.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (program.domain && program.domain.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [programs, searchQuery]);

  // Handle autocomplete suggestions for ABLLS-R codes
  const handleAutocomplete = (value) => {
    setSearchQuery(value);
    
    if (value.length >= 1) {
      const suggestions = ABLLS_SKILLS.filter(skill =>
        skill.code.toLowerCase().startsWith(value.toLowerCase()) ||
        skill.description.toLowerCase().includes(value.toLowerCase())
      ).slice(0, 5); // Limit to 5 suggestions
      
      setAutocompleteSuggestions(suggestions);
      setShowAutocomplete(true);
    } else {
      setShowAutocomplete(false);
    }
  };

  // Handle selecting an autocomplete suggestion
  const handleSelectSuggestion = (skill) => {
    setSearchQuery('');
    setShowAutocomplete(false);
    
    // Add the selected skill as a program
    const newProgram = {
      id: `prog-${Date.now()}-${Math.random()}`,
      childId: childId || 'emma-johnson',
      therapistId: user?._id || 'dr-smith',
      title: skill.code,
      code: skill.code,
      domain: skill.domain,
      shortDescription: skill.description,
      dataCollectionMethod: 'trial-by-trial',
      targets: [],
      isActive: true,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0]
    };
    
    setPrograms([...programs, newProgram]);
  };

  // Group programs by type
  const abllsPrograms = filteredPrograms.filter(p => p.domain);
  const customPrograms = filteredPrograms.filter(p => p.category);

  // Handle ABLLS-R program addition
  const handleAddABLLSPrograms = async () => {
    const codes = newProgramCodes.split(/\s+/).filter(code => code.trim());
    
    for (const code of codes) {
      const skill = ABLLS_SKILLS.find(s => s.code === code.toUpperCase());
      if (!skill) continue;
      
      try {
        // Create program data in the format expected by the backend
        const programData = {
          childId: childId,
          title: skill.code,
          abllsCode: skill.code,
          category: skill.domain, // For ABLLS programs, domain serves as category
          shortDescription: skill.description,
          dataCollectionMethod: 'frequency',
          targets: []
        };
        
        const response = await programAPI.createProgram(programData);
        
        if (response.success && response.data) {
          // Refresh the list of programs
          await loadPrograms();
        } else {
          Alert.alert('Error', `Failed to create program ${skill.code}: ${response.message || 'Unknown error'}`);
        }
      } catch (error) {
        console.error('Error creating ABLLS program:', error);
        Alert.alert('Error', `Failed to create program ${skill.code}: ${error.message}`);
      }
    }
    
    setNewProgramCodes('');
    setShowABLLSForm(false);
  };

  // Handle custom program creation
  const handleCreateCustomProgram = async () => {
    if (!customProgram.title || !customProgram.category) {
      Alert.alert('Error', 'Please fill in required fields (Title and Category)');
      return;
    }

    try {
      // Create program data in the format expected by the backend
      const programData = {
        childId: childId,
        title: customProgram.title,
        category: customProgram.category,
        shortDescription: customProgram.shortDescription,
        longDescription: customProgram.longDescription,
        masteryCriteria: customProgram.masteryCriteria,
        dataCollectionMethod: customProgram.dataCollectionMethod,
        targets: []
      };
      
      const response = await programAPI.createProgram(programData);
      
      if (response.success && response.data) {
        // Refresh the list of programs
        await loadPrograms();
        setCustomProgram({
          title: '',
          category: '',
          shortDescription: '',
          longDescription: '',
          masteryCriteria: '',
          dataCollectionMethod: 'frequency'
        });
        setShowCustomForm(false);
      } else {
        Alert.alert('Error', `Failed to create program: ${response.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error creating custom program:', error);
      Alert.alert('Error', `Failed to create program: ${error.message}`);
    }
  };

  // Handle adding a target to a program
  const handleAddTarget = async (programId, targetDescription) => {
    if (!targetDescription.trim()) return;
    
    try {
      // Prepare the new target
      const targetData = {
        description: targetDescription,
        isMastered: false
      };
      
      // Call the backend API to add the target
      const response = await programAPI.addTarget(programId, targetData);
      
      if (response.success) {
        // Reload programs to reflect the changes
        await loadPrograms();
      } else {
        Alert.alert('Error', `Failed to add target: ${response.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error adding target:', error);
      Alert.alert('Error', `Failed to add target: ${error.message}`);
    }
  };

  // Handle toggling target mastery
  const handleToggleTarget = async (programId, targetId) => {
    try {
      // Find the target in the current programs to get its current state
      const program = programs.find(p => p.id === programId);
      if (!program) {
        Alert.alert('Error', 'Program not found');
        return;
      }
      
      const target = program.targets.find(t => t.id === targetId);
      if (!target) {
        Alert.alert('Error', 'Target not found');
        return;
      }
      
      // Toggle the mastered status
      const newMasteredStatus = !target.mastered;
      
      // Call the backend API to update the target
      const targetData = {
        isMastered: newMasteredStatus,
        ...(newMasteredStatus && { masteredDate: new Date().toISOString() })
      };
      
      const response = await programAPI.updateTarget(programId, targetId, targetData);
      
      if (response.success) {
        // Reload programs to reflect the changes
        await loadPrograms();
      } else {
        Alert.alert('Error', `Failed to update target: ${response.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error toggling target:', error);
      Alert.alert('Error', `Failed to toggle target: ${error.message}`);
    }
  };
  
  // Handle removing a target from a program
  const handleRemoveTarget = async (programId, targetId) => {
    try {
      Alert.alert(
        'Confirm Removal', 
        'Are you sure you want to remove this target?',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Remove', 
            style: 'destructive',
            onPress: async () => {
              const response = await programAPI.removeTarget(programId, targetId);
              
              if (response.success) {
                // Reload programs to reflect the changes
                await loadPrograms();
              } else {
                Alert.alert('Error', `Failed to remove target: ${response.message || 'Unknown error'}`);
              }
            }
          }
        ]
      );
    } catch (error) {
      console.error('Error removing target:', error);
      Alert.alert('Error', `Failed to remove target: ${error.message}`);
    }
  };

  // Handle archiving a program
  const handleArchiveProgram = async (programId) => {
    try {
      const response = await programAPI.deleteProgram(programId);
      
      if (response.success) {
        // Reload programs to reflect the changes
        await loadPrograms();
      } else {
        Alert.alert('Error', `Failed to archive program: ${response.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error archiving program:', error);
      Alert.alert('Error', `Failed to archive program: ${error.message}`);
    }
  };

  // Render program card
  const renderProgramCard = ({ item: program }) => {
    // State for localNewTarget is managed at the component level now
    const localNewTarget = route.params?.localNewTargetMap?.[program.id] || '';

    const handleAddLocalTarget = () => {
      if (localNewTarget.trim()) {
        handleAddTarget(program.id, localNewTarget);
        // Need to update the route params or use a different approach
        // Since we can't use useState here, we'll use a different approach
      }
    };

    // Use a separate component for the input field that can manage its own state
    const AddTargetInput = () => {
      const [inputValue, setInputValue] = useState('');
      
      const handleAddLocalTarget = () => {
        if (inputValue.trim()) {
          handleAddTarget(program.id, inputValue);
          setInputValue('');
        }
      };
      
      return (
        <View style={styles.addTargetContainer}>
          <TextInput
            style={styles.addTargetInput}
            value={inputValue}
            onChangeText={setInputValue}
            placeholder="Add new target..."
          />
          <TouchableOpacity 
            style={styles.addTargetButton}
            onPress={handleAddLocalTarget}
          >
            <Ionicons name="add-outline" size={16} color="#fff" />
            <Text style={styles.addTargetButtonText}>Add</Text>
          </TouchableOpacity>
        </View>
      );
    };

    return (
      <View style={styles.programCard}>
        <View style={styles.programHeader}>
          <View style={styles.programTitleSection}>
            {program.domain && (
              <View style={[styles.domainTag, { backgroundColor: DOMAIN_COLORS_MAP[program.domain] }]}>
                <Text style={styles.domainTagText}>{program.domain}</Text>
              </View>
            )}
            {program.category && (
              <View style={styles.categoryTag}>
                <Text style={styles.categoryTagText}>{program.category}</Text>
              </View>
            )}
            <Text style={styles.programTitle}>{program.title}</Text>
          </View>
          <View style={styles.programActions}>
            <TouchableOpacity style={styles.iconButton}>
              <Ionicons name="create-outline" size={16} color="#666" />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.iconButton}
              onPress={() => handleArchiveProgram(program.id)}
            >
              <Ionicons name="archive-outline" size={16} color="#666" />
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.programDescription}>{program.shortDescription}</Text>

        {program.longDescription && (
          <Text style={styles.programLongDescription}>{program.longDescription}</Text>
        )}

        {program.masteryCriteria && (
          <View style={styles.masterySection}>
            <Text style={styles.masteryLabel}>Mastery Criteria:</Text>
            <Text style={styles.masteryText}>{program.masteryCriteria}</Text>
          </View>
        )}

        <Text style={styles.targetsLabel}>Targets:</Text>
        {program.targets.length > 0 ? (
          <View style={styles.targetsContainer}>
            {program.targets.map(target => (
              <View key={target.id} style={styles.targetItemContainer}>
                <View style={styles.targetItem}>
                  <TouchableOpacity 
                    onPress={() => handleToggleTarget(program.id, target.id)}
                    style={[
                      styles.targetCheckbox, 
                      target.mastered && styles.targetCheckboxChecked
                    ]}
                  >
                    {target.mastered && <Ionicons name="checkmark-outline" size={12} color="#fff" />}
                  </TouchableOpacity>
                  <Text 
                    style={[
                      styles.targetDescription, 
                      target.mastered && styles.targetDescriptionCompleted
                    ]}
                  >
                    {target.description}
                  </Text>
                  {target.mastered && target.masteryDate && (
                    <Text style={styles.masteryDate}>{target.masteryDate}</Text>
                  )}
                </View>
                <TouchableOpacity 
                  style={styles.removeTargetButton}
                  onPress={() => handleRemoveTarget(program.id, target.id)}
                >
                  <Ionicons name="trash-outline" size={16} color="#ef4444" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        ) : (
          <Text style={styles.noTargetsText}>No targets added yet</Text>
        )}

        <AddTargetInput />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Program Builder</Text>
        <Text style={styles.headerSubtitle}>Managing therapy programs for {childName || 'child'}</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Child Selection */}
        {loadingChildren ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#007AFF" />
            <Text style={styles.loadingText}>Loading children...</Text>
          </View>
        ) : (
          <View style={styles.childSelectorContainer}>
            <Text style={styles.childSelectorLabel}>Select Child:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.childScrollView}>
              {children.map((child) => (
                <TouchableOpacity
                  key={child._id}
                  style={[
                    styles.childButton,
                    selectedChild?._id === child._id && styles.selectedChildButton
                  ]}
                  onPress={() => setSelectedChild(child)}
                >
                  <Text style={[
                    styles.childButtonText,
                    selectedChild?._id === child._id && styles.selectedChildButtonText
                  ]}>
                    {child.firstName} {child.lastName}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            {children.length === 0 && (
              <Text style={styles.noChildrenText}>No children assigned to you</Text>
            )}
          </View>
        )}

        {/* Show message if no child selected */}
        {!childId && !loadingChildren && (
          <View style={styles.noChildSelectedCard}>
            <Ionicons name="person-outline" size={48} color="#ccc" />
            <Text style={styles.noChildSelectedText}>Please select a child to manage programs</Text>
          </View>
        )}

        {/* Only show program management if child is selected */}
        {childId && (
          <>
            {/* Search and Filters */}
            <View style={styles.card}>
              <View style={styles.searchContainer}>
                <Ionicons name="search-outline" size={20} color="#888" style={styles.searchIcon} />
                <TextInput
                  style={styles.searchInput}
                  value={searchQuery}
                  onChangeText={handleAutocomplete}
                  placeholder="Search programs..."
                />
              </View>
              
              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={styles.abllsButton}
                  onPress={() => setShowABLLSForm(!showABLLSForm)}
                >
                  <Ionicons name="book-outline" size={16} color="#fff" />
                  <Text style={styles.abllsButtonText}>ABLLS-R</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.customButton}
                  onPress={() => setShowCustomForm(!showCustomForm)}
                >
                  <Ionicons name="add-outline" size={16} color="#fff" />
                  <Text style={styles.customButtonText}>Custom</Text>
                </TouchableOpacity>
              </View>
            </View>

        {/* ABLLS-R Quick Add Form */}
        {showABLLSForm && (
          <View style={[styles.card, styles.abllsFormCard]}>
            <Text style={styles.formTitle}>Add ABLLS-R Programs</Text>
            <Text style={styles.formSubtitle}>
              Enter ABLLS-R codes separated by spaces (e.g., "A15 C15 G10 Y8")
            </Text>
            <TextInput
              style={styles.textArea}
              value={newProgramCodes}
              onChangeText={setNewProgramCodes}
              placeholder="A15 C15 G10 Y8"
              multiline
            />
            <View style={styles.formButtonRow}>
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={handleAddABLLSPrograms}
              >
                <Text style={styles.primaryButtonText}>Add Programs</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowABLLSForm(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Custom Program Form */}
        {showCustomForm && (
          <View style={[styles.card, styles.customFormCard]}>
            <Text style={styles.formTitle}>Create Custom Program</Text>
            <View style={styles.formFields}>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Program Name *</Text>
                <TextInput
                  style={styles.input}
                  value={customProgram.title}
                  onChangeText={(text) => setCustomProgram({...customProgram, title: text})}
                  placeholder="e.g., /k/ in initial position"
                />
              </View>
              
              <View style={styles.formGroup}>
                <Text style={styles.label}>Category *</Text>
                <TextInput
                  style={styles.input}
                  value={customProgram.category}
                  onChangeText={(text) => setCustomProgram({...customProgram, category: text})}
                  placeholder="e.g., Articulation, Expressive Language"
                />
              </View>
              
              <View style={styles.formGroup}>
                <Text style={styles.label}>Short Description</Text>
                <TextInput
                  style={styles.input}
                  value={customProgram.shortDescription}
                  onChangeText={(text) => setCustomProgram({...customProgram, shortDescription: text})}
                  placeholder="Brief description of the program"
                />
              </View>
              
              <View style={styles.formGroup}>
                <Text style={styles.label}>Detailed Description</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={customProgram.longDescription}
                  onChangeText={(text) => setCustomProgram({...customProgram, longDescription: text})}
                  placeholder="Detailed procedures and teaching methods"
                  multiline
                />
              </View>
              
              <View style={styles.formGroup}>
                <Text style={styles.label}>Mastery Criteria</Text>
                <TextInput
                  style={styles.input}
                  value={customProgram.masteryCriteria}
                  onChangeText={(text) => setCustomProgram({...customProgram, masteryCriteria: text})}
                  placeholder="e.g., 80% accuracy across 3 sessions"
                />
              </View>
              
              <View style={styles.formGroup}>
                <Text style={styles.label}>Data Collection Method</Text>
                <View style={styles.pickerContainer}>
                  <TextInput
                    style={styles.input}
                    value={customProgram.dataCollectionMethod}
                    onChangeText={(text) => setCustomProgram({...customProgram, dataCollectionMethod: text})}
                    editable={false}
                  />
                </View>
              </View>
            </View>
            
            <View style={styles.formButtonRow}>
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={handleCreateCustomProgram}
              >
                <Text style={styles.primaryButtonText}>Create Program</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowCustomForm(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* ABLLS-R Programs Section */}
        {abllsPrograms.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>ABLLS-R Programs</Text>
              <Text style={styles.sectionCount}>{abllsPrograms.length} programs</Text>
            </View>
            <FlatList
              data={abllsPrograms}
              renderItem={renderProgramCard}
              keyExtractor={item => item.id}
              scrollEnabled={false}
            />
          </View>
        )}

        {/* Custom Programs Section */}
        {customPrograms.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Custom Programs</Text>
              <Text style={styles.sectionCount}>{customPrograms.length} programs</Text>
            </View>
            <FlatList
              data={customPrograms}
              renderItem={renderProgramCard}
              keyExtractor={item => item.id}
              scrollEnabled={false}
            />
          </View>
        )}

        {/* Empty State */}
        {filteredPrograms.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="ellipse-outline" size={48} color="#ccc" />
            <Text style={styles.emptyStateTitle}>No Programs Found</Text>
            <Text style={styles.emptyStateSubtitle}>
              {searchQuery 
                ? `No programs match "${searchQuery}"` 
                : 'Add programs to get started'}
            </Text>
            <View style={styles.emptyStateButtons}>
              <TouchableOpacity
                style={styles.abllsButton}
                onPress={() => setShowABLLSForm(true)}
              >
                <Ionicons name="book-outline" size={16} color="#fff" />
                <Text style={styles.abllsButtonText}>Add ABLLS-R</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.customButton}
                onPress={() => setShowCustomForm(true)}
              >
                <Ionicons name="add-outline" size={16} color="#fff" />
                <Text style={styles.customButtonText}>Create Custom</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    backgroundColor: '#0d9488',
    padding: 20,
    paddingTop: 50,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  headerSubtitle: {
    color: '#ccfbf1',
    fontSize: 14,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
  },
  loadingText: {
    marginLeft: 10,
    fontSize: 14,
    color: '#666',
  },
  childSelectorContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  childSelectorLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  childScrollView: {
    flexDirection: 'row',
  },
  childButton: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    marginRight: 10,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedChildButton: {
    backgroundColor: '#dbeafe',
    borderColor: '#3b82f6',
  },
  childButtonText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  selectedChildButtonText: {
    color: '#3b82f6',
    fontWeight: '600',
  },
  noChildrenText: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 20,
  },
  noChildSelectedCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 40,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  noChildSelectedText: {
    fontSize: 16,
    color: '#999',
    marginTop: 16,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
    paddingLeft: 12,
    marginBottom: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  abllsButton: {
    flex: 1,
    backgroundColor: '#8b5cf6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    gap: 6,
  },
  abllsButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  customButton: {
    flex: 1,
    backgroundColor: '#3b82f6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    gap: 6,
  },
  customButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  abllsFormCard: {
    backgroundColor: '#f5f3ff',
    borderColor: '#ddd6fe',
    borderWidth: 1,
  },
  customFormCard: {
    backgroundColor: '#eff6ff',
    borderColor: '#dbeafe',
    borderWidth: 1,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  formSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 12,
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 12,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  formButtonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: '#6366f1',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  cancelButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#e5e7eb',
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#6b7280',
    fontSize: 16,
    fontWeight: '500',
  },
  formFields: {
    marginBottom: 16,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
  },
  sectionCount: {
    fontSize: 14,
    color: '#6b7280',
  },
  programCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  programHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  programTitleSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 8,
  },
  domainTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 30,
    alignItems: 'center',
  },
  domainTagText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  categoryTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#dbeafe',
    borderColor: '#bfdbfe',
    borderWidth: 1,
  },
  categoryTagText: {
    color: '#2563eb',
    fontSize: 12,
    fontWeight: '500',
  },
  programTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    flex: 1,
  },
  programActions: {
    flexDirection: 'row',
    gap: 8,
  },
  iconButton: {
    padding: 4,
  },
  programDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  programLongDescription: {
    fontSize: 14,
    color: '#4b5563',
    marginBottom: 12,
  },
  masterySection: {
    marginBottom: 12,
  },
  masteryLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 4,
  },
  masteryText: {
    fontSize: 14,
    color: '#4b5563',
  },
  targetsLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  targetsContainer: {
    marginBottom: 12,
  },
  targetItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
    gap: 8,
  },
  targetItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 8,
  },
  removeTargetButton: {
    padding: 4,
  },
  targetCheckbox: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#d1d5db',
    alignItems: 'center',
    justifyContent: 'center',
  },
  targetCheckboxChecked: {
    backgroundColor: '#10b981',
    borderColor: '#10b981',
  },
  targetDescription: {
    flex: 1,
    fontSize: 14,
    color: '#4b5563',
  },
  targetDescriptionCompleted: {
    textDecorationLine: 'line-through',
    color: '#9ca3af',
  },
  masteryDate: {
    fontSize: 12,
    color: '#10b981',
  },
  noTargetsText: {
    fontStyle: 'italic',
    color: '#9ca3af',
    marginBottom: 12,
  },
  addTargetContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  addTargetInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
  },
  addTargetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3b82f6',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 4,
  },
  addTargetButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginVertical: 20,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginVertical: 12,
  },
  emptyStateSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 20,
  },
  emptyStateButtons: {
    flexDirection: 'row',
    gap: 12,
  },
});