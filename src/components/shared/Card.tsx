import React from 'react';
import { View, TouchableOpacity, StyleProp, ViewStyle } from 'react-native';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  style?: StyleProp<ViewStyle>;
  onClick?: () => void;
  onPress?: () => void;
}

export function Card({ children, className = '', style, onClick, onPress }: CardProps) {
  // Use onPress if available, otherwise fall back to onClick
  const handler = onPress || onClick;
  
  // Always use React Native components for consistency in Expo Go
  const Container = handler ? TouchableOpacity : View;
  
  return (
    <Container 
      style={[
        {
          backgroundColor: 'white',
          borderRadius: 12,
          borderWidth: 1,
          borderColor: '#E5E7EB',
          padding: 16,
        },
        style,
        handler ? { elevation: 2 } : {}
      ]}
      onPress={handler}
    >
      {children}
    </Container>
  );
}
