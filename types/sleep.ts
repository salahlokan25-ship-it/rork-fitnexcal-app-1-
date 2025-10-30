export interface SleepEntry {
  id: string;
  date: string;
  hours: number;
  timestamp: Date;
}

export interface DailySleep {
  date: string;
  hours: number;
}
