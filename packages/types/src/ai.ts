export type RecommendationType = 
  | 'schedule_task'
  | 'reschedule'
  | 'focus_block'
  | 'meeting_optimization'
  | 'habit_timing'
  | 'workload_balance'
  | 'break_suggestion'
  | 'deadline_warning';

export interface AIRecommendation {
  _id: string;
  recommendationType: RecommendationType;
  title: string;
  content: string;
  actionData?: Record<string, unknown>;
  applied: boolean;
  dismissed: boolean;
  score: number; // confidence 0-100
  userId: string;
  createdAt: Date;
  expiresAt?: Date;
}

export interface AISchedulingRequest {
  userId: string;
  tasks: string[]; // task IDs to schedule
  constraints?: {
    startDate?: string;
    endDate?: string;
    preferredTimes?: string[];
  };
}

export interface AISchedulingResult {
  scheduledTasks: {
    taskId: string;
    scheduledStart: Date;
    scheduledEnd: Date;
    score: number;
    reasoning: string;
  }[];
  unscheduledTasks: {
    taskId: string;
    reason: string;
  }[];
  recommendations: string[];
}

export interface AIChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface AIChatSession {
  _id: string;
  messages: AIChatMessage[];
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}
