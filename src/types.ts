export type VesselComponentId =
  | 'hull'
  | 'bow'
  | 'stern'
  | 'bridge'
  | 'accommodation_block'
  | 'funnel'
  | 'masts'
  | 'rudder'
  | 'propeller'
  | 'bow_thruster_housing'
  | 'cargo_deck'
  | 'hatch_covers'
  | 'sea_chest'
  | 'ballast_tank_areas';

export interface VesselComponentSpec {
  id: VesselComponentId;
  name: string;
  category: string;
  location: string;
  primitivesUsed: string[];
  dimensions: string;
  materialSpec: string;
  maintenanceStatus: 'Good Condition' | 'Scheduled Inspection' | 'Overhaul Required' | 'Active Maintenance';
  description: string;
  engineeringNotes: string;
  explodeDirection: [number, number, number]; // Vector direction when exploded
}

export type ViewportMode = 'shaded' | 'wireframe' | 'cutaway' | 'heatmap' | 'ballast_focus';

export type LightingPreset = 'daylight' | 'golden_hour' | 'night_drydock' | 'studio_clean';

export type TaskStatus = 'completed' | 'in_progress' | 'delayed' | 'not_started' | 'waiting';

export type TradeCategory = 
  | 'Hull & Steelwork'
  | 'Blasting & Coating'
  | 'Piping & Valves'
  | 'Propulsion & Steering'
  | 'Electrical & Automation'
  | 'Docking & Rigging';

export type VesselZone = 
  | 'Bow & Bulbous'
  | 'Midship Port'
  | 'Midship Starboard'
  | 'Stern & Rudder'
  | 'Engine Room'
  | 'Cargo Holds'
  | 'Main Deck'
  | 'Keel & Sea Chests';

export interface Task {
  id: string;
  code: string;
  title: string;
  description: string;
  phaseId: string;
  trade: TradeCategory;
  zone: VesselZone;
  componentId?: VesselComponentId;
  contractor: string;
  startDay: number;
  durationDays: number;
  progress: number;
  status: TaskStatus;
  isCriticalPath: boolean;
  hotspotId?: string;
  hotspotPos?: [number, number, number];
  safetyPermitRequired: boolean;
  permitApproved?: boolean;
  manhoursEst: number;
  manhoursSpent: number;
  steelWeightTons?: number;
  ndtThicknessInitialMm?: number;
  ndtThicknessMinMm?: number;
  name?: string;
  discipline?: string;
  workPackage?: string;
  plannedStart?: string;
  plannedFinish?: string;
  duration?: number;
  shipPart?: VesselComponentId;
  cameraPosition?: [number, number, number];
  targetPosition?: [number, number, number];
}

export interface GanttPhase {
  id: string;
  name: string;
  startDay: number;
  endDay: number;
}

export interface DrydockBay {
  id: string;
  name: string;
  location: string;
  type: string;
  maxDwtTons: number;
  vesselName: string;
  vesselType: string;
  vesselLengthMeters: number;
  vesselBeamMeters: number;
  vesselDraftMeters: number;
  currentDay: number;
  totalDays: number;
}

export interface FilterState {
  searchQuery: string;
  trade: TradeCategory | 'ALL';
  discipline: string | 'ALL';
  workPackage: string | 'ALL';
  zone: VesselZone | 'ALL';
  shipPart: VesselComponentId | 'ALL';
  status: TaskStatus | 'ALL';
  minProgress: number; // 0-100
  maxProgress: number; // 0-100
  criticalPathOnly: boolean;
}
