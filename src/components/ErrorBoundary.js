import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert, Platform } from 'react-native';

// Conditionally import expo-application only for native platforms
let Application = null;
if (Platform.OS !== 'web') {
  try {
    Application = require('expo-application');
  } catch (e) {
    console.warn('expo-application not available');
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  errorCard: {
    width: '100%',
    maxWidth: 400,
    padding: 20,
    backgroundColor: '#fefafa',
    borderWidth: 1,
    borderColor: '#ffcdd2',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#c62828',
    marginBottom: 15,
    textAlign: 'center',
  },
  errorSubtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  errorText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 15,
  },
  errorDetails: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: '#999',
    backgroundColor: '#f5f5f5',
    padding: 10,
    borderRadius: 4,
    marginBottom: 15,
    maxHeight: 100,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: '#1976d2',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: 'center',
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  secondaryButtonText: {
    color: '#666',
    fontWeight: '600',
    fontSize: 14,
  },
  supportText: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    marginTop: 15,
  },
});

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      isReporting: false
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Production error reporting
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
    
    // Log to console in development only
    if (__DEV__) {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }
    
    // In production, send to error reporting service
    this.reportError(error, errorInfo);
  }

  reportError = async (error, errorInfo) => {
    try {
      // Prepare error data for reporting
      const errorData = {
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo?.componentStack,
        timestamp: new Date().toISOString(),
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'React Native',
        appVersion: Application?.nativeApplicationVersion || 'unknown',
        buildVersion: Application?.nativeBuildVersion || 'unknown',
        platform: typeof window !== 'undefined' ? 'web' : 'native'
      };
      
      // In production, send to your error reporting service
      // Example: Sentry, Bugsnag, or custom endpoint
      if (!__DEV__) {
        // Uncomment and configure for production
        // await fetch('/api/errors', {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify(errorData)
        // });
      }
    } catch (reportError) {
      console.warn('Failed to report error:', reportError);
    }
  };

  handleReload = () => {
    if (typeof window !== 'undefined' && window.location) {
      window.location.reload();
    } else {
      // For mobile, restart the app
      Alert.alert(
        'Restart Required',
        'Please close and reopen the application to continue.',
        [{ text: 'OK' }]
      );
    }
  };

  handleGoHome = () => {
    // Reset to initial state and try to navigate home
    this.setState({ hasError: false, error: null, errorInfo: null });
    
    // Try to reset navigation
    try {
      const { navigation } = this.props;
      if (navigation && navigation.reset) {
        navigation.reset({
          index: 0,
          routes: [{ name: 'Home' }],
        });
      }
    } catch (navError) {
      // If navigation fails, force reload
      this.handleReload();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <View style={styles.errorCard}>
            <Text style={styles.errorTitle}>⚠️ Application Error</Text>
            
            <Text style={styles.errorSubtitle}>Something went wrong</Text>
            <Text style={styles.errorText}>
              We're sorry, but an unexpected error occurred. Our team has been notified.
            </Text>
            
            {__DEV__ && this.state.error && (
              <>
                <Text style={styles.errorSubtitle}>Error Details:</Text>
                <ScrollView style={styles.errorDetails}>
                  <Text>{this.state.error.toString()}</Text>
                  {this.state.errorInfo?.componentStack && (
                    <Text>{this.state.errorInfo.componentStack}</Text>
                  )}
                </ScrollView>
              </>
            )}
            
            <View style={styles.buttonContainer}>
              <TouchableOpacity 
                style={styles.secondaryButton} 
                onPress={this.handleGoHome}
              >
                <Text style={styles.secondaryButtonText}>Go Home</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.primaryButton} 
                onPress={this.handleReload}
              >
                <Text style={styles.buttonText}>Restart App</Text>
              </TouchableOpacity>
            </View>
            
            <Text style={styles.supportText}>
              If this continues, please contact support with error details.
            </Text>
          </View>
        </View>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;