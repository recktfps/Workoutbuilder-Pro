import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import Theme from './theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  gradient?: readonly string[]; // Custom gradient
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
  haptic?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  gradient,
  disabled = false,
  loading = false,
  fullWidth = false,
  icon,
  style,
  textStyle,
  haptic = true,
}) => {
  const handlePress = () => {
    if (!disabled && !loading) {
      if (haptic) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
      onPress();
    }
  };

  const buttonHeight = size === 'sm' ? 40 : size === 'lg' ? 56 : 48;
  const fontSize = size === 'sm' ? Theme.typography.sizes.sm : size === 'lg' ? Theme.typography.sizes.lg : Theme.typography.sizes.base;

  const getButtonStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      height: buttonHeight,
      borderRadius: Theme.borderRadius.md,
      justifyContent: 'center',
      alignItems: 'center',
      flexDirection: 'row',
      paddingHorizontal: Theme.spacing.xl,
      opacity: disabled ? 0.5 : 1,
    };

    if (fullWidth) {
      baseStyle.width = '100%';
    }

    switch (variant) {
      case 'secondary':
        return { ...baseStyle, backgroundColor: Theme.colors.background.elevated };
      case 'outline':
        return { ...baseStyle, borderWidth: 2, borderColor: Theme.colors.primary[500] };
      case 'ghost':
        return { ...baseStyle, backgroundColor: 'transparent' };
      default:
        return baseStyle;
    }
  };

  const getTextStyle = (): TextStyle => {
    const baseStyle: TextStyle = {
      fontSize,
      fontWeight: Theme.typography.weights.semibold,
      color: Theme.colors.text.primary,
    };

    if (variant === 'outline' || variant === 'primary') {
      baseStyle.color = Theme.colors.primary[500];
    }
    if (variant === 'primary') {
      baseStyle.color = Theme.colors.text.primary;
    }

    return baseStyle;
  };

  const buttonStyle = getButtonStyle();
  const finalTextStyle = getTextStyle();

  const content = (
    <>
      {loading ? (
        <ActivityIndicator color={Theme.colors.text.primary} />
      ) : (
        <>
          {icon && <>{icon}</>}
          <Text style={[finalTextStyle, textStyle, icon ? { marginLeft: Theme.spacing.sm } : undefined]}>
            {title}
          </Text>
        </>
      )}
    </>
  );

  if (variant === 'primary' && !gradient) {
    return (
      <TouchableOpacity
        onPress={handlePress}
        disabled={disabled || loading}
        activeOpacity={0.8}
        style={style}
      >
        <LinearGradient
          colors={Theme.gradients.primary}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[buttonStyle, styles.shadow]}
        >
          {content}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  if (gradient) {
    return (
      <TouchableOpacity
        onPress={handlePress}
        disabled={disabled || loading}
        activeOpacity={0.8}
        style={style}
      >
        <LinearGradient
          colors={gradient as unknown as [string, string, ...string[]]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[buttonStyle, styles.shadow]}
        >
          {content}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      style={[buttonStyle, style]}
    >
      {content}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  shadow: {
    ...Theme.shadows.md,
  },
});

