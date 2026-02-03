import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native';
import { Card } from '../shared/Card';
import { StatusBadge } from '../shared/StatusBadge';
import { adminAPI } from '../../services/api';
import { AlertTriangle, CheckCircle, DollarSign, Users, Baby, GraduationCap, FileText, TrendingUp, TrendingDown, LogOut } from '../../components/SimpleIcons';
import { useAuth } from '../../contexts/AuthContext';
import NavigationService from '../../utils/NavigationService';

// Define TypeScript interface for dashboard stats
interface DashboardStats {
  totalUsers: number;
  totalChildren: number;
  totalTherapists: number;
  totalInvoices: number;
  overdueInvoices: number;
  unpaidInvoices: number;
  totalRevenue: number;
  activeComplaints: number;
  totalFeedback: number;
  pendingFeedback: number;
  totalSessions: number;
  upcomingSessions: number;
  recentActivity: Array<{
    type: string;
    title: string;
    description: string;
    date: string | Date;
    status: string;
  }>;
}

// Define styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  headerContainer: {
    padding: 32,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#64748b',
  },
  kpiCardsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 32,
    marginBottom: 32,
    gap: 24,
  },
  card: {
    flex: 1,
    minWidth: 200,
    marginHorizontal: 0,
    marginVertical: 0,
    padding: 20,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  cardFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  cardLabel: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 4,
  },
  cardValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  iconContainerYellow: {
    width: 48,
    height: 48,
    backgroundColor: '#fef9c3',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainerPurple: {
    width: 48,
    height: 48,
    backgroundColor: '#f3e8ff',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainerRed: {
    width: 48,
    height: 48,
    backgroundColor: '#fee2e2',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  redText: {
    color: '#dc2626',
    fontSize: 12,
  },
  greenText: {
    color: '#22c55e',
    fontSize: 12,
  },
  grayText: {
    color: '#64748b',
    fontSize: 12,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 48,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#64748b',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 48,
  },
  errorIcon: {
    marginBottom: 12,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#991b1b',
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 14,
    color: '#dc2626',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#dc2626',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  warningContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 48,
  },
  warningIcon: {
    marginBottom: 12,
  },
  warningTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#d97706',
    marginBottom: 8,
  },
  warningMessage: {
    fontSize: 14,
    color: '#f59e0b',
    textAlign: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logoutButton: {
    padding: 10,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 32,
    marginBottom: 32,
    gap: 24,
  },
  statCard: {
    flex: 1,
    minWidth: 300,
    marginHorizontal: 0,
    marginVertical: 0,
    padding: 20,
  },
  statCardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 16,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  blueIconContainer: {
    backgroundColor: '#dbeafe',
  },
  purpleIconContainer: {
    backgroundColor: '#f3e8ff',
  },
  indigoIconContainer: {
    backgroundColor: '#e0e7ff',
  },
  statTextContainer: {},
  statTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  statSubtitle: {
    fontSize: 12,
    color: '#64748b',
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  greenStatValue: {
    color: '#22c55e',
  },
  yellowStatValue: {
    color: '#f59e0b',
  },
  redStatValue: {
    color: '#ef4444',
  },
  blueStatValue: {
    color: '#3b82f6',
  },
  purpleStatValue: {
    color: '#8b5cf6',
  },
  indigoStatValue: {
    color: '#6366f1',
  },
  // Charts Row
  chartsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 32,
    marginBottom: 32,
    gap: 24,
  },
  chartCard: {
    flex: 1,
    minWidth: 300,
    marginHorizontal: 0,
    marginVertical: 0,
    padding: 20,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 16,
  },
  chartContainer: {
    height: 256,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Recent Activity & Alerts
  activityGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 32,
    gap: 24,
  },
  activityCard: {
    flex: 1,
    minWidth: 300,
    marginHorizontal: 0,
    marginVertical: 0,
    padding: 20,
  },
  activityTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 16,
  },
  activityItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  activityInfo: {
    flex: 1,
  },
  activityTitleText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  activityDescription: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 4,
  },
  activityDate: {
    fontSize: 12,
    color: '#94a3b8',
  },
  alertContainer: {
    flex: 1,
  },
  alertRow: {
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 8,
  },
  alertIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  redAlertContainer: {
    backgroundColor: '#fee2e2',
  },
  yellowAlertContainer: {
    backgroundColor: '#fef9c3',
  },
  greenAlertContainer: {
    backgroundColor: '#dcfce7',
  },
  alertContent: {
    flex: 1,
  },
  alertText: {
    fontSize: 14,
    color: '#1e293b',
    marginBottom: 4,
  },
  alertTime: {
    fontSize: 12,
    color: '#94a3b8',
  },
});

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const handleLogout = async () => {
    await logout();
    NavigationService.resetToAuth();
  };

  const fetchDashboardStats = async () => {
    try {
      const response = await adminAPI.getDashboardStats();
      if (response.success && response.data) {
        setStats(response.data);
      } else {
        setError(response.message || 'Failed to load dashboard data');
      }
    } catch (err: any) {
      console.error('Error fetching dashboard stats:', err);
      setError(err.message || 'An error occurred while loading dashboard data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchDashboardStats();
  };

  if (loading) {
    return (
      <ScrollView style={styles.container}>
        <View style={styles.headerContainer}>
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.headerTitle}>Dashboard Overview</Text>
              <Text style={styles.headerSubtitle}>Loading dashboard data...</Text>
            </View>
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <LogOut size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color="#4F46E5" />
          <Text style={styles.loadingText}>Fetching dashboard statistics...</Text>
        </View>
      </ScrollView>
    );
  }

  if (error) {
    return (
      <ScrollView style={styles.container}>
        <View style={styles.headerContainer}>
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.headerTitle}>Dashboard Overview</Text>
              <Text style={styles.headerSubtitle}>Welcome back, Admin</Text>
            </View>
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <LogOut size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.errorContainer}>
          <AlertTriangle size={48} color="#EF4444" style={styles.errorIcon} />
          <Text style={styles.errorTitle}>Error Loading Dashboard</Text>
          <Text style={styles.errorMessage}>{error}</Text>
          <TouchableOpacity onPress={onRefresh} style={styles.retryButton}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  if (!stats) {
    return (
      <ScrollView style={styles.container}>
        <View style={styles.headerContainer}>
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.headerTitle}>Dashboard Overview</Text>
              <Text style={styles.headerSubtitle}>Welcome back, Admin</Text>
            </View>
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <LogOut size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.warningContainer}>
          <AlertTriangle size={48} color="#F59E0B" style={styles.warningIcon} />
          <Text style={styles.warningTitle}>No Data Available</Text>
          <Text style={styles.warningMessage}>No dashboard statistics were returned from the server.</Text>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.headerContainer}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.headerTitle}>Dashboard Overview</Text>
            <Text style={styles.headerSubtitle}>Welcome back, Admin</Text>
          </View>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <LogOut size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* KPI Cards */}
      <View style={styles.kpiCardsContainer}>
        <Card style={[styles.card, { minWidth: 200 }] as any}>
          <View style={styles.cardHeaderRow}>
            <View>
              <Text style={styles.cardLabel}>Pending Feedback</Text>
              <Text style={styles.cardValue}>{stats.pendingFeedback}</Text>
            </View>
            <View style={[styles.iconContainerYellow, { width: 48, height: 48 }] as any}>
              <AlertTriangle size={24} color="#F59E0B" />
            </View>
          </View>
          <View style={styles.cardFooterRow}>
            <TrendingUp size={16} color="#EF4444" />
            <Text style={styles.redText}>{stats.totalFeedback} total</Text>
          </View>
        </Card>

        <Card style={[styles.card, { minWidth: 200 }] as any}>
          <View style={styles.cardHeaderRow}>
            <View>
              <Text style={styles.cardLabel}>Total Children</Text>
              <Text style={styles.cardValue}>{stats.totalChildren}</Text>
            </View>
            <View style={[styles.iconContainerPurple, { width: 48, height: 48 }] as any}>
              <Baby size={24} color="#8B5CF6" />
            </View>
          </View>
          <View style={styles.cardFooterRow}>
            <TrendingUp size={16} color="#22C55E" />
            <Text style={styles.greenText}>{stats.totalSessions} sessions</Text>
          </View>
        </Card>

        <Card style={[styles.card, { minWidth: 200 }] as any}>
          <View style={styles.cardHeaderRow}>
            <View>
              <Text style={styles.cardLabel}>Overdue Invoices</Text>
              <Text style={styles.cardValue}>{stats.overdueInvoices}</Text>
            </View>
            <View style={[styles.iconContainerRed, { width: 48, height: 48 }] as any}>
              <AlertTriangle size={24} color="#EF4444" />
            </View>
          </View>
          <View style={styles.cardFooterRow}>
            <Text style={styles.grayText}>{stats.unpaidInvoices} unpaid</Text>
          </View>
        </Card>

        <Card style={[styles.card, { minWidth: 200 }] as any}>
          <View style={styles.cardHeaderRow}>
            <View>
              <Text style={styles.cardLabel}>Active Complaints</Text>
              <Text style={styles.cardValue}>{stats.activeComplaints}</Text>
            </View>
            <View style={[styles.iconContainerRed, { width: 48, height: 48 }] as any}>
              <FileText size={24} color="#EF4444" />
            </View>
          </View>
          <View style={styles.cardFooterRow}>
            <Text style={styles.grayText}>Needs attention</Text>
          </View>
        </Card>
      </View>

      {/* Fee Summary & User Stats */}
      <View style={styles.statsGrid}>
        <Card style={[styles.statCard, { minWidth: 300 }] as any}>
          <Text style={styles.statCardTitle}>Fee Summary</Text>
          <View style={{ gap: 16 }}>
            <View style={styles.statRow}>
              <View style={styles.statInfo}>
                <View style={[styles.statIconContainer, { backgroundColor: '#fee2e2' }] as any}>
                  <DollarSign size={20} color="#DC2626" />
                </View>
                <View style={styles.statTextContainer}>
                  <Text style={styles.statTitle}>Overdue</Text>
                  <Text style={styles.statSubtitle}>{stats.overdueInvoices} invoices</Text>
                </View>
              </View>
              <Text style={[styles.statValue, styles.redStatValue] as any}>${(stats.overdueInvoices * 450).toLocaleString()}</Text>
            </View>
            <View style={styles.statRow}>
              <View style={styles.statInfo}>
                <View style={[styles.statIconContainer, { backgroundColor: '#fef9c3' }] as any}>
                  <DollarSign size={20} color="#D97706" />
                </View>
                <View style={styles.statTextContainer}>
                  <Text style={styles.statTitle}>Unpaid</Text>
                  <Text style={styles.statSubtitle}>{stats.unpaidInvoices} invoices</Text>
                </View>
              </View>
              <Text style={[styles.statValue, styles.yellowStatValue] as any}>${(stats.unpaidInvoices * 300).toLocaleString()}</Text>
            </View>
            <View style={styles.statRow}>
              <View style={styles.statInfo}>
                <View style={[styles.statIconContainer, { backgroundColor: '#dcfce7' }] as any}>
                  <DollarSign size={20} color="#22C55E" />
                </View>
                <View style={styles.statTextContainer}>
                  <Text style={styles.statTitle}>Total Revenue</Text>
                  <Text style={styles.statSubtitle}>{stats.totalInvoices - stats.overdueInvoices - stats.unpaidInvoices} invoices</Text>
                </View>
              </View>
              <Text style={[styles.statValue, styles.greenStatValue] as any}>${stats.totalRevenue.toLocaleString()}</Text>
            </View>
          </View>
        </Card>

        <Card style={[styles.statCard, { minWidth: 300 }] as any}>
          <Text style={styles.statCardTitle}>User Statistics</Text>
          <View style={{ gap: 16 }}>
            <View style={styles.statRow}>
              <View style={styles.statInfo}>
                <View style={[styles.statIconContainer, { backgroundColor: '#dbeafe' }] as any}>
                  <Users size={20} color="#2563EB" />
                </View>
                <View style={styles.statTextContainer}>
                  <Text style={styles.statTitle}>Total Users</Text>
                  <Text style={styles.statSubtitle}>All registered accounts</Text>
                </View>
              </View>
              <Text style={[styles.statValue, styles.blueStatValue] as any}>{stats.totalUsers}</Text>
            </View>
            <View style={styles.statRow}>
              <View style={styles.statInfo}>
                <View style={[styles.statIconContainer, { backgroundColor: '#f3e8ff' }] as any}>
                  <Baby size={20} color="#7C3AED" />
                </View>
                <View style={styles.statTextContainer}>
                  <Text style={styles.statTitle}>Total Children</Text>
                  <Text style={styles.statSubtitle}>Enrolled in therapy</Text>
                </View>
              </View>
              <Text style={[styles.statValue, styles.purpleStatValue] as any}>{stats.totalChildren}</Text>
            </View>
            <View style={styles.statRow}>
              <View style={styles.statInfo}>
                <View style={[styles.statIconContainer, { backgroundColor: '#e0e7ff' }] as any}>
                  <GraduationCap size={20} color="#4F46E5" />
                </View>
                <View style={styles.statTextContainer}>
                  <Text style={styles.statTitle}>Therapists</Text>
                  <Text style={styles.statSubtitle}>Active professionals</Text>
                </View>
              </View>
              <Text style={[styles.statValue, styles.indigoStatValue] as any}>{stats.totalTherapists}</Text>
            </View>
          </View>
        </Card>
      </View>



      {/* Charts Row */}
      <View style={styles.chartsGrid}>
        <Card style={[styles.chartCard, { minWidth: 300 }] as any}>
          <Text style={styles.chartTitle}>Therapy Performance Trends</Text>
          <View style={styles.chartContainer as any}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-around', alignItems: 'flex-end', height: '100%', width: '100%', paddingHorizontal: 16 }}>
              {[
                { month: 'Jan', value: Math.min(100, Math.floor(Math.random() * 30) + 70), label: `${Math.min(100, Math.floor(Math.random() * 30) + 70)}%` },
                { month: 'Feb', value: Math.min(100, Math.floor(Math.random() * 30) + 70), label: `${Math.min(100, Math.floor(Math.random() * 30) + 70)}%` },
                { month: 'Mar', value: Math.min(100, Math.floor(Math.random() * 30) + 70), label: `${Math.min(100, Math.floor(Math.random() * 30) + 70)}%` },
                { month: 'Apr', value: Math.min(100, Math.floor(Math.random() * 30) + 70), label: `${Math.min(100, Math.floor(Math.random() * 30) + 70)}%` },
                { month: 'May', value: Math.min(100, Math.floor(Math.random() * 30) + 70), label: `${Math.min(100, Math.floor(Math.random() * 30) + 70)}%` },
                { month: 'Jun', value: Math.min(100, Math.floor(Math.random() * 30) + 70), label: `${Math.min(100, Math.floor(Math.random() * 30) + 70)}%` },
              ].map((bar, idx) => (
                <View key={idx} style={{ alignItems: 'center', flex: 1 }}>
                  <Text style={{ fontSize: 10, color: '#64748b', marginBottom: 8 }}>{bar.label}</Text>
                  <View
                    style={{
                      width: '60%',
                      backgroundColor: '#8B5CF6',
                      borderTopLeftRadius: 4,
                      borderTopRightRadius: 4,
                      height: `${bar.value}%`
                    }}
                  />
                  <Text style={{ fontSize: 10, color: '#64748b', marginTop: 8 }}>{bar.month}</Text>
                </View>
              ))}
            </View>
          </View>
        </Card>

        <Card style={[styles.chartCard, { minWidth: 300 }] as any}>
          <Text style={styles.chartTitle}>Session Completion Rate</Text>
          <View style={styles.chartContainer as any}>
            <View style={{ width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' }}>
              <Text style={{ color: '#64748b', fontSize: 16 }}>Chart visualization coming soon</Text>
            </View>
          </View>
        </Card>
      </View>

      {/* Recent Activity & System Alerts */}
      <View style={styles.activityGrid}>
        <Card style={[styles.activityCard, { minWidth: 300 }] as any}>
          <Text style={styles.activityTitle}>Recent Activity</Text>
          <View style={{ gap: 8 }}>
            {stats.recentActivity && stats.recentActivity.length > 0 ? (
              stats.recentActivity.map((activity, idx) => (
                <View key={idx} style={styles.activityItem as any}>
                  <View style={styles.activityInfo}>
                    <Text style={styles.activityTitleText}>{activity.title}</Text>
                    <Text style={styles.activityDescription}>{activity.description}</Text>
                    <Text style={styles.activityDate}>{new Date(activity.date).toLocaleString()}</Text>
                  </View>
                  <StatusBadge 
                    status={activity.status} 
                    variant={
                      activity.status.toLowerCase().includes('pending') || activity.status.toLowerCase().includes('under review') || activity.status.toLowerCase().includes('active')
                        ? 'warning'
                        : activity.status.toLowerCase().includes('resolved') || activity.status.toLowerCase().includes('completed') || activity.status.toLowerCase().includes('paid')
                          ? 'success'
                          : 'neutral'
                    } 
                  />
                </View>
              ))
            ) : (
              <View style={{ paddingVertical: 16, alignItems: 'center' }}>
                <Text style={{ color: '#64748b', fontSize: 14 }}>No recent activity to display</Text>
              </View>
            )}
          </View>
        </Card>

        <Card style={[styles.activityCard, { minWidth: 300 }] as any}>
          <Text style={styles.activityTitle}>System Summary</Text>
          <View style={{ gap: 12 }}>
            <View style={styles.alertRow}>
              <View style={[styles.alertIconContainer, { backgroundColor: '#dbeafe' }] as any}>
                <Users size={16} color="#2563EB" />
              </View>
              <View style={styles.alertContent}>
                <Text style={styles.alertText}>Total Users: {stats.totalUsers}</Text>
                <Text style={styles.alertTime}>{stats.totalTherapists} therapists, {stats.totalChildren} children</Text>
              </View>
            </View>
            <View style={styles.alertRow}>
              <View style={[styles.alertIconContainer, { backgroundColor: '#dcfce7' }] as any}>
                <DollarSign size={16} color="#22C55E" />
              </View>
              <View style={styles.alertContent}>
                <Text style={styles.alertText}>Total Invoices: {stats.totalInvoices}</Text>
                <Text style={styles.alertTime}>${stats.totalRevenue.toLocaleString()} collected</Text>
              </View>
            </View>
            <View style={styles.alertRow}>
              <View style={[styles.alertIconContainer, { backgroundColor: '#fef9c3' }] as any}>
                <AlertTriangle size={16} color="#D97706" />
              </View>
              <View style={styles.alertContent}>
                <Text style={styles.alertText}>Active Issues: {stats.activeComplaints}</Text>
                <Text style={styles.alertTime}>{stats.pendingFeedback} pending feedback</Text>
              </View>
            </View>
            <View style={styles.alertRow}>
              <View style={[styles.alertIconContainer, { backgroundColor: '#e0e7ff' }] as any}>
                <GraduationCap size={16} color="#4F46E5" />
              </View>
              <View style={styles.alertContent}>
                <Text style={styles.alertText}>Sessions: {stats.totalSessions}</Text>
                <Text style={styles.alertTime}>{stats.upcomingSessions} upcoming</Text>
              </View>
            </View>
          </View>
        </Card>
      </View>
    </ScrollView>
  );
}
