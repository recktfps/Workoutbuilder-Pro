import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Theme, Card, Button } from '../src/ui';
import { useTemplateStore } from '../src/store/templateStore';
import { db } from '../src/services/database';
import { Exercise } from '../src/types';
import { TemplateExercise, WorkoutTemplate } from '../src/data/templates';

interface EditableExercise extends TemplateExercise {
  exerciseName: string;
}

export default function ProgramBuilderScreen() {
  const params = useLocalSearchParams();
  const programId = params.programId as string | undefined;

  const [programName, setProgramName] = useState('');
  const [programDescription, setProgramDescription] = useState('');
  const [exercises, setExercises] = useState<EditableExercise[]>([]);
  const [showExerciseModal, setShowExerciseModal] = useState(false);
  const [allExercises, setAllExercises] = useState<Exercise[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingExercise, setEditingExercise] = useState<string | null>(null);

  const { getTemplateById, updateTemplate, addUserTemplate } = useTemplateStore();

  useEffect(() => {
    loadExercises();
    if (programId) {
      loadProgram();
    }
  }, [programId]);

  const loadExercises = async () => {
    try {
      const exerciseList = await db.getAllExercises();
      setAllExercises(exerciseList);
    } catch (error) {
      console.error('Error loading exercises:', error);
    }
  };

  const loadProgram = () => {
    if (programId) {
      const template = getTemplateById(programId);
      if (template) {
        setProgramName(template.name);
        setProgramDescription(template.description);
        setExercises(
          template.exercises.map(ex => ({
            ...ex,
            exerciseName: ex.exerciseId.replace('ex_', '').replace(/_/g, ' '),
          }))
        );
      }
    }
  };

  const handleAddExercise = (exercise: Exercise) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    const newExercise: EditableExercise = {
      exerciseId: exercise.id,
      exerciseName: exercise.name,
      sets: 3,
      reps: '8-12',
      restSeconds: 90,
    };

    setExercises([...exercises, newExercise]);
    setShowExerciseModal(false);
    setSearchQuery('');
  };

  const handleRemoveExercise = (index: number) => {
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
            setExercises(exercises.filter((_, i) => i !== index));
          },
        },
      ]
    );
  };

  const handleUpdateExercise = (index: number, updates: Partial<EditableExercise>) => {
    setExercises(
      exercises.map((ex, i) => (i === index ? { ...ex, ...updates } : ex))
    );
  };

  const handleMoveExercise = (fromIndex: number, direction: 'up' | 'down') => {
    const toIndex = direction === 'up' ? fromIndex - 1 : fromIndex + 1;
    if (toIndex < 0 || toIndex >= exercises.length) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const newExercises = [...exercises];
    [newExercises[fromIndex], newExercises[toIndex]] = [
      newExercises[toIndex],
      newExercises[fromIndex],
    ];
    setExercises(newExercises);
  };

  const handleSave = () => {
    if (!programName.trim()) {
      Alert.alert('Error', 'Please enter a program name');
      return;
    }

    if (exercises.length === 0) {
      Alert.alert('Error', 'Please add at least one exercise');
      return;
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    const templateExercises: TemplateExercise[] = exercises.map(ex => ({
      exerciseId: ex.exerciseId,
      sets: ex.sets,
      reps: ex.reps,
      restSeconds: ex.restSeconds,
      notes: ex.notes,
    }));

    if (programId) {
      updateTemplate(programId, {
        name: programName,
        description: programDescription,
        exercises: templateExercises,
      });
    } else {
      addUserTemplate({
        name: programName,
        description: programDescription,
        type: 'custom',
        difficulty: 'intermediate',
        duration: `${Math.round(exercises.length * 8)}-${Math.round(exercises.length * 12)} min`,
        muscleGroups: [],
        exercises: templateExercises,
        isPremium: false,
      });
    }

    router.back();
  };

  const filteredExercises = allExercises.filter(ex =>
    ex.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderExerciseModal = () => (
    <Modal
      visible={showExerciseModal}
      animationType="slide"
      transparent
      onRequestClose={() => setShowExerciseModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowExerciseModal(false)}>
              <Ionicons name="close" size={24} color={Theme.colors.text.primary} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Add Exercise</Text>
            <View style={{ width: 24 }} />
          </View>

          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color={Theme.colors.text.tertiary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search exercises..."
              placeholderTextColor={Theme.colors.text.tertiary}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          <ScrollView style={styles.exerciseList}>
            {filteredExercises.map((exercise) => (
              <TouchableOpacity
                key={exercise.id}
                style={styles.exerciseOption}
                onPress={() => handleAddExercise(exercise)}
              >
                <View style={styles.exerciseOptionInfo}>
                  <Text style={styles.exerciseOptionName}>{exercise.name}</Text>
                  <Text style={styles.exerciseOptionMeta}>
                    {exercise.primaryMuscle} • {exercise.equipment}
                  </Text>
                </View>
                <Ionicons name="add-circle" size={24} color={Theme.colors.primary[500]} />
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="close" size={24} color={Theme.colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.title}>{programId ? 'Edit Program' : 'New Program'}</Text>
        <TouchableOpacity onPress={handleSave}>
          <Ionicons name="checkmark" size={24} color={Theme.colors.success[500]} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Program Details */}
        <Animated.View entering={FadeInDown.duration(400)} style={styles.section}>
          <Text style={styles.sectionTitle}>Program Details</Text>
          <Card style={styles.detailsCard}>
            <TextInput
              style={styles.nameInput}
              placeholder="Program Name"
              placeholderTextColor={Theme.colors.text.tertiary}
              value={programName}
              onChangeText={setProgramName}
              autoCapitalize="words"
            />
            <TextInput
              style={styles.descriptionInput}
              placeholder="Description (optional)"
              placeholderTextColor={Theme.colors.text.tertiary}
              value={programDescription}
              onChangeText={setProgramDescription}
              multiline
              numberOfLines={3}
            />
          </Card>
        </Animated.View>

        {/* Exercises */}
        <Animated.View entering={FadeInDown.duration(400).delay(100)} style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Exercises</Text>
            <Text style={styles.exerciseCount}>{exercises.length} exercises</Text>
          </View>

          {exercises.map((exercise, index) => (
            <Animated.View
              key={`${exercise.exerciseId}-${index}`}
              entering={FadeInDown.duration(300).delay(index * 50)}
            >
              <Card style={styles.exerciseCard}>
                <View style={styles.exerciseHeader}>
                  <View style={styles.exerciseNumber}>
                    <Text style={styles.exerciseNumberText}>{index + 1}</Text>
                  </View>
                  <View style={styles.exerciseInfo}>
                    <Text style={styles.exerciseName}>{exercise.exerciseName}</Text>
                  </View>
                  <View style={styles.exerciseActions}>
                    <TouchableOpacity
                      onPress={() => handleMoveExercise(index, 'up')}
                      disabled={index === 0}
                      style={[styles.moveButton, index === 0 && styles.moveButtonDisabled]}
                    >
                      <Ionicons
                        name="chevron-up"
                        size={20}
                        color={index === 0 ? Theme.colors.text.disabled : Theme.colors.text.secondary}
                      />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleMoveExercise(index, 'down')}
                      disabled={index === exercises.length - 1}
                      style={[styles.moveButton, index === exercises.length - 1 && styles.moveButtonDisabled]}
                    >
                      <Ionicons
                        name="chevron-down"
                        size={20}
                        color={index === exercises.length - 1 ? Theme.colors.text.disabled : Theme.colors.text.secondary}
                      />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleRemoveExercise(index)}
                      style={styles.removeButton}
                    >
                      <Ionicons name="trash-outline" size={18} color={Theme.colors.error[500]} />
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.exerciseSettings}>
                  <View style={styles.settingRow}>
                    <Text style={styles.settingLabel}>Sets</Text>
                    <View style={styles.settingInput}>
                      <TouchableOpacity
                        onPress={() => handleUpdateExercise(index, { sets: Math.max(1, exercise.sets - 1) })}
                        style={styles.adjustButton}
                      >
                        <Ionicons name="remove" size={16} color={Theme.colors.text.secondary} />
                      </TouchableOpacity>
                      <Text style={styles.settingValue}>{exercise.sets}</Text>
                      <TouchableOpacity
                        onPress={() => handleUpdateExercise(index, { sets: exercise.sets + 1 })}
                        style={styles.adjustButton}
                      >
                        <Ionicons name="add" size={16} color={Theme.colors.text.secondary} />
                      </TouchableOpacity>
                    </View>
                  </View>

                  <View style={styles.settingRow}>
                    <Text style={styles.settingLabel}>Reps</Text>
                    <TextInput
                      style={styles.repsInput}
                      value={exercise.reps}
                      onChangeText={(text) => handleUpdateExercise(index, { reps: text })}
                      placeholder="8-12"
                      placeholderTextColor={Theme.colors.text.tertiary}
                    />
                  </View>

                  <View style={styles.settingRow}>
                    <Text style={styles.settingLabel}>Rest</Text>
                    <View style={styles.settingInput}>
                      <TouchableOpacity
                        onPress={() => handleUpdateExercise(index, { restSeconds: Math.max(15, exercise.restSeconds - 15) })}
                        style={styles.adjustButton}
                      >
                        <Ionicons name="remove" size={16} color={Theme.colors.text.secondary} />
                      </TouchableOpacity>
                      <Text style={styles.settingValue}>{exercise.restSeconds}s</Text>
                      <TouchableOpacity
                        onPress={() => handleUpdateExercise(index, { restSeconds: exercise.restSeconds + 15 })}
                        style={styles.adjustButton}
                      >
                        <Ionicons name="add" size={16} color={Theme.colors.text.secondary} />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </Card>
            </Animated.View>
          ))}

          {/* Add Exercise Button */}
          <TouchableOpacity
            style={styles.addExerciseButton}
            onPress={() => setShowExerciseModal(true)}
          >
            <LinearGradient
              colors={Theme.gradients.darkCard}
              style={styles.addExerciseGradient}
            >
              <Ionicons name="add-circle" size={24} color={Theme.colors.primary[500]} />
              <Text style={styles.addExerciseText}>Add Exercise</Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Save Button */}
      <View style={styles.footer}>
        <Button
          title="Save Program"
          onPress={handleSave}
          gradient={Theme.gradients.primary}
          icon={<Ionicons name="checkmark" size={20} color="#fff" />}
        />
      </View>

      {renderExerciseModal()}
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
    padding: Theme.spacing.lg,
  },
  title: {
    fontSize: Theme.typography.sizes.xl,
    fontWeight: Theme.typography.weights.bold,
    color: Theme.colors.text.primary,
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
    fontSize: Theme.typography.sizes.lg,
    fontWeight: Theme.typography.weights.bold,
    color: Theme.colors.text.primary,
    marginBottom: Theme.spacing.base,
  },
  exerciseCount: {
    fontSize: Theme.typography.sizes.sm,
    fontWeight: Theme.typography.weights.medium,
    color: Theme.colors.text.tertiary,
  },
  detailsCard: {
    padding: Theme.spacing.lg,
  },
  nameInput: {
    fontSize: Theme.typography.sizes.lg,
    fontWeight: Theme.typography.weights.semibold,
    color: Theme.colors.text.primary,
    marginBottom: Theme.spacing.base,
    paddingBottom: Theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.divider,
  },
  descriptionInput: {
    fontSize: Theme.typography.sizes.base,
    color: Theme.colors.text.secondary,
    textAlignVertical: 'top',
  },
  exerciseCard: {
    padding: Theme.spacing.base,
    marginBottom: Theme.spacing.base,
  },
  exerciseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Theme.spacing.base,
  },
  exerciseNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Theme.colors.primary[500] + '30',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Theme.spacing.base,
  },
  exerciseNumberText: {
    fontSize: Theme.typography.sizes.sm,
    fontWeight: Theme.typography.weights.bold,
    color: Theme.colors.primary[500],
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseName: {
    fontSize: Theme.typography.sizes.base,
    fontWeight: Theme.typography.weights.semibold,
    color: Theme.colors.text.primary,
    textTransform: 'capitalize',
  },
  exerciseActions: {
    flexDirection: 'row',
    gap: 4,
  },
  moveButton: {
    padding: 4,
  },
  moveButtonDisabled: {
    opacity: 0.3,
  },
  removeButton: {
    padding: 4,
    marginLeft: Theme.spacing.sm,
  },
  exerciseSettings: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Theme.spacing.base,
  },
  settingRow: {
    flex: 1,
    alignItems: 'center',
  },
  settingLabel: {
    fontSize: Theme.typography.sizes.xs,
    fontWeight: Theme.typography.weights.medium,
    color: Theme.colors.text.tertiary,
    marginBottom: 4,
  },
  settingInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.colors.background.tertiary,
    borderRadius: Theme.borderRadius.md,
    padding: 4,
  },
  adjustButton: {
    padding: 6,
  },
  settingValue: {
    fontSize: Theme.typography.sizes.base,
    fontWeight: Theme.typography.weights.semibold,
    color: Theme.colors.text.primary,
    minWidth: 40,
    textAlign: 'center',
  },
  repsInput: {
    backgroundColor: Theme.colors.background.tertiary,
    borderRadius: Theme.borderRadius.md,
    paddingHorizontal: Theme.spacing.sm,
    paddingVertical: 6,
    fontSize: Theme.typography.sizes.base,
    fontWeight: Theme.typography.weights.semibold,
    color: Theme.colors.text.primary,
    textAlign: 'center',
    minWidth: 80,
  },
  addExerciseButton: {
    marginTop: Theme.spacing.sm,
  },
  addExerciseGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Theme.spacing.lg,
    borderRadius: Theme.borderRadius.lg,
    gap: Theme.spacing.sm,
    borderWidth: 2,
    borderColor: Theme.colors.primary[500] + '30',
    borderStyle: 'dashed',
  },
  addExerciseText: {
    fontSize: Theme.typography.sizes.base,
    fontWeight: Theme.typography.weights.semibold,
    color: Theme.colors.primary[500],
  },
  footer: {
    padding: Theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Theme.colors.divider,
    backgroundColor: Theme.colors.background.primary,
  },
  bottomSpacer: {
    height: Theme.spacing.xl,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Theme.colors.background.primary,
    borderTopLeftRadius: Theme.borderRadius.xl,
    borderTopRightRadius: Theme.borderRadius.xl,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.divider,
  },
  modalTitle: {
    fontSize: Theme.typography.sizes.xl,
    fontWeight: Theme.typography.weights.bold,
    color: Theme.colors.text.primary,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.colors.background.secondary,
    margin: Theme.spacing.lg,
    paddingHorizontal: Theme.spacing.base,
    borderRadius: Theme.borderRadius.lg,
    gap: Theme.spacing.sm,
  },
  searchInput: {
    flex: 1,
    paddingVertical: Theme.spacing.sm,
    fontSize: Theme.typography.sizes.base,
    color: Theme.colors.text.primary,
  },
  exerciseList: {
    paddingHorizontal: Theme.spacing.lg,
    maxHeight: 400,
  },
  exerciseOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Theme.spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.divider,
  },
  exerciseOptionInfo: {
    flex: 1,
  },
  exerciseOptionName: {
    fontSize: Theme.typography.sizes.base,
    fontWeight: Theme.typography.weights.semibold,
    color: Theme.colors.text.primary,
  },
  exerciseOptionMeta: {
    fontSize: Theme.typography.sizes.sm,
    fontWeight: Theme.typography.weights.medium,
    color: Theme.colors.text.tertiary,
    marginTop: 2,
    textTransform: 'capitalize',
  },
});
