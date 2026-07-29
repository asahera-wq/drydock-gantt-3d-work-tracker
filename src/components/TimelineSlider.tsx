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
    <div className="bg-slate-900 border border-slate-800 rounded px-2 py-1.5 shadow-sm space-y-1 font-sans relative">
      {/* Header Row: 3 Grouped & Aligned Control Sections */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-2 border-b border-slate-800/80 pb-1 text-xs">
        
        {/* SECTION 1: Status & Date Indicators */}
        <div className="flex items-center gap-2">
          <div className={`w-5 h-5 rounded flex items-center justify-center shrink-0 transition-all ${
            isTimelineMode 
              ? 'bg-amber-400 text-slate-950 font-bold shadow-sm' 
              : 'bg-slate-800 text-slate-400 border border-slate-700'
          }`}>
            <Clock className={`w-3 h-3 ${isPlaying ? 'animate-spin' : ''}`} />
          </div>

          <div className="flex items-center gap-1.5 font-mono leading-none">
            <span className="text-[10px] font-semibold text-slate-400 uppercase hidden sm:inline">Schedule:</span>
            <span className="text-amber-400 font-bold">{getDateForDay(currentDay)}</span>
            <span className="text-slate-600">|</span>
            <span className="text-slate-200 font-bold">Day {currentDay}/{totalDays}</span>
            <span className="text-slate-600">|</span>
            <span className="text-cyan-400 font-medium truncate max-w-[120px]">{activePhase.name}</span>
          </div>
        </div>

        {/* SECTION 2: Playback Controls Group */}
        <div className="flex items-center gap-1 self-start lg:self-auto">
          <button
            onClick={handleStepBack}
            className="p-1 rounded bg-slate-950 border border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white transition-all text-xs"
            title="Step Back 1 Day"
          >
            <SkipBack className="w-3 h-3" />
          </button>

          <button
            onClick={handleTogglePlay}
            className={`flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-bold transition-all shadow-sm ${
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
                <span>PLAY SIM</span>
              </>
            )}
          </button>

          <button
            onClick={handleStepForward}
            className="p-1 rounded bg-slate-950 border border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white transition-all text-xs"
            title="Step Forward 1 Day"
          >
            <SkipForward className="w-3 h-3" />
          </button>

          {isTimelineMode && (
            <button
              onClick={handleReset}
              className="flex items-center gap-1 px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-amber-400 hover:bg-slate-800 text-[10px] font-mono font-bold transition-all ml-1"
              title="Reset to Live Database View"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          )}
        </div>

        {/* SECTION 3: Speed Controls & Live Indicators Group */}
        <div className="flex items-center gap-2 self-start lg:self-auto">
          {/* Speed Selector */}
          <div className="flex items-center gap-0.5 bg-slate-950 border border-slate-800 p-0.5 rounded text-[10px] font-mono">
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

          {/* Live Status Indicators */}
          <div className="hidden xl:flex items-center gap-2 font-mono text-[10px] bg-slate-950 border border-slate-800/80 px-2 py-0.5 rounded leading-none">
            <div className="flex items-center gap-1 text-emerald-400" title="Completed Tasks">
              <CheckCircle2 className="w-3 h-3" />
              <span className="font-bold">{currentCompleted}</span>
            </div>
            <div className="flex items-center gap-1 text-yellow-400" title="In Progress Tasks">
              <Clock className="w-3 h-3" />
              <span className="font-bold">{currentInProgress}</span>
            </div>
            <div className="flex items-center gap-1 text-blue-400" title="Delayed / Waiting Tasks">
              <AlertTriangle className="w-3 h-3" />
              <span className="font-bold">{currentDelayed}</span>
            </div>
            <div className="flex items-center gap-1 text-purple-400 border-l border-slate-800 pl-1.5" title="Overall Completion">
              <Sparkles className="w-3 h-3" />
              <span className="font-bold">{overallProg}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Schedule Strip Track & Slider */}
      <div className="space-y-0.5">
        {/* Range Slider & Phase Ribbon */}
        <div className="relative flex flex-col justify-center gap-0.5">
          <input
            type="range"
            min={1}
            max={totalDays}
            value={currentDay}
            onChange={(e) => {
              if (!isTimelineMode) onToggleTimelineMode(true);
              onDayChange(Number(e.target.value));
            }}
            className="w-full h-1.5 bg-slate-950 rounded appearance-none cursor-pointer accent-amber-400 focus:outline-none border border-slate-800"
          />

          {/* Phase Segment Day Ribbon */}
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
        </div>

        {/* Phase Labels Row */}
        <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 leading-none pt-0.5">
          {phases.map((ph) => {
            const isPhaseActive = currentDay >= ph.startDay && currentDay <= ph.endDay;
            return (
              <button
                key={ph.id}
                onClick={() => {
                  if (!isTimelineMode) onToggleTimelineMode(true);
                  onDayChange(ph.startDay);
                }}
                className={`truncate max-w-[120px] text-left transition-colors font-medium ${
                  isPhaseActive
                    ? 'text-amber-400 font-bold underline underline-offset-2'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title={`${ph.name} (Days ${ph.startDay}-${ph.endDay})`}
              >
                {ph.name}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
