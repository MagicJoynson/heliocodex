/**
 * Pictures for the lesson "How planets are found". The count is real, from NASA's Exoplanet Archive
 * on 11 November 2026. The picture of 2M1207 is real. The wobbling star, the dimming star and the
 * scales are drawings of the idea, with the effects made far larger than life.
 */
import { type Scene, SOFT, ACCENT, clamp, ease, label, stars, nf } from '../stage';
import { TAU, photoScene, sun, dot, line } from '../kit';
import { micro } from './gravity-as-a-lens';

const backdrop = stars(110, 173);
const PIC = 'A real picture, in infrared: the brown dwarf 2M1207 and, in red, its planet, taken with the Very Large Telescope in Chile. Infrared has no colour, so the colours were chosen for the picture. The labels are ESO’s. Credit: ESO, CC BY 4.0.';

export const lens = photoScene({ src: '/img/learn/2m1207-planet-vlt.jpg', caption: PIC, say: ['', ''], hero: true, zoom: [0.9, 1], focus: [0.5, 0.5], tag: 'Infrared picture' });

// ---- 1. the count
const COUNT: [string, number][] = [['Dimming', 4797], ['Wobble', 1205], ['Bent light', 292], ['A picture', 98], ['Other ways', 72]];
const count: Scene = {
  caption: 'Every planet known round another star, sorted by how it was found. Counted in NASA’s Exoplanet Archive on 11 November 2026: 6,464 in all. The bars are to scale.',
  stillAt: 4,
  draw({ ctx, w, h, t, say }) {
    const x0 = w > 560 ? w * 0.26 : 96, x1 = w - 64, top = h * 0.08, row = (h * 0.62) / COUNT.length, k = ease(clamp(t / 2.5, 0, 1));
    COUNT.forEach(([name, n], i) => {
      const y = top + i * row, len = ((x1 - x0) * n * k) / 4797;
      ctx.fillStyle = i === 0 ? ACCENT : 'rgba(236,231,220,.55)'; ctx.fillRect(x0, y + row * 0.2, Math.max(1.5, len), row * 0.5);
      label(ctx, name, x0 - 10, y + row * 0.52, { align: 'right' });
      label(ctx, nf(Math.round(n * k)), x0 + Math.max(1.5, len) + 8, y + row * 0.52, { align: 'left', colour: i === 0 ? ACCENT : SOFT });
    });
    say('6,464 planets, and almost none of them seen', 'Three in every four were found by a star dimming');
  },
};

// ---- 2. the wobble
const wobble: Scene = {
  caption: 'A star and its planet circling each other, seen from above, with the star’s light below it: shifted towards blue as the star comes towards us and towards red as it goes away. A drawing of the idea. The real circle and the real shift are far too small to draw.',
  stillAt: 1.6,
  draw({ ctx, w, h, t, say }) {
    backdrop(ctx, w, h, 0.45);
    const cx = w / 2, cy = h * 0.27, R = Math.min(w * 0.3, h * 0.2), a = t * 1.1, sr = R * 0.16;
    const sx = cx - Math.cos(a) * sr, sy = cy - Math.sin(a) * sr * 0.5, px = cx + Math.cos(a) * R, py = cy + Math.sin(a) * R * 0.5;
    ctx.strokeStyle = 'rgba(236,231,220,.18)'; ctx.beginPath(); ctx.ellipse(cx, cy, R, R * 0.5, 0, 0, TAU); ctx.stroke();
    dot(ctx, cx, cy, 1.5, 'rgba(236,231,220,.6)'); sun(ctx, sx, sy, R * 0.13, 1); dot(ctx, px, py, 4, '#9fb6c9');
    const v = -Math.cos(a), bx = w * 0.14, bw = w * 0.72, by = Math.max(h * 0.56, cy + R * 0.5 + 64), bh = h * 0.1; // v > 0: star moving towards us (down the screen)
    const g = ctx.createLinearGradient(bx, 0, bx + bw, 0); ['#5a4bd6', '#3f8cff', '#39c9a0', '#e8d94a', '#f08a3c', '#d9433b'].forEach((c, i) => g.addColorStop(i / 5, c));
    ctx.fillStyle = g; ctx.fillRect(bx, by, bw, bh);
    for (const f of [0.22, 0.47, 0.55, 0.81]) { const x = bx + (f - v * 0.035) * bw; ctx.fillStyle = 'rgba(255,255,255,.18)'; ctx.fillRect(bx + f * bw - 0.5, by, 1, bh); ctx.fillStyle = '#0b0c0f'; ctx.fillRect(x - 1.5, by, 3, bh); }
    label(ctx, 'Blue', bx, by + bh + 16, { align: 'left', colour: SOFT }); label(ctx, 'Red', bx + bw, by + bh + 16, { align: 'right', colour: SOFT });
    label(ctx, v > 0.15 ? 'Star coming towards us' : v < -0.15 ? 'Star going away' : 'Star moving sideways', cx, by - 10, { align: 'center', colour: ACCENT });
    label(ctx, 'To the Earth', cx, cy + R * 0.5 + 30, { align: 'center', colour: SOFT }); line(ctx, [cx, cy + R * 0.5 + 6, cx, cy + R * 0.5 + 16], 'rgba(236,231,220,.5)');
    say('The planet swings its star round', 'The dark lines in the star’s light slide to and fro in step');
  },
};

// ---- 3. the dip
const dipAt = (x: number) => { const d = Math.abs(x); return d < 0.1 ? 1 : d < 0.13 ? (0.13 - d) / 0.03 : 0; };
const transit: Scene = {
  caption: 'A planet crossing the face of its star, and below it the star’s brightness: a small dip each time the planet goes by. A drawing of the idea. A real dip is a hundredth of the star’s light at most, and usually far less.',
  stillAt: 4.6,
  draw({ ctx, w, h, t, say }) {
    backdrop(ctx, w, h, 0.4);
    const cx = w / 2, cy = h * 0.22, R = Math.min(w * 0.16, h * 0.17), p = (t / 8) % 1, x = -0.5 + p, x0 = w * 0.1, x1 = w * 0.9, base = h * 0.66, depth = h * 0.09;
    sun(ctx, cx, cy, R, 1); dot(ctx, cx + (x / 0.115) * R, cy + R * 0.2, R * 0.16, '#0b0c0f');
    line(ctx, [x0, base + depth + 10, x1, base + depth + 10], 'rgba(236,231,220,.3)');
    ctx.strokeStyle = ACCENT; ctx.lineWidth = 1.8; ctx.beginPath();
    for (let i = 0; i <= 200 * p; i++) { const u = i / 200, px = x0 + u * (x1 - x0), py = base + dipAt(u - 0.5) * depth; i ? ctx.lineTo(px, py) : ctx.moveTo(px, py); }
    ctx.stroke();
    label(ctx, 'Brightness of the star', x0, base - 14, { align: 'left', colour: SOFT }); label(ctx, 'Time', x1, base + depth + 26, { align: 'right', colour: SOFT });
    if (p > 0.62) label(ctx, 'The planet in front', cx, base + depth + 26, { align: 'center' });
    say('The star dims as the planet crosses', 'If the dip returns on time, it is a planet');
  },
};

// ---- 4. a picture
const picture = photoScene({
  src: '/img/learn/2m1207-planet-vlt.jpg', caption: PIC,
  say: ['A planet, actually seen', 'Five times the mass of Jupiter, and still glowing with heat'],
  zoom: [0.92, 1.05], focus: [0.5, 0.5], tag: 'Infrared picture',
});

// ---- 6. two measurements
const ball = (ctx: CanvasRenderingContext2D, x: number, y: number, r: number, c0: string, c1: string) => {
  const g = ctx.createRadialGradient(x - r * 0.3, y - r * 0.3, r * 0.1, x, y, r); g.addColorStop(0, c0); g.addColorStop(1, c1); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill();
};
const both: Scene = {
  caption: 'Two planets of the same width can be very different inside. The dip gives the width, the wobble gives the mass, and the two together give the density. A drawing of the idea.',
  stillAt: 5,
  draw({ ctx, w, h, t, say }) {
    backdrop(ctx, w, h, 0.4);
    const r = Math.min(w * 0.11, h * 0.14), y = h * 0.26, xa = w * 0.28, xb = w * 0.72, k = ease(clamp((t - 1) / 2.5, 0, 1));
    ball(ctx, xa, y, r, '#c9a27a', '#5c4632'); ball(ctx, xb, y, r, '#cfe3ee', '#5d86a0');
    label(ctx, 'Same width', w / 2, y + 4, { align: 'center', colour: SOFT });
    const by = h * 0.62, bw = Math.min(w * 0.3, 190);
    ([[xa, 1, 'Heavy: rock'], [xb, 0.22, 'Light: gas']] as [number, number, string][]).forEach(([x, m, txt]) => {
      ctx.strokeStyle = 'rgba(236,231,220,.35)'; ctx.strokeRect(x - bw / 2, by, bw, 12); ctx.fillStyle = ACCENT; ctx.fillRect(x - bw / 2, by, bw * m * k, 12);
      label(ctx, 'Mass, from the wobble', x, by - 10, { align: 'center', colour: SOFT }); if (k > 0.95) label(ctx, txt, x, by + 32, { align: 'center' });
    });
    say('Width from the dip, mass from the wobble', 'Together they say what a planet is made of');
  },
};

export const scenes: Scene[] = [count, wobble, transit, picture, micro, both];
