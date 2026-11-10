import type { HeightSource } from './heights';
import { testWorld } from './heights';

/**
 * Builds one terrain tile of a cube-sphere quadtree. Runs in a worker (or on the main thread if
 * workers are unavailable). Everything is computed in doubles; the GPU gets positions relative
 * to the tile's own centre, which stay small and precise however deep the tile is.
 */

export const GRID = 32; // quads per tile side
export const V = GRID + 1; // vertices per side

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

export interface SourceSpec { kind: 'test'; radius: number; seed: number }
export function makeSource(spec: SourceSpec): HeightSource {
  return testWorld(spec.radius, spec.seed);
}

export interface TileRequest { face: number; level: number; i: number; j: number }
export interface TileData {
  centre: [number, number, number]; // metres from the body's centre, double precision
  radius: number; // bounding sphere radius, metres
  position: Float32Array; // relative to centre, grid then skirt
  morph: Float32Array; // where each vertex sits on the parent's coarser grid
  normal: Float32Array;
  shade: Float32Array; // 1 on flat ground, 0 on cliffs
  minH: number; maxH: number;
}

/** arc length across a tile at this level, metres */
export const tileSize = (radius: number, level: number) => (radius * Math.PI * 0.5) / 2 ** level;

export function buildTile(src: HeightSource, r: TileRequest): TileData {
  const R = src.radius;
  const n = 2 ** r.level;
  const ds = 2 / n;
  const s0 = -1 + r.i * ds, t0 = -1 + r.j * ds;
  const size = tileSize(R, r.level);
  // smallest wavelength worth adding: about two vertex spacings at this level
  const detail = size / GRID;

  // heights on a grid with a one-vertex border, for normals that match across tile edges
  const B = V + 2;
  const P = new Float64Array(B * B * 3);
  const D = new Float64Array(B * B * 3);
  const dir = [0, 0, 0];
  let minH = Infinity, maxH = -Infinity;
  for (let b = 0; b < B; b++) {
    for (let a = 0; a < B; a++) {
      const s = s0 + ((a - 1) / GRID) * ds, t = t0 + ((b - 1) / GRID) * ds;
      faceDir(r.face, s, t, dir);
      const h = src.height(dir as [number, number, number], detail);
      if (a > 0 && b > 0 && a <= V && b <= V) { if (h < minH) minH = h; if (h > maxH) maxH = h; }
      const k = (b * B + a) * 3;
      D[k] = dir[0]; D[k + 1] = dir[1]; D[k + 2] = dir[2];
      P[k] = dir[0] * (R + h); P[k + 1] = dir[1] * (R + h); P[k + 2] = dir[2] * (R + h);
    }
  }
  const at = (a: number, b: number) => ((b + 1) * B + (a + 1)) * 3; // grid coords 0..GRID
  const c = at(GRID / 2, GRID / 2);
  const centre: [number, number, number] = [P[c], P[c + 1], P[c + 2]];

  const SK = 4 * GRID; // skirt vertices, one ring round the edge
  const count = V * V + SK;
  const position = new Float32Array(count * 3);
  const morph = new Float32Array(count * 3);
  const normal = new Float32Array(count * 3);
  const shade = new Float32Array(count);
  let rad = 0;

  for (let b = 0; b <= GRID; b++) {
    for (let a = 0; a <= GRID; a++) {
      const k = at(a, b), o = (b * V + a) * 3;
      const px = P[k] - centre[0], py = P[k + 1] - centre[1], pz = P[k + 2] - centre[2];
      position[o] = px; position[o + 1] = py; position[o + 2] = pz;
      rad = Math.max(rad, Math.hypot(px, py, pz));
      // morph target: on the parent's grid, odd vertices sit halfway along the coarse edge or diagonal
      let mx = P[k], my = P[k + 1], mz = P[k + 2];
      const oa = a & 1, ob = b & 1;
      if (oa || ob) {
        const k1 = at(a - oa, b - ob), k2 = at(a + oa, b + ob);
        mx = (P[k1] + P[k2]) / 2; my = (P[k1 + 1] + P[k2 + 1]) / 2; mz = (P[k1 + 2] + P[k2 + 2]) / 2;
      }
      morph[o] = mx - centre[0]; morph[o + 1] = my - centre[1]; morph[o + 2] = mz - centre[2];
      // normal from the neighbours (border included, so edges match the next tile)
      const l = at(a - 1, b), rr = at(a + 1, b), d = at(a, b - 1), u = at(a, b + 1);
      const ex = P[rr] - P[l], ey = P[rr + 1] - P[l + 1], ez = P[rr + 2] - P[l + 2];
      const fx = P[u] - P[d], fy = P[u + 1] - P[d + 1], fz = P[u + 2] - P[d + 2];
      let nx = ey * fz - ez * fy, ny = ez * fx - ex * fz, nz = ex * fy - ey * fx;
      const nl = Math.hypot(nx, ny, nz) || 1;
      nx /= nl; ny /= nl; nz /= nl;
      normal[o] = nx; normal[o + 1] = ny; normal[o + 2] = nz;
      shade[b * V + a] = nx * D[k] + ny * D[k + 1] + nz * D[k + 2];
    }
  }

  // skirt: a short wall hanging below each edge, to hide gaps while neighbours differ in detail
  const drop = size * 0.015 + 2;
  const edge: [number, number][] = [];
  for (let a = 0; a < GRID; a++) edge.push([a, 0]);
  for (let b = 0; b < GRID; b++) edge.push([GRID, b]);
  for (let a = GRID; a > 0; a--) edge.push([a, GRID]);
  for (let b = GRID; b > 0; b--) edge.push([0, b]);
  edge.forEach(([a, b], e) => {
    const src = (b * V + a) * 3, dst = (V * V + e) * 3, k = at(a, b);
    for (let q = 0; q < 3; q++) {
      position[dst + q] = position[src + q] - D[k + q] * drop;
      morph[dst + q] = morph[src + q] - D[k + q] * drop;
      normal[dst + q] = normal[src + q];
    }
    shade[V * V + e] = shade[b * V + a];
  });

  return { centre, radius: rad + drop, position, morph, normal, shade, minH, maxH };
}

/** the index buffer is the same for every tile */
export function tileIndex(): Uint32Array {
  const idx: number[] = [];
  for (let b = 0; b < GRID; b++) {
    for (let a = 0; a < GRID; a++) {
      const p = b * V + a;
      idx.push(p, p + 1, p + V + 1, p, p + V + 1, p + V);
    }
  }
  // skirt ring: both windings, so it is never culled whichever way it faces
  const ring: number[] = [];
  for (let a = 0; a < GRID; a++) ring.push(a);
  for (let b = 0; b < GRID; b++) ring.push(b * V + GRID);
  for (let a = GRID; a > 0; a--) ring.push(GRID * V + a);
  for (let b = GRID; b > 0; b--) ring.push(b * V);
  const S = 4 * GRID;
  for (let e = 0; e < S; e++) {
    const t0 = ring[e], t1 = ring[(e + 1) % S];
    const k0 = V * V + e, k1 = V * V + ((e + 1) % S);
    idx.push(t0, k0, t1, t1, k0, k1, t0, t1, k0, t1, k1, k0);
  }
  return new Uint32Array(idx);
}
