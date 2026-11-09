import { createGround } from './ground';
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
    buildLower: () => createGround({
      horizon: '#d99d74', zenith: '#4d3126',
      halo: { color: [0.42, 0.56, 0.8], power: 48, amount: 0.62 },
      sunDir: [0.5, 0.1, -0.86], sunDisc: true, sunColor: 0xffd4a4, sunIntensity: 3.2,
      fogColor: '#d99d74', fogNear: 6, fogFar: 700,
      hemiSky: 0xc9946f, hemiGround: 0x2b1a14, hemiIntensity: 1.1,
      texRGB: [168, 98, 62], tint: [0.7, 0.62, 0.58], rockColor: 0x6b4332,
      relief: 1, mesa: 1, crackCells: 150, crackSoft: 3, texScale: 16,
      dust: { color: 0xe9bf9a, opacity: 0.28, size: 0.55, count: 520 },
      moonInSky: true, eyeHeight: 1.7, travel: 46,
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
    buildLower: () => createGround({
      horizon: '#b87a34', zenith: '#8a5624',
      sunDir: [0.2, 0.7, -0.5], sunDisc: false, sunColor: 0xffc27a, sunIntensity: 0.9,
      fogColor: '#b07430', fogNear: 2, fogFar: 170,
      hemiSky: 0xd89a48, hemiGround: 0x2a1809, hemiIntensity: 1.1,
      texRGB: [96, 78, 64], tint: [0.55, 0.5, 0.42], rockColor: 0x4a3a2c,
      relief: 0.5, mesa: 0.4, crackCells: 60, crackSoft: 5, texScale: 22,
      dust: { color: 0xe4b060, opacity: 0.2, size: 0.8, count: 380 },
      moonInSky: false, eyeHeight: 1.8, travel: 30,
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
      horizon: '#f3c797', zenith: '#3f6fa8',
      sunDir: [0.42, 0.13, -0.9], water: '#1c5e7a', deep: '#0c2b45',
      readout: () => '2.4 m',
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
      landing: { sunElev: 20, sunYaw: -20, faceYaw: 90, pitch: 4 },
      moons: [
        { orbitR: 5.9, size: 0.05, color: 0xd9c46a, seed: 2, speed: 0.34, phase: 0.4 },
        { orbitR: 9.4, size: 0.045, color: 0xcfc4b4, seed: 6, speed: 0.17, phase: 2.2 },
        { orbitR: 15, size: 0.07, color: 0x8f877a, seed: 7, speed: 0.085, phase: 3.4 },
        { orbitR: 26.3, size: 0.065, color: 0x5a5148, seed: 8, speed: 0.036, phase: 5.0 },
      ],
    },
    buildLower: () => createClouds({
      horizon: '#c9a880', zenith: '#161b26',
      palette: ['#f1e6cf', '#c99a66', '#9a5a3c', '#efe0c6', '#6f4630', '#d9b98a'],
      stormColor: '#b4472c',
      heightStart: 170, heightEnd: 26,
      readout: (g) => `${(0.1 + g * 1.9).toFixed(1)} bar`,
    }),
  },
};
