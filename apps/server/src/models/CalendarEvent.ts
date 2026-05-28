import mongoose, { Document, Schema } from 'mongoose';

export interface ICalendarEvent extends Document {
  title: string;
  description?: string;
  start: Date;
  end: Date;
  allDay?: boolean;
  type: 'task' | 'meeting' | 'habit' | 'break' | 'focus' | 'personal' | 'blocked';
  source: 'flowtime' | 'google' | 'microsoft' | 'manual';
  color?: string;
  location?: string;
  meetingLink?: string;
  attendees: Array<{
    email: string;
    name?: string;
    status: string;
  }>;
  recurrence?: {
    rule: string;
    exceptions?: Date[];
  };
  notes?: string;
  calendarId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  taskId?: mongoose.Types.ObjectId;
  habitId?: mongoose.Types.ObjectId;
  externalId?: string;
  bufferBefore?: number;
  bufferAfter?: number;
  isFlexible?: boolean;
  isFocusTime?: boolean;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CalendarEventSchema = new Schema<ICalendarEvent>(
  {
    title: { type: String, required: true, trim: true, maxlength: 500 },
    description: { type: String, maxlength: 5000 },
    start: { type: Date, required: true },
    end: { type: Date, required: true },
    allDay: { type: Boolean, default: false },
    type: {
      type: String,
      enum: ['task', 'meeting', 'habit', 'break', 'focus', 'personal', 'blocked'],
      default: 'personal',
    },
    source: {
      type: String,
      enum: ['flowtime', 'google', 'microsoft', 'manual'],
      default: 'flowtime',
    },
    color: { type: String },
    location: { type: String },
    meetingLink: { type: String },
    attendees: [
      {
        email: { type: String, required: true },
        name: String,
        status: { type: String, enum: ['accepted', 'declined', 'tentative', 'pending'], default: 'pending' },
      },
    ],
    recurrence: {
      rule: String,
      exceptions: [Date],
    },
    notes: { type: String },
    calendarId: { type: Schema.Types.ObjectId, ref: 'Calendar', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    taskId: { type: Schema.Types.ObjectId, ref: 'Task' },
    habitId: { type: Schema.Types.ObjectId, ref: 'Habit' },
    externalId: { type: String },
    bufferBefore: { type: Number, default: 0 },
    bufferAfter: { type: Number, default: 0 },
    isFlexible: { type: Boolean, default: false },
    isFocusTime: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

CalendarEventSchema.index({ userId: 1, start: 1, end: 1 });
CalendarEventSchema.index({ userId: 1, type: 1 });
CalendarEventSchema.index({ calendarId: 1 });
CalendarEventSchema.index({ externalId: 1 }, { sparse: true });

CalendarEventSchema.pre(/^find/, function (this: mongoose.Query<unknown, ICalendarEvent>, next) {
  this.where({ isDeleted: false });
  next();
});

export const CalendarEvent = mongoose.model<ICalendarEvent>('CalendarEvent', CalendarEventSchema);
