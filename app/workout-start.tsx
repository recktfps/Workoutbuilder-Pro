import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { Theme, Button, Card } from '../src/ui';
import { db } from '../src/services/database';
import { useTemplateStore } from '../src/store/templateStore';
import { useWorkoutStore } from '../src/store/workoutStore';
import { WorkoutTemplate } from '../src/data/templates';

const TEMPLATE_COLORS: Record<string, readonly [string, string, ...string[]]> = {
  push: Theme.gradients.accentBlue,
  pull: Theme.gradients.cool,
  legs: Theme.gradients.warm,
  full: Theme.gradients.success,
  upper: Theme.gradients.accent,
  lower: Theme.gradients.fire,
  arms: Theme.gradients.neon,
  custom: Theme.gradients.darkElevated,
};

const TEMPLATE_ICONS: Record<string, string> = {
  push: 'arrow-forward-circle',
  pull: 'arrow-back-circle',
  legs: 'walk',
  full: 'flash',
  upper: 'body',
  lower: 'walk-outline',
  arms: 'barbell',
  custom: 'create',
};

export default function WorkoutStartScreen() {
  const [workoutName, setWorkoutName] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<WorkoutTemplate | null>(null);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [recentWorkouts, setRecentWorkouts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const { getAllTemplates, toggleFavorite, isFavorite } = useTemplateStore();
  const { startWorkout, addExercise, cancelWorkout } = useWorkoutStore();
  
  const templates = getAllTemplates();
  const quickTemplates = templates.filter(t => 
    ['push', 'pull', 'legs', 'full'].includes(t.type) && t.isDefault
  ).slice(0, 4);

  useEffect(() => {
    loadRecentWorkouts();
    // Clear any previous active workout when entering this screen
    cancelWorkout();
  }, []);

  const loadRecentWorkouts = async () => {
    try {
      const workouts = await db.getRecentWorkouts(5);
      setRecentWorkouts(workouts);
    } catch (error) {
      console.error('Error loading recent workouts:', error);
    }
  };

  const handleStartEmpty = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      
      const name = workoutName.trim() || 'Quick Workout';
      
      // Start workout in store first
      startWorkout(name);
      
      // Navigate to workout
      router.replace('/workout-in-progress' as any);
    } catch (error) {
      console.error('Error starting workout:', error);
      Alert.alert('Error', 'Failed to start workout. Please try again.');
    }
  };

  const handleStartFromTemplate = async (template: WorkoutTemplate) => {
    if (isLoading) return;
    
    try {
      setIsLoading(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      
      // Start workout in store
      startWorkout(template.name, template.id);
      
      // Load all exercises from database
      const allExercises = await db.getAllExercises();
      
      // Add each template exercise to the workout
      for (const tex of template.exercises) {
        const exercise = allExercises.find(e => e.id === tex.exerciseId);
        if (exercise) {
          addExercise(exercise, tex.sets);
        }
      }
      
      // Navigate to workout
      router.replace('/workout-in-progress' as any);
    } catch (error) {
      console.error('Error starting workout:', error);
      Alert.alert('Error', 'Failed to start workout. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTemplatePress = (template: WorkoutTemplate) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedTemplate(template);
    setShowTemplateModal(true);
  };

  const handleClose = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const renderTemplateModal = () => (
    <Modal
      visible={showTemplateModal}
      animationType="slide"
      transparent
      onRequestClose={() => setShowTemplateModal(false)}
    >
      <View style={styles.modalOverlay}>
        <Animated.View entering={FadeIn.duration(200)} style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowTemplateModal(false)}>
              <Ionicons name="close" size={24} color={Theme.colors.text.primary} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>{selectedTemplate?.name}</Text>
            <TouchableOpacity 
              onPress={() => {
                if (selectedTemplate) toggleFavorite(selectedTemplate.id);
              }}
            >
              <Ionicons 
                name={selectedTemplate && isFavorite(selectedTemplate.id) ? "heart" : "heart-outline"} 
                size={24} 
                color={Theme.colors.error[500]} 
              />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalScroll}>
            <Text style={styles.templateDescription}>{selectedTemplate?.description}</Text>
            
            <View style={styles.templateMeta}>
              <View style={styles.metaItem}>
                <Ionicons name="time-outline" size={20} color={Theme.colors.text.tertiary} />
                <Text style={styles.metaText}>{selectedTemplate?.duration}</Text>
              </View>
              <View style={styles.metaItem}>
                <Ionicons name="barbell-outline" size={20} color={Theme.colors.text.tertiary} />
                <Text style={styles.metaText}>{selectedTemplate?.exercises.length} exercises</Text>
              </View>
              <View style={styles.metaItem}>
                <Ionicons name="trophy-outline" size={20} color={Theme.colors.text.tertiary} />
                <Text style={styles.metaText}>{selectedTemplate?.difficulty}</Text>
              </View>
            </View>

            <Text style={styles.exercisesTitle}>Exercises</Text>
            {selectedTemplate?.exercises.map((ex, index) => (
              <View key={index} style={styles.exerciseItem}>
                <View style={styles.exerciseNumber}>
                  <Text style={styles.exerciseNumberText}>{index + 1}</Text>
                </View>
                <View style={styles.exerciseInfo}>
                  <Text style={styles.exerciseName}>
                    {ex.exerciseId.replace('ex_', '').replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </Text>
                  <Text style={styles.exerciseDetails}>
                    {ex.sets} sets × {ex.reps} reps • {ex.restSeconds}s rest
                  </Text>
                  {ex.notes && <Text style={styles.exerciseNotes}>{ex.notes}</Text>}
                </View>
              </View>
            ))}
          </ScrollView>

          <View style={styles.modalFooter}>
            <Button
              title={isLoading ? "Starting..." : "Start This Workout"}
              onPress={() => {
                setShowTemplateModal(false);
                if (selectedTemplate) handleStartFromTemplate(selectedTemplate);
              }}
              gradient={Theme.gradients.primary}
              icon={<Ionicons name="play" size={20} color="#fff" />}
              disabled={isLoading}
            />
          </View>
        </Animated.View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
          <Ionicons name="close" size={28} color={Theme.colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.title}>Start Workout</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Quick Start Section */}
        <Animated.View entering={FadeInDown.duration(400).delay(100)} style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Start</Text>
          <Card style={styles.quickStartCard}>
            <TextInput
              style={styles.input}
              placeholder="Workout name (optional)"
              placeholderTextColor={Theme.colors.text.tertiary}
              value={workoutName}
              onChangeText={setWorkoutName}
              autoCapitalize="words"
              returnKeyType="done"
            />
            <Button
              title="Start Empty Workout"
              onPress={handleStartEmpty}
              icon={<Ionicons name="play" size={20} color="#fff" />}
              variant="primary"
              gradient={Theme.gradients.primary}
            />
          </Card>
        </Animated.View>

        {/* Quick Templates Section */}
        <Animated.View entering={FadeInDown.duration(400).delay(200)} style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Quick Templates</Text>
            <TouchableOpacity onPress={() => router.push('/programs' as any)}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.templatesGrid}>
            {quickTemplates.map((template) => (
              <TouchableOpacity
                key={template.id}
                activeOpacity={0.8}
                onPress={() => handleTemplatePress(template)}
                style={styles.templateCard}
              >
                <LinearGradient
                  colors={TEMPLATE_COLORS[template.type] || Theme.gradients.primary}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.templateGradient}
                >
                  <Ionicons 
                    name={TEMPLATE_ICONS[template.type] as any || 'barbell'} 
                    size={32} 
                    color={Theme.colors.text.primary} 
                  />
                  <Text style={styles.templateName}>{template.name}</Text>
                  <Text style={styles.templateExercises}>
                    {template.exercises.length} exercises
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>

        {/* All Templates Section */}
        <Animated.View entering={FadeInDown.duration(400).delay(300)} style={styles.section}>
          <Text style={styles.sectionTitle}>All Templates</Text>
          {templates.slice(0, 8).map((template) => (
            <TouchableOpacity
              key={template.id}
              activeOpacity={0.8}
              onPress={() => handleTemplatePress(template)}
              style={styles.templateListItem}
            >
              <Card style={styles.templateListCard}>
                <View style={styles.templateListIcon}>
                  <LinearGradient
                    colors={TEMPLATE_COLORS[template.type] || Theme.gradients.primary}
                    style={styles.templateIconGradient}
                  >
                    <Ionicons 
                      name={TEMPLATE_ICONS[template.type] as any || 'barbell'} 
                      size={20} 
                      color="#fff" 
                    />
                  </LinearGradient>
                </View>
                <View style={styles.templateListInfo}>
                  <Text style={styles.templateListName}>{template.name}</Text>
                  <Text style={styles.templateListMeta}>
                    {template.exercises.length} exercises • {template.duration}
                  </Text>
                </View>
                <View style={styles.templateListBadges}>
                  <View style={[styles.difficultyBadge, 
                    template.difficulty === 'beginner' && styles.beginnerBadge,
                    template.difficulty === 'intermediate' && styles.intermediateBadge,
                    template.difficulty === 'advanced' && styles.advancedBadge,
                  ]}>
                    <Text style={styles.badgeText}>{template.difficulty}</Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={20} color={Theme.colors.text.tertiary} />
              </Card>
            </TouchableOpacity>
          ))}
        </Animated.View>

        {/* Recent Workouts Section */}
        <Animated.View entering={FadeInDown.duration(400).delay(400)} style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Workouts</Text>
          {recentWorkouts.length === 0 ? (
            <Card style={styles.emptyState}>
              <Ionicons name="time-outline" size={48} color={Theme.colors.text.tertiary} />
              <Text style={styles.emptyText}>Your recent workouts will appear here</Text>
            </Card>
          ) : (
            recentWorkouts.slice(0, 3).map((workout) => (
              <TouchableOpacity 
                key={workout.id}
                activeOpacity={0.8}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }}
              >
                <Card style={styles.recentWorkoutCard}>
                  <View>
                    <Text style={styles.recentWorkoutName}>{workout.name}</Text>
                    <Text style={styles.recentWorkoutMeta}>
                      {workout.totalSets} sets
                    </Text>
                  </View>
                  <TouchableOpacity style={styles.repeatButton}>
                    <Ionicons name="refresh" size={20} color={Theme.colors.primary[500]} />
                  </TouchableOpacity>
                </Card>
              </TouchableOpacity>
            ))
          )}
        </Animated.View>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {renderTemplateModal()}
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
  closeButton: {
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
    fontSize: Theme.typography.sizes.xl,
    fontWeight: Theme.typography.weights.bold,
    color: Theme.colors.text.primary,
    marginBottom: Theme.spacing.base,
  },
  seeAllText: {
    fontSize: Theme.typography.sizes.sm,
    fontWeight: Theme.typography.weights.semibold,
    color: Theme.colors.primary[500],
  },
  quickStartCard: {
    padding: Theme.spacing.lg,
  },
  input: {
    backgroundColor: Theme.colors.background.secondary,
    borderRadius: Theme.borderRadius.lg,
    padding: Theme.spacing.base,
    fontSize: Theme.typography.sizes.base,
    color: Theme.colors.text.primary,
    marginBottom: Theme.spacing.base,
  },
  templatesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Theme.spacing.base,
  },
  templateCard: {
    width: '48%',
  },
  templateGradient: {
    borderRadius: Theme.borderRadius.lg,
    padding: Theme.spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 130,
  },
  templateName: {
    fontSize: Theme.typography.sizes.base,
    fontWeight: Theme.typography.weights.bold,
    color: Theme.colors.text.primary,
    marginTop: Theme.spacing.sm,
    textAlign: 'center',
  },
  templateExercises: {
    fontSize: Theme.typography.sizes.xs,
    fontWeight: Theme.typography.weights.medium,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  templateListItem: {
    marginBottom: Theme.spacing.sm,
  },
  templateListCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Theme.spacing.base,
    gap: Theme.spacing.base,
  },
  templateListIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    overflow: 'hidden',
  },
  templateIconGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  templateListInfo: {
    flex: 1,
  },
  templateListName: {
    fontSize: Theme.typography.sizes.base,
    fontWeight: Theme.typography.weights.semibold,
    color: Theme.colors.text.primary,
  },
  templateListMeta: {
    fontSize: Theme.typography.sizes.sm,
    fontWeight: Theme.typography.weights.medium,
    color: Theme.colors.text.tertiary,
    marginTop: 2,
  },
  templateListBadges: {
    marginRight: Theme.spacing.sm,
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: Theme.colors.background.tertiary,
  },
  beginnerBadge: {
    backgroundColor: Theme.colors.success[500] + '30',
  },
  intermediateBadge: {
    backgroundColor: Theme.colors.warning[500] + '30',
  },
  advancedBadge: {
    backgroundColor: Theme.colors.error[500] + '30',
  },
  badgeText: {
    fontSize: Theme.typography.sizes.xs,
    fontWeight: Theme.typography.weights.semibold,
    color: Theme.colors.text.secondary,
    textTransform: 'capitalize',
  },
  emptyState: {
    padding: Theme.spacing['2xl'],
    alignItems: 'center',
  },
  emptyText: {
    fontSize: Theme.typography.sizes.base,
    fontWeight: Theme.typography.weights.medium,
    color: Theme.colors.text.tertiary,
    marginTop: Theme.spacing.base,
    textAlign: 'center',
  },
  recentWorkoutCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Theme.spacing.base,
    marginBottom: Theme.spacing.sm,
  },
  recentWorkoutName: {
    fontSize: Theme.typography.sizes.base,
    fontWeight: Theme.typography.weights.semibold,
    color: Theme.colors.text.primary,
  },
  recentWorkoutMeta: {
    fontSize: Theme.typography.sizes.sm,
    fontWeight: Theme.typography.weights.medium,
    color: Theme.colors.text.tertiary,
    marginTop: 2,
  },
  repeatButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Theme.colors.primary[500] + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomSpacer: {
    height: Theme.spacing['2xl'],
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
    maxHeight: '90%',
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
  modalScroll: {
    padding: Theme.spacing.lg,
    maxHeight: 400,
  },
  templateDescription: {
    fontSize: Theme.typography.sizes.base,
    fontWeight: Theme.typography.weights.regular,
    color: Theme.colors.text.secondary,
    marginBottom: Theme.spacing.lg,
  },
  templateMeta: {
    flexDirection: 'row',
    gap: Theme.spacing.lg,
    marginBottom: Theme.spacing.xl,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: Theme.typography.sizes.sm,
    fontWeight: Theme.typography.weights.medium,
    color: Theme.colors.text.tertiary,
  },
  exercisesTitle: {
    fontSize: Theme.typography.sizes.lg,
    fontWeight: Theme.typography.weights.bold,
    color: Theme.colors.text.primary,
    marginBottom: Theme.spacing.base,
  },
  exerciseItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Theme.spacing.base,
    gap: Theme.spacing.base,
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
  exerciseInfo: {
    flex: 1,
  },
  exerciseName: {
    fontSize: Theme.typography.sizes.base,
    fontWeight: Theme.typography.weights.semibold,
    color: Theme.colors.text.primary,
  },
  exerciseDetails: {
    fontSize: Theme.typography.sizes.sm,
    fontWeight: Theme.typography.weights.medium,
    color: Theme.colors.text.tertiary,
    marginTop: 2,
  },
  exerciseNotes: {
    fontSize: Theme.typography.sizes.xs,
    fontWeight: Theme.typography.weights.regular,
    color: Theme.colors.text.tertiary,
    fontStyle: 'italic',
    marginTop: 4,
  },
  modalFooter: {
    padding: Theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Theme.colors.divider,
  },
});
