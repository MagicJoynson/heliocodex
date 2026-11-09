import { createTerrain } from './terrain';
import { fbm } from './noise';
import { createOcean } from './ocean';
import { createClouds } from './clouds';
import type { World } from './types';

const fmtM = (m: number) => `${m.toFixed(1)} m`;

export const worlds: Record<string, World> = {
  mars: {
    slug: 'mars',
    hazeCss: 'radial-gradient(120% 90% at 50% 100%, #f0b283 0%, #d58a5e 40%, #8e4d33 100%)',
    orbit: {
      look: {
        map: '4k_mars.webp', mapHi: '8k_mars.webp', detail: 'rock', grain: 0.5, relief: 1, craters: 0.8,
        air: [0.86, 0.6, 0.44], airDensity: 0.22, airHeight: 0.012, dusk: [1, 0.72, 0.56],
        skyZenith: [0.3, 0.19, 0.15], skyHorizon: [0.85, 0.62, 0.46], skyTop: 0.02, ambient: 0.025, limbDark: 0,
      },
      radiusKm: 3396.2, startAltRadii: 2.6, handoverAlt: 0.004,
      target: { lat: -5.4, lon: 137.8 }, startYaw: 1.2, startTilt: 0.26,
      landing: { sunElev: 5.7, sunYaw: 30, faceYaw: 180, pitch: 3 },
      moons: [
        { orbitR: 2.76, size: 0.05, color: 0x7d7068, seed: 3, speed: 0.22, phase: 0.55 },
        { orbitR: 6.9, size: 0.034, color: 0x8a7d72, seed: 9, speed: 0.06, phase: 2.6 },
      ],
    },
    buildLower: () => createTerrain({
      planetRadiusM: 3389500,
      sky: { zenith: '#3b2b27', horizon: '#c99772', aureole: '#86a3d0', aureoleSize: 0.2, aureoleAmount: 0.8, sunDisc: 1, groundGlow: '#5b3d2e' },
      sunDir: [0.5, 0.1, -0.86], sunColor: '#ffe3c6', sunIntensity: 3.0,
      skyLight: '#c99a7a', groundLight: '#3a2418', ambient: 1.35,
      haze: '#c4936f', hazeDensity: 1 / 15000,
      dust: '#a9663f', gravel: '#5a3b2b', bedrock: '#b88b6a', slabs: 0.6, rock: '#7d5641',
      rocks: 1300, pebbles: 6000,
      height: marsHeight, eye: 2.1, travel: 40,
      dustMotes: { color: '#e8c3a0', count: 260, opacity: 0.5 },
      exposure: 1.05,
      readout: () => fmtM(2.1),
    }),
  },

  venus: {
    slug: 'venus',
    hazeCss: 'radial-gradient(120% 90% at 50% 100%, #f2d27a 0%, #d6a043 45%, #7a4a1c 100%)',
    orbit: {
      look: {
        map: '4k_venus_clouds.webp', detail: 'veil', grain: 0.07, relief: 0, craters: 0, exposure: 0.86, saturation: 1.1,
        air: [1, 0.86, 0.6], airDensity: 0.22, airHeight: 0.02, dusk: [1, 0.74, 0.44],
        skyZenith: [0.36, 0.31, 0.3], skyHorizon: [0.95, 0.84, 0.6], skyTop: 0.03, ambient: 0.03, limbDark: 0.35,
      },
      radiusKm: 6051.8, startAltRadii: 2.2, handoverAlt: 0.012,
      target: { lat: 0.5, lon: -165.5 }, startYaw: -1.0, startTilt: 0.2,
      landing: { sunElev: 40, sunYaw: 22, faceYaw: 180, pitch: 3 },
      moons: [],
    },
    buildLower: () => createTerrain({
      planetRadiusM: 6051800,
      sky: { zenith: '#b97a34', horizon: '#dca15a', aureole: '#f0c070', aureoleSize: 0.9, aureoleAmount: 0.25, sunDisc: 0, groundGlow: '#6a4520', toward: 0.25 },
      sunDir: [0.2, 0.7, -0.5], sunColor: '#ffc27a', sunIntensity: 0.55,
      skyLight: '#e2a250', groundLight: '#3a2410', ambient: 1.9,
      haze: '#d39a52', hazeDensity: 1 / 900,
      dust: '#6e5c49', gravel: '#4a4036', bedrock: '#7d6c58', slabs: 0.95, rock: '#5c4e40', rockFlat: 0.35,
      rocks: 500, pebbles: 2500,
      height: venusHeight, eye: 1.6, travel: 24,
      exposure: 1.0,
      readout: () => '0 m · 92 bar',
    }),
  },

  earth: {
    slug: 'earth',
    hazeCss: 'radial-gradient(120% 90% at 50% 100%, #f7ead6 0%, #b6cfe6 45%, #3d6b97 100%)',
    orbit: {
      look: {
        map: '4k_earth_day.webp', mapHi: '8k_earth_day.webp', night: '4k_earth_night.webp', water: '4k_earth_water.webp', clouds: '4k_earth_clouds.webp',
        detail: 'earth', grain: 0.28, relief: 0.9, craters: 0,
        air: [0.36, 0.56, 1], airDensity: 1, airHeight: 0.016, dusk: [1, 0.55, 0.34],
        skyZenith: [0.12, 0.25, 0.55], skyHorizon: [0.92, 0.76, 0.6], skyTop: 0.012, ambient: 0.012, limbDark: 0,
      },
      radiusKm: 6371, startAltRadii: 2.0, handoverAlt: 0.0026,
      target: { lat: 21, lon: -157 }, startYaw: 1.4, startTilt: 0.3,
      landing: { sunElev: 7.5, sunYaw: 25, faceYaw: 180, pitch: 3 },
      moons: [{ orbitR: 7.5, size: 0.27, color: 0xb9b4ac, seed: 4, speed: 0.04, phase: 0.6 }],
    },
    buildLower: () => createOcean({
      sunDir: [0.42, 0.13, -0.9],
      readout: () => '3 m',
    }),
  },

  jupiter: {
    slug: 'jupiter',
    hazeCss: 'radial-gradient(120% 90% at 50% 100%, #e8cfa4 0%, #b88a5a 45%, #4a2e1e 100%)',
    orbit: {
      look: {
        map: '4k_jupiter.webp', mapHi: '8k_jupiter.webp', detail: 'bands', grain: 0.2, relief: 0, craters: 0, exposure: 0.95, saturation: 1.35,
        air: [0.82, 0.76, 0.66], airDensity: 0.12, airHeight: 0.01, dusk: [1, 0.7, 0.5],
        skyZenith: [0.09, 0.1, 0.15], skyHorizon: [0.79, 0.66, 0.5], skyTop: 0.004, ambient: 0.02, limbDark: 0.55,
      },
      radiusKm: 69911, startAltRadii: 2.4, handoverAlt: 0.0015,
      target: { lat: -20.5, lon: -44 }, startYaw: 1.1, startTilt: 0.15,
      landing: { sunElev: 25, sunYaw: -110, faceYaw: 90, pitch: 4 },
      moons: [
        { orbitR: 5.9, size: 0.05, color: 0xd9c46a, seed: 2, speed: 0.34, phase: 0.4 },
        { orbitR: 9.4, size: 0.045, color: 0xcfc4b4, seed: 6, speed: 0.17, phase: 2.2 },
        { orbitR: 15, size: 0.07, color: 0x8f877a, seed: 7, speed: 0.085, phase: 3.4 },
        { orbitR: 26.3, size: 0.065, color: 0x5a5148, seed: 8, speed: 0.036, phase: 5.0 },
      ],
    },
    buildLower: () => createClouds({
      sunDir: [-0.85, 0.42, 0.31],
      readout: (g) => `${(0.25 + g * 0.45).toFixed(2)} bar`,
    }),
  },
};

/** Gale Crater, Mars: rolling plain, the Murray Buttes, Mount Sharp's layered slopes and the far crater rim. */
function marsHeight(x: number, z: number) {
  let h = (fbm(x / 650 + 3, z / 650, 5) - 0.5) * 34 + (fbm(x / 95 + 7, z / 95, 4) - 0.5) * 3 + (fbm(x / 15, z / 15 + 2, 3) - 0.5) * 0.35 + (fbm(x / 2.6, z / 2.6, 2) - 0.5) * 0.1;
  // keep the ground under the camera's path gentle
  const near = Math.min(1, Math.hypot(x, z + 20) / 60);
  h *= 0.35 + 0.65 * near;
  // Mount Sharp (Aeolis Mons): a broad layered mound, terraced by its strata and cut by gullies
  const dx = x + 9000, dz = z + 24000;
  const dk = Math.hypot(dx, dz) / 1000;
  if (dk < 20) {
    let m = 5500 * Math.pow(Math.max(0, 1 - Math.pow(dk / 19, 1.5)), 1.9);
    m *= 1 - 0.3 * Math.abs(fbm(dx / 2600, dz / 2600, 4) - 0.5) * 2;
    const step = 220, f = m / step;
    m = (Math.floor(f) + Math.min(1, Math.pow((f % 1) / 0.35, 2))) * step;
    h += m;
  }
  // the crater rim, 77 km from the centre
  const dr = Math.hypot(dx, dz) - 77000;
  const env = Math.exp(-((dr / 9000) ** 2));
  if (env > 0.001) h += env * (1500 + 900 * fbm(dx / 7000, dz / 7000, 4));
  // Murray Buttes: small flat-topped hills a few hundred metres away
  for (const [bx, bz, r, ht] of [[-180, -420, 70, 16], [160, -640, 95, 22], [-420, -900, 120, 18], [420, -380, 55, 12]]) {
    const d = Math.hypot(x - bx, z - bz) + (fbm(x / 40, z / 40, 3) - 0.5) * 40;
    h += ht * (1 - smooth(r * 0.85, r * 1.25, d)) * (0.92 + 0.08 * fbm(x / 8, z / 8, 2));
  }
  return h;
}

/** Venus near a Venera landing site: flat, slabby volcanic plains, the horizon lost in haze. */
function venusHeight(x: number, z: number) {
  let h = (fbm(x / 900, z / 900 + 5, 4) - 0.5) * 40 + (fbm(x / 120, z / 120, 3) - 0.5) * 3 + (fbm(x / 9, z / 9, 2) - 0.5) * 0.25;
  const near = Math.min(1, Math.hypot(x, z + 12) / 40);
  h *= 0.3 + 0.7 * near;
  return h;
}

function smooth(a: number, b: number, x: number) {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
}
