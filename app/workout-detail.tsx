import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Card, Theme } from '../src/ui';
import { db } from '../src/services/database';
import { formatDuration } from '../src/utils/formatting';
import { format } from 'date-fns';

interface WorkoutExercise {
  id: string;
  exerciseId: string;
  exerciseName: string;
  orderIndex: number;
  notes?: string;
  sets: WorkoutSet[];
}

interface WorkoutSet {
  id: string;
  setNumber: number;
  weight: number | null;
  reps: number | null;
  completed: boolean;
  completedAt?: number;
}

interface WorkoutDetail {
  id: string;
  name: string;
  startedAt: number;
  completedAt: number;
  duration: number;
  totalVolume: number;
  totalSets: number;
  exercises: WorkoutExercise[];
}

export default function WorkoutDetailScreen() {
  const params = useLocalSearchParams();
  const workoutId = params.id as string;

  const [workout, setWorkout] = useState<WorkoutDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWorkoutDetail();
  }, [workoutId]);

  const loadWorkoutDetail = async () => {
    try {
      if (!db.db) throw new Error('Database not initialized');

      // Get workout header
      const workoutHeader = await db.db.getFirstAsync<any>(
        'SELECT * FROM workouts WHERE id = ?',
        [workoutId]
      );

      if (!workoutHeader) {
        console.error('Workout not found:', workoutId);
        setLoading(false);
        return;
      }

      // Get workout exercises
      const workoutExercises = await db.db.getAllAsync<any>(
        `SELECT we.*, e.name as exerciseName
         FROM workout_exercises we
         LEFT JOIN exercises e ON we.exerciseId = e.id
         WHERE we.workoutId = ?
         ORDER BY we.orderIndex`,
        [workoutId]
      );

      // Get sets for each exercise
      const exercisesWithSets: WorkoutExercise[] = [];
      for (const exercise of workoutExercises) {
        const sets = await db.db.getAllAsync<WorkoutSet>(
          `SELECT * FROM workout_sets
           WHERE workoutExerciseId = ?
           ORDER BY setNumber`,
          [exercise.id]
        );

        exercisesWithSets.push({
          id: exercise.id,
          exerciseId: exercise.exerciseId,
          exerciseName: exercise.exerciseName || 'Unknown Exercise',
          orderIndex: exercise.orderIndex,
          notes: exercise.notes,
          sets: sets.map(s => ({
            ...s,
            completed: Boolean(s.completed),
          })),
        });
      }

      setWorkout({
        id: workoutHeader.id,
        name: workoutHeader.name,
        startedAt: workoutHeader.startedAt,
        completedAt: workoutHeader.completedAt,
        duration: workoutHeader.duration,
        totalVolume: workoutHeader.totalVolume,
        totalSets: workoutHeader.totalSets,
        exercises: exercisesWithSets,
      });

      setLoading(false);
    } catch (error) {
      console.error('Error loading workout detail:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!workout) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <Text style={styles.errorText}>Workout not found</Text>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
          <Ionicons name="arrow-back" size={24} color={Theme.colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Workout Details</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Workout Info Card */}
        <Animated.View entering={FadeInDown.duration(400)} style={styles.section}>
          <Card style={styles.infoCard}>
            <Text style={styles.workoutName}>{workout.name}</Text>
            <Text style={styles.workoutDate}>
              {format(new Date(workout.completedAt), 'EEEE, MMMM d, yyyy')}
            </Text>
            <Text style={styles.workoutTime}>
              {format(new Date(workout.startedAt), 'h:mm a')} - {format(new Date(workout.completedAt), 'h:mm a')}
            </Text>

            {/* Stats Grid */}
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Ionicons name="time-outline" size={24} color={Theme.colors.primary[500]} />
                <Text style={styles.statValue}>{formatDuration(workout.duration)}</Text>
                <Text style={styles.statLabel}>Duration</Text>
              </View>
              <View style={styles.statItem}>
                <Ionicons name="checkmark-circle-outline" size={24} color={Theme.colors.success[500]} />
                <Text style={styles.statValue}>{workout.totalSets}</Text>
                <Text style={styles.statLabel}>Sets</Text>
              </View>
              <View style={styles.statItem}>
                <Ionicons name="barbell-outline" size={24} color={Theme.colors.warning[500]} />
                <Text style={styles.statValue}>{workout.totalVolume.toLocaleString()}</Text>
                <Text style={styles.statLabel}>Volume (lbs)</Text>
              </View>
            </View>
          </Card>
        </Animated.View>

        {/* Exercises */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Exercises</Text>
          {workout.exercises.map((exercise, index) => (
            <Animated.View
              key={exercise.id}
              entering={FadeInDown.duration(400).delay((index + 1) * 100)}
              style={styles.exerciseContainer}
            >
              <Card style={styles.exerciseCard}>
                <View style={styles.exerciseHeader}>
                  <View style={styles.exerciseNumber}>
                    <Text style={styles.exerciseNumberText}>{index + 1}</Text>
                  </View>
                  <Text style={styles.exerciseName}>{exercise.exerciseName}</Text>
                </View>

                {exercise.notes && (
                  <Text style={styles.exerciseNotes}>{exercise.notes}</Text>
                )}

                {/* Sets Table */}
                <View style={styles.table}>
                  <View style={styles.tableHeader}>
                    <Text style={[styles.tableHeaderText, { flex: 1 }]}>SET</Text>
                    <Text style={[styles.tableHeaderText, { flex: 1.5 }]}>WEIGHT</Text>
                    <Text style={[styles.tableHeaderText, { flex: 1.5 }]}>REPS</Text>
                    <Text style={[styles.tableHeaderText, { flex: 1.5 }]}>VOLUME</Text>
                  </View>

                  {exercise.sets.map((set) => {
                    const volume = (set.weight || 0) * (set.reps || 0);
                    return (
                      <View key={set.id} style={styles.tableRow}>
                        <Text style={[styles.tableCell, { flex: 1 }]}>{set.setNumber}</Text>
                        <Text style={[styles.tableCell, { flex: 1.5 }]}>
                          {set.weight ? `${set.weight} lbs` : '-'}
                        </Text>
                        <Text style={[styles.tableCell, { flex: 1.5 }]}>
                          {set.reps || '-'}
                        </Text>
                        <Text style={[styles.tableCell, { flex: 1.5 }]}>
                          {volume > 0 ? `${volume} lbs` : '-'}
                        </Text>
                      </View>
                    );
                  })}

                  {/* Exercise Total */}
                  <View style={styles.exerciseTotal}>
                    <Text style={styles.exerciseTotalLabel}>Exercise Total:</Text>
                    <Text style={styles.exerciseTotalValue}>
                      {exercise.sets.reduce((sum, set) =>
                        sum + ((set.weight || 0) * (set.reps || 0)), 0
                      ).toLocaleString()} lbs
                    </Text>
                  </View>
                </View>
              </Card>
            </Animated.View>
          ))}
        </View>

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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Theme.spacing.lg,
    paddingVertical: Theme.spacing.base,
    backgroundColor: Theme.colors.background.secondary,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: Theme.typography.sizes.xl,
    fontWeight: Theme.typography.weights.bold,
    color: Theme.colors.text.primary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Theme.spacing.xl,
  },
  loadingText: {
    fontSize: Theme.typography.sizes.lg,
    color: Theme.colors.text.secondary,
  },
  errorText: {
    fontSize: Theme.typography.sizes.lg,
    color: Theme.colors.error[500],
    marginBottom: Theme.spacing.lg,
  },
  backButton: {
    paddingHorizontal: Theme.spacing.xl,
    paddingVertical: Theme.spacing.base,
    backgroundColor: Theme.colors.primary[500],
    borderRadius: Theme.borderRadius.md,
  },
  backButtonText: {
    fontSize: Theme.typography.sizes.base,
    fontWeight: Theme.typography.weights.semibold,
    color: '#fff',
  },
  section: {
    paddingHorizontal: Theme.spacing.xl,
    marginTop: Theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: Theme.typography.sizes.xl,
    fontWeight: Theme.typography.weights.bold,
    color: Theme.colors.text.primary,
    marginBottom: Theme.spacing.base,
  },
  infoCard: {
    padding: Theme.spacing.lg,
  },
  workoutName: {
    fontSize: Theme.typography.sizes['2xl'],
    fontWeight: Theme.typography.weights.bold,
    color: Theme.colors.text.primary,
    marginBottom: Theme.spacing.xs,
  },
  workoutDate: {
    fontSize: Theme.typography.sizes.base,
    fontWeight: Theme.typography.weights.medium,
    color: Theme.colors.text.secondary,
  },
  workoutTime: {
    fontSize: Theme.typography.sizes.sm,
    fontWeight: Theme.typography.weights.regular,
    color: Theme.colors.text.tertiary,
    marginBottom: Theme.spacing.lg,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: Theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Theme.colors.divider,
  },
  statItem: {
    alignItems: 'center',
    gap: Theme.spacing.xs,
  },
  statValue: {
    fontSize: Theme.typography.sizes.xl,
    fontWeight: Theme.typography.weights.bold,
    color: Theme.colors.text.primary,
  },
  statLabel: {
    fontSize: Theme.typography.sizes.xs,
    fontWeight: Theme.typography.weights.medium,
    color: Theme.colors.text.tertiary,
  },
  exerciseContainer: {
    marginBottom: Theme.spacing.base,
  },
  exerciseCard: {
    padding: Theme.spacing.base,
  },
  exerciseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Theme.spacing.sm,
    gap: Theme.spacing.sm,
  },
  exerciseNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Theme.colors.primary[500] + '30',
    justifyContent: 'center',
    alignItems: 'center',
  },
  exerciseNumberText: {
    fontSize: Theme.typography.sizes.sm,
    fontWeight: Theme.typography.weights.bold,
    color: Theme.colors.primary[500],
  },
  exerciseName: {
    flex: 1,
    fontSize: Theme.typography.sizes.lg,
    fontWeight: Theme.typography.weights.semibold,
    color: Theme.colors.text.primary,
  },
  exerciseNotes: {
    fontSize: Theme.typography.sizes.sm,
    color: Theme.colors.text.tertiary,
    fontStyle: 'italic',
    marginBottom: Theme.spacing.sm,
    paddingLeft: 40,
  },
  table: {
    marginTop: Theme.spacing.sm,
  },
  tableHeader: {
    flexDirection: 'row',
    paddingVertical: Theme.spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.divider,
  },
  tableHeaderText: {
    fontSize: Theme.typography.sizes.xs,
    fontWeight: Theme.typography.weights.bold,
    color: Theme.colors.text.tertiary,
    textAlign: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: Theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.background.tertiary,
  },
  tableCell: {
    fontSize: Theme.typography.sizes.sm,
    fontWeight: Theme.typography.weights.medium,
    color: Theme.colors.text.secondary,
    textAlign: 'center',
  },
  exerciseTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Theme.spacing.sm,
    marginTop: Theme.spacing.sm,
    borderTopWidth: 2,
    borderTopColor: Theme.colors.divider,
  },
  exerciseTotalLabel: {
    fontSize: Theme.typography.sizes.base,
    fontWeight: Theme.typography.weights.semibold,
    color: Theme.colors.text.primary,
  },
  exerciseTotalValue: {
    fontSize: Theme.typography.sizes.lg,
    fontWeight: Theme.typography.weights.bold,
    color: Theme.colors.primary[500],
  },
  bottomSpacer: {
    height: Theme.spacing['2xl'],
  },
});
