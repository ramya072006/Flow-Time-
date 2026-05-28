export type HabitFrequency = 'daily' | 'weekly' | 'monthly' | 'custom';
export type HabitCategory = 'health' | 'work' | 'learning' | 'personal' | 'fitness' | 'mindfulness' | 'other';

export interface HabitReminder {
  enabled: boolean;
  time: string; // "08:00"
  days?: number[];
}

export interface HabitCompletion {
  date: Date;
  completed: boolean;
  duration?: number;
  notes?: string;
}

export interface Habit {
  _id: string;
  title: string;
  description?: string;
  category: HabitCategory;
  frequency: HabitFrequency;
  targetDays?: number[]; // days of week for weekly
  targetCount?: number; // times per period
  estimatedDuration: number; // minutes
  preferredTime?: string; // "morning" | "afternoon" | "evening"
  preferredTimeSlot?: string; // "09:00"
  streak: number;
  longestStreak: number;
  completionRate: number;
  consistencyScore: number;
  aiOptimizationEnabled: boolean;
  reminders: HabitReminder;
  completions: HabitCompletion[];
  color?: string;
  icon?: string;
  userId: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateHabitDto {
  title: string;
  description?: string;
  category?: HabitCategory;
  frequency: HabitFrequency;
  targetDays?: number[];
  estimatedDuration?: number;
  preferredTime?: string;
  reminders?: HabitReminder;
  color?: string;
  icon?: string;
}

export interface HabitMetrics {
  completionRate: number;
  longestStreak: number;
  currentStreak: number;
  consistencyScore: number;
  totalCompletions: number;
  missedDays: number;
  productivityCorrelation: number;
}
