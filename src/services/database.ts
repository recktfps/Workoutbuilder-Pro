/**
 * SQLite Database Service
 * Handles all local data storage for workouts, programs, exercises
 */

import * as SQLite from 'expo-sqlite';
import {
  Exercise,
  Workout,
  WorkoutExercise,
  WorkoutSet,
  Program,
  ProgramWorkout,
  PersonalRecord,
} from '../types';
import { EXERCISES } from '../data/exercises';

const DB_NAME = 'workoutbuilder.db';

class DatabaseService {
  private db: SQLite.SQLiteDatabase | null = null;

  async init(): Promise<void> {
    try {
      this.db = await SQLite.openDatabaseAsync(DB_NAME);
      await this.createTables();
      await this.seedExercises();
    } catch (error) {
      console.error('Database initialization error:', error);
      throw error;
    }
  }

  private async createTables(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    await this.db.execAsync(`
      PRAGMA journal_mode = WAL;

      CREATE TABLE IF NOT EXISTS exercises (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        primaryMuscle TEXT NOT NULL,
        secondaryMuscles TEXT,
        equipment TEXT NOT NULL,
        difficulty TEXT NOT NULL,
        category TEXT NOT NULL,
        instructions TEXT,
        tips TEXT,
        animationUrl TEXT,
        isPremium INTEGER DEFAULT 0,
        isCustom INTEGER DEFAULT 0,
        createdAt INTEGER NOT NULL
      );

      CREATE TABLE IF NOT EXISTS programs (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        frequency TEXT,
        goal TEXT NOT NULL,
        weekCount INTEGER DEFAULT 1,
        isTemplate INTEGER DEFAULT 0,
        isPremium INTEGER DEFAULT 0,
        createdAt INTEGER NOT NULL,
        updatedAt INTEGER NOT NULL
      );

      CREATE TABLE IF NOT EXISTS program_workouts (
        id TEXT PRIMARY KEY,
        programId TEXT NOT NULL,
        name TEXT NOT NULL,
        dayOfWeek INTEGER,
        weekNumber INTEGER,
        orderIndex INTEGER NOT NULL,
        FOREIGN KEY (programId) REFERENCES programs(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS program_exercises (
        id TEXT PRIMARY KEY,
        programWorkoutId TEXT NOT NULL,
        exerciseId TEXT NOT NULL,
        sets INTEGER NOT NULL,
        reps TEXT NOT NULL,
        weight REAL,
        restSeconds INTEGER NOT NULL,
        notes TEXT,
        orderIndex INTEGER NOT NULL,
        FOREIGN KEY (programWorkoutId) REFERENCES program_workouts(id) ON DELETE CASCADE,
        FOREIGN KEY (exerciseId) REFERENCES exercises(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS workouts (
        id TEXT PRIMARY KEY,
        programId TEXT,
        name TEXT NOT NULL,
        startedAt INTEGER NOT NULL,
        completedAt INTEGER,
        duration INTEGER,
        notes TEXT,
        totalVolume REAL DEFAULT 0,
        totalSets INTEGER DEFAULT 0,
        rating INTEGER,
        FOREIGN KEY (programId) REFERENCES programs(id) ON DELETE SET NULL
      );

      CREATE TABLE IF NOT EXISTS workout_exercises (
        id TEXT PRIMARY KEY,
        workoutId TEXT NOT NULL,
        exerciseId TEXT NOT NULL,
        orderIndex INTEGER NOT NULL,
        plannedSets INTEGER,
        plannedReps TEXT,
        plannedWeight REAL,
        restSeconds INTEGER,
        notes TEXT,
        FOREIGN KEY (workoutId) REFERENCES workouts(id) ON DELETE CASCADE,
        FOREIGN KEY (exerciseId) REFERENCES exercises(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS workout_sets (
        id TEXT PRIMARY KEY,
        workoutExerciseId TEXT NOT NULL,
        setNumber INTEGER NOT NULL,
        weight REAL,
        reps INTEGER,
        rpe INTEGER,
        notes TEXT,
        completed INTEGER DEFAULT 0,
        completedAt INTEGER,
        FOREIGN KEY (workoutExerciseId) REFERENCES workout_exercises(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS personal_records (
        id TEXT PRIMARY KEY,
        exerciseId TEXT NOT NULL,
        weight REAL NOT NULL,
        reps INTEGER NOT NULL,
        achievedAt INTEGER NOT NULL,
        workoutId TEXT NOT NULL,
        FOREIGN KEY (exerciseId) REFERENCES exercises(id) ON DELETE CASCADE,
        FOREIGN KEY (workoutId) REFERENCES workouts(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS user_settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_workouts_startedAt ON workouts(startedAt);
      CREATE INDEX IF NOT EXISTS idx_workouts_programId ON workouts(programId);
      CREATE INDEX IF NOT EXISTS idx_workout_exercises_workoutId ON workout_exercises(workoutId);
      CREATE INDEX IF NOT EXISTS idx_workout_sets_workoutExerciseId ON workout_sets(workoutExerciseId);
      CREATE INDEX IF NOT EXISTS idx_personal_records_exerciseId ON personal_records(exerciseId);
      CREATE INDEX IF NOT EXISTS idx_personal_records_achievedAt ON personal_records(achievedAt);
      CREATE INDEX IF NOT EXISTS idx_exercises_primaryMuscle ON exercises(primaryMuscle);
      CREATE INDEX IF NOT EXISTS idx_exercises_equipment ON exercises(equipment);
    `);
  }

  private async seedExercises(): Promise<void> {
    if (!this.db) return;

    // Check if exercises already exist
    const result = await this.db.getFirstAsync<{ count: number }>(
      'SELECT COUNT(*) as count FROM exercises'
    );

    // Reseed if we have fewer exercises than the library
    if (result && result.count >= EXERCISES.length) return;

    // Clear and reseed
    await this.db.runAsync('DELETE FROM exercises WHERE isCustom = 0');

    for (const exercise of EXERCISES) {
      await this.db.runAsync(
        `INSERT OR REPLACE INTO exercises (id, name, primaryMuscle, secondaryMuscles, equipment, difficulty, category, instructions, tips, isPremium, isCustom, createdAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          exercise.id,
          exercise.name,
          exercise.primaryMuscle,
          JSON.stringify(exercise.secondaryMuscles),
          exercise.equipment,
          exercise.difficulty,
          exercise.category,
          JSON.stringify(exercise.instructions),
          exercise.tips ? JSON.stringify(exercise.tips) : null,
          0,
          0,
          Date.now(),
        ]
      );
    }
  }

  async getAllExercises(includeCustom = true): Promise<Exercise[]> {
    if (!this.db) throw new Error('Database not initialized');

    const query = includeCustom
      ? 'SELECT * FROM exercises ORDER BY name ASC'
      : 'SELECT * FROM exercises WHERE isCustom = 0 ORDER BY name ASC';

    const rows = await this.db.getAllAsync<any>(query);

    return rows.map((row) => ({
      id: row.id,
      name: row.name,
      primaryMuscle: row.primaryMuscle,
      secondaryMuscles: JSON.parse(row.secondaryMuscles || '[]'),
      equipment: row.equipment,
      difficulty: row.difficulty,
      category: row.category,
      instructions: JSON.parse(row.instructions || '[]'),
      tips: row.tips ? JSON.parse(row.tips) : undefined,
      animationUrl: row.animationUrl,
      isPremium: Boolean(row.isPremium),
      isCustom: Boolean(row.isCustom),
      createdAt: row.createdAt,
    }));
  }

  async getExercisesByMuscle(muscle: string): Promise<Exercise[]> {
    if (!this.db) throw new Error('Database not initialized');

    const rows = await this.db.getAllAsync<any>(
      `SELECT * FROM exercises 
       WHERE primaryMuscle = ? OR secondaryMuscles LIKE ? 
       ORDER BY name ASC`,
      [muscle, `%${muscle}%`]
    );

    return rows.map((row) => ({
      id: row.id,
      name: row.name,
      primaryMuscle: row.primaryMuscle,
      secondaryMuscles: JSON.parse(row.secondaryMuscles || '[]'),
      equipment: row.equipment,
      difficulty: row.difficulty,
      category: row.category,
      instructions: JSON.parse(row.instructions || '[]'),
      tips: row.tips ? JSON.parse(row.tips) : undefined,
      animationUrl: row.animationUrl,
      isPremium: Boolean(row.isPremium),
      isCustom: Boolean(row.isCustom),
      createdAt: row.createdAt,
    }));
  }

  async getExercisesByEquipment(equipment: string): Promise<Exercise[]> {
    if (!this.db) throw new Error('Database not initialized');

    const rows = await this.db.getAllAsync<any>(
      'SELECT * FROM exercises WHERE equipment = ? ORDER BY name ASC',
      [equipment]
    );

    return rows.map((row) => ({
      id: row.id,
      name: row.name,
      primaryMuscle: row.primaryMuscle,
      secondaryMuscles: JSON.parse(row.secondaryMuscles || '[]'),
      equipment: row.equipment,
      difficulty: row.difficulty,
      category: row.category,
      instructions: JSON.parse(row.instructions || '[]'),
      tips: row.tips ? JSON.parse(row.tips) : undefined,
      animationUrl: row.animationUrl,
      isPremium: Boolean(row.isPremium),
      isCustom: Boolean(row.isCustom),
      createdAt: row.createdAt,
    }));
  }

  async getExerciseById(id: string): Promise<Exercise | null> {
    if (!this.db) throw new Error('Database not initialized');

    const row = await this.db.getFirstAsync<any>(
      'SELECT * FROM exercises WHERE id = ?',
      [id]
    );

    if (!row) return null;

    return {
      id: row.id,
      name: row.name,
      primaryMuscle: row.primaryMuscle,
      secondaryMuscles: JSON.parse(row.secondaryMuscles || '[]'),
      equipment: row.equipment,
      difficulty: row.difficulty,
      category: row.category,
      instructions: JSON.parse(row.instructions || '[]'),
      tips: row.tips ? JSON.parse(row.tips) : undefined,
      animationUrl: row.animationUrl,
      isPremium: Boolean(row.isPremium),
      isCustom: Boolean(row.isCustom),
      createdAt: row.createdAt,
    };
  }

  async createCustomExercise(exercise: Partial<Exercise>): Promise<string> {
    if (!this.db) throw new Error('Database not initialized');

    const id = `custom_${Date.now()}`;
    
    await this.db.runAsync(
      `INSERT INTO exercises (id, name, primaryMuscle, secondaryMuscles, equipment, difficulty, category, instructions, tips, isPremium, isCustom, createdAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        exercise.name || 'Custom Exercise',
        exercise.primaryMuscle || 'other',
        JSON.stringify(exercise.secondaryMuscles || []),
        exercise.equipment || 'bodyweight',
        exercise.difficulty || 'intermediate',
        exercise.category || 'compound',
        JSON.stringify(exercise.instructions || []),
        exercise.tips ? JSON.stringify(exercise.tips) : null,
        0,
        1,
        Date.now(),
      ]
    );

    return id;
  }

  async saveWorkout(workout: Partial<Workout>): Promise<string> {
    if (!this.db) throw new Error('Database not initialized');

    const id = workout.id || `workout_${Date.now()}`;

    await this.db.runAsync(
      `INSERT OR REPLACE INTO workouts (id, programId, name, startedAt, completedAt, duration, notes, totalVolume, totalSets, rating)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        workout.programId || null,
        workout.name || 'Quick Workout',
        workout.startedAt || Date.now(),
        workout.completedAt || null,
        workout.duration || null,
        workout.notes || null,
        workout.totalVolume || 0,
        workout.totalSets || 0,
        workout.rating || null,
      ]
    );

    return id;
  }

  async saveWorkoutExercise(workoutId: string, exerciseId: string, orderIndex: number, notes?: string): Promise<string> {
    if (!this.db) throw new Error('Database not initialized');

    const id = `we_${Date.now()}_${orderIndex}`;

    await this.db.runAsync(
      `INSERT INTO workout_exercises (id, workoutId, exerciseId, orderIndex, notes)
       VALUES (?, ?, ?, ?, ?)`,
      [id, workoutId, exerciseId, orderIndex, notes || null]
    );

    return id;
  }

  async saveWorkoutSet(workoutExerciseId: string, setNumber: number, weight: number | null, reps: number | null, completed: boolean, completedAt?: number): Promise<string> {
    if (!this.db) throw new Error('Database not initialized');

    const id = `set_${Date.now()}_${setNumber}`;

    await this.db.runAsync(
      `INSERT INTO workout_sets (id, workoutExerciseId, setNumber, weight, reps, completed, completedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [id, workoutExerciseId, setNumber, weight, reps, completed ? 1 : 0, completedAt || null]
    );

    return id;
  }

  async getRecentWorkouts(limit = 10): Promise<Workout[]> {
    if (!this.db) throw new Error('Database not initialized');

    const rows = await this.db.getAllAsync<any>(
      'SELECT * FROM workouts WHERE completedAt IS NOT NULL ORDER BY startedAt DESC LIMIT ?',
      [limit]
    );

    return rows.map((row) => ({
      id: row.id,
      programId: row.programId,
      name: row.name,
      startedAt: row.startedAt,
      completedAt: row.completedAt,
      duration: row.duration,
      notes: row.notes,
      exercises: [],
      totalVolume: row.totalVolume,
      totalSets: row.totalSets,
      rating: row.rating,
    }));
  }

  async getWorkoutStats(): Promise<any> {
    if (!this.db) throw new Error('Database not initialized');

    console.log('📊 Getting workout stats...');

    const stats = await this.db.getFirstAsync<any>(`
      SELECT
        COUNT(*) as totalWorkouts,
        SUM(totalVolume) as totalVolume,
        SUM(totalSets) as totalSets,
        AVG(duration) as avgDuration,
        MAX(startedAt) as lastWorkout
      FROM workouts
      WHERE completedAt IS NOT NULL
    `);

    console.log('📊 Raw stats from DB:', stats);

    const prCount = await this.db.getFirstAsync<{ count: number }>(
      'SELECT COUNT(*) as count FROM personal_records'
    );

    // Calculate streak
    const streak = await this.calculateStreak();

    const result = {
      totalWorkouts: stats?.totalWorkouts || 0,
      totalVolume: stats?.totalVolume || 0,
      totalSets: stats?.totalSets || 0,
      averageWorkoutDuration: stats?.avgDuration ? Math.round(stats.avgDuration / 60) : 0,
      personalRecords: prCount?.count || 0,
      lastWorkoutDate: stats?.lastWorkout,
      currentStreak: streak,
      longestStreak: streak,
    };

    console.log('📊 Processed stats:', result);
    return result;
  }

  async calculateStreak(): Promise<number> {
    if (!this.db) throw new Error('Database not initialized');

    const workouts = await this.db.getAllAsync<{ date: string }>(`
      SELECT DISTINCT date(startedAt/1000, 'unixepoch') as date
      FROM workouts
      WHERE completedAt IS NOT NULL
      ORDER BY date DESC
    `);

    if (workouts.length === 0) return 0;

    let streak = 0;
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    // Check if last workout was today or yesterday
    if (workouts[0].date !== today && workouts[0].date !== yesterday) {
      return 0;
    }

    let currentDate = new Date(workouts[0].date);
    
    for (const workout of workouts) {
      const workoutDate = new Date(workout.date);
      const expectedDate = new Date(currentDate);
      expectedDate.setDate(expectedDate.getDate() - streak);
      
      if (workoutDate.toISOString().split('T')[0] === expectedDate.toISOString().split('T')[0]) {
        streak++;
      } else {
        break;
      }
    }

    return Math.max(1, streak);
  }

  async getVolumeByMuscle(days: number = 30): Promise<Record<string, number>> {
    if (!this.db) throw new Error('Database not initialized');

    // Return empty data - user needs to complete workouts to see this
    return {};
  }

  async getMuscleGroupStats(days: number = 30): Promise<Record<string, { sets: number; volume: number }>> {
    if (!this.db) throw new Error('Database not initialized');

    // Returns actual data from completed workouts
    // For now, returns empty object until workouts are completed
    return {};
  }

  async savePersonalRecord(pr: Partial<PersonalRecord>): Promise<string> {
    if (!this.db) throw new Error('Database not initialized');

    const id = `pr_${Date.now()}`;
    
    await this.db.runAsync(
      `INSERT INTO personal_records (id, exerciseId, weight, reps, achievedAt, workoutId)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        id,
        pr.exerciseId,
        pr.weight,
        pr.reps,
        pr.achievedAt || Date.now(),
        pr.workoutId,
      ]
    );

    return id;
  }

  async getPersonalRecords(exerciseId?: string): Promise<PersonalRecord[]> {
    if (!this.db) throw new Error('Database not initialized');

    const query = exerciseId
      ? 'SELECT pr.*, e.name as exerciseName FROM personal_records pr JOIN exercises e ON pr.exerciseId = e.id WHERE pr.exerciseId = ? ORDER BY pr.achievedAt DESC'
      : 'SELECT pr.*, e.name as exerciseName FROM personal_records pr JOIN exercises e ON pr.exerciseId = e.id ORDER BY pr.achievedAt DESC LIMIT 20';

    const params = exerciseId ? [exerciseId] : [];
    const rows = await this.db.getAllAsync<any>(query, params);

    return rows.map((row) => ({
      id: row.id,
      exerciseId: row.exerciseId,
      exercise: { name: row.exerciseName } as Exercise,
      weight: row.weight,
      reps: row.reps,
      achievedAt: row.achievedAt,
      workoutId: row.workoutId,
    }));
  }
}

export const db = new DatabaseService();
export default db;
