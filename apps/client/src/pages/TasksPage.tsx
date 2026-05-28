import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Plus, Search, Filter, CheckCircle2, Circle, Clock,
  AlertCircle, ChevronDown, Trash2, Edit, Zap, MoreHorizontal
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import api from '@/lib/api';
import { formatDuration, getPriorityColor, getStatusColor, getRelativeTime } from '@/lib/utils';
import { useToast } from '@/hooks/useToast';

interface Task {
  _id: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  estimatedDuration: number;
  dueDate?: string;
  tags: string[];
  category?: string;
  energyRequired: string;
  subtasks: Array<{ _id: string; title: string; completed: boolean }>;
  scheduledStart?: string;
}

type ViewMode = 'list' | 'kanban';

const statusColumns = [
  { id: 'pending', label: 'Pending', color: 'bg-gray-100 dark:bg-gray-800' },
  { id: 'scheduled', label: 'Scheduled', color: 'bg-blue-50 dark:bg-blue-950' },
  { id: 'in_progress', label: 'In Progress', color: 'bg-purple-50 dark:bg-purple-950' },
  { id: 'completed', label: 'Completed', color: 'bg-green-50 dark:bg-green-950' },
];

export function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [search, setSearch] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const { toast } = useToast();

  const fetchTasks = async () => {
    setIsLoading(true);
    try {
      const params: Record<string, string> = {};
      if (search) params.search = search;
      if (filterPriority) params.priority = filterPriority;
      if (filterStatus) params.status = filterStatus;

      const response = await api.get('/tasks', { params });
      setTasks(response.data.data);
    } catch {
      toast({ title: 'Failed to load tasks', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [search, filterPriority, filterStatus]);

  const handleComplete = async (taskId: string) => {
    try {
      await api.post(`/tasks/${taskId}/complete`);
      setTasks((prev) =>
        prev.map((t) => (t._id === taskId ? { ...t, status: 'completed' } : t))
      );
      toast({ title: 'Task completed! 🎉', variant: 'default' });
    } catch {
      toast({ title: 'Failed to complete task', variant: 'destructive' });
    }
  };

  const handleDelete = async (taskId: string) => {
    try {
      await api.delete(`/tasks/${taskId}`);
      setTasks((prev) => prev.filter((t) => t._id !== taskId));
      toast({ title: 'Task deleted' });
    } catch {
      toast({ title: 'Failed to delete task', variant: 'destructive' });
    }
  };

  const handleAISchedule = async () => {
    try {
      toast({ title: 'AI is scheduling your tasks...' });
      const response = await api.post('/ai/schedule');
      const { scheduledTasks } = response.data.data;
      toast({ title: `Scheduled ${scheduledTasks.length} tasks successfully!`, variant: 'default' });
      fetchTasks();
    } catch {
      toast({ title: 'AI scheduling failed', variant: 'destructive' });
    }
  };

  const completedCount = tasks.filter((t) => t.status === 'completed').length;
  const completionRate = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Tasks</h2>
          <p className="text-sm text-muted-foreground">
            {completedCount}/{tasks.length} completed · {completionRate}% done
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleAISchedule}>
            <Zap className="w-4 h-4 mr-2 text-primary" />
            AI Schedule
          </Button>
          <Button size="sm" onClick={() => setShowCreateModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            New Task
          </Button>
        </div>
      </div>

      {/* Progress */}
      <div className="space-y-1">
        <Progress value={completionRate} className="h-2" />
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tasks..."
            className="pl-9"
          />
        </div>
        <select
          value={filterPriority}
          onChange={(e) => setFilterPriority(e.target.value)}
          className="px-3 py-2 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="">All priorities</option>
          <option value="urgent">Urgent</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-3 py-2 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="">All statuses</option>
          <option value="pending">Pending</option>
          <option value="scheduled">Scheduled</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
        <div className="flex rounded-md border border-input overflow-hidden">
          <button
            onClick={() => setViewMode('list')}
            className={`px-3 py-2 text-sm ${viewMode === 'list' ? 'bg-primary text-primary-foreground' : 'bg-background hover:bg-muted'}`}
          >
            List
          </button>
          <button
            onClick={() => setViewMode('kanban')}
            className={`px-3 py-2 text-sm ${viewMode === 'kanban' ? 'bg-primary text-primary-foreground' : 'bg-background hover:bg-muted'}`}
          >
            Kanban
          </button>
        </div>
      </div>

      {/* Task List */}
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-muted rounded-lg animate-pulse" />
          ))}
        </div>
      ) : viewMode === 'list' ? (
        <div className="space-y-2">
          {tasks.length === 0 ? (
            <div className="text-center py-16">
              <CheckCircle2 className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No tasks found. Create your first task!</p>
            </div>
          ) : (
            tasks.map((task) => (
              <TaskCard
                key={task._id}
                task={task}
                onComplete={handleComplete}
                onDelete={handleDelete}
                onEdit={setEditingTask}
              />
            ))
          )}
        </div>
      ) : (
        <KanbanView tasks={tasks} onComplete={handleComplete} onDelete={handleDelete} onEdit={setEditingTask} />
      )}

      {/* Create/Edit Modal */}
      {(showCreateModal || editingTask) && (
        <TaskModal
          task={editingTask}
          onClose={() => { setShowCreateModal(false); setEditingTask(null); }}
          onSaved={(task) => {
            if (editingTask) {
              setTasks((prev) => prev.map((t) => (t._id === task._id ? task : t)));
            } else {
              setTasks((prev) => [task, ...prev]);
            }
            setShowCreateModal(false);
            setEditingTask(null);
          }}
        />
      )}
    </motion.div>
  );
}

function TaskCard({ task, onComplete, onDelete, onEdit }: {
  task: Task;
  onComplete: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (task: Task) => void;
}) {
  const isCompleted = task.status === 'completed';
  const completedSubtasks = task.subtasks.filter((s) => s.completed).length;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
    >
      <Card className={`transition-all hover:shadow-md ${isCompleted ? 'opacity-60' : ''}`}>
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <button
              onClick={() => !isCompleted && onComplete(task._id)}
              className="mt-0.5 flex-shrink-0"
            >
              {isCompleted ? (
                <CheckCircle2 className="w-5 h-5 text-green-500" />
              ) : (
                <Circle className="w-5 h-5 text-muted-foreground hover:text-primary transition-colors" />
              )}
            </button>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <p className={`font-medium text-sm ${isCompleted ? 'line-through text-muted-foreground' : ''}`}>
                  {task.title}
                </p>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <Badge className={`text-xs ${getPriorityColor(task.priority)}`}>
                    {task.priority}
                  </Badge>
                  <button onClick={() => onEdit(task)} className="p-1 hover:bg-muted rounded">
                    <Edit className="w-3.5 h-3.5 text-muted-foreground" />
                  </button>
                  <button onClick={() => onDelete(task._id)} className="p-1 hover:bg-muted rounded">
                    <Trash2 className="w-3.5 h-3.5 text-muted-foreground hover:text-destructive" />
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  {formatDuration(task.estimatedDuration)}
                </span>
                {task.dueDate && (
                  <span className={`flex items-center gap-1 text-xs ${
                    new Date(task.dueDate) < new Date() && !isCompleted
                      ? 'text-red-500'
                      : 'text-muted-foreground'
                  }`}>
                    <AlertCircle className="w-3 h-3" />
                    {getRelativeTime(task.dueDate)}
                  </span>
                )}
                {task.scheduledStart && (
                  <span className="text-xs text-blue-500">
                    Scheduled: {new Date(task.scheduledStart).toLocaleDateString()}
                  </span>
                )}
                {task.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs py-0">
                    {tag}
                  </Badge>
                ))}
              </div>

              {task.subtasks.length > 0 && (
                <div className="mt-2">
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                    <span>{completedSubtasks}/{task.subtasks.length} subtasks</span>
                  </div>
                  <Progress
                    value={task.subtasks.length > 0 ? (completedSubtasks / task.subtasks.length) * 100 : 0}
                    className="h-1"
                  />
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function KanbanView({ tasks, onComplete, onDelete, onEdit }: {
  tasks: Task[];
  onComplete: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (task: Task) => void;
}) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {statusColumns.map((col) => {
        const colTasks = tasks.filter((t) => t.status === col.id);
        return (
          <div key={col.id} className={`rounded-xl p-3 ${col.color}`}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold">{col.label}</h3>
              <Badge variant="secondary" className="text-xs">{colTasks.length}</Badge>
            </div>
            <div className="space-y-2">
              {colTasks.map((task) => (
                <div key={task._id} className="bg-card rounded-lg p-3 shadow-sm">
                  <p className="text-sm font-medium line-clamp-2">{task.title}</p>
                  <div className="flex items-center justify-between mt-2">
                    <Badge className={`text-xs ${getPriorityColor(task.priority)}`}>
                      {task.priority}
                    </Badge>
                    <div className="flex gap-1">
                      <button onClick={() => onEdit(task)} className="p-1 hover:bg-muted rounded">
                        <Edit className="w-3 h-3 text-muted-foreground" />
                      </button>
                      {task.status !== 'completed' && (
                        <button onClick={() => onComplete(task._id)} className="p-1 hover:bg-muted rounded">
                          <CheckCircle2 className="w-3 h-3 text-muted-foreground hover:text-green-500" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function TaskModal({ task, onClose, onSaved }: {
  task: Task | null;
  onClose: () => void;
  onSaved: (task: Task) => void;
}) {
  const [title, setTitle] = useState(task?.title || '');
  const [description, setDescription] = useState(task?.description || '');
  const [priority, setPriority] = useState(task?.priority || 'medium');
  const [estimatedDuration, setEstimatedDuration] = useState(task?.estimatedDuration || 30);
  const [dueDate, setDueDate] = useState(task?.dueDate ? task.dueDate.slice(0, 16) : '');
  const [energyRequired, setEnergyRequired] = useState(task?.energyRequired || 'medium');
  const [tags, setTags] = useState(task?.tags.join(', ') || '');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const data = {
        title,
        description,
        priority,
        estimatedDuration,
        dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
        energyRequired,
        tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
      };

      let response;
      if (task) {
        response = await api.patch(`/tasks/${task._id}`, data);
      } else {
        response = await api.post('/tasks', data);
      }

      onSaved(response.data.data);
      toast({ title: task ? 'Task updated' : 'Task created', variant: 'default' });
    } catch {
      toast({ title: 'Failed to save task', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative bg-card rounded-xl border border-border shadow-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto"
      >
        <h3 className="text-lg font-semibold mb-4">{task ? 'Edit Task' : 'Create Task'}</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium">Title *</label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Task title" required className="mt-1" />
          </div>
          <div>
            <label className="text-sm font-medium">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Task description..."
              rows={3}
              className="w-full mt-1 px-3 py-2 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium">Priority</label>
              <select value={priority} onChange={(e) => setPriority(e.target.value)} className="w-full mt-1 px-3 py-2 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Energy Level</label>
              <select value={energyRequired} onChange={(e) => setEnergyRequired(e.target.value)} className="w-full mt-1 px-3 py-2 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium">Duration (minutes)</label>
              <Input type="number" value={estimatedDuration} onChange={(e) => setEstimatedDuration(parseInt(e.target.value))} min={5} className="mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium">Due Date</label>
              <Input type="datetime-local" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="mt-1" />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium">Tags (comma separated)</label>
            <Input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="work, design, urgent" className="mt-1" />
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
            <Button type="submit" disabled={isLoading} className="flex-1">
              {isLoading ? 'Saving...' : task ? 'Update Task' : 'Create Task'}
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
