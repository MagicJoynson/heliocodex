/**
 * Pictures for the lesson "How it all ends". Three are real photographs. The fading sky and the
 * three endings are diagrams. The chart of ages is to scale on a ruler where each step is ten
 * times longer than the one before, from Adams and Laughlin (1997).
 */
import { type Scene, SOFT, ACCENT, clamp, ease, mix, label, rng } from '../stage';
import { TAU, photoScene, dot, line } from '../kit';

const M31 = 'A real photograph: the Andromeda galaxy, pieced together from more than 600 pictures taken by the Hubble Space Telescope over ten years. The jagged edge is where the separate pictures stop. Credit: NASA, ESA, B. Williams (University of Washington), CC BY 4.0.';

export const lens = photoScene({ src: '/img/learn/andromeda-hubble-mosaic.jpg', caption: M31, say: ['', ''], hero: true, cover: true, zoom: [1, 1.1], focus: [0.42, 0.5] });

const sun = photoScene({
  src: '/img/learn/ring-nebula-hubble.jpg',
  caption: 'A real photograph: the Ring Nebula, by the Hubble Space Telescope. A star like the Sun has puffed its outer layers off into space, and the dot in the middle is the ember left behind. Credit: NASA, ESA and C. Robert O’Dell (Vanderbilt University), CC BY 4.0.',
  say: ['The Sun’s own ending', 'More than 5 billion years from now'], zoom: [0.9, 1.05], focus: [0.5, 0.5],
});

const andromeda = photoScene({ src: '/img/learn/andromeda-hubble-mosaic.jpg', caption: M31, say: ['Andromeda, 2.5 million light years away', 'An even chance of meeting the Milky Way within 10 billion years'], cover: true, zoom: [1, 1.12], focus: [0.42, 0.5] });

// ---- 3. the lights go out
const R = rng(97);
const SKY = Array.from({ length: 260 }, () => { const m = R(); return { x: R(), y: R(), m, out: m < 0.12 ? 0.05 + R() * 0.2 : m < 0.5 ? 0.2 + R() * 0.3 : 0.5 + R() * 0.48 }; });
const fade: Scene = {
  caption: 'A diagram, not a forecast of any real patch of sky. Big blue-white stars burn out first and small red ones last. No new stars are made after about 100 trillion years.',
  stillAt: 1.5,
  draw({ ctx, w, h, t, say }) {
    const k = clamp((t % 16) / 12, 0, 1), top = h * 0.86;
    for (const s of SKY) {
      const a = clamp((s.out - k) / 0.08, 0, 1); if (a <= 0) continue;
      const big = s.m < 0.12, mid = s.m < 0.5 && !big, r = (big ? 2.4 : mid ? 1.5 : 1) * (w > 560 ? 1.7 : 1.25);
      dot(ctx, s.x * w, s.y * top, r, big ? `rgba(190,215,255,${a})` : mid ? `rgba(255,240,205,${a * 0.9})` : `rgba(255,150,110,${a * 0.85})`);
    }
    const yrs = k < 0.02 ? 'Now: 13.8 billion years' : k < 0.3 ? 'Tens of billions of years' : k < 0.6 ? 'A trillion years' : k < 0.98 ? 'Ten trillion years' : '100 trillion years';
    label(ctx, yrs, w / 2, h * 0.93, { align: 'center', colour: ACCENT });
    say(k >= 0.98 ? 'Dark' : 'The lights go out', 'The small red stars are the last to fade');
  },
};

// ---- 4. the ages to come
const ERAS: [number, number, string, string][] = [[6, 14, 'Stars', 'rgba(255,236,200,.85)'], [15, 37, 'Dead stars', 'rgba(200,150,110,.7)'], [38, 100, 'Black holes', 'rgba(110,120,160,.7)']];
const ages: Scene = {
  caption: 'A chart to scale on a ruler of powers of ten: each mark stands for a time ten times longer than the mark before. The three ages are from Adams and Laughlin (1997). On an ordinary ruler the whole age of stars would be far too thin to see.',
  stillAt: 6,
  draw({ ctx, w, h, t, say }) {
    const x0 = w * 0.07, x1 = w * 0.94, y = h * 0.44, k = ease(clamp(t / 4.5, 0, 1)), X = (p: number) => x0 + (p / 100) * (x1 - x0), bar = Math.min(60, h * 0.13);
    line(ctx, [x0, y + bar, x1, y + bar], 'rgba(236,231,220,.5)');
    for (let p = 0; p <= 100; p += 10) { line(ctx, [X(p), y + bar, X(p), y + bar + 6], 'rgba(236,231,220,.5)'); if (p % 20 === 0 || w > 560) label(ctx, String(p), X(p), y + bar + 22, { align: 'center', colour: SOFT }); }
    label(ctx, 'Noughts in the number of years', x1, y + bar + 42, { align: 'right', colour: SOFT });
    ERAS.forEach(([a, b, name, colour], i) => {
      const end = Math.min(b, a + (100 - 0) * k * 1.2 - (a - 6)); if (end <= a) return;
      ctx.fillStyle = colour; ctx.fillRect(X(a), y, X(end) - X(a), bar);
      if (end >= b) label(ctx, name, (X(a) + X(b)) / 2, y - 12 - (w <= 560 && i === 0 ? 14 : 0), { align: 'center', colour: i === 0 ? '#fff' : SOFT });
    });
    line(ctx, [X(10.14), y - 6, X(10.14), y + bar + 6], ACCENT, 2); label(ctx, 'Now', X(10.14), y + bar + (w > 560 ? 62 : 60), { align: 'center', colour: ACCENT });
    line(ctx, [X(10.14), y + bar + 6, X(10.14), y + bar + 48], 'rgba(233,196,138,.4)');
    say('The ages to come', 'The age of stars is the short bright strip at the start');
  },
};

// ---- 5. three endings
const three: Scene = {
  caption: 'A diagram, not to scale: the distance between any two far-apart galaxies as time goes on, for three possible endings. Measurements so far point to the middle one.',
  stillAt: 6,
  draw({ ctx, w, h, t, say }) {
    const x0 = w * 0.1, x1 = w * 0.9, y0 = h * 0.74, y1 = h * 0.08, k = ease(clamp(t / 5, 0, 1)), now = 0.3;
    line(ctx, [x0, y0, x1, y0], 'rgba(236,231,220,.5)'); line(ctx, [x0, y0, x0, y1], 'rgba(236,231,220,.5)');
    const base = (u: number) => 0.3 * Math.pow(u / now, 0.66);
    const f: [string, string, (u: number) => number][] = [
      ['Big Rip', 'rgba(255,140,110,.95)', (u) => (u < now ? base(u) : 0.3 + 0.06 * (u - now) / (0.86 - u + 0.02) * 1.2 + 0.25 * (u - now))],
      ['Big Freeze', 'rgba(236,231,220,.95)', (u) => (u < now ? base(u) : 0.3 + 0.66 * (u - now) + 0.35 * (u - now) ** 2)],
      ['Big Crunch', 'rgba(140,180,255,.95)', (u) => (u < now ? base(u) : Math.max(0, 0.3 + 0.66 * (u - now) - 1.45 * (u - now) ** 2))],
    ];
    f.forEach(([name, colour, fn], i) => {
      ctx.beginPath(); let lx = x0, ly = y0;
      for (let j = 0; j <= 140; j++) { const u = (j / 140) * k, v = fn(u); if (v > 1.02) break; lx = mix(x0, x1, u); ly = y0 - v * (y0 - y1); j ? ctx.lineTo(lx, ly) : ctx.moveTo(lx, ly); if (j > 10 && v <= 0) break; }
      ctx.strokeStyle = colour; ctx.lineWidth = 2; ctx.stroke();
      if (k >= 1) label(ctx, name, i === 0 ? lx - 14 : lx, i === 2 ? ly - 12 : ly + (i === 0 ? 40 : -10), { align: 'right', colour });
    });
    const nx = mix(x0, x1, now); line(ctx, [nx, y0, nx, y0 - 0.3 * (y0 - y1)], 'rgba(233,196,138,.6)'); dot(ctx, nx, y0 - 0.3 * (y0 - y1), 4, ACCENT);
    label(ctx, 'Now', nx, y0 + 18, { align: 'center', colour: ACCENT }); label(ctx, 'Time', x1, y0 + 18, { align: 'right', colour: SOFT }); label(ctx, 'Further apart', x0 + 8, y1 + 2, { align: 'left', colour: SOFT });
    say('Three endings', 'Which one depends on what dark energy does next');
  },
};

const clue = photoScene({
  src: '/img/learn/supernova-1994d-hubble.jpg',
  caption: 'A real photograph: Supernova 1994D, the bright point at lower left, at the edge of the galaxy NGC 4526, by the Hubble Space Telescope. Credit: NASA/ESA, The Hubble Key Project Team and The High-Z Supernova Search Team, CC BY 4.0.',
  say: ['How the push was found', 'Exploding stars like this one showed the expansion is speeding up'], zoom: [1, 1.12], focus: [0.5, 0.5],
});

export const scenes: Scene[] = [sun, andromeda, fade, ages, three, clue];
