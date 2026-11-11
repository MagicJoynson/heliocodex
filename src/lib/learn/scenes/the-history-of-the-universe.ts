/**
 * Pictures for the lesson "The history of the universe on one timeline". The four photographs and
 * maps are real. The timeline and the clock are drawn to scale. Every calendar date was worked out
 * here by dividing 13.8 billion years into 365 days.
 */
import { type Scene, SOFT, ACCENT, clamp, ease, label, stars } from '../stage';
import { TAU, photoScene, dot, line } from '../kit';

const backdrop = stars(90, 503);

export const lens = photoScene({
  src: '/img/learn/hubble-ultra-deep-field.jpg',
  caption: 'A real photograph: the Hubble Ultra Deep Field. The faintest galaxies in it are seen as they were about 800 million years after the start. Credit: NASA, ESA, S. Beckwith (STScI) and the HUDF Team, CC BY 4.0.',
  say: ['', ''], hero: true, cover: true, zoom: [1.05, 1.2], focus: [0.5, 0.5],
});

// ---- 1. the whole line, to scale
const MARKS: [number, string, string][] = [[0, '1 Jan', 'The start'], [0.2, '6 Jan', 'First stars'], [9.2, '1 Sep', 'The Sun'], [10, '22 Sep', 'Life'], [13.8, '31 Dec', 'Now']];
const timeline: Scene = {
  caption: 'The whole history of the universe as one line, to scale, with the dates it gets when 13.8 billion years are squeezed into one calendar year. The dates were worked out here.',
  stillAt: 5,
  draw({ ctx, w, h, t, say }) {
    backdrop(ctx, w, h, 0.4);
    const x0 = w * 0.07, x1 = w * 0.93, y = h * 0.4, k = ease(clamp(t / 3.5, 0, 1)), X = (g: number) => x0 + (g / 13.8) * (x1 - x0);
    line(ctx, [x0, y, x0 + (x1 - x0) * k, y], 'rgba(236,231,220,.7)', 2);
    for (let m = 1; m < 12; m++) { const x = x0 + ((x1 - x0) * m) / 12; if (x < x0 + (x1 - x0) * k) line(ctx, [x, y - 4, x, y + 4], 'rgba(236,231,220,.35)'); }
    MARKS.forEach(([g, date, what], i) => {
      const x = X(g); if (x > x0 + (x1 - x0) * k + 1) return; const up = i % 2 === 0, yy = up ? y - 34 : y + 34;
      line(ctx, [x, y, x, up ? y - 18 : y + 18], ACCENT, 1.4); dot(ctx, x, y, 3.5, ACCENT);
      const align = i <= 1 ? 'left' : i === MARKS.length - 1 ? 'right' : 'center';
      label(ctx, what, x, yy + (up ? 0 : 6), { align, colour: ACCENT }); label(ctx, date, x, yy + (up ? -15 : 21), { align, colour: SOFT });
    });
    say('13.8 billion years as one calendar year', 'One day is about 38 million years');
  },
};

// ---- 2. the oldest light
const first = photoScene({
  src: '/img/learn/cmb-wmap-9-year.jpg',
  caption: 'A real map of the whole sky in microwaves, from nine years of measurements by NASA’s WMAP spacecraft. Microwaves have no colour: red was chosen for slightly warmer patches and blue for slightly cooler, and the glow of our own galaxy has been taken out. Credit: NASA/WMAP Science Team.',
  say: ['1 January, 14 minutes past midnight', 'The fog clears and the oldest light sets out'], zoom: [0.95, 1.05], focus: [0.5, 0.5], tag: 'Microwave map',
});

// ---- 3. the first galaxies
const january = photoScene({
  src: '/img/learn/hubble-ultra-deep-field.jpg',
  caption: 'A real photograph: the Hubble Ultra Deep Field. The smallest, reddest galaxies in it are seen as they were about 800 million years after the start. Credit: NASA, ESA, S. Beckwith (STScI) and the HUDF Team, CC BY 4.0.',
  say: ['22 January', 'Small young galaxies, seen here as they were'], cover: true, zoom: [1.1, 1.4], focus: [0.5, 0.5],
});

// ---- 4. the Sun
const september = photoScene({
  src: '/img/learn/sun-sunspots-sdo.jpg',
  caption: 'A real photograph: the Sun in ordinary light in October 2014, by NASA’s Solar Dynamics Observatory. The dark patches are sunspots. Credit: NASA/SDO. The marks and the Earth for size were added here.',
  say: ['1 September', 'The Sun and its planets form, two thirds of the way through'], zoom: [0.9, 1.05], focus: [0.5, 0.5],
});

// ---- 5. the Earth
const autumn = photoScene({
  src: '/img/learn/earth-blue-marble-apollo-17.jpg',
  caption: 'A real photograph: the whole Earth, taken by the crew of Apollo 17 on 7 December 1972 on their way to the Moon. Credit: NASA.',
  say: ['22 September: life begins', '30 December, six in the morning: the dinosaurs are gone'], zoom: [0.85, 1], focus: [0.5, 0.5],
});

// ---- 6. the last day
const clock: Scene = {
  caption: 'The last hour of 31 December on the calendar, drawn as a clock face. Our own species appears about 11 minutes before midnight. A human life of 80 years is less than a fifth of a second, far too thin a sliver to draw. Worked out here.',
  stillAt: 5,
  draw({ ctx, w, h, t, say }) {
    backdrop(ctx, w, h, 0.4);
    const cx = w / 2, cy = h * 0.4, R = Math.min(w * 0.3, h * 0.33), k = ease(clamp((t - 0.5) / 3, 0, 1)), a0 = -TAU / 4 - (11.4 / 60) * TAU;
    ctx.strokeStyle = 'rgba(236,231,220,.6)'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(cx, cy, R, 0, TAU); ctx.stroke();
    for (let i = 0; i < 12; i++) { const a = (i / 12) * TAU; line(ctx, [cx + Math.cos(a) * R * 0.9, cy + Math.sin(a) * R * 0.9, cx + Math.cos(a) * R * 0.98, cy + Math.sin(a) * R * 0.98], 'rgba(236,231,220,.5)'); }
    ctx.fillStyle = 'rgba(233,196,138,.35)'; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.arc(cx, cy, R * 0.96, a0, a0 + (11.4 / 60) * TAU * k); ctx.closePath(); ctx.fill();
    line(ctx, [cx, cy, cx + Math.cos(a0) * R * 0.96, cy + Math.sin(a0) * R * 0.96], ACCENT, 1.6);
    line(ctx, [cx, cy, cx, cy - R * 0.96], '#fff', 1.6); dot(ctx, cx, cy, 2.5, '#fff');
    label(ctx, 'Midnight: now', cx, cy - R - 10, { align: 'center' });
    label(ctx, 'People', cx + Math.cos(a0 + 0.3) * R * 1.08, cy + Math.sin(a0 + 0.3) * R * 1.08, { align: 'right', colour: ACCENT });
    label(ctx, '23:00 to midnight, 31 December', cx, cy + R + 22, { align: 'center', colour: SOFT });
    say('Eleven minutes to midnight', 'All of written history fits in the last few seconds');
  },
};

export const scenes: Scene[] = [timeline, first, january, september, autumn, clock];
