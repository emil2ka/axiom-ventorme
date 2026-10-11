import * as THREE from 'three';
import type { CategoryId, SceneState } from '../../lib/types';
import { CATEGORY_ORDER } from '../../data/categories';

const SILVER = new THREE.Color(0xc4cdd9);
const LIME = new THREE.Color(0xcffb74);

const CATEGORY_TINT: Record<CategoryId, THREE.Color> = {
  technology: new THREE.Color(0xa9c0ff),
  creativity: new THREE.Color(0xc7a9ff),
  research: new THREE.Color(0x8fe3c4),
  people: new THREE.Color(0xf0c27d),
  organization: new THREE.Color(0xf0a9b8),
};

const SPREAD_POINTS: Array<Array<[number, number, number]>> = [
  [
    [-2.9, -1.3, 0.5],
    [-1.3, -0.78, 0.35],
    [0.1, -0.06, 0.15],
    [1.5, 0.45, 0.4],
    [2.9, 1.15, 0.65],
  ],
  [
    [-2.7, -0.55, 0.55],
    [-1.2, -0.32, 0.4],
    [0.05, 0.0, 0.2],
    [1.45, 0.2, 0.5],
    [2.85, 0.55, 0.8],
  ],
  [
    [-2.85, 0.1, -0.4],
    [-1.25, 0.1, -0.25],
    [0.0, 0.05, -0.1],
    [1.4, 0.15, -0.35],
    [2.85, 0.3, -0.6],
  ],
  [
    [-2.7, 0.75, -0.55],
    [-1.2, 0.6, -0.35],
    [0.0, 0.12, -0.15],
    [1.45, -0.05, -0.4],
    [2.8, -0.4, -0.65],
  ],
  [
    [-2.8, 1.4, -0.45],
    [-1.25, 1.0, -0.3],
    [0.05, 0.18, -0.1],
    [1.55, -0.25, -0.3],
    [2.85, -1.05, -0.5],
  ],
];

const UNIFIED_POINTS: Array<Array<[number, number, number]>> = SPREAD_POINTS.map(
  (_, index) => {
    const k = index - 2;
    return [
      [-2.6, k * 0.42, k * 0.18],
      [-1.15, k * 0.24, k * 0.1],
      [0.1 + k * 0.04, 0.08 + k * 0.09, k * 0.05],
      [1.5, 0.4 + k * 0.07, 0.15 + k * 0.05],
      [2.75, 0.62 + k * 0.05, 0.3 + k * 0.04],
    ];
  },
);

const FRONT_Z = [0, 0, 0, 0, 0];

const toCurve = (points: Array<[number, number, number]>): THREE.CatmullRomCurve3 =>
  new THREE.CatmullRomCurve3(
    points.map(([x, y, z]) => new THREE.Vector3(x, y, z)),
    false,
    'catmullrom',
    0.42,
  );

function makeEnvironmentTexture(): THREE.Texture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  const gradient = ctx.createLinearGradient(0, 0, 0, 512);
  gradient.addColorStop(0, '#2b3444');
  gradient.addColorStop(0.48, '#111726');
  gradient.addColorStop(1, '#04060b');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 1024, 512);
  const blob = (x: number, y: number, r: number, color: string, alpha: number) => {
    const radial = ctx.createRadialGradient(x, y, 0, x, y, r);
    radial.addColorStop(0, color);
    radial.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.globalAlpha = alpha;
    ctx.fillStyle = radial;
    ctx.fillRect(x - r, y - r, r * 2, r * 2);
    ctx.globalAlpha = 1;
  };
  blob(770, 170, 250, '#cffb74', 0.5);
  blob(300, 150, 310, '#8aa4ff', 0.5);
  blob(540, 350, 270, '#a798ff', 0.32);
  blob(150, 430, 230, '#f0c27d', 0.18);
  const texture = new THREE.CanvasTexture(canvas);
  texture.mapping = THREE.EquirectangularReflectionMapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

type RibbonRig = {
  category: CategoryId;
  mesh: THREE.Mesh;
  edge: THREE.Mesh;
  ribbonMat: THREE.MeshPhysicalMaterial;
  edgeMat: THREE.MeshBasicMaterial;
  emphasis: number;
  target: number;
  trellisBase: THREE.Color;
  base: THREE.Color;
};

export type AtlasHandle = {
  setState: (state: SceneState) => void;
  setPointer: (x: number, y: number) => void;
  setScroll: (progress: number) => void;
  resize: () => void;
  isStatic: () => boolean;
  dispose: () => void;
};

type BuildStrip = {
  position: Float32Array;
  unified: Float32Array;
  uv: Float32Array;
  index: Uint32Array;
  edgePosition: Float32Array;
  edgeUnified: Float32Array;
  edgeIndex: Uint32Array;
};

function buildStrip(
  spreadCurve: THREE.CatmullRomCurve3,
  unifiedCurve: THREE.CatmullRomCurve3,
  width: number,
  twist: number,
  phase: number,
  segments: number,
): BuildStrip {
  const position: number[] = [];
  const unified: number[] = [];
  const uv: number[] = [];
  const index: number[] = [];
  const edgePosition: number[] = [];
  const edgeUnified: number[] = [];
  const edgeIndex: number[] = [];

  const up = new THREE.Vector3(0, 1, 0);
  const point = new THREE.Vector3();
  const tangent = new THREE.Vector3();
  const side = new THREE.Vector3();
  const quat = new THREE.Quaternion();
  const left = new THREE.Vector3();
  const right = new THREE.Vector3();
  const edgeOuter = new THREE.Vector3();
  const edgeInner = new THREE.Vector3();

  for (let i = 0; i <= segments; i += 1) {
    const t = i / segments;
    const taper = Math.pow(Math.sin(Math.PI * Math.min(1, Math.max(0.0001, t))), 0.4);
    const w = width * (0.6 + 0.55 * taper);
    const edgeW = Math.min(0.05, w * 0.22);

    for (const [curve, arr] of [
      [spreadCurve, position],
      [unifiedCurve, unified],
    ] as const) {
      curve.getPoint(t, point);
      curve.getTangent(t, tangent).normalize();
      side.copy(tangent).cross(up);
      if (side.lengthSq() < 1e-5) side.set(1, 0, 0);
      side.normalize();
      const angle = twist * Math.sin(t * Math.PI * 1.35 + phase);
      quat.setFromAxisAngle(tangent, angle);
      side.applyQuaternion(quat).normalize();
      left.copy(point).addScaledVector(side, w / 2);
      right.copy(point).addScaledVector(side, -w / 2);
      arr.push(left.x, left.y, left.z, right.x, right.y, right.z);
    }

    for (const [curve, arr] of [
      [spreadCurve, edgePosition],
      [unifiedCurve, edgeUnified],
    ] as const) {
      curve.getPoint(t, point);
      curve.getTangent(t, tangent).normalize();
      side.copy(tangent).cross(up);
      if (side.lengthSq() < 1e-5) side.set(1, 0, 0);
      side.normalize();
      const angle = twist * Math.sin(t * Math.PI * 1.35 + phase);
      quat.setFromAxisAngle(tangent, angle);
      side.applyQuaternion(quat).normalize();
      edgeOuter.copy(point).addScaledVector(side, w / 2);
      edgeInner.copy(point).addScaledVector(side, w / 2 - edgeW);
      arr.push(edgeOuter.x, edgeOuter.y, edgeOuter.z, edgeInner.x, edgeInner.y, edgeInner.z);
    }

    uv.push(0, t * 5, 1, t * 5);
  }

  for (let i = 0; i < segments; i += 1) {
    const a = i * 2;
    index.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
    edgeIndex.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
  }

  return {
    position: new Float32Array(position),
    unified: new Float32Array(unified),
    uv: new Float32Array(uv),
    index: new Uint32Array(index),
    edgePosition: new Float32Array(edgePosition),
    edgeUnified: new Float32Array(edgeUnified),
    edgeIndex: new Uint32Array(edgeIndex),
  };
}

export function createAtlasScene(canvas: HTMLCanvasElement): AtlasHandle | null {
  let renderer: THREE.WebGLRenderer;
  try {
    renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
  } catch {
    return null;
  }

  const isMobile = Math.min(window.innerWidth, window.innerHeight) < 768;
  renderer.setClearColor(0x000000, 0);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.08;
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 60);
  camera.position.set(0, isMobile ? 0.7 : 0.85, isMobile ? 6.2 : 7.0);
  camera.lookAt(0.05, 0.05, 0);

  const envTexture = makeEnvironmentTexture();
  const pmrem = new THREE.PMREMGenerator(renderer);
  const envRT = pmrem.fromEquirectangular(envTexture);
  scene.environment = envRT.texture;
  envTexture.dispose();

  const key = new THREE.DirectionalLight(0xfff4e2, 2.2);
  key.position.set(4.5, 6.5, 3.5);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0x9fb6ff, 1.35);
  rim.position.set(-5.5, 3.0, -4.0);
  scene.add(rim);
  const fill = new THREE.AmbientLight(0x39415a, 0.5);
  scene.add(fill);

  const group = new THREE.Group();
  scene.add(group);

  const rigs: RibbonRig[] = [];
  const segments = isMobile ? 96 : 150;

  CATEGORY_ORDER.forEach((category, index) => {
    const spreadCurve = toCurve(SPREAD_POINTS[index]);
    const unifiedCurve = toCurve(UNIFIED_POINTS[index]);
    const strip = buildStrip(
      spreadCurve,
      unifiedCurve,
      isMobile ? 0.4 : 0.32,
      0.22,
      index * 1.7,
      segments,
    );

    const base = SILVER.clone().lerp(CATEGORY_TINT[category], 0.15);
    const trellisBase = base.clone();

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(strip.position, 3));
    geometry.setAttribute('uv', new THREE.BufferAttribute(strip.uv, 2));
    geometry.setIndex(new THREE.BufferAttribute(strip.index, 1));
    geometry.morphAttributes.position = [new THREE.BufferAttribute(strip.unified, 3)];
    geometry.computeVertexNormals();

    const ribbonMat = new THREE.MeshPhysicalMaterial({
      color: base.clone(),
      metalness: 0.45,
      roughness: 0.3,
      clearcoat: 0.35,
      clearcoatRoughness: 0.4,
      envMapIntensity: 1.5,
      side: THREE.DoubleSide,
      emissive: CATEGORY_TINT[category].clone().multiplyScalar(0.2),
      emissiveIntensity: 0.22,
    });

    const mesh = new THREE.Mesh(geometry, ribbonMat);
    mesh.morphTargetInfluences = [0];
    mesh.morphTargetDictionary = { unified: 0 };
    mesh.position.z = FRONT_Z[index];

    const edgeGeometry = new THREE.BufferGeometry();
    edgeGeometry.setAttribute('position', new THREE.BufferAttribute(strip.edgePosition, 3));
    edgeGeometry.setIndex(new THREE.BufferAttribute(strip.edgeIndex, 1));
    edgeGeometry.morphAttributes.position = [new THREE.BufferAttribute(strip.edgeUnified, 3)];

    const edgeMat = new THREE.MeshBasicMaterial({
      color: CATEGORY_TINT[category],
      transparent: true,
      opacity: 0.22,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
    const edge = new THREE.Mesh(edgeGeometry, edgeMat);
    edge.morphTargetInfluences = [0];
    edge.morphTargetDictionary = { unified: 0 };
    edge.position.z = FRONT_Z[index];

    group.add(mesh, edge);
    rigs.push({
      category,
      mesh,
      edge,
      ribbonMat,
      edgeMat,
      emphasis: 0,
      target: 0,
      trellisBase,
      base,
    });
  });

  const nodeGeometry = new THREE.SphereGeometry(0.055, 24, 18);
  const nodes: THREE.Mesh[] = [];
  const nodeBaseY: number[] = [];
  const middleCurve = toCurve(UNIFIED_POINTS[2]);
  [0.42, 0.66, 0.9].forEach((t) => {
    const position = middleCurve.getPoint(t);
    const nodeMat = new THREE.MeshStandardMaterial({
      color: LIME.clone(),
      emissive: LIME.clone(),
      emissiveIntensity: 1.0,
      metalness: 0.2,
      roughness: 0.4,
    });
    const node = new THREE.Mesh(nodeGeometry, nodeMat);
    node.position.copy(position);
    node.scale.setScalar(0.001);
    group.add(node);
    nodeBaseY.push(position.y);
    nodes.push(node);
  });

  const openGlow = new THREE.Sprite(
    new THREE.SpriteMaterial({
      color: LIME.clone(),
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    }),
  );
  openGlow.position.copy(middleCurve.getPoint(0.97));
  openGlow.scale.setScalar(0.6);
  group.add(openGlow);

  let targetMorph = 0;
  let morph = 0;
  let targetScroll = 0;
  let scroll = 0;
  let pointerX = 0;
  let pointerY = 0;
  let targetPointerX = 0;
  let targetPointerY = 0;
  let phase: SceneState['phase'] = 'initial';
  let resultMode: SceneState['resultMode'] = null;
  let motion: SceneState['motion'] = 'full';
  let hidden = false;
  let offscreen = false;
  let raf = 0;
  let time = 0;
  let last = 0;

  const setStaticPose = () => {
    morph = targetMorph;
    scroll = targetScroll;
    pointerX = 0;
    pointerY = 0;
    applyFrame(1);
    renderer.render(scene, camera);
  };

  const applyFrame = (dt: number) => {
    const ease = dt >= 1 ? 1 : Math.min(1, dt * 7);
    morph += (targetMorph - morph) * ease;
    scroll += (targetScroll - scroll) * ease;
    pointerX += (targetPointerX - pointerX) * ease;
    pointerY += (targetPointerY - pointerY) * ease;

    const route = Math.min(1, morph + scroll * 0.45);
    group.rotation.y = -0.08 + Math.sin(time * 0.06) * 0.04 + pointerX * 0.07;
    group.rotation.x = 0.04 + pointerY * 0.05;

    camera.position.z = (isMobile ? 6.2 : 7.0) - route * 0.9;
    camera.position.y = (isMobile ? 0.7 : 0.85) - route * 0.3;
    camera.position.x = pointerX * 0.12;
    camera.lookAt(0.05, 0.05, 0);

    for (const rig of rigs) {
      rig.emphasis += (rig.target - rig.emphasis) * ease;
      const color = rig.trellisBase
        .clone()
        .lerp(CATEGORY_TINT[rig.category], 0.12 + rig.emphasis * 0.5);
      rig.ribbonMat.color.copy(color);
      rig.ribbonMat.emissiveIntensity = 0.2 + rig.emphasis * 0.3 + route * 0.05;
      rig.edgeMat.opacity = 0.24 + rig.emphasis * 0.66 + route * 0.12;
      const influence = morph + scroll * 0.35;
      if (rig.mesh.morphTargetInfluences) rig.mesh.morphTargetInfluences[0] = influence;
      if (rig.edge.morphTargetInfluences) rig.edge.morphTargetInfluences[0] = influence;
    }

    const nodesVisible = resultMode === 'personal' || phase === 'result';
    nodes.forEach((node, index) => {
      const target = nodesVisible ? 1 : 0.001;
      node.scale.x += (target - node.scale.x) * ease;
      node.scale.y = node.scale.x;
      node.scale.z = node.scale.x;
      node.position.y = nodeBaseY[index] + Math.sin(time * 1.2 + index * 1.7) * 0.012;
    });
    const glowTarget = nodesVisible ? 0.42 : route > 0.5 ? 0.25 : 0.06;
    const glowMat = openGlow.material as THREE.SpriteMaterial;
    glowMat.opacity += (glowTarget - glowMat.opacity) * ease;
    openGlow.scale.setScalar(0.45 + route * 0.35 + Math.sin(time * 0.8) * 0.02);
  };

  const renderLoop = (now: number) => {
    raf = 0;
    if (last === 0) last = now;
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    time += dt;
    applyFrame(dt);
    renderer.render(scene, camera);
    if (isRunning()) raf = requestAnimationFrame(renderLoop);
  };

  const isRunning = () => !hidden && !offscreen && motion !== 'reduced';

  const ensureLoop = () => {
    if (isRunning() && !raf) {
      last = 0;
      raf = requestAnimationFrame(renderLoop);
    }
  };

  const stopLoop = () => {
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
  };

  const resize = () => {
    const parent = canvas.parentElement;
    if (!parent) return;
    const width = Math.max(1, parent.clientWidth);
    const height = Math.max(1, parent.clientHeight);
    const dpr = Math.min(window.devicePixelRatio || 1, isMobile ? 1.6 : 2);
    renderer.setPixelRatio(dpr);
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    if (!isRunning()) setStaticPose();
  };

  const handle: AtlasHandle = {
    setState(next) {
      phase = next.phase;
      resultMode = next.resultMode;
      motion = next.motion;
      targetMorph =
        next.phase === 'result' || next.phase === 'demo'
          ? 0.78
          : next.phase === 'questions'
            ? 0.3
            : 0;
      const active = new Set(next.activeCategories);
      for (const rig of rigs) {
        const isPreview = next.previewCategory === rig.category;
        rig.target = active.has(rig.category) ? 1 : isPreview ? 0.62 : 0;
      }
      if (next.motion === 'reduced') {
        stopLoop();
        setStaticPose();
      } else {
        ensureLoop();
      }
    },
    setPointer(x, y) {
      targetPointerX = Math.max(-1, Math.min(1, x));
      targetPointerY = Math.max(-1, Math.min(1, y));
      ensureLoop();
    },
    setScroll(progress) {
      targetScroll = Math.max(0, Math.min(1, progress));
      if (motion !== 'reduced') ensureLoop();
    },
    resize,
    isStatic: () => motion === 'reduced',
    dispose() {
      stopLoop();
      io.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('resize', onWindowResize);
      scene.traverse((object) => {
        const mesh = object as THREE.Mesh;
        if (mesh.geometry) mesh.geometry.dispose();
        const material = mesh.material as THREE.Material | THREE.Material[] | undefined;
        if (Array.isArray(material)) material.forEach((item) => item.dispose());
        else material?.dispose();
      });
      envRT.texture.dispose();
      pmrem.dispose();
      renderer.dispose();
    },
  };

  const io = new IntersectionObserver(
    (entries) => {
      offscreen = !entries[0]?.isIntersecting;
      if (offscreen) stopLoop();
      else if (motion !== 'reduced') ensureLoop();
      else setStaticPose();
    },
    { rootMargin: '120px' },
  );
  io.observe(canvas);

  const onVisibility = () => {
    hidden = document.hidden;
    if (hidden) stopLoop();
    else if (motion !== 'reduced') ensureLoop();
  };
  document.addEventListener('visibilitychange', onVisibility);

  const onWindowResize = () => resize();
  window.addEventListener('resize', onWindowResize, { passive: true });

  resize();
  setStaticPose();
  ensureLoop();
  return handle;
}
