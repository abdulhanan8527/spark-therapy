import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { childAPI, feedbackAPI } from '../../services/api';

const WeeklyVideosScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [selectedChild, setSelectedChild] = useState(null);
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(false);
  const [videos, setVideos] = useState([]);

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
          loadVideos(response.data[0]._id);
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load children');
    } finally {
      setLoading(false);
    }
  };

  const loadVideos = async (childId) => {
    try {
      setLoading(true);
      
      // Fetch feedback records for the child
      const response = await feedbackAPI.getFeedbackByChild(childId);
      
      if (response.success && response.data && response.data.feedback) {
        // Create video-like records from feedback data
        const feedbackData = response.data.feedback;
        
        // Group feedback by week and create video data
        const videos = feedbackData.map((feedback, index) => {
          const date = new Date(feedback.date);
          const weekStart = new Date(date);
          weekStart.setDate(date.getDate() - date.getDay()); // Start of week (Sunday)
          const weekEnd = new Date(weekStart);
          weekEnd.setDate(weekStart.getDate() + 6); // End of week (Saturday)
          
          // Calculate if the feedback is more than 30 days old (expired)
          const now = new Date();
          const diffTime = Math.abs(now - date);
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          
          return {
            id: feedback._id || `video-${index}`,
            title: `Week of ${weekStart.toLocaleDateString()} - ${weekEnd.toLocaleDateString()}`,
            date: date.toISOString().split('T')[0],
            thumbnail: 'feedback',
            status: diffDays > 30 ? 'expired' : 'available',
            feedbackData: feedback
          };
        });
        
        setVideos(videos);
      } else {
        setVideos([]);
      }
    } catch (error) {
      console.error('Error loading videos:', error);
      Alert.alert('Error', error.message || 'Failed to load videos');
      setVideos([]);
    } finally {
      setLoading(false);
    }
  };

  const handleChildSelect = (child) => {
    setSelectedChild(child);
    loadVideos(child._id);
  };

  const handlePlayVideo = (video) => {
    if (video.status === 'expired') {
      Alert.alert('Video Expired', 'This video is no longer available.');
      return;
    }
    
    // In a real app, this would play the actual video
    // For now, we'll show feedback details in an alert
    const feedback = video.feedbackData;
    Alert.alert(
      video.title,
      `Date: ${video.date}\nMood: ${feedback.mood}\nActivities: ${feedback.activities?.join(', ') || 'N/A'}\nAchievements: ${feedback.achievements?.join(', ') || 'N/A'}`
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Weekly Videos</Text>
        <Text style={styles.subtitle}>Watch your child's progress videos</Text>
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

        {/* Videos List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Available Videos</Text>
          {videos.length > 0 ? (
            videos.map((video) => (
              <TouchableOpacity
                key={video.id}
                style={[
                  styles.videoCard,
                  video.status === 'expired' && styles.expiredVideo
                ]}
                onPress={() => handlePlayVideo(video)}
                disabled={video.status === 'expired'}
              >
                <View style={styles.videoThumbnail}>
                  <Text style={styles.thumbnailText}>🎥</Text>
                </View>
                <View style={styles.videoInfo}>
                  <Text style={[
                    styles.videoTitle,
                    video.status === 'expired' && styles.expiredText
                  ]}>
                    {video.title}
                  </Text>
                  <Text style={styles.videoDate}>{video.date}</Text>
                  <Text style={[
                    styles.videoStatus,
                    video.status === 'available' ? styles.availableStatus : styles.expiredStatus
                  ]}>
                    {video.status === 'available' ? 'Available' : 'Expired'}
                  </Text>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <Text style={styles.noVideosText}>No videos available</Text>
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
    backgroundColor: '#5856D6',
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
    backgroundColor: '#5856D6',
  },
  childName: {
    color: '#333',
    fontWeight: '500',
  },
  selectedChildText: {
    color: '#fff',
  },
  videoCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  expiredVideo: {
    opacity: 0.6,
  },
  videoThumbnail: {
    width: 80,
    height: 60,
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  thumbnailText: {
    fontSize: 24,
  },
  videoInfo: {
    flex: 1,
  },
  videoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  expiredText: {
    color: '#999',
  },
  videoDate: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  videoStatus: {
    fontSize: 12,
    fontWeight: '500',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  availableStatus: {
    backgroundColor: '#e8f5e9',
    color: '#4caf50',
  },
  expiredStatus: {
    backgroundColor: '#ffebee',
    color: '#f44336',
  },
  noVideosText: {
    textAlign: 'center',
    color: '#666',
    fontSize: 16,
    marginTop: 20,
  },
});

export default WeeklyVideosScreen;