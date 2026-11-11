/**
 * Pictures for the lesson "How we know there was a Big Bang". The map of the oldest light and the
 * Hubble Ultra Deep Field are real. The rewinding dots and the line of receding galaxies are
 * drawings of the rule, not measurements. The bar of elements is to scale.
 */
import { type Scene, SOFT, ACCENT, clamp, ease, label, stars, rng } from '../stage';
import { photoScene, dot, line } from '../kit';

const backdrop = stars(90, 449);
const HUDF = 'A real photograph: the Hubble Ultra Deep Field, a patch of sky a tenth as wide as the full Moon, built up over 11.3 days of exposure in 2003 and 2004. Nearly everything in it is a galaxy. Credit: NASA, ESA, S. Beckwith (STScI) and the HUDF Team, CC BY 4.0.';

export const lens = photoScene({ src: '/img/learn/hubble-ultra-deep-field.jpg', caption: HUDF, say: ['', ''], hero: true, cover: true, zoom: [1, 1.12], focus: [0.5, 0.5] });

// ---- 1. run it backwards
const DOTS = (() => { const r = rng(29); return Array.from({ length: 240 }, () => [(r() - 0.5) * 2, (r() - 0.5) * 2, r()] as [number, number, number]); })();
const rewind: Scene = {
  caption: 'Galaxies spreading apart as space stretches, and then the same film run backwards. A drawing of the idea. There is no centre: the view from any one of the dots would look the same.',
  stillAt: 3,
  draw({ ctx, w, h, t, say }) {
    const c = t % 12, s = c < 6 ? 0.25 + 0.75 * ease(clamp(c / 4, 0, 1)) : 1 - 0.93 * ease(clamp((c - 6.5) / 4.5, 0, 1)), cx = w / 2, cy = h * 0.4, R = Math.min(w * 0.46, h * 0.36);
    const heat = clamp((0.3 - s) / 0.25, 0, 1); ctx.fillStyle = `rgba(255,150,70,${heat * 0.35})`; ctx.fillRect(0, 0, w, h * 0.8);
    for (const [x, y, b] of DOTS) dot(ctx, cx + x * R * s, cy + y * R * s * 0.9, 1 + b * 1.4, `rgba(236,225,200,${0.45 + b * 0.5})`);
    label(ctx, c < 6 ? 'Now: spreading apart' : 'Run backwards: closer, denser, hotter', cx, h * 0.78, { align: 'center', colour: ACCENT });
    say('Everything is moving apart', 'So once it was all together');
  },
};

// ---- 2. further means faster
const GAL = (() => { const r = rng(31); return Array.from({ length: 26 }, () => { const d = 0.06 + r() * 0.9; return [d, d + (r() - 0.5) * 0.09] as [number, number]; }); })();
const hubble: Scene = {
  caption: 'The rule that started it: the further away a galaxy is, the faster it is moving away, at about 21 km a second for every million light years. The line is that rule. The dots only show how real galaxies scatter round it and are not measurements.',
  stillAt: 4,
  draw({ ctx, w, h, t, say }) {
    backdrop(ctx, w, h, 0.3);
    const x0 = w > 560 ? w * 0.14 : 46, x1 = w * 0.94, y0 = h * 0.68, y1 = h * 0.08, k = clamp(t / 3, 0, 1);
    line(ctx, [x0, y0, x1, y0], 'rgba(236,231,220,.5)'); line(ctx, [x0, y0, x0, y1], 'rgba(236,231,220,.5)');
    line(ctx, [x0, y0, x0 + (x1 - x0) * k, y0 + (y1 - y0) * k], ACCENT, 1.8);
    GAL.forEach(([d, v], i) => { if (i / GAL.length < k) dot(ctx, x0 + d * (x1 - x0), y0 + clamp(v, 0.02, 1) * (y1 - y0), 2.6, 'rgba(190,215,255,.9)'); });
    label(ctx, 'Distance', x1, y0 + 18, { align: 'right', colour: SOFT }); label(ctx, 'Speed away', x0 + 6, y1 + 4, { align: 'left', colour: SOFT });
    label(ctx, '100 million light years', x0 + (x1 - x0) * 0.5, y0 + 18, { align: 'center' }); label(ctx, '2,100 km/s', w > 560 ? x0 - 6 : x0 + 9, y0 + (y1 - y0) * 0.5 + (w > 560 ? 4 : -6), { align: w > 560 ? 'right' : 'left' });
    line(ctx, [x0 + (x1 - x0) * 0.5, y0, x0 + (x1 - x0) * 0.5, y0 - 5], 'rgba(236,231,220,.6)'); line(ctx, [x0, y0 + (y1 - y0) * 0.5, x0 + 5, y0 + (y1 - y0) * 0.5], 'rgba(236,231,220,.6)');
    say('Twice as far, twice as fast', 'Just what stretching space would do');
  },
};

// ---- 3. the oldest light
const glow = photoScene({
  src: '/img/learn/cmb-wmap-9-year.jpg',
  caption: 'A real map of the whole sky in microwaves, from nine years of measurements by NASA’s WMAP spacecraft. Microwaves have no colour: red was chosen for slightly warmer patches and blue for slightly cooler, and the glow of our own galaxy has been taken out. Credit: NASA/WMAP Science Team.',
  say: ['Predicted in 1948, found in 1964', 'The glow of the hot beginning, still arriving'], zoom: [0.95, 1.05], focus: [0.5, 0.5], tag: 'Microwave map',
});

// ---- 4. the first elements
const mix: Scene = {
  caption: 'What the first few minutes should have made, by mass: three quarters hydrogen and one quarter helium, with only traces of anything else. The helium measured in the least-touched gas is 24.5 per cent. The bars are to scale.',
  stillAt: 3,
  draw({ ctx, w, h, t, say }) {
    backdrop(ctx, w, h, 0.4);
    const x0 = w * 0.08, bw = w * 0.84, bh = h * 0.1, k = ease(clamp(t / 2, 0, 1));
    ([[h * 0.16, 'Predicted', 25], [h * 0.46, 'Measured', 24.5]] as [number, string, number][]).forEach(([y, name, he]) => {
      label(ctx, name, x0, y - 10, { align: 'left', colour: SOFT });
      ctx.fillStyle = '#7fb4ff'; ctx.fillRect(x0, y, bw * (1 - he / 100) * k, bh); ctx.fillStyle = ACCENT; ctx.fillRect(x0 + bw * (1 - he / 100) * k, y, (bw * he * k) / 100, bh);
      if (k > 0.9) { label(ctx, 'Hydrogen', x0 + 8, y + bh + 18, { align: 'left', colour: '#7fb4ff' }); label(ctx, `Helium ${he}%`, x0 + bw, y + bh + 18, { align: 'right', colour: ACCENT }); }
    });
    say('A quarter helium, as predicted', 'Cooked in the first few minutes');
  },
};

// ---- 5. a changing past
const deep = photoScene({ src: '/img/learn/hubble-ultra-deep-field.jpg', caption: HUDF, say: ['Looking far is looking back', 'The furthest galaxies here are small, ragged and young'], cover: true, zoom: [1.1, 1.5], focus: [0.5, 0.5] });

// ---- 6. four tests
const TESTS = ['Galaxies moving apart', 'The oldest light', 'A quarter helium', 'A younger-looking past'];
const four: Scene = {
  caption: 'The four lines of evidence in this lesson. Each was a prediction that could have failed.',
  stillAt: 5,
  draw({ ctx, w, h, t, say }) {
    backdrop(ctx, w, h, 0.4);
    const x = w > 560 ? w * 0.28 : w * 0.14, row = h * 0.15;
    TESTS.forEach((name, i) => {
      const y = h * 0.12 + i * row, on = t > 0.8 + i * 0.9;
      ctx.strokeStyle = 'rgba(236,231,220,.5)'; ctx.lineWidth = 1.2; ctx.strokeRect(x, y - 9, 16, 16);
      if (on) { ctx.strokeStyle = ACCENT; ctx.lineWidth = 2.2; ctx.beginPath(); ctx.moveTo(x + 3, y); ctx.lineTo(x + 7, y + 4); ctx.lineTo(x + 14, y - 6); ctx.stroke(); }
      label(ctx, name, x + 28, y + 4, { align: 'left', colour: on ? undefined : SOFT, size: w > 560 ? 13 : 11 });
    });
    say('Four tests it could have failed', 'No other idea passes all of them');
  },
};

export const scenes: Scene[] = [rewind, hubble, glow, mix, deep, four];
