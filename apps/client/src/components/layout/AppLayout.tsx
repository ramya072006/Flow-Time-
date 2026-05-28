import { Outlet, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { AIAssistantPanel } from '@/components/ai/AIAssistantPanel';
import { CommandPalette } from '@/components/common/CommandPalette';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { useUIStore } from '@/stores/uiStore';
import { Toaster } from '@/components/ui/toaster';
import { useAuthStore } from '@/stores/authStore';

const pageTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/calendar': 'Calendar',
  '/tasks': 'Tasks',
  '/habits': 'Habits',
  '/analytics': 'Analytics',
  '/focus': 'Focus Mode',
  '/team': 'Team',
  '/notifications': 'Notifications',
  '/settings': 'Settings',
  '/ai': 'AI Assistant',
};

export function AppLayout() {
  const location = useLocation();
  const { theme, aiPanelOpen, commandPaletteOpen, toggleCommandPalette, toggleAIPanel } = useUIStore();
  const { fetchMe } = useAuthStore();

  const title = pageTitles[location.pathname] ||
    Object.entries(pageTitles).find(([path]) => location.pathname.startsWith(path))?.[1] || '';

  useEffect(() => {
    fetchMe();
  }, [fetchMe]);

  // Global keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + K → Command palette
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        toggleCommandPalette();
      }
      // Cmd/Ctrl + / → AI panel
      if ((e.metaKey || e.ctrlKey) && e.key === '/') {
        e.preventDefault();
        toggleAIPanel();
      }
      // Escape → close panels
      if (e.key === 'Escape') {
        if (commandPaletteOpen) toggleCommandPalette();
        if (aiPanelOpen) toggleAIPanel();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [commandPaletteOpen, aiPanelOpen, toggleCommandPalette, toggleAIPanel]);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else if (theme === 'light') {
      root.classList.remove('dark');
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.classList.toggle('dark', prefersDark);
    }
  }, [theme]);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header title={title} />

        <main className="flex-1 overflow-y-auto">
          <div className="p-6">
            <ErrorBoundary>
              <Outlet />
            </ErrorBoundary>
          </div>
        </main>
      </div>

      {/* AI Panel */}
      {aiPanelOpen && <AIAssistantPanel />}

      {/* Command Palette */}
      {commandPaletteOpen && <CommandPalette />}

      <Toaster />
    </div>
  );
}
