// Production-ready App - works on web and mobile
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Platform, ActivityIndicator } from 'react-native';

// Simplified SafeAreaProvider for web
const SafeAreaView = Platform.OS === 'web' 
  ? ({ children }: { children: React.ReactNode }) => <View style={{ flex: 1 }}>{children}</View>
  : require('react-native-safe-area-context').SafeAreaView;

// Simple error boundary wrapper
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('App Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Something went wrong</Text>
          <Text style={styles.errorText}>{this.state.error?.message}</Text>
          <Text style={styles.errorHelp}>Please reload the application</Text>
        </View>
      );
    }
    return this.props.children;
  }
}

// Main App Component
export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [appReady, setAppReady] = useState(false);

  useEffect(() => {
    // Initialize app
    const initApp = async () => {
      try {
        // Add any initialization logic here
        await new Promise(resolve => setTimeout(resolve, 100));
        setAppReady(true);
      } catch (error) {
        console.error('Init error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initApp();
  }, []);

  // Inject global styles for web
  useEffect(() => {
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      const styleId = 'app-global-styles';
      if (!document.getElementById(styleId)) {
        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
          html, body, #root, #app {
            height: 100%;
            width: 100%;
            margin: 0;
            padding: 0;
            display: flex;
            flex-direction: column;
          }
          * { box-sizing: border-box; }
        `;
        document.head.appendChild(style);
      }
    }
  }, []);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading SPARK Therapy...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ErrorBoundary>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>SPARK Therapy</Text>
            <Text style={styles.subtitle}>Management System</Text>
          </View>
          
          <View style={styles.content}>
            <Text style={styles.welcomeText}>Welcome!</Text>
            <Text style={styles.infoText}>
              The application is running successfully on {Platform.OS}
            </Text>
            <Text style={styles.statusText}>✓ App initialized</Text>
            <Text style={styles.statusText}>✓ Platform: {Platform.OS}</Text>
            <Text style={styles.statusText}>✓ Ready for development</Text>
          </View>
          
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Next: Connect to your backend API
            </Text>
          </View>
        </View>
      </ErrorBoundary>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 16,
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
    fontSize: 20,
    fontWeight: 'bold',
    color: '#d32f2f',
    marginBottom: 10,
  },
  errorText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 10,
  },
  errorHelp: {
    fontSize: 12,
    color: '#999',
  },
  header: {
    backgroundColor: '#007AFF',
    padding: 30,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#e3f2fd',
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  infoText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  statusText: {
    fontSize: 14,
    color: '#4caf50',
    marginVertical: 4,
  },
  footer: {
    padding: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  footerText: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
  },
});
