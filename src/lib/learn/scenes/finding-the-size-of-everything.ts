/**
 * Pictures for the lesson "Finding the size of everything". Three are real photographs. The
 * drawing of the Earth and the Moon and the chart of steps are to scale. The drawing of a star's
 * shift is a diagram.
 */
import { type Scene, SOFT, ACCENT, clamp, ease, label, stars } from '../stage';
import { TAU, photoScene, sun, dot, line } from '../kit';

const backdrop = stars(90, 1838);
const M31 = 'A real photograph: the Andromeda galaxy, pieced together from more than 600 pictures taken by the Hubble Space Telescope over ten years. The jagged edge is where the separate pictures stop. Credit: NASA, ESA, B. Williams (University of Washington), CC BY 4.0.';
const VENUS = 'A real picture from NASA’s Solar Dynamics Observatory: Venus, the black disc, at the edge of the Sun on 6 June 2012. The small dark marks are sunspots. The orange colour was chosen. Credit: NASA/SDO, HMI.';

export const lens = photoScene({ src: '/img/learn/venus-transit-2012-sdo.jpg', caption: VENUS, say: ['', ''], hero: true, cover: true, zoom: [1, 1.1], focus: [0.75, 0.45] });

// ---- 1. the Earth and the Moon, to scale
const moon: Scene = {
  caption: 'A drawing to scale. The Earth is on the left and the Moon on the right, at their true sizes and their true average distance apart, 384,399 km. The moving dot is light, which takes 1.28 seconds to cross.',
  stillAt: 3,
  draw({ ctx, w, h, t, say }) {
    backdrop(ctx, w, h, 0.35);
    const x0 = w * 0.1, x1 = w * 0.9, y = h * 0.4, km = (x1 - x0) / 384399, re = Math.max(2, 6371 * km), rm = Math.max(1, 1737 * km);
    line(ctx, [x0, y, x1, y], 'rgba(236,231,220,.16)');
    dot(ctx, x0, y, re, '#5f8fc4'); dot(ctx, x1, y, rm, '#cfcabd');
    const k = ((t % 3.2) / 1.28); if (k <= 1) dot(ctx, x0 + (x1 - x0) * k, y, 1.6, ACCENT);
    label(ctx, 'The Earth', x0, y + re + 18, { align: 'center', colour: SOFT }); label(ctx, 'The Moon', x1, y + re + 18, { align: 'center', colour: SOFT });
    line(ctx, [x0, y - re - 14, x1, y - re - 14], 'rgba(236,231,220,.4)'); line(ctx, [x0, y - re - 19, x0, y - re - 9], 'rgba(236,231,220,.4)'); line(ctx, [x1, y - re - 19, x1, y - re - 9], 'rgba(236,231,220,.4)');
    label(ctx, '384,399 km: thirty Earths in a row', w / 2, y - re - 28, { align: 'center', colour: ACCENT });
    say('The first step: the Moon', 'Worked out by geometry, more than 2,000 years ago');
  },
};

const venus = photoScene({ src: '/img/learn/venus-transit-2012-sdo.jpg', caption: VENUS, say: ['Venus crossing the Sun, June 2012', 'Timing this in 1769 gave the distance of the Sun'], cover: true, zoom: [1, 1.15], focus: [0.78, 0.4] });

// ---- 3. a near star shifts as the Earth goes round
const FAR = Array.from({ length: 7 }, (_, i) => 0.18 + i * 0.105);
const shift: Scene = {
  caption: 'A diagram, very far from scale. As the Earth goes round the Sun, the line of sight to a near star swings a little, so the star seems to move from side to side against stars much further away. The real shift is thousands of times smaller than drawn.',
  stillAt: 2,
  draw({ ctx, w, h, t, say }) {
    backdrop(ctx, w, h, 0.25);
    const cx = w / 2, by = h * 0.68, r = Math.min(w * 0.16, h * 0.16), a = t * 0.9, ex = cx + Math.cos(a) * r, ey = by + Math.sin(a) * r * 0.3, sy = h * 0.36, top = h * 0.08;
    ctx.strokeStyle = 'rgba(236,231,220,.25)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.ellipse(cx, by, r, r * 0.3, 0, 0, TAU); ctx.stroke();
    sun(ctx, cx, by, 5); dot(ctx, ex, ey, 3.5, '#5f8fc4');
    for (const f of FAR) dot(ctx, w * f, top + ((f * 97) % 1) * 6, 1.4, 'rgba(236,231,220,.8)');
    const px = ex + ((top - ey) * (cx - ex)) / (sy - ey);
    line(ctx, [ex, ey, px, top], 'rgba(236,231,220,.3)', 1, [3, 4]);
    dot(ctx, cx, sy, 3, '#ffcf8a'); dot(ctx, px, top, 3.5, ACCENT);
    label(ctx, 'The near star', cx + 9, sy, { align: 'left', colour: SOFT });
    label(ctx, 'Where it seems to be', px, top + 16, { align: 'center', colour: ACCENT, size: 11 });
    label(ctx, 'The Earth’s path round the Sun', cx, by + r * 0.3 + 15, { align: 'center', colour: SOFT, size: 11 });
    say('1838: the first star', 'A shift as small as a penny seen from 13 km');
  },
};

const leavitt = photoScene({
  src: '/img/learn/henrietta-leavitt-1898.jpg',
  caption: 'A real photograph: Henrietta Swan Leavitt in about 1898. Photographer unknown. Public domain, by way of Wikimedia Commons.',
  say: ['Henrietta Leavitt, 1912', 'The slower a star beats, the brighter it truly is'], zoom: [0.98, 1.1], focus: [0.5, 0.35],
});

const andromeda = photoScene({ src: '/img/learn/andromeda-hubble-mosaic.jpg', caption: M31, say: ['1923: Andromeda is another galaxy', '2.5 million light years away'], cover: true, zoom: [1, 1.12], focus: [0.42, 0.5] });

// ---- 6. each step, and how much bigger it made things
const STEPS: [string, number, string][] = [['The Moon', 384399, ''], ['The Sun', 149.6e6, '390 times further'], ['The first star', 1.0785e14, '700,000 times further'], ['The first galaxy', 2.365e19, '200,000 times further'], ['The furthest we can see', 4.4e23, '19,000 times further']];
const steps: Scene = {
  caption: 'A chart of the five distances in the lesson. The scale is not an even one: each faint upright line is a thousand times further than the one before, or every bar but the last would be too short to see. The distances are the modern ones, and the multiples are worked out here.',
  stillAt: 7,
  draw({ ctx, w, h, t, say }) {
    backdrop(ctx, w, h, 0.25);
    const wide = w > 560, x0 = w * 0.07, x1 = w * 0.93, top = h * 0.08, rowH = (h * 0.62) / STEPS.length, lo = 5, hi = 24, X = (km: number) => x0 + ((Math.log10(km) - lo) / (hi - lo)) * (x1 - x0);
    for (let e = 6; e <= 24; e += 3) line(ctx, [X(10 ** e), top - 4, X(10 ** e), top + rowH * STEPS.length], 'rgba(236,231,220,.1)');
    STEPS.forEach(([name, km, mult], i) => {
      const k = ease(clamp((t - 0.4 - i * 1.1) / 1, 0, 1)), y = top + i * rowH, bh = Math.max(4, rowH * 0.28);
      ctx.fillStyle = i === STEPS.length - 1 ? ACCENT : 'rgba(233,196,138,.6)'; ctx.fillRect(x0, y + rowH * 0.55, (X(km) - x0) * k, bh);
      if (k > 0.05) { label(ctx, name, x0, y + rowH * 0.3, { align: 'left', colour: '#fff', size: wide ? 12 : 11 }); if (mult && k >= 1) label(ctx, mult, x1, y + rowH * 0.3, { align: 'right', colour: SOFT, size: wide ? 12 : 11 }); }
    });
    say('Five steps, each resting on the last', 'Every one made the universe far bigger');
  },
};

export const scenes: Scene[] = [moon, venus, shift, leavitt, andromeda, steps];
