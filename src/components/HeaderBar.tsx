import React from 'react';
import { Anchor, Calendar, ShieldCheck, Thermometer, Wind, RefreshCw, Plus, Layers } from 'lucide-react';
import { DrydockBay } from '../types';

interface HeaderBarProps {
  bays: DrydockBay[];
  currentBayId: string;
  onSelectBay: (bayId: string) => void;
  onOpenAddTask: () => void;
  onResetView: () => void;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  bays,
  currentBayId,
  onSelectBay,
  onOpenAddTask,
  onResetView,
}) => {
  const activeBay = bays.find((b) => b.id === currentBayId) || bays[0];
  const daysElapsedPct = Math.round((activeBay.currentDay / activeBay.totalDays) * 100);

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-slate-100 px-3 py-1.5 shadow-md flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-2">
      {/* Brand & Bay Switcher */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-slate-950 font-black shadow-sm border border-amber-400/40 shrink-0">
            <Anchor className="w-4 h-4 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-sm tracking-tight text-white flex items-center gap-1.5">
                DRYDOCK <span className="text-amber-400 font-mono text-[10px] uppercase px-1 py-0.2 rounded bg-amber-400/10 border border-amber-400/30">Gantt-3D v4.8</span>
              </h1>
            </div>
          </div>
        </div>

        <div className="h-5 w-px bg-slate-800 hidden sm:block" />

        {/* Bay Dropdown Selector */}
        <div className="relative">
          <select
            value={currentBayId}
            onChange={(e) => onSelectBay(e.target.value)}
            className="bg-slate-950 border border-slate-700 hover:border-amber-500/50 text-slate-200 text-xs rounded px-2 py-1 font-semibold focus:outline-none focus:ring-1 focus:ring-amber-500/40 cursor-pointer"
          >
            {bays.map((bay) => (
              <option key={bay.id} value={bay.id}>
                {bay.name} - {bay.vesselName}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Vessel Live Timeline Banner */}
      <div className="bg-slate-950/80 border border-slate-800 rounded px-2.5 py-1 flex items-center gap-3 text-xs">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-bold text-slate-200">{activeBay.vesselName}</span>
          <span className="text-slate-500 text-[11px]">({activeBay.vesselType})</span>
        </div>

        <div className="hidden sm:flex items-center gap-2 border-l border-slate-800 pl-2.5">
          <div className="flex items-center gap-1 text-slate-400 text-[11px]">
            <Calendar className="w-3 h-3 text-amber-400" />
            <span>Day <strong className="text-amber-400">{activeBay.currentDay}</strong> of {activeBay.totalDays}</span>
          </div>
          <div className="w-16 bg-slate-800 rounded-full h-1 overflow-hidden">
            <div
              className="bg-amber-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${daysElapsedPct}%` }}
            />
          </div>
          <span className="font-mono text-[10px] text-amber-400 font-bold">{daysElapsedPct}%</span>
        </div>
      </div>

      {/* Telemetry & Action Buttons */}
      <div className="flex items-center gap-2">
        {/* Environment Telemetry */}
        <div className="hidden xl:flex items-center gap-2 bg-slate-950/60 border border-slate-800/80 rounded px-2 py-1 text-[10px] text-slate-400">
          <div className="flex items-center gap-1" title="Ambient Dock Temperature">
            <Thermometer className="w-3 h-3 text-amber-400" />
            <span>22°C</span>
          </div>
          <div className="flex items-center gap-1" title="Wind Velocity">
            <Wind className="w-3 h-3 text-cyan-400" />
            <span>11 kts</span>
          </div>
          <div className="flex items-center gap-1 text-emerald-400" title="Hot Work Safety Clearances">
            <ShieldCheck className="w-3 h-3" />
            <span>Safety OK</span>
          </div>
        </div>

        {/* 3D Viewport Reset Button */}
        <button
          onClick={onResetView}
          className="flex items-center gap-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs px-2 py-1 rounded border border-slate-700 font-medium transition-colors"
          title="Reset 3D Viewport Camera"
        >
          <RefreshCw className="w-3 h-3 text-slate-400" />
          <span className="hidden sm:inline">Reset Cam</span>
        </button>

        {/* Create Task Button */}
        <button
          onClick={onOpenAddTask}
          className="flex items-center gap-1 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs px-2.5 py-1 rounded shadow-sm transition-all border border-amber-300/30 cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>New Work Order</span>
        </button>
      </div>
    </header>
  );
};
