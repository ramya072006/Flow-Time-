import { Bell, Search, Sun, Moon, Laptop, Sparkles, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';
import { useNotificationStore } from '@/stores/notificationStore';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export function Header({ title }: { title?: string }) {
  const { user, logout } = useAuthStore();
  const { theme, setTheme, toggleCommandPalette, toggleAIPanel } = useUIStore();
  const { unreadCount, fetchUnreadCount } = useNotificationStore();
  const navigate = useNavigate();

  useEffect(() => {
    fetchUnreadCount();
  }, [fetchUnreadCount]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const cycleTheme = () => {
    const themes: Array<'light' | 'dark' | 'system'> = ['light', 'dark', 'system'];
    const current = themes.indexOf(theme);
    setTheme(themes[(current + 1) % themes.length]);
  };

  const ThemeIcon = theme === 'light' ? Sun : theme === 'dark' ? Moon : Laptop;

  return (
    <header className="h-16 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex items-center justify-between px-6 sticky top-0 z-40">
      <div className="flex items-center gap-4">
        {title && <h1 className="text-xl font-semibold">{title}</h1>}
      </div>

      <div className="flex items-center gap-2">
        {/* Search */}
        <Button
          variant="outline"
          size="sm"
          onClick={toggleCommandPalette}
          className="hidden md:flex items-center gap-2 text-muted-foreground w-64 justify-start"
        >
          <Search className="w-4 h-4" />
          <span className="text-sm">Search...</span>
          <kbd className="ml-auto text-xs bg-muted px-1.5 py-0.5 rounded">⌘K</kbd>
        </Button>

        {/* AI Assistant */}
        <Button variant="ghost" size="icon" onClick={toggleAIPanel} className="relative">
          <Sparkles className="w-5 h-5 text-primary" />
        </Button>

        {/* Theme toggle */}
        <Button variant="ghost" size="icon" onClick={cycleTheme}>
          <ThemeIcon className="w-5 h-5" />
        </Button>

        {/* Notifications */}
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          onClick={() => navigate('/notifications')}
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 w-5 h-5 p-0 flex items-center justify-center text-xs"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>

        {/* User menu */}
        <div className="flex items-center gap-2 ml-2">
          <Avatar className="w-8 h-8 cursor-pointer" onClick={() => navigate('/settings/profile')}>
            <AvatarImage src={user?.avatar} />
            <AvatarFallback className="text-xs">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          <Button variant="ghost" size="icon" onClick={handleLogout} title="Logout">
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}
