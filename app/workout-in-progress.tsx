import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  Modal,
  Vibration,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { Theme, Button, Card } from '../src/ui';
import { db } from '../src/services/database';
import { formatDuration } from '../src/utils/formatting';
import { usePreferencesStore } from '../src/store/preferencesStore';
import { useTemplateStore } from '../src/store/templateStore';
import { useWorkoutStore, WorkoutExerciseState } from '../src/store/workoutStore';

export default function WorkoutInProgressScreen() {
  const params = useLocalSearchParams();
  const templateId = params.templateId as string | undefined;

  const [elapsedTime, setElapsedTime] = useState(0);
  const [showRestTimer, setShowRestTimer] = useState(false);
  const [restTimeRemaining, setRestTimeRemaining] = useState(0);
  const [isRestTimerActive, setIsRestTimerActive] = useState(false);
  const [showAddNote, setShowAddNote] = useState<string | null>(null);
  const [noteText, setNoteText] = useState('');
  
  const restTimerInterval = useRef<NodeJS.Timeout | null>(null);
  const { preferences } = usePreferencesStore();
  const { getTemplateById } = useTemplateStore();
  const {
    activeWorkout,
    startWorkout,
    cancelWorkout,
    addSet,
    removeSet,
    updateSet,
    completeSet,
    removeExercise,
    getCompletedSets,
  } = useWorkoutStore();

  // Start workout on mount - only if there's a templateId and no active workout
  useEffect(() => {
    if (!activeWorkout && templateId) {
      loadAndStartWorkout();
    }
  }, []);

  // Elapsed time timer
  useEffect(() => {
    const startTime = activeWorkout?.startedAt || Date.now();
    const interval = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [activeWorkout?.startedAt]);

  // Rest timer effect
  useEffect(() => {
    if (isRestTimerActive && restTimeRemaining > 0) {
      restTimerInterval.current = setInterval(() => {
        setRestTimeRemaining(prev => {
          if (prev <= 1) {
            setIsRestTimerActive(false);
            setShowRestTimer(false);
            if (preferences.restTimerVibrate) {
              Vibration.vibrate([0, 500, 200, 500]);
            }
            if (preferences.hapticFeedback) {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (restTimerInterval.current) {
        clearInterval(restTimerInterval.current);
      }
    };
  }, [isRestTimerActive, restTimeRemaining]);

  const loadAndStartWorkout = async () => {
    try {
      if (templateId) {
        const template = getTemplateById(templateId);
        if (template) {
          const workoutId = startWorkout(template.name, templateId);
          
          // Load template exercises
          const allExercises = await db.getAllExercises();
          const { addExercise } = useWorkoutStore.getState();
          
          for (const tex of template.exercises) {
            const exercise = allExercises.find(e => e.id === tex.exerciseId);
            if (exercise) {
              addExercise(exercise, tex.sets);
            }
          }
          return;
        }
      }
      
      startWorkout('Quick Workout');
    } catch (error) {
      console.error('Error loading workout:', error);
    }
  };

  const handleAddExercise = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/exercise-library' as any);
  };

  const handleAddSet = (exerciseId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    addSet(exerciseId, true);
  };

  const handleRemoveSet = (exerciseId: string, setId: string) => {
    removeSet(exerciseId, setId);
  };

  const handleSetComplete = (exerciseId: string, setId: string) => {
    const exercise = activeWorkout?.exercises.find(e => e.id === exerciseId);
    const set = exercise?.sets.find(s => s.id === setId);
    
    if (!set?.completed) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      
      // Start rest timer automatically if enabled
      if (preferences.autoStartRestTimer && exercise) {
        setRestTimeRemaining(exercise.restSeconds || preferences.defaultRestTimer);
        setIsRestTimerActive(true);
        setShowRestTimer(true);
      }
    } else {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    completeSet(exerciseId, setId);
  };

  const handleUpdateSet = (exerciseId: string, setId: string, field: 'weight' | 'reps', value: string) => {
    const numValue = field === 'weight' ? parseFloat(value) || null : parseInt(value) || null;
    updateSet(exerciseId, setId, { [field]: numValue });
  };

  const handleRemoveExercise = (exerciseId: string) => {
    Alert.alert(
      'Remove Exercise',
      'Are you sure you want to remove this exercise?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            removeExercise(exerciseId);
          },
        },
      ]
    );
  };

  const handleSaveNote = (exerciseId: string) => {
    // Update exercise notes in the store
    const { activeWorkout } = useWorkoutStore.getState();
    if (activeWorkout) {
      useWorkoutStore.setState({
        activeWorkout: {
          ...activeWorkout,
          exercises: activeWorkout.exercises.map(e =>
            e.id === exerciseId ? { ...e, notes: noteText } : e
          ),
        },
      });
    }
    setShowAddNote(null);
    setNoteText('');
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleStartRestTimer = (duration?: number) => {
    const time = duration || preferences.defaultRestTimer;
    setRestTimeRemaining(time);
    setIsRestTimerActive(true);
    setShowRestTimer(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleAdjustRestTimer = (seconds: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setRestTimeRemaining(prev => Math.max(0, prev + seconds));
  };

  const handleSkipRestTimer = () => {
    setIsRestTimerActive(false);
    setShowRestTimer(false);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleFinishWorkout = async () => {
    if (!activeWorkout || activeWorkout.exercises.length === 0) {
      Alert.alert(
        'No Exercises Added',
        'Add at least one exercise to finish your workout.',
        [{ text: 'OK' }]
      );
      return;
    }

    const completedSets = getCompletedSets();

    if (completedSets === 0) {
      Alert.alert(
        'No Sets Completed',
        'Complete at least one set to finish your workout.',
        [{ text: 'OK' }]
      );
      return;
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    try {
      let totalSets = 0;
      let totalVolume = 0;

      // Calculate totals
      activeWorkout.exercises.forEach(exercise => {
        exercise.sets.forEach(set => {
          if (set.completed) {
            totalSets++;
            if (set.weight && set.reps) {
              totalVolume += set.weight * set.reps;
            }
          }
        });
      });

      console.log('💾 Saving workout:', {
        id: activeWorkout.id,
        name: activeWorkout.name,
        totalSets,
        totalVolume,
        exercises: activeWorkout.exercises.length
      });

      // Save workout header
      await db.saveWorkout({
        id: activeWorkout.id,
        name: activeWorkout.name || 'Quick Workout',
        startedAt: activeWorkout.startedAt,
        completedAt: Date.now(),
        duration: elapsedTime,
        totalVolume,
        totalSets,
      });
      console.log('✅ Workout header saved');

      // Save each exercise and its sets
      for (let i = 0; i < activeWorkout.exercises.length; i++) {
        const exercise = activeWorkout.exercises[i];
        const workoutExerciseId = await db.saveWorkoutExercise(
          activeWorkout.id,
          exercise.exerciseId,
          i,
          exercise.notes
        );
        console.log(`✅ Exercise ${i + 1} saved: ${exercise.exercise?.name}`);

        // Save each set for this exercise
        let completedSetsCount = 0;
        for (const set of exercise.sets) {
          if (set.completed) {
            await db.saveWorkoutSet(
              workoutExerciseId,
              set.setNumber,
              set.weight,
              set.reps,
              set.completed,
              set.completedAt
            );
            completedSetsCount++;
          }
        }
        console.log(`  → ${completedSetsCount} sets saved`);
      }

      console.log('✅ All workout data saved successfully!');

      const { endWorkout } = useWorkoutStore.getState();
      endWorkout();

      router.replace(`/workout-complete?id=${activeWorkout.id}&sets=${totalSets}&duration=${elapsedTime}` as any);
    } catch (error) {
      console.error('❌ Error finishing workout:', error);
      Alert.alert('Error', 'Failed to save workout. Please try again.');
    }
  };

  const handleCancelWorkout = () => {
    Alert.alert(
      'Cancel Workout?',
      'Your progress will be lost.',
      [
        { text: 'Keep Going', style: 'cancel' },
        {
          text: 'Cancel Workout',
          style: 'destructive',
          onPress: () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            cancelWorkout();
            router.back();
          },
        },
      ]
    );
  };

  const renderRestTimerModal = () => (
    <Modal
      visible={showRestTimer}
      animationType="fade"
      transparent
      onRequestClose={handleSkipRestTimer}
    >
      <View style={styles.restTimerOverlay}>
        <Animated.View entering={FadeIn.duration(200)} style={styles.restTimerModal}>
          <Text style={styles.restTimerLabel}>Rest Timer</Text>
          <Text style={styles.restTimerTime}>{formatDuration(restTimeRemaining)}</Text>
          
          <View style={styles.restTimerProgress}>
            <View 
              style={[
                styles.restTimerProgressBar,
                { width: `${(restTimeRemaining / preferences.defaultRestTimer) * 100}%` }
              ]} 
            />
          </View>

          <View style={styles.restTimerControls}>
            <TouchableOpacity
              style={styles.restTimerButton}
              onPress={() => handleAdjustRestTimer(-15)}
            >
              <Text style={styles.restTimerButtonText}>-15s</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.restTimerButton}
              onPress={() => handleAdjustRestTimer(15)}
            >
              <Text style={styles.restTimerButtonText}>+15s</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.skipButton}
            onPress={handleSkipRestTimer}
          >
            <Text style={styles.skipButtonText}>Skip Rest</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );

  const renderNoteModal = () => (
    <Modal
      visible={showAddNote !== null}
      animationType="slide"
      transparent
      onRequestClose={() => setShowAddNote(null)}
    >
      <View style={styles.noteModalOverlay}>
        <View style={styles.noteModalContent}>
          <View style={styles.noteModalHeader}>
            <TouchableOpacity onPress={() => setShowAddNote(null)}>
              <Ionicons name="close" size={24} color={Theme.colors.text.primary} />
            </TouchableOpacity>
            <Text style={styles.noteModalTitle}>Exercise Note</Text>
            <TouchableOpacity onPress={() => showAddNote && handleSaveNote(showAddNote)}>
              <Ionicons name="checkmark" size={24} color={Theme.colors.success[500]} />
            </TouchableOpacity>
          </View>
          <TextInput
            style={styles.noteInput}
            placeholder="Add a note for this exercise..."
            placeholderTextColor={Theme.colors.text.tertiary}
            value={noteText}
            onChangeText={setNoteText}
            multiline
            autoFocus
          />
        </View>
      </View>
    </Modal>
  );

  const exercises = activeWorkout?.exercises || [];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleCancelWorkout} style={styles.headerButton}>
          <Ionicons name="close" size={24} color={Theme.colors.text.primary} />
        </TouchableOpacity>
        
        <View style={styles.headerCenter}>
          <Text style={styles.workoutName}>{activeWorkout?.name || 'Workout'}</Text>
          <View style={styles.timerContainer}>
            <Ionicons name="time-outline" size={16} color={Theme.colors.primary[500]} />
            <Text style={styles.timerText}>{formatDuration(elapsedTime)}</Text>
          </View>
        </View>

        <TouchableOpacity onPress={handleFinishWorkout} style={styles.headerButton}>
          <Ionicons name="checkmark" size={24} color={Theme.colors.success[500]} />
        </TouchableOpacity>
      </View>

      {/* Quick Stats Bar */}
      <View style={styles.statsBar}>
        <View style={styles.statItem}>
          <Ionicons name="checkmark-circle-outline" size={16} color={Theme.colors.text.tertiary} />
          <Text style={styles.statValue}>{getCompletedSets()} sets</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Ionicons name="barbell-outline" size={16} color={Theme.colors.text.tertiary} />
          <Text style={styles.statValue}>{exercises.length} exercises</Text>
        </View>
        <View style={styles.statDivider} />
        <TouchableOpacity style={styles.statItem} onPress={() => handleStartRestTimer()}>
          <Ionicons name="timer-outline" size={16} color={Theme.colors.primary[500]} />
          <Text style={[styles.statValue, { color: Theme.colors.primary[500] }]}>Rest Timer</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.content}>
        {/* Exercises List */}
        {exercises.length === 0 ? (
          <Animated.View entering={FadeInDown.duration(400)} style={styles.emptyContainer}>
            <Card style={styles.emptyCard}>
              <Ionicons name="barbell-outline" size={64} color={Theme.colors.text.tertiary} />
              <Text style={styles.emptyTitle}>No exercises yet</Text>
              <Text style={styles.emptySubtitle}>Tap the button below to add your first exercise</Text>
            </Card>
          </Animated.View>
        ) : (
          exercises.map((exercise, index) => (
            <Animated.View
              key={exercise.id}
              entering={FadeInDown.duration(400).delay(index * 100)}
              style={styles.exerciseContainer}
            >
              <Card style={styles.exerciseCard}>
                <View style={styles.exerciseHeader}>
                  <View style={styles.exerciseNumber}>
                    <Text style={styles.exerciseNumberText}>{index + 1}</Text>
                  </View>
                  <Text style={styles.exerciseName}>
                    {exercise.exercise?.name || exercise.exerciseId.replace('ex_', '').replace(/_/g, ' ')}
                  </Text>
                  <TouchableOpacity
                    onPress={() => {
                      setNoteText(exercise.notes || '');
                      setShowAddNote(exercise.id);
                    }}
                    style={styles.noteButton}
                  >
                    <Ionicons 
                      name={exercise.notes ? "document-text" : "document-text-outline"} 
                      size={20} 
                      color={exercise.notes ? Theme.colors.primary[500] : Theme.colors.text.tertiary} 
                    />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleRemoveExercise(exercise.id)}>
                    <Ionicons name="trash-outline" size={20} color={Theme.colors.error[500]} />
                  </TouchableOpacity>
                </View>

                {exercise.notes && (
                  <Text style={styles.exerciseNote}>{exercise.notes}</Text>
                )}

                {/* Sets Table Header */}
                <View style={styles.tableHeader}>
                  <Text style={[styles.tableHeaderText, { flex: 0.8 }]}>SET</Text>
                  <Text style={[styles.tableHeaderText, { flex: 1.5 }]}>WEIGHT</Text>
                  <Text style={[styles.tableHeaderText, { flex: 1.5 }]}>REPS</Text>
                  <View style={{ width: 44 }} />
                </View>

                {/* Sets */}
                {exercise.sets.map((set) => (
                  <View key={set.id} style={styles.setRow}>
                    <View style={[styles.setNumberContainer, { flex: 0.8 }]}>
                      <Text style={[styles.setNumber, set.isWarmup && styles.warmupText]}>
                        {set.isWarmup ? 'W' : set.setNumber}
                      </Text>
                    </View>
                    
                    <TextInput
                      style={[styles.setInput, { flex: 1.5 }, set.completed && styles.setInputCompleted]}
                      value={set.weight?.toString() || ''}
                      onChangeText={(text) => handleUpdateSet(exercise.id, set.id, 'weight', text)}
                      keyboardType="decimal-pad"
                      placeholder="0"
                      placeholderTextColor={Theme.colors.text.tertiary}
                    />

                    <TextInput
                      style={[styles.setInput, { flex: 1.5 }, set.completed && styles.setInputCompleted]}
                      value={set.reps?.toString() || ''}
                      onChangeText={(text) => handleUpdateSet(exercise.id, set.id, 'reps', text)}
                      keyboardType="number-pad"
                      placeholder="0"
                      placeholderTextColor={Theme.colors.text.tertiary}
                    />

                    <TouchableOpacity
                      onPress={() => handleSetComplete(exercise.id, set.id)}
                      style={[styles.checkButton, set.completed && styles.checkButtonComplete]}
                    >
                      {set.completed && (
                        <Ionicons name="checkmark" size={20} color="#fff" />
                      )}
                    </TouchableOpacity>
                  </View>
                ))}

                {/* Add Set Button */}
                <TouchableOpacity
                  onPress={() => handleAddSet(exercise.id)}
                  style={styles.addSetButton}
                >
                  <Ionicons name="add" size={20} color={Theme.colors.primary[500]} />
                  <Text style={styles.addSetText}>Add Set</Text>
                </TouchableOpacity>
              </Card>
            </Animated.View>
          ))
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Add Exercise FAB */}
      <TouchableOpacity
        onPress={handleAddExercise}
        style={styles.fab}
        activeOpacity={0.9}
      >
        <LinearGradient
          colors={Theme.gradients.primary}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.fabGradient}
        >
          <Ionicons name="add" size={32} color="#fff" />
        </LinearGradient>
      </TouchableOpacity>

      {renderRestTimerModal()}
      {renderNoteModal()}
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
    paddingHorizontal: Theme.spacing.base,
    paddingVertical: Theme.spacing.sm,
    backgroundColor: Theme.colors.background.secondary,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  workoutName: {
    fontSize: Theme.typography.sizes.lg,
    fontWeight: Theme.typography.weights.bold,
    color: Theme.colors.text.primary,
    marginBottom: 4,
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timerText: {
    fontSize: Theme.typography.sizes.sm,
    fontWeight: Theme.typography.weights.semibold,
    color: Theme.colors.primary[500],
  },
  statsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Theme.spacing.sm,
    paddingHorizontal: Theme.spacing.xl,
    backgroundColor: Theme.colors.background.secondary,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.divider,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: Theme.spacing.base,
  },
  statValue: {
    fontSize: Theme.typography.sizes.sm,
    fontWeight: Theme.typography.weights.semibold,
    color: Theme.colors.text.secondary,
  },
  statDivider: {
    width: 1,
    height: 16,
    backgroundColor: Theme.colors.divider,
  },
  content: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    paddingHorizontal: Theme.spacing.xl,
    paddingTop: Theme.spacing['2xl'],
  },
  emptyCard: {
    padding: Theme.spacing['2xl'],
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: Theme.typography.sizes.xl,
    fontWeight: Theme.typography.weights.bold,
    color: Theme.colors.text.primary,
    marginTop: Theme.spacing.base,
  },
  emptySubtitle: {
    fontSize: Theme.typography.sizes.base,
    fontWeight: Theme.typography.weights.regular,
    color: Theme.colors.text.tertiary,
    marginTop: Theme.spacing.xs,
    textAlign: 'center',
  },
  exerciseContainer: {
    paddingHorizontal: Theme.spacing.xl,
    marginTop: Theme.spacing.lg,
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
    textTransform: 'capitalize',
  },
  noteButton: {
    padding: 4,
  },
  exerciseNote: {
    fontSize: Theme.typography.sizes.sm,
    fontWeight: Theme.typography.weights.regular,
    color: Theme.colors.text.tertiary,
    fontStyle: 'italic',
    marginBottom: Theme.spacing.sm,
    paddingLeft: 40,
  },
  tableHeader: {
    flexDirection: 'row',
    paddingVertical: Theme.spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.background.tertiary,
    marginBottom: Theme.spacing.xs,
    gap: Theme.spacing.sm,
  },
  tableHeaderText: {
    fontSize: Theme.typography.sizes.xs,
    fontWeight: Theme.typography.weights.bold,
    color: Theme.colors.text.tertiary,
    textAlign: 'center',
  },
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Theme.spacing.sm,
    gap: Theme.spacing.sm,
  },
  setNumberContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  setNumber: {
    fontSize: Theme.typography.sizes.base,
    fontWeight: Theme.typography.weights.semibold,
    color: Theme.colors.text.secondary,
    textAlign: 'center',
  },
  warmupText: {
    color: Theme.colors.warning[500],
  },
  setInput: {
    backgroundColor: Theme.colors.background.secondary,
    borderRadius: Theme.borderRadius.md,
    padding: Theme.spacing.sm,
    fontSize: Theme.typography.sizes.base,
    color: Theme.colors.text.primary,
    textAlign: 'center',
    fontWeight: Theme.typography.weights.medium,
  },
  setInputCompleted: {
    backgroundColor: Theme.colors.success[500] + '20',
  },
  checkButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: Theme.colors.text.tertiary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkButtonComplete: {
    backgroundColor: Theme.colors.success[500],
    borderColor: Theme.colors.success[500],
  },
  addSetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Theme.spacing.base,
    marginTop: Theme.spacing.xs,
    gap: 4,
  },
  addSetText: {
    fontSize: Theme.typography.sizes.base,
    fontWeight: Theme.typography.weights.semibold,
    color: Theme.colors.primary[500],
  },
  fab: {
    position: 'absolute',
    bottom: Theme.spacing.xl,
    right: Theme.spacing.xl,
    width: 64,
    height: 64,
    borderRadius: 32,
    ...Theme.shadows.glow,
  },
  fabGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomSpacer: {
    height: 100,
  },
  // Rest Timer Modal
  restTimerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  restTimerModal: {
    alignItems: 'center',
    padding: Theme.spacing['2xl'],
  },
  restTimerLabel: {
    fontSize: Theme.typography.sizes.lg,
    fontWeight: Theme.typography.weights.medium,
    color: Theme.colors.text.secondary,
    marginBottom: Theme.spacing.sm,
  },
  restTimerTime: {
    fontSize: 72,
    fontWeight: Theme.typography.weights.bold,
    color: Theme.colors.text.primary,
    fontVariant: ['tabular-nums'],
  },
  restTimerProgress: {
    width: 200,
    height: 6,
    backgroundColor: Theme.colors.background.tertiary,
    borderRadius: 3,
    marginTop: Theme.spacing.xl,
    marginBottom: Theme.spacing.xl,
    overflow: 'hidden',
  },
  restTimerProgressBar: {
    height: '100%',
    backgroundColor: Theme.colors.primary[500],
    borderRadius: 3,
  },
  restTimerControls: {
    flexDirection: 'row',
    gap: Theme.spacing.lg,
    marginBottom: Theme.spacing.xl,
  },
  restTimerButton: {
    paddingHorizontal: Theme.spacing.xl,
    paddingVertical: Theme.spacing.base,
    backgroundColor: Theme.colors.background.secondary,
    borderRadius: Theme.borderRadius.lg,
  },
  restTimerButtonText: {
    fontSize: Theme.typography.sizes.lg,
    fontWeight: Theme.typography.weights.semibold,
    color: Theme.colors.text.primary,
  },
  skipButton: {
    paddingHorizontal: Theme.spacing.xl,
    paddingVertical: Theme.spacing.base,
  },
  skipButtonText: {
    fontSize: Theme.typography.sizes.base,
    fontWeight: Theme.typography.weights.semibold,
    color: Theme.colors.primary[500],
  },
  // Note Modal
  noteModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'flex-end',
  },
  noteModalContent: {
    backgroundColor: Theme.colors.background.primary,
    borderTopLeftRadius: Theme.borderRadius.xl,
    borderTopRightRadius: Theme.borderRadius.xl,
    minHeight: 200,
  },
  noteModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.divider,
  },
  noteModalTitle: {
    fontSize: Theme.typography.sizes.lg,
    fontWeight: Theme.typography.weights.bold,
    color: Theme.colors.text.primary,
  },
  noteInput: {
    padding: Theme.spacing.lg,
    fontSize: Theme.typography.sizes.base,
    color: Theme.colors.text.primary,
    minHeight: 120,
    textAlignVertical: 'top',
  },
});
