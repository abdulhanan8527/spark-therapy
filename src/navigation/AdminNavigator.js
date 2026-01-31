import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
// Stack navigator import removed - not used in this file
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

const Drawer = createDrawerNavigator();
// Stack navigator removed - not used in this file

// Admin Drawer Content Component
const AdminDrawerContent = () => {
  return (
    <Drawer.Navigator
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: '#FF9500',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        drawerActiveBackgroundColor: '#FF9500',
        drawerActiveTintColor: '#fff',
        drawerInactiveTintColor: '#333',
      }}
    >
      <Drawer.Screen
        name="Dashboard"
        component={AdminDashboard}
        options={{
          drawerIcon: ({ color, size }) => (
            <Ionicons name="grid-outline" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="Therapists"
        component={TherapistManagementScreen}
        options={{
          drawerIcon: ({ color, size }) => (
            <Ionicons name="people-outline" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="Children"
        component={ChildManagementScreen}
        options={{
          drawerIcon: ({ color, size }) => (
            <Ionicons name="people-outline" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="ChildrenSection"
        component={ChildrenSection}
        options={{
          drawerLabel: 'Children Management',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="people-outline" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="FeedbackSection"
        component={FeedbackSection}
        options={{
          drawerLabel: 'Feedback Management',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="chatbubble-ellipses-outline" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="Scheduling"
        component={SchedulingScreen}
        options={{
          drawerIcon: ({ color, size }) => (
            <Ionicons name="calendar-outline" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="Complaints"
        component={ComplaintsScreen}
        options={{
          drawerIcon: ({ color, size }) => (
            <Ionicons name="alert-triangle-outline" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="FeeManagement"
        component={FeeManagementScreen}
        options={{
          drawerLabel: 'Fee Management',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="cash-outline" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="Deactivation"
        component={TherapistDeactivationScreen}
        options={{
          drawerLabel: 'Deactivation',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="person-remove-outline" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{
          drawerIcon: ({ color, size }) => (
            <Ionicons name="notifications-outline" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="LeaveRequests"
        component={LeaveRequestsScreen}
        options={{
          drawerLabel: 'Leave Requests',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="calendar-outline" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="Broadcast"
        component={BroadcastNotificationsScreen}
        options={{
          drawerLabel: 'Broadcast Notifications',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="megaphone-outline" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="Invoices"
        component={InvoiceManagementScreen}
        options={{
          drawerLabel: 'Invoice Management',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="receipt-outline" size={size} color={color} />
          ),
        }}
      />
    </Drawer.Navigator>
  );
};

export default AdminDrawerContent;