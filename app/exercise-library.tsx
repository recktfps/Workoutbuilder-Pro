import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  FlatList,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Theme, Card, Button } from '../src/ui';
import { db } from '../src/services/database';
import { Exercise } from '../src/types';
import { useWorkoutStore } from '../src/store/workoutStore';

const MUSCLE_CATEGORIES = [
  { id: 'all', name: 'All', icon: 'grid-outline' },
  { id: 'chest', name: 'Chest', icon: 'fitness' },
  { id: 'back', name: 'Back', icon: 'body' },
  { id: 'shoulders', name: 'Shoulders', icon: 'triangle' },
  { id: 'legs', name: 'Legs', icon: 'walk' },
  { id: 'arms', name: 'Arms', icon: 'barbell' },
  { id: 'biceps', name: 'Biceps', icon: 'barbell-outline' },
  { id: 'triceps', name: 'Triceps', icon: 'barbell-outline' },
  { id: 'core', name: 'Core', icon: 'ellipse-outline' },
  { id: 'glutes', name: 'Glutes', icon: 'body-outline' },
  { id: 'hamstrings', name: 'Hamstrings', icon: 'walk-outline' },
  { id: 'calves', name: 'Calves', icon: 'footsteps' },
];

const EQUIPMENT_FILTERS = [
  { id: 'all', name: 'All Equipment' },
  { id: 'barbell', name: 'Barbell' },
  { id: 'dumbbells', name: 'Dumbbells' },
  { id: 'machine', name: 'Machine' },
  { id: 'cable', name: 'Cable' },
  { id: 'bodyweight', name: 'Bodyweight' },
  { id: 'kettlebell', name: 'Kettlebell' },
];

export default function ExerciseLibraryScreen() {
  const params = useLocalSearchParams();
  const workoutId = params.workoutId as string;

  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [filteredExercises, setFilteredExercises] = useState<Exercise[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedEquipment, setSelectedEquipment] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [showExerciseDetail, setShowExerciseDetail] = useState<Exercise | null>(null);

  const { addExercise } = useWorkoutStore();

  useEffect(() => {
    loadExercises();
  }, []);

  useEffect(() => {
    filterExercises();
  }, [searchQuery, selectedCategory, selectedEquipment, exercises]);

  const loadExercises = async () => {
    try {
      const allExercises = await db.getAllExercises();
      setExercises(allExercises);
      setFilteredExercises(allExercises);
    } catch (error) {
      console.error('Error loading exercises:', error);
    }
  };

  const filterExercises = useCallback(() => {
    let filtered = exercises;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((ex) =>
        ex.name.toLowerCase().includes(query) ||
        ex.primaryMuscle.toLowerCase().includes(query) ||
        ex.equipment.toLowerCase().includes(query)
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(
        (ex) => 
          ex.primaryMuscle.includes(selectedCategory) || 
          ex.secondaryMuscles?.some(m => m.includes(selectedCategory))
      );
    }

    if (selectedEquipment !== 'all') {
      filtered = filtered.filter((ex) => ex.equipment === selectedEquipment);
    }

    setFilteredExercises(filtered);
  }, [searchQuery, selectedCategory, selectedEquipment, exercises]);

  const handleSelectExercise = (exercise: Exercise) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    // Add exercise to the active workout
    addExercise(exercise);
    
    // Navigate back
    router.back();
  };

  const handleViewDetails = (exercise: Exercise) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowExerciseDetail(exercise);
  };

  const handleClose = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const renderExercise = ({ item, index }: { item: Exercise; index: number }) => (
    <Animated.View entering={FadeInDown.duration(300).delay(Math.min(index * 30, 300))}>
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => handleSelectExercise(item)}
        onLongPress={() => handleViewDetails(item)}
        style={styles.exerciseItem}
      >
        <Card style={styles.exerciseCard}>
          <View style={styles.exerciseIconContainer}>
            <Ionicons name="barbell" size={24} color={Theme.colors.primary[500]} />
          </View>
          <View style={styles.exerciseInfo}>
            <Text style={styles.exerciseName}>{item.name}</Text>
            <View style={styles.exerciseMeta}>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{item.primaryMuscle}</Text>
              </View>
              <View style={[styles.badge, styles.badgeSecondary]}>
                <Text style={styles.badgeText}>{item.equipment}</Text>
              </View>
              {item.difficulty === 'advanced' && (
                <View style={[styles.badge, styles.badgeAdvanced]}>
                  <Text style={[styles.badgeText, { color: Theme.colors.error[500] }]}>Advanced</Text>
                </View>
              )}
            </View>
          </View>
          <TouchableOpacity 
            onPress={() => handleViewDetails(item)}
            style={styles.infoButton}
          >
            <Ionicons name="information-circle-outline" size={24} color={Theme.colors.text.tertiary} />
          </TouchableOpacity>
          <Ionicons name="add-circle" size={28} color={Theme.colors.primary[500]} />
        </Card>
      </TouchableOpacity>
    </Animated.View>
  );

  const renderExerciseDetailModal = () => {
    if (!showExerciseDetail) return null;

    return (
      <Modal
        visible={showExerciseDetail !== null}
        animationType="slide"
        transparent
        onRequestClose={() => setShowExerciseDetail(null)}
      >
        <View style={styles.detailModalOverlay}>
          <View style={styles.detailModalContent}>
            <View style={styles.detailModalHeader}>
              <TouchableOpacity onPress={() => setShowExerciseDetail(null)}>
                <Ionicons name="close" size={24} color={Theme.colors.text.primary} />
              </TouchableOpacity>
              <Text style={styles.detailModalTitle}>{showExerciseDetail.name}</Text>
              <View style={{ width: 24 }} />
            </View>

            <ScrollView style={styles.detailModalScroll}>
              {/* Exercise Info */}
              <View style={styles.detailSection}>
                <View style={styles.detailBadges}>
                  <View style={[styles.detailBadge, styles.muscleBadge]}>
                    <Ionicons name="body" size={14} color={Theme.colors.primary[500]} />
                    <Text style={styles.detailBadgeText}>{showExerciseDetail.primaryMuscle}</Text>
                  </View>
                  <View style={[styles.detailBadge, styles.equipmentBadge]}>
                    <Ionicons name="barbell" size={14} color={Theme.colors.warning[500]} />
                    <Text style={styles.detailBadgeText}>{showExerciseDetail.equipment}</Text>
                  </View>
                  <View style={[
                    styles.detailBadge, 
                    styles.difficultyBadge,
                    showExerciseDetail.difficulty === 'beginner' && styles.beginnerBg,
                    showExerciseDetail.difficulty === 'intermediate' && styles.intermediateBg,
                    showExerciseDetail.difficulty === 'advanced' && styles.advancedBg,
                  ]}>
                    <Text style={styles.detailBadgeText}>{showExerciseDetail.difficulty}</Text>
                  </View>
                </View>
              </View>

              {/* Secondary Muscles */}
              {showExerciseDetail.secondaryMuscles && showExerciseDetail.secondaryMuscles.length > 0 && (
                <View style={styles.detailSection}>
                  <Text style={styles.detailSectionTitle}>Secondary Muscles</Text>
                  <View style={styles.secondaryMuscles}>
                    {showExerciseDetail.secondaryMuscles.map((muscle, index) => (
                      <View key={index} style={styles.secondaryBadge}>
                        <Text style={styles.secondaryBadgeText}>{muscle}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {/* Instructions */}
              {showExerciseDetail.instructions && showExerciseDetail.instructions.length > 0 && (
                <View style={styles.detailSection}>
                  <Text style={styles.detailSectionTitle}>Instructions</Text>
                  {showExerciseDetail.instructions.map((instruction, index) => (
                    <View key={index} style={styles.instructionItem}>
                      <View style={styles.instructionNumber}>
                        <Text style={styles.instructionNumberText}>{index + 1}</Text>
                      </View>
                      <Text style={styles.instructionText}>{instruction}</Text>
                    </View>
                  ))}
                </View>
              )}

              {/* Tips */}
              {showExerciseDetail.tips && showExerciseDetail.tips.length > 0 && (
                <View style={styles.detailSection}>
                  <Text style={styles.detailSectionTitle}>Pro Tips</Text>
                  {showExerciseDetail.tips.map((tip, index) => (
                    <View key={index} style={styles.tipItem}>
                      <Ionicons name="bulb" size={16} color={Theme.colors.warning[500]} />
                      <Text style={styles.tipText}>{tip}</Text>
                    </View>
                  ))}
                </View>
              )}
            </ScrollView>

            <View style={styles.detailModalFooter}>
              <Button
                title="Add to Workout"
                onPress={() => {
                  setShowExerciseDetail(null);
                  handleSelectExercise(showExerciseDetail);
                }}
                gradient={Theme.gradients.primary}
                icon={<Ionicons name="add" size={20} color="#fff" />}
              />
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  const renderFiltersModal = () => (
    <Modal
      visible={showFilters}
      animationType="slide"
      transparent
      onRequestClose={() => setShowFilters(false)}
    >
      <View style={styles.filterModalOverlay}>
        <View style={styles.filterModalContent}>
          <View style={styles.filterModalHeader}>
            <TouchableOpacity onPress={() => setShowFilters(false)}>
              <Ionicons name="close" size={24} color={Theme.colors.text.primary} />
            </TouchableOpacity>
            <Text style={styles.filterModalTitle}>Filters</Text>
            <TouchableOpacity 
              onPress={() => {
                setSelectedCategory('all');
                setSelectedEquipment('all');
              }}
            >
              <Text style={styles.clearText}>Clear</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.filterModalScroll}>
            <Text style={styles.filterSectionTitle}>Equipment</Text>
            <View style={styles.filterGrid}>
              {EQUIPMENT_FILTERS.map((equip) => (
                <TouchableOpacity
                  key={equip.id}
                  style={[
                    styles.filterChip,
                    selectedEquipment === equip.id && styles.filterChipSelected,
                  ]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setSelectedEquipment(equip.id);
                  }}
                >
                  <Text style={[
                    styles.filterChipText,
                    selectedEquipment === equip.id && styles.filterChipTextSelected,
                  ]}>
                    {equip.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          <View style={styles.filterModalFooter}>
            <Button
              title={`Show ${filteredExercises.length} Exercises`}
              onPress={() => setShowFilters(false)}
              gradient={Theme.gradients.primary}
            />
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
          <Ionicons name="arrow-back" size={24} color={Theme.colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.title}>Exercise Library</Text>
        <TouchableOpacity 
          onPress={() => setShowFilters(true)}
          style={styles.filterButton}
        >
          <Ionicons 
            name="options" 
            size={24} 
            color={selectedEquipment !== 'all' ? Theme.colors.primary[500] : Theme.colors.text.primary} 
          />
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color={Theme.colors.text.tertiary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search exercises..."
            placeholderTextColor={Theme.colors.text.tertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color={Theme.colors.text.tertiary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Categories */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesContainer}
        contentContainerStyle={styles.categoriesContent}
      >
        {MUSCLE_CATEGORIES.map((category) => (
          <TouchableOpacity
            key={category.id}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setSelectedCategory(category.id);
            }}
            style={[
              styles.categoryChip,
              selectedCategory === category.id && styles.categoryChipActive,
            ]}
          >
            <Ionicons
              name={category.icon as any}
              size={18}
              color={
                selectedCategory === category.id
                  ? Theme.colors.primary[500]
                  : Theme.colors.text.tertiary
              }
            />
            <Text
              style={[
                styles.categoryText,
                selectedCategory === category.id && styles.categoryTextActive,
              ]}
            >
              {category.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Results Count */}
      <View style={styles.resultsHeader}>
        <Text style={styles.resultsText}>
          {filteredExercises.length} {filteredExercises.length === 1 ? 'exercise' : 'exercises'}
        </Text>
        {(selectedCategory !== 'all' || selectedEquipment !== 'all') && (
          <TouchableOpacity 
            onPress={() => {
              setSelectedCategory('all');
              setSelectedEquipment('all');
            }}
          >
            <Text style={styles.clearFiltersText}>Clear filters</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Exercises List */}
      <FlatList
        data={filteredExercises}
        renderItem={renderExercise}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        initialNumToRender={15}
        maxToRenderPerBatch={10}
        windowSize={5}
      />

      {renderExerciseDetailModal()}
      {renderFiltersModal()}
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
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: Theme.typography.sizes['2xl'],
    fontWeight: Theme.typography.weights.bold,
    color: Theme.colors.text.primary,
  },
  filterButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    paddingHorizontal: Theme.spacing.xl,
    marginBottom: Theme.spacing.base,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.colors.background.secondary,
    borderRadius: Theme.borderRadius.lg,
    paddingHorizontal: Theme.spacing.base,
    paddingVertical: Theme.spacing.sm,
    gap: Theme.spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: Theme.typography.sizes.base,
    color: Theme.colors.text.primary,
  },
  categoriesContainer: {
    maxHeight: 50,
    marginBottom: Theme.spacing.base,
  },
  categoriesContent: {
    paddingHorizontal: Theme.spacing.xl,
    gap: Theme.spacing.sm,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Theme.spacing.base,
    paddingVertical: Theme.spacing.sm,
    borderRadius: Theme.borderRadius.full,
    backgroundColor: Theme.colors.background.secondary,
    gap: 6,
    marginRight: Theme.spacing.sm,
  },
  categoryChipActive: {
    backgroundColor: Theme.colors.primary[500] + '20',
  },
  categoryText: {
    fontSize: Theme.typography.sizes.sm,
    fontWeight: Theme.typography.weights.medium,
    color: Theme.colors.text.tertiary,
  },
  categoryTextActive: {
    color: Theme.colors.primary[500],
    fontWeight: Theme.typography.weights.semibold,
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Theme.spacing.xl,
    paddingVertical: Theme.spacing.sm,
  },
  resultsText: {
    fontSize: Theme.typography.sizes.sm,
    fontWeight: Theme.typography.weights.medium,
    color: Theme.colors.text.tertiary,
  },
  clearFiltersText: {
    fontSize: Theme.typography.sizes.sm,
    fontWeight: Theme.typography.weights.semibold,
    color: Theme.colors.primary[500],
  },
  listContent: {
    paddingHorizontal: Theme.spacing.xl,
    paddingBottom: Theme.spacing['2xl'],
  },
  exerciseItem: {
    marginBottom: Theme.spacing.base,
  },
  exerciseCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Theme.spacing.base,
    gap: Theme.spacing.base,
  },
  exerciseIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Theme.colors.primary[500] + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseName: {
    fontSize: Theme.typography.sizes.base,
    fontWeight: Theme.typography.weights.semibold,
    color: Theme.colors.text.primary,
    marginBottom: 4,
  },
  exerciseMeta: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: Theme.borderRadius.sm,
    backgroundColor: Theme.colors.primary[500] + '30',
  },
  badgeSecondary: {
    backgroundColor: Theme.colors.background.tertiary,
  },
  badgeAdvanced: {
    backgroundColor: Theme.colors.error[500] + '20',
  },
  badgeText: {
    fontSize: Theme.typography.sizes.xs,
    fontWeight: Theme.typography.weights.medium,
    color: Theme.colors.text.secondary,
    textTransform: 'capitalize',
  },
  infoButton: {
    padding: 4,
  },
  // Detail Modal
  detailModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'flex-end',
  },
  detailModalContent: {
    backgroundColor: Theme.colors.background.primary,
    borderTopLeftRadius: Theme.borderRadius.xl,
    borderTopRightRadius: Theme.borderRadius.xl,
    maxHeight: '85%',
  },
  detailModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.divider,
  },
  detailModalTitle: {
    fontSize: Theme.typography.sizes.xl,
    fontWeight: Theme.typography.weights.bold,
    color: Theme.colors.text.primary,
    flex: 1,
    textAlign: 'center',
    marginHorizontal: Theme.spacing.base,
  },
  detailModalScroll: {
    padding: Theme.spacing.lg,
    maxHeight: 400,
  },
  detailSection: {
    marginBottom: Theme.spacing.xl,
  },
  detailSectionTitle: {
    fontSize: Theme.typography.sizes.lg,
    fontWeight: Theme.typography.weights.bold,
    color: Theme.colors.text.primary,
    marginBottom: Theme.spacing.base,
  },
  detailBadges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Theme.spacing.sm,
  },
  detailBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Theme.spacing.base,
    paddingVertical: Theme.spacing.sm,
    borderRadius: Theme.borderRadius.lg,
    gap: 6,
  },
  muscleBadge: {
    backgroundColor: Theme.colors.primary[500] + '20',
  },
  equipmentBadge: {
    backgroundColor: Theme.colors.warning[500] + '20',
  },
  difficultyBadge: {
    backgroundColor: Theme.colors.background.tertiary,
  },
  beginnerBg: {
    backgroundColor: Theme.colors.success[500] + '20',
  },
  intermediateBg: {
    backgroundColor: Theme.colors.warning[500] + '20',
  },
  advancedBg: {
    backgroundColor: Theme.colors.error[500] + '20',
  },
  detailBadgeText: {
    fontSize: Theme.typography.sizes.sm,
    fontWeight: Theme.typography.weights.semibold,
    color: Theme.colors.text.primary,
    textTransform: 'capitalize',
  },
  secondaryMuscles: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Theme.spacing.sm,
  },
  secondaryBadge: {
    paddingHorizontal: Theme.spacing.sm,
    paddingVertical: 4,
    backgroundColor: Theme.colors.background.secondary,
    borderRadius: Theme.borderRadius.sm,
  },
  secondaryBadgeText: {
    fontSize: Theme.typography.sizes.sm,
    fontWeight: Theme.typography.weights.medium,
    color: Theme.colors.text.secondary,
    textTransform: 'capitalize',
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Theme.spacing.base,
    gap: Theme.spacing.base,
  },
  instructionNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Theme.colors.primary[500] + '30',
    justifyContent: 'center',
    alignItems: 'center',
  },
  instructionNumberText: {
    fontSize: Theme.typography.sizes.sm,
    fontWeight: Theme.typography.weights.bold,
    color: Theme.colors.primary[500],
  },
  instructionText: {
    flex: 1,
    fontSize: Theme.typography.sizes.base,
    fontWeight: Theme.typography.weights.regular,
    color: Theme.colors.text.secondary,
    lineHeight: 22,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Theme.spacing.sm,
    gap: Theme.spacing.sm,
    backgroundColor: Theme.colors.warning[500] + '10',
    padding: Theme.spacing.base,
    borderRadius: Theme.borderRadius.lg,
  },
  tipText: {
    flex: 1,
    fontSize: Theme.typography.sizes.sm,
    fontWeight: Theme.typography.weights.medium,
    color: Theme.colors.text.secondary,
  },
  detailModalFooter: {
    padding: Theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Theme.colors.divider,
  },
  // Filter Modal
  filterModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'flex-end',
  },
  filterModalContent: {
    backgroundColor: Theme.colors.background.primary,
    borderTopLeftRadius: Theme.borderRadius.xl,
    borderTopRightRadius: Theme.borderRadius.xl,
    maxHeight: '60%',
  },
  filterModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.divider,
  },
  filterModalTitle: {
    fontSize: Theme.typography.sizes.xl,
    fontWeight: Theme.typography.weights.bold,
    color: Theme.colors.text.primary,
  },
  clearText: {
    fontSize: Theme.typography.sizes.base,
    fontWeight: Theme.typography.weights.semibold,
    color: Theme.colors.primary[500],
  },
  filterModalScroll: {
    padding: Theme.spacing.lg,
  },
  filterSectionTitle: {
    fontSize: Theme.typography.sizes.lg,
    fontWeight: Theme.typography.weights.bold,
    color: Theme.colors.text.primary,
    marginBottom: Theme.spacing.base,
  },
  filterGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Theme.spacing.sm,
  },
  filterChip: {
    paddingHorizontal: Theme.spacing.base,
    paddingVertical: Theme.spacing.sm,
    backgroundColor: Theme.colors.background.secondary,
    borderRadius: Theme.borderRadius.lg,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  filterChipSelected: {
    backgroundColor: Theme.colors.primary[500] + '20',
    borderColor: Theme.colors.primary[500],
  },
  filterChipText: {
    fontSize: Theme.typography.sizes.sm,
    fontWeight: Theme.typography.weights.medium,
    color: Theme.colors.text.secondary,
  },
  filterChipTextSelected: {
    color: Theme.colors.primary[500],
    fontWeight: Theme.typography.weights.semibold,
  },
  filterModalFooter: {
    padding: Theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Theme.colors.divider,
  },
});
