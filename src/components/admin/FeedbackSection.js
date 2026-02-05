import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert, ActivityIndicator, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { sessionAPI, childAPI, therapistAPI, feedbackAPI } from '../../services/api';

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
      console.log('=== FETCHING FEEDBACK DATA ===');

      // Fetch real feedback from API
      const feedbackRes = await feedbackAPI.getAllFeedback();
      console.log('Feedback API response:', feedbackRes);
      
      if (feedbackRes.success) {
        // Handle nested structure: response.data.feedback
        const feedbackData = feedbackRes.data?.feedback || feedbackRes.data || [];
        
        if (Array.isArray(feedbackData)) {
          // Map the feedback to include proper names from populated fields
          const mappedFeedback = feedbackData.map(fb => ({
            _id: fb._id,
            childId: fb.childId?._id || fb.childId,
            childName: fb.childId ? `${fb.childId.firstName || ''} ${fb.childId.lastName || ''}`.trim() : 'Unknown',
            therapistId: fb.therapistId?._id || fb.therapistId,
            therapistName: fb.therapistId ? `${fb.therapistId.firstName || ''} ${fb.therapistId.lastName || ''}`.trim() : 'Unknown',
            date: fb.createdAt || fb.date,
            mood: fb.mood || 'N/A',
            activities: Array.isArray(fb.activities) ? fb.activities : [],
            achievements: Array.isArray(fb.achievements) ? fb.achievements : [],
            challenges: Array.isArray(fb.challenges) ? fb.challenges : [],
            recommendations: Array.isArray(fb.recommendations) ? fb.recommendations : [],
            status: fb.status || 'pending',
            notes: fb.notes || '',
            createdAt: fb.createdAt,
            updatedAt: fb.updatedAt
          }));
          console.log(`Loaded ${mappedFeedback.length} feedback entries`);
          setFeedbackList(mappedFeedback);
        } else {
          console.log('Feedback data is not an array');
          setFeedbackList([]);
        }
      } else {
        console.log('No feedback data or invalid response format');
        setFeedbackList([]);
      }

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
      setFeedbackList([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveFeedback = async (feedbackId) => {
    try {
      console.log('Approving feedback:', feedbackId);
      const response = await feedbackAPI.updateFeedback(feedbackId, { status: 'approved' });
      
      if (response.success) {
        // Update local state
        setFeedbackList(feedbackList.map(fb => 
          fb._id === feedbackId ? { ...fb, status: 'approved' } : fb
        ));
        Alert.alert('Success', 'Feedback approved successfully!');
      } else {
        Alert.alert('Error', response.message || 'Failed to approve feedback');
      }
    } catch (error) {
      console.error('Error approving feedback:', error);
      Alert.alert('Error', 'Failed to approve feedback');
    }
  };

  const handleMarkForReview = async (feedbackId) => {
    try {
      console.log('Marking feedback for review:', feedbackId);
      const response = await feedbackAPI.updateFeedback(feedbackId, { status: 'needs_attention' });
      
      if (response.success) {
        // Update local state
        setFeedbackList(feedbackList.map(fb => 
          fb._id === feedbackId ? { ...fb, status: 'needs_attention' } : fb
        ));
        Alert.alert('Success', 'Feedback marked for review!');
      } else {
        Alert.alert('Error', response.message || 'Failed to mark feedback for review');
      }
    } catch (error) {
      console.error('Error marking feedback for review:', error);
      Alert.alert('Error', 'Failed to mark feedback for review');
    }
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