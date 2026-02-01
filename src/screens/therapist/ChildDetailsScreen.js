import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, RefreshControl } from 'react-native';
import { User, Calendar, Target, MessageCircle, Play, DocumentText, TrendingUp, Trophy } from '../../components/SimpleIcons';
import { useAuth } from '../../contexts/AuthContext';
import { therapistAPI, childAPI, programAPI, feedbackAPI } from '../../services/api';

const ChildDetailsScreen = () => {
  const { user } = useAuth();
  const [selectedChild, setSelectedChild] = useState(null);
  const [childrenData, setChildrenData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  useEffect(() => {
    fetchChildrenData();
  }, []);
  
  const fetchChildrenData = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      
      // Get children assigned to the current therapist
      const response = await therapistAPI.getChildren(user._id);
      if (response.success) {
        const fetchedChildren = response.data;
        
        // Enhance each child with additional data
        const enhancedChildren = await Promise.all(
          fetchedChildren.map(async (child) => {
            // Calculate age from date of birth
            const age = calculateAge(child.dateOfBirth);
            
            // Get programs for this child
            let programs = [];
            try {
              const programResponse = await programAPI.getProgramsByChild(child._id).catch(() => ({ success: false, data: [] }));
              if (programResponse?.success && Array.isArray(programResponse?.data)) {
                const rawPrograms = programResponse.data || [];
                
                // Process programs to calculate progress and mastery from targets
                programs = rawPrograms.map(program => {
                  const targets = program.targets || [];
                  const totalTargets = targets.length;
                  const masteredTargets = targets.filter(target => target.isMastered).length;
                  
                  // Calculate mastery percentage
                  const mastery = totalTargets > 0 ? Math.round((masteredTargets / totalTargets) * 100) : 0;
                  
                  // For progress, we can use a similar calculation or use another metric
                  // For now, we'll use the same calculation, but this could be expanded
                  const progress = totalTargets > 0 ? Math.round((masteredTargets / totalTargets) * 100) : 0;
                  
                  return {
                    id: program._id,
                    name: program.title,
                    progress,
                    mastery,
                    description: program.shortDescription || program.longDescription || '',
                    category: program.category,
                    abllsCode: program.abllsCode || ''
                  };
                });
              }
            } catch (programError) {
              console.error('Error fetching programs for child:', child._id, programError);
              programs = [];
            }
            
            // Get recent feedback for this child
            let recentActivities = [];
            try {
              const feedbackResponse = await feedbackAPI.getFeedbackByChild(child._id, { limit: 5 });
              if (feedbackResponse.success) {
                // Map feedback to activities format
                recentActivities = (feedbackResponse.data || []).slice(0, 5).map(fb => ({
                  id: fb._id,
                  activity: fb.feedbackText || 'General Feedback',
                  date: formatDate(fb.createdAt),
                  rating: fb.rating || 3 // Default rating if not provided
                }));
              }
            } catch (feedbackError) {
              console.error('Error fetching feedback for child:', child._id, feedbackError);
              recentActivities = [];
            }
            
            // Calculate attendance percentage if available
            const attendance = child.attendance ? Math.round(child.attendance) : 85;
            
            return {
              id: child._id,
              name: child.name,
              age,
              diagnosis: child.diagnosis || 'N/A',
              therapist: user.name,
              attendance,
              sessions: child.schedule || 'N/A',
              nextSession: child.nextSession || 'N/A',
              programs,
              recentActivities
            };
          })
        );
        
        setChildrenData(enhancedChildren);
      } else {
        Alert.alert('Error', response.message || 'Failed to fetch children');
      }
    } catch (error) {
      console.error('Error fetching children data:', error);
      Alert.alert('Error', error.message || 'Failed to fetch children data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  
  const calculateAge = (dob) => {
    if (!dob) return 'N/A';
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };
  
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };
  
  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Text key={i} style={i <= rating ? styles.starFilled : styles.starEmpty}>
          ★
        </Text>
      );
    }
    return <View style={styles.starsContainer}>{stars}</View>;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading child data...</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => fetchChildrenData(true)}
        />
      }
    >
      <Text style={styles.header}>Child Details</Text>
      
      {/* Child Selection */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Select Child</Text>
        <View style={styles.childSelector}>
          {childrenData.map((child) => (
            <TouchableOpacity
              key={child.id}
              style={[
                styles.childButton,
                selectedChild?.id === child.id && styles.selectedChildButton
              ]}
              onPress={() => setSelectedChild(child)}
            >
              <Text style={[
                styles.childButtonText,
                selectedChild?.id === child.id && styles.selectedChildButtonText
              ]}>
                {child.name}
              </Text>
            </TouchableOpacity>
          ))}
          {childrenData.length === 0 && (
            <Text style={styles.noChildrenText}>No children assigned to you</Text>
          )}
        </View>
      </View>

      {/* Child Profile */}
      {selectedChild && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Profile</Text>
          <View style={styles.profileCard}>
            <View style={styles.profileHeader}>
              <View style={styles.avatar}>
                <User size={30} color="#fff" />
              </View>
              <View style={styles.profileInfo}>
                <Text style={styles.childName}>{selectedChild.name}</Text>
                <Text style={styles.childDetails}>Age {selectedChild.age} • {selectedChild.diagnosis}</Text>
              </View>
            </View>
            
            <View style={styles.profileDetails}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Therapist</Text>
                <Text style={styles.detailValue}>{selectedChild.therapist}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Sessions</Text>
                <Text style={styles.detailValue}>{selectedChild.sessions}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Next Session</Text>
                <Text style={styles.detailValue}>{selectedChild.nextSession}</Text>
              </View>
            </View>
          </View>
        </View>
      )}

      {/* Attendance & Progress */}
      {selectedChild && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Attendance & Progress</Text>
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <View style={styles.statIcon}>
                <Calendar size={24} color="#007AFF" />
              </View>
              <Text style={styles.statValue}>{selectedChild.attendance}%</Text>
              <Text style={styles.statLabel}>Attendance</Text>
            </View>
            
            <View style={styles.statCard}>
              <View style={styles.statIcon}>
                <Target size={24} color="#34C759" />
              </View>
              <Text style={styles.statValue}>
                {selectedChild.programs.length > 0 
                  ? Math.round(selectedChild.programs.reduce((acc, prog) => {
                      const mastery = prog.mastery || 0;
                      return acc + (isNaN(mastery) ? 0 : mastery);
                    }, 0) / selectedChild.programs.length)
                  : 0}%
              </Text>
              <Text style={styles.statLabel}>Avg Mastery</Text>
            </View>
            
            <View style={styles.statCard}>
              <View style={styles.statIcon}>
                <TrendingUp size={24} color="#FF9500" />
              </View>
              <Text style={styles.statValue}>
                {selectedChild.programs.length > 0 
                  ? Math.round(selectedChild.programs.reduce((acc, prog) => {
                      const progress = prog.progress || 0;
                      return acc + (isNaN(progress) ? 0 : progress);
                    }, 0) / selectedChild.programs.length)
                  : 0}%
              </Text>
              <Text style={styles.statLabel}>Avg Progress</Text>
            </View>
          </View>
        </View>
      )}

      {/* Programs */}
      {selectedChild && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Programs</Text>
          <View style={styles.programsList}>
            {selectedChild.programs.map((program) => (
              <View key={program.id} style={styles.programCard}>
                <View style={styles.programHeader}>
                  <Text style={styles.programName}>{program.name}</Text>
                </View>
                
                <View style={styles.progressBarContainer}>
                  <View style={styles.progressLabels}>
                    <Text style={styles.progressLabel}>Progress</Text>
                    <Text style={styles.progressValue}>{program.progress || 0}%</Text>
                  </View>
                  <View style={styles.progressBarBackground}>
                    <View 
                      style={[styles.progressBar, { width: `${program.progress || 0}%` }]} 
                    />
                  </View>
                </View>
                
                <View style={styles.progressBarContainer}>
                  <View style={styles.progressLabels}>
                    <Text style={styles.progressLabel}>Mastery</Text>
                    <Text style={styles.progressValue}>{program.mastery || 0}%</Text>
                  </View>
                  <View style={styles.progressBarBackground}>
                    <View 
                      style={[styles.progressBar, styles.masteryBar, { width: `${program.mastery || 0}%` }]} 
                    />
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Recent Activities */}
      {selectedChild && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Activities</Text>
          <View style={styles.activitiesList}>
            {selectedChild.recentActivities.map((activity) => (
              <View key={activity.id} style={styles.activityCard}>
                <View style={styles.activityHeader}>
                  <Text style={styles.activityName}>{activity.activity}</Text>
                  <Text style={styles.activityDate}>{activity.date}</Text>
                </View>
                <View style={styles.activityRating}>
                  {renderStars(activity.rating)}
                </View>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Quick Actions */}
      {selectedChild && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            <TouchableOpacity style={styles.actionButton}>
              <MessageCircle size={24} color="#007AFF" />
              <Text style={styles.actionText}>Add Feedback</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionButton}>
              <Play size={24} color="#AF52DE" />
              <Text style={styles.actionText}>Upload Video</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionButton}>
              <DocumentText size={24} color="#34C759" />
              <Text style={styles.actionText}>Add Report</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionButton}>
              <Trophy size={24} color="#FF9500" />
              <Text style={styles.actionText}>Update Goals</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  noChildrenText: {
    fontSize: 16,
    color: '#666',
    fontStyle: 'italic',
    textAlign: 'center',
    padding: 20,
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  childSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  childButton: {
    backgroundColor: '#e0e0e0',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  selectedChildButton: {
    backgroundColor: '#34C759',
  },
  childButtonText: {
    color: '#333',
    fontWeight: '500',
  },
  selectedChildButtonText: {
    color: '#fff',
  },
  profileCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#34C759',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  profileInfo: {
    flex: 1,
  },
  childName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  childDetails: {
    fontSize: 14,
    color: '#666',
  },
  profileDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statIcon: {
    marginBottom: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  programsList: {
    gap: 12,
  },
  programCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  programHeader: {
    marginBottom: 12,
  },
  programName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  progressBarContainer: {
    marginBottom: 12,
  },
  progressBarContainerLast: {
    marginBottom: 0,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  progressLabel: {
    fontSize: 14,
    color: '#666',
  },
  progressValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 4,
  },
  masteryBar: {
    backgroundColor: '#34C759',
  },
  activitiesList: {
    gap: 12,
  },
  activityCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  activityName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  activityDate: {
    fontSize: 14,
    color: '#666',
  },
  activityRating: {
    alignItems: 'flex-start',
  },
  starsContainer: {
    flexDirection: 'row',
  },
  starFilled: {
    fontSize: 18,
    color: '#FF9500',
  },
  starEmpty: {
    fontSize: 18,
    color: '#ddd',
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  actionButton: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    width: '48%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginTop: 8,
    textAlign: 'center',
  },
});

export default ChildDetailsScreen;