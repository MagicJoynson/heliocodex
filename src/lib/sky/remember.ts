// The place last chosen on the sky map, kept on the visitor's own device so other pages can use it.
export interface Place { name: string; lat: number; lon: number }
const KEY = 'heliocodex-sky-place';
export function readPlace(): Place | null {
  try {
    const p = JSON.parse(localStorage.getItem(KEY) ?? 'null') as Place | null;
    return p && typeof p.lat === 'number' && typeof p.lon === 'number' && Math.abs(p.lat) <= 90 && Math.abs(p.lon) <= 180 ? p : null;
  } catch { return null; }
}
export function keepPlace(p: Place): void {
  try { localStorage.setItem(KEY, JSON.stringify(p)); } catch { /* private browsing: nothing is kept */ }
}
