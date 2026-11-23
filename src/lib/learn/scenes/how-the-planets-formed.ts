/**
 * Pictures for the lesson "How the planets formed", one to each step of its first look. All of them are
 * drawings of the idea, with the dust and bodies placed at random and not to scale. The only figures they
 * state are the lesson's: more than 99 parts in 100 of the cloud went to the Sun, the disc of gas lasted a
 * few million years, the Earth took some tens of millions, and the oldest meteorite grains are 4,567
 * million years old.
 */
import { type Scene, SOFT, ACCENT, FAINT, clamp, ease, label, stars, rng } from '../stage';
import { TAU, dot, line, ring } from '../kit';

const backdrop = stars(110, 4601);
const room = (w: number) => (w > 760 ? w * 0.34 : 0);

const DUST = (() => { const r = rng(5); return Array.from({ length: 260 }, () => { const a = r() * TAU, d = 0.12 + Math.pow(r(), 0.8) * 0.88, q = r() * TAU, f = Math.sqrt(r()); return { a, d, cx: Math.cos(q) * f, cy: Math.sin(q) * f, b: r() }; }); })();
const place = (p: (typeof DUST)[number], k: number, t: number, R: number, cx: number, cy: number) => {
  const a = p.a + t * 0.25 * Math.pow(p.d, -1.5) * 0.12;
  const q = t * 0.06, rx = p.cx * Math.cos(q) - p.cy * Math.sin(q), ry = p.cx * Math.sin(q) + p.cy * Math.cos(q);
  const x = (1 - k) * rx + k * Math.cos(a) * p.d, y = (1 - k) * ry + k * Math.sin(a) * p.d * 0.3;
  return [cx + x * R, cy + y * R] as const;
};

// ---- 1. one cloud makes the Sun and its planets (the hero): a flat disc with lanes opening
export const lens: Scene = {
  caption: 'The Sun and its planets all began as one cloud of gas and dust, about 4.6 billion years ago. A drawing of the idea, not a real picture: a flat disc round the young Sun, with dark gaps that planets may sweep clear. The dust is placed at random.',
  stillAt: 6,
  draw({ ctx, w, h, t, say }) {
    backdrop(ctx, w, h, 0.25);
    const rx = room(w), cx = rx + (w - rx) / 2, cy = h * (rx ? 0.46 : 0.3), R = Math.min((w - rx) * 0.4, h * (rx ? 0.5 : 0.4));
    for (const p of DUST) { if (p.d > 0.42 && p.d < 0.5 || p.d > 0.74 && p.d < 0.82) continue; const [x, y] = place(p, 1, t, R, cx, cy); dot(ctx, x, y, 0.8 + p.b * 1.1, `rgba(235,200,160,${0.25 + p.b * 0.5})`); }
    const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, R * 0.18); g.addColorStop(0, 'rgba(255,235,180,1)'); g.addColorStop(1, 'rgba(255,200,100,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, R * 0.18, 0, TAU); ctx.fill();
    label(ctx, 'A young Sun in a disc of gas and dust', cx, cy + R * 0.3 + 34, { align: 'center', colour: ACCENT, size: 10 });
    say('The Sun and its planets began as one cloud', 'About 4.6 billion years ago');
  },
};

// ---- 2. the turning cloud flattens
const flatten: Scene = {
  caption: 'A turning cloud shrinking, a drawing of the idea and greatly speeded up. Most of it falls to the middle and becomes the Sun. The rest cannot fall straight in because the cloud is turning, so it spreads into a wide, flat disc.',
  stillAt: 8,
  draw({ ctx, w, h, t, say }) {
    backdrop(ctx, w, h, 0.25);
    const cx = w / 2, cy = h * 0.42, R = Math.min(w * 0.4, h * 0.34), u = (t % 16) / 16, k = ease(clamp((u - 0.1) / 0.6, 0, 1)), fade = 1 - ease(clamp((u - 0.92) / 0.08, 0, 1));
    ctx.globalAlpha = fade;
    for (const p of DUST) { const [x, y] = place(p, k, t, R * (1 - 0.2 * k), cx, cy); dot(ctx, x, y, 0.8 + p.b * 1.1, `rgba(235,200,160,${0.25 + p.b * 0.5})`); }
    const s = ctx.createRadialGradient(cx, cy, 0, cx, cy, R * 0.16 * (0.4 + 0.6 * k)); s.addColorStop(0, `rgba(255,235,180,${0.2 + 0.8 * k})`); s.addColorStop(1, 'rgba(255,200,100,0)');
    ctx.fillStyle = s; ctx.beginPath(); ctx.arc(cx, cy, R * 0.16, 0, TAU); ctx.fill(); ctx.globalAlpha = 1;
    label(ctx, k < 0.5 ? 'A turning cloud shrinks' : 'It spreads into a flat disc', cx, cy + R + 24, { align: 'center', colour: ACCENT, size: 10 });
    say('The cloud was slowly turning', 'It could not fall straight in, so it spread into a disc');
  },
};

// ---- 3. specks stick together
const BITS = (() => { const r = rng(23); return Array.from({ length: 70 }, (_, i) => ({ a: r() * TAU, d: 0.25 + r() * 0.7, win: i < 5, at: r() * 0.7 })); })();
const grow: Scene = {
  caption: 'Dust grains bumping and sticking in the disc, a drawing of the idea and enormously speeded up. Specks become pebbles, pebbles become boulders and boulders become lumps the size of mountains. The biggest lumps pull in the others with their gravity and grow into planets.',
  stillAt: 10,
  draw({ ctx, w, h, t, say }) {
    backdrop(ctx, w, h, 0.2);
    const cx = w / 2, cy = h * 0.4, R = Math.min(w * 0.42, h * 0.34), u = (t % 18) / 18, stage = u < 0.25 ? 'Specks' : u < 0.5 ? 'Pebbles' : u < 0.75 ? 'Boulders' : 'Planets';
    for (const b of BITS) {
      const a = b.a + t * 0.08 * Math.pow(b.d, -1.5) * 0.3, k = ease(clamp((u - 0.05) / 0.85, 0, 1));
      if (!b.win && k > 0.2 + b.at * 0.7) continue;
      const r = b.win ? 1.2 + k * 8 : 1 + k * 3;
      dot(ctx, cx + Math.cos(a) * b.d * R, cy + Math.sin(a) * b.d * R * 0.3, r, b.win && k > 0.7 ? '#e9c48a' : 'rgba(235,200,160,.75)');
    }
    label(ctx, stage, cx, cy + R * 0.3 + 30, { align: 'center', colour: ACCENT, size: 10 });
    say('Grains of dust bumped and stuck', 'The biggest lumps pulled in the rest and grew into planets');
  },
};

// ---- 4. the planets go round the same way
const PL: [number, string][] = [[0.22, '#b8aaa0'], [0.34, '#e8c98f'], [0.46, '#6fa8e6'], [0.58, '#d27a5c'], [0.78, '#e0b98a'], [0.95, '#b9c8d8']];
const orbits: Scene = {
  caption: 'The planets seen from above, a drawing of the idea: all going round the Sun the same way, and below, seen edge on, nearly all in the same flat plane. Not to scale. They are what is left of the disc.',
  stillAt: 4,
  draw({ ctx, w, h, t, say }) {
    backdrop(ctx, w, h, 0.2);
    const cx = w / 2, cy = h * 0.32, R = Math.min(w * 0.36, h * 0.26);
    dot(ctx, cx, cy, 6, '#ffe7a8');
    PL.forEach(([d, c], i) => { ring(ctx, cx, cy, d * R, 'rgba(236,231,220,.16)'); const a = t * 0.5 * Math.pow(d, -1.5) * 0.4 + i * 1.3; dot(ctx, cx + Math.cos(a) * d * R, cy + Math.sin(a) * d * R, 3.2, c); });
    label(ctx, 'Seen from above: all the same way round', cx, cy + R + 22, { align: 'center', colour: ACCENT, size: 10 });
    const ey = cy + R + 64; line(ctx, [cx - R, ey, cx + R, ey], 'rgba(236,231,220,.18)'); dot(ctx, cx, ey, 4, '#ffe7a8');
    PL.forEach(([d, c], i) => dot(ctx, cx + (i % 2 ? 1 : -1) * d * R, ey + Math.sin(i * 2.1) * 2, 2.6, c));
    label(ctx, 'Edge on: nearly one flat plane', cx, ey + 22, { align: 'center', colour: SOFT, size: 10 });
    say('The planets all go round the same way', 'Nearly in one flat plane: they are what is left of the disc');
  },
};

// ---- 5. nearly everything went to the Sun
const share: Scene = {
  caption: 'Every hundred parts of the cloud, a drawing of the idea. More than 99 of them ended up in the Sun. All the planets, moons, asteroids and comets together are the scraps.',
  stillAt: 6,
  draw({ ctx, w, h, t, say }) {
    backdrop(ctx, w, h, 0.2);
    const S = Math.min(w * 0.62, h * 0.4), x0 = (w - S) / 2, y0 = h * 0.14, c = S / 10, k = clamp(t / 3, 0, 1);
    for (let i = 0; i < 100; i++) { const on = i / 100 < k; ctx.fillStyle = on ? 'rgba(255,214,130,.8)' : 'rgba(236,231,220,.08)'; ctx.fillRect(x0 + (i % 10) * c + 1, y0 + Math.floor(i / 10) * c + 1, c - 2, c - 2); }
    ctx.fillStyle = 'rgba(160,190,230,.95)'; ctx.fillRect(x0 + S + 8, y0 + S - 4, 4, 4);
    label(ctx, 'More than 99 parts in 100: the Sun', w / 2, y0 + S + 24, { align: 'center', colour: ACCENT, size: 10 });
    label(ctx, 'The rest (blue, drawn larger than it is): planets, moons, asteroids, comets', w / 2, y0 + S + 44, { align: 'center', colour: SOFT, size: 10 });
    say('The Sun took nearly everything', 'More than 99 parts in every 100');
  },
};

// ---- 6. rock near the Sun, giants far out
const frost: Scene = {
  caption: 'Why the planets differ, a drawing of the idea and not to scale. Near the young Sun it was too hot for ice, so only rock and metal could stay solid and the planets are small and rocky. Further out ice could stay solid too, there was far more to build from, and the planets grew big enough to pull in gas.',
  stillAt: 5,
  draw({ ctx, w, h, say }) {
    backdrop(ctx, w, h, 0.2);
    const y = h * 0.34, x0 = w * 0.14, xs = w * 0.4, x1 = w * 0.92, narrow = w < 600;
    const g = ctx.createRadialGradient(x0 - 14, y, 0, x0 - 14, y, 28); g.addColorStop(0, 'rgba(255,235,180,1)'); g.addColorStop(1, 'rgba(255,200,100,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x0 - 14, y, 28, 0, TAU); ctx.fill();
    // the three labels above the line stay inside a short picture: the frost line's name first, then the two sides under it
    const fy = Math.max(10, y - 100), hy = fy + 16;
    line(ctx, [xs, hy + 10, xs, y + 70], 'rgba(236,231,220,.35)');
    [[0.3, 3], [0.5, 3.5], [0.7, 4], [0.85, 4.5]].forEach(([f, r]) => dot(ctx, x0 + (xs - x0) * f, y, r, '#c9a98a'));
    [[0.3, 11], [0.6, 14], [0.85, 9]].forEach(([f, r]) => dot(ctx, xs + (x1 - xs) * f, y, r, '#9fc0d8'));
    label(ctx, 'Frost line', xs, fy, { align: 'center', colour: FAINT, size: 9 });
    if (narrow) {
      // on a phone the two sides are too narrow to centre long labels in, so each hugs the frost line from its own side, on two lines
      label(ctx, 'Too hot for ice', xs - 6, hy, { align: 'right', colour: SOFT, size: 10 });
      label(ctx, 'Cold enough for ice too', xs + 6, hy, { align: 'left', colour: SOFT, size: 10 });
      label(ctx, 'Rock and metal:', xs - 6, y + 90, { align: 'right', colour: ACCENT, size: 10 });
      label(ctx, 'small planets', xs - 6, y + 104, { align: 'right', colour: ACCENT, size: 10 });
      label(ctx, 'More to build', xs + 6, y + 90, { align: 'left', colour: ACCENT, size: 10 });
      label(ctx, 'from: giants', xs + 6, y + 104, { align: 'left', colour: ACCENT, size: 10 });
    } else {
      label(ctx, 'Too hot for ice', (x0 + xs) / 2, hy, { align: 'center', colour: SOFT, size: 10 });
      label(ctx, 'Rock and metal only: small, rocky planets', (x0 + xs) / 2, y + 96, { align: 'center', colour: ACCENT, size: 10 });
      label(ctx, 'Cold enough for ice too', (xs + x1) / 2, hy, { align: 'center', colour: SOFT, size: 10 });
      label(ctx, 'Far more to build from: giant planets', (xs + x1) / 2, y + 96, { align: 'center', colour: ACCENT, size: 10 });
    }
    say('Rock near the Sun, giants far out', 'Ice could stay solid only where it was cold');
  },
};

// ---- 7. how anyone knows when: a radioactive clock
const clock: Scene = {
  caption: 'A radioactive clock, a drawing of the idea. Radioactive atoms in a meteorite decay at a steady rate, so counting what is left tells how long ago the rock formed. The oldest grains come out at 4,567 million years, when 49 in 100 of the uranium they started with is still there.',
  stillAt: 8,
  draw({ ctx, w, h, t, say }) {
    backdrop(ctx, w, h, 0.2);
    const cx = w / 2, cy = h * 0.34, R = Math.min(w * 0.22, h * 0.2), k = 0.51 * ease(clamp((t % 14) / 10, 0, 1));
    ring(ctx, cx, cy, R, 'rgba(236,231,220,.4)', 1.5);
    for (let i = 0; i < 12; i++) { const a = (i / 12) * TAU - Math.PI / 2; line(ctx, [cx + Math.cos(a) * R * 0.88, cy + Math.sin(a) * R * 0.88, cx + Math.cos(a) * R, cy + Math.sin(a) * R], 'rgba(236,231,220,.4)'); }
    const a = -Math.PI / 2 + k * TAU; line(ctx, [cx, cy, cx + Math.cos(a) * R * 0.8, cy + Math.sin(a) * R * 0.8], '#e9c48a', 2);
    const n = 24; for (let i = 0; i < n; i++) { const left = i / n > k; dot(ctx, cx - R + (i % 8) * (2 * R / 7), cy + R + 26 + Math.floor(i / 8) * 14, 3.2, left ? '#e9c48a' : 'rgba(159,192,216,.7)'); }
    label(ctx, 'Gold: uranium left. Blue: turned into lead', cx, cy + R + 26 + 56, { align: 'center', colour: SOFT, size: 10 });
    if (k > 0.5) label(ctx, '4,567 million years: 49 in 100 left', cx, cy + R + 26 + 80, { align: 'center', colour: ACCENT, size: 11 });
    say('Radioactive atoms work like a clock', 'The oldest meteorite grains come out at 4,567 million years');
  },
};

// ---- 8. how long it took
const time: Scene = {
  caption: 'How long it took, bars drawn very roughly in proportion: the disc of gas lasted only a few million years, and the giant planets had to be finished before it went. The Earth took longer, some tens of millions of years.',
  stillAt: 5,
  draw({ ctx, w, h, t, say }) {
    backdrop(ctx, w, h, 0.2);
    const x0 = w * 0.08, W = w * 0.84, y0 = h * 0.2, k = ease(clamp(t / 2.5, 0, 1));
    const rows: [string, number][] = [['The disc of gas: a few million years', 0.1], ['The Earth: some tens of millions of years', 1]];
    rows.forEach(([name, f], i) => { const y = y0 + i * 80; label(ctx, name, x0, y - 12, { align: 'left', colour: SOFT, size: 10 }); ctx.fillStyle = i ? 'rgba(111,168,230,.8)' : 'rgba(233,196,138,.85)'; ctx.fillRect(x0, y, W * f * k, 14); });
    say('Very little time, for something so old', 'The gas went first, the Earth took longer');
  },
};

// one picture to each step of the first look, in order (thirteen steps; a photograph shares the step of the
// paragraph after it): the cloud; the turning cloud; the dust photograph with sticking grains; the planet
// photograph with why the planets go the same way; where the cloud came from; why a disc; the Sun took nearly
// everything; rock and giants; the leftovers; how anyone knows when; how long; the common mistakes and their list.
export const scenes: Scene[] = [lens, flatten, grow, orbits, lens, flatten, share, frost, orbits, clock, time, orbits, orbits];
