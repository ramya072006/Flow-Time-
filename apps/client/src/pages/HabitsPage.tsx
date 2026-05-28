import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Flame, CheckCircle2, Circle, TrendingUp, Target } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import api from '@/lib/api';
import { useToast } from '@/hooks/useToast';

interface Habit {
  _id: string;
  title: string;
  description?: string;
  category: string;
  frequency: string;
  estimatedDuration: number;
  streak: number;
  longestStreak: number;
  completionRate: number;
  color: string;
  icon: string;
  isActive: boolean;
  completions: Array<{ date: string; completed: boolean }>;
}

export function HabitsPage() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [todayHabits, setTodayHabits] = useState<Habit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { toast } = useToast();

  const fetchHabits = async () => {
    setIsLoading(true);
    try {
      const [habitsRes, todayRes] = await Promise.all([
        api.get('/habits'),
        api.get('/habits/today'),
      ]);
      setHabits(habitsRes.data.data);
      setTodayHabits(todayRes.data.data);
    } catch {
      toast({ title: 'Failed to load habits', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHabits();
  }, []);

  const handleLogCompletion = async (habitId: string, completed: boolean) => {
    try {
      await api.post(`/habits/${habitId}/log`, { completed });
      toast({ title: completed ? 'Habit completed! 🔥' : 'Habit marked incomplete' });
      fetchHabits();
    } catch {
      toast({ title: 'Failed to log habit', variant: 'destructive' });
    }
  };

  const isCompletedToday = (habit: Habit) => {
    const today = new Date().toDateString();
    return habit.completions.some(
      (c) => new Date(c.date).toDateString() === today && c.completed
    );
  };

  const totalStreak = habits.reduce((acc, h) => acc + h.streak, 0);
  const avgCompletion = habits.length > 0
    ? Math.round(habits.reduce((acc, h) => acc + h.completionRate, 0) / habits.length)
    : 0;
  const todayCompleted = todayHabits.filter((h) => isCompletedToday(h)).length;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Habits</h2>
          <p className="text-sm text-muted-foreground">Build consistency, one day at a time</p>
        </div>
        <Button size="sm" onClick={() => setShowCreateModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          New Habit
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Flame className="w-6 h-6 text-orange-500 mx-auto mb-2" />
            <p className="text-2xl font-bold">{totalStreak}</p>
            <p className="text-xs text-muted-foreground">Total Streak Days</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <TrendingUp className="w-6 h-6 text-green-500 mx-auto mb-2" />
            <p className="text-2xl font-bold">{avgCompletion}%</p>
            <p className="text-xs text-muted-foreground">Avg Completion Rate</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Target className="w-6 h-6 text-blue-500 mx-auto mb-2" />
            <p className="text-2xl font-bold">{habits.length}</p>
            <p className="text-xs text-muted-foreground">Active Habits</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <CheckCircle2 className="w-6 h-6 text-purple-500 mx-auto mb-2" />
            <p className="text-2xl font-bold">{todayCompleted}/{todayHabits.length}</p>
            <p className="text-xs text-muted-foreground">Done Today</p>
          </CardContent>
        </Card>
      </div>

      {/* Today's Habits */}
      {todayHabits.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Today's Habits</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {todayHabits.map((habit) => {
              const completed = isCompletedToday(habit);
              return (
                <div key={habit._id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                  <button onClick={() => handleLogCompletion(habit._id, !completed)}>
                    {completed ? (
                      <CheckCircle2 className="w-6 h-6 text-green-500" />
                    ) : (
                      <Circle className="w-6 h-6 text-muted-foreground hover:text-primary transition-colors" />
                    )}
                  </button>
                  <span className="text-xl">{habit.icon}</span>
                  <div className="flex-1">
                    <p className={`text-sm font-medium ${completed ? 'line-through text-muted-foreground' : ''}`}>
                      {habit.title}
                    </p>
                    <p className="text-xs text-muted-foreground">{habit.estimatedDuration} min</p>
                  </div>
                  {habit.streak > 0 && (
                    <div className="flex items-center gap-1 text-orange-500">
                      <Flame className="w-4 h-4" />
                      <span className="text-sm font-medium">{habit.streak}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* All Habits */}
      <div>
        <h3 className="text-base font-semibold mb-3">All Habits</h3>
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-40 bg-muted rounded-xl animate-pulse" />
            ))}
          </div>
        ) : habits.length === 0 ? (
          <div className="text-center py-16">
            <Flame className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No habits yet. Start building your routine!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {habits.map((habit) => (
              <HabitCard key={habit._id} habit={habit} onLog={handleLogCompletion} isCompletedToday={isCompletedToday(habit)} />
            ))}
          </div>
        )}
      </div>

      {showCreateModal && (
        <CreateHabitModal
          onClose={() => setShowCreateModal(false)}
          onCreated={(habit) => {
            setHabits((prev) => [habit, ...prev]);
            setShowCreateModal(false);
          }}
        />
      )}
    </motion.div>
  );
}

function HabitCard({ habit, onLog, isCompletedToday }: {
  habit: Habit;
  onLog: (id: string, completed: boolean) => void;
  isCompletedToday: boolean;
}) {
  return (
    <Card className="overflow-hidden">
      <div className="h-1.5" style={{ backgroundColor: habit.color }} />
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{habit.icon}</span>
            <div>
              <p className="font-medium text-sm">{habit.title}</p>
              <Badge variant="outline" className="text-xs mt-0.5">{habit.category}</Badge>
            </div>
          </div>
          <button onClick={() => onLog(habit._id, !isCompletedToday)}>
            {isCompletedToday ? (
              <CheckCircle2 className="w-6 h-6 text-green-500" />
            ) : (
              <Circle className="w-6 h-6 text-muted-foreground hover:text-primary transition-colors" />
            )}
          </button>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Completion rate</span>
            <span>{habit.completionRate}%</span>
          </div>
          <Progress value={habit.completionRate} className="h-1.5" />
        </div>

        <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-1 text-orange-500">
            <Flame className="w-3.5 h-3.5" />
            <span className="font-medium">{habit.streak} day streak</span>
          </div>
          <span>Best: {habit.longestStreak} days</span>
          <span className="capitalize">{habit.frequency}</span>
        </div>
      </CardContent>
    </Card>
  );
}

function CreateHabitModal({ onClose, onCreated }: {
  onClose: () => void;
  onCreated: (habit: Habit) => void;
}) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('personal');
  const [frequency, setFrequency] = useState('daily');
  const [estimatedDuration, setEstimatedDuration] = useState(30);
  const [preferredTime, setPreferredTime] = useState('morning');
  const [icon, setIcon] = useState('⭐');
  const [color, setColor] = useState('#6366f1');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await api.post('/habits', {
        title, category, frequency, estimatedDuration, preferredTime, icon, color,
      });
      onCreated(response.data.data);
      toast({ title: 'Habit created!' });
    } catch {
      toast({ title: 'Failed to create habit', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const icons = ['⭐', '💪', '📚', '🧘', '🏃', '💧', '🎯', '✍️', '🎵', '🌱'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative bg-card rounded-xl border border-border shadow-2xl w-full max-w-md p-6"
      >
        <h3 className="text-lg font-semibold mb-4">Create Habit</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium">Title *</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Habit name" required className="w-full mt-1 px-3 py-2 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
          <div>
            <label className="text-sm font-medium">Icon</label>
            <div className="flex gap-2 mt-1 flex-wrap">
              {icons.map((i) => (
                <button key={i} type="button" onClick={() => setIcon(i)} className={`text-xl p-1.5 rounded-lg border-2 transition-colors ${icon === i ? 'border-primary' : 'border-transparent hover:border-muted'}`}>
                  {i}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium">Category</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full mt-1 px-3 py-2 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                {['health', 'work', 'learning', 'personal', 'fitness', 'mindfulness', 'other'].map((c) => (
                  <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Frequency</label>
              <select value={frequency} onChange={(e) => setFrequency(e.target.value)} className="w-full mt-1 px-3 py-2 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium">Duration (min)</label>
              <input type="number" value={estimatedDuration} onChange={(e) => setEstimatedDuration(parseInt(e.target.value))} min={5} className="w-full mt-1 px-3 py-2 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
            <div>
              <label className="text-sm font-medium">Preferred Time</label>
              <select value={preferredTime} onChange={(e) => setPreferredTime(e.target.value)} className="w-full mt-1 px-3 py-2 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                <option value="morning">Morning</option>
                <option value="afternoon">Afternoon</option>
                <option value="evening">Evening</option>
                <option value="anytime">Anytime</option>
              </select>
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
            <Button type="submit" disabled={isLoading} className="flex-1">
              {isLoading ? 'Creating...' : 'Create Habit'}
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
