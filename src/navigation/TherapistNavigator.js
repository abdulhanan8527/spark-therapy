import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Home, User, MessageCircle, Play, FileText, Calendar, Bell, Book } from '../components/SimpleIcons';
import { useAuth } from '../contexts/AuthContext';

// Therapist Screens
import TherapistDashboardScreen from '../screens/therapist/DashboardScreen';
import ChildDetailsScreen from '../screens/therapist/ChildDetailsScreen';
import DailyFeedbackScreen from '../screens/therapist/DailyFeedbackScreen';
import WeeklyVideoScreen from '../screens/therapist/WeeklyVideoScreen';
import QuarterlyReportScreen from '../screens/therapist/QuarterlyReportScreen';
import AttendanceScreen from '../screens/therapist/AttendanceScreen';
import NotificationsScreen from '../screens/therapist/NotificationsScreen';
import LeaveRequestsScreen from '../screens/therapist/LeaveRequestsScreen';
import ProgramBuilderScreen from '../screens/therapist/ProgramBuilderScreen';

const Tab = createBottomTabNavigator();

const TherapistTabs = () => {
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
        name="Video"
        component={WeeklyVideoScreen}
        options={{
          tabBarLabel: 'Video',
          tabBarIcon: ({ color, size }) => (
            <Play size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Reports"
        component={QuarterlyReportScreen}
        options={{
          tabBarLabel: 'Reports',
          tabBarIcon: ({ color, size }) => (
            <FileText size={size} color={color} />
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
        name="Leave"
        component={LeaveRequestsScreen}
        options={{
          tabBarLabel: 'Leave',
          tabBarIcon: ({ color, size }) => (
            <Calendar size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{
          tabBarLabel: 'Alerts',
          tabBarIcon: ({ color, size }) => (
            <Bell size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Programs"
        component={ProgramBuilderScreen}
        options={{
          tabBarLabel: 'Programs',
          tabBarIcon: ({ color, size }) => (
            <Book size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default TherapistTabs;