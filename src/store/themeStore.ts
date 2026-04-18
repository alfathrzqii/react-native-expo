import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type ThemePreference = 'system' | 'light' | 'dark';

interface ThemeState {
  themePreference: ThemePreference;
  isLoaded: boolean;
  setThemePreference: (preference: ThemePreference) => Promise<void>;
  loadThemePreference: () => Promise<void>;
}

const THEME_STORAGE_KEY = 'remindy_theme_preference';

export const useThemeStore = create<ThemeState>((set) => ({
  themePreference: 'system',
  isLoaded: false,

  setThemePreference: async (preference) => {
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, preference);
      set({ themePreference: preference });
    } catch (error) {
      console.error('Failed to save theme preference', error);
    }
  },

  loadThemePreference: async () => {
    try {
      const storedPreference = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      if (storedPreference === 'system' || storedPreference === 'light' || storedPreference === 'dark') {
        set({ themePreference: storedPreference, isLoaded: true });
      } else {
        set({ themePreference: 'system', isLoaded: true }); // Default to system
      }
    } catch (error) {
      console.error('Failed to load theme preference', error);
      set({ isLoaded: true }); // Still mark as loaded even if failed
    }
  },
}));
