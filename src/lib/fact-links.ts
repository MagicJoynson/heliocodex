/**
 * Where each fact leads. A fact's `about` list holds body ids, far places, ruler landmarks and lesson ids;
 * this turns the ones that have a page of their own into links, and leaves the rest out.
 */
import { body } from '../data/bodies/index';
import { places } from './v2/atlas/places';
import { goFor } from './objects';
import { PLANET_PAGES, outlineWorlds, nameOf } from './worlds';
import type { Fact, Lesson } from './v2/margin/content';

export interface FactLink { href: string; label: string; kind: 'lesson' | 'record' | '3d' }

/** Facts that are true and sourced but too plain to be worth a click on their own. They stay on the full facts page. */
export const PLAIN = new Set([
  'sun-surface-temperature', 'sun-gravity', 'moon-gravity', 'moon-distance-range', 'moon-month', 'mars-sol', 'mars-rust',
  'virgo-cluster-distance', 'oort-cloud-name', 'earth-true-day', 'nearest-star', 'uranus-one-visitor', 'pluto-flyby',
]);

export function linksFor(f: Fact, lessons: Lesson[]): FactLink[] {
  const out: FactLink[] = [];
  const lesson = f.about.map((id) => lessons.find((l) => l.id === id)).filter(Boolean) as Lesson[];
  for (const l of lesson.slice(0, 1)) out.push({ href: `/learn/${l.id}`, label: l.data.title, kind: 'lesson' });
  const ids = f.about.filter((id) => !lessons.some((l) => l.id === id));
  const record = ids.find((id) => PLANET_PAGES.includes(id) || outlineWorlds.some((w) => w.id === id));
  if (record) out.push({ href: PLANET_PAGES.includes(record) ? `/${record}` : `/worlds/${record}`, label: nameOf(record), kind: 'record' });
  const go = ids.map((id) => {
    const b = body(id);
    if (b) return goFor(b as never) ? { id, name: nameOf(id) } : null;
    const p = places.find((x) => x.id === id);
    return p ? { id, name: p.name } : null;
  }).find(Boolean);
  if (go) out.push({ href: `/explore?go=${go.id}`, label: `${go.name.replace(/^The /, 'the ')} in 3D`, kind: '3d' });
  return out;
}
