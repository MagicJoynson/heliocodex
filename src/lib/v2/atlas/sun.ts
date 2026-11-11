// The planets as plain orbits round the Sun, for the Solar System plates.
//
// The planets are placed everywhere else on the site by positionAU() in lib/orbit.ts, from JPL's
// table of approximate elements. The atlas draws from KeplerOrbit, so this turns one into the
// other for a date. The result follows positionAU() to well inside a line's width for decades
// either side of that date (chart.test.ts holds it to that).
import type { KeplerOrbit } from './types';
import { elements } from '../../orbit';

export const AU_KM = 149_597_870.7;
const J2000_JD = 2_451_545.0, CENTURY = 36_525;
const wrap = (deg: number) => ((deg % 360) + 360) % 360;

export const isPlanet = (id: string) => id in elements;

/** A planet's orbit round the Sun as it is at a Julian date, with the slow turning of its angles. */
export function planetOrbit(slug: string, jd: number): KeplerOrbit {
  const el = elements[slug];
  if (!el) throw new Error(`${slug} is not a planet`);
  const T = (jd - J2000_JD) / CENTURY, r = el.rate;
  const node = el.node_deg + r.node_deg * T;
  const lonPeri = el.lonperi_deg + r.lonperi_deg * T;
  const L = el.L_deg + r.L_deg * T;
  return {
    type: 'kepler', frame: 'ecliptic-j2000', epochJd: jd,
    aKm: (el.a_au + r.a_au * T) * AU_KM,
    e: el.e + r.e * T,
    iDeg: el.i_deg + r.i_deg * T,
    nodeDeg: wrap(node), periDeg: wrap(lonPeri - node), mDeg: wrap(L - lonPeri),
    periodDays: (360 * CENTURY) / r.L_deg,
    rates: { nodeDegPerDay: r.node_deg / CENTURY, periDegPerDay: (r.lonperi_deg - r.node_deg) / CENTURY, mDegPerDay: (r.L_deg - r.lonperi_deg) / CENTURY },
  };
}

/** Astronomical units in plain words: "0.387 au", "5.20 au", "544 au". */
export function fmtAu(km: number): string {
  return `${(km / AU_KM).toLocaleString('en-GB', { minimumSignificantDigits: 3, maximumSignificantDigits: 3 })} au`;
}

/** The time for one orbit of the Sun: days for the quick ones, years for the rest. */
export function fmtYears(days: number): string {
  if (days < 400) return `${Math.round(days).toLocaleString('en-GB')} days`;
  return `${(days / 365.25).toLocaleString('en-GB', { maximumSignificantDigits: 3 })} years`;
}
