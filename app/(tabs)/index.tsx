import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Button, StatCard, Card, Theme } from '../../src/ui';
import { db } from '../../src/services/database';
import { Workout, WorkoutStats } from '../../src/types';
import { format } from 'date-fns';

export default function HomeScreen() {
  const [stats, setStats] = useState<WorkoutStats | null>(null);
  const [recentWorkouts, setRecentWorkouts] = useState<Workout[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  // Reload data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const loadData = async () => {
    try {
      console.log('🏠 Loading home screen data...');
      const [workoutStats, workouts] = await Promise.all([
        db.getWorkoutStats(),
        db.getRecentWorkouts(5),
      ]);
      console.log('🏠 Stats loaded:', workoutStats);
      console.log('🏠 Recent workouts loaded:', workouts.length);
      setStats(workoutStats);
      setRecentWorkouts(workouts);
    } catch (error) {
      console.error('❌ Error loading home data:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleStartWorkout = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    router.push('/workout-start' as any);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Ready to train?</Text>
            <Text style={styles.date}>{format(new Date(), 'EEEE, MMMM d')}</Text>
          </View>
        </View>

        {/* Start Workout CTA */}
        <Animated.View entering={FadeInDown.duration(600).delay(200)}>
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={handleStartWorkout}
            style={styles.ctaContainer}
          >
            <LinearGradient
              colors={Theme.gradients.primary}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.startWorkoutButton}
            >
              <View style={styles.startWorkoutContent}>
                <View>
                  <Text style={styles.startWorkoutTitle}>Start Workout</Text>
                  <Text style={styles.startWorkoutSubtitle}>
                    Begin tracking your session
                  </Text>
                </View>
                <View style={styles.startIconContainer}>
                  <Ionicons name="barbell" size={32} color={Theme.colors.text.primary} />
                </View>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>

        {/* Quick Stats */}
        <Animated.View entering={FadeInDown.duration(600).delay(300)}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Your Progress</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statCardHalf}>
                <StatCard
                  title="Workouts"
                  value={stats?.totalWorkouts || 0}
                  subtitle="completed"
                  icon={<Ionicons name="checkmark-circle-outline" size={20} color={Theme.colors.success[500]} />}
                  gradient={Theme.gradients.darkCard}
                />
              </View>
              <View style={styles.statCardHalf}>
                <StatCard
                  title="Streak"
                  value={stats?.currentStreak || 0}
                  subtitle="days"
                  icon={<Ionicons name="flame-outline" size={20} color={Theme.colors.warning[500]} />}
                  gradient={Theme.gradients.darkCard}
                />
              </View>
            </View>
            <View style={styles.statsGrid}>
              <View style={styles.statCardHalf}>
                <StatCard
                  title="Sets"
                  value={stats?.totalSets || 0}
                  subtitle="total"
                  icon={<Ionicons name="layers-outline" size={20} color={Theme.colors.primary[500]} />}
                  gradient={Theme.gradients.darkCard}
                />
              </View>
              <View style={styles.statCardHalf}>
                <StatCard
                  title="Records"
                  value={stats?.personalRecords || 0}
                  subtitle="personal bests"
                  icon={<Ionicons name="trophy-outline" size={20} color={Theme.colors.warning[500]} />}
                  gradient={Theme.gradients.darkCard}
                />
              </View>
            </View>
          </View>
        </Animated.View>

        {/* Recent Workouts */}
        <Animated.View entering={FadeInDown.duration(600).delay(400)}>
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent Workouts</Text>
              <TouchableOpacity>
                <Text style={styles.seeAllText}>See All</Text>
              </TouchableOpacity>
            </View>

            {recentWorkouts.length === 0 ? (
              <Card style={styles.emptyState}>
                <View style={styles.emptyStateContent}>
                  <Ionicons name="barbell-outline" size={48} color={Theme.colors.text.tertiary} />
                  <Text style={styles.emptyStateTitle}>No workouts yet</Text>
                  <Text style={styles.emptyStateSubtitle}>
                    Start your first workout to see it here
                  </Text>
                </View>
              </Card>
            ) : (
              recentWorkouts.map((workout) => (
                <TouchableOpacity
                  key={workout.id}
                  activeOpacity={0.8}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    router.push(`/workout-detail?id=${workout.id}` as any);
                  }}
                >
                  <Card style={styles.workoutCard}>
                    <View style={styles.workoutHeader}>
                      <Text style={styles.workoutName}>{workout.name}</Text>
                      <Text style={styles.workoutDate}>
                        {format(workout.startedAt, 'MMM d')}
                      </Text>
                    </View>
                    <View style={styles.workoutStats}>
                      <View style={styles.workoutStat}>
                        <Ionicons name="time-outline" size={16} color={Theme.colors.text.tertiary} />
                        <Text style={styles.workoutStatText}>
                          {workout.duration ? `${Math.round(workout.duration / 60)} min` : '--'}
                        </Text>
                      </View>
                      <View style={styles.workoutStat}>
                        <Ionicons name="layers-outline" size={16} color={Theme.colors.text.tertiary} />
                        <Text style={styles.workoutStatText}>
                          {workout.totalSets} sets
                        </Text>
                      </View>
                    </View>
                  </Card>
                </TouchableOpacity>
              ))
            )}
          </View>
        </Animated.View>

        {/* Quick Actions */}
        <Animated.View entering={FadeInDown.duration(600).delay(500)}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <View style={styles.quickActions}>
              <TouchableOpacity style={styles.quickAction} onPress={() => router.push('/(tabs)/programs' as any)}>
                <LinearGradient
                  colors={Theme.gradients.accentBlue}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.quickActionGradient}
                >
                  <Ionicons name="list" size={24} color={Theme.colors.text.primary} />
                  <Text style={styles.quickActionText}>Programs</Text>
                </LinearGradient>
              </TouchableOpacity>
              <TouchableOpacity style={styles.quickAction} onPress={() => router.push('/(tabs)/analytics' as any)}>
                <LinearGradient
                  colors={Theme.gradients.cool}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.quickActionGradient}
                >
                  <Ionicons name="analytics" size={24} color={Theme.colors.text.primary} />
                  <Text style={styles.quickActionText}>Analytics</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background.primary,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Theme.spacing.xl,
    paddingVertical: Theme.spacing.lg,
  },
  greeting: {
    fontSize: Theme.typography.sizes['2xl'],
    fontWeight: Theme.typography.weights.bold,
    color: Theme.colors.text.primary,
  },
  date: {
    fontSize: Theme.typography.sizes.base,
    fontWeight: Theme.typography.weights.medium,
    color: Theme.colors.text.tertiary,
    marginTop: 4,
  },
  ctaContainer: {
    paddingHorizontal: Theme.spacing.xl,
    marginBottom: Theme.spacing.xl,
  },
  startWorkoutButton: {
    borderRadius: Theme.borderRadius.xl,
    padding: Theme.spacing.xl,
    ...Theme.shadows.glow,
  },
  startWorkoutContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  startWorkoutTitle: {
    fontSize: Theme.typography.sizes['2xl'],
    fontWeight: Theme.typography.weights.bold,
    color: Theme.colors.text.primary,
  },
  startWorkoutSubtitle: {
    fontSize: Theme.typography.sizes.base,
    fontWeight: Theme.typography.weights.medium,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
  },
  startIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    paddingHorizontal: Theme.spacing.xl,
    marginBottom: Theme.spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Theme.spacing.base,
  },
  sectionTitle: {
    fontSize: Theme.typography.sizes.xl,
    fontWeight: Theme.typography.weights.bold,
    color: Theme.colors.text.primary,
    marginBottom: Theme.spacing.base,
  },
  seeAllText: {
    fontSize: Theme.typography.sizes.base,
    fontWeight: Theme.typography.weights.semibold,
    color: Theme.colors.primary[500],
  },
  statsGrid: {
    flexDirection: 'row',
    marginBottom: Theme.spacing.base,
    gap: Theme.spacing.base,
  },
  statCardHalf: {
    flex: 1,
  },
  emptyState: {
    padding: Theme.spacing['2xl'],
    alignItems: 'center',
  },
  emptyStateContent: {
    alignItems: 'center',
  },
  emptyStateTitle: {
    fontSize: Theme.typography.sizes.lg,
    fontWeight: Theme.typography.weights.semibold,
    color: Theme.colors.text.secondary,
    marginTop: Theme.spacing.base,
  },
  emptyStateSubtitle: {
    fontSize: Theme.typography.sizes.sm,
    fontWeight: Theme.typography.weights.regular,
    color: Theme.colors.text.tertiary,
    marginTop: Theme.spacing.xs,
    textAlign: 'center',
  },
  workoutCard: {
    marginBottom: Theme.spacing.base,
  },
  workoutHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Theme.spacing.sm,
  },
  workoutName: {
    fontSize: Theme.typography.sizes.lg,
    fontWeight: Theme.typography.weights.semibold,
    color: Theme.colors.text.primary,
  },
  workoutDate: {
    fontSize: Theme.typography.sizes.sm,
    fontWeight: Theme.typography.weights.medium,
    color: Theme.colors.text.tertiary,
  },
  workoutStats: {
    flexDirection: 'row',
    gap: Theme.spacing.base,
  },
  workoutStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  workoutStatText: {
    fontSize: Theme.typography.sizes.sm,
    fontWeight: Theme.typography.weights.medium,
    color: Theme.colors.text.secondary,
  },
  quickActions: {
    flexDirection: 'row',
    gap: Theme.spacing.base,
  },
  quickAction: {
    flex: 1,
  },
  quickActionGradient: {
    borderRadius: Theme.borderRadius.lg,
    padding: Theme.spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 100,
  },
  quickActionText: {
    fontSize: Theme.typography.sizes.base,
    fontWeight: Theme.typography.weights.semibold,
    color: Theme.colors.text.primary,
    marginTop: Theme.spacing.sm,
  },
  bottomSpacer: {
    height: Theme.spacing['2xl'],
  },
});
