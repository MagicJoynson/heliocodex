/**
 * Pictures for the lesson "Do black holes last for ever?". Three are real: a radio picture, a
 * photograph and a gamma-ray map. The two charts and the moving drawing show theory that has
 * never been observed, and say so.
 */
import { type Scene, SOFT, ACCENT, clamp, ease, label, stars } from '../stage';
import { TAU, photoScene, dot, line } from '../kit';

const backdrop = stars(90, 1974);
const M87 = 'A real picture, not a drawing: the shadow of the black hole at the centre of the galaxy M87, in radio waves, by the Event Horizon Telescope. Published 10 April 2019. The glowing ring is hot gas round the black hole and is nothing to do with the faint glow in this lesson. The colour was chosen. Credit: EHT Collaboration, CC BY 4.0.';

export const lens = photoScene({ src: '/img/learn/m87-black-hole-eht.jpg', caption: M87, say: ['', ''], hero: true, cover: true, zoom: [1.2, 1.3], focus: [0.2, 0.5] });

const shadow = photoScene({ src: '/img/learn/m87-black-hole-eht.jpg', caption: M87, say: ['Nothing gets out', 'So a black hole should last for ever'], zoom: [1, 1.12], focus: [0.5, 0.5], tag: 'Radio picture' });

const hawking = photoScene({
  src: '/img/learn/stephen-hawking-2008.jpg',
  caption: 'A real photograph: Stephen Hawking giving a lecture in Washington on 21 April 2008, thirty-four years after the work in this lesson. The pictures of the Earth and Mars are on a screen behind him. Credit: NASA/Paul E. Alers.',
  say: ['Stephen Hawking, 1974', 'A black hole should glow, and so lose mass'], zoom: [1, 1.1], focus: [0.5, 0.3],
});

// ---- 3. how cold
const TEMPS: [string, string, number, string][] = [['Space today', '2.7 kelvin', 2.725, '#ffd76a'], ['A black hole as heavy as the Sun', '0.00000006', 6.17e-8, '#b9a7ff'], ['The one at the centre of our galaxy', '14 zeros, then 14', 1.43e-14, '#9a8ad9'], ['The one in the galaxy M87', '17 zeros, then 9', 9.5e-18, '#7d70b3']];
const cold: Scene = {
  caption: 'A chart of temperature from theory, in kelvin, which counts up from the coldest possible. The scale is not an even one: each faint upright line is a thousand times colder than the one to its right. The bigger the black hole, the colder it is, and all of them are far colder than space. The black hole figures were worked out here from Hawking’s formula.',
  stillAt: 6,
  draw({ ctx, w, h, t, say }) {
    const wide = w > 560, x0 = w * 0.07, x1 = w * 0.93, top = h * 0.06, rowH = (h * 0.66) / TEMPS.length, lo = -19, hi = 1, X = (v: number) => x0 + ((Math.log10(v) - lo) / (hi - lo)) * (x1 - x0);
    for (let e = -18; e <= 0; e += 3) line(ctx, [X(10 ** e), top, X(10 ** e), top + rowH * TEMPS.length], 'rgba(236,231,220,.1)');
    TEMPS.forEach(([name, val, v, colour], i) => {
      const k = ease(clamp((t - 0.3 - i * 1) / 1, 0, 1)), y = top + i * rowH, short = ['Space today', 'Black hole, 1 Sun', 'Our galaxy’s', 'The one in M87'][i];
      ctx.fillStyle = colour; ctx.fillRect(x0, y + rowH * 0.55, (X(v) - x0) * k, Math.max(4, rowH * 0.26));
      if (k > 0.05) { label(ctx, wide ? name : short, x0, y + rowH * 0.32, { align: 'left', colour: '#fff', size: wide ? 12 : 11 }); label(ctx, i < 2 ? val : wide ? `0.${val}` : 'far colder', x1, y + rowH * 0.32, { align: 'right', colour: SOFT, size: wide ? 12 : 10 }); }
    });
    label(ctx, 'Colder', x0, top + rowH * TEMPS.length + 15, { align: 'left', colour: SOFT, size: 10 }); label(ctx, 'Warmer', x1, top + rowH * TEMPS.length + 15, { align: 'right', colour: SOFT, size: 10 });
    say('Colder than space', 'The bigger the black hole, the colder it is');
  },
};

// ---- 4. the runaway
const runaway: Scene = {
  caption: 'A diagram of theory, not to scale, and vastly speeded up. A black hole that is warmer than its surroundings loses mass. As it shrinks it grows hotter and brighter, so it shrinks faster, and it ends in a flash. The line below shows its mass against time. Nobody has seen this happen.',
  stillAt: 5.2,
  draw({ ctx, w, h, t, say }) {
    backdrop(ctx, w, h, 0.3);
    const tt = t % 9, k = clamp(tt / 6, 0, 1), m = Math.cbrt(Math.max(0, 1 - k)), cx = w / 2, cy = h * 0.31, R = Math.min(w * 0.09, h * 0.16), r = Math.max(0.6, R * m), bright = clamp((1 - m) * 1.2, 0.08, 1);
    if (k < 1) {
      const g = ctx.createRadialGradient(cx, cy, r, cx, cy, r + R * (0.5 + bright * 1.6)); g.addColorStop(0, `rgba(${Math.round(185 + 70 * bright)},${Math.round(167 + 88 * bright)},255,${0.25 + 0.7 * bright})`); g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, r + R * (0.5 + bright * 1.6), 0, TAU); ctx.fill();
      dot(ctx, cx, cy, r, '#000'); ctx.strokeStyle = 'rgba(236,231,220,.5)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(cx, cy, r, 0, TAU); ctx.stroke();
    } else {
      const f = clamp((tt - 6) / 1.6, 0, 1), g = ctx.createRadialGradient(cx, cy, 0, cx, cy, R * (1 + f * 6)); g.addColorStop(0, `rgba(255,255,255,${1 - f})`); g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, R * (1 + f * 6), 0, TAU); ctx.fill();
    }
    const x0 = w * 0.12, x1 = w * 0.88, base = h * 0.72, top = h * 0.54, pts: number[] = [];
    line(ctx, [x0, top, x0, base, x1, base], 'rgba(236,231,220,.3)');
    for (let i = 0; i <= 100; i++) { const u = i / 100; if (u > k) break; pts.push(x0 + u * (x1 - x0), base - Math.cbrt(1 - u) * (base - top)); }
    if (pts.length >= 4) line(ctx, pts, ACCENT, 1.8);
    label(ctx, 'Mass', x0 - 4, top - 8, { align: 'left', colour: SOFT, size: 10 }); label(ctx, 'Time', x1, base + 14, { align: 'right', colour: SOFT, size: 10 });
    label(ctx, k < 0.5 ? 'Shrinking slowly' : k < 0.99 ? 'Hotter, brighter, faster' : 'Gone, in a flash', cx, h * 0.07, { align: 'center', colour: k < 0.5 ? SOFT : ACCENT, size: 11 });
    say('Smaller means hotter', 'So the end, when it comes, is a runaway');
  },
};

// ---- 5. the times
const TIMES: [string, string, number][] = [['The age of the universe', '14 billion years', 10.14], ['A black hole as heavy as the Sun', '2 followed by 67 noughts', 67.3], ['The one at the centre of our galaxy', '2 followed by 87 noughts', 87.2], ['The largest black holes known', '2 followed by 100 noughts', 100.3]];
const times: Scene = {
  caption: 'A chart of time from theory, in years. The scale is not an even one: each faint upright line marks ten more noughts on the number of years than the one before. On an even scale the bar for the age of the universe could not be seen at all. The third figure was worked out here. The others are from Wikipedia.',
  stillAt: 6,
  draw({ ctx, w, h, t, say }) {
    const wide = w > 560, x0 = w * 0.07, x1 = w * 0.93, top = h * 0.06, rowH = (h * 0.66) / TIMES.length, X = (e: number) => x0 + (e / 104) * (x1 - x0);
    for (let e = 10; e <= 100; e += 10) line(ctx, [X(e), top, X(e), top + rowH * TIMES.length], 'rgba(236,231,220,.1)');
    TIMES.forEach(([name, val, e], i) => {
      const k = ease(clamp((t - 0.3 - i * 1) / 1, 0, 1)), y = top + i * rowH, short = ['The universe so far', 'Black hole, 1 Sun', 'Our galaxy’s', 'The largest known'][i];
      ctx.fillStyle = i === 0 ? '#ffd76a' : '#b9a7ff'; ctx.fillRect(x0, y + rowH * 0.55, (X(e) - x0) * k, Math.max(4, rowH * 0.26));
      if (k > 0.05) { label(ctx, wide ? name : short, x0, y + rowH * 0.32, { align: 'left', colour: '#fff', size: wide ? 12 : 11 }); label(ctx, wide ? val : val.replace('followed by', '+').replace(' billion years', ' billion'), x1, y + rowH * 0.32, { align: 'right', colour: SOFT, size: wide ? 12 : 10 }); }
    });
    say('How long it would take', 'Black holes would be the last things left');
  },
};

const fermi = photoScene({
  src: '/img/learn/fermi-gamma-ray-sky.jpg',
  caption: 'A real map of the whole sky in gamma rays, built up over a year by NASA’s Fermi telescope. The bright band is our own galaxy. A small black hole in its final flash would show as a brief new spot. None has been found. Brighter colours mean more gamma rays, and the colours were chosen. Credit: NASA/DOE/Fermi LAT Collaboration.',
  say: ['Watching for the flash', 'The whole sky in gamma rays: none seen so far'], zoom: [1, 1.08], focus: [0.5, 0.5], tag: 'Gamma-ray map',
});

export const scenes: Scene[] = [shadow, hawking, cold, runaway, times, fermi];
