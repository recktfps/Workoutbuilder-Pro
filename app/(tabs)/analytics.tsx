import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Card, Theme } from '../../src/ui';
import { db } from '../../src/services/database';

interface WorkoutStats {
  totalWorkouts: number;
  totalSets: number;
  totalVolume: number;
  avgDuration: number;
  currentStreak: number;
}

export default function AnalyticsScreen() {
  const [stats, setStats] = useState<WorkoutStats>({
    totalWorkouts: 0,
    totalSets: 0,
    totalVolume: 0,
    avgDuration: 0,
    currentStreak: 0,
  });

  useFocusEffect(
    useCallback(() => {
      loadAnalyticsData();
    }, [])
  );

  const loadAnalyticsData = async () => {
    try {
      console.log('📈 Loading analytics data...');
      const workoutStats = await db.getWorkoutStats();
      console.log('📈 Loaded stats:', workoutStats);

      setStats({
        totalWorkouts: workoutStats.totalWorkouts || 0,
        totalSets: workoutStats.totalSets || 0,
        totalVolume: workoutStats.totalVolume || 0,
        avgDuration: workoutStats.averageWorkoutDuration || 0,
        currentStreak: workoutStats.currentStreak || 0,
      });
    } catch (error) {
      console.error('❌ Error loading analytics:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Analytics</Text>
        </View>

        {/* Main Stats Grid */}
        <Animated.View entering={FadeInDown.duration(400).delay(100)} style={styles.section}>
          <View style={styles.statsGrid}>
            {/* Workouts */}
            <View style={styles.statCard}>
              <LinearGradient
                colors={Theme.gradients.primary}
                style={styles.statGradient}
              >
                <Ionicons name="barbell" size={32} color="#fff" />
                <Text style={styles.statValue}>{stats.totalWorkouts}</Text>
                <Text style={styles.statLabel}>Workouts</Text>
              </LinearGradient>
            </View>

            {/* Streak */}
            <View style={styles.statCard}>
              <LinearGradient
                colors={Theme.gradients.warm}
                style={styles.statGradient}
              >
                <Ionicons name="flame" size={32} color="#fff" />
                <Text style={styles.statValue}>{stats.currentStreak}</Text>
                <Text style={styles.statLabel}>Day Streak</Text>
              </LinearGradient>
            </View>

            {/* Total Sets */}
            <View style={styles.statCard}>
              <LinearGradient
                colors={Theme.gradients.success}
                style={styles.statGradient}
              >
                <Ionicons name="checkmark-circle" size={32} color="#fff" />
                <Text style={styles.statValue}>{stats.totalSets}</Text>
                <Text style={styles.statLabel}>Total Sets</Text>
              </LinearGradient>
            </View>

          </View>
        </Animated.View>

        {/* Summary Card */}
        <Animated.View entering={FadeInDown.duration(400).delay(200)} style={styles.section}>
          <Card style={styles.summaryCard}>
            <View style={styles.summaryHeader}>
              <Ionicons name="trophy" size={24} color={Theme.colors.warning[500]} />
              <Text style={styles.summaryTitle}>Your Progress</Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total Workouts</Text>
              <Text style={styles.summaryValue}>{stats.totalWorkouts}</Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total Sets Completed</Text>
              <Text style={styles.summaryValue}>{stats.totalSets}</Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Current Streak</Text>
              <Text style={styles.summaryValue}>{stats.currentStreak} days</Text>
            </View>
          </Card>
        </Animated.View>

        {/* Motivational Card */}
        <Animated.View entering={FadeInDown.duration(400).delay(300)} style={styles.section}>
          <Card style={styles.motivationCard}>
            <LinearGradient
              colors={Theme.gradients.primary}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.motivationGradient}
            >
              {stats.totalWorkouts === 0 ? (
                <>
                  <Ionicons name="rocket" size={48} color="#fff" />
                  <Text style={styles.motivationTitle}>Get Started!</Text>
                  <Text style={styles.motivationText}>
                    Complete your first workout to see your analytics here
                  </Text>
                </>
              ) : stats.totalWorkouts < 5 ? (
                <>
                  <Ionicons name="trending-up" size={48} color="#fff" />
                  <Text style={styles.motivationTitle}>Great Start!</Text>
                  <Text style={styles.motivationText}>
                    You've completed {stats.totalWorkouts} workout{stats.totalWorkouts !== 1 ? 's' : ''}. Keep going!
                  </Text>
                </>
              ) : stats.totalWorkouts < 10 ? (
                <>
                  <Ionicons name="flash" size={48} color="#fff" />
                  <Text style={styles.motivationTitle}>On Fire! 🔥</Text>
                  <Text style={styles.motivationText}>
                    {stats.totalWorkouts} workouts down! You're building a solid routine.
                  </Text>
                </>
              ) : (
                <>
                  <Ionicons name="trophy" size={48} color="#fff" />
                  <Text style={styles.motivationTitle}>Champion! 🏆</Text>
                  <Text style={styles.motivationText}>
                    {stats.totalWorkouts} workouts completed! You're crushing it!
                  </Text>
                </>
              )}
            </LinearGradient>
          </Card>
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
  header: {
    paddingHorizontal: Theme.spacing.xl,
    paddingVertical: Theme.spacing.lg,
  },
  title: {
    fontSize: Theme.typography.sizes['3xl'],
    fontWeight: Theme.typography.weights.black,
    color: Theme.colors.text.primary,
  },
  section: {
    paddingHorizontal: Theme.spacing.xl,
    marginBottom: Theme.spacing.xl,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Theme.spacing.base,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
  },
  statGradient: {
    borderRadius: Theme.borderRadius.lg,
    padding: Theme.spacing.lg,
    alignItems: 'center',
    minHeight: 130,
    justifyContent: 'center',
  },
  statValue: {
    fontSize: Theme.typography.sizes['3xl'],
    fontWeight: Theme.typography.weights.bold,
    color: '#fff',
    marginTop: Theme.spacing.sm,
  },
  statLabel: {
    fontSize: Theme.typography.sizes.sm,
    fontWeight: Theme.typography.weights.medium,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 4,
  },
  summaryCard: {
    padding: Theme.spacing.lg,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.sm,
    marginBottom: Theme.spacing.lg,
    paddingBottom: Theme.spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.divider,
  },
  summaryTitle: {
    fontSize: Theme.typography.sizes.xl,
    fontWeight: Theme.typography.weights.bold,
    color: Theme.colors.text.primary,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Theme.spacing.sm,
  },
  summaryLabel: {
    fontSize: Theme.typography.sizes.base,
    fontWeight: Theme.typography.weights.medium,
    color: Theme.colors.text.secondary,
  },
  summaryValue: {
    fontSize: Theme.typography.sizes.lg,
    fontWeight: Theme.typography.weights.bold,
    color: Theme.colors.primary[500],
  },
  motivationCard: {
    overflow: 'hidden',
  },
  motivationGradient: {
    padding: Theme.spacing['2xl'],
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 180,
  },
  motivationTitle: {
    fontSize: Theme.typography.sizes['2xl'],
    fontWeight: Theme.typography.weights.bold,
    color: '#fff',
    marginTop: Theme.spacing.base,
    marginBottom: Theme.spacing.xs,
  },
  motivationText: {
    fontSize: Theme.typography.sizes.base,
    fontWeight: Theme.typography.weights.medium,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    maxWidth: '80%',
  },
  bottomSpacer: {
    height: Theme.spacing['2xl'],
  },
});
