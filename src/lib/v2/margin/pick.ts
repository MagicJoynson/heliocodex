// Choosing what the guide shows for where the camera is. Pure, so it runs in a node test.
//
// The engine says what it is near and roughly how far out (Context). From that this picks a
// subject, the facts that belong to it, the lessons worth reading here and the words they use.
export interface MLesson { id: string; title: string; strand: string; summary: string; target?: string; distanceKm?: number; terms: string[] }
export interface MFact { id: string; text: string; about: string[]; basis: 'measured' | 'worked-out' | 'theory'; source: { label: string; url: string }; target?: string; distanceKm?: number }
export interface MTerm { id: string; term: string; short: string; more?: string; lesson?: string }
export interface MarginData { lessons: MLesson[]; facts: MFact[]; terms: MTerm[]; strands: Record<string, string> }

export interface Who { id: string; name: string; kind: string; parent: string | null }
export interface Where { near: string; band: 'surface' | 'orbit' | 'system' | 'interstellar' | 'galactic' | 'cosmic'; km: number }

export interface Picked {
  /** What the guide is about just now: a body id or a scale place. */
  subject: string;
  /** Subjects from the nearest outwards, the first being `subject`. */
  chain: string[];
  facts: MFact[];
  /** Facts about the wider place, shown after the ones about the subject itself. */
  wider: MFact[];
  lessons: MLesson[];
  terms: MTerm[];
}

const STRAND_FOR: Record<string, string> = { star: 'the-sun', planet: 'planets', moon: 'moons', dwarf: 'small-bodies', asteroid: 'small-bodies', comet: 'small-bodies' };
const PLACE_STRAND: Record<string, string> = { 'solar-system': 'finding-your-way', 'oort-cloud': 'small-bodies', neighbourhood: 'stars', 'milky-way': 'the-galaxy', 'local-group': 'galaxies', 'cosmic-web': 'the-universe' };

/** The subjects that apply at a place, nearest first. Out between the worlds the nearest body comes second. */
export function chainFor(w: Where, who: (id: string) => Who | undefined): string[] {
  const body = who(w.near);
  const up: string[] = [];
  for (let b = body; b; b = b.parent ? who(b.parent) : undefined) up.push(b.id);
  if (!up.includes('solar-system')) up.push('solar-system');
  if (w.band === 'surface' || w.band === 'orbit') return body ? up : [w.near, 'solar-system'];
  if (w.band === 'system') return ['solar-system', ...up.filter((x) => x !== 'solar-system')];
  if (w.band === 'interstellar') return ['oort-cloud', 'neighbourhood', 'solar-system'];
  if (w.band === 'galactic') return ['milky-way', 'neighbourhood'];
  return ['cosmic-web', 'local-group', 'milky-way'];
}

export function pick(w: Where, data: MarginData, who: (id: string) => Who | undefined, max = { facts: 5, wider: 3, lessons: 4, terms: 8 }): Picked {
  const chain = chainFor(w, who);
  const subject = chain[0];
  const facts = data.facts.filter((f) => f.about.includes(subject));
  const wider = data.facts.filter((f) => !f.about.includes(subject) && chain.slice(1).some((c) => f.about.includes(c)));
  // facts that name the subject first are most about it
  facts.sort((a, b) => a.about.indexOf(subject) - b.about.indexOf(subject));
  const strand = STRAND_FOR[who(subject)?.kind ?? ''] ?? PLACE_STRAND[subject];
  const scored = data.lessons
    .map((l, order) => {
      const at = l.target ? chain.indexOf(l.target) : -1;
      const score = (at === 0 ? 6 : at > 0 ? 3 - Math.min(at, 2) : 0) + (l.strand === strand ? 2 : 0) + (facts.some((f) => f.about.includes(l.id)) ? 1 : 0);
      return { l, score, order };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score || a.order - b.order);
  const lessons = scored.slice(0, max.lessons).map((x) => x.l);
  const termIds = [...new Set(lessons.flatMap((l) => l.terms))].slice(0, max.terms);
  const byId = new Map(data.terms.map((t) => [t.id, t]));
  return { subject, chain, facts: facts.slice(0, max.facts), wider: wider.slice(0, max.wider), lessons, terms: termIds.map((id) => byId.get(id)!).filter(Boolean) };
}

export const PLACE_NAMES: Record<string, string> = {
  'solar-system': 'The Solar System', 'oort-cloud': 'The Oort cloud', neighbourhood: 'The Sun’s neighbourhood', 'night-sky': 'The night sky',
  'milky-way': 'The Milky Way', 'local-group': 'The Local Group', 'cosmic-web': 'The cosmic web', cmb: 'The edge of what we can see',
};
