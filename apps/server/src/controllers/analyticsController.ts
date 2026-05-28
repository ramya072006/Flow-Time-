import { Response } from 'express';
import { analyticsService } from '../services/analyticsService';
import { sendSuccess } from '../utils/apiResponse';
import { asyncHandler } from '../utils/asyncHandler';
import { AuthRequest } from '../middlewares/auth';

export const analyticsController = {
  getDashboard: asyncHandler(async (req: AuthRequest, res: Response) => {
    const data = await analyticsService.getDashboardAnalytics(req.user!.userId);
    sendSuccess(res, data);
  }),

  getProductivityTrend: asyncHandler(async (req: AuthRequest, res: Response) => {
    const { days } = req.query;
    const trend = await analyticsService.getProductivityTrend(
      req.user!.userId,
      days ? parseInt(days as string) : 14
    );
    sendSuccess(res, trend);
  }),

  getTimeAllocation: asyncHandler(async (req: AuthRequest, res: Response) => {
    const { start, end } = req.query;
    const startDate = start ? new Date(start as string) : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const endDate = end ? new Date(end as string) : new Date();
    const allocation = await analyticsService.getTimeAllocation(req.user!.userId, startDate, endDate);
    sendSuccess(res, allocation);
  }),

  getWeeklyReport: asyncHandler(async (req: AuthRequest, res: Response) => {
    const report = await analyticsService.getWeeklyReport(req.user!.userId);
    sendSuccess(res, report);
  }),
};
