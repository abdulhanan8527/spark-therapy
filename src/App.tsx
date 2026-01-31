import React, { useEffect } from 'react';
import { Platform, LogBox, View } from 'react-native';

// Import gesture handler for native platforms
if (Platform.OS !== 'web') {
  require('react-native-gesture-handler');
}

import { SafeAreaProvider } from 'react-native-safe-area-context';
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
      <View style={{ flex: 1, backgroundColor: '#f0f0f0' }}>
        <ErrorBoundary>
          <AuthProvider>
            <AppNavigator />
          </AuthProvider>
        </ErrorBoundary>
      </View>
    </SafeAreaProvider>
  );
}