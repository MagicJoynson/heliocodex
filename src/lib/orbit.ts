import facts from '../data/facts.json' with { type: 'json' };

// Keplerian elements and rates from JPL SSD "Approximate Positions of the Major
// Planets", Table 1, valid 1800 AD - 2050 AD. Accuracy is a few arcminutes to
// well under a degree, which is plenty for a visual model.

const DEG = Math.PI / 180;
const J2000 = Date.UTC(2000, 0, 1, 12, 0, 0);
const MS_PER_CENTURY = 36525 * 86400 * 1000;

interface Terms { a_au: number; e: number; i_deg: number; L_deg: number; lonperi_deg: number; node_deg: number }
export interface Elements extends Terms { rate: Terms }

export const elements = Object.fromEntries(
  Object.entries(facts.planets).map(([k, v]) => [k, v.elements]),
) as Record<string, Elements>;

export function centuriesSinceJ2000(date: Date | number) {
  const t = typeof date === 'number' ? date : date.getTime();
  return (t - J2000) / MS_PER_CENTURY;
}

function solveKepler(M: number, e: number) {
  // Newton iteration for eccentric anomaly E from mean anomaly M (radians)
  let E = e < 0.8 ? M : Math.PI;
  for (let k = 0; k < 12; k++) {
    const d = (E - e * Math.sin(E) - M) / (1 - e * Math.cos(E));
    E -= d;
    if (Math.abs(d) < 1e-10) break;
  }
  return E;
}

/** Heliocentric position in au, ecliptic frame: x toward vernal equinox, z north. */
export function positionAU(slug: string, T: number): [number, number, number] {
  const el = elements[slug];
  const a = el.a_au + el.rate.a_au * T;
  const e = el.e + el.rate.e * T;
  const I = (el.i_deg + el.rate.i_deg * T) * DEG;
  const L = el.L_deg + el.rate.L_deg * T;
  const w = el.lonperi_deg + el.rate.lonperi_deg * T; // longitude of perihelion
  const node = (el.node_deg + el.rate.node_deg * T) * DEG;
  const argPeri = w * DEG - node;
  let M = ((L - w) % 360) * DEG;
  if (M > Math.PI) M -= 2 * Math.PI;
  if (M < -Math.PI) M += 2 * Math.PI;
  const E = solveKepler(M, e);
  const xo = a * (Math.cos(E) - e);
  const yo = a * Math.sqrt(1 - e * e) * Math.sin(E);
  const cw = Math.cos(argPeri), sw = Math.sin(argPeri);
  const cn = Math.cos(node), sn = Math.sin(node);
  const ci = Math.cos(I), si = Math.sin(I);
  const x = (cw * cn - sw * sn * ci) * xo + (-sw * cn - cw * sn * ci) * yo;
  const y = (cw * sn + sw * cn * ci) * xo + (-sw * sn + cw * cn * ci) * yo;
  const z = sw * si * xo + cw * si * yo;
  return [x, y, z];
}

/** Points along the orbit (instantaneous ellipse at epoch T), for drawing a path. */
export function orbitPath(slug: string, T: number, n = 256): [number, number, number][] {
  const el = elements[slug];
  const a = el.a_au + el.rate.a_au * T;
  const e = el.e + el.rate.e * T;
  const I = (el.i_deg + el.rate.i_deg * T) * DEG;
  const w = el.lonperi_deg + el.rate.lonperi_deg * T;
  const node = (el.node_deg + el.rate.node_deg * T) * DEG;
  const argPeri = w * DEG - node;
  const pts: [number, number, number][] = [];
  const cw = Math.cos(argPeri), sw = Math.sin(argPeri);
  const cn = Math.cos(node), sn = Math.sin(node);
  const ci = Math.cos(I), si = Math.sin(I);
  for (let k = 0; k <= n; k++) {
    const E = (k / n) * 2 * Math.PI;
    const xo = a * (Math.cos(E) - e);
    const yo = a * Math.sqrt(1 - e * e) * Math.sin(E);
    pts.push([
      (cw * cn - sw * sn * ci) * xo + (-sw * cn - cw * sn * ci) * yo,
      (cw * sn + sw * cn * ci) * xo + (-sw * sn + cw * cn * ci) * yo,
      sw * si * xo + cw * si * yo,
    ]);
  }
  return pts;
}
