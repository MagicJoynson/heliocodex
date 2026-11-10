import type { Figure, PlateSpec } from './types';
import { AU_KM } from '../sun';

/** The lists under the drawings. Every body that goes round the Sun is in exactly one. */
export const groups: { id: string; name: string; note: string; ids: string[] }[] = [
  {
    id: 'planets', name: 'The planets',
    note: 'Eight worlds, each large enough to have cleared its own path round the Sun. They all go round the same way and keep close to one flat sheet.',
    ids: ['mercury', 'venus', 'earth', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune'],
  },
  {
    id: 'dwarf-planets', name: 'Dwarf planets',
    note: 'Round like a planet, but sharing their part of space with many other bodies. These five are the ones the International Astronomical Union has named as dwarf planets.',
    ids: ['ceres', 'pluto', 'haumea', 'makemake', 'eris'],
  },
  {
    id: 'likely-dwarf-planets', name: 'Likely dwarf planets',
    note: 'Large, far-off worlds that most astronomers who study them expect to be round. The International Astronomical Union has not ruled on them.',
    ids: ['orcus', 'quaoar', 'gonggong', 'sedna'],
  },
];

/**
 * Moons of the far dwarf planets, which this site's data does not hold yet: Hi'iaka and Namaka
 * (Haumea), S/2015 (136472) 1 (Makemake), Dysnomia (Eris), Xiangliu (Gonggong), Weywot (Quaoar)
 * and Vanth (Orcus). Source: NASA's pages for each world.
 */
export const moonsNotDrawn: Record<string, number> = { haumea: 2, makemake: 1, eris: 1, gonggong: 1, quaoar: 1, orcus: 1 };

/** Which bodies each drawing shows. */
export const shown: Record<string, string[]> = {
  inner: ['mercury', 'venus', 'earth', 'mars', 'ceres'],
  outer: ['jupiter', 'saturn', 'uranus', 'neptune', 'pluto', 'orcus', 'haumea', 'quaoar', 'makemake', 'gonggong', 'eris'],
  sedna: ['neptune', 'sedna'],
};

const figures: Figure[] = [
  {
    id: 'inner', numeral: 'I', title: 'The inner Solar System',
    caption: 'The four rocky planets and Ceres. The scale bar is one astronomical unit: the average distance from the Earth to the Sun. The faint band is the asteroid belt, where millions of small rocky bodies orbit; only Ceres, by far the largest, is drawn.',
    families: [], spanKm: 3.4 * AU_KM, view: 'ecliptic', unit: 'au',
    names: { mercury: 0, venus: 40, earth: 320, mars: 30, ceres: 330 },
  },
  {
    id: 'outer', numeral: 'II', title: 'The outer Solar System',
    caption: 'The four giant planets and seven worlds beyond Neptune. The small square in the middle is the whole of drawing I. The faint band is the main part of the Kuiper belt, a ring of icy bodies of which these seven are among the largest.',
    families: [], spanKm: 76 * AU_KM, centreKm: [25.5 * AU_KM, -3.5 * AU_KM], view: 'ecliptic', unit: 'au', marks: 'inner',
    names: { saturn: 0, uranus: 40, neptune: 320, pluto: 200, orcus: 240, haumea: 280, quaoar: 150, makemake: 20, gonggong: 80, eris: 100 },
    leaders: { jupiter: { at: 135, to: [-60, 90] } },
  },
  {
    id: 'sedna', numeral: 'III', title: 'Out to Sedna',
    caption: 'Sedna takes about eleven thousand years to go round once, and at its furthest is over a thousand times the Earth’s distance from the Sun. The square is the whole of drawing II, and the small ring inside it is Neptune’s orbit.',
    families: [], spanKm: 560 * AU_KM, centreKm: [47 * AU_KM, 461 * AU_KM], view: 'ecliptic', unit: 'au', marks: 'outer',
    names: { sedna: 178 },
  },
];

export const solarSystem: PlateSpec = {
  parent: 'sun',
  title: 'The Solar System from above',
  lead: 'Eight planets and nine dwarf planets, each on its real path round the Sun. One drawing cannot hold them all: at a scale that fits Neptune, the Earth’s orbit is three hundredths of the width. So there are three.',
  equatorKm: 695_700,
  rings: [
    { name: 'Asteroid belt', innerKm: 2.06 * AU_KM, outerKm: 3.27 * AU_KM, faint: true, only: 'inner' },
    { name: 'Kuiper belt', innerKm: 39.4 * AU_KM, outerKm: 47.8 * AU_KM, faint: true, only: 'outer' },
  ],
  families: [],
  figures,
  dots: 'Worlds',
  sources: [
    { label: 'NASA/JPL, approximate positions of the planets (orbits of the eight planets, good from 1800 to 2050)', url: 'https://ssd.jpl.nasa.gov/planets/approx_pos.html' },
    { label: 'NASA/JPL Small-Body Database (orbits of the dwarf planets, as measured for mid 2026)', url: 'https://ssd.jpl.nasa.gov/tools/sbdb_lookup.html' },
    { label: 'International Astronomical Union, Pluto and the Solar System (which bodies are named dwarf planets)', url: 'https://www.iau.org/public/themes/pluto/' },
    { label: 'NASA, dwarf planets (the moons of Haumea, Makemake, Eris and the others)', url: 'https://science.nasa.gov/dwarf-planets/' },
    { label: 'NASA, Kuiper belt facts', url: 'https://science.nasa.gov/solar-system/kuiper-belt/facts/' },
    { label: 'NASA, asteroid facts', url: 'https://science.nasa.gov/solar-system/asteroids/facts/' },
  ],
};
