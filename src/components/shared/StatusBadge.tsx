import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface StatusBadgeProps {
  status: string;
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'neutral';
}

export function StatusBadge({ status, variant = 'neutral' }: StatusBadgeProps) {
  // Always use React Native components for consistency in Expo Go
  const getVariantStyles = () => {
    switch (variant) {
      case 'success':
        return styles.success;
      case 'warning':
        return styles.warning;
      case 'danger':
        return styles.danger;
      case 'info':
        return styles.info;
      case 'neutral':
      default:
        return styles.neutral;
    }
  };

  return (
    <View style={[styles.badgeContainer, getVariantStyles()] as any}>
      <Text style={styles.badgeText}>{status}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badgeContainer: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: 'normal',
  },
  success: {
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
  },
  warning: {
    backgroundColor: '#FEFCE8',
    borderColor: '#FDE68A',
  },
  danger: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  info: {
    backgroundColor: '#DBEAFE',
    borderColor: '#BFDBFE',
  },
  neutral: {
    backgroundColor: '#F3F4F6',
    borderColor: '#D1D5DB',
  },
});
