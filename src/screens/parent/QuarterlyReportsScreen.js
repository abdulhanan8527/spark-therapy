import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { childAPI, feedbackAPI } from '../../services/api';

const QuarterlyReportsScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [selectedChild, setSelectedChild] = useState(null);
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(false);
  const [reports, setReports] = useState([]);

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
          loadReports(response.data[0]._id);
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load children');
    } finally {
      setLoading(false);
    }
  };

  const loadReports = async (childId) => {
    try {
      setLoading(true);
      
      // Fetch feedback records for the child
      const response = await feedbackAPI.getFeedbackByChild(childId);
      
      if (response.success && response.data && response.data.feedback) {
        // Group feedback by quarter and create report data
        const feedbackData = response.data.feedback;
        
        // Group feedback by quarter
        const quarterlyData = feedbackData.reduce((acc, feedback) => {
          const date = new Date(feedback.date);
          const year = date.getFullYear();
          const quarter = Math.ceil(date.getMonth() / 3);
          const quarterKey = `Q${quarter} ${year}`;
          
          if (!acc[quarterKey]) {
            acc[quarterKey] = {
              id: quarterKey,
              quarter: quarterKey,
              period: getQuarterPeriod(quarter, year),
              date: date.toISOString().split('T')[0],
              status: 'completed',
              goalsAchieved: 0,
              totalGoals: 0,
              feedbackRecords: []
            };
          }
          
          acc[quarterKey].feedbackRecords.push(feedback);
          
          // Count achievements and challenges as goals
          acc[quarterKey].totalGoals += (feedback.achievements?.length || 0) + (feedback.challenges?.length || 0);
          acc[quarterKey].goalsAchieved += feedback.achievements?.length || 0;
          
          return acc;
        }, {});
        
        // Convert to array and sort by date
        const reports = Object.values(quarterlyData)
          .map(({ feedbackRecords, ...report }) => report)
          .sort((a, b) => new Date(b.date) - new Date(a.date));
          
        setReports(reports);
      } else {
        setReports([]);
      }
    } catch (error) {
      console.error('Error loading reports:', error);
      Alert.alert('Error', error.message || 'Failed to load reports');
      setReports([]);
    } finally {
      setLoading(false);
    }
  };
  
  // Helper function to get quarter period
  const getQuarterPeriod = (quarter, year) => {
    switch(quarter) {
      case 1: return `Jan-Mar ${year}`;
      case 2: return `Apr-Jun ${year}`;
      case 3: return `Jul-Sep ${year}`;
      case 4: return `Oct-Dec ${year}`;
      default: return `Q${quarter} ${year}`;
    }
  };

  const handleChildSelect = (child) => {
    setSelectedChild(child);
    loadReports(child._id);
  };

  const handleViewReport = (report) => {
    // In a real app, this would navigate to a detailed report view
    // For now, we'll show the report details in an alert
    Alert.alert(
      report.quarter,
      `Period: ${report.period}\nGoals Achieved: ${report.goalsAchieved}/${report.totalGoals}\nStatus: ${report.status}`
    );
  };

  const calculateProgress = (achieved, total) => {
    // Ensure both values are valid numbers
    const achievedNum = Number(achieved) || 0;
    const totalNum = Number(total) || 0;
    
    // Return 0 if total is 0 or invalid to avoid division by zero
    if (totalNum <= 0 || isNaN(achievedNum) || isNaN(totalNum)) {
      return 0;
    }
    
    return Math.round((achievedNum / totalNum) * 100);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Quarterly Reports</Text>
        <Text style={styles.subtitle}>Track your child's progress over time</Text>
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

        {/* Reports List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quarterly Reports</Text>
          {reports.length > 0 ? (
            reports.map((report) => (
              <View key={report.id} style={styles.reportCard}>
                <View style={styles.reportHeader}>
                  <View>
                    <Text style={styles.reportQuarter}>{report.quarter}</Text>
                    <Text style={styles.reportPeriod}>{report.period}</Text>
                  </View>
                  <Text style={styles.reportDate}>{report.date}</Text>
                </View>
                
                <View style={styles.progressSection}>
                  <View style={styles.progressInfo}>
                    <Text style={styles.progressLabel}>Progress</Text>
                    <Text style={styles.progressText}>
                      {report.goalsAchieved}/{report.totalGoals} goals
                    </Text>
                  </View>
                  <View style={styles.progressBarContainer}>
                    <View 
                      style={[
                        styles.progressBar,
                        { width: `${calculateProgress(report.goalsAchieved, report.totalGoals)}%` }
                      ]}
                    />
                  </View>
                  <Text style={styles.progressPercentage}>
                    {calculateProgress(report.goalsAchieved, report.totalGoals)}%
                  </Text>
                </View>
                
                <View style={styles.reportFooter}>
                  <Text style={[
                    styles.reportStatus,
                    report.status === 'completed' ? styles.completedStatus : styles.pendingStatus
                  ]}>
                    {report.status === 'completed' ? 'Completed' : 'Pending'}
                  </Text>
                  <TouchableOpacity 
                    style={styles.viewButton}
                    onPress={() => handleViewReport(report)}
                  >
                    <Text style={styles.viewButtonText}>View Report</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          ) : (
            <Text style={styles.noReportsText}>No reports available</Text>
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
    backgroundColor: '#AF52DE',
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
    backgroundColor: '#AF52DE',
  },
  childName: {
    color: '#333',
    fontWeight: '500',
  },
  selectedChildText: {
    color: '#fff',
  },
  reportCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  reportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  reportQuarter: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  reportPeriod: {
    fontSize: 14,
    color: '#666',
  },
  reportDate: {
    fontSize: 14,
    color: '#666',
  },
  progressSection: {
    marginBottom: 15,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  progressLabel: {
    fontSize: 14,
    color: '#666',
  },
  progressText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#AF52DE',
  },
  progressPercentage: {
    textAlign: 'right',
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
  reportFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reportStatus: {
    fontSize: 12,
    fontWeight: '500',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
  },
  completedStatus: {
    backgroundColor: '#e8f5e9',
    color: '#4caf50',
  },
  pendingStatus: {
    backgroundColor: '#fff3e0',
    color: '#ff9800',
  },
  viewButton: {
    backgroundColor: '#AF52DE',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 5,
  },
  viewButtonText: {
    color: '#fff',
    fontWeight: '500',
  },
  noReportsText: {
    textAlign: 'center',
    color: '#666',
    fontSize: 16,
    marginTop: 20,
  },
});

export default QuarterlyReportsScreen;