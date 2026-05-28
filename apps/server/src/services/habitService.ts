import { Habit, IHabit } from '../models/Habit';
import { AppError } from '../middlewares/errorHandler';

export const habitService = {
  async getHabits(userId: string) {
    return Habit.find({ userId, isActive: true }).sort({ createdAt: -1 }).lean();
  },

  async getHabitById(habitId: string, userId: string) {
    const habit = await Habit.findOne({ _id: habitId, userId });
    if (!habit) throw new AppError('Habit not found', 404);
    return habit;
  },

  async createHabit(userId: string, data: Partial<IHabit>) {
    return Habit.create({ ...data, userId });
  },

  async updateHabit(habitId: string, userId: string, data: Partial<IHabit>) {
    const habit = await Habit.findOneAndUpdate(
      { _id: habitId, userId },
      data,
      { new: true, runValidators: true }
    );
    if (!habit) throw new AppError('Habit not found', 404);
    return habit;
  },

  async deleteHabit(habitId: string, userId: string) {
    const habit = await Habit.findOneAndUpdate(
      { _id: habitId, userId },
      { isDeleted: true },
      { new: true }
    );
    if (!habit) throw new AppError('Habit not found', 404);
    return habit;
  },

  async logCompletion(habitId: string, userId: string, completed: boolean, duration?: number, notes?: string) {
    const habit = await Habit.findOne({ _id: habitId, userId });
    if (!habit) throw new AppError('Habit not found', 404);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if already logged today
    const existingLog = habit.completions.find((c) => {
      const logDate = new Date(c.date);
      logDate.setHours(0, 0, 0, 0);
      return logDate.getTime() === today.getTime();
    });

    if (existingLog) {
      existingLog.completed = completed;
      if (duration) existingLog.duration = duration;
      if (notes) existingLog.notes = notes;
    } else {
      habit.completions.push({ date: today, completed, duration, notes });
    }

    // Recalculate streak
    if (completed) {
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const hadYesterday = habit.completions.some((c) => {
        const d = new Date(c.date);
        d.setHours(0, 0, 0, 0);
        return d.getTime() === yesterday.getTime() && c.completed;
      });
      habit.streak = hadYesterday ? habit.streak + 1 : 1;
      if (habit.streak > habit.longestStreak) {
        habit.longestStreak = habit.streak;
      }
    } else {
      habit.streak = 0;
    }

    // Recalculate completion rate (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentCompletions = habit.completions.filter((c) => c.date >= thirtyDaysAgo);
    const completedCount = recentCompletions.filter((c) => c.completed).length;
    habit.completionRate = recentCompletions.length > 0
      ? Math.round((completedCount / recentCompletions.length) * 100)
      : 0;

    await habit.save();
    return habit;
  },

  async getHabitMetrics(habitId: string, userId: string) {
    const habit = await Habit.findOne({ _id: habitId, userId });
    if (!habit) throw new AppError('Habit not found', 404);

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentCompletions = habit.completions.filter((c) => c.date >= thirtyDaysAgo);
    const completedCount = recentCompletions.filter((c) => c.completed).length;
    const missedDays = recentCompletions.filter((c) => !c.completed).length;

    return {
      completionRate: habit.completionRate,
      longestStreak: habit.longestStreak,
      currentStreak: habit.streak,
      consistencyScore: habit.consistencyScore,
      totalCompletions: habit.completions.filter((c) => c.completed).length,
      missedDays,
      productivityCorrelation: 0, // Would need analytics data
    };
  },

  async getTodayHabits(userId: string) {
    const today = new Date();
    const dayOfWeek = today.getDay();

    const habits = await Habit.find({ userId, isActive: true }).lean();

    return habits.filter((habit) => {
      if (habit.frequency === 'daily') return true;
      if (habit.frequency === 'weekly' && habit.targetDays?.includes(dayOfWeek)) return true;
      return false;
    });
  },
};
