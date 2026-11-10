/**
 * The cube that wraps every body: six faces, and the even-area map from a face to the sphere.
 * Terrain tiles and height-data tiles are both addressed as face / level / i / j on this cube.
 */

/** cube faces: outward normal n, and in-face axes u, v with u x v = n */
export const FACES: { n: number[]; u: number[]; v: number[] }[] = [
  { n: [1, 0, 0], u: [0, 0, -1], v: [0, 1, 0] },
  { n: [-1, 0, 0], u: [0, 0, 1], v: [0, 1, 0] },
  { n: [0, 1, 0], u: [1, 0, 0], v: [0, 0, -1] },
  { n: [0, -1, 0], u: [1, 0, 0], v: [0, 0, 1] },
  { n: [0, 0, 1], u: [1, 0, 0], v: [0, 1, 0] },
  { n: [0, 0, -1], u: [-1, 0, 0], v: [0, 1, 0] },
];

/** unit direction for face coordinates s, t in [-1, 1], with the even-area cube-to-sphere map */
export function faceDir(face: number, s: number, t: number, out: number[] = [0, 0, 0]) {
  const F = FACES[face];
  const x = F.n[0] + F.u[0] * s + F.v[0] * t;
  const y = F.n[1] + F.u[1] * s + F.v[1] * t;
  const z = F.n[2] + F.u[2] * s + F.v[2] * t;
  const x2 = x * x, y2 = y * y, z2 = z * z;
  const sx = x * Math.sqrt(1 - y2 / 2 - z2 / 2 + (y2 * z2) / 3);
  const sy = y * Math.sqrt(1 - z2 / 2 - x2 / 2 + (z2 * x2) / 3);
  const sz = z * Math.sqrt(1 - x2 / 2 - y2 / 2 + (x2 * y2) / 3);
  const l = Math.hypot(sx, sy, sz);
  out[0] = sx / l; out[1] = sy / l; out[2] = sz / l;
  return out;
}
