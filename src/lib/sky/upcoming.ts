/** Everything on the Sky events page, as one list: the planet and Moon events from calendar.ts plus NASA GSFC's eclipses. Shared by that page and the home page. */
import { calendar, type Item } from './calendar';
import eclipseData from '../../data/eclipses.json';

const KIND: Record<string, string> = { 'Annular Solar': 'Annular solar eclipse', 'Total Solar': 'Total solar eclipse', 'Partial Solar': 'Partial solar eclipse', 'Hybrid Solar': 'Hybrid solar eclipse', 'Total Lunar': 'Total lunar eclipse', 'Partial Lunar': 'Partial lunar eclipse', 'Penumbral Lunar': 'Penumbral lunar eclipse' };
// eclipses, from NASA Goddard's predictions (src/data/eclipses.json): the moment of greatest eclipse
const eclipses: Item[] = eclipseData.eclipses.map((e) => ({ at: new Date(e.at), kind: 'eclipse' as const, title: KIND[e.kind] ?? `${e.kind} eclipse`, text: `At the moment of greatest eclipse. Whether you can see it, and how much of it, depends on where you are on Earth.`, figure: `Magnitude ${e.magnitude.toFixed(3)}` }));
// a penumbral eclipse of the Moon below magnitude 0.1 cannot be noticed by eye: leave it out
const visibleEclipses = eclipses.filter((e) => !(e.title.startsWith('Penumbral') && parseFloat((e.figure ?? '').replace('Magnitude ', '')) < 0.1));
export function upcoming(start: Date, end: Date): Item[] {
  return [...calendar(start, end), ...visibleEclipses.filter((e) => e.at >= start && e.at <= end)].sort((a, b) => a.at.getTime() - b.at.getTime());
}
