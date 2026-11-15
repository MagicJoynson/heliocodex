/**
 * Pictures for the lesson "The cosmic web", one to each step of its first look. All are drawings of the idea,
 * with the galaxies placed at random and not to scale. They state no figures beyond the lesson's: the Local
 * Group has more than 50 galaxies, clusters hold hundreds or thousands, and the web is clusters joined by
 * threads of galaxies round enormous voids.
 */
import { type Scene, SOFT, ACCENT, FAINT, clamp, ease, label, stars, rng } from '../stage';
import { TAU, dot, line } from '../kit';

const backdrop = stars(70, 5151);
const room = (w: number) => (w > 760 ? w * 0.34 : 0);

// a clumpy arrangement of galaxies: nodes joined by threads, with empty voids between
const NODES: [number, number][] = [[0.12, 0.2], [0.35, 0.12], [0.62, 0.22], [0.88, 0.15], [0.2, 0.5], [0.45, 0.45], [0.72, 0.55], [0.1, 0.82], [0.38, 0.8], [0.6, 0.88], [0.9, 0.82]];
const LINKS: [number, number][] = [[0, 1], [1, 2], [2, 3], [0, 4], [1, 5], [2, 6], [3, 6], [4, 5], [5, 6], [4, 7], [5, 8], [6, 10], [7, 8], [8, 9], [9, 10], [5, 2]];
type G = { x: number; y: number; ux: number; uy: number; b: number };
const FIELD: G[] = (() => {
  const r = rng(61), out: G[] = [];
  for (let i = 0; i < 330; i++) {
    const kind = r(); let x: number, y: number;
    if (kind < 0.45) { const n = NODES[Math.floor(r() * NODES.length)], a = r() * TAU, d = Math.pow(r(), 1.6) * 0.07; x = n[0] + Math.cos(a) * d; y = n[1] + Math.sin(a) * d; }
    else { const l = LINKS[Math.floor(r() * LINKS.length)], f = r(), a = NODES[l[0]], b = NODES[l[1]]; x = a[0] + (b[0] - a[0]) * f + (r() - 0.5) * 0.025; y = a[1] + (b[1] - a[1]) * f + (r() - 0.5) * 0.025; }
    out.push({ x, y, ux: r(), uy: r(), b: r() });
  }
  return out;
})();

// ---- 1. not sprinkled evenly (the hero): an even scatter gathers into a web
export const lens: Scene = {
  caption: 'Galaxies, each drawn as a dot, a drawing of the idea. You might expect them sprinkled evenly through space, like dust in a sunbeam. They are not: they gather into clusters joined by threads, with empty space between.',
  stillAt: 9,
  draw({ ctx, w, h, t, say }) {
    backdrop(ctx, w, h, 0.1);
    const rx = room(w), x0 = rx + (w - rx) * 0.08, W = (w - rx) * 0.84, y0 = h * (rx ? 0.12 : 0.06), H = h * (rx ? 0.5 : 0.36), u = (t % 16) / 16, k = ease(clamp((u - 0.2) / 0.5, 0, 1)), fade = 1 - ease(clamp((u - 0.94) / 0.06, 0, 1));
    ctx.globalAlpha = fade;
    for (const g of FIELD) dot(ctx, x0 + ((1 - k) * g.ux + k * g.x) * W, y0 + ((1 - k) * g.uy + k * g.y) * H, 0.8 + g.b * 1.1, `rgba(215,225,255,${0.35 + g.b * 0.55})`);
    ctx.globalAlpha = 1;
    label(ctx, k < 0.5 ? 'What you might expect: even' : 'What is there: clumps and threads', x0 + W / 2, y0 + H + 26, { align: 'center', colour: ACCENT, size: 10 });
    say('Galaxies are not sprinkled evenly', 'They gather into clumps and threads');
  },
};

// ---- 2. galaxies keep company: the Local Group and a cluster
const GROUP = (() => { const r = rng(5); return Array.from({ length: 16 }, () => ({ a: r() * TAU, d: Math.pow(r(), 0.8) * 0.9 })); })();
const CLUSTER = (() => { const r = rng(9); return Array.from({ length: 180 }, () => ({ a: r() * TAU, d: Math.pow(r(), 1.4) * 0.95, b: r() })); })();
const company: Scene = {
  caption: 'Galaxies keep company, a drawing of the idea and not to scale. Ours, the Milky Way, lives in a small gathering of more than 50 called the Local Group. Bigger gatherings, called clusters, hold hundreds or thousands of galaxies each.',
  stillAt: 4,
  draw({ ctx, w, h, say }) {
    backdrop(ctx, w, h, 0.1);
    const narrow = w < 520, R = Math.min(w * (narrow ? 0.2 : 0.14), h * 0.17), gx = narrow ? w * 0.3 : w * 0.28, gy = h * 0.2, cx = narrow ? w * 0.7 : w * 0.7, cy = narrow ? h * 0.2 : h * 0.2;
    for (const p of GROUP) dot(ctx, gx + Math.cos(p.a) * p.d * R * 0.8, gy + Math.sin(p.a) * p.d * R * 0.8, 2.2, 'rgba(215,225,255,.85)');
    dot(ctx, gx, gy, 3.4, '#ffe7a8');
    label(ctx, 'A small gathering', gx, gy + R + 26, { align: 'center', colour: SOFT, size: 10 }); label(ctx, 'Our Local Group', gx, gy + R + 44, { align: 'center', colour: ACCENT, size: 10 });
    for (const p of CLUSTER) dot(ctx, cx + Math.cos(p.a) * p.d * R * 1.2, cy + Math.sin(p.a) * p.d * R * 1.2, 0.8 + p.b, `rgba(215,225,255,${0.4 + p.b * 0.5})`);
    label(ctx, 'A cluster', cx, cy + R * 1.2 + 26, { align: 'center', colour: SOFT, size: 10 }); label(ctx, 'Hundreds or thousands', cx, cy + R * 1.2 + 44, { align: 'center', colour: ACCENT, size: 10 });
    say('Galaxies keep company', 'The Local Group has more than 50; clusters hold hundreds or thousands');
  },
};

// ---- 3. the web: clusters, threads and voids
const web: Scene = {
  caption: 'The cosmic web, a drawing of the idea and not to scale. Step back far enough and the clusters are joined by long threads of galaxies, with enormous empty spaces called voids between them.',
  stillAt: 5,
  draw({ ctx, w, h, t, say }) {
    backdrop(ctx, w, h, 0.08);
    const x0 = w * 0.08, W = w * 0.84, y0 = h * 0.06, H = h * 0.5, k = ease(clamp(t / 3, 0, 1));
    for (const [i, j] of LINKS) line(ctx, [x0 + NODES[i][0] * W, y0 + NODES[i][1] * H, x0 + NODES[j][0] * W, y0 + NODES[j][1] * H], `rgba(150,180,230,${0.2 * k})`);
    for (const g of FIELD) dot(ctx, x0 + g.x * W, y0 + g.y * H, 0.8 + g.b, `rgba(215,225,255,${0.35 + g.b * 0.5})`);
    label(ctx, 'Void', x0 + W * 0.27, y0 + H * 0.3, { align: 'center', colour: FAINT, size: 9 }); label(ctx, 'Void', x0 + W * 0.78, y0 + H * 0.36, { align: 'center', colour: FAINT, size: 9 });
    label(ctx, 'Clusters joined by threads, round empty voids', x0 + W / 2, y0 + H + 26, { align: 'center', colour: ACCENT, size: 10 });
    say('Step back and a pattern appears', 'Clusters, threads and voids: the cosmic web');
  },
};

// ---- 4. gravity made it: a slightly uneven start grows into knots, threads and holes
const gravity: Scene = {
  caption: 'How gravity makes the web, a drawing of the idea and enormously speeded up. Wherever there was slightly more matter to begin with, more was pulled in, and the places that started slightly emptier were drained. Over billions of years the difference grew into knots, threads and holes.',
  stillAt: 12,
  draw({ ctx, w, h, t, say }) {
    backdrop(ctx, w, h, 0.08);
    const x0 = w * 0.08, W = w * 0.84, y0 = h * 0.06, H = h * 0.5, u = (t % 20) / 20, k = ease(clamp(u / 0.75, 0, 1)), fade = 1 - ease(clamp((u - 0.94) / 0.06, 0, 1));
    ctx.globalAlpha = fade;
    for (const g of FIELD) { const sx = 0.75 * g.ux + 0.25 * g.x, sy = 0.75 * g.uy + 0.25 * g.y; dot(ctx, x0 + ((1 - k) * sx + k * g.x) * W, y0 + ((1 - k) * sy + k * g.y) * H, 0.8 + g.b, `rgba(215,225,255,${0.35 + g.b * 0.5})`); }
    ctx.globalAlpha = 1;
    label(ctx, 'Over time: knots, threads and holes', x0 + W / 2, y0 + H + 26, { align: 'center', colour: ACCENT, size: 10 });
    say('Gravity made it', 'Slightly more matter pulled in more, and the emptier places were drained');
  },
};

// ---- 5. a wedge of the sky: only part of it was ever surveyed
const wedge: Scene = {
  caption: 'Why the 3D view is only a wedge, a drawing of the idea and not to scale. We sit at the point. The survey measured galaxies only in some directions, so most of the sky is blank. Where there is a gap, the survey either did not look there or found nothing bright enough to record.',
  stillAt: 4,
  draw({ ctx, w, h, say }) {
    backdrop(ctx, w, h, 0.08);
    const ox = w / 2, oy = h * 0.04, L = Math.min(h * 0.5, w * 0.5), a0 = Math.PI / 2 - 0.5, a1 = Math.PI / 2 + 0.5;
    ctx.strokeStyle = 'rgba(236,231,220,.25)'; ctx.setLineDash([4, 5]); ctx.beginPath(); ctx.arc(ox, oy, L, 0, Math.PI); ctx.stroke(); ctx.setLineDash([]);
    line(ctx, [ox, oy, ox + Math.cos(a0) * L, oy + Math.sin(a0) * L], 'rgba(236,231,220,.4)'); line(ctx, [ox, oy, ox + Math.cos(a1) * L, oy + Math.sin(a1) * L], 'rgba(236,231,220,.4)');
    const r = rng(83); for (let i = 0; i < 260; i++) { const a = a0 + r() * (a1 - a0), d = 0.1 + Math.pow(r(), 0.6) * 0.88; dot(ctx, ox + Math.cos(a) * d * L, oy + Math.sin(a) * d * L, 0.8 + r(), 'rgba(215,225,255,.8)'); }
    dot(ctx, ox, oy, 3, '#ffe7a8'); label(ctx, 'Us', ox + 16, oy + 12, { align: 'left', colour: SOFT, size: 10 });
    label(ctx, 'Surveyed', ox, oy + L * 0.55, { align: 'center', colour: ACCENT, size: 10 });
    label(ctx, 'Never surveyed', ox - L * 0.8, oy + L * 0.5, { align: w < 520 ? 'left' : 'center', colour: FAINT, size: 9 });
    label(ctx, 'Never surveyed', ox + L * 0.8, oy + L * 0.5, { align: w < 520 ? 'right' : 'center', colour: FAINT, size: 9 });
    say('The 3D view is a wedge of the whole', 'A large part of the sky was never surveyed');
  },
};

// one picture to each step of the first look (five steps; a photograph shares the step of the paragraph after it)
export const scenes: Scene[] = [lens, company, web, gravity, wedge];
