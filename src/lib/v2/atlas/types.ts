// Shared shapes for every place on the site that is not a page of prose:
// the body list, and the "view" a lesson, a fact or the atlas hands to the engine.
//
// Conventions
//   - Lengths are kilometres, angles are degrees, times are Julian dates (TDB) or days.
//     The engine converts to metres in doubles when it builds its own state.
//   - The world frame is the ecliptic and equinox of J2000, origin at the Sun.
//   - Nothing here imports three.js. These are plain data and can be read at build time.

export type BodyKind = 'star' | 'planet' | 'moon' | 'dwarf' | 'asteroid' | 'comet' | 'spacecraft';

/** The plane the orbital angles are measured from. */
export type OrbitFrame =
  /** Ecliptic and equinox of J2000. */
  | 'ecliptic-j2000'
  /** The parent's equator, found from the parent's own spin pole. */
  | 'parent-equator'
  /** The local Laplace plane. Its pole is given in `framePole` (ICRF). */
  | 'laplace';

/** Mean or osculating Keplerian elements about the parent body. */
export interface KeplerOrbit {
  type: 'kepler';
  frame: OrbitFrame;
  /** Right ascension and declination (ICRF) of the pole of the Laplace plane. Only with frame 'laplace'. */
  framePole?: { raDeg: number; decDeg: number };
  epochJd: number;
  /** Semi-major axis. */
  aKm: number;
  e: number;
  iDeg: number;
  /** Longitude of the ascending node. */
  nodeDeg: number;
  /** Argument of periapsis. */
  periDeg: number;
  /** Mean anomaly at the epoch. */
  mDeg: number;
  periodDays: number;
  /** The body goes round against its parent's spin. iDeg is already above 90 when this is set. */
  retrograde?: boolean;
  /** Time for the line of apsides to turn once. Lets a mean orbit stay roughly right far from the epoch. */
  apsisPrecessionYears?: number;
  /** Time for the node to turn once. */
  nodePrecessionYears?: number;
}

export type Orbit =
  | KeplerOrbit
  /** The eight planets: use positionAU() in src/lib/orbit.ts (JPL approximate elements with rates). */
  | { type: 'jpl-approx'; slug: string }
  /** Sampled positions for bodies no simple orbit fits, such as spacecraft. */
  | { type: 'table'; url: string }
  /** Does not move in the world frame: the Sun. */
  | { type: 'fixed' };

/** IAU rotation model, first-order terms only. */
export interface Spin {
  poleRaDeg: number;
  poleDecDeg: number;
  /** Prime meridian angle at J2000. */
  w0Deg: number;
  rateDegPerDay: number;
}

/** What the engine should draw when you get close. */
export type Look =
  /** Real map tiles on the terrain engine. */
  | { type: 'tiles'; base: string; hasHeight: boolean }
  /** A shape model for a small, lumpy body. */
  | { type: 'mesh'; url: string }
  /** Never more than a point of light at any distance we allow. */
  | { type: 'point'; colour: [number, number, number]; absMag: number }
  /** Nobody has seen it up close. Drawn as an honest guess, and labelled as one on screen. */
  | { type: 'impression'; note: string };

/** How well the real thing has been seen. Drives the on-screen "drawn, not photographed" label. */
export type Seen = 'mapped' | 'partly' | 'unresolved';

export interface Source {
  label: string;
  url: string;
}

export interface Body {
  /** Lower-case, URL-safe and unique across every kind: 'titan', 'ceres', 's-2004-s-42'. */
  id: string;
  name: string;
  kind: BodyKind;
  /** The id of the body this one orbits. Null only for the Sun. */
  parent: string | null;
  orbit: Orbit;
  /** Radius of the sphere with the same volume. Missing for moons known only as a point of light. */
  meanRadiusKm?: number;
  /** Semi-axes, where the body is clearly not a sphere. */
  radiiKm?: [number, number, number];
  /** Gravitational parameter GM, km³/s². Mass in kg is this divided by 6.6743e-20. */
  gmKm3S2?: number;
  densityGcm3?: number;
  /** Missing means not measured. For a regular moon the engine may assume it keeps one face to its parent, and must say so. */
  spin?: Spin;
  rotationHours?: number;
  look: Look;
  seen: Seen;
  discovered?: { year: number; by: string };
  /** NAIF/SPICE integer code, where one exists. Handy for checking against JPL Horizons. */
  naifId?: number;
  sources: Source[];
}

/**
 * A place to send the camera. The engine's flyTo() takes one of these, and so do
 * lessons ("Show me"), facts, glossary entries and every label on the atlas.
 */
export interface View {
  /** A Body id, or one of the larger places on the scale ladder. */
  target: string | ScalePlace;
  /** Stand at a spot on the surface. Longitude is east-positive. */
  place?: { latDeg: number; lonDeg: number; altKm: number };
  /** Otherwise, how far from the target's centre to stop. Left out, the engine frames the target. */
  distanceKm?: number;
  /** A Body id to keep in shot behind the target, for example 'saturn' from Titan. */
  facing?: string;
  /** Set the clock on arrival. ISO 8601, UTC. */
  timeIso?: string;
  /** Body ids or layer names to pick out on arrival. */
  highlight?: string[];
}

/** The rungs of the ladder above single bodies. */
export type ScalePlace =
  | 'solar-system'
  | 'oort-cloud'
  | 'neighbourhood'
  | 'night-sky'
  | 'milky-way'
  | 'local-group'
  | 'cosmic-web'
  | 'cmb';
