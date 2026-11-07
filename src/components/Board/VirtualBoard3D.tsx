import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { BoardLocationId, GameState, PlayerState, CivilizationCard, BuildingTile, ResourceType } from '../../types/game';
import { canPlaceMeeples, getZoneTotalMeeples } from '../../logic/gameEngine';
import { ResourceIcon } from '../Common/ResourceIcon';
import { CivilizationCardView } from '../Cards/CivilizationCardView';
import { 
  RotateCcw, 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  Minimize2,
  Sparkles,
  Info,
  Trees,
  Home,
  Scroll,
  X,
  Sliders
} from 'lucide-react';
import { 
  getClassicZones, 
  CLASSIC_ZONES_UPDATED_EVENT, 
  ClassicZoneData 
} from '../../data/classicBoardZones';

interface ZoneCoord3D {
  xPct: number;
  yPct: number;
  radius: number;
  label: string;
  sublabel: string;
}

interface VirtualBoard3DProps {
  state: GameState;
  activePlayer: PlayerState;
  onZoneClick: (locationId: BoardLocationId) => void;
  className?: string;
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
  onOpenZoneEditor?: () => void;
}

// Board plane dimensions
const BOARD_WIDTH = 143;
const BOARD_DEPTH = 100;

// Zone definitions with board percentage coordinates (X: 0..1, Y: 0..1)
const ZONE_COORDINATES: Record<BoardLocationId, { xPct: number; yPct: number; radius: number; label: string; sublabel: string }> = {
  hunting: { xPct: 0.167, yPct: 0.305, radius: 8.5, label: 'Chasse', sublabel: 'Nourriture ÷2' },
  forest: { xPct: 0.388, yPct: 0.258, radius: 8.0, label: 'Forêt', sublabel: 'Bois ÷3' },
  clay_pit: { xPct: 0.568, yPct: 0.235, radius: 8.0, label: 'Glaisière', sublabel: 'Glaise ÷4' },
  quarry: { xPct: 0.855, yPct: 0.249, radius: 8.0, label: 'Carrière', sublabel: 'Pierre ÷5' },
  river: { xPct: 0.829, yPct: 0.556, radius: 7.5, label: 'Rivière', sublabel: 'Or ÷6' },
  tool_maker: { xPct: 0.566, yPct: 0.493, radius: 5.5, label: 'Outils', sublabel: '+1 Outil' },
  field: { xPct: 0.332, yPct: 0.550, radius: 5.5, label: 'Champs', sublabel: '+1 Agriculture' },
  hut: { xPct: 0.430, yPct: 0.654, radius: 6.0, label: 'Hutte', sublabel: '+1 Ouvrier' },
  building_0: { xPct: 0.111, yPct: 0.819, radius: 5.5, label: 'Pile Bâtiment 1', sublabel: 'Bâtiment' },
  building_1: { xPct: 0.216, yPct: 0.819, radius: 5.5, label: 'Pile Bâtiment 2', sublabel: 'Bâtiment' },
  building_2: { xPct: 0.321, yPct: 0.819, radius: 5.5, label: 'Pile Bâtiment 3', sublabel: 'Bâtiment' },
  building_3: { xPct: 0.427, yPct: 0.819, radius: 5.5, label: 'Pile Bâtiment 4', sublabel: 'Bâtiment' },
  card_3: { xPct: 0.568, yPct: 0.792, radius: 6.0, label: 'Carte Civilisation #4', sublabel: 'Coût: 4 res.' },
  card_2: { xPct: 0.674, yPct: 0.792, radius: 6.0, label: 'Carte Civilisation #3', sublabel: 'Coût: 3 res.' },
  card_1: { xPct: 0.781, yPct: 0.792, radius: 6.0, label: 'Carte Civilisation #2', sublabel: 'Coût: 2 res.' },
  card_0: { xPct: 0.888, yPct: 0.792, radius: 6.0, label: 'Carte Civilisation #1', sublabel: 'Coût: 1 res.' },
  merchant: { xPct: 0.226, yPct: 0.546, radius: 6.0, label: 'Marchands', sublabel: 'Troc & Parures' },
  mammoth: { xPct: 0.178, yPct: 0.126, radius: 6.5, label: 'Mammouth', sublabel: 'Harde de Mammouths' },
};

// Player 3D colors
const PLAYER_COLOR_HEX: Record<string, number> = {
  red: 0xdc2626,
  blue: 0x2563eb,
  yellow: 0xeab308,
  green: 0x16a34a,
};

// Texture cache helper
const textureCache = new Map<string, THREE.Texture>();
function getCachedTexture(url: string, loader: THREE.TextureLoader): THREE.Texture {
  if (textureCache.has(url)) {
    return textureCache.get(url)!;
  }
  const tex = loader.load(url);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  textureCache.set(url, tex);
  return tex;
}

// Function to calculate 3D position along perimeter score track (0..99)
function getPerimeterScore3D(score: number): { x: number; z: number } {
  const s = ((score % 100) + 100) % 100;
  if (s <= 28) {
    const t = s / 28;
    return { x: -66 + t * 132, z: -46.5 };
  } else if (s <= 50) {
    const t = (s - 28) / 22;
    return { x: 67.5, z: -46.5 + t * 93 };
  } else if (s <= 78) {
    const t = (s - 50) / 28;
    return { x: 66 - t * 132, z: 46.5 };
  } else {
    const t = (s - 78) / 22;
    return { x: -67.5, z: 46.5 - t * 93 };
  }
}

// Function to calculate 3D position along vertical agriculture strip (0..10)
function getAgriculture3D(level: number, playerIndex: number): { x: number; z: number } {
  const clamped = Math.max(0, Math.min(10, level));
  const z = 38 - (clamped / 10) * 46;
  const x = -61 + (playerIndex - 1.5) * 1.6;
  return { x, z };
}

// 3D Meeple geometry generator
function createMeepleGeometry(): THREE.BufferGeometry {
  const shape = new THREE.Shape();
  shape.moveTo(-1.0, 0);
  shape.lineTo(-0.3, 0);
  shape.lineTo(-0.05, 1.1);
  shape.lineTo(0.3, 0);
  shape.lineTo(1.0, 0);
  shape.lineTo(0.9, 1.5);
  shape.lineTo(1.7, 1.7);
  shape.lineTo(1.5, 2.5);
  shape.lineTo(0.65, 2.7);
  shape.absarc(0, 3.4, 0.65, -Math.PI / 6, Math.PI + Math.PI / 6, false);
  shape.lineTo(-0.65, 2.7);
  shape.lineTo(-1.5, 2.5);
  shape.lineTo(-1.7, 1.7);
  shape.lineTo(-0.9, 1.5);
  shape.closePath();

  const geom = new THREE.ExtrudeGeometry(shape, {
    depth: 1.0,
    bevelEnabled: true,
    bevelThickness: 0.12,
    bevelSize: 0.08,
    bevelSegments: 2,
  });
  geom.center();
  return geom;
}

export const VirtualBoard3D: React.FC<VirtualBoard3DProps> = ({
  state,
  activePlayer,
  onZoneClick,
  className = '',
  isFullscreen: propFullscreen,
  onToggleFullscreen,
  onOpenZoneEditor,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [internalFullscreen, setInternalFullscreen] = useState(false);
  const isFullscreen = propFullscreen !== undefined ? propFullscreen : internalFullscreen;
  const handleToggleFullscreen = onToggleFullscreen || (() => setInternalFullscreen(prev => !prev));
  const [hoveredZone, setHoveredZone] = useState<BoardLocationId | null>(null);

  // Dynamic classic zones from persistent storage / editor
  const [classicZones, setClassicZones] = useState<Record<string, ClassicZoneData>>(() => getClassicZones());

  useEffect(() => {
    const handleUpdate = () => {
      setClassicZones(getClassicZones());
    };
    window.addEventListener(CLASSIC_ZONES_UPDATED_EVENT, handleUpdate);
    return () => window.removeEventListener(CLASSIC_ZONES_UPDATED_EVENT, handleUpdate);
  }, []);

  const zoneCoordinates = useMemo<Record<BoardLocationId, { xPct: number; yPct: number; radius: number; label: string; sublabel: string }>>(() => {
    const map: Partial<Record<BoardLocationId, { xPct: number; yPct: number; radius: number; label: string; sublabel: string }>> = {};
    Object.values(classicZones).forEach(z => {
      map[z.id as BoardLocationId] = {
        xPct: (z.left + z.width / 2) / 100,
        yPct: (z.top + z.height / 2) / 100,
        radius: z.radius || 6.0,
        label: z.name,
        sublabel: z.sublabel,
      };
    });
    return map as Record<BoardLocationId, { xPct: number; yPct: number; radius: number; label: string; sublabel: string }>;
  }, [classicZones]);

  // Three.js instances
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const campfireLightRef = useRef<THREE.PointLight | null>(null);

  // Group observers & resize triggers
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!containerRef.current || !rendererRef.current || !cameraRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      if (w > 0 && h > 0) {
        cameraRef.current.aspect = w / h;
        cameraRef.current.updateProjectionMatrix();
        rendererRef.current.setSize(w, h);
      }
    }, 60);
    return () => clearTimeout(timer);
  }, [isFullscreen]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(() => {
      if (!container || !rendererRef.current || !cameraRef.current) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      if (w > 0 && h > 0) {
        cameraRef.current.aspect = w / h;
        cameraRef.current.updateProjectionMatrix();
        rendererRef.current.setSize(w, h);
      }
    });
    ro.observe(container);
    return () => ro.disconnect();
  }, []);

  // Groups
  const cardsGroupRef = useRef<THREE.Group | null>(null);
  const buildingsGroupRef = useRef<THREE.Group | null>(null);
  const meeplesGroupRef = useRef<THREE.Group | null>(null);
  const beaconsGroupRef = useRef<THREE.Group | null>(null);
  const markersGroupRef = useRef<THREE.Group | null>(null);
  const toolsGroupRef = useRef<THREE.Group | null>(null);
  const zoneMeshesRef = useRef<Map<BoardLocationId, THREE.Mesh>>(new Map());

  const textureLoaderRef = useRef<THREE.TextureLoader>(new THREE.TextureLoader());
  const pointerDownPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const isPlacement = state.phase === 'placement';
  const isResolution = state.phase === 'resolution';

  // Card full inspection state
  const [inspectedCard, setInspectedCard] = useState<CivilizationCard | null>(null);

  // Helper to determine if active player can click a zone
  const getZoneStatus = useCallback((locId: BoardLocationId) => {
    const totalMeeples = getZoneTotalMeeples(state, locId);
    const hasMyMeeples = (activePlayer.placements[locId] || 0) > 0;

    const canPlace = isPlacement && !activePlayer.isAi && canPlaceMeeples(
      state,
      activePlayer.id,
      locId,
      locId === 'hut' ? 2 : 1
    ).allowed;

    const canResolve = isResolution && !activePlayer.isAi && hasMyMeeples;

    return { totalMeeples, hasMyMeeples, canPlace, canResolve };
  }, [state, activePlayer, isPlacement, isResolution]);

  // Smooth camera positioning helper
  const flyCameraTo = (x: number, y: number, z: number, targetX: number, targetY: number, targetZ: number) => {
    if (!cameraRef.current || !controlsRef.current) return;
    cameraRef.current.position.set(x, y, z);
    controlsRef.current.target.set(targetX, targetY, targetZ);
    controlsRef.current.update();
  };

  // Reset Camera to default overview
  const handleResetCamera = () => {
    flyCameraTo(0, 85, 70, 0, 0, 5);
  };

  const handleFocusVillage = () => {
    flyCameraTo(-4, 48, 38, -4, 2, 6);
  };

  const handleFocusNature = () => {
    flyCameraTo(0, 52, -10, 0, 2, -30);
  };

  const handleFocusMarket = () => {
    flyCameraTo(18, 48, 55, 18, 1, 30);
  };

  const handleZoom = (direction: 'in' | 'out') => {
    if (!cameraRef.current || !controlsRef.current) return;
    const factor = direction === 'in' ? 0.8 : 1.25;
    const offset = cameraRef.current.position.clone().sub(controlsRef.current.target);
    offset.multiplyScalar(factor);
    if (offset.length() >= 25 && offset.length() <= 160) {
      cameraRef.current.position.copy(controlsRef.current.target).add(offset);
      controlsRef.current.update();
    }
  };

  // 1. Initial Scene Setup
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x130e0a);

    const aspect = container.clientWidth / container.clientHeight;
    const camera = new THREE.PerspectiveCamera(45, aspect, 1, 1000);
    camera.position.set(0, 85, 70);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    rendererRef.current = renderer;
    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.target.set(0, 0, 5);
    controls.minDistance = 25;
    controls.maxDistance = 160;
    controls.maxPolarAngle = Math.PI / 2.05; // Prevent camera going beneath board
    controlsRef.current = controls;

    // Lights
    const ambientLight = new THREE.AmbientLight(0xfff5e6, 1.4);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xfffaee, 1.9);
    sunLight.position.set(40, 95, 45);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.bias = -0.0004;
    scene.add(sunLight);

    // Village Campfire
    const campfire = new THREE.PointLight(0xff6600, 2.5, 45);
    campfire.position.set(-7.15, 2.5, 8.0);
    scene.add(campfire);
    campfireLightRef.current = campfire;

    // Board Mesh Slab
    const boardTexture = textureLoaderRef.current.load('/board.jpg');
    boardTexture.colorSpace = THREE.SRGBColorSpace;
    boardTexture.anisotropy = renderer.capabilities.getMaxAnisotropy();

    const woodSideMaterial = new THREE.MeshStandardMaterial({
      color: 0x361d0f,
      roughness: 0.7,
      metalness: 0.1,
    });
    const boardTopMaterial = new THREE.MeshStandardMaterial({
      map: boardTexture,
      roughness: 0.45,
      metalness: 0.05,
    });
    const boardBottomMaterial = new THREE.MeshStandardMaterial({
      color: 0x1f1109,
      roughness: 0.8,
    });

    const boardMaterials = [
      woodSideMaterial, woodSideMaterial,
      boardTopMaterial, boardBottomMaterial,
      woodSideMaterial, woodSideMaterial
    ];

    const boardThickness = 3.5;
    const boardGeometry = new THREE.BoxGeometry(BOARD_WIDTH, boardThickness, BOARD_DEPTH);
    const boardMesh = new THREE.Mesh(boardGeometry, boardMaterials);
    boardMesh.position.set(0, -boardThickness / 2, 0);
    boardMesh.receiveShadow = true;
    scene.add(boardMesh);

    // Tabletop
    const tableGeometry = new THREE.PlaneGeometry(350, 280);
    const tableMaterial = new THREE.MeshStandardMaterial({ color: 0x181310, roughness: 0.85 });
    const tableMesh = new THREE.Mesh(tableGeometry, tableMaterial);
    tableMesh.rotation.x = -Math.PI / 2;
    tableMesh.position.y = -boardThickness - 0.05;
    tableMesh.receiveShadow = true;
    scene.add(tableMesh);

    // Subgroups
    const cardsGroup = new THREE.Group();
    scene.add(cardsGroup);
    cardsGroupRef.current = cardsGroup;

    const buildingsGroup = new THREE.Group();
    scene.add(buildingsGroup);
    buildingsGroupRef.current = buildingsGroup;

    const toolsGroup = new THREE.Group();
    scene.add(toolsGroup);
    toolsGroupRef.current = toolsGroup;

    const meeplesGroup = new THREE.Group();
    scene.add(meeplesGroup);
    meeplesGroupRef.current = meeplesGroup;

    const beaconsGroup = new THREE.Group();
    scene.add(beaconsGroup);
    beaconsGroupRef.current = beaconsGroup;

    const markersGroup = new THREE.Group();
    scene.add(markersGroup);
    markersGroupRef.current = markersGroup;

    // Resize listener
    const handleResize = () => {
      if (!container || !rendererRef.current || !cameraRef.current) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // Render loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const renderLoop = () => {
      animationFrameId = requestAnimationFrame(renderLoop);
      const time = clock.getElapsedTime();

      // Campfire flicker
      if (campfireLightRef.current) {
        campfireLightRef.current.intensity = 2.2 + Math.sin(time * 9) * 0.4 + Math.cos(time * 15) * 0.25;
      }

      // Beacons animation
      if (beaconsGroupRef.current) {
        beaconsGroupRef.current.children.forEach(child => {
          if (child.userData.pulsing) {
            const scale = 1 + Math.sin(time * 4) * 0.08;
            child.scale.set(scale, 1, scale);
            const mat = (child as THREE.Mesh).material as THREE.MeshBasicMaterial;
            if (mat && mat.opacity !== undefined) {
              mat.opacity = 0.45 + Math.sin(time * 4) * 0.25;
            }
          }
        });
      }

      // Meeples resolution bounce
      if (meeplesGroupRef.current) {
        meeplesGroupRef.current.children.forEach(meeple => {
          if (meeple.userData.isTargetResolution) {
            meeple.position.y = 1.9 + Math.abs(Math.sin(time * 5)) * 0.9;
          }
        });
      }

      controls.update();
      renderer.render(scene, camera);
    };

    renderLoop();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  // 2. Render 3D Civilization Cards and Building Piles directly on the board
  useEffect(() => {
    const cardsGroup = cardsGroupRef.current;
    const buildingsGroup = buildingsGroupRef.current;
    const toolsGroup = toolsGroupRef.current;
    if (!cardsGroup || !buildingsGroup || !toolsGroup) return;

    // Clear previous cards
    while (cardsGroup.children.length > 0) {
      cardsGroup.remove(cardsGroup.children[0]);
    }
    // Clear previous buildings
    while (buildingsGroup.children.length > 0) {
      buildingsGroup.remove(buildingsGroup.children[0]);
    }
    // Clear previous tools
    while (toolsGroup.children.length > 0) {
      toolsGroup.remove(toolsGroup.children[0]);
    }

    const loader = textureLoaderRef.current;

    // --- A. Render 4 Civilization Cards in slots 3, 2, 1, 0 ---
    const c3 = classicZones.card_3;
    const c2 = classicZones.card_2;
    const c1 = classicZones.card_1;
    const c0 = classicZones.card_0;

    const cardSlots = [
      { slot: 3, locId: 'card_3' as BoardLocationId, xPct: c3 ? (c3.left + c3.width / 2) / 100 : 0.568, yPct: c3 ? (c3.top + c3.height / 2) / 100 : 0.792, cost: 4 },
      { slot: 2, locId: 'card_2' as BoardLocationId, xPct: c2 ? (c2.left + c2.width / 2) / 100 : 0.674, yPct: c2 ? (c2.top + c2.height / 2) / 100 : 0.792, cost: 3 },
      { slot: 1, locId: 'card_1' as BoardLocationId, xPct: c1 ? (c1.left + c1.width / 2) / 100 : 0.781, yPct: c1 ? (c1.top + c1.height / 2) / 100 : 0.792, cost: 2 },
      { slot: 0, locId: 'card_0' as BoardLocationId, xPct: c0 ? (c0.left + c0.width / 2) / 100 : 0.888, yPct: c0 ? (c0.top + c0.height / 2) / 100 : 0.792, cost: 1 },
    ];

    const cardWidth = 11.5;
    const cardDepth = 17.5;
    const cardThickness = 0.35;

    cardSlots.forEach(({ slot, locId, xPct, yPct, cost }) => {
      const card = state.activeCards[slot];
      const posX = (xPct - 0.5) * BOARD_WIDTH;
      const posZ = (yPct - 0.5) * BOARD_DEPTH;

      if (!card) {
        // Empty slot outline
        const emptyGeom = new THREE.PlaneGeometry(cardWidth, cardDepth);
        emptyGeom.rotateX(-Math.PI / 2);
        const emptyMat = new THREE.MeshBasicMaterial({
          color: 0x443322,
          wireframe: true,
          transparent: true,
          opacity: 0.4,
        });
        const emptyMesh = new THREE.Mesh(emptyGeom, emptyMat);
        emptyMesh.position.set(posX, 0.05, posZ);
        cardsGroup.add(emptyMesh);
        return;
      }

      // Card 3D Slab (Strictly uses authentic classic card artwork for the 3D classic board)
      const cardGeom = new THREE.BoxGeometry(cardWidth, cardThickness, cardDepth);
      const cardTex = getCachedTexture(card.classicImageUrl || '/cards/card_00.png', loader);

      const sideMat = new THREE.MeshStandardMaterial({ color: 0xd8ceba, roughness: 0.8 });
      const topMat = new THREE.MeshStandardMaterial({
        map: cardTex,
        roughness: 0.35,
        metalness: 0.05,
      });

      const mats = [sideMat, sideMat, topMat, sideMat, sideMat, sideMat];
      const cardMesh = new THREE.Mesh(cardGeom, mats);
      cardMesh.position.set(posX, cardThickness / 2 + 0.1, posZ);
      cardMesh.castShadow = true;
      cardMesh.receiveShadow = true;
      cardMesh.userData = { locationId: locId, isCard: true, cost };

      cardsGroup.add(cardMesh);
    });

    // --- B. Render 4 Building Piles in slots 0, 1, 2, 3 ---
    const b0 = classicZones.building_0;
    const b1 = classicZones.building_1;
    const b2 = classicZones.building_2;
    const b3 = classicZones.building_3;

    const buildingSlots = [
      { pileIdx: 0, locId: 'building_0' as BoardLocationId, xPct: b0 ? (b0.left + b0.width / 2) / 100 : 0.111, yPct: b0 ? (b0.top + b0.height / 2) / 100 : 0.819 },
      { pileIdx: 1, locId: 'building_1' as BoardLocationId, xPct: b1 ? (b1.left + b1.width / 2) / 100 : 0.216, yPct: b1 ? (b1.top + b1.height / 2) / 100 : 0.819 },
      { pileIdx: 2, locId: 'building_2' as BoardLocationId, xPct: b2 ? (b2.left + b2.width / 2) / 100 : 0.321, yPct: b2 ? (b2.top + b2.height / 2) / 100 : 0.819 },
      { pileIdx: 3, locId: 'building_3' as BoardLocationId, xPct: b3 ? (b3.left + b3.width / 2) / 100 : 0.427, yPct: b3 ? (b3.top + b3.height / 2) / 100 : 0.819 },
    ];

    const tileWidth = 10.8;
    const tileDepth = 10.8;

    buildingSlots.forEach(({ pileIdx, locId, xPct, yPct }) => {
      const pile = state.buildingPiles[pileIdx] || [];
      const posX = (xPct - 0.5) * BOARD_WIDTH;
      const posZ = (yPct - 0.5) * BOARD_DEPTH;

      if (pile.length === 0) {
        // Empty pile outline
        const emptyGeom = new THREE.PlaneGeometry(tileWidth, tileDepth);
        emptyGeom.rotateX(-Math.PI / 2);
        const emptyMat = new THREE.MeshBasicMaterial({
          color: 0x3d2817,
          wireframe: true,
          transparent: true,
          opacity: 0.3,
        });
        const emptyMesh = new THREE.Mesh(emptyGeom, emptyMat);
        emptyMesh.position.set(posX, 0.05, posZ);
        buildingsGroup.add(emptyMesh);
        return;
      }

      const topTile = pile[pile.length - 1];
      const stackHeight = Math.max(0.4, pile.length * 0.38);

      const tileGeom = new THREE.BoxGeometry(tileWidth, stackHeight, tileDepth);
      const tileTex = getCachedTexture(topTile.imageUrl || '/board.jpg', loader);

      const woodEdgeMat = new THREE.MeshStandardMaterial({ color: 0x543216, roughness: 0.7 });
      const topFaceMat = new THREE.MeshStandardMaterial({
        map: tileTex,
        roughness: 0.4,
        metalness: 0.05,
      });

      const mats = [woodEdgeMat, woodEdgeMat, topFaceMat, woodEdgeMat, woodEdgeMat, woodEdgeMat];
      const buildingMesh = new THREE.Mesh(tileGeom, mats);
      buildingMesh.position.set(posX, stackHeight / 2 + 0.1, posZ);
      buildingMesh.castShadow = true;
      buildingMesh.receiveShadow = true;
      buildingMesh.userData = { locationId: locId, isBuilding: true, count: pile.length };

      buildingsGroup.add(buildingMesh);
    });

    // --- C. Render Tool Maker 3D Tool Tile Piles in the 2 fenced enclosures under the hut ---
    const toolSlots = [
      {
        pileId: 'tools_1_2',
        xPct: 0.518,
        yPct: 0.589,
        topImageUrl: '/tools/tool_1.png',
        label: 'Pile Outils 1/2',
      },
      {
        pileId: 'tools_3_4',
        xPct: 0.584,
        yPct: 0.589,
        topImageUrl: '/tools/tool_3.png',
        label: 'Pile Outils 3/4',
      },
    ];

    const toolTileWidth = 6.0;
    const toolTileDepth = 6.0;
    const layerHeight = 0.24;
    const tilesInStack = 5;

    toolSlots.forEach(({ xPct, yPct, topImageUrl, label }) => {
      const posX = (xPct - 0.5) * BOARD_WIDTH;
      const posZ = (yPct - 0.5) * BOARD_DEPTH;

      const topTexture = getCachedTexture(topImageUrl, loader);
      const edgeMaterial = new THREE.MeshStandardMaterial({
        color: 0x8a5223,
        roughness: 0.65,
        metalness: 0.05,
      });
      const topMaterial = new THREE.MeshStandardMaterial({
        map: topTexture,
        roughness: 0.4,
        metalness: 0.05,
      });
      const backMaterial = new THREE.MeshStandardMaterial({
        color: 0x6e3c15,
        roughness: 0.75,
      });

      const topTileMaterials = [
        edgeMaterial, edgeMaterial,
        topMaterial, backMaterial,
        edgeMaterial, edgeMaterial,
      ];

      const underTileMaterials = [
        edgeMaterial, edgeMaterial,
        backMaterial, backMaterial,
        edgeMaterial, edgeMaterial,
      ];

      for (let layer = 0; layer < tilesInStack; layer++) {
        const isTop = layer === tilesInStack - 1;
        const geom = new THREE.BoxGeometry(toolTileWidth, layerHeight, toolTileDepth);
        const mats = isTop ? topTileMaterials : underTileMaterials;
        const tileMesh = new THREE.Mesh(geom, mats);

        // Subtle realistic rotation and shift jitter per tile in the physical pile
        const angleJitter = ((layer * 3) % 5 - 2) * 0.012;
        const offsetX = ((layer * 7) % 3 - 1) * 0.035;
        const offsetZ = ((layer * 11) % 3 - 1) * 0.035;

        tileMesh.position.set(
          posX + offsetX,
          (layer + 0.5) * layerHeight + 0.05,
          posZ + offsetZ
        );
        tileMesh.rotation.y = angleJitter;
        tileMesh.castShadow = true;
        tileMesh.receiveShadow = true;
        tileMesh.userData = {
          locationId: 'tool_maker' as BoardLocationId,
          isToolPile: true,
          label,
        };

        toolsGroup.add(tileMesh);
      }
    });

  }, [state.activeCards, state.buildingPiles, classicZones]);

  // 3. Render Victory Points Markers on Perimeter Track & Agriculture Markers on Left Strip
  useEffect(() => {
    const markersGroup = markersGroupRef.current;
    if (!markersGroup) return;

    // Clear previous markers
    while (markersGroup.children.length > 0) {
      markersGroup.remove(markersGroup.children[0]);
    }

    state.players.forEach((player, playerIdx) => {
      const colorHex = PLAYER_COLOR_HEX[player.color] || 0xdc2626;

      // --- A. Victory Points Marker on Perimeter Track ---
      const scorePos = getPerimeterScore3D(player.victoryPoints);
      // Small radial/perpendicular offset so players with equal scores remain distinct
      const offsetX = (playerIdx - 1.5) * 1.3;
      const offsetZ = (playerIdx - 1.5) * 1.3;

      const scoreMarkerGeom = new THREE.CylinderGeometry(1.4, 1.5, 1.1, 16);
      const scoreMarkerMat = new THREE.MeshStandardMaterial({
        color: colorHex,
        roughness: 0.3,
        metalness: 0.1,
      });
      const scoreMarkerMesh = new THREE.Mesh(scoreMarkerGeom, scoreMarkerMat);
      scoreMarkerMesh.position.set(scorePos.x + offsetX, 0.65, scorePos.z + offsetZ);
      scoreMarkerMesh.castShadow = true;
      scoreMarkerMesh.receiveShadow = true;
      scoreMarkerMesh.userData = { isScoreMarker: true, player };

      // Golden star or cap on top
      const capGeom = new THREE.CylinderGeometry(0.8, 0.8, 0.25, 12);
      const capMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.2, metalness: 0.5 });
      const capMesh = new THREE.Mesh(capGeom, capMat);
      capMesh.position.y = 0.65;
      scoreMarkerMesh.add(capMesh);

      markersGroup.add(scoreMarkerMesh);

      // --- B. Agriculture Marker on Left Vertical Strip ---
      const agriPos = getAgriculture3D(player.agriculture, playerIdx);
      const agriMarkerGeom = new THREE.CylinderGeometry(1.1, 1.2, 0.9, 16);
      const agriMarkerMat = new THREE.MeshStandardMaterial({
        color: colorHex,
        roughness: 0.35,
        metalness: 0.05,
      });
      const agriMarkerMesh = new THREE.Mesh(agriMarkerGeom, agriMarkerMat);
      agriMarkerMesh.position.set(agriPos.x, 0.55, agriPos.z);
      agriMarkerMesh.castShadow = true;
      agriMarkerMesh.receiveShadow = true;
      agriMarkerMesh.userData = { isAgriMarker: true, player };

      // Green wheat cap
      const wheatCapGeom = new THREE.CylinderGeometry(0.65, 0.65, 0.2, 10);
      const wheatCapMat = new THREE.MeshStandardMaterial({ color: 0x22c55e, roughness: 0.3 });
      const wheatCapMesh = new THREE.Mesh(wheatCapGeom, wheatCapMat);
      wheatCapMesh.position.y = 0.55;
      agriMarkerMesh.add(wheatCapMesh);

      markersGroup.add(agriMarkerMesh);
    });
  }, [state.players]);

  // 4. Update Interactive Zone Beacons and Hit Meshes
  useEffect(() => {
    const scene = sceneRef.current;
    const beaconsGroup = beaconsGroupRef.current;
    if (!scene || !beaconsGroup) return;

    while (beaconsGroup.children.length > 0) {
      beaconsGroup.remove(beaconsGroup.children[0]);
    }
    zoneMeshesRef.current.clear();

    (Object.entries(zoneCoordinates) as [BoardLocationId, ZoneCoord3D][]).forEach(([locId, coord]) => {
      const status = getZoneStatus(locId);
      const isInteractive = status.canPlace || status.canResolve;
      const isHovered = hoveredZone === locId;

      const posX = (coord.xPct - 0.5) * BOARD_WIDTH;
      const posZ = (coord.yPct - 0.5) * BOARD_DEPTH;

      // Interaction disc
      const isCardOrBuilding = locId.startsWith('card_') || locId.startsWith('building_');
      const discGeom = new THREE.CylinderGeometry(coord.radius * 0.9, coord.radius * 0.9, 0.25, 24);
      let discMat: THREE.Material;

      if (isInteractive && !isCardOrBuilding) {
        discMat = new THREE.MeshBasicMaterial({
          color: status.canResolve ? 0xf59e0b : 0x10b981,
          transparent: true,
          opacity: isHovered ? 0.75 : 0.45,
        });
      } else if (isHovered && !isCardOrBuilding) {
        discMat = new THREE.MeshBasicMaterial({
          color: 0xffffff,
          transparent: true,
          opacity: 0.2,
        });
      } else {
        discMat = new THREE.MeshBasicMaterial({
          transparent: true,
          opacity: 0.0,
        });
      }

      const discMesh = new THREE.Mesh(discGeom, discMat);
      discMesh.position.set(posX, 0.15, posZ);
      discMesh.userData = {
        locationId: locId,
        interactive: isInteractive,
        pulsing: isInteractive && !isCardOrBuilding,
      };

      beaconsGroup.add(discMesh);
      zoneMeshesRef.current.set(locId, discMesh);

      // Add a subtle glowing ring for active clickable zones (excluding cards & buildings)
      if (isInteractive && !isCardOrBuilding) {
        const ringGeom = new THREE.RingGeometry(coord.radius * 0.75, coord.radius * 0.92, 32);
        ringGeom.rotateX(-Math.PI / 2);
        const ringMat = new THREE.MeshBasicMaterial({
          color: status.canResolve ? 0xfbbf24 : 0x34d399,
          side: THREE.DoubleSide,
        });
        const ringMesh = new THREE.Mesh(ringGeom, ringMat);
        ringMesh.position.set(posX, 0.28, posZ);
        beaconsGroup.add(ringMesh);
      }
    });
  }, [getZoneStatus, hoveredZone, zoneCoordinates]);

  // 5. Update 3D Meeples on the board
  useEffect(() => {
    const meeplesGroup = meeplesGroupRef.current;
    if (!meeplesGroup) return;

    while (meeplesGroup.children.length > 0) {
      meeplesGroup.remove(meeplesGroup.children[0]);
    }

    const meepleGeom = createMeepleGeometry();

    (Object.entries(zoneCoordinates) as [BoardLocationId, ZoneCoord3D][]).forEach(([locId, coord]) => {
      const zoneCenterX = (coord.xPct - 0.5) * BOARD_WIDTH;
      const zoneCenterZ = (coord.yPct - 0.5) * BOARD_DEPTH;

      const placedEntries: { player: PlayerState; count: number }[] = [];
      state.players.forEach(p => {
        const count = p.placements[locId] || 0;
        if (count > 0) {
          placedEntries.push({ player: p, count });
        }
      });

      if (placedEntries.length === 0) return;

      let meepleIdx = 0;
      const totalMeeplesInZone = placedEntries.reduce((s, e) => s + e.count, 0);

      placedEntries.forEach(({ player, count }) => {
        const isTargetResolution = player.id === activePlayer.id && isResolution;
        const colorHex = PLAYER_COLOR_HEX[player.color] || 0xdc2626;

        const meepleMat = new THREE.MeshStandardMaterial({
          color: colorHex,
          roughness: 0.35,
          metalness: 0.05,
        });

        for (let i = 0; i < count; i++) {
          const meepleMesh = new THREE.Mesh(meepleGeom, meepleMat);
          meepleMesh.castShadow = true;
          meepleMesh.receiveShadow = true;

          let offsetX = 0;
          let offsetZ = 0;

          if (totalMeeplesInZone === 1) {
            offsetX = 0;
            offsetZ = 0;
          } else if (totalMeeplesInZone <= 4) {
            const angle = (meepleIdx / totalMeeplesInZone) * Math.PI * 2;
            const rad = Math.min(coord.radius * 0.45, 2.8);
            offsetX = Math.cos(angle) * rad;
            offsetZ = Math.sin(angle) * rad;
          } else {
            const ring = meepleIdx < 6 ? 0 : 1;
            const ringCount = ring === 0 ? Math.min(6, totalMeeplesInZone) : totalMeeplesInZone - 6;
            const ringIdx = ring === 0 ? meepleIdx : meepleIdx - 6;
            const angle = (ringIdx / ringCount) * Math.PI * 2;
            const rad = ring === 0 ? 2.5 : 4.8;
            offsetX = Math.cos(angle) * rad;
            offsetZ = Math.sin(angle) * rad;
          }

          // Positioning meeple vertically directly onto the card or building stack
          let baseY = 1.7;
          if (locId.startsWith('card_')) {
            baseY = 2.15; // Directly on top of the card slab
          } else if (locId.startsWith('building_')) {
            const pIdx = parseInt(locId.split('_')[1], 10);
            const pileLen = (state.buildingPiles[pIdx] || []).length;
            const stackHeight = Math.max(0.4, pileLen * 0.38);
            baseY = stackHeight + 0.1 + 1.7; // Directly on top of the top building tile
          }

          meepleMesh.position.set(zoneCenterX + offsetX, baseY, zoneCenterZ + offsetZ);
          meepleMesh.rotation.y = Math.PI / 4 + (meepleIdx * 0.3);
          meepleMesh.userData = {
            playerId: player.id,
            locationId: locId,
            isTargetResolution,
          };

          meeplesGroup.add(meepleMesh);
          meepleIdx++;
        }
      });
    });
  }, [state.players, activePlayer.id, isResolution, zoneCoordinates]);

  // Raycasting for touch and mouse pointer interactions
  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    pointerDownPosRef.current = { x: event.clientX, y: event.clientY };
  };

  const handlePointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    const dx = Math.abs(event.clientX - pointerDownPosRef.current.x);
    const dy = Math.abs(event.clientY - pointerDownPosRef.current.y);
    if (dx > 6 || dy > 6) return; // Ignore drag/camera orbit

    const container = containerRef.current;
    const camera = cameraRef.current;
    if (!container || !camera) return;

    const rect = container.getBoundingClientRect();
    const mouseX = ((event.clientX - rect.left) / container.clientWidth) * 2 - 1;
    const mouseY = -((event.clientY - rect.top) / container.clientHeight) * 2 + 1;

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(mouseX, mouseY), camera);

    // Collect zone hit meshes, card meshes, building meshes, and tool stacks
    const hitCandidates: THREE.Object3D[] = [
      ...Array.from(zoneMeshesRef.current.values()),
      ...(cardsGroupRef.current ? cardsGroupRef.current.children : []),
      ...(buildingsGroupRef.current ? buildingsGroupRef.current.children : []),
      ...(toolsGroupRef.current ? toolsGroupRef.current.children : []),
    ];

    const intersects = raycaster.intersectObjects(hitCandidates, false);

    if (intersects.length > 0) {
      const hit = intersects[0].object;
      const locId = hit.userData.locationId as BoardLocationId;
      if (locId) {
        const status = getZoneStatus(locId);
        if (status.canPlace || status.canResolve) {
          onZoneClick(locId);
        } else if (locId.startsWith('card_')) {
          const slot = parseInt(locId.split('_')[1], 10);
          const card = state.activeCards[slot];
          if (card) {
            setInspectedCard(card);
          }
        }
      }
    }
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const container = containerRef.current;
    const camera = cameraRef.current;
    if (!container || !camera) return;

    const rect = container.getBoundingClientRect();
    const mouseX = ((event.clientX - rect.left) / container.clientWidth) * 2 - 1;
    const mouseY = -((event.clientY - rect.top) / container.clientHeight) * 2 + 1;

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(mouseX, mouseY), camera);

    const hitCandidates: THREE.Object3D[] = [
      ...Array.from(zoneMeshesRef.current.values()),
      ...(cardsGroupRef.current ? cardsGroupRef.current.children : []),
      ...(buildingsGroupRef.current ? buildingsGroupRef.current.children : []),
      ...(toolsGroupRef.current ? toolsGroupRef.current.children : []),
    ];

    const intersects = raycaster.intersectObjects(hitCandidates, false);

    if (intersects.length > 0) {
      const hit = intersects[0].object;
      const locId = hit.userData.locationId as BoardLocationId;
      setHoveredZone(locId);
      const status = getZoneStatus(locId);
      container.style.cursor = (status.canPlace || status.canResolve) ? 'pointer' : 'default';
    } else {
      setHoveredZone(null);
      container.style.cursor = 'grab';
    }
  };

  return (
    <div 
      className={`select-none transition-all duration-300 relative ${
        isFullscreen 
          ? 'fixed inset-0 z-50 p-0 bg-stone-950 flex flex-col justify-center w-full h-full' 
          : className || 'w-full h-full'
      }`}
    >
      {/* 3D WebGL Canvas Container with Peps & High Contrast */}
      <div
        className={`relative w-full h-full overflow-hidden bg-stone-950 ${
          isFullscreen 
            ? 'rounded-none border-0' 
            : 'rounded-none sm:rounded-2xl border-0 sm:border-2 border-stone-800 shadow-2xl'
        }`}
        style={{
          filter: 'contrast(1.08) saturate(1.22) brightness(1.03)',
        }}
      >
        {/* Three.js canvas mounts here */}
        <div
          ref={containerRef}
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          onPointerMove={handlePointerMove}
          className="w-full h-full cursor-grab active:cursor-grabbing touch-none"
        />

        {/* TOP CAMERA CONTROLS TOOLBAR & SMART PRESETS */}
        <div className="absolute top-3 left-3 z-20 flex flex-wrap items-center gap-1.5 bg-stone-950/85 backdrop-blur-md border border-stone-700/80 p-1.5 rounded-2xl shadow-xl">
          <button
            onClick={handleResetCamera}
            className="px-2.5 py-1.5 rounded-xl text-xs font-black bg-amber-500 text-stone-950 hover:bg-amber-400 transition-all flex items-center gap-1 cursor-pointer shadow-md"
            title="Recentrer et réinitialiser la vue du plateau"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Globale</span>
          </button>

          <div className="flex items-center gap-1 border-l border-stone-800 pl-1.5">
            <button
              onClick={handleFocusNature}
              className="px-2 py-1.5 rounded-xl text-xs font-bold text-stone-300 hover:text-white hover:bg-stone-800 flex items-center gap-1 cursor-pointer transition-colors"
              title="Focus sur les ressources naturelles"
            >
              <Trees className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Nature</span>
            </button>
            <button
              onClick={handleFocusVillage}
              className="px-2 py-1.5 rounded-xl text-xs font-bold text-stone-300 hover:text-white hover:bg-stone-800 flex items-center gap-1 cursor-pointer transition-colors"
              title="Focus sur le village (Hutte, Champs, Outils)"
            >
              <Home className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Village</span>
            </button>
            <button
              onClick={handleFocusMarket}
              className="px-2 py-1.5 rounded-xl text-xs font-bold text-stone-300 hover:text-white hover:bg-stone-800 flex items-center gap-1 cursor-pointer transition-colors"
              title="Focus sur les cartes et bâtiments"
            >
              <Scroll className="w-3.5 h-3.5 text-purple-400" />
              <span className="hidden sm:inline">Marché</span>
            </button>
          </div>

          <div className="flex items-center gap-1 border-l border-stone-800 pl-1.5">
            <button
              onClick={() => handleZoom('in')}
              title="Zoomer +"
              className="p-1.5 rounded-xl text-stone-300 hover:text-white hover:bg-stone-800 cursor-pointer transition-colors"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleZoom('out')}
              title="Dézoomer -"
              className="p-1.5 rounded-xl text-stone-300 hover:text-white hover:bg-stone-800 cursor-pointer transition-colors"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              onClick={handleToggleFullscreen}
              title={isFullscreen ? 'Quitter le mode plein écran' : 'Passer en plein écran'}
              className="p-1.5 rounded-xl text-amber-400 hover:bg-stone-800 cursor-pointer transition-colors"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
            {onOpenZoneEditor && (
              <button
                onClick={onOpenZoneEditor}
                title="Déplacer et modifier directement les zones sur le plateau original"
                className="px-2.5 py-1 rounded-xl text-xs font-bold bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 hover:text-white border border-amber-500/50 cursor-pointer transition-colors flex items-center gap-1 shadow-sm"
              >
                <Sliders className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">Éditeur Zones</span>
              </button>
            )}
          </div>
        </div>

        {/* EXPLICIT BUILDING PILES QUICK-VIEW (ANCIEN PLATEAU 3D) */}
        <div className="absolute bottom-11 left-3 z-20 flex flex-wrap items-center gap-1.5 pointer-events-auto">
          {state.buildingPiles.map((pile, idx) => {
            const topTile = pile[pile.length - 1];
            const locId = `building_${idx}` as BoardLocationId;
            const status = getZoneStatus(locId);
            if (!topTile) return null;

            const vp = topTile.isSpecialHut && topTile.victoryPoints !== undefined
              ? topTile.victoryPoints
              : topTile.costType === 'fixed' && topTile.fixedCost
                ? Object.entries(topTile.fixedCost).reduce((s, [r, q]) => s + (q || 0) * (r === 'wood' ? 3 : r === 'clay' ? 4 : r === 'stone' ? 5 : 6), 0)
                : '?';

            return (
              <div
                key={idx}
                onClick={() => (status.canPlace || status.canResolve) && onZoneClick(locId)}
                className={`px-2 py-0.5 rounded-lg border text-[10px] font-bold shadow-md backdrop-blur-md flex items-center gap-1.5 cursor-pointer transition-transform hover:scale-105 ${
                  topTile.isSpecialHut 
                    ? 'bg-purple-950/85 border-purple-500/80 text-purple-200 ring-1 ring-purple-400/50' 
                    : 'bg-stone-950/85 border-amber-600/70 text-amber-200'
                } ${status.canPlace || status.canResolve ? 'ring-2 ring-amber-400 animate-pulse' : ''}`}
                title={`Pile #${idx + 1} (${pile.length} rest.)\n${topTile.description}\nCliquer pour poser ou construire`}
              >
                <span className="text-stone-400 font-mono">P{idx + 1}:</span>
                {topTile.fixedCost ? (
                  <div className="flex items-center gap-1">
                    {(Object.entries(topTile.fixedCost) as [ResourceType, number][]).map(([r, qty]) => (
                      <span key={r} className="inline-flex items-center gap-0.5">
                        <ResourceIcon type={r} size="xs" />
                        {qty > 1 && <span className="font-bold text-[9px]">x{qty}</span>}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span className="font-black">
                    {topTile.costType === 'any_1_to_7' ? '1-7 res.' :
                     topTile.costType === '4_different' ? '4 diff.' :
                     `${topTile.resourceCount || 4} res.`}
                  </span>
                )}
                <span className="text-amber-400 font-black">+{vp} PV</span>
                {topTile.isSpecialHut && (
                  <span className="text-[9px] bg-purple-900 px-1 rounded text-purple-100 font-black">★ Pouvoir</span>
                )}
              </div>
            );
          })}
        </div>

        {/* BOTTOM NAVIGATION TIPS */}
        <div className="absolute bottom-3 left-3 z-20 hidden sm:flex items-center gap-2 bg-stone-950/85 backdrop-blur-md border border-stone-800 px-3 py-1.5 rounded-2xl shadow-xl text-xs text-stone-300 pointer-events-none">
          <span className="text-amber-400 font-bold">Plateau 3D :</span>
          <span>Clic gauche pour tourner</span>
          <span>•</span>
          <span>Clic droit pour glisser</span>
          <span>•</span>
          <span>Molette pour zoomer</span>
          <span>•</span>
          <span className="text-emerald-400">Pions de score sur la frise externe</span>
        </div>

        {/* HOVER ZONE DETAILS HUD - REPOSITIONED TO TOP-LEFT TO PREVENT OVERLAP WITH TOP-RIGHT TRIBE BANNER */}
        {hoveredZone && (() => {
          const coord = zoneCoordinates[hoveredZone];
          if (!coord) return null;
          const status = getZoneStatus(hoveredZone);

          // Details for building piles
          let buildingDetails: {
            title: string;
            fixedCostEntries?: [ResourceType, number][];
            costText?: string;
            vpText: string;
            powerText?: string;
            isSpecial?: boolean;
            remaining: number;
          } | null = null;

          if (hoveredZone.startsWith('building_')) {
            const pIdx = parseInt(hoveredZone.split('_')[1], 10);
            const pile = state.buildingPiles[pIdx] || [];
            const top = pile[pile.length - 1];
            if (top) {
              const fixedVp = top.isSpecialHut && top.victoryPoints !== undefined
                ? top.victoryPoints
                : top.costType === 'fixed' && top.fixedCost
                  ? Object.entries(top.fixedCost).reduce((s, [r, q]) => s + (q || 0) * (r === 'wood' ? 3 : r === 'clay' ? 4 : r === 'stone' ? 5 : 6), 0)
                  : null;

              buildingDetails = {
                title: top.isSpecialHut ? top.description.split(':')[0] : `Hutte Pile #${pIdx + 1}`,
                fixedCostEntries: top.fixedCost ? (Object.entries(top.fixedCost) as [ResourceType, number][]) : undefined,
                costText: !top.fixedCost ? (
                  top.costType === 'any_1_to_7' ? '1 à 7 ressources au choix' :
                  top.costType === '4_different' ? '4 types différents (1 Bois, 1 Glaise, 1 Pierre, 1 Or)' :
                  `${top.resourceCount || 4} ressources (${top.differentTypesRequired || 1} type(s))`
                ) : undefined,
                vpText: fixedVp !== null ? `+${fixedVp} PV` : '? PV (selon ressources)',
                powerText: top.isSpecialHut ? top.passiveEffectDescription : undefined,
                isSpecial: top.isSpecialHut,
                remaining: pile.length,
              };
            }
          }

          // Details for civilization cards
          let cardDetails: {
            name: string;
            costText: string;
            topBonus: string;
            bottomBonus: string;
          } | null = null;

          if (hoveredZone.startsWith('card_')) {
            const slot = parseInt(hoveredZone.split('_')[1], 10);
            const card = state.activeCards[slot];
            if (card) {
              cardDetails = {
                name: card.name,
                costText: `${slot + 1} ressource(s) au choix`,
                topBonus: card.topBonus.description,
                bottomBonus: card.bottomBonus.description,
              };
            }
          }

          return (
            <div className="absolute top-14 left-3 z-40 bg-stone-950/95 backdrop-blur-md border-2 border-amber-500/80 p-3 rounded-2xl shadow-2xl min-w-[240px] max-w-[320px] text-stone-100 pointer-events-none animate-fadeIn space-y-2">
              <div className="flex items-center justify-between border-b border-stone-800 pb-1.5">
                <span className="font-black text-amber-300 text-sm">
                  {buildingDetails ? buildingDetails.title : cardDetails ? cardDetails.name : coord.label}
                </span>
                <span className="text-[10px] bg-stone-800 text-stone-300 px-1.5 py-0.5 rounded font-mono">
                  {coord.sublabel}
                </span>
              </div>

              {/* Building specific details */}
              {buildingDetails && (
                <div className="p-2 bg-stone-900/90 rounded-xl border border-stone-800 space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-stone-400">Coût :</span>
                    {buildingDetails.fixedCostEntries ? (
                      <div className="flex items-center gap-1.5 font-black text-amber-200">
                        {buildingDetails.fixedCostEntries.map(([r, qty]) => (
                          <span key={r} className="inline-flex items-center gap-0.5">
                            <ResourceIcon type={r} size="xs" />
                            <span>x{qty}</span>
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="font-black text-amber-200">{buildingDetails.costText}</span>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-stone-400">Gain :</span>
                    <span className="font-bold text-amber-300">{buildingDetails.vpText}</span>
                  </div>
                  {buildingDetails.isSpecial && buildingDetails.powerText && (
                    <div className="pt-1 mt-1 border-t border-purple-500/30 text-[11px] text-purple-200 flex items-center gap-1 font-medium bg-purple-950/40 p-1 rounded">
                      <span className="text-amber-300">★</span>
                      <span>{buildingDetails.powerText}</span>
                    </div>
                  )}
                  <div className="text-[10px] text-stone-500 text-right font-mono">
                    {buildingDetails.remaining} tuile(s) dans la pile
                  </div>
                </div>
              )}

              {/* Card specific details */}
              {cardDetails && (
                <div className="p-2 bg-stone-900/90 rounded-xl border border-stone-800 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between border-b border-stone-800/80 pb-1">
                    <span className="text-stone-400">Coût :</span>
                    <span className="font-black text-emerald-300">{cardDetails.costText}</span>
                  </div>
                  <div className="text-[11px] text-amber-200">
                    <span className="text-stone-400 block text-[10px] uppercase font-bold">Gain Immédiat :</span>
                    <span>{cardDetails.topBonus}</span>
                  </div>
                  <div className="text-[11px] text-stone-300">
                    <span className="text-stone-400 block text-[10px] uppercase font-bold">Décompte Final :</span>
                    <span>{cardDetails.bottomBonus}</span>
                  </div>
                  <div className="pt-0.5 text-[10px] text-amber-400/80 italic text-center">
                    💡 Cliquer pour inspecter la carte
                  </div>
                </div>
              )}

              {/* Worker status */}
              <div className="text-xs text-stone-300 space-y-0.5 px-0.5">
                <div className="flex justify-between">
                  <span className="text-stone-400">Ouvriers totaux :</span>
                  <span className="font-bold">{status.totalMeeples}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-400">Vos ouvriers :</span>
                  <span className="font-bold text-amber-400">{activePlayer.placements[hoveredZone] || 0}</span>
                </div>
              </div>

              {(status.canPlace || status.canResolve) && (
                <div className="pt-1.5 border-t border-stone-800 text-center">
                  <span className="inline-block bg-amber-500 text-stone-950 font-black text-xs px-3 py-1 rounded-full shadow animate-pulse">
                    {status.canPlace ? '👉 Cliquer pour Poser' : '👉 Cliquer pour Récolter'}
                  </span>
                </div>
              )}
            </div>
          );
        })()}
        {/* Full Card Inspection Modal */}
        {inspectedCard && (
          <div 
            className="absolute inset-0 z-50 bg-stone-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 animate-fade-in pointer-events-auto"
            onClick={() => setInspectedCard(null)}
          >
            <div 
              className="relative w-full max-w-lg bg-stone-900 border-2 border-emerald-500/80 rounded-2xl p-4 shadow-2xl flex flex-col gap-3 max-h-[92vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              <button 
                onClick={() => setInspectedCard(null)}
                className="absolute top-2.5 right-2.5 z-30 p-1.5 rounded-full bg-stone-800 text-stone-300 hover:text-white border border-stone-600 cursor-pointer shadow transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              <CivilizationCardView card={inspectedCard} size="normal" showCost={false} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
