/**
 * Workout Store
 * Manages active workout state and history
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { WorkoutExercise, WorkoutSet, Exercise } from '../types';

export interface ActiveWorkout {
  id: string;
  name: string;
  templateId?: string;
  startedAt: number;
  exercises: WorkoutExerciseState[];
}

export interface WorkoutExerciseState {
  id: string;
  exerciseId: string;
  exercise: Exercise;
  orderIndex: number;
  sets: WorkoutSetState[];
  restSeconds: number;
  notes?: string;
  supersetWith?: string; // exercise id for superset
}

export interface WorkoutSetState {
  id: string;
  setNumber: number;
  weight: number | null;
  reps: number | null;
  rpe?: number;
  completed: boolean;
  completedAt?: number;
  isWarmup?: boolean;
  isDropSet?: boolean;
}

interface WorkoutState {
  activeWorkout: ActiveWorkout | null;
  restTimer: {
    isActive: boolean;
    duration: number;
    remaining: number;
    exerciseId?: string;
  };
  
  // Workout actions
  startWorkout: (name: string, templateId?: string) => string;
  endWorkout: () => ActiveWorkout | null;
  cancelWorkout: () => void;
  
  // Exercise actions
  addExercise: (exercise: Exercise, sets?: number) => void;
  removeExercise: (exerciseId: string) => void;
  reorderExercises: (fromIndex: number, toIndex: number) => void;
  setSuperset: (exerciseId1: string, exerciseId2: string) => void;
  removeSuperset: (exerciseId: string) => void;
  
  // Set actions
  addSet: (exerciseId: string, copyPrevious?: boolean) => void;
  removeSet: (exerciseId: string, setId: string) => void;
  updateSet: (exerciseId: string, setId: string, updates: Partial<WorkoutSetState>) => void;
  completeSet: (exerciseId: string, setId: string) => void;
  
  // Rest timer
  startRestTimer: (duration: number, exerciseId?: string) => void;
  pauseRestTimer: () => void;
  resetRestTimer: () => void;
  tickRestTimer: () => void;
  
  // Stats
  getTotalVolume: () => number;
  getCompletedSets: () => number;
  getWorkoutDuration: () => number;
}

export const useWorkoutStore = create<WorkoutState>()(
  persist(
    (set, get) => ({
      activeWorkout: null,
      restTimer: {
        isActive: false,
        duration: 90,
        remaining: 90,
      },

      startWorkout: (name, templateId) => {
        const id = `workout_${Date.now()}`;
        set({
          activeWorkout: {
            id,
            name,
            templateId,
            startedAt: Date.now(),
            exercises: [],
          },
        });
        return id;
      },

      endWorkout: () => {
        const workout = get().activeWorkout;
        set({ activeWorkout: null });
        return workout;
      },

      cancelWorkout: () => {
        set({ activeWorkout: null });
      },

      addExercise: (exercise, sets = 3) => {
        set((state) => {
          if (!state.activeWorkout) return state;

          const timestamp = Date.now();
          const exerciseIndex = state.activeWorkout.exercises.length;

          const newExercise: WorkoutExerciseState = {
            id: `we_${timestamp}_${exerciseIndex}_${Math.random().toString(36).substr(2, 9)}`,
            exerciseId: exercise.id,
            exercise,
            orderIndex: exerciseIndex,
            restSeconds: 90,
            sets: Array.from({ length: sets }, (_, i) => ({
              id: `set_${timestamp}_${exerciseIndex}_${i}_${Math.random().toString(36).substr(2, 9)}`,
              setNumber: i + 1,
              weight: null,
              reps: null,
              completed: false,
            })),
          };

          return {
            activeWorkout: {
              ...state.activeWorkout,
              exercises: [...state.activeWorkout.exercises, newExercise],
            },
          };
        });
      },

      removeExercise: (exerciseId) => {
        set((state) => {
          if (!state.activeWorkout) return state;
          return {
            activeWorkout: {
              ...state.activeWorkout,
              exercises: state.activeWorkout.exercises
                .filter(e => e.id !== exerciseId)
                .map((e, i) => ({ ...e, orderIndex: i })),
            },
          };
        });
      },

      reorderExercises: (fromIndex, toIndex) => {
        set((state) => {
          if (!state.activeWorkout) return state;
          
          const exercises = [...state.activeWorkout.exercises];
          const [removed] = exercises.splice(fromIndex, 1);
          exercises.splice(toIndex, 0, removed);
          
          return {
            activeWorkout: {
              ...state.activeWorkout,
              exercises: exercises.map((e, i) => ({ ...e, orderIndex: i })),
            },
          };
        });
      },

      setSuperset: (exerciseId1, exerciseId2) => {
        set((state) => {
          if (!state.activeWorkout) return state;
          return {
            activeWorkout: {
              ...state.activeWorkout,
              exercises: state.activeWorkout.exercises.map(e => {
                if (e.id === exerciseId1) return { ...e, supersetWith: exerciseId2 };
                if (e.id === exerciseId2) return { ...e, supersetWith: exerciseId1 };
                return e;
              }),
            },
          };
        });
      },

      removeSuperset: (exerciseId) => {
        set((state) => {
          if (!state.activeWorkout) return state;
          const exercise = state.activeWorkout.exercises.find(e => e.id === exerciseId);
          if (!exercise?.supersetWith) return state;
          
          return {
            activeWorkout: {
              ...state.activeWorkout,
              exercises: state.activeWorkout.exercises.map(e => {
                if (e.id === exerciseId || e.id === exercise.supersetWith) {
                  return { ...e, supersetWith: undefined };
                }
                return e;
              }),
            },
          };
        });
      },

      addSet: (exerciseId, copyPrevious = true) => {
        set((state) => {
          if (!state.activeWorkout) return state;

          return {
            activeWorkout: {
              ...state.activeWorkout,
              exercises: state.activeWorkout.exercises.map(e => {
                if (e.id !== exerciseId) return e;

                const lastSet = e.sets[e.sets.length - 1];
                const setNumber = e.sets.length + 1;
                const newSet: WorkoutSetState = {
                  id: `set_${Date.now()}_${exerciseId}_${setNumber}_${Math.random().toString(36).substr(2, 9)}`,
                  setNumber,
                  weight: copyPrevious ? lastSet?.weight ?? null : null,
                  reps: copyPrevious ? lastSet?.reps ?? null : null,
                  completed: false,
                };

                return { ...e, sets: [...e.sets, newSet] };
              }),
            },
          };
        });
      },

      removeSet: (exerciseId, setId) => {
        set((state) => {
          if (!state.activeWorkout) return state;
          
          return {
            activeWorkout: {
              ...state.activeWorkout,
              exercises: state.activeWorkout.exercises.map(e => {
                if (e.id !== exerciseId) return e;
                return {
                  ...e,
                  sets: e.sets
                    .filter(s => s.id !== setId)
                    .map((s, i) => ({ ...s, setNumber: i + 1 })),
                };
              }),
            },
          };
        });
      },

      updateSet: (exerciseId, setId, updates) => {
        set((state) => {
          if (!state.activeWorkout) return state;
          
          return {
            activeWorkout: {
              ...state.activeWorkout,
              exercises: state.activeWorkout.exercises.map(e => {
                if (e.id !== exerciseId) return e;
                return {
                  ...e,
                  sets: e.sets.map(s =>
                    s.id === setId ? { ...s, ...updates } : s
                  ),
                };
              }),
            },
          };
        });
      },

      completeSet: (exerciseId, setId) => {
        set((state) => {
          if (!state.activeWorkout) return state;
          
          return {
            activeWorkout: {
              ...state.activeWorkout,
              exercises: state.activeWorkout.exercises.map(e => {
                if (e.id !== exerciseId) return e;
                return {
                  ...e,
                  sets: e.sets.map(s =>
                    s.id === setId
                      ? { ...s, completed: !s.completed, completedAt: !s.completed ? Date.now() : undefined }
                      : s
                  ),
                };
              }),
            },
          };
        });
      },

      startRestTimer: (duration, exerciseId) => {
        set({
          restTimer: {
            isActive: true,
            duration,
            remaining: duration,
            exerciseId,
          },
        });
      },

      pauseRestTimer: () => {
        set((state) => ({
          restTimer: { ...state.restTimer, isActive: false },
        }));
      },

      resetRestTimer: () => {
        set((state) => ({
          restTimer: {
            ...state.restTimer,
            isActive: false,
            remaining: state.restTimer.duration,
          },
        }));
      },

      tickRestTimer: () => {
        set((state) => {
          if (!state.restTimer.isActive || state.restTimer.remaining <= 0) {
            return { restTimer: { ...state.restTimer, isActive: false } };
          }
          return {
            restTimer: {
              ...state.restTimer,
              remaining: state.restTimer.remaining - 1,
            },
          };
        });
      },

      getTotalVolume: () => {
        const workout = get().activeWorkout;
        if (!workout) return 0;
        
        return workout.exercises.reduce((total, exercise) => {
          return total + exercise.sets.reduce((setTotal, set) => {
            if (set.completed && set.weight && set.reps) {
              return setTotal + (set.weight * set.reps);
            }
            return setTotal;
          }, 0);
        }, 0);
      },

      getCompletedSets: () => {
        const workout = get().activeWorkout;
        if (!workout) return 0;
        
        return workout.exercises.reduce((total, exercise) => {
          return total + exercise.sets.filter(s => s.completed).length;
        }, 0);
      },

      getWorkoutDuration: () => {
        const workout = get().activeWorkout;
        if (!workout) return 0;
        return Math.floor((Date.now() - workout.startedAt) / 1000);
      },
    }),
    {
      name: 'active-workout',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        activeWorkout: state.activeWorkout,
      }),
    }
  )
);

export default useWorkoutStore;

