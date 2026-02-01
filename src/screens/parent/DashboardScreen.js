import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Users, Calendar, Bell, DollarSign, LogOut, ChevronRight } from '../../components/SimpleIcons';
import { useAuth } from '../../contexts/AuthContext';
import { childAPI, invoiceAPI, scheduleAPI, notificationAPI } from '../../services/api';
import NavigationService from '../../utils/NavigationService';

const ParentDashboardScreen = ({ navigation }) => {
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    childrenCount: 0,
    upcomingSessions: 0,
    pendingInvoices: 0,
    unreadNotifications: 0
  });

  useEffect(() => {
    const checkAuthAndFetch = async () => {
      // Check if user is a parent before fetching data
      if (user?.role !== 'parent') {
        Alert.alert('Access Denied', 'You must be logged in as a parent to access this screen.');
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
      // Only fetch data that the parent role is authorized to access
      const [childrenRes, invoicesRes, notificationsRes] = await Promise.all([
        childAPI.getChildren().catch(err => ({ success: false, data: [], error: err })),
        invoiceAPI.getInvoicesByParentId(user._id).catch(err => ({ success: false, data: [], error: err })),
        notificationAPI.getNotifications().catch(err => ({ success: false, data: [], error: err }))
        // Removed scheduleAPI.getAllSchedules() as it requires admin permissions
      ]);

      // Safely handle API responses - support both { data: [] } and { data: { data: [] } } formats
      const invoicesData = Array.isArray(invoicesRes?.data) ? invoicesRes.data : (invoicesRes?.data?.data && Array.isArray(invoicesRes.data.data) ? invoicesRes.data.data : []);
      const notificationsData = Array.isArray(notificationsRes?.data) ? notificationsRes.data : (notificationsRes?.data?.data && Array.isArray(notificationsRes.data.data) ? notificationsRes.data.data : []);
      const childrenData = Array.isArray(childrenRes?.data) ? childrenRes.data : (childrenRes?.data?.data && Array.isArray(childrenRes.data.data) ? childrenRes.data.data : []);

      setStats({
        childrenCount: Array.isArray(childrenData) ? childrenData.length : 0,
        pendingInvoices: Array.isArray(invoicesData) ? invoicesData.filter(inv => inv && inv.status && (String(inv.status).toLowerCase() === 'pending' || String(inv.status).toLowerCase() === 'overdue')).length : 0,
        upcomingSessions: 0, // Parents don't have access to schedules API
        unreadNotifications: Array.isArray(notificationsData) ? notificationsData.filter(n => n && (n.isRead === false || n.read === false)).length : 0
      });
    } catch (error) {
      console.error('Dashboard fetch error:', error?.message || error);
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

  const StatCard = ({ title, value, icon: Icon, color, onPress }) => (
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

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.welcomeText}>Hello,</Text>
          <Text style={styles.userNameText}>{user?.name || 'Parent'}</Text>
        </View>
        <TouchableOpacity style={styles.logoutIcon} onPress={handleLogout}>
          <LogOut size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Overview</Text>

        <View style={styles.statsGrid}>
          <StatCard
            title="My Children"
            value={stats.childrenCount}
            icon={Users}
            color="#007AFF"
            onPress={() => {
              try {
                navigation.navigate('Schedule');
              } catch (error) {
                console.warn('Navigation to Schedule failed:', error);
                Alert.alert('Feature not available', 'Schedule/Attendance tracking is not available in your current view.');
              }
            }}
          />
          <StatCard
            title="Upcoming Sessions"
            value={stats.upcomingSessions}
            icon={Calendar}
            color="#34C759"
            onPress={() => {
              try {
                navigation.navigate('Schedule');
              } catch (error) {
                console.warn('Navigation to Schedule failed:', error);
                Alert.alert('Feature not available', 'Schedule/Attendance tracking is not available in your current view.');
              }
            }}
          />
          <StatCard
            title="Pending Invoices"
            value={stats.pendingInvoices}
            icon={DollarSign}
            color="#FF9500"
            onPress={() => {
              try {
                navigation.navigate('Invoices');
              } catch (error) {
                console.warn('Navigation to Invoices failed:', error);
                Alert.alert('Feature not available', 'Invoices are not available in your current view.');
              }
            }}
          />
          <StatCard
            title="Notifications"
            value={stats.unreadNotifications}
            icon={Bell}
            color="#FF3B30"
            onPress={() => {
              try {
                navigation.navigate('Notifications');
              } catch (error) {
                console.warn('Navigation to Notifications failed:', error);
                Alert.alert('Feature not available', 'Notifications are not available in your current view.');
              }
            }}
          />
        </View>

        <View style={styles.quickActions}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => {
              try {
                navigation.navigate('Schedule');
              } catch (error) {
                console.warn('Navigation to Schedule failed:', error);
                Alert.alert('Feature not available', 'Schedule/Attendance tracking is not available in your current view.');
              }
            }}
            >
              <Calendar size={20} color="#fff" />
              <Text style={styles.actionButtonText}>Attendance</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: '#34C759' }]}
              onPress={() => {
                try {
                  navigation.navigate('Invoices');
                } catch (error) {
                  console.warn('Navigation to Invoices failed:', error);
                  Alert.alert('Feature not available', 'Invoices are not available in your current view.');
                }
              }}
            >
              <DollarSign size={20} color="#fff" />
              <Text style={styles.actionButtonText}>Payments</Text>
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
    backgroundColor: '#007AFF',
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
    backgroundColor: '#007AFF',
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

export default ParentDashboardScreen;