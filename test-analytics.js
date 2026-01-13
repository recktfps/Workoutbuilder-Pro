/**
 * Test script to verify analytics data
 * Run this in the app to test database queries
 */

import { db } from './src/services/database';

export async function testAnalytics() {
  try {
    console.log('=== Testing Analytics Data ===');

    // Test 1: Check if workouts exist
    console.log('\n1. Checking workouts table...');
    const workouts = await db.getRecentWorkouts(10);
    console.log(`Found ${workouts.length} workouts:`, workouts);

    // Test 2: Check workout stats
    console.log('\n2. Getting workout stats...');
    const stats = await db.getWorkoutStats();
    console.log('Stats:', JSON.stringify(stats, null, 2));

    // Test 3: Check database directly
    console.log('\n3. Direct database query...');
    if (db.db) {
      const directQuery = await db.db.getAllAsync('SELECT * FROM workouts');
      console.log(`Direct query found ${directQuery.length} workouts`);
      directQuery.forEach(w => {
        console.log(`- ${w.name}: completedAt=${w.completedAt}, totalSets=${w.totalSets}, totalVolume=${w.totalVolume}`);
      });

      // Check workout_exercises
      const exercises = await db.db.getAllAsync('SELECT * FROM workout_exercises');
      console.log(`\nFound ${exercises.length} workout exercises`);

      // Check workout_sets
      const sets = await db.db.getAllAsync('SELECT * FROM workout_sets');
      console.log(`Found ${sets.length} workout sets`);
    }

    console.log('\n=== Test Complete ===');
  } catch (error) {
    console.error('Test failed:', error);
  }
}

export async function createSampleWorkout() {
  try {
    console.log('Creating sample workout...');

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

    // Get an exercise
    const exercises = await db.getAllExercises();
    const exercise1 = exercises[0];
    const exercise2 = exercises[1];

    if (exercise1 && exercise2) {
      // Add first exercise
      const we1 = await db.saveWorkoutExercise(workoutId, exercise1.id, 0);
      await db.saveWorkoutSet(we1, 1, 135, 10, true, Date.now());
      await db.saveWorkoutSet(we1, 2, 135, 8, true, Date.now());
      await db.saveWorkoutSet(we1, 3, 135, 6, true, Date.now());

      // Add second exercise
      const we2 = await db.saveWorkoutExercise(workoutId, exercise2.id, 1);
      await db.saveWorkoutSet(we2, 1, 95, 12, true, Date.now());
      await db.saveWorkoutSet(we2, 2, 95, 10, true, Date.now());
      await db.saveWorkoutSet(we2, 3, 95, 8, true, Date.now());

      console.log('Sample workout created successfully!');

      // Verify
      const stats = await db.getWorkoutStats();
      console.log('Updated stats:', stats);
    }
  } catch (error) {
    console.error('Failed to create sample:', error);
  }
}
