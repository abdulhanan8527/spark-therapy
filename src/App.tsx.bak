import React, { useEffect } from 'react';
import { Platform, LogBox, View } from 'react-native';

// Platform-specific gesture handler import - use dynamic import to avoid bundling for web
let gestureHandlerImported = false;
if (Platform.OS !== 'web' && !gestureHandlerImported) {
  try {
    require('react-native-gesture-handler');
    gestureHandlerImported = true;
  } catch (e) {
    console.log('Gesture handler not available');
  }
}

// Platform-specific SafeAreaProvider import
let SafeAreaProvider: React.ComponentType<{children: React.ReactNode}>;
if (Platform.OS === 'web') {
  // Web fallback - simple passthrough component
  SafeAreaProvider = ({ children }) => <>{children}</>;
} else {
  // Native platforms use the real SafeAreaProvider
  try {
    SafeAreaProvider = require('react-native-safe-area-context').SafeAreaProvider;
  } catch (e) {
    // Fallback if not available
    SafeAreaProvider = ({ children }) => <>{children}</>;
  }
}

import ErrorBoundary from './components/ErrorBoundary';
import { AuthProvider } from './contexts/AuthContext';
import AppNavigator from './navigation/AppNavigator';

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
          }
          /* Basic reset for generic elements if needed */
          * { box-sizing: border-box; }
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