import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';
import Animated, { 
  FadeInDown, 
  FadeInUp, 
  withSpring,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
} from 'react-native-reanimated';
import { Theme, Card } from '../src/ui';
import { formatDuration } from '../src/utils/formatting';

const AnimatedCard = Animated.createAnimatedComponent(Card);

export default function WorkoutCompleteScreen() {
  const params = useLocalSearchParams();
  const sets = parseInt(params.sets as string) || 0;
  const duration = parseInt(params.duration as string) || 0;

  const scale = useSharedValue(0);

  useEffect(() => {
    // Celebration haptic
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
    // Animate trophy
    scale.value = withDelay(
      300,
      withSpring(1, {
        damping: 8,
        stiffness: 100,
      })
    );
  }, []);

  const trophyStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handleDone = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.replace('/(tabs)');
  };

  const handleViewWorkout = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#1A1A2E', '#252538']}
        style={styles.gradient}
      >
        {/* Trophy Animation */}
        <Animated.View style={[styles.trophyContainer, trophyStyle]}>
          <View style={styles.trophyCircle}>
            <LinearGradient
              colors={['#FFD700', '#FFA500']}
              style={styles.trophyGradient}
            >
              <Ionicons name="trophy" size={64} color="#fff" />
            </LinearGradient>
          </View>
        </Animated.View>

        {/* Title */}
        <Animated.View entering={FadeInUp.duration(600).delay(500)}>
          <Text style={styles.title}>Workout Complete!</Text>
          <Text style={styles.subtitle}>Great job crushing your session</Text>
        </Animated.View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <Animated.View entering={FadeInDown.duration(400).delay(700)} style={styles.statCardWrapper}>
            <AnimatedCard style={styles.statCard}>
              <Ionicons name="fitness-outline" size={32} color={Theme.colors.success[500]} />
              <Text style={styles.statValue}>{sets}</Text>
              <Text style={styles.statLabel}>sets completed</Text>
            </AnimatedCard>
          </Animated.View>

          <Animated.View entering={FadeInDown.duration(400).delay(800)} style={styles.statCardWrapper}>
            <AnimatedCard style={styles.statCard}>
              <Ionicons name="time-outline" size={32} color={Theme.colors.warning[500]} />
              <Text style={styles.statValue}>{formatDuration(duration)}</Text>
              <Text style={styles.statLabel}>duration</Text>
            </AnimatedCard>
          </Animated.View>
        </View>

        {/* Action Buttons */}
        <Animated.View entering={FadeInDown.duration(400).delay(900)} style={styles.actionsContainer}>
          <TouchableOpacity
            onPress={handleViewWorkout}
            style={styles.secondaryButton}
          >
            <Text style={styles.secondaryButtonText}>View Workout</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleDone}
            activeOpacity={0.9}
          >
            <LinearGradient
              colors={Theme.gradients.primary}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.primaryButton}
            >
              <Text style={styles.primaryButtonText}>Done</Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background.primary,
  },
  gradient: {
    flex: 1,
    paddingHorizontal: Theme.spacing.xl,
    justifyContent: 'center',
    alignItems: 'center',
  },
  trophyContainer: {
    marginBottom: Theme.spacing.xl,
  },
  trophyCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    overflow: 'hidden',
  },
  trophyGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: Theme.typography.sizes['4xl'],
    fontWeight: Theme.typography.weights.black,
    color: Theme.colors.text.primary,
    textAlign: 'center',
    marginBottom: Theme.spacing.sm,
  },
  subtitle: {
    fontSize: Theme.typography.sizes.base,
    fontWeight: Theme.typography.weights.medium,
    color: Theme.colors.text.tertiary,
    textAlign: 'center',
    marginBottom: Theme.spacing['2xl'],
  },
  statsContainer: {
    width: '100%',
    gap: Theme.spacing.base,
    marginBottom: Theme.spacing.xl,
  },
  statCardWrapper: {
    width: '100%',
  },
  statCard: {
    alignItems: 'center',
    padding: Theme.spacing.lg,
  },
  statValue: {
    fontSize: Theme.typography.sizes['3xl'],
    fontWeight: Theme.typography.weights.black,
    color: Theme.colors.text.primary,
    marginTop: Theme.spacing.sm,
  },
  statLabel: {
    fontSize: Theme.typography.sizes.sm,
    fontWeight: Theme.typography.weights.medium,
    color: Theme.colors.text.tertiary,
    marginTop: 4,
  },
  actionsContainer: {
    width: '100%',
    gap: Theme.spacing.base,
  },
  secondaryButton: {
    backgroundColor: Theme.colors.background.secondary,
    borderRadius: Theme.borderRadius.lg,
    paddingVertical: Theme.spacing.base,
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: Theme.typography.sizes.base,
    fontWeight: Theme.typography.weights.semibold,
    color: Theme.colors.text.primary,
  },
  primaryButton: {
    borderRadius: Theme.borderRadius.lg,
    paddingVertical: Theme.spacing.base,
    alignItems: 'center',
  },
  primaryButtonText: {
    fontSize: Theme.typography.sizes.base,
    fontWeight: Theme.typography.weights.bold,
    color: Theme.colors.text.primary,
  },
});
