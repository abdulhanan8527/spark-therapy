import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert, Switch, ActivityIndicator } from 'react-native';
import { MessageSquare, Smile, Frown, Meh, ThumbsUp, ThumbsDown, Send } from '../../components/SimpleIcons';
import { useAuth } from '../../contexts/AuthContext';
import { childAPI, feedbackAPI } from '../../services/api';

const DailyFeedbackScreen = () => {
  const { user } = useAuth();
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [selectedChild, setSelectedChild] = useState(null);
  const [mood, setMood] = useState(null);
  const [activities, setActivities] = useState('');
  const [achievements, setAchievements] = useState('');
  const [challenges, setChallenges] = useState('');
  const [recommendations, setRecommendations] = useState('');
  const [notes, setNotes] = useState('');
  const [sendToParent, setSendToParent] = useState(true);
  const [urgentConcern, setUrgentConcern] = useState(false);

  useEffect(() => {
    loadChildren();
  }, []);

  const loadChildren = async () => {
    try {
      setLoading(true);
      const response = await childAPI.getChildren();
      if (response.success) {
        setChildren(response.data);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load children');
    } finally {
      setLoading(false);
    }
  };

  const moods = [
    { id: 'happy', icon: <Smile size={24} />, label: 'Happy', color: '#34C759' },
    { id: 'sad', icon: <Frown size={24} />, label: 'Sad', color: '#FF3B30' },
    { id: 'neutral', icon: <Meh size={24} />, label: 'Neutral', color: '#FF9500' },
  ];

  const handleSubmit = async () => {
    if (!selectedChild || !mood || !activities) {
      Alert.alert('Error', 'Please select a child, mood, and describe today\'s activities');
      return;
    }

    try {
      setSubmitting(true);
      const feedbackData = {
        childId: selectedChild._id,
        mood,
        activities: activities.split('\n').filter(line => line.trim() !== ''),
        achievements: achievements.split('\n').filter(line => line.trim() !== ''),
        challenges: challenges.split('\n').filter(line => line.trim() !== ''),
        recommendations: recommendations.split('\n').filter(line => line.trim() !== ''),
        notes,
        isUrgent: urgentConcern
      };

      const response = await feedbackAPI.createFeedback(feedbackData);

      if (response.success) {
        Alert.alert(
          'Success',
          'Daily feedback submitted successfully!',
          [{ text: 'OK', onPress: () => resetForm() }]
        );
      }
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to submit feedback');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setSelectedChild(null);
    setMood(null);
    setActivities('');
    setAchievements('');
    setChallenges('');
    setRecommendations('');
    setNotes('');
    setUrgentConcern(false);
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#34C759" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Daily Feedback</Text>

      {/* Child Selection */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Select Child</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.childSelector}>
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
      </View>

      {/* Mood Selection */}
      {selectedChild && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Child's Mood Today</Text>
          <View style={styles.moodSelector}>
            {moods.map((moodOption) => (
              <TouchableOpacity
                key={moodOption.id}
                style={[
                  styles.moodButton,
                  mood === moodOption.id && { borderColor: moodOption.color, backgroundColor: `${moodOption.color}20` }
                ]}
                onPress={() => setMood(moodOption.id)}
              >
                {moodOption.icon}
                <Text style={[
                  styles.moodLabel,
                  mood === moodOption.id && { color: moodOption.color }
                ]}>
                  {moodOption.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* Activities */}
      {selectedChild && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Today's Activities</Text>
          <TextInput
            style={styles.textArea}
            placeholder="Describe the activities conducted during today's session..."
            value={activities}
            onChangeText={setActivities}
            multiline
            numberOfLines={4}
          />
        </View>
      )}

      {/* Achievements */}
      {selectedChild && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Achievements</Text>
          <TextInput
            style={styles.textArea}
            placeholder="What milestones or achievements did the child reach today?"
            value={achievements}
            onChangeText={setAchievements}
            multiline
            numberOfLines={3}
          />
        </View>
      )}

      {/* Challenges */}
      {selectedChild && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Challenges</Text>
          <TextInput
            style={styles.textArea}
            placeholder="Any difficulties or challenges observed during the session?"
            value={challenges}
            onChangeText={setChallenges}
            multiline
            numberOfLines={3}
          />
        </View>
      )}

      {/* Recommendations */}
      {selectedChild && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recommendations for Parents</Text>
          <TextInput
            style={styles.textArea}
            placeholder="Suggestions for parents to reinforce learning at home..."
            value={recommendations}
            onChangeText={setRecommendations}
            multiline
            numberOfLines={3}
          />
        </View>
      )}

      {/* Additional Notes */}
      {selectedChild && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Additional Notes</Text>
          <TextInput
            style={styles.textArea}
            placeholder="Any other observations or information to share..."
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={3}
          />
        </View>
      )}

      {/* Options */}
      {selectedChild && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Options</Text>
          <View style={styles.optionsContainer}>
            <View style={styles.optionRow}>
              <Text style={styles.optionLabel}>Send feedback to parent</Text>
              <Switch
                value={sendToParent}
                onValueChange={setSendToParent}
                trackColor={{ false: '#ccc', true: '#34C759' }}
              />
            </View>

            <View style={styles.optionRow}>
              <View style={styles.optionTextContainer}>
                <Text style={styles.optionLabel}>Flag as urgent concern</Text>
                <Text style={styles.optionDescription}>Notify admin immediately</Text>
              </View>
              <Switch
                value={urgentConcern}
                onValueChange={setUrgentConcern}
                trackColor={{ false: '#ccc', true: '#FF3B30' }}
              />
            </View>
          </View>
        </View>
      )}

      {/* Submit Button */}
      {selectedChild && (
        <TouchableOpacity
          style={[styles.submitButton, submitting && { opacity: 0.7 }]}
          onPress={handleSubmit}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <Send size={20} color="#fff" />
              <Text style={styles.submitButtonText}>Submit Feedback</Text>
            </>
          )}
        </TouchableOpacity>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
    paddingTop: 40,
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
    paddingRight: 16,
    gap: 10,
  },
  childButton: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#eee',
    marginRight: 8,
  },
  selectedChildButton: {
    backgroundColor: '#34C759',
    borderColor: '#34C759',
  },
  childButtonText: {
    color: '#666',
    fontWeight: '600',
  },
  selectedChildButtonText: {
    color: '#fff',
  },
  moodSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  moodButton: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#f0f0f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  moodLabel: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  textArea: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    textAlignVertical: 'top',
    height: 100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  optionsContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  optionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  optionTextContainer: {
    flex: 1,
  },
  optionLabel: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  optionDescription: {
    fontSize: 14,
    color: '#666',
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#34C759',
    borderRadius: 12,
    padding: 18,
    marginBottom: 40,
    shadowColor: '#34C759',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    marginLeft: 10,
  },
});

export default DailyFeedbackScreen;