import createContextHook from '@nkzw/create-context-hook';
import { useCallback, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SystemUI from 'expo-system-ui';
import type { ThemeType } from '@/constants/theme';

export type ThemeMode = 'light' | 'dark';

const STORAGE_KEY = 'theme_preference_v1';

const lightTheme: ThemeType = {
  colors: {
    background: '#E9ECEF',
    surface: '#FFFFFF',
    primary: '#0A84FF',
    primary700: '#0066FF',
    primary600: '#0A7BFF',
    primary500: '#1EA0FF',
    primary300: '#74C1FF',
    accent: '#EEF5FF',
    text: '#0F172A',
    textMuted: '#667085',
    border: 'rgba(15, 23, 42, 0.06)',
    cardBorder: 'rgba(15, 23, 42, 0.08)',
    cardShadow: 'rgba(10, 132, 255, 0.25)',
    success: '#22C55E',
    warning: '#F59E0B',
    danger: '#EF4444',
  },
  radii: { xs: 8, sm: 12, md: 16, lg: 20, xl: 24, full: 999 },
  spacing: { xs: 6, sm: 10, md: 14, lg: 20, xl: 24, xxl: 32 },
  shadow: {
    soft: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 5 },
    medium: { shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.12, shadowRadius: 14, elevation: 6 },
  },
};

const darkTheme: ThemeType = {
  colors: {
    background: '#0B1220',
    surface: '#121A2A',
    primary: '#4BA3FF',
    primary700: '#3B82F6',
    primary600: '#4C8DFF',
    primary500: '#5AA3FF',
    primary300: '#90C2FF',
    accent: '#1B2640',
    text: '#E5E7EB',
    textMuted: '#9AA3B2',
    border: 'rgba(229, 231, 235, 0.08)',
    cardBorder: 'rgba(255, 255, 255, 0.1)',
    cardShadow: 'rgba(0, 0, 0, 0.35)',
    success: '#22C55E',
    warning: '#F59E0B',
    danger: '#EF4444',
  },
  radii: { xs: 8, sm: 12, md: 16, lg: 20, xl: 24, full: 999 },
  spacing: { xs: 6, sm: 10, md: 14, lg: 20, xl: 24, xxl: 32 },
  shadow: {
    soft: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 5 },
    medium: { shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.4, shadowRadius: 14, elevation: 6 },
  },
};

export const [ThemeProvider, useTheme] = createContextHook(() => {
  const [mode, setMode] = useState<ThemeMode>('dark');
  const [theme, setTheme] = useState<ThemeType>(darkTheme);
  const [hydrated, setHydrated] = useState<boolean>(false);

  useEffect(() => {
    const load = async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        const m = (stored as ThemeMode | null) ?? 'dark';
        setMode(m);
        setTheme(m === 'dark' ? darkTheme : lightTheme);
        await SystemUI.setBackgroundColorAsync(m === 'dark' ? darkTheme.colors.background : lightTheme.colors.background);
      } catch (e) {
        console.log('[Theme] load error', e);
      } finally {
        setHydrated(true);
      }
    };
    void load();
  }, []);

  const apply = useCallback(async (m: ThemeMode) => {
    setMode(m);
    setTheme(m === 'dark' ? darkTheme : lightTheme);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, m);
      await SystemUI.setBackgroundColorAsync(m === 'dark' ? darkTheme.colors.background : lightTheme.colors.background);
    } catch (e) {
      console.log('[Theme] save error', e);
    }
  }, []);

  const toggle = useCallback(() => {
    void apply(mode === 'dark' ? 'light' : 'dark');
  }, [mode, apply]);

  return useMemo(() => ({ theme, mode, hydrated, setMode: apply, toggle }), [theme, mode, hydrated, apply, toggle]);
});
