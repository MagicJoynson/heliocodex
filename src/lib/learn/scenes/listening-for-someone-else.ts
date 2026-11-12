/**
 * Pictures for the lesson "Listening for someone else". The two photographs are real. The chart of
 * the 1977 signal uses the six strengths the telescope recorded. The first drawing is a diagram and
 * the last is to scale.
 */
import { type Scene, SOFT, ACCENT, clamp, ease, label, stars, rng } from '../stage';
import { TAU, photoScene, dot, line } from '../kit';

const backdrop = stars(80, 1977);
const M13 = 'A real photograph: the star cluster M13 in the constellation Hercules, more than 100,000 stars about 25,000 light years away, by the Hubble Space Telescope. Credit: NASA, ESA and the Hubble Heritage Team (STScI/AURA), CC BY 4.0.';

export const lens = photoScene({ src: '/img/learn/m13-hubble.jpg', caption: M13, say: ['', ''], hero: true, cover: true, zoom: [1, 1.12], focus: [0.5, 0.5] });

// ---- 1. hiss and a note
const N = rng(60);
const HISS = Array.from({ length: 160 }, () => N());
const note: Scene = {
  caption: 'A diagram. Radio strength is drawn against pitch, low on the left and high on the right. Natural sources spread their power over a wide range. A transmitter puts it all on one pitch, which stands out as a spike.',
  stillAt: 7,
  draw({ ctx, w, h, t, say }) {
    backdrop(ctx, w, h, 0.25);
    const x0 = w * 0.08, x1 = w * 0.94, y0 = h * 0.72, top = h * 0.12, k = ease(clamp((t - 2.5) / 2, 0, 1));
    line(ctx, [x0, y0, x1, y0], 'rgba(236,231,220,.5)');
    ctx.beginPath();
    HISS.forEach((v, i) => { const x = x0 + (i / (HISS.length - 1)) * (x1 - x0), wob = Math.sin(t * 3 + i * 1.7) * 0.25, y = y0 - (0.1 + (v + wob) * 0.09) * (y0 - top); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); });
    ctx.strokeStyle = 'rgba(236,231,220,.7)'; ctx.lineWidth = 1.2; ctx.stroke();
    const sx = x0 + 0.63 * (x1 - x0);
    if (k > 0) { line(ctx, [sx, y0 - 0.14 * (y0 - top), sx, y0 - (0.14 + 0.8 * k) * (y0 - top)], ACCENT, 2.5); if (k >= 1) label(ctx, 'One sharp note', sx - 10, top + 6, { align: 'right', colour: ACCENT }); }
    label(ctx, 'The hiss of the sky', x0 + 6, y0 - 0.3 * (y0 - top), { align: 'left', colour: SOFT });
    label(ctx, 'Low pitch', x0, y0 + 18, { align: 'left', colour: SOFT }); label(ctx, 'High pitch', x1, y0 + 18, { align: 'right', colour: SOFT });
    say('What to listen for', 'Nature hisses. Only a transmitter sings on one pitch');
  },
};

// ---- 2. the 1977 signal
const WOW: [string, number][] = [['6', 6], ['E', 14], ['Q', 26], ['U', 30], ['J', 19], ['5', 5]];
const wow: Scene = {
  caption: 'A chart to scale of the signal recorded on 15 August 1977 by the Big Ear telescope in Ohio. Each bar is its strength over about ten seconds, in multiples of the background, and the character under it is what the computer printed.',
  stillAt: 6,
  draw({ ctx, w, h, t, say }) {
    backdrop(ctx, w, h, 0.25);
    const x0 = w * 0.14, x1 = w * 0.9, y0 = h * 0.7, top = h * 0.1, bw = ((x1 - x0) / WOW.length) * 0.62;
    line(ctx, [x0 - 10, y0, x1 + 10, y0], 'rgba(236,231,220,.5)');
    for (const v of [10, 20, 30]) { const y = y0 - (v / 32) * (y0 - top); line(ctx, [x0 - 10, y, x1 + 10, y], 'rgba(236,231,220,.12)'); label(ctx, String(v), x0 - 16, y + 4, { align: 'right', colour: SOFT }); }
    WOW.forEach(([c, v], i) => {
      const k = ease(clamp((t - 0.5 - i * 0.6) / 0.8, 0, 1)), x = x0 + ((i + 0.5) / WOW.length) * (x1 - x0), hh = (v / 32) * (y0 - top) * k;
      ctx.fillStyle = v >= 26 ? ACCENT : 'rgba(233,196,138,.55)'; ctx.fillRect(x - bw / 2, y0 - hh, bw, hh);
      label(ctx, c, x, y0 + 22, { align: 'center', colour: '#fff', size: 15 });
      if (k >= 1) label(ctx, String(v), x, y0 - hh - 8, { align: 'center', colour: SOFT });
    });
    say('15 August 1977: 72 seconds', 'Thirty times the background, and never heard again');
  },
};

const target = photoScene({ src: '/img/learn/m13-hubble.jpg', caption: M13, say: ['Where the 1974 message is going', 'It arrives in about 25,000 years'], zoom: [0.95, 1.1], focus: [0.5, 0.5] });

const record = photoScene({
  src: '/img/learn/voyager-golden-record-1977.jpg',
  caption: 'A real photograph: John Casani, who managed the Voyager project, at Cape Canaveral on 4 August 1977, with the Golden Record and its cover on the table and Voyager 2 behind him. Credit: NASA/JPL-Caltech. The marks were added here.',
  say: ['A record for whoever finds it', 'Pictures, greetings, music and the sounds of the Earth'], zoom: [1, 1.12], focus: [0.5, 0.7],
  pointers: [{ at: [0.4, 0.86], to: [0.1, 0.96], text: 'The record', align: 'left' }, { at: [0.66, 0.84], to: [0.93, 0.96], text: 'Its cover', align: 'right' }],
});

// ---- 5. how far our voice has reached
const G = rng(8);
const DISC = Array.from({ length: 1500 }, () => { const r = Math.sqrt(G()), a = G() * TAU + r * 5, arm = Math.sin(a * 2 - r * 9) * 0.5 + 0.5; return { r, a, b: 0.25 + arm * 0.6 * G() + 0.15 * G() }; });
const reach: Scene = {
  caption: 'A drawing to scale, with the stars put in for effect. The disc is the Milky Way, about 100,000 light years across, with the Sun about halfway out. The ring marks the Sun’s place. The ball our radio signals have filled, about 200 light years across, is a five-hundredth of the width of the disc: at this size, smaller than one dot.',
  stillAt: 6,
  draw({ ctx, w, h, t, say }) {
    const cx = w / 2, cy = h * 0.42, R = Math.min(w * 0.44, h * 0.4), k = ease(clamp((t - 1) / 2.5, 0, 1));
    for (const s of DISC) { const a = s.a + t * 0.01, x = cx + Math.cos(a) * s.r * R, y = cy + Math.sin(a) * s.r * R * 0.62; ctx.fillStyle = `rgba(236,231,220,${s.b * (1 - s.r * 0.5)})`; ctx.fillRect(x, y, 1.3, 1.3); }
    const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, R * 0.2); g.addColorStop(0, 'rgba(255,236,200,.55)'); g.addColorStop(1, 'rgba(255,236,200,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(cx, cy, R * 0.2, R * 0.13, 0, 0, TAU); ctx.fill();
    const sx = cx + R * 0.52, sy = cy + R * 0.1;
    if (k > 0) {
      ctx.strokeStyle = ACCENT; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(sx, sy, 14 - 4 * k, 0, TAU); ctx.stroke(); dot(ctx, sx, sy, 0.8, '#fff');
      label(ctx, 'We are here', sx, sy + 32, { align: 'center', colour: ACCENT }); label(ctx, 'Our signals: inside the dot', sx, sy + 47, { align: 'center', colour: SOFT });
    }
    label(ctx, '100,000 light years', cx, cy - R * 0.62 - 10, { align: 'center', colour: SOFT });
    say('How far our voice has gone', 'About a hundred light years, in a galaxy a thousand times wider');
  },
};

const dotHome = photoScene({
  src: '/img/learn/pale-blue-dot-voyager.jpg',
  caption: 'A real photograph: the Earth from 6 billion km away, taken by Voyager 1 on 14 February 1990 from beyond Neptune. The Earth is the pale speck in the right-hand band of light, which is sunlight scattered inside the camera. Credit: NASA/JPL-Caltech.',
  say: ['Where is everybody?', 'The only place known to be listening'], zoom: [1, 1.15], focus: [0.6, 0.45],
});

export const scenes: Scene[] = [note, wow, target, record, reach, dotHome];
