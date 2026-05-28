export type WorkspaceRole = 'owner' | 'admin' | 'member' | 'viewer';

export interface WorkspaceMember {
  userId: string;
  name: string;
  email: string;
  avatar?: string;
  role: WorkspaceRole;
  joinedAt: Date;
}

export interface WorkspacePermissions {
  canInviteMembers: WorkspaceRole[];
  canManageTasks: WorkspaceRole[];
  canViewAnalytics: WorkspaceRole[];
  canManageSettings: WorkspaceRole[];
}

export interface Workspace {
  _id: string;
  name: string;
  description?: string;
  avatar?: string;
  members: WorkspaceMember[];
  permissions: WorkspacePermissions;
  ownerId: string;
  plan: 'free' | 'pro' | 'team' | 'enterprise';
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateWorkspaceDto {
  name: string;
  description?: string;
}

export interface InviteMemberDto {
  email: string;
  role: WorkspaceRole;
}
