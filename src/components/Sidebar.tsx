import React from 'react';
import { 
  Box, 
  BarChart3, 
  ShieldAlert, 
  Activity, 
  Flame, 
  Users, 
  Ship, 
  Ruler, 
  Compass, 
  CheckCircle2, 
  Clock, 
  AlertTriangle 
} from 'lucide-react';
import { DrydockBay, Task } from '../types';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  activeBay: DrydockBay;
  tasks: Task[];
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  activeBay,
  tasks,
}) => {
  const completedCount = tasks.filter((t) => t.status === 'completed').length;
  const inProgressCount = tasks.filter((t) => t.status === 'in_progress').length;
  const delayedCount = tasks.filter((t) => t.status === 'delayed').length;

  const navItems = [
    { id: 'tracker', label: '3D Work Tracker', icon: Box, badge: tasks.length },
    { id: 'gantt', label: 'Gantt Schedule', icon: BarChart3 },
    { id: 'ndt', label: 'NDT Ultrasound & Steel', icon: Activity },
    { id: 'safety', label: 'Hot Work Permits', icon: Flame, alert: true },
    { id: 'resources', label: 'Contractors & Labor', icon: Users },
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 text-slate-300 flex flex-col justify-between shrink-0 h-full overflow-y-auto">
      {/* Upper Navigation section */}
      <div className="p-3 space-y-4">
        {/* Module Title */}
        <div className="px-2 pt-1 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
          Navigation Modules
        </div>

        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-amber-400 text-slate-950 shadow-md font-bold'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/80'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-slate-950' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-full ${
                      isActive ? 'bg-slate-950 text-amber-400' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
                {item.alert && !isActive && (
                  <span className="w-2 h-2 rounded-full bg-orange-500 animate-ping" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Vessel Specifications Summary Card */}
        <div className="bg-slate-950/70 border border-slate-800 rounded-lg p-3 space-y-2.5">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
            <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <Ship className="w-3.5 h-3.5" />
              Vessel Specs
            </span>
            <span className="text-[10px] font-mono text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded">
              {activeBay.id}
            </span>
          </div>

          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between items-center text-slate-400">
              <span className="flex items-center gap-1">
                <Ruler className="w-3 h-3 text-slate-500" /> Length (LOA)
              </span>
              <span className="font-mono text-slate-200 font-medium">{activeBay.vesselLengthMeters}m</span>
            </div>
            <div className="flex justify-between items-center text-slate-400">
              <span className="flex items-center gap-1">
                <Compass className="w-3 h-3 text-slate-500" /> Beam / Draft
              </span>
              <span className="font-mono text-slate-200 font-medium">{activeBay.vesselBeamMeters}m / {activeBay.vesselDraftMeters}m</span>
            </div>
            <div className="flex justify-between items-center text-slate-400">
              <span>Max Displacement</span>
              <span className="font-mono text-slate-200 font-medium">{(activeBay.maxDwtTons / 1000).toFixed(0)}k DWT</span>
            </div>
          </div>
        </div>

        {/* Task Health Breakdown Widget */}
        <div className="bg-slate-950/50 border border-slate-800/80 rounded-lg p-3 space-y-2">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Work Order Health
          </div>

          <div className="space-y-1.5 text-xs">
            <div className="flex items-center justify-between text-emerald-400">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" /> Completed
              </span>
              <span className="font-mono font-bold">{completedCount}</span>
            </div>
            <div className="flex items-center justify-between text-amber-400">
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" /> In Progress
              </span>
              <span className="font-mono font-bold">{inProgressCount}</span>
            </div>
            <div className="flex items-center justify-between text-rose-400">
              <span className="flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" /> Delayed / Blocked
              </span>
              <span className="font-mono font-bold">{delayedCount}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer System info */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950/40 text-[11px] text-slate-500 flex items-center justify-between">
        <span className="font-mono">Drydock OS v4.8</span>
        <span className="flex items-center gap-1 text-emerald-400">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Live WebGL
        </span>
      </div>
    </aside>
  );
};
