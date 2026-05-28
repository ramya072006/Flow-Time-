export type EventType = 'task' | 'meeting' | 'habit' | 'break' | 'focus' | 'personal' | 'blocked';
export type EventSource = 'flowtime' | 'google' | 'microsoft' | 'manual';
export type CalendarView = 'day' | 'week' | 'month' | 'agenda';

export interface EventAttendee {
  email: string;
  name?: string;
  status: 'accepted' | 'declined' | 'tentative' | 'pending';
}

export interface EventRecurrence {
  rule: string; // RRULE string
  exceptions?: Date[];
}

export interface CalendarEvent {
  _id: string;
  title: string;
  description?: string;
  start: Date;
  end: Date;
  allDay?: boolean;
  type: EventType;
  source: EventSource;
  color?: string;
  location?: string;
  meetingLink?: string;
  attendees: EventAttendee[];
  recurrence?: EventRecurrence;
  notes?: string;
  calendarId: string;
  userId: string;
  taskId?: string;
  habitId?: string;
  externalId?: string; // Google/Microsoft event ID
  bufferBefore?: number; // minutes
  bufferAfter?: number;
  isFlexible?: boolean;
  isFocusTime?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Calendar {
  _id: string;
  name: string;
  description?: string;
  color: string;
  provider: 'flowtime' | 'google' | 'microsoft';
  externalId?: string;
  isDefault: boolean;
  isPrimary: boolean;
  syncEnabled: boolean;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TimeSlot {
  start: Date;
  end: Date;
  score?: number;
  available: boolean;
  reason?: string;
}

export interface SchedulingConstraints {
  workHoursStart: string;
  workHoursEnd: string;
  workDays: number[];
  preferredFocusTime?: string[];
  maxMeetingsPerDay: number;
  minBreakDuration: number;
  bufferBetweenMeetings: number;
}

export interface CreateEventDto {
  title: string;
  description?: string;
  start: string;
  end: string;
  allDay?: boolean;
  type?: EventType;
  color?: string;
  location?: string;
  meetingLink?: string;
  attendees?: EventAttendee[];
  recurrence?: EventRecurrence;
  calendarId?: string;
  bufferBefore?: number;
  bufferAfter?: number;
  isFlexible?: boolean;
  isFocusTime?: boolean;
}
