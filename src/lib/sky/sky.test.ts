// Run with: npm run test:sky
// Checks the sky sums against worked examples in Meeus, "Astronomical Algorithms" (2nd ed.), and
// against places read from JPL Horizons (noted beside each).
import { moonPlace } from './moon';
import { moment, toSky, planetFromEarth, sunFromEarth, moonSky, type Vec } from './place';
import { centuriesSinceJ2000 } from '../orbit';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { pageStars } from './starlist';
import { MODERN, LY_PER_PC } from './star';

const failed: string[] = [];
function test(name: string, fn: () => void) {
  try { fn(); console.log(`ok    ${name}`); } catch (e) { failed.push(name); console.log(`FAIL  ${name}\n      ${(e as Error).message}`); }
}
function near(got: number, want: number, within: number, what: string) {
  if (!(Math.abs(got - want) <= within)) throw new Error(`${what}: got ${got.toFixed(4)}, wanted ${want} within ${within}`);
}
const RAD = Math.PI / 180;
/** Right ascension and declination of the date, degrees, from a direction in the ecliptic frame of 2000. */
export function raDec(v: Vec, date: Date): [number, number] {
  // looking from the north pole at Greenwich sidereal time zero puts right ascension on the bearing
  const m = moment(date, 90, 0), s = toSky(v, m);
  return [(((m.lst / RAD + 180 - s.azDeg) % 360) + 360) % 360, s.altDeg];
}

test('Moon: Meeus example 47.a, 12 April 1992 at 0h', () => {
  const p = moonPlace((2448724.5 - 2451545) / 36525);
  near(p.lonDeg, 133.162655, 0.03, 'longitude');
  near(p.latDeg, -3.229126, 0.02, 'latitude');
  near(p.km, 368409.7, 60, 'distance');
});

test('Sidereal time: Meeus example 12.b, 10 April 1987 at 19:21 UT', () => {
  const m = moment(new Date(Date.UTC(1987, 3, 10, 19, 21, 0)), 0, 0);
  near(m.lst / RAD, 128.7378734, 0.001, 'Greenwich sidereal time');
});

test('A star: Polaris stays within a degree of the pole', () => {
  // Polaris, J2000: RA 2h 31m 49s, Dec +89° 15' 51"
  const ra = 37.954 * RAD, dec = 89.264 * RAD, e = 23.4392911 * RAD;
  const q: Vec = [Math.cos(dec) * Math.cos(ra), Math.cos(dec) * Math.sin(ra), Math.sin(dec)];
  const v: Vec = [q[0], q[1] * Math.cos(e) + q[2] * Math.sin(e), -q[1] * Math.sin(e) + q[2] * Math.cos(e)];
  const s = toSky(v, moment(new Date(Date.UTC(2026, 10, 11, 21, 0, 0)), 53.48, -2.24));
  near(s.altDeg, 53.48, 0.75, 'height of Polaris from Manchester');
  if (!(s.azDeg < 2 || s.azDeg > 358)) throw new Error(`Polaris bearing ${s.azDeg}`);
});

// JPL Horizons, observer at 53.48° N, 2.24° W, 11 November 2026 at 21:00 UT, apparent azimuth and
// elevation (quantity 4), read on 11 November 2026.
const HORIZONS: Record<string, [number, number]> = {
  venus: [336.38344, -45.424221], mars: [36.74414, -14.294237], jupiter: [36.241067, -16.185922], saturn: [173.411271, 37.338442],
};
const WHEN = new Date(Date.UTC(2026, 10, 11, 21, 0, 0)), HERE = moment(WHEN, 53.48, -2.24);

test('Planets: within a fifth of a degree of JPL Horizons', () => {
  for (const [id, [az, alt]] of Object.entries(HORIZONS)) {
    const s = toSky(planetFromEarth(id, centuriesSinceJ2000(WHEN)).dir, HERE);
    near(s.azDeg, az, 0.2, `${id} bearing`); near(s.altDeg, alt, 0.2, `${id} height`);
  }
});

test('The Sun: within a tenth of a degree of JPL Horizons', () => {
  const s = toSky(sunFromEarth(centuriesSinceJ2000(WHEN)), HERE);
  near(s.azDeg, 300.054032, 0.1, 'bearing'); near(s.altDeg, -41.00757, 0.1, 'height');
});

test('The Moon from the ground: within a tenth of a degree of JPL Horizons, and 6 per cent lit', () => {
  const s = moonSky(HERE);
  near(s.azDeg, 265.43318, 0.1, 'bearing'); near(s.altDeg, -32.415736, 0.1, 'height');
  near(s.lit * 100, 6.23528, 0.5, 'lit per cent');
});

test('Stars with a corrected distance are drawn in 3D where their page says they are', () => {
  const bin = readFileSync('public/data/deep/stars.bin');
  for (const [slug, m] of Object.entries(MODERN)) {
    const s = pageStars().find((p) => p.slug === slug); if (!s) throw new Error(`${slug}: no star page`);
    const r = Math.hypot(bin.readFloatLE(s.index * 20), bin.readFloatLE(s.index * 20 + 4), bin.readFloatLE(s.index * 20 + 8));
    near(r, m.pc, m.pc * 0.002, `${slug} 3D distance in parsecs`);
  }
});

// Prose that says how far a named star is must agree with the star's own page (to rounding), so a figure cannot drift
// from one place to another. The first "N light years" within 70 characters after a star's name is the one checked.
test('Distances in lessons, facts, glossary and 3D captions match the star pages', () => {
  const walk = (d: string): string[] => readdirSync(d).flatMap((n) => { const p = `${d}/${n}`; return statSync(p).isDirectory() ? walk(p) : /\.(md|yaml|ts)$/.test(p) && !/\.test\./.test(p) ? [p] : []; });
  const stars = pageStars().filter((s) => s.proper && s.proper.length > 3).map((s) => ({ name: s.proper, ly: s.distPc * LY_PER_PC }));
  const names = stars.map((s) => s.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
  const re = new RegExp(`(?<![A-Za-z])(${names})(?![A-Za-z])[^.\\n]{0,70}?(\\d[\\d,]*(?:\\.\\d+)?) light[- ]years`, 'g');
  const bad: string[] = [];
  for (const file of [...walk('src/content'), ...walk('src/lib/learn')]) {
    for (const m of readFileSync(file, 'utf8').matchAll(re)) {
      const star = stars.find((s) => s.name === m[1])!, said = parseFloat(m[2].replace(/,/g, ''));
      if (Math.abs(said - star.ly) / star.ly > 0.02 && !(said >= 8 && Math.abs(said - star.ly) <= 0.5)) bad.push(`${file}: ${m[1]} says ${said}, its page says ${star.ly.toFixed(1)}`);
    }
  }
  if (bad.length) throw new Error(bad.join('\n'));
});


// ---- Sky this week (week.ts) ----
import { events, moonLit, planetLook, sunAt, localMidnight, day, SHOWERS } from './week';
const at = (s: string) => new Date(s);
const find = (list: ReturnType<typeof events>, title: string) => list.find((e) => e.title === title);

test('Week: Moon phases fall within 15 minutes of USNO times (New 2025-11-20 06:47 UT, Full 2025-12-04 23:14 UT)', () => {
  const e = events(at('2025-11-15T00:00:00Z'), at('2025-12-08T00:00:00Z'));
  near(find(e, 'New Moon')!.at.getTime() / 60000, at('2025-11-20T06:47:00Z').getTime() / 60000, 15, 'new moon (minutes)');
  near(find(e, 'Full Moon')!.at.getTime() / 60000, at('2025-12-04T23:14:00Z').getTime() / 60000, 15, 'full moon (minutes)');
});
test('Week: oppositions land within a day of the almanac (Mars 2025-01-16, Saturn 2025-09-21, Jupiter 2026-01-10)', () => {
  for (const [id, when, from, to] of [['Mars', '2025-01-16T00:00:00Z', '2025-01-01', '2025-02-01'], ['Saturn', '2025-09-21T00:00:00Z', '2025-09-05', '2025-10-05'], ['Jupiter', '2026-01-10T00:00:00Z', '2025-12-28', '2026-01-25']]) {
    const e = find(events(at(from), at(to)), `${id} at opposition`);
    if (!e) throw new Error(`no ${id} opposition found`);
    near(e.at.getTime() / 86400000, at(when).getTime() / 86400000, 1.5, `${id} opposition (days)`);
  }
});
test('Week: Venus greatest elongation west 2025-06-01 (45.9 degrees) within two days', () => {
  const e = find(events(at('2025-05-20'), at('2025-06-15')), 'Venus at greatest elongation west');
  if (!e) throw new Error('not found');
  near(e.at.getTime() / 86400000, at('2025-06-01T00:00:00Z').getTime() / 86400000, 2.5, 'days');
  near(planetLook('venus', e.at).elongDeg, 45.9, 0.5, 'elongation');
});
test('Week: brightness of the planets is in the right range', () => {
  near(planetLook('venus', at('2025-06-01')).mag, -4.2, 0.4, 'Venus');
  near(planetLook('jupiter', at('2025-12-07')).mag, -2.7, 0.3, 'Jupiter at opposition');
  near(planetLook('mars', at('2025-01-16')).mag, -1.4, 0.3, 'Mars at opposition');
  near(planetLook('saturn', at('2025-09-21')).mag, 0.7, 0.5, 'Saturn');
});
test('Week: the solstice is on 21 Dec 2025 at about 15:03 UT', () => {
  const e = find(events(at('2025-12-18'), at('2025-12-24')), 'December solstice')!;
  near(e.at.getTime() / 60000, at('2025-12-21T15:03:00Z').getTime() / 60000, 30, 'minutes');
});
test('Week: Geminids peak on the night of 13-14 December 2025', () => {
  const t = sunAt(SHOWERS.find((s) => s.name === 'Geminids')!.peakLon, at('2025-12-01'));
  if (t < at('2025-12-13T12:00:00Z') || t > at('2025-12-14T12:00:00Z')) throw new Error(t.toISOString());
});
test('Week: London sunrise and sunset on 21 Dec 2025 are about 08:04 and 15:53 GMT', () => {
  const d = day(localMidnight(at('2025-12-21T12:00:00Z'), 'Europe/London'), 51.51, -0.13);
  near(d.sunrise!.getUTCHours() * 60 + d.sunrise!.getUTCMinutes(), 8 * 60 + 4, 4, 'sunrise');
  near(d.sunset!.getUTCHours() * 60 + d.sunset!.getUTCMinutes(), 15 * 60 + 53, 4, 'sunset');
});
test('Week: local midnight survives the clocks changing (London, 26 Oct 2025, 25 hours long)', () => {
  const a = localMidnight(at('2025-10-26T12:00:00Z'), 'Europe/London'), b = localMidnight(at('2025-10-26T12:00:00Z'), 'Europe/London', 1);
  near((b.getTime() - a.getTime()) / 3600000, 25, 0.001, 'hours');
});
test('Week: Moon lit fraction near 0 at new Moon and near 1 at full', () => {
  near(moonLit(at('2025-11-20T06:47:00Z')).lit, 0, 0.01, 'new'); near(moonLit(at('2025-12-04T23:14:00Z')).lit, 1, 0.01, 'full');
});
console.log(failed.length ? `\n${failed.length} failed` : '\nall passed');
if (failed.length) throw new Error(`${failed.length} sky tests failed`);
