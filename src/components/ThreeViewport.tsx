import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { VesselComponentId, ViewportMode, LightingPreset, Task } from '../types';
import { VesselMeshFactory, ComponentMeshMap } from './VesselMeshFactory';
import { VESSEL_COMPONENTS } from '../data/vesselData';
import { 
  Maximize2, 
  RotateCcw, 
  Eye, 
  Compass, 
  Layers, 
  Info, 
  Sliders, 
  Sun, 
  Moon, 
  Flame, 
  Sparkles, 
  Play, 
  Pause,
  Box,
  Crosshair
} from 'lucide-react';

interface ThreeViewportProps {
  selectedComponentId: VesselComponentId | null;
  onSelectComponent: (componentId: VesselComponentId | null) => void;
  tasks?: Task[];
  selectedTaskId?: string | null;
  onSelectTask?: (taskId: string) => void;
  onUpdateTask?: (updatedTask: Task) => void;
  viewportMode: ViewportMode;
  onViewportModeChange: (mode: ViewportMode) => void;
  lightingPreset: LightingPreset;
  onLightingPresetChange: (preset: LightingPreset) => void;
  explodeFactor: number;
  onExplodeFactorChange: (factor: number) => void;
  resetTrigger?: number;
}

export const getStatusColorHex = (status?: string): number => {
  switch (status) {
    case 'not_started':
      return 0xef4444; // Red = Not Started
    case 'in_progress':
      return 0xeab308; // Yellow = In Progress
    case 'delayed':
    case 'waiting':
      return 0x3b82f6; // Blue = Waiting
    case 'completed':
      return 0x10b981; // Green = Complete
    default:
      return 0xef4444;
  }
};

export const getComponentTaskStatus = (compId: VesselComponentId, taskList: Task[], activeTaskId?: string | null): string => {
  const compTasks = taskList.filter((t) => (t.shipPart || t.componentId) === compId);
  if (compTasks.length === 0) return 'not_started';

  if (activeTaskId) {
    const activeTask = compTasks.find((t) => t.id === activeTaskId);
    if (activeTask) return activeTask.status;
  }

  if (compTasks.some((t) => t.status === 'in_progress')) return 'in_progress';
  if (compTasks.some((t) => t.status === 'delayed' || t.status === 'waiting')) return 'delayed';
  if (compTasks.some((t) => t.status === 'not_started')) return 'not_started';
  if (compTasks.every((t) => t.status === 'completed')) return 'completed';

  return compTasks[0].status;
};

export const ThreeViewport: React.FC<ThreeViewportProps> = ({
  selectedComponentId,
  onSelectComponent,
  tasks = [],
  selectedTaskId = null,
  onSelectTask,
  onUpdateTask,
  viewportMode,
  onViewportModeChange,
  lightingPreset,
  onLightingPresetChange,
  explodeFactor,
  onExplodeFactorChange,
  resetTrigger = 0,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);

  const vesselGroupRef = useRef<THREE.Group | null>(null);
  const componentMapRef = useRef<ComponentMeshMap>({});
  const animFrameIdRef = useRef<number | null>(null);

  // Lighting References for Dynamic Presets
  const mainSunRef = useRef<THREE.DirectionalLight | null>(null);
  const hemiLightRef = useRef<THREE.HemisphereLight | null>(null);
  const fillLightRef = useRef<THREE.DirectionalLight | null>(null);
  const keelLightRef = useRef<THREE.PointLight | null>(null);

  // States
  const [hoveredComponent, setHoveredComponent] = useState<string | null>(null);
  const [isAnimatingMachinery, setIsAnimatingMachinery] = useState<boolean>(true);
  const [activeCameraPreset, setActiveCameraPreset] = useState<string>('ISO');
  const [showWaterPlane, setShowWaterPlane] = useState<boolean>(false);

  // Target camera position lerping
  const camPosTargetRef = useRef<THREE.Vector3 | null>(null);
  const camLookTargetRef = useRef<THREE.Vector3 | null>(null);

  // Reusable Raycaster & Vector2 instances to avoid GC pressure
  const raycasterRef = useRef<THREE.Raycaster>(new THREE.Raycaster());
  const mouseVecRef = useRef<THREE.Vector2>(new THREE.Vector2());

  // Helper for deep WebGL scene resource disposal
  const disposeObject = (obj: THREE.Object3D) => {
    obj.children.forEach((child) => disposeObject(child));
    if (obj instanceof THREE.Mesh) {
      if (obj.geometry) obj.geometry.dispose();
      if (obj.material) {
        if (Array.isArray(obj.material)) {
          obj.material.forEach((m) => m.dispose());
        } else {
          obj.material.dispose();
        }
      }
    }
  };

  // 1. Initialize Scene, Camera, Renderer, OrbitControls, and Lighting
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 900;
    const height = container.clientHeight || 550;

    // A. Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x080e1a);
    scene.fog = new THREE.FogExp2(0x080e1a, 0.015);
    sceneRef.current = scene;

    // B. Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(22, 14, 28);
    cameraRef.current = camera;

    // C. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;

    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // D. OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 + 0.1; // Allow viewing slightly beneath keel
    controls.minDistance = 5;
    controls.maxDistance = 120;
    controls.target.set(0, 2, 0);
    controlsRef.current = controls;

    // E. Lighting Setup
    // 1. Sky/Ground Hemisphere Light
    const hemiLight = new THREE.HemisphereLight(0x38bdf8, 0x0f172a, 0.7);
    hemiLight.position.set(0, 50, 0);
    scene.add(hemiLight);
    hemiLightRef.current = hemiLight;

    // 2. Directional Main Sun
    const mainSun = new THREE.DirectionalLight(0xfff7ed, 1.8);
    mainSun.position.set(25, 35, 20);
    mainSun.castShadow = true;
    mainSun.shadow.mapSize.width = 2048;
    mainSun.shadow.mapSize.height = 2048;
    mainSun.shadow.camera.near = 0.5;
    mainSun.shadow.camera.far = 120;
    mainSun.shadow.camera.left = -25;
    mainSun.shadow.camera.right = 25;
    mainSun.shadow.camera.top = 25;
    mainSun.shadow.camera.bottom = -25;
    scene.add(mainSun);
    mainSunRef.current = mainSun;

    // 3. Cool Cyan Fill Specular Light
    const fillLight = new THREE.DirectionalLight(0x06b6d4, 0.7);
    fillLight.position.set(-25, 15, -20);
    scene.add(fillLight);
    fillLightRef.current = fillLight;

    // 4. Under-Keel Ambient Light
    const keelLight = new THREE.PointLight(0xf59e0b, 1.2, 40);
    keelLight.position.set(0, -4, 0);
    scene.add(keelLight);
    keelLightRef.current = keelLight;

    // F. Drydock Concrete Platform & Grid
    const dockFloorGeo = new THREE.PlaneGeometry(60, 80);
    const dockFloorMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.85,
      metalness: 0.1,
    });
    const dockFloor = new THREE.Mesh(dockFloorGeo, dockFloorMat);
    dockFloor.rotation.x = -Math.PI / 2;
    dockFloor.position.y = -2.8;
    dockFloor.receiveShadow = true;
    scene.add(dockFloor);

    // Floor Grid Helper
    const grid = new THREE.GridHelper(60, 60, 0x0284c7, 0x1e293b);
    grid.position.y = -2.79;
    scene.add(grid);

    // Keel Blocks Assembly
    const blockGeo = new THREE.BoxGeometry(3.6, 0.8, 0.8);
    const blockMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.9 });
    const blockCapMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.6 });

    for (let z = -14; z <= 14; z += 2.2) {
      const block = new THREE.Mesh(blockGeo, blockMat);
      block.position.set(0, -2.4, z);
      block.castShadow = true;
      block.receiveShadow = true;

      const cap = new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.15, 0.7), blockCapMat);
      cap.position.set(0, -1.95, z);
      block.add(cap);

      scene.add(block);
    }

    // G. Construct 3D Low-Poly Vessel with 14 Component Meshes
    const { vesselGroup, componentMap } = VesselMeshFactory.createVessel();
    scene.add(vesselGroup);
    vesselGroupRef.current = vesselGroup;
    componentMapRef.current = componentMap;

    // H. Animation Render Loop
    let lastTime = performance.now();

    const animate = () => {
      animFrameIdRef.current = requestAnimationFrame(animate);

      const currentTime = performance.now();
      const delta = (currentTime - lastTime) / 1000;
      lastTime = currentTime;

      // Camera Lerp Position/Target smooth interpolation if specified
      const lerpSpeed = Math.min(1.0, 1 - Math.exp(-7 * delta));

      if (camPosTargetRef.current && cameraRef.current) {
        cameraRef.current.position.lerp(camPosTargetRef.current, lerpSpeed);
        if (cameraRef.current.position.distanceTo(camPosTargetRef.current) < 0.04) {
          cameraRef.current.position.copy(camPosTargetRef.current);
          camPosTargetRef.current = null;
        }
      }

      if (camLookTargetRef.current && controlsRef.current) {
        controlsRef.current.target.lerp(camLookTargetRef.current, lerpSpeed);
        if (controlsRef.current.target.distanceTo(camLookTargetRef.current) < 0.02) {
          controlsRef.current.target.copy(camLookTargetRef.current);
          camLookTargetRef.current = null;
        }
      }

      // Update OrbitControls after camera & target positions are interpolated
      if (controlsRef.current) {
        controlsRef.current.update();
      }

      // Rotate Machinery if active
      if (isAnimatingMachinery) {
        // Propeller spin
        const propGroup = componentMapRef.current['propeller'];
        if (propGroup) {
          const hub = propGroup.getObjectByName('propellerHubMesh');
          if (hub) hub.rotation.y += 0.06;
        }

        // Radar bar spin
        const mastsGroup = componentMapRef.current['masts'];
        if (mastsGroup) {
          const bar = mastsGroup.getObjectByName('radarScannerBar');
          if (bar) bar.rotation.y += 0.04;
        }

        // Bow Thruster Impeller spin
        const thrusterGroup = componentMapRef.current['bow_thruster_housing'];
        if (thrusterGroup) {
          const hub = thrusterGroup.getObjectByName('thrusterImpellerHub');
          if (hub) hub.rotation.x += 0.08;
        }
      }

      renderer.render(scene, camera);
    };

    animate();

    // Container Resize Observer
    const resizeObserver = new ResizeObserver(() => {
      if (!mountRef.current || !rendererRef.current || !cameraRef.current) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight;
      if (w === 0 || h === 0) return;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    });

    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
      if (sceneRef.current) {
        disposeObject(sceneRef.current);
      }
      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
    };
  }, []);

  // 2. Handle Lighting Preset Changes
  useEffect(() => {
    if (!sceneRef.current || !mainSunRef.current || !hemiLightRef.current || !fillLightRef.current) return;

    const scene = sceneRef.current;
    const sun = mainSunRef.current;
    const hemi = hemiLightRef.current;
    const fill = fillLightRef.current;

    switch (lightingPreset) {
      case 'daylight':
        scene.background = new THREE.Color(0x080e1a);
        scene.fog = new THREE.FogExp2(0x080e1a, 0.012);
        sun.color.setHex(0xfff7ed);
        sun.intensity = 1.8;
        sun.position.set(25, 35, 20);
        hemi.color.setHex(0x38bdf8);
        hemi.groundColor.setHex(0x0f172a);
        hemi.intensity = 0.7;
        fill.color.setHex(0x06b6d4);
        fill.intensity = 0.7;
        break;

      case 'golden_hour':
        scene.background = new THREE.Color(0x1a0f12);
        scene.fog = new THREE.FogExp2(0x1a0f12, 0.015);
        sun.color.setHex(0xf97316);
        sun.intensity = 2.4;
        sun.position.set(40, 12, 25);
        hemi.color.setHex(0xfbbf24);
        hemi.groundColor.setHex(0x31101e);
        hemi.intensity = 0.8;
        fill.color.setHex(0x9333ea);
        fill.intensity = 0.5;
        break;

      case 'night_drydock':
        scene.background = new THREE.Color(0x020617);
        scene.fog = new THREE.FogExp2(0x020617, 0.02);
        sun.color.setHex(0x38bdf8);
        sun.intensity = 0.4;
        sun.position.set(0, 40, 0);
        hemi.color.setHex(0x1e1b4b);
        hemi.groundColor.setHex(0x020617);
        hemi.intensity = 0.4;
        fill.color.setHex(0x3b82f6);
        fill.intensity = 1.2;
        break;

      case 'studio_clean':
        scene.background = new THREE.Color(0x0f172a);
        scene.fog = new THREE.FogExp2(0x0f172a, 0.008);
        sun.color.setHex(0xffffff);
        sun.intensity = 2.0;
        sun.position.set(0, 45, 30);
        hemi.color.setHex(0xffffff);
        hemi.groundColor.setHex(0x334155);
        hemi.intensity = 0.9;
        fill.color.setHex(0x94a3b8);
        fill.intensity = 0.9;
        break;
    }
  }, [lightingPreset]);

  // 3. Handle Viewport Mode & Dynamic Task Status Color Coding Changes
  useEffect(() => {
    if (!vesselGroupRef.current) return;

    vesselGroupRef.current.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        const componentId = child.userData.componentId as VesselComponentId;
        const mat = child.material as THREE.MeshStandardMaterial;

        if (!mat) return;

        // Determine Task Status & Color for this component
        const compTasks = tasks.filter((t) => (t.shipPart || t.componentId) === componentId);
        const hasMatchingTasks = compTasks.length > 0;
        const compStatus = getComponentTaskStatus(componentId, tasks, selectedTaskId);
        const statusHex = getStatusColorHex(compStatus);

        // Reset default transparency
        mat.transparent = !hasMatchingTasks;
        mat.opacity = hasMatchingTasks ? 1.0 : 0.2;
        mat.wireframe = false;

        if (viewportMode === 'wireframe') {
          mat.wireframe = true;
          mat.color.setHex(statusHex);
          if (!hasMatchingTasks) {
            mat.transparent = true;
            mat.opacity = 0.15;
          }
        } else if (viewportMode === 'cutaway') {
          mat.color.setHex(statusHex);
          // Make outer hull, bow, stern, and deck translucent to expose ballast tanks & sea chest
          if (componentId === 'hull' || componentId === 'bow' || componentId === 'stern' || componentId === 'cargo_deck') {
            mat.transparent = true;
            mat.opacity = hasMatchingTasks ? 0.22 : 0.08;
          }
        } else if (viewportMode === 'heatmap') {
          // Heatmap wastage simulation
          if (componentId === 'ballast_tank_areas' || componentId === 'sea_chest') {
            mat.color.setHex(0xef4444); // High corrosion / risk red
          } else if (componentId === 'rudder' || componentId === 'propeller') {
            mat.color.setHex(0xf59e0b); // Medium wastage amber
          } else {
            mat.color.setHex(0x10b981); // Green healthy steel
          }
          if (!hasMatchingTasks) {
            mat.transparent = true;
            mat.opacity = 0.2;
          }
        } else if (viewportMode === 'ballast_focus') {
          if (componentId === 'ballast_tank_areas') {
            mat.color.setHex(statusHex);
            mat.transparent = false;
            mat.opacity = 1.0;
            mat.emissive = new THREE.Color(0x0284c7);
            mat.emissiveIntensity = 0.5;
          } else {
            mat.color.setHex(statusHex);
            mat.transparent = true;
            mat.opacity = 0.15;
          }
        } else {
          // Standard Shaded - color code component directly according to Task Status (Red/Yellow/Blue/Green)
          mat.color.setHex(statusHex);
          if (!hasMatchingTasks) {
            mat.transparent = true;
            mat.opacity = 0.2;
          }
        }

        mat.needsUpdate = true;
      }
    });
  }, [viewportMode, tasks, selectedTaskId]);

  // 4. Handle Exploded View Factor
  useEffect(() => {
    const map = componentMapRef.current;
    if (!map) return;

    VESSEL_COMPONENTS.forEach((spec) => {
      const group = map[spec.id];
      if (group && spec.explodeDirection) {
        const [dx, dy, dz] = spec.explodeDirection;
        const targetX = dx * explodeFactor * 4.5;
        const targetY = dy * explodeFactor * 4.5;
        const targetZ = dz * explodeFactor * 4.5;

        group.position.set(targetX, targetY, targetZ);
      }
    });
  }, [explodeFactor]);

  // 5. Handle Highlight & Emissive for Selected Task / Component
  useEffect(() => {
    const map = componentMapRef.current;
    if (!map) return;

    // Find active task and its associated shipPart mesh ID
    const currentTask = tasks.find((t) => t.id === selectedTaskId);
    const activeCompId = (currentTask?.shipPart || currentTask?.componentId || selectedComponentId) as VesselComponentId | undefined;

    Object.keys(map).forEach((id) => {
      const group = map[id];
      const isSelected = id === activeCompId;
      const isHovered = id === hoveredComponent;

      group.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          const mat = child.material as THREE.MeshStandardMaterial;
          if (mat && mat.emissive) {
            if (isSelected) {
              // Highlight selected mesh with electric cyan glow
              mat.emissive.setHex(0x00f0ff);
              mat.emissiveIntensity = 0.85;
            } else if (isHovered) {
              // Subtle amber hover glow
              mat.emissive.setHex(0xf59e0b);
              mat.emissiveIntensity = 0.35;
            } else {
              // Reset previous highlight completely
              mat.emissive.setHex(0x000000);
              mat.emissiveIntensity = 0;
            }
          }
        }
      });
    });

    // Camera animation to focus on selected task's cameraPosition & targetPosition
    if (currentTask && currentTask.cameraPosition && currentTask.targetPosition) {
      camPosTargetRef.current = new THREE.Vector3(...currentTask.cameraPosition);
      camLookTargetRef.current = new THREE.Vector3(...currentTask.targetPosition);
    } else if (activeCompId) {
      const group = map[activeCompId];
      if (group) {
        const bbox = new THREE.Box3().setFromObject(group);
        const center = new THREE.Vector3();
        bbox.getCenter(center);

        camLookTargetRef.current = center;
        camPosTargetRef.current = new THREE.Vector3(center.x + 12, center.y + 8, center.z + 14);
      }
    }
  }, [selectedTaskId, selectedComponentId, hoveredComponent, tasks]);

  // 6. Reset Camera Trigger
  useEffect(() => {
    if (resetTrigger > 0 && controlsRef.current && cameraRef.current) {
      camLookTargetRef.current = new THREE.Vector3(0, 2, 0);
      camPosTargetRef.current = new THREE.Vector3(22, 14, 28);
      onSelectComponent(null);
      setActiveCameraPreset('ISO');
      onExplodeFactorChange(0);
    }
  }, [resetTrigger]);

  // 7. Raycasting for Clicking 3D Component Meshes
  const handleCanvasClick = (e: React.MouseEvent) => {
    if (!mountRef.current || !cameraRef.current || !vesselGroupRef.current) return;

    const rect = mountRef.current.getBoundingClientRect();
    const mouse = mouseVecRef.current;
    mouse.set(
      ((e.clientX - rect.left) / rect.width) * 2 - 1,
      -((e.clientY - rect.top) / rect.height) * 2 + 1
    );

    const raycaster = raycasterRef.current;
    raycaster.setFromCamera(mouse, cameraRef.current);

    const intersects = raycaster.intersectObjects(vesselGroupRef.current.children, true);

    if (intersects.length > 0) {
      let obj: THREE.Object3D | null = intersects[0].object;
      while (obj && !obj.userData.componentId && obj.parent) {
        obj = obj.parent;
      }
      if (obj && obj.userData.componentId) {
        const compId = obj.userData.componentId as VesselComponentId;
        onSelectComponent(compId);

        // Find corresponding task for this mesh
        const matchingTask = tasks.find(
          (t) => (t.shipPart || t.componentId) === compId
        );
        if (matchingTask && onSelectTask) {
          onSelectTask(matchingTask.id);
        }
      }
    } else {
      onSelectComponent(null);
      if (onSelectTask) {
        onSelectTask('');
      }
    }
  };

  // Hover detection
  const handleCanvasMouseMove = (e: React.MouseEvent) => {
    if (!mountRef.current || !cameraRef.current || !vesselGroupRef.current) return;

    const rect = mountRef.current.getBoundingClientRect();
    const mouse = mouseVecRef.current;
    mouse.set(
      ((e.clientX - rect.left) / rect.width) * 2 - 1,
      -((e.clientY - rect.top) / rect.height) * 2 + 1
    );

    const raycaster = raycasterRef.current;
    raycaster.setFromCamera(mouse, cameraRef.current);

    const intersects = raycaster.intersectObjects(vesselGroupRef.current.children, true);

    if (intersects.length > 0) {
      let obj: THREE.Object3D | null = intersects[0].object;
      while (obj && !obj.userData.componentId && obj.parent) {
        obj = obj.parent;
      }
      if (obj && obj.userData.componentId) {
        setHoveredComponent(obj.userData.componentId);
      } else {
        setHoveredComponent(null);
      }
    } else {
      setHoveredComponent(null);
    }
  };

  // Camera Preset Switcher
  const applyPresetView = (preset: string) => {
    setActiveCameraPreset(preset);

    switch (preset) {
      case 'ISO':
        camLookTargetRef.current = new THREE.Vector3(0, 2, 0);
        camPosTargetRef.current = new THREE.Vector3(22, 14, 28);
        break;
      case 'Bow':
        camLookTargetRef.current = new THREE.Vector3(0, 1, 10);
        camPosTargetRef.current = new THREE.Vector3(0, 4, 32);
        break;
      case 'Stern':
        camLookTargetRef.current = new THREE.Vector3(0, -1, -11);
        camPosTargetRef.current = new THREE.Vector3(0, 2, -32);
        break;
      case 'Portside':
        camLookTargetRef.current = new THREE.Vector3(0, 2, 0);
        camPosTargetRef.current = new THREE.Vector3(-34, 4, 0);
        break;
      case 'Keel':
        camLookTargetRef.current = new THREE.Vector3(0, -1, 0);
        camPosTargetRef.current = new THREE.Vector3(0, -18, 12);
        break;
      case 'Deck':
        camLookTargetRef.current = new THREE.Vector3(0, 2, 0);
        camPosTargetRef.current = new THREE.Vector3(0, 38, 0.1);
        break;
    }
  };

  const selectedSpec = VESSEL_COMPONENTS.find((c) => c.id === selectedComponentId);
  const selectedTask = tasks.find((t) => t.id === selectedTaskId);

  return (
    <div id="three-viewport-container" className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl flex flex-col relative h-full w-full flex-1 min-h-[400px]">
      {/* HUD Header Bar */}
      <div id="three-hud-header" className="bg-slate-950/90 backdrop-blur-md border-b border-slate-800 px-3 py-2 flex flex-wrap items-center justify-between text-xs z-10 gap-2">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
          <span className="font-bold text-slate-100 tracking-wider font-mono text-[11px] uppercase">
            3D Low-Poly Cargo Vessel Viewport
          </span>
          <span className="text-[10px] text-slate-400 font-mono hidden md:inline">
            (14 Isolated Primitive Meshes)
          </span>
        </div>

        {/* View Controls & Lighting Buttons */}
        <div className="flex items-center gap-2">
          {/* Lighting Selector */}
          <div className="flex items-center bg-slate-900 border border-slate-800 p-0.5 rounded-md">
            <span className="text-[10px] text-slate-500 px-1 font-bold flex items-center gap-1">
              <Sun className="w-3 h-3 text-amber-400" /> Light:
            </span>
            {(['daylight', 'golden_hour', 'night_drydock', 'studio_clean'] as LightingPreset[]).map((preset) => (
              <button
                key={preset}
                onClick={() => onLightingPresetChange(preset)}
                className={`px-1.5 py-0.5 rounded text-[10px] font-mono capitalize transition-colors ${
                  lightingPreset === preset
                    ? 'bg-cyan-500 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                {preset.replace('_', ' ')}
              </button>
            ))}
          </div>

          {/* Camera Presets */}
          <div className="flex items-center bg-slate-900 border border-slate-800 p-0.5 rounded-md">
            <span className="text-[10px] text-slate-500 px-1 font-bold">Cam:</span>
            {['ISO', 'Bow', 'Portside', 'Stern', 'Keel', 'Deck'].map((preset) => (
              <button
                key={preset}
                onClick={() => applyPresetView(preset)}
                className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold transition-colors ${
                  activeCameraPreset === preset
                    ? 'bg-amber-400 text-slate-950'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                {preset}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Canvas Mount */}
      <div
        ref={mountRef}
        onClick={handleCanvasClick}
        onMouseMove={handleCanvasMouseMove}
        className="w-full h-full cursor-grab active:cursor-grabbing relative select-none"
      >
        {/* Floating Controls Toolbar (Exploded Slider & Mode Toggles) */}
        <div id="three-floating-controls" className="absolute top-3 right-3 bg-slate-950/90 backdrop-blur-md border border-slate-800 rounded-lg p-2.5 z-10 flex flex-col gap-2.5 w-56 shadow-xl">
          {/* Exploded View Slider */}
          <div>
            <div className="flex items-center justify-between text-[11px] font-mono font-bold mb-1 text-slate-200">
              <span className="flex items-center gap-1.5 text-cyan-400">
                <Box className="w-3.5 h-3.5" /> Exploded View:
              </span>
              <span className="text-amber-400">{Math.round(explodeFactor * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.02"
              value={explodeFactor}
              onChange={(e) => onExplodeFactorChange(parseFloat(e.target.value))}
              className="w-full accent-cyan-400 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          {/* Viewport Render Mode Selector */}
          <div>
            <span className="text-[10px] font-mono text-slate-400 uppercase font-bold block mb-1">
              Render Mode:
            </span>
            <div className="grid grid-cols-2 gap-1 text-[10px] font-mono">
              {[
                { id: 'shaded', label: 'Shaded' },
                { id: 'wireframe', label: 'Wireframe' },
                { id: 'cutaway', label: 'Cutaway X-Ray' },
                { id: 'ballast_focus', label: 'Ballast Focus' },
              ].map((m) => (
                <button
                  key={m.id}
                  onClick={() => onViewportModeChange(m.id as ViewportMode)}
                  className={`px-2 py-1 rounded text-center transition-colors border ${
                    viewportMode === m.id
                      ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/50 font-bold'
                      : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800 hover:text-slate-200'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* Animate Machinery Toggle */}
          <div className="flex items-center justify-between pt-1 border-t border-slate-800 text-[11px] text-slate-300">
            <span className="flex items-center gap-1 text-slate-400">
              Machinery Spin
            </span>
            <button
              onClick={() => setIsAnimatingMachinery(!isAnimatingMachinery)}
              className={`p-1 rounded text-xs flex items-center gap-1 px-2 font-mono ${
                isAnimatingMachinery
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                  : 'bg-slate-800 text-slate-400'
              }`}
            >
              {isAnimatingMachinery ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
              {isAnimatingMachinery ? 'ON' : 'OFF'}
            </button>
          </div>
        </div>

        {/* Floating Task Information Panel Overlay */}
        {selectedTask ? (
          <div
            id="floating-task-info-panel"
            className="absolute top-3 left-3 bg-slate-950/95 backdrop-blur-md border border-cyan-400/60 rounded-xl p-3.5 max-w-sm w-80 shadow-2xl z-20 space-y-2.5 text-slate-100 animate-in fade-in zoom-in-95 duration-200"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-1.5 font-mono text-[11px] font-bold">
                <span className="px-2 py-0.5 bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 rounded uppercase">
                  {selectedTask.code || selectedTask.id}
                </span>
                <span className="text-slate-600">|</span>
                <span className="text-amber-400 truncate max-w-[130px]">{selectedTask.discipline || selectedTask.trade}</span>
              </div>
              <button
                onClick={() => {
                  if (onSelectTask) onSelectTask('');
                  onSelectComponent(null);
                }}
                className="text-slate-400 hover:text-slate-100 text-xs font-mono font-bold px-1 py-0.5 rounded hover:bg-slate-800 transition-colors"
                title="Deselect Task"
              >
                ✕ Close
              </button>
            </div>

            {/* Title & Work Package */}
            <div>
              <h3 className="text-sm font-bold text-slate-100 leading-snug flex items-start gap-1.5">
                <Crosshair className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5 animate-pulse" />
                <span>{selectedTask.name || selectedTask.title}</span>
              </h3>
              <p className="text-[11px] font-mono text-slate-400 mt-1">
                📦 {selectedTask.workPackage || selectedTask.zone}
              </p>
            </div>

            {/* Mesh Component & Status row */}
            <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
              <div className="bg-slate-900/90 p-2 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase block font-bold">Target Mesh</span>
                <span className="text-cyan-300 font-bold truncate block">
                  {(selectedTask.shipPart || selectedTask.componentId || 'vessel').toUpperCase().replace('_', ' ')}
                </span>
              </div>
              <div className="bg-slate-900/90 p-2 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase block font-bold">Status</span>
                <span className={`font-bold capitalize block ${
                  selectedTask.status === 'completed' ? 'text-emerald-400' :
                  selectedTask.status === 'in_progress' ? 'text-yellow-400' :
                  (selectedTask.status === 'delayed' || selectedTask.status === 'waiting') ? 'text-blue-400' : 'text-red-400'
                }`}>
                  {selectedTask.status === 'delayed' ? 'Waiting' : selectedTask.status.replace('_', ' ')}
                </span>
              </div>
            </div>

            {/* Quick Status Selector */}
            {onUpdateTask && (
              <div className="space-y-1 pt-1">
                <span className="text-[10px] font-mono text-slate-400 uppercase font-bold block">Update Task Status:</span>
                <div className="grid grid-cols-4 gap-1 text-[10px] font-mono">
                  {[
                    { id: 'not_started', label: 'Not Started', color: 'bg-red-500/20 text-red-400 border-red-500/50' },
                    { id: 'in_progress', label: 'In Progress', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50' },
                    { id: 'delayed', label: 'Waiting', color: 'bg-blue-500/20 text-blue-400 border-blue-500/50' },
                    { id: 'completed', label: 'Complete', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50' },
                  ].map((st) => (
                    <button
                      key={st.id}
                      onClick={() => {
                        onUpdateTask({
                          ...selectedTask,
                          status: st.id as any,
                          progress: st.id === 'completed' ? 100 : st.id === 'not_started' ? 0 : selectedTask.progress || 50,
                        });
                      }}
                      className={`py-1 rounded text-center transition-all border ${
                        (selectedTask.status === st.id || (st.id === 'delayed' && selectedTask.status === 'waiting'))
                          ? `${st.color} font-bold ring-1 ring-white/30`
                          : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800 hover:text-slate-200'
                      }`}
                    >
                      {st.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Progress bar */}
            <div>
              <div className="flex justify-between text-[10px] font-mono mb-1 font-bold">
                <span className="text-slate-400">Repair Progress:</span>
                <span className="text-cyan-400">{selectedTask.progress}%</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden border border-slate-700/60">
                <div
                  className="bg-gradient-to-r from-cyan-500 to-emerald-400 h-full transition-all duration-500"
                  style={{ width: `${selectedTask.progress}%` }}
                />
              </div>
            </div>

            {/* Schedule Dates */}
            <div className="bg-slate-900/70 p-2 rounded-lg border border-slate-800 text-[10px] font-mono flex items-center justify-between text-slate-300">
              <div>
                <span className="text-slate-500 block">Planned Window:</span>
                <span>{selectedTask.plannedStart || `Day ${selectedTask.startDay}`} ➔ {selectedTask.plannedFinish || `Day ${selectedTask.startDay + selectedTask.durationDays}`}</span>
              </div>
              <div className="text-right">
                <span className="text-slate-500 block">Duration:</span>
                <span className="text-amber-400 font-bold">{selectedTask.duration || selectedTask.durationDays} Days</span>
              </div>
            </div>

            {/* Camera coordinates badge */}
            {selectedTask.cameraPosition && (
              <div className="text-[9px] font-mono text-slate-400 bg-slate-900/50 p-1.5 rounded border border-slate-800/60 flex items-center justify-between">
                <span>Cam: [{selectedTask.cameraPosition.join(', ')}]</span>
                <span>Target: [{selectedTask.targetPosition?.join(', ')}]</span>
              </div>
            )}

            {/* Action Button */}
            <div className="flex items-center gap-2 pt-0.5">
              <button
                onClick={() => {
                  if (selectedTask.cameraPosition && selectedTask.targetPosition) {
                    camPosTargetRef.current = new THREE.Vector3(...selectedTask.cameraPosition);
                    camLookTargetRef.current = new THREE.Vector3(...selectedTask.targetPosition);
                  }
                }}
                className="w-full py-1.5 px-2 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 rounded-lg text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-colors"
              >
                <Crosshair className="w-3.5 h-3.5" /> Re-center 3D View
              </button>
            </div>
          </div>
        ) : selectedSpec ? (
          <div id="selected-component-hud" className="absolute top-3 left-3 bg-slate-950/90 backdrop-blur-md border border-cyan-500/50 rounded-xl p-3.5 max-w-sm shadow-2xl z-10 space-y-2.5 text-slate-100">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 rounded uppercase">
                {selectedSpec.category}
              </span>
              <button
                onClick={() => onSelectComponent(null)}
                className="text-slate-400 hover:text-slate-100 text-xs font-mono font-bold px-1"
              >
                ✕ Close
              </button>
            </div>

            <div>
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-1.5">
                <Crosshair className="w-4 h-4 text-amber-400" />
                {selectedSpec.name}
              </h3>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                {selectedSpec.description}
              </p>
            </div>

            <div className="bg-slate-900/90 p-2 rounded-lg border border-slate-800/80 space-y-1 text-[11px] font-mono">
              <div className="text-slate-400">
                Primitives: <span className="text-amber-400 font-medium">{selectedSpec.primitivesUsed.join(', ')}</span>
              </div>
              <div className="text-slate-400">
                Dimensions: <span className="text-slate-200">{selectedSpec.dimensions}</span>
              </div>
              <div className="text-slate-400">
                Material: <span className="text-slate-200">{selectedSpec.materialSpec}</span>
              </div>
              <div className="text-slate-400">
                Status: <span className="text-emerald-400 font-bold">{selectedSpec.maintenanceStatus}</span>
              </div>
            </div>

            <p className="text-[10px] text-slate-400 italic bg-slate-900/50 p-1.5 rounded border border-slate-800/50">
              💡 {selectedSpec.engineeringNotes}
            </p>
          </div>
        ) : null}

        {/* Hovered Component Name Banner */}
        {hoveredComponent && !selectedSpec && (
          <div className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-md border border-amber-500/40 rounded-lg px-3 py-1.5 text-xs text-amber-400 font-mono font-bold flex items-center gap-2 z-10">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" />
            Click to Inspect: {VESSEL_COMPONENTS.find((c) => c.id === hoveredComponent)?.name}
          </div>
        )}

        {/* Bottom Orbit Controls Instructions & Status Legend */}
        <div id="three-bottom-instructions" className="absolute bottom-3 left-3 flex flex-wrap items-center gap-2 z-10">
          <div className="bg-slate-950/90 backdrop-blur-md border border-slate-800 rounded-lg px-3 py-1.5 text-[10px] text-slate-300 flex items-center gap-3 font-mono shadow-xl">
            <span className="text-slate-500 font-bold uppercase text-[9px]">Status Legend:</span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block"></span> Not Started
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-400 inline-block"></span> In Progress
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block"></span> Waiting
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span> Complete
            </span>
          </div>

          <div className="bg-slate-950/80 backdrop-blur-md border border-slate-800 rounded-lg px-3 py-1.5 text-[10px] text-slate-400 flex items-center gap-3 shadow-xl">
            <span className="flex items-center gap-1">
              <Compass className="w-3.5 h-3.5 text-amber-400" /> Left Drag: Orbit
            </span>
            <span className="text-slate-700">|</span>
            <span>Right Drag: Pan</span>
            <span className="text-slate-700">|</span>
            <span>Scroll: Zoom</span>
            <span className="text-slate-700">|</span>
            <span className="text-cyan-400 font-medium">Click Mesh: Select</span>
          </div>
        </div>
      </div>
    </div>
  );
};
