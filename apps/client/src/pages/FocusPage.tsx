import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, RotateCcw, Coffee, Brain, Timer } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

type Mode = 'focus' | 'short_break' | 'long_break';

const MODES = {
  focus: { label: 'Focus', duration: 25 * 60, color: 'text-indigo-500', bg: 'bg-indigo-500' },
  short_break: { label: 'Short Break', duration: 5 * 60, color: 'text-green-500', bg: 'bg-green-500' },
  long_break: { label: 'Long Break', duration: 15 * 60, color: 'text-blue-500', bg: 'bg-blue-500' },
};

export function FocusPage() {
  const [mode, setMode] = useState<Mode>('focus');
  const [timeLeft, setTimeLeft] = useState(MODES.focus.duration);
  const [isRunning, setIsRunning] = useState(false);
  const [sessions, setSessions] = useState(0);
  const [totalFocusTime, setTotalFocusTime] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const currentMode = MODES[mode];
  const progress = ((currentMode.duration - timeLeft) / currentMode.duration) * 100;

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            if (mode === 'focus') {
              setSessions((s) => s + 1);
              setTotalFocusTime((t) => t + MODES.focus.duration / 60);
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isRunning, mode]);

  const handleModeChange = (newMode: Mode) => {
    setMode(newMode);
    setTimeLeft(MODES[newMode].duration);
    setIsRunning(false);
  };

  const handleReset = () => {
    setTimeLeft(currentMode.duration);
    setIsRunning(false);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-2xl mx-auto space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-semibold">Focus Mode</h2>
        <p className="text-sm text-muted-foreground">Stay in the zone with Pomodoro technique</p>
      </div>

      {/* Mode selector */}
      <div className="flex rounded-xl border border-border overflow-hidden">
        {(Object.keys(MODES) as Mode[]).map((m) => (
          <button
            key={m}
            onClick={() => handleModeChange(m)}
            className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
              mode === m ? 'bg-primary text-primary-foreground' : 'hover:bg-muted text-muted-foreground'
            }`}
          >
            {MODES[m].label}
          </button>
        ))}
      </div>

      {/* Timer */}
      <Card>
        <CardContent className="p-8 text-center">
          <div className="relative w-48 h-48 mx-auto mb-6">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="45" fill="none" stroke="hsl(var(--muted))" strokeWidth="8" />
              <circle
                cx="50" cy="50" r="45"
                fill="none"
                stroke="hsl(var(--primary))"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 45}`}
                strokeDashoffset={`${2 * Math.PI * 45 * (1 - progress / 100)}`}
                className="transition-all duration-1000"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-bold font-mono">{formatTime(timeLeft)}</span>
              <span className={`text-sm font-medium mt-1 ${currentMode.color}`}>{currentMode.label}</span>
            </div>
          </div>

          <div className="flex items-center justify-center gap-4">
            <Button variant="outline" size="icon" onClick={handleReset}>
              <RotateCcw className="w-4 h-4" />
            </Button>
            <Button
              size="lg"
              onClick={() => setIsRunning(!isRunning)}
              className="w-32"
            >
              {isRunning ? (
                <><Pause className="w-4 h-4 mr-2" /> Pause</>
              ) : (
                <><Play className="w-4 h-4 mr-2" /> {timeLeft === currentMode.duration ? 'Start' : 'Resume'}</>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Brain className="w-5 h-5 text-indigo-500 mx-auto mb-2" />
            <p className="text-2xl font-bold">{sessions}</p>
            <p className="text-xs text-muted-foreground">Sessions today</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Timer className="w-5 h-5 text-green-500 mx-auto mb-2" />
            <p className="text-2xl font-bold">{totalFocusTime}m</p>
            <p className="text-xs text-muted-foreground">Focus time</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Coffee className="w-5 h-5 text-orange-500 mx-auto mb-2" />
            <p className="text-2xl font-bold">{Math.floor(sessions / 4)}</p>
            <p className="text-xs text-muted-foreground">Long breaks</p>
          </CardContent>
        </Card>
      </div>

      {/* Tips */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Focus Tips</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {[
            'Close unnecessary browser tabs',
            'Put your phone on Do Not Disturb',
            'Work on one task at a time',
            'Take breaks seriously — they improve focus',
          ].map((tip, i) => (
            <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
              {tip}
            </div>
          ))}
        </CardContent>
      </Card>
    </motion.div>
  );
}
