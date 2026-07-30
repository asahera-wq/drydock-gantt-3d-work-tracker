import React, { useState } from 'react';
import { Task, ViewportMode, LightingPreset, VesselComponentId, GanttPhase, DrydockBay, FilterState } from '../types';
import { 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  ListChecks, 
  Box, 
  Sliders, 
  Play, 
  Pause, 
  Plus, 
  Camera, 
  MessageSquare, 
  ChevronRight, 
  Filter, 
  Upload, 
  Activity, 
  Search, 
  Zap, 
  Calendar,
  Layers,
  Wrench,
  X
} from 'lucide-react';
import { ThreeViewport } from './ThreeViewport';
import { KPICards } from './KPICards';
import { TimelineSlider } from './TimelineSlider';

interface MobileDashboardProps {
  tasks: Task[];
  displayedTasks: Task[];
  filteredTasks: Task[];
  selectedTaskId: string | null;
  onSelectTask: (taskId: string | null) => void;
  selectedComponentId: VesselComponentId | null;
  onSelectComponent: (compId: VesselComponentId | null) => void;
  onUpdateTask: (task: Task) => void;
  onOpenTaskDetails: (task: Task) => void;
  onOpenAddTask: () => void;
  viewportMode: ViewportMode;
  onViewportModeChange: (mode: ViewportMode) => void;
  lightingPreset: LightingPreset;
  onLightingPresetChange: (preset: LightingPreset) => void;
  explodeFactor: number;
  onExplodeFactorChange: (factor: number) => void;
  currentDay: number;
  totalDays: number;
  onDayChange: (day: number) => void;
  phases: GanttPhase[];
  isTimelineMode: boolean;
  onToggleTimelineMode: (val: boolean) => void;
  activeBay: DrydockBay;
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
}

export const MobileDashboard: React.FC<MobileDashboardProps> = ({
  tasks,
  displayedTasks,
  filteredTasks,
  selectedTaskId,
  onSelectTask,
  selectedComponentId,
  onSelectComponent,
  onUpdateTask,
  onOpenTaskDetails,
  onOpenAddTask,
  viewportMode,
  onViewportModeChange,
  lightingPreset,
  onLightingPresetChange,
  explodeFactor,
  onExplodeFactorChange,
  currentDay,
  totalDays,
  onDayChange,
  phases,
  isTimelineMode,
  onToggleTimelineMode,
  activeBay,
  filters,
  onFilterChange,
}) => {
  const [activeTab, setActiveTab] = useState<'today' | '3d' | 'tasks' | 'kpis'>('today');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingRemarks, setEditingRemarks] = useState<{ [id: string]: string }>({});

  const totalTasks = displayedTasks.length;
  const completedCount = displayedTasks.filter((t) => t.status === 'completed').length;
  const activeCount = displayedTasks.filter((t) => t.status === 'in_progress').length;
  const delayedCount = displayedTasks.filter((t) => t.status === 'delayed' || t.status === 'waiting').length;
  const overallProgress = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;

  // Active work orders for "Today"
  const todaysTasks = displayedTasks.filter((t) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        t.code.toLowerCase().includes(q) ||
        t.title.toLowerCase().includes(q) ||
        t.contractor.toLowerCase().includes(q)
      );
    }
    return t.status === 'in_progress' || t.status === 'delayed' || (t.startDay <= currentDay && t.startDay + t.durationDays >= currentDay);
  });

  const handlePhotoUpload = (taskId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    const file = files[0];
    const reader = new FileReader();
    reader.onload = (evt) => {
      if (evt.target?.result) {
        const newPhotos = [...(task.photos || []), evt.target!.result as string];
        onUpdateTask({ ...task, photos: newPhotos });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleQuickProgress = (task: Task, delta: number) => {
    const newProg = Math.min(100, Math.max(0, (task.progress || 0) + delta));
    const newStatus = newProg === 100 ? 'completed' : newProg > 0 ? 'in_progress' : 'not_started';
    onUpdateTask({
      ...task,
      progress: newProg,
      status: newStatus as any,
    });
  };

  return (
    <div className="flex flex-col h-full w-full bg-slate-950 text-slate-100 overflow-hidden font-sans">
      {/* Top Mobile Bar: Simulation & KPI Summary */}
      <div className="bg-slate-900 border-b border-slate-800 p-2.5 space-y-2 shrink-0 shadow-md">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <h2 className="text-xs font-mono font-bold text-slate-100 uppercase tracking-wide">
              Supervisor Yard Feed
            </h2>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-400/20 text-amber-400 border border-amber-400/30 font-bold">
              Day {currentDay}
            </span>
          </div>

          <button
            onClick={onOpenAddTask}
            className="flex items-center gap-1 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs px-2.5 py-1.5 rounded-md shadow-sm transition-all min-h-[38px]"
          >
            <Plus className="w-4 h-4" />
            <span>New WO</span>
          </button>
        </div>

        {/* Quick KPI Strip */}
        <div className="grid grid-cols-4 gap-1 text-center font-mono text-[10px] bg-slate-950 border border-slate-800 p-1.5 rounded-lg">
          <div>
            <span className="text-slate-400 uppercase block text-[9px]">Total</span>
            <span className="text-white font-bold text-xs">{totalTasks}</span>
          </div>
          <div>
            <span className="text-emerald-400 uppercase block text-[9px]">Done</span>
            <span className="text-emerald-400 font-bold text-xs">{completedCount}</span>
          </div>
          <div>
            <span className="text-amber-400 uppercase block text-[9px]">Active</span>
            <span className="text-amber-400 font-bold text-xs">{activeCount}</span>
          </div>
          <div>
            <span className="text-purple-400 uppercase block text-[9px]">Progress</span>
            <span className="text-purple-400 font-bold text-xs">{overallProgress}%</span>
          </div>
        </div>

        {/* Mobile Sub-Navigation Tabs */}
        <div className="grid grid-cols-4 gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
          {[
            { id: 'today', label: 'Work Orders', icon: Activity, count: todaysTasks.length },
            { id: '3d', label: '3D View', icon: Box },
            { id: 'tasks', label: 'All Tasks', icon: ListChecks, count: filteredTasks.length },
            { id: 'kpis', label: 'Timeline', icon: Calendar },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex flex-col items-center justify-center py-1.5 px-1 rounded font-mono text-[10px] font-bold transition-all min-h-[44px] ${
                  isActive
                    ? 'bg-amber-400 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center gap-1">
                  <Icon className="w-3.5 h-3.5" />
                  {tab.count !== undefined && (
                    <span className={`text-[9px] px-1 rounded-full ${isActive ? 'bg-slate-950 text-amber-400' : 'bg-slate-800 text-slate-300'}`}>
                      {tab.count}
                    </span>
                  )}
                </div>
                <span className="leading-tight mt-0.5">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content Area Based on Active Mobile Tab */}
      <div className="flex-1 min-h-0 overflow-y-auto p-3 space-y-3 custom-scrollbar">
        {/* TAB 1: Today's Work Orders Feed */}
        {activeTab === 'today' && (
          <div className="space-y-3">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search active work orders by WO, title, contractor..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-400 min-h-[44px]"
              />
            </div>

            {todaysTasks.length === 0 ? (
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                <h4 className="text-sm font-bold text-slate-200">No Pending Active Work Orders</h4>
                <p className="text-xs text-slate-400">All scheduled tasks for Day {currentDay} are up to date.</p>
              </div>
            ) : (
              todaysTasks.map((task) => {
                const isSelected = selectedTaskId === task.id;
                return (
                  <div
                    key={task.id}
                    className={`bg-slate-900 border rounded-xl p-3 space-y-3 transition-all ${
                      isSelected ? 'border-amber-400 ring-1 ring-amber-400/30' : 'border-slate-800'
                    }`}
                  >
                    {/* Header Row */}
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-xs font-bold text-amber-400 bg-amber-400/10 border border-amber-400/30 px-2 py-0.5 rounded">
                            {task.code}
                          </span>
                          {task.isCriticalPath && (
                            <span className="text-[9px] font-mono font-bold bg-amber-400 text-slate-950 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                              <Zap className="w-2.5 h-2.5 fill-slate-950" /> CRITICAL
                            </span>
                          )}
                        </div>
                        <h3 className="font-bold text-xs text-slate-100 mt-1 leading-snug">
                          {task.title}
                        </h3>
                        <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                          Trade: {task.trade} | Contractor: {task.contractor}
                        </p>
                      </div>

                      <span className={`text-[10px] font-mono font-bold px-2 py-1 rounded border uppercase shrink-0 ${
                        task.status === 'completed' 
                          ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' 
                          : task.status === 'in_progress' 
                          ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40' 
                          : 'bg-blue-500/20 text-blue-400 border-blue-500/40'
                      }`}>
                        {task.status.replace('_', ' ')}
                      </span>
                    </div>

                    {/* Progress Slider & Touch Controls */}
                    <div className="space-y-1.5 bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                      <div className="flex justify-between items-center text-xs font-mono">
                        <span className="text-slate-400 font-medium">Completion Progress</span>
                        <span className="font-bold text-amber-400">{task.progress}%</span>
                      </div>

                      {/* Touch Friendly Progress Bar */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleQuickProgress(task, -10)}
                          className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold font-mono px-2 py-1 rounded border border-slate-700 min-h-[38px] shrink-0"
                        >
                          -10%
                        </button>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={task.progress}
                          onChange={(e) => {
                            const prog = Number(e.target.value);
                            const st = prog === 100 ? 'completed' : prog > 0 ? 'in_progress' : 'not_started';
                            onUpdateTask({ ...task, progress: prog, status: st as any });
                          }}
                          className="w-full accent-amber-400 cursor-pointer h-2 bg-slate-900 rounded-lg min-h-[38px]"
                        />
                        <button
                          onClick={() => handleQuickProgress(task, 10)}
                          className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold font-mono px-2 py-1 rounded border border-slate-700 min-h-[38px] shrink-0"
                        >
                          +10%
                        </button>
                      </div>
                    </div>

                    {/* Quick Supervisor Remarks */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                        <MessageSquare className="w-3 h-3 text-amber-400" /> Yard Remarks
                      </label>
                      <input
                        type="text"
                        placeholder="Add supervisor notes..."
                        value={editingRemarks[task.id] !== undefined ? editingRemarks[task.id] : (task.remarks || '')}
                        onChange={(e) => setEditingRemarks({ ...editingRemarks, [task.id]: e.target.value })}
                        onBlur={() => {
                          if (editingRemarks[task.id] !== undefined) {
                            onUpdateTask({ ...task, remarks: editingRemarks[task.id] });
                          }
                        }}
                        className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-400 min-h-[40px]"
                      />
                    </div>

                    {/* Photo Attachments & Action Buttons */}
                    <div className="flex items-center justify-between pt-1 border-t border-slate-800/80 gap-2">
                      {/* Photo Upload */}
                      <label className="cursor-pointer bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 px-2.5 py-1.5 rounded text-xs font-mono font-bold flex items-center gap-1 min-h-[40px]">
                        <Camera className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Photo ({task.photos?.length || 0})</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handlePhotoUpload(task.id, e)}
                          className="hidden"
                        />
                      </label>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => {
                            onSelectTask(task.id);
                            if (task.shipPart || task.componentId) {
                              onSelectComponent((task.shipPart || task.componentId) as VesselComponentId);
                            }
                            setActiveTab('3d');
                          }}
                          className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono font-bold px-2.5 py-1.5 rounded border border-slate-700 min-h-[40px] flex items-center gap-1"
                        >
                          <Box className="w-3.5 h-3.5 text-amber-400" />
                          <span>3D</span>
                        </button>

                        <button
                          onClick={() => onOpenTaskDetails(task)}
                          className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs px-3 py-1.5 rounded min-h-[40px] flex items-center gap-1"
                        >
                          <span>Edit</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* TAB 2: Interactive 3D Viewport */}
        {activeTab === '3d' && (
          <div className="space-y-3 h-full flex flex-col">
            <div className="h-[380px] w-full rounded-xl overflow-hidden border border-slate-800 bg-slate-950 relative">
              <ThreeViewport
                selectedComponentId={selectedComponentId}
                onSelectComponent={onSelectComponent}
                tasks={filteredTasks}
                selectedTaskId={selectedTaskId}
                onSelectTask={onSelectTask}
                onUpdateTask={onUpdateTask}
                viewportMode={viewportMode}
                onViewportModeChange={onViewportModeChange}
                lightingPreset={lightingPreset}
                onLightingPresetChange={onLightingPresetChange}
                explodeFactor={explodeFactor}
                onExplodeFactorChange={onExplodeFactorChange}
              />
            </div>
          </div>
        )}

        {/* TAB 3: Simplified Mobile Task Audit List */}
        {activeTab === 'tasks' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-mono text-slate-400">
              <span>Showing {filteredTasks.length} Work Orders</span>
            </div>

            <div className="space-y-2">
              {filteredTasks.map((t) => (
                <div
                  key={t.id}
                  onClick={() => onOpenTaskDetails(t)}
                  className="bg-slate-900 border border-slate-800 hover:border-slate-700 p-3 rounded-xl flex items-center justify-between gap-2 cursor-pointer transition-all active:scale-[0.99] min-h-[56px]"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-xs font-bold text-slate-200">{t.code}</span>
                      <span className="text-[10px] text-slate-400 font-mono">| {t.trade}</span>
                    </div>
                    <p className="text-xs font-bold text-slate-100 truncate">{t.title}</p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="font-mono text-xs font-bold text-amber-400">{t.progress}%</span>
                    <ChevronRight className="w-4 h-4 text-slate-500" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: Timeline & KPI Analytics */}
        {activeTab === 'kpis' && (
          <div className="space-y-3">
            <TimelineSlider
              currentDay={currentDay}
              totalDays={totalDays}
              onDayChange={onDayChange}
              phases={phases}
              tasks={displayedTasks}
              isTimelineMode={isTimelineMode}
              onToggleTimelineMode={onToggleTimelineMode}
            />

            <KPICards
              tasks={displayedTasks}
              onSelectDiscipline={(disc) => onFilterChange({ ...filters, discipline: disc as any })}
            />
          </div>
        )}
      </div>
    </div>
  );
};
