import React, { useEffect } from 'react';
import { Platform, LogBox } from 'react-native';

// Type declaration for DOM APIs in web environment
interface Document {
  getElementById(id: string): HTMLElement | null;
  createElement(tagName: string): HTMLElement;
  head: HTMLElement;
}
declare const document: Document;

// Simple SafeAreaProvider fallback for web
const SafeAreaProvider = ({ children }: { children: React.ReactNode }) => <>{children}</>;

// Import ErrorBoundary, AuthProvider, and AppNavigator from original files
const ErrorBoundary = require('./components/ErrorBoundary').default;
const { AuthProvider } = require('./contexts/AuthContext');
const AppNavigator = require('./navigation/AppNavigator').default;

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
    if (Platform.OS === 'web' && typeof document !== 'undefined' && document) {
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