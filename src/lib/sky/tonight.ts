/**
 * "Tonight" for the home page: the Moon's phase and which planets can be seen by eye this evening,
 * worked out with the same sums as the sky map (place.ts, moon.ts), so the two always agree.
 * The evening is now if it is already dark (the Sun 9 degrees or more below the horizon), or else the first
 * moment the Sun is 12 degrees below it: the moment the sky map opens at, so the two give the same time.
 */
import { moment, toSky, sunFromEarth, planetFromEarth, moonSky, PLANETS } from './place';
import { moonPlace } from './moon';
import { wayOf, heightOf } from './words';

const RAD = Math.PI / 180;
const NAMES: Record<string, string> = { mercury: 'Mercury', venus: 'Venus', mars: 'Mars', jupiter: 'Jupiter', saturn: 'Saturn' };

export interface Tonight {
  /** The moment the figures are for. */
  at: Date;
  /** true if that moment is now (it is already dark), false if it is the coming dusk. */
  now: boolean;
  /** The Sun never gets 6 degrees below the horizon here in the next 24 hours (midsummer far north). */
  noDark: boolean;
  moon: { name: string; lit: number; waxing: boolean; up: boolean; where: string; rises: Date | null; sets: Date | null };
  planets: { id: string; name: string; where: string; altDeg: number }[];
}

export function phaseName(lit: number, waxing: boolean): string {
  if (lit < 0.02) return 'New Moon';
  if (lit > 0.98) return 'Full Moon';
  if (lit > 0.47 && lit < 0.53) return waxing ? 'First quarter' : 'Last quarter';
  if (lit < 0.5) return waxing ? 'Waxing crescent' : 'Waning crescent';
  return waxing ? 'Waxing gibbous' : 'Waning gibbous';
}

export function tonight(date: Date, latDeg: number, lonDeg: number): Tonight {
  const sunAlt = (d: Date) => { const m = moment(d, latDeg, lonDeg); return toSky(sunFromEarth(m.T), m).altDeg; };
  let at = date, now = true, noDark = false;
  if (sunAlt(date) >= -9) {
    now = false; noDark = true;
    for (let mins = 5; mins <= 24 * 60; mins += 5) {
      const d = new Date(date.getTime() + mins * 60000);
      if (sunAlt(d) < -12) { at = d; noDark = false; break; }
    }
    if (noDark) at = date;
  }
  const m = moment(at, latDeg, lonDeg);
  const ms = moonSky(m);
  // waxing: the Moon is 0 to 180 degrees ahead of the Sun along the ecliptic
  const s = sunFromEarth(m.T), sunLon = (Math.atan2(s[1], s[0]) / RAD + (m.slide / RAD) + 360) % 360;
  const elong = (((moonPlace(m.T).lonDeg - sunLon) % 360) + 360) % 360;
  const waxing = elong < 180;
  // the Moon's next rise and set in the 24 hours from the evening moment, found to ten minutes and then to the minute
  const moonAlt = (d: Date) => moonSky(moment(d, latDeg, lonDeg)).altDeg;
  const cross = (up: boolean): Date | null => {
    let prev = moonAlt(at);
    for (let mins = 5; mins <= 24 * 60; mins += 5) {
      const d = new Date(at.getTime() + mins * 60000), a = moonAlt(d);
      if (up ? prev <= 0 && a > 0 : prev > 0 && a <= 0) {
        for (let back = 9; back >= 0; back--) { const e = new Date(d.getTime() - back * 60000); const b = moonAlt(e); if (up ? b > 0 : b <= 0) return e; }
        return d;
      }
      prev = a;
    }
    return null;
  };
  const planets = PLANETS.filter((id) => id in NAMES)
    .map((id) => ({ id, name: NAMES[id], ...toSky(planetFromEarth(id, m.T).dir, m) }))
    .filter((k) => k.altDeg > 5)
    .sort((a, b) => b.altDeg - a.altDeg)
    .map((k) => ({ id: k.id, name: k.name, altDeg: k.altDeg, where: `${heightOf(k.altDeg)} in the ${wayOf(k.azDeg)}` }));
  return {
    at, now, noDark,
    moon: { name: phaseName(ms.lit, waxing), lit: ms.lit, waxing, up: ms.altDeg > 0, where: ms.altDeg > 0 ? `${heightOf(ms.altDeg)} in the ${wayOf(ms.azDeg)}` : 'below the horizon', rises: cross(true), sets: cross(false) },
    planets,
  };
}
