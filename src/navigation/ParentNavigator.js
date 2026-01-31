import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
// Stack navigator import removed - not used in this file
import { Home, MessageCircle, Play, FileText, Calendar, Bell, DollarSign } from '../components/SimpleIcons';
import { useAuth } from '../contexts/AuthContext';

// Parent Screens
import ParentDashboardScreen from '../screens/parent/DashboardScreen';
import DailyFeedbackScreen from '../screens/parent/DailyFeedbackScreen';
import WeeklyVideosScreen from '../screens/parent/WeeklyVideosScreen';
import QuarterlyReportsScreen from '../screens/parent/QuarterlyReportsScreen';
import IEPGoalsScreen from '../screens/parent/IEPGoalsScreen';
import AttendanceScreen from '../screens/parent/AttendanceScreen';
import ComplaintsScreen from '../screens/parent/ComplaintsScreen';
import FeesScreen from '../screens/parent/FeesScreen';
import VideoUploadScreen from '../screens/parent/VideoUploadScreen';
import NotificationsScreen from '../screens/parent/NotificationsScreen';
import InvoicesScreen from '../screens/parent/InvoicesScreen';

const Tab = createBottomTabNavigator();
// Stack navigator removed - not used in this file

// MoreStack component removed - not used in current navigation structure

const ParentTabs = () => {
  const { user } = useAuth();

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#007AFF',
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
        component={ParentDashboardScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Home size={size} color={color} />
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
        name="Videos"
        component={WeeklyVideosScreen}
        options={{
          tabBarLabel: 'Videos',
          tabBarIcon: ({ color, size }) => (
            <Play size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Reports"
        component={QuarterlyReportsScreen}
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
    </Tab.Navigator>
  );
};

export default ParentTabs;