export type NotificationType = 
  | 'task_due'
  | 'task_scheduled'
  | 'habit_reminder'
  | 'meeting_reminder'
  | 'ai_suggestion'
  | 'deadline_alert'
  | 'team_mention'
  | 'workspace_invite'
  | 'system';

export interface Notification {
  _id: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  actionUrl?: string;
  metadata?: Record<string, unknown>;
  userId: string;
  createdAt: Date;
  expiresAt?: Date;
}

export interface CreateNotificationDto {
  type: NotificationType;
  title: string;
  message: string;
  userId: string;
  actionUrl?: string;
  metadata?: Record<string, unknown>;
}
