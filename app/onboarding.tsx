import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  FlatList,
  Image,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { Button, Theme } from '../src/ui';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const ONBOARDING_KEY = '@workoutbuilder_onboarding_complete';

const slides = [
  {
    id: '1',
    title: 'Your Strength,\nVisualized',
    subtitle: 'Beautiful progress tracking meets powerful workout logging',
    gradient: Theme.gradients.heroMesh,
    icon: '💪',
  },
  {
    id: '2',
    title: 'Exercise Library\nWith Precision',
    subtitle: '500+ exercises with animated demos and muscle group highlights',
    gradient: Theme.gradients.accentBlue,
    icon: '🎯',
  },
  {
    id: '3',
    title: 'Progress That\nMotivates',
    subtitle: 'Watch your gains come alive through gradient-filled analytics',
    gradient: Theme.gradients.cool,
    icon: '📊',
  },
];

export default function OnboardingScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
    } else {
      handleGetStarted();
    }
  };

  const handleGetStarted = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
    router.replace('/(tabs)');
  };

  const renderSlide = ({ item, index }: { item: typeof slides[0]; index: number }) => {
    return (
      <View style={styles.slide}>
        <LinearGradient
          colors={item.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />

        <View style={styles.content}>
          <Animated.View
            entering={FadeInUp.duration(600).delay(200)}
            style={styles.iconContainer}
          >
            <Text style={styles.icon}>{item.icon}</Text>
          </Animated.View>

          <Animated.Text
            entering={FadeInUp.duration(600).delay(400)}
            style={styles.title}
          >
            {item.title}
          </Animated.Text>

          <Animated.Text
            entering={FadeInUp.duration(600).delay(600)}
            style={styles.subtitle}
          >
            {item.subtitle}
          </Animated.Text>
        </View>

        {index === currentIndex && (
          <Animated.View
            entering={FadeInDown.duration(600).delay(800)}
            style={styles.buttonContainer}
          >
            <View style={styles.pagination}>
              {slides.map((_, i) => (
                <View
                  key={i}
                  style={[
                    styles.dot,
                    i === currentIndex && styles.dotActive,
                  ]}
                />
              ))}
            </View>

            <Button
              title={currentIndex === slides.length - 1 ? 'Start Training' : 'Next'}
              onPress={handleNext}
              gradient={Theme.gradients.primary}
              size="lg"
              fullWidth
            />

            {currentIndex < slides.length - 1 && (
              <TouchableOpacity
                onPress={handleGetStarted}
                style={styles.skipButton}
              >
                <Text style={styles.skipText}>Skip</Text>
              </TouchableOpacity>
            )}
          </Animated.View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={slides}
        renderItem={renderSlide}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(event) => {
          const index = Math.round(
            event.nativeEvent.contentOffset.x / SCREEN_WIDTH
          );
          setCurrentIndex(index);
        }}
        scrollEnabled={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background.primary,
  },
  slide: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    justifyContent: 'space-between',
    paddingVertical: Theme.spacing['5xl'],
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Theme.spacing['2xl'],
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Theme.spacing['2xl'],
  },
  icon: {
    fontSize: 64,
  },
  title: {
    fontSize: Theme.typography.sizes['4xl'],
    fontWeight: Theme.typography.weights.black,
    color: Theme.colors.text.primary,
    textAlign: 'center',
    marginBottom: Theme.spacing.lg,
    lineHeight: Theme.typography.sizes['4xl'] * 1.2,
  },
  subtitle: {
    fontSize: Theme.typography.sizes.lg,
    fontWeight: Theme.typography.weights.medium,
    color: Theme.colors.text.secondary,
    textAlign: 'center',
    lineHeight: Theme.typography.sizes.lg * 1.5,
    paddingHorizontal: Theme.spacing.xl,
  },
  buttonContainer: {
    paddingHorizontal: Theme.spacing['2xl'],
    paddingBottom: Theme.spacing.xl,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Theme.spacing.xl,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Theme.colors.text.tertiary,
    marginHorizontal: 4,
  },
  dotActive: {
    width: 24,
    backgroundColor: Theme.colors.primary[500],
  },
  skipButton: {
    marginTop: Theme.spacing.base,
    alignItems: 'center',
    paddingVertical: Theme.spacing.md,
  },
  skipText: {
    fontSize: Theme.typography.sizes.base,
    fontWeight: Theme.typography.weights.semibold,
    color: Theme.colors.text.secondary,
  },
});

