import React, { useState, useEffect } from 'react';
import { Play, Pause, X, Bell, RotateCcw } from 'lucide-react';

export interface ActiveTimer {
  id: string;
  label: string;
  totalSeconds: number;
  remainingSeconds: number;
  isRunning: boolean;
}

interface ActiveTimerOverlayProps {
  timers: ActiveTimer[];
  onUpdateTimer: (id: string, updates: Partial<ActiveTimer>) => void;
  onRemoveTimer: (id: string) => void;
}

export const ActiveTimerOverlay: React.FC<ActiveTimerOverlayProps> = ({
  timers,
  onUpdateTimer,
  onRemoveTimer
}) => {
  if (timers.length === 0) return null;

  return (
    <div className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {timers.map((timer) => (
        <TimerItem
          key={timer.id}
          timer={timer}
          onUpdate={(updates) => onUpdateTimer(timer.id, updates)}
          onRemove={() => onRemoveTimer(timer.id)}
        />
      ))}
    </div>
  );
};

const TimerItem: React.FC<{
  timer: ActiveTimer;
  onUpdate: (updates: Partial<ActiveTimer>) => void;
  onRemove: () => void;
}> = ({ timer, onUpdate, onRemove }) => {
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    let interval: any = null;
    if (timer.isRunning && timer.remainingSeconds > 0) {
      interval = setInterval(() => {
        onUpdate({ remainingSeconds: Math.max(0, timer.remainingSeconds - 1) });
      }, 1000);
    } else if (timer.remainingSeconds === 0 && !isDone) {
      setIsDone(true);
      onUpdate({ isRunning: false });
      // Play web audio chime
      playKitchenChime();
    }

    return () => clearInterval(interval);
  }, [timer.isRunning, timer.remainingSeconds]);

  const playKitchenChime = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      osc.frequency.setValueAtTime(880, audioCtx.currentTime + 0.15); // A5
      gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.8);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.8);
    } catch {
      // AudioContext not available or blocked
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const progressPercent = ((timer.totalSeconds - timer.remainingSeconds) / timer.totalSeconds) * 100;

  return (
    <div className={`pointer-events-auto backdrop-blur-md rounded-2xl p-3 sm:p-4 shadow-2xl border transition-all duration-300 ${
      isDone
        ? 'bg-amber-500/90 text-stone-950 border-amber-400 animate-bounce'
        : 'bg-stone-900/95 text-stone-100 border-amber-500/30'
    }`}>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <div className={`p-2 rounded-xl ${isDone ? 'bg-amber-900/40 text-stone-900' : 'bg-amber-500/20 text-amber-400'}`}>
            <Bell className={`w-4 h-4 ${isDone ? 'animate-spin' : ''}`} />
          </div>
          <div className="truncate">
            <p className="text-xs font-medium text-stone-300 truncate">{timer.label}</p>
            <p className="font-mono text-lg sm:text-xl font-bold tracking-tight">
              {formatTime(timer.remainingSeconds)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {!isDone ? (
            <button
              onClick={() => onUpdate({ isRunning: !timer.isRunning })}
              className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 transition-colors"
              title={timer.isRunning ? 'Pause' : 'Resume'}
            >
              {timer.isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>
          ) : (
            <button
              onClick={() => {
                setIsDone(false);
                onUpdate({ remainingSeconds: timer.totalSeconds, isRunning: true });
              }}
              className="p-2 rounded-xl bg-amber-900/40 hover:bg-amber-900/60 text-stone-950 transition-colors"
              title="Restart"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={onRemove}
            className="p-2 rounded-xl hover:bg-stone-800/80 text-stone-400 hover:text-stone-200 transition-colors"
            title="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Progress line */}
      <div className="w-full bg-stone-800/60 h-1.5 rounded-full mt-2.5 overflow-hidden">
        <div
          className={`h-full transition-all duration-300 rounded-full ${isDone ? 'bg-stone-950' : 'bg-gradient-to-r from-amber-500 to-amber-400'}`}
          style={{ width: `${Math.min(100, progressPercent)}%` }}
        />
      </div>
    </div>
  );
};
