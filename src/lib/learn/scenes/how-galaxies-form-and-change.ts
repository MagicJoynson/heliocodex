/**
 * Pictures for the lesson "How galaxies form and change". Four are real photographs. The joining
 * galaxies are a diagram. The curve of star making follows Madau and Dickinson (2014): its fall
 * after the peak is to scale, its rise is a sketch, and the caption says so.
 */
import { type Scene, SOFT, ACCENT, clamp, ease, mix, label, stars, rng } from '../stage';
import { TAU, photoScene, dot, line } from '../kit';

const backdrop = stars(90, 877);
const HUDF = 'A real photograph: the Hubble Ultra Deep Field, with nearly 10,000 galaxies. The smallest, reddest ones are seen as they were when the universe was about 800 million years old. Credit: NASA, ESA, S. Beckwith (STScI) and the HUDF Team, CC BY 4.0.';

export const lens = photoScene({ src: '/img/learn/hubble-ultra-deep-field.jpg', caption: HUDF, say: ['', ''], hero: true, cover: true, zoom: [1.3, 1.5], focus: [0.6, 0.4] });

const early = photoScene({ src: '/img/learn/hubble-ultra-deep-field.jpg', caption: HUDF, say: ['Looking back', 'The faint ones are small, ragged and young'], cover: true, zoom: [1.3, 1.7], focus: [0.6, 0.4] });

const first = photoScene({
  src: '/img/learn/jades-gs-z14-0-webb.jpg',
  caption: 'A real photograph in infrared light by the James Webb Space Telescope, published on 30 May 2024. Infrared has no colour, so the colours were chosen. The box and the enlarged view of the galaxy JADES-GS-z14-0 are part of the published picture. Credit: NASA, ESA, CSA, STScI, B. Robertson (UC Santa Cruz), B. Johnson (CfA), S. Tacchella (Cambridge), P. Cargile (CfA), CC BY 4.0.',
  say: ['Less than 300 million years after the start', 'The most distant galaxy known when this was published'], zoom: [1, 1.25], focus: [0.72, 0.28], tag: 'Infrared photograph',
});

// ---- 3. small ones join into big ones
const R = rng(31);
const SEEDS = Array.from({ length: 16 }, (_, i) => ({ a: (i / 16) * TAU + R() * 0.3, d: 0.55 + R() * 0.45, g: Math.floor(i / 4), s: R() }));
const build: Scene = {
  caption: 'A diagram, not to scale. Sixteen small galaxies fall together into four, and the four into one. Real galaxies grew the same way, over billions of years and from far more pieces.',
  stillAt: 9,
  draw({ ctx, w, h, t, say }) {
    backdrop(ctx, w, h, 0.35);
    const cx = w / 2, cy = h * 0.42, S = Math.min(w * 0.42, h * 0.38), T = t % 13, k1 = ease(clamp((T - 0.8) / 3.2, 0, 1)), k2 = ease(clamp((T - 5) / 3.2, 0, 1));
    const groups = [0, 1, 2, 3].map((g) => { const a = (g / 4) * TAU + 0.6; return [cx + Math.cos(a) * S * 0.5 * (1 - k2), cy + Math.sin(a) * S * 0.42 * (1 - k2)]; });
    const home = [0, 1, 2, 3].map((g) => { const a = (g / 4) * TAU + 0.6; return [cx + Math.cos(a) * S * 0.5, cy + Math.sin(a) * S * 0.42]; });
    for (const p of SEEDS) {
      const sx = cx + Math.cos(p.a) * S * p.d, sy = cy + Math.sin(p.a) * S * p.d * 0.8;
      if (k1 > 0) { line(ctx, [sx, sy, home[p.g][0], home[p.g][1]], `rgba(160,190,255,${0.22 * k1})`); dot(ctx, sx, sy, 1.5, `rgba(160,190,255,${0.5 * k1})`); }
      if (k2 > 0) line(ctx, [home[p.g][0], home[p.g][1], cx, cy], `rgba(233,196,138,${0.3 * k2})`);
      const x0 = cx + Math.cos(p.a) * S * p.d, y0 = cy + Math.sin(p.a) * S * p.d * 0.8, [gx, gy] = groups[p.g];
      const x = mix(x0, gx, k1), y = mix(y0, gy, k1), r = mix(3 + p.s * 2.5, 2, k1);
      if (k1 < 1) { const g = ctx.createRadialGradient(x, y, 0, x, y, r * 3); g.addColorStop(0, 'rgba(160,190,255,.9)'); g.addColorStop(1, 'rgba(160,190,255,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r * 3, 0, TAU); ctx.fill(); }
    }
    if (k1 > 0.6) groups.forEach(([x, y]) => {
      const r = mix(9, 22, k2) * (w > 560 ? 1.3 : 1), al = clamp((k1 - 0.6) / 0.4, 0, 1) * (k2 >= 1 ? 0.5 : 1);
      const g = ctx.createRadialGradient(x, y, 0, x, y, r * 2.4); g.addColorStop(0, `rgba(255,236,200,${al})`); g.addColorStop(0.4, `rgba(233,196,138,${al * 0.5})`); g.addColorStop(1, 'rgba(233,196,138,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(x, y, r * 2.4, r * 1.7, 0.3, 0, TAU); ctx.fill();
    });
    label(ctx, k2 >= 1 ? 'One large galaxy' : k1 >= 1 ? 'Four middling galaxies' : 'Sixteen small galaxies', cx, h * 0.84, { align: 'center', colour: ACCENT });
    say('Built from pieces', 'Small galaxies join, and the joined ones join again');
  },
};

// ---- 4. the rate of star making
const curve: Scene = {
  caption: 'A chart of how fast the universe has made stars, after Madau and Dickinson (2014). The peak and the fall since are drawn to scale from their figures. The rise before the peak is only a sketch.',
  stillAt: 6,
  draw({ ctx, w, h, t, say }) {
    backdrop(ctx, w, h, 0.25);
    const x0 = w * 0.1, x1 = w * 0.93, y0 = h * 0.72, y1 = h * 0.1, k = ease(clamp(t / 4.5, 0, 1));
    const X = (g: number) => x0 + (g / 13.8) * (x1 - x0), rate = (g: number) => (g < 3.5 ? Math.sin((g / 3.5) * (Math.PI / 2)) ** 1.6 : Math.exp(-(g - 3.5) / 3.9));
    line(ctx, [x0, y0, x1, y0], 'rgba(236,231,220,.5)'); line(ctx, [x0, y0, x0, y1], 'rgba(236,231,220,.5)');
    ctx.beginPath(); ctx.moveTo(x0, y0);
    for (let i = 0; i <= 120; i++) { const g = (i / 120) * 13.8 * k; ctx.lineTo(X(g), y0 - rate(g) * (y0 - y1) * 0.92); }
    ctx.lineTo(X(13.8 * k), y0); ctx.closePath(); ctx.fillStyle = 'rgba(233,196,138,.22)'; ctx.fill();
    ctx.beginPath(); for (let i = 0; i <= 120; i++) { const g = (i / 120) * 13.8 * k, y = y0 - rate(g) * (y0 - y1) * 0.92; i ? ctx.lineTo(X(g), y) : ctx.moveTo(X(g), y); }
    ctx.strokeStyle = ACCENT; ctx.lineWidth = 2; ctx.stroke();
    if (k > 0.3) { dot(ctx, X(3.5), y0 - (y0 - y1) * 0.92, 4, '#fff'); label(ctx, 'The peak', X(3.5) + 10, y0 - (y0 - y1) * 0.92 - 4, { align: 'left' }); }
    if (k >= 1) { dot(ctx, X(13.8), y0 - rate(13.8) * (y0 - y1) * 0.92, 4, '#fff'); label(ctx, 'Now', X(13.8), y0 - rate(13.8) * (y0 - y1) * 0.92 - 14, { align: 'right' }); }
    label(ctx, 'The start', x0, y0 + 18, { align: 'left', colour: SOFT }); label(ctx, '13.8 billion years', x1, y0 + 18, { align: 'right', colour: SOFT });
    label(ctx, 'Stars made each year', x1, y1 + 4, { align: 'right', colour: SOFT });
    say('The busiest days are long past', 'Stars are now made at about a fourteenth of the peak rate');
  },
};

const shapes = photoScene({
  src: '/img/learn/hubble-sequence-through-time.jpg',
  caption: 'Real photographs by the Hubble Space Telescope, arranged by shape at three ages: today, 4 billion years ago and 11 billion years ago. The galaxies were picked to show the pattern and their ages are approximate. Credit: NASA, ESA, M. Kornmesser, CC BY 4.0.',
  say: ['Three ages, side by side', 'Further back they are smaller, redder and less tidy'], zoom: [1, 1.12], focus: [0.5, 0.5], tag: 'Photographs, arranged',
});

const home = photoScene({
  src: '/img/learn/milky-way-panorama-eso.jpg',
  caption: 'A real photograph: the whole Milky Way, pieced together over several months. Credit: ESO/S. Brunier, CC BY 4.0.',
  say: ['Our own galaxy was built this way', 'About 10 billion years ago it swallowed another'], cover: true, zoom: [1, 1.15], focus: [0.5, 0.5],
});

export const scenes: Scene[] = [early, first, build, curve, shapes, home];
