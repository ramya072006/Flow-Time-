import { Response } from 'express';
import { aiService } from '../services/aiService';
import { sendSuccess, sendError } from '../utils/apiResponse';
import { asyncHandler } from '../utils/asyncHandler';
import { AuthRequest } from '../middlewares/auth';
import { ChatHistory } from '../models/ChatHistory';
import { Task } from '../models/Task';

// Generate context-aware suggestions based on conversation + user tasks
const generateSuggestions = async (
  userId: string,
  lastMessage: string,
  lastResponse: string
): Promise<string[]> => {
  const msg = lastMessage.toLowerCase();
  const resp = lastResponse.toLowerCase();

  // Fetch user's current tasks for context
  const tasks = await Task.find({
    userId,
    status: { $in: ['pending', 'scheduled', 'in_progress'] },
  }).sort({ priority: -1, dueDate: 1 }).limit(5).lean();

  const hasTasks = tasks.length > 0;
  const hasUrgent = tasks.some(t => t.priority === 'urgent' || t.priority === 'high');
  const hasOverdue = tasks.some(t => t.dueDate && new Date(t.dueDate) < new Date());
  const topTask = tasks[0]?.title;

  // Context-aware suggestion pools
  const afterScheduling = [
    'Show me my full week schedule',
    'Which task should I start first?',
    'Add a break between my tasks',
    'Reschedule tasks to next week',
    topTask ? `How long will "${topTask}" take?` : 'Estimate time for my tasks',
  ];

  const afterPriority = [
    'Schedule my high priority tasks now',
    'What can I defer to next week?',
    'Block focus time for deep work',
    hasOverdue ? 'Help me catch up on overdue tasks' : 'Set deadlines for my tasks',
    'Create a morning routine',
  ];

  const afterGeneral = [
    hasTasks ? `Schedule "${topTask}"` : 'Add a new task for today',
    'Plan my day for tomorrow',
    hasUrgent ? 'Focus on urgent tasks first' : 'What should I work on now?',
    'Give me a productivity tip',
    'Show my task summary',
  ];

  const defaultSuggestions = [
    'Schedule my tasks for today',
    'What are my priorities?',
    'Plan my week',
    'Add: exercise at 7am, read at 9pm',
    'How productive was I this week?',
  ];

  // Pick suggestions based on context
  if (msg.includes('schedule') || resp.includes('scheduled for') || resp.includes('📅')) {
    return afterScheduling.filter(Boolean).slice(0, 4) as string[];
  }
  if (msg.includes('priority') || msg.includes('focus') || resp.includes('🎯')) {
    return afterPriority.slice(0, 4);
  }
  if (hasTasks) {
    return afterGeneral.filter(Boolean).slice(0, 4) as string[];
  }
  return defaultSuggestions.slice(0, 4);
};

export const aiController = {
  generateSchedule: asyncHandler(async (req: AuthRequest, res: Response) => {
    const result = await aiService.generateSchedule(req.user!.userId);
    sendSuccess(res, result, 'Schedule generated');
  }),

  chat: asyncHandler(async (req: AuthRequest, res: Response) => {
    const { message, history = [] } = req.body;
    if (!message) {
      sendError(res, 'Message is required', 400);
      return;
    }

    const userId = req.user!.userId;

    // Get or create persistent chat history
    let chatHistory = await ChatHistory.findOne({ userId });
    if (!chatHistory) {
      chatHistory = await ChatHistory.create({ userId, messages: [] });
    }

    // Build full history from DB (last 20 messages) + current session
    const dbHistory = chatHistory.messages.slice(-20).map(m => ({
      role: m.role,
      content: m.content,
    }));

    // Merge DB history with any additional history from client
    const fullHistory = dbHistory.length > 0 ? dbHistory : history;

    // Get AI response
    const response = await aiService.chat(userId, message, fullHistory);

    // Generate context-aware suggestions
    const suggestions = await generateSuggestions(userId, message, response);

    // Save both messages to persistent history
    chatHistory.messages.push(
      { role: 'user', content: message, timestamp: new Date() },
      { role: 'assistant', content: response, timestamp: new Date(), suggestions }
    );

    // Keep only last 100 messages to avoid unbounded growth
    if (chatHistory.messages.length > 100) {
      chatHistory.messages = chatHistory.messages.slice(-100);
    }
    await chatHistory.save();

    sendSuccess(res, { message: response, suggestions });
  }),

  getChatHistory: asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user!.userId;
    const { limit = 50 } = req.query;

    const chatHistory = await ChatHistory.findOne({ userId });
    if (!chatHistory) {
      sendSuccess(res, { messages: [], suggestions: [] });
      return;
    }

    const messages = chatHistory.messages.slice(-parseInt(limit as string));
    const lastAssistantMsg = [...messages].reverse().find(m => m.role === 'assistant');
    const suggestions = lastAssistantMsg?.suggestions || [];

    sendSuccess(res, { messages, suggestions });
  }),

  clearChatHistory: asyncHandler(async (req: AuthRequest, res: Response) => {
    await ChatHistory.findOneAndUpdate(
      { userId: req.user!.userId },
      { messages: [] }
    );
    sendSuccess(res, null, 'Chat history cleared');
  }),

  getInsights: asyncHandler(async (req: AuthRequest, res: Response) => {
    const insights = await aiService.getProductivityInsights(req.user!.userId);
    sendSuccess(res, insights);
  }),

  getRecommendations: asyncHandler(async (req: AuthRequest, res: Response) => {
    const recommendations = await aiService.getRecommendations(req.user!.userId);
    sendSuccess(res, recommendations);
  }),

  applyRecommendation: asyncHandler(async (req: AuthRequest, res: Response) => {
    const rec = await aiService.applyRecommendation(req.params.id as string, req.user!.userId);
    sendSuccess(res, rec, 'Recommendation applied');
  }),

  dismissRecommendation: asyncHandler(async (req: AuthRequest, res: Response) => {
    const rec = await aiService.dismissRecommendation(req.params.id as string, req.user!.userId);
    sendSuccess(res, rec, 'Recommendation dismissed');
  }),

  estimateDuration: asyncHandler(async (req: AuthRequest, res: Response) => {
    const { title, description } = req.body;
    if (!title) {
      sendError(res, 'Title is required', 400);
      return;
    }
    const estimate = await aiService.estimateTaskDuration(title, description);
    sendSuccess(res, estimate);
  }),
};
