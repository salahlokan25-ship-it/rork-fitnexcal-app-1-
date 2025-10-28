import createContextHook from '@nkzw/create-context-hook';
import { useCallback, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNutrition } from '@/hooks/nutrition-store';
import { useWorkout } from '@/hooks/workout-store';

export type KarmaImpactType = 'donation' | 'reforestation' | 'carbon_offset';

export interface KarmaHistoryItem {
  id: string;
  week_start: string;
  kcal_saved: number;
  units: number;
  action: KarmaImpactType;
  message: string;
  created_at: string;
}

interface KarmaState {
  week_start: string | null;
  kcal_saved_week: number;
  units_week: number;
  total_units: number;
  last_action?: KarmaHistoryItem | null;
  history: KarmaHistoryItem[];
  daily_saved: number;
  yesterday_saved: number;
  daily_trend: 'up' | 'down' | 'stable';
  recompute: () => Promise<void>;
  clearHistory: () => Promise<void>;
}

const TOTAL_UNITS_KEY = 'karma_total_units_v1';
const HISTORY_KEY = 'karma_history_v1';
const PROCESSED_KEY_PREFIX = 'karma_processed_units_';
const DAILY_KEY_PREFIX = 'karma_daily_';

function getISODate(d: Date): string {
  return d.toISOString().split('T')[0] as string;
}

function getWeekStart(date: Date): string {
  const d = new Date(date);
  const day = d.getDay();
  const start = new Date(d);
  start.setDate(d.getDate() - day);
  return getISODate(start);
}

function chooseImpact(units: number): KarmaImpactType {
  if (units >= 12) return 'reforestation';
  if (units >= 8) return 'carbon_offset';
  return 'donation';
}

function impactMessage(type: KarmaImpactType, units: number): string {
  if (type === 'reforestation') return `You saved ${units * 100} kcal this week — we planted a tree in your name.`;
  if (type === 'carbon_offset') return `You saved ${units * 100} kcal — carbon from one meal offset.`;
  return `You saved ${units * 100} kcal — a meal donated to someone in need.`;
}

export const [KarmaProvider, useKarma] = createContextHook<KarmaState>(() => {
  const { weeklySummary, dailyNutrition } = useNutrition();
  const { workouts } = useWorkout();

  const [weekStart, setWeekStart] = useState<string | null>(null);
  const [kcalSavedWeek, setKcalSavedWeek] = useState<number>(0);
  const [unitsWeek, setUnitsWeek] = useState<number>(0);
  const [totalUnits, setTotalUnits] = useState<number>(0);
  const [history, setHistory] = useState<KarmaHistoryItem[]>([]);
  const [lastAction, setLastAction] = useState<KarmaHistoryItem | null>(null);

  const [dailySaved, setDailySaved] = useState<number>(0);
  const [yesterdaySaved, setYesterdaySaved] = useState<number>(0);
  const [dailyTrend, setDailyTrend] = useState<'up' | 'down' | 'stable'>('stable');

  const loadPersisted = useCallback(async () => {
    try {
      const [tRaw, hRaw] = await Promise.all([
        AsyncStorage.getItem(TOTAL_UNITS_KEY),
        AsyncStorage.getItem(HISTORY_KEY),
      ]);
      if (tRaw) setTotalUnits(parseInt(tRaw, 10) || 0);
      if (hRaw) setHistory(JSON.parse(hRaw) as KarmaHistoryItem[]);

      const todayISO = getISODate(new Date());
      const yISO = getISODate(new Date(Date.now() - 86400000));
      const [dTodayRaw, dYRaw] = await Promise.all([
        AsyncStorage.getItem(`${DAILY_KEY_PREFIX}${todayISO}`),
        AsyncStorage.getItem(`${DAILY_KEY_PREFIX}${yISO}`),
      ]);
      const dToday = parseInt(dTodayRaw || '0', 10) || 0;
      const dY = parseInt(dYRaw || '0', 10) || 0;
      setDailySaved(dToday);
      setYesterdaySaved(dY);
      setDailyTrend(dToday > dY ? 'up' : dToday < dY ? 'down' : 'stable');
    } catch (e) {
      console.log('[Karma] loadPersisted error', e);
    }
  }, []);

  useEffect(() => {
    void loadPersisted();
  }, [loadPersisted]);

  const recompute = useCallback(async () => {
    try {
      const now = new Date();
      const weekStartISO = getWeekStart(now);
      setWeekStart(weekStartISO);

      const intake = weeklySummary?.total_calories ?? 0;
      const weeklyGoal = weeklySummary?.goal_calories ?? 0;
      let burned = 0;
      let hasWorkoutThisWeek = false;
      for (const w of workouts) {
        const ts = new Date(w.timestamp);
        const ws = new Date(weekStartISO);
        const we = new Date(ws);
        we.setDate(ws.getDate() + 7);
        if (ts >= ws && ts < we) {
          burned += Number(w.calories ?? 0);
          hasWorkoutThisWeek = true;
        }
      }

      const skipped = Math.max(0, weeklyGoal - intake);
      const hasAnyWeeklyActivity = (intake > 0) || hasWorkoutThisWeek;
      const computedSaved = Math.max(0, Math.round(skipped + burned));
      const saved = hasAnyWeeklyActivity ? computedSaved : 0;
      const units = Math.floor(saved / 100);

      setKcalSavedWeek(saved);
      setUnitsWeek(units);

      if (units > 0) {
        const processedKey = `${PROCESSED_KEY_PREFIX}${weekStartISO}`;
        const processedRaw = await AsyncStorage.getItem(processedKey);
        const already = parseInt(processedRaw || '0', 10) || 0;
        const newUnits = Math.max(0, units - already);
        if (newUnits > 0) {
          const action = chooseImpact(units);
          const msg = impactMessage(action, units);
          const item: KarmaHistoryItem = {
            id: `${weekStartISO}_${Date.now()}`,
            week_start: weekStartISO,
            kcal_saved: saved,
            units,
            action,
            message: msg,
            created_at: new Date().toISOString(),
          };
          const nextHistory = [item, ...history].slice(0, 20);
          setHistory(nextHistory);
          setLastAction(item);
          await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(nextHistory));
          const nextTotal = totalUnits + newUnits;
          setTotalUnits(nextTotal);
          await AsyncStorage.setItem(TOTAL_UNITS_KEY, String(nextTotal));
          await AsyncStorage.setItem(processedKey, String(units));
        } else {
          const recent = history.find((h) => h.week_start === weekStartISO) ?? null;
          setLastAction(recent);
        }
      } else {
        setLastAction(null);
      }

      const todayISO = getISODate(now);
      const yISO = getISODate(new Date(now.getTime() - 86400000));
      const goalToday = dailyNutrition?.goal_calories ?? 0;
      const consumedToday = dailyNutrition?.total_calories ?? 0;
      const burnedToday = workouts
        .filter((w) => new Date(w.timestamp).toDateString() === now.toDateString())
        .reduce((sum, w) => sum + (Number(w.calories) || 0), 0);
      const hasActivityToday = (consumedToday > 0) || (burnedToday > 0);
      const computedSavedToday = Math.max(0, Math.round(Math.max(0, goalToday - consumedToday) + burnedToday));
      const savedToday = hasActivityToday ? computedSavedToday : 0;
      setDailySaved(savedToday);
      await AsyncStorage.setItem(`${DAILY_KEY_PREFIX}${todayISO}`, String(savedToday));
      const yRaw = await AsyncStorage.getItem(`${DAILY_KEY_PREFIX}${yISO}`);
      const yVal = parseInt(yRaw || '0', 10) || 0;
      setYesterdaySaved(yVal);
      setDailyTrend(savedToday > yVal ? 'up' : savedToday < yVal ? 'down' : 'stable');
    } catch (e) {
      console.log('[Karma] recompute error', e);
    }
  }, [weeklySummary, workouts, history, totalUnits, dailyNutrition]);

  useEffect(() => {
    void recompute();
  }, [recompute]);

  const clearHistory = useCallback(async () => {
    try {
      await AsyncStorage.removeItem(HISTORY_KEY);
      await AsyncStorage.removeItem(TOTAL_UNITS_KEY);
      setHistory([]);
      setTotalUnits(0);
      setLastAction(null);
    } catch (e) {
      console.log('[Karma] clearHistory error', e);
    }
  }, []);

  return useMemo(() => ({
    week_start: weekStart,
    kcal_saved_week: kcalSavedWeek,
    units_week: unitsWeek,
    total_units: totalUnits,
    last_action: lastAction,
    history,
    daily_saved: dailySaved,
    yesterday_saved: yesterdaySaved,
    daily_trend: dailyTrend,
    recompute,
    clearHistory,
  }), [weekStart, kcalSavedWeek, unitsWeek, totalUnits, lastAction, history, dailySaved, yesterdaySaved, dailyTrend, recompute, clearHistory]);
});
