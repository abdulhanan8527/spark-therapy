import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuth } from '../contexts/AuthContext';
import NavigationService from '../utils/NavigationService';

// Auth Screens
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';

// Role-specific Navigators
import ParentNavigator from './ParentNavigator';
import TherapistNavigator from './TherapistNavigator';
import AdminNavigator from './AdminNavigator';

// Create navigators
const RootStack = createStackNavigator();

// Auth Stack Navigator
const AuthStack = () => {
  return (
    <RootStack.Navigator screenOptions={{ headerShown: false }}>
      <RootStack.Screen name="Login" component={LoginScreen} />
      <RootStack.Screen name="Register" component={RegisterScreen} />
    </RootStack.Navigator>
  );
};

// Main App Navigator
const AppNavigator = () => {
  const { isAuthenticated, user, isLoading, error } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f0f0f0' }}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading application...</Text>
      </View>
    );
  }

  // Show error if there's an authentication error
  if (error) {
    // For authentication errors, show a more user-friendly message
    const errorStr = error && typeof error === 'string' ? error : String(error || '');
    const isAuthError = errorStr.includes('Unauthorized') || 
                       errorStr.includes('log in again') || 
                       errorStr.includes('Invalid email or password');
    
    console.error('AuthContext error:', error);
    
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorTitle}>{isAuthError ? 'Login Required' : 'Authentication Error'}</Text>
        <Text style={styles.errorMessage}>{error}</Text>
        {isAuthError ? (
          <Text style={styles.errorHelp}>Please log in with your credentials to access the application.</Text>
        ) : (
          <Text style={styles.errorHelp}>Please try logging in again or contact support if the problem persists.</Text>
        )}
      </View>
    );
  }

  return (
    <NavigationContainer ref={NavigationService.navigationRef}>
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated || !user ? (
          // User is not authenticated
          <RootStack.Screen name="Auth" component={AuthStack} />
        ) : user.role === 'admin' ? (
          // User is authenticated
          <RootStack.Screen name="AdminApp" component={AdminNavigator} />
        ) : user.role === 'therapist' ? (
          <RootStack.Screen name="TherapistApp" component={TherapistNavigator} />
        ) : (
          <RootStack.Screen name="ParentApp" component={ParentNavigator} />
        )}
      </RootStack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#d32f2f',
    marginBottom: 10,
  },
  errorMessage: {
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
    marginBottom: 10,
  },
  errorHelp: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
});

export default AppNavigator;