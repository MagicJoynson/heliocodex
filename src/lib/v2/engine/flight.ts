import * as THREE from 'three/webgpu';
import { add, clamp, cross, dot, len, norm, scale, slerp, smooth, sub, type V3 } from './vec';

/**
 * How you move. Built to be calm: the camera never swings round on its own.
 *
 * - orbit (the default): you look at one body or place, the focus. Drag, the arrow keys or A and D
 *   turn you round it; the wheel, a pinch, W and S or the + and − buttons bring you nearer or take
 *   you further out. Ecliptic north stays up, so the horizon of the Solar System never tips.
 * - cruise: going from one focus to another. The view slides and zooms like a map (out a little, across,
 *   back in), keeping the direction it looks in, so almost nothing turns. Short: two to five seconds.
 * - free: flying yourself, for skimming the ground. W A S D, E and Q. Esc goes back to orbit.
 *
 * Anything that would turn the view suddenly (leaving free flight, say) is blended over half a second.
 */

export interface Focus {
  centre: () => V3; // the body's centre (it may move)
  radius: number; // metres; 0 for a place with no surface
  /** ground height above the radius under a direction from the centre, metres */
  ground?: (dir: V3) => number;
}

export interface Cruise {
  to: Focus;
  endDist: number; // distance from the centre to arrive at, metres
  /** which side to arrive on (unit, from the centre); left out, the side you are looking from now */
  endDir?: V3;
  secs: number;
}

const UP: V3 = [0, 1, 0];
const MAX_EL = THREE.MathUtils.degToRad(84);

export function createFlight(canvas: HTMLElement) {
  const pos: V3 = [0, 0, 0];
  const q = new THREE.Quaternion();
  const vel: V3 = [0, 0, 0];
  let mode: 'idle' | 'orbit' | 'cruise' | 'free' = 'idle';
  let speedMul = 1;
  let lastFloor = 0, lastR = 0, floorOff = 0;
  let reduced = false; // reduced motion: no drift after a drag, faster settling

  // ---- orbit state
  let focus: Focus = { centre: () => [0, 0, 0], radius: 0 };
  let dir: V3 = [0, 0, 1]; // from the focus to the camera
  let dist = 1, distGoal = 1;
  let spin = { az: 0, el: 0 }; // drift after a drag, radians a second

  // ---- cruise state
  let cr: null | { from: Focus; to: Focus; c0: V3; d0: number; d1: number; dir0: V3; dir1: V3; hump: number; secs: number; t: number } = null;

  // ---- blending the view after a jump of mode
  let blendFrom: THREE.Quaternion | null = null, blendT = 0;
  const startBlend = () => { blendFrom = q.clone(); blendT = 0; };

  // ---- input
  const keys = new Set<string>();
  const typing = (e: Event) => !!(e.target as HTMLElement)?.closest?.('input, textarea, select, [contenteditable]');
  addEventListener('keydown', (e) => {
    if (typing(e) || e.metaKey || e.ctrlKey || e.altKey) return;
    keys.add(e.code);
    if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'PageUp', 'PageDown'].includes(e.code) && mode !== 'idle' && !(e.target as HTMLElement)?.closest?.('button, a, [role="tab"]')) e.preventDefault();
  });
  addEventListener('keyup', (e) => keys.delete(e.code));
  addEventListener('blur', () => keys.clear());

  let look = { dx: 0, dy: 0 };
  let zoomBy = 1; // multiplied into the goal distance on the next step
  const pointers = new Map<number, { x: number; y: number; x0: number; y0: number; t0: number }>();
  let pinch0 = 0;
  let onTap: ((x: number, y: number) => void) | null = null;
  canvas.addEventListener('pointerdown', (e) => {
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY, x0: e.clientX, y0: e.clientY, t0: performance.now() });
    canvas.setPointerCapture(e.pointerId);
    spin = { az: 0, el: 0 };
    if (pointers.size === 2) { const [a, b] = [...pointers.values()]; pinch0 = Math.hypot(a.x - b.x, a.y - b.y); }
  });
  canvas.addEventListener('pointermove', (e) => {
    const p = pointers.get(e.pointerId);
    if (!p) return;
    if (pointers.size === 1) { look.dx += e.clientX - p.x; look.dy += e.clientY - p.y; }
    p.x = e.clientX; p.y = e.clientY;
    if (pointers.size === 2) {
      const [a, b] = [...pointers.values()];
      const d = Math.hypot(a.x - b.x, a.y - b.y);
      if (pinch0 > 0 && d > 0) zoomBy *= pinch0 / d;
      pinch0 = d;
    }
  });
  const end = (e: PointerEvent) => {
    const p = pointers.get(e.pointerId);
    if (!p) return;
    const was = pointers.size;
    pointers.delete(e.pointerId);
    // a tap: barely moved, quickly, with one finger
    if (was === 1 && e.type === 'pointerup' && Math.hypot(e.clientX - p.x0, e.clientY - p.y0) < 6 && performance.now() - p.t0 < 450) onTap?.(e.clientX, e.clientY);
    pinch0 = 0;
  };
  canvas.addEventListener('pointerup', end);
  canvas.addEventListener('pointercancel', end);
  canvas.addEventListener('wheel', (e) => {
    e.preventDefault();
    // Firefox reports lines, not pixels; a trackpad pinch arrives as a wheel with ctrlKey
    const px = e.deltaY * (e.deltaMode === 1 ? 33 : e.deltaMode === 2 ? 600 : 1) * (e.ctrlKey ? 3 : 1);
    if (mode === 'free') speedMul = clamp(speedMul * Math.pow(1.0015, -px), 0.02, 50);
    else zoomBy *= Math.pow(1.0018, clamp(px, -240, 240));
  }, { passive: false });
  /** touch pad: -1 back, 0 still, 1 forward (set by the page's on-screen control) */
  let pad = 0;

  // ---- helpers
  const fwd = () => { const v = new THREE.Vector3(0, 0, -1).applyQuaternion(q); return [v.x, v.y, v.z] as V3; };
  const right = () => { const v = new THREE.Vector3(1, 0, 0).applyQuaternion(q); return [v.x, v.y, v.z] as V3; };
  const upv = () => { const v = new THREE.Vector3(0, 1, 0).applyQuaternion(q); return [v.x, v.y, v.z] as V3; };
  function lookAlong(d: V3, up: V3) {
    const m = new THREE.Matrix4().lookAt(new THREE.Vector3(0, 0, 0), new THREE.Vector3(...d), new THREE.Vector3(...up));
    q.setFromRotationMatrix(m);
  }
  function rotate(axis: V3, ang: number) {
    q.premultiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(...axis), ang));
  }
  /** keep a direction off the poles, so "up" always means something */
  function clampEl(d: V3): V3 {
    const el = Math.asin(clamp(d[1], -1, 1));
    if (Math.abs(el) <= MAX_EL) return d;
    const h = Math.hypot(d[0], d[2]) || 1;
    const e = Math.sign(el) * MAX_EL;
    return [(d[0] / h) * Math.cos(e), Math.sin(e), (d[2] / h) * Math.cos(e)];
  }
  /** turn a direction round the vertical by az and up or down by el */
  function turn(d: V3, az: number, el: number): V3 {
    const v = new THREE.Vector3(...d).applyAxisAngle(new THREE.Vector3(0, 1, 0), az);
    let o: V3 = [v.x, v.y, v.z];
    const side = norm(cross(UP, o));
    if (len(side) > 0.01 && el) { const w = new THREE.Vector3(...o).applyAxisAngle(new THREE.Vector3(...side), -el); o = [w.x, w.y, w.z]; }
    return clampEl(norm(o));
  }
  const minDistOf = (f: Focus, d: V3) => (f.radius > 0 ? f.radius + Math.max(0, f.ground?.(d) ?? 0) + Math.max(f.radius * 0.0012, 400) : 1e3);
  const MAX_DIST = 1e28;

  const ease = (u: number) => (u < 0.5 ? 4 * u ** 3 : 1 - Math.pow(-2 * u + 2, 3) / 2);

  /** where the camera is during a cruise */
  function cruiseAt(u: number): { c: V3; d: number; dir: V3 } {
    const c = cr!;
    const pan = smooth(0.12, 0.88, u);
    const ctr = add(scale(c.c0, 1 - pan), scale(c.to.centre(), pan));
    // distance: logarithmic from the start to the end, plus a rise in the middle wide enough to see both ends
    const e = ease(u);
    const ld = Math.log(c.d0) * (1 - e) + Math.log(c.d1) * e + c.hump * Math.sin(Math.PI * u);
    const dd = clampEl(norm(slerp(c.dir0, c.dir1, smooth(0.2, 0.8, u))));
    return { c: ctr, d: Math.exp(ld), dir: dd };
  }

  /**
   * Advance one frame. `near` is the nearest body, for free flight's floor and speed.
   * Returns the height above that body's ground.
   */
  function step(dt: number, wall: number, near: { centre: V3; radius: number; ground: (dir: V3) => number }) {
    // ---- keys in orbit and cruise: turn and zoom at a steady, gentle rate
    const k = (c: string) => keys.has(c);
    const fast = k('ShiftLeft') || k('ShiftRight') ? 2.5 : 1;

    if (mode === 'cruise' && cr) {
      cr.t = Math.min(cr.secs, cr.t + wall);
      const u = cr.secs > 0 ? cr.t / cr.secs : 1;
      const at = cruiseAt(u);
      const p = add(at.c, scale(at.dir, at.d));
      pos[0] = p[0]; pos[1] = p[1]; pos[2] = p[2];
      lookAlong(scale(at.dir, -1), UP);
      if (u >= 1) {
        focus = cr.to; dir = at.dir; dist = distGoal = at.d; cr = null; mode = 'orbit';
      }
    } else if (mode === 'orbit') {
      // turning: a drag, the arrows, A and D
      const turnRate = 1.1 * fast * wall; // radians a second
      let az = (k('ArrowLeft') || k('KeyA') ? 1 : 0) - (k('ArrowRight') || k('KeyD') ? 1 : 0);
      let el = (k('ArrowUp') ? 1 : 0) - (k('ArrowDown') ? 1 : 0);
      az *= turnRate; el *= turnRate;
      if (look.dx || look.dy) {
        const kk = 0.0055;
        const daz = -look.dx * kk, del = look.dy * kk;
        az += daz; el += del;
        // what is left over after letting go: a short, soft drift (none with reduced motion)
        if (!reduced && wall > 0) spin = { az: daz / wall * 0.5, el: del / wall * 0.5 };
        look = { dx: 0, dy: 0 };
      } else if (!pointers.size && (spin.az || spin.el)) {
        az += spin.az * wall; el += spin.el * wall;
        const f = Math.exp(-wall * 5);
        spin.az *= f; spin.el *= f;
        if (Math.abs(spin.az) + Math.abs(spin.el) < 0.002) spin = { az: 0, el: 0 };
      }
      if (az || el) dir = turn(dir, az, el);
      // zooming: the wheel, a pinch, W and S, + and −, Page Up and Down
      const zin = (k('KeyW') || k('Equal') || k('NumpadAdd') || k('PageUp') ? 1 : 0) - (k('KeyS') || k('Minus') || k('NumpadSubtract') || k('PageDown') ? 1 : 0);
      if (zin) zoomBy *= Math.pow(0.45, zin * fast * wall);
      const lo = minDistOf(focus, dir);
      distGoal = clamp(distGoal * zoomBy, lo, MAX_DIST);
      zoomBy = 1;
      // the distance settles on its goal over about a fifth of a second, evenly in powers of ten
      dist = Math.exp(Math.log(dist) + (Math.log(distGoal) - Math.log(dist)) * (1 - Math.exp(-wall * (reduced ? 14 : 9))));
      dist = Math.max(dist, lo);
      const p = add(focus.centre(), scale(dir, dist));
      pos[0] = p[0]; pos[1] = p[1]; pos[2] = p[2];
      lookAlong(scale(dir, -1), UP);
    }

    const rel = sub(pos, near.centre);
    const dNear = len(rel);
    const upLocal = norm(rel);
    const alt = dNear - near.radius - near.ground(upLocal);

    if (mode === 'free') {
      // looking round
      const height = dNear - near.radius;
      const ground = 1 - smooth(near.radius * 0.3, near.radius * 2, height);
      if (look.dx || look.dy) {
        const kk = 0.0032;
        rotate(norm(add(scale(upv(), 1 - ground), scale(upLocal, ground))), -look.dx * kk);
        const before = q.clone();
        rotate(right(), -look.dy * kk);
        if (ground > 0.5 && Math.abs(dot(fwd(), upLocal)) > Math.sin(THREE.MathUtils.degToRad(88))) q.copy(before);
        look = { dx: 0, dy: 0 };
      }
      // the arrows turn you, gently
      const ta = ((k('ArrowLeft') ? 1 : 0) - (k('ArrowRight') ? 1 : 0)) * 0.9 * wall;
      if (ta) rotate(norm(add(scale(upv(), 1 - ground), scale(upLocal, ground))), ta);
      zoomBy = 1;
      // speed follows height: about your own height per second, so the ground always moves the same
      const base = clamp(alt, 2, 1e27) * 0.9 * speedMul;
      const f = (k('KeyW') || k('ArrowUp') ? 1 : 0) - (k('KeyS') || k('ArrowDown') ? 1 : 0) + pad;
      const s = (k('KeyD') ? 1 : 0) - (k('KeyA') ? 1 : 0);
      const u = (k('Space') || k('KeyE') ? 1 : 0) - (k('KeyC') || k('KeyQ') ? 1 : 0);
      const want = scale(add(add(scale(fwd(), f), scale(right(), s)), scale(upLocal, u)), base * (fast > 1 ? 4 : 1));
      const kv = 1 - Math.exp(-dt * 5);
      vel[0] += (want[0] - vel[0]) * kv; vel[1] += (want[1] - vel[1]) * kv; vel[2] += (want[2] - vel[2]) * kv;
      pos[0] += vel[0] * dt; pos[1] += vel[1] * dt; pos[2] += vel[2] * dt;

      // never below the ground
      const rel2 = sub(pos, near.centre);
      const up2 = norm(rel2);
      const target = near.radius + near.ground(up2) + 1.7;
      if (near.radius === lastR && Math.abs(target - lastFloor) > 5 + len(vel) * dt * 2) floorOff += lastFloor - target;
      floorOff *= Math.exp(-dt * 6);
      if (Math.abs(floorOff) < 0.01) floorOff = 0;
      lastFloor = target; lastR = near.radius;
      const floor = target + floorOff;
      if (len(rel2) < floor) {
        const p = add(near.centre, scale(up2, floor));
        pos[0] = p[0]; pos[1] = p[1]; pos[2] = p[2];
        const vn = dot(vel, up2);
        if (vn < 0) { vel[0] -= up2[0] * vn; vel[1] -= up2[1] * vn; vel[2] -= up2[2] * vn; }
      }
      // level the horizon: take out any roll, gently, when near a body
      if (ground > 0.01) {
        const fw = fwd();
        const want2 = cross(fw, upLocal);
        if (len(want2) > 0.05) {
          const wr = norm(want2);
          const r = right();
          const ang = Math.atan2(dot(cross(r, wr), fw), dot(r, wr));
          rotate(fw, ang * (1 - Math.exp(-dt * 3)) * ground);
        }
      }
    } else {
      vel[0] = vel[1] = vel[2] = 0;
    }

    // soften any jump of view left by a change of mode
    if (blendFrom) {
      blendT += wall / (reduced ? 0.25 : 0.6);
      if (blendT >= 1) blendFrom = null;
      else { const target = q.clone(); q.copy(blendFrom).slerp(target, smooth(0, 1, blendT)); }
    }

    return { alt, mode, speed: len(vel), arriving: cr ? cr.t / Math.max(cr.secs, 1e-6) : 1 };
  }

  return {
    pos, q, step,
    get mode() { return mode; },
    get speedMul() { return speedMul; },
    get focus() { return focus; },
    /** where a trip in progress is going, or the focus */
    get target() { return cr ? cr.to : focus; },
    get dist() { return dist; },
    setPad(v: number) { pad = v; },
    setReduced(v: boolean) { reduced = v; if (v) spin = { az: 0, el: 0 }; },
    onTap(cb: (x: number, y: number) => void) { onTap = cb; },
    /** + and − on screen: one press is a factor of about 2.5 */
    zoom(steps: number) { zoomBy *= Math.pow(0.4, steps); },
    /** look at a focus from a side and distance at once, without moving there */
    orbitAt(f: Focus, d: number, side: V3, hold = false) {
      focus = f; dir = clampEl(norm(side)); dist = distGoal = d; cr = null; mode = hold ? 'idle' : 'orbit';
      const p = add(f.centre(), scale(dir, d));
      pos[0] = p[0]; pos[1] = p[1]; pos[2] = p[2];
      lookAlong(scale(dir, -1), UP);
    },
    /** go to a new focus: slide and zoom, keeping the view's direction unless told otherwise */
    startCruise(c: Cruise) {
      if (mode === 'free') startBlend();
      const from = focus;
      // where the view is centred now: the focus in orbit, or straight ahead in free flight
      const c0: V3 = mode === 'free' ? add(pos, scale(fwd(), Math.max(1, len(sub(pos, from.centre()))))) : [...from.centre()] as V3;
      const dir0 = mode === 'free' ? norm(sub(pos, c0)) : dir;
      const d0 = Math.max(1, len(sub(pos, c0)));
      const dir1 = clampEl(norm(c.endDir ?? dir0));
      const d1 = Math.max(c.endDist, minDistOf(c.to, dir1));
      // rise far enough in the middle to see both ends of the trip at once
      const sep = len(sub(c.to.centre(), c0));
      const hump = Math.max(0, Math.log(sep * 0.9) - Math.max(Math.log(d0), Math.log(d1)));
      // a negative time means "as long as the trip needs": two seconds, plus a little for every power of ten
      const decades = (Math.abs(Math.log(d1 / d0)) + 2 * hump) / Math.LN10 + 2 * Math.acos(clamp(dot(dir0, dir1), -1, 1));
      const secs = c.secs >= 0 ? c.secs : clamp(1.9 + 0.3 * decades, 1.9, 5.5);
      cr = { from, to: c.to, c0, d0, d1, dir0, dir1, hump, secs, t: 0 };
      mode = 'cruise';
    },
    skipCruise() { if (mode === 'cruise' && cr) cr.t = Math.max(cr.t, cr.secs - 0.6); },
    /** fly yourself from where you are */
    setFree() { if (mode === 'cruise') return; mode = 'free'; vel[0] = vel[1] = vel[2] = 0; },
    /** back to orbiting a focus, from wherever free flight left you */
    backToOrbit(f: Focus) {
      startBlend();
      focus = f;
      const r = sub(pos, f.centre());
      dist = distGoal = Math.max(len(r), minDistOf(f, norm(r)));
      dir = clampEl(norm(r));
      mode = 'orbit';
    },
    /** the trip so far, 0 to 1, and how long it lasts */
    get cruise() { return cr ? { u: cr.t / Math.max(cr.secs, 1e-6), secs: cr.secs } : null; },
  };
}

export type Flight = ReturnType<typeof createFlight>;
