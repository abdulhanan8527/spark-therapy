import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Home, User, MessageCircle, Calendar, Bell } from '../components/SimpleIcons';
import { useAuth } from '../contexts/AuthContext';

// Therapist Screens
import TherapistDashboardScreen from '../screens/therapist/DashboardScreen';
import ChildDetailsScreen from '../screens/therapist/ChildDetailsScreen';
import DailyFeedbackScreen from '../screens/therapist/DailyFeedbackScreen';
import AttendanceScreen from '../screens/therapist/AttendanceScreen';
import NotificationsScreen from '../screens/therapist/NotificationsScreen';

// Secondary Screens (accessed via dashboard)
import WeeklyVideoScreen from '../screens/therapist/WeeklyVideoScreen';
import QuarterlyReportScreen from '../screens/therapist/QuarterlyReportScreen';
import LeaveRequestsScreen from '../screens/therapist/LeaveRequestsScreen';
import ProgramBuilderScreen from '../screens/therapist/ProgramBuilderScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Main Tab Navigator with 5 essential tabs
const TherapistTabNavigator = () => {
  const { user } = useAuth();

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#34C759',
        tabBarInactiveTintColor: '#8E8E93',
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 0.5,
          borderTopColor: '#E5E5EA',
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={TherapistDashboardScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Home size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Children"
        component={ChildDetailsScreen}
        options={{
          tabBarLabel: 'Children',
          tabBarIcon: ({ color, size }) => (
            <User size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Feedback"
        component={DailyFeedbackScreen}
        options={{
          tabBarLabel: 'Feedback',
          tabBarIcon: ({ color, size }) => (
            <MessageCircle size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Schedule"
        component={AttendanceScreen}
        options={{
          tabBarLabel: 'Schedule',
          tabBarIcon: ({ color, size }) => (
            <Calendar size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Alerts"
        component={NotificationsScreen}
        options={{
          tabBarLabel: 'Alerts',
          tabBarIcon: ({ color, size }) => (
            <Bell size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

// Main Therapist Navigator with Stack for Secondary Screens
const TherapistNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false }}
      initialRouteName="TherapistTabs"
    >
      <Stack.Screen name="TherapistTabs" component={TherapistTabNavigator} />
      <Stack.Screen 
        name="Video" 
        component={WeeklyVideoScreen}
        options={{ 
          headerShown: true, 
          title: 'Weekly Videos',
          headerStyle: { backgroundColor: '#34C759' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: 'bold' },
        }}
      />
      <Stack.Screen 
        name="Reports" 
        component={QuarterlyReportScreen}
        options={{ 
          headerShown: true, 
          title: 'Quarterly Reports',
          headerStyle: { backgroundColor: '#34C759' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: 'bold' },
        }}
      />
      <Stack.Screen 
        name="Leave" 
        component={LeaveRequestsScreen}
        options={{ 
          headerShown: true, 
          title: 'Leave Requests',
          headerStyle: { backgroundColor: '#34C759' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: 'bold' },
        }}
      />
      <Stack.Screen 
        name="Programs" 
        component={ProgramBuilderScreen}
        options={{ 
          headerShown: true, 
          title: 'Program Builder',
          headerStyle: { backgroundColor: '#34C759' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: 'bold' },
        }}
      />
    </Stack.Navigator>
  );
};

export default TherapistNavigator;