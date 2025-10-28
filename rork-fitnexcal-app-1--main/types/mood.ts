export type MoodEmotion =
  | 'stress'
  | 'boredom'
  | 'sad'
  | 'anxious'
  | 'tired'
  | 'happy'
  | 'neutral';

export interface MoodEntry {
  id: string;
  dateISO: string;
  timeISO: string;
  emotion: MoodEmotion;
  intensity: number; // 1-10
  note?: string;
}

export interface MoodCorrelatedRisk {
  pattern: string;
  confidence: number; // 0..1
  triggeredBy: MoodEmotion[];
  timeframe: 'morning' | 'afternoon' | 'evening' | 'night';
  overeatLikelihood: number; // 0..1
}

export interface NudgeItem {
  id: string;
  title: string;
  description: string;
  kind: 'snack' | 'activity' | 'mindfulness';
}

export interface MoodState {
  moods: MoodEntry[];
  risks: MoodCorrelatedRisk[];
}
