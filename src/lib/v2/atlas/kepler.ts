import type { KeplerOrbit } from './types';
import { moonPosition } from './lunar';

/**
 * Where a moon (or any body with orbital elements) is, relative to its parent.
 *
 * Moons use orbits fitted to JPL Horizons over 2000 to 2040 (scripts/data/fit-moon-orbits.py):
 * a slowly turning ellipse. Each orbit carries `fit`, its typical and worst error in degrees as
 * seen from the planet. Good for drawing where a moon is, not for navigation.
 * Earth's Moon is the exception: it strays too far from an ellipse, so it has its own theory (lunar.ts).
 *
 * Output: kilometres, in the ecliptic and equinox of J2000 (x to the March equinox, z north).
 */

const RAD = Math.PI / 180;
const OBLIQUITY = 23.4392911 * RAD; // of the ecliptic at J2000

/**
 * Spin poles (ICRF right ascension and declination, degrees), from the IAU WGCCRE 2015 report.
 * These are the poles the 'parent-equator' orbits are measured from: the end of the axis the
 * planet turns anticlockwise about. For Uranus that is the opposite end from the IAU's "north".
 */
export const POLES: Record<string, { raDeg: number; decDeg: number }> = {
  mercury: { raDeg: 281.0103, decDeg: 61.4155 },
  venus: { raDeg: 272.76, decDeg: 67.16 },
  earth: { raDeg: 0, decDeg: 90 },
  mars: { raDeg: 317.681, decDeg: 52.887 },
  jupiter: { raDeg: 268.057, decDeg: 64.495 },
  saturn: { raDeg: 40.589, decDeg: 83.537 },
  uranus: { raDeg: 77.311, decDeg: 15.175 },
  neptune: { raDeg: 299.36, decDeg: 43.46 },
  pluto: { raDeg: 132.993, decDeg: -6.163 },
};

type Vec = [number, number, number];
type Basis = { x: Vec; y: Vec; z: Vec };

const ECLIPTIC: Basis = { x: [1, 0, 0], y: [0, 1, 0], z: [0, 0, 1] };

/** Axes of a reference plane given by its pole (ICRF), expressed in ecliptic coordinates. */
function planeFromPole(raDeg: number, decDeg: number): Basis {
  const ra = raDeg * RAD, dec = decDeg * RAD;
  // pole, and the plane's ascending node on the ICRF equator (the direction node angles start from)
  const zq: Vec = [Math.cos(dec) * Math.cos(ra), Math.cos(dec) * Math.sin(ra), Math.sin(dec)];
  const xq: Vec = [-Math.sin(ra), Math.cos(ra), 0];
  const yq: Vec = [zq[1] * xq[2] - zq[2] * xq[1], zq[2] * xq[0] - zq[0] * xq[2], zq[0] * xq[1] - zq[1] * xq[0]];
  const c = Math.cos(OBLIQUITY), s = Math.sin(OBLIQUITY);
  const toEcl = (v: Vec): Vec => [v[0], c * v[1] + s * v[2], -s * v[1] + c * v[2]];
  return { x: toEcl(xq), y: toEcl(yq), z: toEcl(zq) };
}

const planes = new Map<string, Basis>();
function planeOf(o: KeplerOrbit, parent: string): Basis {
  if (o.frame === 'ecliptic-j2000') return ECLIPTIC;
  const pole = o.frame === 'laplace' ? o.framePole : POLES[parent];
  if (!pole) return ECLIPTIC;
  const key = `${pole.raDeg},${pole.decDeg}`;
  let b = planes.get(key);
  if (!b) { b = planeFromPole(pole.raDeg, pole.decDeg); planes.set(key, b); }
  return b;
}

/** The orbit's three angles at a date (radians). */
function anglesAt(o: KeplerOrbit, jd: number) {
  const days = jd - o.epochJd;
  const r = o.rates;
  const node = o.nodeDeg + (r ? r.nodeDegPerDay * days : 0);
  const peri = o.periDeg + (r ? r.periDegPerDay * days : 0);
  let m = o.mDeg + (r ? r.mDegPerDay : 360 / o.periodDays) * days;
  if (o.wobble) {
    const w = o.wobble;
    for (let k = 0; k < w.terms.length; k++) m += w.terms[k].ampDeg * Math.sin(((360 * (k + 1) * days) / w.periodDays + w.terms[k].phaseDeg) * RAD);
  }
  return { node: node * RAD, peri: peri * RAD, m: (((m % 360) + 360) % 360) * RAD };
}

function solveKepler(m: number, e: number): number {
  let E = e < 0.8 ? m : Math.PI;
  for (let k = 0; k < 12; k++) {
    const d = (E - e * Math.sin(E) - m) / (1 - e * Math.cos(E));
    E -= d;
    if (Math.abs(d) < 1e-12) break;
  }
  return E;
}

function place(o: KeplerOrbit, B: Basis, node: number, peri: number, E: number, out: Vec): Vec {
  const i = o.iDeg * RAD;
  // in the orbit's own plane, x toward periapsis
  const px = o.aKm * (Math.cos(E) - o.e), py = o.aKm * Math.sqrt(1 - o.e * o.e) * Math.sin(E);
  const cw = Math.cos(peri), sw = Math.sin(peri), cn = Math.cos(node), sn = Math.sin(node), ci = Math.cos(i), si = Math.sin(i);
  const x = (cn * cw - sn * sw * ci) * px + (-cn * sw - sn * cw * ci) * py;
  const y = (sn * cw + cn * sw * ci) * px + (-sn * sw + cn * cw * ci) * py;
  const z = sw * si * px + cw * si * py;
  out[0] = B.x[0] * x + B.y[0] * y + B.z[0] * z;
  out[1] = B.x[1] * x + B.y[1] * y + B.z[1] * z;
  out[2] = B.x[2] * x + B.y[2] * y + B.z[2] * z;
  return out;
}

/** Position relative to the parent at a Julian date (TDB), km, ecliptic J2000. */
export function keplerPosition(o: KeplerOrbit, parent: string, jd: number, out: Vec = [0, 0, 0]): Vec {
  if (o.theory === 'moon') return moonPosition(jd, out);
  const a = anglesAt(o, jd);
  return place(o, planeOf(o, parent), a.node, a.peri, solveKepler(a.m, o.e), out);
}

/**
 * The whole orbit as it lies at a date: `n` points round it, km, ecliptic J2000, flat xyz.
 * For Earth's Moon the points are its real track around the date; redraw it every few days.
 */
export function keplerPath(o: KeplerOrbit, parent: string, jd: number, n = 128): Float64Array {
  const out = new Float64Array(n * 3), p: Vec = [0, 0, 0];
  if (o.theory === 'moon') {
    // the Moon's real track for the half month either side of the date, so the Moon always sits on
    // its own line. A month later it is not quite back where it began (by up to 20,000 km), so the
    // far third of the ring, opposite the Moon, is eased over to make the two ends meet.
    const a: Vec = [0, 0, 0], b: Vec = [0, 0, 0];
    moonPosition(jd - 0.5 * o.periodDays, a);
    moonPosition(jd + 0.5 * o.periodDays, b);
    for (let k = 0; k < n; k++) {
      const u = k / n - 0.5;
      moonPosition(jd + u * o.periodDays, p);
      const x = Math.max(0, (Math.abs(u) - 0.35) / 0.15), w = -Math.sign(u) * 0.5 * x * x * (3 - 2 * x);
      out[k * 3] = p[0] + w * (b[0] - a[0]); out[k * 3 + 1] = p[1] + w * (b[1] - a[1]); out[k * 3 + 2] = p[2] + w * (b[2] - a[2]);
    }
    return out;
  }
  const a = anglesAt(o, jd), B = planeOf(o, parent);
  for (let k = 0; k < n; k++) {
    place(o, B, a.node, a.peri, (k / n) * 2 * Math.PI, p);
    out[k * 3] = p[0]; out[k * 3 + 1] = p[1]; out[k * 3 + 2] = p[2];
  }
  return out;
}

/** Julian date (the difference between UTC and TDB, about a minute, does not matter here). */
export const julianDate = (d: Date) => d.getTime() / 86_400_000 + 2_440_587.5;

/**
 * Ecliptic coordinates (x to the March equinox, z to ecliptic north) to the engine's frame
 * (y up): the same turn as eclToWorld() in the engine's vec.ts.
 */
export function eclToEngine(x: number, y: number, z: number, out: Vec = [0, 0, 0]): Vec {
  out[0] = x; out[1] = z; out[2] = -y;
  return out;
}
