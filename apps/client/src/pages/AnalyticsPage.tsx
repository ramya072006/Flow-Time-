import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Clock, CheckSquare, Flame, Brain } from 'lucide-react';
import api from '@/lib/api';

interface AnalyticsData {
  productivityTrend: Array<{ date: string; tasksCompleted: number; focusHours: number; productivityScore: number }>;
  timeAllocation: Array<{ category: string; hours: number; percentage: number; color: string }>;
  weeklyReport: {
    totalFocusHours: number;
    totalMeetingHours: number;
    tasksCompleted: number;
    habitsCompleted: number;
    productivityScore: number;
    insights: string[];
  };
}

export function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [trendRes, allocationRes, reportRes] = await Promise.all([
          api.get('/analytics/productivity-trend?days=14'),
          api.get('/analytics/time-allocation'),
          api.get('/analytics/weekly-report'),
        ]);
        setData({
          productivityTrend: trendRes.data.data,
          timeAllocation: allocationRes.data.data,
          weeklyReport: reportRes.data.data,
        });
      } catch (error) {
        console.error('Failed to fetch analytics:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-64 bg-muted rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 max-w-6xl">
      <h2 className="text-xl font-semibold">Analytics & Insights</h2>

      {/* Weekly Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: Clock, label: 'Focus Hours', value: `${data?.weeklyReport.totalFocusHours || 0}h`, color: 'text-indigo-500' },
          { icon: CheckSquare, label: 'Tasks Done', value: data?.weeklyReport.tasksCompleted || 0, color: 'text-green-500' },
          { icon: Flame, label: 'Habits Done', value: data?.weeklyReport.habitsCompleted || 0, color: 'text-orange-500' },
          { icon: TrendingUp, label: 'Productivity', value: `${data?.weeklyReport.productivityScore || 0}/100`, color: 'text-purple-500' },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-4">
              <stat.icon className={`w-5 h-5 ${stat.color} mb-2`} />
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label} this week</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Productivity Trend */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Productivity Trend (14 days)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={data?.productivityTrend || []}>
              <defs>
                <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="focusGrad2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
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
              <Legend />
              <Area type="monotone" dataKey="productivityScore" stroke="#6366f1" fill="url(#scoreGrad)" strokeWidth={2} name="Productivity Score" />
              <Area type="monotone" dataKey="focusHours" stroke="#10b981" fill="url(#focusGrad2)" strokeWidth={2} name="Focus Hours" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Time Allocation */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Time Allocation</CardTitle>
          </CardHeader>
          <CardContent>
            {data?.timeAllocation && data.timeAllocation.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={data.timeAllocation}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      dataKey="hours"
                      nameKey="category"
                    >
                      {data.timeAllocation.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value}h`, 'Hours']} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2 mt-2">
                  {data.timeAllocation.map((item) => (
                    <div key={item.category} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="capitalize">{item.category}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">{item.hours}h</span>
                        <Badge variant="outline" className="text-xs">{item.percentage}%</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p className="text-center text-muted-foreground py-8 text-sm">No time data available yet</p>
            )}
          </CardContent>
        </Card>

        {/* Task Completion */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Daily Task Completion</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={data?.productivityTrend?.slice(-7) || []}>
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
                <Bar dataKey="tasksCompleted" fill="#6366f1" radius={[4, 4, 0, 0]} name="Tasks Completed" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* AI Insights */}
      {data?.weeklyReport.insights && data.weeklyReport.insights.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Brain className="w-4 h-4 text-primary" />
              Weekly Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.weeklyReport.insights.map((insight, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-primary">{i + 1}</span>
                  </div>
                  <p className="text-sm">{insight}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </motion.div>
  );
}
