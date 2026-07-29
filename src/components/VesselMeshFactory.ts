import * as THREE from 'three';
import { VesselComponentId } from '../types';
import { VESSEL_COMPONENTS } from '../data/vesselData';

export interface ComponentMeshMap {
  [key: string]: THREE.Group;
}

export class VesselMeshFactory {
  // Color Palette for Low-Poly Industrial Cargo Vessel
  static COLORS = {
    hullRed: 0x991b1b,        // Anti-fouling red bottom hull
    hullDarkSlate: 0x1e293b,  // Topsides dark charcoal/slate
    whiteSuperstructure: 0xf8fafc, // Clean white superstructure
    deckGreen: 0x15803d,     // Traditional green cargo deck coating
    hatchGrey: 0x334155,      // Dark slate hatch covers
    funnelRed: 0xef4444,     // Bright red funnel casing
    funnelBlack: 0x0f172a,   // Funnel exhaust top
    propellerBronze: 0xd97706, // Polished bronze propeller
    rudderSteel: 0x475569,   // Steel rudder blade
    glassBlue: 0x0284c7,     // Tinted bridge windows
    mastsWhite: 0xe2e8f0,    // White steel masts
    seaChestGold: 0xeab308,  // Zinc yellow/gold strainer grate
    ballastCyan: 0x06b6d4,   // Semi-transparent cyan ballast water tanks
    containerAmber: 0xd97706,
    containerBlue: 0x2563eb,
    containerRed: 0xd97706,
    containerGreen: 0x16a34a,
  };

  /**
   * Builds the entire vessel as a parent group containing 14 distinct component sub-groups.
   */
  static createVessel(): { vesselGroup: THREE.Group; componentMap: ComponentMeshMap } {
    const vesselGroup = new THREE.Group();
    vesselGroup.name = 'CargoVesselMainGroup';

    const componentMap: ComponentMeshMap = {};

    // 1. Main Hull Structure
    const hullGroup = VesselMeshFactory.createHull();
    vesselGroup.add(hullGroup);
    componentMap['hull'] = hullGroup;

    // 2. Bulbous Bow & Stem
    const bowGroup = VesselMeshFactory.createBow();
    vesselGroup.add(bowGroup);
    componentMap['bow'] = bowGroup;

    // 3. Stern & Transom
    const sternGroup = VesselMeshFactory.createStern();
    vesselGroup.add(sternGroup);
    componentMap['stern'] = sternGroup;

    // 4. Bridge & Wheelhouse
    const bridgeGroup = VesselMeshFactory.createBridge();
    vesselGroup.add(bridgeGroup);
    componentMap['bridge'] = bridgeGroup;

    // 5. Accommodation Block
    const accommodationGroup = VesselMeshFactory.createAccommodationBlock();
    vesselGroup.add(accommodationGroup);
    componentMap['accommodation_block'] = accommodationGroup;

    // 6. Funnel
    const funnelGroup = VesselMeshFactory.createFunnel();
    vesselGroup.add(funnelGroup);
    componentMap['funnel'] = funnelGroup;

    // 7. Masts
    const mastsGroup = VesselMeshFactory.createMasts();
    vesselGroup.add(mastsGroup);
    componentMap['masts'] = mastsGroup;

    // 8. Rudder
    const rudderGroup = VesselMeshFactory.createRudder();
    vesselGroup.add(rudderGroup);
    componentMap['rudder'] = rudderGroup;

    // 9. Propeller
    const propellerGroup = VesselMeshFactory.createPropeller();
    vesselGroup.add(propellerGroup);
    componentMap['propeller'] = propellerGroup;

    // 10. Bow Thruster Housing
    const thrusterGroup = VesselMeshFactory.createBowThrusterHousing();
    vesselGroup.add(thrusterGroup);
    componentMap['bow_thruster_housing'] = thrusterGroup;

    // 11. Cargo Deck
    const cargoDeckGroup = VesselMeshFactory.createCargoDeck();
    vesselGroup.add(cargoDeckGroup);
    componentMap['cargo_deck'] = cargoDeckGroup;

    // 12. Hatch Covers
    const hatchCoversGroup = VesselMeshFactory.createHatchCovers();
    vesselGroup.add(hatchCoversGroup);
    componentMap['hatch_covers'] = hatchCoversGroup;

    // 13. Sea Chest
    const seaChestGroup = VesselMeshFactory.createSeaChest();
    vesselGroup.add(seaChestGroup);
    componentMap['sea_chest'] = seaChestGroup;

    // 14. Ballast Tank Areas
    const ballastGroup = VesselMeshFactory.createBallastTankAreas();
    vesselGroup.add(ballastGroup);
    componentMap['ballast_tank_areas'] = ballastGroup;

    return { vesselGroup, componentMap };
  }

  // -------------------------------------------------------------
  // 1. HULL (Midship Plating & Double Bottom)
  // -------------------------------------------------------------
  private static createHull(): THREE.Group {
    const group = new THREE.Group();
    group.name = 'hull';
    group.userData = { componentId: 'hull', name: 'Main Hull Structure' };

    const topMat = new THREE.MeshStandardMaterial({
      color: VesselMeshFactory.COLORS.hullDarkSlate,
      roughness: 0.4,
      metalness: 0.5,
    });

    const bottomMat = new THREE.MeshStandardMaterial({
      color: VesselMeshFactory.COLORS.hullRed,
      roughness: 0.5,
      metalness: 0.3,
    });

    // Topsides Hull Box
    const topHullGeo = new THREE.BoxGeometry(6.6, 1.8, 18.0);
    const topHull = new THREE.Mesh(topHullGeo, topMat);
    topHull.position.set(0, 0.9, 0);
    topHull.castShadow = true;
    topHull.receiveShadow = true;
    group.add(topHull);

    // Bottom Anti-Fouling Red Hull Box
    const botHullGeo = new THREE.BoxGeometry(6.4, 1.6, 18.0);
    const botHull = new THREE.Mesh(botHullGeo, bottomMat);
    botHull.position.set(0, -0.8, 0);
    botHull.castShadow = true;
    botHull.receiveShadow = true;
    group.add(botHull);

    // Flat Keel Plate
    const keelGeo = new THREE.BoxGeometry(3.2, 0.25, 18.2);
    const keelMat = new THREE.MeshStandardMaterial({ color: 0x450a0a, roughness: 0.8 });
    const keel = new THREE.Mesh(keelGeo, keelMat);
    keel.position.set(0, -1.72, 0);
    group.add(keel);

    // Bilge Turn Strips (Port & Starboard rotated boxes)
    const bilgeGeo = new THREE.BoxGeometry(0.7, 0.7, 18.0);
    const portBilge = new THREE.Mesh(bilgeGeo, bottomMat);
    portBilge.position.set(-3.0, -1.4, 0);
    portBilge.rotation.z = Math.PI / 4;
    group.add(portBilge);

    const stbdBilge = new THREE.Mesh(bilgeGeo, bottomMat);
    stbdBilge.position.set(3.0, -1.4, 0);
    stbdBilge.rotation.z = -Math.PI / 4;
    group.add(stbdBilge);

    VesselMeshFactory.attachComponentMetadata(group, 'hull');
    return group;
  }

  // -------------------------------------------------------------
  // 2. BOW (Bulbous Bow & Stem)
  // -------------------------------------------------------------
  private static createBow(): THREE.Group {
    const group = new THREE.Group();
    group.name = 'bow';
    group.userData = { componentId: 'bow', name: 'Bulbous Bow & Stem' };

    const topMat = new THREE.MeshStandardMaterial({
      color: VesselMeshFactory.COLORS.hullDarkSlate,
      roughness: 0.4,
      metalness: 0.5,
    });

    const bottomMat = new THREE.MeshStandardMaterial({
      color: VesselMeshFactory.COLORS.hullRed,
      roughness: 0.5,
      metalness: 0.3,
    });

    // Bulbous Bow Sphere (Elongated along Z)
    const bulbGeo = new THREE.SphereGeometry(1.4, 16, 16);
    bulbGeo.scale(0.7, 0.85, 2.2);
    const bulb = new THREE.Mesh(bulbGeo, bottomMat);
    bulb.position.set(0, -0.85, 11.2);
    bulb.castShadow = true;
    group.add(bulb);

    // Bow Forward Stem Wedge (Tapering forward)
    const stemGeo = new THREE.ConeGeometry(3.3, 5.2, 4);
    const stem = new THREE.Mesh(stemGeo, topMat);
    stem.rotation.x = Math.PI / 2;
    stem.rotation.y = Math.PI / 4;
    stem.position.set(0, 0.9, 10.8);
    stem.castShadow = true;
    group.add(stem);

    // Anchor Hawse Pipes (Cylinders angled outward)
    const pipeGeo = new THREE.CylinderGeometry(0.28, 0.28, 1.8, 12);
    const pipeMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.8 });

    const portPipe = new THREE.Mesh(pipeGeo, pipeMat);
    portPipe.position.set(-1.8, 1.1, 10.4);
    portPipe.rotation.z = -Math.PI / 3;
    portPipe.rotation.x = Math.PI / 6;
    group.add(portPipe);

    const stbdPipe = new THREE.Mesh(pipeGeo, pipeMat);
    stbdPipe.position.set(1.8, 1.1, 10.4);
    stbdPipe.rotation.z = Math.PI / 3;
    stbdPipe.rotation.x = Math.PI / 6;
    group.add(stbdPipe);

    // Stockless Anchors
    const anchorGeo = new THREE.BoxGeometry(0.5, 0.8, 0.4);
    const anchorMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8 });
    const portAnchor = new THREE.Mesh(anchorGeo, anchorMat);
    portAnchor.position.set(-2.2, 0.8, 10.4);
    group.add(portAnchor);

    const stbdAnchor = new THREE.Mesh(anchorGeo, anchorMat);
    stbdAnchor.position.set(2.2, 0.8, 10.4);
    group.add(stbdAnchor);

    VesselMeshFactory.attachComponentMetadata(group, 'bow');
    return group;
  }

  // -------------------------------------------------------------
  // 3. STERN (Aft Transom & Counter)
  // -------------------------------------------------------------
  private static createStern(): THREE.Group {
    const group = new THREE.Group();
    group.name = 'stern';
    group.userData = { componentId: 'stern', name: 'Stern & Transom Assembly' };

    const topMat = new THREE.MeshStandardMaterial({
      color: VesselMeshFactory.COLORS.hullDarkSlate,
      roughness: 0.4,
      metalness: 0.5,
    });

    const bottomMat = new THREE.MeshStandardMaterial({
      color: VesselMeshFactory.COLORS.hullRed,
      roughness: 0.5,
      metalness: 0.3,
    });

    // Stern Upper Counter Box
    const counterGeo = new THREE.BoxGeometry(6.4, 1.8, 4.0);
    const counter = new THREE.Mesh(counterGeo, topMat);
    counter.position.set(0, 0.9, -10.8);
    counter.castShadow = true;
    group.add(counter);

    // Stern Lower Anti-fouling Box
    const botSternGeo = new THREE.BoxGeometry(5.8, 1.6, 4.0);
    const botStern = new THREE.Mesh(botSternGeo, bottomMat);
    botStern.position.set(0, -0.8, -10.8);
    botStern.castShadow = true;
    group.add(botStern);

    // Transom Plate (Flat aft face)
    const transomGeo = new THREE.BoxGeometry(6.4, 3.2, 0.3);
    const transom = new THREE.Mesh(transomGeo, topMat);
    transom.position.set(0, 0.1, -12.85);
    group.add(transom);

    // Propeller Shaft Bossing (Tube housing tailshaft entrance)
    const bossingGeo = new THREE.CylinderGeometry(0.65, 0.8, 2.2, 12);
    const bossingMat = new THREE.MeshStandardMaterial({ color: VesselMeshFactory.COLORS.hullRed, roughness: 0.6 });
    const bossing = new THREE.Mesh(bossingGeo, bossingMat);
    bossing.rotation.x = Math.PI / 2;
    bossing.position.set(0, -1.0, -11.0);
    group.add(bossing);

    VesselMeshFactory.attachComponentMetadata(group, 'stern');
    return group;
  }

  // -------------------------------------------------------------
  // 4. BRIDGE (Navigation Wheelhouse)
  // -------------------------------------------------------------
  private static createBridge(): THREE.Group {
    const group = new THREE.Group();
    group.name = 'bridge';
    group.userData = { componentId: 'bridge', name: 'Navigation Bridge & Wheelhouse' };

    const whiteMat = new THREE.MeshStandardMaterial({
      color: VesselMeshFactory.COLORS.whiteSuperstructure,
      roughness: 0.2,
    });

    const glassMat = new THREE.MeshStandardMaterial({
      color: VesselMeshFactory.COLORS.glassBlue,
      roughness: 0.1,
      metalness: 0.9,
      transparent: true,
      opacity: 0.85,
    });

    // Wheelhouse Main Cabin
    const cabinGeo = new THREE.BoxGeometry(5.2, 1.8, 2.8);
    const cabin = new THREE.Mesh(cabinGeo, whiteMat);
    cabin.position.set(0, 6.2, -6.8);
    cabin.castShadow = true;
    group.add(cabin);

    // Port Bridge Wing
    const portWingGeo = new THREE.BoxGeometry(1.8, 0.8, 1.4);
    const portWing = new THREE.Mesh(portWingGeo, whiteMat);
    portWing.position.set(-3.5, 6.0, -6.8);
    group.add(portWing);

    // Starboard Bridge Wing
    const stbdWing = new THREE.Mesh(portWingGeo, whiteMat);
    stbdWing.position.set(3.5, 6.0, -6.8);
    group.add(stbdWing);

    // Continuous Front & Side Windows (Tinted Cyan Glass)
    const windowGeo = new THREE.BoxGeometry(5.0, 0.6, 2.7);
    const windows = new THREE.Mesh(windowGeo, glassMat);
    windows.position.set(0, 6.5, -6.75);
    group.add(windows);

    // Bridge Roof Deck
    const roofGeo = new THREE.BoxGeometry(5.4, 0.25, 3.0);
    const roof = new THREE.Mesh(roofGeo, whiteMat);
    roof.position.set(0, 7.2, -6.8);
    group.add(roof);

    VesselMeshFactory.attachComponentMetadata(group, 'bridge');
    return group;
  }

  // -------------------------------------------------------------
  // 5. ACCOMMODATION BLOCK (Superstructure)
  // -------------------------------------------------------------
  private static createAccommodationBlock(): THREE.Group {
    const group = new THREE.Group();
    group.name = 'accommodation_block';
    group.userData = { componentId: 'accommodation_block', name: 'Accommodation Superstructure' };

    const whiteMat = new THREE.MeshStandardMaterial({
      color: VesselMeshFactory.COLORS.whiteSuperstructure,
      roughness: 0.2,
    });

    const portholeMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      metalness: 0.8,
      roughness: 0.2,
    });

    // Tier 1 (Main Deck Level)
    const tier1Geo = new THREE.BoxGeometry(5.8, 1.6, 4.8);
    const tier1 = new THREE.Mesh(tier1Geo, whiteMat);
    tier1.position.set(0, 2.6, -7.0);
    tier1.castShadow = true;
    group.add(tier1);

    // Tier 2 (Officers Deck)
    const tier2Geo = new THREE.BoxGeometry(5.6, 1.5, 4.2);
    const tier2 = new THREE.Mesh(tier2Geo, whiteMat);
    tier2.position.set(0, 4.15, -7.0);
    tier2.castShadow = true;
    group.add(tier2);

    // Tier 3 (Captain's Deck)
    const tier3Geo = new THREE.BoxGeometry(5.4, 1.4, 3.6);
    const tier3 = new THREE.Mesh(tier3Geo, whiteMat);
    tier3.position.set(0, 5.5, -7.0);
    tier3.castShadow = true;
    group.add(tier3);

    // Portholes (arrayed along port & starboard sides)
    const portholeGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.05, 12);
    portholeGeo.rotateZ(Math.PI / 2);

    for (let tier = 0; tier < 3; tier++) {
      const y = 2.6 + tier * 1.4;
      for (let z = -8.5; z <= -5.5; z += 1.0) {
        const portPorthole = new THREE.Mesh(portholeGeo, portholeMat);
        portPorthole.position.set(-2.92, y, z);
        group.add(portPorthole);

        const stbdPorthole = new THREE.Mesh(portholeGeo, portholeMat);
        stbdPorthole.position.set(2.92, y, z);
        group.add(stbdPorthole);
      }
    }

    VesselMeshFactory.attachComponentMetadata(group, 'accommodation_block');
    return group;
  }

  // -------------------------------------------------------------
  // 6. FUNNEL (Main Engine Smokestack)
  // -------------------------------------------------------------
  private static createFunnel(): THREE.Group {
    const group = new THREE.Group();
    group.name = 'funnel';
    group.userData = { componentId: 'funnel', name: 'Main Engine Funnel & Casing' };

    const redMat = new THREE.MeshStandardMaterial({
      color: VesselMeshFactory.COLORS.funnelRed,
      roughness: 0.3,
    });

    const blackMat = new THREE.MeshStandardMaterial({
      color: VesselMeshFactory.COLORS.funnelBlack,
      roughness: 0.5,
    });

    // Funnel Outer Casing Box (Angled slightly back)
    const casingGeo = new THREE.BoxGeometry(1.8, 2.6, 2.2);
    const casing = new THREE.Mesh(casingGeo, redMat);
    casing.position.set(0, 8.4, -8.8);
    casing.rotation.x = -0.1;
    casing.castShadow = true;
    group.add(casing);

    // Black Exhaust Cap Top
    const capGeo = new THREE.BoxGeometry(1.82, 0.4, 2.22);
    const cap = new THREE.Mesh(capGeo, blackMat);
    cap.position.set(0, 9.6, -8.9);
    cap.rotation.x = -0.1;
    group.add(cap);

    // Twin Exhaust Uptakes (Cylinders emerging from top cap)
    const pipeGeo = new THREE.CylinderGeometry(0.3, 0.3, 1.2, 16);
    const portPipe = new THREE.Mesh(pipeGeo, blackMat);
    portPipe.position.set(-0.45, 10.2, -8.9);
    group.add(portPipe);

    const stbdPipe = new THREE.Mesh(pipeGeo, blackMat);
    stbdPipe.position.set(0.45, 10.2, -8.9);
    group.add(stbdPipe);

    VesselMeshFactory.attachComponentMetadata(group, 'funnel');
    return group;
  }

  // -------------------------------------------------------------
  // 7. MASTS (Fore & Radar Masts)
  // -------------------------------------------------------------
  private static createMasts(): THREE.Group {
    const group = new THREE.Group();
    group.name = 'masts';
    group.userData = { componentId: 'masts', name: 'Fore & Radar Masts' };

    const mastMat = new THREE.MeshStandardMaterial({
      color: VesselMeshFactory.COLORS.mastsWhite,
      roughness: 0.3,
      metalness: 0.6,
    });

    // Foremast (Forecastle deck)
    const foremastGeo = new THREE.CylinderGeometry(0.12, 0.18, 4.2, 12);
    const foremast = new THREE.Mesh(foremastGeo, mastMat);
    foremast.position.set(0, 3.9, 10.2);
    foremast.castShadow = true;
    group.add(foremast);

    const foreYardGeo = new THREE.BoxGeometry(1.8, 0.08, 0.08);
    const foreYard = new THREE.Mesh(foreYardGeo, mastMat);
    foreYard.position.set(0, 5.2, 10.2);
    group.add(foreYard);

    // Main Radar Mast (Wheelhouse Roof)
    const mainMastGeo = new THREE.CylinderGeometry(0.14, 0.22, 3.6, 12);
    const mainMast = new THREE.Mesh(mainMastGeo, mastMat);
    mainMast.position.set(0, 9.0, -6.8);
    mainMast.castShadow = true;
    group.add(mainMast);

    const mainYardGeo = new THREE.BoxGeometry(2.4, 0.1, 0.1);
    const mainYard = new THREE.Mesh(mainYardGeo, mastMat);
    mainYard.position.set(0, 10.0, -6.8);
    group.add(mainYard);

    // Rotating Radar Scanner Bar
    const radarGeo = new THREE.BoxGeometry(1.4, 0.12, 0.2);
    const radarMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.2 });
    const radar = new THREE.Mesh(radarGeo, radarMat);
    radar.position.set(0, 10.6, -6.8);
    radar.name = 'radarScannerBar';
    group.add(radar);

    // Satellite Dome Radome
    const domeGeo = new THREE.SphereGeometry(0.4, 12, 12);
    const dome = new THREE.Mesh(domeGeo, mastMat);
    dome.position.set(-0.8, 10.4, -6.8);
    group.add(dome);

    VesselMeshFactory.attachComponentMetadata(group, 'masts');
    return group;
  }

  // -------------------------------------------------------------
  // 8. RUDDER (Balanced Rudder Blade)
  // -------------------------------------------------------------
  private static createRudder(): THREE.Group {
    const group = new THREE.Group();
    group.name = 'rudder';
    group.userData = { componentId: 'rudder', name: 'Rudder & Steering Gear' };

    const rudderMat = new THREE.MeshStandardMaterial({
      color: VesselMeshFactory.COLORS.rudderSteel,
      roughness: 0.3,
      metalness: 0.8,
    });

    // Rudder Stock Shaft
    const stockGeo = new THREE.CylinderGeometry(0.18, 0.18, 2.4, 12);
    const stock = new THREE.Mesh(stockGeo, rudderMat);
    stock.position.set(0, -0.6, -12.4);
    group.add(stock);

    // Hydrofoil Rudder Blade (Tapered box behind propeller)
    const bladeGeo = new THREE.BoxGeometry(0.2, 1.8, 1.4);
    const blade = new THREE.Mesh(bladeGeo, rudderMat);
    blade.position.set(0, -1.5, -12.6);
    blade.castShadow = true;
    blade.name = 'rudderBladeMesh';
    group.add(blade);

    VesselMeshFactory.attachComponentMetadata(group, 'rudder');
    return group;
  }

  // -------------------------------------------------------------
  // 9. PROPELLER (4-Bladed Fixed Pitch Propeller)
  // -------------------------------------------------------------
  private static createPropeller(): THREE.Group {
    const group = new THREE.Group();
    group.name = 'propeller';
    group.userData = { componentId: 'propeller', name: 'Main Propulsion Propeller' };

    const bronzeMat = new THREE.MeshStandardMaterial({
      color: VesselMeshFactory.COLORS.propellerBronze,
      roughness: 0.15,
      metalness: 0.9,
    });

    // Propeller Hub Cone
    const hubGeo = new THREE.CylinderGeometry(0.3, 0.45, 1.0, 16);
    const hub = new THREE.Mesh(hubGeo, bronzeMat);
    hub.rotation.x = Math.PI / 2;
    hub.position.set(0, -1.2, -11.6);
    hub.name = 'propellerHubMesh';

    // 4 Blades attached to Hub
    for (let i = 0; i < 4; i++) {
      const bladeGeo = new THREE.BoxGeometry(0.08, 1.4, 0.45);
      const blade = new THREE.Mesh(bladeGeo, bronzeMat);
      blade.rotation.z = (i * Math.PI) / 2;
      blade.rotation.y = 0.4; // Pitch angle
      hub.add(blade);
    }

    group.add(hub);

    VesselMeshFactory.attachComponentMetadata(group, 'propeller');
    return group;
  }

  // -------------------------------------------------------------
  // 10. BOW THRUSTER HOUSING (Tunnel & Impeller)
  // -------------------------------------------------------------
  private static createBowThrusterHousing(): THREE.Group {
    const group = new THREE.Group();
    group.name = 'bow_thruster_housing';
    group.userData = { componentId: 'bow_thruster_housing', name: 'Bow Tunnel Thruster Housing' };

    const steelMat = new THREE.MeshStandardMaterial({
      color: 0x334155,
      metalness: 0.8,
      roughness: 0.3,
    });

    const impellerMat = new THREE.MeshStandardMaterial({
      color: VesselMeshFactory.COLORS.propellerBronze,
      metalness: 0.9,
      roughness: 0.2,
    });

    // Transverse Tunnel Cylinder Tube (Aligned along X axis through lower bow)
    const tunnelGeo = new THREE.CylinderGeometry(0.8, 0.8, 6.4, 20);
    const tunnel = new THREE.Mesh(tunnelGeo, steelMat);
    tunnel.rotation.z = Math.PI / 2;
    tunnel.position.set(0, -0.9, 9.2);
    group.add(tunnel);

    // Tunnel Port & Starboard Lip Rims
    const ringGeo = new THREE.TorusGeometry(0.82, 0.08, 8, 20);
    const portRing = new THREE.Mesh(ringGeo, steelMat);
    portRing.position.set(-3.2, -0.9, 9.2);
    portRing.rotation.y = Math.PI / 2;
    group.add(portRing);

    const stbdRing = new THREE.Mesh(ringGeo, steelMat);
    stbdRing.position.set(3.2, -0.9, 9.2);
    stbdRing.rotation.y = Math.PI / 2;
    group.add(stbdRing);

    // Impeller Hub inside tunnel
    const hubGeo = new THREE.CylinderGeometry(0.3, 0.3, 0.8, 12);
    const hub = new THREE.Mesh(hubGeo, impellerMat);
    hub.rotation.z = Math.PI / 2;
    hub.position.set(0, -0.9, 9.2);
    hub.name = 'thrusterImpellerHub';

    for (let i = 0; i < 3; i++) {
      const bladeGeo = new THREE.BoxGeometry(0.06, 0.7, 0.3);
      const blade = new THREE.Mesh(bladeGeo, impellerMat);
      blade.rotation.x = (i * Math.PI * 2) / 3;
      blade.rotation.y = 0.3;
      hub.add(blade);
    }

    group.add(hub);

    VesselMeshFactory.attachComponentMetadata(group, 'bow_thruster_housing');
    return group;
  }

  // -------------------------------------------------------------
  // 11. CARGO DECK (Main Weather Deck & Coamings)
  // -------------------------------------------------------------
  private static createCargoDeck(): THREE.Group {
    const group = new THREE.Group();
    group.name = 'cargo_deck';
    group.userData = { componentId: 'cargo_deck', name: 'Main Cargo Deck & Coamings' };

    const deckMat = new THREE.MeshStandardMaterial({
      color: VesselMeshFactory.COLORS.deckGreen,
      roughness: 0.6,
      metalness: 0.2,
    });

    const coamingMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.5,
      metalness: 0.5,
    });

    // Main Deck Plate
    const deckGeo = new THREE.BoxGeometry(6.4, 0.15, 18.0);
    const deck = new THREE.Mesh(deckGeo, deckMat);
    deck.position.set(0, 1.82, 0);
    deck.receiveShadow = true;
    group.add(deck);

    // Raised Forecastle Weather Deck
    const foreDeckGeo = new THREE.BoxGeometry(6.4, 0.4, 4.0);
    const foreDeck = new THREE.Mesh(foreDeckGeo, deckMat);
    foreDeck.position.set(0, 2.0, 9.8);
    foreDeck.receiveShadow = true;
    group.add(foreDeck);

    // Hatch Coaming Walls (Surrounding Holds 1 to 4)
    for (let hold = 0; hold < 4; hold++) {
      const z = 6.2 - hold * 3.8;
      const coamingGeo = new THREE.BoxGeometry(5.0, 0.5, 3.2);
      const coaming = new THREE.Mesh(coamingGeo, coamingMat);
      coaming.position.set(0, 2.15, z);
      coaming.castShadow = true;
      group.add(coaming);
    }

    // Deck Mooring Winch & Bollards
    const bollardGeo = new THREE.CylinderGeometry(0.1, 0.1, 0.3, 8);
    const bollardMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.8 });

    for (let z of [-10.2, -8.2, 8.2, 10.2]) {
      const portBollard = new THREE.Mesh(bollardGeo, bollardMat);
      portBollard.position.set(-2.8, 2.0, z);
      group.add(portBollard);

      const stbdBollard = new THREE.Mesh(bollardGeo, bollardMat);
      stbdBollard.position.set(2.8, 2.0, z);
      group.add(stbdBollard);
    }

    VesselMeshFactory.attachComponentMetadata(group, 'cargo_deck');
    return group;
  }

  // -------------------------------------------------------------
  // 12. HATCH COVERS (Pontoon Covers & Containers)
  // -------------------------------------------------------------
  private static createHatchCovers(): THREE.Group {
    const group = new THREE.Group();
    group.name = 'hatch_covers';
    group.userData = { componentId: 'hatch_covers', name: 'Pontoon Hatch Covers' };

    const coverMat = new THREE.MeshStandardMaterial({
      color: VesselMeshFactory.COLORS.hatchGrey,
      roughness: 0.4,
      metalness: 0.6,
    });

    const colors = [
      VesselMeshFactory.COLORS.containerAmber,
      VesselMeshFactory.COLORS.containerBlue,
      VesselMeshFactory.COLORS.containerRed,
      VesselMeshFactory.COLORS.containerGreen,
    ];

    // 4 Hatch Cover Pontoons
    for (let hold = 0; hold < 4; hold++) {
      const z = 6.2 - hold * 3.8;

      const holdCoverGroup = new THREE.Group();
      holdCoverGroup.name = `hatch_cover_hold_${hold + 1}`;
      holdCoverGroup.position.set(0, 2.45, z);

      const pontoonGeo = new THREE.BoxGeometry(4.8, 0.25, 3.0);
      const pontoon = new THREE.Mesh(pontoonGeo, coverMat);
      pontoon.castShadow = true;
      holdCoverGroup.add(pontoon);

      // Ribbed Stiffener Strips
      for (let r = -1.2; r <= 1.2; r += 0.8) {
        const ribGeo = new THREE.BoxGeometry(4.8, 0.08, 0.12);
        const rib = new THREE.Mesh(ribGeo, coverMat);
        rib.position.set(0, 0.16, r);
        holdCoverGroup.add(rib);
      }

      // Container Stacks on Hatch Cover
      const cMat = new THREE.MeshStandardMaterial({
        color: colors[hold % colors.length],
        roughness: 0.5,
      });

      const contGeo = new THREE.BoxGeometry(2.1, 1.1, 2.8);

      const portCont = new THREE.Mesh(contGeo, cMat);
      portCont.position.set(-1.15, 0.8, 0);
      portCont.castShadow = true;
      holdCoverGroup.add(portCont);

      const stbdCont = new THREE.Mesh(contGeo, cMat);
      stbdCont.position.set(1.15, 0.8, 0);
      stbdCont.castShadow = true;
      holdCoverGroup.add(stbdCont);

      group.add(holdCoverGroup);
    }

    VesselMeshFactory.attachComponentMetadata(group, 'hatch_covers');
    return group;
  }

  // -------------------------------------------------------------
  // 13. SEA CHEST (Suction Inlets & Grates)
  // -------------------------------------------------------------
  private static createSeaChest(): THREE.Group {
    const group = new THREE.Group();
    group.name = 'sea_chest';
    group.userData = { componentId: 'sea_chest', name: 'Sea Suction Chests & Grates' };

    const chestMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.9,
    });

    const grateMat = new THREE.MeshStandardMaterial({
      color: VesselMeshFactory.COLORS.seaChestGold,
      roughness: 0.3,
      metalness: 0.8,
    });

    // Port Sea Chest Recess Box
    const recessGeo = new THREE.BoxGeometry(0.35, 0.8, 1.4);
    const portRecess = new THREE.Mesh(recessGeo, chestMat);
    portRecess.position.set(-3.2, -1.0, -1.2);
    group.add(portRecess);

    // Starboard Sea Chest Recess Box
    const stbdRecess = new THREE.Mesh(recessGeo, chestMat);
    stbdRecess.position.set(3.2, -1.0, -1.2);
    group.add(stbdRecess);

    // Strainer Slats Grate Across Chest Opening
    const slatGeo = new THREE.BoxGeometry(0.06, 0.06, 1.35);

    for (let y = -1.3; y <= -0.7; y += 0.2) {
      const portSlat = new THREE.Mesh(slatGeo, grateMat);
      portSlat.position.set(-3.35, y, -1.2);
      group.add(portSlat);

      const stbdSlat = new THREE.Mesh(slatGeo, grateMat);
      stbdSlat.position.set(3.35, y, -1.2);
      group.add(stbdSlat);
    }

    // Suction Valve Flanges inside chest
    const valveGeo = new THREE.CylinderGeometry(0.2, 0.2, 0.6, 12);
    valveGeo.rotateZ(Math.PI / 2);
    const portValve = new THREE.Mesh(valveGeo, grateMat);
    portValve.position.set(-3.0, -1.0, -1.2);
    group.add(portValve);

    const stbdValve = new THREE.Mesh(valveGeo, grateMat);
    stbdValve.position.set(3.0, -1.0, -1.2);
    group.add(stbdValve);

    VesselMeshFactory.attachComponentMetadata(group, 'sea_chest');
    return group;
  }

  // -------------------------------------------------------------
  // 14. BALLAST TANK AREAS (Double Bottom & Wing Tanks)
  // -------------------------------------------------------------
  private static createBallastTankAreas(): THREE.Group {
    const group = new THREE.Group();
    group.name = 'ballast_tank_areas';
    group.userData = { componentId: 'ballast_tank_areas', name: 'Double Bottom & Wing Ballast Tanks' };

    const tankMat = new THREE.MeshStandardMaterial({
      color: VesselMeshFactory.COLORS.ballastCyan,
      transparent: true,
      opacity: 0.55,
      roughness: 0.1,
      metalness: 0.3,
    });

    // Double Bottom Ballast Tank Box (Under cargo holds)
    const dbTankGeo = new THREE.BoxGeometry(6.0, 0.6, 17.2);
    const dbTank = new THREE.Mesh(dbTankGeo, tankMat);
    dbTank.position.set(0, -1.25, 0);
    group.add(dbTank);

    // Port Wing Ballast Tank
    const wingTankGeo = new THREE.BoxGeometry(0.5, 2.2, 17.2);
    const portWingTank = new THREE.Mesh(wingTankGeo, tankMat);
    portWingTank.position.set(-2.8, 0.3, 0);
    group.add(portWingTank);

    // Starboard Wing Ballast Tank
    const stbdWingTank = new THREE.Mesh(wingTankGeo, tankMat);
    stbdWingTank.position.set(2.8, 0.3, 0);
    group.add(stbdWingTank);

    // Forepeak Ballast Tank (Bow)
    const forepeakGeo = new THREE.BoxGeometry(3.2, 1.8, 3.2);
    const forepeak = new THREE.Mesh(forepeakGeo, tankMat);
    forepeak.position.set(0, -0.4, 9.2);
    group.add(forepeak);

    // Aftpeak Ballast Tank (Stern)
    const aftpeakGeo = new THREE.BoxGeometry(3.6, 1.8, 3.0);
    const aftpeak = new THREE.Mesh(aftpeakGeo, tankMat);
    aftpeak.position.set(0, -0.4, -9.2);
    group.add(aftpeak);

    VesselMeshFactory.attachComponentMetadata(group, 'ballast_tank_areas');
    return group;
  }

  /**
   * Attaches metadata & raycast identification down to child meshes
   */
  private static attachComponentMetadata(group: THREE.Group, componentId: VesselComponentId) {
    const spec = VESSEL_COMPONENTS.find((c) => c.id === componentId);
    if (!spec) return;

    group.userData = {
      componentId: spec.id,
      componentName: spec.name,
      spec,
      initialPosition: group.position.clone(),
    };

    group.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.userData.componentId = spec.id;
        child.userData.componentName = spec.name;
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
  }
}
