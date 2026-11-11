/**
 * Pictures for the lesson "The stuff between the stars". The four photographs are real. The two
 * cubes and the hydrogen atom are drawings of the idea: nothing so small can be drawn to scale.
 */
import { type Scene, SOFT, ACCENT, clamp, ease, label, stars, rng } from '../stage';
import { TAU, photoScene, dot, line } from '../kit';

const backdrop = stars(110, 257);

export const lens = photoScene({
  src: '/img/learn/barnard-68-visible-vlt.jpg',
  caption: 'A real photograph: the dark cloud Barnard 68, 410 light years away, taken with the Very Large Telescope in Chile. The black patch is a cloud of gas and dust hiding the stars behind it. Credit: ESO, CC BY 4.0.',
  say: ['', ''], hero: true, cover: true, zoom: [1, 1.08], focus: [0.45, 0.5],
});

// ---- 1. the dark lanes
const lanes = photoScene({
  src: '/img/learn/milky-way-panorama-eso.jpg',
  caption: 'A real photograph: the whole Milky Way, pieced together over several months. The dark lanes along the middle are dust in front of the stars. Credit: ESO/S. Brunier, CC BY 4.0.',
  say: ['The dark rifts are not gaps', 'They are clouds of dust, hiding the stars behind'],
  cover: true, zoom: [1.6, 2], focus: [0.5, 0.5],
});

// ---- 2. how empty
const AIR = (() => { const r = rng(5); return Array.from({ length: 900 }, () => [r(), r(), r()] as [number, number, number]); })();
const empty: Scene = {
  caption: 'Two cubes one centimetre across. The one on the left is full of air and holds about 25 million million million molecules, far more than can be drawn. The one on the right is an average piece of the space between the stars and holds about one atom. A drawing of the idea.',
  stillAt: 3,
  draw({ ctx, w, h, t, say }) {
    backdrop(ctx, w, h, 0.3);
    const s = Math.min(w * 0.3, h * 0.44), y = h * 0.1, k = ease(clamp(t / 2, 0, 1));
    [w * 0.27, w * 0.73].forEach((cx, i) => {
      const x = cx - s / 2; ctx.strokeStyle = 'rgba(236,231,220,.6)'; ctx.lineWidth = 1.2; ctx.strokeRect(x, y, s, s);
      if (i === 0) for (let n = 0; n < AIR.length * k; n++) { const [a, b, c] = AIR[n]; dot(ctx, x + 3 + ((a + Math.sin(t * 2 + n) * 0.01) * (s - 6)), y + 3 + ((b + Math.cos(t * 2 + n * 1.3) * 0.01) * (s - 6)), 0.9 + c * 0.6, `rgba(190,215,240,${0.35 + c * 0.5})`); }
      else dot(ctx, x + s * (0.5 + 0.25 * Math.sin(t * 0.3)), y + s * (0.5 + 0.2 * Math.cos(t * 0.23)), 2.4, ACCENT);
      label(ctx, i ? 'Between the stars' : 'Air', cx, y + s + 18, { align: 'center', colour: i ? ACCENT : SOFT });
      label(ctx, i ? 'About 1 atom' : '10,000,000,000,000,000,000', cx, y + s + 36, { align: 'center', size: w > 560 ? 11 : 9 });
    });
    say('Emptier than any vacuum made on the Earth', 'One atom, against 25 million million million in air');
  },
};

// ---- 3 and 4. one cloud, two kinds of light
const b68 = photoScene({
  src: '/img/learn/barnard-68-visible-vlt.jpg',
  caption: 'A real photograph in visible light: the dark cloud Barnard 68, taken with the Very Large Telescope in Chile in March 1999. Credit: ESO, CC BY 4.0.',
  say: ['Barnard 68', 'A cloud of cold gas and dust, twice the mass of the Sun'], zoom: [0.85, 1], focus: [0.5, 0.5],
});
const b68ir = photoScene({
  src: '/img/learn/barnard-68-infrared-eso.jpg',
  caption: 'The same cloud in a real picture that adds infrared light, shown in red, to two colours of visible light. The stars behind the cloud show through, reddened by the dust. The colours were chosen for the picture. Credit: ESO, CC BY 4.0.',
  say: ['The same cloud, with infrared added', 'About 3,700 stars counted through it'], zoom: [0.85, 1], focus: [0.5, 0.5], tag: 'Visible and infrared',
});

// ---- 5. the radio signal of hydrogen
const arrow = (ctx: CanvasRenderingContext2D, x: number, y: number, len: number, up: number, colour: string) => {
  const y1 = y - len * up; line(ctx, [x, y + len * up, x, y1], colour, 2); ctx.fillStyle = colour; ctx.beginPath(); ctx.moveTo(x, y1 - 6 * up); ctx.lineTo(x - 5, y1 + 2 * up); ctx.lineTo(x + 5, y1 + 2 * up); ctx.fill();
};
const flip: Scene = {
  caption: 'A hydrogen atom: one proton with one electron. Each acts like a tiny magnet, shown by the arrows. When the electron flips from pointing the same way as the proton to pointing the other way, the atom gives out a radio wave 21 centimetres long. A drawing of the idea, not to scale.',
  stillAt: 5.5,
  draw({ ctx, w, h, t, say }) {
    backdrop(ctx, w, h, 0.4);
    const c = (t % 8), f = ease(clamp((c - 2.5) / 0.8, 0, 1)), cx = w * 0.27, cy = h * 0.4, R = Math.min(w * 0.2, h * 0.3);
    ctx.strokeStyle = 'rgba(236,231,220,.22)'; ctx.beginPath(); ctx.arc(cx, cy, R, 0, TAU); ctx.stroke();
    dot(ctx, cx, cy, 7, '#e0563a'); arrow(ctx, cx, cy, 15, 1, '#fff');
    const ex = cx + R; dot(ctx, ex, cy, 4, '#7fb4ff');
    ctx.save(); ctx.translate(ex + 14, cy); ctx.rotate(Math.PI * f); arrow(ctx, 0, 0, 11, 1, '#7fb4ff'); ctx.restore();
    label(ctx, 'Proton', cx, cy + 34, { align: 'center', colour: SOFT }); label(ctx, 'Electron', ex, cy + 30, { align: 'center', colour: SOFT });
    if (c > 3.1) { // the wave leaving
      const p = clamp((c - 3.1) / 3.5, 0, 1), x0 = ex + 34, x1 = x0 + (w - x0 - 16) * p; ctx.strokeStyle = ACCENT; ctx.lineWidth = 1.8; ctx.beginPath();
      for (let x = x0; x <= x1; x += 2) { const y = cy + Math.sin((x - x0) / 9 - t * 6) * 9; x === x0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); } ctx.stroke();
      if (p > 0.5) label(ctx, 'Radio wave, 21 cm', Math.min(w - 8, x0 + (w - x0) * 0.5), cy - 22, { align: 'center', colour: ACCENT });
    }
    say(f < 0.5 ? 'Cold hydrogen gives out no light' : 'But it gives out one radio signal', 'Radio telescopes follow it across the whole galaxy');
  },
};

// ---- 6. the cycle
const pillars = photoScene({
  src: '/img/learn/pillars-of-creation-webb.jpg',
  caption: 'A real picture in infrared, with colours chosen for it: the Pillars of Creation, columns of cold gas and dust 6,500 light years away, by the James Webb Space Telescope in 2022. New stars are forming inside them. Credit: NASA, ESA, CSA, STScI; J. DePasquale, A. Koekemoer, A. Pagan (STScI), CC BY 4.0.',
  say: ['Where the gas is thickest, stars form', 'When they die, they give much of it back'], cover: true, zoom: [1, 1.1], focus: [0.5, 0.45], tag: 'Infrared picture',
});

export const scenes: Scene[] = [lanes, empty, b68, b68ir, flip, pillars];
