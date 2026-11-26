import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import type {
  AccentPalette,
  BoardTheme,
  CameraPreset,
  GameMode,
  Hole,
  PlayerId,
} from '../game/types';
import type { TranslationDict } from '../game/i18n';
import type { ActiveAnimationCue } from './GebetaBoard';

type GebetaScene3DProps = {
  holes: Hole[];
  playerStore: number;
  opponentStore: number;
  currentPlayer: PlayerId;
  mode: GameMode;
  theme: BoardTheme;
  accent: AccentPalette;
  cameraPreset: CameraPreset;
  isAnimating: boolean;
  gameOver: boolean;
  activeCue: ActiveAnimationCue | null;
  hintHoleId: number | null;
  t: TranslationDict;
  onSelectHole: (holeId: number) => void;
};

type ThemePalette3D = {
  baseHex: string;
  grainHex: string;
  pitHex: string;
  inlayHex: string;
  roughness: number;
  metalness: number;
};

const THEME_3D_PALETTES: Record<BoardTheme, ThemePalette3D> = {
  wanza: {
    baseHex: '#4B2D1A',
    grainHex: '#2E1A0E',
    pitHex: '#1F1108',
    inlayHex: '#C89B42',
    roughness: 0.56,
    metalness: 0.06,
  },
  basalt: {
    baseHex: '#2C2F35',
    grainHex: '#1A1C20',
    pitHex: '#121316',
    inlayHex: '#9BA3AE',
    roughness: 0.72,
    metalness: 0.12,
  },
  acacia: {
    baseHex: '#7A4C24',
    grainHex: '#4F2F14',
    pitHex: '#2D1A0B',
    inlayHex: '#E0B45A',
    roughness: 0.5,
    metalness: 0.05,
  },
};

const ACCENT_HEX: Record<AccentPalette, number> = {
  gold: 0xd4a035,
  terracotta: 0xd86741,
  emerald: 0x36a374,
  cobalt: 0x558de3,
};

// Pit world coordinates:
// Bottom row (Player): 0..5 left-to-right at z = +1.05
// Top row (Opponent): 6..11 right-to-left at z = -1.05
const PIT_X = [-2.65, -1.59, -0.53, 0.53, 1.59, 2.65];

function getPitWorldPos(holeId: number): THREE.Vector3 {
  if (holeId < 6) {
    return new THREE.Vector3(PIT_X[holeId], 0.14, 1.05);
  }
  const topColFromRight = holeId - 6; // 0 -> rightmost (+2.65), 5 -> leftmost (-2.65)
  return new THREE.Vector3(PIT_X[5 - topColFromRight], 0.14, -1.05);
}

const OPP_STORE_POS = new THREE.Vector3(-4.02, 0.14, 0);
const PLY_STORE_POS = new THREE.Vector3(4.02, 0.14, 0);

// Pre-allocated scratch math helpers outside loop (Zero GC)
const _projVec = new THREE.Vector3();
const _pointerVec = new THREE.Vector2();
const _raycaster = new THREE.Raycaster();
const _dummyMatrix = new THREE.Matrix4();
const _dummyQuat = new THREE.Quaternion();
const _dummyPos = new THREE.Vector3();
const _dummyScale = new THREE.Vector3();
const _dummyEuler = new THREE.Euler();

function createProceduralSurfaceTextures(palette: ThemePalette3D): {
  map: THREE.CanvasTexture;
  bumpMap: THREE.CanvasTexture;
} {
  const size = 512;
  const colorCanvas = document.createElement('canvas');
  colorCanvas.width = size;
  colorCanvas.height = size;
  const cCtx = colorCanvas.getContext('2d')!;

  const bumpCanvas = document.createElement('canvas');
  bumpCanvas.width = size;
  bumpCanvas.height = size;
  const bCtx = bumpCanvas.getContext('2d')!;

  cCtx.fillStyle = palette.baseHex;
  cCtx.fillRect(0, 0, size, size);

  bCtx.fillStyle = '#808080';
  bCtx.fillRect(0, 0, size, size);

  // Organic wood/mineral veins
  for (let i = 0; i < 190; i++) {
    const y = (i / 190) * size;
    const thickness = 1 + (i % 4) * 0.7;
    cCtx.strokeStyle = palette.grainHex;
    cCtx.globalAlpha = 0.08 + (i % 5) * 0.03;
    cCtx.lineWidth = thickness;
    cCtx.beginPath();
    cCtx.moveTo(0, y);
    for (let x = 0; x <= size; x += 32) {
      const wave = Math.sin(x * 0.015 + i * 0.7) * 5 + Math.cos(x * 0.04 - i) * 2;
      cCtx.lineTo(x, y + wave);
    }
    cCtx.stroke();

    bCtx.strokeStyle = i % 2 === 0 ? '#686868' : '#969696';
    bCtx.globalAlpha = 0.16;
    bCtx.lineWidth = thickness;
    bCtx.beginPath();
    bCtx.moveTo(0, y);
    for (let x = 0; x <= size; x += 32) {
      const wave = Math.sin(x * 0.015 + i * 0.7) * 5;
      bCtx.lineTo(x, y + wave);
    }
    bCtx.stroke();
  }
  cCtx.globalAlpha = 1;
  bCtx.globalAlpha = 1;

  const map = new THREE.CanvasTexture(colorCanvas);
  map.colorSpace = THREE.SRGBColorSpace;
  map.wrapS = THREE.RepeatWrapping;
  map.wrapT = THREE.RepeatWrapping;

  const bumpMap = new THREE.CanvasTexture(bumpCanvas);
  bumpMap.wrapS = THREE.RepeatWrapping;
  bumpMap.wrapT = THREE.RepeatWrapping;

  return { map, bumpMap };
}

function createClothRunnerTexture(): THREE.CanvasTexture {
  const w = 512;
  const h = 256;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#241810';
  ctx.fillRect(0, 0, w, h);

  // Subtle woven linen thread lines
  ctx.strokeStyle = 'rgba(232, 212, 178, 0.06)';
  ctx.lineWidth = 1;
  for (let x = 0; x < w; x += 4) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, h);
    ctx.stroke();
  }
  for (let y = 0; y < h; y += 4) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
  }

  // Traditional Ethiopian tibeb border bands along edges
  const drawTibebBand = (yStart: number) => {
    ctx.fillStyle = '#C99635';
    ctx.fillRect(0, yStart, w, 6);
    ctx.fillStyle = '#8F2D22';
    ctx.fillRect(0, yStart + 8, w, 5);
    ctx.fillStyle = '#2B6E4B';
    ctx.fillRect(0, yStart + 15, w, 4);
  };
  drawTibebBand(10);
  drawTibebBand(h - 29);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.ClampToEdgeWrapping;
  return tex;
}

function createContactShadowTexture(): THREE.CanvasTexture {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  const grad = ctx.createRadialGradient(
    size / 2,
    size / 2,
    size * 0.1,
    size / 2,
    size / 2,
    size * 0.5,
  );
  grad.addColorStop(0, 'rgba(0,0,0,0.68)');
  grad.addColorStop(0.65, 'rgba(0,0,0,0.32)');
  grad.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);
  return new THREE.CanvasTexture(canvas);
}

// Compute deterministic 3D local offsets inside a pit or store for up to 48 stones
function getStoneSlotOffset(index: number, seed: number, isStore: boolean): {
  x: number;
  y: number;
  z: number;
  rotY: number;
  rotZ: number;
  scale: number;
} {
  const layerCapacity = isStore ? 8 : 6;
  const layer = Math.floor(index / layerCapacity);
  const idxInLayer = index % layerCapacity;
  const angle = idxInLayer * ((Math.PI * 2) / Math.max(1, layerCapacity)) + seed * 0.65 + layer * 0.8;
  const radius =
    idxInLayer === 0 && layer === 0
      ? 0.04
      : (isStore ? 0.25 : 0.21) * (0.65 + (idxInLayer % 2) * 0.35);

  const x = Math.cos(angle) * radius * (isStore ? 0.85 : 1);
  const z = Math.sin(angle) * radius * (isStore ? 1.85 : 1);
  const y = 0.08 + layer * 0.14;

  return {
    x,
    y,
    z,
    rotY: (seed * 1.7 + index * 2.3) % (Math.PI * 2),
    rotZ: ((index % 3) - 1) * 0.16,
    scale: 0.92 + ((index + seed) % 4) * 0.05,
  };
}

export const GebetaScene3D: React.FC<GebetaScene3DProps> = ({
  holes,
  playerStore,
  opponentStore,
  currentPlayer,
  mode,
  theme,
  accent,
  cameraPreset,
  isAnimating,
  gameOver,
  activeCue,
  hintHoleId,
  t,
  onSelectHole,
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const pitBadgeRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const oppStoreBadgeRef = useRef<HTMLDivElement | null>(null);
  const plyStoreBadgeRef = useRef<HTMLDivElement | null>(null);

  // Store latest React props in ref so WebGL scene never tears down on state updates
  const stateRef = useRef({
    holes,
    playerStore,
    opponentStore,
    currentPlayer,
    mode,
    theme,
    accent,
    cameraPreset,
    isAnimating,
    gameOver,
    activeCue,
    hintHoleId,
    onSelectHole,
  });
  stateRef.current = {
    holes,
    playerStore,
    opponentStore,
    currentPlayer,
    mode,
    theme,
    accent,
    cameraPreset,
    isAnimating,
    gameOver,
    activeCue,
    hintHoleId,
    onSelectHole,
  };

  // Track active arcing stone flight when activeCue transitions
  const flightRef = useRef<{
    from: THREE.Vector3;
    to: THREE.Vector3;
    progress: number;
    duration: number;
    active: boolean;
    isCapture: boolean;
  }>({
    from: new THREE.Vector3(),
    to: new THREE.Vector3(),
    progress: 1,
    duration: 0.14,
    active: false,
    isCapture: false,
  });
  const lastCuePosRef = useRef<THREE.Vector3>(new THREE.Vector3(0, 0.2, 0));
  const lastCueKeyRef = useRef<string>('');

  // Trigger 3D flying stone arc whenever activeCue updates
  useEffect(() => {
    if (!activeCue) {
      lastCueKeyRef.current = '';
      return;
    }
    const key = `${activeCue.type}-${activeCue.holeId}-${activeCue.stonesInHand}`;
    if (key === lastCueKeyRef.current) return;
    lastCueKeyRef.current = key;

    const pitPos = getPitWorldPos(activeCue.holeId);

    if (activeCue.type === 'pickup' || activeCue.type === 'relay') {
      lastCuePosRef.current.copy(pitPos);
    } else if (activeCue.type === 'drop') {
      flightRef.current = {
        from: lastCuePosRef.current.clone(),
        to: pitPos.clone(),
        progress: 0,
        duration: 0.12,
        active: true,
        isCapture: false,
      };
      lastCuePosRef.current.copy(pitPos);
    } else if (activeCue.type === 'capture') {
      const storeTarget =
        activeCue.capturedBy === 'player' ? PLY_STORE_POS : OPP_STORE_POS;
      flightRef.current = {
        from: pitPos.clone(),
        to: storeTarget.clone(),
        progress: 0,
        duration: 0.22,
        active: true,
        isCapture: true,
      };
    }
  }, [activeCue]);

  // Ref for triggering camera preset transition inside WebGL loop
  const cameraPresetTargetRef = useRef<CameraPreset | null>(null);
  const lastPresetRef = useRef<CameraPreset>(cameraPreset);
  useEffect(() => {
    if (cameraPreset !== lastPresetRef.current) {
      lastPresetRef.current = cameraPreset;
      cameraPresetTargetRef.current = cameraPreset;
    }
  }, [cameraPreset]);

  // Ref for triggering dynamic material theme swap without recreating WebGL scene
  const applyThemeRef = useRef<((nextTheme: BoardTheme) => void) | null>(null);
  useEffect(() => {
    applyThemeRef.current?.(theme);
  }, [theme]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const isSoftwareGl = (() => {
      const gl = document.createElement('canvas').getContext('webgl2');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;
    const initAspect = width / height;

    const getPresetCameraPos = (preset: CameraPreset, asp: number): [number, number, number] => {
      const portraitBoost = asp < 1.05 ? Math.min(2.7, 1.24 / Math.max(0.42, asp)) : 1;
      if (preset === 'topdown') {
        return [0, 9.6 * portraitBoost, 0.85 * portraitBoost];
      }
      return [0, 6.2 * portraitBoost, 6.7 * portraitBoost];
    };

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x160f0a);
    scene.fog = new THREE.FogExp2(0x160f0a, 0.018);

    const camera = new THREE.PerspectiveCamera(
      initAspect < 0.85 ? 50 : 40,
      initAspect,
      0.1,
      80,
    );
    const [ix, iy, iz] = getPresetCameraPos(stateRef.current.cameraPreset, initAspect);
    camera.position.set(ix, iy, iz);
    camera.lookAt(0, 0.05, 0);

    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.14;
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.domElement.style.display = 'block';
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.setAttribute('data-testid', 'gebeta-3d-canvas');
    container.appendChild(renderer.domElement);

    // Studio Environment Reflection (mandatory for PBR sheen)
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const roomEnv = new RoomEnvironment();
    scene.environment = pmremGenerator.fromScene(roomEnv, 0.04).texture;
    roomEnv.dispose();
    pmremGenerator.dispose();

    // 3-Point Warm/Cool Studio Lighting Rig
    const hemiLight = new THREE.HemisphereLight(0xd4e2f4, 0x3b2212, 0.85);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xffe1b0, 2.1);
    keyLight.position.set(4.5, 9.5, 5.2);
    if (!isSoftwareGl) {
      keyLight.castShadow = true;
      keyLight.shadow.mapSize.set(1024, 1024);
      keyLight.shadow.camera.left = -7;
      keyLight.shadow.camera.right = 7;
      keyLight.shadow.camera.top = 5;
      keyLight.shadow.camera.bottom = -5;
      keyLight.shadow.camera.near = 2;
      keyLight.shadow.camera.far = 22;
      keyLight.shadow.bias = -0.0005;
      keyLight.shadow.normalBias = 0.02;
    }
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0xd4a035, 0.85);
    rimLight.position.set(-5.5, 5.0, -5.0);
    scene.add(rimLight);

    // OrbitControls (clamped so camera stays above table)
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 0.05, 0);
    controls.enablePan = false;
    controls.enableDamping = !isSoftwareGl;
    controls.dampingFactor = 0.07;
    controls.minDistance = 6.0;
    controls.maxDistance = 30.0;
    controls.minPolarAngle = 0.08;
    controls.maxPolarAngle = Math.PI * 0.42;
    controls.minAzimuthAngle = -Math.PI * 0.35;
    controls.maxAzimuthAngle = Math.PI * 0.35;
    controls.update();

    controls.addEventListener('start', () => {
      cameraPresetTargetRef.current = null;
    });

    // --- Grounded Tabletop & Woven Shemma Runner ---
    const disposableTextures: THREE.Texture[] = [];
    const disposableGeometries: THREE.BufferGeometry[] = [];
    const disposableMaterials: THREE.Material[] = [];

    const tableGeo = new THREE.PlaneGeometry(36, 28);
    disposableGeometries.push(tableGeo);
    const tableTex = createProceduralSurfaceTextures({
      baseHex: '#24160D',
      grainHex: '#150C06',
      pitHex: '#120A05',
      inlayHex: '#D4A035',
      roughness: 0.78,
      metalness: 0.04,
    });
    tableTex.map.repeat.set(3, 3);
    tableTex.map.anisotropy = renderer.capabilities.getMaxAnisotropy();
    disposableTextures.push(tableTex.map, tableTex.bumpMap);
    const tableMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      map: tableTex.map,
      bumpMap: tableTex.bumpMap,
      bumpScale: 0.02,
      roughness: 0.8,
      metalness: 0.05,
    });
    disposableMaterials.push(tableMat);
    const tableMesh = new THREE.Mesh(tableGeo, tableMat);
    tableMesh.rotation.x = -Math.PI / 2;
    tableMesh.position.y = -0.52;
    tableMesh.receiveShadow = true;
    scene.add(tableMesh);

    // Traditional woven runner strip beneath board
    const clothGeo = new THREE.BoxGeometry(14.8, 0.025, 5.4);
    disposableGeometries.push(clothGeo);
    const clothTex = createClothRunnerTexture();
    clothTex.repeat.set(3, 1);
    clothTex.anisotropy = renderer.capabilities.getMaxAnisotropy();
    disposableTextures.push(clothTex);
    const clothMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      map: clothTex,
      roughness: 0.9,
      metalness: 0.02,
    });
    disposableMaterials.push(clothMat);
    const clothMesh = new THREE.Mesh(clothGeo, clothMat);
    clothMesh.position.y = -0.495;
    clothMesh.receiveShadow = true;
    scene.add(clothMesh);

    // Soft radial contact shadow directly beneath board
    const shadowTex = createContactShadowTexture();
    disposableTextures.push(shadowTex);
    const shadowGeo = new THREE.PlaneGeometry(11.6, 5.2);
    disposableGeometries.push(shadowGeo);
    const shadowMat = new THREE.MeshBasicMaterial({
      map: shadowTex,
      transparent: true,
      opacity: 0.55,
      depthWrite: false,
    });
    disposableMaterials.push(shadowMat);
    const shadowPlane = new THREE.Mesh(shadowGeo, shadowMat);
    shadowPlane.rotation.x = -Math.PI / 2;
    shadowPlane.position.y = -0.468;
    scene.add(shadowPlane);

    // --- Composite Multi-Part Carved Gebeta Board (THREE.Group) ---
    const boardGroup = new THREE.Group();
    boardGroup.position.y = -0.46;
    scene.add(boardGroup);

    const initPalette = THEME_3D_PALETTES[stateRef.current.theme];
    const boardTextures = createProceduralSurfaceTextures(initPalette);
    boardTextures.map.anisotropy = renderer.capabilities.getMaxAnisotropy();
    disposableTextures.push(boardTextures.map, boardTextures.bumpMap);

    const boardMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      map: boardTextures.map,
      bumpMap: boardTextures.bumpMap,
      bumpScale: 0.028,
      roughness: initPalette.roughness,
      metalness: initPalette.metalness,
    });
    disposableMaterials.push(boardMaterial);

    const pitWallMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color(initPalette.pitHex),
      roughness: 0.78,
      metalness: 0.05,
    });
    disposableMaterials.push(pitWallMaterial);

    const inlayMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color(initPalette.inlayHex),
      roughness: 0.34,
      metalness: 0.72,
    });
    disposableMaterials.push(inlayMaterial);

    // Part 1: Rounded Beveled Main Board Slab (ExtrudeGeometry)
    const boardShape = new THREE.Shape();
    const bw = 9.8;
    const bd = 3.7;
    const br = 0.48;
    boardShape.moveTo(-bw / 2 + br, -bd / 2);
    boardShape.lineTo(bw / 2 - br, -bd / 2);
    boardShape.quadraticCurveTo(bw / 2, -bd / 2, bw / 2, -bd / 2 + br);
    boardShape.lineTo(bw / 2, bd / 2 - br);
    boardShape.quadraticCurveTo(bw / 2, bd / 2, bw / 2 - br, bd / 2);
    boardShape.lineTo(-bw / 2 + br, bd / 2);
    boardShape.quadraticCurveTo(-bw / 2, bd / 2, -bw / 2, bd / 2 - br);
    boardShape.lineTo(-bw / 2, -bd / 2 + br);
    boardShape.quadraticCurveTo(-bw / 2, -bd / 2, -bw / 2 + br, -bd / 2);

    const slabGeo = new THREE.ExtrudeGeometry(boardShape, {
      depth: 0.44,
      bevelEnabled: true,
      bevelThickness: 0.08,
      bevelSize: 0.08,
      bevelSegments: 4,
    });
    slabGeo.rotateX(-Math.PI / 2);
    slabGeo.computeVertexNormals();
    disposableGeometries.push(slabGeo);

    const slabMesh = new THREE.Mesh(slabGeo, boardMaterial);
    slabMesh.position.y = 0.08;
    slabMesh.castShadow = true;
    slabMesh.receiveShadow = true;
    boardGroup.add(slabMesh);

    // Part 2: Carved Side Handle Finials (traditional Ethiopian Gebeta end lugs)
    const handleShape = new THREE.Shape();
    handleShape.moveTo(-0.32, -1.1);
    handleShape.lineTo(0.28, -0.78);
    handleShape.quadraticCurveTo(0.46, 0, 0.28, 0.78);
    handleShape.lineTo(-0.32, 1.1);
    handleShape.closePath();

    const handleGeo = new THREE.ExtrudeGeometry(handleShape, {
      depth: 0.26,
      bevelEnabled: true,
      bevelThickness: 0.05,
      bevelSize: 0.05,
      bevelSegments: 3,
    });
    handleGeo.rotateX(-Math.PI / 2);
    disposableGeometries.push(handleGeo);

    const rightHandle = new THREE.Mesh(handleGeo, boardMaterial);
    rightHandle.position.set(5.1, 0.14, 0);
    rightHandle.castShadow = true;
    rightHandle.receiveShadow = true;
    boardGroup.add(rightHandle);

    const leftHandle = new THREE.Mesh(handleGeo, boardMaterial);
    leftHandle.rotation.y = Math.PI;
    leftHandle.position.set(-5.1, 0.14, 0);
    leftHandle.castShadow = true;
    leftHandle.receiveShadow = true;
    boardGroup.add(leftHandle);

    // Part 3: Center Brass Inlay Divider Line & Directional Chevrons
    const dividerGeo = new THREE.BoxGeometry(6.1, 0.015, 0.035);
    disposableGeometries.push(dividerGeo);
    const dividerMesh = new THREE.Mesh(dividerGeo, inlayMaterial);
    dividerMesh.position.set(0, 0.605, 0);
    boardGroup.add(dividerMesh);

    // Subtle brass corner inlay studs
    const studGeo = new THREE.CylinderGeometry(0.06, 0.07, 0.025, 12);
    disposableGeometries.push(studGeo);
    [
      [-4.55, -1.55],
      [4.55, -1.55],
      [-4.55, 1.55],
      [4.55, 1.55],
    ].forEach(([sx, sz]) => {
      const stud = new THREE.Mesh(studGeo, inlayMaterial);
      stud.position.set(sx, 0.605, sz);
      boardGroup.add(stud);
    });

    // Part 4: Two Recessed Oval Side Stores
    const storeRimGeo = new THREE.CylinderGeometry(0.56, 0.56, 0.05, 28, 1, true);
    storeRimGeo.scale(1, 1, 2.25);
    disposableGeometries.push(storeRimGeo);

    const storeBasinGeo = new THREE.CylinderGeometry(0.54, 0.45, 0.18, 28);
    storeBasinGeo.scale(1, 1, 2.25);
    disposableGeometries.push(storeBasinGeo);

    const createStoreAssembly = (xPos: number) => {
      const group = new THREE.Group();
      group.position.set(xPos, 0.52, 0);

      const basin = new THREE.Mesh(storeBasinGeo, pitWallMaterial);
      basin.receiveShadow = true;
      group.add(basin);

      const trimRingGeo = new THREE.TorusGeometry(0.56, 0.026, 10, 36);
      trimRingGeo.rotateX(-Math.PI / 2);
      trimRingGeo.scale(1, 1, 2.25);
      disposableGeometries.push(trimRingGeo);
      const trimMat = inlayMaterial.clone();
      disposableMaterials.push(trimMat);
      const trim = new THREE.Mesh(trimRingGeo, trimMat);
      trim.position.y = 0.088;
      group.add(trim);

      boardGroup.add(group);
      return trimMat;
    };

    const oppStoreTrimMat = createStoreAssembly(-4.02);
    const plyStoreTrimMat = createStoreAssembly(4.02);

    // Part 5: 12 Sculpted LatheGeometry Pits + Interactive Hit Proxies + Accent Rings
    const lathePoints = [
      new THREE.Vector2(0.0, 0.0),
      new THREE.Vector2(0.32, 0.01),
      new THREE.Vector2(0.41, 0.08),
      new THREE.Vector2(0.45, 0.16),
      new THREE.Vector2(0.51, 0.17),
    ];
    const pitBowlGeo = new THREE.LatheGeometry(lathePoints, 28);
    disposableGeometries.push(pitBowlGeo);

    const pitRingGeo = new THREE.TorusGeometry(0.47, 0.025, 10, 32);
    pitRingGeo.rotateX(-Math.PI / 2);
    disposableGeometries.push(pitRingGeo);

    const hitProxyGeo = new THREE.CylinderGeometry(0.49, 0.49, 0.3, 16);
    disposableGeometries.push(hitProxyGeo);
    const hitProxyMat = new THREE.MeshBasicMaterial({ visible: false });
    disposableMaterials.push(hitProxyMat);

    const pitRingMaterials: THREE.MeshStandardMaterial[] = [];
    const hitProxies: THREE.Mesh[] = [];

    for (let id = 0; id < 12; id++) {
      const worldPos = getPitWorldPos(id);
      const pitGroup = new THREE.Group();
      pitGroup.position.set(worldPos.x, 0.44, worldPos.z);

      const bowl = new THREE.Mesh(pitBowlGeo, pitWallMaterial);
      bowl.receiveShadow = true;
      pitGroup.add(bowl);

      const ringMat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(initPalette.inlayHex),
        emissive: new THREE.Color(0x000000),
        emissiveIntensity: 0,
        roughness: 0.35,
        metalness: 0.65,
      });
      disposableMaterials.push(ringMat);
      pitRingMaterials.push(ringMat);

      const ring = new THREE.Mesh(pitRingGeo, ringMat);
      ring.position.y = 0.168;
      pitGroup.add(ring);

      const proxy = new THREE.Mesh(hitProxyGeo, hitProxyMat);
      proxy.position.y = 0.14;
      proxy.layers.set(1);
      proxy.userData.holeId = id;
      pitGroup.add(proxy);
      hitProxies.push(proxy);

      boardGroup.add(pitGroup);
    }

    // --- 3D River Pebbles & Cowrie Stones (48 total across pits/stores) ---
    const stoneGeo = new THREE.SphereGeometry(0.128, 16, 12);
    stoneGeo.scale(1.05, 0.66, 0.86);
    disposableGeometries.push(stoneGeo);

    const stoneToneMaterials = [
      new THREE.MeshStandardMaterial({ color: 0xe6d6bc, roughness: 0.26, metalness: 0.04 }),
      new THREE.MeshStandardMaterial({ color: 0x9c7c5e, roughness: 0.44, metalness: 0.05 }),
      new THREE.MeshStandardMaterial({ color: 0x524841, roughness: 0.52, metalness: 0.08 }),
      new THREE.MeshStandardMaterial({ color: 0xc88e46, roughness: 0.36, metalness: 0.06 }),
    ];
    stoneToneMaterials.forEach((m) => disposableMaterials.push(m));

    // Create 4 instanced meshes (12 stones per tone = 48 stones, enough for up to 48 in any distribution)
    const stoneInstances: THREE.InstancedMesh[] = stoneToneMaterials.map((mat) => {
      const inst = new THREE.InstancedMesh(stoneGeo, mat, 48);
      inst.castShadow = !isSoftwareGl;
      inst.receiveShadow = true;
      inst.frustumCulled = false;
      inst.count = 0;
      scene.add(inst);
      return inst;
    });

    // Dedicated Hero Flying Stone for arcing sowing/capture animation
    const flyingStoneMat = new THREE.MeshStandardMaterial({
      color: 0xf4d284,
      emissive: new THREE.Color(0xd4a035),
      emissiveIntensity: 0.45,
      roughness: 0.22,
      metalness: 0.2,
    });
    disposableMaterials.push(flyingStoneMat);
    const flyingStoneMesh = new THREE.Mesh(stoneGeo, flyingStoneMat);
    flyingStoneMesh.scale.set(1.22, 1.22, 1.22);
    flyingStoneMesh.visible = false;
    flyingStoneMesh.castShadow = !isSoftwareGl;
    scene.add(flyingStoneMesh);

    // Dynamic Theme Updater
    applyThemeRef.current = (nextTheme: BoardTheme) => {
      const nextPal = THEME_3D_PALETTES[nextTheme];
      const nextTex = createProceduralSurfaceTextures(nextPal);
      nextTex.map.anisotropy = renderer.capabilities.getMaxAnisotropy();
      disposableTextures.push(nextTex.map, nextTex.bumpMap);

      boardMaterial.map = nextTex.map;
      boardMaterial.bumpMap = nextTex.bumpMap;
      boardMaterial.roughness = nextPal.roughness;
      boardMaterial.metalness = nextPal.metalness;
      boardMaterial.needsUpdate = true;

      pitWallMaterial.color.set(nextPal.pitHex);
      inlayMaterial.color.set(nextPal.inlayHex);
    };

    // --- Raycasting for Interactive Hover & Click (distinguish click vs orbit drag) ---
    let hoveredHoleId: number | null = null;
    let pointerDownPos = { x: 0, y: 0 };
    let lastMoveCheck = 0;

    const updatePointerFromEvent = (e: PointerEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      _pointerVec.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      _pointerVec.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    };

    const raycastPit = (e: PointerEvent): number | null => {
      updatePointerFromEvent(e);
      _raycaster.layers.set(1);
      _raycaster.setFromCamera(_pointerVec, camera);
      const hits = _raycaster.intersectObjects(hitProxies, false);
      if (hits.length > 0) {
        return hits[0].object.userData.holeId as number;
      }
      return null;
    };

    const isHolePlayable = (holeId: number): boolean => {
      const s = stateRef.current;
      if (s.isAnimating || s.gameOver) return false;
      if (s.mode === 'ai' && s.currentPlayer !== 'player') return false;
      const hole = s.holes[holeId];
      return Boolean(hole && hole.owner === s.currentPlayer && hole.stones > 0);
    };

    const onPointerMove = (e: PointerEvent) => {
      const now = performance.now();
      if (now - lastMoveCheck < 32) return;
      lastMoveCheck = now;

      const hitId = raycastPit(e);
      if (hitId !== null && isHolePlayable(hitId)) {
        hoveredHoleId = hitId;
        renderer.domElement.style.cursor = 'pointer';
      } else {
        hoveredHoleId = null;
        renderer.domElement.style.cursor = 'grab';
      }
    };

    const onPointerDown = (e: PointerEvent) => {
      pointerDownPos = { x: e.clientX, y: e.clientY };
    };

    const onPointerUp = (e: PointerEvent) => {
      const dx = e.clientX - pointerDownPos.x;
      const dy = e.clientY - pointerDownPos.y;
      if (Math.hypot(dx, dy) > 8) return; // Was an orbit drag, not a pit click

      const hitId = raycastPit(e);
      if (hitId !== null && isHolePlayable(hitId)) {
        stateRef.current.onSelectHole(hitId);
      }
    };

    renderer.domElement.addEventListener('pointermove', onPointerMove);
    renderer.domElement.addEventListener('pointerdown', onPointerDown);
    renderer.domElement.addEventListener('pointerup', onPointerUp);

    // Responsive ResizeObserver
    const handleResize = () => {
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;
      const asp = w / h;
      camera.fov = asp < 0.85 ? 50 : 40;
      camera.aspect = asp;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      cameraPresetTargetRef.current = stateRef.current.cameraPreset;
    };
    const resizeObs = new ResizeObserver(handleResize);
    resizeObs.observe(container);

    // --- Main Animation & Projection Loop ---
    const clock = new THREE.Clock();
    let frameId = 0;
    let disposed = false;

    const afterDraw = (cb: () => void) => {
      const gl = renderer.getContext() as WebGL2RenderingContext;
      const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
      gl.flush();
      const poll = () => {
        if (disposed) {
          if (sync) gl.deleteSync(sync);
          return;
        }
        const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
        if (state === gl.UNSIGNALED) {
          frameId = window.setTimeout(poll, 5);
        } else {
          if (sync) gl.deleteSync(sync);
          frameId = window.setTimeout(cb, 75);
        }
      };
      frameId = window.setTimeout(poll, 5);
    };

    const updateProjectedBadges = (w: number, h: number) => {
      const s = stateRef.current;

      // Project 12 pits
      for (let i = 0; i < 12; i++) {
        const el = pitBadgeRefs.current[i];
        if (!el) continue;
        const pos = getPitWorldPos(i);
        _projVec.set(pos.x, pos.y + 0.02, pos.z + (i < 6 ? 0.58 : -0.58));
        _projVec.project(camera);
        if (_projVec.z >= -1 && _projVec.z <= 1) {
          const sx = ((_projVec.x + 1) / 2) * w;
          const sy = ((-_projVec.y + 1) / 2) * h;
          el.style.transform = `translate3d(${sx.toFixed(1)}px, ${sy.toFixed(1)}px, 0) translate(-50%, -50%)`;
          el.style.opacity = '1';
        } else {
          el.style.opacity = '0';
        }
      }

      // Project Opponent Store & Player Store readouts
      const projectStoreEl = (el: HTMLDivElement | null, worldPos: THREE.Vector3) => {
        if (!el) return;
        _projVec.set(worldPos.x, worldPos.y + 0.08, worldPos.z + 1.88);
        _projVec.project(camera);
        if (_projVec.z >= -1 && _projVec.z <= 1) {
          const sx = ((_projVec.x + 1) / 2) * w;
          const sy = ((-_projVec.y + 1) / 2) * h;
          el.style.transform = `translate3d(${sx.toFixed(1)}px, ${sy.toFixed(1)}px, 0) translate(-50%, -50%)`;
          el.style.opacity = '1';
        } else {
          el.style.opacity = '0';
        }
      };
      projectStoreEl(oppStoreBadgeRef.current, OPP_STORE_POS);
      projectStoreEl(plyStoreBadgeRef.current, PLY_STORE_POS);

      // Keep subtle unused ref warning clean
      void s;
    };

    const tick = () => {
      if (disposed) return;
      const dt = Math.min(clock.getDelta(), 0.05);
      const elapsed = clock.elapsedTime;
      const s = stateRef.current;

      // Smooth damped camera preset transition
      if (cameraPresetTargetRef.current) {
        const curAsp =
          (container.clientWidth || window.innerWidth) /
          (container.clientHeight || window.innerHeight);
        const [tx, ty, tz] = getPresetCameraPos(cameraPresetTargetRef.current, curAsp);
        camera.position.x = THREE.MathUtils.damp(camera.position.x, tx, 6, dt);
        camera.position.y = THREE.MathUtils.damp(camera.position.y, ty, 6, dt);
        camera.position.z = THREE.MathUtils.damp(camera.position.z, tz, 6, dt);
        if (
          Math.abs(camera.position.y - ty) < 0.03 &&
          Math.abs(camera.position.z - tz) < 0.03
        ) {
          cameraPresetTargetRef.current = null;
        }
      }

      controls.update();

      // Update pit ring emissive highlights & active store trims
      const accentHex = ACCENT_HEX[s.accent];
      const baseInlayHex = THEME_3D_PALETTES[s.theme].inlayHex;
      for (let i = 0; i < 12; i++) {
        const ringMat = pitRingMaterials[i];
        const hole = s.holes[i];
        const isCue = s.activeCue?.holeId === i;
        const isCapture = isCue && s.activeCue?.type === 'capture';
        const isRelay = isCue && s.activeCue?.type === 'relay';
        const isHovered = hoveredHoleId === i && isHolePlayable(i);
        const isHinted = s.hintHoleId === i && isHolePlayable(i);
        const isPlayable = isHolePlayable(i);

        if (isCapture) {
          ringMat.color.setHex(0xffd260);
          ringMat.emissive.setHex(0xf3c15a);
          ringMat.emissiveIntensity = 1.4;
        } else if (isRelay) {
          ringMat.color.setHex(0xe87d4b);
          ringMat.emissive.setHex(0xc85a32);
          ringMat.emissiveIntensity = 1.1;
        } else if (isCue || isHovered || isHinted) {
          ringMat.color.setHex(accentHex);
          ringMat.emissive.setHex(accentHex);
          ringMat.emissiveIntensity = isHovered ? 0.95 : 0.8;
        } else if (hole.stones === 3) {
          ringMat.color.setHex(accentHex);
          ringMat.emissive.setHex(accentHex);
          ringMat.emissiveIntensity = 0.28 + Math.sin(elapsed * 3.0) * 0.08;
        } else if (isPlayable) {
          ringMat.color.set(baseInlayHex);
          ringMat.emissive.setHex(accentHex);
          ringMat.emissiveIntensity = 0.16;
        } else {
          ringMat.color.set(baseInlayHex);
          ringMat.emissive.setHex(0x000000);
          ringMat.emissiveIntensity = 0;
        }
      }

      // Highlight active player's store rim
      if (!s.gameOver && s.currentPlayer === 'player') {
        plyStoreTrimMat.emissive.setHex(accentHex);
        plyStoreTrimMat.emissiveIntensity = 0.35;
        oppStoreTrimMat.emissive.setHex(0x000000);
        oppStoreTrimMat.emissiveIntensity = 0;
      } else if (!s.gameOver && s.currentPlayer === 'opponent') {
        oppStoreTrimMat.emissive.setHex(accentHex);
        oppStoreTrimMat.emissiveIntensity = 0.35;
        plyStoreTrimMat.emissive.setHex(0x000000);
        plyStoreTrimMat.emissiveIntensity = 0;
      } else {
        plyStoreTrimMat.emissiveIntensity = 0;
        oppStoreTrimMat.emissiveIntensity = 0;
      }

      // Populate instanced stones across 12 pits + 2 stores
      const counts = [0, 0, 0, 0];

      const pushStone = (
        toneIdx: number,
        px: number,
        py: number,
        pz: number,
        rotY: number,
        rotZ: number,
        sc: number,
      ) => {
        const idx = counts[toneIdx];
        if (idx >= 48) return;
        counts[toneIdx] = idx + 1;
        _dummyPos.set(px, py, pz);
        _dummyEuler.set(0, rotY, rotZ);
        _dummyQuat.setFromEuler(_dummyEuler);
        _dummyScale.set(sc, sc, sc);
        _dummyMatrix.compose(_dummyPos, _dummyQuat, _dummyScale);
        stoneInstances[toneIdx].setMatrixAt(idx, _dummyMatrix);
      };

      for (let h = 0; h < 12; h++) {
        const count = s.holes[h].stones;
        const pitBase = getPitWorldPos(h);
        const hoverLift = hoveredHoleId === h && isHolePlayable(h) ? 0.045 : 0;
        for (let k = 0; k < count; k++) {
          const slot = getStoneSlotOffset(k, h + 1, false);
          const tone = (h + k) % 4;
          pushStone(
            tone,
            pitBase.x + slot.x,
            pitBase.y + slot.y + hoverLift,
            pitBase.z + slot.z,
            slot.rotY,
            slot.rotZ,
            slot.scale,
          );
        }
      }

      for (let k = 0; k < s.opponentStore; k++) {
        const slot = getStoneSlotOffset(k, 17, true);
        pushStone(
          (k + 1) % 4,
          OPP_STORE_POS.x + slot.x,
          OPP_STORE_POS.y + slot.y,
          OPP_STORE_POS.z + slot.z,
          slot.rotY,
          slot.rotZ,
          slot.scale,
        );
      }

      for (let k = 0; k < s.playerStore; k++) {
        const slot = getStoneSlotOffset(k, 23, true);
        pushStone(
          (k + 2) % 4,
          PLY_STORE_POS.x + slot.x,
          PLY_STORE_POS.y + slot.y,
          PLY_STORE_POS.z + slot.z,
          slot.rotY,
          slot.rotZ,
          slot.scale,
        );
      }

      for (let tIdx = 0; tIdx < 4; tIdx++) {
        stoneInstances[tIdx].count = counts[tIdx];
        stoneInstances[tIdx].instanceMatrix.needsUpdate = true;
      }

      // Animate arcing hero stone during sowing / capture
      const fl = flightRef.current;
      if (fl.active) {
        fl.progress = Math.min(1, fl.progress + dt / fl.duration);
        const u = fl.progress;
        const arcH = fl.isCapture ? 1.55 : 0.85;
        flyingStoneMesh.visible = true;
        flyingStoneMesh.position.lerpVectors(fl.from, fl.to, u);
        flyingStoneMesh.position.y += 0.35 + Math.sin(Math.PI * u) * arcH;
        flyingStoneMesh.rotation.y += dt * 10;
        if (fl.progress >= 1) {
          fl.active = false;
          flyingStoneMesh.visible = false;
        }
      }

      const curW = container.clientWidth || window.innerWidth;
      const curH = container.clientHeight || window.innerHeight;
      updateProjectedBadges(curW, curH);

      renderer.render(scene, camera);

      if (isSoftwareGl) {
        afterDraw(tick);
      } else {
        frameId = requestAnimationFrame(tick);
      }
    };

    if (!isSoftwareGl) {
      renderer.compile(scene, camera);
    }

    if (isSoftwareGl) {
      tick();
    } else {
      frameId = requestAnimationFrame(tick);
    }

    return () => {
      disposed = true;
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      resizeObs.disconnect();
      renderer.domElement.removeEventListener('pointermove', onPointerMove);
      renderer.domElement.removeEventListener('pointerdown', onPointerDown);
      renderer.domElement.removeEventListener('pointerup', onPointerUp);
      controls.dispose();
      disposableGeometries.forEach((g) => g.dispose());
      disposableMaterials.forEach((m) => m.dispose());
      disposableTextures.forEach((tx) => tx.dispose());
      renderer.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  const opponentTitle = mode === 'ai' ? t.aiLabel : t.player2Label;
  const playerTitle = mode === 'ai' ? t.playerLabel : t.player1Label;

  return (
    <div className="relative w-full h-full min-h-[420px] overflow-hidden select-none">
      {/* Isolated WebGL Mount Container */}
      <div ref={mountRef} className="absolute inset-0 w-full h-full" />

      {/* Projected 3D Accessible Pit Count Badges & Store Badges */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {holes.map((hole) => {
          const isOwnerTurn = hole.owner === currentPlayer;
          const canClick =
            !isAnimating &&
            !gameOver &&
            isOwnerTurn &&
            hole.stones > 0 &&
            (mode === 'local' || currentPlayer === 'player');
          const displayNum = hole.owner === 'player' ? hole.id + 1 : 12 - hole.id;
          const sideLabel = hole.owner === 'player' ? playerTitle : opponentTitle;
          const isCue = activeCue?.holeId === hole.id;
          const isCapture = isCue && activeCue?.type === 'capture';
          const isHint = hintHoleId === hole.id && canClick;

          return (
            <button
              key={hole.id}
              ref={(el) => {
                pitBadgeRefs.current[hole.id] = el;
              }}
              type="button"
              data-testid={`pit-${hole.id}`}
              data-stones={hole.stones}
              disabled={!canClick}
              onClick={() => onSelectHole(hole.id)}
              aria-label={t.pitAriaLabel(sideLabel, displayNum, hole.stones)}
              style={{ left: 0, top: 0, opacity: 0 }}
              className={`pointer-events-auto absolute inline-flex items-center gap-1 px-2 py-1 min-w-[36px] min-h-[28px] rounded-md text-xs font-mono-nums font-bold border shadow-md transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 ${
                isCapture
                  ? 'bg-[#D4A035] text-[#1A1008] border-[#FFF2C6]'
                  : isHint
                    ? 'accent-bg border-[#FFF4E0]'
                    : canClick
                      ? 'bg-[#1D120B]/92 text-[#FFF4E0] border-[#D4A035]/50 hover:border-[#D4A035] cursor-pointer'
                      : 'bg-[#150D08]/88 text-[#B59D80] border-[#4A3220]/70 cursor-default'
              }`}
            >
              <span>{hole.stones}</span>
              {isCapture && (
                <span className="animate-capture-burst ml-0.5 text-[10px] font-bold">
                  +4
                </span>
              )}
            </button>
          );
        })}

        {/* Projected Store Readouts */}
        <div
          ref={oppStoreBadgeRef}
          data-testid="opponent-store"
          style={{ left: 0, top: 0, opacity: 0 }}
          className="absolute px-2.5 py-1 rounded-lg bg-[#1A100A]/92 border border-[#6E492D]/70 text-center shadow-lg"
        >
          <div className="text-[10px] text-[#C5AF91] leading-tight">
            {opponentTitle} · {t.storeLabel}
          </div>
          <div className="text-base font-display font-bold tabular-nums text-[#FFF4E0] leading-tight">
            {opponentStore}
          </div>
        </div>

        <div
          ref={plyStoreBadgeRef}
          data-testid="player-store"
          style={{ left: 0, top: 0, opacity: 0 }}
          className="absolute px-2.5 py-1 rounded-lg bg-[#1A100A]/92 accent-border border text-center shadow-lg"
        >
          <div className="text-[10px] text-[#C5AF91] leading-tight">
            {playerTitle} · {t.storeLabel}
          </div>
          <div className="text-base font-display font-bold tabular-nums accent-text leading-tight">
            {playerStore}
          </div>
        </div>
      </div>
    </div>
  );
};
