/**
 * "Tonight" for the home page: the Moon's phase and which planets can be seen by eye this evening,
 * worked out with the same sums as the sky map (place.ts, moon.ts), so the two always agree.
 * The evening is now if it is already dark, or else the first moment today when the Sun is 6 degrees
 * below the horizon (civil dusk, when the brightest planets show).
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
  moon: { name: string; lit: number; waxing: boolean; up: boolean; where: string };
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
  if (sunAlt(date) > -6) {
    now = false; noDark = true;
    for (let mins = 10; mins <= 24 * 60; mins += 10) {
      const d = new Date(date.getTime() + mins * 60000);
      if (sunAlt(d) <= -6) { at = d; noDark = false; break; }
    }
    if (noDark) at = date;
  }
  const m = moment(at, latDeg, lonDeg);
  const ms = moonSky(m);
  // waxing: the Moon is 0 to 180 degrees ahead of the Sun along the ecliptic
  const s = sunFromEarth(m.T), sunLon = (Math.atan2(s[1], s[0]) / RAD + (m.slide / RAD) + 360) % 360;
  const elong = (((moonPlace(m.T).lonDeg - sunLon) % 360) + 360) % 360;
  const waxing = elong < 180;
  const planets = PLANETS.filter((id) => id in NAMES)
    .map((id) => ({ id, name: NAMES[id], ...toSky(planetFromEarth(id, m.T).dir, m) }))
    .filter((k) => k.altDeg > 5)
    .sort((a, b) => b.altDeg - a.altDeg)
    .map((k) => ({ id: k.id, name: k.name, altDeg: k.altDeg, where: `${heightOf(k.altDeg)} in the ${wayOf(k.azDeg)}` }));
  return {
    at, now, noDark,
    moon: { name: phaseName(ms.lit, waxing), lit: ms.lit, waxing, up: ms.altDeg > 0, where: ms.altDeg > 0 ? `${heightOf(ms.altDeg)} in the ${wayOf(ms.azDeg)}` : 'below the horizon' },
    planets,
  };
}
