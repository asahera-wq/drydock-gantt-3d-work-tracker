import React from 'react';
import { Task, VesselComponentId, VesselComponentSpec } from '../types';
import { VESSEL_COMPONENTS } from '../data/vesselData';
import { getComponentTaskStatus } from './ThreeViewport';
import { 
  Box, 
  Layers, 
  Ruler, 
  CheckCircle, 
  AlertTriangle, 
  Info, 
  Focus, 
  Sparkles, 
  Wrench,
  Compass,
  ArrowUpRight
} from 'lucide-react';

interface ComponentInspectorPanelProps {
  selectedComponentId: VesselComponentId | null;
  onSelectComponent: (componentId: VesselComponentId | null) => void;
  explodeFactor: number;
  onExplodeFactorChange: (factor: number) => void;
  tasks?: Task[];
}

export const ComponentInspectorPanel: React.FC<ComponentInspectorPanelProps> = ({
  selectedComponentId,
  onSelectComponent,
  explodeFactor,
  onExplodeFactorChange,
  tasks = [],
}) => {
  const selectedSpec = VESSEL_COMPONENTS.find((c) => c.id === selectedComponentId);

  return (
    <div id="component-inspector-panel" className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-xl space-y-4">
      {/* Header section */}
      <div className="flex flex-wrap items-center justify-between border-b border-slate-800 pb-3 gap-2">
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-cyan-400" />
          <h2 className="text-sm font-bold text-slate-100 uppercase font-mono tracking-wider">
            14 Major Vessel Mesh Components
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onExplodeFactorChange(explodeFactor > 0 ? 0 : 0.6)}
            className={`px-3 py-1 rounded text-xs font-mono font-bold flex items-center gap-1.5 transition-colors border ${
              explodeFactor > 0
                ? 'bg-amber-400 text-slate-950 border-amber-400'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            {explodeFactor > 0 ? 'Collapse Vessel' : 'Explode All 14 Meshes'}
          </button>

          {selectedComponentId && (
            <button
              onClick={() => onSelectComponent(null)}
              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs font-mono"
            >
              Show All
            </button>
          )}
        </div>
      </div>

      {/* Grid of 14 Component Buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2">
        {VESSEL_COMPONENTS.map((comp) => {
          const isSelected = comp.id === selectedComponentId;
          const compStatus = getComponentTaskStatus(comp.id, tasks);
          const statusBg =
            compStatus === 'completed'
              ? 'bg-emerald-500'
              : compStatus === 'in_progress'
              ? 'bg-yellow-400'
              : compStatus === 'delayed' || compStatus === 'waiting'
              ? 'bg-blue-500'
              : 'bg-red-500';

          return (
            <button
              key={comp.id}
              onClick={() => onSelectComponent(comp.id)}
              className={`p-2.5 rounded-lg border text-left transition-all flex flex-col justify-between h-20 relative overflow-hidden group ${
                isSelected
                  ? 'bg-cyan-500/15 border-cyan-400 text-cyan-300 shadow-lg shadow-cyan-950/50'
                  : 'bg-slate-950/70 border-slate-800/80 text-slate-300 hover:border-slate-700 hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-start justify-between w-full">
                <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded flex items-center gap-1.5 ${
                  isSelected ? 'bg-cyan-400 text-slate-950' : 'bg-slate-800 text-slate-400'
                }`}>
                  <span className={`w-2 h-2 rounded-full ${statusBg}`} />
                  <span>{comp.id.replace('_', ' ')}</span>
                </span>
                <ArrowUpRight className={`w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity ${
                  isSelected ? 'text-cyan-400' : 'text-slate-500'
                }`} />
              </div>

              <span className="text-xs font-bold truncate leading-tight mt-1">
                {comp.name}
              </span>

              <span className="text-[10px] text-slate-500 font-mono truncate">
                {comp.primitivesUsed[0]}
              </span>
            </button>
          );
        })}
      </div>

      {/* Selected Component Inspection Spec Card */}
      {selectedSpec ? (
        <div id="component-spec-detail-card" className="bg-slate-950/90 border border-cyan-500/40 rounded-xl p-4 space-y-3">
          <div className="flex flex-wrap items-center justify-between border-b border-slate-800 pb-2 gap-2">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono font-bold px-2 py-0.5 bg-amber-400/20 text-amber-400 border border-amber-400/30 rounded">
                  {selectedSpec.category}
                </span>
                <span className="text-[11px] text-slate-400 font-mono">
                  Location: {selectedSpec.location}
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-100 mt-1 flex items-center gap-2">
                {selectedSpec.name}
              </h3>
            </div>

            <div className="flex items-center gap-2">
              <span className={`text-xs font-mono font-bold px-2.5 py-1 rounded border ${
                selectedSpec.maintenanceStatus === 'Good Condition'
                  ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                  : selectedSpec.maintenanceStatus === 'Active Maintenance'
                  ? 'bg-amber-950 text-amber-400 border-amber-800'
                  : 'bg-rose-950 text-rose-400 border-rose-800'
              }`}>
                {selectedSpec.maintenanceStatus}
              </span>
            </div>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            {selectedSpec.description}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
            <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800 space-y-1">
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase block">
                Three.js Primitives
              </span>
              <ul className="text-xs text-amber-400 font-mono list-disc list-inside space-y-0.5">
                {selectedSpec.primitivesUsed.map((p, idx) => (
                  <li key={idx}>{p}</li>
                ))}
              </ul>
            </div>

            <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800 space-y-1">
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase block">
                Dimensions & Scale
              </span>
              <p className="text-xs text-slate-200 font-mono font-semibold">
                {selectedSpec.dimensions}
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                {selectedSpec.materialSpec}
              </p>
            </div>

            <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800 space-y-1">
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase block">
                Engineering Drydock Notes
              </span>
              <p className="text-xs text-slate-300 leading-normal italic">
                "{selectedSpec.engineeringNotes}"
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-slate-950/40 border border-dashed border-slate-800 rounded-xl p-4 text-center text-xs text-slate-400 font-mono">
          👈 Click any component button above or click directly on any 3D mesh in the viewport to inspect its primitives and technical specs.
        </div>
      )}
    </div>
  );
};
