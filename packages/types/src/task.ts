export type TaskStatus = 'pending' | 'scheduled' | 'in_progress' | 'completed' | 'deferred' | 'cancelled';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';
export type EnergyLevel = 'low' | 'medium' | 'high';

export interface TaskRecurrence {
  enabled: boolean;
  frequency: 'daily' | 'weekly' | 'monthly';
  interval: number;
  endDate?: Date;
  daysOfWeek?: number[];
}

export interface TaskComment {
  _id: string;
  userId: string;
  userName: string;
  content: string;
  createdAt: Date;
}

export interface Task {
  _id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  estimatedDuration: number; // minutes
  actualDuration?: number;
  scheduledStart?: Date;
  scheduledEnd?: Date;
  dueDate?: Date;
  tags: string[];
  category?: string;
  dependencies: string[];
  recurrence?: TaskRecurrence;
  aiScore?: number;
  flexibilityScore: number; // 0-100
  energyRequired: EnergyLevel;
  userId: string;
  workspaceId?: string;
  comments: TaskComment[];
  attachments: string[];
  subtasks: SubTask[];
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface SubTask {
  _id: string;
  title: string;
  completed: boolean;
  createdAt: Date;
}

export interface CreateTaskDto {
  title: string;
  description?: string;
  priority?: TaskPriority;
  estimatedDuration?: number;
  dueDate?: string;
  tags?: string[];
  category?: string;
  energyRequired?: EnergyLevel;
  flexibilityScore?: number;
  recurrence?: TaskRecurrence;
  workspaceId?: string;
}

export interface UpdateTaskDto extends Partial<CreateTaskDto> {
  status?: TaskStatus;
  scheduledStart?: string;
  scheduledEnd?: string;
  actualDuration?: number;
}
