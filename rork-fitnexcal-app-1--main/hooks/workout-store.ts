import createContextHook from '@nkzw/create-context-hook';
import { useState, useEffect, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { WorkoutEntry, WorkoutType, WorkoutIntensity } from '@/types/workout';

const WORKOUTS_KEY = 'workouts';

const calculateCalories = (
  type: WorkoutType,
  intensity: WorkoutIntensity,
  duration: number,
): number => {
  const baseCaloriesPerMinute: Record<WorkoutType, number> = {
    run: 10,
    weight_lifting: 6,
    describe: 5,
    manual: 0,
  };

  const intensityMultiplier: Record<WorkoutIntensity, number> = {
    low: 0.7,
    medium: 1.0,
    high: 1.4,
  };

  if (type === 'manual') {
    return 0;
  }

  const baseCalories = baseCaloriesPerMinute[type] * duration;
  return Math.round(baseCalories * intensityMultiplier[intensity]);
};

export const [WorkoutProvider, useWorkout] = createContextHook(() => {
  const [workouts, setWorkouts] = useState<WorkoutEntry[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const loadWorkouts = useCallback(async () => {
    console.log('[WorkoutStore] Loading workouts');
    try {
      const stored = await AsyncStorage.getItem(WORKOUTS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as WorkoutEntry[];
        setWorkouts(parsed);
      }
    } catch (error) {
      console.error('[WorkoutStore] Error loading workouts:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadWorkouts();
  }, [loadWorkouts]);

  const saveWorkouts = useCallback(async (newWorkouts: WorkoutEntry[]) => {
    try {
      await AsyncStorage.setItem(WORKOUTS_KEY, JSON.stringify(newWorkouts));
      setWorkouts(newWorkouts);
    } catch (error) {
      console.error('[WorkoutStore] Error saving workouts:', error);
      throw error;
    }
  }, []);

  const addWorkout = useCallback(
    async (
      type: WorkoutType,
      intensity: WorkoutIntensity,
      duration: number,
      manualCalories?: number,
      description?: string,
    ) => {
      try {
        const calories = type === 'manual' && manualCalories !== undefined
          ? manualCalories
          : calculateCalories(type, intensity, duration);

        const newWorkout: WorkoutEntry = {
          id: Date.now().toString(),
          type,
          intensity,
          duration,
          calories,
          timestamp: new Date().toISOString(),
          description,
        };

        const updated = [newWorkout, ...workouts];
        await saveWorkouts(updated);
        console.log('[WorkoutStore] Added workout:', newWorkout);
        return newWorkout;
      } catch (error) {
        console.error('[WorkoutStore] Error adding workout:', error);
        throw error;
      }
    },
    [workouts, saveWorkouts],
  );

  const removeWorkout = useCallback(
    async (id: string) => {
      try {
        const updated = workouts.filter((w) => w.id !== id);
        await saveWorkouts(updated);
        console.log('[WorkoutStore] Removed workout:', id);
      } catch (error) {
        console.error('[WorkoutStore] Error removing workout:', error);
        throw error;
      }
    },
    [workouts, saveWorkouts],
  );

  const todayWorkouts = useMemo(() => {
    const today = new Date().toDateString();
    return workouts.filter((w) => new Date(w.timestamp).toDateString() === today);
  }, [workouts]);

  const totalCaloriesToday = useMemo(() => {
    return todayWorkouts.reduce((sum, w) => sum + w.calories, 0);
  }, [todayWorkouts]);

  return useMemo(
    () => ({
      workouts,
      todayWorkouts,
      totalCaloriesToday,
      isLoading,
      addWorkout,
      removeWorkout,
    }),
    [workouts, todayWorkouts, totalCaloriesToday, isLoading, addWorkout, removeWorkout],
  );
});
