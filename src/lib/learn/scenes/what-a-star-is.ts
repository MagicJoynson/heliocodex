/**
 * Pictures for the lesson "What a star is". Sizes used: Jupiter is a tenth of the Sun's width (NASA),
 * Proxima Centauri about a seventh (ESO), and the red supergiant Antares about 700 times (ESO, 2017).
 */
import { type Scene, INK, SOFT, ACCENT, clamp, ease, mix, label, stars, rng, nf } from '../stage';
import { TAU, photoScene, globe, sun, dot, ring } from '../kit';

const backdrop = stars(260, 77);

export const lens = photoScene({
  src: '/img/learn/omega-centauri-hubble.jpg',
  caption: 'A real photograph: about 100,000 stars in the heart of the cluster Omega Centauri, 16,000 light years away, by the Hubble Space Telescope in 2009. The colours are real: red giants, hot blue stars, and yellow-white stars like the Sun. Credit: NASA, ESA and the Hubble SM4 ERO Team, CC BY 4.0.',
  say: ['', ''], hero: true, zoom: [1.05, 1.3], focus: [0.5, 0.5],
});

// ---- 1. every star is a sun
const sunsScene: Scene = {
  caption: 'Flying towards one star in the night sky until it shows as what it is: a sun. Its width on the sky grows in step with how close you are. The stars are made up.',
  stillAt: 11,
  draw({ ctx, w, h, t, say }) {
    const loop = 15, x = t % loop, k = ease((x - 1.5) / 8.5), s = Math.min(w, h), cx = w * 0.56, cy = h * 0.44;
    // the rest of the sky slides outward as you close in
    ctx.save(); ctx.translate(cx, cy); ctx.scale(1 + k * 0.5, 1 + k * 0.5); ctx.translate(-cx, -cy); backdrop(ctx, w, h, 1 - 0.75 * k); ctx.restore();
    const r = (s * 0.26) * Math.pow(1 / 4000, 1 - k);
    if (r > 1.4) sun(ctx, cx, cy, r, 1, '255,196,120'); else { dot(ctx, cx, cy, 1.5, '#ffe2b0'); if (k < 0.05) ring(ctx, cx, cy, 12, 'rgba(233,196,138,.6)'); }
    if (k > 0.96) { globe(ctx, cx - s * 0.36, cy + s * 0.16, 3); label(ctx, 'A planet of its own, perhaps', cx - s * 0.36 + 9, cy + s * 0.16 + 12); }
    say(k < 0.05 ? 'One star among thousands' : k < 1 ? 'Closer' : 'Up close, a sun', 'Ours looks different only because we live beside it');
  },
};

// ---- 2. a ball of gas that lights itself
const gas = (() => { const r = rng(21); return Array.from({ length: 420 }, () => ({ a: r() * TAU, d: Math.sqrt(r()), ph: r() * TAU, sp: 0.6 + r() })); })();
const squeezeScene: Scene = {
  caption: 'A ball of gas pulled together by its own weight. The tighter it is squeezed, the faster its atoms move in the middle, which is what hotter means. When the middle is hot enough, fusion begins. A drawing of the idea, not to scale.',
  stillAt: 10,
  draw({ ctx, w, h, t, say }) {
    const loop = 15, x = t % loop, k = ease((x - 0.8) / 7), lit = ease((x - 8) / 1.2), s = Math.min(w, h), cx = w / 2, cy = h * 0.47, R = s * mix(0.42, 0.2, k);
    if (lit > 0) sun(ctx, cx, cy, R * 0.9, lit, '255,205,130');
    for (const p of gas) {
      const hot = (1 - p.d) * (0.25 + k * 1.6), jig = 2 + hot * 7;
      const px = cx + Math.cos(p.a) * p.d * R + Math.cos(t * p.sp * (2 + hot * 9) + p.ph) * jig, py = cy + Math.sin(p.a) * p.d * R + Math.sin(t * p.sp * (2.3 + hot * 9) + p.ph) * jig;
      const c = clamp(hot / 1.4);
      dot(ctx, px, py, 1.3, `rgba(${Math.round(mix(120, 255, c))},${Math.round(mix(150, 225, c))},${Math.round(mix(210, 160, c))},${0.8 * (1 - lit * 0.6)})`);
    }
    // arrows of weight pressing in
    if (lit < 1) for (let i = 0; i < 6; i++) { const a = (i / 6) * TAU + 0.3, r0 = R + 26, r1 = R + 10; ctx.strokeStyle = `rgba(236,231,220,${0.35 * (1 - lit)})`; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(cx + Math.cos(a) * r0, cy + Math.sin(a) * r0); ctx.lineTo(cx + Math.cos(a) * r1, cy + Math.sin(a) * r1); ctx.stroke(); }
    say(lit > 0.5 ? 'Fusion has begun: it is a star' : k < 1 ? 'Its own weight squeezes it smaller' : 'The middle reaches millions of degrees', lit > 0.5 ? 'It will shine for as long as the fuel lasts' : 'Squeezed gas heats up, most of all in the middle');
  },
};

// ---- 3. borrowed light
const borrowScene: Scene = {
  caption: 'A star and a planet. The planet is seen only by the starlight falling on it: cover the star and the planet goes dark as well. Sizes and distance are for show.',
  stillAt: 2,
  draw({ ctx, w, h, t, say }) {
    backdrop(ctx, w, h, 0.5);
    const s = Math.min(w, h), loop = 12, x = t % loop, off = x < 5 ? 0 : x < 6 ? ease(x - 5) : x < 10 ? 1 : 1 - ease(x - 10);
    const sx = w * 0.3, px = w * 0.74, cy = h * 0.47, pr = s * 0.07;
    sun(ctx, sx, cy, s * 0.11, 1 - off, '255,205,130');
    if (off > 0) { ring(ctx, sx, cy, s * 0.11 * 1.0, `rgba(236,231,220,${0.25 * off})`, 1, [2, 5]); label(ctx, 'Star covered', sx, cy + s * 0.11 + 18, { align: 'center' }); }
    // the planet: lit on the side that faces the star
    dot(ctx, px, cy, pr, '#0d0f14');
    ctx.save(); ctx.beginPath(); ctx.arc(px, cy, pr, 0, TAU); ctx.clip();
    const g = ctx.createRadialGradient(px - pr * 1.1, cy, pr * 0.2, px - pr * 0.4, cy, pr * 1.5);
    g.addColorStop(0, `rgba(150,190,240,${1 - off})`); g.addColorStop(0.75, `rgba(60,90,140,${0.5 * (1 - off)})`); g.addColorStop(1, 'rgba(20,30,50,0)');
    ctx.fillStyle = g; ctx.fillRect(px - pr, cy - pr, pr * 2, pr * 2); ctx.restore();
    ring(ctx, px, cy, pr, 'rgba(236,231,220,.12)');
    label(ctx, 'Star: makes its own light', sx, cy - s * 0.11 * 2.2, { align: 'center', colour: ACCENT });
    label(ctx, 'Planet: borrowed light', px, cy - pr - 16, { align: 'center', colour: SOFT });
    say(off > 0.5 ? 'With the star covered, the planet vanishes' : 'The planet shines only where starlight falls on it', 'That is the whole difference between a star and a planet');
  },
};

// ---- 4. many sizes
const BODIES: { name: string; note: string; suns: number; lit: string; dark: string }[] = [
  { name: 'Jupiter', note: 'a planet, for size', suns: 0.1, lit: '214,186,150', dark: '90,70,50' },
  { name: 'Proxima Centauri', note: 'a small red star', suns: 0.14, lit: '255,140,90', dark: '150,50,30' },
  { name: 'The Sun', note: '', suns: 1, lit: '255,236,170', dark: '255,170,70' },
  { name: 'Antares', note: 'a red supergiant', suns: 700, lit: '255,150,80', dark: '190,60,30' },
];
const sizesScene: Scene = {
  caption: 'Jupiter, the small red star Proxima Centauri, the Sun and the supergiant Antares, to the same scale, pulling back until Antares fits. Widths from NASA and ESO. The ring for Mars\'s orbit is worked out here: Antares is wider than it.',
  stillAt: 13,
  draw({ ctx, w, h, t, say }) {
    const loop = 18, x = t % loop, k = ease((x - 2.5) / 8), s = Math.min(w, h), base = h * 0.62;
    const sunPx = (s * 0.42) * Math.pow(1 / 1700, k), gap = sunPx * 0.25;
    let at = w * 0.08;
    BODIES.forEach((b, i) => {
      const r = (b.suns * sunPx) / 2, cx = at + r, cy = base - r; at += r * 2 + gap + (i < 2 ? 26 * (1 - k) : 0);
      if (cx - r > w + 10) return;
      if (r > 0.6) globe(ctx, cx, cy, r, b.lit, b.dark); else dot(ctx, cx, cy, 0.8, `rgb(${b.lit})`);
      const show = i === 3 ? k > 0.6 : r > 2.5 || (i === 2 && k > 0.9);
      if (show) {
        const lx = i === 3 ? Math.min(cx, w * 0.6) : cx, ly = i === 3 ? Math.max(cy - r - 16, h * 0.16) : base + 18;
        ctx.shadowColor = '#000'; ctx.shadowBlur = i === 3 ? 6 : 0;
        label(ctx, b.name, lx, ly, { align: 'center', colour: i === 2 ? ACCENT : INK }); if (b.note && w > 520) label(ctx, b.note, lx, ly + 15, { align: 'center' });
        ctx.shadowBlur = 0;
      }
      if (i === 3 && k > 0.9) { ring(ctx, cx, cy, (2 * 1.524 * 107.5 * sunPx) / 2, 'rgba(11,11,12,.55)', 1, [3, 5]); ctx.fillStyle = 'rgba(11,11,12,.8)'; ctx.font = '400 11px "IBM Plex Mono", monospace'; ctx.textAlign = 'center'; ctx.fillText('THE ORBIT OF MARS, FOR SIZE', cx, cy + 1.524 * 107.5 * sunPx - 12); }
    });
    say(k < 0.05 ? 'The smallest stars are hardly wider than Jupiter' : k < 1 ? 'Pulling back' : 'Antares: about 700 Suns wide', k >= 1 ? 'The Sun is the dot at the left' : 'All to the same scale');
    void nf;
  },
};

// ---- 5. a real star's face
const antares = photoScene({
  src: '/img/learn/antares-surface-vlti.jpg',
  caption: 'A real picture of the face of another star: the red supergiant Antares, 550 light years away, built up from four telescopes working as one at the European Southern Observatory in 2017. When it was made it was the most detailed picture of any star but the Sun. Credit: ESO/K. Ohnaka, CC BY 4.0.',
  say: ['Next to Antares, the Sun is a speck', 'Next to most of its neighbours, the Sun is the bright one'],
  zoom: [0.92, 1.02],
});

export const scenes: Scene[] = [sunsScene, squeezeScene, borrowScene, sizesScene, antares];
