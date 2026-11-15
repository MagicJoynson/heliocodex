/**
 * Pictures for the lesson "Active galaxies and quasars", one to each step of its first look. All are drawings
 * of the idea and not to scale. The only figures they state are the lesson's: about one in ten galaxies is
 * active, a quasar can give out thousands of times as much light as our whole galaxy, and the Milky Way's
 * giant black hole is quiet at present.
 */
import { type Scene, SOFT, ACCENT, label, stars, rng } from '../stage';
import { TAU, dot, line } from '../kit';

const backdrop = stars(80, 7301);
const room = (w: number) => (w > 760 ? w * 0.34 : 0);
const glow = (ctx: CanvasRenderingContext2D, x: number, y: number, r: number, rgb: string, a: number) => { const g = ctx.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, `rgba(${rgb},${a})`); g.addColorStop(1, `rgba(${rgb},0)`); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill(); };
const GAS = (() => { const r = rng(4); return Array.from({ length: 150 }, () => ({ a: r() * TAU, d: 0.12 + Math.pow(r(), 0.7) * 0.88, b: r() })); })();
const DISC = (ctx: CanvasRenderingContext2D, x: number, y: number, R: number, t: number, bright: number, tilt = 0.28) => {
  for (const p of GAS) { const a = p.a + t * 0.6 * Math.pow(p.d, -1.5) * 0.25; dot(ctx, x + Math.cos(a) * p.d * R, y + Math.sin(a) * p.d * R * tilt, 0.8 + p.b * 1.2, `rgba(${255},${190 + 50 * (1 - p.d)},${120 + 100 * (1 - p.d)},${(0.25 + p.b * 0.55) * bright})`); }
  glow(ctx, x, y, R * 0.3, '255,210,150', 0.5 * bright); dot(ctx, x, y, R * 0.07, '#000'); ctx.strokeStyle = 'rgba(255,255,255,.3)'; ctx.beginPath(); ctx.arc(x, y, R * 0.07 + 2.5, 0, TAU); ctx.stroke();
};

// ---- 1. most galaxies shine with starlight; about one in ten has a bright centre (the hero)
export const lens: Scene = {
  caption: 'Two galaxies, a drawing of the idea. Most shine only with the light of their stars. About one in ten is different: right at its centre is a tiny point that gives out more light than all the rest of the galaxy.',
  stillAt: 4,
  draw({ ctx, w, h, t, say }) {
    backdrop(ctx, w, h, 0.2);
    const rx = room(w), cx0 = rx + (w - rx) * 0.27, cx1 = rx + (w - rx) * 0.73, cy = h * (rx ? 0.4 : 0.24), R = Math.min((w - rx) * 0.2, h * (rx ? 0.18 : 0.12));
    [cx0, cx1].forEach((x, i) => { glow(ctx, x, cy, R, '200,215,255', 0.35); const r = rng(8 + i); for (let k = 0; k < 90; k++) { const a = r() * TAU, d = Math.pow(r(), 0.8); dot(ctx, x + Math.cos(a) * d * R, cy + Math.sin(a) * d * R * 0.6, 0.8 + r(), 'rgba(215,225,255,.8)'); } });
    glow(ctx, cx1, cy, R * 0.2, '255,240,200', 0.9); dot(ctx, cx1, cy, 3.4, '#fffbe8');
    label(ctx, 'Starlight only', cx0, cy + R * 0.7 + 26, { align: 'center', colour: SOFT, size: 10 }); label(ctx, 'Bright centre', cx1, cy + R * 0.7 + 26, { align: 'center', colour: ACCENT, size: 10 });
    say('Most galaxies shine with starlight alone', 'About one in ten has a tiny, very bright centre');
  },
};

// ---- 2. gas swirling into a giant black hole
const disc: Scene = {
  caption: 'Gas falling towards a giant black hole, a drawing of the idea. A black hole gives out no light of its own. The gas does not drop straight in: it swirls round in a flat disc, and the light comes from this gas, not from stars.',
  stillAt: 4,
  draw({ ctx, w, h, t, say }) {
    backdrop(ctx, w, h, 0.15);
    const cx = w / 2, cy = h * 0.32, R = Math.min(w * 0.36, h * 0.34);
    DISC(ctx, cx, cy, R, t, 1);
    label(ctx, 'Gas swirling into a flat disc', cx, cy + R * 0.28 + 30, { align: 'center', colour: ACCENT, size: 10 });
    label(ctx, 'Giant black hole', cx, cy - R * 0.3 - 14, { align: 'center', colour: SOFT, size: 9 });
    say('The light does not come from stars', 'Gas swirls round a giant black hole in a flat disc');
  },
};

// ---- 3. a quasar: so far off that it looks like a star
const quasar: Scene = {
  caption: 'A quasar, a drawing of the idea. The brightest active galaxies can give out thousands of times as much light as our whole galaxy. They are so far away that from the Earth one looks like a faint star, a single point of light.',
  stillAt: 5,
  draw({ ctx, w, h, t, say }) {
    backdrop(ctx, w, h, 0.15);
    const xe = w * 0.14, xq = w * 0.84, y = h * 0.3, p = 0.8 + 0.2 * Math.sin(t * 3);
    dot(ctx, xe, y, 4, '#9fc0e6'); label(ctx, 'Earth', xe, y + 26, { align: 'center', colour: SOFT, size: 10 });
    line(ctx, [xe + 10, y, xq - 40, y], 'rgba(236,231,220,.2)');
    glow(ctx, xq, y, 30, '255,240,200', 0.7 * p); dot(ctx, xq, y, 3.4, '#fffbe8');
    label(ctx, 'A quasar: very far away', xq, y + 50, { align: 'right', colour: ACCENT, size: 10 });
    label(ctx, 'From Earth it looks like a faint star', w / 2, y - 40, { align: 'center', colour: SOFT, size: 10 });
    say('The brightest are called quasars', 'Thousands of times the light of our whole galaxy');
  },
};

// ---- 4. jets
const jets: Scene = {
  caption: 'Some active galaxies also fire out two thin jets of fast particles, one each way, reaching far beyond the galaxy itself. A drawing of the idea, not to scale.',
  stillAt: 6,
  draw({ ctx, w, h, t, say }) {
    backdrop(ctx, w, h, 0.15);
    const cx = w / 2, cy = h * 0.28, R = Math.min(w * 0.18, h * 0.18), L = Math.min(h * 0.26, w * 0.4);
    for (const s of [-1, 1]) {
      const g = ctx.createLinearGradient(cx, cy, cx, cy + s * L); g.addColorStop(0, 'rgba(150,190,255,.9)'); g.addColorStop(1, 'rgba(150,190,255,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(cx - 3, cy); ctx.lineTo(cx + 3, cy); ctx.lineTo(cx + 9, cy + s * L); ctx.lineTo(cx - 9, cy + s * L); ctx.closePath(); ctx.fill();
      for (let i = 0; i < 5; i++) { const f = ((t * 0.4 + i / 5) % 1); dot(ctx, cx, cy + s * f * L, 2, `rgba(220,235,255,${1 - f})`); }
    }
    DISC(ctx, cx, cy, R, t, 0.9, 0.2);
    ctx.strokeStyle = 'rgba(200,215,255,.2)'; ctx.setLineDash([3, 5]); ctx.beginPath(); ctx.ellipse(cx, cy, R * 1.6, R * 0.45, 0, 0, TAU); ctx.stroke(); ctx.setLineDash([]);
    label(ctx, 'Two thin jets of fast particles', cx, cy + L + 22, { align: 'center', colour: ACCENT, size: 10 });
    say('Some fire out two thin jets', 'One each way, far beyond the galaxy');
  },
};

// ---- 5. our own galaxy: a giant black hole, but quiet
const quiet: Scene = {
  caption: 'Our own galaxy’s giant black hole, a drawing of the idea: it is there, but quiet at present, with no bright disc or jets. The Milky Way is not an active galaxy.',
  stillAt: 4,
  draw({ ctx, w, h, t, say }) {
    backdrop(ctx, w, h, 0.15);
    const cx = w / 2, cy = h * 0.3, R = Math.min(w * 0.3, h * 0.3);
    DISC(ctx, cx, cy, R * 0.7, t, 0.12, 0.5);
    label(ctx, 'Quiet at present', cx, cy + R * 0.5 + 24, { align: 'center', colour: ACCENT, size: 10 });
    label(ctx, 'Giant black hole', cx, cy - 18, { align: 'center', colour: SOFT, size: 9 });
    say('Our own galaxy has a giant black hole too', 'But it is quiet: the Milky Way is not active');
  },
};

// one picture to each step of the first look (six steps; a photograph shares the step of the paragraph after it)
export const scenes: Scene[] = [lens, disc, quasar, jets, quiet, quiet];
