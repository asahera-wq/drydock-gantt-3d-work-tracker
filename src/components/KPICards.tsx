import React from 'react';
import { Task } from '../types';
import { 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  TrendingUp, 
  ListChecks, 
  Wrench,
  Layers,
  Sparkles,
  PieChart
} from 'lucide-react';

interface KPICardsProps {
  tasks: Task[];
  onSelectDiscipline?: (discipline: string) => void;
}

export const KPICards: React.FC<KPICardsProps> = ({ tasks, onSelectDiscipline }) => {
  const total = tasks.length;
  const completed = tasks.filter((t) => t.status === 'completed').length;
  const remaining = total - completed;
  const inProgress = tasks.filter((t) => t.status === 'in_progress').length;
  const delayed = tasks.filter((t) => t.status === 'delayed' || t.status === 'waiting').length;
  const notStarted = tasks.filter((t) => t.status === 'not_started').length;

  // Calculate overall average progress %
  const totalProgressSum = tasks.reduce((sum, t) => sum + (t.progress ?? (t.status === 'completed' ? 100 : t.status === 'in_progress' ? 50 : 0)), 0);
  const overallProgress = total > 0 ? Math.round(totalProgressSum / total) : 0;

  // Discipline breakdown map
  const disciplineBreakdown = React.useMemo(() => {
    const map: Record<string, { total: number; completed: number; inProgress: number; delayed: number; notStarted: number; sumProg: number }> = {};
    
    tasks.forEach((t) => {
      const disc = t.discipline || t.trade || 'General';
      if (!map[disc]) {
        map[disc] = { total: 0, completed: 0, inProgress: 0, delayed: 0, notStarted: 0, sumProg: 0 };
      }
      map[disc].total += 1;
      const prog = t.progress ?? (t.status === 'completed' ? 100 : t.status === 'in_progress' ? 50 : 0);
      map[disc].sumProg += prog;

      if (t.status === 'completed') map[disc].completed += 1;
      else if (t.status === 'in_progress') map[disc].inProgress += 1;
      else if (t.status === 'delayed' || t.status === 'waiting') map[disc].delayed += 1;
      else map[disc].notStarted += 1;
    });

    return Object.entries(map).map(([discipline, stats]) => {
      const avgProg = stats.total > 0 ? Math.round(stats.sumProg / stats.total) : 0;
      return {
        discipline,
        ...stats,
        avgProg,
      };
    }).sort((a, b) => b.total - a.total);
  }, [tasks]);

  return (
    <div className="space-y-1 font-sans">
      {/* 5 Core Metrics Row - Compact Industrial Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-1.5">
        {/* KPI 1: Total Tasks */}
        <div className="bg-slate-900 border border-slate-800 rounded px-2 py-1 shadow-sm hover:border-slate-700 transition-all flex items-center justify-between h-[38px]">
          <div className="flex items-center gap-1.5 min-w-0">
            <div className="w-5 h-5 rounded bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0">
              <ListChecks className="w-3 h-3" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-mono font-medium text-slate-400 uppercase tracking-wider block truncate leading-none">
                Total Scope
              </span>
              <span className="text-sm font-mono font-bold text-white leading-tight">
                {total} <span className="text-[10px] font-normal text-slate-400">Tasks</span>
              </span>
            </div>
          </div>
          <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/60 border border-cyan-800/40 px-1 py-0.5 rounded font-medium shrink-0">
            100%
          </span>
        </div>

        {/* KPI 2: Completed Tasks */}
        <div className="bg-slate-900 border border-slate-800 rounded px-2 py-1 shadow-sm hover:border-slate-700 transition-all flex items-center justify-between h-[38px]">
          <div className="flex items-center gap-1.5 min-w-0">
            <div className="w-5 h-5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-3 h-3" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-mono font-medium text-slate-400 uppercase tracking-wider block truncate leading-none">
                Completed
              </span>
              <span className="text-sm font-mono font-bold text-emerald-400 leading-tight">
                {completed} <span className="text-[10px] font-normal text-slate-400">Tasks</span>
              </span>
            </div>
          </div>
          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-1 py-0.5 rounded font-medium shrink-0">
            {total > 0 ? Math.round((completed / total) * 100) : 0}%
          </span>
        </div>

        {/* KPI 3: Remaining Tasks */}
        <div className="bg-slate-900 border border-slate-800 rounded px-2 py-1 shadow-sm hover:border-slate-700 transition-all flex items-center justify-between h-[38px]">
          <div className="flex items-center gap-1.5 min-w-0">
            <div className="w-5 h-5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
              <Clock className="w-3 h-3" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-mono font-medium text-slate-400 uppercase tracking-wider block truncate leading-none">
                Remaining
              </span>
              <span className="text-sm font-mono font-bold text-amber-400 leading-tight">
                {remaining} <span className="text-[10px] font-normal text-slate-400">Tasks</span>
              </span>
            </div>
          </div>
          <span className="text-[10px] font-mono text-amber-400 bg-amber-950/60 border border-amber-800/40 px-1 py-0.5 rounded font-medium shrink-0">
            {inProgress} Active
          </span>
        </div>

        {/* KPI 4: Delayed Tasks */}
        <div className="bg-slate-900 border border-slate-800 rounded px-2 py-1 shadow-sm hover:border-slate-700 transition-all flex items-center justify-between h-[38px]">
          <div className="flex items-center gap-1.5 min-w-0">
            <div className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 ${
              delayed > 0 
                ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' 
                : 'bg-slate-800/50 border-slate-800 text-slate-500'
            }`}>
              <AlertTriangle className="w-3 h-3" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-mono font-medium text-slate-400 uppercase tracking-wider block truncate leading-none">
                Delayed
              </span>
              <span className={`text-sm font-mono font-bold leading-tight ${delayed > 0 ? 'text-blue-400' : 'text-slate-400'}`}>
                {delayed} <span className="text-[10px] font-normal text-slate-400">Tasks</span>
              </span>
            </div>
          </div>
          <span className={`text-[10px] font-mono px-1 py-0.5 rounded border font-medium shrink-0 ${
            delayed > 0 
              ? 'bg-blue-950 text-blue-400 border-blue-800/80' 
              : 'bg-slate-950 text-slate-500 border-slate-800'
          }`}>
            {delayed > 0 ? 'Delayed' : 'On Track'}
          </span>
        </div>

        {/* KPI 5: Overall Progress */}
        <div className="bg-slate-900 border border-slate-800 rounded px-2 py-1 shadow-sm hover:border-slate-700 transition-all col-span-2 sm:col-span-1 flex flex-col justify-center gap-1 h-[38px]">
          <div className="flex items-center justify-between gap-1 leading-none">
            <span className="text-[10px] font-mono font-medium text-slate-400 uppercase tracking-wider truncate">
              Overall Progress
            </span>
            <span className="text-xs font-mono font-bold text-purple-400">
              {overallProgress}%
            </span>
          </div>

          {/* Combined Slim Progress Bar */}
          <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden flex border border-slate-800">
            <div
              className="bg-emerald-500 h-full transition-all duration-500"
              style={{ width: `${(completed / total) * 100}%` }}
              title={`Completed: ${completed}`}
            />
            <div
              className="bg-yellow-400 h-full transition-all duration-500"
              style={{ width: `${(inProgress / total) * 100}%` }}
              title={`In Progress: ${inProgress}`}
            />
            <div
              className="bg-blue-500 h-full transition-all duration-500"
              style={{ width: `${(delayed / total) * 100}%` }}
              title={`Delayed: ${delayed}`}
            />
            <div
              className="bg-red-500/40 h-full transition-all duration-500"
              style={{ width: `${(notStarted / total) * 100}%` }}
              title={`Not Started: ${notStarted}`}
            />
          </div>
        </div>
      </div>

      {/* KPI 6: Discipline Breakdown - Dense Responsive Grid with Equal Height 68px Tiles */}
      <div className="bg-slate-900/90 border border-slate-800 rounded px-2 py-1.5 shadow-sm space-y-1">
        <div className="flex items-center justify-between leading-none">
          <div className="flex items-center gap-1.5">
            <Wrench className="w-3 h-3 text-amber-400" />
            <h3 className="text-xs font-mono font-semibold text-slate-300 uppercase tracking-wider">
              Trade & Discipline Status
            </h3>
          </div>
          <span className="text-[10px] font-mono text-slate-400 bg-slate-950 border border-slate-800 px-1.5 py-0.2 rounded font-medium">
            {disciplineBreakdown.length} Trades Active
          </span>
        </div>

        {/* Evenly Aligned Grid of ~68px Tiles */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-1.5">
          {disciplineBreakdown.map((item) => (
            <div
              key={item.discipline}
              onClick={() => onSelectDiscipline?.(item.discipline)}
              className={`bg-slate-950 border border-slate-800/90 hover:border-amber-400/50 p-1.5 rounded transition-all flex flex-col justify-between h-[66px] ${
                onSelectDiscipline ? 'cursor-pointer hover:bg-slate-900' : ''
              }`}
            >
              <div className="flex items-center justify-between gap-1 leading-none">
                <span className="text-xs font-bold text-slate-200 truncate font-mono" title={item.discipline}>
                  {item.discipline}
                </span>
                <span className="text-xs font-mono font-bold text-amber-400 shrink-0">
                  {item.avgProg}%
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden flex border border-slate-800 shrink-0">
                <div
                  className="bg-emerald-500 h-full transition-all duration-300"
                  style={{ width: `${(item.completed / item.total) * 100}%` }}
                />
                <div
                  className="bg-yellow-400 h-full transition-all duration-300"
                  style={{ width: `${(item.inProgress / item.total) * 100}%` }}
                />
                <div
                  className="bg-blue-500 h-full transition-all duration-300"
                  style={{ width: `${(item.delayed / item.total) * 100}%` }}
                />
              </div>

              {/* Counts Breakdown */}
              <div className="flex items-center justify-between text-[10px] font-mono leading-none">
                <span className="text-emerald-400 font-medium">{item.completed}/{item.total} Done</span>
                <span className="text-slate-500">{item.total - item.completed} Left</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
