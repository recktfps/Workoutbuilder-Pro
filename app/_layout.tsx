import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SplashScreen from 'expo-splash-screen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { db } from '../src/services/database';
import Theme from '../src/ui/theme';

// Keep splash screen visible while we load resources
SplashScreen.preventAutoHideAsync();

const ONBOARDING_KEY = '@workoutbuilder_onboarding_complete';

export default function RootLayout() {
  const [appReady, setAppReady] = useState(false);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        // Initialize database
        await db.init();

        // Check onboarding status
        const onboardingComplete = await AsyncStorage.getItem(ONBOARDING_KEY);
        setHasCompletedOnboarding(onboardingComplete === 'true');

        // Small delay for smooth experience
        await new Promise((resolve) => setTimeout(resolve, 1000));
      } catch (error) {
        console.error('Error during app initialization:', error);
      } finally {
        setAppReady(true);
        await SplashScreen.hideAsync();
      }
    }

    prepare();
  }, []);

  if (!appReady) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: Theme.colors.background.primary },
          animation: 'fade',
        }}
      >
        {!hasCompletedOnboarding ? (
          <Stack.Screen name="onboarding" />
        ) : (
          <>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen
              name="workout-start"
              options={{
                presentation: 'modal',
                animation: 'slide_from_bottom',
              }}
            />
            <Stack.Screen name="workout-in-progress" />
            <Stack.Screen name="exercise-library" />
            <Stack.Screen
              name="workout-complete"
              options={{
                presentation: 'modal',
                animation: 'fade',
              }}
            />
            <Stack.Screen name="exercise-detail" />
            <Stack.Screen name="program-builder" />
          </>
        )}
      </Stack>
    </GestureHandlerRootView>
  );
}
