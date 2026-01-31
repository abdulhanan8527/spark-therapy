// Web-compatible safe area context mock
import React from 'react';

// For web, we don't need safe area insets
// Just provide a simple provider that passes through children
export const SafeAreaProvider = ({ children }) => {
  return <>{children}</>;
};

// Default insets for web (no safe areas needed)
export const useSafeAreaInsets = () => ({
  top: 0,
  right: 0,
  bottom: 0,
  left: 0,
});