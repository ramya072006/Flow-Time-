import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from '../config';
import { logger } from '../utils/logger';
import { Task } from '../models/Task';
import { CalendarEvent } from '../models/CalendarEvent';
import { User } from '../models/User';
import { AIRecommendation } from '../models/AIRecommendation';

const genAI = new GoogleGenerativeAI(config.gemini.apiKey);

// Model priority list — falls back automatically on quota errors
// gemini-2.0-flash: 1500 req/day free | gemini-2.0-flash-lite: 1500 req/day free
const MODEL_PRIORITY = [
  'gemini-2.0-flash',
  'gemini-2.0-flash-lite',
  'gemini-2.5-flash',
];

let currentModelIndex = 0;

const getModel = (index = currentModelIndex) =>
  genAI.getGenerativeModel({ model: MODEL_PRIORITY[index] });

const isQuotaError = (error: unknown): boolean => {
  const e = error as { status?: number; message?: string };
  return e?.status === 429 ||
    String(e?.message).includes('429') ||
    String(e?.message).includes('quota') ||
    String(e?.message).includes('RESOURCE_EXHAUSTED');
};

const isRateLimitError = (error: unknown): boolean => {
  const e = error as { status?: number };
  return e?.status === 429;
};

// Retry with automatic model rotation on quota errors
const withRetry = async <T>(fn: (modelIdx: number) => Promise<T>): Promise<T> => {
  let lastError: unknown;
  for (let i = currentModelIndex; i < MODEL_PRIORITY.length; i++) {
    try {
      const result = await fn(i);
      currentModelIndex = i; // remember the working model
      return result;
    } catch (error) {
      lastError = error;
      if (isQuotaError(error) && i < MODEL_PRIORITY.length - 1) {
        logger.warn(`Quota hit on ${MODEL_PRIORITY[i]}, trying ${MODEL_PRIORITY[i + 1]}`);
        continue;
      }
      // Non-quota error — throw immediately
      throw error;
    }
  }
  throw lastError || new Error('All Gemini models quota exceeded');
};

// User-friendly error message based on error type
const getErrorMessage = (error: unknown): string => {
  if (isRateLimitError(error)) {
    return '⏳ AI rate limit reached. The free tier allows 20 requests/day for Gemini 2.5 Flash. Please wait a minute and try again, or upgrade your Gemini API plan at https://ai.google.dev';
  }
  return 'AI is temporarily unavailable. Please try again in a moment.';
};

export const aiService = {
  async generateSchedule(userId: string) {
    try {
      const user = await User.findById(userId);
      if (!user) throw new Error('User not found');

      const tasks = await Task.find({
        userId,
        status: { $in: ['pending', 'deferred'] },
      }).sort({ priority: -1, dueDate: 1 }).limit(20).lean();

      if (tasks.length === 0) {
        return { scheduledTasks: [], unscheduledTasks: [], recommendations: ['No pending tasks to schedule.'] };
      }

      const now = new Date();
      const weekEnd = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      const events = await CalendarEvent.find({
        userId,
        start: { $gte: now },
        end: { $lte: weekEnd },
      }).lean();

      const prompt = `You are an AI scheduling assistant. Schedule these tasks optimally.

User preferences:
- Work hours: ${user.workHours.start} - ${user.workHours.end}
- Work days: ${user.workHours.days.join(', ')} (0=Sun, 6=Sat)
- Peak productivity hours: ${user.productivityPreferences.peakHours.join(', ')}
- Preferred focus duration: ${user.productivityPreferences.preferredFocusDuration} minutes
- Max meetings per day: ${user.focusPreferences.maxMeetingsPerDay}

Current date/time: ${now.toISOString()}

Existing calendar events (next 7 days):
${events.map(e => `- ${e.title}: ${new Date(e.start).toISOString()} to ${new Date(e.end).toISOString()}`).join('\n') || 'None'}

Tasks to schedule:
${tasks.map(t => `- ID: ${t._id}, Title: "${t.title}", Priority: ${t.priority}, Duration: ${t.estimatedDuration}min, Due: ${t.dueDate ? new Date(t.dueDate).toISOString() : 'none'}, Energy: ${t.energyRequired}`).join('\n')}

Return ONLY a valid JSON object (no markdown, no code blocks):
{
  "scheduledTasks": [{"taskId":"id","scheduledStart":"ISO","scheduledEnd":"ISO","score":85,"reasoning":"brief"}],
  "unscheduledTasks": [{"taskId":"id","reason":"why"}],
  "recommendations": ["tip1","tip2"]
}

Rules: schedule during work hours only, avoid conflicts, high-energy tasks in peak hours, 15-min buffers, urgent tasks first.`;

      const schedule = await withRetry(async (modelIdx) => {
        const model = getModel(modelIdx);
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) throw new Error('Invalid AI response format');
        return JSON.parse(jsonMatch[0]);
      });

      const scheduledTasks = [];
      for (const item of schedule.scheduledTasks || []) {
        try {
          const updated = await Task.findByIdAndUpdate(
            item.taskId,
            {
              scheduledStart: new Date(item.scheduledStart),
              scheduledEnd: new Date(item.scheduledEnd),
              status: 'scheduled',
              aiScore: item.score,
            },
            { new: true }
          );
          if (updated) scheduledTasks.push({ ...item, task: updated });
        } catch (e) {
          logger.error('Failed to update task schedule:', e);
        }
      }

      if (schedule.recommendations?.length) {
        await AIRecommendation.create({
          recommendationType: 'schedule_task',
          title: 'AI Schedule Optimization',
          content: schedule.recommendations.join('\n'),
          score: 80,
          userId,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        });
      }

      return {
        scheduledTasks,
        unscheduledTasks: schedule.unscheduledTasks || [],
        recommendations: schedule.recommendations || [],
      };
    } catch (error) {
      logger.error('AI scheduling error:', error);
      if (isQuotaError(error)) {
        return {
          scheduledTasks: [],
          unscheduledTasks: [],
          recommendations: [getErrorMessage(error)],
          error: 'quota_exceeded',
        };
      }
      return await aiService.fallbackSchedule(userId);
    }
  },

  async fallbackSchedule(userId: string) {
    const tasks = await Task.find({
      userId,
      status: { $in: ['pending', 'deferred'] },
    }).sort({ priority: -1, dueDate: 1 }).limit(10).lean();

    const now = new Date();
    let currentTime = new Date(now);
    currentTime.setHours(9, 0, 0, 0);
    if (currentTime < now) currentTime.setDate(currentTime.getDate() + 1);

    const scheduledTasks = [];
    for (const task of tasks) {
      const end = new Date(currentTime.getTime() + task.estimatedDuration * 60 * 1000);
      if (end.getHours() > 17) {
        currentTime.setDate(currentTime.getDate() + 1);
        currentTime.setHours(9, 0, 0, 0);
      }

      await Task.findByIdAndUpdate(task._id, {
        scheduledStart: new Date(currentTime),
        scheduledEnd: new Date(currentTime.getTime() + task.estimatedDuration * 60 * 1000),
        status: 'scheduled',
      });

      scheduledTasks.push({ taskId: task._id, scheduledStart: currentTime });
      currentTime = new Date(currentTime.getTime() + (task.estimatedDuration + 15) * 60 * 1000);
    }

    return {
      scheduledTasks,
      unscheduledTasks: [],
      recommendations: ['Schedule generated using smart rules (AI quota reached).'],
    };
  },

  async chat(userId: string, message: string, history: Array<{ role: string; content: string }>) {
    try {
      const user = await User.findById(userId);
      const tasks = await Task.find({ userId, status: { $in: ['pending', 'scheduled'] } }).limit(10).lean();

      const systemContext = `You are FlowTime AI, an intelligent productivity and scheduling assistant.
User: ${user?.name || 'User'}
Current time: ${new Date().toISOString()}
Timezone: ${user?.timezone || 'UTC'}
Pending tasks: ${tasks.length > 0
  ? tasks.map(t => `"${t.title}" (${t.priority} priority, due: ${t.dueDate ? new Date(t.dueDate).toLocaleDateString() : 'no deadline'})`).join(', ')
  : 'none'}

You can help with scheduling tasks, optimizing productivity, analyzing workload, suggesting focus times, and providing productivity insights. Be concise, helpful, and actionable. Use markdown formatting for clarity.`;

      const response = await withRetry(async (modelIdx) => {
        const model = getModel(modelIdx);
        const chat = model.startChat({
          history: [
            { role: 'user', parts: [{ text: systemContext }] },
            { role: 'model', parts: [{ text: "I'm ready to help you optimize your schedule and productivity!" }] },
            ...history.map(h => ({
              // Gemini only accepts 'user' or 'model' — map 'assistant' → 'model'
              role: (h.role === 'assistant' ? 'model' : 'user') as 'user' | 'model',
              parts: [{ text: h.content }],
            })),
          ],
        });
        const result = await chat.sendMessage(message);
        return result.response.text();
      });

      return response;
    } catch (error) {
      logger.error('AI chat error:', error);
      // Always use local fallback — whether quota, validation, or network error
      return aiService.localChatFallback(userId, message);
    }
  },

  async localChatFallback(userId: string, message: string): Promise<string> {
    const msg = message.toLowerCase();

    // ── 1. DETECT if user wants to CREATE + SCHEDULE tasks from natural language ──
    const isCreatingTasks =
      msg.includes('schedule') || msg.includes('plan') || msg.includes('add') ||
      msg.includes('create') || msg.includes('remind') || msg.includes('need to') ||
      msg.includes('have to') || msg.includes('want to') || msg.includes('i need') ||
      msg.includes('i have') || msg.includes('prioritize') || msg.includes('shedule') ||
      msg.includes('priori');

    if (isCreatingTasks) {
      return await aiService.parseAndScheduleTasks(userId, message);
    }

    // ── 2. READ-ONLY queries ──
    const tasks = await Task.find({ userId, status: { $in: ['pending', 'scheduled', 'in_progress'] } })
      .sort({ priority: -1, dueDate: 1 }).limit(20).lean();
    const overdue = tasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date());
    const urgent = tasks.filter(t => t.priority === 'urgent' || t.priority === 'high');

    if (msg.includes('focus') || msg.includes('work on') || msg.includes('important')) {
      if (urgent.length > 0) {
        return `🎯 **Focus on these high-priority tasks first:**\n\n${urgent.slice(0, 3).map(t =>
          `• **${t.title}** — ${t.priority} priority${t.dueDate ? `, due ${new Date(t.dueDate).toLocaleDateString()}` : ''}`
        ).join('\n')}\n\n💡 Tackle the most urgent one first, then work down the list.`;
      }
      return `✅ You have **${tasks.length} pending tasks**. Start with the one that has the nearest deadline or highest priority.`;
    }

    if (msg.includes('overdue') || msg.includes('late') || msg.includes('missed')) {
      if (overdue.length === 0) return '✅ Great news — you have **no overdue tasks**! Keep it up.';
      return `⚠️ You have **${overdue.length} overdue task${overdue.length > 1 ? 's' : ''}**:\n\n${overdue.map(t =>
        `• **${t.title}** — was due ${new Date(t.dueDate!).toLocaleDateString()}`
      ).join('\n')}\n\n💡 Address these as soon as possible to stay on track.`;
    }

    if (msg.includes('tip') || msg.includes('productive') || msg.includes('improve')) {
      const tips = [
        '🍅 Use the **Pomodoro technique** — 25 min focused work, 5 min break.',
        '📵 Put your phone on **Do Not Disturb** during deep work sessions.',
        '🌅 Tackle your **hardest task first** thing in the morning when energy is highest.',
        '📋 **Time-block** your calendar — assign specific tasks to specific time slots.',
        '🔋 Match task **energy requirements** to your energy levels throughout the day.',
      ];
      return tips[Math.floor(Math.random() * tips.length)];
    }

    if (msg.includes('how many') || msg.includes('status') || msg.includes('summary')) {
      return `📊 **Your task summary:**\n\n• **${tasks.length}** pending/in-progress tasks\n• **${urgent.length}** high priority\n• **${overdue.length}** overdue\n\n${tasks.length > 5 ? '💡 You have a full plate — consider deferring low-priority tasks.' : '✅ Manageable workload!'}`;
    }

    // Default
    return `👋 Hi! I can help you:\n\n• **Schedule tasks** — just tell me what you need to do\n• **Prioritize** your workload\n• **Check status** of your tasks\n• **Get productivity tips**\n\nYou currently have **${tasks.length}** pending tasks. What would you like to do?`;
  },

  async parseAndScheduleTasks(userId: string, message: string): Promise<string> {
    // Extract tasks from natural language using pattern matching
    const extractedTasks = aiService.extractTasksFromText(message);

    if (extractedTasks.length === 0) {
      // No specific tasks found — show existing schedule
      const tasks = await Task.find({ userId, status: { $in: ['pending', 'scheduled'] } })
        .sort({ priority: -1, dueDate: 1 }).limit(10).lean();

      if (tasks.length === 0) {
        return `📝 I didn't find specific tasks in your message. Try saying something like:\n\n*"Add task: review report at 9am, call client at 2pm, exercise at 6pm"*\n\nOr go to the **Tasks** page to create tasks manually.`;
      }

      // Schedule existing tasks
      const scheduled = await aiService.scheduleTasksForDate(userId, tasks, message);
      return scheduled;
    }

    // Create the extracted tasks in the database
    const createdTasks = [];
    for (const t of extractedTasks) {
      const task = await Task.create({
        title: t.title,
        estimatedDuration: t.duration,
        priority: t.priority,
        status: 'pending',
        energyRequired: t.energy,
        userId,
        tags: ['ai-created'],
      });
      createdTasks.push({ ...t, _id: task._id });
    }

    // Now schedule all of them (newly created + existing pending)
    const allPending = await Task.find({ userId, status: 'pending' })
      .sort({ priority: -1 }).limit(15).lean();

    const scheduled = await aiService.scheduleTasksForDate(userId, allPending, message);

    const taskList = createdTasks.map(t =>
      `• **${t.title}** *(${t.duration} min, ${t.priority} priority)*`
    ).join('\n');

    return `✅ **Created ${createdTasks.length} task${createdTasks.length > 1 ? 's' : ''}:**\n\n${taskList}\n\n${scheduled}`;
  },

  extractTasksFromText(message: string): Array<{
    title: string;
    duration: number;
    priority: string;
    energy: string;
    time?: string;
  }> {
    const tasks: Array<{ title: string; duration: number; priority: string; energy: string; time?: string }> = [];
    const msg = message.toLowerCase();

    // Time pattern: "at 8am", "at 8:00", "at 8.00"
    const timePattern = /at\s+(\d{1,2})[:.h]?(\d{0,2})\s*(am|pm)?/i;
    const extractTime = (str: string): string | undefined => {
      const m = str.match(timePattern);
      if (!m) return undefined;
      const h = parseInt(m[1]);
      const min = m[2] ? m[2].padStart(2, '0') : '00';
      const ampm = m[3] || (h < 7 ? 'pm' : 'am');
      return `${h}:${min} ${ampm}`;
    };

    // Keyword-based task detection — each pattern maps to a clean task
    const taskPatterns: Array<{
      keywords: string[];
      title: string;
      duration: number;
      priority: string;
      energy: string;
    }> = [
      { keywords: ['eat', 'breakfast', 'lunch', 'dinner', 'meal', 'food', 'snack'], title: 'Meal time', duration: 30, priority: 'medium', energy: 'low' },
      { keywords: ['sleep', 'rest', 'nap', 'bed', 'bedtime'], title: 'Sleep / Rest', duration: 480, priority: 'high', energy: 'low' },
      { keywords: ['vegetable', 'veggie', 'grocery', 'groceries', 'shopping', 'market', 'store', 'buy'], title: 'Grocery shopping', duration: 60, priority: 'medium', energy: 'medium' },
      { keywords: ['movie', 'film', 'cinema', 'theater', 'theatre'], title: 'Watch movie', duration: 150, priority: 'low', energy: 'low' },
      { keywords: ['exercise', 'workout', 'gym', 'run', 'jog', 'yoga', 'fitness', 'walk'], title: 'Exercise / Workout', duration: 45, priority: 'high', energy: 'high' },
      { keywords: ['meeting', 'call', 'conference', 'standup', 'sync'], title: 'Meeting / Call', duration: 30, priority: 'high', energy: 'medium' },
      { keywords: ['read', 'reading', 'book', 'study', 'learn'], title: 'Reading / Study', duration: 30, priority: 'medium', energy: 'medium' },
      { keywords: ['meditat', 'mindful', 'breathe', 'relax'], title: 'Meditation', duration: 15, priority: 'medium', energy: 'low' },
      { keywords: ['cook', 'cooking', 'prepare food', 'make dinner', 'make lunch'], title: 'Cooking', duration: 45, priority: 'medium', energy: 'medium' },
      { keywords: ['clean', 'cleaning', 'laundry', 'dishes', 'tidy'], title: 'Household chores', duration: 30, priority: 'low', energy: 'medium' },
      { keywords: ['work', 'office', 'project', 'report', 'presentation'], title: 'Work session', duration: 90, priority: 'high', energy: 'high' },
      { keywords: ['doctor', 'dentist', 'appointment', 'clinic', 'hospital'], title: 'Medical appointment', duration: 60, priority: 'urgent', energy: 'medium' },
    ];

    for (const pattern of taskPatterns) {
      const matched = pattern.keywords.some(kw => msg.includes(kw));
      if (matched && !tasks.some(t => t.title === pattern.title)) {
        // Find the time mentioned near this keyword
        const keywordIdx = pattern.keywords.findIndex(kw => msg.includes(kw));
        const kw = pattern.keywords[keywordIdx];
        const kwPos = msg.indexOf(kw);
        const surrounding = message.slice(Math.max(0, kwPos - 10), kwPos + 40);
        const time = extractTime(surrounding) || extractTime(message);

        tasks.push({ ...pattern, time });
      }
    }

    return tasks;
  },

  async scheduleTasksForDate(
    userId: string,
    tasks: Array<{ _id: unknown; title: string; estimatedDuration: number; priority: string }>,
    message: string
  ): Promise<string> {
    if (tasks.length === 0) {
      return '📭 No tasks to schedule. Create some tasks first!';
    }

    // Determine target date from message
    const msg = message.toLowerCase();
    const targetDate = new Date();
    if (msg.includes('tomorrow')) {
      targetDate.setDate(targetDate.getDate() + 1);
    } else {
      // Check for specific date like "28th may", "may 28"
      const dateMatch = msg.match(/(\d{1,2})(?:st|nd|rd|th)?\s+(?:of\s+)?(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)/i) ||
                        msg.match(/(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\w*\s+(\d{1,2})/i);
      if (dateMatch) {
        const months: Record<string, number> = { jan:0,feb:1,mar:2,apr:3,may:4,jun:5,jul:6,aug:7,sep:8,oct:9,nov:10,dec:11 };
        const monthStr = (dateMatch[2] || dateMatch[1]).toLowerCase().slice(0, 3);
        const day = parseInt(dateMatch[1].match(/\d+/) ? dateMatch[1] : dateMatch[2]);
        if (months[monthStr] !== undefined && !isNaN(day)) {
          targetDate.setMonth(months[monthStr]);
          targetDate.setDate(day);
          if (targetDate < new Date()) targetDate.setFullYear(targetDate.getFullYear() + 1);
        }
      }
    }

    // Build time slots starting at 8am
    const dateStr = targetDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
    let currentHour = 8;
    let currentMin = 0;
    const scheduledItems: string[] = [];
    const timeSlotEmojis: Record<string, string> = {
      '8': '🌅', '9': '☀️', '10': '💪', '11': '🧠',
      '12': '🍽️', '13': '🍽️', '14': '⚡', '15': '📋',
      '16': '🔄', '17': '🌆', '18': '🏃', '19': '🌙', '20': '😴',
    };

    // Get or create default calendar for the user
    const { Calendar } = await import('../models/Calendar');
    const { CalendarEvent } = await import('../models/CalendarEvent');
    let calendar = await Calendar.findOne({ userId, isDefault: true });
    if (!calendar) {
      calendar = await Calendar.create({
        name: 'My Calendar',
        color: '#6366f1',
        provider: 'flowtime',
        isDefault: true,
        isPrimary: true,
        userId,
      });
    }

    for (const task of tasks.slice(0, 8)) {
      if (currentHour >= 22) break;

      const ampm = currentHour < 12 ? 'AM' : 'PM';
      const displayHour = currentHour > 12 ? currentHour - 12 : currentHour === 0 ? 12 : currentHour;
      const emoji = timeSlotEmojis[String(currentHour)] || '📌';

      // Update task in DB
      const scheduledStart = new Date(targetDate);
      scheduledStart.setHours(currentHour, currentMin, 0, 0);
      const duration = task.estimatedDuration || 30;
      const scheduledEnd = new Date(scheduledStart.getTime() + duration * 60 * 1000);

      await Task.findByIdAndUpdate(task._id, {
        scheduledStart,
        scheduledEnd,
        status: 'scheduled',
      });

      // ── CREATE CALENDAR EVENT so it shows on the calendar ──
      await CalendarEvent.findOneAndUpdate(
        { taskId: task._id, userId },
        {
          title: task.title,
          start: scheduledStart,
          end: scheduledEnd,
          type: 'task',
          source: 'flowtime',
          color: task.priority === 'urgent' ? '#ef4444'
               : task.priority === 'high'   ? '#f97316'
               : task.priority === 'medium' ? '#6366f1'
               : '#22c55e',
          calendarId: calendar._id,
          userId,
          taskId: task._id,
        },
        { upsert: true, new: true }
      );

      scheduledItems.push(
        `${emoji} **${displayHour}:${currentMin.toString().padStart(2, '0')} ${ampm}** — ${task.title} *(${duration} min)*`
      );

      // Advance time: task duration + 15 min buffer
      const totalMins = currentMin + duration + 15;
      currentHour += Math.floor(totalMins / 60);
      currentMin = totalMins % 60;

      // Lunch break at noon
      if (currentHour === 12 && currentMin < 30) {
        currentHour = 13;
        currentMin = 0;
      }
    }

    return `📅 **Scheduled for ${dateStr}:**\n\n${scheduledItems.join('\n')}\n\n✅ *${tasks.length} task${tasks.length > 1 ? 's' : ''} scheduled and added to your calendar!*`;
  },

  async getProductivityInsights(userId: string) {
    try {
      const tasks = await Task.find({ userId }).lean();
      const completedTasks = tasks.filter(t => t.status === 'completed');
      const pendingTasks = tasks.filter(t => t.status === 'pending');

      const prompt = `Analyze this user's productivity data and provide 3-5 short, actionable insights.

Stats:
- Completed tasks: ${completedTasks.length}
- Pending tasks: ${pendingTasks.length}
- Overdue: ${pendingTasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date()).length}
- High priority pending: ${pendingTasks.filter(t => t.priority === 'high' || t.priority === 'urgent').length}
- Avg task duration: ${completedTasks.length > 0 ? Math.round(completedTasks.reduce((a, t) => a + (t.estimatedDuration || 0), 0) / completedTasks.length) : 0} min

Return ONLY a JSON array of strings (no markdown): ["insight1", "insight2", "insight3"]`;

      const insights = await withRetry(async (modelIdx) => {
        const model = getModel(modelIdx);
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        const jsonMatch = text.match(/\[[\s\S]*\]/);
        if (jsonMatch) return JSON.parse(jsonMatch[0]);
        return null;
      });

      return insights || [
        'Focus on your highest priority tasks first each morning.',
        'Break large tasks into smaller 25-minute chunks.',
        'Schedule deep work during your peak energy hours.',
      ];
    } catch (error) {
      logger.error('AI insights error:', error);
      return ['Focus on completing your highest priority tasks today.'];
    }
  },

  async getRecommendations(userId: string) {
    return AIRecommendation.find({
      userId,
      applied: false,
      dismissed: false,
    })
      .sort({ score: -1, createdAt: -1 })
      .limit(10)
      .lean();
  },

  async applyRecommendation(recommendationId: string, userId: string) {
    return AIRecommendation.findOneAndUpdate(
      { _id: recommendationId, userId },
      { applied: true },
      { new: true }
    );
  },

  async dismissRecommendation(recommendationId: string, userId: string) {
    return AIRecommendation.findOneAndUpdate(
      { _id: recommendationId, userId },
      { dismissed: true },
      { new: true }
    );
  },

  async estimateTaskDuration(title: string, description?: string) {
    try {
      const prompt = `Estimate the time needed for this task in minutes. Return ONLY valid JSON (no markdown): {"minutes": number, "reasoning": "brief explanation"}

Task: "${title}"
${description ? `Description: "${description}"` : ''}`;

      const result = await withRetry(async (modelIdx) => {
        const model = getModel(modelIdx);
        const res = await model.generateContent(prompt);
        const text = res.response.text();
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) return JSON.parse(jsonMatch[0]);
        return null;
      });

      return result || { minutes: 30, reasoning: 'Default estimate' };
    } catch {
      return { minutes: 30, reasoning: 'Default estimate' };
    }
  },
};
