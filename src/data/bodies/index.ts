// One list of every body the site knows about, in the shape the engine and the
// margin both read. Planets come from the v1 facts file, moons and dwarf planets
// from the JPL tables built by scripts/data/build-bodies.py.
import type { Body, KeplerOrbit, Look, Seen, Source } from '../../lib/v2/atlas/types';
import facts from '../facts.json';
import moonFile from './moons.json';
import dwarfFile from './dwarfs.json';

const JPL_SATS: Source = { label: 'NASA/JPL Solar System Dynamics, planetary satellites', url: 'https://ssd.jpl.nasa.gov/sats/' };
const JPL_SBDB: Source = { label: 'NASA/JPL Small-Body Database', url: 'https://ssd.jpl.nasa.gov/tools/sbdb_lookup.html' };
const nssdc = (slug: string): Source => ({ label: 'NASA NSSDC fact sheet', url: `https://nssdc.gsfc.nasa.gov/planetary/factsheet/${slug}fact.html` });

// Bodies with a global map made by a spacecraft, good enough to stand on.
// The tile sets themselves arrive with the terrain engine; until then `base` is the planned path.
const MAPPED = new Set([
  'moon', 'io', 'europa', 'ganymede', 'callisto', 'mimas', 'enceladus', 'tethys', 'dione', 'rhea',
  'titan', 'iapetus', 'charon', 'pluto', 'ceres',
]);
// Seen by a spacecraft, but only one side or only from far off.
const PARTLY = new Set([
  'phobos', 'deimos', 'amalthea', 'thebe', 'hyperion', 'phoebe', 'janus', 'epimetheus', 'prometheus',
  'pandora', 'atlas', 'pan', 'daphnis', 'helene', 'telesto', 'calypso', 'methone', 'pallene', 'polydeuces',
  'miranda', 'ariel', 'umbriel', 'titania', 'oberon', 'puck', 'triton', 'proteus', 'larissa', 'nereid',
  'nix', 'hydra', 'kerberos', 'styx',
]);

function seenAs(id: string): Seen {
  return MAPPED.has(id) ? 'mapped' : PARTLY.has(id) ? 'partly' : 'unresolved';
}

function lookFor(id: string, seen: Seen): Look {
  if (seen === 'mapped') return { type: 'tiles', base: `/${id}`, hasHeight: ['moon', 'ceres', 'pluto', 'charon', 'titan'].includes(id) };
  if (seen === 'partly') return { type: 'impression', note: 'Only part of this world has been photographed. The rest is drawn to match.' };
  return { type: 'impression', note: 'No spacecraft or telescope has seen this as more than a point of light. Its shape and surface are a guess.' };
}

type Planet = { physical: { radius_mean_km?: number; mass_1e24kg?: number; density_kgm3?: number; rotation_hours?: number } };
const planetEntries = Object.entries((facts as unknown as { planets: Record<string, Planet> }).planets);

const sun: Body = {
  id: 'sun', name: 'The Sun', kind: 'star', parent: null, orbit: { type: 'fixed' },
  meanRadiusKm: 695700, gmKm3S2: 132712440041.94,
  look: { type: 'impression', note: 'The surface is drawn from what solar telescopes measure: granules, spots and the darkening at the edge.' },
  seen: 'partly',
  sources: [nssdc('sun')],
};

const planets: Body[] = planetEntries.map(([slug, p]) => ({
  id: slug, name: slug[0].toUpperCase() + slug.slice(1), kind: 'planet', parent: 'sun',
  orbit: { type: 'jpl-approx', slug },
  meanRadiusKm: p.physical.radius_mean_km,
  gmKm3S2: p.physical.mass_1e24kg ? p.physical.mass_1e24kg * 1e24 * 6.6743e-20 : undefined,
  densityGcm3: p.physical.density_kgm3 ? p.physical.density_kgm3 / 1000 : undefined,
  rotationHours: p.physical.rotation_hours,
  look: { type: 'tiles', base: `/${slug}`, hasHeight: ['mercury', 'venus', 'earth', 'mars'].includes(slug) },
  seen: 'mapped',
  sources: [nssdc(slug), { label: 'NASA/JPL approximate positions of the planets', url: 'https://ssd.jpl.nasa.gov/planets/approx_pos.html' }],
}));

type Raw = {
  id: string; name: string; parent: string; orbit: KeplerOrbit; naifId?: number;
  meanRadiusKm?: number; gmKm3S2?: number; densityGcm3?: number; rotationHours?: number;
  discovered?: { year: number; by: string }; radiusSource?: Source;
};

const moons: Body[] = (moonFile.moons as Raw[]).map((m) => {
  const seen = seenAs(m.id);
  return {
    id: m.id, name: m.name, kind: 'moon', parent: m.parent, orbit: m.orbit,
    meanRadiusKm: m.meanRadiusKm, gmKm3S2: m.gmKm3S2, densityGcm3: m.densityGcm3,
    look: lookFor(m.id, seen), seen, discovered: m.discovered, naifId: m.naifId, sources: [JPL_SATS],
  };
});

const dwarfs: Body[] = (dwarfFile.dwarfs as Raw[]).map((d) => {
  const seen = seenAs(d.id);
  return {
    id: d.id, name: d.name, kind: 'dwarf', parent: 'sun', orbit: d.orbit,
    meanRadiusKm: d.meanRadiusKm, gmKm3S2: d.gmKm3S2, rotationHours: d.rotationHours,
    look: lookFor(d.id, seen), seen,
    sources: d.radiusSource ? [JPL_SBDB, d.radiusSource] : [JPL_SBDB],
  };
});

export const allBodies: Body[] = [sun, ...planets, ...moons, ...dwarfs];

const byId = new Map(allBodies.map((b) => [b.id, b]));
if (byId.size !== allBodies.length) {
  const seen = new Set<string>();
  const twice = allBodies.filter((b) => (seen.has(b.id) ? true : (seen.add(b.id), false))).map((b) => b.id);
  throw new Error(`Two bodies share an id: ${twice.join(', ')}`);
}

export function body(id: string): Body | undefined {
  return byId.get(id);
}

export function childrenOf(id: string): Body[] {
  return allBodies.filter((b) => b.parent === id);
}
