import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string, format = 'MMM d, yyyy'): string {
  const d = new Date(date);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  if (format === 'MMM d, yyyy') {
    return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
  }
  if (format === 'HH:mm') {
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  }
  return d.toLocaleDateString();
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

export function getRelativeTime(date: Date | string): string {
  const now = new Date();
  const d = new Date(date);
  const diff = now.getTime() - d.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return formatDate(date);
}

export function getPriorityColor(priority: string): string {
  const colors: Record<string, string> = {
    low: 'text-blue-500 bg-blue-50 dark:bg-blue-950',
    medium: 'text-yellow-500 bg-yellow-50 dark:bg-yellow-950',
    high: 'text-orange-500 bg-orange-50 dark:bg-orange-950',
    urgent: 'text-red-500 bg-red-50 dark:bg-red-950',
  };
  return colors[priority] || colors.medium;
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    pending: 'text-gray-500 bg-gray-100 dark:bg-gray-800',
    scheduled: 'text-blue-500 bg-blue-50 dark:bg-blue-950',
    in_progress: 'text-purple-500 bg-purple-50 dark:bg-purple-950',
    completed: 'text-green-500 bg-green-50 dark:bg-green-950',
    deferred: 'text-yellow-500 bg-yellow-50 dark:bg-yellow-950',
    cancelled: 'text-red-500 bg-red-50 dark:bg-red-950',
  };
  return colors[status] || colors.pending;
}

export function getEventColor(type: string): string {
  const colors: Record<string, string> = {
    task: '#6366f1',
    meeting: '#f59e0b',
    habit: '#8b5cf6',
    break: '#06b6d4',
    focus: '#10b981',
    personal: '#ec4899',
    blocked: '#6b7280',
  };
  return colors[type] || '#6366f1';
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + '...';
}

export function debounce<T extends (...args: unknown[]) => unknown>(fn: T, delay: number): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}
