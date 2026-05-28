import { Router, RequestHandler } from 'express';
import { authenticate } from '../middlewares/auth';
import { Notification } from '../models/Notification';
import { sendSuccess } from '../utils/apiResponse';
import { asyncHandler } from '../utils/asyncHandler';
import { AuthRequest } from '../middlewares/auth';

const router = Router();

router.use(authenticate as RequestHandler);

router.get('/', asyncHandler(async (req: AuthRequest, res) => {
  const { page = 1, limit = 20 } = req.query;
  const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

  const [notifications, total] = await Promise.all([
    Notification.find({ userId: req.user!.userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit as string))
      .lean(),
    Notification.countDocuments({ userId: req.user!.userId }),
  ]);

  sendSuccess(res, notifications, 'Notifications retrieved', 200, {
    page: parseInt(page as string),
    limit: parseInt(limit as string),
    total,
    totalPages: Math.ceil(total / parseInt(limit as string)),
    hasNext: skip + notifications.length < total,
    hasPrev: parseInt(page as string) > 1,
  });
}));

router.get('/unread-count', asyncHandler(async (req: AuthRequest, res) => {
  const count = await Notification.countDocuments({ userId: req.user!.userId, read: false });
  sendSuccess(res, { count });
}));

router.patch('/:id/read', asyncHandler(async (req: AuthRequest, res) => {
  await Notification.findOneAndUpdate({ _id: req.params.id, userId: req.user!.userId }, { read: true });
  sendSuccess(res, null, 'Marked as read');
}));

router.patch('/read-all', asyncHandler(async (req: AuthRequest, res) => {
  await Notification.updateMany({ userId: req.user!.userId, read: false }, { read: true });
  sendSuccess(res, null, 'All notifications marked as read');
}));

router.delete('/:id', asyncHandler(async (req: AuthRequest, res) => {
  await Notification.findOneAndDelete({ _id: req.params.id, userId: req.user!.userId });
  sendSuccess(res, null, 'Notification deleted');
}));

export default router;
