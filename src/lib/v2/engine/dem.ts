import type { HeightSource } from './heights';
import { createNoise3 } from './noise';
import { FACES, faceDir } from './cube';
import type { V3 } from './vec';

/**
 * Real ground: a height source backed by measured height tiles (LOLA for the Moon, MOLA for Mars),
 * cut by scripts/data/cut-height-tiles.py. The tiles use the same cube, faces and face/level/i/j
 * addresses as the terrain, so a terrain tile's vertices land exactly on the data's samples and
 * nothing is resampled in the browser.
 *
 * One data tile is 129 x 129 samples with a shared edge and a 2-sample border (133 x 133 signed
 * 16-bit values), and holds enough for terrain tiles two levels deeper than itself. Below the
 * finest data level the ground between samples is a smooth curve through the measurements, with
 * generated detail on top, scaled by how rough the measured ground is nearby. That generated part
 * is not real, and `resolution` says where it starts so the page can say so.
 *
 * Body frame: +y is the north pole, +x is latitude 0 longitude 0, east is positive.
 */

export interface DemSpec {
  kind: 'dem';
  body: string;
  /** reference radius the heights are measured from, metres */
  radius: number;
  /** tiles live at {baseUrl}/{body}/height/{face}/{level}/{i}/{j}.bin */
  baseUrl: string;
  maxLevel: number;
  /** height in metres = stored value * scale + offset */
  scale: number;
  offset: number;
  minHeight: number;
  maxHeight: number;
  /** seed for the generated detail below the data's resolution */
  seed?: number;
}

/** Read a body's meta.json and turn it into the spec the terrain needs. */
export async function loadDemSpec(baseUrl: string, body: string): Promise<DemSpec> {
  const base = baseUrl.replace(/\/$/, '');
  const res = await fetch(`${base}/${body}/height/meta.json`);
  if (!res.ok) throw new Error(`no height data for ${body} (${res.status})`);
  const m = await res.json();
  return { kind: 'dem', body, radius: m.radius, baseUrl: base, maxLevel: m.maxLevel, scale: m.scale, offset: m.offset, minHeight: m.minHeight, maxHeight: m.maxHeight };
}

const TILE = 128; // intervals per data tile side
const BORDER = 2;
const NS = TILE + 1 + 2 * BORDER; // 133
const KEEP = 160; // data tiles held per source (about 35 kB each), not counting level 0
const RETRY_MS = 20_000;

/** Which face a direction falls on, and its face coordinates: the inverse of faceDir(). */
export function dirToFace(d: ArrayLike<number>, out: number[] = [0, 0, 0]): number[] {
  const ax = Math.abs(d[0]), ay = Math.abs(d[1]), az = Math.abs(d[2]);
  // the cube point: its largest component is +-1, the other two come from undoing the even-area map
  let cx: number, cy: number, cz: number, face: number;
  const undo = (p: number, q: number): [number, number] => {
    // p, q: the two smaller components of the unit direction
    const a2 = p * p * 2, b2 = q * q * 2;
    const inner = -a2 + b2 - 3;
    const root = -Math.sqrt(Math.max(0, inner * inner - 12 * a2));
    const P = p === 0 ? 0 : Math.sqrt(Math.max(0, root + a2 - b2 + 3)) * Math.SQRT1_2;
    const Q = q === 0 ? 0 : Math.sqrt(Math.max(0, root - a2 + b2 + 3)) * Math.SQRT1_2;
    return [p < 0 ? -P : P, q < 0 ? -Q : Q];
  };
  if (ax >= ay && ax >= az) { const [p, q] = undo(d[1], d[2]); cx = d[0] < 0 ? -1 : 1; cy = p; cz = q; face = d[0] < 0 ? 1 : 0; }
  else if (ay >= az) { const [p, q] = undo(d[0], d[2]); cy = d[1] < 0 ? -1 : 1; cx = p; cz = q; face = d[1] < 0 ? 3 : 2; }
  else { const [p, q] = undo(d[0], d[1]); cz = d[2] < 0 ? -1 : 1; cx = p; cy = q; face = d[2] < 0 ? 5 : 4; }
  const F = FACES[face];
  out[0] = face;
  out[1] = cx * F.u[0] + cy * F.u[1] + cz * F.u[2];
  out[2] = cx * F.v[0] + cy * F.v[1] + cz * F.v[2];
  return out;
}

const littleEndian = new Uint8Array(new Uint16Array([1]).buffer)[0] === 1;

async function readTile(url: string): Promise<Int16Array | null> {
  const res = await fetch(url);
  if (!res.ok) return null;
  let buf = await res.arrayBuffer();
  if (buf.byteLength !== NS * NS * 2) {
    // stored gzipped and served without a Content-Encoding header: unpack it here
    const head = new Uint8Array(buf, 0, 2);
    if (head[0] !== 0x1f || head[1] !== 0x8b || typeof DecompressionStream === 'undefined') return null;
    buf = await new Response(new Blob([buf]).stream().pipeThrough(new DecompressionStream('gzip'))).arrayBuffer();
    if (buf.byteLength !== NS * NS * 2) return null;
  }
  if (littleEndian) return new Int16Array(buf);
  const view = new DataView(buf), out = new Int16Array(NS * NS);
  for (let k = 0; k < out.length; k++) out[k] = view.getInt16(k * 2, true);
  return out;
}

export function createDem(spec: DemSpec): HeightSource {
  const { radius, scale, offset, maxLevel } = spec;
  const quarter = (radius * Math.PI) / 2; // arc length across a cube face
  const spacing = quarter / (TILE * 2 ** maxLevel); // metres between real samples at the finest level
  const noise = createNoise3(spec.seed ?? 31);

  const tiles = new Map<number, Int16Array>();
  const loading = new Map<number, Promise<void>>();
  const failed = new Map<number, number>();
  const keyOf = (face: number, level: number, i: number, j: number) => ((face * 32 + level) * 65536 + i) * 65536 + j;
  const url = (face: number, level: number, i: number, j: number) => `${spec.baseUrl}/${spec.body}/height/${face}/${level}/${i}/${j}.bin`;

  /** Make sure one data tile is in memory (or has just been tried). Never rejects. */
  function ensure(face: number, level: number, i: number, j: number): Promise<void> | undefined {
    const key = keyOf(face, level, i, j);
    const have = tiles.get(key);
    if (have) {
      if (level > 0) { tiles.delete(key); tiles.set(key, have); } // most recently used last
      return;
    }
    const busy = loading.get(key);
    if (busy) return busy;
    const last = failed.get(key);
    if (last !== undefined && performance.now() - last < RETRY_MS) return;
    const p = readTile(url(face, level, i, j)).catch(() => null).then((t) => {
      loading.delete(key);
      if (!t) { failed.set(key, performance.now()); return; }
      failed.delete(key);
      tiles.set(key, t);
      if (tiles.size > KEEP + 6) {
        // drop the least recently used, never level 0 (the fallback for everything)
        for (const k of tiles.keys()) {
          if (tiles.size <= KEEP + 6) break;
          if (Math.floor(k / 4294967296) % 32 !== 0) tiles.delete(k);
        }
      }
    });
    loading.set(key, p);
    return p;
  }

  const ready = Promise.all([0, 1, 2, 3, 4, 5].map((f) => ensure(f, 0, 0, 0))).then(() => {
    for (let f = 0; f < 6; f++) if (!tiles.has(keyOf(f, 0, 0, 0))) throw new Error(`height data for ${spec.body} did not load`);
  });
  ready.catch(() => { /* reported to whoever awaits ready or prepare */ });

  /** the data level that matches a wanted detail (metres between terrain vertices) */
  const levelFor = (detail: number) => Math.max(0, Math.min(maxLevel, Math.round(Math.log2(quarter / (TILE * detail)))));

  // ---- reading one tile. u, v are in samples from the tile's own corner, -2 to 130.
  let T: Int16Array; // the tile being read
  const at = (a: number, b: number) => T[(b < -BORDER ? 0 : b > TILE + BORDER ? NS - 1 : b + BORDER) * NS + (a < -BORDER ? 0 : a > TILE + BORDER ? NS - 1 : a + BORDER)];
  const cr = (p0: number, p1: number, p2: number, p3: number, f: number) => p1 + 0.5 * f * (p2 - p0 + f * (2 * p0 - 5 * p1 + 4 * p2 - p3 + f * (3 * (p1 - p2) + p3 - p0)));
  /** stored value at (u, v): the sample itself where one sits there, a smooth curve through them elsewhere */
  function value(u: number, v: number): number {
    const iu = Math.round(u), iv = Math.round(v);
    if (Math.abs(u - iu) < 1e-6 && Math.abs(v - iv) < 1e-6) return at(iu, iv);
    const a = Math.floor(u), b = Math.floor(v), fu = u - a, fv = v - b;
    return cr(
      cr(at(a - 1, b - 1), at(a, b - 1), at(a + 1, b - 1), at(a + 2, b - 1), fu),
      cr(at(a - 1, b), at(a, b), at(a + 1, b), at(a + 2, b), fu),
      cr(at(a - 1, b + 1), at(a, b + 1), at(a + 1, b + 1), at(a + 2, b + 1), fu),
      cr(at(a - 1, b + 2), at(a, b + 2), at(a + 1, b + 2), at(a + 2, b + 2), fu),
      fv,
    );
  }
  /** how rough the measured ground is here: metres of height change per sample, varying smoothly */
  const slopeAt = (a: number, b: number) => Math.hypot(at(a + 1, b) - at(a - 1, b), at(a, b + 1) - at(a, b - 1)) * 0.5 * scale;
  function roughness(u: number, v: number): number {
    const a = Math.floor(u), b = Math.floor(v), fu = u - a, fv = v - b;
    return (slopeAt(a, b) * (1 - fu) + slopeAt(a + 1, b) * fu) * (1 - fv) + (slopeAt(a, b + 1) * (1 - fu) + slopeAt(a + 1, b + 1) * fu) * fv;
  }

  // ---- finding the tile that holds a point
  const hit = { u: 0, v: 0, level: 0 };
  /** Point `g` (global sample coordinate along one axis at a level with n tiles): candidate tile indices. */
  function find(face: number, level: number, gu: number, gv: number): boolean {
    const n = 2 ** level;
    const i0 = Math.max(0, Math.min(n - 1, Math.floor(gu / TILE)));
    const j0 = Math.max(0, Math.min(n - 1, Math.floor(gv / TILE)));
    const u0 = gu - i0 * TILE, v0 = gv - j0 * TILE;
    // the point may also sit in a neighbour's border, which matters when only that neighbour is loaded
    const iAlt = u0 <= BORDER && i0 > 0 ? i0 - 1 : u0 >= TILE - BORDER && i0 < n - 1 ? i0 + 1 : -1;
    const jAlt = v0 <= BORDER && j0 > 0 ? j0 - 1 : v0 >= TILE - BORDER && j0 < n - 1 ? j0 + 1 : -1;
    for (let c = 0; c < 4; c++) {
      const i = c & 1 ? iAlt : i0, j = c & 2 ? jAlt : j0;
      if (i < 0 || j < 0) continue;
      const t = tiles.get(keyOf(face, level, i, j));
      if (t) { T = t; hit.u = gu - i * TILE; hit.v = gv - j * TILE; hit.level = level; return true; }
    }
    return false;
  }

  const fst = [0, 0, 0];
  const d3 = [0, 0, 0];

  function heightAt(face: number, s: number, t: number, detail: number, dir?: ArrayLike<number>): number {
    const want = levelFor(detail);
    // past the face's edge and past the border too: ask the face it really falls on
    const reach = 1 + (2 * BORDER) / (TILE * 2 ** want) + 1e-9;
    if (Math.abs(s) > reach || Math.abs(t) > reach) {
      if (!dir) dir = faceDir(face, s, t, d3);
      dirToFace(dir, fst);
      face = fst[0]; s = fst[1]; t = fst[2];
    }
    let found = false;
    for (let level = want; level >= 0; level--) {
      const per = (TILE * 2 ** level) / 2;
      if (find(face, level, (s + 1) * per, (t + 1) * per)) { found = true; break; }
      // not here yet: fetch it for next time (in a worker this only happens after a failed download)
      if (level === want) ensure(face, level, Math.max(0, Math.min(2 ** level - 1, Math.floor(((s + 1) * per) / TILE))), Math.max(0, Math.min(2 ** level - 1, Math.floor(((t + 1) * per) / TILE))));
    }
    if (!found) return 0; // nothing has arrived yet
    let h = value(hit.u, hit.v) * scale + offset;

    // generated detail, only for wavelengths the data cannot hold. Each octave only adds to the
    // ones before it, so a tile that gains one keeps its shape.
    if (detail < spacing && hit.level === maxLevel) {
      if (!dir) dir = faceDir(face, s, t, d3);
      const x = dir[0] * radius, y = dir[1] * radius, z = dir[2] * radius;
      let amp = 0.1 * roughness(hit.u, hit.v) + 0.002 * spacing;
      for (let w = spacing * 2; w > detail * 2 && w > 1.5; w *= 0.5) {
        const f = 1 / w;
        h += noise(x * f, y * f, z * f) * amp;
        amp *= 0.57;
      }
    }
    return h;
  }

  return {
    radius,
    minHeight: spec.minHeight,
    maxHeight: spec.maxHeight,
    resolution: spacing,
    ready,
    height(dir: V3, detail: number) {
      dirToFace(dir, fst);
      return heightAt(fst[0], fst[1], fst[2], detail, dir);
    },
    heightAt: (face, s, t, detail) => heightAt(face, s, t, detail),
    async prepare(face, level, i, j) {
      await ready;
      // a terrain tile needs the data level two above it for its own shape, and three above for
      // the parent's shape it morphs from
      const waits: Promise<void>[] = [];
      for (const up of [2, 3]) {
        const L = Math.max(0, Math.min(maxLevel, level - up));
        const shift = Math.max(0, level - L);
        const w = ensure(face, L, i >> shift, j >> shift);
        if (w) waits.push(w);
      }
      if (waits.length) await Promise.all(waits);
    },
  };
}
