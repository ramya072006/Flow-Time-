import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Search, LayoutDashboard, Calendar, CheckSquare, Target,
  BarChart3, Settings, X, ArrowRight
} from 'lucide-react';
import { useUIStore } from '@/stores/uiStore';
import { cn } from '@/lib/utils';

const commands = [
  { icon: LayoutDashboard, label: 'Go to Dashboard', path: '/dashboard', category: 'Navigation' },
  { icon: Calendar, label: 'Go to Calendar', path: '/calendar', category: 'Navigation' },
  { icon: CheckSquare, label: 'Go to Tasks', path: '/tasks', category: 'Navigation' },
  { icon: Target, label: 'Go to Habits', path: '/habits', category: 'Navigation' },
  { icon: BarChart3, label: 'Go to Analytics', path: '/analytics', category: 'Navigation' },
  { icon: Settings, label: 'Go to Settings', path: '/settings', category: 'Navigation' },
  { icon: CheckSquare, label: 'Create new task', path: '/tasks?new=true', category: 'Actions' },
  { icon: Calendar, label: 'Create new event', path: '/calendar?new=true', category: 'Actions' },
  { icon: Target, label: 'Create new habit', path: '/habits?new=true', category: 'Actions' },
];

export function CommandPalette() {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const { toggleCommandPalette } = useUIStore();
  const navigate = useNavigate();

  const filtered = commands.filter(
    (c) =>
      c.label.toLowerCase().includes(query.toLowerCase()) ||
      c.category.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') toggleCommandPalette();
      if (e.key === 'ArrowDown') setSelectedIndex((i) => Math.min(i + 1, filtered.length - 1));
      if (e.key === 'ArrowUp') setSelectedIndex((i) => Math.max(i - 1, 0));
      if (e.key === 'Enter' && filtered[selectedIndex]) {
        navigate(filtered[selectedIndex].path);
        toggleCommandPalette();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [filtered, selectedIndex, navigate, toggleCommandPalette]);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={toggleCommandPalette} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: -20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: -20 }}
        className="relative w-full max-w-lg bg-card rounded-xl border border-border shadow-2xl overflow-hidden"
      >
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
          <Search className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search commands..."
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
          <button onClick={toggleCommandPalette}>
            <X className="w-4 h-4 text-muted-foreground hover:text-foreground" />
          </button>
        </div>

        {/* Results */}
        <div className="max-h-80 overflow-y-auto py-2">
          {filtered.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground py-8">No commands found</p>
          ) : (
            filtered.map((command, index) => (
              <button
                key={command.path}
                className={cn(
                  'w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors',
                  index === selectedIndex ? 'bg-accent text-accent-foreground' : 'hover:bg-accent/50'
                )}
                onClick={() => {
                  navigate(command.path);
                  toggleCommandPalette();
                }}
                onMouseEnter={() => setSelectedIndex(index)}
              >
                <command.icon className="w-4 h-4 text-muted-foreground" />
                <span className="flex-1 text-left">{command.label}</span>
                <span className="text-xs text-muted-foreground">{command.category}</span>
                {index === selectedIndex && <ArrowRight className="w-3 h-3 text-muted-foreground" />}
              </button>
            ))
          )}
        </div>

        <div className="px-4 py-2 border-t border-border flex items-center gap-4 text-xs text-muted-foreground">
          <span>↑↓ navigate</span>
          <span>↵ select</span>
          <span>esc close</span>
        </div>
      </motion.div>
    </div>
  );
}
