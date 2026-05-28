export type UserRole = 'user' | 'admin';

export interface WorkHours {
  start: string; // "09:00"
  end: string;   // "17:00"
  days: number[]; // 0=Sun, 1=Mon, ...
}

export interface SleepHours {
  bedtime: string;
  wakeTime: string;
}

export interface ProductivityPreferences {
  peakHours: string[];
  preferredFocusDuration: number; // minutes
  breakDuration: number;
  deepWorkBlocks: number;
}

export interface FocusPreferences {
  protectMornings: boolean;
  protectAfternoons: boolean;
  minFocusBlock: number; // minutes
  maxMeetingsPerDay: number;
}

export interface AISettings {
  autoSchedule: boolean;
  autoReschedule: boolean;
  learningEnabled: boolean;
  suggestionFrequency: 'low' | 'medium' | 'high';
}

export interface NotificationSettings {
  email: boolean;
  push: boolean;
  inApp: boolean;
  reminderMinutes: number[];
  deadlineAlerts: boolean;
  aiSuggestions: boolean;
}

export interface ConnectedCalendar {
  provider: 'google' | 'microsoft';
  accountEmail: string;
  calendarId: string;
  syncEnabled: boolean;
  lastSynced?: Date;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  timezone: string;
  workHours: WorkHours;
  sleepHours: SleepHours;
  productivityPreferences: ProductivityPreferences;
  focusPreferences: FocusPreferences;
  aiSettings: AISettings;
  notificationSettings: NotificationSettings;
  connectedCalendars: ConnectedCalendar[];
  onboardingCompleted: boolean;
  role: UserRole;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
  timezone?: string;
}
