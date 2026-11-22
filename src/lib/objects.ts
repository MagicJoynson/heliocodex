/**
 * One identity for each thing you can look up: its page, the id the 3D view takes, and the lessons that talk about it.
 * Search, the world pages and the star pages all ask here, so they cannot disagree.
 */
import type { Body } from './v2/atlas/types';
import { allLessons } from './v2/margin/content';

type L = Awaited<ReturnType<typeof allLessons>>[number];

/** The id for /explore?go=…, or null when the 3D view cannot place the world (the same test its engine applies). */
export function goFor(b: Body): string | null {
  const o = b.orbit as { type: string };
  if (b.orientationUnknown) return null;
  if (o.type === 'fixed' || o.type === 'jpl-approx') return b.id;
  return o.type === 'kepler' && b.parent ? b.id : null;
}

export const goStar = (index: number) => `star:${index}`;

/** Lessons about a world, best first: those whose 3D camera looks at it, then those that name it in their title or summary. */
export function lessonsAbout(all: L[], id: string, title: string, max = 3): L[] {
  const named = id === 'sun' ? /\bSun\b/ : id === 'earth' ? /\bEarth\b/ : new RegExp(`\\b${title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`);
  const aimed = all.filter((l) => l.data.view?.target === id);
  const text = (l: L) => `${l.data.title} ${l.data.summary} ${l.data.scene ?? ''}`;
  return [...aimed, ...all.filter((l) => !aimed.includes(l) && named.test(text(l)))].slice(0, max);
}
