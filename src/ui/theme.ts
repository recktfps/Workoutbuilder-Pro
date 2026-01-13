/**
 * WorkoutBuilder Pro Design System
 * Bold, modern, dark-first theme with vibrant gradients
 * Inspired by Strong, Hevy, and Fitbod
 */

export const Colors = {
  // Dark Base Colors
  background: {
    primary: '#0F0F1E',      // Deep navy black
    secondary: '#1A1A2E',    // Slightly lighter for cards
    tertiary: '#252538',     // Card highlights
    elevated: '#2D2D44',     // Elevated surfaces
  },
  
  // Primary Brand - Electric Blue
  primary: {
    50: '#E3F2FD',
    100: '#BBDEFB',
    400: '#42A5F5',
    500: '#2196F3',   // Main brand color
    600: '#1E88E5',
    700: '#1976D2',
    900: '#0D47A1',
  },
  
  // Accent - Neon Purple
  accent: {
    400: '#AB47BC',
    500: '#9C27B0',   // Purple accent
    600: '#8E24AA',
    700: '#7B1FA2',
  },
  
  // Success - Electric Green
  success: {
    400: '#66BB6A',
    500: '#4CAF50',
    600: '#43A047',
  },
  
  // Warning - Vibrant Orange
  warning: {
    400: '#FFA726',
    500: '#FF9800',
    600: '#FB8C00',
  },
  
  // Error - Bold Red
  error: {
    400: '#EF5350',
    500: '#F44336',
    600: '#E53935',
  },
  
  // Text Colors
  text: {
    primary: '#FFFFFF',
    secondary: '#B0B0C8',
    tertiary: '#75758F',
    disabled: '#4A4A5E',
  },
  
  // Chart Colors (for progress visualizations)
  chart: {
    volume: '#2196F3',
    frequency: '#9C27B0',
    intensity: '#FF9800',
    grid: '#2D2D44',
    gridText: '#75758F',
  },
  
  // Muscle Group Colors (heat map)
  muscle: {
    chest: '#E91E63',
    back: '#2196F3',
    shoulders: '#FF9800',
    arms: '#9C27B0',
    legs: '#4CAF50',
    core: '#FFC107',
  },
  
  // Border & Divider
  border: '#2D2D44',
  divider: '#252538',
  
  // Overlay
  overlay: 'rgba(15, 15, 30, 0.9)',
  overlayLight: 'rgba(15, 15, 30, 0.7)',
};

export const Gradients = {
  // Primary gradients for CTAs
  primary: ['#2196F3', '#1976D2'] as const,
  primaryVertical: ['#42A5F5', '#1565C0'] as const,
  
  // Accent gradients
  accent: ['#9C27B0', '#7B1FA2'] as const,
  accentBlue: ['#2196F3', '#9C27B0'] as const, // Blue to purple
  
  // Success gradient
  success: ['#66BB6A', '#43A047'] as const,
  
  // Warm gradient for achievements
  warm: ['#FF9800', '#F57C00'] as const,
  fire: ['#FF6B6B', '#FF8E53'] as const,
  
  // Cool gradients for analytics
  cool: ['#2196F3', '#00BCD4'] as const,
  ocean: ['#1976D2', '#0288D1'] as const,
  
  // Sunset gradient for premium
  sunset: ['#FF6B6B', '#FFA726', '#FFCA28'] as const,
  
  // Neon gradient for PRs
  neon: ['#00E5FF', '#00B8D4', '#0091EA'] as const,
  
  // Dark gradients for backgrounds
  darkCard: ['#1A1A2E', '#252538'] as const,
  darkElevated: ['#252538', '#2D2D44'] as const,
  
  // Mesh gradients (multi-stop)
  mesh: ['#0F0F1E', '#1A1A2E', '#252538'] as const,
  heroMesh: ['#0D47A1', '#1976D2', '#2196F3', '#42A5F5'] as const,
};

export const Typography = {
  // Font sizes
  sizes: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
    '5xl': 48,
    '6xl': 60,
  },
  
  // Font weights
  weights: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    extrabold: '800' as const,
    black: '900' as const,
  },
  
  // Line heights
  lineHeights: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  '2xl': 32,
  '3xl': 40,
  '4xl': 48,
  '5xl': 64,
};

export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  full: 9999,
};

export const Shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
  },
  glow: {
    shadowColor: '#2196F3',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 6,
  },
};

export const Animation = {
  durations: {
    fast: 150,
    normal: 250,
    slow: 350,
  },
  easing: {
    default: [0.25, 0.1, 0.25, 1] as [number, number, number, number],
    smooth: [0.4, 0.0, 0.2, 1] as [number, number, number, number],
    bounce: [0.68, -0.55, 0.265, 1.55] as [number, number, number, number],
  },
};

// Touch target minimum sizes (accessibility)
export const TouchTargets = {
  minHeight: 48,
  minWidth: 48,
  iconButton: 44,
};

// Theme configuration
export const Theme = {
  colors: Colors,
  gradients: Gradients,
  typography: Typography,
  spacing: Spacing,
  borderRadius: BorderRadius,
  shadows: Shadows,
  animation: Animation,
  touchTargets: TouchTargets,
};

export default Theme;

