import createContextHook from '@nkzw/create-context-hook';
import { useState, useEffect, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SleepEntry, DailySleep } from '@/types/sleep';

const SLEEP_KEY = 'sleep_entries';

export const [SleepProvider, useSleep] = createContextHook(() => {
  const [sleepEntries, setSleepEntries] = useState<SleepEntry[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const loadSleepData = useCallback(async () => {
    console.log('[SleepStore] Loading sleep data');
    try {
      const stored = await AsyncStorage.getItem(SLEEP_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        const entries = parsed.map((e: any) => ({
          ...e,
          timestamp: new Date(e.timestamp),
        }));
        setSleepEntries(entries);
      }
    } catch (error) {
      console.error('[SleepStore] Error loading sleep data:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadSleepData();
  }, [loadSleepData]);

  const saveSleepData = useCallback(async (entries: SleepEntry[]) => {
    try {
      await AsyncStorage.setItem(SLEEP_KEY, JSON.stringify(entries));
      setSleepEntries(entries);
    } catch (error) {
      console.error('[SleepStore] Error saving sleep data:', error);
      throw error;
    }
  }, []);

  const logSleep = useCallback(
    async (hours: number, date?: string) => {
      try {
        const targetDate = date || new Date().toDateString();
        const existingIndex = sleepEntries.findIndex((e) => e.date === targetDate);

        let updatedEntries: SleepEntry[];
        if (existingIndex >= 0) {
          updatedEntries = [...sleepEntries];
          updatedEntries[existingIndex] = {
            ...updatedEntries[existingIndex],
            hours,
            timestamp: new Date(),
          };
        } else {
          const newEntry: SleepEntry = {
            id: Date.now().toString(),
            date: targetDate,
            hours,
            timestamp: new Date(),
          };
          updatedEntries = [...sleepEntries, newEntry];
        }

        await saveSleepData(updatedEntries);
        console.log(`[SleepStore] Logged ${hours} hours of sleep for ${targetDate}`);
      } catch (error) {
        console.error('[SleepStore] Error logging sleep:', error);
        throw error;
      }
    },
    [sleepEntries, saveSleepData]
  );

  const getTodaySleep = useCallback(() => {
    const today = new Date().toDateString();
    const entry = sleepEntries.find((e) => e.date === today);
    return entry?.hours || 0;
  }, [sleepEntries]);

  const getSleepHistory = useCallback(
    (days: number): DailySleep[] => {
      const history: DailySleep[] = [];
      for (let i = days - 1; i >= 0; i -= 1) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toDateString();
        const entry = sleepEntries.find((e) => e.date === dateStr);
        history.push({
          date: d.toLocaleDateString('en-US', { weekday: 'short' }),
          hours: entry?.hours || 0,
        });
      }
      return history;
    },
    [sleepEntries]
  );

  const getAverageSleep = useCallback(
    (days: number): number => {
      const history = getSleepHistory(days);
      const total = history.reduce((sum, d) => sum + d.hours, 0);
      const count = history.filter((d) => d.hours > 0).length;
      return count > 0 ? total / count : 0;
    },
    [getSleepHistory]
  );

  return useMemo(
    () => ({
      sleepEntries,
      isLoading,
      logSleep,
      getTodaySleep,
      getSleepHistory,
      getAverageSleep,
    }),
    [sleepEntries, isLoading, logSleep, getTodaySleep, getSleepHistory, getAverageSleep]
  );
});
