/**
 * How the Learn pages are laid out. The subjects that are places are set out by how long their
 * light takes to reach us, from the ground under your feet to the oldest light there is. The
 * subjects that are ideas run through all of those places, so they stand apart.
 */
import tones from '../../data/image-tones.json';
import { portraits } from '../portraits';
import { PACKS, packLessons } from './packs';
import type { Lesson } from '../v2/margin/content';

export interface Place {
  strand: string;
  /** light-travel time to the near and far ends, in seconds; 0 means here, on the ground */
  from: number;
  to: number;
  /** said in words, for the row */
  reach: string;
}

const YEAR = 3.156e7;
export const PLACES: Place[] = [
  { strand: 'finding-your-way', from: 0, to: 0, reach: 'Here, on the ground' },
  { strand: 'moons', from: 1.28, to: 4.2 * 3600, reach: '1.3 light seconds to our Moon' },
  { strand: 'the-sun', from: 499, to: 499, reach: '8 light minutes 19 seconds' },
  { strand: 'planets', from: 138, to: 4.2 * 3600, reach: '2 light minutes to 4 light hours' },
  { strand: 'small-bodies', from: 15 * 60, to: 1.6 * YEAR, reach: 'Out to about 1.6 light years' },
  { strand: 'stars', from: 4.24 * YEAR, to: 5000 * YEAR, reach: 'From 4.2 light years' },
  { strand: 'other-worlds', from: 4.24 * YEAR, to: 27000 * YEAR, reach: 'From 4.2 light years' },
  { strand: 'stellar-remnants', from: 8.6 * YEAR, to: 27000 * YEAR, reach: 'From 8.6 light years' },
  { strand: 'the-galaxy', from: 26700 * YEAR, to: 26700 * YEAR, reach: '26,700 light years to its middle' },
  { strand: 'galaxies', from: 160000 * YEAR, to: 1e10 * YEAR, reach: 'From 160,000 light years' },
  { strand: 'the-universe', from: 13.8e9 * YEAR, to: 13.8e9 * YEAR, reach: 'Light 13.8 billion years old' },
];
export const IDEAS = ['gravity-and-orbits', 'light', 'what-everything-is-made-of', 'life', 'exploring-space', 'how-we-found-out'];

/** where a light-travel time sits along the scale, from 0 (here) to 1 (the oldest light) */
const TOP = Math.log10(13.8e9 * YEAR);
export const along = (s: number) => (s <= 1 ? Math.max(0, s) * 0.02 : Math.min(1, 0.02 + (0.98 * Math.log10(s)) / TOP));
export const TICKS = [
  { s: 1, label: '1 second' },
  { s: 60, label: 'minute' },
  { s: 3600, label: 'hour' },
  { s: YEAR, label: 'year' },
  { s: 1000 * YEAR, label: '1,000 years' },
  { s: 1e6 * YEAR, label: 'million' },
  { s: 1e9 * YEAR, label: 'billion' },
];

/** order of the subject pages, place by place and then the ideas, for "next subject" links */
export const SUBJECT_ORDER = [...PLACES.map((p) => p.strand), ...IDEAS];

const lit = tones as Record<string, number>;
/** A lesson's small picture: its first photograph that is not mostly black, else its first
 *  photograph, else a portrait of the world it is about, else its pack's photograph. */
export function thumb(l: Lesson): { src: string; face: boolean } | null {
  const found: string[] = [];
  for (const lv of l.levels) for (const m of (lv.body ?? '').matchAll(/src="(\/img\/learn\/[^"]+\.(?:jpg|png|webp))"/g)) found.push(m[1]);
  const good = found.find((s) => (lit[s] ?? 1) >= 0.08);
  if (good) return { src: good, face: false };
  const target = (l.data as { view?: { target?: string } }).view?.target;
  const face = portraits.find((p) => p.slug === target);
  if (face) return { src: face.src, face: true };
  if (found[0]) return { src: found[0], face: false };
  const pack = PACKS.find((p) => packLessons(p).includes(l.id));
  return pack ? { src: pack.photo.src, face: false } : null;
}
