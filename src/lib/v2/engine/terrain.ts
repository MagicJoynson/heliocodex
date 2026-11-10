import * as THREE from 'three/webgpu';
import { attribute, mix, positionGeometry, normalGeometry, uniform, vec3, float, smoothstep, transformNormalToView, length } from 'three/tsl';
import { buildTile, makeSource, tileIndex, tileSize, type SourceSpec, type TileData, type TileRequest } from './tilebuild';
import { dot, len, norm, sub, type V3 } from './vec';

/**
 * A whole planet's ground as a cube-sphere quadtree (CDLOD). Each frame it picks the tiles worth
 * drawing from where the camera is: close tiles split into four finer ones, far ones stay coarse,
 * and anything behind the horizon or off screen is skipped.
 *
 * No popping: every vertex blends ("morphs") between its parent's surface and its own, by its own
 * distance from the camera. A tile appears exactly where its parent's shape was, and grows into its
 * own detail as you approach. Because the blend depends only on a vertex's position, neighbouring
 * tiles agree along their shared edges.
 */

export interface TerrainOptions {
  spec: SourceSpec;
  /** how eagerly tiles split: higher is sharper and heavier */
  split?: number;
  maxLevel?: number;
  maxTiles?: number;
}

interface Node extends TileRequest {
  key: string;
  data?: TileData;
  mesh?: THREE.Mesh;
  pending?: boolean;
  dead?: boolean;
  kids?: Node[];
  used: number; // frame last wanted
  usedAt: number; // time last wanted, ms
  prio?: number;
}

const INDEX = new THREE.BufferAttribute(tileIndex(), 1);

export function createTerrain(o: TerrainOptions) {
  const radius = o.spec.radius;
  const src = makeSource(o.spec);
  const SPLIT = Math.max(2, o.split ?? 2.5);
  const MAX_LEVEL = o.maxLevel ?? 18;
  const MAX_TILES = o.maxTiles ?? 420;
  const group = new THREE.Group();
  group.name = 'terrain';

  // ---- material
  // per tile: the camera relative to the tile's centre, and the distances over which it morphs
  const camRel = uniform(new THREE.Vector3()).onObjectUpdate(({ object }) => object?.userData.camRel as THREE.Vector3);
  const near = uniform(0).onObjectUpdate(({ object }) => object?.userData.mLo as number);
  const far = uniform(1).onObjectUpdate(({ object }) => object?.userData.mHi as number);
  const m = smoothstep(near, far, length(positionGeometry.sub(camRel)));
  const mat = new THREE.MeshStandardNodeMaterial({ roughness: 0.96, metalness: 0 });
  mat.positionNode = mix(positionGeometry, attribute('morph', 'vec3'), m);
  mat.normalNode = transformNormalToView(mix(normalGeometry, attribute('mnormal', 'vec3'), m).normalize()).normalize();
  // grey ground, darker where it is steep
  const flat = smoothstep(float(0.72), float(0.97), attribute('shade', 'float'));
  mat.colorNode = mix(vec3(0.23, 0.225, 0.215), vec3(0.47, 0.455, 0.43), flat);

  // ---- workers build the tiles off the main thread; if they fail, the main thread takes over
  const workers: Worker[] = [];
  const waiting = new Map<number, { node: Node; worker: Worker }>();
  let nextId = 1;
  let built = 0;
  function dropWorker(w: Worker) {
    w.terminate();
    const i = workers.indexOf(w);
    if (i >= 0) workers.splice(i, 1);
    for (const [id, job] of waiting) if (job.worker === w) { waiting.delete(id); job.node.pending = false; }
  }
  try {
    const n = Math.max(1, Math.min(4, (navigator.hardwareConcurrency || 2) - 1));
    for (let k = 0; k < n; k++) {
      const w = new Worker(new URL('./tile.worker.ts', import.meta.url), { type: 'module' });
      w.onmessage = (e: MessageEvent<{ id: number; t: TileData }>) => {
        const job = waiting.get(e.data.id);
        waiting.delete(e.data.id);
        built++;
        // a tile nobody has wanted for a few frames is not worth uploading
        if (job && !job.node.dead && !job.node.mesh && job.node.used >= frame - 3) finish(job.node, e.data.t);
        else if (job) job.node.pending = false;
      };
      w.onerror = (e) => { console.error('tile worker failed', e.message); dropWorker(w); };
      workers.push(w);
    }
  } catch { /* no workers: tiles are built on the main thread */ }
  let rr = 0;

  const queue: Node[] = [];
  const roots: Node[] = [0, 1, 2, 3, 4, 5].map((face) => node(face, 0, 0, 0));
  let frame = 0;
  let live = 0;

  function node(face: number, level: number, i: number, j: number): Node {
    return { face, level, i, j, key: `${face}/${level}/${i}/${j}`, used: 0, usedAt: 0 };
  }
  function kids(n: Node) {
    if (!n.kids) {
      const L = n.level + 1, i = n.i * 2, j = n.j * 2;
      n.kids = [node(n.face, L, i, j), node(n.face, L, i + 1, j), node(n.face, L, i, j + 1), node(n.face, L, i + 1, j + 1)];
    }
    return n.kids;
  }
  function request(n: Node, prio: number) {
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
    g.setAttribute('mnormal', new THREE.BufferAttribute(t.mnormal, 3));
    g.setAttribute('shade', new THREE.BufferAttribute(t.shade, 1));
    g.setIndex(INDEX);
    g.boundingSphere = new THREE.Sphere(new THREE.Vector3(), t.radius);
    const mesh = new THREE.Mesh(g, mat);
    mesh.visible = false;
    mesh.frustumCulled = false; // we cull ourselves, with double-precision spheres
    mesh.userData = { camRel: new THREE.Vector3(), mLo: 0, mHi: 1 };
    n.mesh = mesh;
    group.add(mesh);
    live++;
  }
  function release(n: Node) {
    if (!n.mesh) return;
    group.remove(n.mesh);
    // the index buffer is shared by every tile: detach it so disposing one tile leaves it alone
    n.mesh.geometry.setIndex(null);
    n.mesh.geometry.dispose();
    n.mesh = undefined; n.data = undefined;
    live--;
  }
  function dispatch(budgetMs: number) {
    // forget tiles nobody has asked for in the last few frames
    for (let k = queue.length - 1; k >= 0; k--) if (queue[k].used < frame - 3 || queue[k].dead) { queue[k].pending = false; queue.splice(k, 1); }
    if (!queue.length) return;
    // most urgent first: close relative to its size
    queue.sort((a, b) => (a.prio ?? 0) - (b.prio ?? 0));
    if (workers.length) {
      const cap = workers.length * 3;
      while (queue.length && waiting.size < cap) {
        const n = queue.shift()!;
        const id = nextId++;
        const w = workers[rr++ % workers.length];
        waiting.set(id, { node: n, worker: w });
        w.postMessage({ id, spec: o.spec, tile: { face: n.face, level: n.level, i: n.i, j: n.j } });
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
  // true angular radius of a tile seen from the planet's centre (chord to angle)
  const angOf = (r: number) => 2 * Math.asin(Math.min(1, r / (2 * radius)));

  /**
   * Choose and place tiles. `bodyRel` is the body's centre minus the camera position (metres,
   * doubles); the camera itself sits at the origin.
   */
  function update(bodyRel: V3, camera: THREE.PerspectiveCamera) {
    frame++;
    const now = performance.now();
    camera.updateMatrixWorld();
    pv.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
    frustum.setFromProjectionMatrix(pv, camera.coordinateSystem, camera.reversedDepth);

    const cam: V3 = [-bodyRel[0], -bodyRel[1], -bodyRel[2]]; // camera relative to the body's centre
    const D = len(cam);
    const camDir = norm(cam);
    const low = radius + src.minHeight;
    const horizon = D > low ? Math.acos(Math.min(1, low / D)) : Math.PI;

    const draw: Node[] = [];
    const visit = (n: Node) => {
      n.used = frame; n.usedAt = now;
      if (!n.mesh) { request(n, 0); return; }
      const t = n.data!;
      const c: V3 = t.centre;
      // behind the horizon? (allowing for this tile's own highest ground poking up past it)
      const ang = Math.acos(Math.max(-1, Math.min(1, dot(norm(c), camDir))));
      const lift = Math.acos(Math.min(1, low / (radius + Math.max(0, t.maxH))));
      if (ang - angOf(t.radius) > horizon + lift) return;
      // off screen?
      sphere.center.set(c[0] + bodyRel[0], c[1] + bodyRel[1], c[2] + bodyRel[2]);
      sphere.radius = t.radius;
      if (!frustum.intersectsSphere(sphere)) return;
      // nearest point of the tile's bounding sphere: every vertex is at least this far away
      const d = Math.max(0, len(sub(cam, c)) - t.radius);
      const size = tileSize(radius, n.level);
      const splitAt = SPLIT * size;
      // ask for the children a little early, so they arrive before they are needed and never
      // appear already part-way through their morph
      if (n.level < MAX_LEVEL && d < splitAt * 1.15 && d >= splitAt) {
        for (const q of kids(n)) { q.used = frame; q.usedAt = now; if (!q.mesh) request(q, d / size); }
      }
      if (n.level < MAX_LEVEL && d < splitAt) {
        const k = kids(n);
        let ready = true;
        for (const q of k) { q.used = frame; q.usedAt = now; if (!q.mesh) { request(q, d / size); ready = false; } }
        if (ready) { for (const q of k) visit(q); return; }
      }
      draw.push(n);
    };
    for (const n of roots) visit(n);

    for (const ch of group.children) ch.visible = false;
    for (const n of draw) {
      const mesh = n.mesh!, c = n.data!.centre;
      mesh.visible = true;
      mesh.position.set(c[0] + bodyRel[0], c[1] + bodyRel[1], c[2] + bodyRel[2]);
      // the camera as seen from this tile's centre, for the per-vertex morph
      (mesh.userData.camRel as THREE.Vector3).set(-c[0] - bodyRel[0], -c[1] - bodyRel[1], -c[2] - bodyRel[2]);
      // A tile appears when its parent's nearest point comes within the parent's split distance PS,
      // so every vertex is then at least that far: fully the parent's shape out there. It splits
      // itself when its own nearest point reaches PS/2, and its furthest vertex is then about
      // (0.5 + 0.71/SPLIT) PS away, so the morph must be finished by then or its children pop.
      const parentSplit = SPLIT * tileSize(radius, n.level - 1);
      mesh.userData.mLo = n.level === 0 ? 1e30 : parentSplit * Math.min(0.9, 0.5 + 0.8 / SPLIT);
      mesh.userData.mHi = n.level === 0 ? 2e30 : parentSplit * 0.98;
    }
    dispatch(4);
    if (live > MAX_TILES) evict(now);
    return { tiles: draw.length, live, built, inflight: waiting.size, queued: queue.length + waiting.size, deepest: draw.reduce((a, n) => Math.max(a, n.level), 0) };
  }

  /** free tiles nobody has needed for a second, finest first, until back under budget */
  function evict(now: number) {
    const all: Node[] = [];
    const walk = (n: Node) => { if (n.mesh && n.level > 0 && now - n.usedAt > 1000) all.push(n); n.kids?.forEach(walk); };
    roots.forEach(walk);
    all.sort((a, b) => a.usedAt - b.usedAt || b.level - a.level);
    for (const n of all) {
      if (live <= MAX_TILES * 0.85) break;
      if (!n.mesh) continue;
      // a tile with live children stays; they go first
      if (n.kids?.some((k) => k.mesh)) continue;
      release(n);
      if (n.kids) { n.kids.forEach((k) => { k.dead = true; }); n.kids = undefined; }
    }
  }

  /** ground height under a direction from the centre, at full detail, for keeping the camera above it */
  function groundAt(dirFromCentre: V3) {
    return src.height(norm(dirFromCentre), 1);
  }

  function dispose() {
    workers.forEach((w) => w.terminate());
    group.traverse((x) => { const mm = x as THREE.Mesh; if (mm.isMesh) { mm.geometry.setIndex(null); mm.geometry.dispose(); } });
  }

  return { group, update, groundAt, radius, source: src, dispose, material: mat };
}

export type Terrain = ReturnType<typeof createTerrain>;
