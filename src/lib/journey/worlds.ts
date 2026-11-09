import { createTerrain } from './terrain';
import { fbm, hash } from './noise';
import { createOcean } from './ocean';
import { createClouds } from './clouds';
import { createSaturnSky } from './saturn';
import { createIceGiant } from './icegiant';
import type { World } from './types';

const fmtM = (m: number) => `${m.toFixed(1)} m`;
const SATURN_SUN: [number, number, number] = [0.2312, 0.4493, 0.8629];
/** The Sun's direction in a planet's frame (y = north pole), from its declination and the hour angle at longitude lon. */
function sunPlanet(declDeg: number, hourDeg: number, lonDeg: number): [number, number, number] {
  const d = declDeg * Math.PI / 180, L = (lonDeg - hourDeg) * Math.PI / 180;
  return [Math.cos(d) * Math.cos(L), Math.sin(d), -Math.cos(d) * Math.sin(L)];
}
/** The same direction seen from the ground at lat/lon, facing due south (x right, y up, -z ahead). */
function sunLocal(lat: number, lon: number, s: [number, number, number]): [number, number, number] {
  const la = lat * Math.PI / 180, lo = lon * Math.PI / 180;
  const up = [Math.cos(la) * Math.cos(lo), Math.sin(la), -Math.cos(la) * Math.sin(lo)];
  let so = [up[0] * up[1], -1 + up[1] * up[1], up[2] * up[1]];
  const n = Math.hypot(so[0], so[1], so[2]); so = so.map((v) => v / n);
  const right = [so[1] * up[2] - so[2] * up[1], so[2] * up[0] - so[0] * up[2], so[0] * up[1] - so[1] * up[0]];
  const dot = (a: number[], b: number[]) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  return [dot(s, right), dot(s, up), -dot(s, so)];
}
// Sun over 74.3° N on Uranus and 19.5° S on Neptune, 9 Nov 2026 (JPL Horizons sub-solar latitudes).
// Uranus: the north pole tipped right towards the Sun, so at 45° north it never sets
// The view is at local midnight: the Sun is due north and as low as it gets, 29° up.
const URANUS_SUN = sunPlanet(74.3, 180, 0);
/**
 * A moon on a circular orbit over the equator, at orbital longitude phiDeg, seen from the cloud tops at
 * lat/lon: its direction in the local frame and its angular radius (parallax included, since the
 * moons are only a few planet radii away).
 */
function moonLocal(lat: number, lon: number, planetKm: number, distKm: number, moonKm: number, phiDeg: number) {
  const la = lat * Math.PI / 180, lo = lon * Math.PI / 180, ph = phiDeg * Math.PI / 180;
  const o = [planetKm * Math.cos(la) * Math.cos(lo), planetKm * Math.sin(la), -planetKm * Math.cos(la) * Math.sin(lo)];
  const v = [distKm * Math.cos(ph) - o[0], -o[1], -distKm * Math.sin(ph) - o[2]];
  const n = Math.hypot(v[0], v[1], v[2]);
  return { dir: sunLocal(lat, lon, [v[0] / n, v[1] / n, v[2] / n]), radius: moonKm / n };
}
// Uranus's five large moons (orbit radius, radius in km), placed along their arc in the southern sky
const URANUS_MOONS = ([
  [129900, 235.8, -9, [0.42, 0.42, 0.42], [0.75, 0.74, 0.72]],   // Miranda
  [190900, 578.9, 6, [0.36, 0.36, 0.36], [0.72, 0.71, 0.69]],    // Ariel
  [266000, 584.7, -19, [0.22, 0.22, 0.22], [0.42, 0.41, 0.4]],   // Umbriel, the darkest
  [436300, 788.9, 17, [0.33, 0.31, 0.3], [0.62, 0.58, 0.55]],    // Titania
  [583500, 761.4, -29, [0.3, 0.28, 0.27], [0.55, 0.51, 0.48]],   // Oberon
] as [number, number, number, [number, number, number], [number, number, number]][]).map(([d, r, ph, dark, light]) => ({ ...moonLocal(45, 0, 25559, d, r, ph), dark, light }));
// Neptune: southern summer is ending
// Late afternoon at 29° north, the Sun about 11° up in the west-south-west.
const NEPTUNE_SUN = sunPlanet(-19.5, 65, 0);


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

  mercury: {
    slug: 'mercury',
    hazeCss: 'radial-gradient(120% 90% at 50% 100%, #8a847c 0%, #2c2a28 45%, #050505 100%)',
    orbit: {
      look: {
        map: '4k_mercury.webp', mapHi: '8k_mercury.webp', detail: 'rock', grain: 0.22, relief: 0.9, craters: 0.9,
        air: [0, 0, 0], airDensity: 0, airHeight: 0.001, dusk: [1, 1, 1],
        skyZenith: [0, 0, 0], skyHorizon: [0, 0, 0], skyTop: 0.001, ambient: 0.008, limbDark: 0,
      },
      radiusKm: 2439.7, startAltRadii: 2.4, handoverAlt: 0.003,
      target: { lat: 79, lon: -30 }, startYaw: 1.0, startTilt: 0.5,
      landing: { sunElev: 5, sunYaw: 15, faceYaw: 134, pitch: 3 },
      moons: [],
    },
    buildLower: () => createTerrain({
      planetRadiusM: 2439700,
      sky: { zenith: '#000000', horizon: '#000000', aureole: '#fff3e2', aureoleSize: 0.03, aureoleAmount: 0.14, sunDisc: 1, groundGlow: '#000000', toward: 0, sunSize: 0.0119 },
      stars: 0.3,
      farShadow: true,
      craterlets: 1,
      sunDir: [-0.513, 0.087, -0.854], sunColor: '#fff8ee', sunIntensity: 7,
      skyLight: '#000000', groundLight: '#2e2a26', ambient: 0.7,
      haze: '#000000', hazeDensity: 0,
      dust: '#77716a', gravel: '#57524d', bedrock: '#8a847d', slabs: 0.05, rock: '#625d57', rockFlat: 0.8,
      rocks: 700, pebbles: 5000,
      height: mercuryHeight, eye: 1.7, travel: 30, look: 0.8, lookPitch: -0.09,
      exposure: 1.3,
      readout: () => fmtM(1.7),
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

  saturn: {
    slug: 'saturn',
    hazeCss: 'radial-gradient(120% 90% at 50% 100%, #f1e2bf 0%, #c9ad7c 45%, #3c3226 100%)',
    orbit: {
      look: {
        map: '4k_saturn.webp', detail: 'bands', grain: 0.16, stretch: 7, relief: 0, craters: 0, exposure: 0.95, saturation: 1.05,
        air: [0.86, 0.8, 0.66], airDensity: 0.14, airHeight: 0.01, dusk: [1, 0.78, 0.55],
        skyZenith: [0.035, 0.07, 0.16], skyHorizon: [0.78, 0.68, 0.5], skyTop: 0.004, ambient: 0.02, limbDark: 0.5,
        rings: true, flattening: 0.098,
      },
      radiusKm: 60268, startAltRadii: 5.2, handoverAlt: 0.0016,
      target: { lat: 40, lon: 0 }, startYaw: 0.5, startTilt: -0.15,
      // northern summer, late afternoon: the Sun 26.7° north of the ring plane, low in the west
      landing: { sunElev: 0, sunYaw: 0, faceYaw: 0, pitch: 7, sun: SATURN_SUN, faceSouth: true },
      moons: [],
    },
    buildLower: () => createSaturnSky({
      lat: 40, lon: 0, sun: SATURN_SUN, flattening: 0.098,
      readout: (g) => `${(0.2 + g * 0.35).toFixed(2)} bar`,
    }),
  },

  uranus: {
    slug: 'uranus',
    hazeCss: 'radial-gradient(120% 90% at 50% 100%, #d9f1ef 0%, #8fc3c6 45%, #1d3a44 100%)',
    orbit: {
      look: {
        map: '2k_uranus.jpg', detail: 'bands', grain: 0.1, relief: 0, craters: 0, exposure: 1, saturation: 1.05, stretch: 8,
        air: [0.66, 0.86, 0.88], airDensity: 0.14, airHeight: 0.006, rim: 0.4, dusk: [0.5, 0.78, 0.8],
        skyZenith: [0.05, 0.14, 0.22], skyHorizon: [0.6, 0.8, 0.82], skyTop: 0.005, ambient: 0.02, limbDark: 0.6,
        flattening: 0.023,
      },
      radiusKm: 25559, startAltRadii: 3, handoverAlt: 0.002,
      target: { lat: 45, lon: 0 }, startYaw: 0.6, startTilt: 0.3,
      landing: { sunElev: 0, sunYaw: 0, faceYaw: 0, pitch: 4, sun: URANUS_SUN, faceSouth: true },
      moons: [],
    },
    buildLower: () => createIceGiant({
      sunDir: sunLocal(45, 0, URANUS_SUN), planetRadiusKm: 25559,
      deckDark: [0.4, 0.64, 0.68], deckLight: [0.66, 0.86, 0.87], horizon: [0.6, 0.8, 0.82], zenith: [0.04, 0.12, 0.2],
      haze: 800, cirrus: 0.3, cirrusHeight: 10, banding: 0.55,
      yaw: 0, pitch: 0.3, heights: [70, 30],
      moons: URANUS_MOONS,
      exposure: 0.85,
      readout: (g) => `${(0.6 + g * 0.6).toFixed(2)} bar`,
    }),
  },

  neptune: {
    slug: 'neptune',
    hazeCss: 'radial-gradient(120% 90% at 50% 100%, #b9d0ff 0%, #4f74c8 45%, #0b1636 100%)',
    orbit: {
      look: {
        map: '2k_neptune.jpg', detail: 'bands', grain: 0.22, relief: 0, craters: 0, exposure: 1, saturation: 1.1, stretch: 5,
        air: [0.42, 0.58, 0.95], airDensity: 0.16, airHeight: 0.006, rim: 0.5, dusk: [0.8, 0.85, 1],
        skyZenith: [0.01, 0.03, 0.1], skyHorizon: [0.36, 0.55, 0.85], skyTop: 0.005, ambient: 0.02, limbDark: 0.55,
        flattening: 0.017,
      },
      radiusKm: 24764, startAltRadii: 3, handoverAlt: 0.002,
      target: { lat: 29, lon: 0 }, startYaw: -0.9, startTilt: -0.25,
      landing: { sunElev: 0, sunYaw: 0, faceYaw: 0, pitch: 4, sun: NEPTUNE_SUN, faceSouth: true },
      moons: [],
    },
    buildLower: () => createIceGiant({
      sunDir: sunLocal(29, 0, NEPTUNE_SUN), planetRadiusKm: 24764,
      deckDark: [0.1, 0.2, 0.55], deckLight: [0.3, 0.46, 0.86], horizon: [0.36, 0.55, 0.85], zenith: [0.01, 0.03, 0.1],
      haze: 1000, cirrus: 1, cirrusHeight: 14, banding: 0.7,
      sunSide: 0.38, pitch: -0.07, heights: [70, 30],
      exposure: 0.9,
      readout: (g) => `${(0.4 + g * 0.6).toFixed(2)} bar`,
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

/**
 * Mercury, about 79° north: walking along the rim of a 12 km crater, looking across it. Older craters
 * at every size, softened by later impacts, and a lobate scarp (a cliff thrown up as the planet shrank)
 * on the far side.
 */
const MC = { x: -6004, z: -15, R: 6000 };
function mercuryHeight(x: number, z: number) {
  // gently rolling ground, quietened along the camera's path
  const near = Math.min(1, Math.hypot(x, z + 15) / 50);
  let h = (fbm(x / 1800 + 2, z / 1800, 4) - 0.5) * 60 + ((fbm(x / 120, z / 120 + 4, 3) - 0.5) * 4 + (fbm(x / 9, z / 9, 2) - 0.5) * 0.3) * (0.3 + 0.7 * near);
  // older craters at three sizes, one chance in each cell
  h += craterField(x, z, 1700, 0.42, 11) + craterField(x, z, 320, 0.4, 23) * (0.2 + 0.8 * near) + craterField(x, z, 60, 0.38, 37) * near;
  // the big crater: flat floor and central peak, terraced walls, a rounded rim, ejecta falling off as r^-3
  const d = Math.hypot(x - MC.x, z - MC.z), rn = d / MC.R;
  // the rim height wanders a little; both sides of the crest share it so the crest stays put
  const rim = 380 * (0.85 + 0.3 * fbm(x / 500, z / 500 + 3, 3)), floor = 380 - 1700;
  const t = Math.max(0, (rn - 0.5) / 0.5);
  let hin = floor + (rim - floor) * Math.pow(t, 1.8);
  if (rn > 0.5 && rn < 1) {
    // slumped terraces down the inner wall, fading out before the crest so they never stand above it
    const f = (hin - floor) / 230, k = f % 1;
    const terr = Math.min(rim, floor + (Math.floor(f) + Math.min(1, Math.pow(k / 0.45, 2))) * 230);
    const w = 0.6 * (1 - smooth(0.82, 0.95, t));
    hin = hin * (1 - w) + w * terr;
  }
  hin += (fbm(x / 700, z / 700 + 9, 4) - 0.5) * 120 * (1 - t);
  if (rn < 0.16) hin += 520 * Math.pow(1 - rn / 0.16, 1.6) * (0.75 + 0.5 * fbm(x / 300, z / 300, 3));
  const hout = rim * Math.pow(Math.max(rn, 0.2), -3);
  // smooth minimum of the two so the crest is rounded over a few metres, not a knife edge
  const k = 5;
  const hh = -k * Math.log(Math.exp(-hin / k) + Math.exp(-hout / k));
  h += isFinite(hh) ? hh : Math.min(hin, hout);
  // lobate scarp: a steep face towards us, a long gentle back slope away
  const sx = x + 16500 - 0.06 * z - 900 * Math.sin(z / 9000 + 1);
  const face = 1 / (1 + Math.exp(sx / 260));
  h += 650 * face * Math.min(1, Math.exp((sx + 2600) / 9000));
  return h;
}

/** Bowl craters with raised rims, one per cell at most, some fresh and some worn down. */
function craterField(x: number, z: number, cell: number, chance: number, seed: number) {
  const cx = Math.floor(x / cell), cz = Math.floor(z / cell);
  let h = 0;
  for (let j = -1; j <= 1; j++) for (let i = -1; i <= 1; i++) {
    const gx = cx + i, gz = cz + j;
    if (hash(gx * 3 + seed, gz * 7 - seed) > chance) continue;
    const px = (gx + 0.2 + 0.6 * hash(gx, gz + seed)) * cell, pz = (gz + 0.2 + 0.6 * hash(gx + seed, gz)) * cell;
    const R = cell * (0.08 + 0.3 * Math.pow(hash(gx - seed, gz * 5), 2));
    const rn = Math.hypot(x - px, z - pz) / R;
    if (rn > 3) continue;
    const fresh = 0.3 + 0.7 * hash(gx * 11, gz - seed * 3);
    const rim = 0.08 * R * fresh, dep = 0.36 * R * fresh;
    h += rn < 1 ? -dep + (dep + rim) * rn * rn : rim * (Math.pow(rn, -3) - 1 / 27) / (1 - 1 / 27);
  }
  return h;
}

function smooth(a: number, b: number, x: number) {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
}
