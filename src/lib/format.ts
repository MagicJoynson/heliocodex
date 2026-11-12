import facts from '../data/facts.json';
import { moonCount } from '../data/moon-counts';

const P = facts.planets as Record<string, { physical: Record<string, number | boolean>; elements: any }>;

export function phys(slug: string) {
  const physical = P[slug]?.physical;
  // moon counts change as new ones are confirmed, so they come from the one dated list, not the fact sheet
  return physical && { ...physical, moons: moonCount(slug) };
}
export function fmt(n: number, digits = 2) {
  if (Math.abs(n) >= 1000) return Math.round(n).toLocaleString('en-GB');
  if (Math.abs(n) >= 100) return n.toFixed(Math.max(0, digits - 2));
  return Number(n.toPrecision(Math.max(digits + 1, 3))).toString();
}
export function hoursToDay(h: number) {
  const a = Math.abs(h);
  if (a >= 48) return `${fmt(a / 24, 1)} days`;
  return `${fmt(a, 2)} hours`;
}
export function daysToYear(d: number) {
  if (d > 800) return `${fmt(d / 365.25, 1)} years`;
  return `${fmt(d, 1)} days`;
}

export interface Row { label: string; value: string; vs?: string }

const earth = P.earth.physical as Record<string, number>;
function ratio(key: string, v: number) {
  const e = earth[key];
  if (!e) return undefined;
  const r = v / e;
  return r >= 100 ? `${Math.round(r).toLocaleString('en-GB')}×` : `${Number(r.toPrecision(3))}×`;
}

export function physicalRows(slug: string): Row[] {
  const p = P[slug].physical as Record<string, number>;
  const rows: Row[] = [
    { label: 'Mean radius', value: `${fmt(p.radius_mean_km)} km`, vs: ratio('radius_mean_km', p.radius_mean_km) },
    { label: 'Mass', value: `${fmt(p.mass_1e24kg, 3)} × 10²⁴ kg`, vs: ratio('mass_1e24kg', p.mass_1e24kg) },
    { label: 'Mean density', value: `${fmt(p.density_kgm3)} kg/m³`, vs: ratio('density_kgm3', p.density_kgm3) },
    { label: 'Surface gravity', value: `${p.gravity_ms2} m/s²`, vs: ratio('gravity_ms2', p.gravity_ms2) },
    { label: 'Escape velocity', value: `${p.escape_kms} km/s`, vs: ratio('escape_kms', p.escape_kms) },
    { label: 'Bond albedo', value: `${p.albedo_bond}` },
    { label: 'Sunlight at orbit', value: `${fmt(p.irradiance_wm2)} W/m²`, vs: ratio('irradiance_wm2', p.irradiance_wm2) },
  ];
  return rows;
}

export function orbitRows(slug: string): Row[] {
  const p = P[slug].physical as Record<string, number>;
  const au = (P[slug].elements as any).a_au;
  const rows: Row[] = [
    { label: 'Distance from Sun', value: `${fmt(au, 3)} au`, vs: ratio('semimajor_1e6km', p.semimajor_1e6km) },
    { label: '', value: `${fmt(p.semimajor_1e6km)} million km` },
    { label: 'Closest (perihelion)', value: `${fmt(p.perihelion_1e6km)} million km` },
    { label: 'Farthest (aphelion)', value: `${fmt(p.aphelion_1e6km)} million km` },
    { label: 'Orbital period (year)', value: daysToYear(p.orbit_period_days), vs: ratio('orbit_period_days', p.orbit_period_days) },
    { label: 'Mean orbital speed', value: `${p.orbit_velocity_kms} km/s`, vs: ratio('orbit_velocity_kms', p.orbit_velocity_kms) },
    { label: 'Eccentricity', value: `${p.eccentricity}` },
    { label: 'Inclination to ecliptic', value: `${p.inclination_deg}°` },
    { label: 'Rotation (sidereal)', value: hoursToDay(p.rotation_hours) + (p.rotation_hours < 0 ? ' (retrograde)' : '') },
    { label: 'Solar day', value: hoursToDay(p.day_hours) },
    { label: 'Axial tilt', value: `${p.obliquity_deg}°` },
  ];
  return rows.filter((r) => r.label !== '');
}

export const sunFacts: Row[] = [
  { label: 'Mean radius', value: '695,700 km', vs: '109×' },
  { label: 'Mass', value: '1,988,400 × 10²⁴ kg', vs: '332,900×' },
  { label: 'Mean density', value: '1,408 kg/m³', vs: '0.26×' },
  { label: 'Surface gravity', value: '274 m/s²', vs: '28×' },
  { label: 'Escape velocity', value: '617.6 km/s', vs: '55×' },
  { label: 'Luminosity', value: '3.828 × 10²⁶ W' },
  { label: 'Spectral type', value: 'G2 V' },
  { label: 'Rotation (at 16° latitude)', value: '25.4 days' },
  { label: 'Axial tilt to ecliptic', value: '7.25°' },
];
