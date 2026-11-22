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
 * The lesson that teaches each world best, picked by an editor and shown first whatever the scoring says. A world is left out
 * where no lesson truly covers it (Mercury, Titan, Triton): showing none is better than a wrong one.
 */
export const LEAD_LESSON: Record<string, string> = {
  sun: 'what-the-sun-is', venus: 'air-and-the-greenhouse', earth: 'the-earth-as-a-planet', mars: 'air-and-the-greenhouse',
  jupiter: 'three-kinds-of-planet', saturn: 'rings', uranus: 'three-kinds-of-planet', neptune: 'finding-neptune',
  moon: 'the-moon', io: 'moons-in-step', europa: 'ocean-moons', ganymede: 'moons-in-step', callisto: 'moons-in-step', enceladus: 'ocean-moons',
};

/**
 * Lessons about a world, best first, ranked by how much they are about it: the name in the title or summary counts most,
 * then facts filed under it, then how often the lesson's own text names it. A weak match is left out: no lesson is better than a wrong one.
 * Where the 3D camera points does not count.
 */
export function lessonsAbout(all: L[], id: string, title: string, max = 3, facts: F[] = []): L[] {
  const re = new RegExp(`\\b${id === 'sun' ? 'Sun' : id === 'earth' ? 'Earth' : esc(title)}\\b`, 'g');
  const filed = new Set(facts.filter((f) => f.about.includes(id)).flatMap((f) => f.about));
  const scored = all.map((l) => {
    const body = l.levels.filter((x) => /(first-look|how-it-works)$/.test(x.id)).map((x) => x.body ?? '').join(' ');
    const inTitle = count(re, l.data.title), inSummary = count(re, l.data.summary), inText = count(re, body), isFiled = filed.has(l.id);
    // A lesson is about a world only if it says so in its title or names it often in the text. A mention in the summary or a fact filed under it only adds to the rank, since a passing comparison is not a lesson about it.
    const about = inTitle > 0 || inText >= 12;
    const score = inTitle * 12 + inSummary * 6 + (isFiled ? 2 : 0) + (l.data.title.replace(/^The /, '') === title ? 20 : 0) + Math.min(inText, 12);
    return { l, score, about };
  }).filter((x) => x.about);
  const ranked = scored.sort((a, b) => b.score - a.score).map((x) => x.l);
  const lead = LEAD_LESSON[id] ? all.find((l) => l.id === LEAD_LESSON[id]) : undefined;
  if (LEAD_LESSON[id] && !lead) throw new Error(`The lead lesson "${LEAD_LESSON[id]}" for ${id} does not exist`);
  return (lead ? [lead, ...ranked.filter((l) => l !== lead)] : ranked).slice(0, max);
}
