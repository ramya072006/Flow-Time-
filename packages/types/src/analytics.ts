export interface ProductivityMetrics {
  date: Date;
  focusHours: number;
  tasksCompleted: number;
  meetingHours: number;
  productivityScore: number;
  deepWorkBlocks: number;
  interruptionCount: number;
}

export interface WeeklyReport {
  weekStart: Date;
  weekEnd: Date;
  totalFocusHours: number;
  totalMeetingHours: number;
  tasksCompleted: number;
  tasksCreated: number;
  habitsCompleted: number;
  productivityScore: number;
  topCategories: { category: string; hours: number }[];
  insights: string[];
}

export interface TimeAllocation {
  category: string;
  hours: number;
  percentage: number;
  color: string;
}

export interface BurnoutIndicator {
  score: number; // 0-100, higher = more risk
  factors: string[];
  recommendation: string;
}

export interface AnalyticsDashboard {
  productivityTrend: ProductivityMetrics[];
  weeklyReport: WeeklyReport;
  timeAllocation: TimeAllocation[];
  burnoutIndicator: BurnoutIndicator;
  focusTimeTrend: { date: string; hours: number }[];
  meetingLoadTrend: { date: string; hours: number }[];
  taskCompletionRate: number;
  habitConsistency: number;
  timeEfficiencyScore: number;
}
