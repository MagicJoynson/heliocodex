/**
 * The worlds that do not have a full page yet: the larger moons, the dwarf planets, and the asteroids and
 * comets on the atlas. Each gets an outline page now, built only from the measured data in src/data/bodies
 * (orbit, size, discovery), with the chapters still to be written listed but not filled in.
 */
import { allBodies, body, smallBodies } from '../data/bodies/index';
import type { Body } from './v2/atlas/types';

export const PLANET_PAGES = ['sun', 'mercury', 'venus', 'earth', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune'];
export const AU_KM = 1.495978707e8;

export const outlineWorlds: Body[] = allBodies.filter((b) =>
  (b.kind === 'moon' && ((b.meanRadiusKm ?? 0) >= 100 || b.parent === 'mars')) || b.kind === 'dwarf' || b.kind === 'asteroid' || b.kind === 'comet');

export const KIND_NAMES: Record<string, string> = { moon: 'Moon', dwarf: 'Dwarf planet', asteroid: 'Asteroid', comet: 'Comet' };
export const nameOf = (id: string | null) => (id ? (id === 'sun' ? 'the Sun' : id === 'earth' ? 'the Earth' : body(id)?.name ?? id) : '');
export const why = (id: string) => smallBodies.find((s) => s.id === id);

/** Distance from the Sun in au: a world's own orbit, or its parent planet's (or dwarf planet's) for a moon. */
export function sunAu(b: Body): number {
  const home = b.kind === 'moon' && b.parent ? body(b.parent) ?? b : b;
  const o = home.orbit as { aKm?: number; type: string };
  if (o.aKm) return o.aKm / AU_KM;
  const planetAu: Record<string, number> = { mercury: 0.387, venus: 0.723, earth: 1, mars: 1.524, jupiter: 5.203, saturn: 9.537, uranus: 19.19, neptune: 30.07 };
  return planetAu[home.id] ?? 1;
}

/** The chapters each outline page will hold once written. Only headings: nothing is claimed in them yet. */
export const CHAPTERS: Record<string, string[]> = {
  moon: ['What it looks like up close', 'What it is made of', 'How it was found', 'Spacecraft that have seen it', 'What is still unknown'],
  dwarf: ['What it looks like', 'What it is made of', 'How it was found and named', 'Its moons, if any', 'What is still unknown'],
  asteroid: ['What it looks like', 'What it is made of', 'How it was found', 'Spacecraft that have visited', 'Could it hit the Earth?'],
  comet: ['Its tail and its head', 'Its path round the Sun', 'How it was found', 'Spacecraft that have visited', 'When to see it'],
};
