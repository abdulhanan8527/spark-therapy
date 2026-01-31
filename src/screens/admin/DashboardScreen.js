import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import NavigationService from '../../utils/NavigationService';

const AdminDashboardScreen = ({ navigation }) => {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    // Reset to the auth stack using global navigation reference
    NavigationService.resetToAuth();
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.welcomeText}>Welcome, {user?.name}</Text>
        <Text style={styles.roleText}>Admin Dashboard</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>User Management</Text>
          <Text style={styles.cardDescription}>Manage parents, therapists, and admin accounts</Text>
          <TouchableOpacity
            style={styles.cardButton}
            onPress={() => navigation.navigate('Therapists')}
          >
            <Text style={styles.cardButtonText}>Manage Users</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Child Management</Text>
          <Text style={styles.cardDescription}>Manage children and assign therapists</Text>
          <TouchableOpacity
            style={styles.cardButton}
            onPress={() => navigation.navigate('Children')}
          >
            <Text style={styles.cardButtonText}>Manage Children</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Program Oversight</Text>
          <Text style={styles.cardDescription}>Review and monitor therapy programs</Text>
          <TouchableOpacity
            style={styles.cardButton}
            onPress={() => navigation.navigate('Scheduling')}
          >
            <Text style={styles.cardButtonText}>View Programs</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Notifications</Text>
          <Text style={styles.cardDescription}>Send announcements and manage notifications</Text>
          <TouchableOpacity
            style={styles.cardButton}
            onPress={() => navigation.navigate('Notifications')}
          >
            <Text style={styles.cardButtonText}>Manage Notifications</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Reports</Text>
          <Text style={styles.cardDescription}>Generate and view system reports</Text>
          <TouchableOpacity
            style={styles.cardButton}
            onPress={() => navigation.navigate('Invoices')}
          >
            <Text style={styles.cardButtonText}>View Reports</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Logout</Text>
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
    backgroundColor: '#ff9500',
    padding: 20,
    paddingTop: 50,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  roleText: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.9,
  },
  content: {
    padding: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  cardDescription: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  cardButton: {
    backgroundColor: '#ff9500',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cardButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  logoutButton: {
    backgroundColor: '#ff3b30',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default AdminDashboardScreen;