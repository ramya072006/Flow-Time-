import { CalendarEvent, ICalendarEvent } from '../models/CalendarEvent';
import { Calendar } from '../models/Calendar';
import { AppError } from '../middlewares/errorHandler';
import mongoose from 'mongoose';

export const calendarService = {
  async getCalendars(userId: string) {
    return Calendar.find({ userId, isDeleted: false }).lean();
  },

  async createCalendar(userId: string, data: { name: string; color?: string; description?: string }) {
    return Calendar.create({ ...data, userId });
  },

  async getEvents(userId: string, startDate: Date, endDate: Date, calendarIds?: string[]) {
    const query: Record<string, unknown> = {
      userId,
      start: { $lte: endDate },
      end: { $gte: startDate },
    };

    if (calendarIds?.length) {
      query.calendarId = { $in: calendarIds.map((id) => new mongoose.Types.ObjectId(id)) };
    }

    return CalendarEvent.find(query).sort({ start: 1 }).lean();
  },

  async getEventById(eventId: string, userId: string) {
    const event = await CalendarEvent.findOne({ _id: eventId, userId });
    if (!event) throw new AppError('Event not found', 404);
    return event;
  },

  async createEvent(userId: string, data: Partial<ICalendarEvent>) {
    // Get default calendar if not specified
    if (!data.calendarId) {
      const defaultCal = await Calendar.findOne({ userId, isDefault: true });
      if (!defaultCal) throw new AppError('No default calendar found', 400);
      data.calendarId = defaultCal._id as mongoose.Types.ObjectId;
    }

    return CalendarEvent.create({ ...data, userId });
  },

  async updateEvent(eventId: string, userId: string, data: Partial<ICalendarEvent>) {
    const event = await CalendarEvent.findOneAndUpdate(
      { _id: eventId, userId },
      data,
      { new: true, runValidators: true }
    );
    if (!event) throw new AppError('Event not found', 404);
    return event;
  },

  async deleteEvent(eventId: string, userId: string) {
    const event = await CalendarEvent.findOneAndUpdate(
      { _id: eventId, userId },
      { isDeleted: true },
      { new: true }
    );
    if (!event) throw new AppError('Event not found', 404);
    return event;
  },

  async getFreeSlots(userId: string, date: Date, duration: number): Promise<Array<{ start: Date; end: Date; score: number }>> {
    const dayStart = new Date(date);
    dayStart.setHours(9, 0, 0, 0);
    const dayEnd = new Date(date);
    dayEnd.setHours(18, 0, 0, 0);

    const events = await CalendarEvent.find({
      userId,
      start: { $gte: dayStart },
      end: { $lte: dayEnd },
    }).sort({ start: 1 }).lean();

    const slots: Array<{ start: Date; end: Date; score: number }> = [];
    let current = new Date(dayStart);

    for (const event of events) {
      const eventStart = new Date(event.start);
      const gap = (eventStart.getTime() - current.getTime()) / (1000 * 60);

      if (gap >= duration) {
        const slotEnd = new Date(current.getTime() + duration * 60 * 1000);
        const hour = current.getHours();
        // Score based on time of day (morning preferred)
        const score = hour >= 9 && hour <= 11 ? 90 : hour >= 14 && hour <= 16 ? 70 : 50;
        slots.push({ start: new Date(current), end: slotEnd, score });
      }

      current = new Date(Math.max(current.getTime(), new Date(event.end).getTime()));
    }

    // Check remaining time
    const remainingGap = (dayEnd.getTime() - current.getTime()) / (1000 * 60);
    if (remainingGap >= duration) {
      const slotEnd = new Date(current.getTime() + duration * 60 * 1000);
      slots.push({ start: new Date(current), end: slotEnd, score: 40 });
    }

    return slots.sort((a, b) => b.score - a.score);
  },

  async detectConflicts(userId: string, start: Date, end: Date, excludeEventId?: string) {
    const query: Record<string, unknown> = {
      userId,
      $or: [
        { start: { $lt: end }, end: { $gt: start } },
      ],
    };

    if (excludeEventId) {
      query._id = { $ne: new mongoose.Types.ObjectId(excludeEventId) };
    }

    return CalendarEvent.find(query).lean();
  },

  async getMeetingLoad(userId: string, startDate: Date, endDate: Date) {
    const meetings = await CalendarEvent.find({
      userId,
      type: 'meeting',
      start: { $gte: startDate },
      end: { $lte: endDate },
    }).lean();

    const totalHours = meetings.reduce((acc, m) => {
      return acc + (new Date(m.end).getTime() - new Date(m.start).getTime()) / (1000 * 60 * 60);
    }, 0);

    return {
      count: meetings.length,
      totalHours: Math.round(totalHours * 10) / 10,
      meetings,
    };
  },
};
