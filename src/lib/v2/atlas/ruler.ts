// The ruler: one scale in powers of ten from a metre to the edge of what can be seen, with every
// place marked at its size or its distance.
//
// Pure functions, like chart.ts. Positions are in "decades": the logarithm to base ten of a length
// in metres, so 3 is a kilometre and 11.17 is the distance of the Sun. The page turns a decade
// into a height on screen, so one layout serves any size of text.
import type { Body, KeplerOrbit } from './types';
import { fmtKm } from './chart';
import { fmtAu, isPlanet, planetOrbit } from './sun';
import { landmarks } from './landmarks';

export const LIGHT_YEAR_M = 9.4607304725808e15;
/** The ruler runs from 1 metre (decade 0) to this. */
export const TOP = 27;

/** A line across the ruler at a round length, with its plain name. */
export interface Rule { at: number; unit: string; name: string }

const ly = (n: number) => Math.log10(n * LIGHT_YEAR_M);
export const RULES: Rule[] = [
  { at: 0, unit: '1 m', name: 'a long stride' },
  { at: 1, unit: '10 m', name: 'the length of a bus' },
  { at: 2, unit: '100 m', name: 'the length of a football pitch' },
  { at: 3, unit: '1 km', name: 'a ten-minute walk' },
  { at: 4, unit: '10 km', name: 'the height airliners fly at' },
  { at: 5, unit: '100 km', name: 'an hour on the motorway' },
  { at: 6, unit: '1,000 km', name: 'about the length of Great Britain' },
  { at: 7, unit: '10,000 km', name: 'from the North Pole to the equator' },
  { at: 8, unit: '100,000 km', name: 'a quarter of the way to the Moon' },
  { at: 9, unit: '1 million km', name: 'light crosses this in 3.3 seconds' },
  { at: 10, unit: '10 million km', name: 'a quarter of the way to Venus at its nearest' },
  { at: 11, unit: '100 million km', name: 'two thirds of the way to the Sun' },
  { at: 12, unit: '1 billion km', name: 'between Jupiter and Saturn' },
  { at: 13, unit: '10 billion km', name: 'about twice as far as Neptune' },
  { at: 14, unit: '100 billion km', name: 'light takes nearly four days' },
  { at: 15, unit: '1 trillion km', name: 'a tenth of a light year' },
  { at: ly(1), unit: '1 light year', name: 'light’s journey in a year: 9.46 trillion km' },
  { at: ly(10), unit: '10 light years', name: 'the Sun’s nearest neighbours' },
  { at: ly(100), unit: '100 light years', name: 'how far our first radio shows have travelled' },
  { at: ly(1e3), unit: '1,000 light years', name: 'most stars seen by eye are nearer than this' },
  { at: ly(1e4), unit: '10,000 light years', name: 'a tenth of the way across the Milky Way' },
  { at: ly(1e5), unit: '100,000 light years', name: 'the scale of a large galaxy' },
  { at: ly(1e6), unit: '1 million light years', name: 'less than halfway to the Andromeda galaxy' },
  { at: ly(1e7), unit: '10 million light years', name: 'four times as far as the Andromeda galaxy' },
  { at: ly(1e8), unit: '100 million light years', name: 'twice as far as the Virgo cluster' },
  { at: ly(1e9), unit: '1 billion light years', name: 'its light set out before there were animals' },
  { at: ly(1e10), unit: '10 billion light years', name: 'its light is older than the Earth' },
];

/** One thing marked on the ruler. */
export interface Mark {
  id: string;
  name: string;
  value: string;
  metres: number;
  side: 'size' | 'distance';
  /** 0 and 1 are always wanted; 2 and 3 are shown where there is room; 4 is only ever counted. */
  rank: number;
  href: string;
  /** What kind of thing this is, for the line that stands in for marks left out: "moons of Saturn". */
  group: string;
  groupHref: string;
  known?: 'derived' | 'theory';
  /** A landmark's label has its figure on a second line. A world's is one line. */
  lines: 1 | 2;
  /** Among marks of one rank, the heavier is written first: the width of the body in km. */
  weight: number;
}

const IAU_DWARFS = new Set(['ceres', 'pluto', 'haumea', 'makemake', 'eris']);
const parentName = (id: string) => (id === 'sun' ? 'the Sun' : id === 'earth' ? 'the Earth' : id[0].toUpperCase() + id.slice(1));

/** Marks for every body in the data: its width where that has been measured, and the size of its orbit. */
export function bodyMarks(bodies: Body[], jd: number): Mark[] {
  const out: Mark[] = [];
  for (const b of bodies) {
    const roundSun = b.parent === 'sun';
    const plate = b.id === 'sun' || roundSun ? 'solar-system' : b.parent!;
    const href = b.id === 'sun' ? '/atlas/solar-system' : `/atlas/${plate}#${b.id}`;
    const group = b.id === 'sun' || roundSun ? 'worlds round the Sun' : `moons of ${parentName(b.parent!)}`;
    const groupHref = `/atlas/${plate}`;
    const major = b.kind === 'planet' || b.id === 'sun' || b.id === 'moon';
    const rank = major ? 1 : b.seen === 'mapped' || IAU_DWARFS.has(b.id) ? 2 : b.seen === 'partly' || b.kind === 'dwarf' ? 3 : 4;
    if (b.meanRadiusKm) {
      out.push({ id: `${b.id}-width`, name: b.name, value: `${fmtKm(b.meanRadiusKm * 2)} wide`, metres: b.meanRadiusKm * 2000, side: 'size', rank: Math.min(rank, 3), href, group, groupHref, lines: 1, weight: b.meanRadiusKm * 2 });
    }
    const orbit = isPlanet(b.id) ? planetOrbit(b.id, jd) : b.orbit.type === 'kepler' ? (b.orbit as KeplerOrbit) : undefined;
    if (orbit && b.parent) {
      out.push({
        id: `${b.id}-orbit`, name: `${b.name} from ${parentName(b.parent)}`, metres: orbit.aKm * 1000, side: 'distance', rank, href, group, groupHref, lines: 1, weight: (b.meanRadiusKm ?? 0) * 2,
        value: roundSun ? fmtAu(orbit.aKm) : fmtKm(orbit.aKm),
      });
    }
  }
  return out;
}

/** The hand-written landmarks as marks. They link to their note under the ruler. */
export function landmarkMarks(): Mark[] {
  return landmarks.map((l) => ({ id: l.id, name: l.name, value: l.value, metres: l.metres, side: l.side, rank: 0, href: `#mark-${l.id}`, group: 'landmarks', groupHref: '#marks', known: l.known, lines: 2, weight: 0 }));
}

export interface Placed extends Mark {
  /** Where the length truly falls on the ruler, decades. */
  y: number;
  /** Where its label is written, which may be nudged to keep clear of its neighbours. */
  at: number;
  column: number;
}
/** A line that stands in for the marks there was no room to write. */
export interface More { at: number; column: number; count: number; text: string; href: string }
export interface Layout { placed: Placed[]; more: More[]; columns: number }

export interface LayoutOptions {
  /** 2 puts sizes in one column and distances in the other. 1 puts everything in one (for a phone). */
  columns: 1 | 2;
  /** The height of a one-line label, in decades. */
  slot: number;
  /** The height of a two-line label. */
  tall: number;
  /** Room to keep clear below each rule, for its own words, in decades. */
  under: number;
  /** The furthest a label may be nudged from its true place, in decades. */
  maxShift: number;
}

/**
 * Labels as near their true places as they can be without touching: the least total movement
 * (squared) that keeps each clear of the next and all of them inside lo..hi. `want` is where each
 * label's middle should be and `tall` how high each label is. Returns null if they cannot fit.
 */
export function spread(want: number[], tall: number[], lo: number, hi: number): number[] | null {
  const n = want.length;
  if (n === 0) return [];
  // off[i] is how far label i's middle must be below label 0's when they are packed tight
  const off = [0];
  for (let i = 1; i < n; i++) off.push(off[i - 1] + (tall[i - 1] + tall[i]) / 2);
  const first = lo + tall[0] / 2, last = hi - tall[n - 1] / 2 - off[n - 1];
  if (first > last + 1e-9) return null;
  // take out the spacing, then the answer is the nearest non-decreasing sequence (pool adjacent violators)
  const blocks: { sum: number; size: number }[] = [];
  for (let i = 0; i < n; i++) {
    blocks.push({ sum: want[i] - off[i], size: 1 });
    while (blocks.length > 1 && blocks[blocks.length - 2].sum / blocks[blocks.length - 2].size > blocks[blocks.length - 1].sum / blocks[blocks.length - 1].size) {
      const b = blocks.pop()!;
      blocks[blocks.length - 1].sum += b.sum; blocks[blocks.length - 1].size += b.size;
    }
  }
  const out: number[] = [];
  for (const b of blocks) for (let k = 0; k < b.size; k++) out.push(Math.min(last, Math.max(first, b.sum / b.size)) + off[out.length]);
  return out;
}

/** Decide which marks are written, and where, so that no two labels touch and none sits on a rule. */
export function layout(marks: Mark[], rules: Rule[], opt: LayoutOptions): Layout {
  const placed: Placed[] = [], more: More[] = [];
  const edges = [...rules.map((r) => r.at), TOP];
  for (let column = 0; column < opt.columns; column++) {
    for (let k = 0; k < edges.length - 1; k++) {
      const a = edges[k], b = edges[k + 1];
      const here = marks
        .filter((m) => (opt.columns === 1 || (m.side === 'size' ? 0 : 1) === column))
        .map((m) => ({ m, y: Math.log10(m.metres) }))
        .filter((x) => x.y >= a && x.y < b)
        .sort((p, q) => p.m.rank - q.m.rank || q.m.weight - p.m.weight || p.y - q.y);
      if (here.length === 0) continue;
      const lo = a + opt.under;
      const h = (m: Mark) => (m.lines === 2 ? opt.tall : opt.slot);
      const fill = (hi: number) => {
        let kept: { m: Mark; y: number }[] = [], at: number[] = [];
        const left: Mark[] = [];
        for (const x of here) {
          if (x.m.rank >= 4) { left.push(x.m); continue; }
          const trial = [...kept, x].sort((p, q) => p.y - q.y);
          const pos = spread(trial.map((t) => t.y), trial.map((t) => h(t.m)), lo, hi);
          // landmarks and planets are always written; anything else gives way if it would push labels too far
          if (pos && (x.m.rank <= 1 || trial.every((t, i) => Math.abs(pos[i] - t.y) <= opt.maxShift))) { kept = trial; at = pos; } else left.push(x.m);
        }
        return { kept, at, left };
      };
      let r = fill(b);
      // if anything is left out, the last slot before the next rule goes to the line that says so
      if (r.left.length > 0) r = fill(b - opt.slot);
      r.kept.forEach((x, i) => placed.push({ ...x.m, y: x.y, at: r.at[i], column }));
      if (r.left.length > 0) {
        const groups = new Map<string, { n: number; href: string }>();
        for (const m of r.left) { const g = groups.get(m.group) ?? { n: 0, href: m.groupHref }; g.n++; groups.set(m.group, g); }
        const [name, big] = [...groups.entries()].sort((p, q) => q[1].n - p[1].n)[0];
        const n = r.left.length;
        const one = groups.size === 1, most = big.n > n / 2;
        more.push({
          at: b - opt.slot / 2, column, count: n, href: one || most ? big.href : '/atlas#charts',
          text: one ? `and ${n} more ${n === 1 ? name.replace(/^moons/, 'moon').replace(/^worlds/, 'world') : name}` : most ? `and ${n} more, mostly ${name}` : `and ${n} more worlds, on the charts`,
        });
      }
    }
  }
  return { placed, more, columns: opt.columns };
}

/** Read a length back out of the words a reader sees, in metres: "about 24 million km wide" gives 2.4e10. */
export function readLength(text: string): number | null {
  const m = text.match(/([\d.,]+)\s*(million |billion |trillion )?(light years?|km|au|m)\b/);
  if (!m) return null;
  const n = Number(m[1].replace(/,/g, ''));
  const big = m[2] === 'million ' ? 1e6 : m[2] === 'billion ' ? 1e9 : m[2] === 'trillion ' ? 1e12 : 1;
  const unit = m[3].startsWith('light') ? LIGHT_YEAR_M : m[3] === 'km' ? 1000 : m[3] === 'au' ? 1.495978707e11 : 1;
  return n * big * unit;
}
