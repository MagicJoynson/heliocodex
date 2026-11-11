import * as THREE from 'three/webgpu';
import { uniform, positionLocal, texture, vec2, vec3, vec4, float, dot, length, smoothstep, select } from 'three/tsl';
import { createSky, GLINT, FAR as SKY_FAR } from './sky';
import { createDeep, PC, GAL_CENTRE, GAL_X, GAL_Z, SUPERGAL_POLE, pcFromLy } from './deep';
import { createTerrain } from './terrain';
import { loadDemSpec } from './dem';
import type { SourceSpec } from './tilebuild';
import { createFlight, type Focus } from './flight';
import { createSystem } from './system';
import { POLES } from '../atlas/kepler';
import { positionAU, centuriesSinceJ2000 } from '../../orbit';
import { AU, add, len, norm, scale, sub, cross, smooth, slerp, dot as vdot, type V3 } from './vec';
import type { Context, Engine, Layer, View } from './index';

/**
 * Phase 1 engine core: one true-scale solar system with a single walkable test world in Mars's
 * place. The renderer prefers WebGPU and falls back to WebGL 2; depth is reversed-z where the
 * device supports it, logarithmic where not. The camera always sits at the origin and the world
 * is placed around it from double-precision positions in metres.
 */

export interface Readout {
  alt: number; // metres above the ground
  speed: number; // m/s
  mode: 'idle' | 'orbit' | 'cruise' | 'free';
  arriving: number; // 0..1 through the cruise
  target: string;
  dist: number; // to the target's surface, metres
  tech: string; // renderer, depth mode, tiles
  /** what on screen is generated rather than measured, when anything is */
  note?: string;
  /** out beyond the planets, where the distance that matters is from the Sun */
  far?: boolean;
}

export interface Quality { tier: 0 | 1 | 2 | 3; scale: number; split: number; maxTiles: number; antialias: boolean; target: number; maxPx: number }

export function pickQuality(): Quality {
  const coarse = matchMedia('(pointer: coarse)').matches;
  const small = Math.min(screen.width, screen.height) < 900;
  const mem = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 8;
  // Safari has no deviceMemory, so iPhones all land on tier 1, which is the safe choice
  // split stays at 2 or more on every tier: below about 1.42 the morph cannot finish before a
  // tile splits, and the ground visibly snaps. Phones save their effort elsewhere.
  if (coarse && small) return { tier: mem <= 3 ? 0 : 1, scale: mem <= 3 ? 0.55 : 0.7, split: 2.0, maxTiles: mem <= 3 ? 320 : 420, antialias: false, target: 33, maxPx: 1.6e6 };
  if (coarse || mem <= 4) return { tier: 2, scale: 0.85, split: 2.2, maxTiles: 520, antialias: false, target: 17, maxPx: 2.5e6 };
  return { tier: 3, scale: 1, split: 2.5, maxTiles: 680, antialias: devicePixelRatio <= 1.25, target: 17, maxPx: 5e6 };
}

export async function createWorld(o: { canvas: HTMLCanvasElement; onReadout?: (r: Readout) => void; onArrive?: () => void; onLost?: () => void; onJump?: () => void; onFocus?: (id: string, name: string) => void; forceWebGL?: boolean; quality?: Quality }) {
  const quality = o.quality ?? pickQuality();
  // Reversed-z only gains precision with a float depth buffer, which three.js gives us on WebGPU.
  // On WebGL 2 the canvas depth is 24-bit integer, so there a logarithmic buffer is the better choice.
  const renderer = new THREE.WebGPURenderer({ canvas: o.canvas, antialias: quality.antialias, forceWebGL: o.forceWebGL, reversedDepthBuffer: true });
  await renderer.init();
  if (!(renderer.backend as { isWebGPUBackend?: boolean }).isWebGPUBackend) {
    // WebGL 2: switch reversed-z back off before anything is drawn and use log depth instead
    const r = renderer as unknown as { reversedDepthBuffer: boolean; logarithmicDepthBuffer: boolean; backend: { state?: { setReversedDepth?(v: boolean): void } } };
    r.reversedDepthBuffer = false;
    r.backend.state?.setReversedDepth?.(false);
    r.logarithmicDepthBuffer = true;
  }
  // phones drop the GPU when a page sits in the background; say so rather than freeze
  (renderer as unknown as { onDeviceLost: (i: unknown) => void }).onDeviceLost = (info) => { console.warn('GPU lost', info); o.onLost?.(); };
  o.canvas.addEventListener('webglcontextlost', () => o.onLost?.());
  renderer.autoClear = false;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.NoToneMapping;
  const backend = (renderer.backend as { isWebGPUBackend?: boolean }).isWebGPUBackend ? 'WebGPU' : 'WebGL 2';
  const depthMode = renderer.reversedDepthBuffer ? 'reversed-z' : 'log depth';

  // ---- where everything is, on the engine's clock (heliocentric, metres, engine frame).
  // The body list holds every moon, so it is loaded after the first paint, not with the page.
  const { allBodies } = await import('../../../data/bodies/index');
  const system = createSystem(allBodies);
  const sunPos: V3 = [0, 0, 0];
  const PLANETS = ['mercury', 'venus', 'earth', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune'];
  const RADII: Record<string, number> = { mercury: 2_439_700, venus: 6_051_800, earth: 6_371_000, mars: 3_389_500, jupiter: 69_911_000, saturn: 58_232_000, uranus: 25_362_000, neptune: 24_622_000 };
  // live positions, updated in place every frame so references stay valid
  const planetPos = Object.fromEntries(PLANETS.map((p) => [p, [...system.pos(p)!] as V3])) as Record<string, V3>;
  const radiusOf = (id: string) => RADII[id] ?? (system.body(id)?.meanRadiusKm ?? 0) * 1000;

  // ---- the test world sits where Mars is
  const bodySlug = 'mars';
  const bodyPos = planetPos[bodySlug];
  // testing real ground: ?dem=<tile base url>&body=moon|mars puts that body's measured heights in Mars's place
  const params = new URLSearchParams(location.search);
  // only our own tiles: a path on this site, or the tile host. Anything else in the address is ignored.
  const demBase = params.get('dem') ?? '';
  const demOk = /^\/(?!\/)[\w\-./]*$/.test(demBase) || /^https:\/\/tiles\.heliocodex\.com(\/[\w\-./]*)?$/.test(demBase);
  const demBody = /^[a-z0-9-]{1,40}$/.test(params.get('body') ?? '') ? params.get('body')! : 'moon';
  const spec: SourceSpec = demOk
    ? await loadDemSpec(demBase, demBody)
    : { kind: 'test', radius: RADII.mars, seed: 7 };
  // Mars wears its real colours (Viking and MGS mosaics); its shape here is still generated. The frame is filled in below.
  const bodyFrame = new THREE.Matrix3();
  let bodyMap: THREE.Texture | undefined;
  if (!demOk) {
    bodyMap = new THREE.TextureLoader().load('/textures/4k_mars.webp');
    bodyMap.colorSpace = THREE.SRGBColorSpace;
    bodyMap.anisotropy = 8;
  }
  const terrain = createTerrain({ spec, split: quality.split, maxTiles: quality.maxTiles, map: bodyMap, toBody: bodyFrame });
  await terrain.ready;

  // ---- scenes: the space layer first, then the local scene with depth
  const sky = createSky({ catalogue: false });
  // beyond the Solar System: stars at their real distances, our galaxy, its neighbours, the cosmic web
  const deep = createDeep({ scene: sky.scene, far: SKY_FAR, particles: [40_000, 70_000, 110_000, 150_000][quality.tier], labelsAfter: o.canvas, pxRatio: Math.min(devicePixelRatio, 2) });
  for (const p of PLANETS) if (p !== bodySlug) sky.glint(p, GLINT[p]);
  sky.glint(bodySlug, GLINT[bodySlug]);

  const local = new THREE.Scene();
  local.add(terrain.group);
  const sunLight = new THREE.DirectionalLight(0xfff3e6, 2.6);
  local.add(sunLight, sunLight.target);
  local.add(new THREE.AmbientLight(0x8890a0, 0.015));

  // ---- the other planets, as plain lit globes until each gets its own ground
  const TEX: Record<string, string> = { mercury: '2k_mercury.jpg', venus: '2k_venus_atmosphere.jpg', earth: '2k_earth_daymap.jpg', mars: '2k_mars.jpg', jupiter: '2k_jupiter.jpg', saturn: '2k_saturn.jpg', uranus: '2k_uranus.jpg', neptune: '2k_neptune.jpg' };
  const globeGeo = new THREE.SphereGeometry(1, 96, 48);
  const loader = new THREE.TextureLoader();
  const globes = new Map<string, THREE.Group>();
  /** the spin pole (IAU) in the engine frame, so each globe and its rings lean the right way */
  const poleOf = (id: string) => {
    const P = POLES[id];
    if (!P) return new THREE.Vector3(0, 1, 0);
    const ra = THREE.MathUtils.degToRad(P.raDeg), dec = THREE.MathUtils.degToRad(P.decDeg), e = THREE.MathUtils.degToRad(23.4392911);
    const x = Math.cos(dec) * Math.cos(ra), y = Math.cos(dec) * Math.sin(ra), z = Math.sin(dec);
    const ye = y * Math.cos(e) + z * Math.sin(e), ze = -y * Math.sin(e) + z * Math.cos(e); // to the ecliptic
    return new THREE.Vector3(x, ze, -ye).normalize(); // to the engine frame
  };
  /** where the equator crosses the Earth's equator (the IAU node), in the engine frame: longitudes are counted from here */
  const nodeOf = (id: string) => {
    const P = POLES[id];
    if (!P) return new THREE.Vector3(1, 0, 0);
    const ra = THREE.MathUtils.degToRad(P.raDeg), e = THREE.MathUtils.degToRad(23.4392911);
    const x = -Math.sin(ra), y = Math.cos(ra), z = 0;
    const ye = y * Math.cos(e) + z * Math.sin(e), ze = -y * Math.sin(e) + z * Math.cos(e);
    return new THREE.Vector3(x, ze, -ye).normalize();
  };
  // equatorial and polar radii (NASA planetary fact sheets) and, for Haumea, its three axes (Ortiz et al. 2017), in km
  const SHAPE: Record<string, [number, number, number]> = {
    mercury: [2440.5, 2438.3, 2440.5], venus: [6051.8, 6051.8, 6051.8], earth: [6378.137, 6356.752, 6378.137], mars: [3396.2, 3376.2, 3396.2],
    jupiter: [71_492, 66_854, 71_492], saturn: [60_268, 54_364, 60_268], uranus: [25_559, 24_973, 25_559], neptune: [24_764, 24_341, 24_764],
    haumea: [1161, 513, 852],
  };
  // the prime meridian, W = W0 + rate × days from J2000 (IAU WGCCRE 2015, Archinal et al. 2018): how far round each globe has turned
  const SPIN: Record<string, [number, number]> = {
    mercury: [329.5988, 6.1385108], venus: [160.2, -1.4813688], earth: [190.147, 360.9856235], mars: [176.049863, 350.891982443297],
    jupiter: [284.95, 870.536], saturn: [38.9, 810.7939024], uranus: [203.81, -501.1600928], neptune: [249.978, 541.1397757], pluto: [302.695, 56.3625225],
  };
  const spinning: { id: string; mesh: THREE.Mesh }[] = [];
  function makeGlobe(id: string, radius: number, map?: THREE.Texture) {
    const holder = new THREE.Group();
    // y along the spin pole and x towards the node, so turning about y by W puts longitude 0 where the IAU says
    const Y = poleOf(id), X0 = nodeOf(id);
    const X = X0.sub(Y.clone().multiplyScalar(X0.dot(Y))).normalize();
    holder.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(X, Y, new THREE.Vector3().crossVectors(X, Y)));
    const g = new THREE.Mesh(globeGeo, new THREE.MeshStandardNodeMaterial(map ? { map, roughness: 1, metalness: 0 } : { color: 0x8a8580, roughness: 1, metalness: 0 }));
    const sh = SHAPE[id];
    if (sh) g.scale.set(sh[0] * 1000, sh[1] * 1000, sh[2] * 1000);
    else g.scale.setScalar(radius);
    if (SPIN[id]) spinning.push({ id, mesh: g });
    g.frustumCulled = false;
    holder.add(g);
    holder.visible = false;
    local.add(holder);
    globes.set(id, holder);
    return holder;
  }
  // the walkable Mars does not turn: it keeps the face it had when the page opened
  {
    const Y = poleOf(bodySlug), X0 = nodeOf(bodySlug);
    const X = X0.sub(Y.clone().multiplyScalar(X0.dot(Y))).normalize();
    const H = new THREE.Matrix4().makeBasis(X, Y, new THREE.Vector3().crossVectors(X, Y));
    const [w0, rate] = SPIN[bodySlug];
    const W = THREE.MathUtils.degToRad((w0 + rate * (system.jd() - 2451545)) % 360);
    bodyFrame.setFromMatrix4(new THREE.Matrix4().makeRotationY(-W).multiply(H.transpose()));
  }
  for (const p of PLANETS) {
    const map = loader.load(`/textures/${TEX[p]}`);
    map.colorSpace = THREE.SRGBColorSpace;
    map.anisotropy = 4;
    makeGlobe(p, RADII[p], map);
  }
  let saturnShadows: { holder: THREE.Group; ball: THREE.Mesh; sunH: { value: THREE.Vector3 }; sunL: { value: THREE.Vector3 } } | null = null;
  // Saturn's rings, from the inner C ring to the F ring, mapped by distance from the centre
  {
    const IN = 74_500_000, OUT = 140_220_000;
    const geo = new THREE.RingGeometry(IN, OUT, 256, 1);
    const uvs = geo.attributes.uv as THREE.BufferAttribute, ps = geo.attributes.position as THREE.BufferAttribute;
    for (let k = 0; k < ps.count; k++) uvs.setXY(k, (Math.hypot(ps.getX(k), ps.getY(k)) - IN) / (OUT - IN), 0.5);
    const tex = loader.load('/textures/4k_saturn_ring.webp');
    tex.colorSpace = THREE.SRGBColorSpace;
    const ringMat = new THREE.MeshStandardNodeMaterial({ map: tex, transparent: true, side: THREE.DoubleSide, roughness: 1, metalness: 0, depthWrite: false });
    const ring = new THREE.Mesh(geo, ringMat);
    ring.rotation.x = -Math.PI / 2; // into the equator plane
    ring.frustumCulled = false;
    const holder = globes.get('saturn');
    const ball = holder?.children[0] as THREE.Mesh | undefined;
    if (holder && ball) {
      holder.add(ring);
      // ---- the shadows: the planet's on the rings, and the rings' on the planet
      const [A, C] = [SHAPE.saturn[0] * 1000, SHAPE.saturn[1] * 1000];
      // the way to the Sun, in the holder's frame (y the pole) and in the globe's own unit-sphere frame
      const sunH = uniform(new THREE.Vector3(0, 1, 0)) as any;
      const sunL = uniform(new THREE.Vector3(0, 1, 0)) as any;
      saturnShadows = { holder, ball, sunH, sunL };
      // a point of the rings, in the holder's frame, squashed so the planet becomes a sphere of radius A
      const pl = positionLocal as any;
      const P = vec3(pl.x, float(0), pl.y.negate()).mul(vec3(1, A / C, 1));
      const sq = (sunH as any).mul(vec3(1, A / C, 1)).normalize();
      const along = dot(P, sq);
      const miss = length(P.sub(sq.mul(along)));
      // lit unless the ray to the Sun passes through the planet, with a soft edge for the penumbra
      const litR = select(along.lessThan(0), smoothstep(A * 0.985, A * 1.015, miss), float(1));
      ringMat.colorNode = (texture(tex) as any).mul(vec4(vec3(litR.mul(0.94).add(0.06)), 1));
      // a point of the globe (unit sphere, before its scale), followed towards the Sun to the ring plane
      const gp = positionLocal as any;
      const t = gp.y.negate().div(select((sunL as any).y.abs().lessThan(1e-6), float(1e-6), (sunL as any).y));
      const hit = gp.add((sunL as any).mul(t));
      const rr = length(vec2(hit.x, hit.z)).mul(A);
      const u = rr.sub(IN).div(OUT - IN);
      const inRing = t.greaterThan(0).and(u.greaterThan(0)).and(u.lessThan(1));
      const opacity = (texture(tex, vec2(u.clamp(0, 1), 0.5)) as any).a;
      const litG = select(inRing, float(1).sub(opacity.mul(0.85)), float(1));
      const gm = ball.material as THREE.MeshStandardNodeMaterial;
      if (gm.map) gm.colorNode = (texture(gm.map) as any).mul(vec4(vec3(litG), 1));
    }
  }

  // ---- layers other parts of the site add (moons, orbits, labels); drawn with depth, round the camera
  const layers = new Set<Layer>();
  const layerRoot = new THREE.Group();
  local.add(layerRoot);

  const camera = new THREE.PerspectiveCamera(55, 1, 1, 1e13);

  const flight = createFlight(o.canvas);
  let reduced = false;
  const fwdOf = (): V3 => { const v = new THREE.Vector3(0, 0, -1).applyQuaternion(flight.q); return [v.x, v.y, v.z]; };
  // a click or tap on a body (or its name) goes there
  flight.onTap((x, y) => {
    if (flight.mode === 'cruise') return;
    const rect = o.canvas.getBoundingClientRect();
    const pxPerRad = o.canvas.clientHeight / (2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)));
    const inv = flight.q.clone().invert();
    let best = '', bestScore = Infinity;
    const ids = ['sun', ...PLANETS, ...allBodies.filter((b) => b.kind === 'moon' && b.meanRadiusKm && system.pos(b.id)).map((b) => b.id)];
    for (const id of ids) {
      if (id === focusKey && flight.mode !== 'free') continue;
      const r = sub(posOf(id), flight.pos);
      const d = len(r);
      const v = new THREE.Vector3(r[0], r[1], r[2]).applyQuaternion(inv);
      if (v.z >= 0) continue;
      const sx = rect.left + ((v.x / -v.z) * pxPerRad) + rect.width / 2, sy = rect.top - ((v.y / -v.z) * pxPerRad) + rect.height / 2;
      const rpx = (radOf(id) * sizeBoost(id, d) / d) * pxPerRad;
      // a moon is only worth picking once it is more than a speck beside its planet
      const isMoon = !PLANETS.includes(id) && id !== 'sun';
      if (isMoon && rpx < 2) continue;
      const off = Math.hypot(sx - x, sy - y);
      // names sit just to the right of their planet, so the hit area stretches that way for planets
      const reach = Math.max(isMoon ? 16 : 26, rpx + 8) + (!isMoon && sx < x && sx > x - 90 && Math.abs(sy - y) < 16 ? 90 : 0);
      if (off > reach) continue;
      const score = off - rpx + (isMoon ? 12 : 0);
      if (score < bestScore) { bestScore = score; best = id; }
    }
    if (best) engine.flyTo({ target: best }).catch(() => {});
  });

  // ---- the way in: the whole Solar System from 30 au, looking down at it from about 30° above the
  // planets' plane. Entering slides and zooms straight in to Mars from the same side: nothing turns.
  const north: V3 = [0, 1, 0];
  const toSun = norm(sub(sunPos, bodyPos));
  const side = norm(cross(toSun, north));
  const enterDir = norm(add(add(scale(toSun, 0.7), scale(side, 0.55)), scale(north, 0.62)));
  const focusOf = (id: string): Focus => id === bodySlug
    ? { centre: () => bodyPos, radius: terrain.radius, ground: (d) => terrain.groundAt(d) }
    : { centre: () => posOf(id), radius: radOf(id) };
  const sunFocus: Focus = { centre: () => sunPos, radius: 695_700_000 };
  flight.orbitAt(sunFocus, 30 * AU, enterDir, true);
  let entered = false;
  let focusName = 'the Sun', focusKey = 'sun';
  if (params.has('low')) {
    // testing: start low over the ground, already flying yourself
    // late afternoon: the Sun low, so the ground shows its shape
    const d = norm(add(scale(toSun, 0.28), side));
    const h = Number(params.get('low')) || 2000;
    flight.orbitAt(focusOf(bodySlug), terrain.radius + terrain.groundAt(d) + h, d);
    focusKey = bodySlug; focusName = 'Mars';
    entered = true;
  }

  // ---- size and resolution, with a governor that trades sharpness for a steady frame rate
  // ---- the planets' orbits, for the wide views: drawn without depth, faded in from about 3 au out
  const PERIOD_YEARS: Record<string, number> = { mercury: 0.2408, venus: 0.6152, earth: 1, mars: 1.8809, jupiter: 11.862, saturn: 29.457, uranus: 84.011, neptune: 164.79 };
  const orbitMat = new THREE.LineBasicNodeMaterial({ color: 0xece7dc, transparent: true, opacity: 0, depthTest: false, depthWrite: false });
  const orbits = new THREE.Group();
  {
    const T0 = centuriesSinceJ2000(Date.now());
    for (const p of PLANETS) {
      const n = 512, pts: number[] = [];
      for (let i = 0; i <= n; i++) {
        const q = positionAU(p, T0 + (PERIOD_YEARS[p] * i) / n / 100);
        pts.push(q[0] * AU, q[2] * AU, -q[1] * AU); // ecliptic to the engine frame
      }
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
      const line = new THREE.Line(g, orbitMat);
      line.frustumCulled = false;
      line.renderOrder = -1;
      orbits.add(line);
    }
    orbits.visible = false;
    local.add(orbits);
  }
  const PLANET_NAMES: Record<string, string> = { mercury: 'Mercury', venus: 'Venus', earth: 'Earth', mars: 'Mars', jupiter: 'Jupiter', saturn: 'Saturn', uranus: 'Uranus', neptune: 'Neptune' };

  const maxRatio = Math.min(devicePixelRatio, 2);
  let ratio = maxRatio * quality.scale;
  function resize() {
    const w = o.canvas.clientWidth, h = o.canvas.clientHeight;
    // never more pixels than the tier can afford, whatever the screen
    ratio = Math.min(ratio, Math.sqrt(quality.maxPx / Math.max(1, w * h)));
    renderer.setPixelRatio(ratio);
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.fov = THREE.MathUtils.clamp(55 / Math.min(1, camera.aspect * 1.3), 55, 78);
    camera.updateProjectionMatrix();
    for (const l of layers) sizeLayer(l);
  }
  resize();
  addEventListener('resize', resize);
  let frameAvg = quality.target;
  let sinceAdjust = 0, goodWindows = 0;
  let readoutAt = 0;

  const timer = new THREE.Timer();
  let arrived = false;
  let stats = { tiles: 0, live: 0, queued: 0, deepest: 0, built: 0, inflight: 0 };

  // ---- what the camera is near, for the margin
  const contextCbs = new Set<(c: Context) => void>();
  /**
   * Out beyond the planets the place that matters is a rung of the scale ladder, not a body: which
   * one, by distance from the Sun. Inside 50 au (or nearer a body than the Sun) it is the body.
   */
  const PLACE_NAMES: Record<string, string> = {
    'solar-system': 'the Solar System', 'oort-cloud': 'the Oort cloud', neighbourhood: 'the Sun’s neighbourhood',
    'night-sky': 'the stars of our night sky', 'milky-way': 'the Milky Way', 'local-group': 'the Local Group',
    'cosmic-web': 'the cosmic web', cmb: 'the edge of what we can see',
  };
  /** what is drawn from a model rather than measured, out where each place is */
  const PLACE_NOTES: Record<string, string> = {
    'solar-system': 'The Kuiper belt is drawn from a model; its bodies are far too small to see from here',
    'oort-cloud': 'The Oort cloud is drawn from a model; nobody has seen it, only comets that come from it',
    'milky-way': 'Our galaxy’s shape is a model built from measurements; we cannot see it from outside',
    'local-group': 'Andromeda, Triangulum and the Magellanic Clouds are models, placed and tilted as measured',
    'cosmic-web': 'Each point is a measured galaxy; distances come from redshift, which stretches clusters towards us',
    cmb: 'You are outside the sphere of all we can see, 46 billion light years in radius. Nothing is really this far away, and the tiny differences in its light are shown far stronger than they are',
  };
  function placeAt(fromSun: number, nearId: string): { id: string; band: Context['band'] } | null {
    const pc = fromSun / PC;
    if (pc < 1) {
      if (nearId !== 'sun' || fromSun < 50 * AU) return null;
      return fromSun < 2000 * AU ? { id: 'solar-system', band: 'system' } : { id: 'oort-cloud', band: 'interstellar' };
    }
    if (pc < 100) return { id: 'neighbourhood', band: 'interstellar' };
    if (pc < 3000) return { id: 'night-sky', band: 'interstellar' };
    if (pc < 3e5) return { id: 'milky-way', band: 'galactic' };
    if (pc < 1e7) return { id: 'local-group', band: 'galactic' };
    if (pc < 5e9) return { id: 'cosmic-web', band: 'cosmic' };
    return { id: 'cmb', band: 'cosmic' };
  }
  let starAim = -1; // the catalogue star last flown to, or -1
  let lastCtx: Context | null = null, ctxAt = 0, ctxClock = 0, forceCtx = false;
  // the bodies that can be "near": the Sun, the planets, every moon with a measured size
  const SPHERES = ['sun', ...PLANETS, ...allBodies.filter((b) => b.kind === 'moon' && b.meanRadiusKm).map((b) => b.id)];
  let focusId = ''; // the last place flown to, if it is not already in that list (a small moon, a dwarf planet)
  const posOf = (id: string): V3 => (id === 'sun' ? sunPos : planetPos[id] ?? system.pos(id) ?? sunPos);
  // bodies nobody has measured are treated as 1 km across, so there is still a floor to stop at
  const radOf = (id: string) => (id === 'sun' ? 695_700_000 : id === bodySlug ? terrain.radius : radiusOf(id) || 1000);
  /**
   * Bigger planets: drawn at least about 2.7° across, however far away, so they can be seen and
   * clicked. Up close (within about 40 of its own radii) each is its true size again, so nothing
   * you land on is ever out of scale.
   */
  let bigger = false;
  const sizeBoost = (id: string, d: number) => (bigger && PLANETS.includes(id) ? Math.max(1, (d * 0.024) / radOf(id)) : 1);
  /**
   * The body that matters most from here: the one that looks biggest. The current one is kept until
   * another looks a quarter bigger, so the choice cannot flicker on the line between two.
   */
  let nearNow = bodySlug;
  let focusHold = 0; // within this distance of the place flown to, it stays the near body whatever its size
  function nearest(cam: V3) {
    if (focusId && len(sub(posOf(focusId), cam)) < focusHold) return (nearNow = focusId);
    const angOf = (id: string) => radOf(id) / Math.max(1, len(sub(posOf(id), cam)));
    let best = nearNow, bestAng = angOf(nearNow) * 1.25;
    for (const id of focusId && !SPHERES.includes(focusId) ? [...SPHERES, focusId] : SPHERES) {
      const a = angOf(id);
      if (a > bestAng) { bestAng = a; best = id; }
    }
    nearNow = best;
    return best;
  }
  // where the near body was at the end of the last frame, for keeping pace with it
  let prevNear = { id: '', p: [0, 0, 0] as V3 };
  /** run someone else's code without letting it stop the engine: log once and drop it */
  function guarded<T>(what: string, fn: () => T, drop: () => void): T | undefined {
    try { return fn(); } catch (e) { console.error(`${what} failed and was removed`, e); drop(); return undefined; }
  }
  const sizeLayer = (l: Layer) => {
    guarded(`layer ${l.name}`, () => l.resize?.(o.canvas.clientHeight, camera.fov), () => layers.delete(l));
  };
  const abort = (msg: string) => Object.assign(new Error(msg), { name: 'AbortError' });
  const rel = (id: string): V3 | null => {
    const pp = id === 'sun' ? sunPos : planetPos[id] ?? system.pos(id);
    return pp ? sub(pp, flight.pos) : null;
  };

  // a flight in progress, so the next one can say the last was replaced
  let pendingFly: { resolve: () => void; reject: (e: Error) => void } | null = null;
  let lastMode = flight.mode;
  let cruising = false;

  function frame() {
    timer.update();
    const wall = Math.min(timer.getDelta(), 1);
    const dt = Math.min(wall, 0.1);
    // the governor ignores one-off stalls (a tab switch, a shader compiling)
    if (wall < 0.1) frameAvg += (wall * 1000 - frameAvg) * 0.05;
    if ((sinceAdjust += dt) > 1.5) {
      sinceAdjust = 0;
      const prev = ratio;
      if (frameAvg > quality.target * 1.25) { ratio = Math.max(maxRatio * 0.45, ratio * 0.9); goodWindows = 0; }
      // on time for three windows in a row (vsync keeps 60 Hz screens at 16.7 ms, so "on time" is
      // close to the target, not well under it): try a little sharper
      else if (frameAvg < quality.target * 1.05 && ++goodWindows >= 3) { ratio = Math.min(maxRatio * quality.scale, ratio * 1.06); goodWindows = 0; }
      if (ratio !== prev) resize();
    }

    // move the clock on, and everything with it. In free flight you keep pace with the body you are
    // near, so a planet doing 24 km a second does not slide out from under you.
    // the near body was chosen at the end of the last frame, when every position agreed with the
    // camera's; choosing it now, after a setTime, would compare the camera with the new positions
    const nearId = nearNow;
    system.advance(wall);
    for (const p of PLANETS) { const q = system.pos(p)!; planetPos[p][0] = q[0]; planetPos[p][1] = q[1]; planetPos[p][2] = q[2]; }
    // measured against where the body was last frame, so a jump of the clock (setTime) is followed too
    const nowNear = posOf(nearId);
    if (flight.mode === 'free' && nearId !== 'sun' && prevNear.id === nearId) {
      flight.pos[0] += nowNear[0] - prevNear.p[0]; flight.pos[1] += nowNear[1] - prevNear.p[1]; flight.pos[2] += nowNear[2] - prevNear.p[2];
    }
    prevNear = { id: nearId, p: [nowNear[0], nowNear[1], nowNear[2]] };

    const onTerrain = nearId === bodySlug;
    const f = flight.step(dt, wall, onTerrain
      ? { centre: bodyPos, radius: terrain.radius, ground: (d) => terrain.groundAt(d) }
      : { centre: posOf(nearId), radius: radOf(nearId), ground: () => 0 });
    // a cruise has ended (even one so short it started and finished within this frame)
    nearest(flight.pos); // for next frame
    if (cruising && f.mode !== 'cruise') { cruising = false; forceCtx = true; o.onFocus?.(focusKey, focusName); if (pendingFly) { pendingFly.resolve(); pendingFly = null; } }
    lastMode = f.mode;
    if (entered && !arrived && f.mode !== 'cruise' && f.mode !== 'idle') { arrived = true; o.onArrive?.(); }
    const cam = flight.pos;
    camera.quaternion.copy(flight.q);
    camera.position.set(0, 0, 0);

    // near plane follows height; reversed-z keeps precision whatever the far plane
    const bodyRel = sub(bodyPos, cam);
    const dBody = len(bodyRel);
    camera.near = THREE.MathUtils.clamp(f.alt * 0.02, 0.05, 2e5);
    // about 67 au, or more from far out so the orbits fit: reversed-z and log depth both keep precision across it
    camera.far = Math.max(1e13, len(cam) * 3);
    camera.updateProjectionMatrix();
    camera.updateMatrixWorld();

    // the space layer
    const sunRel = sub(sunPos, cam);
    sky.update(camera, sunRel, PLANETS.map((p) => ({ slug: p, rel: sub(planetPos[p], cam), radius: RADII[p] })), o.canvas.clientHeight);
    const fromSunPc = len(cam) / PC;
    sky.glowGain.value = 1 - smooth(300, 3000, fromSunPc);
    // the orbits and the planets' names, for the views from well above the Sun
    const fromSunAU = len(cam) / AU;
    const wide = smooth(3, 15, fromSunAU) * (1 - smooth(800, 3000, fromSunAU));
    orbitMat.opacity = 0.22 * wide;
    orbits.visible = wide > 0.005;
    if (orbits.visible) orbits.position.set(-cam[0], -cam[1], -cam[2]);
    // names: in the wide views, and for any planet that is no more than a dot from here, so there is always something to click
    const pxPerRad0 = o.canvas.clientHeight / (2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)));
    const named = (p: string) => {
      const d = len(sub(planetPos[p], cam));
      const px = (radOf(p) * sizeBoost(p, d) / d) * pxPerRad0;
      return p === focusKey && d < radOf(p) * 400 ? 0 : (1 - smooth(14, 40, px)) * (1 - smooth(800, 3000, fromSunAU));
    };
    const extra = PLANETS.map((p) => ({ text: PLANET_NAMES[p], dir: sub(planetPos[p], cam), alpha: Math.max(wide * (p === 'mercury' || p === 'venus' ? smooth(30, 8, fromSunAU) : 1), named(p) * 0.9) })).filter((x) => x.alpha > 0.01);
    deep.update({ cam, quaternion: camera.quaternion, fovDeg: camera.fov, heightPx: o.canvas.clientHeight, widthPx: o.canvas.clientWidth, starGain: sky.starGain.value, extra });

    // light: from the Sun's direction (only the direction matters)
    const sd = norm(sunRel);
    sunLight.position.set(sd[0], sd[1], sd[2]);
    sunLight.target.position.set(0, 0, 0);

    // the other planets: a globe once it is more than a pixel or so across
    const pxPerRad = o.canvas.clientHeight / (2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)));
    // a dwarf planet, asteroid or comet you fly to gets a plain globe of its own (moons are drawn by their layer)
    if (focusId && !globes.has(focusId) && ['dwarf', 'asteroid', 'comet'].includes(system.body(focusId)?.kind ?? '') && radOf(focusId)) makeGlobe(focusId, radOf(focusId));
    let marsBoosted = false;
    for (const [p, g] of globes) {
      const r = sub(posOf(p), cam);
      const d = len(r);
      const k = sizeBoost(p, d);
      g.scale.setScalar(k);
      g.visible = (radOf(p) * k / d) * pxPerRad > 1.5;
      // Mars has walkable ground of its own: its plain globe only stands in while it is drawn bigger than life
      if (p === bodySlug) { marsBoosted = k > 1.02; g.visible &&= marsBoosted; }
      if (g.visible) g.position.set(r[0], r[1], r[2]);
    }
    const jd = system.jd();
    if (saturnShadows?.holder.visible) {
      // the Sun as seen from Saturn, into the holder's frame and then into the globe's unscaled one
      const ps = sub(posOf('sun'), posOf('saturn'));
      const w = new THREE.Vector3(ps[0], ps[1], ps[2]).normalize();
      saturnShadows.sunH.value.copy(w).applyQuaternion(saturnShadows.holder.quaternion.clone().invert());
      const b = saturnShadows.ball;
      const l = saturnShadows.sunH.value.clone().applyEuler(new THREE.Euler(0, -b.rotation.y, 0));
      saturnShadows.sunL.value.set(l.x / b.scale.x, l.y / b.scale.y, l.z / b.scale.z);
    }
    for (const { id, mesh } of spinning) {
      const [w0, rate] = SPIN[id];
      // texture longitude 0 sits on +x of the sphere and east runs towards -z, which is a turn about +y
      mesh.rotation.y = THREE.MathUtils.degToRad((w0 + rate * (jd - 2451545)) % 360);
    }
    for (const l of layers) guarded(`layer ${l.name}`, () => l.update?.(rel, jd), () => { layers.delete(l); guarded('detach', () => l.detach?.(), () => {}); });

    // too far to be more than a point of light: let the glint stand in
    const tiny = terrain.radius / dBody < 0.0004 || sizeBoost(bodySlug, dBody) > 1.02;
    if (!tiny) stats = terrain.update(bodyRel, camera);

    renderer.clear();
    renderer.render(sky.scene, sky.camera);
    renderer.clearDepth();
    terrain.group.visible = !tiny && !marsBoosted;
    renderer.render(local, camera);

    // tell the margin where we are, when that changes (and the distance at most once a second)
    if (contextCbs.size) {
      const id = nearId;
      const d = len(sub(posOf(id), cam));
      const r = radOf(id);
      // height above the ground itself where there is ground, as the readout shows
      const h = Math.max(0, id === nearId ? f.alt : d - r);
      const fromSun = len(cam);
      const far = placeAt(fromSun, id);
      // beside the star last flown to: within 0.05 pc (about 10,000 au) of it
      const sp = starAim >= 0 ? starOf(`star:${starAim}`) : null;
      const besideStar = sp && len(sub(sp, cam)) < 0.05 * PC ? starAim : -1;
      const band: Context['band'] = far ? far.band : h < 100_000 ? 'surface' : h < 30 * r ? 'orbit' : 'system';
      const km = (band === 'surface' || band === 'orbit' ? h : fromSun) / 1000;
      const t = performance.now();
      const clockMoved = Math.abs(system.timeMs - ctxClock) > 86_400_000;
      if (forceCtx || !lastCtx || lastCtx.near !== (far ? far.id : id) || lastCtx.band !== band || (lastCtx.star ?? -1) !== besideStar || (t - ctxAt > 1000 && (clockMoved || Math.abs(km - lastCtx.km) > lastCtx.km * 0.05))) {
        lastCtx = { near: far ? far.id : id, band, km, timeIso: new Date(system.timeMs).toISOString(), ...(besideStar >= 0 ? { star: besideStar } : {}) };
        ctxAt = t; ctxClock = system.timeMs; forceCtx = false;
        for (const cb of contextCbs) guarded('context listener', () => cb(lastCtx!), () => contextCbs.delete(cb));
      }
    }

    const now = performance.now();
    if (now - readoutAt < 120 && f.mode !== 'cruise') return;
    const farNow = placeAt(len(cam), nearId);
    readoutAt = now;
    o.onReadout?.({
      alt: f.alt, speed: f.speed, mode: f.mode, arriving: f.arriving,
      target: farNow ? PLACE_NAMES[farNow.id] : system.body(nearId)?.name ?? nearId,
      dist: f.mode !== 'free' ? Math.max(0, len(sub(flight.target.centre(), cam)) - flight.target.radius) : f.alt,
      far: !!farNow,
      note: (farNow ? PLACE_NOTES[farNow.id] : undefined) ?? (() => { const y = new Date(system.timeMs).getUTCFullYear(); return y < 2000 || y > 2040 ? `Moon positions are approximate in ${y}` : undefined; })() ?? (onTerrain && terrain.source.resolution ? `Detail finer than ${fmtRes(terrain.source.resolution)} is generated, not measured` : onTerrain && !terrain.source.resolution ? 'This ground is generated, not measured' : undefined),
      tech: `${backend} · ${depthMode} · ${stats.tiles} tiles (${stats.live} kept, ${stats.queued} coming, ${stats.built} built, ${stats.inflight} out) · level ${stats.deepest} · ${Math.round(1000 / frameAvg)} fps · ${ratio.toFixed(2)}x`,
    });
  }
  renderer.setAnimationLoop(frame);

  function fmtRes(m: number) { return m >= 1000 ? `${(m / 1000).toLocaleString('en-GB', { maximumFractionDigits: 1 })} km` : `${Math.round(m)} m`; }

  // ---- the scale places: each is a fixed vantage, a centre, a distance and the side to see it from
  const ly = (n: number) => pcFromLy(n) * PC;
  const fromAbove = (deg: number): V3 => {
    // keep the side you are already on, so the view does not swing round on the way out
    const c = flight.pos;
    const az = Math.hypot(c[0], c[2]) > 1 ? norm([c[0], 0, c[2]]) : ([1, 0, 0] as V3);
    const t = (deg * Math.PI) / 180;
    return norm(add(scale(az, Math.cos(t)), [0, Math.sin(t), 0]));
  };
  const galNorth = (): V3 => norm(add(scale(GAL_Z, 0.85), scale(GAL_X, -0.5)));
  const PLACES: Record<string, { centre: () => V3; dist: number; dir: () => V3 }> = {
    'solar-system': { centre: () => sunPos, dist: 60 * AU, dir: () => fromAbove(35) },
    'oort-cloud': { centre: () => sunPos, dist: 100_000 * AU, dir: () => fromAbove(35) },
    neighbourhood: { centre: () => sunPos, dist: ly(30), dir: galNorth },
    'night-sky': { centre: () => sunPos, dist: ly(1500), dir: galNorth },
    'milky-way': { centre: () => scale(GAL_CENTRE, PC), dist: ly(150_000), dir: () => norm(add(scale(GAL_Z, Math.sin(0.7)), scale(GAL_X, -Math.cos(0.7)))) },
    'local-group': {
      centre: () => scale(deep.lgCentre() ?? GAL_CENTRE, PC),
      dist: ly(3.5e6),
      dir: () => { const m = deep.lgCentre(); const line = m ? norm(sub(m, GAL_CENTRE)) : GAL_X; return norm(add(norm(cross(line, GAL_Z)), scale(GAL_Z, 0.6))); },
    },
    'cosmic-web': { centre: () => sunPos, dist: ly(500e6), dir: () => SUPERGAL_POLE },
    // far enough out to see the whole sphere the oldest light comes from, 46 billion light years in radius
    cmb: { centre: () => sunPos, dist: ly(110e9), dir: () => norm(add(SUPERGAL_POLE, [0, 0.4, 0])) },
  };
  // a star of the catalogue, as 'star:<index in stars.bin>': arrive 2,000 au out, on the side facing home,
  // so the star fills the view and the Sun is a faint point behind it
  const starOf = (id: string): V3 | null => {
    const m = /^star:(\d+)$/.exec(id);
    const p = m ? deep.starAt(Number(m[1])) : null;
    return p && len(p) > 0 ? scale(p, PC) : null;
  };
  const canFlyTo = (id: string) => id in PLACES || id === 'sun' || !!planetPos[id] || !!system.pos(id) || !!starOf(id);
  const engine: Engine = {
    canFlyTo,
    flyTo(view: View, opts) {
      const id = typeof view.target === 'string' ? view.target : '';
      if (!canFlyTo(id)) return Promise.reject(new Error(`cannot fly to ${id || 'that place yet'}`));
      // only now, with somewhere to go, does the flight in progress give way
      if (pendingFly) { pendingFly.reject(abort('replaced by another flight')); pendingFly = null; }
      if (view.timeIso) system.setTime(view.timeIso);
      const sp = starOf(id);
      { const m = /^star:(\d+)$/.exec(id); starAim = sp && m ? Number(m[1]) : -1; }
      const P = PLACES[id] ?? (sp ? { centre: () => sp, dist: 2000 * AU, dir: () => norm(add(norm(scale(sp, -1)), [0, 0.15, 0])) } : undefined);
      const secs = reduced ? 0 : opts?.secs ?? -1;
      if (P) {
        focusId = ''; focusHold = 0;
        focusKey = id; focusName = PLACE_NAMES[id] ?? (sp ? 'the star' : id);
        const c = P.centre();
        flight.startCruise({ to: len(c) < 1 ? sunFocus : { centre: () => c, radius: 0 }, endDist: view.distanceKm ? view.distanceKm * 1000 : P.dist, endDir: P.dir(), secs });
      } else {
        const target = (): V3 => posOf(id);
        const measured = id === 'sun' || id === bodySlug || radiusOf(id) > 0;
        const r = radOf(id);
        focusId = PLANETS.includes(id) || id === 'sun' ? '' : id;
        // a body with no measured size: stand off 200 km, since nobody knows how big it is
        const endDist = view.distanceKm ? view.distanceKm * 1000 : measured ? r * (id === 'sun' ? 8 : 3) : 200_000;
        focusHold = endDist * 4;
        focusKey = id; focusName = id === 'sun' ? 'the Sun' : system.body(id)?.name ?? PLANET_NAMES[id] ?? id;
        // arrive from the side you are looking from, unless that side is in shadow: then turn only as far as it takes to see it lit
        const tg = target();
        const toS = norm(sub(sunPos, tg));
        const now = norm(sub(flight.pos, tg));
        let endDir: V3 = now;
        if (id !== 'sun' && len(toS) > 0 && vdot(now, toS) < 0.3) {
          const lit = norm(add(add(scale(toS, 0.7), scale(norm(cross(toS, north)), 0.55)), scale(north, 0.45)));
          let lo = 0, hi = 1;
          for (let i = 0; i < 20; i++) { const m = (lo + hi) / 2; if (vdot(norm(slerp(now, lit, m)), toS) < 0.3) lo = m; else hi = m; }
          endDir = norm(slerp(now, lit, hi));
        }
        flight.startCruise({ to: id === bodySlug ? focusOf(id) : { centre: target, radius: measured ? r : 0 }, endDist, endDir, secs });
      }
      cruising = true;
      if (reduced) o.onJump?.();
      return new Promise<void>((resolve, reject) => { pendingFly = { resolve, reject }; });
    },
    registerLayer(layer: Layer) {
      layers.add(layer);
      const holder = new THREE.Group();
      layerRoot.add(holder);
      layer.attach(holder);
      sizeLayer(layer);
      return () => { layers.delete(layer); layer.detach?.(); holder.removeFromParent(); };
    },
    onContext(cb) { contextCbs.add(cb); if (lastCtx) cb(lastCtx); return () => contextCbs.delete(cb); },
    setTime(iso) { system.setTime(iso); },
    setRate(r) { system.setRate(r); },
  };

  return {
    ...engine,
    enter(secs = 7) {
      if (pendingFly) { pendingFly.reject(abort('replaced by the way in')); pendingFly = null; }
      entered = true;
      focusKey = bodySlug; focusName = 'Mars';
      flight.startCruise({ to: focusOf(bodySlug), endDist: terrain.radius * 3.2, endDir: enterDir, secs: reduced ? 0 : secs });
      cruising = true;
      if (reduced) o.onJump?.();
    },
    /** + (positive) and − on screen */
    zoom(steps: number) { flight.zoom(steps); },
    /** planets drawn bigger than life, so the whole system can be seen and clicked */
    setBigger(v: boolean) { bigger = v; },
    /** reduced motion: every trip is a jump hidden by a quick fade, and nothing drifts */
    setReduced(v: boolean) { reduced = v; flight.setReduced(v); },
    /** fly yourself (true) or go back to circling what is nearest (false) */
    setFree(v: boolean) {
      if (v) flight.setFree();
      else if (flight.mode === 'free') { const id = nearNow; focusKey = id; focusName = id === 'sun' ? 'the Sun' : system.body(id)?.name ?? id; flight.backToOrbit(focusOf(id)); o.onFocus?.(focusKey, focusName); }
    },
    get mode() { return flight.mode; },
    get focus() { return { id: focusKey, name: focusName }; },
    /** for the minimap: the planets and you, seen from above the Sun, in metres in the engine frame */
    mapState() {
      const f = fwdOf();
      return { cam: [...flight.pos] as V3, heading: [f[0], f[2]] as [number, number], planets: PLANETS.map((p) => ({ id: p, name: PLANET_NAMES[p], at: [...planetPos[p]] as V3 })), focus: focusKey, place: placeAt(len(flight.pos), nearNow)?.id ?? null };
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
