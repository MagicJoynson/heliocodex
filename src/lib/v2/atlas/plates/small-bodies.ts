// The chart of small bodies: a chosen few asteroids and comets on their real orbits, and a diagram
// of where the known asteroids are thick and thin. The body list is src/data/bodies/small.json.
import type { Figure, PlateSpec } from './types';
import { AU_KM } from '../sun';

/** The lists under the drawings. Every chosen small body is in exactly one. */
export const groups: { id: string; name: string; note: string }[] = [
  { id: 'near-earth', name: 'Asteroids that come near the Earth', note: 'Small rocky bodies whose paths bring them into the Earth’s part of the Solar System. Being close, they are the ones spacecraft can reach and bring pieces back from.' },
  { id: 'main-belt', name: 'Asteroids of the main belt', note: 'The belt between Mars and Jupiter holds most of the known asteroids. Ceres, the largest body in it, counts as a dwarf planet and is on the chart of the Solar System.' },
  { id: 'further-out', name: 'Further out', note: 'A Trojan sharing Jupiter’s orbit, a centaur among the giant planets, and a small world of the Kuiper belt.' },
  { id: 'comet', name: 'Comets', note: 'Bodies of ice and dust on stretched orbits. Near the Sun the ice turns to gas and carries dust off with it, making the coma and tails. Their own jets push them about, so a comet’s place along its orbit is less sure than an asteroid’s.' },
];
export const groupOf = (g: string) => (g === 'trojan' || g === 'centaur' || g === 'kuiper-belt' ? 'further-out' : g);

/** Which bodies each drawing shows. Planets are there for scale. */
export const shown: Record<string, string[]> = {
  near: ['earth', 'mars', 'apophis', 'bennu', 'ryugu', 'itokawa', 'eros', 'didymos'],
  belt: ['mars', 'jupiter', 'gaspra', 'vesta', 'lutetia', 'mathilde', 'juno', 'pallas', 'ida', 'psyche', 'hygiea', 'hektor'],
  comets: ['earth', 'jupiter', 'encke', 'tempel-1', 'wild-2', 'churyumov-gerasimenko', 'hartley-2', 'borrelly'],
  far: ['jupiter', 'saturn', 'neptune', 'chiron', 'halley', 'arrokoth'],
};
/** Chosen bodies whose orbits fit on no drawing here, and why. */
export const offChart: Record<string, string> = {
  'hale-bopp': 'Its orbit reaches about 354 au from the Sun, seven times as far as the widest drawing here, so it is in the list only.',
};

const figures: Figure[] = [
  {
    id: 'near', numeral: 'I', title: 'Asteroids near the Earth',
    caption: 'Six asteroids that spacecraft have visited or will soon watch closely, with the orbits of the Earth and Mars for scale. Four of them cross the Earth’s path on the page; their tilts mean they pass above or below it almost every time.',
    families: [], spanKm: 2.45 * AU_KM, view: 'ecliptic', unit: 'au',
    names: { earth: 200, mars: 20, apophis: 150, bennu: 250, ryugu: 300, itokawa: 60, eros: 110, didymos: 265 },
  },
  {
    id: 'belt', numeral: 'II', title: 'The asteroid belt',
    caption: 'Nine asteroids of the main belt and Hektor, the largest Trojan, with Mars and Jupiter for scale. The faint band is where most of the belt lies. The belt is mostly empty space: spacecraft cross it without steering round anything.',
    families: [], spanKm: 5.75 * AU_KM, view: 'ecliptic', unit: 'au', marks: 'near',
    names: { mars: 200, jupiter: 20, gaspra: 100, vesta: 310, lutetia: 240, mathilde: 265, juno: 215, pallas: 60, ida: 135, psyche: 280, hygiea: 85, hektor: 160 },
  },
  {
    id: 'comets', numeral: 'III', title: 'Comets that stay close',
    caption: 'Six comets whose orbits take between three and seven years, with the Earth and Jupiter for scale. All but Encke swing out to about Jupiter’s distance: Jupiter’s pull is what holds this family of comets on such short orbits.',
    families: [], spanKm: 6.3 * AU_KM, view: 'ecliptic', unit: 'au',
    names: { earth: 200, jupiter: 20, encke: 95, 'tempel-1': 170, 'wild-2': 110, 'churyumov-gerasimenko': 235, 'hartley-2': 275, borrelly: 160 },
  },
  {
    id: 'far', numeral: 'IV', title: 'Out past the giant planets',
    caption: 'Halley’s Comet, the centaur Chiron and Arrokoth in the Kuiper belt, with Jupiter, Saturn and Neptune for scale. The small square is the whole of drawing III. Halley goes round backwards, on a path tilted steeply against the planets’.',
    families: [], spanKm: 50 * AU_KM, view: 'ecliptic', unit: 'au', marks: 'comets',
    names: { saturn: 150, neptune: 60, chiron: 100, halley: 350, arrokoth: 200 },
    leaders: { jupiter: { at: 135, to: [-70, 100] } },
  },
];

export const smallBodiesPlate: PlateSpec = {
  parent: 'sun',
  title: 'Asteroids and comets',
  lead: 'More than a million and a half small bodies are known to orbit the Sun, and no drawing could hold them. So this chart does two things. It draws the real paths of 26 that are worth knowing by name, most of them because a spacecraft has been there. And it shows, as a count, where all the rest are.',
  equatorKm: 695_700,
  rings: [
    { name: 'Asteroid belt', innerKm: 2.06 * AU_KM, outerKm: 3.27 * AU_KM, faint: true, only: 'belt' },
    { name: 'Kuiper belt', innerKm: 39.4 * AU_KM, outerKm: 47.8 * AU_KM, faint: true, only: 'far' },
  ],
  families: [],
  figures,
  dots: 'Bodies',
  sources: [
    { label: 'NASA/JPL Small-Body Database (orbits and sizes of the asteroids and comets, and the count of every known asteroid)', url: 'https://ssd.jpl.nasa.gov/tools/sbdb_lookup.html' },
    { label: 'NASA/JPL, approximate positions of the planets', url: 'https://ssd.jpl.nasa.gov/planets/approx_pos.html' },
    { label: 'NASA, asteroid facts', url: 'https://science.nasa.gov/solar-system/asteroids/facts/' },
    { label: 'NASA, comet facts', url: 'https://science.nasa.gov/solar-system/comets/facts/' },
    { label: 'NASA, Kuiper belt facts', url: 'https://science.nasa.gov/solar-system/kuiper-belt/facts/' },
  ],
};

/**
 * Where a body going round the Sun would keep step with a planet: p of its orbits to q of the
 * planet's. From Kepler's third law, its orbit is the planet's times (q / p) to the power 2/3.
 */
export const inStep = (planetAu: number, p: number, q: number) => planetAu * Math.pow(q / p, 2 / 3);
