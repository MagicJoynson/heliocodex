import type { HeightSource } from './heights';
import { testWorld } from './heights';
import { faceDir } from './cube';
import { createDem, type DemSpec } from './dem';

/**
 * Builds one terrain tile of a cube-sphere quadtree. Runs in a worker (or on the main thread if
 * workers are unavailable). Everything is computed in doubles; the GPU gets positions relative
 * to the tile's own centre, which stay small and precise however deep the tile is.
 */

export const GRID = 32; // quads per tile side
export const V = GRID + 1; // vertices per side

export { FACES, faceDir } from './cube';

export interface TestSpec { kind: 'test'; radius: number; seed: number }
export type SourceSpec = TestSpec | DemSpec;
export function makeSource(spec: SourceSpec): HeightSource {
  return spec.kind === 'dem' ? createDem(spec) : testWorld(spec.radius, spec.seed);
}

export interface TileRequest { face: number; level: number; i: number; j: number }
export interface TileData {
  centre: [number, number, number]; // metres from the body's centre, double precision
  radius: number; // bounding sphere radius, metres
  position: Float32Array; // relative to centre, grid then skirt
  morph: Float32Array; // where each vertex sits on the parent's coarser grid
  normal: Float32Array;
  mnormal: Float32Array; // the parent's normal, for the morph
  shade: Float32Array; // 1 on flat ground, 0 on cliffs
  minH: number; maxH: number;
}

/** arc length across a tile at this level, metres */
export const tileSize = (radius: number, level: number) => (radius * Math.PI * 0.5) / 2 ** level;

/** Build a tile, first letting the source fetch whatever data the tile needs. */
export async function buildTileWhenReady(src: HeightSource, r: TileRequest): Promise<TileData> {
  if (src.prepare) await src.prepare(r.face, r.level, r.i, r.j);
  return buildTile(src, r);
}

/** Build a tile now. A source with `prepare` must have been prepared for this tile first. */
export function buildTile(src: HeightSource, r: TileRequest): TileData {
  const R = src.radius;
  const n = 2 ** r.level;
  const ds = 2 / n;
  const s0 = -1 + r.i * ds, t0 = -1 + r.j * ds;
  const size = tileSize(R, r.level);
  // smallest wavelength worth adding: about two vertex spacings at this level
  const detail = size / GRID;

  // heights on a grid with a two-vertex border, so normals match across tile edges.
  // P: this tile's own detail. Q: the parent's detail, only at even vertices, for the morph target.
  const BR = 2, B = V + 2 * BR;
  const P = new Float64Array(B * B * 3);
  const Q = new Float64Array(B * B * 3);
  const D = new Float64Array(B * B * 3);
  const dir = [0, 0, 0];
  // a source backed by real data answers by face coordinates, so tile vertices land exactly on its samples
  const exact = !!src.heightAt;
  let minH = Infinity, maxH = -Infinity;
  for (let b = 0; b < B; b++) {
    for (let a = 0; a < B; a++) {
      const ga = a - BR, gb = b - BR;
      const s = s0 + (ga / GRID) * ds, t = t0 + (gb / GRID) * ds;
      faceDir(r.face, s, t, dir);
      const k = (b * B + a) * 3;
      D[k] = dir[0]; D[k + 1] = dir[1]; D[k + 2] = dir[2];
      const h = exact ? src.heightAt!(r.face, s, t, detail) : src.height(dir as [number, number, number], detail);
      if (ga >= 0 && gb >= 0 && ga <= GRID && gb <= GRID) { if (h < minH) minH = h; if (h > maxH) maxH = h; }
      P[k] = dir[0] * (R + h); P[k + 1] = dir[1] * (R + h); P[k + 2] = dir[2] * (R + h);
      if (!(ga & 1) && !(gb & 1)) {
        const hp = exact ? src.heightAt!(r.face, s, t, detail * 2) : src.height(dir as [number, number, number], detail * 2);
        Q[k] = dir[0] * (R + hp); Q[k + 1] = dir[1] * (R + hp); Q[k + 2] = dir[2] * (R + hp);
      }
    }
  }
  const at = (a: number, b: number) => ((b + BR) * B + (a + BR)) * 3; // grid coords 0..GRID
  const c = at(GRID / 2, GRID / 2);
  const centre: [number, number, number] = [P[c], P[c + 1], P[c + 2]];

  const SK = 4 * GRID; // skirt vertices, one ring round the edge
  const count = V * V + SK;
  const position = new Float32Array(count * 3);
  const morph = new Float32Array(count * 3);
  const normal = new Float32Array(count * 3);
  const mnormal = new Float32Array(count * 3);
  const shade = new Float32Array(count);
  let rad = 0;

  const nrm = (G: Float64Array, l: number, r2: number, d: number, u: number, out: number[]) => {
    const ex = G[r2] - G[l], ey = G[r2 + 1] - G[l + 1], ez = G[r2 + 2] - G[l + 2];
    const fx = G[u] - G[d], fy = G[u + 1] - G[d + 1], fz = G[u + 2] - G[d + 2];
    const nx = ey * fz - ez * fy, ny = ez * fx - ex * fz, nz = ex * fy - ey * fx;
    const nl = Math.hypot(nx, ny, nz) || 1;
    out[0] = nx / nl; out[1] = ny / nl; out[2] = nz / nl;
    return out;
  };
  // the parent's normal at an even vertex, from its coarse neighbours two vertices away
  const pn = (a: number, b: number, out: number[]) => nrm(Q, at(a - 2, b), at(a + 2, b), at(a, b - 2), at(a, b + 2), out);
  const n0 = [0, 0, 0], n1 = [0, 0, 0], n2 = [0, 0, 0];

  for (let b = 0; b <= GRID; b++) {
    for (let a = 0; a <= GRID; a++) {
      const k = at(a, b), o = (b * V + a) * 3;
      const px = P[k] - centre[0], py = P[k + 1] - centre[1], pz = P[k + 2] - centre[2];
      position[o] = px; position[o + 1] = py; position[o + 2] = pz;
      rad = Math.max(rad, Math.hypot(px, py, pz));
      // morph target: the parent's surface. Even vertices are the parent's own samples; odd ones
      // sit halfway along the coarse edge or diagonal, exactly where the parent's triangles are.
      const oa = a & 1, ob = b & 1;
      let mx: number, my: number, mz: number;
      if (oa || ob) {
        const k1 = at(a - oa, b - ob), k2 = at(a + oa, b + ob);
        mx = (Q[k1] + Q[k2]) / 2; my = (Q[k1 + 1] + Q[k2 + 1]) / 2; mz = (Q[k1 + 2] + Q[k2 + 2]) / 2;
        pn(a - oa, b - ob, n1); pn(a + oa, b + ob, n2);
        const x = n1[0] + n2[0], y = n1[1] + n2[1], z = n1[2] + n2[2], l = Math.hypot(x, y, z) || 1;
        mnormal[o] = x / l; mnormal[o + 1] = y / l; mnormal[o + 2] = z / l;
      } else {
        mx = Q[k]; my = Q[k + 1]; mz = Q[k + 2];
        pn(a, b, n1);
        mnormal[o] = n1[0]; mnormal[o + 1] = n1[1]; mnormal[o + 2] = n1[2];
      }
      morph[o] = mx - centre[0]; morph[o + 1] = my - centre[1]; morph[o + 2] = mz - centre[2];
      nrm(P, at(a - 1, b), at(a + 1, b), at(a, b - 1), at(a, b + 1), n0);
      normal[o] = n0[0]; normal[o + 1] = n0[1]; normal[o + 2] = n0[2];
      shade[b * V + a] = n0[0] * D[k] + n0[1] * D[k + 1] + n0[2] * D[k + 2];
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
      mnormal[dst + q] = mnormal[src + q];
    }
    shade[V * V + e] = shade[b * V + a];
  });

  return { centre, radius: rad + drop, position, morph, normal, mnormal, shade, minH, maxH };
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
