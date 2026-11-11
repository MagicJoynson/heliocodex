/**
 * Pictures for the lesson "What an orbit is". The cannon stands 300 km up, above nearly all the
 * air, and every ball follows Newton's law of gravity with the Earth and the paths to scale. At
 * that height a ball needs 7.73 km/s (27,800 km/h) to go all the way round, and a lap takes 90 minutes.
 */
import { type Scene, INK, SOFT, ACCENT, label, stars, nf } from '../stage';
import { TAU, photoScene, globe, sun, dot, ring, line } from '../kit';

const backdrop = stars(130, 23);
const R = 6371, GM = 398_600, UP = 300, STEP = 4;               // km, km³/s², km, seconds
const ROUND = Math.sqrt(GM / (R + UP));                         // 7.73 km/s
/** The path of a ball fired level from the cannon, as x, y pairs in km from the Earth's centre. */
function shot(speed: number): { pts: number[]; lands: boolean; seconds: number } {
  let x = 0, y = R + UP, vx = speed, vy = 0; const pts = [x, y];
  for (let i = 0; i < 1500; i++) {
    const r3 = Math.pow(x * x + y * y, 1.5);
    vx -= (GM * x / r3) * STEP; vy -= (GM * y / r3) * STEP; x += vx * STEP; y += vy * STEP;
    pts.push(x, y);
    if (x * x + y * y < R * R) return { pts, lands: true, seconds: i * STEP };
    if (i > 20 && x >= 0 && pts[pts.length - 4] < 0) return { pts, lands: false, seconds: i * STEP };   // back where it began
  }
  return { pts, lands: false, seconds: 1500 * STEP };
}
const SHOTS = [2, 4, 6, 7, ROUND].map((v) => ({ v, ...shot(v) }));

function world(ctx: CanvasRenderingContext2D, cx: number, cy: number, k: number): void {
  const air = ctx.createRadialGradient(cx, cy, R * k * 0.98, cx, cy, R * k * 1.05);
  air.addColorStop(0, 'rgba(120,160,220,.3)'); air.addColorStop(1, 'rgba(120,160,220,0)');
  ctx.fillStyle = air; ctx.beginPath(); ctx.arc(cx, cy, R * k * 1.05, 0, TAU); ctx.fill();
  globe(ctx, cx, cy, R * k);
  // the mountain and its cannon
  line(ctx, [cx - 3, cy - R * k, cx, cy - (R + UP) * k, cx + 3, cy - R * k], 'rgba(236,231,220,.7)', 1.2);
}
/** Draw one shot up to `seconds` after firing. Returns where the ball is, or null once it has landed. */
function fly(ctx: CanvasRenderingContext2D, cx: number, cy: number, k: number, s: (typeof SHOTS)[number], seconds: number, colour: string): [number, number] | null {
  const n = Math.min(Math.floor(seconds / STEP), s.pts.length / 2 - 1);
  ctx.strokeStyle = colour; ctx.lineWidth = 1.1; ctx.beginPath();
  for (let i = 0; i <= n; i++) { const x = cx + s.pts[i * 2] * k, y = cy - s.pts[i * 2 + 1] * k; if (i) ctx.lineTo(x, y); else ctx.moveTo(x, y); }
  ctx.stroke();
  if (s.lands && seconds >= s.seconds) return null;
  return [cx + s.pts[n * 2] * k, cy - s.pts[n * 2 + 1] * k];
}

export const lens: Scene = {
  caption: 'Newton\'s cannon: balls fired level from 300 km up at 2, 4, 6, 7 and 7.73 km/s, following his law of gravity. The Earth and the paths are to scale. Only the last ball never comes down.',
  stillAt: 14,
  draw({ ctx, w, h, t }) {
    backdrop(ctx, w, h, 0.7);
    const wide = w > 760, cx = w * (wide ? 0.66 : 0.5), cy = h * (wide ? 0.46 : 0.33), k = (Math.min(w, h) * (wide ? 0.27 : 0.2)) / R, clock = (t % 26) * 240;
    world(ctx, cx, cy, k);
    if (t * 240 > SHOTS[4].seconds) ring(ctx, cx, cy, (R + UP) * k, 'rgba(233,196,138,.3)');
    SHOTS.forEach((s, i) => {
      const at = fly(ctx, cx, cy, k, s, i === 4 ? (t * 240) % s.seconds : clock, i === 4 ? 'rgba(233,196,138,.8)' : 'rgba(236,231,220,.4)');
      if (at) dot(ctx, at[0], at[1], 2.6, i === 4 ? ACCENT : INK);
    });
  },
};

// ---- 1. throw a ball
const THROWS = [10, 20, 30];                                    // metres a second, thrown at 45 degrees
const throwScene: Scene = {
  caption: 'A ball thrown at 10, 20 and 30 metres a second, in real time, with the air left out. Twice the speed carries it four times as far.',
  stillAt: 3.6,
  draw({ ctx, w, h, t, say }) {
    const x0 = w * 0.08, ground = h * 0.8, pxPerM = (w * 0.86) / 96, g = 9.81, tt = t % 6.4;
    line(ctx, [x0 - 10, ground, w * 0.97, ground], 'rgba(236,231,220,.35)');
    THROWS.forEach((v, i) => {
      const vx = v * Math.SQRT1_2, air = (2 * vx) / g, at = Math.min(tt, air), far = vx * air;
      ctx.strokeStyle = i === 2 ? 'rgba(233,196,138,.75)' : 'rgba(236,231,220,.4)'; ctx.lineWidth = 1.1; ctx.beginPath();
      for (let s = 0; s <= at + 0.001; s += 0.03) { const x = x0 + vx * s * pxPerM, y = ground - (vx * s - 0.5 * g * s * s) * pxPerM; if (s) ctx.lineTo(x, y); else ctx.moveTo(x, y); }
      ctx.stroke();
      dot(ctx, x0 + vx * at * pxPerM, ground - Math.max(vx * at - 0.5 * g * at * at, 0) * pxPerM, 3.2, i === 2 ? ACCENT : INK);
      if (tt >= air) label(ctx, `${nf(far)} m`, x0 + far * pxPerM, ground + 16, { align: 'center', colour: i === 2 ? ACCENT : SOFT });
    });
    say('Thrown at 36, 72 and 108 km/h', 'Harder throws land further away, but they all land');
  },
};

// ---- 2. the cannon on the mountain
const cannonScene: Scene = {
  caption: 'Balls fired level from 300 km up at 2, 4, 6 and 7 km/s, following Newton\'s law of gravity. The Earth, the height and the paths are to scale. Time is speeded up 240 times.',
  stillAt: 11,
  draw({ ctx, w, h, t, say }) {
    backdrop(ctx, w, h, 0.5);
    const cx = w / 2, cy = h * 0.52, k = (Math.min(w, h) * 0.36) / R, each = 4.2, turn = Math.floor((t % (each * 4)) / each), since = (t % each) * 1100;
    world(ctx, cx, cy, k);
    for (let i = 0; i < 4; i++) {
      if (i > turn) break;
      const s = SHOTS[i], at = fly(ctx, cx, cy, k, s, i < turn ? 1e9 : since, i === turn ? 'rgba(233,196,138,.85)' : 'rgba(236,231,220,.3)');
      if (at) dot(ctx, at[0], at[1], 3, ACCENT);
    }
    const s = SHOTS[turn], end = s.pts.length - 2, round = Math.atan2(s.pts[end], s.pts[end + 1]) * R;
    say(`Fired at ${s.v} km/s: ${nf(s.v * 3600)} km/h`, `Lands ${nf(Math.round(round / 100) * 100)} km round the world`);
  },
};

// ---- 3. all the way round
const orbitScene: Scene = {
  caption: 'The same cannon fired at 7.73 km/s. The ball falls the whole time, and the ground curves away beneath it just as fast. Newton\'s law of gravity, to scale, speeded up 500 times.',
  stillAt: 5,
  draw({ ctx, w, h, t, say }) {
    backdrop(ctx, w, h, 0.5);
    const cx = w / 2, cy = h * 0.52, k = (Math.min(w, h) * 0.36) / R, s = SHOTS[4], secs = (t * 500) % s.seconds, lap = Math.floor((t * 500) / s.seconds);
    world(ctx, cx, cy, k);
    if (lap > 0) ring(ctx, cx, cy, (R + UP) * k, 'rgba(233,196,138,.3)');
    const at = fly(ctx, cx, cy, k, s, secs, 'rgba(233,196,138,.85)')!;
    // where it would go with no gravity: straight on
    const n = Math.floor(secs / STEP), dx = s.pts[n * 2 + 2] - s.pts[n * 2], dy = s.pts[n * 2 + 3] - s.pts[n * 2 + 1], len = Math.hypot(dx, dy) || 1;
    line(ctx, [at[0], at[1], at[0] + (dx / len) * 54, at[1] - (dy / len) * 54], 'rgba(236,231,220,.4)', 1, [2, 4]);
    dot(ctx, at[0], at[1], 3.2, ACCENT);
    say(`${nf(Math.round(ROUND * 36) * 100)} km/h, always falling, never landing`, `Lap ${lap + 1}: ${nf(secs / 60)} of ${nf(s.seconds / 60)} minutes`);
  },
};

// ---- 4. a real one
const station = photoScene({
  src: '/img/learn/iss-over-earth.jpg',
  caption: 'A real photograph: the International Space Station over the Earth, taken from the Space Shuttle Atlantis on 23 May 2010. Credit: NASA.',
  say: ['The station falls round the Earth at 27,600 km/h', 'One lap every 93 minutes, 400 km up'],
  cover: true, zoom: [1, 1.1],
});

// ---- 5. the Moon, and the Earth
const moonScene: Scene = {
  caption: 'The Moon falling round the Earth while the Earth falls round the Sun. Speeds are the measured averages. Sizes and distances are not to scale, and the Moon really makes about 13 laps for each lap of the Earth.',
  stillAt: 3,
  draw({ ctx, w, h, t, say }) {
    backdrop(ctx, w, h, 0.6);
    const s = Math.min(w, h), cx = w / 2, cy = h * 0.5, big = s * 0.36, small = s * 0.085, a = -t * 0.16, b = a * 13.37;
    ring(ctx, cx, cy, big, 'rgba(236,231,220,.16)');
    sun(ctx, cx, cy, s * 0.045);
    const ex = cx + Math.cos(a) * big, ey = cy + Math.sin(a) * big;
    ring(ctx, ex, ey, small, 'rgba(236,231,220,.16)');
    globe(ctx, ex, ey, 5.5);
    const mx = ex + Math.cos(b) * small, my = ey + Math.sin(b) * small;
    globe(ctx, mx, my, 2.4, '200,198,190', '70,70,72');
    label(ctx, 'Earth', ex + 10, ey + 12, { colour: SOFT }); label(ctx, 'Sun', cx, cy + s * 0.045 + 24, { align: 'center' });
    say('The Moon falls round the Earth at 3,680 km/h', 'The Earth falls round the Sun at 107,000 km/h');
  },
};

export const scenes: Scene[] = [throwScene, cannonScene, orbitScene, station, moonScene];
