import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Send, Sparkles, Loader2, Bot, User,
  Trash2, Calendar, ChevronRight, Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useUIStore } from '@/stores/uiStore';
import api from '@/lib/api';
import { cn, getRelativeTime } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

// ── Markdown renderer ──────────────────────────────────────────────────────
function MarkdownText({ text }: { text: string }) {
  const lines = text.split('\n');
  return (
    <div className="space-y-0.5">
      {lines.map((line, i) => {
        if (!line.trim()) return <div key={i} className="h-1.5" />;

        const renderInline = (str: string) => {
          const parts = str.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g);
          return parts.map((part, j) => {
            if (part.startsWith('**') && part.endsWith('**'))
              return <strong key={j} className="font-semibold">{part.slice(2, -2)}</strong>;
            if (part.startsWith('*') && part.endsWith('*'))
              return <em key={j}>{part.slice(1, -1)}</em>;
            if (part.startsWith('`') && part.endsWith('`'))
              return <code key={j} className="bg-black/10 dark:bg-white/10 px-1 rounded text-xs font-mono">{part.slice(1, -1)}</code>;
            return <span key={j}>{part}</span>;
          });
        };

        if (line.startsWith('• ') || line.startsWith('- ') || line.startsWith('* ')) {
          return (
            <div key={i} className="flex gap-1.5 leading-relaxed">
              <span className="mt-0.5 flex-shrink-0 text-primary">•</span>
              <span>{renderInline(line.slice(2))}</span>
            </div>
          );
        }
        if (/^\d+\.\s/.test(line)) {
          const num = line.match(/^(\d+)\.\s/)?.[1];
          return (
            <div key={i} className="flex gap-1.5 leading-relaxed">
              <span className="mt-0.5 flex-shrink-0 text-primary font-medium">{num}.</span>
              <span>{renderInline(line.replace(/^\d+\.\s/, ''))}</span>
            </div>
          );
        }
        return <p key={i} className="leading-relaxed">{renderInline(line)}</p>;
      })}
    </div>
  );
}

// ── Types ──────────────────────────────────────────────────────────────────
interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  suggestions?: string[];
}

const DEFAULT_SUGGESTIONS = [
  'Schedule my tasks for today',
  'What are my priorities?',
  'Add: eat at 8am, exercise at 7pm',
  'Plan my week',
];

// ── Main Component ─────────────────────────────────────────────────────────
export function AIAssistantPanel() {
  const { toggleAIPanel } = useUIStore();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [currentSuggestions, setCurrentSuggestions] = useState<string[]>(DEFAULT_SUGGESTIONS);
  const [showCalendarHint, setShowCalendarHint] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // ── Load persistent history on mount ──
  useEffect(() => {
    const loadHistory = async () => {
      try {
        const res = await api.get('/ai/chat/history?limit=50');
        const { messages: dbMessages, suggestions } = res.data.data;

        if (dbMessages.length > 0) {
          setMessages(dbMessages.map((m: Message) => ({
            ...m,
            timestamp: new Date(m.timestamp),
          })));
          if (suggestions?.length) setCurrentSuggestions(suggestions);
        } else {
          // Fresh session — show welcome
          setMessages([{
            role: 'assistant',
            content: "Hi! I'm your FlowTime AI assistant. I can help you **schedule tasks**, **optimize your calendar**, and **boost your productivity**.\n\nWhat would you like to do?",
            timestamp: new Date(),
            suggestions: DEFAULT_SUGGESTIONS,
          }]);
        }
      } catch {
        setMessages([{
          role: 'assistant',
          content: "Hi! I'm your FlowTime AI assistant. What would you like to do?",
          timestamp: new Date(),
          suggestions: DEFAULT_SUGGESTIONS,
        }]);
      } finally {
        setIsLoadingHistory(false);
      }
    };
    loadHistory();
  }, []);

  // ── Auto-scroll ──
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // ── Focus input ──
  useEffect(() => {
    if (!isLoadingHistory) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isLoadingHistory]);

  // ── Send message ──
  const sendMessage = useCallback(async (text?: string) => {
    const messageText = (text || input).trim();
    if (!messageText || isLoading) return;

    const userMessage: Message = { role: 'user', content: messageText, timestamp: new Date() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setShowCalendarHint(false);

    try {
      const history = messages.slice(-10).map(m => ({ role: m.role, content: m.content }));
      const res = await api.post('/ai/chat', { message: messageText, history });
      const { message: responseText, suggestions } = res.data.data;

      const assistantMessage: Message = {
        role: 'assistant',
        content: responseText,
        timestamp: new Date(),
        suggestions: suggestions || [],
      };
      setMessages(prev => [...prev, assistantMessage]);

      if (suggestions?.length) setCurrentSuggestions(suggestions);

      // Show calendar hint if tasks were scheduled
      if (responseText.includes('added to your calendar') || responseText.includes('Scheduled for')) {
        setShowCalendarHint(true);
      }
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, something went wrong. Please try again.',
        timestamp: new Date(),
      }]);
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, messages]);

  // ── Clear history ──
  const clearHistory = async () => {
    await api.delete('/ai/chat/history');
    setMessages([{
      role: 'assistant',
      content: "Chat cleared! I'm ready to help you again. What would you like to do?",
      timestamp: new Date(),
      suggestions: DEFAULT_SUGGESTIONS,
    }]);
    setCurrentSuggestions(DEFAULT_SUGGESTIONS);
    setShowCalendarHint(false);
  };

  const isFirstMessage = messages.length <= 1;

  return (
    <motion.div
      initial={{ x: '100%', opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: '100%', opacity: 0 }}
      transition={{ type: 'spring', damping: 28, stiffness: 220 }}
      className="fixed right-0 top-0 h-full w-[400px] bg-card border-l border-border shadow-2xl z-50 flex flex-col"
    >
      {/* ── Header ── */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-card/95 backdrop-blur">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">AI Assistant</h3>
            <p className="text-xs text-muted-foreground">Powered by Gemini</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {messages.length > 1 && (
            <Button
              variant="ghost"
              size="icon"
              className="w-7 h-7 text-muted-foreground hover:text-destructive"
              onClick={clearHistory}
              title="Clear history"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          )}
          <Button variant="ghost" size="icon" className="w-7 h-7" onClick={toggleAIPanel}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* ── Calendar hint banner ── */}
      <AnimatePresence>
        {showCalendarHint && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <button
              onClick={() => { navigate('/calendar'); toggleAIPanel(); }}
              className="w-full flex items-center gap-2 px-4 py-2.5 bg-primary/10 hover:bg-primary/15 transition-colors text-left"
            >
              <Calendar className="w-4 h-4 text-primary flex-shrink-0" />
              <span className="text-xs text-primary font-medium flex-1">
                Tasks added to calendar — tap to view
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-primary" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Messages ── */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
        {isLoadingHistory ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center space-y-2">
              <Loader2 className="w-6 h-6 animate-spin text-primary mx-auto" />
              <p className="text-xs text-muted-foreground">Loading history...</p>
            </div>
          </div>
        ) : (
          <>
            {messages.map((message, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className={cn('flex gap-2.5', message.role === 'user' ? 'flex-row-reverse' : 'flex-row')}
              >
                {/* Avatar */}
                <div className={cn(
                  'w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5',
                  message.role === 'user' ? 'bg-primary' : 'bg-muted border border-border'
                )}>
                  {message.role === 'user'
                    ? <User className="w-3.5 h-3.5 text-white" />
                    : <Bot className="w-3.5 h-3.5 text-muted-foreground" />
                  }
                </div>

                {/* Bubble */}
                <div className="flex flex-col gap-1 max-w-[82%]">
                  <div className={cn(
                    'rounded-2xl px-3.5 py-2.5 text-sm',
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground rounded-tr-sm'
                      : 'bg-muted text-foreground rounded-tl-sm'
                  )}>
                    {message.role === 'assistant'
                      ? <MarkdownText text={message.content} />
                      : <p>{message.content}</p>
                    }
                  </div>
                  <span className={cn(
                    'text-[10px] text-muted-foreground px-1',
                    message.role === 'user' ? 'text-right' : 'text-left'
                  )}>
                    <Clock className="w-2.5 h-2.5 inline mr-0.5" />
                    {getRelativeTime(message.timestamp)}
                  </span>
                </div>
              </motion.div>
            ))}

            {/* Typing indicator */}
            {isLoading && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-2.5"
              >
                <div className="w-7 h-7 rounded-full bg-muted border border-border flex items-center justify-center flex-shrink-0">
                  <Bot className="w-3.5 h-3.5 text-muted-foreground" />
                </div>
                <div className="bg-muted rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1">
                  {[0, 1, 2].map(i => (
                    <motion.div
                      key={i}
                      className="w-1.5 h-1.5 rounded-full bg-muted-foreground/60"
                      animate={{ y: [0, -4, 0] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                    />
                  ))}
                </div>
              </motion.div>
            )}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* ── Context-aware suggestions ── */}
      <AnimatePresence>
        {!isLoading && currentSuggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="px-4 pb-2"
          >
            {isFirstMessage && (
              <p className="text-[10px] text-muted-foreground mb-1.5 font-medium uppercase tracking-wider">
                Try asking
              </p>
            )}
            <div className="flex flex-wrap gap-1.5">
              {currentSuggestions.slice(0, 4).map((s, i) => (
                <motion.button
                  key={s}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => sendMessage(s)}
                  disabled={isLoading}
                  className="text-xs bg-muted hover:bg-primary/10 hover:text-primary border border-border hover:border-primary/30 px-2.5 py-1 rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {s}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Input ── */}
      <div className="p-4 border-t border-border bg-card/95 backdrop-blur">
        <div className="flex gap-2 items-end">
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              placeholder="Ask me anything..."
              disabled={isLoading || isLoadingHistory}
              className="w-full px-4 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 disabled:opacity-50 transition-all pr-2"
            />
          </div>
          <Button
            size="icon"
            onClick={() => sendMessage()}
            disabled={!input.trim() || isLoading || isLoadingHistory}
            className="w-10 h-10 rounded-xl flex-shrink-0"
          >
            {isLoading
              ? <Loader2 className="w-4 h-4 animate-spin" />
              : <Send className="w-4 h-4" />
            }
          </Button>
        </div>
        <p className="text-[10px] text-muted-foreground mt-1.5 text-center">
          Press Enter to send · Ctrl+/ to toggle
        </p>
      </div>
    </motion.div>
  );
}
