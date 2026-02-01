import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Users, Calendar, Clipboard, Bell, LogOut, ChevronRight } from '../../components/SimpleIcons';
import { useAuth } from '../../contexts/AuthContext';
import { childAPI, scheduleAPI, notificationAPI } from '../../services/api';
import NavigationService from '../../utils/NavigationService';

const TherapistDashboardScreen = ({ navigation }) => {
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    assignedChildren: 0,
    todaySessions: 0,
    pendingNotes: 0,
    unreadNotifications: 0
  });

  useEffect(() => {
    const checkAuthAndFetch = async () => {
      // Check if user is a therapist before fetching data
      if (user?.role !== 'therapist') {
        Alert.alert('Access Denied', 'You must be logged in as a therapist to access this screen.');
        return;
      }
      fetchDashboardData();
    };
    
    checkAuthAndFetch();
  }, [user]);

  const fetchDashboardData = async () => {
    if (!user?._id) return;
    try {
      setLoading(true);
      const [childrenRes, scheduleRes, notificationsRes] = await Promise.all([
        childAPI.getChildren().catch(() => ({ success: false, data: [] })),
        scheduleAPI.getSchedulesByTherapistId(user._id).catch(() => ({ success: false, data: [] })),
        notificationAPI.getNotifications().catch(() => ({ success: false, data: [] }))
      ]);

      const childrenData = Array.isArray(childrenRes?.data) ? childrenRes.data : [];
      const scheduleData = Array.isArray(scheduleRes?.data) ? scheduleRes.data : [];
      const notificationsData = Array.isArray(notificationsRes?.data) ? notificationsRes.data : [];

      setStats({
        assignedChildren: childrenData.length,
        todaySessions: scheduleData.length,
        pendingNotes: scheduleData.filter(s => s && !s.sessionNotes).length,
        unreadNotifications: notificationsData.filter(n => n && !n.isRead && n.read !== true).length
      });
    } catch (error) {
      if (typeof __DEV__ !== 'undefined' && __DEV__) {
        console.warn('Therapist dashboard fetch error:', error?.message);
      }
      Alert.alert('Error', error?.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    // Reset to the auth stack using global navigation reference
    NavigationService.resetToAuth();
  };

  const StatCard = ({ title, value, icon: Icon, color, onPress }) => {
    // Safety check to ensure Icon is a valid component
    if (!Icon) {
      console.error('Invalid icon passed to StatCard:', { title, value, color });
      return null; // or render a fallback
    }
    
    return (
      <TouchableOpacity style={styles.statCard} onPress={onPress}>
        <View style={[styles.iconContainer, { backgroundColor: color + '15' }]}>        
          <Icon size={24} color={color} />
        </View>
        <View style={styles.statInfo}>
          <Text style={styles.statValue}>{value}</Text>
          <Text style={styles.statTitle}>{title}</Text>
        </View>
        <ChevronRight size={20} color="#CCC" />
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#34c759" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.welcomeText}>Welcome back,</Text>
          <Text style={styles.userNameText}>{user?.name?.split(' ')[0] || 'Therapist'}</Text>
        </View>
        <TouchableOpacity style={styles.logoutIcon} onPress={handleLogout}>
          <LogOut size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Daily Summary</Text>

        <View style={styles.statsGrid}>
          <StatCard
            title="Assigned Children"
            value={stats.assignedChildren}
            icon={Users}
            color="#007AFF"
            onPress={() => Alert.alert('My Children', 'Navigation to child list...')}
          />
          <StatCard
            title="Today's Sessions"
            value={stats.todaySessions}
            icon={Calendar}
            color="#34c759"
            onPress={() => Alert.alert('Schedule', 'Opening schedule...')}
          />
          <StatCard
            title="Pending Notes"
            value={stats.pendingNotes}
            icon={Clipboard}
            color="#FF9500"
            onPress={() => Alert.alert('Session Notes', 'Opening session notes...')}
          />
          <StatCard
            title="Notifications"
            value={stats.unreadNotifications}
            icon={Bell}
            color="#FF3B30"
            onPress={() => Alert.alert('Notifications', 'Opening notifications...')}
          />
        </View>

        <View style={styles.quickActions}>
          <Text style={styles.sectionTitle}>Workcenter</Text>
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => navigation.navigate('Programs')}
            >
              <Clipboard size={20} color="#fff" />
              <Text style={styles.actionButtonText}>Build Program</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: '#FF2D55' }]}
              onPress={() => navigation.navigate('Feedback')}
            >
              <Users size={20} color="#fff" />
              <Text style={styles.actionButtonText}>Session Lab</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    backgroundColor: '#34c759',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 30,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  welcomeText: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
  },
  userNameText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  logoutIcon: {
    padding: 10,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
  },
  content: {
    padding: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 16,
  },
  statsGrid: {
    gap: 16,
  },
  statCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  statInfo: {
    flex: 1,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1A1A1A',
  },
  statTitle: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  quickActions: {
    marginTop: 32,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#34c759',
    padding: 16,
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
});

export default TherapistDashboardScreen;