import mongoose, { Document, Schema } from 'mongoose';

export interface ICalendar extends Document {
  name: string;
  description?: string;
  color: string;
  provider: 'flowtime' | 'google' | 'microsoft';
  externalId?: string;
  isDefault: boolean;
  isPrimary: boolean;
  syncEnabled: boolean;
  userId: mongoose.Types.ObjectId;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CalendarSchema = new Schema<ICalendar>(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String },
    color: { type: String, default: '#6366f1' },
    provider: {
      type: String,
      enum: ['flowtime', 'google', 'microsoft'],
      default: 'flowtime',
    },
    externalId: { type: String },
    isDefault: { type: Boolean, default: false },
    isPrimary: { type: Boolean, default: false },
    syncEnabled: { type: Boolean, default: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

CalendarSchema.index({ userId: 1 });
CalendarSchema.index({ userId: 1, isDefault: 1 });

export const Calendar = mongoose.model<ICalendar>('Calendar', CalendarSchema);
