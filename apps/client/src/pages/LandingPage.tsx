import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Zap, Brain, Calendar, CheckSquare, BarChart3, Flame,
  ArrowRight, Star, Check, ChevronDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const features = [
  {
    icon: Brain,
    title: 'AI-Powered Scheduling',
    description: 'Gemini AI automatically schedules your tasks into optimal time slots based on your energy levels, priorities, and preferences.',
    color: 'text-purple-500',
    bg: 'bg-purple-50 dark:bg-purple-950',
  },
  {
    icon: Calendar,
    title: 'Smart Calendar',
    description: 'Full-featured calendar with drag-and-drop, recurring events, conflict detection, and Google Calendar sync.',
    color: 'text-blue-500',
    bg: 'bg-blue-50 dark:bg-blue-950',
  },
  {
    icon: CheckSquare,
    title: 'Task Management',
    description: 'Kanban boards, subtasks, priorities, and AI-driven auto-scheduling keep your work organized and on track.',
    color: 'text-green-500',
    bg: 'bg-green-50 dark:bg-green-950',
  },
  {
    icon: Flame,
    title: 'Habit Tracking',
    description: 'Build lasting habits with streak tracking, completion analytics, and AI-optimized scheduling.',
    color: 'text-orange-500',
    bg: 'bg-orange-50 dark:bg-orange-950',
  },
  {
    icon: BarChart3,
    title: 'Productivity Analytics',
    description: 'Deep insights into your focus time, meeting load, task completion rates, and burnout indicators.',
    color: 'text-indigo-500',
    bg: 'bg-indigo-50 dark:bg-indigo-950',
  },
  {
    icon: Zap,
    title: 'Focus Mode',
    description: 'Pomodoro timer, DND suggestions, and distraction tracking to protect your deep work time.',
    color: 'text-yellow-500',
    bg: 'bg-yellow-50 dark:bg-yellow-950',
  },
];

const plans = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    features: ['5 tasks per day', 'Basic calendar', 'Habit tracking', '7-day analytics'],
    cta: 'Get started',
    popular: false,
  },
  {
    name: 'Pro',
    price: '$12',
    period: 'per month',
    features: ['Unlimited tasks', 'AI scheduling', 'Calendar sync', 'Advanced analytics', 'Focus mode', 'Priority support'],
    cta: 'Start free trial',
    popular: true,
  },
  {
    name: 'Team',
    price: '$29',
    period: 'per month',
    features: ['Everything in Pro', 'Team workspaces', 'Shared calendars', 'Team analytics', 'Admin panel', 'SSO'],
    cta: 'Start free trial',
    popular: false,
  },
];

const testimonials = [
  {
    name: 'Sarah Chen',
    role: 'Product Manager',
    content: 'FlowTime transformed how I manage my day. The AI scheduling is incredibly accurate and saves me hours of planning every week.',
    rating: 5,
  },
  {
    name: 'Marcus Rodriguez',
    role: 'Software Engineer',
    content: 'The focus time protection feature is a game-changer. I finally have uninterrupted deep work blocks every morning.',
    rating: 5,
  },
  {
    name: 'Emily Watson',
    role: 'Startup Founder',
    content: 'Managing a team and personal tasks used to be chaos. FlowTime brings everything together beautifully.',
    rating: 5,
  },
];

export function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg">FlowTime</span>
          </div>
          <div className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#pricing" className="hover:text-foreground transition-colors">Pricing</a>
            <a href="#testimonials" className="hover:text-foreground transition-colors">Reviews</a>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login">
              <Button variant="ghost" size="sm">Sign in</Button>
            </Link>
            <Link to="/register">
              <Button size="sm">Get started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Badge variant="secondary" className="mb-6 px-4 py-1.5">
              <Zap className="w-3 h-3 mr-1.5 text-primary" />
              Powered by Gemini AI
            </Badge>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
              Your calendar,{' '}
              <span className="text-primary">intelligently</span>{' '}
              managed
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
              FlowTime uses AI to automatically schedule your tasks, protect your focus time,
              and optimize your productivity — so you can do your best work.
            </p>
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <Link to="/register">
                <Button size="lg" className="px-8">
                  Start for free
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link to="/login">
                <Button variant="outline" size="lg" className="px-8">
                  Try demo
                </Button>
              </Link>
            </div>
            <p className="text-sm text-muted-foreground mt-4">No credit card required · Free forever plan</p>
          </motion.div>

          {/* Dashboard Preview */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mt-16 relative"
          >
            <div className="rounded-2xl border border-border bg-card shadow-2xl overflow-hidden">
              <div className="bg-muted/50 px-4 py-3 flex items-center gap-2 border-b border-border">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                <div className="w-3 h-3 rounded-full bg-green-400" />
                <div className="flex-1 mx-4 bg-background rounded-md h-6 flex items-center px-3">
                  <span className="text-xs text-muted-foreground">app.flowtime.ai/dashboard</span>
                </div>
              </div>
              <div className="p-6 grid grid-cols-4 gap-4">
                {[
                  { label: 'Tasks Done', value: '12/18', color: 'bg-indigo-500' },
                  { label: 'Focus Hours', value: '6.5h', color: 'bg-emerald-500' },
                  { label: 'Habits', value: '85%', color: 'bg-orange-500' },
                  { label: 'Score', value: '92', color: 'bg-purple-500' },
                ].map((stat) => (
                  <div key={stat.label} className="bg-muted/30 rounded-xl p-4">
                    <div className={`w-8 h-8 rounded-lg ${stat.color} mb-3`} />
                    <p className="text-xl font-bold">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                  </div>
                ))}
              </div>
              <div className="px-6 pb-6">
                <div className="bg-muted/30 rounded-xl p-4 h-32 flex items-center justify-center">
                  <div className="w-full h-full flex items-end gap-2 px-4">
                    {[40, 65, 45, 80, 55, 90, 70].map((h, i) => (
                      <div key={i} className="flex-1 bg-primary/20 rounded-t-sm" style={{ height: `${h}%` }}>
                        <div className="w-full bg-primary rounded-t-sm" style={{ height: `${h * 0.6}%` }} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-6 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Everything you need to stay in flow</h2>
            <p className="text-xl text-muted-foreground">Powerful features that work together seamlessly</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="bg-card rounded-2xl border border-border p-6 hover:shadow-lg transition-shadow"
              >
                <div className={`w-12 h-12 rounded-xl ${feature.bg} flex items-center justify-center mb-4`}>
                  <feature.icon className={`w-6 h-6 ${feature.color}`} />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Loved by productive people</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="bg-card rounded-2xl border border-border p-6"
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(t.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground mb-4 leading-relaxed">"{t.content}"</p>
                <div>
                  <p className="font-semibold text-sm">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 px-6 bg-muted/30">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Simple, transparent pricing</h2>
            <p className="text-xl text-muted-foreground">Start free, upgrade when you need more</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan, i) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className={`bg-card rounded-2xl border p-6 relative ${
                  plan.popular ? 'border-primary shadow-lg shadow-primary/10' : 'border-border'
                }`}
              >
                {plan.popular && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">Most Popular</Badge>
                )}
                <h3 className="text-xl font-bold mb-1">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground text-sm">/{plan.period}</span>
                </div>
                <ul className="space-y-2 my-6">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm">
                      <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link to="/register">
                  <Button
                    className="w-full"
                    variant={plan.popular ? 'default' : 'outline'}
                  >
                    {plan.cta}
                  </Button>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold mb-4">Ready to get in flow?</h2>
            <p className="text-xl text-muted-foreground mb-8">
              Join thousands of professionals who use FlowTime to do their best work.
            </p>
            <Link to="/register">
              <Button size="lg" className="px-10">
                Start for free
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-primary flex items-center justify-center">
              <Zap className="w-3 h-3 text-white" />
            </div>
            <span className="font-semibold">FlowTime</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2025 FlowTime. Built with ❤️ for productivity.
          </p>
          <div className="flex gap-4 text-sm text-muted-foreground">
            <a href="#" className="hover:text-foreground">Privacy</a>
            <a href="#" className="hover:text-foreground">Terms</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
