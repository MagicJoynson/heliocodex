import { createNoise3 } from './noise';

/**
 * Generated small craters, for airless ground below the resolution of the measured heights.
 *
 * None of these craters is real. They are made up to the pattern real small craters follow (bowls
 * about a fifth as deep as they are wide when fresh, mostly worn shallower, with a low raised rim,
 * no two quite round, and about as many again at every halving of size), so that the ground between real measurements
 * looks like the Moon and not like a smooth hill. The page must say so wherever they show.
 *
 * How it works: space is cut into cubes, one size of cube for each size of crater. Each cube that
 * lies in the thin shell at the body's radius holds one crater at a fixed, made-up position. The
 * answer at a point depends only on the point, so it is the same on every device, in a worker or
 * not, and at every level of detail. A coarser level simply leaves out the smaller sizes.
 */

/** largest crater a cube can hold, as a share of the cube's side (rim to rim) */
const D_MAX = 0.42;
const D_MIN = 0.22;
/** the worn blanket of thrown-out material reaches this many crater radii from the centre */
const REACH = 1.5;
/** how far a rim strays from a true circle, as a share of its radius */
const WOBBLE = 0.1;
/** a cube counts only if its crater's centre is within this share of a cube of the surface */
const SHELL = 0.34;

// one whole-number scramble (after Bob Jenkins / Thomas Wang style mixers); exact in every browser
function mix(a: number, b: number, c: number, d: number): number {
  let h = Math.imul(a, 0x9e3779b1) ^ Math.imul(b, 0x85ebca77) ^ Math.imul(c, 0xc2b2ae3d) ^ Math.imul(d, 0x27d4eb2f);
  h ^= h >>> 15; h = Math.imul(h, 0x2c1b3c6d);
  h ^= h >>> 12; h = Math.imul(h, 0x297a2d39);
  h ^= h >>> 15;
  return h >>> 0;
}

export interface CraterField {
  /** side of the largest cube, metres: craters come no wider than 0.42 of this */
  readonly largest: number;
  /**
   * Height to add, metres, at unit direction (dx, dy, dz) from the centre of a body of `radius`
   * metres. `detail` is the spacing of the vertices asking: craters too small for it are left out.
   */
  (dx: number, dy: number, dz: number, detail: number): number;
}

/**
 * @param radius    body radius, metres
 * @param widest    widest crater to make, metres (the measured data's sample spacing: wider ones are in the data)
 * @param seed      changes every crater
 * @param smallest  narrowest crater worth making, metres
 */
export function createCraters(radius: number, widest: number, seed = 1, smallest = 1): CraterField {
  const largest = widest / D_MAX;
  const noise = createNoise3(seed + 5);
  const fn = (dx: number, dy: number, dz: number, detail: number): number => {
    let h = 0;
    // one size of cube per pass, each 0.71 of the last, so the sizes overlap and the ground is crowded
    // the way old airless ground is. A size is used once its narrowest crater spans about two vertices.
    for (let w = largest, o = 0; w * D_MIN > detail * 1.8 && w * D_MAX > smallest; w *= Math.SQRT1_2, o++) {
      const R = radius / w;
      const px = dx * R, py = dy * R, pz = dz * R;
      // a crater that reaches this point has its centre within half a cube on every axis: 8 cubes to look in
      const ix = Math.floor(px - 0.5), iy = Math.floor(py - 0.5), iz = Math.floor(pz - 0.5);
      for (let c = 0; c < 8; c++) {
        const cx = ix + (c & 1), cy = iy + ((c >> 1) & 1), cz = iz + (c >> 2);
        const k = mix(cx, cy, cz, seed * 64 + o);
        // centre of this cube's crater, measured from the point
        const vx = cx + (k & 1023) / 1024 - px, vy = cy + ((k >>> 10) & 1023) / 1024 - py, vz = cz + ((k >>> 20) & 1023) / 1024 - pz;
        const up = vx * dx + vy * dy + vz * dz; // how far the centre is above or below the surface
        const au = up < 0 ? -up : up;
        if (au >= SHELL) continue;
        const k2 = mix(cx, cy, cz, k);
        const rad = 0.5 * (D_MIN + (D_MAX - D_MIN) * (k2 & 4095) / 4096); // rim radius, in cubes
        const hor2 = vx * vx + vy * vy + vz * vz - up * up; // distance along the ground, squared
        const lim = (rad * REACH) / (1 - WOBBLE);
        if (hor2 >= lim * lim) continue;
        // the rim is not a true circle: its radius wanders a little with direction
        const len = Math.sqrt(vx * vx + vy * vy + vz * vz) || 1, q = 1.1 / len, off = (k2 >>> 22) * 0.37;
        const x = (Math.sqrt(hor2 > 0 ? hor2 : 0) / rad) * (1 + WOBBLE * noise(vx * q + off, vy * q - off, vz * q + off * 0.5));
        if (x >= REACH) continue;
        // most craters are old and worn: depth from a 25th to a sixth of the width, weighted to shallow
        const age = ((k2 >>> 12) & 1023) / 1024, fresh = age * age * age;
        const depth = 2 * rad * w * (0.04 + 0.13 * fresh);
        // a fresh crater has a crisp raised rim; a worn one is a soft dish with none
        const crisp = fresh < 0.15 ? 0 : fresh > 0.55 ? 1 : (fresh - 0.15) / 0.4;
        const rim = depth * 0.18 * crisp;
        let s: number;
        if (x < 1) { const g = 1 - x * x; s = -depth * (crisp * g + (1 - crisp) * g * g) + rim * x * x; }
        else { const f = (REACH - x) / (REACH - 1); s = rim * f * f; }
        // craters near the top and bottom of the shell fade out, so none is ever cut off; and the
        // widest ones fade in as they drop below what the measurements can show
        const edge = (SHELL - au) / (SHELL * 0.3);
        const wide = (widest - 2 * rad * w) / (widest * 0.5);
        h += s * (edge < 1 ? edge * edge * (3 - 2 * edge) : 1) * (wide <= 0 ? 0 : wide < 1 ? wide * wide * (3 - 2 * wide) : 1);
      }
    }
    return h;
  };
  return Object.assign(fn, { largest });
}
