import mongoose, { Document, Schema } from 'mongoose';

export interface IHabit extends Document {
  title: string;
  description?: string;
  category: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'custom';
  targetDays?: number[];
  targetCount?: number;
  estimatedDuration: number;
  preferredTime?: string;
  preferredTimeSlot?: string;
  streak: number;
  longestStreak: number;
  completionRate: number;
  consistencyScore: number;
  aiOptimizationEnabled: boolean;
  reminders: {
    enabled: boolean;
    time: string;
    days?: number[];
  };
  completions: Array<{
    date: Date;
    completed: boolean;
    duration?: number;
    notes?: string;
  }>;
  color?: string;
  icon?: string;
  userId: mongoose.Types.ObjectId;
  isActive: boolean;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const HabitSchema = new Schema<IHabit>(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, maxlength: 1000 },
    category: {
      type: String,
      enum: ['health', 'work', 'learning', 'personal', 'fitness', 'mindfulness', 'other'],
      default: 'personal',
    },
    frequency: {
      type: String,
      enum: ['daily', 'weekly', 'monthly', 'custom'],
      required: true,
    },
    targetDays: [{ type: Number, min: 0, max: 6 }],
    targetCount: { type: Number, default: 1 },
    estimatedDuration: { type: Number, default: 30 },
    preferredTime: { type: String, enum: ['morning', 'afternoon', 'evening', 'anytime'] },
    preferredTimeSlot: { type: String },
    streak: { type: Number, default: 0 },
    longestStreak: { type: Number, default: 0 },
    completionRate: { type: Number, default: 0, min: 0, max: 100 },
    consistencyScore: { type: Number, default: 0, min: 0, max: 100 },
    aiOptimizationEnabled: { type: Boolean, default: true },
    reminders: {
      enabled: { type: Boolean, default: true },
      time: { type: String, default: '08:00' },
      days: [{ type: Number }],
    },
    completions: [
      {
        date: { type: Date, required: true },
        completed: { type: Boolean, required: true },
        duration: { type: Number },
        notes: { type: String },
      },
    ],
    color: { type: String, default: '#6366f1' },
    icon: { type: String, default: '⭐' },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

HabitSchema.index({ userId: 1, isActive: 1 });
HabitSchema.index({ userId: 1, frequency: 1 });

HabitSchema.pre(/^find/, function (this: mongoose.Query<unknown, IHabit>, next) {
  this.where({ isDeleted: false });
  next();
});

export const Habit = mongoose.model<IHabit>('Habit', HabitSchema);
