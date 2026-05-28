import mongoose, { Document, Schema } from 'mongoose';

export interface ITask extends Document {
  title: string;
  description?: string;
  status: 'pending' | 'scheduled' | 'in_progress' | 'completed' | 'deferred' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  estimatedDuration: number;
  actualDuration?: number;
  scheduledStart?: Date;
  scheduledEnd?: Date;
  dueDate?: Date;
  tags: string[];
  category?: string;
  dependencies: mongoose.Types.ObjectId[];
  recurrence?: {
    enabled: boolean;
    frequency: string;
    interval: number;
    endDate?: Date;
    daysOfWeek?: number[];
  };
  aiScore?: number;
  flexibilityScore: number;
  energyRequired: 'low' | 'medium' | 'high';
  userId: mongoose.Types.ObjectId;
  workspaceId?: mongoose.Types.ObjectId;
  comments: Array<{
    userId: mongoose.Types.ObjectId;
    userName: string;
    content: string;
    createdAt: Date;
  }>;
  attachments: string[];
  subtasks: Array<{
    title: string;
    completed: boolean;
    createdAt: Date;
  }>;
  completedAt?: Date;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const TaskSchema = new Schema<ITask>(
  {
    title: { type: String, required: true, trim: true, maxlength: 500 },
    description: { type: String, maxlength: 5000 },
    status: {
      type: String,
      enum: ['pending', 'scheduled', 'in_progress', 'completed', 'deferred', 'cancelled'],
      default: 'pending',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
    },
    estimatedDuration: { type: Number, default: 30, min: 5 },
    actualDuration: { type: Number },
    scheduledStart: { type: Date },
    scheduledEnd: { type: Date },
    dueDate: { type: Date },
    tags: [{ type: String, trim: true }],
    category: { type: String, trim: true },
    dependencies: [{ type: Schema.Types.ObjectId, ref: 'Task' }],
    recurrence: {
      enabled: { type: Boolean, default: false },
      frequency: { type: String, enum: ['daily', 'weekly', 'monthly'] },
      interval: { type: Number, default: 1 },
      endDate: { type: Date },
      daysOfWeek: [{ type: Number }],
    },
    aiScore: { type: Number, min: 0, max: 100 },
    flexibilityScore: { type: Number, default: 50, min: 0, max: 100 },
    energyRequired: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    workspaceId: { type: Schema.Types.ObjectId, ref: 'Workspace' },
    comments: [
      {
        userId: { type: Schema.Types.ObjectId, ref: 'User' },
        userName: String,
        content: String,
        createdAt: { type: Date, default: Date.now },
      },
    ],
    attachments: [{ type: String }],
    subtasks: [
      {
        title: { type: String, required: true },
        completed: { type: Boolean, default: false },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    completedAt: { type: Date },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Indexes
TaskSchema.index({ userId: 1, status: 1 });
TaskSchema.index({ userId: 1, dueDate: 1 });
TaskSchema.index({ userId: 1, scheduledStart: 1 });
TaskSchema.index({ workspaceId: 1 });
TaskSchema.index({ userId: 1, isDeleted: 1 });
TaskSchema.index({ tags: 1 });

// Soft delete filter
TaskSchema.pre(/^find/, function (this: mongoose.Query<unknown, ITask>, next) {
  this.where({ isDeleted: false });
  next();
});

export const Task = mongoose.model<ITask>('Task', TaskSchema);
