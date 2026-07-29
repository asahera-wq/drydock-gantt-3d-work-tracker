import React from 'react';
import { Task } from '../types';
import { 
  Zap, 
  Flame, 
  Activity, 
  Box, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  ShieldAlert
} from 'lucide-react';

interface TaskListProps {
  tasks: Task[];
  selectedTaskId: string | null;
  onSelectTask: (taskId: string) => void;
  onOpenTaskDetails: (task: Task) => void;
  onUpdateTask?: (updatedTask: Task) => void;
}

export const TaskList: React.FC<TaskListProps> = ({
  tasks,
  selectedTaskId,
  onSelectTask,
  onOpenTaskDetails,
  onUpdateTask,
}) => {
  if (tasks.length === 0) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center space-y-3">
        <div className="w-12 h-12 rounded-full bg-slate-800 text-slate-500 mx-auto flex items-center justify-center">
          <Box className="w-6 h-6" />
        </div>
        <h4 className="font-bold text-slate-200 text-sm">No Work Packages Found</h4>
        <p className="text-xs text-slate-400 max-w-md mx-auto">
          No drydock tasks match your current search query or filter selection. Try adjusting or clearing your filters.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg flex flex-col">
      {/* Table Header */}
      <div className="bg-slate-950 border-b border-slate-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-bold text-sm text-slate-100 uppercase font-mono tracking-wider">
            Work Package Audit Ledger
          </span>
          <span className="text-xs text-slate-400 font-mono">({tasks.length} Items)</span>
        </div>
        <span className="text-[11px] text-slate-500 font-mono">
          Click any row to focus 3D Viewport
        </span>
      </div>

      {/* Task List Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-950/60 border-b border-slate-800 text-[11px] font-mono text-slate-400 uppercase">
              <th className="py-2.5 px-3">WO Code</th>
              <th className="py-2.5 px-3">Work Package Title</th>
              <th className="py-2.5 px-3">Zone</th>
              <th className="py-2.5 px-3">Trade / Discipline</th>
              <th className="py-2.5 px-3">Contractor</th>
              <th className="py-2.5 px-3">Progress</th>
              <th className="py-2.5 px-3">Status</th>
              <th className="py-2.5 px-3 text-right">3D / Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {tasks.map((task) => {
              const isSelected = task.id === selectedTaskId;

              let badgeStyle = "bg-red-500/20 text-red-400 border-red-500/40";
              let statusLabel = "Not Started";
              let statusIcon = <Clock className="w-3 h-3" />;

              if (task.status === 'completed') {
                badgeStyle = "bg-emerald-500/20 text-emerald-400 border-emerald-500/40";
                statusLabel = "Complete";
                statusIcon = <CheckCircle2 className="w-3 h-3" />;
              } else if (task.status === 'in_progress') {
                badgeStyle = "bg-yellow-500/20 text-yellow-400 border-yellow-500/40";
                statusLabel = "In Progress";
                statusIcon = <Clock className="w-3 h-3 animate-spin" />;
              } else if (task.status === 'delayed' || task.status === 'waiting') {
                badgeStyle = "bg-blue-500/20 text-blue-400 border-blue-500/40";
                statusLabel = "Waiting";
                statusIcon = <AlertTriangle className="w-3 h-3" />;
              } else {
                badgeStyle = "bg-red-500/20 text-red-400 border-red-500/40";
                statusLabel = "Not Started";
                statusIcon = <Clock className="w-3 h-3" />;
              }

              return (
                <tr
                  key={task.id}
                  onClick={() => onSelectTask(task.id)}
                  className={`hover:bg-slate-800/50 transition-colors cursor-pointer ${
                    isSelected ? 'bg-amber-500/10 border-l-4 border-l-amber-400' : ''
                  }`}
                >
                  {/* Code */}
                  <td className="py-3 px-3 font-mono font-bold text-slate-200">
                    <div className="flex items-center gap-1.5">
                      {task.isCriticalPath && (
                        <Zap className="w-3.5 h-3.5 text-amber-400 shrink-0" title="Critical Path Task" />
                      )}
                      <span>{task.code}</span>
                    </div>
                  </td>

                  {/* Title & Description */}
                  <td className="py-3 px-3 max-w-xs">
                    <div className="font-bold text-slate-100 group-hover:text-amber-400">
                      {task.title}
                    </div>
                    <div className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                      {task.description}
                    </div>

                    {/* Tags */}
                    <div className="flex items-center gap-2 mt-1 font-mono text-[10px]">
                      {task.safetyPermitRequired && (
                        <span
                          className={`flex items-center gap-0.5 ${
                            task.permitApproved ? 'text-emerald-400' : 'text-orange-400 font-bold'
                          }`}
                        >
                          <Flame className="w-3 h-3" />
                          {task.permitApproved ? 'Hot Work Permit OK' : 'Permit Pending'}
                        </span>
                      )}
                      {task.ndtThicknessInitialMm && (
                        <span className="flex items-center gap-0.5 text-cyan-400">
                          <Activity className="w-3 h-3" />
                          NDT: {task.ndtThicknessMinMm}mm / {task.ndtThicknessInitialMm}mm
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Zone */}
                  <td className="py-3 px-3 font-medium text-slate-300">
                    {task.zone}
                  </td>

                  {/* Trade */}
                  <td className="py-3 px-3">
                    <span className="font-semibold text-slate-300 bg-slate-950 border border-slate-800 px-2 py-0.5 rounded text-[11px]">
                      {task.trade}
                    </span>
                  </td>

                  {/* Contractor */}
                  <td className="py-3 px-3 text-slate-300 font-medium">
                    {task.contractor}
                  </td>

                  {/* Progress */}
                  <td className="py-3 px-3 w-32">
                    <div className="space-y-1">
                      <div className="flex justify-between font-mono text-[10px] text-slate-400 font-bold">
                        <span>{task.progress}%</span>
                        <span>{task.manhoursSpent}h / {task.manhoursEst}h</span>
                      </div>
                      <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            task.status === 'completed'
                              ? 'bg-emerald-500'
                              : task.status === 'delayed'
                              ? 'bg-rose-500'
                              : 'bg-amber-400'
                          }`}
                          style={{ width: `${task.progress}%` }}
                        />
                      </div>
                    </div>
                  </td>

                  {/* Status Badge & Select */}
                  <td className="py-3 px-3" onClick={(e) => e.stopPropagation()}>
                    {onUpdateTask ? (
                      <select
                        value={task.status === 'waiting' ? 'delayed' : task.status}
                        onChange={(e) => {
                          const newStatus = e.target.value as any;
                          let newProg = task.progress;
                          if (newStatus === 'completed') newProg = 100;
                          else if (newStatus === 'not_started') newProg = 0;
                          else if (newProg === 0 || newProg === 100) newProg = 50;

                          onUpdateTask({
                            ...task,
                            status: newStatus,
                            progress: newProg,
                          });
                        }}
                        className={`font-mono font-bold text-[10px] px-2 py-1 rounded-full border bg-slate-950 focus:outline-none cursor-pointer ${badgeStyle}`}
                      >
                        <option value="not_started" className="bg-slate-900 text-red-400">🔴 Not Started</option>
                        <option value="in_progress" className="bg-slate-900 text-yellow-400">🟡 In Progress</option>
                        <option value="delayed" className="bg-slate-900 text-blue-400">🔵 Waiting</option>
                        <option value="completed" className="bg-slate-900 text-emerald-400">🟢 Complete</option>
                      </select>
                    ) : (
                      <span className={`inline-flex items-center gap-1 font-mono font-bold text-[10px] px-2.5 py-1 rounded-full border ${badgeStyle}`}>
                        {statusIcon} {statusLabel}
                      </span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="py-3 px-3 text-right">
                    <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => onSelectTask(task.id)}
                        className="p-1.5 bg-slate-800 hover:bg-amber-400 hover:text-slate-950 text-slate-300 rounded-md transition-colors"
                        title="Focus in 3D Viewport"
                      >
                        <Box className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onOpenTaskDetails(task)}
                        className="px-2.5 py-1 bg-amber-500/10 hover:bg-amber-400 text-amber-400 hover:text-slate-950 border border-amber-500/30 font-bold rounded-md transition-colors flex items-center gap-1 text-[11px]"
                      >
                        <span>Details</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
