/**
 * Pictures for the lesson "Constellations", one to each step of its first look. All are drawings of the idea:
 * the star positions are only roughly drawn and nothing is to scale. The only figures they state are the
 * lesson's: Betelgeuse about 550 light years away, Rigel about 860, 88 official constellations, and 50,000
 * years for the Plough to bend out of shape.
 */
import { type Scene, SOFT, ACCENT, FAINT, clamp, ease, label, stars, rng } from '../stage';
import { TAU, dot, line, ring } from '../kit';

const backdrop = stars(100, 8801);
const room = (w: number) => (w > 760 ? w * 0.34 : 0);

// Orion, roughly: shoulders, belt, feet
const ORION: [number, number, string][] = [[0.3, 0.1, '#e8896b'], [0.7, 0.14, '#cfe0ff'], [0.42, 0.46, '#cfe0ff'], [0.5, 0.44, '#cfe0ff'], [0.58, 0.42, '#cfe0ff'], [0.3, 0.86, '#cfe0ff'], [0.72, 0.82, '#bcd4ff']];
const ORION_LINES: [number, number][] = [[0, 2], [1, 4], [2, 3], [3, 4], [2, 5], [4, 6], [0, 1]];
// the Plough (Big Dipper), roughly: Alkaid, Mizar, Alioth, Megrez, Phecda, Merak, Dubhe
const PLOUGH: [number, number][] = [[0, 0.2], [0.18, 0.3], [0.36, 0.34], [0.52, 0.4], [0.54, 0.68], [0.86, 0.72], [0.9, 0.46]];
const PLOUGH_LINES: [number, number][] = [[0, 1], [1, 2], [2, 3], [3, 6], [6, 5], [5, 4], [4, 3]];

const figure = (ctx: CanvasRenderingContext2D, pts: [number, number, string?][], links: [number, number][], ox: number, oy: number, W: number, H: number, k = 1, col = 'rgba(160,190,235,.55)') => {
  for (const [a, b] of links) { const ax = ox + pts[a][0] * W, ay = oy + pts[a][1] * H, bx = ox + pts[b][0] * W, by = oy + pts[b][1] * H; line(ctx, [ax, ay, ax + (bx - ax) * k, ay + (by - ay) * k], col); }
  for (const p of pts) dot(ctx, ox + p[0] * W, oy + p[1] * H, 3, p[2] ?? '#e6eeff');
};

// ---- 1. join the dots (the hero)
export const lens: Scene = {
  caption: 'Join-the-dots, a drawing of the idea: a hunter, picked out of the stars. The star positions are only roughly drawn. People everywhere have done this, and different peoples saw different pictures in the same stars.',
  stillAt: 7,
  draw({ ctx, w, h, t, say }) {
    backdrop(ctx, w, h, 0.4);
    const rx = room(w), cx = rx + (w - rx) / 2, H = Math.min(h * (rx ? 0.5 : 0.3), (w - rx) * 0.8), W = H * 0.7, k = ease(clamp(((t % 14) - 1) / 6, 0, 1)), fade = 1 - ease(clamp(((t % 14) - 12.5) / 1.5, 0, 1));
    ctx.globalAlpha = fade; figure(ctx, ORION, ORION_LINES, cx - W / 2, h * (rx ? 0.1 : 0.04), W, H, k); ctx.globalAlpha = 1;
    label(ctx, 'A hunter', cx, h * (rx ? 0.1 : 0.04) + H + 28, { align: 'center', colour: ACCENT, size: 10 });
    say('Look long enough and you start to see shapes', 'A hunter, a plough, a cross');
  },
};

// ---- 2. the stars in a picture are not really together
const depth: Scene = {
  caption: 'Orion’s shoulder and foot, seen from the side, a drawing of the idea and not to scale. Betelgeuse is about 550 light years away and Rigel about 860. They only look like parts of one figure because we see them in nearly the same direction.',
  stillAt: 5,
  draw({ ctx, w, h, t, say }) {
    backdrop(ctx, w, h, 0.15);
    const xe = w * 0.1, y = h * 0.3, xb = xe + (w * 0.8) * (550 / 860), xr = xe + w * 0.8, k = ease(clamp(t / 2.5, 0, 1));
    dot(ctx, xe, y, 4, '#9fc0e6'); label(ctx, 'Earth', xe, y + 26, { align: 'center', colour: SOFT, size: 10 });
    line(ctx, [xe, y, xe + (xr - xe) * k, y - 18 * k], 'rgba(236,231,220,.25)'); line(ctx, [xe, y, xe + (xb - xe) * k, y - 18 * k * (xb - xe) / (xr - xe) * 0.7], 'rgba(236,231,220,.25)');
    dot(ctx, xb, y - 12 * 0.7, 5, '#e8896b'); label(ctx, 'Betelgeuse', xb, y + 34, { align: 'center', colour: ACCENT, size: 10 }); label(ctx, 'about 550 light years', xb, y + 50, { align: 'center', colour: SOFT, size: 9 });
    dot(ctx, xr, y - 18, 5, '#bcd4ff'); label(ctx, 'Rigel', xr, y + 34, { align: 'right', colour: ACCENT, size: 10 }); label(ctx, 'about 860', xr, y + 50, { align: 'right', colour: SOFT, size: 9 });
    label(ctx, 'Nearly the same direction, very different distances', w / 2, y - 60, { align: 'center', colour: SOFT, size: 10 });
    say('The stars in a picture are not really together', 'They only lie in nearly the same direction');
  },
};

// ---- 3. 88 official constellations
const R88 = rng(88);
const TILES = Array.from({ length: 88 }, (_, i) => ({ i, dx: (R88() - 0.5) * 0.3, dy: (R88() - 0.5) * 0.3 }));
const SKY = Array.from({ length: 160 }, () => ({ x: R88(), y: R88(), b: R88() }));
const map: Scene = {
  caption: 'The 88 official constellations, a drawing of the idea: they work like countries on a map of the sky. Every star belongs to one, which makes it easy to say where something is. The borders here are only schematic.',
  stillAt: 6,
  draw({ ctx, w, h, say }) {
    backdrop(ctx, w, h, 0.1);
    const x0 = w * 0.06, y0 = h * 0.06, W = w * 0.88, H = h * 0.5, cols = 11, rows = 8, cw = W / cols, ch = H / rows;
    ctx.strokeStyle = 'rgba(160,190,235,.28)'; ctx.lineWidth = 1;
    for (let c = 0; c <= cols; c++) { ctx.beginPath(); for (let r = 0; r <= rows; r++) { const j = TILES[(c * 9 + r) % 88]; const x = x0 + c * cw + (c % cols === 0 ? 0 : j.dx * cw), y = y0 + r * ch + (r === 0 || r === rows ? 0 : j.dy * ch); r ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.stroke(); }
    for (let r = 0; r <= rows; r++) { ctx.beginPath(); for (let c = 0; c <= cols; c++) { const j = TILES[(c * 9 + r) % 88]; const x = x0 + c * cw + (c === 0 || c === cols ? 0 : j.dx * cw), y = y0 + r * ch + (r === 0 || r === rows ? 0 : j.dy * ch); c ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.stroke(); }
    for (const s of SKY) dot(ctx, x0 + s.x * W, y0 + s.y * H, 0.8 + s.b, 'rgba(230,238,255,.8)');
    label(ctx, '88 official constellations, like countries on a map', x0 + W / 2, y0 + H + 26, { align: 'center', colour: ACCENT, size: 10 });
    say('Astronomers use 88 official constellations', 'Every star belongs to one');
  },
};

// ---- 4. the Earth goes round the Sun, so the night sky changes
const seasons: Scene = {
  caption: 'The Earth going round the Sun, seen from above, a drawing of the idea and not to scale. The night side faces a different part of space as the year goes round, so the winter sky and the summer sky are not the same.',
  stillAt: 4,
  draw({ ctx, w, h, t, say }) {
    backdrop(ctx, w, h, 0.1);
    const cx = w / 2, cy = h * 0.3, R = Math.min(w * 0.3, h * 0.26), a = t * 0.35;
    ring(ctx, cx, cy, R, 'rgba(236,231,220,.2)'); dot(ctx, cx, cy, 8, '#ffd98a');
    const ex = cx + Math.cos(a) * R, ey = cy + Math.sin(a) * R; dot(ctx, ex, ey, 4.5, '#6fa8e6');
    const nx = Math.cos(a), ny = Math.sin(a); line(ctx, [ex + nx * 8, ey + ny * 8, ex + nx * 40, ey + ny * 40], 'rgba(200,215,255,.8)');
    for (let i = 0; i < 14; i++) { const b = (i / 14) * TAU; dot(ctx, cx + Math.cos(b) * (R + 66), cy + Math.sin(b) * (R + 66), 1.6, Math.abs(((b - a + 3 * TAU) % TAU) - 0) < 0.9 || Math.abs(((b - a + 3 * TAU) % TAU) - TAU) < 0.9 ? '#fff1cf' : 'rgba(200,205,215,.4)'); }
    label(ctx, 'The night side faces a different part of space', cx, cy + R + 96, { align: 'center', colour: ACCENT, size: 10 });
    say('Which ones you can see depends on the time of year', 'The winter sky and the summer sky are not the same');
  },
};

// ---- 5. different peoples, different pictures
const NAMES = ['The Plough, in Britain', 'The Big Dipper, in North America', 'A saucepan, in France', 'A wagon, in much of northern Europe', 'The tail and back of a Great Bear, for the ancient Greeks'];
const names: Scene = {
  caption: 'The same seven bright stars, a drawing of the idea. Different peoples saw different pictures in them.',
  stillAt: 3,
  draw({ ctx, w, h, t, say }) {
    backdrop(ctx, w, h, 0.2);
    const W = Math.min(w * 0.5, 240), H = W * 0.7, ox = w / 2 - W / 2, oy = h * 0.1;
    figure(ctx, PLOUGH, PLOUGH_LINES, ox, oy, W, H);
    label(ctx, NAMES[Math.floor(t / 2.6) % NAMES.length], w / 2, oy + H + 34, { align: 'center', colour: ACCENT, size: 10 });
    say('The same seven stars, many pictures', 'Britain, North America, France, northern Europe, ancient Greece');
  },
};

// ---- 6. the biggest and the smallest
const size: Scene = {
  caption: 'The sky as a circle round us, a drawing of the idea and not to scale. The largest constellation, Hydra, winds more than a quarter of the way round the sky. The smallest is Crux, the Southern Cross.',
  stillAt: 5,
  draw({ ctx, w, h, t, say }) {
    backdrop(ctx, w, h, 0.1);
    const cx = w / 2, cy = h * 0.3, R = Math.min(w * 0.3, h * 0.26), k = ease(clamp(t / 3, 0, 1));
    ring(ctx, cx, cy, R, 'rgba(236,231,220,.25)');
    ctx.strokeStyle = '#e9c48a'; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(cx, cy, R, -Math.PI * 0.1, -Math.PI * 0.1 + TAU * 0.28 * k); ctx.stroke(); ctx.lineWidth = 1;
    const a = Math.PI * 0.75; dot(ctx, cx + Math.cos(a) * R, cy + Math.sin(a) * R, 4, '#e6eeff');
    label(ctx, 'Hydra: more than a quarter of the way round', cx, cy + R + 28, { align: 'center', colour: ACCENT, size: 10 });
    label(ctx, 'Crux, the smallest', cx, cy + R + 48, { align: 'center', colour: SOFT, size: 10 });
    say('The biggest and the smallest', 'Hydra winds a quarter of the way round the sky');
  },
};

// ---- 7. finding north
const north: Scene = {
  caption: 'Finding north, a drawing of the idea. The two stars at the end of the Plough’s blade point almost straight at Polaris, the North Star. Polaris sits nearly above the Earth’s north pole, so it stays in the same place all night while the rest of the sky wheels round it.',
  stillAt: 5,
  draw({ ctx, w, h, t, say }) {
    backdrop(ctx, w, h, 0.1);
    const cx = w * 0.55, cy = h * 0.3, S = Math.min(w * 0.5, h * 0.42), rot = t * 0.12, c = Math.cos(rot), s = Math.sin(rot);
    for (let i = 1; i <= 3; i++) ring(ctx, cx, cy, S * i * 0.3, 'rgba(236,231,220,.12)', 1, [3, 6]);
    const P = (x: number, y: number): [number, number] => { const dx = (x - 0.1) * S, dy = (y + 0.55) * S * 0.9; return [cx + dx * c - dy * s, cy + dx * s + dy * c]; };
    const pts = PLOUGH.map(([x, y]) => P(x, y) as [number, number]);
    for (const [a, b] of PLOUGH_LINES) line(ctx, [pts[a][0], pts[a][1], pts[b][0], pts[b][1]], 'rgba(160,190,235,.45)');
    pts.forEach(([x, y]) => dot(ctx, x, y, 2.6, '#e6eeff'));
    line(ctx, [pts[5][0], pts[5][1], cx, cy], 'rgba(233,196,138,.7)'); line(ctx, [pts[6][0], pts[6][1], cx, cy], 'rgba(233,196,138,.7)');
    dot(ctx, cx, cy, 4, '#ffe7a8'); label(ctx, 'Polaris, the North Star', cx, cy + 22, { align: 'center', colour: ACCENT, size: 10 });
    say('Two stars of the Plough point at Polaris', 'It stays put all night while the sky wheels round it');
  },
};

// ---- 8. the patterns will not last
const drift: Scene = {
  caption: 'The Plough in 50,000 years, a drawing of the idea and greatly exaggerated in speed. The stars at its two ends are travelling a different way from the five in the middle, so it bends out of shape.',
  stillAt: 6,
  draw({ ctx, w, h, t, say }) {
    backdrop(ctx, w, h, 0.15);
    const u = (t % 12) / 12, k = ease(clamp((u - 0.15) / 0.6, 0, 1)), W = Math.min(w * 0.5, 240), H = W * 0.7, ox = w / 2 - W / 2 - 20, oy = h * 0.1;
    const pts: [number, number][] = PLOUGH.map(([x, y], i) => (i === 0 || i === 6 ? [x + 0.2 * k, y - 0.1 * k] : [x - 0.06 * k, y + 0.05 * k]));
    figure(ctx, pts, PLOUGH_LINES, ox, oy, W, H);
    label(ctx, k < 0.5 ? 'Today' : 'In 50,000 years', w / 2, oy + H + 34, { align: 'center', colour: ACCENT, size: 10 });
    say('The patterns will not last', 'Stars at the two ends of the Plough move a different way from the middle five');
  },
};

// one picture to each of the twelve steps of the first look: the shapes; not really together; the 88 (Orion photograph);
// which you can see; the 3D view (Southern Cross photograph); different peoples; where the 88 came from; biggest and
// smallest; finding north; the patterns will not last; the common mistakes and their list
export const scenes: Scene[] = [lens, depth, map, seasons, depth, names, map, size, north, drift, depth, seasons];
