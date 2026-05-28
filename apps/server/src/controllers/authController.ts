import { Request, Response } from 'express';
import { authService } from '../services/authService';
import { sendSuccess, sendCreated, sendError } from '../utils/apiResponse';
import { asyncHandler } from '../utils/asyncHandler';
import { AuthRequest } from '../middlewares/auth';
import { User } from '../models/User';

export const authController = {
  register: asyncHandler(async (req: Request, res: Response) => {
    const { name, email, password, timezone } = req.body;
    const result = await authService.register(name, email, password, timezone);
    sendCreated(res, {
      user: result.user,
      tokens: result.tokens,
    }, 'Registration successful');
  }),

  login: asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    sendSuccess(res, {
      user: result.user,
      tokens: result.tokens,
    }, 'Login successful');
  }),

  logout: asyncHandler(async (req: AuthRequest, res: Response) => {
    const { refreshToken } = req.body;
    if (req.user && refreshToken) {
      await authService.logout(req.user.userId, refreshToken);
    }
    sendSuccess(res, null, 'Logged out successfully');
  }),

  refreshToken: asyncHandler(async (req: Request, res: Response) => {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      sendError(res, 'Refresh token required', 400);
      return;
    }
    const tokens = await authService.refreshTokens(refreshToken);
    sendSuccess(res, tokens, 'Tokens refreshed');
  }),

  verifyEmail: asyncHandler(async (req: Request, res: Response) => {
    const { token } = req.query as { token: string };
    await authService.verifyEmail(token);
    sendSuccess(res, null, 'Email verified successfully');
  }),

  forgotPassword: asyncHandler(async (req: Request, res: Response) => {
    const { email } = req.body;
    await authService.forgotPassword(email);
    sendSuccess(res, null, 'If that email exists, a reset link has been sent');
  }),

  resetPassword: asyncHandler(async (req: Request, res: Response) => {
    const { token, password } = req.body;
    await authService.resetPassword(token, password);
    sendSuccess(res, null, 'Password reset successfully');
  }),

  getMe: asyncHandler(async (req: AuthRequest, res: Response) => {
    const user = await User.findById(req.user?.userId);
    if (!user) {
      sendError(res, 'User not found', 404);
      return;
    }
    sendSuccess(res, user);
  }),

  updateProfile: asyncHandler(async (req: AuthRequest, res: Response) => {
    const allowedFields = ['name', 'avatar', 'timezone', 'workHours', 'sleepHours',
      'productivityPreferences', 'focusPreferences', 'aiSettings', 'notificationSettings'];
    const updates: Record<string, unknown> = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    }

    const user = await User.findByIdAndUpdate(req.user?.userId, updates, { new: true, runValidators: true });
    if (!user) {
      sendError(res, 'User not found', 404);
      return;
    }
    sendSuccess(res, user, 'Profile updated');
  }),

  changePassword: asyncHandler(async (req: AuthRequest, res: Response) => {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user?.userId).select('+password');
    if (!user) {
      sendError(res, 'User not found', 404);
      return;
    }

    const isValid = await user.comparePassword(currentPassword);
    if (!isValid) {
      sendError(res, 'Current password is incorrect', 400);
      return;
    }

    user.password = newPassword;
    user.refreshTokens = [];
    await user.save();
    sendSuccess(res, null, 'Password changed successfully');
  }),
};
