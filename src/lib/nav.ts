/** The one list of sections, used by every header on the site: ordinary pages, the planet pages and the 3D view. */
export type Group = 'explore' | 'look' | 'ref';
export interface Section { href: string; label: string; about: string; group: Group; match: (path: string) => boolean }
export const sections: Section[] = [
  { href: '/explore', group: 'explore', label: 'Explore in 3D', about: 'The Sun and its worlds at their true size and distance', match: (p) => p.startsWith('/explore') },
  { href: '/bodies', group: 'explore', label: 'Planets', about: 'The Sun and its eight planets, one page each', match: (p) => p === '/bodies' || /^\/(sun|mercury|venus|earth|mars|jupiter|saturn|uranus|neptune)$/.test(p) },
  { href: '/learn', group: 'explore', label: 'Learn', about: 'Lessons, from a first look to the deep end', match: (p) => p.startsWith('/learn') },
  { href: '/sky', group: 'look', label: 'Tonight’s sky', about: 'What is above you right now, wherever you are', match: (p) => p.startsWith('/sky') },
  { href: '/stars', group: 'look', label: 'Stars', about: 'Every star you can see, and how to meet one', match: (p) => p.startsWith('/stars') },
  { href: '/atlas', group: 'ref', label: 'Atlas', about: 'Charts of everything, from the planets to the cosmic web', match: (p) => p.startsWith('/atlas') },
  { href: '/glossary', group: 'ref', label: 'Glossary', about: 'Every word, plainly', match: (p) => p.startsWith('/glossary') },
];

/** The sections in their three groups, for headers that show the groups apart. */
export const GROUP_NAMES: Record<Group, string> = { explore: 'Explore', look: 'Look up', ref: 'Reference' };
export const groups = (Object.keys(GROUP_NAMES) as Group[]).map((g) => ({ id: g, name: GROUP_NAMES[g], sections: sections.filter((s) => s.group === g) }));
