import { Task, ITask } from '../models/Task';
import { AppError } from '../middlewares/errorHandler';
import mongoose from 'mongoose';

export const taskService = {
  async getTasks(userId: string, filters: {
    status?: string;
    priority?: string;
    category?: string;
    tags?: string[];
    search?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: string;
    workspaceId?: string;
  }) {
    const {
      status, priority, category, tags, search,
      page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc',
      workspaceId,
    } = filters;

    const query: Record<string, unknown> = { userId };
    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (category) query.category = category;
    if (tags?.length) query.tags = { $in: tags };
    if (workspaceId) query.workspaceId = workspaceId;
    if (search) query.$text = { $search: search };

    const skip = (page - 1) * limit;
    const sort: Record<string, 1 | -1> = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

    const [tasks, total] = await Promise.all([
      Task.find(query).sort(sort).skip(skip).limit(limit).lean(),
      Task.countDocuments(query),
    ]);

    return {
      tasks,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    };
  },

  async getTaskById(taskId: string, userId: string) {
    const task = await Task.findOne({ _id: taskId, userId });
    if (!task) throw new AppError('Task not found', 404);
    return task;
  },

  async createTask(userId: string, data: Partial<ITask>) {
    const task = await Task.create({ ...data, userId });
    return task;
  },

  async updateTask(taskId: string, userId: string, data: Partial<ITask>) {
    const task = await Task.findOneAndUpdate(
      { _id: taskId, userId },
      { ...data, updatedAt: new Date() },
      { new: true, runValidators: true }
    );
    if (!task) throw new AppError('Task not found', 404);
    return task;
  },

  async deleteTask(taskId: string, userId: string) {
    const task = await Task.findOneAndUpdate(
      { _id: taskId, userId },
      { isDeleted: true },
      { new: true }
    );
    if (!task) throw new AppError('Task not found', 404);
    return task;
  },

  async completeTask(taskId: string, userId: string, actualDuration?: number) {
    const task = await Task.findOneAndUpdate(
      { _id: taskId, userId },
      {
        status: 'completed',
        completedAt: new Date(),
        ...(actualDuration && { actualDuration }),
      },
      { new: true }
    );
    if (!task) throw new AppError('Task not found', 404);
    return task;
  },

  async addComment(taskId: string, userId: string, userName: string, content: string) {
    const task = await Task.findOneAndUpdate(
      { _id: taskId, userId },
      {
        $push: {
          comments: {
            userId: new mongoose.Types.ObjectId(userId),
            userName,
            content,
            createdAt: new Date(),
          },
        },
      },
      { new: true }
    );
    if (!task) throw new AppError('Task not found', 404);
    return task;
  },

  async addSubtask(taskId: string, userId: string, title: string) {
    const task = await Task.findOneAndUpdate(
      { _id: taskId, userId },
      { $push: { subtasks: { title, completed: false, createdAt: new Date() } } },
      { new: true }
    );
    if (!task) throw new AppError('Task not found', 404);
    return task;
  },

  async toggleSubtask(taskId: string, userId: string, subtaskId: string) {
    const task = await Task.findOne({ _id: taskId, userId });
    if (!task) throw new AppError('Task not found', 404);

    const subtask = task.subtasks.find((s) => (s as unknown as { _id?: { toString(): string } })._id?.toString() === subtaskId);
    if (!subtask) throw new AppError('Subtask not found', 404);

    subtask.completed = !subtask.completed;
    await task.save();
    return task;
  },

  async getUpcomingTasks(userId: string, days = 7) {
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + days);

    return Task.find({
      userId,
      status: { $in: ['pending', 'scheduled', 'in_progress'] },
      $or: [
        { dueDate: { $lte: endDate } },
        { scheduledStart: { $lte: endDate } },
      ],
    })
      .sort({ dueDate: 1, scheduledStart: 1 })
      .limit(20)
      .lean();
  },

  async getOverdueTasks(userId: string) {
    return Task.find({
      userId,
      status: { $in: ['pending', 'scheduled'] },
      dueDate: { $lt: new Date() },
    })
      .sort({ dueDate: 1 })
      .lean();
  },
};
