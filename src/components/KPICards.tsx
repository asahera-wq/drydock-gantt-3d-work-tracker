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
    <div className="space-y-3 font-sans">
      {/* 5 Core Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {/* KPI 1: Total Tasks */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 shadow-sm hover:border-slate-700 transition-all group">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
                Total Tasks
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-black font-mono text-white tracking-tight">
                  {total}
                </span>
                <span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-950 border border-slate-800 px-1.5 py-0.5 rounded">
                  Database Total
                </span>
              </div>
            </div>
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0">
              <ListChecks className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono text-slate-400">
            <span>{notStarted} Not Started</span>
            <span className="text-cyan-400 font-bold">100% Scope</span>
          </div>
        </div>

        {/* KPI 2: Completed Tasks */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 shadow-sm hover:border-slate-700 transition-all group">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
                Completed Tasks
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-black font-mono text-emerald-400 tracking-tight">
                  {completed}
                </span>
                <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-800/50 px-1.5 py-0.5 rounded">
                  {total > 0 ? Math.round((completed / total) * 100) : 0}%
                </span>
              </div>
            </div>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono text-slate-400">
            <span>Signed Off</span>
            <span className="text-emerald-400 font-bold">{completed} / {total} Done</span>
          </div>
        </div>

        {/* KPI 3: Remaining Tasks */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 shadow-sm hover:border-slate-700 transition-all group">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
                Remaining Tasks
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-black font-mono text-amber-400 tracking-tight">
                  {remaining}
                </span>
                <span className="text-[10px] font-mono font-bold text-amber-400 bg-amber-950/80 border border-amber-800/50 px-1.5 py-0.5 rounded">
                  {inProgress} Active
                </span>
              </div>
            </div>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono text-slate-400">
            <span>In Pipeline</span>
            <span className="text-amber-400 font-bold">{total > 0 ? Math.round((remaining / total) * 100) : 0}% Left</span>
          </div>
        </div>

        {/* KPI 4: Delayed Tasks */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 shadow-sm hover:border-slate-700 transition-all group">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
                Delayed Tasks
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className={`text-2xl font-black font-mono tracking-tight ${delayed > 0 ? 'text-blue-400' : 'text-slate-400'}`}>
                  {delayed}
                </span>
                <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border ${
                  delayed > 0 
                    ? 'bg-blue-950 text-blue-400 border-blue-800/80' 
                    : 'bg-slate-950 text-slate-500 border-slate-800'
                }`}>
                  {delayed > 0 ? 'Waiting' : 'On Track'}
                </span>
              </div>
            </div>
            <div className={`w-8 h-8 rounded-lg border flex items-center justify-center shrink-0 ${
              delayed > 0 
                ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' 
                : 'bg-slate-800/50 border-slate-800 text-slate-500'
            }`}>
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono text-slate-400">
            <span>Blocked / Delayed</span>
            <span className={delayed > 0 ? 'text-blue-400 font-bold' : 'text-slate-500'}>
              {delayed > 0 ? 'Needs Attention' : '0 Bottlenecks'}
            </span>
          </div>
        </div>

        {/* KPI 5: Overall Progress */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 shadow-sm hover:border-slate-700 transition-all col-span-2 sm:col-span-1 group">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
                Overall Progress
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-black font-mono text-purple-400 tracking-tight">
                  {overallProgress}%
                </span>
                <span className="text-[10px] font-mono font-bold text-purple-400 bg-purple-950/80 border border-purple-800/50 px-1.5 py-0.5 rounded">
                  Average
                </span>
              </div>
            </div>
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>

          {/* Combined Progress Bar */}
          <div className="mt-2.5 space-y-1">
            <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden flex border border-slate-800">
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
      </div>

      {/* KPI 6: Discipline Breakdown */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 shadow-sm">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-2">
            <Wrench className="w-4 h-4 text-amber-400" />
            <h3 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider">
              Discipline Breakdown
            </h3>
            <span className="text-[10px] font-mono text-slate-400 bg-slate-950 border border-slate-800 px-2 py-0.5 rounded">
              {disciplineBreakdown.length} Active Trades
            </span>
          </div>
          <span className="text-[10px] font-mono text-slate-500">
            Real-time Database Sync
          </span>
        </div>

        {/* Responsive Grid of Discipline Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
          {disciplineBreakdown.map((item) => (
            <div
              key={item.discipline}
              onClick={() => onSelectDiscipline?.(item.discipline)}
              className={`bg-slate-950 border border-slate-800/90 hover:border-amber-400/50 p-2.5 rounded-lg transition-all ${
                onSelectDiscipline ? 'cursor-pointer hover:bg-slate-900/80' : ''
              }`}
            >
              <div className="flex items-center justify-between text-xs font-semibold mb-1">
                <span className="text-slate-300 truncate font-mono text-[11px] font-bold" title={item.discipline}>
                  {item.discipline}
                </span>
                <span className="text-[10px] font-mono font-bold text-amber-400">
                  {item.avgProg}%
                </span>
              </div>

              {/* Progress Bar for this discipline */}
              <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden flex border border-slate-800 mb-1.5">
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
              <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                <span className="text-emerald-400 font-bold">{item.completed}/{item.total} Done</span>
                <span className="text-slate-500">{item.total - item.completed} Left</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
