import React, { useState } from 'react';
import { Task, TradeCategory, VesselZone } from '../types';
import { X, Plus, HardHat, Zap, Flame } from 'lucide-react';

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTask: (newTask: Task) => void;
}

export const AddTaskModal: React.FC<AddTaskModalProps> = ({
  isOpen,
  onClose,
  onAddTask,
}) => {
  if (!isOpen) return null;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [trade, setTrade] = useState<TradeCategory>('Hull & Steelwork');
  const [zone, setZone] = useState<VesselZone>('Bow & Bulbous');
  const [contractor, setContractor] = useState('Ironclad Welders Co.');
  const [startDay, setStartDay] = useState(14);
  const [durationDays, setDurationDays] = useState(4);
  const [manhoursEst, setManhoursEst] = useState(48);
  const [isCriticalPath, setIsCriticalPath] = useState(false);
  const [safetyPermitRequired, setSafetyPermitRequired] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newCode = `WO-${Math.floor(812 + Math.random() * 800)}`;
    const newId = `T-${Date.now()}`;

    // Randomize sample 3D hotspot position near requested zone
    let posX = (Math.random() - 0.5) * 4;
    let posY = (Math.random() - 0.5) * 2;
    let posZ = (Math.random() - 0.5) * 12;

    const newTask: Task = {
      id: newId,
      code: newCode,
      title: title.trim(),
      description: description.trim() || 'Drydock repair work order package.',
      phaseId: 'PHASE-3',
      trade,
      zone,
      contractor,
      startDay,
      durationDays,
      progress: 0,
      status: 'not_started',
      isCriticalPath,
      hotspotId: `HS-${newCode}`,
      hotspotPos: [posX, posY, posZ],
      safetyPermitRequired,
      permitApproved: false,
      manhoursEst,
      manhoursSpent: 0,
    };

    onAddTask(newTask);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden text-slate-100 animate-in fade-in zoom-in-95 duration-200">
        <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-400 text-slate-950 font-black flex items-center justify-center">
              <Plus className="w-5 h-5 stroke-[3]" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-100">Create New Work Order</h3>
              <p className="text-xs text-slate-400">Add task to drydock schedule & 3D coordinate space</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto text-xs">
          <div className="space-y-1">
            <label className="font-bold text-slate-300 uppercase tracking-wider">
              Task Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Main Sea Chest Butterfly Valve Refit"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 focus:border-amber-400 rounded-lg px-3 py-2 text-slate-200 focus:outline-none font-medium"
            />
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-300 uppercase tracking-wider">
              Description / Specs
            </label>
            <textarea
              rows={2}
              placeholder="Work scope details, tolerance specifications, NDT requirements..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 focus:border-amber-400 rounded-lg px-3 py-2 text-slate-200 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-bold text-slate-300 uppercase tracking-wider">Trade</label>
              <select
                value={trade}
                onChange={(e) => setTrade(e.target.value as TradeCategory)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none"
              >
                <option value="Hull & Steelwork">Hull & Steelwork</option>
                <option value="Blasting & Coating">Blasting & Coating</option>
                <option value="Piping & Valves">Piping & Valves</option>
                <option value="Propulsion & Steering">Propulsion & Steering</option>
                <option value="Electrical & Automation">Electrical & Automation</option>
                <option value="Docking & Rigging">Docking & Rigging</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-300 uppercase tracking-wider">Vessel Zone</label>
              <select
                value={zone}
                onChange={(e) => setZone(e.target.value as VesselZone)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none"
              >
                <option value="Bow & Bulbous">Bow & Bulbous</option>
                <option value="Midship Port">Midship Port</option>
                <option value="Midship Starboard">Midship Starboard</option>
                <option value="Stern & Rudder">Stern & Rudder</option>
                <option value="Engine Room">Engine Room</option>
                <option value="Cargo Holds">Cargo Holds</option>
                <option value="Keel & Sea Chests">Keel & Sea Chests</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="font-bold text-slate-300 uppercase tracking-wider">Start Day (1-28)</label>
              <input
                type="number"
                min="1"
                max="28"
                value={startDay}
                onChange={(e) => setStartDay(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 font-mono text-slate-200"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-300 uppercase tracking-wider">Duration (Days)</label>
              <input
                type="number"
                min="1"
                max="14"
                value={durationDays}
                onChange={(e) => setDurationDays(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 font-mono text-slate-200"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-300 uppercase tracking-wider">Est. Manhours</label>
              <input
                type="number"
                min="1"
                value={manhoursEst}
                onChange={(e) => setManhoursEst(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 font-mono text-slate-200"
              />
            </div>
          </div>

          <div className="flex items-center justify-between bg-slate-950 p-3 rounded-lg border border-slate-800">
            <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-300">
              <input
                type="checkbox"
                checked={isCriticalPath}
                onChange={(e) => setIsCriticalPath(e.target.checked)}
                className="accent-amber-400 w-4 h-4 rounded cursor-pointer"
              />
              <Zap className="w-4 h-4 text-amber-400" />
              <span>Mark as Critical Path Task</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-300">
              <input
                type="checkbox"
                checked={safetyPermitRequired}
                onChange={(e) => setSafetyPermitRequired(e.target.checked)}
                className="accent-amber-400 w-4 h-4 rounded cursor-pointer"
              />
              <Flame className="w-4 h-4 text-orange-400" />
              <span>Hot Work Permit Required</span>
            </label>
          </div>

          <div className="pt-2 flex justify-end gap-2 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-400 hover:text-slate-200 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold px-4 py-2 rounded-lg shadow-md transition-all"
            >
              Create Work Order
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
