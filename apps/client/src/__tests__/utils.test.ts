import { describe, it, expect } from 'vitest';
import { cn, formatDuration, truncate, getPriorityColor, getStatusColor } from '../lib/utils';

describe('Client Utils', () => {
  it('cn merges Tailwind classes properly', () => {
    expect(cn('px-2 py-1', 'bg-blue-500')).toBe('px-2 py-1 bg-blue-500');
  });

  it('formatDuration formats minutes to human readable string', () => {
    expect(formatDuration(45)).toBe('45m');
    expect(formatDuration(60)).toBe('1h');
    expect(formatDuration(90)).toBe('1h 30m');
  });

  it('truncate truncates long strings with ellipsis', () => {
    expect(truncate('Hello World', 5)).toBe('Hello...');
    expect(truncate('Hi', 5)).toBe('Hi');
  });

  it('getPriorityColor returns correct CSS class string', () => {
    expect(getPriorityColor('high')).toContain('text-orange-500');
    expect(getPriorityColor('unknown')).toContain('text-yellow-500');
  });

  it('getStatusColor returns correct status CSS class', () => {
    expect(getStatusColor('completed')).toContain('text-green-500');
  });
});
