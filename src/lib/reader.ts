// Which pages carry the reader tools (share, report a mistake, print): the reading pages about one thing.
// Lessons and their deeper levels, world pages, planet pages and star pages. Not indexes, searches, maps or the 3D view.
const PLANETS = new Set(['sun', 'mercury', 'venus', 'earth', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune']);
const LEARN_OTHER = new Set(['facts', 'packs', 'subject']);
const STAR_OTHER = new Set(['catalogue', 'in']);

export function hasReaderTools(path: string): boolean {
  const p = path.replace(/\/$/, '');
  const [, a, b, c] = p.split('/');
  if (PLANETS.has(a) && !b) return true;
  if (a === 'worlds') return Boolean(b) && !c;
  if (a === 'stars') return Boolean(b) && !c && !STAR_OTHER.has(b);
  if (a === 'learn') return Boolean(b) && !LEARN_OTHER.has(b);
  return false;
}

export function mistakeLink(title: string, url: string): string {
  const subject = `Mistake on Heliocodex: ${title}`;
  const body = `Page: ${title}\nAddress: ${url}\n\nWhat looks wrong, and what you think is right:\n\n\n\nPlease do not put names, ages or schools in this email.`;
  return `mailto:support@fallinghippo.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
