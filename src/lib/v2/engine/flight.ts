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
 *
 * Comfort: a look turns the view by a small, steady amount for each pixel dragged (about 0.08 degrees at the
 * default), it stops within a quarter of a second of letting go, the horizon is never rolled by the camera on
 * its own beyond a slow, constant-rate levelling, and a trip begins by turning to face where it is going.
 */

export interface Focus {
  centre: () => V3; // the body's centre (it may move)
  radius: number; // metres; 0 for a place with no surface
  /** ground height above the radius under a direction from the centre, metres */
  ground?: (dir: V3) => number;
  /** a flattened world: `ground` is the drawn surface's height over the mean radius (it may be negative), not terrain */
  flat?: boolean;
}

export interface Cruise {
  to: Focus;
  endDist: number; // distance from the centre to arrive at, metres
  /** which side to arrive on (unit, from the centre); left out, the side you are looking from now */
  endDir?: V3;
  secs: number;
}

const UP: V3 = [0, 1, 0];
/**
 * Free flight speed. Your top speed is always a multiple of your height above the nearest surface
 * (about once your own height a second), so it eases off by itself as you arrive and builds as you leave,
 * as it does in the games that do this well. The gears are extra multiples for crossing empty space; close to
 * a body they fade out, so a gear can never carry you into a planet.
 */
export const GEARS = [4, 16, 64, 256, 1024, 4096, 16384, 65536];
/** how fast a gear lets the speed grow, in heights a second (local flight is 0.9): fast, but never a runaway */
const RATES = [1.8, 2.6, 3.6, 4.8, 6, 7.4, 9, 11];
/** the top speed of each gear in metres a second, from a few km/s up to about a thousand light years a second */
const TOPS = Array.from({ length: GEARS.length }, (_, i) => 1e5 * Math.pow(75, i + 1));
/** per gear: how many seconds a body ahead may be from you at your speed. Faster than that and you are slowed, so you ease up to it: the speed falls in step with the distance, gently, with no hard stop. Higher gears close in quicker. */
const BRAKES = [1.0, 0.9, 0.8, 0.7, 0.6, 0.5, 0.42, 0.35];
const MAX_EL = THREE.MathUtils.degToRad(84);

export function createFlight(canvas: HTMLElement) {
  const pos: V3 = [0, 0, 0];
  const q = new THREE.Quaternion();
  const vel: V3 = [0, 0, 0];
  let calm: { f: Focus; t: number } | null = null; // Esc in free flight: slow to a halt, then circle this
  let loVel = 0;
  let loCap = Infinity; // after leaving free flight below the orbit limit, the limit rises into place instead of jumping
  let stopRamp = 0; // seconds of gentle braking left after Stop or Esc
  let cruiseVel: V3 = [0, 0, 0]; // how the camera was moving on a trip, so Stop can slow it down instead of freezing it
  let mode: 'idle' | 'orbit' | 'cruise' | 'free' = 'idle';
  let speedMul = 1;
  let gear = 0; // 0 local, 1..GEARS.length the fixed speeds
  let onGear: ((g: number) => void) | null = null;
  let onPadFree: (() => void) | null = null;
  let onWheelIn: ((x: number, y: number, amount: number) => void) | null = null;
  const setGear = (g: number) => { const n = clamp(Math.round(g), 0, GEARS.length); if (n !== gear) { gear = n; onGear?.(gear); } };
  let lastFloor = 0, lastR = 0, floorOff = 0;
  let wheelAcc = 0, wheelAt = 0;
  let reduced = false; // reduced motion: no drift after a drag, faster settling
  let lookSens = 1; // the look slider: 1 is about 0.08 degrees of turn for each pixel dragged
  let lastLookAt = -1e9; // when you last turned the view yourself (levelling waits for a moment of calm)
  let coastOver = true;
  let pushPeak = 0; // the fastest you went while pushing, so coasting is judged against it
  let coasting = false; // in a warp gear, letting go: still gliding

  // ---- orbit state
  let focus: Focus = { centre: () => [0, 0, 0], radius: 0 };
  let dir: V3 = [0, 0, 1]; // from the focus to the camera
  let dist = 1, distGoal = 1;
  let spin = { az: 0, el: 0 }; // drift after a drag, radians a second

  // ---- cruise state
  // a trip first turns on the spot to face where it is going (turn seconds, 0 if already facing it), then travels (secs)
  let cr: null | { from: Focus; to: Focus; c0: V3; d0: number; d1: number; dir0: V3; dir1: V3; hump: number; secs: number; turn: number; total: number; p0: V3; q0: THREE.Quaternion | null; q1: THREE.Quaternion | null; t: number } = null;

  // ---- blending the view after a jump of mode
  let blendFrom: THREE.Quaternion | null = null, blendT = 0;
  const startBlend = () => { blendFrom = q.clone(); blendT = 0; };

  // ---- input
  const keys = new Set<string>();
  const typing = (e: Event) => !!(e.target as HTMLElement)?.closest?.('input, textarea, select, [contenteditable]');
  addEventListener('keydown', (e) => {
    if (typing(e) || e.metaKey || e.ctrlKey || e.altKey) return;
    keys.add(e.code);
    if (mode === 'free' && !e.repeat && e.code === 'Period') setGear(gear + 1);
    if (mode === 'free' && !e.repeat && e.code === 'Comma') setGear(gear - 1);
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
    if (mode === 'free') {
      // each notch of the wheel is one gear: up for faster, down for slower (a trackpad adds up small movements into one notch)
      const now = performance.now();
      if (now - wheelAt > 400) wheelAcc = 0;
      wheelAt = now; wheelAcc += px;
      if (Math.abs(wheelAcc) >= 60) { setGear(gear + (wheelAcc < 0 ? 1 : -1)); wheelAcc = 0; }
    }
    else { zoomBy *= Math.pow(1.0018, clamp(px, -240, 240)); if (px < 0 && mode === 'orbit') onWheelIn?.(e.clientX, e.clientY, -px); }
  }, { passive: false });
  /** touch pad: -1 back, 0 still, 1 forward (set by the page's on-screen control) */
  let pad = 0;

  // ---- a game controller, if one is plugged in or paired: sticks move and look, triggers go up and down
  // (or zoom, when circling), the bumpers change gear, and Y (top button) starts and stops flying yourself
  const padHeld: boolean[] = [];
  function readPad() {
    const gp = (navigator.getGamepads?.() ?? []).find((g) => g && g.connected);
    if (!gp) return null;
    const dz = (v: number) => (Math.abs(v) < 0.18 ? 0 : (v - Math.sign(v) * 0.18) / 0.82);
    const btn = (i: number) => gp.buttons[i]?.pressed ?? false;
    for (const [i, act] of [[5, () => setGear(gear + 1)], [4, () => setGear(gear - 1)], [3, () => onPadFree?.()]] as const) {
      const now = btn(i);
      if (now && !padHeld[i]) act();
      padHeld[i] = now;
    }
    return { lx: dz(gp.axes[0] ?? 0), ly: dz(gp.axes[1] ?? 0), rx: dz(gp.axes[2] ?? 0), ry: dz(gp.axes[3] ?? 0), up: gp.buttons[7]?.value ?? 0, down: gp.buttons[6]?.value ?? 0 };
  }

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
  const minDistOf = (f: Focus, d: V3) => (f.radius > 0 ? f.radius + (f.flat ? f.ground?.(d) ?? 0 : Math.max(0, f.ground?.(d) ?? 0)) + Math.max(f.radius * 0.0012, 400) : 1e3);
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
  function step(dt: number, wall: number, near: { centre: V3; radius: number; ground: (dir: V3) => number; /** metres along a direction to the surface of the first body in the way (Infinity if none) */ ahead?: (dir: V3) => number }) {
    // ---- keys in orbit and cruise: turn and zoom at a steady, gentle rate
    const k = (c: string) => keys.has(c);
    const fast = k('ShiftLeft') || k('ShiftRight') ? 2.5 : 1;
    const gp = readPad();
    if (gp && (gp.rx || gp.ry) && mode !== 'cruise') { look.dx += gp.rx * 900 * wall; look.dy += gp.ry * 900 * wall; }

    if (mode === 'cruise' && cr) {
      cr.t = Math.min(cr.total, cr.t + Math.min(wall, 0.05)); // a stall pauses the trip instead of jumping it
      if (cr.t < cr.turn && cr.q0 && cr.q1) {
        // turning on the spot, slowly in and out, before going anywhere
        pos[0] = cr.p0[0]; pos[1] = cr.p0[1]; pos[2] = cr.p0[2];
        cruiseVel = [0, 0, 0];
        { const x = Math.min(1, cr.t / cr.turn); q.copy(cr.q0).slerp(cr.q1, x * x * (3 - 2 * x)); }
      } else {
        const u = cr.secs > 0 ? (cr.t - cr.turn) / cr.secs : 1;
        const at = cruiseAt(Math.min(1, Math.max(0, u)));
        const p = add(at.c, scale(at.dir, at.d));
        if (wall > 1e-4) cruiseVel = [(p[0] - pos[0]) / wall, (p[1] - pos[1]) / wall, (p[2] - pos[2]) / wall];
        pos[0] = p[0]; pos[1] = p[1]; pos[2] = p[2];
        lookAlong(scale(at.dir, -1), UP);
        if (cr.t >= cr.total || u >= 1) {
          focus = cr.to; dir = at.dir; dist = distGoal = at.d; cr = null; mode = 'orbit';
        }
      }
    } else if (mode === 'orbit') {
      // turning: a drag, the arrows, A and D
      const turnRate = 1.1 * fast * wall; // radians a second
      let az = (k('ArrowLeft') || k('KeyA') ? 1 : 0) - (k('ArrowRight') || k('KeyD') ? 1 : 0);
      let el = (k('ArrowUp') ? 1 : 0) - (k('ArrowDown') ? 1 : 0);
      az *= turnRate; el *= turnRate;
      if (look.dx || look.dy) {
        const kk = 0.0014 * lookSens;
        const daz = -look.dx * kk, del = look.dy * kk;
        az += daz; el += del;
        // what is left over after letting go: a short, soft drift (none with reduced motion)
        if (!reduced && wall > 0) spin = { az: daz / wall * 0.3, el: del / wall * 0.3 };
        look = { dx: 0, dy: 0 };
      } else if (pointers.size) {
        // finger or button still down and not moving: nothing to glide on
        spin = { az: 0, el: 0 };
      } else if (spin.az || spin.el) {
        az += spin.az * wall; el += spin.el * wall;
        // gone in about half a second at the longest, with no overshoot
        const f = Math.exp(-wall * 9);
        spin.az *= f; spin.el *= f;
        if (Math.abs(spin.az) + Math.abs(spin.el) < 0.01) spin = { az: 0, el: 0 };
      }
      if (az || el) dir = turn(dir, az, el);
      // zooming: the wheel, a pinch, W and S, + and −, Page Up and Down
      const zin = (gp ? gp.up - gp.down : 0) + (k('KeyW') || k('Equal') || k('NumpadAdd') || k('PageUp') ? 1 : 0) - (k('KeyS') || k('Minus') || k('NumpadSubtract') || k('PageDown') ? 1 : 0);
      if (zin) zoomBy *= Math.pow(0.45, zin * fast * wall);
      let lo = minDistOf(focus, dir);
      if (loCap < lo) {
        // the limit rises into place like a spring settling (starts from rest, no jump): about a second
        const w0 = 5, gap = lo - loCap;
        loVel += (gap * w0 * w0 - 2 * w0 * loVel) * wall;
        loCap += loVel * wall;
        if (lo - loCap < Math.max(1, gap * 1e-3) && loVel < 1) { loCap = Infinity; loVel = 0; } else lo = Math.min(loCap, lo);
      }
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
        lastLookAt = performance.now();
        const kk = 0.0014 * lookSens;
        rotate(norm(add(scale(upv(), 1 - ground), scale(upLocal, ground))), -look.dx * kk);
        const before = q.clone();
        rotate(right(), -look.dy * kk);
        if (ground > 0.5 && Math.abs(dot(fwd(), upLocal)) > Math.sin(THREE.MathUtils.degToRad(88))) q.copy(before);
        look = { dx: 0, dy: 0 };
      }
      // the arrows turn you, gently
      const ta = ((k('ArrowLeft') ? 1 : 0) - (k('ArrowRight') ? 1 : 0)) * 0.9 * wall;
      if (ta) lastLookAt = performance.now();
      if (ta) rotate(norm(add(scale(upv(), 1 - ground), scale(upLocal, ground))), ta);
      zoomBy = 1;
      // top speed: about your own height a second; a gear multiplies it in open space and fades out near a body
      const boost = fast > 1 ? 4 : 1;
      // the room you have is to the floor you may not go below (see the floor below), not to the bare surface
      const floorGap = Math.max(1.7, near.radius * 3e-7);
      const roomAhead = near.ahead ? (d: V3) => Math.max(0, near.ahead!(d) - floorGap) : undefined;
      const h = clamp(alt, 2, 1e27);
      const open = smooth(near.radius * 0.5, near.radius * 3, dNear - near.radius);
      // gear 0 is your height a second; a gear lets the speed grow faster, up to a top speed, and fades out near a body
      const rate = gear === 0 ? 0.9 * speedMul : 0.9 + (RATES[gear - 1] - 0.9) * open;
      // what gear 0 gives: your height a second, but measured to whatever is in the way in the direction you are heading (so a far Sun does not make you fast near a planet)
      const localAt = (dir: V3) => { const room = roomAhead ? roomAhead(dir) : Infinity; return Math.min(h, Math.max(room, 0.05 * h)) * 0.9 * speedMul * boost; };
      // never faster than lets you ease up to what is in the way: the speed falls off as the body nears, so you arrive gently, not through it
      const eased = (dir: V3, v: number) => { if (!roomAhead) return v; return Math.min(v, Math.max(roomAhead(dir) / (gear === 0 ? 1 : BRAKES[gear - 1]), localAt(dir))); };
      const base = gear === 0 ? h * 0.9 * speedMul * boost : Math.min(h * rate * boost, TOPS[gear - 1]);
      const f = clamp((k('KeyW') || k('ArrowUp') ? 1 : 0) - (k('KeyS') || k('ArrowDown') ? 1 : 0) + pad - (gp?.ly ?? 0), -1, 1);
      const s = clamp((k('KeyD') ? 1 : 0) - (k('KeyA') ? 1 : 0) + (gp?.lx ?? 0), -1, 1);
      const u = clamp((k('Space') || k('KeyE') ? 1 : 0) - (k('KeyC') || k('KeyQ') ? 1 : 0) + (gp ? gp.up - gp.down : 0), -1, 1);
      const dirWant = add(add(scale(fwd(), f), scale(right(), s)), scale(upLocal, u));
      const calming = calm !== null;
      const want = !calming && len(dirWant) > 0 ? scale(norm(dirWant), eased(norm(dirWant), base) * Math.min(1, len(dirWant))) : [0, 0, 0] as V3;
      // easing: speeding up takes a moment (longer at higher gears), letting go glides to a stop, X brakes at once
      const pushing = !calming && (f !== 0 || s !== 0 || u !== 0);
      if (stopRamp > 0) stopRamp = Math.max(0, stopRamp - wall);
      // letting go: in the walking-pace gears (local to Faster) you stop within about half a second; only the warp gears coast on
      const tau = calming ? 0.3 : k('KeyX') ? 0.08 : pushing ? 0.28 + 0.12 * gear : stopRamp > 0 ? 0.3 : gear <= 3 ? 0.11 + 0.025 * gear : 0.5 + 0.18 * gear;
      // coasting: from letting go until the speed is down to 5% of what it was then; it cannot come back on by itself
      if (pushing) { pushPeak = len(vel); coastOver = false; }
      else if (pushPeak <= 0 || calming || len(vel) <= Math.max(0.05 * pushPeak, 0.5)) coastOver = true;
      coasting = !pushing && !coastOver && gear >= 4;
      const kv = 1 - Math.exp(-dt / tau);
      vel[0] += (want[0] - vel[0]) * kv; vel[1] += (want[1] - vel[1]) * kv; vel[2] += (want[2] - vel[2]) * kv;
      // momentum too: the speed you already have is held to the same rule, so a long glide cannot carry you into a body
      // it comes down over about a tenth of a second (not in one frame), faster only as the surface gets close, and never so slowly that the surface is under a tenth of a second (or three frames) away
      { const sp = len(vel); if (sp > 0) { const nv = norm(vel); const cap = eased(nv, sp); if (cap < sp) { const room = roomAhead ? roomAhead(nv) : Infinity; const tts = room / sp; const hard = room / Math.max(0.1, 3 * dt); const tau2 = clamp(0.3 * tts, 0.02, 0.12); const soft = cap + (sp - cap) * Math.exp(-dt / tau2); const to = Math.min(soft, Math.max(hard, cap)); const c = Math.min(sp, to) / sp; vel[0] *= c; vel[1] *= c; vel[2] *= c; } } }
      pos[0] += vel[0] * dt; pos[1] += vel[1] * dt; pos[2] += vel[2] * dt;

      // never below the ground
      const rel2 = sub(pos, near.centre);
      const up2 = norm(rel2);
      // 1.7 m, but not less than the finest step the graphics card can place a surface on a big world (single precision): about 3e-7 of the radius
      const target = near.radius + near.ground(up2) + floorGap;
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
      // Esc in free flight: once you have nearly stopped (or a few seconds have passed), settle into circling
      if (calm) {
        calm.t += wall;
        if (len(vel) < 0.004 * Math.max(h, 2) + 0.2 || calm.t > 4) {
          const f2 = calm.f; calm = null;
          // close to the ground, Esc is just a stop: circling would lift you out to the orbit limit
          const gap = minDistOf(f2, upLocal) - (near.radius + near.ground(upLocal));
          if (alt >= 3 * gap) enterOrbit(f2);
        }
      }
      // level the horizon: take out any roll at a slow, constant rate (never a per-frame chase), only when near a body and only after a moment of calm
      if (ground > 0.01 && performance.now() - lastLookAt > 500) {
        const fw = fwd();
        const want2 = cross(fw, upLocal);
        if (len(want2) > 0.05) {
          const wr = norm(want2);
          const r = right();
          const ang = Math.atan2(dot(cross(r, wr), fw), dot(r, wr));
          const calmFor = clamp((performance.now() - lastLookAt - 500) / 600, 0, 1); // eases in over 0.6 s
          const maxStep = THREE.MathUtils.degToRad(8) * calmFor * calmFor * dt;
          rotate(fw, clamp(ang, -maxStep, maxStep) * ground);
        }
      }
    } else {
      vel[0] = vel[1] = vel[2] = 0;
      coasting = false;
    }

    // soften any jump of view left by a change of mode
    if (blendFrom) {
      blendT += wall / (reduced ? 0.25 : 0.6);
      if (blendT >= 1) blendFrom = null;
      else { const target = q.clone(); q.copy(blendFrom).slerp(target, smooth(0, 1, blendT)); }
    }

    return { alt, mode, coasting, speed: len(vel), arriving: cr ? cr.t / Math.max(cr.total, 1e-6) : 1, secsLeft: cr ? Math.max(0, cr.total - cr.t) : 0 };
  }

  function enterOrbit(f: Focus) {
    startBlend();
    focus = f; calm = null;
    const r = sub(pos, f.centre());
    // below the orbit limit (a skim over the ground): start where you are and let the limit rise under you
    const lim = minDistOf(f, norm(r));
    loCap = len(r) < lim ? len(r) : Infinity; loVel = 0;
    dist = distGoal = len(r);
    dir = clampEl(norm(r));
    mode = 'orbit';
  }

  return {
    pos, q, step,
    get mode() { return mode; },
    get speedMul() { return speedMul; },
    get gear() { return gear; },
    setGear,
    onGear(cb: (g: number) => void) { onGear = cb; },
    onPadFree(cb: () => void) { onPadFree = cb; },
    onWheelIn(cb: (x: number, y: number, amount: number) => void) { onWheelIn = cb; },
    get focus() { return focus; },
    /** where a trip in progress is going, or the focus */
    get target() { return cr ? cr.to : focus; },
    get dist() { return dist; },
    setPad(v: number) { pad = v; },
    setReduced(v: boolean) { reduced = v; if (v) spin = { az: 0, el: 0 }; },
    /** the look slider: 0.25 to 3, 1 is the default */
    setLookSens(v: number) { lookSens = clamp(v, 0.25, 3); },
    onTap(cb: (x: number, y: number) => void) { onTap = cb; },
    /** + and − on screen: one press is a factor of about 2.5 */
    zoom(steps: number) { zoomBy *= Math.pow(0.4, steps); },
    /** look at a focus from a side and distance at once, without moving there */
    orbitAt(f: Focus, d: number, side: V3, hold = false) {
      focus = f; loCap = Infinity; calm = null; dir = clampEl(norm(side)); dist = distGoal = d; cr = null; mode = hold ? 'idle' : 'orbit';
      const p = add(f.centre(), scale(dir, d));
      pos[0] = p[0]; pos[1] = p[1]; pos[2] = p[2];
      lookAlong(scale(dir, -1), UP);
    },
    /** go to a new focus: slide and zoom, keeping the view's direction unless told otherwise */
    startCruise(c: Cruise) {
      if (mode === 'free') startBlend();
      loCap = Infinity; calm = null;
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
      const secs = c.secs >= 0 ? c.secs : clamp(2.4 + 0.45 * decades, 2.4, 9);
      // face the way you are going before you go: a quick, eased turn on the spot, never turning and travelling at once
      let turn = 0, q0: THREE.Quaternion | null = null, q1: THREE.Quaternion | null = null;
      let cs = c0, ds = dir0;
      const toT = sub(c.to.centre(), pos);
      if (c.secs !== 0 && !reduced && len(toT) > 1) {
        const vT = norm(toT);
        const ang = Math.acos(clamp(dot(fwd(), vT), -1, 1));
        if (ang > THREE.MathUtils.degToRad(12)) {
          turn = clamp(ang / THREE.MathUtils.degToRad(40), 0.6, 4); // about 40 degrees a second on average, 60 at the peak
          q0 = q.clone();
          // the trip itself then runs from straight ahead, so the way in is a straight line to the target
          // (kept off the poles, so "up" still means something when the trip ends)
          ds = clampEl(scale(vT, -1));
          cs = sub(pos, scale(ds, d0));
          const m = new THREE.Matrix4().lookAt(new THREE.Vector3(0, 0, 0), new THREE.Vector3(...scale(ds, -1)), new THREE.Vector3(...UP));
          q1 = new THREE.Quaternion().setFromRotationMatrix(m);
        }
      }
      // while travelling, swing toward the wanted side of the target no faster than about 5 degrees a second (the rest is left as it is on arrival)
      let dirEnd = c.endDir ? dir1 : ds;
      if (turn > 0 && c.endDir) {
        const swing = Math.acos(clamp(dot(ds, dir1), -1, 1)), maxSwing = THREE.MathUtils.degToRad(5) * secs;
        if (swing > maxSwing) { const k2 = maxSwing / swing; dirEnd = clampEl(norm(add(scale(ds, 1 - k2), scale(dir1, k2)))); }
        else dirEnd = dir1;
      }
      cr = { from, to: c.to, c0: cs, d0, d1, dir0: ds, dir1: dirEnd, hump, secs, turn, total: turn + secs, p0: [pos[0], pos[1], pos[2]], q0, q1, t: 0 };
      mode = 'cruise';
    },
    skipCruise() { if (mode === 'cruise' && cr) cr.t = Math.max(cr.t, cr.total - 0.6); },
    /** brake at once: a trip in progress ends where the camera is, and you are flying free with no speed */
    stop() { if (mode === 'cruise') { cr = null; mode = 'free'; vel[0] = cruiseVel[0]; vel[1] = cruiseVel[1]; vel[2] = cruiseVel[2]; stopRamp = 1; } },
    /** fly yourself from where you are */
    setFree() { if (mode === 'cruise') return; if (mode !== 'free') vel[0] = vel[1] = vel[2] = 0; mode = 'free'; calm = null; },
    /** Esc in free flight: ease to a halt over a second or so, then circle `f` */
    calmTo(f: Focus) { if (mode === 'free') calm = { f, t: 0 }; },
    /** back to orbiting a focus, from wherever free flight left you */
    backToOrbit(f: Focus) { enterOrbit(f); },
    /** the trip so far, 0 to 1, and how long it lasts */
    get cruise() { return cr ? { u: cr.t / Math.max(cr.total, 1e-6), secs: cr.total } : null; },
  };
}

export type Flight = ReturnType<typeof createFlight>;
