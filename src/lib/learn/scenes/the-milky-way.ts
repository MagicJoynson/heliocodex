/**
 * Pictures for the lesson "The Milky Way". The sizes and distances are the ones the lesson gives:
 * a disc about 100,000 light years across and 1,000 thick, and the Sun about 27,000 light years from
 * the centre going round once in about 230 million years. The shape of the bulge, and the stars
 * dotted about, are drawings of the idea and not a map.
 */
import { type Scene, SOFT, ACCENT, FAINT, clamp, label, stars, rng } from '../stage';
import { TAU, dot, line, ring } from '../kit';

const backdrop = stars(110, 607);
const SUN = '#ffd98a';

// ---- 1. the disc seen from the side, to scale
export const lens: Scene = {
  caption: 'The Milky Way seen edge on, with its width and thickness drawn to scale: about 100,000 light years across and about 1,000 thick, a hundred to one. The glow of the bulge and the stars dotted through the disc are a drawing of the idea, not a map.',
  stillAt: 4,
  draw({ ctx, w, h, t, say }) {
    backdrop(ctx, w, h, 0.35);
    const roomX = w > 760 ? w * 0.34 : 0, roomW = w - roomX, W = roomW * 0.88, x0 = roomX + roomW * 0.06, cx = x0 + W / 2, cy = h * (roomX ? 0.46 : 0.3), T = Math.max(3, W / 100);
    const r = rng(11);
    // the bulge, a swelling at the middle
    const g = ctx.createRadialGradient(0, 0, 0, 0, 0, W * 0.12); g.addColorStop(0, 'rgba(255,225,170,.55)'); g.addColorStop(1, 'rgba(255,225,170,0)');
    ctx.save(); ctx.translate(cx, cy); ctx.scale(1, 0.2); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, W * 0.12, 0, TAU); ctx.fill(); ctx.restore();
    // the disc, as thin as it really is
    const d = ctx.createLinearGradient(x0, 0, x0 + W, 0); d.addColorStop(0, 'rgba(236,231,220,0)'); d.addColorStop(0.25, 'rgba(236,231,220,.55)'); d.addColorStop(0.5, 'rgba(255,235,195,.8)'); d.addColorStop(0.75, 'rgba(236,231,220,.55)'); d.addColorStop(1, 'rgba(236,231,220,0)');
    ctx.fillStyle = d; ctx.fillRect(x0, cy - T / 2, W, T);
    for (let i = 0; i < 160; i++) { const u = (r() + r() + r()) / 3, x = x0 + u * W, y = cy + (r() - 0.5) * T * 1.4; dot(ctx, x, y, 0.6 + r() * 0.8, `rgba(255,240,210,${0.35 + r() * 0.5})`); }
    // the Sun, 27,000 light years from the centre
    const sx = cx + (27000 / 50000) * (W / 2), pulse = 0.5 + 0.5 * Math.sin(t * 2.2);
    ring(ctx, sx, cy, 5 + pulse * 3, 'rgba(255,217,138,.35)'); dot(ctx, sx, cy, 2.6, SUN);
    line(ctx, [sx, cy + 10, sx, cy + 48], 'rgba(233,196,138,.6)'); label(ctx, 'The Sun, 27,000 light years out', sx + 8, cy + 60, { align: 'right', colour: ACCENT, size: 10 });
    line(ctx, [x0, cy - T - 26, x0 + W, cy - T - 26], 'rgba(236,231,220,.5)'); line(ctx, [x0, cy - T - 32, x0, cy - T - 20], 'rgba(236,231,220,.5)'); line(ctx, [x0 + W, cy - T - 32, x0 + W, cy - T - 20], 'rgba(236,231,220,.5)');
    label(ctx, 'About 100,000 light years across', cx, cy - T - 42, { align: 'center', colour: SOFT, size: 10 });
    label(ctx, 'Thick: about 1,000', x0 + W * 0.04, cy + 26, { align: 'left', colour: FAINT, size: 10 });
    label(ctx, 'Bulge', cx, cy + W * 0.03 + 14, { align: 'center', colour: FAINT, size: 10 });
    say('A disc as thin as a CD, a hundred times wider than it is thick', 'We live inside it, about half way out');
  },
};

// ---- 2. the Sun's lap, and why the arms cannot be fixed
const FIELD = (() => { const r = rng(23); return Array.from({ length: 260 }, () => ({ a: r() * TAU, d: 0.15 + Math.pow(r(), 0.8) * 0.85, b: r() })); })();
const lap: Scene = {
  caption: 'The Milky Way seen from above, a drawing of the idea with the stars placed at random. Out in the disc stars travel at nearly the same speed whatever their distance from the centre, so those nearer in finish a lap sooner. The Sun is 27,000 light years out and takes about 230 million years for one lap, shown here enormously speeded up.',
  stillAt: 5,
  draw({ ctx, w, h, t, say }) {
    backdrop(ctx, w, h, 0.3);
    const cx = w / 2, cy = h * 0.46, R = Math.min(w * 0.44, h * 0.4), sunR = R * 0.54, w0 = TAU / 14;
    ring(ctx, cx, cy, R, 'rgba(236,231,220,.25)', 1, [4, 6]);
    // the same speed at every distance, so the turn in a given time is smaller the farther out the star is
    for (const s of FIELD) { const a = s.a + (w0 * sunR / (s.d * R)) * t; dot(ctx, cx + Math.cos(a) * s.d * R, cy + Math.sin(a) * s.d * R, 0.7 + s.b * 1.1, `rgba(240,225,190,${0.3 + s.b * 0.5})`); }
    ring(ctx, cx, cy, sunR, 'rgba(233,196,138,.4)', 1, [2, 5]);
    const sa = w0 * t; dot(ctx, cx + Math.cos(sa) * sunR, cy + Math.sin(sa) * sunR, 3.4, SUN);
    label(ctx, 'The Sun', cx + Math.cos(sa) * sunR, cy + Math.sin(sa) * sunR - 14, { align: 'center', colour: ACCENT, size: 10 });
    dot(ctx, cx, cy, 3, 'rgba(255,235,195,.9)');
    label(ctx, 'Centre', cx, cy + 16, { align: 'center', colour: FAINT, size: 10 });
    label(ctx, `${Math.floor(((t * w0) % TAU) / TAU * 230)} million years into the Sun’s 230 million year lap`, cx, cy + R + 22, { align: 'center', colour: SOFT, size: 10 });
    say('Everything goes round the centre', 'Stars nearer in finish a lap sooner');
  },
};

// one picture to each step of the first look: its paragraphs and photographs, in order
export const scenes: Scene[] = [lens, lens, lens, lap, lens, lap];
