import React, { useEffect } from 'react';
import { Platform, LogBox } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import ErrorBoundary from './components/ErrorBoundary';
import { AuthProvider } from './contexts/AuthContext';
import AppNavigator from './navigation/AppNavigator';

// Web-specific initialization
if (Platform.OS === 'web') {
  // Ensure proper viewport settings
  if (typeof document !== 'undefined') {
    const viewport = document.querySelector('meta[name="viewport"]');
    if (!viewport) {
      const meta = document.createElement('meta');
      meta.name = 'viewport';
      meta.content = 'width=device-width, initial-scale=1, shrink-to-fit=no';
      document.head.appendChild(meta);
    }
  }
}

export default function App() {
  // Suppress known warnings that don't affect functionality
  useEffect(() => {
    LogBox.ignoreLogs([
      'VirtualizedLists should never be nested',
      'Warning: componentWillMount is deprecated',
      'Warning: componentWillReceiveProps is deprecated',
      'Remote debugger',
      'Require cycle:'
    ]);
  }, []);

  // Inject global styles for Web compatibility (fixes white screen/layout issues)
  useEffect(() => {
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      const styleId = 'spark-therapy-global-styles';
      if (!document.getElementById(styleId)) {
        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
          html, body, #root { 
            height: 100%; 
            width: 100%;
            display: flex; 
            flex-direction: column; 
            margin: 0;
            padding: 0;
          }
          /* Basic reset for generic elements if needed */
          * { 
            box-sizing: border-box; 
          }
          #root {
            overflow: hidden;
          }
        `;
        document.head.appendChild(style);
      }
    }
  }, []);

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <AuthProvider>
          <AppNavigator />
        </AuthProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}