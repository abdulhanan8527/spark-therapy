import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert, ActivityIndicator, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { sessionAPI, childAPI, therapistAPI } from '../../services/api';

const FeedbackSection = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [feedbackList, setFeedbackList] = useState([]);
  const [children, setChildren] = useState([]);
  const [therapists, setTherapists] = useState([]);
  const [filters, setFilters] = useState({
    status: 'all',
    dateRange: 'all',
    childId: '',
    therapistId: ''
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

      // In a real app, we would fetch feedback from the API
      // For now, I'll create mock data to demonstrate the UI
      const mockFeedback = [
        {
          _id: '1',
          childId: '1',
          childName: 'Emma Johnson',
          therapistId: '1',
          therapistName: 'Dr. Sarah Smith',
          date: '2025-12-15',
          mood: 'happy',
          activities: ['Sensory play', 'Speech exercises'],
          achievements: ['Improved eye contact', 'Completed puzzle'],
          challenges: ['Difficulty focusing for extended periods'],
          recommendations: ['Continue sensory integration exercises'],
          status: 'reviewed',
          notes: 'Good progress today, child was engaged throughout session',
          createdAt: '2025-12-15T10:30:00Z',
          updatedAt: '2025-12-15T11:00:00Z'
        },
        {
          _id: '2',
          childId: '2',
          childName: 'Michael Chen',
          therapistId: '2',
          therapistName: 'Dr. James Wilson',
          date: '2025-12-14',
          mood: 'calm',
          activities: ['Social skills training', 'Motor skill exercises'],
          achievements: ['Successfully completed group activity'],
          challenges: ['Reluctant to participate initially'],
          recommendations: ['Consider shorter initial sessions'],
          status: 'pending',
          notes: 'Child showed improvement in social interaction',
          createdAt: '2025-12-14T09:15:00Z',
          updatedAt: '2025-12-14T09:15:00Z'
        },
        {
          _id: '3',
          childId: '3',
          childName: 'Sophia Rodriguez',
          therapistId: '1',
          therapistName: 'Dr. Sarah Smith',
          date: '2025-12-13',
          mood: 'excited',
          activities: ['Music therapy', 'Art therapy'],
          achievements: ['Created beautiful artwork', 'Participated enthusiastically'],
          challenges: ['None reported'],
          recommendations: ['Continue music therapy sessions'],
          status: 'approved',
          notes: 'Outstanding session, child was very expressive',
          createdAt: '2025-12-13T14:20:00Z',
          updatedAt: '2025-12-13T15:00:00Z'
        },
        {
          _id: '4',
          childId: '4',
          childName: 'Oliver Thompson',
          therapistId: '3',
          therapistName: 'Dr. Emily Davis',
          date: '2025-12-12',
          mood: 'frustrated',
          activities: ['Fine motor skills', 'Cognitive exercises'],
          achievements: ['Completed 3 out of 5 tasks'],
          challenges: ['Frustrated with complex tasks'],
          recommendations: ['Break tasks into smaller steps'],
          status: 'needs_attention',
          notes: 'Child needs additional support with complex tasks',
          createdAt: '2025-12-12T11:45:00Z',
          updatedAt: '2025-12-12T11:45:00Z'
        },
        {
          _id: '5',
          childId: '5',
          childName: 'Ava Williams',
          therapistId: '2',
          therapistName: 'Dr. James Wilson',
          date: '2025-12-11',
          mood: 'happy',
          activities: ['Language development', 'Play therapy'],
          achievements: ['Used 5 new words', 'Initiated play with peers'],
          challenges: ['Sometimes speaks too quietly'],
          recommendations: ['Practice vocal projection exercises'],
          status: 'reviewed',
          notes: 'Great progress in language development',
          createdAt: '2025-12-11T13:30:00Z',
          updatedAt: '2025-12-11T14:00:00Z'
        }
      ];

      setFeedbackList(mockFeedback);

      // Fetch children data
      const childrenRes = await childAPI.getChildren();
      if (childrenRes.success) {
        setChildren(Array.isArray(childrenRes.data) ? childrenRes.data : []);
      } else {
        setChildren([]);
        console.error('Failed to fetch children:', childrenRes.message);
      }

      // Fetch therapists data
      const therapistsRes = await therapistAPI.getAllTherapists();
      if (therapistsRes.success) {
        setTherapists(Array.isArray(therapistsRes.data) ? therapistsRes.data : []);
      } else {
        setTherapists([]);
        console.error('Failed to fetch therapists:', therapistsRes.message);
      }
    } catch (error) {
      console.error('Error fetching data:', error?.message || error);
      Alert.alert('Error', 'Failed to load feedback data');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveFeedback = (feedbackId) => {
    Alert.alert(
      'Approve Feedback',
      'Are you sure you want to approve this feedback?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Approve',
          style: 'default',
          onPress: () => {
            // In a real app, this would call an API to update the feedback status
            setFeedbackList(feedbackList.map(fb => 
              fb._id === feedbackId ? { ...fb, status: 'approved' } : fb
            ));
            Alert.alert('Success', 'Feedback approved successfully!');
          }
        }
      ]
    );
  };

  const handleMarkForReview = (feedbackId) => {
    Alert.alert(
      'Mark for Review',
      'Are you sure you want to mark this feedback for review?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Mark for Review',
          style: 'default',
          onPress: () => {
            // In a real app, this would call an API to update the feedback status
            setFeedbackList(feedbackList.map(fb => 
              fb._id === feedbackId ? { ...fb, status: 'needs_attention' } : fb
            ));
            Alert.alert('Success', 'Feedback marked for review!');
          }
        }
      ]
    );
  };

  const filteredFeedback = feedbackList.filter(feedback => {
    const matchesSearch = 
      feedback.childName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      feedback.therapistName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      feedback.activities.some(activity => 
        activity.toLowerCase().includes(searchQuery.toLowerCase())
      ) ||
      feedback.achievements.some(achievement => 
        achievement.toLowerCase().includes(searchQuery.toLowerCase())
      ) ||
      feedback.challenges.some(challenge => 
        challenge.toLowerCase().includes(searchQuery.toLowerCase())
      );

    const matchesStatus = filters.status === 'all' || feedback.status === filters.status;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status) => {
    switch(status) {
      case 'approved': return '#34C759';
      case 'reviewed': return '#34C759';
      case 'pending': return '#FF9500';
      case 'needs_attention': return '#FF3B30';
      default: return '#8E8E93';
    }
  };

  const getStatusText = (status) => {
    switch(status) {
      case 'approved': return 'Approved';
      case 'reviewed': return 'Reviewed';
      case 'pending': return 'Pending';
      case 'needs_attention': return 'Needs Attention';
      default: return status;
    }
  };

  const getMoodIcon = (mood) => {
    switch(mood) {
      case 'happy': return '😊';
      case 'calm': return '😌';
      case 'excited': return '🤩';
      case 'frustrated': return '😠';
      case 'sad': return '😢';
      default: return '😐';
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading feedback data...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Feedback Management</Text>

      {/* Search and Filters */}
      <View style={styles.section}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#8E8E93" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search feedback by child, therapist, or content..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Status Filter */}
        <View style={styles.filterContainer}>
          <Text style={styles.filterLabel}>Status:</Text>
          <View style={styles.filterButtons}>
            {['all', 'pending', 'reviewed', 'approved', 'needs_attention'].map(status => (
              <TouchableOpacity
                key={status}
                style={[
                  styles.filterButton,
                  filters.status === status && styles.activeFilterButton
                ]}
                onPress={() => setFilters({...filters, status})}
              >
                <Text style={[
                  styles.filterButtonText,
                  filters.status === status && styles.activeFilterButtonText
                ]}>
                  {status === 'all' ? 'All' : 
                   status === 'needs_attention' ? 'Needs Attention' : 
                   status.charAt(0).toUpperCase() + status.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      {/* Feedback List */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Feedback Entries ({filteredFeedback.length})</Text>
        <View style={styles.feedbackList}>
          {filteredFeedback.map((feedback) => (
            <View key={feedback._id} style={styles.feedbackCard}>
              <View style={styles.feedbackHeader}>
                <View style={styles.feedbackInfo}>
                  <View style={styles.avatar}>
                    <Ionicons name="person" size={20} color="#fff" />
                  </View>
                  <View>
                    <Text style={styles.feedbackChildName}>{feedback.childName}</Text>
                    <Text style={styles.feedbackTherapist}>by {feedback.therapistName}</Text>
                  </View>
                </View>
                
                <View style={styles.feedbackDateContainer}>
                  <Ionicons name="time" size={14} color="#8E8E93" />
                  <Text style={styles.feedbackDate}>
                    {new Date(feedback.date).toLocaleDateString()}
                  </Text>
                </View>
              </View>

              <View style={styles.feedbackContent}>
                <View style={styles.moodContainer}>
                  <Text style={styles.moodEmoji}>{getMoodIcon(feedback.mood)}</Text>
                  <Text style={styles.moodLabel}>{feedback.mood}</Text>
                </View>

                <View style={styles.feedbackDetails}>
                  <Text style={styles.feedbackLabel}>Activities:</Text>
                  <View style={styles.activityList}>
                    {feedback.activities.map((activity, index) => (
                      <View key={index} style={styles.activityItem}>
                        <Text style={styles.activityText}>{activity}</Text>
                      </View>
                    ))}
                  </View>
                </View>

                <View style={styles.feedbackDetails}>
                  <Text style={styles.feedbackLabel}>Achievements:</Text>
                  <View style={styles.achievementList}>
                    {feedback.achievements.map((achievement, index) => (
                      <View key={index} style={styles.achievementItem}>
                        <Ionicons name="star" size={12} color="#34C759" />
                        <Text style={styles.achievementText}>{achievement}</Text>
                      </View>
                    ))}
                  </View>
                </View>

                <View style={styles.feedbackDetails}>
                  <Text style={styles.feedbackLabel}>Challenges:</Text>
                  <View style={styles.challengeList}>
                    {feedback.challenges.map((challenge, index) => (
                      <View key={index} style={styles.challengeItem}>
                        <Ionicons name="close" size={12} color="#FF3B30" />
                        <Text style={styles.challengeText}>{challenge}</Text>
                      </View>
                    ))}
                  </View>
                </View>

                <View style={styles.feedbackDetails}>
                  <Text style={styles.feedbackLabel}>Recommendations:</Text>
                  <Text style={styles.recommendationText}>{feedback.recommendations}</Text>
                </View>

                {feedback.notes && (
                  <View style={styles.feedbackDetails}>
                    <Text style={styles.feedbackLabel}>Notes:</Text>
                    <Text style={styles.notesText}>{feedback.notes}</Text>
                  </View>
                )}
              </View>

              <View style={styles.feedbackFooter}>
                <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(feedback.status)}20` }]}>
                  <View style={[styles.statusDot, { backgroundColor: getStatusColor(feedback.status) }]} />
                  <Text style={[styles.statusText, { color: getStatusColor(feedback.status) }]}>
                    {getStatusText(feedback.status)}
                  </Text>
                </View>

                <View style={styles.actionButtons}>
                  {feedback.status !== 'approved' && (
                    <TouchableOpacity
                      style={styles.approveButton}
                      onPress={() => handleApproveFeedback(feedback._id)}
                    >
                      <Ionicons name="checkmark" size={16} color="#fff" />
                      <Text style={styles.actionButtonText}>Approve</Text>
                    </TouchableOpacity>
                  )}
                  
                  <TouchableOpacity
                    style={styles.reviewButton}
                    onPress={() => handleMarkForReview(feedback._id)}
                  >
                    <Ionicons name="eye" size={16} color="#fff" />
                    <Text style={styles.actionButtonText}>Review</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))}

          {filteredFeedback.length === 0 && (
            <View style={styles.emptyState}>
              <Ionicons name="chatbubble-ellipses-outline" size={40} color="#8E8E93" />
              <Text style={styles.emptyStateText}>No feedback found</Text>
              <Text style={styles.emptyStateSubtext}>Try adjusting your search or filter criteria</Text>
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 15,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
  },
  filterContainer: {
    marginBottom: 15,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  filterButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#F2F2F7',
  },
  activeFilterButton: {
    backgroundColor: '#007AFF',
  },
  filterButtonText: {
    fontSize: 12,
    color: '#1A1A1A',
  },
  activeFilterButtonText: {
    color: '#FFFFFF',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 15,
  },
  feedbackList: {
    marginBottom: 20,
  },
  feedbackCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  feedbackHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  feedbackInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  feedbackChildName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  feedbackTherapist: {
    fontSize: 14,
    color: '#8E8E93',
  },
  feedbackDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 10,
  },
  feedbackDate: {
    fontSize: 12,
    color: '#8E8E93',
    marginLeft: 4,
  },
  feedbackContent: {
    marginBottom: 12,
  },
  moodContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  moodEmoji: {
    fontSize: 20,
    marginRight: 8,
  },
  moodLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1A1A1A',
    textTransform: 'capitalize',
  },
  feedbackDetails: {
    marginBottom: 12,
  },
  feedbackLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 6,
  },
  activityList: {
    marginBottom: 8,
  },
  activityItem: {
    backgroundColor: '#F2F2F7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginBottom: 4,
  },
  activityText: {
    fontSize: 14,
    color: '#1A1A1A',
  },
  achievementList: {},
  achievementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  achievementText: {
    fontSize: 14,
    color: '#1A1A1A',
    marginLeft: 6,
  },
  challengeList: {},
  challengeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  challengeText: {
    fontSize: 14,
    color: '#FF3B30',
    marginLeft: 6,
  },
  recommendationText: {
    fontSize: 14,
    color: '#1A1A1A',
    lineHeight: 20,
  },
  notesText: {
    fontSize: 14,
    color: '#8E8E93',
    fontStyle: 'italic',
    lineHeight: 20,
  },
  feedbackFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F2F2F7',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  approveButton: {
    backgroundColor: '#34C759',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  reviewButton: {
    backgroundColor: '#FF9500',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
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

export default FeedbackSection;