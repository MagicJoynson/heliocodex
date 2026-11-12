/**
 * The parts of the site that are planned but not yet written. Each entry says only what it will hold, so it
 * can be shown now, marked "Outline: being written", without inventing anything. When a lesson is written,
 * delete its line here: a check fails if a planned title matches a written lesson.
 */
export interface Planned { title: string; holds: string }

/** Lessons still to come, by subject. */
export const PLANNED_LESSONS: Record<string, Planned[]> = {
  'finding-your-way': [
    { title: 'Binoculars and a first telescope', holds: 'What to buy, what to point it at, and what you will really see.' },
    { title: 'Finding the planets yourself', holds: 'Which planets show to the eye, when, and how to tell them from stars.' },
  ],
  moons: [
    { title: 'The great moons of Jupiter', holds: 'Io, Europa, Ganymede and Callisto, one by one.' },
    { title: 'Titan', holds: 'The moon with thick air, lakes and rain, and the probe that landed there.' },
    { title: 'The far moons', holds: 'Triton, the moons of Uranus, and Pluto and Charon.' },
  ],
  'the-sun': [
    { title: 'Space weather and the Earth', holds: 'What the Sun’s storms do to satellites, power grids and the aurora.' },
  ],
  planets: [
    { title: 'The dwarf planets', holds: 'Pluto, Eris, Ceres and the rest: what they are and how they were found.' },
  ],
  'small-bodies': [
    { title: 'The asteroid belt', holds: 'What lies between Mars and Jupiter, and how empty it really is.' },
    { title: 'Meteor showers', holds: 'Why they come on the same nights each year, and how to watch one.' },
    { title: 'The Kuiper belt', holds: 'The icy worlds past Neptune, and the one spacecraft that has flown through it.' },
  ],
  stars: [
    { title: 'Star names and catalogues', holds: 'Where the old names came from, and how stars are numbered now.' },
  ],
  'other-worlds': [
    { title: 'Hot Jupiters', holds: 'Giant planets closer to their star than Mercury is to ours.' },
    { title: 'Reading the air of another world', holds: 'How starlight passing through a planet’s air shows what it is made of.' },
  ],
  'stellar-remnants': [
    { title: 'Black holes we have pictured', holds: 'The two images of black holes’ shadows, and how they were made.' },
  ],
  'the-galaxy': [
    { title: 'The Magellanic Clouds', holds: 'The two small galaxies that go round our own, seen from the south.' },
  ],
  galaxies: [
    { title: 'The Andromeda Galaxy', holds: 'Our nearest big neighbour, and the furthest thing most people can see by eye.' },
  ],
  'the-universe': [
    { title: 'The shape of the universe', holds: 'Whether space is flat or curved, and how that is measured.' },
  ],
  light: [
    { title: 'Radio astronomy', holds: 'The sky in radio waves, from the first hiss to dishes the size of the Earth.' },
    { title: 'The X-ray sky', holds: 'Why X-ray telescopes must fly above the air, and what they find.' },
  ],
  'what-everything-is-made-of': [
    { title: 'Atoms and light', holds: 'Why each kind of atom gives out its own colours.' },
    { title: 'The elements in space', holds: 'Which elements are common out there, and which are rare.' },
    { title: 'Neutrinos', holds: 'The particles that pass through the Earth, and the detectors that catch a few.' },
    { title: 'Matter and antimatter', holds: 'Why there is any matter left at all.' },
  ],
  life: [
    { title: 'Signs of life from far away', holds: 'What a living planet would look like to a distant telescope.' },
  ],
  'exploring-space': [
    { title: 'Back to the Moon', holds: 'The plans to return people to the Moon, and why.' },
    { title: 'On to Mars', holds: 'What it would take to send people to Mars and bring them home.' },
    { title: 'Where spacecraft are parked', holds: 'The orbits and balance points that missions use, and why.' },
  ],
  'how-we-found-out': [
    { title: 'The people who changed the picture', holds: 'The astronomers behind the biggest changes in what we know.' },
    { title: 'Finding Neptune', holds: 'The planet found by sums before anyone saw it.' },
    { title: 'How old is the Earth?', holds: 'How the age of the Earth and the Sun was worked out.' },
    { title: 'The debate about galaxies', holds: 'How astronomers settled whether the spiral nebulae were other galaxies.' },
  ],
};
export const plannedCount = Object.values(PLANNED_LESSONS).reduce((n, l) => n + l.length, 0);

/** The Discovery section: missions, people and telescopes. Each entry will become a page; for now each is
 *  one line on its own scale. Years and sizes are well-recorded; entries with any doubt are left out. */
export const MISSIONS: { name: string; year: number; to: string }[] = [
  { name: 'Sputnik 1', year: 1957, to: 'Earth orbit' }, { name: 'Luna 3', year: 1959, to: 'The Moon' },
  { name: 'Vostok 1', year: 1961, to: 'Earth orbit' }, { name: 'Mariner 2', year: 1962, to: 'Venus' },
  { name: 'Mariner 4', year: 1964, to: 'Mars' }, { name: 'Apollo 8', year: 1968, to: 'The Moon' },
  { name: 'Apollo 11', year: 1969, to: 'The Moon' }, { name: 'Venera 7', year: 1970, to: 'Venus' },
  { name: 'Pioneer 10', year: 1972, to: 'Jupiter' }, { name: 'Viking 1', year: 1975, to: 'Mars' },
  { name: 'Voyager 2', year: 1977, to: 'The giant planets' }, { name: 'Voyager 1', year: 1977, to: 'Jupiter, Saturn and beyond' },
  { name: 'Galileo', year: 1989, to: 'Jupiter' }, { name: 'Hubble Space Telescope', year: 1990, to: 'Earth orbit' },
  { name: 'Cassini–Huygens', year: 1997, to: 'Saturn and Titan' }, { name: 'Spirit and Opportunity', year: 2003, to: 'Mars' },
  { name: 'Rosetta', year: 2004, to: 'A comet' }, { name: 'New Horizons', year: 2006, to: 'Pluto and beyond' },
  { name: 'Kepler', year: 2009, to: 'Planets of other stars' }, { name: 'Curiosity', year: 2011, to: 'Mars' },
  { name: 'Juno', year: 2011, to: 'Jupiter' }, { name: 'Gaia', year: 2013, to: 'The stars of the Milky Way' },
  { name: 'Parker Solar Probe', year: 2018, to: 'The Sun' }, { name: 'Perseverance', year: 2020, to: 'Mars' },
  { name: 'James Webb Space Telescope', year: 2021, to: 'A balance point beyond the Moon' }, { name: 'DART', year: 2021, to: 'An asteroid' },
  { name: 'JUICE', year: 2023, to: 'Jupiter’s icy moons' }, { name: 'Europa Clipper', year: 2024, to: 'Europa' },
];
export const PEOPLE: { name: string; born: number; died?: number; about: boolean }[] = [
  { name: 'Nicolaus Copernicus', born: 1473, died: 1543, about: true }, { name: 'Tycho Brahe', born: 1546, died: 1601, about: true },
  { name: 'Galileo Galilei', born: 1564, died: 1642, about: true }, { name: 'Johannes Kepler', born: 1571, died: 1630, about: true },
  { name: 'Isaac Newton', born: 1643, died: 1727, about: true }, { name: 'Edmond Halley', born: 1656, died: 1742, about: true },
  { name: 'Charles Messier', born: 1730, died: 1817, about: true }, { name: 'William Herschel', born: 1738, died: 1822, about: true },
  { name: 'Caroline Herschel', born: 1750, died: 1848, about: true }, { name: 'Urbain Le Verrier', born: 1811, died: 1877, about: true },
  { name: 'Annie Jump Cannon', born: 1863, died: 1941, about: true }, { name: 'Henrietta Swan Leavitt', born: 1868, died: 1921, about: true },
  { name: 'Albert Einstein', born: 1879, died: 1955, about: true }, { name: 'Arthur Eddington', born: 1882, died: 1944, about: true },
  { name: 'Edwin Hubble', born: 1889, died: 1953, about: true }, { name: 'Cecilia Payne-Gaposchkin', born: 1900, died: 1979, about: true },
  { name: 'Subrahmanyan Chandrasekhar', born: 1910, died: 1995, about: true }, { name: 'Vera Rubin', born: 1928, died: 2016, about: true },
  { name: 'Carl Sagan', born: 1934, died: 1996, about: true }, { name: 'Stephen Hawking', born: 1942, died: 2018, about: true },
  { name: 'Jocelyn Bell Burnell', born: 1943, about: true },
];
export const TELESCOPES: { name: string; metres: number; year: number | null; kind: 'light' | 'space' }[] = [
  { name: 'Herschel’s 40-foot', metres: 1.2, year: 1789, kind: 'light' },
  { name: 'Hooker Telescope', metres: 2.5, year: 1917, kind: 'light' },
  { name: 'Hubble Space Telescope', metres: 2.4, year: 1990, kind: 'space' },
  { name: 'Hale Telescope', metres: 5.1, year: 1949, kind: 'light' },
  { name: 'James Webb Space Telescope', metres: 6.5, year: 2021, kind: 'space' },
  { name: 'Vera C. Rubin Observatory', metres: 8.4, year: 2025, kind: 'light' },
  { name: 'Keck I', metres: 10, year: 1993, kind: 'light' },
  { name: 'Extremely Large Telescope', metres: 39, year: null, kind: 'light' },
];
