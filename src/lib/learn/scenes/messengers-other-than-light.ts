/**
 * Pictures for the lesson "Messengers other than light". The three photographs are real. The
 * neutrinos crossing the Earth and the cosmic ray shower are drawings of the idea, not to scale.
 * The detector under the ice is drawn to scale from IceCube's own figures.
 */
import { type Scene, SOFT, ACCENT, clamp, label, stars, rng } from '../stage';
import { TAU, photoScene, sun, dot, line } from '../kit';

const backdrop = stars(110, 131);
const LAB = 'The IceCube Laboratory at the South Pole, which sits on top of the neutrino detector buried in the ice. Credit: US Geological Survey, public domain.';

export const lens = photoScene({
  src: '/img/learn/icecube-lab-south-pole.jpg', caption: `A real photograph. ${LAB}`,
  say: ['', ''], hero: true, cover: true, zoom: [1, 1.08], focus: [0.62, 0.5],
});

// ---- 1. the building
const lab = photoScene({
  src: '/img/learn/icecube-lab-south-pole.jpg', caption: `A real photograph. ${LAB}`,
  say: ['A telescope under the ice', 'It catches particles, not light'],
  cover: true, zoom: [1, 1.1], focus: [0.62, 0.52],
});

// ---- 2. straight through
const through: Scene = {
  caption: 'Light from the Sun stops at the ground on the day side of the Earth. Neutrinos from the Sun carry straight on through the planet and out of the night side. A drawing of the idea, not to scale.',
  stillAt: 4,
  draw({ ctx, w, h, t, say }) {
    backdrop(ctx, w, h, 0.4);
    const cy = h * 0.4, R = Math.min(w * 0.14, h * 0.24), ex = w * 0.62, sx = w * 0.08;
    sun(ctx, sx, cy, R * 0.55, 1);
    ctx.fillStyle = '#17304f'; ctx.beginPath(); ctx.arc(ex, cy, R, 0, TAU); ctx.fill();
    ctx.fillStyle = '#2c5f9e'; ctx.beginPath(); ctx.arc(ex, cy, R, TAU / 4, (3 * TAU) / 4); ctx.fill();
    for (let i = 0; i < 5; i++) { // light, stopping at the day side
      const y = cy + (i - 2) * R * 0.36, end = ex - Math.sqrt(Math.max(0, R * R - (y - cy) ** 2)), p = (t * 0.5 + i * 0.13) % 1, x = sx + R + (end - sx - R) * p;
      line(ctx, [x - 16, y, x, y], 'rgba(255,225,150,.9)', 2);
    }
    for (let i = 0; i < 9; i++) { // neutrinos, not stopping
      const y = cy + (i - 4) * R * 0.22 + R * 0.08, p = (t * 0.32 + i * 0.37) % 1, x = sx + R + (w - sx - R) * p;
      dot(ctx, x, y, 1.8, '#9fe0ff');
    }
    label(ctx, 'Sun', sx, cy + R * 0.55 + 22, { align: 'center' }); label(ctx, 'Day', ex - R * 0.5, cy + R + 18, { align: 'center' }); label(ctx, 'Night', ex + R * 0.5, cy + R + 18, { align: 'center', colour: SOFT });
    label(ctx, 'Neutrinos', ex, cy - R - 12, { align: 'center', colour: '#9fe0ff' });
    say('Light stops. Neutrinos do not', 'Tens of billions cross each square centimetre of you every second');
  },
};

// ---- 3. the detector, to scale
const strings = rng(7);
const XS = Array.from({ length: 14 }, (_, i) => (i + 0.5) / 14 + (strings() - 0.5) * 0.02);
const detector: Scene = {
  caption: 'The detector under the building, drawn to scale from the side: cables of sensors frozen into the ice between about 1,450 and 2,450 metres down. The streak is a drawing of the light a neutrino sets off, in a colour chosen here. Not every cable is shown.',
  stillAt: 5.2,
  draw({ ctx, w, h, t, say }) {
    const top = h * 0.07, m = (h * 0.68) / 2600, cx = w / 2, half = 500 * m, y = (d: number) => top + d * m;
    ctx.fillStyle = '#0b1620'; ctx.fillRect(0, top, w, h);
    line(ctx, [0, top, w, top], 'rgba(236,231,220,.6)', 1.4);
    ctx.fillStyle = '#7fb4d8'; ctx.fillRect(cx - 5, top - 7, 10, 7);
    const p = clamp(((t % 9) - 2) / 2.2, 0, 1), on = (t % 9) > 2;
    const tx = (q: number) => cx - half * 0.9 + q * half * 1.7, ty = (q: number) => y(2500) - q * 1150 * m;
    for (const u of XS) {
      const x = cx - half + u * 2 * half; line(ctx, [x, top, x, y(2450)], 'rgba(236,231,220,.14)');
      for (let k = 0; k < 20; k++) {
        const sy = y(1450 + (k / 19) * 1000); let glow = 0;
        if (on) for (let q = 0; q <= p; q += 0.04) { const d = Math.hypot(x - tx(q), sy - ty(q)); glow = Math.max(glow, clamp(1 - d / (half * 0.2), 0, 1)); }
        dot(ctx, x, sy, 1.3 + glow * 2.6, glow > 0.05 ? `rgba(150,215,255,${0.5 + glow * 0.5})` : 'rgba(236,231,220,.4)');
      }
    }
    if (on) line(ctx, [tx(0), ty(0), tx(p), ty(p)], 'rgba(150,215,255,.5)', 1.4);
    const lx = cx + half + 12, right = w - lx > 90;
    for (const [d, txt] of [[0, 'The surface'], [1450, '1,450 m'], [2450, '2,450 m']] as [number, string][]) {
      line(ctx, [cx + half + 2, y(d), cx + half + 8, y(d)], 'rgba(236,231,220,.5)');
      label(ctx, txt, right ? lx : w - 6, y(d) + (d ? 4 : 14), { align: right ? 'left' : 'right', colour: d ? ACCENT : SOFT });
    }
    label(ctx, '1 km', cx, y(2450) + 20, { align: 'center' }); line(ctx, [cx - half, y(2450) + 8, cx + half, y(2450) + 8], 'rgba(236,231,220,.5)');
    say('5,160 sensors in a cubic kilometre of ice', 'A neutrino from below sets off a streak of light');
  },
};

// ---- 4. 1987
const sn = photoScene({
  src: '/img/learn/supernova-1987a-hubble.jpg',
  caption: 'A real photograph: what is left of Supernova 1987A, in the Large Magellanic Cloud, by the Hubble Space Telescope. The rings are gas the star threw off long before it exploded, lit up by the blast. Credit: ESA/Hubble and NASA, CC BY 4.0. The mark was added here.',
  say: ['Supernova 1987A', '25 neutrinos from its core were caught, before anyone saw the light'],
  zoom: [1, 1.5], focus: [0.5, 0.5],
});

// ---- 5. a shower
interface Seg { x0: number; y0: number; x1: number; y1: number; g: number }
const SEGS: Seg[] = (() => {
  const r = rng(41), out: Seg[] = [];
  const grow = (x: number, y: number, a: number, g: number) => {
    if (g > 6) return; const len = 0.13 * (0.75 + r() * 0.4), x1 = x + Math.sin(a) * len, y1 = y + Math.cos(a) * len;
    out.push({ x0: x, y0: y, x1, y1, g }); const n = g < 2 ? 2 : r() < 0.75 ? 2 : 1;
    for (let i = 0; i < n; i++) grow(x1, y1, a + (r() - 0.5) * 0.5, g + 1);
  };
  grow(0, 0, 0.12, 0); return out;
})();
const shower: Scene = {
  caption: 'One cosmic ray hitting the top of the air and breaking into a widening shower of particles, which detectors spread over the ground pick up. A drawing of the idea, not to scale: a real shower holds vastly more particles than can be drawn.',
  stillAt: 5,
  draw({ ctx, w, h, t, say }) {
    backdrop(ctx, w, h, 0.5);
    const g = h * 0.72, top = h * 0.2, cx = w * 0.46, S = (g - top) / 0.92, p = clamp(((t % 9) - 0.8) / 3, 0, 1) * 7.2;
    const sky = ctx.createLinearGradient(0, top, 0, g); sky.addColorStop(0, 'rgba(60,110,170,0)'); sky.addColorStop(1, 'rgba(60,110,170,.28)');
    ctx.fillStyle = sky; ctx.fillRect(0, top, w, g - top); ctx.fillStyle = '#15161a'; ctx.fillRect(0, g, w, h - g); line(ctx, [0, g, w, g], 'rgba(236,231,220,.4)');
    const inn = clamp((t % 9) / 0.8, 0, 1); line(ctx, [cx - 0.12 * S * 0.6 * (1 - 0) - 30, top - 60, cx - 30 + 30 * inn, top - 60 + 60 * inn], '#fff', 1.6);
    for (const s of SEGS) { const k = clamp(p - s.g, 0, 1); if (k <= 0) continue; const y1 = Math.min(g, top + (s.y0 + (s.y1 - s.y0) * k) * S); line(ctx, [cx + s.x0 * S, top + s.y0 * S, cx + (s.x0 + (s.x1 - s.x0) * k) * S, y1], `rgba(233,196,138,${0.9 - s.g * 0.09})`, 1.2); }
    for (let i = 0; i < 9; i++) { const x = w * 0.1 + (i / 8) * w * 0.8, hit = p > 6.6 && Math.abs(x - cx - 0.08 * S) < S * 0.3; ctx.fillStyle = hit ? ACCENT : 'rgba(236,231,220,.45)'; ctx.fillRect(x - 4, g - 5, 8, 5); }
    label(ctx, 'Top of the air', 8, top - 6, { align: 'left', colour: SOFT }); label(ctx, 'Detectors on the ground', w - 8, g + 18, { align: 'right' });
    say('One particle in, a shower out', 'In 1991 a single one carried the energy of a hard tennis serve');
  },
};

// ---- 6. two messengers at once
const kilonova = photoScene({
  src: '/img/learn/kilonova-ngc4993-hubble.jpg',
  caption: 'A real photograph: the galaxy NGC 4993, 130 million light years away, by the Hubble Space Telescope. The boxed dot is the glow left by two neutron stars that crashed together, and the three panels show it fading between 22 and 28 August 2017. The box and dates are part of the published picture. Credit: NASA and ESA. Acknowledgment: A.J. Levan (U. Warwick), N.R. Tanvir (U. Leicester), and A. Fruchter and O. Fox (STScI), CC BY 4.0.',
  say: ['17 August 2017', 'Ripples in space first, then light, from the same crash'],
  zoom: [1, 1.08], focus: [0.5, 0.5],
});

export const scenes: Scene[] = [lab, through, detector, sn, shower, kilonova];
