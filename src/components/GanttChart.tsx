import React, { useState } from 'react';
import { GanttPhase, Task } from '../types';
import { Calendar, Zap, CheckCircle2, AlertTriangle, Clock, ChevronRight } from 'lucide-react';

interface GanttChartProps {
  phases: GanttPhase[];
  tasks: Task[];
  selectedTaskId: string | null;
  onSelectTask: (taskId: string) => void;
  currentDay: number;
  totalDays: number;
}

export const GanttChart: React.FC<GanttChartProps> = ({
  phases,
  tasks,
  selectedTaskId,
  onSelectTask,
  currentDay,
  totalDays,
}) => {
  const [hoveredTask, setHoveredTask] = useState<Task | null>(null);

  // Generate array of days 1..totalDays
  const dayColumns = Array.from({ length: totalDays }, (_, i) => i + 1);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-md flex flex-col">
      {/* Gantt Header */}
      <div className="bg-slate-950 border-b border-slate-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
            <Calendar className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
              Drydock Schedule Gantt Timeline
            </h3>
            <p className="text-[11px] text-slate-400">
              Interactive 28-Day Drydock Maintenance Matrix & Critical Path Analysis
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5 font-mono text-slate-400">
            <span className="w-3 h-3 rounded bg-amber-400 block" /> Critical Path
          </div>
          <div className="flex items-center gap-1.5 font-mono text-slate-400">
            <span className="w-3 h-3 rounded bg-emerald-500 block" /> Completed
          </div>
          <div className="flex items-center gap-1.5 font-mono text-slate-400">
            <span className="w-3 h-3 rounded bg-rose-500 block" /> Delayed
          </div>
        </div>
      </div>

      {/* Gantt Table Container */}
      <div className="overflow-x-auto relative">
        <div className="min-w-[900px]">
          {/* Days Header Row */}
          <div className="flex bg-slate-950/70 border-b border-slate-800 text-[11px] font-mono text-slate-400 font-semibold">
            {/* Task Info Column Header */}
            <div className="w-64 shrink-0 px-3 py-2 border-r border-slate-800 flex items-center justify-between">
              <span>WORK PACKAGE / TASK</span>
              <span>DAYS</span>
            </div>

          {/* Timeline Days Header */}
          <div
            className="flex-1 relative"
            style={{ display: 'grid', gridTemplateColumns: `repeat(${totalDays}, minmax(0, 1fr))` }}
          >
            {dayColumns.map((day) => {
              const isCurrent = day === currentDay;
              return (
                <div
                  key={day}
                  className={`py-2 text-center border-r border-slate-800/50 text-[10px] font-mono ${
                    isCurrent
                      ? 'bg-amber-400/20 text-amber-400 font-bold border-amber-400/40'
                      : day % 7 === 0
                      ? 'bg-slate-900/80 text-slate-300'
                      : ''
                  }`}
                >
                  D{day}
                </div>
              );
            })}
          </div>
          </div>

          {/* Phases & Tasks Rows */}
          <div className="divide-y divide-slate-800/60 relative">
            {/* Vertical Line for Current Day */}
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-amber-400/80 z-20 pointer-events-none shadow-[0_0_8px_rgba(245,158,11,0.8)]"
              style={{
                left: `calc(256px + ${((currentDay - 0.5) / totalDays) * 100}% * (100% - 256px) / 100)`,
              }}
            />

            {phases.map((phase) => {
              const phaseTasks = tasks.filter((t) => t.phaseId === phase.id);
              return (
                <div key={phase.id} className="space-y-0 text-xs">
                  {/* Phase Header Bar */}
                  <div className="bg-slate-950/90 px-3 py-1.5 font-bold text-amber-400 text-[11px] flex items-center gap-1.5 uppercase tracking-wider border-y border-slate-800/80">
                    <ChevronRight className="w-3.5 h-3.5 text-amber-500" />
                    <span>{phase.name}</span>
                    <span className="text-[10px] text-slate-500 font-mono font-normal">
                      (Days {phase.startDay} - {phase.endDay})
                    </span>
                  </div>

                  {/* Task Timeline Rows */}
                  {phaseTasks.map((task) => {
                    const isSelected = task.id === selectedTaskId;

                    // Calculate Gantt bar column placement
                    const startCol = task.startDay;
                    const duration = task.durationDays;

                    let barColor = 'bg-slate-700 border-slate-600 text-slate-200';
                    if (task.status === 'completed') {
                      barColor = 'bg-emerald-600/90 border-emerald-500 text-white';
                    } else if (task.status === 'in_progress') {
                      barColor = 'bg-amber-500 border-amber-400 text-slate-950';
                    } else if (task.status === 'delayed') {
                      barColor = 'bg-rose-600 border-rose-500 text-white';
                    }

                    return (
                      <div
                        key={task.id}
                        onClick={() => onSelectTask(task.id)}
                        onMouseEnter={() => setHoveredTask(task)}
                        onMouseLeave={() => setHoveredTask(null)}
                        className={`flex items-center hover:bg-slate-800/60 transition-colors cursor-pointer group ${
                          isSelected ? 'bg-amber-500/10 font-medium' : ''
                        }`}
                      >
                        {/* Task Code & Title Side Label */}
                        <div className="w-64 shrink-0 px-3 py-2 border-r border-slate-800 flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2 overflow-hidden">
                            {task.isCriticalPath && (
                              <Zap className="w-3.5 h-3.5 text-amber-400 shrink-0" title="Critical Path Task" />
                            )}
                            <span className="font-mono text-[11px] text-slate-400 font-bold shrink-0">
                              {task.code}
                            </span>
                            <span className="truncate text-slate-200 text-xs font-medium group-hover:text-amber-400 transition-colors">
                              {task.title}
                            </span>
                          </div>
                          <span className="font-mono text-[10px] text-slate-500 shrink-0">
                            {task.durationDays}d
                          </span>
                        </div>

                        {/* Gantt Bar Area */}
                        <div className="flex-1 relative h-9 flex items-center px-1">
                          {/* Dynamic Day Grid Background Lines */}
                          <div
                            className="absolute inset-0 pointer-events-none"
                            style={{ display: 'grid', gridTemplateColumns: `repeat(${totalDays}, minmax(0, 1fr))` }}
                          >
                            {dayColumns.map((day) => (
                              <div
                                key={day}
                                className={`border-r border-slate-800/30 ${
                                  day === currentDay ? 'bg-amber-400/5' : ''
                                }`}
                              />
                            ))}
                          </div>

                          {/* Rendered Bar */}
                          <div
                            className={`h-6 rounded-md border shadow-sm px-2 flex items-center justify-between text-[11px] font-mono font-bold transition-all relative overflow-hidden ${barColor} ${
                              task.isCriticalPath ? 'ring-2 ring-amber-400/50 shadow-amber-950/50' : ''
                            } ${isSelected ? 'ring-2 ring-white scale-[1.01]' : ''}`}
                            style={{
                              marginLeft: `${((startCol - 1) / totalDays) * 100}%`,
                              width: `${(duration / totalDays) * 100}%`,
                            }}
                          >
                            {/* Inner Progress Fill */}
                            <div
                              className="absolute top-0 bottom-0 left-0 bg-white/20 pointer-events-none"
                              style={{ width: `${task.progress}%` }}
                            />

                            <span className="truncate relative z-10 text-[10px]">
                              {task.progress}%
                            </span>
                            <span className="text-[10px] opacity-80 relative z-10 hidden md:inline">
                              {task.trade.split(' ')[0]}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
