import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator, Platform, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { childAPI, videoAPI } from '../../services/api';
import { Video } from 'expo-av';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';

const WeeklyVideosScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [selectedChild, setSelectedChild] = useState(null);
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(false);
  const [videos, setVideos] = useState([]);
  const [playingVideo, setPlayingVideo] = useState(null);
  const [videoRef, setVideoRef] = useState(null);

  // Load children when component mounts
  useEffect(() => {
    loadChildren();
  }, []);

  // Load videos when selected child changes
  useEffect(() => {
    if (selectedChild) {
      loadVideos(selectedChild._id);
    }
  }, [selectedChild]);

  const loadChildren = async () => {
    try {
      setLoading(true);
      console.log('Loading parent children for videos');
      const response = await childAPI.getChildren();
      console.log('Children response:', response);
      
      if (response.success) {
        setChildren(response.data);
        if (response.data.length > 0) {
          setSelectedChild(response.data[0]);
          // Videos will be loaded by useEffect
        }
      }
    } catch (error) {
      console.error('Error loading children:', error);
      Alert.alert('Error', 'Failed to load children');
    } finally {
      setLoading(false);
    }
  };

  const loadVideos = async (childId) => {
    try {
      setLoading(true);
      console.log('Loading videos for child:', childId);
      
      // Fetch videos from backend API
      const response = await videoAPI.getVideosByChild(childId);
      console.log('Videos response:', response);
      
      if (response.success && Array.isArray(response.data)) {
        setVideos(response.data);
        console.log('Loaded', response.data.length, 'videos');
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
    // Videos will be loaded by useEffect
  };

  const handlePlayVideo = (video) => {
    if (Platform.OS === 'web' && video.videoUrl) {
      window.open(video.videoUrl, '_blank');
    } else if (video.videoUrl) {
      // On mobile, try to open with default video player
      Linking.openURL(video.videoUrl).catch(err => {
        console.error('Cannot open video:', err);
        Alert.alert('Error', 'Cannot open video: ' + err.message);
      });
    } else {
      Alert.alert('Error', 'Video URL not available');
    }
  };

  const handleDownloadVideo = async (video) => {
    try {
      if (!video.videoUrl) {
        Alert.alert('Error', 'Video URL not available');
        return;
      }

      if (Platform.OS === 'web') {
        // For web, open in new tab
        window.open(video.videoUrl, '_blank');
      } else {
        // For mobile, download to device
        Alert.alert('Downloading', 'Video download started...');
        
        const fileUri = FileSystem.documentDirectory + `video_${video._id}.mp4`;
        const downloadResumable = FileSystem.createDownloadResumable(
          video.videoUrl,
          fileUri
        );

        const result = await downloadResumable.downloadAsync();
        if (result) {
          const isAvailable = await Sharing.isAvailableAsync();
          
          if (isAvailable) {
            await Sharing.shareAsync(result.uri, {
              mimeType: 'video/mp4',
              dialogTitle: 'Save Video',
              UTI: 'public.mpeg-4'
            });
          } else {
            Alert.alert('Success', `Video saved to ${fileUri}`);
          }
        }
      }
    } catch (error) {
      console.error('Error downloading video:', error);
      Alert.alert('Error', 'Failed to download video: ' + error.message);
    }
  };

  if (loading && children.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading videos...</Text>
      </View>
    );
  }

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
              <View
                key={video._id}
                style={styles.videoCard}
              >
                <View style={styles.videoThumbnail}>
                  <Ionicons name="videocam" size={40} color="#007AFF" />
                </View>
                <View style={styles.videoInfo}>
                  <Text style={styles.videoTitle}>
                    {video.title}
                  </Text>
                  <Text style={styles.videoTherapist}>
                    By: {video.therapistId?.name || 'Unknown'}
                  </Text>
                  <Text style={styles.videoDate}>
                    {new Date(video.createdAt).toLocaleDateString()}
                  </Text>
                  <View style={styles.videoActions}>
                    <TouchableOpacity 
                      style={styles.actionButton}
                      onPress={() => handlePlayVideo(video)}
                    >
                      <Ionicons name="play-circle" size={20} color="#007AFF" />
                      <Text style={styles.actionText}>Play</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={styles.actionButton}
                      onPress={() => handleDownloadVideo(video)}
                    >
                      <Ionicons name="download" size={20} color="#34C759" />
                      <Text style={styles.actionText}>Download</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
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