import type { PlateSpec } from './types';
import { moonCount, MOONS_AS_OF_TEXT } from '../../../../data/moon-counts';

const JPL = [
  { label: 'NASA/JPL Solar System Dynamics, planetary satellites: orbits fitted to JPL Horizons positions, 2000 to 2040', url: 'https://ssd.jpl.nasa.gov/sats/elem/' },
  { label: 'NASA/JPL, planetary satellite physical parameters', url: 'https://ssd.jpl.nasa.gov/sats/phys_par/' },
  { label: 'NASA/JPL, planetary satellite discovery circumstances', url: 'https://ssd.jpl.nasa.gov/sats/discovery.html' },
];

export const earth: PlateSpec = {
  parent: 'earth',
  title: 'The Moon’s orbit',
  lead: 'The Earth has one moon, and it is a large one: more than a quarter of the Earth’s width. It goes round once in 27.3 days, about thirty Earth-widths away.',
  equatorKm: 6378.1,
  rings: [],
  caution: 'The Sun pulls on the Moon almost as hard as the Earth does, so its path is not a fixed ellipse. The line is the Moon’s real track for the two weeks either side of today, which is why it does not quite close on itself.',
  families: [{ id: 'moon', name: 'The Moon', note: 'The only world beyond the Earth that people have walked on.', has: () => true }],
  figures: [
    {
      id: 'moon', numeral: 'I', title: 'The Earth and the Moon',
      caption: 'The Earth and the Moon’s path, to scale, seen from above the plane of the planets. The gap really is this wide: all the other planets would fit side by side between the two.',
      families: ['moon'], spanKm: 430_000, view: 'ecliptic',
      names: { moon: 30 },
    },
  ],
  sources: [{ label: 'Jean Meeus, Astronomical Algorithms, chapter 47 (the lunar theory used here), checked against JPL Horizons', url: 'https://ssd.jpl.nasa.gov/horizons/' }, { label: 'NASA, Moon facts', url: 'https://science.nasa.gov/moon/facts/' }],
};

export const mars: PlateSpec = {
  parent: 'mars',
  title: 'The moons of Mars',
  lead: 'Mars has two small, lumpy moons. Phobos is so close that it goes round faster than Mars turns, so from the ground it rises in the west and sets in the east.',
  equatorKm: 3396.2,
  rings: [],
  families: [{ id: 'moons', name: 'Phobos and Deimos', note: 'Both were found in 1877. Phobos is slowly falling inwards and will break up or hit Mars in some tens of millions of years.', has: () => true }],
  figures: [
    {
      id: 'moons', numeral: 'I', title: 'Phobos and Deimos',
      caption: 'Mars and the orbits of its two moons, to scale. Phobos is less than two Mars-widths above the surface.',
      families: ['moons'], spanKm: 25_500,
      names: { phobos: 30, deimos: 330 },
    },
  ],
  sources: [...JPL, { label: 'NASA, the moons of Mars', url: 'https://science.nasa.gov/mars/moons/' }],
};

export const uranus: PlateSpec = {
  parent: 'uranus',
  title: 'The moons of Uranus',
  lead: `Uranus has ${moonCount('uranus')} known moons in JPL's list as of ${MOONS_AS_OF_TEXT}. Uranus lies on its side, and its close moons and rings are tipped over with it, so their orbits stand almost upright to the plane of the planets.`,
  equatorKm: 25559,
  rings: [
    { name: 'Rings 6, 5 and 4', innerKm: 41837, outerKm: 42571 },
    { name: 'Alpha and Beta rings', innerKm: 44718, outerKm: 45661 },
    { name: 'Eta, Gamma and Delta rings', innerKm: 47176, outerKm: 48300 },
    { name: 'Epsilon ring', innerKm: 51149, outerKm: 51149 },
    { name: 'Nu ring', innerKm: 66100, outerKm: 69900, faint: true },
    { name: 'Mu ring', innerKm: 86000, outerKm: 103000, faint: true },
  ],
  caution: 'One moon, S/2025 U 1, was found by the Webb telescope in 2025. The size of its orbit is known but nobody has yet published where on that orbit it is, so it has a line and no dot.',
  families: [
    { id: 'inner', name: 'The inner moons', note: 'Fourteen small, dark moons packed close together just outside the rings. Most were found by Voyager 2 in 1986.', has: (a) => a < 110_000 },
    { id: 'large', name: 'The five large moons', note: 'Miranda, Ariel, Umbriel, Titania and Oberon. Voyager 2 photographed one side of each in 1986. Nothing has been back.', has: (a) => a >= 110_000 && a < 1_000_000 },
    { id: 'outer', name: 'The outer moons', note: 'Ten small captured bodies far out. All but Margaret go round backwards.', has: (a) => a >= 1_000_000 },
  ],
  figures: [
    {
      id: 'large', numeral: 'I', title: 'The five large moons',
      caption: 'Uranus seen from above its pole, with the orbits of its five large moons. The small square is the area of the second drawing.',
      families: ['inner', 'large'], spanKm: 620_000, marks: 'inner',
      names: { miranda: 90, ariel: 20, umbriel: 335, titania: 25, oberon: 335 },
    },
    {
      id: 'inner', numeral: 'II', title: 'Close in: rings and inner moons',
      caption: 'The narrow rings and the fourteen inner moons. The two wide faint bands are rings of dust. Mab orbits inside the outer one.',
      families: ['inner'], spanKm: 104_000,
      names: { cordelia: 200, ophelia: 160, bianca: 120, portia: 60, rosalind: 20, belinda: 340, puck: 300, mab: 250 },
    },
    {
      id: 'outer', numeral: 'III', title: 'The outer moons',
      caption: 'The ten outer moons, seen from above the plane of the planets. From here Uranus’s own equator, and the first drawing, would be seen almost edge on, so the small square only marks its size.',
      families: ['outer'], spanKm: 28_000_000, marks: 'large', view: 'ecliptic',
      names: { francisco: 0, caliban: 200, sycorax: 40, prospero: 320, setebos: 110, ferdinand: 250, margaret: 170 },
    },
  ],
  sources: [...JPL, { label: 'NASA NSSDC, Uranus rings fact sheet', url: 'https://nssdc.gsfc.nasa.gov/planetary/factsheet/uranringfact.html' }, { label: 'NASA, new moon discovered orbiting Uranus using the Webb telescope (2025)', url: 'https://science.nasa.gov/blogs/webb/2025/08/19/new-moon-discovered-orbiting-uranus-using-nasas-webb-telescope/' }],
};

export const neptune: PlateSpec = {
  parent: 'neptune',
  title: 'The moons of Neptune',
  lead: `Neptune has ${moonCount('neptune')} known moons in JPL's list as of ${MOONS_AS_OF_TEXT}. One of them, Triton, holds nearly all the mass, and it goes round backwards: the only large moon in the Solar System that does. It was almost certainly captured.`,
  equatorKm: 24764,
  rings: [
    { name: 'Galle ring', innerKm: 40900, outerKm: 42900, faint: true },
    { name: 'Le Verrier ring', innerKm: 53200, outerKm: 53200 },
    { name: 'Lassell ring', innerKm: 53200, outerKm: 57200, faint: true },
    { name: 'Adams ring', innerKm: 62933, outerKm: 62933 },
  ],
  families: [
    { id: 'inner', name: 'The inner moons', note: 'Seven small moons close in, among and just outside the rings. Six were found by Voyager 2 in 1989, and tiny Hippocamp in 2013.', has: (a) => a < 200_000 },
    { id: 'triton', name: 'Triton', note: 'Larger than Pluto. Voyager 2 saw plumes of dark material rising from its frozen surface.', has: (a) => a >= 200_000 && a < 1_000_000 },
    { id: 'outer', name: 'Nereid and the outer moons', note: 'Nereid swings from 1.4 to 9.6 million km out. The furthest moons take more than 25 years to go round once, on the widest orbits of any known moons.', has: (a) => a >= 1_000_000 },
  ],
  figures: [
    {
      id: 'triton', numeral: 'I', title: 'Triton and the inner moons',
      caption: 'Neptune seen from above its north pole. Triton’s orbit is a nearly perfect circle, travelled backwards. It is tilted 23° to Neptune’s equator, so from here it looks slightly squashed. The small square is the area of the second drawing.',
      families: ['inner', 'triton'], spanKm: 375_000, marks: 'inner',
      names: { triton: 30, proteus: 200 },
    },
    {
      id: 'inner', numeral: 'II', title: 'Close in: rings and inner moons',
      caption: 'The rings and the seven inner moons. Galatea orbits just inside the outermost ring, and Hippocamp keeps close to Proteus.',
      families: ['inner'], spanKm: 125_000,
      names: { naiad: 180, thalassa: 140, despina: 100, galatea: 50, larissa: 10, hippocamp: 320, proteus: 30 },
    },
    {
      id: 'outer', numeral: 'III', title: 'Nereid and the outer moons',
      caption: 'The eight outer moons, seen from above the plane of the planets. Nereid’s is the small, narrow loop nearest the middle. The small square in the middle is the whole of the first drawing.',
      families: ['outer'], spanKm: 61_000_000, marks: 'triton', view: 'ecliptic',
      names: { halimede: 200, sao: 330, laomedeia: 120, psamathe: 30, neso: 300 },
    },
  ],
  sources: [...JPL, { label: 'NASA NSSDC, Neptune rings fact sheet', url: 'https://nssdc.gsfc.nasa.gov/planetary/factsheet/nepringfact.html' }, { label: 'NASA, Neptune’s moons', url: 'https://science.nasa.gov/neptune/moons/' }],
};

export const pluto: PlateSpec = {
  parent: 'pluto',
  title: 'The moons of Pluto',
  lead: 'Pluto has five known moons. Charon is half as wide as Pluto itself, so the two are better thought of as a double world. Four small moons circle the pair.',
  equatorKm: 1188.3,
  rings: [],
  caution: 'The drawing holds Pluto still at the centre. In truth Pluto and Charon both circle a point between them, about 2,100 km from Pluto’s centre and so outside Pluto itself, each keeping the same face to the other.',
  families: [
    { id: 'charon', name: 'Charon', note: 'Found in 1978. Mapped, with Pluto, by the New Horizons spacecraft in 2015.', has: (a) => a < 30_000 },
    { id: 'small', name: 'The four small moons', note: 'Found with the Hubble telescope between 2005 and 2012. They tumble as they orbit, and their years are close to 3, 4, 5 and 6 times Charon’s.', has: (a) => a >= 30_000 },
  ],
  figures: [
    {
      id: 'moons', numeral: 'I', title: 'Pluto and its moons',
      caption: 'Pluto and the orbits of its five moons, to scale, seen from above Pluto’s pole.',
      families: ['charon', 'small'], spanKm: 70_000,
      names: { charon: 30, styx: 200, nix: 330, kerberos: 150, hydra: 20 },
    },
  ],
  sources: [...JPL, { label: 'NASA, Pluto’s moons', url: 'https://science.nasa.gov/dwarf-planets/pluto/moons/' }],
};
