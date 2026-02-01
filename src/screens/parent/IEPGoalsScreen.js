import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { childAPI, programAPI } from '../../services/api';

const IEPGoalsScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [selectedChild, setSelectedChild] = useState(null);
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(false);
  const [programs, setPrograms] = useState([]);

  // Load children when component mounts
  useEffect(() => {
    loadChildren();
  }, []);

  const loadChildren = async () => {
    try {
      setLoading(true);
      const response = await childAPI.getChildren();
      if (response.success) {
        setChildren(response.data);
        if (response.data.length > 0) {
          setSelectedChild(response.data[0]);
          loadPrograms(response.data[0]._id);
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load children');
    } finally {
      setLoading(false);
    }
  };

  const loadPrograms = async (childId) => {
    if (!childId || typeof childId !== 'string' || childId.length !== 24) {
      setPrograms([]);
      return;
    }
    try {
      setLoading(true);
      const response = await programAPI.getProgramsByChild(childId).catch(() => ({ success: false, data: [] }));
      setPrograms(Array.isArray(response?.data) ? response.data : []);
    } catch (error) {
      setPrograms([]);
      if (typeof __DEV__ !== 'undefined' && __DEV__) {
        console.warn('IEP loadPrograms error:', error?.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChildSelect = (child) => {
    setSelectedChild(child);
    loadPrograms(child._id);
  };

  const calculateMastery = (targets) => {
    if (!targets || targets.length === 0) return 0;
    const mastered = targets.filter(target => target.isMastered).length;
    return Math.round((mastered / targets.length) * 100);
  };

  const handleViewProgram = (program) => {
    Alert.alert('View Program', `Viewing ${program.title}`);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>IEP Goals</Text>
        <Text style={styles.subtitle}>Track your child's Individualized Education Program goals</Text>
      </View>

      <View style={styles.content}>
        {/* Child Selection */}
        {children.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Select Child</Text>
            <View style={styles.childSelector}>
              {children.map((child) => (
                <TouchableOpacity
                  key={child._id}
                  style={[
                    styles.childOption,
                    selectedChild?._id === child._id && styles.selectedChild
                  ]}
                  onPress={() => handleChildSelect(child)}
                >
                  <Text style={[
                    styles.childName,
                    selectedChild?._id === child._id && styles.selectedChildText
                  ]}>
                    {child.firstName} {child.lastName}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Programs List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Therapy Programs</Text>
          {programs.length > 0 ? (
            programs.map((program) => (
              <View key={program._id} style={styles.programCard}>
                <View style={styles.programHeader}>
                  <Text style={styles.programTitle}>{program.title}</Text>
                  <Text style={styles.programCategory}>{program.category}</Text>
                </View>
                
                <Text style={styles.programDescription} numberOfLines={2}>
                  {program.shortDescription}
                </Text>
                
                <View style={styles.masterySection}>
                  <View style={styles.masteryInfo}>
                    <Text style={styles.masteryLabel}>Mastery Progress</Text>
                    <Text style={styles.masteryText}>
                      {program.targets ? program.targets.filter(t => t.isMastered).length : 0}/
                      {program.targets ? program.targets.length : 0} targets
                    </Text>
                  </View>
                  <View style={styles.progressBarContainer}>
                    <View 
                      style={[
                        styles.progressBar,
                        { width: `${calculateMastery(program.targets)}%` }
                      ]}
                    />
                  </View>
                  <Text style={styles.masteryPercentage}>
                    {calculateMastery(program.targets)}%
                  </Text>
                </View>
                
                <View style={styles.programFooter}>
                  <TouchableOpacity 
                    style={styles.viewButton}
                    onPress={() => handleViewProgram(program)}
                  >
                    <Text style={styles.viewButtonText}>View Details</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          ) : (
            <Text style={styles.noProgramsText}>No programs available</Text>
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
  },
  header: {
    backgroundColor: '#4CAF50',
    padding: 20,
    paddingTop: 50,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.9,
  },
  content: {
    padding: 20,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  childSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  childOption: {
    backgroundColor: '#e0e0e0',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
  },
  selectedChild: {
    backgroundColor: '#4CAF50',
  },
  childName: {
    color: '#333',
    fontWeight: '500',
  },
  selectedChildText: {
    color: '#fff',
  },
  programCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  programHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  programTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  programCategory: {
    fontSize: 12,
    color: '#4CAF50',
    backgroundColor: '#e8f5e9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    overflow: 'hidden',
  },
  programDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
  },
  masterySection: {
    marginBottom: 15,
  },
  masteryInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  masteryLabel: {
    fontSize: 14,
    color: '#666',
  },
  masteryText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#4CAF50',
  },
  masteryPercentage: {
    textAlign: 'right',
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
  programFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  viewButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 5,
  },
  viewButtonText: {
    color: '#fff',
    fontWeight: '500',
  },
  noProgramsText: {
    textAlign: 'center',
    color: '#666',
    fontSize: 16,
    marginTop: 20,
  },
});

export default IEPGoalsScreen;