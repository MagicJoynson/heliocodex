/**
 * Pictures for the lesson "Are we alone?", one to each step of its first look. All are drawings of the idea
 * and not to scale. They state only the lesson's claims: life is known on exactly one world, we have barely
 * started to search, all known life needs liquid water, and spacecraft are on their way to some of the places
 * that have it or had it.
 */
import { type Scene, SOFT, ACCENT, FAINT, clamp, ease, label, stars, rng } from '../stage';
import { TAU, dot, line } from '../kit';

const backdrop = stars(120, 8801);
const room = (w: number) => (w > 760 ? w * 0.34 : 0);
const glow = (ctx: CanvasRenderingContext2D, x: number, y: number, r: number, rgb: string, a: number) => { const g = ctx.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, `rgba(${rgb},${a})`); g.addColorStop(1, `rgba(${rgb},0)`); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill(); };
const WORLDS = (() => { const r = rng(14); return Array.from({ length: 60 }, () => ({ x: r(), y: r(), s: 1 + r() * 1.6 })); })();

// ---- 1. one world with life (the hero)
export const lens: Scene = {
  caption: 'Worlds, drawn as dots, a drawing of the idea. Life is known on exactly one: the Earth, here in blue. No sign of living things has been confirmed anywhere else.',
  stillAt: 5,
  draw({ ctx, w, h, t, say }) {
    backdrop(ctx, w, h, 0.2);
    const rx = room(w), x0 = rx + (w - rx) * 0.08, W = (w - rx) * 0.84, y0 = h * (rx ? 0.12 : 0.06), H = h * (rx ? 0.46 : 0.34);
    WORLDS.forEach((p, i) => dot(ctx, x0 + p.x * W, y0 + p.y * H, p.s, i === 7 ? '#6fa8e6' : 'rgba(200,205,215,.55)'));
    const e = WORLDS[7], pulse = 0.5 + 0.5 * Math.sin(t * 2); glow(ctx, x0 + e.x * W, y0 + e.y * H, 14 + 6 * pulse, '111,168,230', 0.5);
    label(ctx, 'The one world known to have life', x0 + W / 2, y0 + H + 28, { align: 'center', colour: ACCENT, size: 10 });
    say('Life is known on exactly one world', 'No sign of living things has been confirmed anywhere else');
  },
};

// ---- 2. we have barely started: all the oceans against a bathtub
const search: Scene = {
  caption: 'How much we have searched, a drawing of the idea and not to scale. The space we could search has been compared to all the Earth’s oceans, and what we have searched so far to a bathtub of water.',
  stillAt: 4,
  draw({ ctx, w, h, t, say }) {
    backdrop(ctx, w, h, 0.15);
    const cx = w / 2, y = h * 0.32, R = Math.min(w * 0.36, h * 0.3), k = ease(clamp(t / 2.5, 0, 1));
    ctx.fillStyle = 'rgba(111,168,230,.28)'; ctx.beginPath(); ctx.arc(cx, y, R * k, 0, TAU); ctx.fill(); ctx.strokeStyle = 'rgba(111,168,230,.6)'; ctx.stroke();
    ctx.fillStyle = 'rgba(255,225,170,.95)'; ctx.fillRect(cx - 3, y - 2, 6, 4);
    label(ctx, 'All the Earth’s oceans: the space we could search', cx, y + R + 26, { align: 'center', colour: SOFT, size: 10 });
    label(ctx, 'A bathtub: what we have searched so far', cx, y + R + 46, { align: 'center', colour: ACCENT, size: 10 });
    say('We have barely started', 'The space to search is like the oceans, and we have searched a bathtub');
  },
};

// ---- 3. follow the water
const places: Scene = {
  caption: 'Where to look for liquid water, a drawing of the idea and not to scale. All life on Earth needs it. Mars had rivers and lakes long ago. Several moons of Jupiter and Saturn have whole oceans hidden under their ice. And among the thousands of planets found round other stars, some may have it too.',
  stillAt: 4,
  draw({ ctx, w, h, t, say }) {
    backdrop(ctx, w, h, 0.15);
    const xs = [w * 0.18, w * 0.5, w * 0.82], y = h * 0.26;
    dot(ctx, xs[0], y, 11, '#c9714f'); [-0.5, 0.3].forEach((a) => ctx.fillRect(xs[0] + a * 12, y - 6 + a * 8, 7, 1.5));
    ctx.fillStyle = 'rgba(111,168,230,.55)'; ctx.fillRect(xs[0] - 8, y - 2, 16, 2);
    dot(ctx, xs[1], y, 11, '#d9d4c8'); ctx.strokeStyle = 'rgba(111,168,230,.7)'; ctx.beginPath(); ctx.arc(xs[1], y, 6.5, 0, TAU); ctx.stroke();
    dot(ctx, xs[2], y, 7, '#8fb0d6'); glow(ctx, xs[2], y, 22, '111,168,230', 0.3 + 0.15 * Math.sin(t * 2));
    [['Mars', 'long ago'], ['Icy moons', 'under the ice'], ['Other stars', 'some may qualify']].forEach(([a, b], i) => { label(ctx, a, xs[i], y + 34, { align: 'center', colour: ACCENT, size: 10 }); label(ctx, b, xs[i], y + 52, { align: 'center', colour: SOFT, size: 9 }); });
    say('All life on Earth needs liquid water', 'So that is the first thing to look for');
  },
};

// ---- 4. spacecraft on their way
const ships: Scene = {
  caption: 'Spacecraft on their way, a drawing of the idea and not to scale. Some are heading for the places that have water, or had it.',
  stillAt: 5,
  draw({ ctx, w, h, t, say }) {
    backdrop(ctx, w, h, 0.15);
    const x0 = w * 0.1, x1 = w * 0.86, y = h * 0.3, f = (t * 0.12) % 1;
    dot(ctx, x0, y, 5, '#6fa8e6'); label(ctx, 'Earth', x0, y + 24, { align: 'center', colour: SOFT, size: 10 });
    dot(ctx, x1, y, 8, '#d9d4c8'); ctx.strokeStyle = 'rgba(111,168,230,.7)'; ctx.beginPath(); ctx.arc(x1, y, 12, 0, TAU); ctx.stroke(); label(ctx, 'A world with water', x1, y + 36, { align: 'right', colour: ACCENT, size: 10 });
    line(ctx, [x0 + 8, y, x1 - 16, y], 'rgba(236,231,220,.18)');
    const sx = x0 + 10 + f * (x1 - x0 - 30); ctx.fillStyle = '#ffe7a8'; ctx.fillRect(sx - 3, y - 2, 6, 4);
    label(ctx, 'A spacecraft on its way', w / 2, y - 40, { align: 'center', colour: FAINT, size: 10 });
    say('Spacecraft are on their way', 'To some of these places now');
  },
};

// one picture to each step of the first look (four steps; two photographs in a row share the step of the paragraph after them)
export const scenes: Scene[] = [lens, search, places, ships];
