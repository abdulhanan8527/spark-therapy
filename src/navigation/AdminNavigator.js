import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';

// Admin Screens
import AdminDashboard from '../components/admin/AdminDashboard';
import TherapistManagementScreen from '../screens/admin/TherapistManagementScreen';
import ChildManagementScreen from '../screens/admin/ChildManagementScreen';
import ComplaintsScreen from '../screens/admin/ComplaintsScreen';
import NotificationsScreen from '../screens/admin/NotificationsScreen';
import SchedulingScreen from '../screens/admin/SchedulingScreen';

// Secondary screens (accessible from dashboard or other screens)
import FeedbackSection from '../components/admin/FeedbackSection';
import FeeManagementScreen from '../screens/admin/FeeManagementScreen';
import TherapistDeactivationScreen from '../screens/admin/TherapistDeactivationScreen';
import LeaveRequestsScreen from '../screens/admin/LeaveRequestsScreen';
import BroadcastNotificationsScreen from '../screens/admin/BroadcastNotificationsScreen';
import InvoiceManagementScreen from '../screens/admin/InvoiceManagementScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Admin Tab Navigator Component
const AdminTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: '#FF9500',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        tabBarActiveTintColor: '#FF9500',
        tabBarInactiveTintColor: '#666',
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: '#e0e0e0',
        },
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={AdminDashboard}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="grid-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Therapists"
        component={TherapistManagementScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="people-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Children"
        component={ChildManagementScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="people-circle-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Scheduling"
        component={SchedulingScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calendar-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="notifications-outline" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

// Main Admin Navigator with Stack for Secondary Screens
const AdminNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false }}
      initialRouteName="AdminTabs"
    >
      <Stack.Screen name="AdminTabs" component={AdminTabNavigator} />
      <Stack.Screen 
        name="Complaints" 
        component={ComplaintsScreen}
        options={{ 
          headerShown: true, 
          title: 'Complaints',
          headerStyle: { backgroundColor: '#FF9500' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: 'bold' },
        }}
      />
      <Stack.Screen 
        name="FeeManagement" 
        component={FeeManagementScreen}
        options={{ 
          headerShown: true, 
          title: 'Fee Management',
          headerStyle: { backgroundColor: '#FF9500' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: 'bold' },
        }}
      />
      <Stack.Screen 
        name="InvoiceManagement" 
        component={InvoiceManagementScreen}
        options={{ 
          headerShown: true, 
          title: 'Invoice Management',
          headerStyle: { backgroundColor: '#FF9500' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: 'bold' },
        }}
      />
      <Stack.Screen 
        name="LeaveRequests" 
        component={LeaveRequestsScreen}
        options={{ 
          headerShown: true, 
          title: 'Leave Requests',
          headerStyle: { backgroundColor: '#FF9500' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: 'bold' },
        }}
      />
      <Stack.Screen 
        name="BroadcastNotifications" 
        component={BroadcastNotificationsScreen}
        options={{ 
          headerShown: true, 
          title: 'Broadcast Notifications',
          headerStyle: { backgroundColor: '#FF9500' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: 'bold' },
        }}
      />
      <Stack.Screen 
        name="TherapistDeactivation" 
        component={TherapistDeactivationScreen}
        options={{ 
          headerShown: true, 
          title: 'Therapist Management',
          headerStyle: { backgroundColor: '#FF9500' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: 'bold' },
        }}
      />
      <Stack.Screen 
        name="Feedback" 
        component={FeedbackSection}
        options={{ 
          headerShown: true, 
          title: 'Feedback Management',
          headerStyle: { backgroundColor: '#FF9500' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: 'bold' },
        }}
      />
    </Stack.Navigator>
  );
};

export default AdminNavigator;