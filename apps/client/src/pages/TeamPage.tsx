import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Users, Crown, Shield, Eye, UserMinus, Mail, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import api from '@/lib/api';
import { useToast } from '@/hooks/useToast';
import { useAuthStore } from '@/stores/authStore';

interface WorkspaceMember {
  userId: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'owner' | 'admin' | 'member' | 'viewer';
  joinedAt: string;
}

interface Workspace {
  _id: string;
  name: string;
  description?: string;
  members: WorkspaceMember[];
  ownerId: string;
  plan: string;
}

const roleIcons = {
  owner: Crown,
  admin: Shield,
  member: Users,
  viewer: Eye,
};

const roleColors: Record<string, string> = {
  owner: 'text-yellow-500 bg-yellow-50 dark:bg-yellow-950',
  admin: 'text-blue-500 bg-blue-50 dark:bg-blue-950',
  member: 'text-green-500 bg-green-50 dark:bg-green-950',
  viewer: 'text-gray-500 bg-gray-100 dark:bg-gray-800',
};

export function TeamPage() {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [activeWorkspace, setActiveWorkspace] = useState<Workspace | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const { user } = useAuthStore();
  const { toast } = useToast();

  const fetchWorkspaces = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/workspaces');
      setWorkspaces(res.data.data);
      if (res.data.data.length > 0 && !activeWorkspace) {
        setActiveWorkspace(res.data.data[0]);
      }
    } catch {
      toast({ title: 'Failed to load workspaces', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchWorkspaces(); }, []);

  const handleRemoveMember = async (workspaceId: string, memberId: string) => {
    try {
      const res = await api.delete(`/workspaces/${workspaceId}/members/${memberId}`);
      setActiveWorkspace(res.data.data);
      toast({ title: 'Member removed' });
    } catch {
      toast({ title: 'Failed to remove member', variant: 'destructive' });
    }
  };

  const isOwner = activeWorkspace?.ownerId === user?._id;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Team Workspaces</h2>
          <p className="text-sm text-muted-foreground">Collaborate with your team</p>
        </div>
        <Button size="sm" onClick={() => setShowCreateModal(true)}>
          <Plus className="w-4 h-4 mr-2" /> New Workspace
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 bg-muted rounded-xl animate-pulse" />
          ))}
        </div>
      ) : workspaces.length === 0 ? (
        <div className="text-center py-20">
          <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No workspaces yet</h3>
          <p className="text-muted-foreground mb-6">Create a workspace to collaborate with your team.</p>
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="w-4 h-4 mr-2" /> Create Workspace
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Workspace list */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-1">Workspaces</p>
            {workspaces.map((ws) => (
              <button
                key={ws._id}
                onClick={() => setActiveWorkspace(ws)}
                className={`w-full text-left p-3 rounded-lg transition-colors ${
                  activeWorkspace?._id === ws._id
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-muted'
                }`}
              >
                <p className="font-medium text-sm truncate">{ws.name}</p>
                <p className={`text-xs mt-0.5 ${activeWorkspace?._id === ws._id ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                  {ws.members.length} member{ws.members.length !== 1 ? 's' : ''}
                </p>
              </button>
            ))}
          </div>

          {/* Workspace detail */}
          {activeWorkspace && (
            <div className="lg:col-span-3 space-y-4">
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base">{activeWorkspace.name}</CardTitle>
                      {activeWorkspace.description && (
                        <p className="text-sm text-muted-foreground mt-0.5">{activeWorkspace.description}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="capitalize">{activeWorkspace.plan}</Badge>
                      {isOwner && (
                        <Button size="sm" variant="outline" onClick={() => setShowInviteModal(true)}>
                          <Mail className="w-4 h-4 mr-2" /> Invite
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {activeWorkspace.members.map((member) => {
                      const RoleIcon = roleIcons[member.role] || Users;
                      return (
                        <div key={member.userId} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                          <Avatar className="w-9 h-9">
                            <AvatarImage src={member.avatar} />
                            <AvatarFallback className="text-xs">
                              {member.name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-medium truncate">{member.name}</p>
                              {member.userId === user?._id && (
                                <Badge variant="secondary" className="text-xs py-0">You</Badge>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground truncate">{member.email}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={`text-xs capitalize ${roleColors[member.role]}`}>
                              <RoleIcon className="w-3 h-3 mr-1" />
                              {member.role}
                            </Badge>
                            {isOwner && member.userId !== user?._id && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="w-7 h-7 text-muted-foreground hover:text-destructive"
                                onClick={() => handleRemoveMember(activeWorkspace._id, member.userId)}
                              >
                                <UserMinus className="w-3.5 h-3.5" />
                              </Button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'Members', value: activeWorkspace.members.length, icon: Users },
                  { label: 'Admins', value: activeWorkspace.members.filter(m => m.role === 'admin' || m.role === 'owner').length, icon: Shield },
                  { label: 'Plan', value: activeWorkspace.plan, icon: Crown },
                ].map((stat) => (
                  <Card key={stat.label}>
                    <CardContent className="p-4 text-center">
                      <stat.icon className="w-5 h-5 text-muted-foreground mx-auto mb-1" />
                      <p className="text-lg font-bold capitalize">{stat.value}</p>
                      <p className="text-xs text-muted-foreground">{stat.label}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Create Workspace Modal */}
      {showCreateModal && (
        <CreateWorkspaceModal
          onClose={() => setShowCreateModal(false)}
          onCreated={(ws) => {
            setWorkspaces(prev => [ws, ...prev]);
            setActiveWorkspace(ws);
            setShowCreateModal(false);
          }}
        />
      )}

      {/* Invite Modal */}
      {showInviteModal && activeWorkspace && (
        <InviteMemberModal
          workspaceId={activeWorkspace._id}
          onClose={() => setShowInviteModal(false)}
          onInvited={(ws) => {
            setActiveWorkspace(ws);
            setWorkspaces(prev => prev.map(w => w._id === ws._id ? ws : w));
            setShowInviteModal(false);
          }}
        />
      )}
    </motion.div>
  );
}

function CreateWorkspaceModal({ onClose, onCreated }: {
  onClose: () => void;
  onCreated: (ws: Workspace) => void;
}) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await api.post('/workspaces', { name, description });
      onCreated(res.data.data);
      toast({ title: 'Workspace created!' });
    } catch {
      toast({ title: 'Failed to create workspace', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="relative bg-card rounded-xl border border-border shadow-2xl w-full max-w-md p-6">
        <h3 className="text-lg font-semibold mb-4">Create Workspace</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium">Name *</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="My Team" required className="mt-1" />
          </div>
          <div>
            <label className="text-sm font-medium">Description</label>
            <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What's this workspace for?" className="mt-1" />
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
            <Button type="submit" disabled={isLoading} className="flex-1">
              {isLoading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Creating...</> : 'Create'}
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

function InviteMemberModal({ workspaceId, onClose, onInvited }: {
  workspaceId: string;
  onClose: () => void;
  onInvited: (ws: Workspace) => void;
}) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('member');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await api.post(`/workspaces/${workspaceId}/invite`, { email, role });
      onInvited(res.data.data);
      toast({ title: `${email} has been invited!` });
    } catch (error: unknown) {
      const msg = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to invite member';
      toast({ title: msg, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="relative bg-card rounded-xl border border-border shadow-2xl w-full max-w-md p-6">
        <h3 className="text-lg font-semibold mb-4">Invite Member</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium">Email *</label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="colleague@company.com" required className="mt-1" />
          </div>
          <div>
            <label className="text-sm font-medium">Role</label>
            <select value={role} onChange={(e) => setRole(e.target.value)}
              className="w-full mt-1 px-3 py-2 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring">
              <option value="viewer">Viewer — can view only</option>
              <option value="member">Member — can create & edit</option>
              <option value="admin">Admin — full access</option>
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
            <Button type="submit" disabled={isLoading} className="flex-1">
              {isLoading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Inviting...</> : 'Send Invite'}
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
