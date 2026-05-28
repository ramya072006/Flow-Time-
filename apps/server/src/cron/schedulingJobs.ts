import cron from 'node-cron';
import { Task } from '../models/Task';
import { Notification } from '../models/Notification';
import { User } from '../models/User';
import { logger } from '../utils/logger';

export const setupCronJobs = () => {
  // Check for overdue tasks every hour
  cron.schedule('0 * * * *', async () => {
    try {
      const overdueTasks = await Task.find({
        status: { $in: ['pending', 'scheduled'] },
        dueDate: { $lt: new Date() },
      }).lean();

      for (const task of overdueTasks) {
        const existingNotif = await Notification.findOne({
          userId: task.userId,
          type: 'deadline_alert',
          'metadata.taskId': task._id.toString(),
          createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
        });

        if (!existingNotif) {
          await Notification.create({
            type: 'deadline_alert',
            title: 'Task Overdue',
            message: `"${task.title}" is overdue`,
            userId: task.userId,
            actionUrl: `/tasks/${task._id}`,
            metadata: { taskId: task._id.toString() },
          });
        }
      }
      logger.debug(`Checked ${overdueTasks.length} overdue tasks`);
    } catch (error) {
      logger.error('Overdue task check failed:', error);
    }
  });

  // Daily AI schedule generation at 7 AM
  cron.schedule('0 7 * * *', async () => {
    try {
      const users = await User.find({
        'aiSettings.autoSchedule': true,
        emailVerified: true,
      }).select('_id').lean();

      logger.info(`Auto-scheduling for ${users.length} users`);
      // Note: In production, this would use a queue (BullMQ)
      // For now, we log the intent
    } catch (error) {
      logger.error('Auto-schedule job failed:', error);
    }
  });

  // Clean up expired notifications daily
  cron.schedule('0 2 * * *', async () => {
    try {
      const result = await Notification.deleteMany({
        expiresAt: { $lt: new Date() },
      });
      logger.debug(`Cleaned up ${result.deletedCount} expired notifications`);
    } catch (error) {
      logger.error('Notification cleanup failed:', error);
    }
  });

  logger.info('✅ Cron jobs initialized');
};
