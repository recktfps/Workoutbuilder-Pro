import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Card, Button, Theme } from '../../src/ui';
import { useTemplateStore } from '../../src/store/templateStore';
import { WorkoutTemplate } from '../../src/data/templates';

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

export default function ProgramsScreen() {
  const [activeTab, setActiveTab] = useState<'my' | 'templates'>('my');
  const [showNewProgramModal, setShowNewProgramModal] = useState(false);
  const [newProgramName, setNewProgramName] = useState('');
  const [selectedType, setSelectedType] = useState<string>('custom');
  const [showTemplateOptions, setShowTemplateOptions] = useState<string | null>(null);
  
  const { 
    getAllTemplates, 
    userTemplates, 
    addUserTemplate, 
    deleteUserTemplate,
    duplicateTemplate,
    toggleFavorite,
    isFavorite,
  } = useTemplateStore();
  
  const allTemplates = getAllTemplates();
  const defaultTemplates = allTemplates.filter(t => t.isDefault);

  const handleCreateProgram = () => {
    if (!newProgramName.trim()) {
      Alert.alert('Error', 'Please enter a program name');
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    addUserTemplate({
      name: newProgramName.trim(),
      description: 'Custom workout program',
      type: selectedType as any,
      difficulty: 'intermediate',
      duration: '45-60 min',
      muscleGroups: [],
      exercises: [],
      isPremium: false,
    });

    setNewProgramName('');
    setSelectedType('custom');
    setShowNewProgramModal(false);
  };

  const handleTemplatePress = (template: WorkoutTemplate) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/workout-start` as any);
  };

  const handleTemplateOptions = (templateId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowTemplateOptions(templateId);
  };

  const handleDuplicate = (templateId: string) => {
    duplicateTemplate(templateId);
    setShowTemplateOptions(null);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleDelete = (templateId: string) => {
    Alert.alert(
      'Delete Program',
      'Are you sure you want to delete this program?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteUserTemplate(templateId);
            setShowTemplateOptions(null);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          },
        },
      ]
    );
  };

  const handleEditTemplate = (templateId: string) => {
    setShowTemplateOptions(null);
    router.push(`/program-builder?programId=${templateId}` as any);
  };

  const renderTemplateCard = (template: WorkoutTemplate, index: number) => (
    <Animated.View 
      key={template.id}
      entering={FadeInDown.duration(400).delay(index * 50)}
    >
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => handleTemplatePress(template)}
        onLongPress={() => handleTemplateOptions(template.id)}
      >
        <Card style={styles.templateCard}>
          <View style={styles.templateHeader}>
            <View style={styles.templateIconContainer}>
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
            <View style={styles.templateInfo}>
              <Text style={styles.templateName}>{template.name}</Text>
              <Text style={styles.templateMeta}>
                {template.exercises.length} exercises • {template.duration}
              </Text>
            </View>
            <View style={styles.templateActions}>
              <TouchableOpacity 
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  toggleFavorite(template.id);
                }}
                style={styles.favoriteButton}
              >
                <Ionicons 
                  name={isFavorite(template.id) ? "heart" : "heart-outline"} 
                  size={20} 
                  color={isFavorite(template.id) ? Theme.colors.error[500] : Theme.colors.text.tertiary} 
                />
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={() => handleTemplateOptions(template.id)}
                style={styles.moreButton}
              >
                <Ionicons name="ellipsis-vertical" size={20} color={Theme.colors.text.tertiary} />
              </TouchableOpacity>
            </View>
          </View>
          
          <View style={styles.templateBadges}>
            <View style={[
              styles.difficultyBadge,
              template.difficulty === 'beginner' && styles.beginnerBadge,
              template.difficulty === 'intermediate' && styles.intermediateBadge,
              template.difficulty === 'advanced' && styles.advancedBadge,
            ]}>
              <Text style={styles.badgeText}>{template.difficulty}</Text>
            </View>
            <View style={styles.typeBadge}>
              <Text style={styles.badgeText}>{template.type}</Text>
            </View>
          </View>

          {template.muscleGroups.length > 0 && (
            <Text style={styles.muscleGroups} numberOfLines={1}>
              {template.muscleGroups.join(' • ')}
            </Text>
          )}
        </Card>
      </TouchableOpacity>
    </Animated.View>
  );

  const renderOptionsModal = () => {
    const template = allTemplates.find(t => t.id === showTemplateOptions);
    if (!template) return null;

    return (
      <Modal
        visible={showTemplateOptions !== null}
        animationType="fade"
        transparent
        onRequestClose={() => setShowTemplateOptions(null)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowTemplateOptions(null)}
        >
          <View style={styles.optionsModal}>
            <Text style={styles.optionsTitle}>{template.name}</Text>
            
            <TouchableOpacity 
              style={styles.optionItem}
              onPress={() => {
                setShowTemplateOptions(null);
                router.push(`/workout-start` as any);
              }}
            >
              <Ionicons name="play" size={20} color={Theme.colors.text.primary} />
              <Text style={styles.optionText}>Start Workout</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.optionItem}
              onPress={() => handleEditTemplate(template.id)}
            >
              <Ionicons name="create" size={20} color={Theme.colors.text.primary} />
              <Text style={styles.optionText}>Edit Program</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.optionItem}
              onPress={() => handleDuplicate(template.id)}
            >
              <Ionicons name="copy" size={20} color={Theme.colors.text.primary} />
              <Text style={styles.optionText}>Duplicate</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.optionItem}
              onPress={() => {
                toggleFavorite(template.id);
                setShowTemplateOptions(null);
              }}
            >
              <Ionicons 
                name={isFavorite(template.id) ? "heart-dislike" : "heart"} 
                size={20} 
                color={Theme.colors.text.primary} 
              />
              <Text style={styles.optionText}>
                {isFavorite(template.id) ? 'Remove from Favorites' : 'Add to Favorites'}
              </Text>
            </TouchableOpacity>

            {!template.isDefault && (
              <TouchableOpacity 
                style={[styles.optionItem, styles.deleteOption]}
                onPress={() => handleDelete(template.id)}
              >
                <Ionicons name="trash" size={20} color={Theme.colors.error[500]} />
                <Text style={[styles.optionText, styles.deleteText]}>Delete</Text>
              </TouchableOpacity>
            )}
          </View>
        </TouchableOpacity>
      </Modal>
    );
  };

  const renderNewProgramModal = () => (
    <Modal
      visible={showNewProgramModal}
      animationType="slide"
      transparent
      onRequestClose={() => setShowNewProgramModal(false)}
    >
      <View style={styles.newProgramOverlay}>
        <View style={styles.newProgramModal}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowNewProgramModal(false)}>
              <Ionicons name="close" size={24} color={Theme.colors.text.primary} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>New Program</Text>
            <View style={{ width: 24 }} />
          </View>

          <ScrollView style={styles.modalContent}>
            <Text style={styles.inputLabel}>Program Name</Text>
            <TextInput
              style={styles.textInput}
              placeholder="My Custom Program"
              placeholderTextColor={Theme.colors.text.tertiary}
              value={newProgramName}
              onChangeText={setNewProgramName}
              autoCapitalize="words"
            />

            <Text style={styles.inputLabel}>Program Type</Text>
            <View style={styles.typeGrid}>
              {[
                { id: 'push', name: 'Push', icon: 'arrow-forward-circle' },
                { id: 'pull', name: 'Pull', icon: 'arrow-back-circle' },
                { id: 'legs', name: 'Legs', icon: 'walk' },
                { id: 'full', name: 'Full Body', icon: 'flash' },
                { id: 'upper', name: 'Upper', icon: 'body' },
                { id: 'lower', name: 'Lower', icon: 'walk-outline' },
                { id: 'arms', name: 'Arms', icon: 'barbell' },
                { id: 'custom', name: 'Custom', icon: 'create' },
              ].map((type) => (
                <TouchableOpacity
                  key={type.id}
                  style={[
                    styles.typeOption,
                    selectedType === type.id && styles.typeOptionSelected,
                  ]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setSelectedType(type.id);
                  }}
                >
                  <Ionicons 
                    name={type.icon as any} 
                    size={24} 
                    color={selectedType === type.id ? Theme.colors.primary[500] : Theme.colors.text.tertiary} 
                  />
                  <Text style={[
                    styles.typeName,
                    selectedType === type.id && styles.typeNameSelected,
                  ]}>
                    {type.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <Button
              title="Create Program"
              onPress={handleCreateProgram}
              gradient={Theme.gradients.primary}
              icon={<Ionicons name="add" size={20} color="#fff" />}
            />
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Programs</Text>
        <TouchableOpacity 
          onPress={() => setShowNewProgramModal(true)}
          style={styles.addButton}
        >
          <LinearGradient
            colors={Theme.gradients.primary}
            style={styles.addButtonGradient}
          >
            <Ionicons name="add" size={24} color="#fff" />
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'my' && styles.tabActive]}
          onPress={() => setActiveTab('my')}
        >
          <Text style={[styles.tabText, activeTab === 'my' && styles.tabTextActive]}>
            My Programs
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'templates' && styles.tabActive]}
          onPress={() => setActiveTab('templates')}
        >
          <Text style={[styles.tabText, activeTab === 'templates' && styles.tabTextActive]}>
            Templates
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {activeTab === 'my' ? (
          <View style={styles.section}>
            {userTemplates.length === 0 ? (
              <Card style={styles.emptyState}>
                <Ionicons name="folder-open-outline" size={64} color={Theme.colors.text.tertiary} />
                <Text style={styles.emptyTitle}>No Custom Programs</Text>
                <Text style={styles.emptySubtitle}>
                  Create your own workout programs or duplicate a template to get started
                </Text>
                <Button
                  title="Create Program"
                  onPress={() => setShowNewProgramModal(true)}
                  variant="outline"
                  size="sm"
                  style={{ marginTop: Theme.spacing.lg }}
                />
              </Card>
            ) : (
              userTemplates.map((template, index) => renderTemplateCard(template, index))
            )}
          </View>
        ) : (
          <>
            {/* Beginner Templates */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Beginner</Text>
              {defaultTemplates
                .filter(t => t.difficulty === 'beginner')
                .map((template, index) => renderTemplateCard(template, index))}
            </View>

            {/* Intermediate Templates */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Intermediate</Text>
              {defaultTemplates
                .filter(t => t.difficulty === 'intermediate')
                .map((template, index) => renderTemplateCard(template, index))}
            </View>

            {/* Advanced Templates */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Advanced</Text>
              {defaultTemplates
                .filter(t => t.difficulty === 'advanced')
                .map((template, index) => renderTemplateCard(template, index))}
            </View>
          </>
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {renderOptionsModal()}
      {renderNewProgramModal()}
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
    paddingHorizontal: Theme.spacing.xl,
    paddingVertical: Theme.spacing.lg,
  },
  title: {
    fontSize: Theme.typography.sizes['3xl'],
    fontWeight: Theme.typography.weights.black,
    color: Theme.colors.text.primary,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
  },
  addButtonGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: Theme.spacing.xl,
    marginBottom: Theme.spacing.lg,
    gap: Theme.spacing.base,
  },
  tab: {
    flex: 1,
    paddingVertical: Theme.spacing.sm,
    alignItems: 'center',
    borderRadius: Theme.borderRadius.lg,
    backgroundColor: Theme.colors.background.secondary,
  },
  tabActive: {
    backgroundColor: Theme.colors.primary[500],
  },
  tabText: {
    fontSize: Theme.typography.sizes.sm,
    fontWeight: Theme.typography.weights.semibold,
    color: Theme.colors.text.tertiary,
  },
  tabTextActive: {
    color: '#fff',
  },
  section: {
    paddingHorizontal: Theme.spacing.xl,
    marginBottom: Theme.spacing.xl,
  },
  sectionTitle: {
    fontSize: Theme.typography.sizes.lg,
    fontWeight: Theme.typography.weights.bold,
    color: Theme.colors.text.primary,
    marginBottom: Theme.spacing.base,
  },
  templateCard: {
    padding: Theme.spacing.base,
    marginBottom: Theme.spacing.base,
  },
  templateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  templateIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    overflow: 'hidden',
    marginRight: Theme.spacing.base,
  },
  templateIconGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  templateInfo: {
    flex: 1,
  },
  templateName: {
    fontSize: Theme.typography.sizes.base,
    fontWeight: Theme.typography.weights.semibold,
    color: Theme.colors.text.primary,
  },
  templateMeta: {
    fontSize: Theme.typography.sizes.sm,
    fontWeight: Theme.typography.weights.medium,
    color: Theme.colors.text.tertiary,
    marginTop: 2,
  },
  templateActions: {
    flexDirection: 'row',
    gap: Theme.spacing.sm,
  },
  favoriteButton: {
    padding: 4,
  },
  moreButton: {
    padding: 4,
  },
  templateBadges: {
    flexDirection: 'row',
    gap: Theme.spacing.sm,
    marginTop: Theme.spacing.sm,
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
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: Theme.colors.primary[500] + '20',
  },
  badgeText: {
    fontSize: Theme.typography.sizes.xs,
    fontWeight: Theme.typography.weights.semibold,
    color: Theme.colors.text.secondary,
    textTransform: 'capitalize',
  },
  muscleGroups: {
    fontSize: Theme.typography.sizes.xs,
    fontWeight: Theme.typography.weights.medium,
    color: Theme.colors.text.tertiary,
    marginTop: Theme.spacing.sm,
    textTransform: 'capitalize',
  },
  emptyState: {
    padding: Theme.spacing['2xl'],
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: Theme.typography.sizes.xl,
    fontWeight: Theme.typography.weights.bold,
    color: Theme.colors.text.primary,
    marginTop: Theme.spacing.lg,
  },
  emptySubtitle: {
    fontSize: Theme.typography.sizes.sm,
    fontWeight: Theme.typography.weights.medium,
    color: Theme.colors.text.tertiary,
    textAlign: 'center',
    marginTop: Theme.spacing.sm,
    paddingHorizontal: Theme.spacing.lg,
  },
  bottomSpacer: {
    height: Theme.spacing['2xl'],
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionsModal: {
    backgroundColor: Theme.colors.background.secondary,
    borderRadius: Theme.borderRadius.xl,
    padding: Theme.spacing.lg,
    width: '80%',
  },
  optionsTitle: {
    fontSize: Theme.typography.sizes.lg,
    fontWeight: Theme.typography.weights.bold,
    color: Theme.colors.text.primary,
    marginBottom: Theme.spacing.lg,
    textAlign: 'center',
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Theme.spacing.base,
    gap: Theme.spacing.base,
  },
  optionText: {
    fontSize: Theme.typography.sizes.base,
    fontWeight: Theme.typography.weights.medium,
    color: Theme.colors.text.primary,
  },
  deleteOption: {
    borderTopWidth: 1,
    borderTopColor: Theme.colors.divider,
    marginTop: Theme.spacing.sm,
    paddingTop: Theme.spacing.lg,
  },
  deleteText: {
    color: Theme.colors.error[500],
  },
  newProgramOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'flex-end',
  },
  newProgramModal: {
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
  modalContent: {
    padding: Theme.spacing.lg,
  },
  inputLabel: {
    fontSize: Theme.typography.sizes.sm,
    fontWeight: Theme.typography.weights.semibold,
    color: Theme.colors.text.secondary,
    marginBottom: Theme.spacing.sm,
  },
  textInput: {
    backgroundColor: Theme.colors.background.secondary,
    borderRadius: Theme.borderRadius.lg,
    padding: Theme.spacing.base,
    fontSize: Theme.typography.sizes.base,
    color: Theme.colors.text.primary,
    marginBottom: Theme.spacing.xl,
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Theme.spacing.sm,
  },
  typeOption: {
    width: '23%',
    aspectRatio: 1,
    backgroundColor: Theme.colors.background.secondary,
    borderRadius: Theme.borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  typeOptionSelected: {
    borderColor: Theme.colors.primary[500],
    backgroundColor: Theme.colors.primary[500] + '10',
  },
  typeName: {
    fontSize: Theme.typography.sizes.xs,
    fontWeight: Theme.typography.weights.medium,
    color: Theme.colors.text.tertiary,
    marginTop: 4,
    textAlign: 'center',
  },
  typeNameSelected: {
    color: Theme.colors.primary[500],
    fontWeight: Theme.typography.weights.semibold,
  },
  modalFooter: {
    padding: Theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Theme.colors.divider,
  },
});
