import mongoose, { Document, Schema } from 'mongoose';

export interface IAIRecommendation extends Document {
  recommendationType: string;
  title: string;
  content: string;
  actionData?: Record<string, unknown>;
  applied: boolean;
  dismissed: boolean;
  score: number;
  userId: mongoose.Types.ObjectId;
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const AIRecommendationSchema = new Schema<IAIRecommendation>(
  {
    recommendationType: {
      type: String,
      enum: [
        'schedule_task', 'reschedule', 'focus_block', 'meeting_optimization',
        'habit_timing', 'workload_balance', 'break_suggestion', 'deadline_warning',
      ],
      required: true,
    },
    title: { type: String, required: true },
    content: { type: String, required: true },
    actionData: { type: Schema.Types.Mixed },
    applied: { type: Boolean, default: false },
    dismissed: { type: Boolean, default: false },
    score: { type: Number, default: 50, min: 0, max: 100 },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    expiresAt: { type: Date },
  },
  { timestamps: true }
);

AIRecommendationSchema.index({ userId: 1, applied: 1, dismissed: 1 });
AIRecommendationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const AIRecommendation = mongoose.model<IAIRecommendation>('AIRecommendation', AIRecommendationSchema);
