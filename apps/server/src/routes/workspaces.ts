import { Router, RequestHandler } from 'express';
import { authenticate } from '../middlewares/auth';
import { Workspace } from '../models/Workspace';
import { User } from '../models/User';
import { sendSuccess, sendCreated, sendError } from '../utils/apiResponse';
import { asyncHandler } from '../utils/asyncHandler';
import { AuthRequest } from '../middlewares/auth';
import mongoose from 'mongoose';

const router = Router();
router.use(authenticate as RequestHandler);

router.get('/', asyncHandler(async (req: AuthRequest, res) => {
  const workspaces = await Workspace.find({
    'members.userId': new mongoose.Types.ObjectId(req.user!.userId),
    isDeleted: false,
  }).lean();
  sendSuccess(res, workspaces);
}));

router.post('/', asyncHandler(async (req: AuthRequest, res) => {
  const user = await User.findById(req.user!.userId);
  if (!user) { sendError(res, 'User not found', 404); return; }

  const workspace = await Workspace.create({
    ...req.body,
    ownerId: req.user!.userId,
    members: [{
      userId: req.user!.userId,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      role: 'owner',
      joinedAt: new Date(),
    }],
  });
  sendCreated(res, workspace, 'Workspace created');
}));

router.get('/:id', asyncHandler(async (req: AuthRequest, res) => {
  const workspace = await Workspace.findOne({
    _id: req.params.id,
    'members.userId': req.user!.userId,
    isDeleted: false,
  });
  if (!workspace) { sendError(res, 'Workspace not found', 404); return; }
  sendSuccess(res, workspace);
}));

router.patch('/:id', asyncHandler(async (req: AuthRequest, res) => {
  const workspace = await Workspace.findOneAndUpdate(
    { _id: req.params.id, ownerId: req.user!.userId },
    req.body,
    { new: true }
  );
  if (!workspace) { sendError(res, 'Workspace not found', 404); return; }
  sendSuccess(res, workspace, 'Workspace updated');
}));

router.post('/:id/invite', asyncHandler(async (req: AuthRequest, res) => {
  const { email, role = 'member' } = req.body;
  const invitedUser = await User.findOne({ email });
  if (!invitedUser) { sendError(res, 'User not found', 404); return; }

  const workspace = await Workspace.findOneAndUpdate(
    { _id: req.params.id, ownerId: req.user!.userId },
    {
      $push: {
        members: {
          userId: invitedUser._id,
          name: invitedUser.name,
          email: invitedUser.email,
          avatar: invitedUser.avatar,
          role,
          joinedAt: new Date(),
        },
      },
    },
    { new: true }
  );
  if (!workspace) { sendError(res, 'Workspace not found', 404); return; }
  sendSuccess(res, workspace, 'Member invited');
}));

router.delete('/:id/members/:userId', asyncHandler(async (req: AuthRequest, res) => {
  const workspace = await Workspace.findOneAndUpdate(
    { _id: req.params.id, ownerId: req.user!.userId },
    { $pull: { members: { userId: new mongoose.Types.ObjectId(req.params.userId as string) } } },
    { new: true }
  );
  if (!workspace) { sendError(res, 'Workspace not found', 404); return; }
  sendSuccess(res, workspace, 'Member removed');
}));

export default router;
