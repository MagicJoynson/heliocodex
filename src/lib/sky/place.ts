/**
 * The sky from one place on the Earth at one moment: which way every star, planet, the Sun and
 * the Moon lie, as a height above the horizon and a compass bearing.
 *
 * Planets come from the same JPL elements the 3D view uses (src/lib/orbit.ts), so the two agree.
 * The Moon has its own series (moon.ts). Star places are for the year 2000 and are carried to the
 * date by the slow turning of the equinoxes. Left out, because none moves anything by more than a
 * twentieth of a degree: the nodding of the Earth's axis, the bending of light by the air, the
 * time light takes to arrive, and the stars' own drift.
 */
import { positionAU, centuriesSinceJ2000 } from '../orbit';
import { moonPlace } from './moon';

export type Vec = [number, number, number];
const RAD = Math.PI / 180, AU_KM = 149597870.7, EARTH_KM = 6378.137;
export const PLANETS = ['mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune'] as const;

export interface Moment {
  /** Julian centuries from J2000. */
  T: number;
  /** The angle the sky has turned through for this place, radians (local sidereal time). */
  lst: number;
  latRad: number;
  /** The tilt of the Earth's axis on this date, radians. */
  tilt: number;
  /** How far the equinoxes have slid since 2000, radians. */
  slide: number;
}

export function moment(date: Date, latDeg: number, lonDeg: number): Moment {
  const T = centuriesSinceJ2000(date), days = T * 36525;
  // Greenwich sidereal time, Meeus (12.4)
  const gmst = 280.46061837 + 360.98564736629 * days + 0.000387933 * T * T - (T * T * T) / 38710000;
  return {
    T, latRad: latDeg * RAD,
    lst: ((((gmst + lonDeg) % 360) + 360) % 360) * RAD,
    tilt: (23.4392911 - 0.0130042 * T) * RAD,
    slide: ((5028.796195 * T + 1.1054348 * T * T) / 3600) * RAD,
  };
}

/** A direction in the ecliptic frame of 2000 (x to the equinox, z to the ecliptic pole) to height and bearing. */
export function toSky(v: Vec, m: Moment): { altDeg: number; azDeg: number } {
  // slide round the ecliptic pole to the equinox of the date, then tip from the ecliptic to the equator
  const cs = Math.cos(m.slide), ss = Math.sin(m.slide), ce = Math.cos(m.tilt), se = Math.sin(m.tilt);
  const x = v[0] * cs - v[1] * ss, y = v[0] * ss + v[1] * cs, z = v[2];
  return equatorToSky([x, y * ce - z * se, y * se + z * ce], m);
}

/** A direction in the equator's frame of the date to height and bearing (north 0°, east 90°). */
export function equatorToSky(q: Vec, m: Moment): { altDeg: number; azDeg: number } {
  const r = Math.hypot(q[0], q[1], q[2]), dec = Math.asin(q[2] / r), hour = m.lst - Math.atan2(q[1], q[0]);
  const sinAlt = Math.sin(m.latRad) * Math.sin(dec) + Math.cos(m.latRad) * Math.cos(dec) * Math.cos(hour);
  const az = Math.atan2(-Math.cos(dec) * Math.sin(hour), Math.sin(dec) * Math.cos(m.latRad) - Math.cos(dec) * Math.cos(hour) * Math.sin(m.latRad));
  return { altDeg: Math.asin(Math.max(-1, Math.min(1, sinAlt))) / RAD, azDeg: ((az / RAD) % 360 + 360) % 360 };
}

/** The star file's frame (y to the ecliptic pole) to the ecliptic frame used here. */
export const fromEngine = (x: number, y: number, z: number): Vec => [x, -z, y];

/** Where a planet is as seen from the Earth: a direction in the ecliptic frame of 2000, and its distance in au. */
export function planetFromEarth(id: string, T: number): { dir: Vec; au: number; sunAu: number } {
  const e = positionAU('earth', T), p = positionAU(id, T);
  const d: Vec = [p[0] - e[0], p[1] - e[1], p[2] - e[2]];
  return { dir: d, au: Math.hypot(...d), sunAu: Math.hypot(...p) };
}

export function sunFromEarth(T: number): Vec {
  const e = positionAU('earth', T);
  return [-e[0], -e[1], -e[2]];
}

/**
 * The Moon as seen from the place itself, not from the centre of the Earth. The difference is up
 * to a whole degree, twice the Moon's width, so it is worth making.
 */
export function moonSky(m: Moment): { altDeg: number; azDeg: number; km: number; lit: number; sunwardDeg: number; dirEq: Vec } {
  const mp = moonPlace(m.T), lon = mp.lonDeg * RAD, lat = mp.latDeg * RAD, ce = Math.cos(m.tilt), se = Math.sin(m.tilt);
  // ecliptic of the date to the equator of the date, in km
  const x = mp.km * Math.cos(lat) * Math.cos(lon), y = mp.km * Math.cos(lat) * Math.sin(lon), z = mp.km * Math.sin(lat);
  const eq: Vec = [x, y * ce - z * se, y * se + z * ce];
  // take away the place's own position on the turning Earth (a round Earth is near enough here)
  const here: Vec = [EARTH_KM * Math.cos(m.latRad) * Math.cos(m.lst), EARTH_KM * Math.cos(m.latRad) * Math.sin(m.lst), EARTH_KM * Math.sin(m.latRad)];
  const seen: Vec = [eq[0] - here[0], eq[1] - here[1], eq[2] - here[2]];
  // how much of the face is lit: from the angle between the Sun and the Moon in the sky
  const s = sunFromEarth(m.T), cs = Math.cos(m.slide), ss = Math.sin(m.slide);
  const sx = s[0] * cs - s[1] * ss, sy = s[0] * ss + s[1] * cs, sunEq: Vec = [sx, sy * ce - s[2] * se, sy * se + s[2] * ce];
  const sunKm = Math.hypot(...sunEq) * AU_KM, moonKm = Math.hypot(...seen);
  const cosApart = (sunEq[0] * seen[0] + sunEq[1] * seen[1] + sunEq[2] * seen[2]) * AU_KM / (sunKm * moonKm);
  const apart = Math.acos(Math.max(-1, Math.min(1, cosApart)));
  const phase = Math.atan2(sunKm * Math.sin(apart), moonKm - sunKm * Math.cos(apart));
  const sky = equatorToSky(seen, m), sunSky = equatorToSky(sunEq, m);
  return { ...sky, km: moonKm, lit: (1 + Math.cos(phase)) / 2, sunwardDeg: sunSky.azDeg, dirEq: seen };
}
