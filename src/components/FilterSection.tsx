import React from 'react';
import { 
  Search, 
  Eye, 
  Zap, 
  Layers, 
  Sun, 
  Flame, 
  X,
  SlidersHorizontal,
  Compass,
  Briefcase,
  Percent,
  CheckCircle2,
  Clock,
  AlertTriangle,
  MapPin,
  RotateCcw
} from 'lucide-react';
import { FilterState, TradeCategory, VesselZone, TaskStatus, ViewportMode, VesselComponentId } from '../types';

interface FilterSectionProps {
  filters: FilterState;
  onFilterChange: (newFilters: FilterState) => void;
  viewportMode: ViewportMode;
  onViewportModeChange: (mode: ViewportMode) => void;
  totalResults: number;
}

export const FilterSection: React.FC<FilterSectionProps> = ({
  filters,
  onFilterChange,
  viewportMode,
  onViewportModeChange,
  totalResults,
}) => {
  const tradeOptions: { value: string; label: string }[] = [
    { value: 'ALL', label: 'All Disciplines / Trades' },
    { value: 'Hull & Steelwork', label: 'Hull & Steelwork' },
    { value: 'Blasting & Coating', label: 'Blasting & Coating' },
    { value: 'Piping & Valves', label: 'Piping & Valves' },
    { value: 'Propulsion & Steering', label: 'Propulsion & Steering' },
    { value: 'Electrical & Automation', label: 'Electrical & Automation' },
    { value: 'Docking & Rigging', label: 'Docking & Rigging' },
  ];

  const workPackageOptions: { value: string; label: string }[] = [
    { value: 'ALL', label: 'All Work Packages' },
    { value: 'WP-01: Hull & Structural', label: 'WP-01: Hull & Structural' },
    { value: 'WP-02: Surface Prep & Coating', label: 'WP-02: Surface Prep & Coating' },
    { value: 'WP-03: Propulsion & Steering', label: 'WP-03: Propulsion & Steering' },
    { value: 'WP-04: Piping & Valves', label: 'WP-04: Piping & Valves' },
    { value: 'WP-05: Electrical & Automation', label: 'WP-05: Electrical & Automation' },
    { value: 'WP-06: Outfitting & Safety', label: 'WP-06: Outfitting & Safety' },
  ];

  const shipPartOptions: { value: VesselComponentId | 'ALL'; label: string }[] = [
    { value: 'ALL', label: 'All Ship Components' },
    { value: 'hull', label: 'Hull & Outer Shell' },
    { value: 'bow', label: 'Bow & Bulbous' },
    { value: 'stern', label: 'Stern & Transom' },
    { value: 'bridge', label: 'Navigation Bridge' },
    { value: 'accommodation_block', label: 'Superstructure' },
    { value: 'funnel', label: 'Exhaust Funnel' },
    { value: 'masts', label: 'Radar Masts' },
    { value: 'rudder', label: 'Main Rudder Assembly' },
    { value: 'propeller', label: 'Propulsion Propeller' },
    { value: 'bow_thruster_housing', label: 'Bow Thruster Tunnel' },
    { value: 'cargo_deck', label: 'Main Cargo Deck' },
    { value: 'hatch_covers', label: 'Hatch Covers' },
    { value: 'sea_chest', label: 'Sea Chests & Overboard' },
    { value: 'ballast_tank_areas', label: 'Ballast Tanks' },
  ];

  const zoneOptions: (VesselZone | 'ALL')[] = [
    'ALL',
    'Bow & Bulbous',
    'Midship Port',
    'Midship Starboard',
    'Stern & Rudder',
    'Engine Room',
    'Cargo Holds',
    'Keel & Sea Chests',
  ];

  const statusOptions: { value: TaskStatus | 'ALL'; label: string; icon: string }[] = [
    { value: 'ALL', label: 'All Statuses', icon: '⚪' },
    { value: 'not_started', label: '🔴 Not Started', icon: '🔴' },
    { value: 'in_progress', label: '🟡 In Progress', icon: '🟡' },
    { value: 'delayed', label: '🔵 Waiting / Delayed', icon: '🔵' },
    { value: 'completed', label: '🟢 Complete', icon: '🟢' },
  ];

  const handleClear = () => {
    onFilterChange({
      searchQuery: '',
      trade: 'ALL',
      discipline: 'ALL',
      workPackage: 'ALL',
      zone: 'ALL',
      shipPart: 'ALL',
      status: 'ALL',
      minProgress: 0,
      maxProgress: 100,
      criticalPathOnly: false,
    });
  };

  const hasActiveFilters =
    filters.searchQuery !== '' ||
    filters.trade !== 'ALL' ||
    filters.discipline !== 'ALL' ||
    filters.workPackage !== 'ALL' ||
    filters.zone !== 'ALL' ||
    filters.shipPart !== 'ALL' ||
    filters.status !== 'ALL' ||
    filters.minProgress > 0 ||
    filters.maxProgress < 100 ||
    filters.criticalPathOnly;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded px-2 py-1 shadow-sm space-y-1 font-sans text-xs">
      {/* Top Search & 3D Viewport Controls */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-1.5">
        {/* Keyword Search Bar */}
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search tasks by WO code, title, contractor, discipline, work package..."
            value={filters.searchQuery}
            onChange={(e) => onFilterChange({ ...filters, searchQuery: e.target.value })}
            className="w-full h-6 bg-slate-950 border border-slate-700 focus:border-amber-400 rounded pl-8 pr-7 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500/30 font-medium"
          />
          {filters.searchQuery && (
            <button
              onClick={() => onFilterChange({ ...filters, searchQuery: '' })}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* 3D Viewport Shader Mode Buttons */}
        <div className="flex items-center gap-0.5 bg-slate-950 border border-slate-800 p-0.5 rounded self-start md:self-auto shrink-0 h-6">
          <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider px-1 hidden lg:inline font-mono">
            3D Mode:
          </span>
          <button
            onClick={() => onViewportModeChange('shaded')}
            className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold transition-all ${
              viewportMode === 'shaded'
                ? 'bg-amber-400 text-slate-950 shadow-sm font-bold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
            title="Standard Metallic Shaded 3D Model"
          >
            <Sun className="w-3 h-3" />
            <span>Shaded</span>
          </button>

          <button
            onClick={() => onViewportModeChange('wireframe')}
            className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold transition-all ${
              viewportMode === 'wireframe'
                ? 'bg-cyan-500 text-slate-950 shadow-sm font-bold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
            title="X-Ray Structural Wireframe View"
          >
            <Layers className="w-3 h-3" />
            <span>X-Ray Wireframe</span>
          </button>

          <button
            onClick={() => onViewportModeChange('heatmap')}
            className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold transition-all ${
              viewportMode === 'heatmap'
                ? 'bg-rose-500 text-white shadow-sm font-bold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
            title="NDT Steel Wastage Heatmap"
          >
            <Eye className="w-3 h-3" />
            <span>Heatmap</span>
          </button>

          <button
            onClick={() => onViewportModeChange('safety')}
            className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold transition-all ${
              viewportMode === 'safety'
                ? 'bg-orange-500 text-slate-950 shadow-sm font-bold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
            title="Hot Work & Safety Permit Zones"
          >
            <Flame className="w-3 h-3" />
            <span>Hot Work</span>
          </button>
        </div>
      </div>

      {/* Primary Filtering Grid (Discipline, Work Package, Status, Ship Part, Ship Zone) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-1.5 pt-0.5 border-t border-slate-800/80">
        {/* 1. Discipline Filter */}
        <div className="space-y-0.5">
          <label className="text-[10px] font-mono font-medium text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <SlidersHorizontal className="w-2.5 h-2.5 text-amber-400" /> Discipline
          </label>
          <select
            value={filters.discipline !== 'ALL' ? filters.discipline : filters.trade}
            onChange={(e) => {
              const val = e.target.value;
              onFilterChange({ 
                ...filters, 
                discipline: val, 
                trade: val as any 
              });
            }}
            className="w-full h-6 bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-200 rounded px-1.5 py-0 text-xs focus:outline-none focus:ring-1 focus:ring-amber-400 cursor-pointer font-medium"
          >
            {tradeOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* 2. Work Package Filter */}
        <div className="space-y-0.5">
          <label className="text-[10px] font-mono font-medium text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <Briefcase className="w-2.5 h-2.5 text-amber-400" /> Work Package
          </label>
          <select
            value={filters.workPackage}
            onChange={(e) => onFilterChange({ ...filters, workPackage: e.target.value })}
            className="w-full h-6 bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-200 rounded px-1.5 py-0 text-xs focus:outline-none focus:ring-1 focus:ring-amber-400 cursor-pointer font-medium"
          >
            {workPackageOptions.map((wp) => (
              <option key={wp.value} value={wp.value}>
                {wp.label}
              </option>
            ))}
          </select>
        </div>

        {/* 3. Task Status Filter */}
        <div className="space-y-0.5">
          <label className="text-[10px] font-mono font-medium text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <Clock className="w-2.5 h-2.5 text-amber-400" /> Task Status
          </label>
          <select
            value={filters.status}
            onChange={(e) => onFilterChange({ ...filters, status: e.target.value as any })}
            className="w-full h-6 bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-200 rounded px-1.5 py-0 text-xs focus:outline-none focus:ring-1 focus:ring-amber-400 cursor-pointer font-medium"
          >
            {statusOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* 4. Ship Component Filter */}
        <div className="space-y-0.5">
          <label className="text-[10px] font-mono font-medium text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <MapPin className="w-2.5 h-2.5 text-amber-400" /> Component
          </label>
          <select
            value={filters.shipPart}
            onChange={(e) => onFilterChange({ ...filters, shipPart: e.target.value as any })}
            className="w-full h-6 bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-200 rounded px-1.5 py-0 text-xs focus:outline-none focus:ring-1 focus:ring-amber-400 cursor-pointer font-medium"
          >
            {shipPartOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* 5. Vessel Zone Location Filter */}
        <div className="space-y-1 col-span-2 sm:col-span-1">
          <label className="text-xs font-mono font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <Compass className="w-3 h-3 text-amber-400" /> Zone
          </label>
          <select
            value={filters.zone}
            onChange={(e) => onFilterChange({ ...filters, zone: e.target.value as any })}
            className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-200 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-amber-400 cursor-pointer font-medium"
          >
            <option value="ALL">All Vessel Zones</option>
            {zoneOptions.filter((z) => z !== 'ALL').map((zone) => (
              <option key={zone} value={zone}>
                {zone}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Progress % Controls, Critical Path & Results Summary Row */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-800/80 text-[11px]">
        {/* Progress Range Filter Controls */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <Percent className="w-2.5 h-2.5 text-amber-400" /> Progress:
          </span>

          {/* Quick Progress Presets */}
          <div className="flex items-center gap-0.5 bg-slate-950 border border-slate-800 p-0.5 rounded text-[10px] font-mono">
            {[
              { label: 'All', min: 0, max: 100 },
              { label: '0%', min: 0, max: 0 },
              { label: '1 - 99%', min: 1, max: 99 },
              { label: '100%', min: 100, max: 100 },
            ].map((preset) => {
              const isActive = filters.minProgress === preset.min && filters.maxProgress === preset.max;
              return (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => onFilterChange({ ...filters, minProgress: preset.min, maxProgress: preset.max })}
                  className={`px-1.5 py-0.2 rounded font-semibold transition-all ${
                    isActive
                      ? 'bg-amber-400 text-slate-950 font-bold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  {preset.label}
                </button>
              );
            })}
          </div>

          {/* Custom Min / Max Inputs */}
          <div className="flex items-center gap-1 text-[10px] font-mono text-slate-400 bg-slate-950 border border-slate-800 px-1.5 py-0.2 rounded">
            <span>Min:</span>
            <input
              type="number"
              min="0"
              max="100"
              value={filters.minProgress}
              onChange={(e) => {
                const val = Math.max(0, Math.min(100, Number(e.target.value) || 0));
                onFilterChange({ ...filters, minProgress: val });
              }}
              className="w-8 bg-slate-900 border border-slate-700 text-amber-400 text-center rounded focus:outline-none focus:border-amber-400 font-bold"
            />
            <span>%</span>
            <span className="text-slate-600 px-0.5">—</span>
            <span>Max:</span>
            <input
              type="number"
              min="0"
              max="100"
              value={filters.maxProgress}
              onChange={(e) => {
                const val = Math.max(0, Math.min(100, Number(e.target.value) || 100));
                onFilterChange({ ...filters, maxProgress: val });
              }}
              className="w-8 bg-slate-900 border border-slate-700 text-amber-400 text-center rounded focus:outline-none focus:border-amber-400 font-bold"
            />
            <span>%</span>
          </div>
        </div>

        {/* Critical Path Checkbox & Active Count / Reset Button */}
        <div className="flex items-center gap-2 ml-auto">
          {/* Critical Path Only Checkbox */}
          <label className="flex items-center gap-1 text-slate-300 font-medium cursor-pointer bg-slate-950 border border-slate-800 hover:border-amber-500/40 px-2 py-0.5 rounded transition-colors select-none">
            <input
              type="checkbox"
              checked={filters.criticalPathOnly}
              onChange={(e) => onFilterChange({ ...filters, criticalPathOnly: e.target.checked })}
              className="accent-amber-400 rounded cursor-pointer w-3 h-3"
            />
            <Zap className="w-3 h-3 text-amber-400" />
            <span className="font-semibold text-[10px]">Critical Path Only</span>
          </label>

          {/* Total Filtered Tasks Count & Reset */}
          <div className="flex items-center gap-1.5 font-mono text-[10px] bg-slate-950 border border-slate-800 px-2 py-0.5 rounded">
            <span className="text-slate-400">
              Showing <strong className="text-amber-400 font-bold">{totalResults}</strong> tasks
            </span>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleClear}
                className="flex items-center gap-0.5 text-amber-400 hover:text-amber-300 font-bold text-[10px] ml-1 transition-colors border-l border-slate-800 pl-1.5"
              >
                <RotateCcw className="w-2.5 h-2.5" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
