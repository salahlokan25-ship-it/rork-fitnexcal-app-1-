import createContextHook from '@nkzw/create-context-hook';
import { useCallback, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { MoodEntry, MoodEmotion, MoodState, MoodCorrelatedRisk, NudgeItem } from '@/types/mood';
import { Platform } from 'react-native';

const MOOD_KEY = 'mood_entries_v1';
const RISK_KEY = 'mood_risks_v1';

function getISODate(d: Date): string {
  return d.toISOString().split('T')[0];
}

function getTimeFrame(d: Date): 'morning' | 'afternoon' | 'evening' | 'night' {
  const h = d.getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  if (h < 21) return 'evening';
  return 'night';
}

export const [MoodProvider, useMood] = createContextHook(() => {
  const [moods, setMoods] = useState<MoodEntry[]>([]);
  const [risks, setRisks] = useState<MoodCorrelatedRisk[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const load = useCallback(async () => {
    try {
      const raw = await AsyncStorage.getItem(MOOD_KEY);
      if (raw) setMoods(JSON.parse(raw) as MoodEntry[]);
      const riskRaw = await AsyncStorage.getItem(RISK_KEY);
      if (riskRaw) setRisks(JSON.parse(riskRaw) as MoodCorrelatedRisk[]);
    } catch (e) {
      console.log('[Mood] load error', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const persist = useCallback(async (next: MoodEntry[]) => {
    await AsyncStorage.setItem(MOOD_KEY, JSON.stringify(next));
  }, []);

  const analyzeCorrelations = useCallback(async (entries: MoodEntry[]) => {
    try {
      // Simple heuristic: if emotion in ['stress','boredom','sad','anxious'] occurs within 2h before days with overeat (> goal) mark evening/night as risky
      // Since we don't have backend, we infer with time-of-day frequency
      const counts: Record<string, { total: number; risk: number; emotions: Set<MoodEmotion> }> = {};
      for (const m of entries) {
        const tf = getTimeFrame(new Date(m.timeISO));
        const key = `${m.emotion}_${tf}`;
        if (!counts[key]) counts[key] = { total: 0, risk: 0, emotions: new Set<MoodEmotion>() };
        counts[key].total += 1;
        counts[key].emotions.add(m.emotion);
        if (['stress', 'boredom', 'sad', 'anxious'].includes(m.emotion)) counts[key].risk += 1 * (m.intensity / 10);
      }
      const nextRisks: MoodCorrelatedRisk[] = Object.entries(counts).map(([k, v]) => {
        const [emotion, tf] = k.split('_') as [MoodEmotion, MoodCorrelatedRisk['timeframe']];
        const likelihood = Math.min(1, v.risk / Math.max(1, v.total));
        return {
          pattern: `${emotion} in the ${tf}`,
          confidence: Math.min(1, v.total / 10),
          triggeredBy: [emotion],
          timeframe: tf,
          overeatLikelihood: likelihood,
        };
      }).filter(r => r.overeatLikelihood > 0.4);
      setRisks(nextRisks);
      await AsyncStorage.setItem(RISK_KEY, JSON.stringify(nextRisks));
    } catch (e) {
      console.log('[Mood] analyze error', e);
    }
  }, []);

  const logMood = useCallback(async (emotion: MoodEmotion, intensity: number, note?: string) => {
    try {
      const now = new Date();
      const entry: MoodEntry = {
        id: `${now.getTime()}`,
        dateISO: getISODate(now),
        timeISO: now.toISOString(),
        emotion,
        intensity: Math.max(1, Math.min(10, intensity)),
        note,
      };
      const next = [entry, ...moods].slice(0, 200);
      setMoods(next);
      await persist(next);
      await analyzeCorrelations(next);
      return entry;
    } catch (e) {
      console.log('[Mood] log error', e);
      throw e;
    }
  }, [moods, persist, analyzeCorrelations]);

  const clearMoods = useCallback(async () => {
    setMoods([]);
    await AsyncStorage.removeItem(MOOD_KEY);
  }, []);

  const getNudges = useCallback((emotion: MoodEmotion): NudgeItem[] => {
    const base: NudgeItem[] = [
      { id: 'breath', title: '2-min guided breathing', description: 'Box breathing 4-4-4-4 to calm cravings', kind: 'mindfulness' },
      { id: 'walk', title: '5-min walk', description: 'Change context and reset hunger cues', kind: 'activity' },
      { id: 'protein-snack', title: 'Greek yogurt + berries', description: 'High protein, calming snack ~150 kcal', kind: 'snack' },
    ];
    if (emotion === 'boredom') {
      base.unshift({ id: 'music', title: 'Favorite song + stretch', description: 'Mood lift without snacking', kind: 'activity' });
    }
    if (emotion === 'stress' || emotion === 'anxious') {
      base.unshift({ id: 'tea', title: 'Herbal tea', description: 'Warm, soothing and nearly zero calories', kind: 'snack' });
    }
    return base.slice(0, 5);
  }, []);

  const riskyNow = useMemo(() => {
    const now = new Date();
    const tf = getTimeFrame(now);
    // consider risk if any risk entry for current timeframe has high likelihood
    return risks.some(r => r.timeframe === tf && r.overeatLikelihood > 0.6);
  }, [risks]);

  return useMemo(() => ({
    moods,
    risks,
    isLoading,
    logMood,
    clearMoods,
    getNudges,
    riskyNow,
  }), [moods, risks, isLoading, logMood, clearMoods, getNudges, riskyNow]);
});
