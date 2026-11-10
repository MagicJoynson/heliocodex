// Drawing the atlas plates: bodies in, SVG numbers out.
//
// Everything here is a pure function of the body list and a date. No three.js and no DOM, so the
// same code draws a plate at build time, moves the dots in the browser, and runs in a node test.
//
// A plate looks straight down on a planet's north pole. The page's x axis is the equator's x axis
// (see equatorBasis) and the page's y axis is flipped, because SVG counts downwards. So a moon
// going the usual way round moves anticlockwise on the page, as it would on a printed chart.
import type { KeplerOrbit } from './types';
import { equatorBasis, keplerPath, keplerPosition } from './kepler';

export interface Plate {
  parent: string;
  /** Distance from the centre to the edge of the drawing, km. */
  spanKm: number;
  /** The same distance in drawing units. The drawing runs from -half to +half both ways. */
  half: number;
  kmPerUnit: number;
  /** Ecliptic J2000 kilometres from the planet's centre to a place on the page. */
  project(x: number, y: number, z: number): [number, number];
  /** Where the planet (or the Sun) itself is on the page: the middle, unless the drawing is off-centre. */
  origin: [number, number];
}

/** Which way is up: the planet's own north pole (for its close moons), or the north of the plane of the planets. */
export type ViewFrom = 'equator' | 'ecliptic';
const ECLIPTIC = { x: [1, 0, 0], y: [0, 1, 0], z: [0, 0, 1] };

/**
 * `centreKm` moves the middle of the drawing away from the parent, for lopsided families: how far
 * to the right and how far down the page the middle lies, in km.
 */
export function topView(parent: string, spanKm: number, half = 440, from: ViewFrom = 'equator', centreKm: [number, number] = [0, 0]): Plate {
  const B = from === 'ecliptic' ? ECLIPTIC : equatorBasis(parent);
  const k = half / spanKm, ox = -centreKm[0] * k, oy = -centreKm[1] * k;
  return {
    parent, spanKm, half, kmPerUnit: spanKm / half, origin: [ox, oy],
    project: (x, y, z) => [ox + (B.x[0] * x + B.x[1] * y + B.x[2] * z) * k, oy - (B.y[0] * x + B.y[1] * y + B.y[2] * z) * k],
  };
}

const r1 = (v: number) => (Math.round(v * 10) / 10).toString();

/** The orbit as it lies at a date, as page points. */
export function orbitPoints(p: Plate, o: KeplerOrbit, jd: number, n = 180): [number, number][] {
  const path = keplerPath(o, p.parent, jd, n);
  const out: [number, number][] = [];
  for (let k = 0; k < n; k++) out.push(p.project(path[k * 3], path[k * 3 + 1], path[k * 3 + 2]));
  return out;
}

/** The orbit as the `d` of a closed SVG path. */
export function orbitD(p: Plate, o: KeplerOrbit, jd: number, n = 180, whole = false): string {
  const f = whole ? (v: number) => Math.round(v).toString() : r1;
  return 'M' + orbitPoints(p, o, jd, n).map(([x, y]) => `${f(x)} ${f(y)}`).join('L') + 'Z';
}

/** Where the body is on the page at a date. */
export function dotAt(p: Plate, o: KeplerOrbit, jd: number): [number, number] {
  const v = keplerPosition(o, p.parent, jd);
  return p.project(v[0], v[1], v[2]);
}

/**
 * A short piece of the orbit to set a name along, as an open SVG path that always runs left to
 * right so the name is never upside down. `atDeg` is where on the orbit the name sits, as a
 * bearing from the planet: 0 up the page, 90 to the right. `lengthUnits` is how long a piece to cut.
 */
export function labelArc(p: Plate, o: KeplerOrbit, jd: number, atDeg: number, lengthUnits: number): string {
  const n = 360;
  const pts = orbitPoints(p, o, jd, n);
  const want = ((atDeg % 360) + 360) % 360;
  let best = 0, gap = Infinity;
  for (let k = 0; k < n; k++) {
    const b = ((Math.atan2(pts[k][0] - p.origin[0], -(pts[k][1] - p.origin[1])) * 180) / Math.PI + 360) % 360;
    const d = Math.min(Math.abs(b - want), 360 - Math.abs(b - want));
    if (d < gap) { gap = d; best = k; }
  }
  const dist = (a: [number, number], b: [number, number]) => Math.hypot(a[0] - b[0], a[1] - b[1]);
  let lo = best, hi = best, len = 0;
  while (len < lengthUnits && hi - lo < n - 2) {
    len += dist(pts[(lo - 1 + n * 2) % n], pts[(lo + n * 2) % n]) + dist(pts[hi % n], pts[(hi + 1) % n]);
    lo--; hi++;
  }
  const piece: [number, number][] = [];
  for (let k = lo; k <= hi; k++) piece.push(pts[(k + n * 2) % n]);
  if (piece[0][0] > piece[piece.length - 1][0]) piece.reverse();
  return 'M' + piece.map(([x, y]) => `${r1(x)} ${r1(y)}`).join('L');
}

/** The place on an orbit that lies at a bearing from the planet (0 up the page, 90 to the right). */
export function pointAt(p: Plate, o: KeplerOrbit, jd: number, atDeg: number): [number, number] {
  const pts = orbitPoints(p, o, jd, 360), want = ((atDeg % 360) + 360) % 360;
  let best = pts[0], gap = Infinity;
  for (const pt of pts) {
    const b = ((Math.atan2(pt[0] - p.origin[0], -(pt[1] - p.origin[1])) * 180) / Math.PI + 360) % 360;
    const d = Math.min(Math.abs(b - want), 360 - Math.abs(b - want));
    if (d < gap) { gap = d; best = pt; }
  }
  return best;
}

/** A drawing shows the members of its families whose whole orbit, as drawn, fits inside it. */
export function fitsOn(p: Plate, o: KeplerOrbit, jd: number): boolean {
  return orbitPoints(p, o, jd, 90).every(([x, y]) => Math.abs(x) <= p.half && Math.abs(y) <= p.half);
}

/** The furthest any of these orbits reaches from the planet, km. */
export function reachKm(orbits: KeplerOrbit[]): number {
  return Math.max(...orbits.map((o) => o.aKm * (1 + o.e)));
}

/**
 * The tilt of an orbit, degrees. Close moons keep to their planet's equator, so theirs is measured
 * from that. Far-out moons are held by the Sun's pull to the plane of the planets instead, and
 * their orbits are given in that frame, so theirs is measured from it. (For Uranus, which lies on
 * its side, the two differ by 98 degrees.) Above 90 means the body goes round backwards.
 */
export function tiltDeg(o: KeplerOrbit, parent: string, jd: number): number {
  if (o.frame === 'ecliptic-j2000') return o.iDeg;
  const B = equatorBasis(parent);
  const pts = keplerPath(o, parent, jd, 4);
  const a = [pts[0], pts[1], pts[2]], b = [pts[3], pts[4], pts[5]];
  const nx = a[1] * b[2] - a[2] * b[1], ny = a[2] * b[0] - a[0] * b[2], nz = a[0] * b[1] - a[1] * b[0];
  const cos = (nx * B.z[0] + ny * B.z[1] + nz * B.z[2]) / Math.hypot(nx, ny, nz);
  return (Math.acos(Math.max(-1, Math.min(1, cos))) * 180) / Math.PI;
}

/** A round length for the scale bar: the longest of 1, 2 or 5 times a power of ten that fits. */
export function scaleBar(kmPerUnit: number, maxUnits: number): { km: number; units: number } {
  const max = kmPerUnit * maxUnits;
  const pow = 10 ** Math.floor(Math.log10(max));
  const km = [5, 2, 1].map((m) => m * pow).find((v) => v <= max) ?? pow;
  return { km, units: km / kmPerUnit };
}

/** Kilometres in plain words: "421,800 km", "1.07 million km", "4.5 billion km". */
export function fmtKm(km: number): string {
  if (km >= 1e9) return `${(km / 1e9).toLocaleString('en-GB', { maximumSignificantDigits: 3 })} billion km`;
  if (km >= 1e6) return `${(km / 1e6).toLocaleString('en-GB', { maximumSignificantDigits: 3 })} million km`;
  const round = km >= 1e4 ? Math.round(km / 100) * 100 : km >= 100 ? Math.round(km) : Math.round(km * 10) / 10;
  return `${round.toLocaleString('en-GB')} km`;
}

/** Days in plain words, with hours for the quick ones. */
export function fmtDays(days: number): string {
  if (days < 2) return `${(days * 24).toLocaleString('en-GB', { maximumFractionDigits: 1 })} hours`;
  if (days < 100) return `${days.toLocaleString('en-GB', { maximumFractionDigits: 2 })} days`;
  return `${Math.round(days).toLocaleString('en-GB')} days`;
}

/** How a body's dot is drawn, from how well it has been seen. */
export const markOf = (seen: 'mapped' | 'partly' | 'unresolved') => (seen === 'mapped' ? 'filled' : seen === 'partly' ? 'half' : 'open');

/** Orbits whose fitted position can be more than this far out are drawn dashed. */
export const LOOSE_FIT_DEG = 10;
export const lineOf = (o: KeplerOrbit) => (!o.fit || o.fit.worstDeg > LOOSE_FIT_DEG ? 'dashed' : 'solid');
/** Without a fit, nobody can say where on its orbit a moon is today, so it gets no dot. */
export const canPlace = (o: KeplerOrbit) => !!o.fit;

/** A family of moons on similar orbits, picked out by a rule on the orbit. */
export interface Family {
  id: string;
  name: string;
  /** One line for the list heading. */
  note: string;
  has(aKm: number, tilt: number): boolean;
}

/** Sort bodies into families. Every body must land in exactly one, or this throws. */
export function sortIntoFamilies<T extends { id: string; orbit: KeplerOrbit }>(bodies: T[], families: Family[], parent: string, jd: number): Map<string, T[]> {
  const out = new Map<string, T[]>(families.map((f) => [f.id, []]));
  for (const b of bodies) {
    const tilt = tiltDeg(b.orbit, parent, jd);
    const fits = families.filter((f) => f.has(b.orbit.aKm, tilt));
    if (fits.length !== 1) throw new Error(`${b.id} fits ${fits.length} families (${fits.map((f) => f.id).join(', ') || 'none'}): a ${Math.round(b.orbit.aKm)} km, tilt ${tilt.toFixed(1)}`);
    out.get(fits[0].id)!.push(b);
  }
  for (const list of out.values()) list.sort((a, b) => a.orbit.aKm - b.orbit.aKm);
  return out;
}
