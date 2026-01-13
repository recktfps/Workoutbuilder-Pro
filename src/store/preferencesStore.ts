/**
 * User Preferences Store
 * Manages user settings with persistence
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface UserPreferences {
  weightUnit: 'kg' | 'lbs';
  defaultRestTimer: number; // seconds
  hapticFeedback: boolean;
  restTimerSound: boolean;
  restTimerVibrate: boolean;
  autoStartRestTimer: boolean;
  showPreviousWorkout: boolean;
  showPlateCalculator: boolean;
  theme: 'dark' | 'midnight' | 'amoled';
}

interface PreferencesState {
  preferences: UserPreferences;
  updatePreference: <K extends keyof UserPreferences>(
    key: K,
    value: UserPreferences[K]
  ) => void;
  resetPreferences: () => void;
}

const defaultPreferences: UserPreferences = {
  weightUnit: 'lbs',
  defaultRestTimer: 90,
  hapticFeedback: true,
  restTimerSound: true,
  restTimerVibrate: true,
  autoStartRestTimer: true,
  showPreviousWorkout: true,
  showPlateCalculator: false,
  theme: 'dark',
};

export const usePreferencesStore = create<PreferencesState>()(
  persist(
    (set) => ({
      preferences: defaultPreferences,
      
      updatePreference: (key, value) =>
        set((state) => ({
          preferences: {
            ...state.preferences,
            [key]: value,
          },
        })),
      
      resetPreferences: () =>
        set({ preferences: defaultPreferences }),
    }),
    {
      name: 'workout-preferences',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

export default usePreferencesStore;

