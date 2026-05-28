import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  CheckSquare, Clock, Flame, TrendingUp, Brain, Calendar,
  ArrowRight, Zap, Target, AlertCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAuthStore } from '@/stores/authStore';
import api from '@/lib/api';
import { Link } from 'react-router-dom';
import { formatDuration, getPriorityColor, getRelativeTime } from '@/lib/utils';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

interface DashboardData {
  tasks: { total: number; completed: number; pending: number; overdue: number };
  focusHours: number;
  meetingHours: number;
  habitCompletionRate: number;
  productivityScore: number;
  taskCompletionRate: number;
}

interface Task {
  _id: string;
  title: string;
  priority: string;
  dueDate?: string;
  status: string;
  estimatedDuration: number;
}

interface Recommendation {
  _id: string;
  title: string;
  content: string;
  recommendationType: string;
  score: number;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export function Dashboard() {
  const { user } = useAuthStore();
  const [analytics, setAnalytics] = useState<DashboardData | null>(null);
  const [upcomingTasks, setUpcomingTasks] = useState<Task[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [trend, setTrend] = useState<Array<{ date: string; tasksCompleted: number; focusHours: number }>>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [analyticsRes, tasksRes, recsRes, trendRes] = await Promise.all([
          api.get('/analytics/dashboard'),
          api.get('/tasks/upcoming?days=3'),
          api.get('/ai/recommendations'),
          api.get('/analytics/productivity-trend?days=7'),
        ]);
        setAnalytics(analyticsRes.data.data);
        setUpcomingTasks(tasksRes.data.data);
        setRecommendations(recsRes.data.data.slice(0, 3));
        setTrend(trendRes.data.data);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-muted rounded animate-pulse w-64" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-muted rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6 max-w-7xl"
    >
      {/* Greeting */}
      <motion.div variants={itemVariants}>
        <h2 className="text-2xl font-bold">
          {greeting()}, {user?.name?.split(' ')[0]} 👋
        </h2>
        <p className="text-muted-foreground mt-1">
          Here's your productivity overview for today.
        </p>
      </motion.div>

      {/* Stats Grid */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<CheckSquare className="w-5 h-5 text-indigo-500" />}
          label="Tasks Completed"
          value={`${analytics?.tasks.completed || 0}/${analytics?.tasks.total || 0}`}
          sub={`${analytics?.taskCompletionRate || 0}% completion rate`}
          color="bg-indigo-50 dark:bg-indigo-950"
        />
        <StatCard
          icon={<Clock className="w-5 h-5 text-emerald-500" />}
          label="Focus Hours"
          value={`${analytics?.focusHours || 0}h`}
          sub="This week"
          color="bg-emerald-50 dark:bg-emerald-950"
        />
        <StatCard
          icon={<Flame className="w-5 h-5 text-orange-500" />}
          label="Habit Completion"
          value={`${analytics?.habitCompletionRate || 0}%`}
          sub="30-day average"
          color="bg-orange-50 dark:bg-orange-950"
        />
        <StatCard
          icon={<TrendingUp className="w-5 h-5 text-purple-500" />}
          label="Productivity Score"
          value={`${analytics?.productivityScore || 0}`}
          sub="Out of 100"
          color="bg-purple-50 dark:bg-purple-950"
        />
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Productivity Trend */}
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center justify-between">
                Productivity Trend
                <Link to="/analytics">
                  <Button variant="ghost" size="sm" className="text-xs">
                    View all <ArrowRight className="w-3 h-3 ml-1" />
                  </Button>
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={trend}>
                  <defs>
                    <linearGradient id="focusGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={(v) => v.slice(5)} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="focusHours"
                    stroke="#6366f1"
                    fill="url(#focusGrad)"
                    strokeWidth={2}
                    name="Focus Hours"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* AI Recommendations */}
        <motion.div variants={itemVariants}>
          <Card className="h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Brain className="w-4 h-4 text-primary" />
                AI Insights
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {recommendations.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No recommendations yet. Keep using FlowTime!
                </p>
              ) : (
                recommendations.map((rec) => (
                  <div key={rec._id} className="p-3 rounded-lg bg-muted/50 space-y-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">{rec.title}</p>
                      <Badge variant="outline" className="text-xs">{rec.score}%</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">{rec.content}</p>
                  </div>
                ))
              )}
              <Link to="/ai">
                <Button variant="outline" size="sm" className="w-full mt-2">
                  <Zap className="w-3 h-3 mr-2" />
                  Generate Schedule
                </Button>
              </Link>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Tasks */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  Upcoming Tasks
                </span>
                <Link to="/tasks">
                  <Button variant="ghost" size="sm" className="text-xs">
                    View all <ArrowRight className="w-3 h-3 ml-1" />
                  </Button>
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {upcomingTasks.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No upcoming tasks. Great job!
                </p>
              ) : (
                upcomingTasks.slice(0, 5).map((task) => (
                  <div key={task._id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                      task.priority === 'urgent' ? 'bg-red-500' :
                      task.priority === 'high' ? 'bg-orange-500' :
                      task.priority === 'medium' ? 'bg-yellow-500' : 'bg-blue-500'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{task.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDuration(task.estimatedDuration)}
                        {task.dueDate && ` · Due ${getRelativeTime(task.dueDate)}`}
                      </p>
                    </div>
                    <Badge className={`text-xs ${getPriorityColor(task.priority)}`}>
                      {task.priority}
                    </Badge>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Today's Schedule */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Today's Schedule
                </span>
                <Link to="/calendar">
                  <Button variant="ghost" size="sm" className="text-xs">
                    Open Calendar <ArrowRight className="w-3 h-3 ml-1" />
                  </Button>
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {analytics?.tasks.overdue ? (
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <p className="text-sm">{analytics.tasks.overdue} overdue task{analytics.tasks.overdue > 1 ? 's' : ''}</p>
                  </div>
                ) : null}
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Meeting load</span>
                    <span className="font-medium">{analytics?.meetingHours || 0}h this week</span>
                  </div>
                  <Progress value={Math.min(100, ((analytics?.meetingHours || 0) / 20) * 100)} />
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Focus time</span>
                    <span className="font-medium">{analytics?.focusHours || 0}h this week</span>
                  </div>
                  <Progress value={Math.min(100, ((analytics?.focusHours || 0) / 20) * 100)} className="[&>div]:bg-emerald-500" />
                </div>
                <Link to="/calendar">
                  <Button variant="outline" size="sm" className="w-full mt-3">
                    View Full Calendar
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}

function StatCard({
  icon, label, value, sub, color
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub: string;
  color: string;
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className={`w-10 h-10 rounded-lg ${color} flex items-center justify-center mb-3`}>
          {icon}
        </div>
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-sm font-medium mt-0.5">{label}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>
      </CardContent>
    </Card>
  );
}
