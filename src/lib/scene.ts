import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { positionAU, orbitPath, centuriesSinceJ2000 } from './orbit';
import facts from '../data/facts.json';
import { createStars } from './journey/stars';
import { createStar, type Spot } from './journey/star';
import { createRingTexture, createRingMesh } from './journey/rings';

const AU_KM = 149597870.7;
const C_KMS = 299792.458;

export interface SceneBody {
  slug: string;
  name: string;
  color: string;
  tiltDeg: number;
  retrograde?: boolean;
}

const TEXTURES: Record<string, string> = {
  sun: '2k_sun.jpg',
  mercury: '2k_mercury.jpg',
  venus: '2k_venus_atmosphere.jpg',
  earth: '2k_earth_daymap.jpg',
  mars: '2k_mars.jpg',
  jupiter: '2k_jupiter.jpg',
  saturn: '2k_saturn.jpg',
  uranus: '2k_uranus.jpg',
  neptune: '2k_neptune.jpg',
};

const loader = new THREE.TextureLoader();
function tex(file: string, srgb = true) {
  const t = loader.load(`/textures/${file}`);
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}

function radiusKm(slug: string): number {
  if (slug === 'sun') return 695700;
  return (facts.planets as any)[slug].physical.radius_mean_km as number;
}

/** One planet or the Sun as a lit sphere, with Saturn's rings and Earth's clouds. */
export function makeBodyMesh(slug: string, radius: number, tiltDeg: number, noRing = false): THREE.Group {
  const group = new THREE.Group();
  const geo = new THREE.SphereGeometry(radius, 64, 48);
  let mat: THREE.Material;
  if (slug === 'sun') {
    mat = new THREE.MeshBasicMaterial({ map: tex(TEXTURES.sun), color: 0xffd9a0 });
  } else {
    mat = new THREE.MeshStandardMaterial({ map: tex(TEXTURES[slug]), roughness: 1, metalness: 0 });
  }
  const mesh = new THREE.Mesh(geo, mat);
  mesh.name = 'surface';
  // Sphere poles point along +Y; tilt by obliquity about the X axis.
  const tilt = new THREE.Group();
  tilt.rotation.z = THREE.MathUtils.degToRad(tiltDeg > 90 ? tiltDeg - 180 : tiltDeg);
  tilt.add(mesh);
  if (slug === 'earth') {
    const clouds = new THREE.Mesh(
      new THREE.SphereGeometry(radius * 1.012, 64, 48),
      new THREE.MeshStandardMaterial({ map: tex('2k_earth_clouds.jpg'), transparent: true, opacity: 0.55, depthWrite: false }),
    );
    clouds.name = 'clouds';
    tilt.add(clouds);
  }
  if (slug === 'saturn' && !noRing) {
    const inner = radius * 1.24;
    const outer = radius * 2.27;
    const rg = new THREE.RingGeometry(inner, outer, 128, 1);
    const pos = rg.attributes.position;
    const uv = rg.attributes.uv;
    const v = new THREE.Vector3();
    for (let i = 0; i < pos.count; i++) {
      v.fromBufferAttribute(pos, i);
      uv.setXY(i, (v.length() - inner) / (outer - inner), 0.5);
    }
    const ringTex = tex('2k_saturn_ring_alpha.png');
    const ring = new THREE.Mesh(
      rg,
      new THREE.MeshBasicMaterial({ map: ringTex, side: THREE.DoubleSide, transparent: true, depthWrite: false, color: 0xe8dcc0 }),
    );
    ring.rotation.x = -Math.PI / 2;
    ring.name = 'rings';
    tilt.add(ring);
  }
  group.add(tilt);
  group.userData.surface = mesh;
  return group;
}

// ---------------------------------------------------------------------------
// Single-body viewer used on planet pages
// ---------------------------------------------------------------------------
export function createBodyViewer(canvas: HTMLCanvasElement, body: SceneBody) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
  const R = 1;
  const group = makeBodyMesh(body.slug, R, body.tiltDeg);
  scene.add(group);
  const sunLight = new THREE.DirectionalLight(0xfff2e0, body.slug === 'sun' ? 0 : 3.2);
  sunLight.position.set(-4, 1.5, 3);
  scene.add(sunLight, new THREE.AmbientLight(0x223044, 0.35));
  camera.position.set(0, 0.25, 4);
  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true;
  controls.enablePan = false;
  controls.minDistance = 1.7;
  controls.maxDistance = 16;
  let auto = true;
  controls.addEventListener('start', () => (auto = false));
  const dir = body.retrograde ? -1 : 1;

  function resize() {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    const base = body.slug === 'saturn' ? 7.2 : 3.8;
    camera.position.setLength(base / Math.min(1, camera.aspect * 1.05));
    camera.updateProjectionMatrix();
  }
  new ResizeObserver(resize).observe(canvas);
  resize();

  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const surface = group.userData.surface as THREE.Mesh;
  let last = performance.now();
  function frame(now: number) {
    const dt = Math.min((now - last) / 1000, 0.1);
    last = now;
    if (auto && !reduce) group.rotation.y += dt * 0.15 * dir;
    surface.rotation.y += 0; // surface rotates with the group
    const clouds = group.getObjectByName('clouds');
    if (clouds && !reduce) clouds.rotation.y += dt * 0.012;
    controls.update();
    renderer.render(scene, camera);
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

// ---------------------------------------------------------------------------
// Full solar system
// ---------------------------------------------------------------------------
export interface SolarSystemOptions {
  container: HTMLElement;
  canvas: HTMLCanvasElement;
  bodies: SceneBody[];
  onSelect?: (slug: string | null) => void;
  onTick?: (info: { date: Date; selected: string | null; distAU: number | null }) => void;
}

export function createSolarSystem(opts: SolarSystemOptions) {
  const { canvas, container } = opts;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x020203);
  const stars = createStars(6000);
  scene.add(stars.group);
  const camera = new THREE.PerspectiveCamera(42, 1, 0.01, 12000);
  camera.position.set(0, 55, 85);

  // ---- scale modes -------------------------------------------------------
  let trueDistance = false;
  // Compressed: r_scene = 12 * sqrt(au). True: 1 au = 12 scene units * ... see below
  const distScale = (au: number) => (trueDistance ? au * 6 : 12 * Math.sqrt(au));
  // Body sizes are exaggerated so planets stay visible: roughly log of radius.
  const sizeFor = (slug: string) => {
    const r = radiusKm(slug);
    if (slug === 'sun') return 3.2;
    return 0.28 + 0.55 * Math.log10(r / 2400);
  };

  // nearly all the light comes from the Sun, so the night sides stay dark
  scene.add(new THREE.AmbientLight(0x1a1d24, 0.35));
  const sunLight = new THREE.PointLight(0xfff2e2, 7, 0, 0.3);
  scene.add(sunLight);
  // the Sun itself: the same glowing photosphere as on its own page, with a few spots
  const SPOTS: Spot[] = [[12, 10, 9000, 20000], [-16, 60, 7000, 16000], [20, -50, 5000, 12000], [-9, 150, 8000, 18000]];
  const sunStar = createStar(SPOTS);
  const ringTex = createRingTexture();
  const ringSun = new THREE.Vector3(1, 0, 0);
  let saturnRing: THREE.Mesh | null = null;

  const LABEL_ORDER = ['sun', 'jupiter', 'saturn', 'neptune', 'uranus', 'earth', 'venus', 'mars', 'mercury'];
  type Entry = { body: SceneBody; group: THREE.Group; orbit?: THREE.Line; label: HTMLElement; radius: number };
  const entries = new Map<string, Entry>();

  function addLabel(text: string) {
    const el = document.createElement('button');
    el.className = 'scene-label';
    el.textContent = text;
    el.type = 'button';
    container.appendChild(el);
    return el;
  }

  for (const b of opts.bodies) {
    const radius = sizeFor(b.slug);
    let group: THREE.Group;
    if (b.slug === 'sun') {
      group = new THREE.Group();
      sunStar.group.scale.setScalar(radius);
      group.add(sunStar.group);
    } else {
      group = makeBodyMesh(b.slug, radius, b.tiltDeg, true);
      if (b.slug === 'saturn') {
        saturnRing = createRingMesh(ringTex, ringSun);
        saturnRing.scale.setScalar(radius);
        saturnRing.raycast = () => {};
        (group.children[0] as THREE.Group).add(saturnRing);
      }
    }
    group.userData.slug = b.slug;
    scene.add(group);
    const label = addLabel(b.name);
    label.addEventListener('click', () => select(b.slug));
    let orbit: THREE.Line | undefined;
    if (b.slug !== 'sun') {
      orbit = new THREE.Line(new THREE.BufferGeometry(), new THREE.LineBasicMaterial({ color: 0xb9b2a4, transparent: true, opacity: 0.2, depthWrite: false }));
      scene.add(orbit);
    }
    entries.set(b.slug, { body: b, group, orbit, label, radius });
  }

  // ecliptic -> scene: ecliptic z is up; three.js y is up.
  function toScene(p: [number, number, number]): THREE.Vector3 {
    const r = Math.hypot(p[0], p[1], p[2]);
    const s = r > 0 ? distScale(r) / r : 0;
    return new THREE.Vector3(p[0] * s, p[2] * s, -p[1] * s);
  }

  // ---- time --------------------------------------------------------------
  let simTime = Date.now();
  let daysPerSecond = 10;
  let playing = true;
  let T = centuriesSinceJ2000(simTime);

  function rebuildOrbits() {
    for (const e of entries.values()) {
      if (!e.orbit) continue;
      const pts = orbitPath(e.body.slug, T, 256).map((p) => toScene(p));
      e.orbit.geometry.setFromPoints(pts);
    }
  }
  rebuildOrbits();

  // ---- selection & camera ------------------------------------------------
  let selected: string | null = null;
  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true;
  controls.enablePan = false;
  // the page scrolls past the model, so the wheel must not be caught here; zoom is by pinch or the text controls
  controls.enableZoom = false;
  controls.minDistance = 0.8;
  controls.maxDistance = 1200;
  controls.rotateSpeed = 0.6;
  const followOffset = new THREE.Vector3();
  let flying = 0; // seconds remaining on a fly-to
  let flyDur = 1.2;
  let flyFrom = new THREE.Vector3();

  function select(slug: string | null) {
    selected = slug;
    for (const [s, e] of entries) {
      e.label.classList.toggle('is-selected', s === slug);
      if (e.orbit) (e.orbit.material as THREE.LineBasicMaterial).opacity = s === slug ? 0.6 : 0.2;
    }
    if (slug) {
      const e = entries.get(slug)!;
      const target = e.group.position.clone();
      const dist = Math.max(e.radius * (slug === 'saturn' ? 9 : 5), 1.6);
      followOffset.copy(camera.position).sub(controls.target);
      followOffset.setLength(dist);
      flyFrom.copy(camera.position);
      flying = flyDur = 1.2;
      controls.minDistance = e.radius * 1.6;
      controls.target.copy(target);
    } else {
      controls.minDistance = 0.8;
      followOffset.set(0, 55, 85);
      flyFrom.copy(camera.position);
      controls.target.set(0, 0, 0);
      flying = flyDur = 1.4;
    }
    opts.onSelect?.(slug);
  }

  // ---- picking -----------------------------------------------------------
  const ray = new THREE.Raycaster();
  const ndc = new THREE.Vector2();
  let downAt = { x: 0, y: 0 };
  canvas.addEventListener('pointerdown', (ev) => (downAt = { x: ev.clientX, y: ev.clientY }));
  canvas.addEventListener('pointerup', (ev) => {
    if (Math.hypot(ev.clientX - downAt.x, ev.clientY - downAt.y) > 4) return;
    const r = canvas.getBoundingClientRect();
    ndc.set(((ev.clientX - r.left) / r.width) * 2 - 1, -((ev.clientY - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(ndc, camera);
    const hits = ray.intersectObjects([...entries.values()].map((e) => e.group), true);
    for (const h of hits) {
      let o: THREE.Object3D | null = h.object;
      while (o && !o.userData.slug) o = o.parent;
      if (o) return select(o.userData.slug);
    }
  });

  // ---- layout ------------------------------------------------------------
  function resize() {
    const w = container.clientWidth, h = container.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  new ResizeObserver(resize).observe(container);
  resize();

  // ---- loop --------------------------------------------------------------
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const v3 = new THREE.Vector3();
  let last = performance.now();
  let tickAccum = 0;
  function frame(now: number) {
    const dt = Math.min((now - last) / 1000, 0.1);
    last = now;
    if (playing) {
      simTime += dt * daysPerSecond * 86400000;
      T = centuriesSinceJ2000(simTime);
    }
    for (const [slug, e] of entries) {
      if (slug === 'sun') {
        e.group.position.set(0, 0, 0);
      } else {
        e.group.position.copy(toScene(positionAU(slug, T)));
      }
      // spin: planet period from fact sheet; shown faster than real so motion is visible
      const rot = slug === 'sun' ? 609.12 : (facts.planets as any)[slug].physical.rotation_hours;
      const dir = e.body.retrograde ? -1 : 1;
      if (!reduce) e.group.rotation.y += dt * dir * Math.min(2.5, (24 / Math.abs(rot)) * 0.35);
      const c = e.group.getObjectByName('clouds');
      if (c && !reduce) c.rotation.y += dt * 0.02;
    }
    // follow selected body
    if (selected) {
      const e = entries.get(selected)!;
      const delta = v3.copy(e.group.position).sub(controls.target);
      controls.target.add(delta);
      camera.position.add(delta);
    }
    if (flying > 0) {
      flying -= dt;
      const k = 1 - Math.max(flying, 0) / flyDur;
      const ease = k * k * (3 - 2 * k);
      const dest = controls.target.clone().add(followOffset);
      camera.position.lerpVectors(flyFrom, dest, ease);
    }
    controls.update();
    stars.group.position.copy(camera.position);
    sunStar.update(camera, 10, now / 1000);
    if (saturnRing) {
      // the Sun's direction in the ring's own frame, for its lighting and Saturn's shadow on it
      const sat = entries.get('saturn')!.group;
      ringSun.copy(sat.position).negate().normalize();
      const q = new THREE.Quaternion();
      saturnRing.getWorldQuaternion(q);
      ringSun.applyQuaternion(q.invert());
    }
    renderer.render(scene, camera);

    // labels
    // each name sits just right of its body; where two would collide, the bigger body keeps its name
    const w = container.clientWidth, h = container.clientHeight;
    const focal = (h / 2) / Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    const placed: [number, number, number, number][] = [];
    {
      // keep names off the Sun's disc
      const sun = entries.get('sun')!;
      v3.copy(sun.group.position).project(camera);
      const r = (sun.radius / Math.max(camera.position.distanceTo(sun.group.position), 1e-3)) * focal;
      const sx = ((v3.x + 1) / 2) * w, sy = ((1 - v3.y) / 2) * h;
      placed.push([sx - r, sy - r, sx + r, sy + r]);
    }
    for (const slug of LABEL_ORDER) {
      const e = entries.get(slug);
      if (!e) continue;
      v3.copy(e.group.position).project(camera);
      const dist = camera.position.distanceTo(e.group.position);
      const pr = (e.radius / Math.max(dist, 1e-3)) * focal;
      const cx = ((v3.x + 1) / 2) * w, y = ((1 - v3.y) / 2) * h;
      const lw = e.body.name.length * 7.6 + 16, lh = 22;
      const others = placed.slice(slug === 'sun' ? 1 : 0);
      const hits = (bx: [number, number, number, number]) => others.some((b) => bx[0] < b[2] && bx[2] > b[0] && bx[1] < b[3] && bx[3] > b[1]);
      // right of the body if there is room, otherwise left
      let x = cx + pr + 7;
      let box: [number, number, number, number] = [x, y - lh / 2, x + lw, y + lh / 2];
      if (hits(box)) { x = cx - pr - 7 - lw; box = [x, y - lh / 2, x + lw, y + lh / 2]; }
      const clash = hits(box);
      const visible = v3.z < 1 && v3.z > -1 && e.body.slug !== selected && !clash && pr < h * 0.25;
      if (visible) placed.push(box);
      e.label.style.display = visible ? '' : 'none';
      e.label.style.transform = `translate(${x}px, ${y}px) translate(0, -50%)`;
    }
    tickAccum += dt;
    if (tickAccum > 0.1) {
      tickAccum = 0;
      let distAU: number | null = null;
      if (selected && selected !== 'sun') {
        const p = positionAU(selected, T);
        distAU = Math.hypot(p[0], p[1], p[2]);
      }
      opts.onTick?.({ date: new Date(simTime), selected, distAU });
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  return {
    select,
    setSpeed(d: number) { daysPerSecond = d; },
    setPlaying(p: boolean) { playing = p; },
    isPlaying: () => playing,
    now() { simTime = Date.now(); T = centuriesSinceJ2000(simTime); rebuildOrbits(); },
    setTrueDistance(v: boolean) {
      trueDistance = v;
      rebuildOrbits();
      if (!selected) { camera.position.set(0, v ? 120 : 55, v ? 200 : 85); }
      controls.maxDistance = v ? 2500 : 1200;
    },
    dive() {
      if (!selected) return;
      const e = entries.get(selected)!;
      controls.minDistance = 0.01;
      followOffset.setLength(e.radius * 1.35);
      flyFrom.copy(camera.position);
      flying = flyDur = 1.1;
    },
    zoom(f: number) {
      const off = camera.position.clone().sub(controls.target);
      const len = THREE.MathUtils.clamp(off.length() * f, controls.minDistance, controls.maxDistance);
      followOffset.copy(off.setLength(len));
      flyFrom.copy(camera.position);
      flying = flyDur = 0.6;
    },
    stepDays(d: number) { simTime += d * 86400000; T = centuriesSinceJ2000(simTime); rebuildOrbits(); },
  };
}

export function lightTime(au: number) {
  const s = (au * AU_KM) / C_KMS;
  const m = Math.floor(s / 60);
  const sec = Math.round(s - m * 60);
  return m ? `${m} min ${sec} s` : `${sec} s`;
}
