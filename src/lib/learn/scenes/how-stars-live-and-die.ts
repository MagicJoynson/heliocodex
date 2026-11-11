/**
 * Pictures for the lesson "How stars live and die". Wherever a real photograph of a stage exists it
 * is shown. Figures match the lesson: the Sun is 4.6 billion years into about 10 billion, and a star
 * ten times as heavy lasts a few tens of millions of years.
 */
import { type Scene, SOFT, ACCENT, clamp, ease, mix, label, stars, rng } from '../stage';
import { TAU, photoScene, sun, dot, line } from '../kit';

const backdrop = stars(150, 63);

export const lens = photoScene({
  src: '/img/learn/pillars-of-creation-webb.jpg',
  caption: 'A real photograph: the Pillars of Creation, columns of cold gas and dust 6,500 light years away, by the James Webb Space Telescope in 2022. New stars are forming inside them. Credit: NASA, ESA, CSA, STScI; J. DePasquale, A. Koekemoer, A. Pagan (STScI), CC BY 4.0.',
  say: ['', ''], hero: true, zoom: [1, 1.14], focus: [0.5, 0.3],
});

// ---- 1. born, and not for ever
const nursery = photoScene({
  src: '/img/learn/orion-nebula-hubble.jpg',
  caption: 'A real photograph: the Orion Nebula, the nearest big cloud where stars are being born, by the Hubble Space Telescope. More than 3,000 stars of every size are in this picture. Credit: NASA, ESA, M. Robberto (STScI/ESA) and the Hubble Space Telescope Orion Treasury Project Team, CC BY 4.0.',
  say: ['Stars are being born here now', 'You can see this cloud by eye, as the middle "star" of Orion\'s sword'],
  zoom: [1, 1.12], focus: [0.5, 0.48],
});

// ---- 2. a cloud falls together
const cloud = (() => { const r = rng(88); return Array.from({ length: 520 }, () => ({ a: r() * TAU, d: 0.25 + Math.sqrt(r()) * 0.75, wob: r() * TAU, sp: 0.5 + r(), sz: 0.7 + r() * 1.3 })); })();
const birthScene: Scene = {
  caption: 'Part of a cloud of gas and dust falling together under its own gravity, heating up as it shrinks, until the middle is hot enough for the star to switch on. A drawing of the idea, not to scale: the real thing takes around a million years.',
  stillAt: 11,
  draw({ ctx, w, h, t, say }) {
    backdrop(ctx, w, h, 0.5);
    const loop = 16, x = t % loop, k = ease((x - 0.8) / 8), lit = ease((x - 9) / 1.4), s = Math.min(w, h), cx = w / 2, cy = h * 0.47;
    if (k > 0.3) { const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, s * 0.16); g.addColorStop(0, `rgba(255,${Math.round(mix(120, 215, lit))},${Math.round(mix(70, 150, lit))},${0.55 * clamp((k - 0.3) / 0.5)})`); g.addColorStop(1, 'rgba(255,120,70,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, s * 0.16, 0, TAU); ctx.fill(); }
    for (const p of cloud) {
      // gas falls inward and turns as it falls; what is left over is blown clear when the star lights
      const d = p.d * mix(1, 0.1 + p.d * 0.12, k) + lit * p.d * 0.5, a = p.a + k * (1.6 / (0.3 + p.d)) + Math.sin(t * p.sp + p.wob) * 0.03;
      const px = cx + Math.cos(a) * d * s * 0.46, py = cy + Math.sin(a) * d * s * 0.46 * 0.82;
      dot(ctx, px, py, p.sz, `rgba(${Math.round(mix(150, 255, k * (1 - p.d * 0.6)))},${Math.round(mix(160, 190, k))},${Math.round(mix(200, 150, k))},${0.6 * (1 - lit * 0.75)})`);
    }
    if (lit > 0) sun(ctx, cx, cy, s * 0.05 * lit, lit, '255,214,150');
    say(lit > 0.5 ? 'The star switches on' : k < 0.5 ? 'A cold, dark cloud begins to fall together' : 'The ball heats up as it shrinks', lit > 0.5 ? 'Its light blows the leftover gas away' : 'Gravity does all the work');
  },
};

// ---- 3. the long, steady middle
const steadyScene: Scene = {
  caption: 'The Sun\'s steady life as a bar, with now marked: 4.6 billion years gone of about 10 billion. Under it, to the same scale, the whole life of a star ten times as heavy, which the lesson gives as a few tens of millions of years (drawn as 30 million).',
  stillAt: 9,
  draw({ ctx, w, h, t, say }) {
    backdrop(ctx, w, h, 0.4);
    const x0 = w * 0.08, x1 = w * 0.92, y = h * 0.62, loop = 14, k = ease(((t % loop) - 0.6) / 6), now = 0.46 * k, s = Math.min(w, h);
    sun(ctx, w / 2, h * 0.3, s * 0.085, 1);
    line(ctx, [x0, y, x1, y], 'rgba(236,231,220,.22)', 5);
    line(ctx, [x0, y, x0 + (x1 - x0) * now, y], '#ffd08a', 5);
    for (let b = 0; b <= 10; b += 2) { const x = x0 + ((x1 - x0) * b) / 10; line(ctx, [x, y + 8, x, y + 14], 'rgba(236,231,220,.3)'); label(ctx, b === 0 ? 'Born' : `${b}`, x, y + 26, { align: 'center' }); }
    label(ctx, 'Billions of years', x1, y + 44, { align: 'right' });
    if (k >= 1) { const x = x0 + (x1 - x0) * 0.46; line(ctx, [x, y - 26, x, y - 6], ACCENT); label(ctx, 'Now', x, y - 36, { align: 'center', colour: ACCENT }); }
    label(ctx, 'The Sun', x0, y - 16, { colour: SOFT });
    // a heavy star's whole life, to the same scale
    const y2 = h * 0.84, heavy = (x1 - x0) * 0.003;
    line(ctx, [x0, y2, x0 + Math.max(heavy, 1.5), y2], '#bcd6ff', 5);
    label(ctx, 'A star ten times as heavy: its whole life', x0 + 12, y2, { colour: SOFT });
    say(k < 1 ? 'The Sun has shone steadily for 4.6 billion years' : 'About half way through', 'Heavier stars burn far faster and die far sooner');
  },
};

// ---- 4. two endings
const ring = photoScene({
  src: '/img/learn/ring-nebula-hubble.jpg', caption: '', say: ['A star like the Sun ends gently: the Ring Nebula', 'Its outer layers drift away. The dot in the middle is the hot ember left behind'],
  zoom: [0.94, 1.02], pointers: [{ at: [0.5, 0.5], to: [0.78, 0.2], text: 'The ember: a white dwarf' }],
});
const crab = photoScene({
  src: '/img/learn/crab-nebula-hubble.jpg', caption: '', say: ['A heavy star blows itself apart: the Crab Nebula', 'The wreck of a star seen to explode in the year 1054'],
  zoom: [0.94, 1.02],
});
const endsScene: Scene = {
  caption: 'Two real photographs by the Hubble Space Telescope, shown in turn. The Ring Nebula, about 2,000 light years away: NASA, ESA and C. Robert O\'Dell (Vanderbilt University). The Crab Nebula, 6,500 light years away: NASA, ESA, J. Hester and A. Loll (Arizona State University). Both CC BY 4.0.',
  stillAt: 4,
  ready: Promise.all([ring.ready, crab.ready]),
  draw(f) {
    const each = 9, turn = Math.floor(f.t / each) % 2, at = f.t % each, fade = f.still ? 1 : Math.min(ease(at / 0.8), ease((each - at) / 0.8));
    f.ctx.globalAlpha = fade; (turn ? crab : ring).draw({ ...f, t: at }); f.ctx.globalAlpha = 1;
    if (fade < 1) { f.ctx.fillStyle = `rgba(11,11,12,${1 - fade})`; f.ctx.fillRect(0, 0, f.w, f.h); }
  },
};

export const scenes: Scene[] = [nursery, birthScene, steadyScene, endsScene];
