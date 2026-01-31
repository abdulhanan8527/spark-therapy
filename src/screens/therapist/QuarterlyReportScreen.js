import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FileText, Upload, Clock } from '../../components/SimpleIcons';
import { useAuth } from '../../contexts/AuthContext';

const QuarterlyReportScreen = () => {
  const { user } = useAuth();
  const [selectedChild, setSelectedChild] = useState(null);
  const [reportPeriod, setReportPeriod] = useState('');
  const [progressSummary, setProgressSummary] = useState('');
  const [goalsAchieved, setGoalsAchieved] = useState('');
  const [areasForImprovement, setAreasForImprovement] = useState('');
  const [recommendations, setRecommendations] = useState('');
  const [nextSteps, setNextSteps] = useState('');
  const [uploadedReports, setUploadedReports] = useState([
    // Mock data for demonstration
    {
      id: 1,
      child: 'Emma Johnson',
      period: 'Q3 2025',
      date: '2025-09-30',
      status: 'approved',
    },
    {
      id: 2,
      child: 'Emma Johnson',
      period: 'Q4 2025',
      date: '2025-12-31',
      status: 'pending',
    },
    {
      id: 3,
      child: 'Liam Chen',
      period: 'Q3 2025',
      date: '2025-09-28',
      status: 'approved',
    },
  ]);

  const children = [
    { id: 1, name: 'Emma Johnson' },
    { id: 2, name: 'Liam Chen' },
    { id: 3, name: 'Olivia Martinez' },
  ];

  const reportPeriods = [
    'Q1 2026',
    'Q2 2026',
    'Q3 2026',
    'Q4 2026',
  ];

  const handleSubmit = () => {
    if (!selectedChild || !reportPeriod || !progressSummary) {
      Alert.alert('Error', 'Please select a child, report period, and provide a progress summary');
      return;
    }

    // In a real app, this would be sent to the backend
    const newReport = {
      id: uploadedReports.length + 1,
      child: children.find(c => c.id === selectedChild)?.name,
      period: reportPeriod,
      date: new Date().toISOString().split('T')[0],
      status: 'pending',
    };

    setUploadedReports([...uploadedReports, newReport]);
    Alert.alert('Success', 'Quarterly report submitted successfully! It will be reviewed and made available to parents.');
    
    // Reset form
    setSelectedChild(null);
    setReportPeriod('');
    setProgressSummary('');
    setGoalsAchieved('');
    setAreasForImprovement('');
    setRecommendations('');
    setNextSteps('');
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved':
        return <Ionicons name="checkmark-circle" size={16} color="#34C759" />;
      case 'pending':
        return <Ionicons name="time" size={16} color="#FF9500" />;
      case 'rejected':
        return <Ionicons name="alert-circle" size={16} color="#FF3B30" />;
      default:
        return <Ionicons name="time" size={16} color="#8E8E93" />;
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

  const filteredReports = selectedChild 
    ? uploadedReports.filter(report => report.child === children.find(c => c.id === selectedChild)?.name)
    : uploadedReports;

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Quarterly Reports</Text>
      
      {/* Upload Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Create New Report</Text>
        <View style={styles.uploadContainer}>
          {/* Child Selection */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Select Child</Text>
            <View style={styles.childSelector}>
              {children.map((child) => (
                <TouchableOpacity
                  key={child.id}
                  style={[
                    styles.childButton,
                    selectedChild === child.id && styles.selectedChildButton
                  ]}
                  onPress={() => setSelectedChild(child.id)}
                >
                  <Text style={[
                    styles.childButtonText,
                    selectedChild === child.id && styles.selectedChildButtonText
                  ]}>
                    {child.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Report Period */}
          {selectedChild && (
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Report Period</Text>
              <View style={styles.periodSelector}>
                {reportPeriods.map((period) => (
                  <TouchableOpacity
                    key={period}
                    style={[
                      styles.periodButton,
                      reportPeriod === period && styles.selectedPeriodButton
                    ]}
                    onPress={() => setReportPeriod(period)}
                  >
                    <Text style={[
                      styles.periodButtonText,
                      reportPeriod === period && styles.selectedPeriodButtonText
                    ]}>
                      {period}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Progress Summary */}
          {selectedChild && reportPeriod && (
            <>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Progress Summary</Text>
                <TextInput
                  style={styles.textArea}
                  placeholder="Provide a comprehensive summary of the child's progress during this quarter..."
                  value={progressSummary}
                  onChangeText={setProgressSummary}
                  multiline
                  numberOfLines={4}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Goals Achieved</Text>
                <TextInput
                  style={styles.textArea}
                  placeholder="List the specific goals achieved during this quarter..."
                  value={goalsAchieved}
                  onChangeText={setGoalsAchieved}
                  multiline
                  numberOfLines={3}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Areas for Improvement</Text>
                <TextInput
                  style={styles.textArea}
                  placeholder="Identify areas where the child needs continued focus..."
                  value={areasForImprovement}
                  onChangeText={setAreasForImprovement}
                  multiline
                  numberOfLines={3}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Recommendations for Parents</Text>
                <TextInput
                  style={styles.textArea}
                  placeholder="Provide specific recommendations for parents to support continued progress..."
                  value={recommendations}
                  onChangeText={setRecommendations}
                  multiline
                  numberOfLines={3}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Next Steps</Text>
                <TextInput
                  style={styles.textArea}
                  placeholder="Outline the therapeutic approach for the next quarter..."
                  value={nextSteps}
                  onChangeText={setNextSteps}
                  multiline
                  numberOfLines={3}
                />
              </View>

              <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
                <Upload size={20} color="#fff" />
                <Text style={styles.submitButtonText}>Submit Report</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>

      {/* Uploaded Reports */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Uploaded Reports</Text>
        <View style={styles.reportsList}>
          {filteredReports.map((report) => (
            <View key={report.id} style={styles.reportCard}>
              <View style={styles.reportHeader}>
                <View style={styles.reportInfo}>
                  <Text style={styles.reportTitle}>{report.child}</Text>
                  <Text style={styles.reportPeriod}>{report.period}</Text>
                </View>
                <View style={[styles.statusBadge, getStatusStyle(report.status)]}>
                  {getStatusIcon(report.status)}
                  <Text style={styles.statusText}>{getStatusText(report.status)}</Text>
                </View>
              </View>
              
              <View style={styles.reportDetails}>
                <Text style={styles.reportDate}>Submitted: {report.date}</Text>
              </View>
              
              <View style={styles.reportActions}>
                <TouchableOpacity style={styles.actionButton}>
                  <FileText size={16} color="#007AFF" />
                  <Text style={styles.actionText}>View</Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.actionButton}>
                  <Upload size={16} color="#34C759" />
                  <Text style={styles.actionText}>Download</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
          
          {filteredReports.length === 0 && (
            <View style={styles.emptyState}>
              <FileText size={40} color="#8E8E93" />
              <Text style={styles.emptyStateText}>No reports uploaded yet</Text>
              <Text style={styles.emptyStateSubtext}>Create and upload a quarterly report to get started</Text>
            </View>
          )}
        </View>
      </View>

      {/* Instructions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Instructions</Text>
        <View style={styles.instructionsContainer}>
          <Text style={styles.instructionText}>
            1. Select the child and report period
          </Text>
          <Text style={styles.instructionText}>
            2. Complete all sections of the quarterly report
          </Text>
          <Text style={styles.instructionText}>
            3. Submit the report for review
          </Text>
          <Text style={styles.instructionText}>
            4. Approved reports will be made available to parents
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
  periodSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  periodButton: {
    backgroundColor: '#e0e0e0',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  selectedPeriodButton: {
    backgroundColor: '#007AFF',
  },
  periodButtonText: {
    color: '#333',
    fontWeight: '500',
  },
  selectedPeriodButtonText: {
    color: '#fff',
  },
  textArea: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    textAlignVertical: 'top',
    height: 100,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#34C759',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  reportsList: {
    gap: 12,
  },
  reportCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  reportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  reportInfo: {
    flex: 1,
  },
  reportTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  reportPeriod: {
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
  reportDetails: {
    marginBottom: 12,
  },
  reportDate: {
    fontSize: 14,
    color: '#666',
  },
  reportActions: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    padding: 10,
  },
  actionText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
    marginLeft: 4,
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

export default QuarterlyReportScreen;