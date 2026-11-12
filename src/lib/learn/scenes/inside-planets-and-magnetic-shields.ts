/**
 * Pictures for the lesson "Inside planets and their magnetic shields". The hole and the layers are
 * drawn to scale from NASA's figures. The earthquake waves and the shield are diagrams, and say so.
 */
import { type Scene, SOFT, ACCENT, clamp, ease, label, stars } from '../stage';
import { TAU, photoScene, dot, line } from '../kit';

const backdrop = stars(80, 611);
const R_EARTH = 6371, R_OUTER = 3521, R_INNER = 1221;
const JUPITER = 'Two real pictures combined: Jupiter in ordinary light, photographed by the Hubble Space Telescope in 2014, with Hubble’s ultraviolet pictures of the lights at its north pole from 2016 laid on top. Ultraviolet cannot be seen by eye, so the blue was chosen. Credit: NASA, ESA, CC BY 4.0.';

export const lens = photoScene({ src: '/img/learn/jupiter-aurora-hubble.jpg', caption: JUPITER, say: ['', ''], hero: true, zoom: [0.9, 1], focus: [0.5, 0.42] });

function ring(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, fill: string, stroke?: string) {
  ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fillStyle = fill; ctx.fill();
  if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = 1; ctx.stroke(); }
}

// ---- 1. the deepest hole, to scale
const hole: Scene = {
  caption: 'A drawing to scale. The line runs from the ground to the centre of the Earth, 6,371 kilometres. The short bright mark at the top is the deepest hole ever drilled, 12.262 kilometres.',
  stillAt: 5,
  draw({ ctx, w, h, t, say }) {
    backdrop(ctx, w, h, 0.35);
    const x0 = w * 0.08, x1 = w * 0.92, y = h * 0.42, k = ease(clamp(t / 3, 0, 1)), len = x1 - x0;
    line(ctx, [x0, y, x0 + len * k, y], 'rgba(236,231,220,.55)', 2);
    const hx = Math.max(1.5, (12.262 / R_EARTH) * len);
    ctx.fillStyle = ACCENT; ctx.fillRect(x0 - 1, y - 12, hx + 1, 24);
    label(ctx, 'The ground', x0, y - 26, { align: 'left' });
    label(ctx, 'The hole', x0, y + 34, { align: 'left', colour: ACCENT });
    if (k > 0.98) { dot(ctx, x1, y, 4, '#fff'); label(ctx, 'The centre', x1, y - 26, { align: 'right' }); label(ctx, '6,371 km', x1, y + 34, { align: 'right', colour: SOFT }); }
    say('Nineteen years of drilling', 'Less than a five-hundredth of the way down');
  },
};

// ---- 2. earthquake waves through the planet
const waves: Scene = {
  caption: 'A diagram, with the core at its true size. Waves spread from an earthquake at the top. The kind that cannot cross liquid is stopped by the molten core, so a wide stretch of the far side never feels it. The real paths curve; they are drawn straight here.',
  stillAt: 6,
  draw({ ctx, w, h, t, say }) {
    backdrop(ctx, w, h, 0.3);
    const cx = w / 2, cy = h * 0.45, R = Math.min(w * 0.36, h * 0.33), rc = (R * R_OUTER) / R_EARTH;
    ring(ctx, cx, cy, R, 'rgba(120,86,62,.5)', 'rgba(236,231,220,.5)'); ring(ctx, cx, cy, rc, 'rgba(233,160,90,.55)');
    const qx = cx, qy = cy - R, k = clamp(t / 5, 0, 1), lim = Math.asin(rc / R);
    for (let i = -8; i <= 8; i++) {
      const a = (i / 8) * (TAU / 4) * 0.96, dx = Math.sin(a), dy = Math.cos(a), full = 2 * R * Math.cos(a);
      let stop = full, blocked = false;
      if (Math.abs(a) < lim) { const b = R * Math.cos(a), disc = Math.sqrt(rc * rc - R * R * Math.sin(a) ** 2); stop = b - disc; blocked = true; }
      const d = Math.min(stop, full * k * 1.05);
      line(ctx, [qx, qy, qx + dx * d, qy + dy * d], blocked ? 'rgba(233,196,138,.9)' : 'rgba(236,231,220,.55)', 1.3);
      if (blocked && d >= stop) dot(ctx, qx + dx * stop, qy + dy * stop, 2.5, ACCENT);
    }
    dot(ctx, qx, qy, 5, '#fff'); label(ctx, 'Earthquake', qx, qy - 14, { align: 'center' });
    label(ctx, 'Molten core', cx, cy + 4, { align: 'center', colour: '#1a1410' });
    if (k >= 1) {
      ctx.strokeStyle = ACCENT; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(cx, cy, R + 6, TAU / 4 - 2 * lim, TAU / 4 + 2 * lim); ctx.stroke();
      label(ctx, 'Nothing arrives here', cx, cy + R + 28, { align: 'center', colour: ACCENT });
    }
    say('An earthquake lights up the inside', 'One kind of wave is stopped dead by liquid');
  },
};

// ---- 3. the layers, to scale
const layers: Scene = {
  caption: 'A drawing to scale of the Earth cut in half, from NASA’s figures: a solid inner core, a molten outer core, the mantle of hot rock, and a crust too thin to draw as more than the outline. The colours were chosen.',
  stillAt: 5,
  draw({ ctx, w, h, t, say }) {
    backdrop(ctx, w, h, 0.3);
    const wide = w > 560, R = Math.min(w * (wide ? 0.3 : 0.4), h * 0.37), cx = wide ? w * 0.4 : w / 2, cy = h * 0.42, k = ease(clamp(t / 3, 0, 1));
    const ro = (R * R_OUTER) / R_EARTH, ri = (R * R_INNER) / R_EARTH;
    ring(ctx, cx, cy, R, '#7a4a34', 'rgba(236,231,220,.85)'); ring(ctx, cx, cy, ro * k + R * (1 - k), '#d98a3a'); ring(ctx, cx, cy, ri * k, '#f6e3a8');
    const rows: [string, string, number][] = [['Inner core', 'Solid metal, 5,400 °C', 0], ['Outer core', 'Molten metal', (ri + ro) / 2], ['Mantle', 'Hot rock', (ro + R) / 2], ['Crust', 'About 30 km', R]];
    if (k > 0.9) rows.forEach(([a, b, r], i) => {
      if (wide) { const lx = cx + R + 30, ly = cy - R * 0.75 + i * R * 0.5; line(ctx, [cx + r * 0.94, cy - (i === 3 ? 0 : 0), lx - 8, ly], 'rgba(236,231,220,.4)'); label(ctx, a, lx, ly - 2, { align: 'left', colour: ACCENT }); label(ctx, b, lx, ly + 13, { align: 'left', colour: SOFT }); }
      else if (i < 3) label(ctx, a, cx, cy - r + (i === 0 ? 4 : 4), { align: 'center', colour: i === 0 ? '#1a1410' : '#fff' });
    });
    if (!wide && k > 0.9) label(ctx, 'Crust: the outline', cx, cy + R + 22, { align: 'center', colour: ACCENT });
    say('Four layers', 'Everything anyone has ever seen is the outline');
  },
};

// ---- 4. the shield
const shield: Scene = {
  caption: 'A diagram, not to scale. Particles of the wind from the Sun come in from the left. The Earth’s magnetism turns them aside, and the wind presses the magnetism into a teardrop with a long tail.',
  draw({ ctx, w, h, t, say }) {
    backdrop(ctx, w, h, 0.3);
    const cx = w * 0.36, cy = h * 0.43, r = Math.min(w, h) * 0.04, S = Math.min(w * 0.2, h * 0.23);
    // field lines: a bar magnet's pattern, squashed on the side facing the Sun and drawn out behind
    ctx.strokeStyle = 'rgba(140,180,255,.55)'; ctx.lineWidth = 1.1;
    for (let i = 1; i <= 5; i++) for (const side of [-1, 1]) {
      const L = (i / 5) * S * 1.5, pull = side < 0 ? 0.55 : 1 + 3.2 * (i / 5) ** 2;
      ctx.beginPath();
      for (let q = 0; q <= 40; q++) { const th = (q / 40) * Math.PI, sn = Math.sin(th), x = cx + side * pull * L * sn ** 3, y = cy - L * sn * sn * Math.cos(th); q ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
      ctx.stroke();
    }
    // the wind, flowing round the edge of the shield
    const nose = cx - S * 1.0, edge = (x: number) => (x > nose ? S * 0.95 * Math.sqrt(1 - Math.exp(-(x - nose) / (S * 0.7))) : 0);
    ctx.fillStyle = 'rgba(233,196,138,.9)';
    for (let i = 0; i < 170; i++) {
      const y0 = (((i * 0.754878) % 1) - 0.5) * h * 0.86, u = (t * 0.14 + i * 0.569840) % 1, x = -10 + u * (w + 20), b = edge(x);
      const y = cy - h * 0.01 + Math.sign(y0 || 1) * Math.sqrt(y0 * y0 + b * b);
      if (y > 4 && y < h * 0.86) ctx.fillRect(x, y, 5, 1.4);
    }
    ring(ctx, cx, cy, r, '#3f78c9', 'rgba(255,255,255,.6)');
    label(ctx, 'Earth', cx, cy + r + 16, { align: 'center' }); label(ctx, 'Wind from the Sun', 12, h * 0.06 + 10, { align: 'left', colour: ACCENT });
    say('A shield made by moving metal', 'Most of the wind from the Sun is turned aside');
  },
};

// ---- 5. Jupiter
const jupiter = photoScene({
  src: '/img/learn/jupiter-aurora-hubble.jpg', caption: JUPITER, tag: 'Two pictures combined',
  say: ['Jupiter’s shield', 'A magnet 16 to 54 times as strong as the Earth’s'], zoom: [0.92, 1.05], focus: [0.5, 0.45],
  pointers: [{ at: [0.5, 0.1], to: [0.8, 0.06], text: 'Polar lights', align: 'left' }],
});

// ---- 6. Mars
const mars = photoScene({
  src: '/img/learn/mars-viking-global.jpg',
  caption: 'A real picture pieced together from about 1,000 photographs by NASA’s Viking 1 orbiter, taken through red and violet filters, with the green worked out from those two. Credit: NASA/JPL/USGS.',
  say: ['Mars: no shield', 'Most of the air it ever had has been lost to space'], zoom: [0.8, 0.95], focus: [0.5, 0.5], tag: 'Photo mosaic',
});

export const scenes: Scene[] = [hole, waves, layers, shield, jupiter, mars];
