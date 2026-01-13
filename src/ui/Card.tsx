import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Theme from './theme';

interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'gradient';
  gradient?: readonly string[];
  padding?: number;
  style?: ViewStyle;
  onPress?: () => void;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  gradient,
  padding = Theme.spacing.base,
  style,
}) => {
  const getCardStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      borderRadius: Theme.borderRadius.lg,
      padding,
    };

    switch (variant) {
      case 'elevated':
        return {
          ...baseStyle,
          backgroundColor: Theme.colors.background.elevated,
          ...Theme.shadows.md,
        };
      case 'gradient':
        return baseStyle;
      default:
        return {
          ...baseStyle,
          backgroundColor: Theme.colors.background.secondary,
        };
    }
  };

  if (variant === 'gradient' && gradient) {
    return (
      <LinearGradient
        colors={gradient as unknown as [string, string, ...string[]]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[getCardStyle(), style]}
      >
        {children}
      </LinearGradient>
    );
  }

  return <View style={[getCardStyle(), style]}>{children}</View>;
};

export default Card;

