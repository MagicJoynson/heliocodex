import * as THREE from 'three/webgpu';
import { instancedBufferAttribute, uv, vec4, vec3, float, exp, dot, sub, max, uniform, normalWorld } from 'three/tsl';
import type { Body, Layer } from '../engine/index';
import type { KeplerOrbit } from '../atlas/types';
import { keplerPath, keplerPosition, eclToEngine } from '../atlas/kepler';

/**
 * Every moon in the solar system, where it really is on the engine's clock.
 *
 * Far off, a moon is a point of light, as bright as it would truly look from where the camera is:
 * its size, how far it is from the Sun and from you, and how much of its lit side faces you.
 * Close enough to show a disc, it becomes a plain lit ball (until the engine draws that moon's own
 * ground, when `hide(id)` takes it out of this layer).
 *
 * Two things here are aids, not sights, and the page must say so where it turns them on:
 *   - orbit lines, drawn for the planet you are near (only the moons with a measured size);
 *   - markers: with `setMarkers(true)` the moons of that planet too faint to see are given a
 *     small dim dot and a faint orbit line anyway, so all 292 of Saturn's can be found.
 *
 * Sizes that nobody has measured are assumed to be 2 km across for the brightness sum, and those
 * moons are never drawn as discs.
 */

const KM = 1000;
const AU = 149_597_870_700;
const SEGMENTS = 160;
const ASSUMED_RADIUS_KM = 1; // 2 km across, for moons known only as a point of light
const ALBEDO = 0.2; // a middling grey; individual albedos come with each moon's own surface

type V3 = [number, number, number];

interface Entry {
  body: Body;
  orbit: KeplerOrbit;
  parent: string;
  radiusM: number;
  measured: boolean;
  line?: THREE.Line;
  lineJd: number;
  hidden: boolean;
}

export interface MoonsLayer extends Layer {
  /** Mark the faint moons of the planet you are near with a dim dot. Off by default. */
  setMarkers(on: boolean): void;
  /** Show or hide the orbit lines. On by default. */
  setOrbits(on: boolean): void;
  /** Stop drawing one moon here, because the engine is now drawing its real surface. */
  hide(id: string, hidden?: boolean): void;
  /** Tell the layer how tall the view is in CSS pixels and its vertical field of view, for sizing. */
  setView(heightPx: number, fovDeg: number): void;
  /** How many moons the layer holds. */
  readonly count: number;
}

export function createMoonsLayer(bodies: Body[]): MoonsLayer {
  const moons: Entry[] = bodies
    .filter((b) => b.kind === 'moon' && b.parent && b.orbit.type === 'kepler')
    .map((b) => ({
      body: b, orbit: b.orbit as KeplerOrbit, parent: b.parent!, measured: b.meanRadiusKm !== undefined,
      radiusM: (b.meanRadiusKm ?? ASSUMED_RADIUS_KM) * KM, lineJd: NaN, hidden: false,
    }));
  const n = moons.length;
  const parents = [...new Set(moons.map((m) => m.parent))];
  // how far out each planet's moons reach, to decide which planet you are "near"
  const reach = new Map(parents.map((p) => [p, Math.max(...moons.filter((m) => m.parent === p).map((m) => m.orbit.aKm * (1 + m.orbit.e))) * KM]));

  const group = new THREE.Group();
  group.name = 'moons';
  let markers = false, orbits = true, viewH = 900, fov = 55;

  // ---- points of light: one instanced sprite, as the engine's stars are drawn
  const pos = new Float32Array(n * 3);
  const look = new Float32Array(n * 4); // rgb premultiplied by brightness, and size in CSS px
  const posAttr = new THREE.InstancedBufferAttribute(pos, 3);
  const lookAttr = new THREE.InstancedBufferAttribute(look, 4);
  posAttr.setUsage(THREE.DynamicDrawUsage);
  lookAttr.setUsage(THREE.DynamicDrawUsage);
  const pmat = new THREE.PointsNodeMaterial({ transparent: true, depthTest: true, depthWrite: false, blending: THREE.AdditiveBlending, sizeAttenuation: false });
  pmat.positionNode = instancedBufferAttribute(posAttr);
  const c = instancedBufferAttribute(lookAttr) as unknown as ReturnType<typeof vec4>;
  pmat.sizeNode = c.w;
  const d = sub(uv(), 0.5);
  const r2 = dot(d, d).mul(4);
  const fall = exp(r2.mul(-5)).add(exp(r2.mul(-1.2)).mul(0.25)).mul(max(float(0), float(1).sub(r2)));
  pmat.colorNode = vec4(c.xyz.mul(fall), 1);
  const points = new THREE.Sprite(pmat);
  points.count = n;
  points.frustumCulled = false;
  points.renderOrder = 3;
  group.add(points);

  // ---- discs: plain lit balls for moons with a measured size, once they are more than a dot
  const sunDir = uniform(new THREE.Vector3(1, 0, 0));
  const bmat = new THREE.MeshBasicNodeMaterial();
  const lit = max(float(0), dot(normalWorld, sunDir));
  // a soft edge to the lit side, and the faintest glow on the night side so the ball has a shape
  bmat.colorNode = vec3(0.56, 0.55, 0.53).mul(lit.mul(0.97).add(0.012));
  const ballGeo = new THREE.IcosahedronGeometry(1, 5);
  const balls = new Map<string, THREE.Mesh>();
  for (const m of moons) {
    if (!m.measured) continue;
    const mesh = new THREE.Mesh(ballGeo, bmat);
    mesh.scale.setScalar(m.radiusM);
    mesh.visible = false;
    mesh.frustumCulled = false;
    mesh.name = m.body.id;
    balls.set(m.body.id, mesh);
    group.add(mesh);
  }

  // ---- orbit lines, made for one planet at a time
  const lineGroup = new THREE.Group();
  group.add(lineGroup);
  const lineOpacity = uniform(0);
  const mkLine = (strong: boolean) => {
    const m = new THREE.LineBasicNodeMaterial({ transparent: true, depthTest: true, depthWrite: false });
    m.colorNode = vec3(0.72, 0.74, 0.8);
    m.opacityNode = lineOpacity.mul(strong ? 0.3 : 0.045);
    return m;
  };
  const strongLine = mkLine(true), faintLine = mkLine(false);
  let lineParent = '';

  function buildLines(parent: string, jd: number) {
    for (const m of moons) {
      if (m.parent !== parent) continue;
      // an orbit turns slowly; redraw it when the clock has moved a month (sooner for the fastest moons)
      const stale = !(Math.abs(jd - m.lineJd) < Math.min(30, Math.max(0.5, m.orbit.periodDays * 20)));
      if (m.line && !stale) continue;
      const path = keplerPath(m.orbit, parent, jd, SEGMENTS);
      // one extra point, back at the start, closes the ring (this renderer has no line loop)
      const arr = new Float32Array((SEGMENTS + 1) * 3);
      const p: V3 = [0, 0, 0];
      for (let k = 0; k <= SEGMENTS; k++) {
        const s = (k % SEGMENTS) * 3;
        eclToEngine(path[s], path[s + 1], path[s + 2], p);
        arr[k * 3] = p[0] * KM; arr[k * 3 + 1] = p[1] * KM; arr[k * 3 + 2] = p[2] * KM;
      }
      if (!m.line) {
        const g = new THREE.BufferGeometry();
        g.setAttribute('position', new THREE.BufferAttribute(arr, 3));
        m.line = new THREE.Line(g, m.measured ? strongLine : faintLine);
        m.line.frustumCulled = false;
        m.line.renderOrder = 2;
        lineGroup.add(m.line);
      } else {
        (m.line.geometry.getAttribute('position') as THREE.BufferAttribute).set(arr).needsUpdate = true;
      }
      m.lineJd = jd;
    }
    // the hundreds of small outer moons would bury everything: their orbits show only with the markers
    for (const m of moons) if (m.line && !m.measured) m.line.visible = markers;
  }
  function dropLines() {
    for (const m of moons) {
      if (!m.line) continue;
      lineGroup.remove(m.line);
      m.line.geometry.dispose();
      m.line = undefined; m.lineJd = NaN;
    }
  }

  const ecl: V3 = [0, 0, 0], off: V3 = [0, 0, 0];

  function update(rel: (id: string) => V3 | null, timeJd: number): boolean {
    const sun = rel('sun');
    if (sun) { const l = Math.hypot(sun[0], sun[1], sun[2]) || 1; sunDir.value.set(sun[0] / l, sun[1] / l, sun[2] / l); }
    const pxPerRad = viewH / (2 * Math.tan((fov * Math.PI) / 360));

    // which planet are we near? the closest one, counted in units of how far its moons reach
    let near = '', nearScore = Infinity;
    const prel = new Map<string, V3 | null>();
    for (const p of parents) {
      const r = rel(p);
      prel.set(p, r);
      if (!r) continue;
      const score = Math.hypot(r[0], r[1], r[2]) / reach.get(p)!;
      if (score < nearScore) { nearScore = score; near = p; }
    }
    // lines and markers fade in as you come within a few system-widths of the planet
    const focus = near ? 1 - Math.min(1, Math.max(0, (nearScore - 6) / 14)) : 0;

    if (orbits && focus > 0 && near) {
      if (lineParent !== near) { dropLines(); lineParent = near; }
      buildLines(near, timeJd);
      const r = prel.get(near)!;
      lineGroup.position.set(r[0], r[1], r[2]);
      lineGroup.visible = true;
      lineOpacity.value = focus;
    } else {
      lineGroup.visible = false;
    }

    const px = Math.min(globalThis.devicePixelRatio || 1, 2);
    for (let k = 0; k < n; k++) {
      const m = moons[k];
      const pr = prel.get(m.parent);
      const o = k * 3, q = k * 4;
      const ball = balls.get(m.body.id);
      if (!pr || m.hidden) { look[q] = look[q + 1] = look[q + 2] = 0; look[q + 3] = 0; if (ball) ball.visible = false; continue; }
      keplerPosition(m.orbit, m.parent, timeJd, ecl);
      eclToEngine(ecl[0], ecl[1], ecl[2], off);
      const x = pr[0] + off[0] * KM, y = pr[1] + off[1] * KM, z = pr[2] + off[2] * KM;
      pos[o] = x; pos[o + 1] = y; pos[o + 2] = z;
      const dist = Math.hypot(x, y, z) || 1;
      const discPx = (m.radiusM / dist) * pxPerRad; // radius of the disc on screen

      // how bright: sunlight falling on it, the share of the lit side facing us, and distance
      let phase = 1, dSun = AU;
      if (sun) {
        const sx = sun[0] - x, sy = sun[1] - y, sz = sun[2] - z; // moon to Sun
        dSun = Math.hypot(sx, sy, sz) || 1;
        const cosA = (sx * -x + sy * -y + sz * -z) / (dSun * dist); // angle Sun-moon-camera
        const a = Math.acos(Math.max(-1, Math.min(1, cosA)));
        phase = (Math.sin(a) + (Math.PI - a) * Math.cos(a)) / Math.PI; // a matt ball
      }
      const flux = (ALBEDO * phase * m.radiusM * m.radiusM) / ((dSun / AU) ** 2 * dist * dist);
      // the full Moon seen from Earth (flux about 2.45e-6 in these units) is magnitude -12.7
      const mag = -12.7 - 2.5 * Math.log10(Math.max(1e-30, flux / 2.45e-6));
      let b = Math.pow(10, -0.4 * (mag - 0.5));
      let alpha = Math.min(1, b * 1.4);
      if (alpha < 0.04) alpha = 0; // below what the eye would pick out among the stars
      if (markers && m.parent === near) alpha = Math.max(alpha, 0.16 * focus);
      // hand over to the ball as the disc grows past a pixel or so
      const asBall = ball ? Math.min(1, Math.max(0, (discPx - 0.8) / 1.2)) : 0;
      alpha *= 1 - asBall;
      const tint = m.measured ? 1 : 0.85;
      look[q] = alpha * tint; look[q + 1] = alpha * tint; look[q + 2] = alpha;
      b = Math.min(b, 40);
      look[q + 3] = (Math.min(8, Math.max(1.6, 1.6 + Math.sqrt(b) * 2.6)) * 2.2) / px;
      if (ball) {
        ball.visible = asBall > 0;
        if (ball.visible) ball.position.set(x, y, z);
      }
    }
    posAttr.needsUpdate = true;
    lookAttr.needsUpdate = true;
    return true;
  }

  return {
    name: 'moons',
    count: n,
    attach(parent: unknown) { (parent as THREE.Object3D).add(group); },
    update,
    detach() {
      group.removeFromParent();
      dropLines();
      ballGeo.dispose(); pmat.dispose(); bmat.dispose(); strongLine.dispose(); faintLine.dispose();
    },
    setMarkers(on) { markers = on; },
    setOrbits(on) { orbits = on; },
    hide(id, hidden = true) { const m = moons.find((x) => x.body.id === id); if (m) m.hidden = hidden; },
    setView(heightPx, fovDeg) { viewH = heightPx; fov = fovDeg; },
  };
}
