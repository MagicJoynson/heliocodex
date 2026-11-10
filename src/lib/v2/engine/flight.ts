import * as THREE from 'three/webgpu';
import { add, clamp, cross, dot, len, norm, scale, slerp, smooth, sub, type V3 } from './vec';

/**
 * How you move. Two modes:
 * - cruise: the ship flies you along a curved path to a body, closing the distance by the same
 *   number of powers of ten every second, so 46 au and the last few thousand km both feel right.
 * - free: you fly yourself. Speed scales with height above the ground, so the same keys work from
 *   orbit down to walking pace. The view levels itself to the horizon when you are near a body.
 */

export interface Cruise {
  from: V3; // camera start, world metres
  target: () => V3; // the body's centre (it may move)
  endDist: number; // distance from the centre to stop at, metres
  endDir: V3; // which side of the body to arrive on (unit, from its centre)
  secs: number;
  aimOffset?: number; // radians: how far the body sits off-centre on arrival
}

export function createFlight(canvas: HTMLElement) {
  const pos: V3 = [0, 0, 0];
  const q = new THREE.Quaternion();
  const vel: V3 = [0, 0, 0];
  let mode: 'idle' | 'cruise' | 'free' = 'idle';
  let cruise: Cruise | null = null;
  let cruiseT = 0;
  let speedMul = 1;
  let lastFloor = 0, lastR = 0, floorOff = 0;

  // ---- input
  const keys = new Set<string>();
  addEventListener('keydown', (e) => {
    if ((e.target as HTMLElement)?.closest?.('input, textarea')) return;
    keys.add(e.code);
    if (['Space', 'ArrowUp', 'ArrowDown'].includes(e.code) && mode === 'free') e.preventDefault();
  });
  addEventListener('keyup', (e) => keys.delete(e.code));
  addEventListener('blur', () => keys.clear());
  let look = { dx: 0, dy: 0 };
  let drag: { id: number; x: number; y: number } | null = null;
  canvas.addEventListener('pointerdown', (e) => {
    if (drag) return;
    drag = { id: e.pointerId, x: e.clientX, y: e.clientY };
    canvas.setPointerCapture(e.pointerId);
  });
  canvas.addEventListener('pointermove', (e) => {
    if (!drag || e.pointerId !== drag.id) return;
    look.dx += e.clientX - drag.x; look.dy += e.clientY - drag.y;
    drag.x = e.clientX; drag.y = e.clientY;
  });
  const end = (e: PointerEvent) => { if (drag && e.pointerId === drag.id) drag = null; };
  canvas.addEventListener('pointerup', end);
  canvas.addEventListener('pointercancel', end);
  canvas.addEventListener('wheel', (e) => {
    if (mode !== 'free') return;
    e.preventDefault();
    // Firefox reports lines, not pixels
    const px = e.deltaY * (e.deltaMode === 1 ? 33 : e.deltaMode === 2 ? 600 : 1);
    speedMul = clamp(speedMul * Math.pow(1.0015, -px), 0.02, 50);
  }, { passive: false });
  /** touch pad: -1 back, 0 still, 1 forward (set by the page's on-screen control) */
  let pad = 0;

  // ---- helpers
  const fwd = () => { const v = new THREE.Vector3(0, 0, -1).applyQuaternion(q); return [v.x, v.y, v.z] as V3; };
  const right = () => { const v = new THREE.Vector3(1, 0, 0).applyQuaternion(q); return [v.x, v.y, v.z] as V3; };
  const upv = () => { const v = new THREE.Vector3(0, 1, 0).applyQuaternion(q); return [v.x, v.y, v.z] as V3; };
  function lookAlong(dir: V3, up: V3) {
    const m = new THREE.Matrix4().lookAt(new THREE.Vector3(0, 0, 0), new THREE.Vector3(...dir), new THREE.Vector3(...up));
    q.setFromRotationMatrix(m);
  }
  function rotate(axis: V3, ang: number) {
    q.premultiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(...axis), ang));
  }

  const ease = (u: number) => (u < 0.5 ? 4 * u ** 3 : 1 - Math.pow(-2 * u + 2, 3) / 2);

  function cruisePos(u: number): V3 {
    const c = cruise!;
    const tgt = c.target();
    const off = sub(c.from, tgt);
    const d0 = len(off);
    const e = ease(u);
    const d = Math.exp(Math.log(d0) + (Math.log(c.endDist) - Math.log(d0)) * e);
    return add(tgt, scale(slerp(norm(off), c.endDir, smooth(0.15, 0.97, e)), d));
  }

  /**
   * Advance one frame. `body` is the nearest body's centre and radius, and `ground` gives the
   * ground height (m above the radius) under a direction from its centre.
   */
  function step(dt: number, wall: number, body: { centre: V3; radius: number; ground: (dir: V3) => number }) {
    const rel = sub(pos, body.centre);
    const dist = len(rel);
    const upLocal = norm(rel);
    const alt = dist - body.radius - body.ground(upLocal);

    if (mode === 'cruise' && cruise) {
      // the cruise keeps to the clock, so a slow device still arrives on time
      cruiseT = Math.min(cruise.secs, cruiseT + wall);
      const u = cruise.secs > 0 ? cruiseT / cruise.secs : 1;
      const p = cruisePos(u);
      pos[0] = p[0]; pos[1] = p[1]; pos[2] = p[2];
      const tgt = cruise.target();
      const toT = norm(sub(tgt, pos));
      // on arrival the body slides a little off-centre, leaving room for words
      const off = (cruise.aimOffset ?? 0) * smooth(0.8, 1, u);
      const sideAx = norm(cross(toT, [0, 1, 0]));
      const aim = norm(add(toT, scale(sideAx, Math.tan(off))));
      lookAlong(aim, [0, 1, 0]);
      if (u >= 1) { mode = 'free'; vel[0] = vel[1] = vel[2] = 0; }
      return { alt, mode, speed: 0, arriving: u };
    }

    // looking round: works in every mode except cruise
    // how much the body's "up" governs the view: fully near the ground, not at all from far out
    const height = dist - body.radius;
    const ground = 1 - smooth(body.radius * 0.3, body.radius * 2, height);
    if (look.dx || look.dy) {
      const k = 0.0032;
      // yaw round the local up near the ground (so the horizon stays level), round the view's own up from orbit
      rotate(norm(add(scale(upv(), 1 - ground), scale(upLocal, ground))), -look.dx * k);
      const before = q.clone();
      rotate(right(), -look.dy * k);
      // near the ground, never tip over the top or bottom
      if (ground > 0.5 && Math.abs(dot(fwd(), upLocal)) > Math.sin(THREE.MathUtils.degToRad(88))) q.copy(before);
      look = { dx: 0, dy: 0 };
    }

    if (mode === 'free') {
      // speed follows height: about your own height per second, so the ground always moves the same
      const base = clamp(alt, 2, 5e9) * 0.9 * speedMul;
      const fast = keys.has('ShiftLeft') || keys.has('ShiftRight') ? 4 : 1;
      const f = (keys.has('KeyW') || keys.has('ArrowUp') ? 1 : 0) - (keys.has('KeyS') || keys.has('ArrowDown') ? 1 : 0) + pad;
      const s = (keys.has('KeyD') ? 1 : 0) - (keys.has('KeyA') ? 1 : 0);
      const u = (keys.has('Space') || keys.has('KeyE') ? 1 : 0) - (keys.has('KeyC') || keys.has('KeyQ') ? 1 : 0);
      const want = scale(add(add(scale(fwd(), f), scale(right(), s)), scale(upLocal, u)), base * fast);
      const k = 1 - Math.exp(-dt * 5);
      vel[0] += (want[0] - vel[0]) * k; vel[1] += (want[1] - vel[1]) * k; vel[2] += (want[2] - vel[2]) * k;
      pos[0] += vel[0] * dt; pos[1] += vel[1] * dt; pos[2] += vel[2] * dt;

      // never below the ground
      const rel2 = sub(pos, body.centre);
      const up2 = norm(rel2);
      // finer ground data can arrive and move the floor by tens of metres in one frame; ease such
      // jumps out over a few tenths of a second instead of jolting the view
      const target = body.radius + body.ground(up2) + 1.7;
      if (body.radius === lastR && Math.abs(target - lastFloor) > 5 + len(vel) * dt * 2) floorOff += lastFloor - target;
      floorOff *= Math.exp(-dt * 6);
      if (Math.abs(floorOff) < 0.01) floorOff = 0;
      lastFloor = target; lastR = body.radius;
      const floor = target + floorOff;
      if (len(rel2) < floor) {
        const p = add(body.centre, scale(up2, floor));
        pos[0] = p[0]; pos[1] = p[1]; pos[2] = p[2];
        const vn = dot(vel, up2);
        if (vn < 0) { vel[0] -= up2[0] * vn; vel[1] -= up2[1] * vn; vel[2] -= up2[2] * vn; }
      }

      // level the horizon: take out any roll, gently, when near a body
      if (ground > 0.01) {
        const fw = fwd();
        const want = cross(fw, upLocal);
        if (len(want) > 0.05) {
          const wr = norm(want);
          const r = right();
          const ang = Math.atan2(dot(cross(r, wr), fw), dot(r, wr));
          rotate(fw, ang * (1 - Math.exp(-dt * 3)) * ground);
        }
      }
    }
    return { alt, mode, speed: len(vel), arriving: 1 };
  }

  return {
    pos, q, step,
    get mode() { return mode; },
    get speedMul() { return speedMul; },
    setPad(v: number) { pad = v; },
    place(p: V3, lookDir: V3, up: V3 = [0, 1, 0]) { pos[0] = p[0]; pos[1] = p[1]; pos[2] = p[2]; lookAlong(norm(lookDir), up); },
    startCruise(c: Cruise) { cruise = c; cruiseT = 0; mode = 'cruise'; pos[0] = c.from[0]; pos[1] = c.from[1]; pos[2] = c.from[2]; },
    skipCruise() { if (mode === 'cruise' && cruise) cruiseT = Math.max(cruiseT, cruise.secs - 2.5); },
    setFree() { mode = 'free'; },
    cruisePos: (u: number) => (cruise ? cruisePos(u) : pos),
  };
}

export type Flight = ReturnType<typeof createFlight>;
