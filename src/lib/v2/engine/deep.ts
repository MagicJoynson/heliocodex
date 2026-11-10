import * as THREE from 'three/webgpu';
import { instancedBufferAttribute, uv, vec4, vec3, float, exp, exp2, log2, dot, sub, uniform, max, min, clamp, sqrt, smoothstep, length, varying, texture, positionGeometry } from 'three/tsl';
import { add, cross, len, norm, scale, type V3 } from './vec';

/**
 * Everything beyond the Solar System, drawn in the space layer: the stars at their real distances,
 * a model of the Milky Way, the galaxies of the Local Group, the galaxies of the 2MASS Redshift
 * Survey, and the oldest light. Positions are in parsecs from the Sun, in the engine's frame.
 *
 * Every object is drawn as a direction from the camera at the space layer's fixed distance (so
 * nothing is ever clipped), with its brightness worked out from its real distance in the shader.
 * Moving the camera a few light years therefore shifts the near stars against the far ones.
 *
 * What is measured and what is a model:
 * - stars: HYG v4.4 (Hipparcos, Yale, Gliese), distances from parallax. Measured.
 * - the Milky Way's shape: a model built from measured averages (see makeSpiral). Not a map.
 * - Local Group galaxies: positions and brightness measured (McConnachie 2012); Andromeda, Triangulum
 *   and the two Magellanic Clouds are drawn as models of their shape at their real place and tilt.
 * - 2MRS galaxies: positions on the sky measured; distances from redshift (d = cz / 70 km/s/Mpc).
 * - the oldest light: the WMAP nine-year map, on a sphere 14.1 Gpc (46 billion light years) away.
 */

export const PC = 3.0856775814913673e16; // metres

// typed handles on per-point data and on values passed from the vertex stage to the pixel stage
type N4 = ReturnType<typeof vec4>;
type N3 = ReturnType<typeof vec3>;
type N1 = ReturnType<typeof float>;
const attr4 = (a: Float32Array) => instancedBufferAttribute(new THREE.InstancedBufferAttribute(a, 4)) as unknown as N4;
const attr3 = (a: Float32Array) => instancedBufferAttribute(new THREE.InstancedBufferAttribute(a, 3)) as unknown as N3;
const vary = (n: unknown) => varying(n as never) as unknown as N1;
const u1 = (v: number) => uniform(v) as unknown as N1 & { value: number };
const LY = 9.4607304725808e15;
export const pcFromLy = (ly: number) => (ly * LY) / PC;

// the galactic frame in the engine's frame (from astropy, J2000/ICRS)
export const GAL_X: V3 = [-0.0548757, -0.0964767, 0.9938214]; // towards the centre, l = 0, b = 0
export const GAL_Y: V3 = [0.4941094, 0.8622859, 0.1109908]; // l = 90, the way the Sun is going
export const GAL_Z: V3 = [-0.8676661, 0.4971472, 0.0003515]; // north galactic pole
/** the Sun's distance from the Galactic Centre, pc (GRAVITY Collaboration 2019) */
export const R0 = 8178;
export const GAL_CENTRE: V3 = scale(GAL_X, R0);
const galToEngine = (l: number, b: number): V3 => {
  const L = (l * Math.PI) / 180, B = (b * Math.PI) / 180;
  return norm(add(add(scale(GAL_X, Math.cos(B) * Math.cos(L)), scale(GAL_Y, Math.cos(B) * Math.sin(L))), scale(GAL_Z, Math.sin(B))));
};
/** the supergalactic north pole (l 47.37°, b 6.32°): looking down it, the nearby cosmic web lies flat */
export const SUPERGAL_POLE = galToEngine(47.37, 6.32);

const EPS = (23.4392911 * Math.PI) / 180;
/** equatorial (RA, Dec in degrees) to a unit vector in the engine's frame */
export function radecToEngine(ra: number, dec: number): V3 {
  const a = (ra * Math.PI) / 180, d = (dec * Math.PI) / 180;
  const x = Math.cos(d) * Math.cos(a), y = Math.cos(d) * Math.sin(a), z = Math.sin(d);
  return [x, -y * Math.sin(EPS) + z * Math.cos(EPS), -(y * Math.cos(EPS) + z * Math.sin(EPS))];
}

/** Galaxy clusters to name in the cosmic web. Positions from NED; distances from redshift, as 2MRS. */
const CLUSTERS: { name: string; ra: number; dec: number; cz: number }[] = [
  { name: 'Virgo Cluster', ra: 187.7, dec: 12.39, cz: 1100 },
  { name: 'Fornax Cluster', ra: 54.62, dec: -35.45, cz: 1379 },
  { name: 'Centaurus Cluster', ra: 192.2, dec: -41.31, cz: 3418 },
  { name: 'Hydra Cluster', ra: 159.17, dec: -27.53, cz: 3777 },
  { name: 'Norma Cluster, in the Great Attractor', ra: 243.59, dec: -60.91, cz: 4871 },
  { name: 'Perseus Cluster', ra: 49.95, dec: 41.51, cz: 5366 },
  { name: 'Coma Cluster', ra: 194.95, dec: 27.98, cz: 6925 },
  { name: 'Shapley Supercluster', ra: 201.98, dec: -31.5, cz: 14500 },
];

/** the radius of the sphere the oldest light comes from, pc (46 billion light years, comoving) */
export const CMB_PC = pcFromLy(46e9);

// ---- a small seeded random source, so the models look the same on every visit
function rng(seed: number) {
  let a = seed >>> 0;
  const next = () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const gauss = () => Math.sqrt(-2 * Math.log(next() || 1e-12)) * Math.cos(2 * Math.PI * next());
  return { next, gauss };
}

interface Cloud { pos: number[]; col: number[] } // pos: x, y, z, size (pc); col: r, g, b, luminosity (or opacity for dust)

interface SpiralOpts {
  seed: number;
  n: number; // particles of light, in all
  scaleLen: number; // exponential disc scale length, pc
  rMax: number;
  height: number; // disc scale height, pc
  arms: { theta0: number; r0: number; rMax: number; weight: number; span?: [number, number] }[];
  pitchDeg: number;
  bar?: { angleDeg: number; half: number; width: number; thick: number };
  bulge: number; // bulge radius (gaussian), pc
  bulgeShare: number;
  armWidth: number;
}

/**
 * A disc galaxy as a cloud of soft points: an old, warm disc thickened where the arms run; young
 * blue clusters and pink glowing gas strung along the arms; a bar and bulge at the centre; dust on
 * the arms' inner edges. Built in its own frame (the disc in x-y), centred on the galaxy's middle.
 */
function makeSpiral(o: SpiralOpts): { light: Cloud; dust: Cloud } {
  const R = rng(o.seed);
  const k = Math.tan((o.pitchDeg * Math.PI) / 180);
  const sinP = Math.sin((o.pitchDeg * Math.PI) / 180);
  const light: Cloud = { pos: [], col: [] }, dust: Cloud = { pos: [], col: [] };
  const push = (c: Cloud, x: number, y: number, z: number, s: number, r: number, g: number, b: number, l: number) => { c.pos.push(x, y, z, s); c.col.push(r, g, b, l); };
  const armAt = (a: SpiralOpts['arms'][number], r: number) => a.theta0 + Math.log(r / a.r0) / k;
  const wrap = (x: number) => x - 2 * Math.PI * Math.round(x / (2 * Math.PI));
  const armDensity = (r: number, th: number) => {
    let best = 0;
    for (const a of o.arms) {
      if (r < a.r0 * 0.9 || r > a.rMax) continue;
      const along = armAt(a, r);
      if (a.span && Math.abs(wrap(th - (a.span[0] + a.span[1]) / 2)) > (a.span[1] - a.span[0]) / 2) continue;
      const dperp = r * Math.abs(wrap(th - along)) * sinP;
      best = Math.max(best, a.weight * Math.exp(-(dperp * dperp) / (2 * o.armWidth * o.armWidth)));
    }
    return best;
  };
  const laplace = (h: number) => (R.next() < 0.5 ? -1 : 1) * -h * Math.log(R.next() || 1e-12);

  const nDisc = Math.round(o.n * (0.5 - o.bulgeShare / 2));
  const nArm = Math.round(o.n * 0.32);
  const nBulge = Math.round(o.n * o.bulgeShare);
  const nGas = Math.round(o.n * 0.03);
  const nDust = Math.round(o.n * 0.08);

  // the old disc, denser along the arms
  for (let made = 0, tries = 0; made < nDisc && tries < nDisc * 20; tries++) {
    const r = -o.scaleLen * Math.log((R.next() || 1e-9) * (R.next() || 1e-9));
    if (r > o.rMax || r < o.bulge * 0.6) continue;
    const th = R.next() * 2 * Math.PI;
    if (R.next() > 0.4 + 0.6 * armDensity(r, th)) continue;
    const z = laplace(o.height * (1 + 0.6 * (r / o.rMax) ** 2));
    const warm = 0.9 + 0.1 * R.next();
    push(light, r * Math.cos(th), r * Math.sin(th), z, o.scaleLen * 0.2, 1.0 * warm, 0.84 * warm, 0.66 * warm, 0.42);
    made++;
  }
  // young clusters along the arms, in clumps, with glowing gas at the heart of some
  const perClump = 24;
  const armTotal = o.arms.reduce((s, a) => s + a.weight, 0);
  for (let made = 0; made < nArm;) {
    let pick = R.next() * armTotal, a = o.arms[0];
    for (const x of o.arms) { if ((pick -= x.weight) <= 0) { a = x; break; } }
    // more clumps where the disc is brighter; a spur is spread evenly along its span
    let r: number, th: number;
    if (a.span) { th = a.span[0] + R.next() * (a.span[1] - a.span[0]); r = a.r0 * Math.exp(k * (th - a.theta0)); }
    else { r = a.r0 + (-o.scaleLen * 1.2 * Math.log(R.next() || 1e-9)) % (a.rMax - a.r0); th = armAt(a, r); }
    const rr = r;
    const off = R.gauss() * o.armWidth * 0.7;
    const cx = (rr + off) * Math.cos(th), cy = (rr + off) * Math.sin(th), cz = R.gauss() * o.height * 0.25;
    const blue = 0.85 + 0.15 * R.next();
    for (let i = 0; i < perClump && made < nArm; i++, made++) {
      push(light, cx + R.gauss() * o.armWidth * 0.3, cy + R.gauss() * o.armWidth * 0.3, cz + R.gauss() * o.height * 0.15, o.scaleLen * 0.055, 0.62 * blue, 0.74 * blue, 1.0, 1.25);
    }
    if (R.next() < 0.35 && light.pos.length / 4 < o.n) for (let i = 0; i < 4; i++) push(light, cx + R.gauss() * o.armWidth * 0.12, cy + R.gauss() * o.armWidth * 0.12, cz, o.scaleLen * 0.03, 1.0, 0.42, 0.52, 1.6);
    // dust lies just inside the arm
    if (dust.pos.length / 4 < nDust) for (let i = 0; i < 6; i++) {
      const rin = rr + off - o.armWidth * 0.55 + R.gauss() * o.armWidth * 0.25;
      const thd = th + R.gauss() * 0.02;
      push(dust, rin * Math.cos(thd), rin * Math.sin(thd), R.gauss() * o.height * 0.12, o.scaleLen * 0.1, 0.06, 0.045, 0.035, 0.28);
    }
  }
  // gas spread thinly along the arms too
  for (let made = 0; made < nGas; made++) {
    const a = o.arms[Math.floor(R.next() * o.arms.length)];
    const r = a.r0 + R.next() * (a.rMax - a.r0);
    const th = armAt(a, r) + (R.gauss() * o.armWidth) / r;
    push(light, r * Math.cos(th), r * Math.sin(th), R.gauss() * o.height * 0.1, o.scaleLen * 0.035, 1.0, 0.45, 0.55, 1.4);
  }
  // the bar and the bulge: old, warm, bright
  for (let made = 0; made < nBulge; made++) {
    let x: number, y: number, z: number;
    if (o.bar && R.next() < 0.6) {
      const ang = (o.bar.angleDeg * Math.PI) / 180;
      const u = R.gauss() * o.bar.half * 0.5, v = R.gauss() * o.bar.width, w = R.gauss() * o.bar.thick;
      x = u * Math.cos(ang) - v * Math.sin(ang); y = u * Math.sin(ang) + v * Math.cos(ang); z = w;
    } else {
      const s = o.bulge * Math.abs(R.gauss()) ** 0.7;
      const ct = 2 * R.next() - 1, ph = R.next() * 2 * Math.PI, st = Math.sqrt(1 - ct * ct);
      x = s * st * Math.cos(ph); y = s * st * Math.sin(ph); z = s * ct * 0.75;
    }
    const t = 0.92 + 0.08 * R.next();
    push(light, x, y, z, o.bulge * 0.45, 1.0 * t, 0.8 * t, 0.55 * t, 0.55);
  }
  return { light, dust };
}

/** An irregular galaxy (the Magellanic Clouds): a lumpy cloud with an off-centre bar. */
function makeIrregular(seed: number, n: number, radius: number, bar: number): Cloud {
  const R = rng(seed);
  const c: Cloud = { pos: [], col: [] };
  const lumps = Array.from({ length: 14 }, () => [R.gauss() * radius * 0.5, R.gauss() * radius * 0.5, R.gauss() * radius * 0.15, 0.3 + R.next()]);
  for (let i = 0; i < n; i++) {
    const r = R.next();
    let x, y, z, col: [number, number, number, number];
    if (r < 0.3) { // the bar
      x = R.gauss() * bar + radius * 0.15; y = R.gauss() * bar * 0.3; z = R.gauss() * bar * 0.2;
      col = [1.0, 0.85, 0.68, 1.3];
    } else if (r < 0.65) { // star-forming lumps
      const L = lumps[Math.floor(R.next() * lumps.length)];
      x = L[0] + R.gauss() * radius * 0.12; y = L[1] + R.gauss() * radius * 0.12; z = L[2] + R.gauss() * radius * 0.05;
      col = R.next() < 0.1 ? [1.0, 0.45, 0.55, 1.5] : [0.66, 0.76, 1.0, 1.1];
    } else {
      x = R.gauss() * radius * 0.6; y = R.gauss() * radius * 0.6; z = R.gauss() * radius * 0.2;
      col = [0.95, 0.85, 0.75, 0.8];
    }
    c.pos.push(x, y, z, radius * 0.1); c.col.push(...col);
  }
  return c;
}

/** place a cloud built in its own frame: the disc's x and y axes and its middle, in the engine frame (pc) */
function place(c: Cloud, ex: V3, ey: V3, centre: V3, scaleBy = 1) {
  const ez = norm(cross(ex, ey));
  const out = new Float32Array(c.pos.length);
  for (let i = 0; i < c.pos.length; i += 4) {
    const x = c.pos[i] * scaleBy, y = c.pos[i + 1] * scaleBy, z = c.pos[i + 2] * scaleBy;
    out[i] = centre[0] + ex[0] * x + ey[0] * y + ez[0] * z;
    out[i + 1] = centre[1] + ex[1] * x + ey[1] * y + ez[1] * z;
    out[i + 2] = centre[2] + ex[2] * x + ey[2] * y + ez[2] * z;
    out[i + 3] = c.pos[i + 3] * scaleBy;
  }
  return out;
}

/** an equatorial vector to the engine's frame */
function eqVec(x: number, y: number, z: number): V3 {
  return [x, -y * Math.sin(EPS) + z * Math.cos(EPS), -(y * Math.cos(EPS) + z * Math.sin(EPS))];
}

/** a disc's axes from where it is on the sky, its position angle (east of north) and its tilt (0 = face on) */
function discAxes(ra: number, dec: number, paDeg: number, inclDeg: number): [V3, V3] {
  const a = (ra * Math.PI) / 180, d = (dec * Math.PI) / 180;
  const s = radecToEngine(ra, dec);
  const north = eqVec(-Math.sin(d) * Math.cos(a), -Math.sin(d) * Math.sin(a), Math.cos(d));
  const east = eqVec(-Math.sin(a), Math.cos(a), 0);
  const pa = (paDeg * Math.PI) / 180, inc = (inclDeg * Math.PI) / 180;
  const major = norm(add(scale(north, Math.cos(pa)), scale(east, Math.sin(pa))));
  const minor = norm(add(scale(north, -Math.sin(pa)), scale(east, Math.cos(pa))));
  // the minor axis, foreshortened on the sky, tips away from us by the tilt
  return [major, norm(add(scale(minor, Math.cos(inc)), scale(s, Math.sin(inc))))];
}

export interface DeepView {
  /** the camera, metres from the Sun */
  cam: V3;
  quaternion: THREE.Quaternion;
  fovDeg: number;
  heightPx: number;
  widthPx: number;
  /** star field brightness, as the sky's (dims in daylight) */
  starGain: number;
  /** other names to show, such as the planets: direction from the camera (any length) and how strongly */
  extra?: { text: string; dir: V3; alpha: number }[];
}

export function createDeep(o: { scene: THREE.Scene; far: number; particles: number; labelsAfter: HTMLElement; pxRatio: number }) {
  const FAR = o.far;
  const camPc = uniform(new THREE.Vector3());
  const pxPerRad = u1(800);
  const starGain = u1(1);
  const pxr = u1(1 / Math.min(devicePixelRatio, 2));
  const root = new THREE.Group();
  o.scene.add(root);

  // ---- a soft round point
  const fall = (() => {
    const d = sub(uv(), 0.5);
    const r2 = dot(d, d).mul(4);
    return exp(r2.mul(-5)).add(exp(r2.mul(-1.2)).mul(0.25)).mul(max(float(0), float(1).sub(r2)));
  })();
  const softFall = (() => {
    const d = sub(uv(), 0.5);
    const r2 = dot(d, d).mul(4);
    return exp(r2.mul(-3.2)).mul(max(float(0), float(1).sub(r2)));
  })();

  // each set of points is drawn only while its fade is above nothing, which saves a slow device a lot
  const gated: { s: THREE.Sprite; g: { value: number } }[] = [];
  function points(n: number, mat: THREE.PointsNodeMaterial, order: number, gate?: { value: number }) {
    const s = new THREE.Sprite(mat as unknown as THREE.SpriteMaterial);
    if (gate) { gated.push({ s, g: gate }); s.visible = gate.value > 0.002; }
    s.count = n;
    s.frustumCulled = false;
    s.renderOrder = order;
    root.add(s);
    return s;
  }

  // ---- stars, brightness from their real distance to the camera
  function starMaterial(posAttr: Float32Array, colAttr: Float32Array, gain: N1) {
    const mat = new THREE.PointsNodeMaterial({ transparent: true, depthTest: false, depthWrite: false, blending: THREE.AdditiveBlending, sizeAttenuation: false });
    const P = attr4(posAttr);
    const C = attr3(colAttr);
    const rel = P.xyz.sub(camPc);
    const d = max(length(rel), float(2e-5));
    mat.positionNode = rel.div(d).mul(FAR);
    // apparent magnitude from absolute: m = M + 5 log10(d / 10 pc)
    const m = P.w.add(log2(d).mul(5 * 0.30103)).sub(5);
    const b = exp2(float(0.5).sub(m).mul(0.4 * 3.321928));
    // bright stars by their light; the faint ones the eye can just see, as a dim floor that ends near magnitude 8
    const a = vary(min(float(1), b.mul(1.4)).add(float(0.045).mul(float(1).sub(smoothstep(6.0, 8.3, m)))));
    mat.sizeNode = clamp(float(1.6).add(sqrt(b).mul(2.6)), 1.6, 7).mul(2.2).mul(pxr);
    mat.colorNode = vec4(C.mul(a).mul(fall).mul(starGain).mul(gain), 1);
    return mat;
  }

  // the colour of a star from its B-V index, as the sky's
  function bv(b: number): [number, number, number] {
    const c = Math.max(-0.4, Math.min(2, b));
    const T = 4600 * (1 / (0.92 * c + 1.7) + 1 / (0.92 * c + 0.62));
    const t = T / 100;
    let r = t <= 66 ? 255 : 329.698727446 * Math.pow(t - 60, -0.1332047592);
    let g = t <= 66 ? 99.4708025861 * Math.log(t) - 161.1195681661 : 288.1221695283 * Math.pow(t - 60, -0.0755148492);
    let bl = t >= 66 ? 255 : t <= 19 ? 0 : 138.5177312231 * Math.log(t - 10) - 305.0447927307;
    r = Math.min(255, Math.max(0, r)); g = Math.min(255, Math.max(0, g)); bl = Math.min(255, Math.max(0, bl));
    const mx = Math.max(r, g, bl);
    return [0.55 + 0.45 * r / mx, 0.55 + 0.45 * g / mx, 0.55 + 0.45 * bl / mx];
  }

  // the Sun as a star, for when it is too far away to be a disc
  const sunGain = u1(0);
  points(1, starMaterial(new Float32Array([0, 0, 0, 4.83]), new Float32Array(bv(0.65)), sunGain), -9, sunGain);

  const starsGain = u1(1);
  let stars: THREE.Sprite | null = null;
  let starNames: { i: number; name: string; p: V3; M: number }[] = [];
  const ready: Promise<unknown>[] = [];
  const starsBuf = fetch('/data/deep/stars.bin').then((r) => r.arrayBuffer());
  ready.push(Promise.all([starsBuf, fetch('/data/deep/stars.json').then((r) => r.json())]).then(([buf, names]: [ArrayBuffer, [number, string][]]) => {
    const f = new Float32Array(buf);
    const n = f.length / 5;
    const pos = new Float32Array(n * 4), col = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      pos[i * 4] = f[i * 5]; pos[i * 4 + 1] = f[i * 5 + 1]; pos[i * 4 + 2] = f[i * 5 + 2]; pos[i * 4 + 3] = f[i * 5 + 3];
      const c = bv(f[i * 5 + 4]);
      col[i * 3] = c[0]; col[i * 3 + 1] = c[1]; col[i * 3 + 2] = c[2];
    }
    stars = points(n, starMaterial(pos, col, starsGain), -10);
    starNames = names.map(([i, name]) => ({ i, name, p: [f[i * 5], f[i * 5 + 1], f[i * 5 + 2]] as V3, M: f[i * 5 + 3] }));
  }));

  // ---- the constellation figures (d3-celestial's lines, BSD 3-Clause), drawn between the stars' real places,
  // so from the Earth they are the familiar figures and from anywhere else they come apart
  const figGain = u1(0);
  let figures: THREE.LineSegments | null = null;
  let figNames: { name: string; stars: V3[] }[] = [];
  ready.push(Promise.all([starsBuf, fetch('/data/deep/constellations.json').then((r) => r.json())]).then(([buf, cons]: [ArrayBuffer, { id: string; name: string; lines: [number, number][] }[]]) => {
    const f = new Float32Array(buf);
    const at = (i: number): V3 => [f[i * 5], f[i * 5 + 1], f[i * 5 + 2]];
    let n = 0;
    for (const c of cons) n += c.lines.length;
    const pos = new Float32Array(n * 6);
    let k = 0;
    for (const c of cons) {
      const seen = new Set<number>();
      for (const [i, j] of c.lines) {
        const a = at(i), b = at(j);
        pos.set(a, k); pos.set(b, k + 3); k += 6;
        seen.add(i); seen.add(j);
      }
      figNames.push({ name: c.name, stars: [...seen].map(at) });
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const mat = new THREE.LineBasicNodeMaterial({ transparent: true, depthTest: false, depthWrite: false, blending: THREE.AdditiveBlending });
    const rel = (positionGeometry as unknown as N3).sub(camPc);
    mat.positionNode = rel.div(max(length(rel), float(2e-5))).mul(FAR);
    mat.colorNode = vec4(vec3(0.42, 0.55, 0.72).mul(figGain).mul(starGain), 1);
    figures = new THREE.LineSegments(g, mat);
    figures.frustumCulled = false;
    figures.renderOrder = -11;
    figures.visible = false;
    root.add(figures);
  }));

  // ---- soft clouds of light (galaxy models): surface brightness stays the same with distance once
  // a point is wider than a pixel or two, and falls with the square of the distance once it is not
  function cloudMaterial(pos: Float32Array, col: Float32Array, gain: N1, exposure: number, dark = false) {
    const mat = new THREE.PointsNodeMaterial({ transparent: true, depthTest: false, depthWrite: false, blending: dark ? THREE.NormalBlending : THREE.AdditiveBlending, sizeAttenuation: false });
    const P = attr4(pos);
    const C = attr4(col);
    const rel = P.xyz.sub(camPc);
    const d = max(length(rel), float(1e-3));
    mat.positionNode = rel.div(d).mul(FAR);
    const px = P.w.div(d).mul(pxPerRad); // the point's radius on screen
    const s = max(px, float(1.2));
    // fade points the camera is inside or close to, so nothing swells to fill the screen
    const near = smoothstep(P.w.mul(1.5), P.w.mul(6), d);
    // flux would fall as k squared once a point is smaller than a pixel; easing that to k^1.2 keeps a
    // distant galaxy visible as more than a grey speck (a choice for the eye, not physics)
    const k = px.div(s);
    const kk = k.pow(1.2);
    mat.sizeNode = min(s.mul(2), float(320)).mul(pxr);
    if (dark) {
      const op = vary(C.w.mul(k).mul(near).mul(gain));
      mat.colorNode = vec4(C.xyz, op.mul(softFall));
    } else {
      const lum = vary(C.w.mul(exposure).mul(kk).mul(near).mul(gain));
      mat.colorNode = vec4(C.xyz.mul(lum).mul(softFall), 1);
    }
    return mat;
  }

  // ---- the Milky Way: a model, in galactocentric coordinates with the Sun at (-R0, 0, 0)
  const galGain = u1(0);
  const nMW = o.particles;
  const exposureFor = (n: number, base: number) => base * (150_000 / n);
  {
    const ARM0 = 3400; // the arms start at the ends of the bar
    const mw = makeSpiral({
      seed: 7, n: nMW, scaleLen: 2600, rMax: 16000, height: 300, pitchDeg: 12.5, armWidth: 420,
      // four arms, two from the ends of the bar, and the Sun's own short Local arm. In this frame the
      // Sun is at (R0, 0), the Galaxy turns clockwise seen from the north, and the arms trail.
      arms: [
        { theta0: (330 * Math.PI) / 180, r0: ARM0, rMax: 16000, weight: 1 },
        { theta0: (150 * Math.PI) / 180, r0: ARM0, rMax: 16000, weight: 1 },
        { theta0: (60 * Math.PI) / 180, r0: ARM0, rMax: 15000, weight: 0.8 },
        { theta0: (240 * Math.PI) / 180, r0: ARM0, rMax: 15000, weight: 0.8 },
        { theta0: -Math.log(8400 / 6500) / Math.tan((12.5 * Math.PI) / 180), r0: 6500, rMax: 10500, weight: 0.4, span: [(-35 * Math.PI) / 180, (30 * Math.PI) / 180] },
      ],
      // the long bar, about 5 kpc from end to middle, its near end 30° from the line to the centre at positive longitude
      bar: { angleDeg: -30, half: 5000, width: 800, thick: 400 },
      bulge: 900, bulgeShare: 0.16,
    });
    // the model's x runs from the centre towards the Sun and its z to the north galactic pole
    // (a half turn of the galactic x and y about z, so it stays right-handed)
    const ex = scale(GAL_X, -1), ey = scale(GAL_Y, -1);
    const light = place(mw.light, ex, ey, GAL_CENTRE);
    const dust = place(mw.dust, ex, ey, GAL_CENTRE);
    points(light.length / 4, cloudMaterial(light, new Float32Array(mw.light.col), galGain, exposureFor(nMW, 0.02)), -15, galGain);
    points(dust.length / 4, cloudMaterial(dust, new Float32Array(mw.dust.col), galGain, 1, true), -14, galGain);
  }

  // ---- the Local Group
  const lgGain = u1(0);
  type LG = { name: string; type: string | null; p: V3; ra: number; dec: number; kpc: number; mv?: number; rh?: number; pa?: number; ell?: number };
  let lg: LG[] = [];
  ready.push(fetch('/data/deep/local-group.json').then((r) => r.json()).then((j: { galaxies: LG[] }) => {
    lg = j.galaxies;
    const by = (n: string) => lg.find((g) => g.name === n);
    const pos: number[] = [], col: number[] = [];
    const add4 = (a: Float32Array, c: number[]) => { for (let i = 0; i < a.length; i++) { pos.push(a[i]); col.push(c[i]); } };
    // Andromeda (M31): position angle 38°, tilted 77° (Walterbos and Kennicutt 1987); larger than ours, with its ring of stars at 10 kpc
    const m31 = by('Andromeda');
    if (m31) {
      const sp = makeSpiral({ seed: 31, n: Math.round(nMW * 0.45), scaleLen: 5300, rMax: 26000, height: 400, pitchDeg: 7, armWidth: 700,
        arms: [{ theta0: 0, r0: 5000, rMax: 24000, weight: 1 }, { theta0: Math.PI, r0: 5000, rMax: 24000, weight: 1 }],
        bulge: 1500, bulgeShare: 0.2 });
      const [ex, ey] = discAxes(m31.ra, m31.dec, 38, 77);
      const a = place(sp.light, ex, ey, m31.p);
      add4(a, sp.light.col);
    }
    // Triangulum (M33): position angle 23°, tilt from its ellipticity
    const m33 = by('Triangulum');
    if (m33) {
      const sp = makeSpiral({ seed: 33, n: Math.round(nMW * 0.12), scaleLen: 1600, rMax: 8000, height: 200, pitchDeg: 20, armWidth: 350,
        arms: [{ theta0: 0, r0: 900, rMax: 8000, weight: 1 }, { theta0: Math.PI, r0: 900, rMax: 8000, weight: 1 }],
        bulge: 300, bulgeShare: 0.05 });
      const [ex, ey] = discAxes(m33.ra, m33.dec, m33.pa ?? 23, (Math.acos(1 - (m33.ell ?? 0.41)) * 180) / Math.PI);
      add4(place(sp.light, ex, ey, m33.p), sp.light.col);
    }
    // the Magellanic Clouds: lumpy, barred
    const lmc = by('LMC'), smc = by('SMC');
    if (lmc) { const [ex, ey] = discAxes(lmc.ra, lmc.dec, 170, 30); const c = makeIrregular(51, Math.round(nMW * 0.06), 2800, 900); add4(place(c, ex, ey, lmc.p), c.col); }
    if (smc) { const [ex, ey] = discAxes(smc.ra, smc.dec, 45, 60); const c = makeIrregular(64, Math.round(nMW * 0.025), 1600, 500); add4(place(c, ex, ey, smc.p), c.col); }
    // the rest, one soft glow each: as wide as twice their half-light radius, as bright as measured
    for (const g of lg) {
      if (['Andromeda', 'Triangulum', 'LMC', 'SMC'].includes(g.name) || g.mv === undefined) continue;
      const size = Math.max(60, (g.rh ?? 300) * 1.6);
      const L = Math.pow(10, -0.4 * (g.mv + 18));
      const young = /Irr/.test(g.type ?? '');
      pos.push(g.p[0], g.p[1], g.p[2], size);
      col.push(young ? 0.78 : 1, young ? 0.84 : 0.86, young ? 1 : 0.72, L);
    }
    const P = new Float32Array(pos);
    points(P.length / 4, cloudMaterial(P, new Float32Array(col), lgGain, exposureFor(nMW, 0.02)), -13, lgGain);
  }));

  // ---- the 2MASS Redshift Survey: forty thousand galaxies, each a point of light
  const webGain = u1(0);
  ready.push(fetch('/data/deep/2mrs.bin').then((r) => r.arrayBuffer()).then((buf) => {
    const f = new Float32Array(buf);
    const n = f.length / 4;
    const mat = new THREE.PointsNodeMaterial({ transparent: true, depthTest: false, depthWrite: false, blending: THREE.AdditiveBlending, sizeAttenuation: false });
    const P = attr4(f);
    const rel = P.xyz.sub(camPc);
    const d = max(length(rel), float(1));
    mat.positionNode = rel.div(d).mul(FAR);
    // brighter galaxies a little brighter, but every one visible, so the web shows; dimmer far off
    const L = clamp(exp2(P.w.add(23).mul(-0.4 * 3.321928)).pow(0.3), 0.35, 1.6);
    const a = vary(L.mul(clamp(float(1.5e8).div(d), 0.3, 1)).mul(0.3).mul(webGain));
    mat.sizeNode = float(2.3).mul(pxr);
    mat.colorNode = vec4(vec3(1, 0.86, 0.72).mul(a).mul(fall), 1);
    points(n, mat, -12, webGain);
  }));

  // ---- the oldest light: a sphere round the Sun, 46 billion light years out (scaled to fit the layer)
  const cmbGain = u1(0);
  const cmbTex = new THREE.TextureLoader().load('/textures/cmb_wmap9.webp');
  cmbTex.colorSpace = THREE.SRGBColorSpace;
  const cmbMat = new THREE.MeshBasicNodeMaterial({ transparent: true, depthTest: false, depthWrite: false, side: THREE.FrontSide });
  cmbMat.colorNode = vec4(texture(cmbTex).rgb, 1);
  cmbMat.opacityNode = cmbGain;
  const cmb = new THREE.Mesh(new THREE.SphereGeometry(1, 96, 48), cmbMat);
  cmb.frustumCulled = false;
  cmb.renderOrder = -30;
  cmb.visible = false;
  root.add(cmb);

  // ---- the Kuiper belt and the Oort cloud: models, as nobody has seen more than a few of their bodies
  const kuiperGain = u1(0), oortGain = u1(0);
  {
    const R = rng(11);
    const AUpc = 1 / 206_264.806;
    const dots = (n: number, place: () => V3, gain: N1, colour: [number, number, number], bright: number) => {
      const pos = new Float32Array(n * 4);
      for (let i = 0; i < n; i++) { const q = place(); pos[i * 4] = q[0]; pos[i * 4 + 1] = q[1]; pos[i * 4 + 2] = q[2]; pos[i * 4 + 3] = 0.5 + R.next(); }
      const mat = new THREE.PointsNodeMaterial({ transparent: true, depthTest: false, depthWrite: false, blending: THREE.AdditiveBlending, sizeAttenuation: false });
      const P = attr4(pos);
      const rel = P.xyz.sub(camPc);
      mat.positionNode = rel.div(max(length(rel), float(1e-9))).mul(FAR);
      mat.sizeNode = float(2.2).mul(pxr);
      mat.colorNode = vec4(vec3(...colour).mul(P.w.mul(bright)).mul(gain).mul(fall), 1);
      points(n, mat, -11, gain as unknown as { value: number });
    };
    // ecliptic-ish: the engine's y is ecliptic north
    const ring = (r: number, incl: number): V3 => {
      const th = R.next() * 2 * Math.PI;
      const z = Math.sin(incl * R.gauss()) * r;
      return [r * Math.cos(th) * AUpc, z * AUpc, r * Math.sin(th) * AUpc];
    };
    // the classical belt, 30 to 50 au, with most bodies near 42 to 47 au and a modest spread of tilts
    dots(Math.round(o.particles * 0.03), () => ring(R.next() < 0.6 ? 42 + R.next() * 5 : 30 + R.next() * 20, 0.17), kuiperGain, [0.75, 0.8, 0.9], 0.35);
    // the Oort cloud: an inner, flattened Hills cloud from 2,000 to 20,000 au, and a round outer cloud to 100,000 au
    const sphere = (r: number, flat: number): V3 => {
      const ct = 2 * R.next() - 1, ph = R.next() * 2 * Math.PI, st = Math.sqrt(1 - ct * ct);
      return [r * st * Math.cos(ph) * AUpc, r * ct * flat * AUpc, r * st * Math.sin(ph) * AUpc];
    };
    dots(Math.round(o.particles * 0.08), () => (R.next() < 0.35 ? sphere(2000 * Math.pow(10, R.next()), 0.45) : sphere(20_000 * Math.pow(5, R.next()), 1)), oortGain, [0.7, 0.78, 0.92], 0.28);
  }

  // ---- names
  const labels = document.createElement('div');
  labels.className = 'deep-labels';
  labels.setAttribute('aria-hidden', 'true');
  Object.assign(labels.style, { position: 'fixed', inset: '0', pointerEvents: 'none', overflow: 'hidden', zIndex: '0' });
  // just above the 3D view and below everything else on the page
  o.labelsAfter.after(labels);
  const pool: HTMLSpanElement[] = [];
  const tagStyle = 'position:absolute;left:0;top:0;white-space:nowrap;font:400 .62rem/1 var(--mono, monospace);letter-spacing:.08em;color:rgba(236,231,220,.72);padding-left:12px;will-change:transform;text-shadow:0 0 3px #000,0 0 6px #000;background:radial-gradient(circle at 4px 50%,transparent 2.4px,rgba(236,231,220,.55) 2.9px,transparent 3.6px) no-repeat;';

  const ringBg = 'radial-gradient(circle at 4px 50%,transparent 2.4px,rgba(236,231,220,.55) 2.9px,transparent 3.6px)';
  const v = new THREE.Vector3();
  const invQ = new THREE.Quaternion();
  let shown = 0;
  const placed: [number, number, number][] = [];
  function tag(text: string, dir: V3, alpha: number, view: DeepView, kind = '') {
    if (alpha <= 0.02 || shown >= 28) return;
    v.set(dir[0], dir[1], dir[2]).applyQuaternion(invQ);
    if (v.z >= -1e-6) return; // behind the camera
    const t = Math.tan(THREE.MathUtils.degToRad(view.fovDeg / 2));
    let x = (v.x / -v.z / (t * (view.widthPx / view.heightPx)) + 1) / 2 * view.widthPx;
    const y = (1 - v.y / -v.z / t) / 2 * view.heightPx;
    if (x < -50 || x > view.widthPx + 10 || y < -10 || y > view.heightPx + 10) return;
    // never let two names touch: the earlier (more important) one wins
    const w = text.length * (kind === 'constellation' ? 7.6 : 6.4) + 14;
    if (kind === 'constellation') x -= w / 2;
    for (const r of placed) if (x < r[0] + r[2] && x + w > r[0] && Math.abs(y - r[1]) < 13) return;
    placed.push([x, y, w]);
    let el = pool[shown];
    if (!el) { el = document.createElement('span'); el.style.cssText = tagStyle; labels.appendChild(el); pool.push(el); }
    if (el.textContent !== text) el.textContent = text;
    el.style.opacity = String(Math.min(1, alpha));
    el.style.transform = `translate(${(x - 4).toFixed(1)}px, ${(y - 5).toFixed(1)}px)`;
    el.style.display = '';
    if (el.dataset.kind !== kind) {
      // a constellation is an area, not a point: no ring, and a cooler, spaced-out name
      const fig = kind === 'constellation';
      el.style.backgroundImage = fig ? 'none' : ringBg;
      el.style.color = fig ? 'rgba(160,185,215,.7)' : 'rgba(236,231,220,.72)';
      el.style.letterSpacing = fig ? '.22em' : '.08em';
      el.style.textTransform = fig ? 'uppercase' : 'none';
      el.style.paddingLeft = fig ? '0' : '12px';
    }
    el.dataset.kind = kind;
    shown++;
  }

  const mwCentreLabel = GAL_CENTRE;
  const lgMid = (): V3 | null => { const m = lg.find((g) => g.name === 'Andromeda'); return m ? scale(add(GAL_CENTRE, m.p), 0.5) : null; };

  /** each frame, from the camera (metres from the Sun) */
  function update(view: DeepView) {
    const c: V3 = [view.cam[0] / PC, view.cam[1] / PC, view.cam[2] / PC];
    camPc.value.set(c[0], c[1], c[2]);
    pxPerRad.value = view.heightPx / (2 * Math.tan(THREE.MathUtils.degToRad(view.fovDeg / 2)));
    starGain.value = view.starGain;
    const dS = len(c); // pc from the Sun
    const AUpc = 1 / 206_264.806;
    // the Sun becomes a star between 1,000 and 3,000 au
    sunGain.value = smooth(1000 * AUpc, 3000 * AUpc, dS);
    kuiperGain.value = smooth(6 / 206_264.806, 25 / 206_264.806, dS) * (1 - smooth(1500 / 206_264.806, 6000 / 206_264.806, dS));
    oortGain.value = smooth(300 / 206_264.806, 3000 / 206_264.806, dS) * (1 - smooth(1.5, 6, dS));
    // the model of our galaxy, and the Local Group, take over from the painted Milky Way between 300 pc and 3 kpc out
    const out = smooth(300, 3000, dS);
    galGain.value = out;
    lgGain.value = out;
    // the galaxy survey comes in once the Local Group is behind you
    webGain.value = smooth(1.5e6, 6e6, dS);
    // the oldest light shows only from far outside everything else
    const cm = smooth(5e9, 1.6e10, dS);
    cmbGain.value = cm * 0.9;
    cmb.visible = cm > 0.001;
    if (cmb.visible) {
      // scale the sphere and its offset together so the farthest point sits at the layer's distance
      const s = FAR / (dS + CMB_PC);
      cmb.position.set(-c[0] * s, -c[1] * s, -c[2] * s);
      cmb.scale.setScalar(CMB_PC * s);
      cmbMat.side = dS > CMB_PC ? THREE.FrontSide : THREE.BackSide;
    }
    if (stars) stars.visible = dS < 2e5;
    // the figures from beyond the planets, fading as they come apart and gone once the stars around you are a cloud
    figGain.value = smooth(150 * AUpc, 2000 * AUpc, dS) * (0.04 + 0.13 * (1 - smooth(1, 12, dS))) * (1 - smooth(60, 250, dS));
    if (figures) figures.visible = figGain.value > 0.002;
    for (const x of gated) x.s.visible = x.g.value > 0.002;

    // ---- names
    shown = 0;
    placed.length = 0;
    invQ.copy(view.quaternion).invert();
    const rel = (p: V3): V3 => [p[0] - c[0], p[1] - c[1], p[2] - c[2]];
    // the Sun, once it is a star
    tag('The Sun', rel([0, 0, 0]), sunGain.value * (1 - smooth(2e4, 1e5, dS)), view, 'sun');
    for (const e of view.extra ?? []) tag(e.text, e.dir, e.alpha, view, 'body');
    // the Sun's neighbours by name, faint or not, while you are among them
    const neighbours = smooth(0.3, 1.5, dS) * (1 - smooth(60, 150, dS));
    const reach = Math.max(4, dS * 0.9);
    if (neighbours > 0.01 && starNames.length) {
      const near = starNames.filter((s) => len(s.p) < reach).sort((a, b) => len(a.p) - len(b.p)).slice(0, 14);
      for (const s of near) tag(s.name, rel(s.p), neighbours, view, 'star');
    }
    // otherwise the brightest named stars, once you are out among them
    const starsOn = smooth(0.02, 0.2, dS) * (1 - smooth(3000, 8000, dS)) * (1 - neighbours);
    if (starsOn > 0.01 && starNames.length) {
      const scored: { name: string; d: V3; m: number }[] = [];
      for (const s of starNames) {
        const r = rel(s.p);
        const dd = Math.max(1e-5, len(r));
        const m = s.M + 5 * Math.log10(dd / 10);
        if (m < 2.2) scored.push({ name: s.name, d: r, m });
      }
      scored.sort((a, b) => a.m - b.m);
      for (const s of scored.slice(0, 12)) tag(s.name, s.d, starsOn * (1 - smooth(0.5, 2.2, s.m)) + 0.25 * starsOn, view, 'star');
    }
    // the constellations' names, while the figures still look like themselves
    const figOn = smooth(150 * AUpc, 2000 * AUpc, dS) * (1 - smooth(1, 4, dS));
    if (figOn > 0.02 && figNames.length) {
      for (const fg of figNames) {
        let x = 0, y = 0, z = 0;
        for (const p of fg.stars) { const r = norm(rel(p)); x += r[0]; y += r[1]; z += r[2]; }
        tag(fg.name, [x, y, z], figOn * 0.8, view, 'constellation');
      }
    }
    // our galaxy and its neighbours
    tag('The Milky Way', rel(mwCentreLabel), smooth(1.2e4, 3e4, dS) * (1 - smooth(4e6, 2e7, dS)), view, 'galaxy');
    if (lg.length) {
      for (const n of ['Andromeda', 'Triangulum', 'LMC', 'SMC']) {
        const g = lg.find((x) => x.name === n);
        if (!g) continue;
        const name = n === 'LMC' ? 'Large Magellanic Cloud' : n === 'SMC' ? 'Small Magellanic Cloud' : n === 'Andromeda' ? 'Andromeda' : 'Triangulum';
        const small = n === 'LMC' || n === 'SMC';
        tag(name, rel(g.p), out * (1 - smooth(small ? 4e5 : 4e6, small ? 1.5e6 : 2e7, dS)) * (small ? smooth(1e4, 2.5e4, dS) : 1), view, 'galaxy');
      }
      const mid = lgMid();
      if (mid) tag('The Local Group', rel(mid), smooth(6e6, 1.5e7, dS) * (1 - smooth(4e8, 1.5e9, dS)), view, 'group');
    }
    const webOn = smooth(8e6, 3e7, dS) * (1 - smooth(3e9, 8e9, dS));
    if (webOn > 0.01) for (const k of CLUSTERS) tag(k.name, rel(scale(radecToEngine(k.ra, k.dec), (k.cz / 70) * 1e6)), webOn, view, 'cluster');
    // named at the sphere's top edge as you see it
    const up = new THREE.Vector3(0, 1, 0).applyQuaternion(view.quaternion);
    const toSun = norm(scale(c, -1));
    const limbDir = norm(add(scale([up.x, up.y, up.z], 1), scale(toSun, -(up.x * toSun[0] + up.y * toSun[1] + up.z * toSun[2]))));
    tag('The oldest light, from 46 billion light years away', rel(scale(limbDir, CMB_PC * 1.02)), cm * 0.9, view, 'cmb');
    tag('We are here', rel([0, 0, 0]), smooth(4e9, 1.2e10, dS), view, 'here');
    for (let i = shown; i < pool.length; i++) if (pool[i].style.display !== 'none') pool[i].style.display = 'none';
  }

  if (new URLSearchParams(location.search).has('debug')) (globalThis as unknown as { __deep: unknown }).__deep = { gated, root, gains: { galGain, lgGain, webGain, cmbGain } };

  function dispose() { root.removeFromParent(); labels.remove(); }

  const settled = Promise.allSettled(ready).then((r) => { for (const x of r) if (x.status === 'rejected') console.error('part of the sky beyond the Solar System could not be drawn', x.reason); return r; });
  return { update, ready: settled, dispose, lgCentre: lgMid };
}

function smooth(a: number, b: number, x: number) {
  const t = Math.max(0, Math.min(1, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
}

export type Deep = ReturnType<typeof createDeep>;
