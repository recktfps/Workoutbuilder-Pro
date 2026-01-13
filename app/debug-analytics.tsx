import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Theme, Button } from '../src/ui';
import { db } from '../src/services/database';

export default function DebugAnalyticsScreen() {
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const createSampleWorkout = async () => {
    try {
      addLog('Creating sample workout...');

      const workoutId = `workout_${Date.now()}`;
      const startTime = Date.now() - 3600000; // 1 hour ago

      // Save workout
      await db.saveWorkout({
        id: workoutId,
        name: 'Test Workout',
        startedAt: startTime,
        completedAt: Date.now(),
        duration: 3600,
        totalVolume: 5000,
        totalSets: 10,
      });
      addLog('Workout saved');

      // Get exercises
      const exercises = await db.getAllExercises();
      addLog(`Found ${exercises.length} exercises in database`);

      const exercise1 = exercises[0];
      const exercise2 = exercises[1];

      if (exercise1 && exercise2) {
        // Add first exercise
        const we1 = await db.saveWorkoutExercise(workoutId, exercise1.id, 0);
        await db.saveWorkoutSet(we1, 1, 135, 10, true, Date.now());
        await db.saveWorkoutSet(we1, 2, 135, 8, true, Date.now());
        await db.saveWorkoutSet(we1, 3, 135, 6, true, Date.now());
        addLog(`Added exercise: ${exercise1.name} (3 sets)`);

        // Add second exercise
        const we2 = await db.saveWorkoutExercise(workoutId, exercise2.id, 1);
        await db.saveWorkoutSet(we2, 1, 95, 12, true, Date.now());
        await db.saveWorkoutSet(we2, 2, 95, 10, true, Date.now());
        await db.saveWorkoutSet(we2, 3, 95, 8, true, Date.now());
        addLog(`Added exercise: ${exercise2.name} (3 sets)`);

        addLog('Sample workout created successfully!');

        // Verify
        const stats = await db.getWorkoutStats();
        addLog(`Stats updated: ${stats.totalWorkouts} workouts, ${stats.totalSets} sets`);
      } else {
        addLog('ERROR: Not enough exercises in database');
      }
    } catch (error) {
      addLog(`ERROR: ${error}`);
      console.error('Failed to create sample:', error);
    }
  };

  const checkDatabase = async () => {
    try {
      addLog('Checking database...');

      // Check workouts
      const workouts = await db.getRecentWorkouts(10);
      addLog(`Found ${workouts.length} completed workouts`);

      workouts.forEach(w => {
        addLog(`- ${w.name}: ${w.totalSets} sets, ${w.totalVolume} lbs volume`);
      });

      // Check stats
      const stats = await db.getWorkoutStats();
      addLog('Current stats:');
      addLog(`  Total Workouts: ${stats.totalWorkouts}`);
      addLog(`  Total Sets: ${stats.totalSets}`);
      addLog(`  Total Volume: ${stats.totalVolume}`);
      addLog(`  Current Streak: ${stats.currentStreak}`);
      addLog(`  Personal Records: ${stats.personalRecords}`);

    } catch (error) {
      addLog(`ERROR: ${error}`);
      console.error('Check failed:', error);
    }
  };

  const clearLogs = () => {
    setLogs([]);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Theme.colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.title}>Debug Analytics</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.buttons}>
        <Button
          title="Create Sample Workout"
          onPress={createSampleWorkout}
          variant="primary"
          gradient={Theme.gradients.primary}
        />
        <Button
          title="Check Database"
          onPress={checkDatabase}
          variant="secondary"
        />
        <Button
          title="Clear Logs"
          onPress={clearLogs}
          variant="secondary"
        />
      </View>

      <ScrollView style={styles.logsContainer}>
        <Text style={styles.logsTitle}>Logs:</Text>
        {logs.length === 0 ? (
          <Text style={styles.emptyText}>No logs yet. Tap a button above to test.</Text>
        ) : (
          logs.map((log, index) => (
            <Text key={index} style={styles.logText}>
              {log}
            </Text>
          ))
        )}
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Theme.spacing.lg,
    paddingVertical: Theme.spacing.base,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Theme.colors.background.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: Theme.typography.sizes['2xl'],
    fontWeight: Theme.typography.weights.bold,
    color: Theme.colors.text.primary,
  },
  buttons: {
    padding: Theme.spacing.lg,
    gap: Theme.spacing.sm,
  },
  logsContainer: {
    flex: 1,
    padding: Theme.spacing.lg,
    backgroundColor: Theme.colors.background.secondary,
    margin: Theme.spacing.lg,
    borderRadius: Theme.borderRadius.lg,
  },
  logsTitle: {
    fontSize: Theme.typography.sizes.lg,
    fontWeight: Theme.typography.weights.bold,
    color: Theme.colors.text.primary,
    marginBottom: Theme.spacing.base,
  },
  emptyText: {
    fontSize: Theme.typography.sizes.base,
    color: Theme.colors.text.tertiary,
    fontStyle: 'italic',
  },
  logText: {
    fontSize: Theme.typography.sizes.sm,
    color: Theme.colors.text.secondary,
    marginBottom: 4,
    fontFamily: 'monospace',
  },
});
