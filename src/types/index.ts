/**
 * WorkoutBuilder Pro Type Definitions
 */

export type MuscleGroup = 
  | 'chest'
  | 'back'
  | 'shoulders'
  | 'biceps'
  | 'triceps'
  | 'forearms'
  | 'quads'
  | 'hamstrings'
  | 'glutes'
  | 'calves'
  | 'abs'
  | 'obliques'
  | 'lower_back'
  | 'traps'
  | 'lats'
  | 'legs'
  | 'arms'
  | 'core';

export type EquipmentType =
  | 'barbell'
  | 'dumbbell'
  | 'dumbbells'
  | 'machine'
  | 'cable'
  | 'bodyweight'
  | 'kettlebell'
  | 'bands'
  | 'other';

export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';

export type ExerciseCategory = 
  | 'compound'
  | 'isolation'
  | 'cardio'
  | 'stretching';

export interface Exercise {
  id: string;
  name: string;
  primaryMuscle: MuscleGroup;
  secondaryMuscles: MuscleGroup[];
  equipment: EquipmentType;
  difficulty: DifficultyLevel;
  category: ExerciseCategory;
  instructions: string[];
  tips?: string[];
  animationUrl?: string; // For demo GIFs
  isPremium: boolean;
  isCustom: boolean;
  createdAt: number;
}

export interface WorkoutSet {
  id: string;
  exerciseId: string;
  setNumber: number;
  weight: number | null;
  reps: number | null;
  rpe?: number; // Rate of Perceived Exertion (1-10)
  notes?: string;
  completed: boolean;
  completedAt?: number;
}

export interface WorkoutExercise {
  id: string;
  exerciseId: string;
  exercise: Exercise;
  orderIndex: number;
  plannedSets: number;
  plannedReps: string; // e.g., "8-12" or "5"
  plannedWeight?: number;
  restSeconds: number;
  notes?: string;
  sets: WorkoutSet[];
}

export interface Workout {
  id: string;
  programId?: string;
  name: string;
  startedAt: number;
  completedAt?: number;
  duration?: number; // seconds
  notes?: string;
  exercises: WorkoutExercise[];
  totalVolume: number; // calculated: sum of (weight * reps)
  totalSets: number;
  rating?: number; // 1-5 stars
}

export interface Program {
  id: string;
  name: string;
  description?: string;
  frequency: string; // e.g., "4x per week"
  goal: 'strength' | 'hypertrophy' | 'endurance' | 'general';
  weekCount: number;
  workouts: ProgramWorkout[];
  isTemplate: boolean;
  isPremium: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface ProgramWorkout {
  id: string;
  programId: string;
  name: string;
  dayOfWeek?: number; // 0-6, optional
  weekNumber?: number; // for multi-week programs
  exercises: ProgramExercise[];
  orderIndex: number;
}

export interface ProgramExercise {
  id: string;
  exerciseId: string;
  sets: number;
  reps: string; // "5" or "8-12" or "AMRAP"
  weight?: number;
  restSeconds: number;
  notes?: string;
  orderIndex: number;
}

export interface PersonalRecord {
  id: string;
  exerciseId: string;
  exercise: Exercise;
  weight: number;
  reps: number;
  achievedAt: number;
  workoutId: string;
  previousPR?: {
    weight: number;
    reps: number;
    achievedAt: number;
  };
}

export interface WorkoutStats {
  totalWorkouts: number;
  totalVolume: number;
  totalSets: number;
  totalReps: number;
  averageWorkoutDuration: number; // minutes
  currentStreak: number; // days
  longestStreak: number; // days
  personalRecords: number;
  lastWorkoutDate?: number;
}

export interface VolumeByMuscle {
  muscle: MuscleGroup;
  volume: number;
  sets: number;
  workouts: number;
  color: string;
}

export interface ProgressDataPoint {
  date: number;
  value: number;
  label?: string;
}

export interface SubscriptionTier {
  id: 'free' | 'pro';
  name: string;
  features: string[];
  limits: {
    programs: number | null; // null = unlimited
    history: number | null; // days, null = unlimited
    exercises: number | null; // null = unlimited
  };
}

export interface UserPreferences {
  weightUnit: 'kg' | 'lbs';
  defaultRestTimer: number; // seconds
  hapticFeedback: boolean;
  restTimerSound: boolean;
  theme: 'midnight' | 'neon' | 'sunset';
  showPlateCalculator: boolean;
  autoStartRestTimer: boolean;
  showPreviousWorkout: boolean;
}

export interface UserProfile {
  id: string;
  name?: string;
  trainingStartDate: number;
  subscriptionTier: 'free' | 'pro';
  preferences: UserPreferences;
  stats: WorkoutStats;
  createdAt: number;
}

// Chart data types
export interface ChartDataPoint {
  x: number | string;
  y: number;
  label?: string;
}

export interface HeatMapCell {
  date: string; // YYYY-MM-DD
  value: number;
  intensity: number; // 0-1
}

// Navigation types
export type RootStackParamList = {
  '(tabs)': undefined;
  'onboarding': undefined;
  'paywall': { source?: string };
  'exercise-detail': { exerciseId: string };
  'workout-in-progress': { workoutId: string };
  'program-builder': { programId?: string };
  'exercise-picker': { onSelect: (exerciseId: string) => void };
};

export type TabParamList = {
  'index': undefined; // Home/Dashboard
  'programs': undefined;
  'analytics': undefined;
  'profile': undefined;
};

