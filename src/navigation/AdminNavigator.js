import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';

// Admin Screens
import AdminDashboard from '../components/admin/AdminDashboard';
import TherapistManagementScreen from '../screens/admin/TherapistManagementScreen';
import ChildManagementScreen from '../screens/admin/ChildManagementScreen';
import ChildrenSection from '../components/admin/ChildrenSection';
import FeedbackSection from '../components/admin/FeedbackSection';
import ComplaintsScreen from '../screens/admin/ComplaintsScreen';
import FeeManagementScreen from '../screens/admin/FeeManagementScreen';
import TherapistDeactivationScreen from '../screens/admin/TherapistDeactivationScreen';
import NotificationsScreen from '../screens/admin/NotificationsScreen';
import SchedulingScreen from '../screens/admin/SchedulingScreen';
import LeaveRequestsScreen from '../screens/admin/LeaveRequestsScreen';
import BroadcastNotificationsScreen from '../screens/admin/BroadcastNotificationsScreen';

import InvoiceManagementScreen from '../screens/admin/InvoiceManagementScreen';

const Tab = createBottomTabNavigator();

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
            <Ionicons name="people-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="ChildrenSection"
        component={ChildrenSection}
        options={{
          tabBarLabel: 'Children Mgmt',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="people-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="FeedbackSection"
        component={FeedbackSection}
        options={{
          drawerLabel: 'Feedback Management',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="chatbubble-ellipses-outline" size={size} color={color} />
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
        name="Complaints"
        component={ComplaintsScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="alert-triangle-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="FeeManagement"
        component={FeeManagementScreen}
        options={{
          tabBarLabel: 'Fee Management',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="cash-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Deactivation"
        component={TherapistDeactivationScreen}
        options={{
          tabBarLabel: 'Deactivation',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="person-remove-outline" size={size} color={color} />
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
      <Tab.Screen
        name="LeaveRequests"
        component={LeaveRequestsScreen}
        options={{
          tabBarLabel: 'Leave Requests',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="calendar-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Broadcast"
        component={BroadcastNotificationsScreen}
        options={{
          drawerLabel: 'Broadcast Notifications',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="megaphone-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Invoices"
        component={InvoiceManagementScreen}
        options={{
          tabBarLabel: 'Invoices',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="receipt-outline" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default AdminTabNavigator;