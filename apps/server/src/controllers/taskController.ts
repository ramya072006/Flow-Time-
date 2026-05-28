import { Response } from 'express';
import { taskService } from '../services/taskService';
import { sendSuccess, sendCreated, sendError } from '../utils/apiResponse';
import { asyncHandler } from '../utils/asyncHandler';
import { AuthRequest } from '../middlewares/auth';

export const taskController = {
  getTasks: asyncHandler(async (req: AuthRequest, res: Response) => {
    const { status, priority, category, tags, search, page, limit, sortBy, sortOrder, workspaceId } = req.query;
    const result = await taskService.getTasks(req.user!.userId, {
      status: status as string,
      priority: priority as string,
      category: category as string,
      tags: tags ? (tags as string).split(',') : undefined,
      search: search as string,
      page: page ? parseInt(page as string) : undefined,
      limit: limit ? parseInt(limit as string) : undefined,
      sortBy: sortBy as string,
      sortOrder: sortOrder as string,
      workspaceId: workspaceId as string,
    });
    sendSuccess(res, result.tasks, 'Tasks retrieved', 200, result.pagination);
  }),

  getTask: asyncHandler(async (req: AuthRequest, res: Response) => {
    const task = await taskService.getTaskById(req.params.id as string, req.user!.userId);
    sendSuccess(res, task);
  }),

  createTask: asyncHandler(async (req: AuthRequest, res: Response) => {
    const task = await taskService.createTask(req.user!.userId, req.body);
    sendCreated(res, task, 'Task created');
  }),

  updateTask: asyncHandler(async (req: AuthRequest, res: Response) => {
    const task = await taskService.updateTask(req.params.id as string, req.user!.userId, req.body);
    sendSuccess(res, task, 'Task updated');
  }),

  deleteTask: asyncHandler(async (req: AuthRequest, res: Response) => {
    await taskService.deleteTask(req.params.id as string, req.user!.userId);
    sendSuccess(res, null, 'Task deleted');
  }),

  completeTask: asyncHandler(async (req: AuthRequest, res: Response) => {
    const { actualDuration } = req.body;
    const task = await taskService.completeTask(req.params.id as string, req.user!.userId, actualDuration);
    sendSuccess(res, task, 'Task completed');
  }),

  addComment: asyncHandler(async (req: AuthRequest, res: Response) => {
    const { content } = req.body;
    const task = await taskService.addComment(req.params.id as string, req.user!.userId, req.user!.email, content);
    sendSuccess(res, task, 'Comment added');
  }),

  addSubtask: asyncHandler(async (req: AuthRequest, res: Response) => {
    const { title } = req.body;
    const task = await taskService.addSubtask(req.params.id as string, req.user!.userId, title);
    sendSuccess(res, task, 'Subtask added');
  }),

  toggleSubtask: asyncHandler(async (req: AuthRequest, res: Response) => {
    const task = await taskService.toggleSubtask(req.params.id as string, req.user!.userId, req.params.subtaskId as string);
    sendSuccess(res, task, 'Subtask toggled');
  }),

  getUpcoming: asyncHandler(async (req: AuthRequest, res: Response) => {
    const { days } = req.query;
    const tasks = await taskService.getUpcomingTasks(req.user!.userId, days ? parseInt(days as string) : 7);
    sendSuccess(res, tasks);
  }),

  getOverdue: asyncHandler(async (req: AuthRequest, res: Response) => {
    const tasks = await taskService.getOverdueTasks(req.user!.userId);
    sendSuccess(res, tasks);
  }),
};
