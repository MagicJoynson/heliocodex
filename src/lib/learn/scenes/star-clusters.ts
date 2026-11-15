/**
 * Pictures for the lesson "Star clusters", one to each part of its first look. The figures are the
 * lesson's: a cluster buried in its cloud for 2 to 7 million years, the Pleiades with a handful of bright
 * stars to the eye and over a thousand in all, the globular cluster M13 with several hundred thousand
 * stars. The Pleiades is about 445 light years away and M13 about 25,000. The stars, clouds and their
 * motion are drawings of the idea, with the stars placed at random.
 */
import { type Scene, SOFT, ACCENT, FAINT, clamp, ease, label, stars, rng } from '../stage';
import { TAU, dot, line } from '../kit';

const backdrop = stars(100, 913);
const room = (w: number) => (w > 760 ? w * 0.34 : 0);

// ---- 1. born together, in a cloud
const MEMBERS = (() => { const r = rng(31); return Array.from({ length: 90 }, () => ({ a: r() * TAU, d: Math.pow(r(), 0.7), b: r(), at: r() * 0.7 })); })();
export const lens: Scene = {
  caption: 'A cluster being born, a drawing of the idea. Many stars form together in one cloud of gas and dust, hidden at first. The lesson gives 2 to 7 million years for this stage, after which the cloud is blown away and the stars show. Greatly speeded up, and the stars are placed at random.',
  stillAt: 9,
  draw({ ctx, w, h, t, say }) {
    backdrop(ctx, w, h, 0.25);
    const rx = room(w), cx = rx + (w - rx) / 2, cy = h * (rx ? 0.46 : 0.3), R = Math.min((w - rx) * 0.32, h * (rx ? 0.22 : 0.18)), u = (t % 16) / 16, cloud = 1 - ease(clamp((u - 0.55) / 0.35, 0, 1));
    const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, R * 1.5); g.addColorStop(0, `rgba(120,70,60,${0.5 * cloud})`); g.addColorStop(1, 'rgba(120,70,60,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, R * 1.5, 0, TAU); ctx.fill();
    for (const m of MEMBERS) { const k = clamp((u - 0.1 - m.at * 0.4) / 0.2, 0, 1); if (!k) continue; dot(ctx, cx + Math.cos(m.a) * m.d * R, cy + Math.sin(m.a) * m.d * R, 0.8 + m.b * 1.6, `rgba(190,215,255,${(0.35 + m.b * 0.6) * k * (0.35 + 0.65 * (1 - cloud))})`); }
    label(ctx, u < 0.55 ? 'Hidden in its cloud' : 'The cloud clears', cx, cy - R * 1.5 - 12, { align: 'center', colour: ACCENT, size: 10 });
    say('Stars are not born one at a time', 'A cloud of gas makes many together, a cluster');
  },
};

// ---- 2. what the eye sees, and what is there
const PLEIADES = (() => { const r = rng(41); return Array.from({ length: 1100 }, (_, i) => { const a = r() * TAU, d = Math.sqrt(-2 * Math.log(1 - r() * 0.98)) * 0.42; return { a, d: Math.min(d, 1), b: i < 7 ? 1 : r() * 0.5 }; }); })();
const eye: Scene = {
  caption: 'The Pleiades as a drawing of the idea: the handful of bright stars the eye picks out, then the more than a thousand that are really there. The stars are placed at random and are not a map of the cluster.',
  stillAt: 8,
  draw({ ctx, w, h, t, say }) {
    backdrop(ctx, w, h, 0.2);
    const cx = w / 2, cy = h * 0.42, R = Math.min(w * 0.34, h * 0.3), f = ease(clamp(((t % 12) - 3) / 3, 0, 1));
    PLEIADES.forEach((s, i) => { const bright = i < 7; dot(ctx, cx + Math.cos(s.a) * s.d * R * (bright ? 0.7 : 1), cy + Math.sin(s.a) * s.d * R * (bright ? 0.7 : 1), bright ? 3.4 : 0.6 + s.b * 0.8, bright ? 'rgba(210,225,255,.95)' : `rgba(190,210,255,${(0.2 + s.b * 0.6) * f})`); });
    label(ctx, f < 0.5 ? 'What the eye picks out: a handful' : 'What is really there: over a thousand', cx, cy + R + 28, { align: 'center', colour: ACCENT, size: 10 });
    say('You can see a handful of stars', 'There are really more than a thousand');
  },
};

// ---- 3. a loose cluster comes apart
const LOOSE = (() => { const r = rng(53); return Array.from({ length: 120 }, () => ({ a: r() * TAU, d: Math.sqrt(r()) * 0.35, va: r() * TAU, v: 0.2 + r() * 0.9, b: r() })); })();
const loose: Scene = {
  caption: 'A loose cluster slowly coming apart, a drawing of the idea. Over time its stars wander off and mix in with all the others, as the lesson says the Sun’s birth cluster may have done long ago. Greatly speeded up.',
  stillAt: 10,
  draw({ ctx, w, h, t, say }) {
    backdrop(ctx, w, h, 0.2);
    const cx = w / 2, cy = h * 0.42, R = Math.min(w * 0.4, h * 0.34), k = ease(clamp(((t % 18) - 1) / 14, 0, 1));
    for (const s of LOOSE) dot(ctx, cx + (Math.cos(s.a) * s.d + Math.cos(s.va) * s.v * k) * R, cy + (Math.sin(s.a) * s.d + Math.sin(s.va) * s.v * k) * R * 0.8, 0.9 + s.b * 1.4, `rgba(200,220,255,${0.4 + s.b * 0.5})`);
    label(ctx, k < 0.3 ? 'A loose cluster' : 'Its stars wander off', cx, cy + R + 22, { align: 'center', colour: ACCENT, size: 10 });
    say('Loose clusters come apart', 'The stars wander off and mix with all the others');
  },
};

// ---- 4. a globular cluster holds together
const BALL = (() => { const r = rng(67); return Array.from({ length: 900 }, () => ({ a: r() * TAU, d: Math.pow(r(), 1.9), b: r() })); })();
const ball: Scene = {
  caption: 'A globular cluster, a drawing of the idea: a ball of many thousands of stars, sometimes millions, packed so close that the middle is one solid blaze. The stars are placed at random; the real thing has far more.',
  stillAt: 4,
  draw({ ctx, w, h, t, say }) {
    backdrop(ctx, w, h, 0.2);
    const cx = w / 2, cy = h * 0.42, R = Math.min(w * 0.36, h * 0.32);
    const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, R * 0.45); g.addColorStop(0, 'rgba(255,240,200,.55)'); g.addColorStop(1, 'rgba(255,240,200,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, R * 0.45, 0, TAU); ctx.fill();
    for (const s of BALL) { const a = s.a + t * 0.05 / (0.3 + s.d); dot(ctx, cx + Math.cos(a) * s.d * R, cy + Math.sin(a) * s.d * R, 0.6 + s.b * 1.1, `rgba(255,235,200,${0.35 + s.b * 0.5})`); }
    label(ctx, 'Held together by its own gravity', cx, cy + R + 22, { align: 'center', colour: ACCENT, size: 10 });
    say('A second kind, far bigger', 'Several thousand stars to millions, among the oldest there are');
  },
};

// ---- 5. how far
const DIST: [string, number, string][] = [['The Pleiades', 445, '#9fc0e6'], ['The globular cluster M13', 25000, '#e9c48a']];
const far: Scene = {
  caption: 'How far away the Pleiades and the globular cluster M13 are, in light years, each marked by a dot, on a scale where each step to the right is ten times the one before. The Pleiades distance is about 445 light years, though that figure is not agreed by everyone.',
  stillAt: 5,
  draw({ ctx, w, h, t, say }) {
    backdrop(ctx, w, h, 0.2);
    const narrow = w < 520, x0 = w * (narrow ? 0.08 : 0.3), x1 = w * 0.9, y0 = h * 0.3, step = h * 0.17, lo = 2, hi = 5.2, X = (v: number) => x0 + ((Math.log10(v) - lo) / (hi - lo)) * (x1 - x0), k = clamp(t / 3, 0, 1);
    for (const [v, name] of [[100, '100'], [1000, '1,000'], [10000, '10,000'], [100000, '100,000']] as [number, string][]) { line(ctx, [X(v), y0 - 26, X(v), y0 + step + 20], 'rgba(236,231,220,.18)'); label(ctx, name, X(v), y0 + step + 36, { align: 'center', colour: FAINT, size: 9 }); }
    DIST.forEach(([name, v, col], i) => {
      const y = y0 + i * step, xv = x0 + (X(v) - x0) * k;
      label(ctx, name, x0, y - 22, { align: 'left', colour: SOFT, size: 10 });
      line(ctx, [x0, y, xv, y], 'rgba(236,231,220,.25)'); dot(ctx, xv, y, 6, col);
      if (k > 0.95) label(ctx, v.toLocaleString('en-GB'), Math.min(xv + 12, w - 60), y + (xv > w * 0.7 ? 20 : 0), { align: 'left', colour: SOFT, size: 10 });
    });
    label(ctx, 'Light years', x1, y0 + step + 54, { align: 'right', colour: FAINT, size: 9 });
    say('One is a neighbour, the other tens of thousands of light years off', 'M13 is more than fifty times as far as the Pleiades');
  },
};

// one picture to each step of the first look: its paragraphs and photographs, in order
export const scenes: Scene[] = [lens, eye, loose, ball, far];
