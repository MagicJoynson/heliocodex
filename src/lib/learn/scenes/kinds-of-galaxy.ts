/**
 * Pictures for the lesson "Kinds of galaxy", one to each step of its first look. All are drawings of the
 * idea, with the stars placed at random and not to scale. They state no figures beyond the lesson's: a
 * galaxy is an island of stars with almost nothing between, there are three main shapes, and galaxies gather
 * in groups and clusters that join into threads round huge empty spaces.
 */
import { type Scene, SOFT, ACCENT, FAINT, clamp, ease, label, stars, rng } from '../stage';
import { TAU, dot, line } from '../kit';

const backdrop = stars(90, 2207);
const room = (w: number) => (w > 760 ? w * 0.34 : 0);

type Star = { x: number; y: number; b: number };
// a face-on spiral: a bright bulge and two arms of stars
const spiral = (n: number, seed: number): Star[] => { const r = rng(seed); return Array.from({ length: n }, (_, i) => { const arm = i % 2, k = Math.pow(r(), 0.7), a = k * 5.2 + arm * Math.PI + (r() - 0.5) * 0.5 * (1.2 - k); return { x: Math.cos(a) * (0.08 + k * 0.92), y: Math.sin(a) * (0.08 + k * 0.92), b: r() }; }); };
const SPIRAL = spiral(520, 3);
const BULGE = (() => { const r = rng(9); return Array.from({ length: 90 }, () => { const a = r() * TAU, d = Math.pow(r(), 1.6) * 0.18; return { x: Math.cos(a) * d, y: Math.sin(a) * d, b: r() }; }); })();
const ELLIPSE = (() => { const r = rng(15); return Array.from({ length: 420 }, () => { const a = r() * TAU, d = Math.pow(r(), 1.3); return { x: Math.cos(a) * d, y: Math.sin(a) * d * 0.6, b: r() }; }); })();
const SCATTER = (() => { const r = rng(21); return Array.from({ length: 110 }, () => { const c = Math.floor(r() * 4), cx = [-0.35, 0.3, 0, 0.1][c], cy = [-0.1, 0.2, 0.35, -0.3][c], a = r() * TAU, d = Math.pow(r(), 0.8) * 0.4; return { x: cx + Math.cos(a) * d, y: cy + Math.sin(a) * d * 0.8, b: r() }; }); })();

const draw = (ctx: CanvasRenderingContext2D, pts: Star[], cx: number, cy: number, R: number, rot: number, rgb: string, size = 1) => {
  const c = Math.cos(rot), s = Math.sin(rot);
  for (const p of pts) dot(ctx, cx + (p.x * c - p.y * s) * R, cy + (p.x * s + p.y * c) * R, (0.7 + p.b * 1.1) * size, `rgba(${rgb},${0.3 + p.b * 0.6})`);
};
const glow = (ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, rgb: string, a: number) => { const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r); g.addColorStop(0, `rgba(${rgb},${a})`); g.addColorStop(1, `rgba(${rgb},0)`); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, r, 0, TAU); ctx.fill(); };

// ---- 1. a galaxy is an island of stars (the hero)
export const lens: Scene = {
  caption: 'A galaxy, drawn as an island of stars with almost nothing around it. A drawing of the idea, not a real galaxy: the stars are placed at random and the arms are only roughly drawn.',
  stillAt: 4,
  draw({ ctx, w, h, t, say }) {
    const rx = room(w), cx = rx + (w - rx) / 2, cy = h * (rx ? 0.46 : 0.3), R = Math.min((w - rx) * 0.34, h * (rx ? 0.24 : 0.18));
    glow(ctx, cx, cy, R * 0.4, '255,225,170', 0.5);
    draw(ctx, SPIRAL, cx, cy, R, t * 0.04, '200,220,255'); draw(ctx, BULGE, cx, cy, R, 0, '255,230,180');
    label(ctx, 'An island of stars', cx, cy + R + 28, { align: 'center', colour: ACCENT, size: 10 });
    say('A galaxy is an island of stars', 'Between galaxies there is almost nothing at all');
  },
};

// ---- 2. there are a great many
const FIELD = (() => { const r = rng(41); return Array.from({ length: 140 }, () => ({ x: r(), y: r(), s: 1 + r() * 2.4, at: r(), a: r() * 3 })); })();
const many: Scene = {
  caption: 'Galaxies, each drawn as a small smudge, a drawing of the idea. A hundred years ago nobody was sure other galaxies existed. Today we know of a great many more than could be drawn here.',
  stillAt: 8,
  draw({ ctx, w, h, t, say }) {
    backdrop(ctx, w, h, 0.15);
    const k = clamp(t / 6, 0, 1), x0 = w * 0.06, y0 = h * 0.08, W = w * 0.88, H = h * 0.52;
    for (const f of FIELD) { if (f.at > k) continue; const a = clamp((k - f.at) * 6, 0, 1); ctx.save(); ctx.translate(x0 + f.x * W, y0 + f.y * H); ctx.rotate(f.a); ctx.scale(1, 0.55); glow(ctx, 0, 0, f.s * 4, '200,215,255', 0.55 * a); ctx.restore(); }
    label(ctx, 'Each smudge is a whole galaxy of stars', w / 2, y0 + H + 28, { align: 'center', colour: ACCENT, size: 10 });
    say('Other galaxies were once in doubt', 'Today we know of a great many');
  },
};

// ---- 3. three main shapes
const shapes: Scene = {
  caption: 'The three main shapes, a drawing of the idea: spirals, ellipticals and irregulars. The stars are placed at random, and the three are not drawn to scale or the same size.',
  stillAt: 4,
  draw({ ctx, w, h, t, say }) {
    backdrop(ctx, w, h, 0.15);
    const narrow = w < 520, R = Math.min(w * (narrow ? 0.1 : 0.1), h * (narrow ? 0.1 : 0.18)), ys = narrow ? [0.15, 0.36, 0.57].map((f) => h * f) : [h * 0.3, h * 0.3, h * 0.3], xs = narrow ? [w * 0.3, w * 0.3, w * 0.3] : [w * 0.2, w * 0.5, w * 0.8];
    draw(ctx, SPIRAL, xs[0], ys[0], R, t * 0.05, '200,220,255'); draw(ctx, BULGE, xs[0], ys[0], R, 0, '255,230,180');
    draw(ctx, ELLIPSE, xs[1], ys[1], R, 0.4, '255,215,160');
    draw(ctx, SCATTER, xs[2], ys[2], R * 0.6, 0, '170,200,255');
    ['Spirals', 'Ellipticals', 'Irregulars'].forEach((n, i) => label(ctx, n, narrow ? xs[i] + R * 1.5 : xs[i], narrow ? ys[i] : ys[i] + R + 24, { align: narrow ? 'left' : 'center', colour: ACCENT, size: 10 }));
    say('Three main shapes', 'Spirals, ellipticals and irregulars');
  },
};

// ---- 4. spirals
const spirals: Scene = {
  caption: 'A spiral, seen face on, a drawing of the idea: a flat disc with bright arms winding out from the middle, like cream stirred into coffee. Turning only to show the shape.',
  stillAt: 4,
  draw({ ctx, w, h, t, say }) {
    backdrop(ctx, w, h, 0.15);
    const cx = w / 2, cy = h * 0.4, R = Math.min(w * 0.36, h * 0.3);
    glow(ctx, cx, cy, R * 0.4, '255,225,170', 0.5); draw(ctx, SPIRAL, cx, cy, R, t * 0.15, '200,220,255', 1.2); draw(ctx, BULGE, cx, cy, R, 0, '255,230,180');
    label(ctx, 'A flat disc with arms', cx, cy + R + 26, { align: 'center', colour: ACCENT, size: 10 });
    say('Spirals: flat discs with bright arms', 'Like cream stirred into coffee');
  },
};

// ---- 5. ellipticals
const ellipticals: Scene = {
  caption: 'An elliptical, a drawing of the idea: smooth, round or egg-shaped, with no arms. They are mostly old, yellow and red stars.',
  stillAt: 4,
  draw({ ctx, w, h, say }) {
    backdrop(ctx, w, h, 0.15);
    const cx = w / 2, cy = h * 0.4, R = Math.min(w * 0.36, h * 0.3);
    glow(ctx, cx, cy, R * 0.9, '255,200,140', 0.3); draw(ctx, ELLIPSE, cx, cy, R, 0.4, '255,210,150', 1.2);
    label(ctx, 'Smooth, with no arms', cx, cy + R * 0.7 + 30, { align: 'center', colour: ACCENT, size: 10 });
    say('Ellipticals: smooth and egg-shaped', 'Mostly old, yellow and red stars');
  },
};

// ---- 6. irregulars
const irregulars: Scene = {
  caption: 'An irregular, a drawing of the idea: no tidy shape at all, and most are small.',
  stillAt: 4,
  draw({ ctx, w, h, say }) {
    backdrop(ctx, w, h, 0.15);
    const cx = w / 2, cy = h * 0.4, R = Math.min(w * 0.3, h * 0.26);
    draw(ctx, SCATTER, cx, cy, R * 0.8, 0, '170,200,255', 1.3);
    label(ctx, 'No tidy shape', cx, cy + R * 0.6 + 36, { align: 'center', colour: ACCENT, size: 10 });
    say('Irregulars have no tidy shape', 'Most are small');
  },
};

// ---- 7. groups, clusters and threads
const NODES = (() => { const r = rng(77); return Array.from({ length: 16 }, () => ({ x: r(), y: r() })); })();
const web: Scene = {
  caption: 'Galaxies in groups and great clusters, a drawing of the idea and not to scale. From far enough away the clusters join up into long threads with huge empty spaces between, a little like the inside of a sponge.',
  stillAt: 6,
  draw({ ctx, w, h, t, say }) {
    backdrop(ctx, w, h, 0.1);
    const x0 = w * 0.08, y0 = h * 0.08, W = w * 0.84, H = h * 0.5, k = ease(clamp(t / 4, 0, 1)), r = rng(5);
    NODES.forEach((a, i) => NODES.forEach((b, j) => { if (j <= i || Math.hypot(a.x - b.x, a.y - b.y) > 0.34) return; line(ctx, [x0 + a.x * W, y0 + a.y * H, x0 + b.x * W, y0 + b.y * H], `rgba(160,190,230,${0.22 * k})`); }));
    NODES.forEach((n) => { for (let i = 0; i < 14; i++) { const a = r() * TAU, d = Math.pow(r(), 1.5) * 18; dot(ctx, x0 + n.x * W + Math.cos(a) * d, y0 + n.y * H + Math.sin(a) * d, 0.9 + r(), 'rgba(235,220,190,.8)'); } });
    label(ctx, 'Clusters joined by threads, with empty space between', w / 2, y0 + H + 28, { align: 'center', colour: ACCENT, size: 10 });
    say('Galaxies gather in groups and clusters', 'The clusters join up into threads round huge empty spaces');
  },
};

// one picture to each step of the first look (eight steps; a photograph shares the step of the paragraph after it)
export const scenes: Scene[] = [lens, many, shapes, spirals, ellipticals, irregulars, web, web];
