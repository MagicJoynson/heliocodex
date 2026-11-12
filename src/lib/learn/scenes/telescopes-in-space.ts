/**
 * Pictures for the lesson "Telescopes in space". The first is a diagram. The other five are real
 * photographs or real telescope pictures, two of them pairs set side by side.
 */
import { type Scene, SOFT, ACCENT, clamp, ease, label, stars } from '../stage';
import { photoScene, line } from '../kit';

const backdrop = stars(70, 1990);
const HUBBLE = 'A real photograph: the Hubble Space Telescope in orbit, taken from the space shuttle Atlantis on 19 May 2009, just after the last crew to visit had let it go. The curve of the Earth is at the bottom left. Credit: NASA.';

const DEEP = 'A real picture by the James Webb Space Telescope, shown on 11 July 2022: the cluster of galaxies SMACS 0723 and thousands of galaxies beyond it. The stars with spikes are in our own galaxy. Everything else is a galaxy. Taken in infrared, so the colours were chosen. Credit: NASA, ESA, CSA, STScI. CC BY 4.0.';

export const lens = photoScene({ src: '/img/learn/webb-first-deep-field.jpg', caption: DEEP, say: ['', ''], hero: true, cover: true, zoom: [1, 1.1], focus: [0.6, 0.5] });

// ---- 1. which kinds of light get through the air
const KINDS: [string, number, string][] = [['Gamma', 0.3, '#b9a7ff'], ['X-ray', 0.36, '#9fb4ff'], ['Ultraviolet', 0.5, '#c59bff'], ['Visible', 1, '#ffe9a8'], ['Infrared', 0.62, '#ff9d6b'], ['Radio', 1, '#8fd3c0']];
const air: Scene = {
  caption: 'A diagram, not to scale. Six kinds of light arrive from space at the top. The blue band is the air and the line at the bottom is the ground. Only visible light and radio waves reach the ground freely. A little infrared and ultraviolet gets through as well, which is not drawn.',
  stillAt: 6,
  draw({ ctx, w, h, t, say }) {
    backdrop(ctx, w, h, 0.3);
    const wide = w > 560, x0 = w * 0.08, x1 = w * 0.92, top = h * 0.14, ground = h * 0.7, airTop = top + (ground - top) * 0.25;
    const g = ctx.createLinearGradient(0, airTop, 0, ground); g.addColorStop(0, 'rgba(95,143,196,0)'); g.addColorStop(1, 'rgba(95,143,196,.42)');
    ctx.fillStyle = g; ctx.fillRect(x0, airTop, x1 - x0, ground - airTop);
    line(ctx, [x0, ground, x1, ground], 'rgba(236,231,220,.7)', 2);
    KINDS.forEach(([name, reach, colour], i) => {
      const x = x0 + ((i + 0.5) / KINDS.length) * (x1 - x0), end = top + (ground - top) * reach, k = ease(clamp((t - 0.3 - i * 0.5) / 1.2, 0, 1)), y = top + (end - top) * k;
      line(ctx, [x, top, x, y], colour, 2, reach < 1 ? [5, 4] : undefined);
      if (k >= 0.99) {
        ctx.fillStyle = colour; ctx.beginPath();
        if (reach < 1) { ctx.fillRect(x - 7, y - 1, 14, 2.5); } else { ctx.moveTo(x - 5, y - 8); ctx.lineTo(x + 5, y - 8); ctx.lineTo(x, y); ctx.fill(); }
      }
      label(ctx, wide || name !== 'Ultraviolet' ? name : 'UV', x, top - 10, { align: 'center', colour: reach < 1 ? SOFT : '#fff', size: wide ? 12 : 10 });
    });
    label(ctx, 'The air', x0 + 6, ground - 10, { align: 'left', colour: 'rgba(200,220,245,.9)', size: 11 });
    label(ctx, 'The ground', x0, ground + 16, { align: 'left', colour: SOFT, size: 11 });
    label(ctx, 'Stopped', x0 + (2.5 / KINDS.length) * (x1 - x0), ground + 16, { align: 'center', colour: SOFT, size: 11 });
    label(ctx, 'Gets through', x1, ground + 16, { align: 'right', colour: ACCENT, size: 11 });
    say('The air is a poor window', 'Most kinds of light never reach the ground');
  },
};

const hubble = photoScene({ src: '/img/learn/hubble-in-orbit-2009.jpg', caption: HUBBLE, say: ['Hubble, in orbit since 1990', 'As long as a bus, a little under 500 km up'], cover: true, zoom: [1, 1.12], focus: [0.55, 0.5] });

const repair = photoScene({
  src: '/img/learn/m100-before-after-repair-1993.jpg',
  caption: 'Two real pictures by the Hubble Space Telescope of the middle of the galaxy M100. The left one was taken before the repair of December 1993 and the right one soon after it, with the new camera. Credit: NASA, STScI.',
  say: ['Before and after the repair', 'The same galaxy, either side of December 1993'], tag: 'Two real pictures', zoom: [1, 1.04], focus: [0.5, 0.5],
});

const mirror = photoScene({
  src: '/img/learn/webb-mirror-goddard-2017.jpg',
  caption: 'A real photograph: the mirror of the James Webb Space Telescope at NASA’s Goddard Space Flight Center, before launch, with two people in front of it. It is 6.5 metres across and coated in gold. Credit: NASA’s Goddard Space Flight Center.',
  say: ['Webb: 18 pieces, coated in gold', '6.5 metres across, folded up to fit its rocket'], zoom: [0.98, 1.1], focus: [0.5, 0.45],
});

const pillars = photoScene({
  src: '/img/learn/pillars-hubble-and-webb.jpg',
  caption: 'Two real pictures of the same clouds of gas and dust, the "Pillars of Creation" in the Eagle Nebula. Left: Hubble, 2014, mostly in visible light. Right: Webb, 2022, in infrared, which passes through the dust and shows the stars inside and behind. The colours of both were chosen. Credit: NASA, ESA, Hubble Heritage Team (left); NASA, ESA, CSA, STScI (right). CC BY 4.0.',
  say: ['One cloud, two kinds of light', 'Hubble on the left, Webb in infrared on the right'], tag: 'Two real pictures', zoom: [1, 1.05], focus: [0.5, 0.4],
});

const deep = photoScene({
  src: '/img/learn/webb-first-deep-field.jpg',
  caption: DEEP,
  say: ['Webb’s first deep picture, July 2022', 'A grain of sand’s worth of sky, thousands of galaxies'], cover: true, zoom: [1, 1.18], focus: [0.5, 0.5],
});

export const scenes: Scene[] = [air, hubble, repair, mirror, pillars, deep];
