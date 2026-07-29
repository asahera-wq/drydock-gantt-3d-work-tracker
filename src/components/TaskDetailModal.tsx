import React, { useState } from 'react';
import { Task } from '../types';
import { 
  X, 
  Flame, 
  Activity, 
  Zap, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  UserCheck, 
  Ruler, 
  HardHat, 
  FileText,
  Save,
  Box
} from 'lucide-react';

interface TaskDetailModalProps {
  task: Task | null;
  onClose: () => void;
  onUpdateTask: (updatedTask: Task) => void;
  onFocus3D: (taskId: string) => void;
}

export const TaskDetailModal: React.FC<TaskDetailModalProps> = ({
  task,
  onClose,
  onUpdateTask,
  onFocus3D,
}) => {
  if (!task) return null;

  const [progress, setProgress] = useState(task.progress);
  const [status, setStatus] = useState<any>(task.status === 'waiting' ? 'delayed' : task.status);
  const [manhoursSpent, setManhoursSpent] = useState(task.manhoursSpent);
  const [permitApproved, setPermitApproved] = useState(task.permitApproved ?? true);

  const handleSave = () => {
    let finalProgress = progress;
    if (status === 'completed') finalProgress = 100;
    else if (status === 'not_started') finalProgress = 0;

    onUpdateTask({
      ...task,
      progress: finalProgress,
      manhoursSpent,
      permitApproved,
      status,
    });
    onClose();
  };

  const ndtInitial = task.ndtThicknessInitialMm || 20.0;
  const ndtMin = task.ndtThicknessMinMm || 14.2;
  const ndtWastagePct = Math.round(((ndtInitial - ndtMin) / ndtInitial) * 100);

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden text-slate-100 animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs font-bold px-2.5 py-1 bg-amber-400/20 text-amber-400 border border-amber-400/30 rounded-md">
              {task.code}
            </span>
            <div>
              <h3 className="font-bold text-base text-slate-100 flex items-center gap-2">
                {task.title}
                {task.isCriticalPath && (
                  <span className="text-[10px] font-mono font-bold bg-amber-400 text-slate-950 px-1.5 py-0.5 rounded flex items-center gap-1">
                    <Zap className="w-3 h-3 fill-slate-950" /> CRITICAL PATH
                  </span>
                )}
              </h3>
              <p className="text-xs text-slate-400 font-medium">Zone: {task.zone} | Trade: {task.trade}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-100 p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* Description */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Scope of Work
            </label>
            <p className="text-sm text-slate-200 leading-relaxed bg-slate-950/60 p-3 rounded-lg border border-slate-800/80">
              {task.description}
            </p>
          </div>

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="bg-slate-950 border border-slate-800 p-3 rounded-lg space-y-1">
              <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
                <HardHat className="w-3.5 h-3.5 text-amber-400" /> Contractor
              </span>
              <p className="font-semibold text-xs text-slate-200 truncate">{task.contractor}</p>
            </div>

            <div className="bg-slate-950 border border-slate-800 p-3 rounded-lg space-y-1">
              <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-cyan-400" /> Manhours
              </span>
              <p className="font-mono text-xs font-bold text-slate-200">
                {manhoursSpent}h / {task.manhoursEst}h
              </p>
            </div>

            <div className="bg-slate-950 border border-slate-800 p-3 rounded-lg space-y-1">
              <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
                <Ruler className="w-3.5 h-3.5 text-emerald-400" /> Duration
              </span>
              <p className="font-mono text-xs font-bold text-slate-200">
                Days {task.startDay} - {task.startDay + task.durationDays - 1} ({task.durationDays} Days)
              </p>
            </div>
          </div>

          {/* NDT Ultrasound Thickness Gauge Section */}
          {task.ndtThicknessInitialMm && (
            <div className="bg-slate-950 border border-cyan-500/30 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
                  <Activity className="w-4 h-4" />
                  NDT Ultrasonic Plate Thickness Audit
                </span>
                <span className="text-xs font-mono text-slate-400 font-bold">
                  Wastage: <strong className="text-rose-400">{ndtWastagePct}%</strong>
                </span>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-400">Nominal Original Plate: <strong>{ndtInitial.toFixed(1)} mm</strong></span>
                  <span className="text-amber-400">Scantling Min Measured: <strong>{ndtMin.toFixed(1)} mm</strong></span>
                </div>
                {/* Visual Gauge Bar */}
                <div className="w-full bg-slate-900 h-3 rounded-full overflow-hidden border border-slate-800 flex">
                  <div
                    className="bg-emerald-500 h-full"
                    style={{ width: `${(ndtMin / ndtInitial) * 100}%` }}
                    title="Remaining Sound Steel Thickness"
                  />
                  <div
                    className="bg-rose-500 h-full"
                    style={{ width: `${((ndtInitial - ndtMin) / ndtInitial) * 100}%` }}
                    title="Corrosion Wastage"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Safety Permit Toggle */}
          {task.safetyPermitRequired && (
            <div className="bg-slate-950 border border-slate-800 p-3.5 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-orange-500/10 border border-orange-500/30 text-orange-400 flex items-center justify-center">
                  <Flame className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-slate-200">Hot Work Safety Authorization</h4>
                  <p className="text-[11px] text-slate-400">Gas testing & fire watch supervisor clearance</p>
                </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={permitApproved}
                  onChange={(e) => setPermitApproved(e.target.checked)}
                  className="w-4 h-4 accent-amber-400 rounded cursor-pointer"
                />
                <span className={`text-xs font-bold font-mono ${permitApproved ? 'text-emerald-400' : 'text-orange-400'}`}>
                  {permitApproved ? 'Approved & Issued' : 'Pending Authorization'}
                </span>
              </label>
            </div>
          )}

          {/* Task Status Selector */}
          <div className="space-y-2 bg-slate-950 border border-slate-800 p-4 rounded-xl">
            <label className="font-bold text-xs text-slate-300 uppercase tracking-wider font-mono block">
              Task Status Classification
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
              {[
                { id: 'not_started', label: 'Not Started', badge: 'bg-red-500/20 text-red-400 border-red-500/50' },
                { id: 'in_progress', label: 'In Progress', badge: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50' },
                { id: 'delayed', label: 'Waiting', badge: 'bg-blue-500/20 text-blue-400 border-blue-500/50' },
                { id: 'completed', label: 'Complete', badge: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50' },
              ].map((st) => (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => {
                    setStatus(st.id);
                    if (st.id === 'completed') setProgress(100);
                    else if (st.id === 'not_started') setProgress(0);
                    else if (progress === 0 || progress === 100) setProgress(50);
                  }}
                  className={`p-2 rounded-lg border text-center transition-all flex flex-col items-center justify-center font-bold ${
                    status === st.id ? `${st.badge} ring-2 ring-amber-400/50` : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span>{st.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Interactive Progress Slider */}
          <div className="space-y-2 bg-slate-950 border border-slate-800 p-4 rounded-xl">
            <div className="flex justify-between items-center text-xs">
              <label className="font-bold text-slate-300 uppercase tracking-wider font-mono">
                Update Completion Progress
              </label>
              <span className="font-mono font-bold text-amber-400 text-base">{progress}%</span>
            </div>

            <input
              type="range"
              min="0"
              max="100"
              value={progress}
              onChange={(e) => setProgress(Number(e.target.value))}
              className="w-full accent-amber-400 cursor-pointer h-2 bg-slate-900 rounded-lg"
            />

            <div className="flex justify-between text-[11px] text-slate-400 font-mono">
              <span>0% (Not Started)</span>
              <span>50% (Mid-Phase)</span>
              <span>100% (Completed & Certified)</span>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-950 px-6 py-4 border-t border-slate-800 flex items-center justify-between">
          <button
            onClick={() => {
              onFocus3D(task.id);
              onClose();
            }}
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs px-3.5 py-2 rounded-lg font-semibold transition-colors border border-slate-700"
          >
            <Box className="w-4 h-4 text-amber-400" />
            <span>Focus in 3D Viewport</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs px-4 py-2 rounded-lg shadow-md transition-all"
            >
              <Save className="w-4 h-4" />
              <span>Save Changes</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
