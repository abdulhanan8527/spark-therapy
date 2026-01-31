import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { childAPI, feedbackAPI } from '../../services/api';

const DailyFeedbackScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [selectedChild, setSelectedChild] = useState(null);
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState({
    mood: '',
    activities: '',
    achievements: '',
    challenges: '',
    recommendations: '',
    notes: ''
  });

  // Load children when component mounts
  React.useEffect(() => {
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
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load children');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedChild) {
      Alert.alert('Error', 'Please select a child');
      return;
    }

    if (!feedback.mood) {
      Alert.alert('Error', 'Please select a mood');
      return;
    }

    try {
      setLoading(true);
      const feedbackData = {
        childId: selectedChild._id,
        mood: feedback.mood,
        activities: feedback.activities.split(',').map(a => a.trim()).filter(a => a),
        achievements: feedback.achievements.split(',').map(a => a.trim()).filter(a => a),
        challenges: feedback.challenges.split(',').map(a => a.trim()).filter(a => a),
        recommendations: feedback.recommendations.split(',').map(a => a.trim()).filter(a => a),
        notes: feedback.notes
      };

      const response = await feedbackAPI.createFeedback(feedbackData);
      if (response.success) {
        Alert.alert('Success', 'Feedback submitted successfully');
        // Reset form
        setFeedback({
          mood: '',
          activities: '',
          achievements: '',
          challenges: '',
          recommendations: '',
          notes: ''
        });
      } else {
        Alert.alert('Error', response.message);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to submit feedback');
    } finally {
      setLoading(false);
    }
  };

  const moodOptions = [
    { value: 'happy', label: '😊 Happy' },
    { value: 'sad', label: '😢 Sad' },
    { value: 'angry', label: '😠 Angry' },
    { value: 'excited', label: '🤩 Excited' },
    { value: 'tired', label: '😴 Tired' },
    { value: 'neutral', label: '😐 Neutral' }
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Daily Feedback</Text>
        <Text style={styles.subtitle}>Share today's session details</Text>
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
                  onPress={() => setSelectedChild(child)}
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

        {/* Mood Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Child's Mood</Text>
          <View style={styles.moodSelector}>
            {moodOptions.map((mood) => (
              <TouchableOpacity
                key={mood.value}
                style={[
                  styles.moodOption,
                  feedback.mood === mood.value && styles.selectedMood
                ]}
                onPress={() => setFeedback({ ...feedback, mood: mood.value })}
              >
                <Text style={[
                  styles.moodEmoji,
                  feedback.mood === mood.value && styles.selectedMoodText
                ]}>
                  {mood.label.split(' ')[0]}
                </Text>
                <Text style={[
                  styles.moodLabel,
                  feedback.mood === mood.value && styles.selectedMoodText
                ]}>
                  {mood.label.split(' ')[1]}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Activities */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Activities</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Enter activities (comma separated)"
            value={feedback.activities}
            onChangeText={(text) => setFeedback({ ...feedback, activities: text })}
            multiline
          />
        </View>

        {/* Achievements */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Achievements</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Enter achievements (comma separated)"
            value={feedback.achievements}
            onChangeText={(text) => setFeedback({ ...feedback, achievements: text })}
            multiline
          />
        </View>

        {/* Challenges */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Challenges</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Enter challenges (comma separated)"
            value={feedback.challenges}
            onChangeText={(text) => setFeedback({ ...feedback, challenges: text })}
            multiline
          />
        </View>

        {/* Recommendations */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recommendations</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Enter recommendations (comma separated)"
            value={feedback.recommendations}
            onChangeText={(text) => setFeedback({ ...feedback, recommendations: text })}
            multiline
          />
        </View>

        {/* Notes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Additional Notes</Text>
          <TextInput
            style={[styles.textInput, styles.notesInput]}
            placeholder="Any additional notes..."
            value={feedback.notes}
            onChangeText={(text) => setFeedback({ ...feedback, notes: text })}
            multiline
            numberOfLines={4}
          />
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitButton, loading && styles.disabledButton]}
          onPress={handleSubmit}
          disabled={loading}
        >
          <Text style={styles.submitButtonText}>
            {loading ? 'Submitting...' : 'Submit Feedback'}
          </Text>
        </TouchableOpacity>
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
    backgroundColor: '#007AFF',
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
    backgroundColor: '#007AFF',
  },
  childName: {
    color: '#333',
    fontWeight: '500',
  },
  selectedChildText: {
    color: '#fff',
  },
  moodSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  moodOption: {
    backgroundColor: '#e0e0e0',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
    alignItems: 'center',
  },
  selectedMood: {
    backgroundColor: '#007AFF',
  },
  moodEmoji: {
    fontSize: 20,
  },
  moodLabel: {
    fontSize: 12,
    color: '#666',
  },
  selectedMoodText: {
    color: '#fff',
  },
  textInput: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
  },
  notesInput: {
    height: 120,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default DailyFeedbackScreen;