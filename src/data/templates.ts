/**
 * Workout Templates
 * Pre-built workout templates that users can use and customize
 */

export interface TemplateExercise {
  exerciseId: string;
  sets: number;
  reps: string;
  restSeconds: number;
  notes?: string;
}

export interface WorkoutTemplate {
  id: string;
  name: string;
  description: string;
  type: 'push' | 'pull' | 'legs' | 'upper' | 'lower' | 'full' | 'arms' | 'custom';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: string; // estimated
  muscleGroups: string[];
  exercises: TemplateExercise[];
  isDefault: boolean;
}

export const DEFAULT_TEMPLATES: WorkoutTemplate[] = [
  // ============== PUSH DAY ==============
  {
    id: 'template_push',
    name: 'Push Day',
    description: 'Complete chest, shoulders, and triceps workout',
    type: 'push',
    difficulty: 'intermediate',
    duration: '60-75 min',
    muscleGroups: ['chest', 'shoulders', 'triceps'],
    isDefault: true,
    exercises: [
      { exerciseId: 'ex_bench_press', sets: 4, reps: '6-8', restSeconds: 180 },
      { exerciseId: 'ex_incline_dumbbell_press', sets: 3, reps: '8-10', restSeconds: 120 },
      { exerciseId: 'ex_dumbbell_shoulder_press', sets: 3, reps: '8-10', restSeconds: 120 },
      { exerciseId: 'ex_lateral_raise', sets: 3, reps: '12-15', restSeconds: 60 },
      { exerciseId: 'ex_cable_crossover', sets: 3, reps: '12-15', restSeconds: 60 },
      { exerciseId: 'ex_tricep_pushdown', sets: 3, reps: '10-12', restSeconds: 60 },
      { exerciseId: 'ex_overhead_tricep_extension', sets: 3, reps: '10-12', restSeconds: 60 },
    ],
  },

  // ============== PULL DAY ==============
  {
    id: 'template_pull',
    name: 'Pull Day',
    description: 'Complete back and biceps workout',
    type: 'pull',
    difficulty: 'intermediate',
    duration: '60-75 min',
    muscleGroups: ['back', 'biceps', 'traps'],
    isDefault: true,
    exercises: [
      { exerciseId: 'ex_deadlift', sets: 4, reps: '5', restSeconds: 180 },
      { exerciseId: 'ex_pullup', sets: 4, reps: '6-10', restSeconds: 120, notes: 'Use assistance if needed' },
      { exerciseId: 'ex_barbell_row', sets: 3, reps: '8-10', restSeconds: 120 },
      { exerciseId: 'ex_lat_pulldown', sets: 3, reps: '10-12', restSeconds: 90 },
      { exerciseId: 'ex_face_pull', sets: 3, reps: '15-20', restSeconds: 60 },
      { exerciseId: 'ex_barbell_curl', sets: 3, reps: '10-12', restSeconds: 60 },
      { exerciseId: 'ex_hammer_curl', sets: 3, reps: '10-12', restSeconds: 60 },
    ],
  },

  // ============== LEG DAY ==============
  {
    id: 'template_legs',
    name: 'Leg Day',
    description: 'Complete lower body workout for quads, hamstrings, and glutes',
    type: 'legs',
    difficulty: 'intermediate',
    duration: '60-75 min',
    muscleGroups: ['legs', 'glutes', 'hamstrings', 'calves'],
    isDefault: true,
    exercises: [
      { exerciseId: 'ex_squat', sets: 4, reps: '6-8', restSeconds: 180 },
      { exerciseId: 'ex_romanian_deadlift', sets: 3, reps: '8-10', restSeconds: 120 },
      { exerciseId: 'ex_leg_press', sets: 3, reps: '10-12', restSeconds: 120 },
      { exerciseId: 'ex_leg_curl', sets: 3, reps: '10-12', restSeconds: 90 },
      { exerciseId: 'ex_leg_extension', sets: 3, reps: '12-15', restSeconds: 60 },
      { exerciseId: 'ex_calf_raise', sets: 4, reps: '12-15', restSeconds: 60 },
      { exerciseId: 'ex_hip_thrust', sets: 3, reps: '10-12', restSeconds: 90 },
    ],
  },

  // ============== FULL BODY ==============
  {
    id: 'template_full',
    name: 'Full Body',
    description: 'Hit every major muscle group in one efficient workout',
    type: 'full',
    difficulty: 'intermediate',
    duration: '60-90 min',
    muscleGroups: ['chest', 'back', 'legs', 'shoulders', 'arms'],
    isDefault: true,
    exercises: [
      { exerciseId: 'ex_squat', sets: 3, reps: '8-10', restSeconds: 180 },
      { exerciseId: 'ex_bench_press', sets: 3, reps: '8-10', restSeconds: 120 },
      { exerciseId: 'ex_barbell_row', sets: 3, reps: '8-10', restSeconds: 120 },
      { exerciseId: 'ex_overhead_press', sets: 3, reps: '8-10', restSeconds: 120 },
      { exerciseId: 'ex_romanian_deadlift', sets: 3, reps: '8-10', restSeconds: 120 },
      { exerciseId: 'ex_dumbbell_curl', sets: 2, reps: '10-12', restSeconds: 60 },
      { exerciseId: 'ex_tricep_pushdown', sets: 2, reps: '10-12', restSeconds: 60 },
      { exerciseId: 'ex_plank', sets: 3, reps: '30-60s', restSeconds: 60 },
    ],
  },

  // ============== UPPER BODY ==============
  {
    id: 'template_upper',
    name: 'Upper Body',
    description: 'Complete upper body push and pull workout',
    type: 'upper',
    difficulty: 'intermediate',
    duration: '60-75 min',
    muscleGroups: ['chest', 'back', 'shoulders', 'arms'],
    isDefault: true,
    exercises: [
      { exerciseId: 'ex_bench_press', sets: 4, reps: '6-8', restSeconds: 180 },
      { exerciseId: 'ex_barbell_row', sets: 4, reps: '6-8', restSeconds: 120 },
      { exerciseId: 'ex_dumbbell_shoulder_press', sets: 3, reps: '8-10', restSeconds: 120 },
      { exerciseId: 'ex_lat_pulldown', sets: 3, reps: '10-12', restSeconds: 90 },
      { exerciseId: 'ex_incline_dumbbell_press', sets: 3, reps: '10-12', restSeconds: 90 },
      { exerciseId: 'ex_dumbbell_row', sets: 3, reps: '10-12', restSeconds: 60 },
      { exerciseId: 'ex_lateral_raise', sets: 3, reps: '12-15', restSeconds: 60 },
      { exerciseId: 'ex_barbell_curl', sets: 2, reps: '10-12', restSeconds: 60 },
      { exerciseId: 'ex_tricep_pushdown', sets: 2, reps: '10-12', restSeconds: 60 },
    ],
  },

  // ============== LOWER BODY ==============
  {
    id: 'template_lower',
    name: 'Lower Body',
    description: 'Complete leg day with emphasis on compound movements',
    type: 'lower',
    difficulty: 'intermediate',
    duration: '60-75 min',
    muscleGroups: ['legs', 'glutes', 'hamstrings', 'calves', 'core'],
    isDefault: true,
    exercises: [
      { exerciseId: 'ex_squat', sets: 4, reps: '6-8', restSeconds: 180 },
      { exerciseId: 'ex_deadlift', sets: 4, reps: '5', restSeconds: 180 },
      { exerciseId: 'ex_bulgarian_split_squat', sets: 3, reps: '10-12', restSeconds: 90 },
      { exerciseId: 'ex_leg_curl', sets: 3, reps: '10-12', restSeconds: 60 },
      { exerciseId: 'ex_leg_extension', sets: 3, reps: '12-15', restSeconds: 60 },
      { exerciseId: 'ex_hip_thrust', sets: 3, reps: '10-12', restSeconds: 90 },
      { exerciseId: 'ex_calf_raise', sets: 4, reps: '15-20', restSeconds: 60 },
    ],
  },

  // ============== ARMS ==============
  {
    id: 'template_arms',
    name: 'Arms Day',
    description: 'Dedicated biceps and triceps workout for arm growth',
    type: 'arms',
    difficulty: 'intermediate',
    duration: '45-60 min',
    muscleGroups: ['biceps', 'triceps', 'forearms'],
    isDefault: true,
    exercises: [
      { exerciseId: 'ex_close_grip_bench', sets: 3, reps: '8-10', restSeconds: 120 },
      { exerciseId: 'ex_barbell_curl', sets: 3, reps: '8-10', restSeconds: 90 },
      { exerciseId: 'ex_tricep_pushdown', sets: 3, reps: '10-12', restSeconds: 60 },
      { exerciseId: 'ex_incline_curl', sets: 3, reps: '10-12', restSeconds: 60 },
      { exerciseId: 'ex_overhead_tricep_extension', sets: 3, reps: '10-12', restSeconds: 60 },
      { exerciseId: 'ex_hammer_curl', sets: 3, reps: '10-12', restSeconds: 60 },
      { exerciseId: 'ex_skullcrusher', sets: 3, reps: '10-12', restSeconds: 60 },
      { exerciseId: 'ex_concentration_curl', sets: 2, reps: '12-15', restSeconds: 45 },
    ],
  },

  // ============== BEGINNER PROGRAMS ==============
  {
    id: 'template_beginner_full',
    name: 'Beginner Full Body',
    description: 'Perfect for those new to the gym. Focus on compound movements.',
    type: 'full',
    difficulty: 'beginner',
    duration: '45-60 min',
    muscleGroups: ['chest', 'back', 'legs', 'shoulders'],
    isDefault: true,
    exercises: [
      { exerciseId: 'ex_goblet_squat', sets: 3, reps: '10-12', restSeconds: 90, notes: 'Focus on form' },
      { exerciseId: 'ex_dumbbell_press', sets: 3, reps: '10-12', restSeconds: 90 },
      { exerciseId: 'ex_lat_pulldown', sets: 3, reps: '10-12', restSeconds: 90 },
      { exerciseId: 'ex_dumbbell_shoulder_press', sets: 3, reps: '10-12', restSeconds: 90 },
      { exerciseId: 'ex_leg_press', sets: 3, reps: '10-12', restSeconds: 90 },
      { exerciseId: 'ex_dumbbell_row', sets: 3, reps: '10-12', restSeconds: 60 },
      { exerciseId: 'ex_plank', sets: 3, reps: '20-30s', restSeconds: 60 },
    ],
  },

  {
    id: 'template_beginner_upper',
    name: 'Beginner Upper Body',
    description: 'Introduction to upper body training with machines and dumbbells',
    type: 'upper',
    difficulty: 'beginner',
    duration: '40-50 min',
    muscleGroups: ['chest', 'back', 'shoulders', 'arms'],
    isDefault: true,
    exercises: [
      { exerciseId: 'ex_machine_chest_press', sets: 3, reps: '12-15', restSeconds: 90 },
      { exerciseId: 'ex_lat_pulldown', sets: 3, reps: '12-15', restSeconds: 90 },
      { exerciseId: 'ex_dumbbell_shoulder_press', sets: 3, reps: '12-15', restSeconds: 90 },
      { exerciseId: 'ex_seated_cable_row', sets: 3, reps: '12-15', restSeconds: 90 },
      { exerciseId: 'ex_lateral_raise', sets: 2, reps: '12-15', restSeconds: 60 },
      { exerciseId: 'ex_dumbbell_curl', sets: 2, reps: '12-15', restSeconds: 60 },
      { exerciseId: 'ex_tricep_pushdown', sets: 2, reps: '12-15', restSeconds: 60 },
    ],
  },

  {
    id: 'template_beginner_lower',
    name: 'Beginner Lower Body',
    description: 'Build a foundation with leg machines and basic movements',
    type: 'lower',
    difficulty: 'beginner',
    duration: '40-50 min',
    muscleGroups: ['legs', 'glutes', 'calves'],
    isDefault: true,
    exercises: [
      { exerciseId: 'ex_leg_press', sets: 3, reps: '12-15', restSeconds: 90 },
      { exerciseId: 'ex_goblet_squat', sets: 3, reps: '12-15', restSeconds: 90 },
      { exerciseId: 'ex_leg_curl', sets: 3, reps: '12-15', restSeconds: 60 },
      { exerciseId: 'ex_leg_extension', sets: 3, reps: '12-15', restSeconds: 60 },
      { exerciseId: 'ex_glute_bridge', sets: 3, reps: '15-20', restSeconds: 60 },
      { exerciseId: 'ex_calf_raise', sets: 3, reps: '15-20', restSeconds: 60 },
    ],
  },

  // ============== ADVANCED PROGRAMS ==============
  {
    id: 'template_strength_push',
    name: 'Strength Push',
    description: 'Heavy compound movements with low reps for maximum strength',
    type: 'push',
    difficulty: 'advanced',
    duration: '75-90 min',
    muscleGroups: ['chest', 'shoulders', 'triceps'],
    isDefault: true,
    exercises: [
      { exerciseId: 'ex_bench_press', sets: 5, reps: '3-5', restSeconds: 240, notes: 'Heavy - work up to top set' },
      { exerciseId: 'ex_overhead_press', sets: 4, reps: '4-6', restSeconds: 180 },
      { exerciseId: 'ex_incline_bench', sets: 4, reps: '6-8', restSeconds: 150 },
      { exerciseId: 'ex_dumbbell_shoulder_press', sets: 3, reps: '8-10', restSeconds: 120 },
      { exerciseId: 'ex_close_grip_bench', sets: 3, reps: '8-10', restSeconds: 120 },
      { exerciseId: 'ex_lateral_raise', sets: 4, reps: '12-15', restSeconds: 60 },
      { exerciseId: 'ex_tricep_pushdown', sets: 3, reps: '10-12', restSeconds: 60 },
    ],
  },

  {
    id: 'template_strength_pull',
    name: 'Strength Pull',
    description: 'Build a powerful back with heavy rows and pulls',
    type: 'pull',
    difficulty: 'advanced',
    duration: '75-90 min',
    muscleGroups: ['back', 'biceps', 'traps'],
    isDefault: true,
    exercises: [
      { exerciseId: 'ex_deadlift', sets: 5, reps: '3-5', restSeconds: 240, notes: 'Work up to heavy single or triple' },
      { exerciseId: 'ex_barbell_row', sets: 4, reps: '5-6', restSeconds: 180 },
      { exerciseId: 'ex_pullup', sets: 4, reps: 'AMRAP', restSeconds: 120, notes: 'Add weight if needed' },
      { exerciseId: 'ex_tbar_row', sets: 3, reps: '8-10', restSeconds: 120 },
      { exerciseId: 'ex_lat_pulldown', sets: 3, reps: '10-12', restSeconds: 90 },
      { exerciseId: 'ex_face_pull', sets: 3, reps: '15-20', restSeconds: 60 },
      { exerciseId: 'ex_barbell_curl', sets: 3, reps: '8-10', restSeconds: 60 },
    ],
  },

  {
    id: 'template_strength_legs',
    name: 'Strength Legs',
    description: 'Heavy squats and deadlifts for maximum leg development',
    type: 'legs',
    difficulty: 'advanced',
    duration: '75-90 min',
    muscleGroups: ['legs', 'glutes', 'hamstrings', 'core'],
    isDefault: true,
    exercises: [
      { exerciseId: 'ex_squat', sets: 5, reps: '3-5', restSeconds: 240, notes: 'Work up to heavy set' },
      { exerciseId: 'ex_romanian_deadlift', sets: 4, reps: '6-8', restSeconds: 180 },
      { exerciseId: 'ex_front_squat', sets: 3, reps: '6-8', restSeconds: 180 },
      { exerciseId: 'ex_bulgarian_split_squat', sets: 3, reps: '8-10', restSeconds: 120 },
      { exerciseId: 'ex_leg_curl', sets: 4, reps: '10-12', restSeconds: 90 },
      { exerciseId: 'ex_hip_thrust', sets: 3, reps: '8-10', restSeconds: 90 },
      { exerciseId: 'ex_calf_raise', sets: 4, reps: '12-15', restSeconds: 60 },
    ],
  },

  // ============== HYPERTROPHY PROGRAMS ==============
  {
    id: 'template_hypertrophy_chest',
    name: 'Chest Hypertrophy',
    description: 'High volume chest workout for maximum muscle growth',
    type: 'push',
    difficulty: 'intermediate',
    duration: '60-75 min',
    muscleGroups: ['chest'],
    isDefault: true,
    exercises: [
      { exerciseId: 'ex_bench_press', sets: 4, reps: '8-10', restSeconds: 120 },
      { exerciseId: 'ex_incline_dumbbell_press', sets: 4, reps: '10-12', restSeconds: 90 },
      { exerciseId: 'ex_decline_bench', sets: 3, reps: '10-12', restSeconds: 90 },
      { exerciseId: 'ex_chest_fly', sets: 3, reps: '12-15', restSeconds: 60 },
      { exerciseId: 'ex_cable_crossover', sets: 3, reps: '12-15', restSeconds: 60 },
      { exerciseId: 'ex_pec_deck', sets: 3, reps: '15-20', restSeconds: 60 },
      { exerciseId: 'ex_pushup', sets: 2, reps: 'AMRAP', restSeconds: 60, notes: 'Burnout set' },
    ],
  },

  {
    id: 'template_hypertrophy_back',
    name: 'Back Hypertrophy',
    description: 'Build a wide, thick back with high volume training',
    type: 'pull',
    difficulty: 'intermediate',
    duration: '60-75 min',
    muscleGroups: ['back', 'traps'],
    isDefault: true,
    exercises: [
      { exerciseId: 'ex_lat_pulldown', sets: 4, reps: '10-12', restSeconds: 90 },
      { exerciseId: 'ex_barbell_row', sets: 4, reps: '8-10', restSeconds: 120 },
      { exerciseId: 'ex_seated_cable_row', sets: 3, reps: '10-12', restSeconds: 90 },
      { exerciseId: 'ex_close_grip_pulldown', sets: 3, reps: '10-12', restSeconds: 90 },
      { exerciseId: 'ex_dumbbell_row', sets: 3, reps: '10-12', restSeconds: 60 },
      { exerciseId: 'ex_straight_arm_pulldown', sets: 3, reps: '12-15', restSeconds: 60 },
      { exerciseId: 'ex_dumbbell_shrug', sets: 4, reps: '12-15', restSeconds: 60 },
    ],
  },

  // ============== QUICK WORKOUTS ==============
  {
    id: 'template_quick_full',
    name: 'Quick Full Body',
    description: 'Get a complete workout in 30 minutes',
    type: 'full',
    difficulty: 'intermediate',
    duration: '30-35 min',
    muscleGroups: ['chest', 'back', 'legs', 'shoulders'],
    isDefault: true,
    exercises: [
      { exerciseId: 'ex_squat', sets: 3, reps: '10', restSeconds: 90 },
      { exerciseId: 'ex_bench_press', sets: 3, reps: '10', restSeconds: 90 },
      { exerciseId: 'ex_barbell_row', sets: 3, reps: '10', restSeconds: 90 },
      { exerciseId: 'ex_overhead_press', sets: 3, reps: '10', restSeconds: 90 },
      { exerciseId: 'ex_plank', sets: 2, reps: '45s', restSeconds: 45 },
    ],
  },

  {
    id: 'template_quick_upper',
    name: 'Quick Upper Body',
    description: 'Efficient upper body pump in under 30 minutes',
    type: 'upper',
    difficulty: 'intermediate',
    duration: '25-30 min',
    muscleGroups: ['chest', 'back', 'shoulders'],
    isDefault: true,
    exercises: [
      { exerciseId: 'ex_bench_press', sets: 3, reps: '10', restSeconds: 90 },
      { exerciseId: 'ex_barbell_row', sets: 3, reps: '10', restSeconds: 90 },
      { exerciseId: 'ex_dumbbell_shoulder_press', sets: 3, reps: '10', restSeconds: 90 },
      { exerciseId: 'ex_lat_pulldown', sets: 3, reps: '10', restSeconds: 60 },
      { exerciseId: 'ex_dumbbell_curl', sets: 2, reps: '10', restSeconds: 45 },
      { exerciseId: 'ex_tricep_pushdown', sets: 2, reps: '10', restSeconds: 45 },
    ],
  },

  // ============== SPECIALTY WORKOUTS ==============
  {
    id: 'template_core_blast',
    name: 'Core Blast',
    description: 'Intense core workout for a stronger midsection',
    type: 'custom',
    difficulty: 'intermediate',
    duration: '20-30 min',
    muscleGroups: ['core', 'obliques'],
    isDefault: true,
    exercises: [
      { exerciseId: 'ex_plank', sets: 3, reps: '45-60s', restSeconds: 45 },
      { exerciseId: 'ex_hanging_leg_raise', sets: 3, reps: '10-15', restSeconds: 60, notes: 'Use lying leg raise if needed' },
      { exerciseId: 'ex_russian_twist', sets: 3, reps: '20 total', restSeconds: 45 },
      { exerciseId: 'ex_bicycle_crunch', sets: 3, reps: '20 total', restSeconds: 45 },
      { exerciseId: 'ex_side_plank', sets: 2, reps: '30s each side', restSeconds: 45 },
      { exerciseId: 'ex_dead_bug', sets: 3, reps: '10 each side', restSeconds: 45 },
      { exerciseId: 'ex_mountain_climber', sets: 2, reps: '30s', restSeconds: 30 },
    ],
  },

  {
    id: 'template_5x5',
    name: 'StrongLifts 5x5',
    description: 'Classic strength program - 5 sets of 5 reps on compound lifts',
    type: 'full',
    difficulty: 'beginner',
    duration: '45-60 min',
    muscleGroups: ['legs', 'chest', 'back', 'shoulders'],
    isDefault: true,
    exercises: [
      { exerciseId: 'ex_squat', sets: 5, reps: '5', restSeconds: 180, notes: 'Workout A & B' },
      { exerciseId: 'ex_bench_press', sets: 5, reps: '5', restSeconds: 180, notes: 'Workout A only' },
      { exerciseId: 'ex_barbell_row', sets: 5, reps: '5', restSeconds: 180, notes: 'Workout A only' },
    ],
  },

  {
    id: 'template_ppl_push_advanced',
    name: 'PPL Push (Advanced)',
    description: 'Advanced push day with high volume and intensity techniques',
    type: 'push',
    difficulty: 'advanced',
    duration: '75-90 min',
    muscleGroups: ['chest', 'shoulders', 'triceps'],
    isDefault: true,
    exercises: [
      { exerciseId: 'ex_bench_press', sets: 5, reps: '5,5,5,8,AMRAP', restSeconds: 180, notes: 'Reverse pyramid' },
      { exerciseId: 'ex_incline_dumbbell_press', sets: 4, reps: '8-12', restSeconds: 90 },
      { exerciseId: 'ex_arnold_press', sets: 4, reps: '10-12', restSeconds: 90 },
      { exerciseId: 'ex_cable_crossover', sets: 4, reps: '12-15', restSeconds: 60 },
      { exerciseId: 'ex_lateral_raise', sets: 4, reps: '12-15', restSeconds: 60 },
      { exerciseId: 'ex_rear_delt_fly', sets: 3, reps: '15-20', restSeconds: 45 },
      { exerciseId: 'ex_rope_pushdown', sets: 4, reps: '12-15', restSeconds: 60 },
      { exerciseId: 'ex_overhead_tricep_extension', sets: 3, reps: '12-15', restSeconds: 45 },
    ],
  },
];

export default DEFAULT_TEMPLATES;
