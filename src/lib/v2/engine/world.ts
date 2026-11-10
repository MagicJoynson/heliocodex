import * as THREE from 'three/webgpu';
import { positionAU, centuriesSinceJ2000 } from '../../orbit';
import { createSky, GLINT } from './sky';
import { createTerrain } from './terrain';
import { createFlight } from './flight';
import { AU, add, eclToWorld, len, norm, scale, sub, cross, type V3 } from './vec';

/**
 * Phase 1 engine core: one true-scale solar system with a single walkable test world in Mars's
 * place. The renderer prefers WebGPU and falls back to WebGL 2; depth is reversed-z where the
 * device supports it, logarithmic where not. The camera always sits at the origin and the world
 * is placed around it from double-precision positions in metres.
 */

export interface Readout {
  alt: number; // metres above the ground
  speed: number; // m/s
  mode: 'idle' | 'cruise' | 'free';
  arriving: number; // 0..1 through the cruise
  target: string;
  dist: number; // to the target's surface, metres
  tech: string; // renderer, depth mode, tiles
}

export interface Quality { tier: 0 | 1 | 2 | 3; scale: number; split: number; maxTiles: number; antialias: boolean; target: number }

export function pickQuality(): Quality {
  const coarse = matchMedia('(pointer: coarse)').matches;
  const small = Math.min(screen.width, screen.height) < 900;
  const mem = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 8;
  if (coarse && small) return { tier: mem <= 3 ? 0 : 1, scale: mem <= 3 ? 0.55 : 0.7, split: mem <= 3 ? 1.4 : 1.6, maxTiles: mem <= 3 ? 200 : 280, antialias: false, target: 33 };
  if (coarse || mem <= 4) return { tier: 2, scale: 0.85, split: 1.8, maxTiles: 360, antialias: false, target: 17 };
  return { tier: 3, scale: 1, split: 2.0, maxTiles: 460, antialias: true, target: 17 };
}

export async function createWorld(o: { canvas: HTMLCanvasElement; onReadout?: (r: Readout) => void; onArrive?: () => void; forceWebGL?: boolean; quality?: Quality }) {
  const quality = o.quality ?? pickQuality();
  const renderer = new THREE.WebGPURenderer({ canvas: o.canvas, antialias: quality.antialias, forceWebGL: o.forceWebGL, reversedDepthBuffer: true });
  await renderer.init();
  // three.js quietly drops reversed-z on WebGL without EXT_clip_control; use log depth then
  if (!renderer.reversedDepthBuffer) (renderer as unknown as { logarithmicDepthBuffer: boolean }).logarithmicDepthBuffer = true;
  renderer.autoClear = false;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.NoToneMapping;
  const backend = (renderer.backend as { isWebGPUBackend?: boolean }).isWebGPUBackend ? 'WebGPU' : 'WebGL 2';
  const depthMode = renderer.reversedDepthBuffer ? 'reversed-z' : 'log depth';

  // ---- where everything is, now (heliocentric, metres, engine frame)
  const T = centuriesSinceJ2000(new Date());
  const helio = (slug: string): V3 => scale(eclToWorld(positionAU(slug, T)), AU);
  const sunPos: V3 = [0, 0, 0];
  const PLANETS = ['mercury', 'venus', 'earth', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune'];
  const RADII: Record<string, number> = { mercury: 2_439_700, venus: 6_051_800, earth: 6_371_000, mars: 3_389_500, jupiter: 69_911_000, saturn: 58_232_000, uranus: 25_362_000, neptune: 24_622_000 };
  const planetPos = Object.fromEntries(PLANETS.map((p) => [p, helio(p)])) as Record<string, V3>;

  // ---- the test world sits where Mars is
  const bodySlug = 'mars';
  const bodyPos = planetPos[bodySlug];
  const terrain = createTerrain({ spec: { kind: 'test', radius: RADII.mars, seed: 7 }, split: quality.split, maxTiles: quality.maxTiles });

  // ---- scenes: the space layer first, then the local scene with depth
  const sky = createSky();
  for (const p of PLANETS) if (p !== bodySlug) sky.glint(p, GLINT[p]);
  sky.glint(bodySlug, GLINT[bodySlug]);

  const local = new THREE.Scene();
  local.add(terrain.group);
  const sunLight = new THREE.DirectionalLight(0xfff3e6, 2.6);
  local.add(sunLight, sunLight.target);
  local.add(new THREE.AmbientLight(0x8890a0, 0.015));

  const camera = new THREE.PerspectiveCamera(55, 1, 1, 1e12);

  const flight = createFlight(o.canvas);

  // ---- the way in: from beyond Neptune, about 46 au from the Sun, to a high orbit over the test world
  const north: V3 = [0, 1, 0];
  const toSun = norm(sub(sunPos, bodyPos));
  const side = norm(cross(toSun, north));
  const startDir = norm(add(add(scale(norm(bodyPos), 0.75), scale(north, 0.55)), scale(side, 0.25)));
  const start = scale(startDir, 46 * AU);
  const endDir = norm(add(add(scale(toSun, 0.7), scale(side, 0.6)), scale(north, 0.3)));

  flight.place(start, sub(bodyPos, start));
  const params = new URLSearchParams(location.search);
  if (params.has('low')) {
    // testing: start low over the ground, already flying yourself
    // late afternoon: the Sun low, so the ground shows its shape
    const d = norm(add(scale(toSun, 0.28), side));
    const h = Number(params.get('low')) || 2000;
    const p = add(bodyPos, scale(d, terrain.radius + terrain.groundAt(d) + h));
    flight.place(p, norm(add(scale(toSun, 1), scale(d, -0.3))), d);
    flight.setFree();
  }

  // ---- size and resolution, with a governor that trades sharpness for a steady frame rate
  const maxRatio = Math.min(devicePixelRatio, 2);
  let ratio = maxRatio * quality.scale;
  function resize() {
    const w = o.canvas.clientWidth, h = o.canvas.clientHeight;
    renderer.setPixelRatio(ratio);
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.fov = THREE.MathUtils.clamp(55 / Math.min(1, camera.aspect * 1.3), 55, 78);
    camera.updateProjectionMatrix();
  }
  resize();
  addEventListener('resize', resize);
  let frameAvg = quality.target;
  let sinceAdjust = 0;

  const clock = new THREE.Clock();
  let arrived = false;
  let stats = { tiles: 0, live: 0, queued: 0, deepest: 0, built: 0, inflight: 0 };

  function frame() {
    const wall = Math.min(clock.getDelta(), 1);
    const dt = Math.min(wall, 0.1);
    frameAvg += (wall * 1000 - frameAvg) * 0.05;
    if ((sinceAdjust += dt) > 1.5) {
      sinceAdjust = 0;
      const prev = ratio;
      if (frameAvg > quality.target * 1.2) ratio = Math.max(maxRatio * 0.45, ratio * 0.9);
      else if (frameAvg < quality.target * 0.75) ratio = Math.min(maxRatio * quality.scale, ratio * 1.06);
      if (ratio !== prev) resize();
    }

    const f = flight.step(dt, wall, { centre: bodyPos, radius: terrain.radius, ground: (d) => terrain.groundAt(d) });
    if (f.mode === 'free' && !arrived) { arrived = true; o.onArrive?.(); }
    const cam = flight.pos;
    camera.quaternion.copy(flight.q);
    camera.position.set(0, 0, 0);

    // near plane follows height; reversed-z keeps precision whatever the far plane
    const bodyRel = sub(bodyPos, cam);
    const dBody = len(bodyRel);
    camera.near = THREE.MathUtils.clamp(f.alt * 0.02, 0.05, 2e5);
    camera.far = dBody + terrain.radius * 1.5;
    camera.updateProjectionMatrix();
    camera.updateMatrixWorld();

    // the space layer
    const sunRel = sub(sunPos, cam);
    sky.update(camera, sunRel, PLANETS.map((p) => ({ slug: p, rel: sub(planetPos[p], cam), radius: RADII[p] })));

    // light: from the Sun's direction (only the direction matters)
    const sd = norm(sunRel);
    sunLight.position.set(sd[0], sd[1], sd[2]);
    sunLight.target.position.set(0, 0, 0);

    stats = terrain.update(bodyRel, camera);

    renderer.clear();
    renderer.render(sky.scene, sky.camera);
    renderer.clearDepth();
    renderer.render(local, camera);

    o.onReadout?.({
      alt: f.alt, speed: f.speed, mode: f.mode, arriving: f.arriving, target: 'the test world',
      dist: dBody - terrain.radius,
      tech: `${backend} · ${depthMode} · ${stats.tiles} tiles (${stats.live} kept, ${stats.queued} coming, ${stats.built} built, ${stats.inflight} out) · level ${stats.deepest} · ${Math.round(1000 / frameAvg)} fps · ${ratio.toFixed(2)}x`,
    });
  }
  renderer.setAnimationLoop(frame);

  return {
    enter(secs = 16) {
      flight.startCruise({ from: start, target: () => bodyPos, endDist: terrain.radius * 2.6, endDir, secs, aimOffset: 0 });
    },
    skip() { flight.skipCruise(); },
    setPad: flight.setPad,
    backend, depthMode,
    /** where the Sun is on screen, for the threshold ring to close onto */
    sunScreen(): [number, number] {
      const d = norm(sub(sunPos, flight.pos));
      const v = new THREE.Vector3(d[0], d[1], d[2]).applyQuaternion(flight.q.clone().invert());
      v.applyMatrix4(camera.projectionMatrix);
      return [(v.x + 1) / 2 * o.canvas.clientWidth, (1 - v.y) / 2 * o.canvas.clientHeight];
    },
  };
}
