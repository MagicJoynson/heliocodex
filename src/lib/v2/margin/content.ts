// Reads the content collections and hands back flat, checked lists.
// Used by the plain pages now and by the margin panel later, so both always agree.
import { getCollection, type CollectionEntry } from 'astro:content';
import { allBodies } from '../../../data/bodies/index';

export const STRAND_NAMES: Record<string, string> = {
  'finding-your-way': 'Finding your way',
  'gravity-and-orbits': 'Gravity and orbits',
  light: 'Light, and how we know anything',
  'the-sun': 'The Sun',
  planets: 'Planets',
  moons: 'Moons',
  'small-bodies': 'Asteroids, comets and the far edge',
  stars: 'Stars',
  'stellar-remnants': 'White dwarfs, neutron stars and black holes',
  'other-worlds': 'Planets round other stars',
  'the-galaxy': 'The Milky Way',
  galaxies: 'Galaxies',
  'the-universe': 'The universe',
  life: 'Life',
  'exploring-space': 'Exploring space',
  'how-we-found-out': 'How we found out',
  'what-everything-is-made-of': 'What everything is made of',
};
export const STRAND_ORDER = Object.keys(STRAND_NAMES);

export const LEVEL_NAMES: Record<string, { name: string; reader: string }> = {
  'first-look': { name: 'First look', reader: 'The idea, in plain words' },
  'how-it-works': { name: 'How it works', reader: 'Cause and effect, with real numbers' },
  'the-physics': { name: 'The physics', reader: 'The equations, worked through' },
  'the-frontier': { name: 'The frontier', reader: 'What is still argued over' },
};
export const LEVEL_ORDER = Object.keys(LEVEL_NAMES);

export type Term = CollectionEntry<'glossary'>['data']['terms'][number] & { subject: string };
export type Fact = CollectionEntry<'facts'>['data']['facts'][number] & { subject: string };
export interface Lesson {
  id: string;
  data: CollectionEntry<'lessons'>['data'];
  levels: CollectionEntry<'lessonLevels'>[];
}

const collator = new Intl.Collator('en-GB', { sensitivity: 'base' });

export async function allTerms(): Promise<Term[]> {
  const files = await getCollection('glossary');
  const terms = files.flatMap((f) => f.data.terms.map((t) => ({ ...t, subject: f.id })));
  const ids = new Set<string>();
  for (const t of terms) {
    if (ids.has(t.id)) throw new Error(`Glossary: "${t.id}" is defined twice`);
    ids.add(t.id);
  }
  for (const t of terms) for (const s of t.see) if (!ids.has(s)) throw new Error(`Glossary: "${t.id}" points to "${s}", which does not exist`);
  return terms.sort((a, b) => collator.compare(a.term, b.term));
}

export async function allFacts(): Promise<Fact[]> {
  const files = await getCollection('facts');
  const facts = files.flatMap((f) => f.data.facts.map((x) => ({ ...x, subject: f.id })));
  const ids = new Set<string>();
  for (const f of facts) {
    if (ids.has(f.id)) throw new Error(`Facts: "${f.id}" is used twice`);
    ids.add(f.id);
  }
  return facts;
}

export async function allLessons(): Promise<Lesson[]> {
  const [heads, levels, terms] = await Promise.all([getCollection('lessons'), getCollection('lessonLevels'), allTerms()]);
  const termIds = new Set(terms.map((t) => t.id));
  const lessonIds = new Set(heads.map((h) => h.id));
  const bodyIds = new Set(allBodies.map((b) => b.id));
  const lessons = heads.map((h) => {
    const mine = levels
      .filter((l) => l.id.startsWith(`${h.id}/`))
      .sort((a, b) => LEVEL_ORDER.indexOf(a.id.split('/')[1]) - LEVEL_ORDER.indexOf(b.id.split('/')[1]));
    if (mine.length === 0) throw new Error(`Lesson "${h.id}" has no level files`);
    for (const t of h.data.terms) if (!termIds.has(t)) throw new Error(`Lesson "${h.id}" uses the term "${t}", which is not in the glossary`);
    for (const l of [...h.data.needs, ...h.data.next]) if (!lessonIds.has(l)) throw new Error(`Lesson "${h.id}" links to "${l}", which does not exist`);
    const target = h.data.view?.target;
    if (target && !bodyIds.has(target) && !SCALE_PLACES.includes(target)) throw new Error(`Lesson "${h.id}" points the camera at "${target}", which is not a known body or place`);
    return { id: h.id, data: h.data, levels: mine };
  });
  return lessons.sort((a, b) => STRAND_ORDER.indexOf(a.data.strand) - STRAND_ORDER.indexOf(b.data.strand) || a.data.order - b.data.order);
}

export const SCALE_PLACES = ['solar-system', 'oort-cloud', 'neighbourhood', 'night-sky', 'milky-way', 'local-group', 'cosmic-web', 'cmb'];

export const levelOf = (entry: CollectionEntry<'lessonLevels'>) => entry.id.split('/')[1];
