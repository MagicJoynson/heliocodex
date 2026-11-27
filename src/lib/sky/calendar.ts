/**
 * "Sky events": the planet events worth planning for, over the next two years, worked out from the same sums as the
 * sky map and Sky this week (week.ts, place.ts, moon.ts). Nothing is fetched. Every time is the instant it happens
 * for the whole Earth (Universal Time); none depends on where you stand.
 *
 * - Oppositions (a planet directly opposite the Sun: up all night, nearest and brightest): Mars to Neptune.
 * - Greatest elongations of Mercury and Venus (as far from the Sun as they get, so best placed to see).
 * - Conjunctions with the Sun (a planet behind or in front of the Sun, lost in its glare).
 * - Two planets close together, within 3 degrees.
 * - The Moon's nearest and farthest points.
 *
 * The planets come from the JPL approximate elements (a few arcminutes), the Moon from the series in Meeus,
 * "Astronomical Algorithms", chapter 47. scripts/check-events.mjs compares a sample against JPL Horizons.
 */
import { moonPlace } from './moon';
import { planetFromEarth } from './place';
import { planetLook, sunLon, eastOfSun, planetLL, apart, passes, crossings, T_, NAME as NAKED_NAME, type Naked } from './week';

const HOUR = 3600000;

export type Kind = 'opposition' | 'elongation' | 'sun' | 'pair' | 'near' | 'far' | 'eclipse';
export interface Item { at: Date; kind: Kind; title: string; text: string; figure?: string; unseen?: boolean }

const NAMES: Record<string, string> = { ...NAKED_NAME, uranus: 'Uranus', neptune: 'Neptune' };
const OUTER = ['mars', 'jupiter', 'saturn', 'uranus', 'neptune'] as const;
const degs = (n: number) => `${n.toFixed(1).replace(/\.0$/, '')}°`;
const num = (n: number) => (Math.round(Math.abs(n) / 100) * 100).toLocaleString('en-GB');

/** Every place a function has a low point (sign = 1) or a high point (sign = -1) in [from, to], found to a few minutes. */
export function turns(f: (d: Date) => number, from: Date, to: Date, step: number, sign = 1): { at: Date; v: number }[] {
  const out: { at: Date; v: number }[] = [];
  const t0 = from.getTime(), n = Math.floor((to.getTime() - t0) / step);
  const vals: number[] = [];
  for (let i = 0; i <= n; i++) vals.push(sign * f(new Date(t0 + i * step)));
  for (let i = 1; i < n; i++) {
    if (!(vals[i] < vals[i - 1] && vals[i] <= vals[i + 1])) continue;
    let lo = t0 + (i - 1) * step, hi = t0 + (i + 1) * step;
    for (let k = 0; k < 40; k++) {
      const a = lo + (hi - lo) / 3, b = hi - (hi - lo) / 3;
      if (sign * f(new Date(a)) < sign * f(new Date(b))) hi = b; else lo = a;
    }
    const at = Math.round((lo + hi) / 2 / 60000) * 60000;
    out.push({ at: new Date(at), v: sign * f(new Date(at)) });
  }
  return out;
}

/** How far a planet is from the Sun in the sky, degrees. */
function elongation(id: string, d: Date): number {
  const a = planetLL(id, d), s: [number, number] = [sunLon(d), 0];
  return apart(a, s);
}

export function calendar(from: Date, to: Date): Item[] {
  const out: Item[] = [];
  // a planet at opposition
  for (const id of OUTER) {
    const diff = (d: Date) => planetLL(id, d)[0] - sunLon(d);
    for (const c of crossings(passes(diff, 180), from, to, 12 * HOUR)) {
      const au = planetFromEarth(id, T_(c.at)).au;
      const bright = id === 'uranus' || id === 'neptune' ? '' : `, magnitude ${(() => { const m = planetLook(id as Naked, c.at).mag; return (m < 0 ? '−' : '') + Math.abs(m).toFixed(1); })()}`;
      out.push({ at: c.at, kind: 'opposition', title: `${NAMES[id]} at opposition`, text: `${NAMES[id]} is directly opposite the Sun. It rises at sunset, is highest at midnight, and is at or near its closest to us this time round, so the best time of its year to look.${id === 'uranus' || id === 'neptune' ? ' Best seen with binoculars or a telescope.' : ''}`, figure: `${au.toFixed(2)} au from Earth${bright}` });
    }
  }
  // Mercury and Venus: widest from the Sun, and in line with it
  for (const id of ['mercury', 'venus'] as const) {
    for (const w of turns((d) => elongation(id, d), from, to, 6 * HOUR, -1)) {
      const east = eastOfSun(id, w.at) > 0;
      out.push({ at: w.at, kind: 'elongation', title: `${NAMES[id]} at greatest elongation ${east ? 'east' : 'west'}`, text: `${NAMES[id]} is as far from the Sun as it gets this time round, so it is best placed in the ${east ? 'evening' : 'morning'} sky, ${east ? 'after sunset' : 'before sunrise'}.`, figure: `${degs(Math.abs(w.v))} from the Sun` });
    }
  }
  for (const id of ['mercury', 'venus', ...OUTER] as const) {
    const e = (d: Date) => eastOfSun(id, d);
    for (const c of crossings(e, from, to, 12 * HOUR)) {
      if (Math.abs(e(c.at)) > 10) continue;
      const inner = id === 'mercury' || id === 'venus', between = inner && planetFromEarth(id, T_(c.at)).au < 1;
      out.push({ at: c.at, kind: 'sun', title: inner ? `${NAMES[id]} in ${between ? 'inferior' : 'superior'} conjunction` : `${NAMES[id]} in conjunction with the Sun`, text: `${NAMES[id]} passes ${between ? 'between us and the Sun' : 'behind the Sun'}, lost in its glare for weeks.`, unseen: true });
    }
  }
  // two planets close together
  const naked = ['mercury', 'venus', 'mars', 'jupiter', 'saturn'] as const;
  for (let i = 0; i < naked.length; i++) for (let j = i + 1; j < naked.length; j++) {
    const a = naked[i], b = naked[j];
    for (const m of turns((d) => apart(planetLL(a, d), planetLL(b, d)), from, to, 6 * HOUR)) {
      if (m.v >= 3) continue;
      const near = Math.min(elongation(a, m.at), elongation(b, m.at)) < 15;
      if (near) continue; // too near the Sun to see: not worth a line
      out.push({ at: m.at, kind: 'pair', title: `${NAMES[a]} and ${NAMES[b]} close`, text: `${NAMES[a]} and ${NAMES[b]} pass ${degs(m.v)} apart in the sky, at their closest. They look close, but are many millions of kilometres apart.`, figure: `${degs(m.v)} apart` });
    }
  }
  // the Moon's nearest and farthest points
  const km = (d: Date) => moonPlace(T_(d)).km;
  for (const m of turns(km, from, to, 3 * HOUR)) out.push({ at: m.at, kind: 'near', title: 'Moon at its nearest', text: `The Moon is ${num(m.v)} km away, the closest point of this month's orbit.`, figure: `${num(m.v)} km` });
  for (const m of turns(km, from, to, 3 * HOUR, -1)) out.push({ at: m.at, kind: 'far', title: 'Moon at its farthest', text: `The Moon is ${num(m.v)} km away, the farthest point of this month's orbit.`, figure: `${num(m.v)} km` });
  return out.sort((a, b) => a.at.getTime() - b.at.getTime());
}
