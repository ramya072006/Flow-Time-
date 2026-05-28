import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Brain, Zap, CheckCircle2, Loader2, Sparkles, X,
  Calendar, Clock, AlertCircle, RefreshCw
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import api from '@/lib/api';
import { useToast } from '@/hooks/useToast';
import { formatDuration } from '@/lib/utils';

interface Recommendation {
  _id: string;
  recommendationType: string;
  title: string;
  content: string;
  score: number;
  applied: boolean;
  dismissed: boolean;
}

interface ScheduledTask {
  taskId: string;
  scheduledStart?: string;
  scheduledEnd?: string;
  reasoning?: string;
  score?: number;
  task?: {
    _id: string;
    title: string;
    estimatedDuration: number;
    priority: string;
  };
}

interface ScheduleResult {
  scheduledTasks: ScheduledTask[];
  unscheduledTasks: Array<{ taskId: string; reason: string }>;
  recommendations: string[];
}

export function AIPage() {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [insights, setInsights] = useState<string[]>([]);
  const [isScheduling, setIsScheduling] = useState(false);
  const [scheduleResult, setScheduleResult] = useState<ScheduleResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [recsRes, insightsRes] = await Promise.all([
        api.get('/ai/recommendations'),
        api.get('/ai/insights'),
      ]);
      setRecommendations(recsRes.data.data || []);
      setInsights(Array.isArray(insightsRes.data.data) ? insightsRes.data.data : []);
    } catch {
      toast({ title: 'Failed to load AI data', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleGenerateSchedule = async () => {
    setIsScheduling(true);
    setScheduleResult(null);
    try {
      const response = await api.post('/ai/schedule');
      const data = response.data.data;
      // Normalise — ensure arrays exist
      const result: ScheduleResult = {
        scheduledTasks: Array.isArray(data?.scheduledTasks) ? data.scheduledTasks : [],
        unscheduledTasks: Array.isArray(data?.unscheduledTasks) ? data.unscheduledTasks : [],
        recommendations: Array.isArray(data?.recommendations) ? data.recommendations : [],
      };
      setScheduleResult(result);
      toast({
        title: result.scheduledTasks.length > 0
          ? `✅ Scheduled ${result.scheduledTasks.length} task${result.scheduledTasks.length !== 1 ? 's' : ''}!`
          : 'No pending tasks to schedule.',
      });
      // Refresh recommendations after scheduling
      fetchData();
    } catch (err) {
      console.error('Schedule error:', err);
      toast({ title: 'AI scheduling failed. Please try again.', variant: 'destructive' });
    } finally {
      setIsScheduling(false);
    }
  };

  const handleApply = async (id: string) => {
    try {
      await api.post(`/ai/recommendations/${id}/apply`);
      setRecommendations((prev) => prev.map((r) => r._id === id ? { ...r, applied: true } : r));
      toast({ title: 'Recommendation applied' });
    } catch {
      toast({ title: 'Failed to apply recommendation', variant: 'destructive' });
    }
  };

  const handleDismiss = async (id: string) => {
    try {
      await api.post(`/ai/recommendations/${id}/dismiss`);
      setRecommendations((prev) => prev.filter((r) => r._id !== id));
    } catch {
      toast({ title: 'Failed to dismiss', variant: 'destructive' });
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 max-w-4xl">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">AI Assistant</h2>
          <p className="text-sm text-muted-foreground">Powered by Gemini AI</p>
        </div>
        <Button onClick={handleGenerateSchedule} disabled={isScheduling}>
          {isScheduling ? (
            <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Scheduling...</>
          ) : (
            <><Zap className="w-4 h-4 mr-2" /> Generate Schedule</>
          )}
        </Button>
      </div>

      {/* Schedule Result Banner */}
      {scheduleResult && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="border-primary/40 bg-primary/5">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  Schedule Generated
                </CardTitle>
                <button
                  onClick={() => setScheduleResult(null)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Stats row */}
              <div className="flex gap-4 text-sm">
                <span className="flex items-center gap-1.5 text-green-600 dark:text-green-400">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {scheduleResult.scheduledTasks.length} scheduled
                </span>
                {scheduleResult.unscheduledTasks.length > 0 && (
                  <span className="flex items-center gap-1.5 text-orange-500">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {scheduleResult.unscheduledTasks.length} could not be scheduled
                  </span>
                )}
              </div>

              {/* Scheduled tasks list */}
              {scheduleResult.scheduledTasks.length > 0 && (
                <div className="space-y-2">
                  {scheduleResult.scheduledTasks.map((item, i) => (
                    <div key={item.taskId || i} className="flex items-start gap-2 p-2 rounded-md bg-background/60 text-sm">
                      <Calendar className="w-3.5 h-3.5 text-primary flex-shrink-0 mt-0.5" />
                      <div className="min-w-0">
                        <p className="font-medium truncate">
                          {item.task?.title || `Task ${i + 1}`}
                        </p>
                        {item.scheduledStart && (
                          <p className="text-xs text-muted-foreground">
                            {new Date(item.scheduledStart).toLocaleString([], {
                              weekday: 'short', month: 'short', day: 'numeric',
                              hour: '2-digit', minute: '2-digit',
                            })}
                            {item.task?.estimatedDuration && (
                              <span className="ml-1">· {formatDuration(item.task.estimatedDuration)}</span>
                            )}
                          </p>
                        )}
                        {item.reasoning && (
                          <p className="text-xs text-muted-foreground italic mt-0.5">{item.reasoning}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Unscheduled */}
              {scheduleResult.unscheduledTasks.length > 0 && (
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground">Could not schedule:</p>
                  {scheduleResult.unscheduledTasks.map((item, i) => (
                    <p key={item.taskId || i} className="text-xs text-orange-500 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 flex-shrink-0" />
                      {item.reason}
                    </p>
                  ))}
                </div>
              )}

              {/* AI recommendations */}
              {scheduleResult.recommendations.length > 0 && (
                <div className="space-y-1.5 pt-1 border-t border-border/50">
                  {scheduleResult.recommendations.map((rec, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm">
                      <Sparkles className="w-3.5 h-3.5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">{rec}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Recommendations */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Brain className="w-4 h-4 text-primary" />
                Recommendations
              </CardTitle>
              <Button variant="ghost" size="icon" className="w-7 h-7" onClick={fetchData}>
                <RefreshCw className="w-3.5 h-3.5" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {isLoading ? (
              <div className="space-y-2">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-20 bg-muted rounded-lg animate-pulse" />
                ))}
              </div>
            ) : recommendations.length === 0 ? (
              <div className="text-center py-6">
                <Brain className="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-50" />
                <p className="text-sm text-muted-foreground">
                  No recommendations right now. Keep using FlowTime!
                </p>
              </div>
            ) : (
              recommendations.map((rec) => (
                <div key={rec._id} className="p-3 rounded-lg bg-muted/50 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-medium leading-snug">{rec.title}</p>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <Badge variant="outline" className="text-xs">{rec.score}%</Badge>
                      <button
                        onClick={() => handleDismiss(rec._id)}
                        className="text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{rec.content}</p>
                  {rec.applied ? (
                    <Badge variant="secondary" className="text-xs bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                      ✓ Applied
                    </Badge>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs"
                      onClick={() => handleApply(rec._id)}
                    >
                      Apply suggestion
                    </Button>
                  )}
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Insights */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              Productivity Insights
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {isLoading ? (
              <div className="space-y-2">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-16 bg-muted rounded-lg animate-pulse" />
                ))}
              </div>
            ) : insights.length === 0 ? (
              <div className="text-center py-6">
                <Sparkles className="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-50" />
                <p className="text-sm text-muted-foreground">
                  Complete more tasks to unlock insights.
                </p>
              </div>
            ) : (
              insights.map((insight, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-primary">{i + 1}</span>
                  </div>
                  <p className="text-sm leading-relaxed">{insight}</p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick actions */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Zap className="w-4 h-4 text-primary" />
            Quick AI Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              {
                label: 'Schedule this week',
                desc: 'Auto-place all pending tasks',
                icon: Calendar,
                action: handleGenerateSchedule,
                loading: isScheduling,
              },
              {
                label: 'Refresh insights',
                desc: 'Get latest AI analysis',
                icon: RefreshCw,
                action: fetchData,
                loading: isLoading,
              },
              {
                label: 'Open AI chat',
                desc: 'Ask anything about your schedule',
                icon: Sparkles,
                action: () => {
                  // Trigger AI panel via keyboard shortcut hint
                  document.dispatchEvent(new KeyboardEvent('keydown', { key: '/', ctrlKey: true, bubbles: true }));
                },
                loading: false,
              },
            ].map((action) => (
              <button
                key={action.label}
                onClick={action.action}
                disabled={action.loading}
                className="flex items-start gap-3 p-4 rounded-xl border border-border hover:border-primary/50 hover:bg-primary/5 transition-all text-left disabled:opacity-50 disabled:cursor-not-allowed group"
              >
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                  {action.loading
                    ? <Loader2 className="w-4 h-4 text-primary animate-spin" />
                    : <action.icon className="w-4 h-4 text-primary" />
                  }
                </div>
                <div>
                  <p className="text-sm font-medium">{action.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{action.desc}</p>
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
