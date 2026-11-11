/**
 * Pictures for the lesson "What counts as a planet". The photographs are real, with their colours
 * strengthened where the captions say so. The line-up is drawn to scale from the published widths. The
 * belt beyond Neptune is a drawing of the idea: the orbits of Neptune, Pluto and Eris are at their real
 * average sizes, but the small bodies are made up and every body is drawn far too large.
 */
import { type Scene, INK, SOFT, FAINT, ACCENT, clamp, label, stars, rng, nf } from '../stage';
import { TAU, photoScene, globe, sun, dot, line, ring } from '../kit';

const backdrop = stars(140, 58);
const NH = 'Credit: NASA/Johns Hopkins University Applied Physics Laboratory/Southwest Research Institute.';

export const lens = photoScene({
  src: '/img/learn/pluto-new-horizons.jpg',
  caption: `A real photograph: Pluto on 14 July 2015, by NASA’s New Horizons spacecraft, with its colours strengthened. ${NH}`,
  say: ['', ''], hero: true, zoom: [1, 1.08], focus: [0.5, 0.5],
});

// ---- 1. the ninth planet
const pluto = photoScene({
  src: '/img/learn/pluto-new-horizons.jpg',
  caption: `A real photograph: Pluto, by NASA’s New Horizons spacecraft. The colours have been strengthened to show the differences across the surface. ${NH}`,
  say: ['Pluto: a planet from 1930 to 2006', 'It has not changed. The meaning of the word has'],
  zoom: [0.96, 1.04],
});

// ---- 2. the odd one out, to scale
const SIZES: [string, number, string][] = [['The Earth', 12742, ''], ['The Moon', 3476, '#b9b6ae'], ['Pluto', 2377, '#c9a98c'], ['Eris', 2326, '#d8d4cc'], ['Haumea', 2322, '#cfcac0'], ['Makemake', 1430, '#b98a6a'], ['Ceres', 952, '#8d8a84']];
const lineUp: Scene = {
  caption: 'The Earth, the Moon and the five named dwarf planets, drawn to scale by width. Haumea is stretched like an egg, and is drawn at its greatest length and its least width. A drawing.',
  stillAt: 1,
  draw({ ctx, w, h, t, say }) {
    backdrop(ctx, w, h, 0.45);
    const narrow = w < 520, km = (narrow ? h * 0.36 : Math.min(h * 0.6, w * 0.34)) / 12742, base = h * (narrow ? 0.5 : 0.72), i = Math.floor(t / 2.6) % 6 + 1;
    // the Earth, part of it, on the left
    const re = 6371 * km, ex = narrow ? w * 0.5 : w * 0.02 + re, ey = narrow ? base - re : base - re; globe(ctx, ex, ey, re);
    label(ctx, 'The Earth', ex, narrow ? ey - re - 10 : base + 16, { align: 'center' });
    const rest = SIZES.slice(1), gap = narrow ? w * 0.03 : w * 0.035; let x = narrow ? w * 0.05 : w * 0.04 + re * 2 + gap; const y = narrow ? h * 0.78 : base;
    rest.forEach(([name, wide, colour], j) => {
      const r = (wide / 2) * km; x += r;
      if (name === 'Haumea') { const ry = 513 * km; ctx.fillStyle = colour; ctx.beginPath(); ctx.ellipse(x, y - ry, r, ry, 0, 0, TAU); ctx.fill(); if (j + 1 === i) { ctx.strokeStyle = ACCENT; ctx.lineWidth = 1; ctx.beginPath(); ctx.ellipse(x, y - ry, r + 4, ry + 4, 0, 0, TAU); ctx.stroke(); } }
      else { dot(ctx, x, y - r, r, colour); if (j + 1 === i) ring(ctx, x, y - r, r + 4, ACCENT); }
      label(ctx, name, x, y + 14 + (j % 2 ? 12 : 0), { align: 'center', colour: j + 1 === i ? ACCENT : SOFT }); x += r + gap;
    });
    const [name, wide] = SIZES[i];
    say(`${name}: ${wide === 2322 || wide < 2000 ? 'about ' : ''}${nf(wide === 2322 ? 2300 : wide)} kilometres ${name === 'Haumea' ? 'long' : 'wide'}`, name === 'Pluto' ? 'Two thirds the width of our Moon' : name === 'The Moon' ? 'Our own Moon is bigger than every dwarf planet' : name === 'Eris' ? 'Very nearly the size of Pluto, and further out' : name === 'Haumea' ? 'Spun into the shape of an egg' : 'A dwarf planet');
  },
};

// ---- 3. it has company
const crowd = (() => { const r = rng(14); return Array.from({ length: 260 }, () => ({ a: r() * TAU, d: 36 + r() * 14 + (r() < 0.12 ? r() * 20 : 0), s: 0.6 + r() * 1.1, v: 0.6 + r() * 0.5 })); })();
const beltScene: Scene = {
  caption: 'The outer Solar System from above. The orbits of Neptune, Pluto and Eris are drawn at their real average sizes as plain circles, which the real orbits are not, and the small icy bodies are made up to show the crowd. Nothing here is to scale in size. A drawing of the idea.',
  stillAt: 3,
  draw({ ctx, w, h, t, say }) {
    backdrop(ctx, w, h, 0.35);
    const cx = w / 2, cy = h * 0.48, au = Math.min(w * 0.47, h * 0.45) / 70;
    sun(ctx, cx, cy, 3, 1);
    for (const c of crowd) { const a = c.a + t * 0.02 * c.v; dot(ctx, cx + Math.cos(a) * c.d * au, cy + Math.sin(a) * c.d * au, c.s, 'rgba(190,205,225,.5)'); }
    const round = (r: number, speed: number, phase: number, colour: string, name: string, size: number) => {
      ring(ctx, cx, cy, r * au, 'rgba(236,231,220,.2)');
      const a = phase - t * speed, x = cx + Math.cos(a) * r * au, y = cy + Math.sin(a) * r * au; dot(ctx, x, y, size, colour); label(ctx, name, x + size + 5, y - size - 4, { colour: name === 'Neptune' ? SOFT : ACCENT });
    };
    round(30.1, 0.05, 0.6, '#5b83d6', 'Neptune', 5); round(39.5, 0.033, 2.4, '#c9a98c', 'Pluto', 2.6); round(68, 0.015, 4.3, '#d8d4cc', 'Eris', 2.6);
    say('Beyond Neptune there is a belt of icy bodies', 'Pluto and Eris share it with a great many others');
  },
};

// ---- 4. the three tests
const TESTS = ['Goes round the Sun', 'Pulled into a ball by its own gravity', 'Has cleared its path'];
const BODIES: [string, boolean[], string][] = [['The Earth', [true, true, true], 'A planet'], ['Pluto', [true, true, false], 'A dwarf planet'], ['Ceres', [true, true, false], 'A dwarf planet'], ['A small asteroid', [true, false, false], 'A small body']];
const testScene: Scene = {
  caption: 'The three tests the International Astronomical Union agreed in August 2006, tried on four bodies. A drawing.',
  stillAt: 30,
  draw({ ctx, w, h, t, say }) {
    const narrow = w < 520, x0 = w * 0.06, c0 = w * (narrow ? 0.4 : 0.34), cw = (w * 0.94 - c0) / 3, y0 = h * 0.2, rh = Math.min(h * 0.13, 44), n = Math.floor(clamp(t / 1.1, 0, 12)), row = Math.min(3, Math.floor(n / 3));
    TESTS.forEach((name, j) => { label(ctx, `${j + 1}`, c0 + cw * (j + 0.5), y0 - rh * 0.9, { align: 'center', colour: ACCENT }); label(ctx, `${j + 1}  ${name}`, x0, y0 + rh * 3.75 + j * 14, { colour: SOFT }); });
    BODIES.forEach(([name, marks, verdict], i) => {
      const y = y0 + i * rh; line(ctx, [x0, y - rh / 2, w * 0.94, y - rh / 2], 'rgba(236,231,220,.12)');
      label(ctx, name, x0, y - 4, { colour: i === row ? INK : SOFT });
      marks.forEach((ok, j) => {
        if (i * 3 + j >= n) return; const cx = c0 + cw * (j + 0.5);
        if (ok) { line(ctx, [cx - 7, y, cx - 2, y + 6], '#9fd6a0', 2); line(ctx, [cx - 2, y + 6, cx + 8, y - 7], '#9fd6a0', 2); } else { line(ctx, [cx - 6, y - 6, cx + 6, y + 6], '#e08a7a', 2); line(ctx, [cx + 6, y - 6, cx - 6, y + 6], '#e08a7a', 2); }
      });
      if (n >= i * 3 + 3) label(ctx, verdict, x0, y + 9, { colour: verdict === 'A planet' ? ACCENT : FAINT });
    });
    say(n >= 12 ? 'All three, or it is not a planet' : BODIES[row][0], n >= 12 ? 'Pluto passes two and fails the third' : TESTS[Math.min(2, n % 3)]);
  },
};

// ---- 5. it had happened before
const ceres = photoScene({
  src: '/img/learn/ceres-dawn.jpg',
  caption: 'A real photograph: Ceres, pieced together from pictures by NASA’s Dawn spacecraft. Credit: NASA/JPL-Caltech/UCLA/MPS/DLR/IDA.',
  say: ['Ceres: a planet, then an asteroid, now a dwarf planet', 'Found in 1801, and about 950 kilometres wide'],
  zoom: [0.96, 1.04],
});

// ---- 6. still a world
const charon = photoScene({
  src: '/img/learn/charon-new-horizons.jpg',
  caption: `A real photograph: Charon, the largest of Pluto’s five moons and about half as wide as Pluto itself, by NASA’s New Horizons spacecraft, with its colours strengthened. ${NH}`,
  say: ['Charon, the biggest of Pluto’s five moons', 'Seen close up for the first time in July 2015'],
  zoom: [0.96, 1.04],
});

export const scenes: Scene[] = [pluto, lineUp, beltScene, testScene, ceres, charon];
