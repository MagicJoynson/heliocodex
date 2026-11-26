// The place last chosen on the sky map, kept on the visitor's own device so other pages can use it.
import { CITIES, guess, zoneOf } from './cities';
export interface Place { name: string; lat: number; lon: number }
const KEY = 'heliocodex-sky-place';
export function readPlace(): Place | null {
  try {
    const p = JSON.parse(localStorage.getItem(KEY) ?? 'null') as Place | null;
    return p && typeof p.lat === 'number' && typeof p.lon === 'number' && Math.abs(p.lat) <= 90 && Math.abs(p.lon) <= 180 ? p : null;
  } catch { return null; }
}
export function keepPlace(p: Place): void {
  // The device's own position is kept to about 11 km (a tenth of a degree), which is plenty for the sky and no more than needed.
  const q = p.name === 'Where you are' ? { ...p, lat: Math.round(p.lat * 10) / 10, lon: Math.round(p.lon * 10) / 10 } : p;
  try { localStorage.setItem(KEY, JSON.stringify(q)); } catch { /* private browsing: nothing is kept */ }
}
export function forgetPlace(): void {
  try { localStorage.removeItem(KEY); } catch { /* nothing to forget */ }
}


/** The one place every page uses: the one chosen on the sky map, or else a guess from the device's clock. */
export interface Here extends Place {
  /** The time zone its clocks keep (IANA name). */
  zone: string;
  /** true when nothing has been chosen and this is the guess from the device's clock. */
  guessed: boolean;
  /** How to name it in a sentence: "London", or "where you are". */
  from: string;
}
export function herePlace(): Here {
  const kept = readPlace();
  if (kept) {
    // a place typed by hand is saved under the words used on the sky map for it
    const name = kept.name;
    return { ...kept, zone: zoneOf(name, kept.lat, kept.lon), guessed: false, from: name === 'Where you are' ? 'where you are' : name === 'The place you typed' ? 'the place you chose' : name };
  }
  const [name, lat, lon] = CITIES[guess()];
  return { name, lat, lon, zone: zoneOf(name, lat, lon), guessed: true, from: name };
}
