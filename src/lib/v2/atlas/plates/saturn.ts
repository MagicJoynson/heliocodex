import type { PlateSpec } from './types';

const JPL = [
  { label: 'NASA/JPL Solar System Dynamics, planetary satellites: orbits fitted to JPL Horizons positions, 2000 to 2040', url: 'https://ssd.jpl.nasa.gov/sats/elem/' },
  { label: 'NASA/JPL, planetary satellite physical parameters', url: 'https://ssd.jpl.nasa.gov/sats/phys_par/' },
  { label: 'NASA/JPL, planetary satellite discovery circumstances', url: 'https://ssd.jpl.nasa.gov/sats/discovery.html' },
];

// The outer moons fall into three loose groups, named after the mythologies their members are
// named from. The limits below are ours, chosen to split JPL's list cleanly.
export const saturn: PlateSpec = {
  parent: 'saturn',
  title: 'The moons of Saturn',
  lead: 'Saturn has 292 known moons, more than every other planet put together. Twenty-four keep close, among and beyond the rings. The other 268 are small captured bodies far out, and most of them go round backwards.',
  equatorKm: 60268,
  rings: [
    { name: 'D ring', innerKm: 66900, outerKm: 74510, faint: true },
    { name: 'C ring', innerKm: 74658, outerKm: 92000, faint: true },
    { name: 'B ring', innerKm: 92000, outerKm: 117580 },
    { name: 'A ring', innerKm: 122170, outerKm: 136775 },
    { name: 'F ring', innerKm: 140130, outerKm: 140230 },
    { name: 'G ring', innerKm: 166000, outerKm: 175000, faint: true },
    { name: 'E ring', innerKm: 180000, outerKm: 480000, faint: true },
  ],
  families: [
    { id: 'ring-moons', name: 'Moons among the rings', note: 'Small moons inside the rings or just outside them. Some hold the ring edges in place, and two of them, Janus and Epimetheus, share one orbit and swap places every four years.', has: (a) => a < 180_000 },
    { id: 'mid', name: 'The mid-sized moons', note: 'Five round, icy moons from Mimas to Rhea, with the small companions that share the orbits of Tethys and Dione or keep close to Mimas.', has: (a) => a >= 180_000 && a < 600_000 },
    { id: 'large', name: 'Titan, Hyperion and Iapetus', note: 'Titan is larger than Mercury and has a thick atmosphere. Iapetus is far out, on an orbit tilted well away from the rings.', has: (a) => a >= 600_000 && a < 5_000_000 },
    { id: 'inuit', name: 'The Inuit group', note: 'Going the usual way round, on orbits tilted about 45° to 50°.', has: (a, t) => a >= 5_000_000 && a < 20_000_000 && t < 90 && !(t < 42.5 && a >= 14_000_000) },
    { id: 'gallic', name: 'The Gallic group', note: 'Going the usual way round, 16 to 19 million km out, tilted about 35° to 40°.', has: (a, t) => a >= 14_000_000 && a < 20_000_000 && t < 42.5 },
    { id: 's-2004-s-24', name: 'S/2004 S 24', note: 'Goes the usual way round, out where everything else goes backwards.', has: (a, t) => a >= 20_000_000 && t < 90 },
    { id: 'norse', name: 'The Norse group', note: 'Every one goes round backwards. Phoebe, the largest by far, was visited by the Cassini spacecraft in 2004.', has: (a, t) => a >= 5_000_000 && t >= 90 },
  ],
  figures: [
    {
      id: 'large', numeral: 'I', title: 'Out to Iapetus',
      caption: 'Saturn, its rings, and the orbits of the 24 close moons. The widest faint band is the E ring, made of ice sprayed out by Enceladus. The small square is the area of the second drawing.',
      families: ['ring-moons', 'mid', 'large'], spanKm: 3_750_000, marks: 'mid',
      names: { titan: 30, hyperion: 300, iapetus: 335 },
    },
    {
      id: 'mid', numeral: 'II', title: 'The mid-sized moons',
      caption: 'Mimas to Rhea. Tethys shares its orbit with Telesto and Calypso, and Dione shares its orbit with Helene and Polydeuces. The small square is the area of the third drawing.',
      families: ['ring-moons', 'mid'], spanKm: 560_000, marks: 'rings',
      names: { mimas: 180, enceladus: 40, tethys: 320, dione: 30, rhea: 330 },
    },
    {
      id: 'rings', numeral: 'III', title: 'Among the rings',
      caption: 'The rings and the small moons that live in and around them. Pan and Daphnis each orbit inside a gap in the A ring that the moon itself keeps clear.',
      families: ['ring-moons', 'mid'], spanKm: 215_000,
      names: { pan: 250, daphnis: 215, atlas: 180, prometheus: 145, pandora: 110, epimetheus: 70, janus: 30, aegaeon: 350, mimas: 315, methone: 285, pallene: 20 },
    },
    {
      id: 'outer', numeral: 'IV', title: 'The outer moons',
      caption: 'All 268 outer moons, seen from above the plane of the planets. Steeply tilted orbits look narrower from above than they are. The small square in the middle is the whole of the first drawing.',
      families: ['inuit', 'gallic', 's-2004-s-24', 'norse'], spanKm: 39_500_000, marks: 'large', view: 'ecliptic',
      names: { phoebe: 330, kiviuq: 30, siarnaq: 120, albiorix: 200, ymir: 250 },
    },
  ],
  sources: [...JPL, { label: 'NASA NSSDC, Saturn rings fact sheet', url: 'https://nssdc.gsfc.nasa.gov/planetary/factsheet/satringfact.html' }, { label: 'NASA, Saturn’s moons', url: 'https://science.nasa.gov/saturn/moons/' }],
};
