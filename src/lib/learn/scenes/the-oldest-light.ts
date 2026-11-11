/**
 * Pictures for the lesson "The oldest light". The photograph of the antenna and the map of the sky
 * are real. The clearing fog, the stretching wave, the shell round us and the bar of what the
 * universe is made of are drawings; the bar is to scale from WMAP's nine-year figures.
 */
import { type Scene, SOFT, ACCENT, clamp, ease, mix, label, stars, rng } from '../stage';
import { TAU, photoScene, dot, line } from '../kit';

const backdrop = stars(100, 349);
const MAP = 'A real map of the whole sky in microwaves, from nine years of measurements by NASA’s WMAP spacecraft. Microwaves have no colour: red was chosen for slightly warmer patches and blue for slightly cooler, and the glow of our own galaxy has been taken out. Credit: NASA/WMAP Science Team.';

export const lens = photoScene({ src: '/img/learn/cmb-wmap-9-year.jpg', caption: MAP, say: ['', ''], hero: true, zoom: [0.95, 1.05], focus: [0.5, 0.5], tag: 'Microwave map' });

// ---- 1. the antenna
const horn = photoScene({
  src: '/img/learn/holmdel-horn-antenna-1962.jpg',
  caption: 'A real photograph: the horn antenna at Bell Telephone Laboratories in Holmdel, New Jersey, in June 1962, two years before it picked up the glow. Credit: NASA.',
  say: ['A hiss that would not go away', 'The same by day and night, from every part of the sky'], zoom: [0.95, 1.08], focus: [0.55, 0.45],
});

// ---- 2. the fog clears
const P = (() => { const r = rng(3); return Array.from({ length: 70 }, () => [r(), r(), r() * TAU, r()] as [number, number, number, number]); })();
const fog: Scene = {
  caption: 'Before and after the fog cleared. At first the light, in yellow, bounces from one loose particle to the next and gets nowhere. Once the particles have joined into atoms, it travels in straight lines. A drawing of the idea, not to scale.',
  stillAt: 7.5,
  draw({ ctx, w, h, t, say }) {
    const c = t % 12, k = ease(clamp((c - 4) / 2, 0, 1)), top = h * 0.04, hh = h * 0.7;
    ctx.fillStyle = `rgb(${Math.round(mix(120, 9, k))},${Math.round(mix(52, 10, k))},${Math.round(mix(20, 13, k))})`; ctx.fillRect(0, top, w, hh);
    for (const [x, y, a, s] of P) {
      const px = x * w, py = top + y * hh;
      dot(ctx, px + Math.cos(a + t) * 3 * (1 - k), py + Math.sin(a + t * 1.3) * 3 * (1 - k), 2, k < 0.5 ? '#9fd0ff' : 'rgba(190,200,215,.55)');
      if (k < 0.5) dot(ctx, px + 9 * Math.cos(a * 3 + t * 2), py + 9 * Math.sin(a * 5 + t * 2), 1.2, '#ff8f70');
      else { ctx.strokeStyle = 'rgba(190,200,215,.25)'; ctx.beginPath(); ctx.arc(px, py, 5, 0, TAU); ctx.stroke(); }
      void s;
    }
    for (let i = 0; i < 6; i++) { // light
      const y0 = top + ((i + 0.5) / 6) * hh;
      if (k < 0.5) { ctx.strokeStyle = 'rgba(255,225,140,.9)'; ctx.lineWidth = 1.4; ctx.beginPath(); let x = w * (0.15 + 0.12 * i), y = y0; ctx.moveTo(x, y); const r = rng(i * 7 + Math.floor(t * 3)); for (let j = 0; j < 5; j++) { x += (r() - 0.5) * 46; y += (r() - 0.5) * 46; ctx.lineTo(x, clamp(y, top + 4, top + hh - 4)); } ctx.stroke(); }
      else { const x = ((c - 5) * 0.2 + i * 0.13) % 1 * w; line(ctx, [x - 30, y0, x, y0], 'rgba(255,225,140,.95)', 1.8); }
    }
    label(ctx, k < 0.5 ? 'Before: a glowing fog' : 'After: clear, and dark', 10, top + 18, { align: 'left', colour: k < 0.5 ? '#fff' : ACCENT });
    say('380,000 years after the start, the fog cleared', 'The light set free then is still on its way');
  },
};

// ---- 3. stretched
const stretch: Scene = {
  caption: 'One wave of the light, stretched as space itself stretched. A drawing of the idea: the real stretch is about 1,100 times, far more than can be shown, and takes the wave from about a thousandth of a millimetre to about a millimetre.',
  stillAt: 6,
  draw({ ctx, w, h, t, say }) {
    backdrop(ctx, w, h, 0.4);
    const k = ease(clamp((t % 10) / 6, 0, 1)), x0 = w * 0.08, x1 = w * 0.92, cy = h * 0.34, wl = mix(9, 150, k), amp = h * 0.11;
    const col = `rgb(${Math.round(mix(255, 170, k))},${Math.round(mix(170, 200, k))},${Math.round(mix(110, 235, k))})`;
    ctx.strokeStyle = col; ctx.lineWidth = 2; ctx.beginPath(); for (let x = x0; x <= x1; x += 1.5) { const y = cy + Math.sin(((x - x0) / wl) * TAU) * amp; x === x0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); } ctx.stroke();
    const temp = 3000 * Math.pow(2.725 / 3000, k);
    label(ctx, `${temp >= 100 ? Math.round(temp / 10) * 10 : temp.toFixed(1)} degrees above absolute zero`, w / 2, cy + amp + 34, { align: 'center', colour: ACCENT });
    label(ctx, k < 0.5 ? 'Just beyond red light' : 'Microwaves', w / 2, cy - amp - 14, { align: 'center', colour: SOFT });
    say('Space stretched, and the light with it', 'From 3,000 degrees down to 2.7');
  },
};

// ---- 4. the map
const map = photoScene({ src: '/img/learn/cmb-wmap-9-year.jpg', caption: MAP, say: ['The whole sky, in the oldest light', 'Red and blue differ by two ten-thousandths of a degree'], zoom: [0.95, 1.05], focus: [0.5, 0.5], tag: 'Microwave map' });

// ---- 5. a shell round us
const shell: Scene = {
  caption: 'Why the glow comes from every direction. The fog was everywhere, so whichever way we look, far enough off we see the moment it cleared. That makes a shell with us at the middle. A drawing of the idea, not to scale.',
  stillAt: 4,
  draw({ ctx, w, h, t, say }) {
    backdrop(ctx, w, h, 0.5);
    const cx = w / 2, cy = h * 0.4, R = Math.min(w * 0.36, h * 0.34);
    for (let i = 0; i < 90; i++) { const a = (i / 90) * TAU, hot = Math.sin(i * 12.9898) * 43758.5453 % 1; ctx.strokeStyle = hot > 0 ? 'rgba(255,150,90,.75)' : 'rgba(110,170,255,.75)'; ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(cx, cy, R, a, a + TAU / 90 + 0.01); ctx.stroke(); }
    for (let i = 0; i < 12; i++) { const a = (i / 12) * TAU + 0.2, p = ((t * 0.25 + i * 0.37) % 1), r0 = R * (1 - p), r1 = Math.max(8, r0 - 18); line(ctx, [cx + Math.cos(a) * r0, cy + Math.sin(a) * r0, cx + Math.cos(a) * r1, cy + Math.sin(a) * r1], 'rgba(255,225,140,.8)', 1.4); }
    dot(ctx, cx, cy, 4, '#5a9bff'); label(ctx, 'Us', cx, cy + 20, { align: 'center' });
    label(ctx, 'Where the fog cleared', cx, cy - R - 12, { align: 'center', colour: ACCENT });
    say('The same glow from every direction', 'It is as far back as light can show');
  },
};

// ---- 6. what it tells
const PARTS: [string, number, string][] = [['Atoms', 5, '#e9c48a'], ['Dark matter', 25, '#7f93b8'], ['Dark energy', 70, '#3d4a66']];
const tells: Scene = {
  caption: 'What the universe is made of, worked out from the pattern of patches in the map: about 5 per cent ordinary atoms, 25 per cent dark matter and 70 per cent dark energy, from nine years of WMAP’s measurements. The bar is to scale.',
  stillAt: 3,
  draw({ ctx, w, h, t, say }) {
    backdrop(ctx, w, h, 0.4);
    const x0 = w * 0.08, bw = w * 0.84, y = h * 0.28, bh = h * 0.14, k = ease(clamp(t / 2, 0, 1)); let x = x0;
    PARTS.forEach(([name, pc, col], i) => {
      const ww = (bw * pc * k) / 100; ctx.fillStyle = col; ctx.fillRect(x, y, ww, bh);
      const mid = x + ww / 2, up = i === 0;
      label(ctx, `${name} ${pc}%`, up ? x0 : mid, up ? y - 12 : y + bh + 20, { align: up ? 'left' : 'center', colour: i === 0 ? ACCENT : SOFT });
      x += ww;
    });
    label(ctx, 'Age: 13.77 billion years', w / 2, y + bh + 54, { align: 'center' });
    say('The patches fix the numbers', 'Everything made of atoms is about a twentieth of what there is');
  },
};

export const scenes: Scene[] = [horn, fog, stretch, map, shell, tells];
