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
      year: 'numeric',
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
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg space-y-3 font-sans relative overflow-hidden">
      {/* Decorative ambient gradient backdrop */}
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-amber-500/10 blur-3xl pointer-events-none rounded-full" />
      <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-cyan-500/10 blur-3xl pointer-events-none rounded-full" />

      {/* Top Controls Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10">
        {/* Title & Timeline Status Badge */}
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
            isTimelineMode 
              ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-500/20 font-bold' 
              : 'bg-slate-800 text-slate-400 border border-slate-700'
          }`}>
            <Clock className={`w-5 h-5 ${isPlaying ? 'animate-spin' : ''}`} />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                Project Drydock Timeline Simulator
              </h3>
              {isTimelineMode && (
                <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-400 border border-amber-400/40 animate-pulse">
                  <Activity className="w-3 h-3" /> LIVE SIMULATION
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-400 font-mono">
              Date: <strong className="text-amber-400">{getDateForDay(currentDay)}</strong>
              <span className="text-slate-600 px-1">|</span>
              Day <strong className="text-slate-200">{currentDay}</strong> of {totalDays}
              <span className="text-slate-600 px-1">|</span>
              <span className="text-cyan-400">{activePhase.name}</span>
            </p>
          </div>
        </div>

        {/* Playback Controls & Speed Options */}
        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          {/* Step Back */}
          <button
            onClick={handleStepBack}
            className="p-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white transition-all text-xs"
            title="Step Back 1 Day"
          >
            <SkipBack className="w-4 h-4" />
          </button>

          {/* Play / Pause Toggle */}
          <button
            onClick={handleTogglePlay}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-xs transition-all shadow-md ${
              isPlaying
                ? 'bg-rose-500 text-white hover:bg-rose-600 shadow-rose-500/20'
                : 'bg-amber-400 text-slate-950 hover:bg-amber-300 shadow-amber-500/20'
            }`}
          >
            {isPlaying ? (
              <>
                <Pause className="w-4 h-4 fill-current" />
                <span>PAUSE</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>ANIMATE TIMELINE</span>
              </>
            )}
          </button>

          {/* Step Forward */}
          <button
            onClick={handleStepForward}
            className="p-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white transition-all text-xs"
            title="Step Forward 1 Day"
          >
            <SkipForward className="w-4 h-4" />
          </button>

          {/* Playback Speed Selector */}
          <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 p-1 rounded-lg text-xs font-mono">
            <Gauge className="w-3.5 h-3.5 text-slate-500 ml-1" />
            {[0.5, 1, 2, 5].map((spd) => (
              <button
                key={spd}
                onClick={() => setSpeed(spd)}
                className={`px-1.5 py-0.5 rounded text-[10px] font-bold transition-all ${
                  speed === spd
                    ? 'bg-amber-400 text-slate-950'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {spd}x
              </button>
            ))}
          </div>

          {/* Reset Button */}
          {isTimelineMode && (
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-amber-400 hover:bg-slate-800 text-xs font-mono font-bold transition-all ml-1"
              title="Reset to Database Default View"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Timeline Scrubbing Bar & Phase Visual Ribbon */}
      <div className="space-y-1.5 relative z-10 pt-1">
        {/* Phase Track Segment Ribbons */}
        <div 
          className="gap-0.5 h-2 rounded-md overflow-hidden bg-slate-950 border border-slate-800/80 p-0.5"
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
                    ? 'bg-amber-400 shadow-md shadow-amber-400/50 scale-y-125 z-10'
                    : isPast
                    ? 'bg-emerald-500/70 hover:bg-emerald-400'
                    : 'bg-slate-800 hover:bg-slate-700'
                }`}
                title={`Day ${day}: ${getDateForDay(day)}`}
              />
            );
          })}
        </div>

        {/* Range Slider Control */}
        <div className="relative flex items-center">
          <input
            type="range"
            min={1}
            max={totalDays}
            value={currentDay}
            onChange={(e) => {
              if (!isTimelineMode) onToggleTimelineMode(true);
              onDayChange(Number(e.target.value));
            }}
            className="w-full h-2.5 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-amber-400 focus:outline-none border border-slate-800"
          />
        </div>

        {/* Phase Milestones Labels Row */}
        <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pt-0.5">
          {phases.map((ph) => {
            const isPhaseActive = currentDay >= ph.startDay && currentDay <= ph.endDay;
            return (
              <button
                key={ph.id}
                onClick={() => {
                  if (!isTimelineMode) onToggleTimelineMode(true);
                  onDayChange(ph.startDay);
                }}
                className={`truncate max-w-[120px] text-left transition-colors font-semibold ${
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

      {/* Real-Time Live Status Metrics Banner */}
      <div className="bg-slate-950 border border-slate-800/90 rounded-lg p-2.5 flex flex-wrap items-center justify-between gap-3 text-xs font-mono relative z-10">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block animate-pulse" />
            <span className="text-slate-400">Completed:</span>
            <strong className="text-emerald-400 font-bold">{currentCompleted}</strong>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-400 inline-block animate-pulse" />
            <span className="text-slate-400">In Progress:</span>
            <strong className="text-yellow-400 font-bold">{currentInProgress}</strong>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" />
            <span className="text-slate-400">Waiting/Delayed:</span>
            <strong className="text-blue-400 font-bold">{currentDelayed}</strong>
          </div>
        </div>

        {/* Overall Completion Percentage Badge */}
        <div className="flex items-center gap-2">
          <span className="text-slate-400">Drydock Completion:</span>
          <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-md">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <strong className="text-amber-400 font-bold text-sm">{overallProg}%</strong>
          </div>
        </div>
      </div>
    </div>
  );
};
