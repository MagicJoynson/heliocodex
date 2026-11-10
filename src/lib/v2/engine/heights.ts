import { createNoise3 } from './noise';
import type { V3 } from './vec';

/**
 * Where a body's ground height comes from. Phase 1 uses a generated test world; from phase 2
 * the same interface is backed by real NASA height tiles, with generated detail below them.
 */
export interface HeightSource {
  /** mean radius in metres */
  radius: number;
  /** highest and lowest ground relative to the radius, in metres (for culling and the horizon) */
  maxHeight: number;
  minHeight: number;
  /**
   * Height above the radius at a unit direction from the centre, in metres. `detail` is the
   * shortest wavelength worth adding at this level of detail; finer features are left out.
   */
  height(dir: V3, detail: number): number;
  /**
   * The same, asked by cube face and face coordinates (see cube.ts). Sources backed by real data
   * provide it so that tile vertices fall exactly on the data's own samples.
   */
  heightAt?(face: number, s: number, t: number, detail: number): number;
  /** Fetch whatever one terrain tile needs. After it resolves, heights for that tile are final. */
  prepare?(face: number, level: number, i: number, j: number): Promise<void>;
  /** Resolves once the source can answer at all (its coarsest data has arrived). */
  ready?: Promise<void>;
  /**
   * Metres between real measurements at the finest level. Anything finer than this is generated,
   * and the page must say so. Undefined means the whole world is generated.
   */
  resolution?: number;
}

/**
 * A plain grey test world the size of Mars: rolling ground, ridged ranges and smooth lowlands,
 * with fractal detail all the way down to a couple of metres. Not meant to look like anywhere.
 */
export function testWorld(radius = 3_389_500, seed = 7): HeightSource {
  const n1 = createNoise3(seed), n2 = createNoise3(seed + 11), n3 = createNoise3(seed + 23);
  const LONGEST = 600_000; // m
  const TOP = 5_500, RIDGE = 3_200;
  return {
    radius,
    maxHeight: TOP + RIDGE + 2_300,
    minHeight: -(TOP + 2_300),
    height(d, detail) {
      const x = d[0] * radius, y = d[1] * radius, z = d[2] * radius;
      // continents: very low frequency, decides where the high ground is
      const f0 = 1 / LONGEST;
      const cont = n1(x * f0, y * f0, z * f0) * 0.7 + n1(x * f0 * 2.1, y * f0 * 2.1, z * f0 * 2.1) * 0.3;
      // mountain ranges: ridged noise, only on high ground
      const f1 = 1 / 140_000;
      // each octave only adds to the ones before (a fixed normaliser, and finer octaves centred on
      // zero), so a tile that gains an octave keeps its shape and only gains detail
      let ridge = 0, amp = 1, f = f1;
      for (let o = 0; o < 6 && 1 / f > detail * 2; o++) {
        const r = 1 - Math.abs(n2(x * f, y * f, z * f));
        ridge += (r * r - (o ? 0.35 : 0)) * amp;
        amp *= 0.48; f *= 2.03;
      }
      ridge /= 1.899;
      const high = Math.max(0, Math.min(1, (cont + 0.1) * 2.2));
      let h = cont * TOP + ridge * RIDGE * high * high;
      // everything finer: fractal detail whose size falls off with wavelength
      let a = 900, w = 40_000;
      while (w > detail * 2 && w > 1.5) {
        const fw = 1 / w;
        h += n3(x * fw, y * fw, z * fw) * a * (0.55 + 0.45 * high);
        w *= 0.5; a *= 0.6;
      }
      return h;
    },
  };
}
