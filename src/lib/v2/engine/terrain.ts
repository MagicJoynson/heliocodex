import * as THREE from 'three/webgpu';
import { attribute, mix, positionGeometry, uniform, vec3, float, smoothstep } from 'three/tsl';
import { buildTile, makeSource, tileIndex, tileSize, type SourceSpec, type TileData, type TileRequest } from './tilebuild';
import { dot, len, norm, sub, type V3 } from './vec';

/**
 * A whole planet's ground as a cube-sphere quadtree (CDLOD). Each frame it picks the tiles worth
 * drawing from where the camera is: close tiles split into four finer ones, far ones stay coarse,
 * and anything behind the horizon or off screen is skipped. Each tile blends ("morphs") from its
 * parent's coarser shape into its own as you approach, so detail grows in without popping.
 */

export interface TerrainOptions {
  spec: SourceSpec;
  /** how eagerly tiles split: higher is sharper and heavier */
  split?: number;
  maxLevel?: number;
  maxTiles?: number;
  material?: THREE.Material;
}

interface Node extends TileRequest {
  key: string;
  data?: TileData;
  mesh?: THREE.Mesh;
  pending?: boolean;
  kids?: Node[];
  used: number;
  prio?: number;
}

const INDEX = new THREE.BufferAttribute(tileIndex(), 1);

export function createTerrain(o: TerrainOptions) {
  const radius = o.spec.radius;
  const src = makeSource(o.spec);
  const SPLIT = o.split ?? 2.4;
  const MAX_LEVEL = o.maxLevel ?? 18;
  const MAX_TILES = o.maxTiles ?? 420;
  const group = new THREE.Group();
  group.name = 'terrain';

  // ---- material: grey ground, a little darker and smoother where the ground is steep
  const morph = uniform(0).onObjectUpdate(({ object }) => (object?.userData.morph as number) ?? 0);
  const mat = (o.material as THREE.MeshStandardNodeMaterial) ?? new THREE.MeshStandardNodeMaterial({ roughness: 0.96, metalness: 0 });
  mat.positionNode = mix(positionGeometry, attribute('morph', 'vec3'), morph);
  mat.normalNode = null;
  const flat = smoothstep(float(0.72), float(0.97), attribute('shade', 'float'));
  mat.colorNode = mix(vec3(0.23, 0.225, 0.215), vec3(0.47, 0.455, 0.43), flat);

  // ---- workers build the tiles off the main thread
  const workers: Worker[] = [];
  const waiting = new Map<number, Node>();
  let nextId = 1;
  try {
    const n = Math.max(1, Math.min(4, (navigator.hardwareConcurrency || 2) - 1));
    for (let k = 0; k < n; k++) {
      const w = new Worker(new URL('./tile.worker.ts', import.meta.url), { type: 'module' });
      w.onmessage = (e: MessageEvent<{ id: number; t: TileData }>) => {
        const node = waiting.get(e.data.id);
        waiting.delete(e.data.id);
        built++;
        if (node && !node.mesh) finish(node, e.data.t);
      };
      w.onerror = (e) => console.error('tile worker', e.message);
      workers.push(w);
    }
  } catch { /* no workers: tiles are built on the main thread below */ }
  let rr = 0;
  let built = 0;

  const queue: Node[] = [];
  const roots: Node[] = [0, 1, 2, 3, 4, 5].map((face) => node(face, 0, 0, 0));
  let frame = 0;
  let live = 0;

  function node(face: number, level: number, i: number, j: number): Node {
    return { face, level, i, j, key: `${face}/${level}/${i}/${j}`, used: 0 };
  }
  function kids(n: Node) {
    if (!n.kids) {
      const L = n.level + 1, i = n.i * 2, j = n.j * 2;
      n.kids = [node(n.face, L, i, j), node(n.face, L, i + 1, j), node(n.face, L, i, j + 1), node(n.face, L, i + 1, j + 1)];
    }
    return n.kids;
  }
  function request(n: Node, prio = 0) {
    n.prio = prio;
    if (n.mesh || n.pending) return;
    n.pending = true;
    queue.push(n);
  }
  function finish(n: Node, t: TileData) {
    n.pending = false;
    n.data = t;
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(t.position, 3));
    g.setAttribute('normal', new THREE.BufferAttribute(t.normal, 3));
    g.setAttribute('morph', new THREE.BufferAttribute(t.morph, 3));
    g.setAttribute('shade', new THREE.BufferAttribute(t.shade, 1));
    g.setIndex(INDEX);
    g.boundingSphere = new THREE.Sphere(new THREE.Vector3(), t.radius);
    const m = new THREE.Mesh(g, mat);
    m.matrixAutoUpdate = true;
    m.visible = false;
    m.userData.morph = 0;
    n.mesh = m;
    group.add(m);
    live++;
  }
  function dispatch(budgetMs: number) {
    // forget tiles nobody has asked for in the last few frames
    for (let k = queue.length - 1; k >= 0; k--) if (queue[k].used < frame - 3) { queue[k].pending = false; queue.splice(k, 1); }
    if (!queue.length) return;
    // coarse tiles first, then the nearest
    queue.sort((a, b) => a.level - b.level || (a.prio ?? 0) - (b.prio ?? 0));
    if (workers.length) {
      const cap = workers.length * 3;
      while (queue.length && waiting.size < cap) {
        const n = queue.shift()!;
        const id = nextId++;
        waiting.set(id, n);
        workers[rr++ % workers.length].postMessage({ id, spec: o.spec, tile: { face: n.face, level: n.level, i: n.i, j: n.j } });
      }
    } else {
      const t0 = performance.now();
      while (queue.length && performance.now() - t0 < budgetMs) {
        const n = queue.shift()!;
        finish(n, buildTile(src, n));
      }
    }
  }

  const frustum = new THREE.Frustum();
  const pv = new THREE.Matrix4();
  const sphere = new THREE.Sphere();

  /**
   * Choose and place tiles. `bodyRel` is the body's centre minus the camera position (metres,
   * doubles); the camera itself sits at the origin.
   */
  function update(bodyRel: V3, camera: THREE.PerspectiveCamera) {
    frame++;
    camera.updateMatrixWorld();
    pv.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
    frustum.setFromProjectionMatrix(pv, camera.coordinateSystem, camera.reversedDepth);

    const cam: V3 = [-bodyRel[0], -bodyRel[1], -bodyRel[2]]; // camera relative to the body's centre
    const D = len(cam);
    const camDir = norm(cam);
    const low = radius + src.minHeight, high = radius + src.maxHeight;
    // the horizon, plus how far past it a mountain could still poke up
    const horizon = D > low ? Math.acos(Math.min(1, low / D)) + Math.acos(Math.min(1, low / high)) : Math.PI;

    const draw: Node[] = [];
    const visit = (n: Node, pd: number) => {
      n.used = frame;
      if (!n.mesh) { request(n, 0); return; }
      const t = n.data!;
      const c: V3 = t.centre;
      // behind the horizon?
      const ang = Math.acos(Math.max(-1, Math.min(1, dot(norm(c), camDir))));
      if (ang - t.radius / radius > horizon) return;
      // off screen?
      sphere.center.set(c[0] + bodyRel[0], c[1] + bodyRel[1], c[2] + bodyRel[2]);
      sphere.radius = t.radius;
      if (!frustum.intersectsSphere(sphere)) return;
      const d = Math.max(0, len(sub(cam, c)) - t.radius * 0.25);
      const size = tileSize(radius, n.level);
      if (n.level < MAX_LEVEL && d < SPLIT * size) {
        const k = kids(n);
        let ready = true;
        for (const q of k) { q.used = frame; if (!q.mesh) { request(q, d); ready = false; } }
        if (ready) { for (const q of k) visit(q, SPLIT * size); return; }
      }
      // fully its own shape when close, the parent's shape when it has only just appeared
      n.mesh.userData.morph = n.level === 0 ? 0 : THREE.MathUtils.smoothstep(d, pd * 0.6, pd * 0.95);
      draw.push(n);
    };
    for (const n of roots) visit(n, Infinity);

    for (const ch of group.children) ch.visible = false;
    for (const n of draw) {
      const m = n.mesh!, c = n.data!.centre;
      m.visible = true;
      m.position.set(c[0] + bodyRel[0], c[1] + bodyRel[1], c[2] + bodyRel[2]);
    }
    dispatch(4);
    if (live > MAX_TILES) evict();
    return { tiles: draw.length, live, built, inflight: waiting.size, queued: queue.length + waiting.size, deepest: draw.reduce((a, n) => Math.max(a, n.level), 0) };
  }

  function evict() {
    const all: Node[] = [];
    const walk = (n: Node) => { if (n.mesh && n.level > 0 && n.used < frame - 30) all.push(n); n.kids?.forEach(walk); };
    roots.forEach(walk);
    all.sort((a, b) => a.used - b.used);
    for (const n of all) {
      if (live <= MAX_TILES * 0.85) break;
      group.remove(n.mesh!);
      n.mesh!.geometry.dispose();
      n.mesh = undefined; n.data = undefined;
      live--;
      // the subtree below can go too; it will be rebuilt if needed
      const drop = (q: Node) => { q.kids?.forEach((k) => { if (k.mesh) { group.remove(k.mesh); k.mesh.geometry.dispose(); k.mesh = undefined; k.data = undefined; live--; } drop(k); }); q.kids = undefined; };
      drop(n);
    }
  }

  /** ground height under a direction from the centre, at full detail, for keeping the camera above it */
  function groundAt(dirFromCentre: V3) {
    return src.height(norm(dirFromCentre), 1);
  }

  function dispose() {
    workers.forEach((w) => w.terminate());
    group.traverse((m) => { if ((m as THREE.Mesh).isMesh) (m as THREE.Mesh).geometry.dispose(); });
  }

  return { group, update, groundAt, radius, source: src, dispose, material: mat };
}

export type Terrain = ReturnType<typeof createTerrain>;
