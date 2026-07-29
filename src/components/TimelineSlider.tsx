import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  SkipBack, 
  SkipForward, 
  Calendar, 
  Clock, 
  Zap, 
  CheckCircle2, 
  AlertTriangle, 
  Gauge, 
  Sparkles,
  Layers,
  Activity
} from 'lucide-react';
import { GanttPhase, Task } from '../types';

interface TimelineSliderProps {
  currentDay: number;
  totalDays: number;
  onDayChange: (day: number) => void;
  phases: GanttPhase[];
  tasks: Task[];
  isTimelineMode: boolean;
  onToggleTimelineMode: (active: boolean) => void;
}

export const TimelineSlider: React.FC<TimelineSliderProps> = ({
  currentDay,
  totalDays,
  onDayChange,
  phases,
  tasks,
  isTimelineMode,
  onToggleTimelineMode,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState<number>(1); // 1x, 2x, 5x, 10x
  const [isLooping, setIsLooping] = useState(true);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Convert Day (1..31) to formatted date string (e.g. Aug 14, 2026)
  const getDateForDay = (day: number): string => {
    const baseDate = new Date(2026, 7, 1); // August 1, 2026
    baseDate.setDate(baseDate.getDate() + (day - 1));
    return baseDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  // Find active Gantt phase for current day
  const activePhase = phases.find(
    (p) => currentDay >= p.startDay && currentDay <= p.endDay
  ) || phases[0];

  // Auto-play animation effect
  useEffect(() => {
    if (isPlaying && isTimelineMode) {
      const intervalMs = Math.max(100, 1000 / speed);
      timerRef.current = setInterval(() => {
        onDayChange((prevDay) => {
          if (prevDay >= totalDays) {
            if (isLooping) return 1;
            setIsPlaying(false);
            return totalDays;
          }
          return prevDay + 1;
        });
      }, intervalMs);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, isTimelineMode, speed, totalDays, isLooping, onDayChange]);

  const handleTogglePlay = () => {
    if (!isTimelineMode) {
      onToggleTimelineMode(true);
    }
    setIsPlaying((prev) => !prev);
  };

  const handleStepBack = () => {
    if (!isTimelineMode) onToggleTimelineMode(true);
    onDayChange(Math.max(1, currentDay - 1));
  };

  const handleStepForward = () => {
    if (!isTimelineMode) onToggleTimelineMode(true);
    onDayChange(Math.min(totalDays, currentDay + 1));
  };

  const handleReset = () => {
    setIsPlaying(false);
    onDayChange(14); // Default drydock day 14
    onToggleTimelineMode(false);
  };

  // Compute live statistics for current timeline frame
  const currentCompleted = tasks.filter((t) => t.status === 'completed').length;
  const currentInProgress = tasks.filter((t) => t.status === 'in_progress').length;
  const currentDelayed = tasks.filter((t) => t.status === 'delayed' || t.status === 'waiting').length;
  const totalTasks = tasks.length;
  const totalProgSum = tasks.reduce((sum, t) => sum + (t.progress || 0), 0);
  const overallProg = totalTasks > 0 ? Math.round(totalProgSum / totalTasks) : 0;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 shadow-md font-sans relative overflow-hidden flex flex-col justify-between gap-1 max-h-[85px]">
      {/* Top Controls Header & Live Status Metrics Row */}
      <div className="flex items-center justify-between gap-2 relative z-10 text-xs">
        {/* Title, Date & Phase Indicator */}
        <div className="flex items-center gap-2 shrink-0">
          <div className={`w-6 h-6 rounded-md flex items-center justify-center transition-all ${
            isTimelineMode 
              ? 'bg-amber-400 text-slate-950 shadow-sm font-bold' 
              : 'bg-slate-800 text-slate-400 border border-slate-700'
          }`}>
            <Clock className={`w-3.5 h-3.5 ${isPlaying ? 'animate-spin' : ''}`} />
          </div>

          <div className="flex items-center gap-1.5 font-mono text-[11px]">
            <span className="font-bold text-slate-200 hidden md:inline">Timeline:</span>
            <span className="text-amber-400 font-bold">{getDateForDay(currentDay)}</span>
            <span className="text-slate-600">|</span>
            <span className="text-slate-300 font-semibold">Day {currentDay}/{totalDays}</span>
            <span className="text-slate-600 hidden sm:inline">|</span>
            <span className="text-cyan-400 hidden sm:inline truncate max-w-[100px]">{activePhase.name.split(':')[1] || activePhase.name}</span>
          </div>
        </div>

        {/* Playback Controls & Speed Options */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Step Back */}
          <button
            onClick={handleStepBack}
            className="p-1 rounded bg-slate-950 border border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white transition-all text-xs"
            title="Step Back 1 Day"
          >
            <SkipBack className="w-3 h-3" />
          </button>

          {/* Play / Pause Toggle */}
          <button
            onClick={handleTogglePlay}
            className={`flex items-center gap-1 px-2.5 py-1 rounded font-bold text-[11px] transition-all shadow-sm ${
              isPlaying
                ? 'bg-rose-500 text-white hover:bg-rose-600'
                : 'bg-amber-400 text-slate-950 hover:bg-amber-300'
            }`}
          >
            {isPlaying ? (
              <>
                <Pause className="w-3 h-3 fill-current" />
                <span>PAUSE</span>
              </>
            ) : (
              <>
                <Play className="w-3 h-3 fill-current" />
                <span>ANIMATE</span>
              </>
            )}
          </button>

          {/* Step Forward */}
          <button
            onClick={handleStepForward}
            className="p-1 rounded bg-slate-950 border border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white transition-all text-xs"
            title="Step Forward 1 Day"
          >
            <SkipForward className="w-3 h-3" />
          </button>

          {/* Playback Speed Selector */}
          <div className="hidden lg:flex items-center gap-0.5 bg-slate-950 border border-slate-800 p-0.5 rounded text-[10px] font-mono">
            <Gauge className="w-3 h-3 text-slate-500 ml-0.5" />
            {[0.5, 1, 2, 5].map((spd) => (
              <button
                key={spd}
                onClick={() => setSpeed(spd)}
                className={`px-1 py-0.2 rounded font-bold transition-all ${
                  speed === spd
                    ? 'bg-amber-400 text-slate-950'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {spd}x
              </button>
            ))}
          </div>

          {/* Live Counts Summary Badges */}
          <div className="hidden xl:flex items-center gap-2 font-mono text-[10px] bg-slate-950 border border-slate-800/80 px-2 py-0.5 rounded">
            <span className="text-emerald-400 font-bold">{currentCompleted} Done</span>
            <span className="text-yellow-400 font-bold">{currentInProgress} Active</span>
            <span className="text-blue-400 font-bold">{currentDelayed} Wait</span>
            <span className="text-purple-400 font-bold">{overallProg}%</span>
          </div>

          {/* Reset Button */}
          {isTimelineMode && (
            <button
              onClick={handleReset}
              className="flex items-center gap-1 px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-amber-400 hover:bg-slate-800 text-[10px] font-mono font-bold transition-all"
              title="Reset to Database View"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Timeline Scrubbing Bar & Phase Visual Ribbon */}
      <div className="space-y-0.5 relative z-10">
        {/* Phase Track Segment Ribbons */}
        <div 
          className="gap-0.5 h-1.5 rounded overflow-hidden bg-slate-950 border border-slate-800/80 p-0.5"
          style={{ display: 'grid', gridTemplateColumns: `repeat(${totalDays}, minmax(0, 1fr))` }}
        >
          {Array.from({ length: totalDays }, (_, i) => i + 1).map((day) => {
            const isPast = day <= currentDay;
            const isCurrent = day === currentDay;
            return (
              <div
                key={day}
                onClick={() => {
                  if (!isTimelineMode) onToggleTimelineMode(true);
                  onDayChange(day);
                }}
                className={`h-full cursor-pointer transition-all ${
                  isCurrent
                    ? 'bg-amber-400 shadow-sm shadow-amber-400/50 scale-y-125 z-10'
                    : isPast
                    ? 'bg-emerald-500/70 hover:bg-emerald-400'
                    : 'bg-slate-800 hover:bg-slate-700'
                }`}
                title={`Day ${day}: ${getDateForDay(day)}`}
              />
            );
          })}
        </div>

        {/* Phase Milestones Labels Row */}
        <div className="flex items-center justify-between text-[9px] font-mono text-slate-400 pt-0.5">
          {phases.map((ph) => {
            const isPhaseActive = currentDay >= ph.startDay && currentDay <= ph.endDay;
            return (
              <button
                key={ph.id}
                onClick={() => {
                  if (!isTimelineMode) onToggleTimelineMode(true);
                  onDayChange(ph.startDay);
                }}
                className={`truncate max-w-[100px] text-left transition-colors font-semibold ${
                  isPhaseActive
                    ? 'text-amber-400 font-bold underline underline-offset-2'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title={`${ph.name} (Days ${ph.startDay}-${ph.endDay})`}
              >
                {ph.name.split(':')[1] || ph.name}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
