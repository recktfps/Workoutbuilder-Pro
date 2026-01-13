import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Card, Theme } from '../../src/ui';
import { usePreferencesStore } from '../../src/store/preferencesStore';

const REST_TIMER_OPTIONS = [30, 45, 60, 90, 120, 180, 240, 300];
const WEIGHT_UNIT_OPTIONS: Array<'kg' | 'lbs'> = ['lbs', 'kg'];

export default function ProfileScreen() {
  const [showRestTimerModal, setShowRestTimerModal] = useState(false);
  const [showWeightUnitModal, setShowWeightUnitModal] = useState(false);
  
  const { preferences, updatePreference } = usePreferencesStore();

  const handleToggleHaptic = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    updatePreference('hapticFeedback', !preferences.hapticFeedback);
  };

  const handleToggleAutoRest = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    updatePreference('autoStartRestTimer', !preferences.autoStartRestTimer);
  };

  const handleToggleRestSound = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    updatePreference('restTimerSound', !preferences.restTimerSound);
  };

  const handleToggleRestVibrate = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    updatePreference('restTimerVibrate', !preferences.restTimerVibrate);
  };

  const formatRestTime = (seconds: number) => {
    if (seconds < 60) return `${seconds} sec`;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return secs > 0 ? `${mins}m ${secs}s` : `${mins} min`;
  };

  const renderRestTimerModal = () => (
    <Modal
      visible={showRestTimerModal}
      animationType="slide"
      transparent
      onRequestClose={() => setShowRestTimerModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Default Rest Timer</Text>
            <TouchableOpacity onPress={() => setShowRestTimerModal(false)}>
              <Ionicons name="close" size={24} color={Theme.colors.text.primary} />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalScroll}>
            {REST_TIMER_OPTIONS.map((seconds) => (
              <TouchableOpacity
                key={seconds}
                style={[
                  styles.optionItem,
                  preferences.defaultRestTimer === seconds && styles.optionItemSelected,
                ]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  updatePreference('defaultRestTimer', seconds);
                  setShowRestTimerModal(false);
                }}
              >
                <Text style={[
                  styles.optionText,
                  preferences.defaultRestTimer === seconds && styles.optionTextSelected,
                ]}>
                  {formatRestTime(seconds)}
                </Text>
                {preferences.defaultRestTimer === seconds && (
                  <Ionicons name="checkmark-circle" size={24} color={Theme.colors.primary[500]} />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  const renderWeightUnitModal = () => (
    <Modal
      visible={showWeightUnitModal}
      animationType="slide"
      transparent
      onRequestClose={() => setShowWeightUnitModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Weight Unit</Text>
            <TouchableOpacity onPress={() => setShowWeightUnitModal(false)}>
              <Ionicons name="close" size={24} color={Theme.colors.text.primary} />
            </TouchableOpacity>
          </View>
          <View style={styles.modalScroll}>
            {WEIGHT_UNIT_OPTIONS.map((unit) => (
              <TouchableOpacity
                key={unit}
                style={[
                  styles.optionItem,
                  preferences.weightUnit === unit && styles.optionItemSelected,
                ]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  updatePreference('weightUnit', unit);
                  setShowWeightUnitModal(false);
                }}
              >
                <View>
                  <Text style={[
                    styles.optionText,
                    preferences.weightUnit === unit && styles.optionTextSelected,
                  ]}>
                    {unit === 'lbs' ? 'Pounds (lbs)' : 'Kilograms (kg)'}
                  </Text>
                  <Text style={styles.optionSubtext}>
                    {unit === 'lbs' ? 'Imperial system' : 'Metric system'}
                  </Text>
                </View>
                {preferences.weightUnit === unit && (
                  <Ionicons name="checkmark-circle" size={24} color={Theme.colors.primary[500]} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Profile</Text>
        </View>

        {/* Workout Settings */}
        <Animated.View entering={FadeInDown.duration(400).delay(100)} style={styles.section}>
          <Text style={styles.sectionTitle}>Workout Settings</Text>
          <Card style={styles.settingsCard}>
            <TouchableOpacity onPress={() => setShowWeightUnitModal(true)}>
              <SettingsItem
                icon="barbell-outline"
                title="Weight Unit"
                value={preferences.weightUnit.toUpperCase()}
              />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setShowRestTimerModal(true)}>
              <SettingsItem
                icon="time-outline"
                title="Default Rest Timer"
                value={formatRestTime(preferences.defaultRestTimer)}
              />
            </TouchableOpacity>
            <SettingsItemToggle
              icon="play-circle-outline"
              title="Auto-start Rest Timer"
              subtitle="Start timer after completing a set"
              value={preferences.autoStartRestTimer}
              onToggle={handleToggleAutoRest}
            />
          </Card>
        </Animated.View>

        {/* Rest Timer Settings */}
        <Animated.View entering={FadeInDown.duration(400).delay(200)} style={styles.section}>
          <Text style={styles.sectionTitle}>Rest Timer Alerts</Text>
          <Card style={styles.settingsCard}>
            <SettingsItemToggle
              icon="volume-high-outline"
              title="Sound"
              subtitle="Play sound when timer ends"
              value={preferences.restTimerSound}
              onToggle={handleToggleRestSound}
            />
            <SettingsItemToggle
              icon="phone-portrait-outline"
              title="Vibration"
              subtitle="Vibrate when timer ends"
              value={preferences.restTimerVibrate}
              onToggle={handleToggleRestVibrate}
            />
          </Card>
        </Animated.View>

        {/* General Settings */}
        <Animated.View entering={FadeInDown.duration(400).delay(300)} style={styles.section}>
          <Text style={styles.sectionTitle}>General</Text>
          <Card style={styles.settingsCard}>
            <SettingsItemToggle
              icon="hand-left-outline"
              title="Haptic Feedback"
              subtitle="Vibrate on button presses"
              value={preferences.hapticFeedback}
              onToggle={handleToggleHaptic}
            />
          </Card>
        </Animated.View>

        {/* Data & Privacy */}
        <Animated.View entering={FadeInDown.duration(400).delay(400)} style={styles.section}>
          <Text style={styles.sectionTitle}>Data & Privacy</Text>
          <Card style={styles.settingsCard}>
            <SettingsItem
              icon="bug-outline"
              title="Debug Analytics"
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.push('/debug-analytics' as any);
              }}
            />
            <SettingsItem
              icon="download-outline"
              title="Export Workout Data"
              onPress={() => Alert.alert('Export', 'Workout data export coming soon!')}
            />
            <SettingsItem
              icon="trash-outline"
              title="Clear Workout History"
              onPress={() => {
                Alert.alert(
                  'Clear History',
                  'Are you sure you want to clear all workout history? This cannot be undone.',
                  [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Clear', style: 'destructive', onPress: () => {} },
                  ]
                );
              }}
            />
          </Card>
        </Animated.View>

        {/* Support */}
        <Animated.View entering={FadeInDown.duration(400).delay(500)} style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>
          <Card style={styles.settingsCard}>
            <SettingsItem
              icon="help-circle-outline"
              title="Help Center"
              onPress={() => {}}
            />
            <SettingsItem
              icon="chatbubble-outline"
              title="Send Feedback"
              onPress={() => {}}
            />
            <SettingsItem
              icon="document-text-outline"
              title="Privacy Policy"
              onPress={() => {}}
            />
            <SettingsItem
              icon="star-outline"
              title="Rate App"
              onPress={() => {}}
            />
          </Card>
        </Animated.View>

        {/* App Info */}
        <View style={styles.appInfo}>
          <Text style={styles.appVersion}>WorkoutBuilder Pro v1.0.0</Text>
          <Text style={styles.copyright}>© 2026 WorkoutBuilder</Text>
        </View>
      </ScrollView>

      {renderRestTimerModal()}
      {renderWeightUnitModal()}
    </SafeAreaView>
  );
}

interface SettingsItemProps {
  icon: any;
  title: string;
  value?: string;
  onPress?: () => void;
}

const SettingsItem: React.FC<SettingsItemProps> = ({ icon, title, value, onPress }) => {
  const content = (
    <View style={styles.settingsItem}>
      <View style={styles.settingsItemLeft}>
        <Ionicons name={icon} size={24} color={Theme.colors.text.secondary} />
        <Text style={styles.settingsItemTitle}>{title}</Text>
      </View>
      <View style={styles.settingsItemRight}>
        {value && <Text style={styles.settingsItemValue}>{value}</Text>}
        <Ionicons name="chevron-forward" size={20} color={Theme.colors.text.tertiary} />
      </View>
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
};

interface SettingsItemToggleProps {
  icon: any;
  title: string;
  subtitle?: string;
  value: boolean;
  onToggle: () => void;
}

const SettingsItemToggle: React.FC<SettingsItemToggleProps> = ({
  icon,
  title,
  subtitle,
  value,
  onToggle,
}) => (
  <View style={styles.settingsItem}>
    <View style={styles.settingsItemLeft}>
      <Ionicons name={icon} size={24} color={Theme.colors.text.secondary} />
      <View>
        <Text style={styles.settingsItemTitle}>{title}</Text>
        {subtitle && <Text style={styles.settingsItemSubtitle}>{subtitle}</Text>}
      </View>
    </View>
    <Switch
      value={value}
      onValueChange={onToggle}
      trackColor={{ false: Theme.colors.background.tertiary, true: Theme.colors.primary[500] }}
      thumbColor="#fff"
    />
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background.primary,
  },
  header: {
    paddingHorizontal: Theme.spacing.xl,
    paddingVertical: Theme.spacing.lg,
  },
  title: {
    fontSize: Theme.typography.sizes['3xl'],
    fontWeight: Theme.typography.weights.black,
    color: Theme.colors.text.primary,
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
  settingsCard: {
    padding: 0,
    overflow: 'hidden',
  },
  settingsItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Theme.spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.divider,
  },
  settingsItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.base,
    flex: 1,
  },
  settingsItemTitle: {
    fontSize: Theme.typography.sizes.base,
    fontWeight: Theme.typography.weights.medium,
    color: Theme.colors.text.primary,
  },
  settingsItemSubtitle: {
    fontSize: Theme.typography.sizes.xs,
    fontWeight: Theme.typography.weights.regular,
    color: Theme.colors.text.tertiary,
    marginTop: 2,
  },
  settingsItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.sm,
  },
  settingsItemValue: {
    fontSize: Theme.typography.sizes.base,
    fontWeight: Theme.typography.weights.medium,
    color: Theme.colors.text.tertiary,
  },
  appInfo: {
    alignItems: 'center',
    paddingVertical: Theme.spacing['2xl'],
  },
  appVersion: {
    fontSize: Theme.typography.sizes.sm,
    fontWeight: Theme.typography.weights.medium,
    color: Theme.colors.text.tertiary,
  },
  copyright: {
    fontSize: Theme.typography.sizes.xs,
    fontWeight: Theme.typography.weights.regular,
    color: Theme.colors.text.disabled,
    marginTop: 4,
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
    maxHeight: '60%',
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
  },
  optionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Theme.spacing.base,
    paddingHorizontal: Theme.spacing.lg,
    borderRadius: Theme.borderRadius.lg,
    marginBottom: Theme.spacing.sm,
    backgroundColor: Theme.colors.background.secondary,
  },
  optionItemSelected: {
    backgroundColor: Theme.colors.primary[500] + '20',
    borderWidth: 1,
    borderColor: Theme.colors.primary[500],
  },
  optionText: {
    fontSize: Theme.typography.sizes.base,
    fontWeight: Theme.typography.weights.medium,
    color: Theme.colors.text.primary,
  },
  optionTextSelected: {
    color: Theme.colors.primary[500],
    fontWeight: Theme.typography.weights.semibold,
  },
  optionSubtext: {
    fontSize: Theme.typography.sizes.sm,
    fontWeight: Theme.typography.weights.regular,
    color: Theme.colors.text.tertiary,
    marginTop: 2,
  },
});
