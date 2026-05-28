import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Bell, Brain, Calendar, Shield, Palette } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';
import api from '@/lib/api';
import { useToast } from '@/hooks/useToast';

const tabs = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'ai', label: 'AI Settings', icon: Brain },
  { id: 'appearance', label: 'Appearance', icon: Palette },
  { id: 'security', label: 'Security', icon: Shield },
];

export function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile');
  const { user, updateUser } = useAuthStore();
  const { theme, setTheme } = useUIStore();
  const { toast } = useToast();
  const [name, setName] = useState(user?.name || '');
  const [timezone, setTimezone] = useState(user?.timezone || 'UTC');
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      const response = await api.patch('/auth/profile', { name, timezone });
      updateUser(response.data.data);
      toast({ title: 'Profile updated' });
    } catch {
      toast({ title: 'Failed to update profile', variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-4xl">
      <h2 className="text-xl font-semibold mb-6">Settings</h2>

      <div className="flex gap-6">
        {/* Sidebar */}
        <div className="w-48 flex-shrink-0">
          <nav className="space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1">
          {activeTab === 'profile' && (
            <Card>
              <CardHeader>
                <CardTitle>Profile Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Full Name</Label>
                  <Input value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input value={user?.email || ''} disabled className="opacity-60" />
                  <p className="text-xs text-muted-foreground">Email cannot be changed</p>
                </div>
                <div className="space-y-2">
                  <Label>Timezone</Label>
                  <select
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                    className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    {['UTC', 'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles',
                      'Europe/London', 'Europe/Paris', 'Asia/Tokyo', 'Asia/Shanghai', 'Australia/Sydney'].map((tz) => (
                      <option key={tz} value={tz}>{tz}</option>
                    ))}
                  </select>
                </div>
                <Button onClick={handleSaveProfile} disabled={isSaving}>
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </Button>
              </CardContent>
            </Card>
          )}

          {activeTab === 'appearance' && (
            <Card>
              <CardHeader>
                <CardTitle>Appearance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="mb-3 block">Theme</Label>
                  <div className="grid grid-cols-3 gap-3">
                    {(['light', 'dark', 'system'] as const).map((t) => (
                      <button
                        key={t}
                        onClick={() => setTheme(t)}
                        className={`p-4 rounded-xl border-2 transition-colors capitalize text-sm font-medium ${
                          theme === t ? 'border-primary bg-primary/5' : 'border-border hover:border-muted-foreground'
                        }`}
                      >
                        {t === 'light' ? '☀️' : t === 'dark' ? '🌙' : '💻'} {t}
                      </button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'ai' && (
            <Card>
              <CardHeader>
                <CardTitle>AI Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {[
                    { key: 'autoSchedule', label: 'Auto-schedule tasks', desc: 'Let AI automatically schedule pending tasks' },
                    { key: 'autoReschedule', label: 'Auto-reschedule', desc: 'Automatically reschedule missed tasks' },
                    { key: 'learningEnabled', label: 'Learning mode', desc: 'AI learns from your scheduling patterns' },
                  ].map((setting) => (
                    <div key={setting.key} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                      <div>
                        <p className="text-sm font-medium">{setting.label}</p>
                        <p className="text-xs text-muted-foreground">{setting.desc}</p>
                      </div>
                      <div className={`w-10 h-6 rounded-full transition-colors cursor-pointer ${
                        user?.aiSettings?.[setting.key as keyof typeof user.aiSettings] ? 'bg-primary' : 'bg-muted'
                      }`} />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'notifications' && (
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { key: 'email', label: 'Email notifications' },
                  { key: 'push', label: 'Push notifications' },
                  { key: 'inApp', label: 'In-app notifications' },
                  { key: 'deadlineAlerts', label: 'Deadline alerts' },
                  { key: 'aiSuggestions', label: 'AI suggestions' },
                ].map((setting) => (
                  <div key={setting.key} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                    <p className="text-sm font-medium">{setting.label}</p>
                    <div className={`w-10 h-6 rounded-full transition-colors cursor-pointer ${
                      user?.notificationSettings?.[setting.key as keyof typeof user.notificationSettings] ? 'bg-primary' : 'bg-muted'
                    }`} />
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {activeTab === 'security' && (
            <Card>
              <CardHeader>
                <CardTitle>Security</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 rounded-lg bg-muted/30">
                  <p className="text-sm font-medium mb-1">Change Password</p>
                  <p className="text-xs text-muted-foreground mb-3">Update your password to keep your account secure</p>
                  <Button variant="outline" size="sm">Change Password</Button>
                </div>
                <div className="p-4 rounded-lg bg-muted/30">
                  <p className="text-sm font-medium mb-1">Two-Factor Authentication</p>
                  <p className="text-xs text-muted-foreground mb-3">Add an extra layer of security to your account</p>
                  <Button variant="outline" size="sm">Enable 2FA</Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </motion.div>
  );
}
