/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { HeaderBar } from './components/HeaderBar';
import { Sidebar } from './components/Sidebar';
import { KPICards } from './components/KPICards';
import { FilterSection } from './components/FilterSection';
import { ThreeViewport } from './components/ThreeViewport';
import { ComponentInspectorPanel } from './components/ComponentInspectorPanel';
import { GanttChart } from './components/GanttChart';
import { TaskList } from './components/TaskList';
import { TaskDetailModal } from './components/TaskDetailModal';
import { AddTaskModal } from './components/AddTaskModal';
import { TimelineSlider } from './components/TimelineSlider';
import { MobileDashboard } from './components/MobileDashboard';

import { INITIAL_BAYS, GANTT_PHASES, INITIAL_TASKS } from './data/mockData';
import { FilterState, Task, ViewportMode, VesselComponentId, LightingPreset, TaskStatus } from './types';

export default function App() {
  const [bays] = useState(INITIAL_BAYS);
  const [currentBayId, setCurrentBayId] = useState('BAY-01');
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [phases] = useState(GANTT_PHASES);

  const [simulatedDay, setSimulatedDay] = useState<number>(14);
  const [isTimelineMode, setIsTimelineMode] = useState<boolean>(false);

  const [selectedTaskId, setSelectedTaskId] = useState<string | null>('TASK-001');
  const [selectedComponentId, setSelectedComponentId] = useState<VesselComponentId | null>('hull');

  // Compute dynamic tasks at the current simulation day if timeline mode is active
  const displayedTasks = React.useMemo(() => {
    if (!isTimelineMode) return tasks;

    return tasks.map((t) => {
      let startDay = t.startDay;
      if (!startDay) {
        const dayNum = parseInt((t.plannedStart || '2026-08-01').split('-')[2], 10);
        startDay = Math.max(1, dayNum);
      }
      const duration = t.durationDays || t.duration || 3;
      const endDay = startDay + duration;

      if (simulatedDay < startDay) {
        return {
          ...t,
          progress: 0,
          status: 'not_started' as TaskStatus,
        };
      } else if (simulatedDay >= endDay) {
        return {
          ...t,
          progress: 100,
          status: 'completed' as TaskStatus,
        };
      } else {
        const elapsed = simulatedDay - startDay;
        const prog = Math.min(99, Math.max(10, Math.round((elapsed / duration) * 100)));
        const isBlocked = t.isCriticalPath && simulatedDay > startDay + 2 && (t.status === 'delayed' || t.status === 'waiting');
        return {
          ...t,
          progress: prog,
          status: isBlocked ? ('delayed' as TaskStatus) : ('in_progress' as TaskStatus),
        };
      }
    });
  }, [tasks, isTimelineMode, simulatedDay]);

  const handleSelectTask = (taskId: string | null) => {
    setSelectedTaskId(taskId);
    if (taskId) {
      const task = tasks.find((t) => t.id === taskId);
      if (task && (task.shipPart || task.componentId)) {
        setSelectedComponentId((task.shipPart || task.componentId) as VesselComponentId);
      }
    } else {
      setSelectedComponentId(null);
    }
  };

  const handleSelectComponent = (componentId: VesselComponentId | null) => {
    setSelectedComponentId(componentId);
    if (componentId) {
      const matchingTask = tasks.find((t) => (t.shipPart || t.componentId) === componentId);
      if (matchingTask) {
        setSelectedTaskId(matchingTask.id);
      }
    }
  };
  const [activeTab, setActiveTab] = useState('tracker');
  const [viewportMode, setViewportMode] = useState<ViewportMode>('shaded');
  const [lightingPreset, setLightingPreset] = useState<LightingPreset>('daylight');
  const [explodeFactor, setExplodeFactor] = useState<number>(0);
  const [resetTrigger, setResetTrigger] = useState(0);

  const [inspectTask, setInspectTask] = useState<Task | null>(null);
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);

  const [filters, setFilters] = useState<FilterState>({
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

  const activeBay = bays.find((b) => b.id === currentBayId) || bays[0];

  // Task filtering based on current displayedTasks (which reflects timeline animation if active)
  const filteredTasks = displayedTasks.filter((task) => {
    // Search query keyword filter
    if (filters.searchQuery.trim() !== '') {
      const q = filters.searchQuery.toLowerCase();
      const matchCode = task.code.toLowerCase().includes(q);
      const matchTitle = (task.title || task.name || '').toLowerCase().includes(q);
      const matchDesc = task.description.toLowerCase().includes(q);
      const matchZone = task.zone.toLowerCase().includes(q);
      const matchTrade = (task.discipline || task.trade).toLowerCase().includes(q);
      const matchWP = (task.workPackage || '').toLowerCase().includes(q);
      const matchContractor = task.contractor.toLowerCase().includes(q);
      if (!matchCode && !matchTitle && !matchDesc && !matchZone && !matchTrade && !matchWP && !matchContractor) {
        return false;
      }
    }

    // Discipline / Trade filter
    if (filters.discipline !== 'ALL') {
      const taskDiscipline = task.discipline || task.trade;
      if (taskDiscipline !== filters.discipline) return false;
    }
    if (filters.trade !== 'ALL' && task.trade !== filters.trade) return false;

    // Work Package filter
    if (filters.workPackage !== 'ALL' && task.workPackage !== filters.workPackage) {
      return false;
    }

    // Status filter
    if (filters.status !== 'ALL') {
      if (filters.status === 'delayed' || filters.status === 'waiting') {
        if (task.status !== 'delayed' && task.status !== 'waiting') return false;
      } else if (task.status !== filters.status) {
        return false;
      }
    }

    // Progress percentage range filter
    const prog = task.progress ?? 0;
    if (prog < filters.minProgress || prog > filters.maxProgress) {
      return false;
    }

    // Ship Location filters (Zone & Mesh ShipPart)
    if (filters.zone !== 'ALL' && task.zone !== filters.zone) return false;
    const taskPart = task.shipPart || task.componentId;
    if (filters.shipPart !== 'ALL' && taskPart !== filters.shipPart) return false;

    // Critical Path
    if (filters.criticalPathOnly && !task.isCriticalPath) return false;

    return true;
  });

  const handleUpdateTask = (updatedTask: Task) => {
    setTasks((prev) => prev.map((t) => (t.id === updatedTask.id ? updatedTask : t)));
  };

  const handleAddTask = (newTask: Task) => {
    setTasks((prev) => [newTask, ...prev]);
    setSelectedTaskId(newTask.id);
  };

  return (
    <div className="h-screen w-screen bg-slate-950 text-slate-100 flex flex-col overflow-hidden font-sans select-none">
      {/* MOBILE EXPERIENCE (<768px / md:hidden) */}
      <div className="flex md:hidden flex-col h-full w-full overflow-hidden">
        <HeaderBar
          bays={bays}
          currentBayId={currentBayId}
          onSelectBay={setCurrentBayId}
          onOpenAddTask={() => setIsAddTaskOpen(true)}
          onResetView={() => {
            setResetTrigger((prev) => prev + 1);
            setSelectedComponentId(null);
            setExplodeFactor(0);
          }}
        />
        <MobileDashboard
          tasks={tasks}
          displayedTasks={displayedTasks}
          filteredTasks={filteredTasks}
          selectedTaskId={selectedTaskId}
          onSelectTask={handleSelectTask}
          selectedComponentId={selectedComponentId}
          onSelectComponent={handleSelectComponent}
          onUpdateTask={handleUpdateTask}
          onOpenTaskDetails={setInspectTask}
          onOpenAddTask={() => setIsAddTaskOpen(true)}
          viewportMode={viewportMode}
          onViewportModeChange={setViewportMode}
          lightingPreset={lightingPreset}
          onLightingPresetChange={setLightingPreset}
          explodeFactor={explodeFactor}
          onExplodeFactorChange={setExplodeFactor}
          currentDay={simulatedDay}
          totalDays={activeBay.totalDays || 28}
          onDayChange={setSimulatedDay}
          phases={phases}
          isTimelineMode={isTimelineMode}
          onToggleTimelineMode={setIsTimelineMode}
          activeBay={activeBay}
          filters={filters}
          onFilterChange={setFilters}
        />
      </div>

      {/* TABLET & DESKTOP EXPERIENCE (≥768px / md:flex) */}
      <div className="hidden md:flex flex-col h-full w-full overflow-hidden">
        {/* Top Header */}
        <HeaderBar
          bays={bays}
          currentBayId={currentBayId}
          onSelectBay={setCurrentBayId}
          onOpenAddTask={() => setIsAddTaskOpen(true)}
          onResetView={() => {
            setResetTrigger((prev) => prev + 1);
            setSelectedComponentId(null);
            setExplodeFactor(0);
          }}
        />

        {/* Compact KPI & Control Dashboard (<25% viewport height) */}
        <div className="bg-slate-950 border-b border-slate-800/80 px-2.5 py-1 space-y-1 shrink-0 z-20 shadow-md max-h-[25vh] overflow-y-auto custom-scrollbar">
          {/* Top KPI Cards Row */}
          <KPICards 
            tasks={displayedTasks} 
            onSelectDiscipline={(disc) => setFilters((prev) => ({ ...prev, discipline: disc, trade: disc as any }))}
          />

          {/* Interactive Timeline Simulation & Date Slider */}
          <TimelineSlider
            currentDay={simulatedDay}
            totalDays={activeBay.totalDays || 28}
            onDayChange={setSimulatedDay}
            phases={phases}
            tasks={displayedTasks}
            isTimelineMode={isTimelineMode}
            onToggleTimelineMode={setIsTimelineMode}
          />

          {/* Filter & View Mode Controls Section */}
          <FilterSection
            filters={filters}
            onFilterChange={setFilters}
            viewportMode={viewportMode}
            onViewportModeChange={setViewportMode}
            totalResults={filteredTasks.length}
          />
        </div>

        {/* Main Workspace Body: Tablet (Stacked) vs Desktop (Two-Column 38% / 62%) */}
        <div className="flex-1 flex min-h-0 overflow-hidden">
          {/* Left Sidebar Nav */}
          <Sidebar
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            activeBay={activeBay}
            tasks={displayedTasks}
          />

          {/* Main Grid: Desktop (xl:grid-cols-[38%_62%]) vs Tablet (grid-cols-1 overflow-y-auto) */}
          <main className="flex-1 min-h-0 grid grid-cols-1 xl:grid-cols-[38%_62%] w-full h-full overflow-y-auto xl:overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
            {/* LEFT / TOP PANEL: Three.js 3D Viewport (38% on desktop fixed, 380px on tablet stacked) */}
            <div className="h-[380px] xl:h-full w-full overflow-hidden flex flex-col min-h-0 relative p-2.5 border-b xl:border-b-0 xl:border-r border-slate-800/80 bg-slate-950/80 shrink-0">
              <ThreeViewport
                selectedComponentId={selectedComponentId}
                onSelectComponent={handleSelectComponent}
                tasks={filteredTasks}
                selectedTaskId={selectedTaskId}
                onSelectTask={handleSelectTask}
                onUpdateTask={handleUpdateTask}
                viewportMode={viewportMode}
                onViewportModeChange={setViewportMode}
                lightingPreset={lightingPreset}
                onLightingPresetChange={setLightingPreset}
                explodeFactor={explodeFactor}
                onExplodeFactorChange={setExplodeFactor}
                resetTrigger={resetTrigger}
              />
            </div>

            {/* RIGHT / BOTTOM PANEL (62% on desktop with independent scroll): Scrollable Gantt & Audit Panel */}
            <div className="flex-1 xl:h-full w-full overflow-y-auto overflow-x-auto p-3 space-y-4 custom-scrollbar">
              {/* Gantt Schedule Matrix */}
              <GanttChart
                phases={phases}
                tasks={filteredTasks}
                selectedTaskId={selectedTaskId}
                onSelectTask={handleSelectTask}
                currentDay={isTimelineMode ? simulatedDay : activeBay.currentDay}
                totalDays={activeBay.totalDays}
              />

              {/* 14 Major Component Mesh Breakdown & Inspector Panel */}
              <ComponentInspectorPanel
                selectedComponentId={selectedComponentId}
                onSelectComponent={handleSelectComponent}
                explodeFactor={explodeFactor}
                onExplodeFactorChange={setExplodeFactor}
                tasks={displayedTasks}
              />

              {/* Task Audit Table */}
              <TaskList
                tasks={filteredTasks}
                selectedTaskId={selectedTaskId}
                onSelectTask={handleSelectTask}
                onOpenTaskDetails={setInspectTask}
                onUpdateTask={handleUpdateTask}
              />
            </div>
          </main>
        </div>
      </div>

      {/* Task Detail Modal */}
      <TaskDetailModal
        task={inspectTask}
        onClose={() => setInspectTask(null)}
        onUpdateTask={handleUpdateTask}
        onFocus3D={(taskId) => setSelectedTaskId(taskId)}
      />

      {/* Add Task Form Modal */}
      <AddTaskModal
        isOpen={isAddTaskOpen}
        onClose={() => setIsAddTaskOpen(false)}
        onAddTask={handleAddTask}
      />
    </div>
  );
}
