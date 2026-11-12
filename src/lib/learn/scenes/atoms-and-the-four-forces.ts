/**
 * Pictures for the lesson "Atoms, and the four forces". The picture of gold atoms is real but is
 * not a photograph. The photographs of the Sun and of a galaxy are real. The chart of strengths
 * uses published figures on an uneven scale. The other two drawings are diagrams.
 */
import { type Scene, SOFT, ACCENT, clamp, ease, label, stars, rng } from '../stage';
import { TAU, photoScene, dot, line } from '../kit';

const backdrop = stars(60, 118);
const GOLD = 'A real picture, but not a photograph: the surface of a crystal of gold, mapped by a scanning tunnelling microscope. Each small bump is one atom. The colour was chosen. By Erwin Rossen, Eindhoven University of Technology, 2006, released into the public domain.';

export const lens = photoScene({ src: '/img/learn/gold-atoms-stm.jpg', caption: GOLD, say: ['', ''], hero: true, cover: true, zoom: [1, 1.1], focus: [0.5, 0.5], tag: 'Microscope picture' });

const gold = photoScene({ src: '/img/learn/gold-atoms-stm.jpg', caption: GOLD, say: ['Atoms of gold', 'Each bump is one atom, a ten-millionth of a millimetre across'], zoom: [0.9, 1.05], focus: [0.5, 0.5], tag: 'Microscope picture' });

// ---- 2. inside an atom
const C = rng(6);
const CLOUD = Array.from({ length: 420 }, () => { const r = Math.sqrt(-2 * Math.log(1 - C() * 0.98)) * 0.42, a = C() * TAU; return { r, a, s: 0.4 + C() }; });
const inside: Scene = {
  caption: 'A diagram, not to scale. The haze is where the electrons are likely to be found. The dot in the middle is the nucleus, drawn thousands of times too big: at its true size it would be far too small to see here.',
  stillAt: 3,
  draw({ ctx, w, h, t, say }) {
    backdrop(ctx, w, h, 0.2);
    const cx = w / 2, cy = h * 0.4, R = Math.min(w * 0.3, h * 0.3);
    for (const p of CLOUD) { const a = p.a + t * 0.25 * p.s, r = p.r * R * (1 + 0.04 * Math.sin(t * 2 + p.a * 7)); ctx.fillStyle = `rgba(150,198,255,${0.85 - p.r * 0.45})`; ctx.fillRect(cx + Math.cos(a) * r, cy + Math.sin(a) * r, 2.2, 2.2); }
    dot(ctx, cx, cy, 3, ACCENT);
    const lx = cx + R * 0.75, wide = w > 560;
    line(ctx, [cx + 4, cy - 3, cx + R * 0.45, cy - R * 0.6], 'rgba(236,231,220,.5)');
    label(ctx, 'The nucleus', cx + R * 0.45 + 5, cy - R * 0.6 - 8, { align: 'left', colour: ACCENT }); label(ctx, 'protons and neutrons', cx + R * 0.45 + 5, cy - R * 0.6 + 8, { align: 'left', colour: SOFT, size: 11 });
    label(ctx, 'Electrons', wide ? lx + 30 : cx - R * 0.2, wide ? cy + R * 0.5 : cy + R + 14, { align: wide ? 'left' : 'right', colour: 'rgba(160,200,255,1)' });
    say('Mostly empty', 'Nearly all the mass is in a speck at the centre');
  },
};

// ---- 3. the number of protons makes the element
const KINDS: [string, number, number][] = [['Hydrogen', 1, 0], ['Helium', 2, 2], ['Carbon', 6, 6], ['Oxygen', 8, 8]];
function nucleus(ctx: CanvasRenderingContext2D, x: number, y: number, p: number, n: number, s: number, t: number): void {
  const N = p + n; let placed = 0;
  for (let i = 0; i < N; i++) {
    // spread the protons evenly through the pile
    const isP = Math.floor(((i + 1) * p) / N) > placed; if (isP) placed++;
    const r = N === 1 ? 0 : Math.sqrt((i + 0.5) / N) * s * Math.sqrt(N) * 0.62, a = i * 2.39996 + t * 0.2;
    dot(ctx, x + Math.cos(a) * r, y + Math.sin(a) * r, s * 0.55, isP ? '#e0795b' : '#9aa3ad');
  }
}
const kinds: Scene = {
  caption: 'A diagram of four kinds of nucleus, not to scale. Red balls are protons and grey balls are neutrons. The number of protons decides which element it is. The commonest form of each is shown.',
  stillAt: 5,
  draw({ ctx, w, h, t, say }) {
    backdrop(ctx, w, h, 0.2);
    const s = Math.min(w * 0.022, h * 0.04), y = h * 0.36;
    KINDS.forEach(([name, p, n], i) => {
      const k = ease(clamp((t - 0.3 - i * 0.8) / 0.8, 0, 1)), x = w * (0.14 + i * 0.24);
      if (k <= 0) return;
      ctx.globalAlpha = k; nucleus(ctx, x, y, p, n, s, t); ctx.globalAlpha = 1;
      label(ctx, name, x, y + s * 4.2 + 12, { align: 'center', colour: '#fff', size: w > 560 ? 13 : 11 }); label(ctx, p === 1 ? '1 proton' : `${p} protons`, x, y + s * 4.2 + 28, { align: 'center', colour: ACCENT, size: 11 });
    });
    say('Count the protons', 'One is hydrogen, two is helium, six is carbon, eight is oxygen');
  },
};

// ---- 4. the four forces
const FORCES: [string, number, string][] = [['Strong', 0, 'glues the nucleus'], ['Electric and magnetic', -2.14, 'holds atoms together'], ['Weak', -4.99, 'changes particles'], ['Gravity', -38.2, 'pulls all matter']];
const forces: Scene = {
  caption: 'A chart of the strengths of the four forces between particles very close together, with the strong force as 1. The scale is not an even one: each faint upright line marks a strength a million times weaker than the one to its right. Gravity is about 6 parts in a thousand million million million million million million. The figures are rough and depend on how the comparison is made.',
  stillAt: 6,
  draw({ ctx, w, h, t, say }) {
    backdrop(ctx, w, h, 0.2);
    const wide = w > 560, x0 = w * 0.07, x1 = w * 0.93, top = h * 0.07, rowH = (h * 0.64) / 4, X = (e: number) => x0 + ((e + 42) / 42) * (x1 - x0);
    for (let e = -36; e <= 0; e += 6) line(ctx, [X(e), top, X(e), top + rowH * 4], 'rgba(236,231,220,.1)');
    FORCES.forEach(([name, e, does], i) => {
      const k = ease(clamp((t - 0.3 - i * 0.9) / 1, 0, 1)), y = top + i * rowH, bh = Math.max(4, rowH * 0.26);
      ctx.fillStyle = i === 3 ? ACCENT : 'rgba(233,196,138,.6)'; ctx.fillRect(x0, y + rowH * 0.56, (X(e) - x0) * k, bh);
      if (k > 0.05) { label(ctx, name, x0, y + rowH * 0.3, { align: 'left', colour: '#fff', size: wide ? 12 : 11 }); label(ctx, does, x1, y + rowH * 0.3, { align: 'right', colour: SOFT, size: wide ? 12 : 10 }); }
    });
    say('Four forces, wildly unequal', 'Gravity is the weakest by far');
  },
};

const sunPhoto = photoScene({
  src: '/img/learn/sun-sunspots-sdo.jpg',
  caption: 'A real photograph: the Sun in ordinary light in October 2014, by NASA’s Solar Dynamics Observatory. The dark patches are sunspots. Credit: NASA/SDO.',
  say: ['A tug of war between the forces', 'Hydrogen becomes helium, and mass becomes light'], zoom: [0.9, 1.05], focus: [0.5, 0.5],
});

const galaxy = photoScene({
  src: '/img/learn/whirlpool-m51-hubble.jpg',
  caption: 'A real photograph: the Whirlpool Galaxy, M51, 25 million light years away, by the Hubble Space Telescope in January 2005. The colour is built from pictures taken through separate filters. Credit: NASA, ESA, S. Beckwith (STScI) and the Hubble Heritage Team (STScI/AURA), CC BY 4.0.',
  say: ['Why the weakest force rules the sky', 'Gravity never cancels, and reaches for ever'], cover: true, zoom: [1, 1.12], focus: [0.5, 0.5],
});

export const scenes: Scene[] = [gold, inside, kinds, forces, sunPhoto, galaxy];
