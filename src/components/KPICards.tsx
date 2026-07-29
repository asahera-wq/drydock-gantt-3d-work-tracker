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
    <div className="space-y-1.5 font-sans">
      {/* 5 Core Metrics Row - Ultra Compact */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-1.5">
        {/* KPI 1: Total Tasks */}
        <div className="bg-slate-900/90 border border-slate-800/90 rounded-lg p-2 shadow-sm hover:border-slate-700 transition-all flex items-center justify-between">
          <div>
            <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
              Total Tasks
            </span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-lg font-black font-mono text-white tracking-tight">
                {total}
              </span>
              <span className="text-[9px] font-mono text-cyan-400 bg-cyan-950/60 border border-cyan-800/40 px-1 py-0.2 rounded">
                100%
              </span>
            </div>
          </div>
          <div className="w-6 h-6 rounded bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0">
            <ListChecks className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* KPI 2: Completed Tasks */}
        <div className="bg-slate-900/90 border border-slate-800/90 rounded-lg p-2 shadow-sm hover:border-slate-700 transition-all flex items-center justify-between">
          <div>
            <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
              Completed
            </span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-lg font-black font-mono text-emerald-400 tracking-tight">
                {completed}
              </span>
              <span className="text-[9px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-1 py-0.2 rounded font-bold">
                {total > 0 ? Math.round((completed / total) * 100) : 0}%
              </span>
            </div>
          </div>
          <div className="w-6 h-6 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* KPI 3: Remaining Tasks */}
        <div className="bg-slate-900/90 border border-slate-800/90 rounded-lg p-2 shadow-sm hover:border-slate-700 transition-all flex items-center justify-between">
          <div>
            <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
              Remaining
            </span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-lg font-black font-mono text-amber-400 tracking-tight">
                {remaining}
              </span>
              <span className="text-[9px] font-mono text-amber-400 bg-amber-950/60 border border-amber-800/40 px-1 py-0.2 rounded">
                {inProgress} Active
              </span>
            </div>
          </div>
          <div className="w-6 h-6 rounded bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
            <Clock className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* KPI 4: Delayed Tasks */}
        <div className="bg-slate-900/90 border border-slate-800/90 rounded-lg p-2 shadow-sm hover:border-slate-700 transition-all flex items-center justify-between">
          <div>
            <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
              Delayed
            </span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className={`text-lg font-black font-mono tracking-tight ${delayed > 0 ? 'text-blue-400' : 'text-slate-400'}`}>
                {delayed}
              </span>
              <span className={`text-[9px] font-mono px-1 py-0.2 rounded border ${
                delayed > 0 
                  ? 'bg-blue-950 text-blue-400 border-blue-800/80 font-bold' 
                  : 'bg-slate-950 text-slate-500 border-slate-800'
              }`}>
                {delayed > 0 ? 'Waiting' : 'On Track'}
              </span>
            </div>
          </div>
          <div className={`w-6 h-6 rounded border flex items-center justify-center shrink-0 ${
            delayed > 0 
              ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' 
              : 'bg-slate-800/50 border-slate-800 text-slate-500'
          }`}>
            <AlertTriangle className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* KPI 5: Overall Progress */}
        <div className="bg-slate-900/90 border border-slate-800/90 rounded-lg p-2 shadow-sm hover:border-slate-700 transition-all col-span-2 sm:col-span-1 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
                Overall Progress
              </span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-black font-mono text-purple-400 tracking-tight">
                {overallProgress}%
              </span>
            </div>
          </div>

          {/* Combined Progress Bar */}
          <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden flex border border-slate-800 mt-1">
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

      {/* KPI 6: Discipline Breakdown - Compact Horizontal Summary */}
      <div className="bg-slate-900/80 border border-slate-800/80 rounded-lg px-2.5 py-1.5 shadow-sm flex items-center gap-3">
        <div className="flex items-center gap-1.5 shrink-0 border-r border-slate-800 pr-2.5">
          <Wrench className="w-3 h-3 text-amber-400" />
          <span className="text-[10px] font-mono font-bold text-slate-300 uppercase tracking-wider whitespace-nowrap">
            Trades ({disciplineBreakdown.length})
          </span>
        </div>

        {/* Compact Horizontal Scrollable Summary Row */}
        <div className="flex items-center gap-2 overflow-x-auto py-0.5 custom-scrollbar flex-1">
          {disciplineBreakdown.map((item) => (
            <div
              key={item.discipline}
              onClick={() => onSelectDiscipline?.(item.discipline)}
              className={`bg-slate-950 border border-slate-800/90 hover:border-amber-400/50 px-2 py-1 rounded-md transition-all flex items-center gap-2 shrink-0 ${
                onSelectDiscipline ? 'cursor-pointer hover:bg-slate-900' : ''
              }`}
            >
              <span className="text-slate-300 text-[10px] font-mono font-bold whitespace-nowrap" title={item.discipline}>
                {item.discipline}
              </span>

              {/* Slim progress bar for trade */}
              <div className="w-10 bg-slate-900 rounded-full h-1 overflow-hidden flex border border-slate-800 shrink-0">
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

              <span className="text-[9px] font-mono font-bold text-amber-400 whitespace-nowrap">
                {item.avgProg}%
              </span>

              <span className="text-[9px] font-mono text-slate-400 whitespace-nowrap">
                ({item.completed}/{item.total})
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
