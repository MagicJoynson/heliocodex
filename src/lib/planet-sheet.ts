// The data sheet for the Sun and the eight planets, in the same order as every other record:
// distance, size, temperature, then mass, the year, the day, density and moons.
// Figures from the NASA NSSDC planetary fact sheets (src/data/facts.json) and JPL; moon counts from the one dated list.
import facts from '../data/facts.json';
import { moonCount, MOONS_AS_OF_TEXT } from '../data/moon-counts';
import { fmt, daysToYear, hoursToDay } from './format';
import { ratio, type Cell } from './record';

/** Temperatures, from the NSSDC fact sheets: for the giants, the air where its pressure is the same as at sea level here. */
export const TEMPS: Record<string, { value: string; note: string; short: string }> = {
  sun: { value: 'About 5,500 °C', short: 'about 5,500 °C', note: 'At the visible surface. The core is about 15 million °C.' },
  mercury: { value: '−180 to 430 °C', short: '−180 to 430 °C', note: 'Night to day at the ground. With almost no air, the heat escapes as soon as the Sun sets.' },
  venus: { value: '464 °C', short: '464 °C', note: 'At the ground, day and night: hotter than Mercury, under its thick air.' },
  earth: { value: '15 °C', short: '15 °C', note: 'Averaged over the whole surface and the whole year.' },
  mars: { value: '−59 °C', short: '−59 °C', note: 'Averaged over the surface. A summer afternoon at the equator can pass 20 °C.' },
  jupiter: { value: '−108 °C', short: '−108 °C', note: 'In the clouds, where the air presses as hard as it does at sea level on the Earth.' },
  saturn: { value: '−139 °C', short: '−139 °C', note: 'In the clouds, where the air presses as hard as it does at sea level on the Earth.' },
  uranus: { value: '−197 °C', short: '−197 °C', note: 'In the clouds, where the air presses as hard as it does at sea level on the Earth.' },
  neptune: { value: '−201 °C', short: '−201 °C', note: 'In the clouds, where the air presses as hard as it does at sea level on the Earth.' },
};

const EARTH = facts.planets.earth.physical as unknown as Record<string, number>;
const sup = (n: number) => `<sup>${String(n).replace('-', '−')}</sup>`;
function sci(kg: number) { const ex = Math.floor(Math.log10(kg)); return `${(kg / 10 ** ex).toFixed(2)} × 10${sup(ex)}`; }
const ORDINAL = ['first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh', 'eighth'];
const DENSITY_SAYS: Record<string, string> = {
  mercury: 'Rock round a very large core of iron.', venus: 'Rock round a core of iron, much like the Earth.', earth: 'Rock round a core of iron: the densest planet.', mars: 'Rock round a smaller core of iron.',
  jupiter: 'Mostly hydrogen and helium.', saturn: 'Less than water: mostly hydrogen and helium.', uranus: 'Mostly water, ammonia and methane under hydrogen and helium air.', neptune: 'Mostly water, ammonia and methane under hydrogen and helium air.',
};
const ORDER = ['mercury', 'venus', 'earth', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune'];

export function planetCells(world: string): Cell[] {
  const t = TEMPS[world];
  if (world === 'sun') {
    return [
      { key: 'distance', label: 'From the Earth', value: '1', unit: 'au on average', note: 'About 150 million km. Its light takes 8 minutes 19 seconds to reach us.' },
      { key: 'size', label: 'Size', value: '1,392,700', unit: 'km across', note: '109 times the Earth’s width.' },
      { key: 'temperature', label: 'Temperature', value: t.value, note: t.note },
      { key: 'mass', label: 'Mass', value: sci(1.989e30), unit: 'kg', note: '333,000 times the Earth’s, and 99.8 per cent of everything that goes round it.' },
      { key: 'day', label: 'Turns once in', value: 'About 25', unit: 'days', note: 'At its equator. Near the poles it takes about 35, because it is not solid.' },
      { key: 'density', label: 'Density', value: '1.41', unit: 'times water', note: 'Hot gas, packed tightest at the centre.' },
    ];
  }
  const p = (facts.planets as unknown as Record<string, { physical: Record<string, number>; elements: { a_au: number; e: number } }>)[world];
  const ph = p.physical, a = p.elements.a_au, n = moonCount(world), km = ph.radius_mean_km * 2, kg = ph.mass_1e24kg * 1e24;
  const isEarth = world === 'earth';
  return [
    { key: 'distance', label: 'From the Sun', value: a < 10 ? a.toFixed(2) : a.toFixed(1), unit: 'au on average', note: `From ${fmt(ph.perihelion_1e6km)} to ${fmt(ph.aphelion_1e6km)} million km. The ${ORDINAL[ORDER.indexOf(world)]} planet out.` },
    { key: 'size', label: 'Size', value: fmt(km), unit: 'km across', note: isEarth ? 'The yardstick for the other planets.' : `${ratio(km / (EARTH.radius_mean_km * 2), 'the Earth’s width')}.` },
    { key: 'temperature', label: 'Temperature', value: t.value, note: t.note },
    { key: 'mass', label: 'Mass', value: sci(kg), unit: 'kg', note: isEarth ? 'The yardstick for the other planets.' : `${ratio(ph.mass_1e24kg / EARTH.mass_1e24kg, 'the Earth’s')}.` },
    { key: 'orbit', label: 'A year', value: daysToYear(ph.orbit_period_days).split(' ')[0], unit: daysToYear(ph.orbit_period_days).split(' ').slice(1).join(' '), note: 'Once round the Sun, in the Earth’s days or years.' },
    { key: 'day', label: 'A day', value: hoursToDay(ph.day_hours).split(' ')[0], unit: hoursToDay(ph.day_hours).split(' ').slice(1).join(' '), note: ph.rotation_hours < 0 ? 'Sunrise to sunrise. It spins backwards.' : 'Sunrise to sunrise.' },
    { key: 'density', label: 'Density', value: fmt(ph.density_kgm3 / 1000, 2), unit: 'times water', note: DENSITY_SAYS[world] },
    { key: 'moons', label: 'Moons', value: n === 0 ? 'None' : String(n), note: n === 0 ? undefined : `Known, as of ${MOONS_AS_OF_TEXT}, from NASA JPL.` },
  ];
}
