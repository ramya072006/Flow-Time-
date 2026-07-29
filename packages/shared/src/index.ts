export const APP_NAME = 'FlowTime AI';
export const API_VERSION = 'v1.0';

export const DEFAULT_WORK_HOURS = {
  start: '09:00',
  end: '17:00',
  timezone: 'UTC',
};

export const TASK_PRIORITIES = ['low', 'medium', 'high', 'urgent'] as const;
export const TASK_STATUSES = ['pending', 'scheduled', 'in_progress', 'completed', 'deferred', 'cancelled'] as const;

export function isValidEmail(email: string): boolean {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}
