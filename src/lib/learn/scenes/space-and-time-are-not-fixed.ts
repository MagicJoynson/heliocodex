/**
 * Pictures for the lesson "Space and time are not fixed". The photograph of Einstein is real. The
 * rest are drawings of the idea. The clock of bouncing light is drawn at 87 per cent of the speed
 * of light, where a moving clock ticks half as often, and the curve of speed against energy is the
 * real one from Einstein's formula.
 */
import { type Scene, SOFT, ACCENT, clamp, label, stars, nf } from '../stage';
import { TAU, photoScene, globe, sun, dot, line, ring } from '../kit';

const backdrop = stars(120, 73);
const EINSTEIN = 'A real photograph: Albert Einstein in Bern in 1904 or 1905, about the time he worked out special relativity. Photograph by Lucien Chavan, public domain, by way of Wikimedia Commons.';

export const lens = photoScene({ src: '/img/learn/einstein-bern-1904.jpg', caption: EINSTEIN, say: ['', ''], hero: true, zoom: [1, 1.08], focus: [0.5, 0.3] });

// ---- 1. the clerk
const clerk = photoScene({
  src: '/img/learn/einstein-bern-1904.jpg', caption: EINSTEIN,
  say: ['Bern, 1905', 'A patent clerk, thinking about light in his spare time'],
  zoom: [0.92, 1.04], focus: [0.5, 0.42],
});

// ---- 2. speeds add, except for light
const addScene: Scene = {
  caption: 'Above, a ball thrown forward from a moving train: its speed over the ground is the two speeds added. Below, a flash of light sent forward from a moving ship: it leaves at the speed of light and no more. A drawing of the idea, not to scale.',
  stillAt: 2.4,
  draw({ ctx, w, h, t, say }) {
    backdrop(ctx, w, h, 0.35);
    const x = (t % 5) / 5, y1 = h * 0.26, y2 = h * 0.62, L = w * 0.08, span = w * 0.84;
    // the train and its ball
    line(ctx, [L, y1 + 12, L + span, y1 + 12], 'rgba(236,231,220,.25)');
    const tx = L + x * span * 0.4; ctx.fillStyle = '#5d6672'; ctx.fillRect(tx - 34, y1 - 6, 46, 16); ctx.fillStyle = '#39404a'; ctx.fillRect(tx - 34, y1 - 6, 10, 16);
    dot(ctx, tx + 12 + x * span * 0.2, y1 - 10, 3.5, ACCENT);
    label(ctx, 'Train: 100 km/h', L, y1 - 30, { align: 'left', colour: SOFT }); label(ctx, 'Ball: 100 + 50 = 150 km/h', L + span, y1 - 30, { align: 'right', colour: ACCENT });
    // the ship and its light
    line(ctx, [L, y2 + 12, L + span, y2 + 12], 'rgba(236,231,220,.12)', 1);
    const sx = L + x * span * 0.45; ctx.fillStyle = '#8f8a80'; ctx.beginPath(); ctx.moveTo(sx + 14, y2); ctx.lineTo(sx - 16, y2 - 8); ctx.lineTo(sx - 10, y2); ctx.lineTo(sx - 16, y2 + 8); ctx.closePath(); ctx.fill();
    const lx = L + x * span * 0.9; if (lx > sx + 14) { sun(ctx, lx, y2, 3, 1, '255,245,225'); line(ctx, [sx + 14, y2, lx, y2], 'rgba(255,245,225,.35)', 1); }
    label(ctx, 'Ship: half the speed of light', L, y2 - 30, { align: 'left', colour: SOFT }); label(ctx, 'Its light: 299,792 km/s', L + span, y2 + 32, { align: 'right', colour: ACCENT });
    say('Speeds add up, for everything but light', 'Everybody who measures the light gets the same answer');
  },
};

// ---- 3. a clock made of light
const ticks = (n: number) => `${n} ${n === 1 ? 'tick' : 'ticks'}`;
const clockScene: Scene = {
  caption: 'Two clocks that tick each time a flash of light crosses between two mirrors. The one on the right is moving at 87 per cent of the speed of light, so its flash has twice as far to go and it ticks half as often. A drawing: the moving clock would also look squashed along its path, which is left out.',
  stillAt: 5.2,
  draw({ ctx, w, h, t, say }) {
    backdrop(ctx, w, h, 0.35);
    const top = h * 0.16, bot = h * 0.66, H = bot - top, per = 1.3, ax = w * 0.18;
    const mirrors = (x: number) => { line(ctx, [x - 16, top, x + 16, top], '#ece7dc', 2); line(ctx, [x - 16, bot, x + 16, bot], '#ece7dc', 2); };
    // at rest
    const p = (t / per) % 2, ya = top + H * (p < 1 ? p : 2 - p); mirrors(ax); line(ctx, [ax, top, ax, bot], 'rgba(255,245,225,.14)'); sun(ctx, ax, ya, 3, 1, '255,245,225');
    label(ctx, 'At rest', ax, bot + 16, { align: 'center' }); label(ctx, ticks(Math.floor(t / per)), ax, bot + 32, { align: 'center', colour: ACCENT });
    // moving: the same light speed along a slanted path, so half the rate of climb
    const x0 = w * 0.36, x1 = w * 0.94, q = (t / (per * 2)), lap = 3, u = (q % lap) / lap, mx = x0 + u * (x1 - x0), pm = q % 2, ym = top + H * (pm < 1 ? pm : 2 - pm);
    ctx.strokeStyle = 'rgba(255,245,225,.3)'; ctx.lineWidth = 1; ctx.beginPath();
    const q0 = Math.floor(q / lap) * lap; for (let k = 0; k <= 60; k++) { const qq = q0 + ((q - q0) * k) / 60, pp = qq % 2, xx = x0 + ((qq % lap) / lap) * (x1 - x0), yy = top + H * (pp < 1 ? pp : 2 - pp); k ? ctx.lineTo(xx, yy) : ctx.moveTo(xx, yy); } ctx.stroke();
    mirrors(mx); sun(ctx, mx, ym, 3, 1, '255,245,225');
    label(ctx, 'Moving at 87% of the speed of light', (x0 + x1) / 2, bot + 16, { align: 'center' }); label(ctx, ticks(Math.floor(q)), (x0 + x1) / 2, bot + 32, { align: 'center', colour: ACCENT });
    say('A moving clock runs slow', 'The light has further to go and cannot hurry');
  },
};

// ---- 4. the proof overhead
const gpsScene: Scene = {
  caption: 'Navigation satellites going round the Earth at about 14,000 km an hour. Their speed makes their clocks fall behind clocks on the ground by about 7 millionths of a second a day. A drawing, not to scale, with the days speeded up.',
  stillAt: 6,
  draw({ ctx, w, h, t, say }) {
    backdrop(ctx, w, h, 0.5);
    const s = Math.min(w, h), cx = w / 2, cy = h * 0.45, R = s * 0.13, Ro = s * 0.36;
    globe(ctx, cx, cy, R);
    for (let k = 0; k < 3; k++) {
      const tilt = (k - 1) * 0.9, a = t * 0.6 + k * 2.1;
      ctx.save(); ctx.translate(cx, cy); ctx.rotate(tilt); ctx.strokeStyle = 'rgba(236,231,220,.16)'; ctx.setLineDash([2, 5]); ctx.beginPath(); ctx.ellipse(0, 0, Ro, Ro * 0.36, 0, 0, TAU); ctx.stroke(); ctx.setLineDash([]);
      const px = Math.cos(a) * Ro, py = Math.sin(a) * Ro * 0.36; if (!(py < 0 && Math.hypot(px, py / 0.36) < R * 1.02)) { ctx.fillStyle = '#ece7dc'; ctx.fillRect(px - 2.5, py - 2.5, 5, 5); ctx.fillStyle = '#5b83d6'; ctx.fillRect(px - 8, py - 1.5, 4.5, 3); ctx.fillRect(px + 3.5, py - 1.5, 4.5, 3); }
      ctx.restore();
    }
    const days = t * 1.5;
    say(`After ${Math.floor(days) + 1} ${days < 1 ? 'day' : 'days'}: ${nf(Math.round((Math.floor(days) + 1) * 7))} millionths of a second behind`, 'Too small to feel. Big enough to put your map out by kilometres');
  },
};

// ---- 5. the speed nothing reaches
const limitScene: Scene = {
  caption: 'How fast something goes as more and more energy is put into moving it. The dashed line is what was expected before Einstein. The solid curve is what happens: the speed creeps up towards the speed of light and never gets there. Drawn from Einstein’s formula.',
  stillAt: 8,
  draw({ ctx, w, h, t, say }) {
    backdrop(ctx, w, h, 0.3);
    const x0 = w * 0.12, x1 = w * 0.94, y0 = h * 0.74, yc = h * 0.2, E = 5, X = (e: number) => x0 + (e / E) * (x1 - x0), Y = (v: number) => y0 - v * (y0 - yc);
    line(ctx, [x0, y0, x1, y0], 'rgba(236,231,220,.35)'); line(ctx, [x0, y0, x0, h * 0.08], 'rgba(236,231,220,.35)');
    line(ctx, [x0, yc, x1, yc], ACCENT, 1.2); label(ctx, 'The speed of light', x1, yc - 10, { align: 'right', colour: ACCENT });
    label(ctx, 'Energy put in', (x0 + x1) / 2, y0 + 16, { align: 'center', colour: SOFT }); label(ctx, 'Speed', x0 + 8, h * 0.1, { align: 'left', colour: SOFT });
    const real = (e: number) => Math.sqrt(1 - 1 / ((1 + e) * (1 + e))), old = (e: number) => Math.sqrt(2 * e);
    ctx.strokeStyle = 'rgba(236,231,220,.4)'; ctx.setLineDash([3, 5]); ctx.beginPath(); for (let k = 0; k <= 60; k++) { const e = (k / 60) * 0.72; k ? ctx.lineTo(X(e), Y(old(e))) : ctx.moveTo(X(e), Y(old(e))); } ctx.stroke(); ctx.setLineDash([]);
    ctx.strokeStyle = 'rgba(236,231,220,.4)'; ctx.setLineDash([3, 5]); ctx.beginPath(); ctx.moveTo(x1 - 150, y0 - 28); ctx.lineTo(x1 - 126, y0 - 28); ctx.stroke(); ctx.setLineDash([]);
    label(ctx, 'What was expected', x1, y0 - 28, { align: 'right', colour: SOFT });
    const upTo = clamp(t / 7) * E;
    ctx.strokeStyle = '#ece7dc'; ctx.lineWidth = 1.6; ctx.beginPath(); for (let k = 0; k <= 120; k++) { const e = (k / 120) * upTo; k ? ctx.lineTo(X(e), Y(real(e))) : ctx.moveTo(X(e), Y(real(e))); } ctx.stroke();
    sun(ctx, X(upTo), Y(real(upTo)), 3.2, 1, '255,245,225');
    say(`${(real(upTo) * 100).toFixed(real(upTo) > 0.99 ? 1 : 0)} per cent of the speed of light`, 'More energy, hardly any more speed');
  },
};

// ---- 6. mass is energy
const massScene: Scene = {
  caption: 'The Sun turning mass into light: about four million tonnes of it every second. A drawing, with the count running at its real rate.',
  stillAt: 5,
  draw({ ctx, w, h, t, say }) {
    backdrop(ctx, w, h, 0.5);
    const s = Math.min(w, h), cx = w / 2, cy = h * 0.42, R = s * 0.17;
    for (let k = 0; k < 36; k++) { const a = (k / 36) * TAU + 0.05, d = R * 1.15 + ((t * 0.5 + k * 0.37) % 1) * s * 0.3, al = 1 - ((t * 0.5 + k * 0.37) % 1); dot(ctx, cx + Math.cos(a) * d, cy + Math.sin(a) * d, 1.6, `rgba(255,226,170,${0.8 * al})`); }
    sun(ctx, cx, cy, R, 1);
    ring(ctx, cx, cy, R * 1.02, 'rgba(255,226,170,.25)');
    ctx.fillStyle = ACCENT; ctx.font = 'italic 400 26px "Fraunces Variable", Georgia, serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('E = mc²', cx, cy + R + s * 0.16);
    say(`${nf(Math.floor(t) * 4)} million tonnes lighter since you started watching`, 'Mass is a very concentrated form of energy');
  },
};

export const scenes: Scene[] = [clerk, addScene, clockScene, gpsScene, limitScene, massScene];
