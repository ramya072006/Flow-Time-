import { Task } from '../models/Task';
import { Habit } from '../models/Habit';
import { CalendarEvent } from '../models/CalendarEvent';

export const analyticsService = {
  async getDashboardAnalytics(userId: string) {
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
    weekStart.setHours(0, 0, 0, 0);

    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      totalTasks,
      completedTasks,
      pendingTasks,
      overdueTasks,
      weeklyEvents,
      habits,
    ] = await Promise.all([
      Task.countDocuments({ userId }),
      Task.countDocuments({ userId, status: 'completed' }),
      Task.countDocuments({ userId, status: { $in: ['pending', 'scheduled'] } }),
      Task.countDocuments({
        userId,
        status: { $in: ['pending', 'scheduled'] },
        dueDate: { $lt: now },
      }),
      CalendarEvent.find({
        userId,
        start: { $gte: weekStart },
        end: { $lte: new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000) },
      }).lean(),
      Habit.find({ userId, isActive: true }).lean(),
    ]);

    const focusHours = weeklyEvents
      .filter(e => e.type === 'focus')
      .reduce((acc, e) => acc + (new Date(e.end).getTime() - new Date(e.start).getTime()) / (1000 * 60 * 60), 0);

    const meetingHours = weeklyEvents
      .filter(e => e.type === 'meeting')
      .reduce((acc, e) => acc + (new Date(e.end).getTime() - new Date(e.start).getTime()) / (1000 * 60 * 60), 0);

    const habitCompletionRate = habits.length > 0
      ? Math.round(habits.reduce((acc, h) => acc + h.completionRate, 0) / habits.length)
      : 0;

    const productivityScore = Math.min(100, Math.round(
      (completedTasks / Math.max(totalTasks, 1)) * 40 +
      (focusHours / 20) * 30 +
      (habitCompletionRate / 100) * 30
    ));

    return {
      tasks: { total: totalTasks, completed: completedTasks, pending: pendingTasks, overdue: overdueTasks },
      focusHours: Math.round(focusHours * 10) / 10,
      meetingHours: Math.round(meetingHours * 10) / 10,
      habitCompletionRate,
      productivityScore,
      taskCompletionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
    };
  },

  async getProductivityTrend(userId: string, days = 14) {
    const trend = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      const [completed, focusEvents] = await Promise.all([
        Task.countDocuments({ userId, completedAt: { $gte: date, $lt: nextDate } }),
        CalendarEvent.find({ userId, type: 'focus', start: { $gte: date }, end: { $lt: nextDate } }).lean(),
      ]);

      const focusHours = focusEvents.reduce((acc, e) =>
        acc + (new Date(e.end).getTime() - new Date(e.start).getTime()) / (1000 * 60 * 60), 0);

      trend.push({
        date: date.toISOString().split('T')[0],
        tasksCompleted: completed,
        focusHours: Math.round(focusHours * 10) / 10,
        productivityScore: Math.min(100, completed * 10 + focusHours * 5),
      });
    }
    return trend;
  },

  async getTimeAllocation(userId: string, startDate: Date, endDate: Date) {
    const events = await CalendarEvent.find({
      userId,
      start: { $gte: startDate },
      end: { $lte: endDate },
    }).lean();

    const allocation: Record<string, number> = {};
    for (const event of events) {
      const hours = (new Date(event.end).getTime() - new Date(event.start).getTime()) / (1000 * 60 * 60);
      allocation[event.type] = (allocation[event.type] || 0) + hours;
    }

    const total = Object.values(allocation).reduce((a, b) => a + b, 0);
    const colors: Record<string, string> = {
      task: '#6366f1',
      meeting: '#f59e0b',
      focus: '#10b981',
      habit: '#8b5cf6',
      break: '#06b6d4',
      personal: '#ec4899',
      blocked: '#6b7280',
    };

    return Object.entries(allocation).map(([category, hours]) => ({
      category,
      hours: Math.round(hours * 10) / 10,
      percentage: total > 0 ? Math.round((hours / total) * 100) : 0,
      color: colors[category] || '#6b7280',
    }));
  },

  async getWeeklyReport(userId: string) {
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - 7);
    weekStart.setHours(0, 0, 0, 0);

    const [tasks, events, habits] = await Promise.all([
      Task.find({ userId, createdAt: { $gte: weekStart } }).lean(),
      CalendarEvent.find({ userId, start: { $gte: weekStart } }).lean(),
      Habit.find({ userId, isActive: true }).lean(),
    ]);

    const completedTasks = tasks.filter(t => t.status === 'completed');
    const focusHours = events
      .filter(e => e.type === 'focus')
      .reduce((acc, e) => acc + (new Date(e.end).getTime() - new Date(e.start).getTime()) / (1000 * 60 * 60), 0);
    const meetingHours = events
      .filter(e => e.type === 'meeting')
      .reduce((acc, e) => acc + (new Date(e.end).getTime() - new Date(e.start).getTime()) / (1000 * 60 * 60), 0);

    const habitCompletions = habits.reduce((acc, h) => {
      const weekCompletions = h.completions.filter(c => c.date >= weekStart && c.completed);
      return acc + weekCompletions.length;
    }, 0);

    return {
      weekStart,
      weekEnd: now,
      totalFocusHours: Math.round(focusHours * 10) / 10,
      totalMeetingHours: Math.round(meetingHours * 10) / 10,
      tasksCompleted: completedTasks.length,
      tasksCreated: tasks.length,
      habitsCompleted: habitCompletions,
      productivityScore: Math.min(100, completedTasks.length * 8 + focusHours * 4),
      insights: [
        completedTasks.length > 5 ? 'Great task completion this week!' : 'Try to complete more tasks next week.',
        focusHours > 10 ? 'Excellent focus time!' : 'Consider adding more focus blocks.',
        meetingHours > 15 ? 'High meeting load - consider declining some.' : 'Good meeting balance.',
      ],
    };
  },
};
