import * as THREE from 'three';
import { createStars } from '../journey/stars';
import { createStar } from '../journey/star';
import { createPlanet, type Planet } from '../journey/planet';
import { positionAU, centuriesSinceJ2000 } from '../orbit';

/**
 * Prototype of the v2 "enter" moment.
 *
 * Everything is at its true size and distance. Positions are kept in kilometres as ordinary JS
 * numbers (doubles) and the camera is always at the origin: each frame every body is placed at
 * (its position - the camera's position), so the GPU only ever sees small, nearby numbers
 * (a "floating origin"). A logarithmic depth buffer covers the range from a few km to 50 au.
 */

const AU = 149_597_870.7; // km
const R = { sun: 695_700, earth: 6_371, moon: 1_737.4, jupiter: 71_492 };
const OTHERS = ['mercury', 'venus', 'mars', 'saturn', 'uranus', 'neptune'] as const;
const NAMES: Record<string, string> = { mercury: 'Mercury', venus: 'Venus', mars: 'Mars', jupiter: 'Jupiter', saturn: 'Saturn', uranus: 'Uranus', neptune: 'Neptune', earth: 'Earth', sun: 'Sun', moon: 'Moon' };
// rough brightness of each planet as a point, so Jupiter and Venus stand out the way they do in our sky
const GLINT: Record<string, number> = { mercury: 0.5, venus: 1, mars: 0.6, jupiter: 0.95, saturn: 0.75, uranus: 0.45, neptune: 0.4 };

type V = [number, number, number];
/** ecliptic (x to the equinox, z north) to three.js (y up) */
const toThree = (p: V): V => [p[0], p[2], -p[1]];
const sub = (a: V, b: V): V => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const len = (a: V) => Math.hypot(a[0], a[1], a[2]);
const norm = (a: V): V => { const l = len(a); return [a[0] / l, a[1] / l, a[2] / l]; };
const add = (a: V, b: V): V => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const mul = (a: V, s: number): V => [a[0] * s, a[1] * s, a[2] * s];

/** the Moon's position from the Earth in km, from the leading terms of its orbit (Meeus, ch. 47 shortened) */
function moonGeocentric(date: Date): V {
  const d = (date.getTime() - Date.UTC(2000, 0, 1, 12)) / 86_400_000;
  const r = Math.PI / 180;
  const L = 218.316 + 13.176396 * d, M = 134.963 + 13.064993 * d, F = 93.272 + 13.22935 * d;
  const D = 297.85 + 12.190749 * d, Ms = 357.529 + 0.98560028 * d;
  const lon = (L + 6.289 * Math.sin(M * r) + 1.274 * Math.sin((2 * D - M) * r) + 0.658 * Math.sin(2 * D * r) - 0.186 * Math.sin(Ms * r)) * r;
  const lat = 5.128 * Math.sin(F * r) * r;
  const dist = 385_001 - 20_905 * Math.cos(M * r) - 3_699 * Math.cos((2 * D - M) * r);
  return [dist * Math.cos(lat) * Math.cos(lon), dist * Math.cos(lat) * Math.sin(lon), dist * Math.sin(lat)];
}

export interface EnterOptions {
  canvas: HTMLCanvasElement;
  labels: HTMLElement;
  onReadout(r: { target: string; distKm: number; phase: 'idle' | 'flight' | 'arrived' }): void;
  onArrive(): void;
}

export function createEnter(o: EnterOptions) {
  const renderer = new THREE.WebGLRenderer({ canvas: o.canvas, antialias: true, logarithmicDepthBuffer: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  const maxTex = renderer.capabilities.maxTextureSize;
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000000);
  const camera = new THREE.PerspectiveCamera(50, 1, 1, 60 * AU);
  camera.rotation.order = 'YXZ';

  // ---- the real sky ----------------------------------------------------------
  const stars = createStars(1000);
  scene.add(stars.group);

  // ---- where everything is now -------------------------------------------------
  const now = new Date();
  const T = centuriesSinceJ2000(now);
  const helio = (slug: string): V => toThree(mul(positionAU(slug, T), AU));
  const earthPos = helio('earth');
  const moonPos = add(earthPos, toThree(moonGeocentric(now)));
  const sunPos: V = [0, 0, 0];

  // ---- the Sun: the same photosphere as its own page, plus a point of light that stays visible from far away
  const sun = createStar([[12, 30, 9000, 20000], [-16, 80, 7000, 16000], [9, -40, 5000, 12000]]);
  sun.group.scale.setScalar(R.sun);
  scene.add(sun.group);
  const sunPoint = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTexture(), color: 0xfff0d8, blending: THREE.AdditiveBlending, depthWrite: false, depthTest: false, sizeAttenuation: false, transparent: true }));
  sunPoint.renderOrder = 5;
  scene.add(sunPoint);

  // ---- Earth, with the full orbit look from v1 -----------------------------------
  const earth: Planet = createPlanet({
    map: '4k_earth_day.webp', mapHi: '8k_earth_day.webp', night: '4k_earth_night.webp', water: '4k_earth_water.webp', clouds: '4k_earth_clouds.webp',
    detail: 'earth', grain: 0.28, relief: 0.9, craters: 0,
    air: [0.36, 0.56, 1], airDensity: 1, airHeight: 0.016, dusk: [1, 0.55, 0.34],
    skyZenith: [0.12, 0.25, 0.55], skyHorizon: [0.92, 0.76, 0.6], skyTop: 0.012, ambient: 0.012, limbDark: 0,
  }, maxTex, innerWidth > 900);
  earth.group.scale.setScalar(R.earth);
  // the globe's own tilt: 23.4° to the ecliptic
  const earthTilt = new THREE.Group();
  earthTilt.rotation.z = THREE.MathUtils.degToRad(23.44);
  earthTilt.add(earth.group);
  scene.add(earthTilt);

  // ---- Jupiter, which the flight passes on the way in
  const jupPos = helio('jupiter');
  const jupiter: Planet = createPlanet({
    map: '4k_jupiter.webp', mapHi: '8k_jupiter.webp', detail: 'bands', grain: 0.2, relief: 0, craters: 0, exposure: 0.95, saturation: 1.35,
    air: [0.82, 0.76, 0.66], airDensity: 0.12, airHeight: 0.01, dusk: [1, 0.7, 0.5],
    skyZenith: [0.09, 0.1, 0.15], skyHorizon: [0.79, 0.66, 0.5], skyTop: 0.004, ambient: 0.02, limbDark: 0.55,
    flattening: 0.0649,
  }, maxTex, innerWidth > 900);
  const jupTilt = new THREE.Group();
  jupTilt.rotation.z = THREE.MathUtils.degToRad(3.13);
  jupiter.group.scale.multiplyScalar(R.jupiter);
  jupTilt.add(jupiter.group);
  scene.add(jupTilt);

  // ---- the Moon, from NASA's LRO colour map ---------------------------------------
  const moonTex = new THREE.TextureLoader().load('/textures/4k_moon.webp');
  moonTex.colorSpace = THREE.SRGBColorSpace;
  moonTex.anisotropy = 8;
  const moon = new THREE.Mesh(new THREE.SphereGeometry(R.moon, 128, 64), new THREE.MeshStandardMaterial({ map: moonTex, roughness: 1, metalness: 0 }));
  scene.add(moon);
  const sunLight = new THREE.DirectionalLight(0xfff4e8, 3.2);
  scene.add(sunLight, sunLight.target);

  // ---- the other planets, as the points of light they are from here ---------------
  const dots = OTHERS.map((slug) => {
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTexture(), color: 0xfff6ea, blending: THREE.AdditiveBlending, depthWrite: false, depthTest: false, sizeAttenuation: false, transparent: true }));
    s.renderOrder = 4;
    scene.add(s);
    return { slug, pos: helio(slug), sprite: s };
  });

  // ---- name tags -------------------------------------------------------------------
  const tags = new Map<string, HTMLElement>();
  for (const slug of [...OTHERS, 'jupiter', 'earth', 'sun', 'moon']) {
    const el = document.createElement('span');
    el.className = 'tag';
    el.innerHTML = `<i></i>${NAMES[slug]}`;
    o.labels.appendChild(el);
    tags.set(slug, el);
  }

  // ---- the flight ------------------------------------------------------------------
  // Two legs. First, from 42 au out above the plane of the planets, in past Jupiter close enough
  // to feel its size (half a million km, inside Io's orbit). Then the long empty fall in to the
  // Earth, ending 24,000 km out on the sunward side so you arrive on a gibbous Earth. Each leg
  // closes distance exponentially, so every second covers the same number of powers of ten.
  const north: V = [0, 1, 0];
  const sideOf = (d: V): V => norm([d[2], 0, -d[0]]);
  const jToSun = norm(sub(sunPos, jupPos));
  const toSun = norm(sub(sunPos, earthPos));
  const startDir = norm(add(add(mul(jToSun, -0.7), mul(north, 0.55)), mul(sideOf(jToSun), 0.3)));
  const jEndDir = norm(add(add(mul(jToSun, 0.62), mul(sideOf(jToSun), -0.72)), mul(north, 0.12)));
  const passJ = add(jupPos, mul(jEndDir, 520_000));
  const eEndDir = norm(add(add(mul(toSun, 0.78), mul(sideOf(toSun), 0.55)), mul(north, 0.22)));
  const legs = [
    { target: jupPos, from: add(jupPos, mul(startDir, 42 * AU)), dEnd: 520_000, endDir: jEndDir, secs: 8 },
    { target: earthPos, from: passJ, dEnd: innerWidth / innerHeight < 0.8 ? 38_000 : 24_000, endDir: eEndDir, secs: 12 },
  ];
  const FLIGHT = legs.reduce((a, l) => a + l.secs, 0);
  let phase: 'idle' | 'flight' | 'arrived' = 'idle';
  let t0 = 0;
  let s = 0; // seconds into the flight

  // drag to look round once there
  const look = { yaw: 0, pitch: 0, ty: 0, tp: 0 };
  let dragging = false, lx = 0, ly = 0;
  o.canvas.addEventListener('pointerdown', (e) => { dragging = true; lx = e.clientX; ly = e.clientY; });
  addEventListener('pointerup', () => (dragging = false));
  addEventListener('pointermove', (e) => {
    if (!dragging || phase !== 'arrived') return;
    look.ty -= (e.clientX - lx) * 0.004; look.tp = THREE.MathUtils.clamp(look.tp - (e.clientY - ly) * 0.004, -1.2, 1.2);
    lx = e.clientX; ly = e.clientY;
  });

  const slerp = (a: V, b: V, t: number): V => {
    const d = THREE.MathUtils.clamp(a[0] * b[0] + a[1] * b[1] + a[2] * b[2], -1, 1);
    const th = Math.acos(d);
    if (th < 1e-5) return a;
    const sa = Math.sin((1 - t) * th) / Math.sin(th), sb = Math.sin(t * th) / Math.sin(th);
    return [a[0] * sa + b[0] * sb, a[1] * sa + b[1] * sb, a[2] * sa + b[2] * sb];
  };
  const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
  const ss = THREE.MathUtils.smoothstep;

  function legPos(l: typeof legs[number], e: number): V {
    const off = sub(l.from, l.target);
    const d0 = len(off);
    const dist = Math.exp(Math.log(d0) + (Math.log(l.dEnd) - Math.log(d0)) * e);
    return add(l.target, mul(slerp(norm(off), l.endDir, ss(e, 0.1, 0.97)), dist));
  }

  // where you look: leg one watches Jupiter grow and lets it slide off to one side as you pass;
  // leg two turns to the Earth, with the Sun near it in the sky
  // turn from a towards b by a fixed angle (not a fraction of the gap)
  const toward = (a: V, b: V, ang: number): V => {
    const gap = Math.acos(THREE.MathUtils.clamp(a[0] * b[0] + a[1] * b[1] + a[2] * b[2], -1, 1));
    return gap < 1e-6 ? a : slerp(a, b, Math.min(1, ang / gap));
  };
  const PASS_OFF = 0.3; // rad: as you pass, Jupiter sits about a third of the way across the view
  function aimFor(pos: V, leg: number, e: number): V {
    const toJ = norm(sub(jupPos, pos)), toE = norm(sub(earthPos, pos)), toS = norm(sub(sunPos, pos));
    if (leg === 0) return toward(toJ, toS, ss(e, 0.7, 1) * PASS_OFF);
    // leaving Jupiter: keep watching it slide away for a moment, then swing round to the Earth
    return slerp(toward(toJ, toS, PASS_OFF), toE, ss(e, 0.12, 0.42));
  }

  function cameraAt(sec: number): { pos: V; aim: V; arrive: number } {
    let leg = 0, t = sec;
    while (leg < legs.length - 1 && t > legs[leg].secs) { t -= legs[leg].secs; leg++; }
    const u = Math.min(1, Math.max(0, t / legs[leg].secs));
    // the second leg pulls away from Jupiter more gently, so the planet has time to fall behind
    const e = leg === 0 ? ease(u) : (u < 0.5 ? 16 * u ** 5 : 1 - Math.pow(-2 * u + 2, 5) / 2);
    const pos = legPos(legs[leg], e);
    return { pos, aim: aimFor(pos, leg, u), arrive: leg === legs.length - 1 ? ss(u, 0.85, 1) : 0 };
  }

  const v = new THREE.Vector3();
  let camPos: V = cameraAt(0).pos;
  let aim: V = cameraAt(0).aim;
  const clock = new THREE.Clock();

  function place(obj: THREE.Object3D, p: V) {
    obj.position.set(p[0] - camPos[0], p[1] - camPos[1], p[2] - camPos[2]);
  }

  function frame() {
    const dt = Math.min(clock.getDelta(), 0.1);
    const t = clock.elapsedTime;
    if (phase === 'flight') {
      s = Math.min(FLIGHT, (performance.now() - t0) / 1000);
      // for checking a single moment of the flight: ?at=seconds holds it there
      const at = Number(new URLSearchParams(location.search).get('at'));
      if (at > 0) s = Math.min(at, FLIGHT - 0.001);
      if (s >= FLIGHT) { phase = 'arrived'; o.onArrive(); }
    }
    if (phase === 'idle') {
      // before entering: hang far out and let the sky turn slowly
      look.yaw = Math.sin(t * 0.03) * 0.25;
    } else if (phase === 'flight') {
      look.yaw *= Math.max(0, 1 - dt * 1.5);
    }
    const c = cameraAt(s);
    camPos = c.pos; aim = c.aim;
    if (phase === 'arrived') {
      look.yaw += (look.ty - look.yaw) * Math.min(1, dt * 4);
      look.pitch += (look.tp - look.pitch) * Math.min(1, dt * 4);
      // a very slow drift round the Earth, so it never sits dead still
      look.ty += dt * 0.004;
    }

    // camera at the origin, facing along aim, then turned by any dragging
    camera.position.set(0, 0, 0);
    camera.lookAt(aim[0], aim[1], aim[2]);
    // on arrival the Earth moves off-centre to leave room for the words: left on a wide screen, up on a phone
    const wide = camera.aspect > 1.1;
    camera.rotateY(look.yaw + (wide ? -0.2 : 0) * c.arrive);
    camera.rotateX(look.pitch + (wide ? 0 : -0.2) * c.arrive);

    // ---- place everything relative to the camera
    place(sun.group, sunPos);
    sun.update(camera, len(camPos) / R.sun, t);
    place(sunPoint, sunPos);
    // the Sun's point of light: big and bright from close, a hard star from the edge of the system
    const dSun = len(camPos);
    const spx = THREE.MathUtils.clamp(0.06 * Math.pow(AU / dSun, 0.6), 0.012, 0.09);
    sunPoint.scale.setScalar(spx);
    (sunPoint.material as THREE.SpriteMaterial).opacity = THREE.MathUtils.clamp(1.2 - Math.atan(R.sun / dSun) * 40, 0.25, 1);

    place(earthTilt, earthPos);
    const toSunFromEarth = norm(sub(sunPos, earthPos));
    earth.setSun(new THREE.Vector3(...toSunFromEarth));
    earth.group.rotation.y = -(((now.getTime() / 86_400_000) % 1) * Math.PI * 2) - t * 0.002;
    const dEarth = len(sub(camPos, earthPos));
    earth.update(camera, dEarth / R.earth - 1, t);

    place(jupTilt, jupPos);
    jupiter.setSun(new THREE.Vector3(...norm(sub(sunPos, jupPos))));
    jupiter.group.rotation.y = -t * 0.02;
    jupiter.update(camera, len(sub(camPos, jupPos)) / R.jupiter - 1, t);

    place(moon, moonPos);
    // the Moon keeps one face to the Earth
    v.set(earthPos[0] - moonPos[0], earthPos[1] - moonPos[1], earthPos[2] - moonPos[2]).normalize();
    moon.rotation.y = Math.atan2(v.x, v.z) + Math.PI / 2;
    sunLight.position.set(0, 0, 0);
    sunLight.target.position.set(-toSunFromEarth[0], -toSunFromEarth[1], -toSunFromEarth[2]);

    for (const d of dots) {
      place(d.sprite, d.pos);
      const dist = len(sub(camPos, d.pos));
      d.sprite.scale.setScalar(THREE.MathUtils.clamp(0.012 * Math.pow(5 * AU / dist, 0.35), 0.006, 0.02));
      (d.sprite.material as THREE.SpriteMaterial).opacity = GLINT[d.slug] * THREE.MathUtils.clamp(Math.pow(6 * AU / dist, 0.5), 0.35, 1);
    }

    renderer.render(scene, camera);
    tagPass(dEarth);
    // the instruments read out the distance to wherever you are heading
    const toJup = s < legs[0].secs;
    o.onReadout(toJup
      ? { target: 'Jupiter', distKm: len(sub(camPos, jupPos)) - R.jupiter, phase }
      : { target: 'Earth', distKm: dEarth - R.earth, phase });
    requestAnimationFrame(frame);
  }

  // name tags: only where they help, and never on top of each other
  function tagPass(dEarth: number) {
    const w = o.canvas.clientWidth, h = o.canvas.clientHeight;
    const show = phase !== 'idle';
    const placed: [number, number, number, number][] = [];
    const items: [string, V, number][] = [
      ['sun', sunPos, 1], ['earth', earthPos, 1], ['moon', moonPos, dEarth < 3e6 ? 1 : 0], ['jupiter', jupPos, 1],
      ...dots.map((d) => [d.slug, d.pos, 1] as [string, V, number]),
    ];
    for (const [slug, p, on] of items) {
      const el = tags.get(slug)!;
      const rel = sub(p, camPos);
      v.set(rel[0], rel[1], rel[2]).applyMatrix4(camera.matrixWorldInverse);
      const behind = v.z > 0;
      v.applyMatrix4(camera.projectionMatrix);
      const x = (v.x + 1) / 2 * w, y = (1 - v.y) / 2 * h;
      const dist = len(rel);
      // a body's tag goes once it fills enough of the view to speak for itself
      const big = slug === 'earth' ? dist < 400 * R.earth : slug === 'sun' ? dist < 30 * R.sun : slug === 'jupiter' ? dist < 120 * R.jupiter : false;
      if (phase === 'arrived' && slug !== 'moon') { el.style.opacity = '0'; continue; }
      const box: [number, number, number, number] = [x + 6, y - 9, x + 6 + NAMES[slug].length * 7.5 + 12, y + 9];
      const clash = placed.some((b) => box[0] < b[2] && box[2] > b[0] && box[1] < b[3] && box[3] > b[1]);
      const vis = show && on && !behind && !big && !clash && x > 0 && x < w - 60 && y > 30 && y < h - 30;
      if (vis) placed.push(box);
      el.style.opacity = vis ? '1' : '0';
      el.style.transform = `translate(${x}px, ${y}px)`;
    }
  }

  function resize() {
    const w = o.canvas.clientWidth, h = o.canvas.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    // keep a sensible field of view on a tall phone screen
    camera.fov = THREE.MathUtils.clamp(50 / Math.min(1, camera.aspect * 1.4), 50, 74);
    camera.updateProjectionMatrix();
  }
  new ResizeObserver(resize).observe(o.canvas);
  resize();
  requestAnimationFrame(frame);

  return {
    enter() {
      if (phase !== 'idle') return;
      phase = 'flight';
      t0 = performance.now();
    },
    skip() {
      if (phase !== 'flight') return;
      // jump to just before arrival, so the last stretch still plays
      t0 = Math.min(t0, performance.now() - (FLIGHT - 3) * 1000);
    },
    /** where the Sun is on screen, so the threshold ring can close onto it */
    sunScreen(): [number, number] {
      const rel = sub(sunPos, camPos);
      v.set(rel[0], rel[1], rel[2]).applyMatrix4(camera.matrixWorldInverse).applyMatrix4(camera.projectionMatrix);
      return [(v.x + 1) / 2 * o.canvas.clientWidth, (1 - v.y) / 2 * o.canvas.clientHeight];
    },
  };
}

function glowTexture() {
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const g = c.getContext('2d')!;
  const grd = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  grd.addColorStop(0, 'rgba(255,255,255,1)');
  grd.addColorStop(0.08, 'rgba(255,255,255,0.9)');
  grd.addColorStop(0.22, 'rgba(255,255,255,0.25)');
  grd.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = grd;
  g.fillRect(0, 0, 128, 128);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
