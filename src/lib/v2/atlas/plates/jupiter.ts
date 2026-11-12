import type { PlateSpec } from './types';
import { moonCount, MOONS_AS_OF_TEXT } from '../../../../data/moon-counts';

// Families of outer moons are groups on similar orbits, thought to be the pieces of bodies that
// were captured and later broken up. The limits below are ours, chosen to split JPL's list
// cleanly; astronomers do not all draw the lines in the same place, and the page says so.
export const jupiter: PlateSpec = {
  parent: 'jupiter',
  title: 'The moons of Jupiter',
  lead: `Jupiter has ${moonCount('jupiter')} known moons in JPL's list as of ${MOONS_AS_OF_TEXT}. Eight keep close, on neat circles above its equator. The other ${moonCount('jupiter') - 8} are small captured bodies on wide, tilted loops, most of them going round backwards.`,
  equatorKm: 71492,
  rings: [{ name: 'Main ring', innerKm: 122500, outerKm: 129000 }],
  families: [
    { id: 'ring-moons', name: 'The ring moons', note: 'Four small moons inside Io’s orbit. Dust knocked off them makes Jupiter’s faint rings.', has: (a) => a < 300_000 },
    { id: 'galilean', name: 'The four great moons', note: 'Found by Galileo in 1610. Each is a world in its own right, and Ganymede is larger than Mercury.', has: (a) => a >= 300_000 && a < 3_000_000 },
    { id: 'themisto', name: 'Themisto', note: 'On its own, between the great moons and the rest.', has: (a, t) => a >= 3_000_000 && a < 9_000_000 && t < 90 },
    { id: 'himalia', name: 'The Himalia family', note: 'Going the usual way round, about 11 to 12 million km out, tilted about 28°.', has: (a, t) => a >= 9_000_000 && a < 14_000_000 && t < 90 },
    { id: 'carpo', name: 'The Carpo pair', note: 'Two moons going the usual way round on orbits tilted about 50°.', has: (a, t) => a >= 14_000_000 && t >= 40 && t < 90 },
    { id: 'valetudo', name: 'Valetudo', note: 'Goes the usual way round, out where nearly everything else goes backwards, and crosses their paths.', has: (a, t) => a >= 14_000_000 && t < 40 },
    { id: 'ananke', name: 'The Ananke family', note: 'Going round backwards, about 21 million km out, tilted about 148°.', has: (a, t) => t >= 90 && t < 160 && a < 22_000_000 },
    { id: 'carme', name: 'The Carme family', note: 'Going round backwards, about 23 million km out, tilted about 165°. The tightest family.', has: (_a, t) => t >= 160 },
    { id: 'pasiphae', name: 'The Pasiphae family', note: 'Going round backwards, 23 to 24 million km out. A looser group than the others.', has: (a, t) => t >= 90 && t < 160 && a >= 22_000_000 },
  ],
  figures: [
    {
      id: 'great', numeral: 'I', title: 'The four great moons',
      caption: 'Jupiter and the orbits of Io, Europa, Ganymede and Callisto, to scale. The small square is the area of the second drawing.',
      families: ['ring-moons', 'galilean'], spanKm: 2_050_000, marks: 'close',
      names: { io: 20, europa: 335, ganymede: 25, callisto: 340 },
    },
    {
      id: 'close', numeral: 'II', title: 'Close in: the ring moons',
      caption: 'The same view nine times larger. Metis and Adrastea share almost the same path at the outer edge of the main ring.',
      families: ['ring-moons'], spanKm: 232_000,
      names: { metis: 150, adrastea: 210, amalthea: 30, thebe: 335 },
    },
    {
      id: 'outer', numeral: 'III', title: 'The outer moons',
      caption: 'All 107 outer moons, seen from above the plane of the planets. Steeply tilted orbits look narrower from above than they are. The small square in the middle is the whole of the first drawing.',
      view: 'ecliptic',
      families: ['themisto', 'himalia', 'carpo', 'valetudo', 'ananke', 'carme', 'pasiphae'], spanKm: 35_500_000, marks: 'great',
      names: { themisto: 195, himalia: 330, carpo: 95, valetudo: 290, ananke: 215, carme: 120, pasiphae: 160 },
    },
  ],
  sources: [
    { label: 'NASA/JPL Solar System Dynamics, planetary satellites: orbits fitted to JPL Horizons positions, 2000 to 2040', url: 'https://ssd.jpl.nasa.gov/sats/elem/' },
    { label: 'NASA/JPL, planetary satellite physical parameters', url: 'https://ssd.jpl.nasa.gov/sats/phys_par/' },
    { label: 'NASA/JPL, planetary satellite discovery circumstances', url: 'https://ssd.jpl.nasa.gov/sats/discovery.html' },
    { label: 'NASA NSSDC, Jupiter rings fact sheet', url: 'https://nssdc.gsfc.nasa.gov/planetary/factsheet/jupringfact.html' },
  ],
};
