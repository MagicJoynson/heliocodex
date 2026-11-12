/**
 * Pictures for the lesson "How big is the universe?". The map of the oldest light and the Hubble
 * photograph are real. The four drawings are diagrams and none is to scale: they show ideas
 * (a limit to sight, stretching space, another observer, the unknown beyond), not measured places.
 */
import { type Scene, SOFT, ACCENT, clamp, ease, mix, label, rng } from '../stage';
import { TAU, photoScene, dot, line } from '../kit';

const CMB = 'A real map of the whole sky in microwaves, from nine years of measurements by NASA’s WMAP spacecraft. Microwaves have no colour: red was chosen for slightly warmer patches and blue for slightly cooler, and the glow of our own galaxy has been taken out. Credit: NASA/WMAP Science Team.';
const R = rng(404);
const DOTS = Array.from({ length: 900 }, () => ({ x: R() * 2 - 1, y: R() * 2 - 1, s: R() }));

function field(ctx: CanvasRenderingContext2D, cx: number, cy: number, scale: number, w: number, h: number, lit: (x: number, y: number) => number) {
  for (const d of DOTS) {
    const x = cx + d.x * scale, y = cy + d.y * scale; if (x < 0 || x > w || y < 0 || y > h * 0.86) continue;
    const a = lit(x, y); ctx.fillStyle = `rgba(236,231,220,${0.12 + a * 0.75})`; ctx.beginPath(); ctx.arc(x, y, 0.8 + d.s * 1.1, 0, TAU); ctx.fill();
  }
}
function ringAt(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, colour: string, dash = false) {
  ctx.save(); if (dash) ctx.setLineDash([5, 5]); ctx.strokeStyle = colour; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.stroke(); ctx.restore();
}

export const lens = photoScene({ src: '/img/learn/cmb-wmap-9-year.jpg', caption: CMB, say: ['', ''], hero: true, cover: true, zoom: [1.12, 1.25], focus: [0.5, 0.5] });

// ---- 1. the ball of sight
const ball: Scene = {
  caption: 'A diagram, not to scale. Each speck stands for a galaxy. Only those inside the circle are near enough for their light to have reached us in the time there has been.',
  stillAt: 6,
  draw({ ctx, w, h, t, say }) {
    const cx = w / 2, cy = h * 0.43, S = Math.max(w, h) * 0.6, Rm = Math.min(w * 0.36, h * 0.34), r = Rm * ease(clamp(t / 5, 0, 1));
    field(ctx, cx, cy, S, w, h, (x, y) => (Math.hypot(x - cx, y - cy) < r ? 1 : 0));
    ringAt(ctx, cx, cy, r, ACCENT); dot(ctx, cx, cy, 4, '#fff'); label(ctx, 'Us', cx, cy + 18, { align: 'center' });
    if (r >= Rm) { label(ctx, 'Seen', cx, cy - Rm * 0.55, { align: 'center', colour: ACCENT }); label(ctx, 'Out of sight', cx, cy + Rm + 22, { align: 'center', colour: SOFT }); }
    say('A limit to sight', 'Light from further off has not had time to arrive');
  },
};

const wall = photoScene({ src: '/img/learn/cmb-wmap-9-year.jpg', caption: CMB, say: ['The wall', 'The furthest thing that can be seen, in every direction'], zoom: [0.95, 1.05], focus: [0.5, 0.5], tag: 'Microwave map' });

// ---- 3. light crossing space that stretches
const stretch: Scene = {
  caption: 'A diagram, not to scale. Light sets out towards us while the space it crosses keeps stretching. By the time it arrives, the place it came from has been carried much further away.',
  stillAt: 9,
  draw({ ctx, w, h, t, say }) {
    const k = clamp((t % 14) / 9, 0, 1), y = h * 0.42, x0 = w * 0.1, far = mix(w * 0.3, w * 0.9, ease(k)), lx = mix(far, x0, k ** 0.8);
    const n = 9; for (let i = 0; i <= n; i++) { const x = mix(x0, far, i / n); line(ctx, [x, y - 7, x, y + 7], 'rgba(236,231,220,.35)'); }
    line(ctx, [x0, y, far, y], 'rgba(236,231,220,.5)');
    dot(ctx, x0, y, 5, '#fff'); label(ctx, 'Us', x0, y + 26, { align: 'center' });
    dot(ctx, far, y, 5, 'rgba(233,160,90,1)'); label(ctx, 'Where it came from', far, y + 26, { align: 'right', colour: SOFT });
    if (k < 1) { dot(ctx, lx, y, 3.5, ACCENT); line(ctx, [lx + 4, y, Math.min(lx + 26, far), y], ACCENT, 2); }
    label(ctx, k < 0.05 ? 'At the start: 42 million light years' : k >= 1 ? 'Now: 46 billion light years' : 'Space stretches as the light travels', w / 2, h * 0.16, { align: 'center', colour: ACCENT });
    say(k >= 1 ? 'The light arrives' : 'Light on its way', 'Its source is now far beyond where it started');
  },
};

const deep = photoScene({
  src: '/img/learn/hubble-ultra-deep-field.jpg',
  caption: 'A real photograph: the Hubble Ultra Deep Field, a patch of sky a tenth as wide as the full Moon, holding nearly 10,000 galaxies. Credit: NASA, ESA, S. Beckwith (STScI) and the HUDF Team, CC BY 4.0.',
  say: ['One small patch of sky', 'Nearly 10,000 galaxies, and every patch is like it'], cover: true, zoom: [1.05, 1.3], focus: [0.45, 0.55],
});

// ---- 5. someone else's view
const other: Scene = {
  caption: 'A diagram, not to scale. An observer in a far galaxy has a limit of sight of their own, the same size as ours and centred on them. Each can see places the other cannot.',
  stillAt: 6,
  draw({ ctx, w, h, t, say }) {
    const cy = h * 0.43, r = Math.min(w * 0.27, h * 0.33), ax = w / 2 - r * 0.62, bx = w / 2 + r * 0.62, k = ease(clamp((t - 1) / 3, 0, 1)), S = Math.max(w, h) * 0.6;
    field(ctx, w / 2, cy, S, w, h, (x, y) => Math.max(Math.hypot(x - ax, y - cy) < r ? 1 : 0, Math.hypot(x - bx, y - cy) < r * k ? 0.8 : 0));
    ringAt(ctx, ax, cy, r, ACCENT); dot(ctx, ax, cy, 4, '#fff'); label(ctx, 'Us', ax, cy + 18, { align: 'center' });
    if (k > 0) { ringAt(ctx, bx, cy, r * k, 'rgba(140,180,255,.95)', true); dot(ctx, bx, cy, 4, 'rgba(140,180,255,1)'); label(ctx, 'Them', bx, cy + 18, { align: 'center', colour: 'rgba(140,180,255,1)' }); }
    say('The same view from somewhere else', 'Every place is the centre of what can be seen from it');
  },
};

// ---- 6. the unknown beyond
const beyond: Scene = {
  caption: 'A diagram, not to scale. The circle is all that can be seen from here. The view pulls back and the galaxies go on. How far they go on is not known, so the drawing has no edge.',
  stillAt: 9,
  draw({ ctx, w, h, t, say }) {
    const cx = w / 2, cy = h * 0.43, k = ease(clamp(t / 9, 0, 1)), r = mix(Math.min(w * 0.36, h * 0.34), 9, k), S = mix(Math.max(w, h) * 0.6, Math.max(w, h) * 0.6, k);
    // more and more galaxies come into view as the circle shrinks
    for (let ring = 0; ring < 3; ring++) field(ctx, cx + (ring - 1) * S * 0.37 * k, cy + (ring - 1) * S * 0.21 * k, S * mix(1, 0.75 + ring * 0.2, k), w, h, (x, y) => (Math.hypot(x - cx, y - cy) < r ? 1 : 0.25 * k));
    ringAt(ctx, cx, cy, r, ACCENT);
    label(ctx, 'All we can see', cx, cy + r + 20, { align: 'center', colour: ACCENT });
    if (k > 0.7) label(ctx, 'How far does it go on?', cx, h * 0.1, { align: 'center', colour: SOFT });
    say('Beyond the edge of sight', 'No middle and no edge have ever been found');
  },
};

export const scenes: Scene[] = [ball, wall, stretch, deep, other, beyond];
