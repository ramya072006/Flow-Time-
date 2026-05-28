import mongoose, { Document, Schema } from 'mongoose';

export interface IWorkspace extends Document {
  name: string;
  description?: string;
  avatar?: string;
  members: Array<{
    userId: mongoose.Types.ObjectId;
    name: string;
    email: string;
    avatar?: string;
    role: 'owner' | 'admin' | 'member' | 'viewer';
    joinedAt: Date;
  }>;
  permissions: {
    canInviteMembers: string[];
    canManageTasks: string[];
    canViewAnalytics: string[];
    canManageSettings: string[];
  };
  ownerId: mongoose.Types.ObjectId;
  plan: 'free' | 'pro' | 'team' | 'enterprise';
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const WorkspaceSchema = new Schema<IWorkspace>(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    description: { type: String, maxlength: 500 },
    avatar: { type: String },
    members: [
      {
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        name: { type: String, required: true },
        email: { type: String, required: true },
        avatar: String,
        role: {
          type: String,
          enum: ['owner', 'admin', 'member', 'viewer'],
          default: 'member',
        },
        joinedAt: { type: Date, default: Date.now },
      },
    ],
    permissions: {
      canInviteMembers: { type: [String], default: ['owner', 'admin'] },
      canManageTasks: { type: [String], default: ['owner', 'admin', 'member'] },
      canViewAnalytics: { type: [String], default: ['owner', 'admin', 'member'] },
      canManageSettings: { type: [String], default: ['owner', 'admin'] },
    },
    ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    plan: { type: String, enum: ['free', 'pro', 'team', 'enterprise'], default: 'free' },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

WorkspaceSchema.index({ ownerId: 1 });
WorkspaceSchema.index({ 'members.userId': 1 });

export const Workspace = mongoose.model<IWorkspace>('Workspace', WorkspaceSchema);
