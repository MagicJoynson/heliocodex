/**
 * Pictures for the lesson "Gravity as a lens". The three photographs are real, from the Hubble Space
 * Telescope. The bent rays, the gathered light and the passing star are drawings of the idea and
 * are not to scale: real bending is far too slight to draw.
 */
import { type Scene, SOFT, ACCENT, clamp, ease, label, stars } from '../stage';
import { TAU, photoScene, dot, line } from '../kit';

const backdrop = stars(120, 97);
const HUBBLE = 'The colour is built from pictures taken through separate filters.';

export const lens = photoScene({
  src: '/img/learn/cosmic-horseshoe-hubble.jpg',
  caption: `A real photograph by the Hubble Space Telescope: the Cosmic Horseshoe, a far blue galaxy bent into a ring by the orange galaxy in front of it. ${HUBBLE} Credit: ESA/Hubble and NASA, CC BY 4.0.`,
  say: ['', ''], hero: true, cover: true, zoom: [1, 1.1], focus: [0.53, 0.5],
});

// ---- 1. a cluster
const cluster = photoScene({
  src: '/img/learn/abell-370-hubble.jpg',
  caption: `A real photograph by the Hubble Space Telescope: the galaxy cluster Abell 370. ${HUBBLE} Some were taken in infrared. Credit: NASA, ESA/Hubble, HST Frontier Fields, CC BY 4.0.`,
  say: ['A crowd of galaxies', 'The blue streaks are further galaxies, bent out of shape'],
  cover: true, zoom: [1, 1.12], focus: [0.42, 0.62],
  pointers: [{ at: [0.4, 0.705], to: [0.2, 0.86], text: 'A far galaxy, stretched' }],
});

// ---- 2. how the light is bent
/** A ray from (x0,y0) that turns at the lens plane xl and ends at (x1,y1). */
const ray = (ctx: CanvasRenderingContext2D, p: number[], k: number, colour: string) => {
  const [x0, y0, xl, yl, x1, y1] = p, n = 40;
  ctx.strokeStyle = colour; ctx.lineWidth = 1.3; ctx.beginPath();
  for (let i = 0; i <= n * k; i++) { const u = i / n, v = 1 - u, x = v * v * x0 + 2 * u * v * xl + u * u * x1, y = v * v * y0 + 2 * u * v * yl + u * u * y1; i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
  ctx.stroke();
};
const galaxy = (ctx: CanvasRenderingContext2D, x: number, y: number, r: number, colour: string) => {
  const g = ctx.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, colour); g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(x, y, r, r * 0.6, 0.4, 0, TAU); ctx.fill();
};
const bend: Scene = {
  caption: 'Light from a far galaxy bent round a nearer one on its way to the Earth. We look back along the way the light arrives, the dashed lines, and see the far galaxy twice, in places where it is not. A drawing of the idea, not to scale.',
  stillAt: 7,
  draw({ ctx, w, h, t, say }) {
    backdrop(ctx, w, h, 0.4);
    const xs = w * 0.08, xl = w * 0.5, xe = w * 0.92, cy = h * 0.4, up = h * 0.112, k = clamp(t / 3.5, 0, 1), k2 = ease(clamp((t - 3.8) / 1.6, 0, 1));
    galaxy(ctx, xs, cy, 16, 'rgba(127,180,255,.95)'); galaxy(ctx, xl, cy, 20, 'rgba(240,190,120,.95)'); dot(ctx, xe, cy, 5, '#5a9bff');
    for (const s of [-1, 1]) {
      ray(ctx, [xs, cy, xl, cy + s * up * 1.25, xe, cy], k, 'rgba(127,180,255,.9)');
      if (k2 > 0) { // look back along the arriving ray
        const dx = xl - xe, dy = s * up * 1.25 * 2 * 0.5, len = (xs - xe) / dx * k2;
        ctx.setLineDash([4, 5]); line(ctx, [xe, cy, xe + dx * len, cy + dy * len * 1.0], 'rgba(236,231,220,.45)'); ctx.setLineDash([]);
        if (k2 > 0.98) galaxy(ctx, xs, cy + dy * (xs - xe) / dx, 13, 'rgba(127,180,255,.6)');
      }
    }
    const small = w <= 560;
    label(ctx, small ? 'Far' : 'Far galaxy', xs, cy + 30, { align: 'left' });
    label(ctx, small ? 'Near' : 'Nearer galaxy', xl, cy + 44, { align: 'center', colour: ACCENT });
    label(ctx, 'Earth', xe, cy + 22, { align: 'right' });
    if (k2 > 0.98) { label(ctx, small ? 'Seen' : 'Where we see it', xs + 22, cy - up * 2.5, { align: 'left', colour: SOFT }); }
    say('Mass bends the path of light', 'So we see the far galaxy where it is not, and more than once');
  },
};

// ---- 3. a ring
const ringScene = photoScene({
  src: '/img/learn/cosmic-horseshoe-hubble.jpg',
  caption: `A real photograph by the Hubble Space Telescope: the Cosmic Horseshoe, found in 2007. ${HUBBLE} Credit: ESA/Hubble and NASA, CC BY 4.0.`,
  say: ['Lined up almost exactly', 'The far galaxy is drawn out into a ring'],
  zoom: [0.9, 1.15], focus: [0.53, 0.5],
  pointers: [{ at: [0.53, 0.5], to: [0.78, 0.24], text: 'The galaxy in front' }, { at: [0.45, 0.6], to: [0.2, 0.8], text: 'The galaxy behind' }],
});

// ---- 4. four copies
const cross = photoScene({
  src: '/img/learn/einstein-cross-hubble.jpg',
  caption: `A real photograph by the Hubble Space Telescope: the Einstein Cross. The four bright dots are four views of one quasar, and the glow between them is the middle of the galaxy bending its light. ${HUBBLE} Credit: ESA/Hubble and NASA, CC BY 4.0.`,
  say: ['One quasar, seen four times', 'Its light has travelled for around 11 billion years'],
  zoom: [0.9, 1.3], focus: [0.5, 0.5],
});

// ---- 5. gathering light
const gather: Scene = {
  caption: 'Light spreading from a far star. Left to itself, only a sliver of it reaches the Earth. A mass in between turns more of it our way, so the star looks brighter. A drawing of the idea, not to scale.',
  stillAt: 9,
  draw({ ctx, w, h, t, say }) {
    backdrop(ctx, w, h, 0.4);
    const xs = w * 0.07, xl = w * 0.5, xe = w * 0.93, cy = h * 0.4, on = ease(clamp((t - 2.5) / 2.5, 0, 1)), N = 13;
    let hits = 0;
    for (let i = 0; i < N; i++) {
      const a = (i - (N - 1) / 2) / ((N - 1) / 2), yl = cy + a * h * 0.3, straight = cy + a * h * 0.3 * ((xe - xs) / (xl - xs));
      const caught = Math.abs(a) < 0.72 && Math.abs(a) > 0.08, ye = caught ? straight + (cy - straight) * on : straight, hit = Math.abs(ye - cy) < 6;
      if (hit) hits++;
      const c = hit ? 'rgba(233,196,138,.9)' : 'rgba(236,231,220,.25)';
      line(ctx, [xs, cy, xl, yl], c, 1.1); line(ctx, [xl, yl, xe, ye], c, 1.1);
    }
    dot(ctx, xs, cy, 4, '#fff'); if (on > 0) { ctx.globalAlpha = on; galaxy(ctx, xl, cy, 26, 'rgba(240,190,120,.95)'); ctx.globalAlpha = 1; }
    dot(ctx, xe, cy, 5 + hits * 0.5, '#5a9bff');
    label(ctx, w > 560 ? 'A far star' : 'Star', xs, cy + 22, { align: 'left' }); label(ctx, 'Earth', xe, cy + 26, { align: 'right' });
    if (on > 0.5) label(ctx, w > 560 ? 'A cluster of galaxies' : 'Cluster', xl, cy + 40, { align: 'center', colour: ACCENT });
    say(on < 0.5 ? 'Most of the light misses us' : 'The lens turns more of it our way', 'Earendel looks a thousand times brighter or more');
  },
};

// ---- 6. a passing star and its planet
const A = (u: number) => (u * u + 2) / (u * Math.sqrt(u * u + 4));
const bright = (x: number) => A(Math.hypot(0.28, x)) + 0.9 * Math.exp(-(((x - 0.62) / 0.045) ** 2));
export const micro: Scene = {
  caption: 'Above, a star with a planet drifting in front of a more distant star. Below, the brightness of the distant star as it happens: a slow rise and fall from the nearer star, and a short flicker from its planet. A drawing of the idea, not a real measurement.',
  stillAt: 11,
  draw({ ctx, w, h, t, say }) {
    backdrop(ctx, w, h, 0.35);
    const x0 = w * 0.1, x1 = w * 0.9, sky = h * 0.2, base = h * 0.7, top = h * 0.36, p = clamp((t % 14) / 10, 0, 1), xr = -2 + 4 * p;
    const sx = w / 2, lx = sx + xr * w * 0.2, b = bright(xr);
    const g = ctx.createRadialGradient(sx, sky, 0, sx, sky, 10 + b * 7); g.addColorStop(0, '#fff'); g.addColorStop(0.3, 'rgba(255,240,210,.8)'); g.addColorStop(1, 'rgba(255,240,210,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(sx, sky, 10 + b * 7, 0, TAU); ctx.fill();
    dot(ctx, lx, sky + 9, 5, '#d98a5a'); dot(ctx, lx - 0.62 * w * 0.2, sky + 9, 2, '#9fb6c9');
    line(ctx, [x0, base, x1, base], 'rgba(236,231,220,.35)'); line(ctx, [x0, base, x0, top - 8], 'rgba(236,231,220,.35)');
    const Y = (v: number) => base - 10 - ((v - 1) / 3) * (base - top - 10);
    ctx.strokeStyle = ACCENT; ctx.lineWidth = 1.8; ctx.beginPath();
    for (let i = 0; i <= 240 * p; i++) { const x = -2 + (4 * i) / 240, px = x0 + ((x + 2) / 4) * (x1 - x0), py = Y(bright(x)); i ? ctx.lineTo(px, py) : ctx.moveTo(px, py); }
    ctx.stroke();
    label(ctx, 'Brightness', x0 + 6, top - 4, { align: 'left', colour: SOFT }); label(ctx, 'Time', x1, base + 16, { align: 'right', colour: SOFT });
    if (p > 0.7) label(ctx, 'The planet', x0 + ((2.62) / 4) * (x1 - x0) + 8, Y(bright(0.62)) - 2, { align: 'left' });
    if (p > 0.52) label(ctx, 'The star', x0 + (x1 - x0) / 2, Y(bright(0)) - 12, { align: 'center' });
    say('A star passes in front of another', 'Its planet adds a flicker of its own');
  },
};

export const scenes: Scene[] = [cluster, bend, ringScene, cross, gather, micro];
