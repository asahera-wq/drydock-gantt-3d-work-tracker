import { DrydockBay, GanttPhase, Task, TradeCategory, VesselZone, VesselComponentId, TaskStatus } from '../types';
import { tasks as rawJsTasks } from './tasks.js';

export const INITIAL_BAYS: DrydockBay[] = [
  {
    id: 'BAY-01',
    name: 'Graving Dock Alpha (Panamax)',
    location: 'North Yard - Berth 01',
    type: 'Graving Dock',
    maxDwtTons: 85000,
    vesselName: 'MV Pacific Titan',
    vesselType: 'Container Vessel (4,200 TEU)',
    vesselLengthMeters: 294,
    vesselBeamMeters: 32.2,
    vesselDraftMeters: 11.5,
    currentDay: 14,
    totalDays: 28,
  },
  {
    id: 'BAY-02',
    name: 'Floating Dock Bravo',
    location: 'South Yard - Dock 02',
    type: 'Floating Drydock',
    maxDwtTons: 35000,
    vesselName: 'MT Horizon Navigator',
    vesselType: 'Chemical Tanker',
    vesselLengthMeters: 182,
    vesselBeamMeters: 27.4,
    vesselDraftMeters: 8.2,
    currentDay: 6,
    totalDays: 18,
  },
  {
    id: 'BAY-03',
    name: 'Refit Basin Charlie',
    location: 'East Outfitting Pier',
    type: 'Outfitting Berth',
    maxDwtTons: 120000,
    vesselName: 'SS Caspian Express',
    vesselType: 'LNG Carrier',
    vesselLengthMeters: 288,
    vesselBeamMeters: 44.0,
    vesselDraftMeters: 12.0,
    currentDay: 21,
    totalDays: 35,
  }
];

export const GANTT_PHASES: GanttPhase[] = [
  { id: 'PHASE-1', name: 'Phase 1: Docking & Preparation', startDay: 1, endDay: 5 },
  { id: 'PHASE-2', name: 'Phase 2: High Pressure Waterjet & Blasting', startDay: 4, endDay: 10 },
  { id: 'PHASE-3', name: 'Phase 3: Hull Steel Repair & Welding', startDay: 8, endDay: 18 },
  { id: 'PHASE-4', name: 'Phase 4: Mechanical & Propulsion Systems', startDay: 10, endDay: 22 },
  { id: 'PHASE-5', name: 'Phase 5: Piping, Sea Chests & Overboards', startDay: 12, endDay: 24 },
  { id: 'PHASE-6', name: 'Phase 6: Anti-Fouling Paint System & Undocking', startDay: 20, endDay: 28 },
];

// Helper to map shipPart to zone
function getZoneForShipPart(shipPart: string): VesselZone {
  switch (shipPart) {
    case 'bow':
    case 'bow_thruster_housing':
    case 'masts':
      return 'Bow & Bulbous';
    case 'stern':
    case 'rudder':
    case 'propeller':
      return 'Stern & Rudder';
    case 'bridge':
    case 'accommodation_block':
    case 'funnel':
      return 'Engine Room';
    case 'cargo_deck':
    case 'hatch_covers':
      return 'Cargo Holds';
    case 'sea_chest':
    case 'ballast_tank_areas':
      return 'Keel & Sea Chests';
    case 'hull':
    default:
      return 'Midship Port';
  }
}

// Helper to map discipline to contractor
function getContractorForDiscipline(discipline: string): string {
  switch (discipline) {
    case 'Blasting & Coating': return 'AeroBlast Maritime Services';
    case 'Hull & Steelwork': return 'Ironclad Welders Co.';
    case 'Propulsion & Steering': return 'Apex Heavy Marine Engineering';
    case 'Piping & Valves': return 'AquaFlow Fluid Systems';
    case 'Electrical & Automation': return 'VoltCraft Marine Automation';
    case 'Docking & Rigging': return 'Pacific Docking Crew';
    case 'Safety & NDT Testing': return 'Vanguard NDT Solutions';
    default: return 'Global Marine Repair Ltd';
  }
}

// Transform the 50 tasks from tasks.js into full Task models
export const INITIAL_TASKS: Task[] = rawJsTasks.map((t: any, index: number) => {
  const dayNum = parseInt(t.plannedStart.split('-')[2], 10);
  const startDay = Math.max(1, dayNum);
  
  let phaseId = 'PHASE-1';
  if (startDay > 18) phaseId = 'PHASE-6';
  else if (startDay > 13) phaseId = 'PHASE-5';
  else if (startDay > 9) phaseId = 'PHASE-4';
  else if (startDay > 6) phaseId = 'PHASE-3';
  else if (startDay > 3) phaseId = 'PHASE-2';

  return {
    id: t.id,
    code: `WO-${String(index + 801).padStart(3, '0')}`,
    title: t.name,
    description: `${t.name} scheduled under ${t.workPackage}. Target component: ${t.shipPart.toUpperCase().replace('_', ' ')}. Planned dates: ${t.plannedStart} to ${t.plannedFinish}.`,
    phaseId,
    trade: t.discipline as TradeCategory,
    zone: getZoneForShipPart(t.shipPart),
    componentId: t.shipPart as VesselComponentId,
    contractor: getContractorForDiscipline(t.discipline),
    startDay,
    durationDays: t.duration,
    progress: t.progress,
    status: t.status as TaskStatus,
    isCriticalPath: index % 4 === 0,
    safetyPermitRequired: t.discipline !== 'Docking & Rigging',
    permitApproved: t.progress > 0,
    manhoursEst: t.duration * 16,
    manhoursSpent: Math.round((t.duration * 16 * t.progress) / 100),
    steelWeightTons: t.discipline === 'Hull & Steelwork' ? Math.round((index + 1) * 0.5 * 10) / 10 : undefined,
    ndtThicknessInitialMm: t.shipPart === 'hull' || t.shipPart === 'bow' ? 22.0 : undefined,
    ndtThicknessMinMm: t.shipPart === 'hull' || t.shipPart === 'bow' ? 15.5 : undefined,

    // Directly preserve all tasks.js fields
    name: t.name,
    discipline: t.discipline,
    workPackage: t.workPackage,
    plannedStart: t.plannedStart,
    plannedFinish: t.plannedFinish,
    duration: t.duration,
    shipPart: t.shipPart as VesselComponentId,
    cameraPosition: t.cameraPosition,
    targetPosition: t.targetPosition
  };
});

