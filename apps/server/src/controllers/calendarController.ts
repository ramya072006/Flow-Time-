import { Response } from 'express';
import { calendarService } from '../services/calendarService';
import { sendSuccess, sendCreated } from '../utils/apiResponse';
import { asyncHandler } from '../utils/asyncHandler';
import { AuthRequest } from '../middlewares/auth';

export const calendarController = {
  getCalendars: asyncHandler(async (req: AuthRequest, res: Response) => {
    const calendars = await calendarService.getCalendars(req.user!.userId);
    sendSuccess(res, calendars);
  }),

  createCalendar: asyncHandler(async (req: AuthRequest, res: Response) => {
    const calendar = await calendarService.createCalendar(req.user!.userId, req.body);
    sendCreated(res, calendar, 'Calendar created');
  }),

  getEvents: asyncHandler(async (req: AuthRequest, res: Response) => {
    const { start, end, calendarIds } = req.query;
    const startDate = start ? new Date(start as string) : new Date();
    const endDate = end ? new Date(end as string) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    const ids = calendarIds ? (calendarIds as string).split(',') : undefined;

    const events = await calendarService.getEvents(req.user!.userId, startDate, endDate, ids);
    sendSuccess(res, events);
  }),

  getEvent: asyncHandler(async (req: AuthRequest, res: Response) => {
    const event = await calendarService.getEventById(req.params.id as string, req.user!.userId);
    sendSuccess(res, event);
  }),

  createEvent: asyncHandler(async (req: AuthRequest, res: Response) => {
    const event = await calendarService.createEvent(req.user!.userId, req.body);
    sendCreated(res, event, 'Event created');
  }),

  updateEvent: asyncHandler(async (req: AuthRequest, res: Response) => {
    const event = await calendarService.updateEvent(req.params.id as string, req.user!.userId, req.body);
    sendSuccess(res, event, 'Event updated');
  }),

  deleteEvent: asyncHandler(async (req: AuthRequest, res: Response) => {
    await calendarService.deleteEvent(req.params.id as string, req.user!.userId);
    sendSuccess(res, null, 'Event deleted');
  }),

  getFreeSlots: asyncHandler(async (req: AuthRequest, res: Response) => {
    const { date, duration } = req.query;
    const slots = await calendarService.getFreeSlots(
      req.user!.userId,
      date ? new Date(date as string) : new Date(),
      duration ? parseInt(duration as string) : 60
    );
    sendSuccess(res, slots);
  }),

  detectConflicts: asyncHandler(async (req: AuthRequest, res: Response) => {
    const { start, end, excludeEventId } = req.body;
    const conflicts = await calendarService.detectConflicts(
      req.user!.userId,
      new Date(start),
      new Date(end),
      excludeEventId
    );
    sendSuccess(res, conflicts);
  }),

  getMeetingLoad: asyncHandler(async (req: AuthRequest, res: Response) => {
    const { start, end } = req.query;
    const startDate = start ? new Date(start as string) : new Date();
    const endDate = end ? new Date(end as string) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const load = await calendarService.getMeetingLoad(req.user!.userId, startDate, endDate);
    sendSuccess(res, load);
  }),
};
