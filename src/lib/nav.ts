/** The one list of sections, used by every header on the site: ordinary pages, the planet pages and the 3D view. */
export interface Section { href: string; label: string; about: string; match: (path: string) => boolean }
export const sections: Section[] = [
  { href: '/explore', label: 'Explore in 3D', about: 'The Sun and its worlds at their true size and distance', match: (p) => p.startsWith('/explore') },
  { href: '/bodies', label: 'Planets', about: 'The Sun and its eight planets, one page each', match: (p) => p === '/bodies' || /^\/(sun|mercury|venus|earth|mars|jupiter|saturn|uranus|neptune)$/.test(p) },
  { href: '/learn', label: 'Learn', about: 'Lessons, from a first look to the deep end', match: (p) => p.startsWith('/learn') },
  { href: '/sky', label: 'Tonight’s sky', about: 'What is above you right now, wherever you are', match: (p) => p.startsWith('/sky') },
  { href: '/stars', label: 'Stars', about: 'Every star you can see, and how to meet one', match: (p) => p.startsWith('/stars') },
  { href: '/atlas', label: 'Atlas', about: 'Charts of everything, from the planets to the cosmic web', match: (p) => p.startsWith('/atlas') },
  { href: '/glossary', label: 'Glossary', about: 'Every word, plainly', match: (p) => p.startsWith('/glossary') },
];
