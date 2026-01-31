import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Image, ActivityIndicator } from 'react-native';
import { Camera, Upload, Video, CheckCircle, Clock, AlertCircle } from '../../components/SimpleIcons';
import { useAuth } from '../../contexts/AuthContext';
import { childAPI, videoAPI } from '../../services/api';

const VideoUploadScreen = () => {
  const { user } = useAuth();
  const [selectedChild, setSelectedChild] = useState(null);
  const [children, setChildren] = useState([]);
  const [uploadedVideos, setUploadedVideos] = useState([]);
  const [recording, setRecording] = useState(false);
  const [recordedVideo, setRecordedVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load children
      const childrenRes = await childAPI.getChildren();
      if (childrenRes.success) {
        setChildren(childrenRes.data);
        if (childrenRes.data.length > 0) {
          setSelectedChild(childrenRes.data[0]);
        }
      }
      
      // Load uploaded videos
      const videosRes = await videoAPI.getVideosByParentId(user.id);
      if (videosRes.success) {
        setUploadedVideos(Array.isArray(videosRes.data) ? videosRes.data : []);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Error', 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleRecordVideo = () => {
    // In a real app, this would open the camera to record a video
    Alert.alert(
      'Record Video',
      'In a real application, this would open the camera to record a video for your child\'s therapist.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Simulate Recording', 
          onPress: () => {
            setRecordedVideo({
              uri: 'https://example.com/video.mp4',
              duration: 120,
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

    try {
      setUploading(true);
      
      const videoData = {
        childId: selectedChild._id,
        title: `Weekly Update - ${new Date().toLocaleDateString()}`,
        description: 'Weekly progress update video',
        parentId: user.id
      };

      const response = await videoAPI.createVideo(videoData);
      if (response.success) {
        Alert.alert('Success', 'Video uploaded successfully! It will be reviewed by your therapist.');
        
        // Reload videos
        const videosRes = await videoAPI.getVideosByParentId(user.id);
        if (videosRes.success) {
          setUploadedVideos(Array.isArray(videosRes.data) ? videosRes.data : []);
        }

        setRecordedVideo(null);
      } else {
        Alert.alert('Error', response.message || 'Failed to upload video');
      }
    } catch (error) {
      console.error('Error uploading video:', error);
      Alert.alert('Error', 'Failed to upload video');
    } finally {
      setUploading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status.toLowerCase()) {
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
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const getStatusStyle = (status) => {
    switch (status.toLowerCase()) {
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
    ? uploadedVideos.filter(video => video.childId === selectedChild._id)
    : uploadedVideos;

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading videos...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Video Upload</Text>
      
      {/* Upload Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Record & Upload Video</Text>
        <View style={styles.uploadContainer}>
          {/* Child Selection */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Select Child</Text>
            <View style={styles.childSelector}>
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
            </View>
          </View>

          {/* Recording Preview */}
          <View style={styles.recordingPreview}>
            {recordedVideo ? (
              <View style={styles.videoPreview}>
                <Video size={60} color="#007AFF" />
                <Text style={styles.previewText}>Video Recorded</Text>
                <Text style={styles.previewSubtext}>Duration: {recordedVideo.duration ? `${Math.floor(recordedVideo.duration / 60)}:${String(recordedVideo.duration % 60).padStart(2, '0')}` : '0:00'}</Text>
              </View>
            ) : (
              <View style={styles.noVideoPreview}>
                <Camera size={40} color="#8E8E93" />
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
              style={[styles.uploadButton, (!recordedVideo || uploading) && styles.disabledButton]} 
              onPress={handleUploadVideo}
              disabled={!recordedVideo || uploading}
            >
              <Upload size={20} color="#fff" />
              <Text style={styles.buttonText}>
                {uploading ? 'Uploading...' : 'Upload Video'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Uploaded Videos */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Uploaded Videos</Text>
        <View style={styles.videosList}>
          {filteredVideos.map((video) => (
            <View key={video._id} style={styles.videoCard}>
              <View style={styles.videoThumbnail}>
                {video.thumbnail ? (
                  <Image source={{ uri: video.thumbnail }} style={styles.thumbnail} />
                ) : (
                  <View style={styles.placeholderThumbnail}>
                    <Video size={30} color="#8E8E93" />
                  </View>
                )}
              </View>
              
              <View style={styles.videoInfo}>
                <Text style={styles.videoTitle}>{video.title}</Text>
                <Text style={styles.videoChild}>{video.childName || 'Unknown Child'}</Text>
                <Text style={styles.videoDate}>{new Date(video.createdAt).toLocaleDateString()}</Text>
              </View>
              
              <View style={[styles.statusBadge, getStatusStyle(video.status)]}>
                {getStatusIcon(video.status)}
                <Text style={styles.statusText}>{getStatusText(video.status)}</Text>
              </View>
            </View>
          ))}
          
          {filteredVideos.length === 0 && (
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
            1. Select your child from the dropdown menu
          </Text>
          <Text style={styles.instructionText}>
            2. Click "Record Video" to capture a video update
          </Text>
          <Text style={styles.instructionText}>
            3. Review your recording and click "Upload Video"
          </Text>
          <Text style={styles.instructionText}>
            4. Your therapist will review and respond to your video
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
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
    backgroundColor: '#007AFF',
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
    backgroundColor: '#007AFF',
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
    width: 60,
    height: 60,
    borderRadius: 8,
    overflow: 'hidden',
    marginRight: 12,
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  placeholderThumbnail: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f0f0f0',
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
    borderLeftColor: '#007AFF',
  },
  instructionTextLast: {
    marginBottom: 0,
  },
});

export default VideoUploadScreen;