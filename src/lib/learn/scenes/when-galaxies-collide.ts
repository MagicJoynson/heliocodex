/**
 * Pictures for the lesson "When galaxies collide", one to each step of its first look. All are drawings of the
 * idea, with the stars placed at random, greatly speeded up and not to scale. They state no figures: two
 * galaxies pass through each other with hardly any stars touching, their shapes are bent and stretched, gas
 * clouds run together and make new stars, and in the end the two can settle into one bigger galaxy.
 */
import { type Scene, SOFT, ACCENT, clamp, ease, label, stars, rng } from '../stage';
import { TAU, dot } from '../kit';

const backdrop = stars(90, 3301);
const room = (w: number) => (w > 760 ? w * 0.34 : 0);

type P = { a: number; d: number; b: number };
const GAL = (seed: number, n: number): P[] => { const r = rng(seed); return Array.from({ length: n }, () => ({ a: r() * TAU, d: 0.08 + Math.pow(r(), 0.75) * 0.92, b: r() })); };
const A = GAL(11, 200), B = GAL(23, 160);
const GAS = (() => { const r = rng(37); return Array.from({ length: 26 }, () => ({ x: (r() - 0.5) * 1.3, y: (r() - 0.5) * 0.9, s: 0.12 + r() * 0.2 })); })();
const NEW = (() => { const r = rng(41); return Array.from({ length: 70 }, () => ({ x: (r() - 0.5) * 1.2, y: (r() - 0.5) * 0.8, at: r() })); })();

// one galaxy of stars centred on (x, y), turning slowly, its far side dragged out away from the other galaxy
const galaxy = (ctx: CanvasRenderingContext2D, pts: P[], x: number, y: number, R: number, ex: number, ey: number, pull: number, t: number, rgb: string) => {
  for (const p of pts) {
    const a = p.a + t * 0.1 / (0.3 + p.d), bx = Math.cos(a) * p.d, by = Math.sin(a) * p.d;
    const far = -(bx * ex + by * ey), s = far > 0 ? pull * far * p.d * 1.6 : 0;
    dot(ctx, x + (bx - ex * s) * R, y + (by - ey * s) * R, 0.7 + p.b * 1.1, `rgba(${rgb},${0.3 + p.b * 0.6})`);
  }
};
const pair = (ctx: CanvasRenderingContext2D, cx: number, cy: number, R: number, sep: number, pull: number, t: number, rb = 1, ra = 1) => {
  const dx = sep * R * 1.3, ax = cx - dx, bx = cx + dx, ay = cy - sep * R * 0.25, by = cy + sep * R * 0.25, L = Math.hypot(bx - ax, by - ay) || 1, ex = (bx - ax) / L, ey = (by - ay) / L;
  galaxy(ctx, A, ax, ay, R * ra, ex, ey, pull, t, '200,220,255'); galaxy(ctx, B, bx, by, R * 0.8 * rb, -ex, -ey, pull, t, '255,225,180');
};
const glow = (ctx: CanvasRenderingContext2D, x: number, y: number, r: number, rgb: string, a: number) => { const g = ctx.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, `rgba(${rgb},${a})`); g.addColorStop(1, `rgba(${rgb},0)`); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill(); };

// ---- 1. gravity pulls two galaxies together (the hero)
export const lens: Scene = {
  caption: 'Two galaxies drawn towards each other by gravity, a drawing of the idea and greatly speeded up. Each pulls on the other and their neat shapes begin to stretch. The stars are placed at random.',
  stillAt: 8,
  draw({ ctx, w, h, t, say }) {
    backdrop(ctx, w, h, 0.2);
    const rx = room(w), cx = rx + (w - rx) / 2, cy = h * (rx ? 0.4 : 0.26), R = Math.min((w - rx) * 0.15, h * (rx ? 0.14 : 0.1)), u = (t % 18) / 18, k = ease(clamp(u / 0.8, 0, 1)), fade = 1 - ease(clamp((u - 0.92) / 0.08, 0, 1));
    ctx.globalAlpha = fade; pair(ctx, cx, cy, R, 1.8 - 1.2 * k, 0.1 + 0.6 * k, t); ctx.globalAlpha = 1;
    say('Galaxies do not stay apart for ever', 'Gravity pulls them towards their neighbours');
  },
};

// ---- 2. they pass through each other
const through: Scene = {
  caption: 'Two galaxies passing through each other, a drawing of the idea and greatly speeded up. A galaxy is mostly empty space, so hardly any stars touch. What changes is the shape: each pulls the other out of true and throws long streamers of stars out to the sides.',
  stillAt: 9,
  draw({ ctx, w, h, t, say }) {
    backdrop(ctx, w, h, 0.2);
    const cx = w / 2, cy = h * 0.34, R = Math.min(w * 0.18, h * 0.2), u = (t % 20) / 20, k = ease(u), sep = 1.6 - 3.2 * k, c = Math.sin(clamp(u, 0, 1) * Math.PI);
    pair(ctx, cx, cy, R, Math.abs(sep) * Math.sign(sep || 1), 0.1 + 0.9 * c, t);
    label(ctx, 'Hardly any stars touch', cx, cy + R * 1.6 + 26, { align: 'center', colour: ACCENT, size: 10 });
    say('It is not a crash like two cars', 'The galaxies pass through, but their shapes are bent and stretched');
  },
};

// ---- 3. gas clouds collide and make stars
const gas: Scene = {
  caption: 'Where two galaxies overlap, a drawing of the idea. The clouds of gas inside them are big enough to run into each other, and when they are squeezed, huge numbers of new stars are born.',
  stillAt: 9,
  draw({ ctx, w, h, t, say }) {
    backdrop(ctx, w, h, 0.15);
    const cx = w / 2, cy = h * 0.34, R = Math.min(w * 0.2, h * 0.2), k = clamp(t / 8, 0, 1);
    pair(ctx, cx, cy, R, 0.4, 0.5, t);
    for (const g of GAS) glow(ctx, cx + g.x * R * 1.3, cy + g.y * R * 1.3, g.s * R, '230,110,130', 0.18 * Math.min(1, 0.3 + k));
    for (const n of NEW) if (n.at < k) dot(ctx, cx + n.x * R * 1.4, cy + n.y * R * 1.4, 1.3 + n.at, 'rgba(160,200,255,.95)');
    label(ctx, 'Squeezed gas: new stars', cx, cy + R * 1.5 + 26, { align: 'center', colour: ACCENT, size: 10 });
    say('The gas clouds do run into each other', 'Squeezed, they make huge numbers of new stars');
  },
};

// ---- 4. in the end, one bigger galaxy
const ring = (ctx: CanvasRenderingContext2D, pts: P[], cx: number, cy: number, R: number, k: number, t: number, rgb: string) => {
  for (const p of pts) { const a = p.a + t * 0.12 / (0.3 + p.d), d = p.d * (0.8 - 0.1 * k) + 0.5 * (1 - k) * p.d; dot(ctx, cx + Math.cos(a) * d * R * 1.4, cy + Math.sin(a) * d * R * 1.4, 0.7 + p.b * 1.1, `rgba(${rgb},${0.3 + p.b * 0.6})`); }
};
const merge: Scene = {
  caption: 'In the end, a drawing of the idea and greatly speeded up: the two settle into one bigger galaxy. The stars of the smaller one, here in gold, are still circling among the stars of the larger.',
  stillAt: 9,
  draw({ ctx, w, h, t, say }) {
    backdrop(ctx, w, h, 0.15);
    const cx = w / 2, cy = h * 0.34, R = Math.min(w * 0.2, h * 0.2), k = ease(clamp((t % 18) / 10, 0, 1));
    ring(ctx, A, cx, cy, R, 1, t, '200,220,255'); ring(ctx, B, cx, cy, R * 0.9, k, t, '255,215,150');
    label(ctx, 'One bigger galaxy', cx, cy + R * 1.4 + 26, { align: 'center', colour: ACCENT, size: 10 });
    say('In the end the two settle into one', 'Our own galaxy grew this way');
  },
};

// ---- 5. a small galaxy passes through a larger one
const flyby: Scene = {
  caption: 'A smaller galaxy passing right through a larger one, a drawing of the idea and greatly speeded up. The larger galaxy’s arms are pulled out of shape.',
  stillAt: 9,
  draw({ ctx, w, h, t, say }) {
    backdrop(ctx, w, h, 0.15);
    const cx = w / 2, cy = h * 0.34, R = Math.min(w * 0.2, h * 0.2), u = (t % 20) / 20, sep = 1.4 - 2.8 * ease(u), c = Math.sin(u * Math.PI);
    pair(ctx, cx, cy, R, sep, 0.1 + 0.8 * c, t, 0.5, 1);
    label(ctx, 'The larger galaxy is pulled out of shape', cx, cy + R * 1.7 + 26, { align: 'center', colour: ACCENT, size: 10 });
    say('A small galaxy passes through a larger one', 'Its gravity pulls the larger one’s arms out of shape');
  },
};

// one picture to each step of the first look (five steps; a photograph shares the step of the paragraph after it)
export const scenes: Scene[] = [lens, through, gas, merge, flyby];
