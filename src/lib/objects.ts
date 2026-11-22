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

type F = { about: string[] };
const esc = (t: string) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const count = (re: RegExp, t: string) => (t.match(re) ?? []).length;

/**
 * Lessons about a world, best first, ranked by how much they are about it: the name in the title or summary counts most,
 * then facts filed under it, then how often the lesson's own text names it. Where the 3D camera points does not count.
 */
export function lessonsAbout(all: L[], id: string, title: string, max = 3, facts: F[] = []): L[] {
  const re = new RegExp(`\\b${id === 'sun' ? 'Sun' : id === 'earth' ? 'Earth' : esc(title)}\\b`, 'g');
  const filed = new Set(facts.filter((f) => f.about.includes(id)).flatMap((f) => f.about));
  const scored = all.map((l) => {
    const body = l.levels.filter((x) => /(first-look|how-it-works)$/.test(x.id)).map((x) => x.body ?? '').join(' ');
    const score = count(re, l.data.title) * 12 + count(re, l.data.summary) * 6 + (filed.has(l.id) ? 2 : 0) + (l.data.title.replace(/^The /, '') === title ? 20 : 0) + Math.min(count(re, body), 12);
    return { l, score };
  }).filter((x) => x.score >= 6);
  return scored.sort((a, b) => b.score - a.score).slice(0, max).map((x) => x.l);
}
