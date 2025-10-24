export type WorkoutType = 'run' | 'weight_lifting' | 'describe' | 'manual';

export type WorkoutIntensity = 'low' | 'medium' | 'high';

export interface WorkoutEntry {
  id: string;
  type: WorkoutType;
  intensity: WorkoutIntensity;
  duration: number;
  calories: number;
  timestamp: string;
  description?: string;
}

export interface WorkoutTypeOption {
  id: WorkoutType;
  title: string;
  description: string;
  icon: string;
}
