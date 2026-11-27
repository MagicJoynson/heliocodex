/**
 * "Sky this week": what happens in the sky over the next seven days, worked out in the page from the same
 * sums as the sky map (place.ts, moon.ts), so the two agree. Nothing is fetched.
 *
 * - Moon phases, and the Moon's nearest and farthest points, from the Moon series in moon.ts.
 * - Planet pairings, oppositions, conjunctions with the Sun and greatest elongations, from the JPL
 *   approximate elements (src/lib/orbit.ts). Those are good to a few arcminutes, so a timing is good to
 *   a few hours for a slow planet and better for the Moon.
 * - Meteor showers: the peak is the moment the Sun reaches the solar longitude the International Meteor
 *   Organization gives for it (2026 Meteor Shower Calendar, Table 5). Showers' peaks are not known more
 *   closely than that, which the page says.
 * - Planet brightness: the formulas in the Astronomical Almanac (Meeus, "Astronomical Algorithms", chapter 41).
 */
import { moment, toSky, sunFromEarth, planetFromEarth, moonSky, type Vec } from './place';
import { moonPlace } from './moon';
import { positionAU, centuriesSinceJ2000 } from '../orbit';

const RAD = Math.PI / 180, MIN = 60000, DAY = 86400000;
export const NAKED = ['mercury', 'venus', 'mars', 'jupiter', 'saturn'] as const;
export type Naked = typeof NAKED[number];
export const NAME: Record<string, string> = { mercury: 'Mercury', venus: 'Venus', mars: 'Mars', jupiter: 'Jupiter', saturn: 'Saturn' };

const norm = (d: number) => ((d % 360) + 360) % 360;
const signed = (d: number) => { const n = norm(d); return n > 180 ? n - 360 : n; };
const slideOf = (T: number) => (5028.796195 * T + 1.1054348 * T * T) / 3600; // degrees
const T_ = (d: Date) => centuriesSinceJ2000(d);

/** Ecliptic longitude and latitude of the date, degrees, from a direction in the ecliptic frame of 2000. */
function lonLat(v: Vec, T: number): [number, number] {
  return [norm(Math.atan2(v[1], v[0]) / RAD + slideOf(T)), Math.atan2(v[2], Math.hypot(v[0], v[1])) / RAD];
}
export const sunLon = (d: Date) => lonLat(sunFromEarth(T_(d)), T_(d))[0];
/** The Sun's longitude on the ecliptic and equinox of 2000.0, the frame the IMO gives shower maxima in. */
const sunLon2000 = (d: Date) => lonLat(sunFromEarth(T_(d)), 0)[0];
export const moonLon = (d: Date) => moonPlace(T_(d)).lonDeg;
function apart(a: [number, number], b: [number, number]): number {
  const c = Math.sin(a[1] * RAD) * Math.sin(b[1] * RAD) + Math.cos(a[1] * RAD) * Math.cos(b[1] * RAD) * Math.cos((a[0] - b[0]) * RAD);
  return Math.acos(Math.max(-1, Math.min(1, c))) / RAD;
}
const planetLL = (id: string, d: Date) => lonLat(planetFromEarth(id, T_(d)).dir, T_(d));
const moonLL = (d: Date): [number, number] => { const p = moonPlace(T_(d)); return [p.lonDeg, p.latDeg]; };

/** The angle between the Moon and the Sun along the ecliptic, 0 at new Moon, 180 at full. */
export const elongationMoon = (d: Date) => norm(moonLon(d) - sunLon(d));
/** A planet's longitude minus the Sun's, -180 to 180: negative in the morning sky (west of the Sun), positive in the evening. */
export const eastOfSun = (id: string, d: Date) => signed(planetLL(id, d)[0] - sunLon(d));

/** Where a function changes sign between two instants, to the minute. */
function bisect(f: (d: Date) => number, a: number, b: number): Date {
  let fa = f(new Date(a));
  while (b - a > MIN) {
    const m = Math.floor((a + b) / 2), fm = f(new Date(m));
    if ((fm > 0) === (fa > 0)) { a = m; fa = fm; } else b = m;
  }
  return new Date(b);
}
/** Every change of sign of f in [from, to], looked for every `step` ms. */
export function crossings(f: (d: Date) => number, from: Date, to: Date, step: number): { at: Date; up: boolean }[] {
  const out: { at: Date; up: boolean }[] = [];
  let t = from.getTime(), prev = f(from);
  while (t < to.getTime()) {
    const n = Math.min(t + step, to.getTime()), v = f(new Date(n));
    if (prev !== 0 && (v > 0) !== (prev > 0) && Math.abs(v - prev) < 180) out.push({ at: bisect(f, t, n), up: v > prev });
    t = n; prev = v;
  }
  return out;
}
/** Where a function that turns round at 360 passes a target angle. */
const passes = (f: (d: Date) => number, target: number) => (d: Date) => signed(f(d) - target);

/** The smallest value of f in [from, to] if it falls inside (not at an end), found to about ten minutes. */
function lowest(f: (d: Date) => number, from: Date, to: Date, step: number, sign = 1): { at: Date; v: number } | null {
  let best = Infinity, at = 0, i = 0, n = 0;
  for (let t = from.getTime(); t <= to.getTime(); t += step, n++) { const v = sign * f(new Date(t)); if (v < best) { best = v; at = t; i = n; } }
  if (i === 0 || at + step > to.getTime()) return null;
  // refine
  let lo = at - step, hi = at + step;
  for (let k = 0; k < 30; k++) {
    const a = lo + (hi - lo) / 3, b = hi - (hi - lo) / 3;
    if (sign * f(new Date(a)) < sign * f(new Date(b))) hi = b; else lo = a;
  }
  const m = Math.round((lo + hi) / 2 / MIN) * MIN;
  return { at: new Date(m), v: sign * f(new Date(m)) };
}

// ---- brightness -------------------------------------------------------------------------------

/** How bright a planet looks, and how far from the Sun, for the date. Magnitude: the Astronomical Almanac's formulas. */
export function planetLook(id: Naked, d: Date): { mag: number; au: number; elongDeg: number; lit: number } {
  const T = T_(d), p = planetFromEarth(id, T), e = positionAU('earth', T), R = Math.hypot(e[0], e[1], e[2]);
  const r = p.sunAu, D = p.au;
  const cosI = (r * r + D * D - R * R) / (2 * r * D), i = Math.acos(Math.max(-1, Math.min(1, cosI))) / RAD;
  const lg = 5 * Math.log10(r * D);
  let mag: number;
  if (id === 'mercury') mag = -0.42 + lg + 0.038 * i - 0.000273 * i * i + 0.000002 * i ** 3;
  else if (id === 'venus') mag = -4.4 + lg + 0.0009 * i + 0.000239 * i * i - 0.00000065 * i ** 3;
  else if (id === 'mars') mag = -1.52 + lg + 0.016 * i;
  else if (id === 'jupiter') mag = -9.4 + lg + 0.005 * i;
  else {
    // Saturn: the rings add light when they are tipped towards us (Meeus ch. 45 for the tilt)
    const [lam, bet] = lonLat(p.dir, T), omega = 169.50847 + 1.394681 * T, inc = 28.075216;
    const sinB = Math.sin(inc * RAD) * Math.cos(bet * RAD) * Math.sin((lam - omega) * RAD) - Math.cos(inc * RAD) * Math.sin(bet * RAD);
    mag = -8.88 + lg - 2.6 * Math.abs(sinB) + 1.25 * sinB * sinB;
  }
  const sun = sunFromEarth(T), el = Math.acos((p.dir[0] * sun[0] + p.dir[1] * sun[1] + p.dir[2] * sun[2]) / (D * R)) / RAD;
  return { mag, au: D, elongDeg: el, lit: (1 + cosI) / 2 };
}

// ---- meteor showers ---------------------------------------------------------------------------

/**
 * The year's main meteor showers: International Meteor Organization, 2026 Meteor Shower Calendar, Table 5
 * (Working List of Visual Meteor Showers). `peakLon` is the solar longitude of the maximum (2000.0),
 * `zhr` the rate under a perfect sky, `kms` the speed in km/s. Active dates are month-day ranges.
 */
export interface Shower { name: string; from: [number, number]; to: [number, number]; peakLon: number; zhr: number; kms: number }
export const SHOWERS: Shower[] = [
  { name: 'Quadrantids', from: [12, 28], to: [1, 12], peakLon: 283.15, zhr: 80, kms: 41 },
  { name: 'April Lyrids', from: [4, 14], to: [4, 30], peakLon: 32.32, zhr: 18, kms: 49 },
  { name: 'Eta Aquariids', from: [4, 19], to: [5, 28], peakLon: 45.5, zhr: 50, kms: 66 },
  { name: 'Perseids', from: [7, 17], to: [8, 24], peakLon: 140.0, zhr: 100, kms: 59 },
  { name: 'Orionids', from: [10, 2], to: [11, 7], peakLon: 208, zhr: 20, kms: 66 },
  { name: 'Leonids', from: [11, 6], to: [11, 30], peakLon: 235.27, zhr: 15, kms: 71 },
  { name: 'Geminids', from: [12, 4], to: [12, 20], peakLon: 262.2, zhr: 150, kms: 35 },
  { name: 'Ursids', from: [12, 17], to: [12, 26], peakLon: 270.7, zhr: 10, kms: 33 },
];
/** The moment the Sun is at a given longitude, nearest to a date, searching a year either side of it. */
export function sunAt(lon: number, near: Date): Date {
  // step through the year after `near` and take the first pass
  const f = passes(sunLon2000, lon);
  const c = crossings(f, new Date(near.getTime() - 2 * DAY), new Date(near.getTime() + 368 * DAY), 12 * 3600000).filter((x) => x.up);
  return c[0].at;
}
export function showerActive(s: Shower, d: Date, zone = 'UTC'): boolean {
  const [m, day] = monthDay(d, zone), v = m * 100 + day, a = s.from[0] * 100 + s.from[1], b = s.to[0] * 100 + s.to[1];
  return a <= b ? v >= a && v <= b : v >= a || v <= b;
}
function monthDay(d: Date, zone: string): [number, number] {
  const p = new Intl.DateTimeFormat('en-GB', { timeZone: zone, month: 'numeric', day: 'numeric' }).formatToParts(d);
  return [+p.find((x) => x.type === 'month')!.value, +p.find((x) => x.type === 'day')!.value];
}

// ---- the week ---------------------------------------------------------------------------------

export interface Event { at: Date; kind: 'moon' | 'planets' | 'sun' | 'meteors' | 'orbit'; title: string; text: string; lit?: number }
const PHASES = [[0, 'New Moon'], [90, 'First quarter'], [180, 'Full Moon'], [270, 'Last quarter']] as const;
const degs = (n: number) => `${n.toFixed(1).replace(/\.0$/, '')}°`;

/** Events between two instants, in time order. */
export function events(from: Date, to: Date): Event[] {
  const out: Event[] = [];
  const step = 3 * 3600000;
  // phases of the Moon
  for (const [target, name] of PHASES) {
    for (const c of crossings(passes(elongationMoon, target), from, to, step)) {
      if (!c.up) continue;
      out.push({ at: c.at, kind: 'moon', title: name, text: name === 'New Moon' ? 'The Moon is between us and the Sun, so the dark side faces us. The nights are at their darkest for faint things: a good time for galaxies and the Milky Way.' : name === 'Full Moon' ? 'The Moon is opposite the Sun and rises at sunset. Its light washes out faint stars and meteors.' : `Half the Moon's face is lit, ${name === 'First quarter' ? 'in the evening sky' : 'in the morning sky'}. Shadows along the terminator show the craters best now.` });
    }
  }
  // the Moon's nearest and farthest points
  const km = (d: Date) => moonPlace(T_(d)).km;
  const near = lowest(km, from, to, step), far = lowest(km, from, to, step, -1);
  const kmText = (v: number) => (Math.round(Math.abs(v) / 100) * 100).toLocaleString('en-GB');
  if (near) out.push({ at: near.at, kind: 'orbit', title: 'Moon at its nearest', text: `The Moon is ${kmText(near.v)} km away, the closest point of this month's orbit.` });
  if (far) out.push({ at: far.at, kind: 'orbit', title: 'Moon at its farthest', text: `The Moon is ${kmText(far.v)} km away, the farthest point of this month's orbit.` });
  // the Moon passing a planet
  for (const id of NAKED) {
    const gap = (d: Date) => apart(moonLL(d), planetLL(id, d));
    const m = lowest(gap, new Date(from.getTime() - 6 * 3600000), new Date(to.getTime() + 6 * 3600000), 30 * MIN);
    if (m && m.v < 5 && m.at >= from && m.at <= to) out.push({ at: m.at, kind: 'planets', title: `Moon near ${NAME[id]}`, text: `The Moon passes ${degs(m.v)} from ${NAME[id]}, measured from the centre of the Earth. From where you stand the gap can differ by up to a degree, because the Moon is so close.` });
  }
  // two planets close together
  for (let i = 0; i < NAKED.length; i++) for (let j = i + 1; j < NAKED.length; j++) {
    const a = NAKED[i], b = NAKED[j], gap = (d: Date) => apart(planetLL(a, d), planetLL(b, d));
    const m = lowest(gap, new Date(from.getTime() - DAY), new Date(to.getTime() + DAY), 6 * 3600000);
    if (m && m.v < 4 && m.at >= from && m.at <= to) out.push({ at: m.at, kind: 'planets', title: `${NAME[a]} and ${NAME[b]} close`, text: `${NAME[a]} and ${NAME[b]} are ${degs(m.v)} apart, at their closest. They look close, but are millions of kilometres apart.` });
  }
  // a planet at opposition, behind the Sun, or at its widest from the Sun
  for (const id of NAKED) {
    const e = (d: Date) => eastOfSun(id, d);
    if (id === 'mars' || id === 'jupiter' || id === 'saturn') {
      const diff = (d: Date) => planetLL(id, d)[0] - sunLon(d);
      for (const c of crossings(passes(diff, 180), from, to, 12 * 3600000)) {
        out.push({ at: c.at, kind: 'planets', title: `${NAME[id]} at opposition`, text: `${NAME[id]} is directly opposite the Sun: rising at sunset, highest at midnight, and close to its nearest and brightest of the year.` });
      }
    }
    for (const c of crossings(e, from, to, 12 * 3600000)) {
      if (Math.abs(e(c.at)) < 10) {
        const inner = id === 'mercury' || id === 'venus', between = inner && planetFromEarth(id, T_(c.at)).au < 1;
        const title = inner ? `${NAME[id]} in ${between ? 'inferior' : 'superior'} conjunction` : `${NAME[id]} in conjunction with the Sun`;
        out.push({ at: c.at, kind: 'planets', title, text: `${NAME[id]} passes ${between ? 'between us and the Sun' : 'behind the Sun'}, lost in its glare for some weeks.` });
      }
    }
    if (id === 'mercury' || id === 'venus') {
      const w = lowest((d) => planetLook(id, d).elongDeg, from, to, 6 * 3600000, -1);
      if (w) {
        const east = eastOfSun(id, w.at) > 0;
        out.push({ at: w.at, kind: 'planets', title: `${NAME[id]} at greatest elongation ${east ? 'east' : 'west'}`, text: `${NAME[id]} is as far from the Sun as it gets this time round, ${degs(Math.abs(w.v))}, so it stands highest in the ${east ? 'evening' : 'morning'} sky.` });
      }
    }
  }
  // equinox and solstice
  for (const [lon, name, text] of [[0, 'March equinox', 'Day and night are equal everywhere on Earth. The Sun crosses the equator going north.'], [90, 'June solstice', 'The Sun is at its farthest north: the longest day in the north and the shortest in the south.'], [180, 'September equinox', 'Day and night are equal everywhere on Earth. The Sun crosses the equator going south.'], [270, 'December solstice', 'The Sun is at its farthest south: the shortest day in the north and the longest in the south.']] as const) {
    for (const c of crossings(passes(sunLon, lon), from, to, 12 * 3600000)) if (c.up) out.push({ at: c.at, kind: 'sun', title: name, text });
  }
  // meteor shower peaks
  for (const s of SHOWERS) for (const c of crossings(passes(sunLon2000, s.peakLon), from, to, 12 * 3600000)) if (c.up) out.push({ at: c.at, kind: 'meteors', title: `${s.name} peak`, text: `Up to about ${s.zhr} an hour under a perfect dark sky, at ${s.kms} km/s. The peak is known only to within about a day.` });
  return out.sort((a, b) => a.at.getTime() - b.at.getTime());
}

/** How much of the Moon's face is lit at a moment, 0 to 1, and whether it is growing. */
export function moonLit(d: Date): { lit: number; waxing: boolean } {
  const lit = (1 - Math.cos(elongationMoon(d) * RAD)) / 2;
  return { lit, waxing: elongationMoon(d) < 180 };
}

// ---- days, times and places -------------------------------------------------------------------

/** Minutes the zone's clocks are ahead of UTC at a moment. */
export function offsetMin(d: Date, zone: string): number {
  const p = new Intl.DateTimeFormat('en-GB', { timeZone: zone, hourCycle: 'h23', year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric' }).formatToParts(d);
  const g = (t: string) => +p.find((x) => x.type === t)!.value;
  return (Date.UTC(g('year'), g('month') - 1, g('day'), g('hour'), g('minute'), g('second')) - Math.floor(d.getTime() / 1000) * 1000) / MIN;
}
/** The instant the zone's clock reads 00:00 on the day that contains `d`, plus `days` days. */
export function localMidnight(d: Date, zone: string, days = 0): Date {
  const off = offsetMin(d, zone), local = new Date(d.getTime() + off * MIN);
  const y = local.getUTCFullYear(), m = local.getUTCMonth(), day = local.getUTCDate() + days;
  const guess = Date.UTC(y, m, day);
  const first = guess - offsetMin(new Date(guess - off * MIN), zone) * MIN;
  return new Date(guess - offsetMin(new Date(first), zone) * MIN);
}

const alt = {
  sun: (la: number, lo: number) => (d: Date) => { const m = moment(d, la, lo); return toSky(sunFromEarth(m.T), m).altDeg; },
  moon: (la: number, lo: number) => (d: Date) => moonSky(moment(d, la, lo)).altDeg,
  planet: (id: string, la: number, lo: number) => (d: Date) => { const m = moment(d, la, lo); return toSky(planetFromEarth(id, m.T).dir, m).altDeg; },
};

export interface Day {
  start: Date;
  sunrise: Date | null; sunset: Date | null;
  /** The sky is darker than 18 degrees of Sun below the horizon, from and to; null if it never gets that dark. */
  darkFrom: Date | null; darkTo: Date | null;
  /** 'polar day' | 'polar night' when the Sun neither rises nor sets in the day. */
  sunNote: '' | 'The Sun stays up all day' | 'The Sun stays down all day';
  moon: { lit: number; waxing: boolean; name: string; rises: Date | null; sets: Date | null };
}
export function phaseName(lit: number, waxing: boolean): string {
  if (lit < 0.02) return 'New Moon';
  if (lit > 0.98) return 'Full Moon';
  if (lit > 0.47 && lit < 0.53) return waxing ? 'First quarter' : 'Last quarter';
  if (lit < 0.5) return waxing ? 'Waxing crescent' : 'Waning crescent';
  return waxing ? 'Waxing gibbous' : 'Waning gibbous';
}
const first = (f: (d: Date) => number, level: number, from: Date, to: Date, up: boolean, step = 10 * MIN): Date | null =>
  crossings((d) => f(d) - level, from, to, step).find((c) => c.up === up)?.at ?? null;

export function day(start: Date, lat: number, lon: number): Day {
  const end = new Date(start.getTime() + 24 * 3600000), sun = alt.sun(lat, lon), mo = alt.moon(lat, lon);
  const sunrise = first(sun, -0.833, start, end, true), sunset = first(sun, -0.833, start, end, false);
  // the night that begins this evening: from sunset to the next morning
  const noon = new Date(start.getTime() + 12 * 3600000), next = new Date(noon.getTime() + 24 * 3600000);
  const darkFrom = first(sun, -18, noon, next, false), darkTo = darkFrom ? first(sun, -18, darkFrom, next, true) : null;
  let sunNote: Day['sunNote'] = '';
  if (!sunrise && !sunset) sunNote = sun(noon) > 0 ? 'The Sun stays up all day' : 'The Sun stays down all day';
  const eve = new Date(start.getTime() + 20 * 3600000), { lit, waxing } = moonLit(eve);
  return { start, sunrise, sunset, darkFrom, darkTo, sunNote, moon: { lit, waxing, name: phaseName(lit, waxing), rises: first(mo, -0.83, start, end, true), sets: first(mo, -0.83, start, end, false) } };
}

export interface PlanetWeek {
  id: Naked; name: string; mag: number; elongDeg: number; au: number; lit: number;
  eveningStar: boolean;
  evening: { altDeg: number; azDeg: number };
  morning: { altDeg: number; azDeg: number };
  rises: Date | null; sets: Date | null;
}
/** The moment the evening sky is dark enough to look: the Sun 12 degrees down (or now, if it already is), and the moment the morning sky stops being. */
export function nightEdges(from: Date, lat: number, lon: number): { evening: Date; morning: Date; dark: boolean } {
  const sun = alt.sun(lat, lon), horizon = 24 * 3600000;
  let evening = from, dark = true;
  if (sun(from) >= -9) {
    const e = first(sun, -12, from, new Date(from.getTime() + horizon), false);
    if (e) evening = e; else dark = false;
  }
  const m = first(sun, -12, evening, new Date(evening.getTime() + horizon), true);
  return { evening, morning: m ?? new Date(evening.getTime() + 8 * 3600000), dark };
}
export function planetsWeek(from: Date, lat: number, lon: number, edges = nightEdges(from, lat, lon)): PlanetWeek[] {
  return NAKED.map((id) => {
    const look = planetLook(id, edges.evening), f = alt.planet(id, lat, lon);
    const at = (d: Date) => { const m = moment(d, lat, lon); return toSky(planetFromEarth(id, m.T).dir, m); };
    const a = at(edges.evening), b = at(edges.morning), end = new Date(from.getTime() + 24 * 3600000);
    return { id, name: NAME[id], ...look, eveningStar: eastOfSun(id, edges.evening) > 0, evening: { altDeg: a.altDeg, azDeg: a.azDeg }, morning: { altDeg: b.altDeg, azDeg: b.azDeg }, rises: first(f, -0.57, from, end, true), sets: first(f, -0.57, from, end, false) };
  });
}
