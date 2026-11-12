/** The one list of sections, used by every header on the site: ordinary pages, the planet pages and the 3D view. */
import { SHOW_OUTLINES } from './site';
export type Group = 'system' | 'sky' | 'learn' | 'ref';
export interface Section { href: string; label: string; about: string; group: Group; match: (path: string) => boolean; outline?: boolean }
const PLANETS = /^\/(sun|mercury|venus|earth|mars|jupiter|saturn|uranus|neptune)$/;
export const sections: Section[] = [
  { href: '/worlds', group: 'system', label: 'The Solar System', about: 'Every planet, moon and small world, by distance from the Sun', match: (p) => p.startsWith('/worlds') || p === '/bodies' || PLANETS.test(p) },
  { href: '/explore', group: 'system', label: 'Explore in 3D', about: 'The Sun and its worlds at their true size and distance', match: (p) => p.startsWith('/explore') },
  { href: '/atlas', group: 'system', label: 'Charts', about: 'Maps of everything, from the planets to the cosmic web', match: (p) => p.startsWith('/atlas') },
  { href: '/sky', group: 'sky', label: 'Tonight’s sky', about: 'What is above you right now, wherever you are', match: (p) => p.startsWith('/sky') },
  { href: '/stars', group: 'sky', label: 'Stars', about: 'Every star you can see, and how to meet one', match: (p) => p === '/stars' || (p.startsWith('/stars/') && !p.startsWith('/stars/in/')) },
  { href: '/stars#constellations', group: 'sky', label: 'Constellations', about: 'All 88, and the stars in each', match: (p) => p.startsWith('/stars/in/') },
  { href: '/learn', group: 'learn', label: 'Lessons', about: 'From a first look to the deep end', match: (p) => p.startsWith('/learn') && !p.startsWith('/learn/facts') },
  { href: '/learn/facts', group: 'learn', label: 'Facts', about: 'Short, checked facts with their sources', match: (p) => p.startsWith('/learn/facts') },
  { href: '/glossary', group: 'ref', label: 'Glossary', about: 'Every word, plainly', match: (p) => p.startsWith('/glossary') },
  { href: '/discovery', group: 'ref', label: 'Discovery', about: 'The missions, people and telescopes behind it all', match: (p) => p.startsWith('/discovery'), outline: true },
  { href: '/sources', group: 'ref', label: 'Sources', about: 'Where every figure and picture comes from', match: (p) => p.startsWith('/sources') },
];

/** The four top-level headings, each with the page it opens. */
export const GROUP_NAMES: Record<Group, string> = { system: 'Solar System', sky: 'Sky', learn: 'Learn', ref: 'Reference' };
export const GROUP_HREF: Record<Group, string> = { system: '/worlds', sky: '/sky', learn: '/learn', ref: '/glossary' };
export const groups = (Object.keys(GROUP_NAMES) as Group[]).map((g) => ({ id: g, name: GROUP_NAMES[g], href: GROUP_HREF[g], sections: sections.filter((s) => s.group === g && (SHOW_OUTLINES || !s.outline)) }));
