import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Image, RefreshControl, ActivityIndicator } from 'react-native';
import { CheckCircle, Clock, AlertCircle, Play } from '@expo/vector-icons';
import { Video, Camera, Upload } from '../../components/SimpleIcons';
import { useAuth } from '../../contexts/AuthContext';
import { videoAPI, therapistAPI } from '../../services/api';

const WeeklyVideoScreen = () => {
  const { user } = useAuth();
  
  // Add getWeek method to Date prototype to calculate week number
  if (!Date.prototype.getWeek) {
    Date.prototype.getWeek = function() {
      const date = new Date(this.getTime());
      date.setHours(0, 0, 0, 0);
      // Set to nearest Thursday: current date + 4 - current day number
      // Make Sunday's day number 7
      date.setDate(date.getDate() + 4 - (date.getDay() || 7));
      // Get first day of year
      const yearStart = new Date(date.getFullYear(), 0, 1);
      // Calculate full weeks to nearest Thursday
      return Math.ceil((((date - yearStart) / 86400000) + 1) / 7);
    };
  }
  const [selectedChild, setSelectedChild] = useState(null);
  const [recording, setRecording] = useState(false);
  const [recordedVideo, setRecordedVideo] = useState(null);
  const [uploadedVideos, setUploadedVideos] = useState([]);
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  useEffect(() => {
    fetchChildrenAndVideos();
  }, []);
  
  const fetchChildrenAndVideos = async (isRefresh = false) => {
    try {
      if (!isRefresh) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }
      
      // Get children assigned to the current therapist
      const childrenResponse = await therapistAPI.getChildren(user._id);
      if (childrenResponse.success) {
        // Ensure childrenResponse.data is an array
        const childrenData = Array.isArray(childrenResponse.data) ? childrenResponse.data : [];
        setChildren(childrenData);
      } else {
        setChildren([]);
      }
      
      // Get videos uploaded by the current therapist
      const videosResponse = await videoAPI.getVideosByTherapist();
      if (videosResponse.success) {
        // Ensure videosResponse.data is an array
        const videosData = Array.isArray(videosResponse.data) ? videosResponse.data : [];
        setUploadedVideos(videosData);
      } else {
        setUploadedVideos([]);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      Alert.alert('Error', error.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRecordVideo = () => {
    // In a real app, this would open the camera to record a video
    Alert.alert(
      'Record Video',
      'In a real application, this would open the camera to record a video for the parent.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Simulate Recording', 
          onPress: () => {
            setRecordedVideo({
              uri: 'https://example.com/video.mp4',
              duration: 180,
            });
            Alert.alert('Success', 'Video recorded successfully!');
          }
        }
      ]
    );
  };

  const handleUploadVideo = async () => {
    if (!selectedChild || !recordedVideo) {
      Alert.alert('Error', 'Please select a child and record a video first');
      return;
    }
    
    // Get the selected child object
    const selectedChildObj = (Array.isArray(children) ? children : []).find(c => c._id === selectedChild || c.id === selectedChild);
    if (!selectedChildObj) {
      Alert.alert('Error', 'Selected child not found');
      return;
    }
    
    // Prepare video data
    const videoData = {
      childId: selectedChildObj._id || selectedChildObj.id,
      title: `Weekly Update - Week ${new Date().getWeek() || 'N/A'}`,
      description: `Weekly update video for ${selectedChildObj.name || 'child'}`,
      videoUrl: recordedVideo.uri,
      weekNumber: new Date().getWeek(),
      year: new Date().getFullYear()
    };
    
    try {
      // Upload video to backend
      const response = await videoAPI.createVideo(videoData);
      if (response.success) {
        // Refresh the videos list
        fetchChildrenAndVideos();
        setRecordedVideo(null);
        Alert.alert('Success', 'Video uploaded successfully! It will be reviewed and made available to parents.');
      } else {
        Alert.alert('Error', response.message || 'Failed to upload video');
      }
    } catch (error) {
      console.error('Error uploading video:', error);
      Alert.alert('Error', error.message || 'Failed to upload video');
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved':
        return <CheckCircle size={16} color="#34C759" />;
      case 'pending':
        return <Clock size={16} color="#FF9500" />;
      case 'rejected':
        return <AlertCircle size={16} color="#FF3B30" />;
      default:
        return <Clock size={16} color="#8E8E93" />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'approved':
        return 'Approved';
      case 'pending':
        return 'Pending Review';
      case 'rejected':
        return 'Rejected';
      default:
        return 'Unknown';
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'approved':
        return styles.approvedStatus;
      case 'pending':
        return styles.pendingStatus;
      case 'rejected':
        return styles.rejectedStatus;
      default:
        return styles.pendingStatus;
    }
  };

  const filteredVideos = selectedChild 
    ? (Array.isArray(uploadedVideos) ? uploadedVideos : []).filter(video => {
        const childId = typeof video.child === 'object' ? video.child._id : video.childId;
        return childId === selectedChild;
      })
    : (Array.isArray(uploadedVideos) ? uploadedVideos : []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading video updates...</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => fetchChildrenAndVideos(true)}
        />
      }
    >
      <Text style={styles.header}>Weekly Video Updates</Text>
      
      {/* Upload Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Record & Upload Video</Text>
        <View style={styles.uploadContainer}>
          {/* Child Selection */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Select Child</Text>
            <View style={styles.childSelector}>
              {(Array.isArray(children) ? children : []).map((child) => (
                <TouchableOpacity
                  key={child._id}
                  style={[
                    styles.childButton,
                    selectedChild === child._id && styles.selectedChildButton
                  ]}
                  onPress={() => setSelectedChild(child._id)}
                >
                  <Text style={[
                    styles.childButtonText,
                    selectedChild === child._id && styles.selectedChildButtonText
                  ]}>
                    {child.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Recording Preview */}
          <View style={styles.recordingPreview}>
            {recordedVideo ? (
              <View style={styles.videoPreview}>
                <Play size={40} color="#34C759" />
                <Text style={styles.previewText}>Video Recorded</Text>
                <Text style={styles.previewSubtext}>Duration: {recordedVideo.duration ? `${Math.floor(recordedVideo.duration / 60)}:${String(recordedVideo.duration % 60).padStart(2, '0')}` : '0:00'}</Text>
              </View>
            ) : (
              <View style={styles.noVideoPreview}>
                <Video size={40} color="#8E8E93" />
                <Text style={styles.previewText}>No Video Recorded</Text>
                <Text style={styles.previewSubtext}>Record a video to upload</Text>
              </View>
            )}
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.recordButton} onPress={handleRecordVideo}>
              <Camera size={20} color="#fff" />
              <Text style={styles.buttonText}>Record Video</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.uploadButton, !recordedVideo && styles.disabledButton]} 
              onPress={handleUploadVideo}
              disabled={!recordedVideo}
            >
              <Upload size={20} color="#fff" />
              <Text style={styles.buttonText}>Upload Video</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Uploaded Videos */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Uploaded Videos</Text>
        <View style={styles.videosList}>
          {(Array.isArray(filteredVideos) ? filteredVideos : []).map((video) => (
            <View key={video._id} style={styles.videoCard}>
              <View style={styles.videoThumbnail}>
                <View style={styles.placeholderThumbnail}>
                  <Video size={30} color="#8E8E93" />
                </View>
                <View style={styles.playIconOverlay}>
                  <Play size={20} color="#fff" />
                </View>
              </View>
              
              <View style={styles.videoInfo}>
                <Text style={styles.videoTitle}>{video.title}</Text>
                <Text style={styles.videoChild}>{typeof video.child === 'object' ? video.child.name : 'N/A'}</Text>
                <Text style={styles.videoDate}>{new Date(video.createdAt).toLocaleDateString()}</Text>
                
                <View style={styles.videoStats}>
                  <Text style={styles.statText}>{video.views || 0} views</Text>
                  <Text style={styles.statText}>•</Text>
                  <Text style={styles.statText}>{video.likes || 0} likes</Text>
                </View>
              </View>
              
              <View style={[styles.statusBadge, getStatusStyle(video.status)]}>
                {getStatusIcon(video.status)}
                <Text style={styles.statusText}>{getStatusText(video.status)}</Text>
              </View>
            </View>
          ))}
          
          {(Array.isArray(filteredVideos) ? filteredVideos : []).length === 0 && (
            <View style={styles.emptyState}>
              <Video size={40} color="#8E8E93" />
              <Text style={styles.emptyStateText}>No videos uploaded yet</Text>
              <Text style={styles.emptyStateSubtext}>Record and upload a video to get started</Text>
            </View>
          )}
        </View>
      </View>

      {/* Instructions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Instructions</Text>
        <View style={styles.instructionsContainer}>
          <Text style={styles.instructionText}>
            1. Select the child for whom you're uploading a video
          </Text>
          <Text style={styles.instructionText}>
            2. Click "Record Video" to capture a weekly update
          </Text>
          <Text style={styles.instructionText}>
            3. Review your recording and click "Upload Video"
          </Text>
          <Text style={styles.instructionText}>
            4. Videos will be reviewed and made available to parents
          </Text>
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
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
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
  uploadContainer: {
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
  recordingPreview: {
    alignItems: 'center',
    marginVertical: 20,
  },
  videoPreview: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#e8f5e9',
    borderRadius: 12,
    width: '100%',
  },
  noVideoPreview: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    width: '100%',
  },
  previewText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginTop: 8,
  },
  previewSubtext: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  recordButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF3B30',
    borderRadius: 8,
    padding: 16,
    flex: 1,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#34C759',
    borderRadius: 8,
    padding: 16,
    flex: 1,
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  videosList: {
    gap: 12,
  },
  videoCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    alignItems: 'center',
  },
  videoThumbnail: {
    width: 80,
    height: 60,
    borderRadius: 8,
    overflow: 'hidden',
    marginRight: 12,
    position: 'relative',
  },
  placeholderThumbnail: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playIconOverlay: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -10 }, { translateY: -10 }],
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 20,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  videoInfo: {
    flex: 1,
  },
  videoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  videoChild: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  videoDate: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  videoStats: {
    flexDirection: 'row',
    gap: 4,
  },
  statText: {
    fontSize: 12,
    color: '#8E8E93',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  approvedStatus: {
    backgroundColor: '#e8f5e9',
  },
  pendingStatus: {
    backgroundColor: '#fff3e0',
  },
  rejectedStatus: {
    backgroundColor: '#ffebee',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
    color: '#333',
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
  instructionsContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  instructionText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
    paddingLeft: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#34C759',
  },
  instructionTextLast: {
    marginBottom: 0,
  },
});

export default WeeklyVideoScreen;