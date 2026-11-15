/**
 * Pictures for the lesson "Double and multiple stars". The shares are from the survey of 454
 * Sun-like stars by Raghavan and others (2010), as the lesson gives them. Sirius A and B have
 * 2.06 and 1.02 times the Sun's mass and take 50.13 years to go round each other. Their paths are
 * drawn as circles to show the idea, though the real orbit is a stretched oval. The eclipse is a
 * drawing of the idea.
 */
import { type Scene, SOFT, ACCENT, FAINT, clamp, ease, label, stars } from '../stage';
import { TAU, dot, line, ring } from '../kit';

const backdrop = stars(110, 709);
const MA = 2.06, MB = 1.02, PERIOD = 50.13;

// ---- 1. two stars round a balance point
export const lens: Scene = {
  caption: 'Sirius A and Sirius B going round the point where they balance, drawn with the masses the lesson gives: 2.06 and 1.02 times the Sun’s. The heavier star makes the smaller circle. The real orbit is a stretched oval and the two stars are not to scale; the circles show the idea. The motion is speeded up, with one orbit in about ten seconds.',
  stillAt: 3,
  draw({ ctx, w, h, t, say }) {
    backdrop(ctx, w, h, 0.35);
    const roomX = w > 760 ? w * 0.34 : 0, roomW = w - roomX, cx = roomX + roomW / 2, cy = h * (roomX ? 0.46 : 0.3), R = Math.min(roomW * 0.3, h * (roomX ? 0.3 : 0.17)), total = MA + MB;
    const rA = (MB / total) * R * 2, rB = (MA / total) * R * 2, a = (t / 10) * TAU;
    ring(ctx, cx, cy, rA, 'rgba(233,196,138,.3)', 1, [3, 5]); ring(ctx, cx, cy, rB, 'rgba(159,192,230,.3)', 1, [3, 5]);
    const ax = cx + Math.cos(a) * rA, ay = cy + Math.sin(a) * rA, bx = cx - Math.cos(a) * rB, by = cy - Math.sin(a) * rB;
    line(ctx, [ax, ay, bx, by], 'rgba(236,231,220,.25)');
    dot(ctx, cx, cy, 2.4, 'rgba(236,231,220,.8)'); label(ctx, 'Balance point', cx, cy + 14, { align: 'center', colour: FAINT, size: 9 });
    dot(ctx, ax, ay, 8, '#fff6e0'); dot(ctx, bx, by, 5, '#9fc0e6');
    label(ctx, 'Sirius A, 2.06 Suns', ax, ay - 16, { align: 'center', colour: SOFT, size: 10 }); label(ctx, 'Sirius B, 1.02 Suns', bx, by + 18, { align: 'center', colour: SOFT, size: 10 });
    say('Neither star stands still', `They go round a point between them every ${PERIOD} years`);
  },
};

// ---- 2. how many stars share a home
const SHARES: [string, number, string][] = [['One star alone', 56, '#9fc0e6'], ['Two stars', 33, '#e9c48a'], ['Three stars', 8, '#d0584a'], ['Four or more', 3, '#c9a0dc']];
const share: Scene = {
  caption: 'How the 454 Sun-like stars in the survey by Raghavan and others (2010) were found to be grouped, as a share of systems. Counted star by star and not system by system, a little over half of the stars are in groups.',
  stillAt: 4,
  draw({ ctx, w, h, t, say }) {
    backdrop(ctx, w, h, 0.25);
    const narrow = w < 520, x0 = w * (narrow ? 0.4 : 0.3), x1 = w * 0.92, y0 = h * 0.2, step = h * 0.13, k = ease(clamp(t / 2.5, 0, 1));
    line(ctx, [x0, y0 - 14, x0, y0 + step * 4 - 12], 'rgba(236,231,220,.4)');
    SHARES.forEach(([name, v, col], i) => {
      const y = y0 + i * step, len = (v / 60) * (x1 - x0) * k;
      label(ctx, name, x0 - 10, y, { align: 'right', colour: SOFT, size: 10 });
      ctx.fillStyle = col; ctx.globalAlpha = 0.85; ctx.fillRect(x0, y - 10, len, 20); ctx.globalAlpha = 1;
      if (k > 0.95) label(ctx, `${v}%`, x0 + len + 8, y, { align: 'left', colour: SOFT, size: 11 });
    });
    label(ctx, 'Share of systems', x0, y0 + step * 4 + 8, { align: 'left', colour: FAINT, size: 9 });
    say('Most Sun-like stars are on their own', 'But nearly half belong to a pair or more');
  },
};

// ---- 3. watching the light dip
const dip: Scene = {
  caption: 'A pair whose orbit is edge on to us. When the smaller star passes in front of the larger, some of the light is blocked and the light of the pair dips. A drawing of the idea, not to scale.',
  stillAt: 5,
  draw({ ctx, w, h, t, say }) {
    backdrop(ctx, w, h, 0.3);
    const cx = w / 2, cy = h * 0.28, big = Math.min(w * 0.14, 62), small = big * 0.55, phase = ((t % 8) / 8) * 2 - 1, sx = cx + phase * big * 3.2;
    dot(ctx, cx, cy, big, '#ffe3b0'); dot(ctx, sx, cy, small, '#c8742e');
    ctx.strokeStyle = 'rgba(236,231,220,.25)'; ctx.setLineDash([3, 6]); ctx.beginPath(); ctx.moveTo(cx - big * 3.4, cy); ctx.lineTo(cx + big * 3.4, cy); ctx.stroke(); ctx.setLineDash([]);
    const gx0 = w * 0.12, gx1 = w * 0.88, gy = h * 0.62, gh = h * 0.2, f = (p: number) => 1 - 0.3 * Math.exp(-Math.pow(p / 0.28, 4));
    line(ctx, [gx0, gy - gh - 6, gx0, gy + 6, gx1, gy + 6], 'rgba(236,231,220,.4)');
    ctx.strokeStyle = ACCENT; ctx.lineWidth = 1.6; ctx.beginPath();
    for (let i = 0; i <= 120; i++) { const p = (i / 120) * 2 - 1; if (p > phase) break; const x = gx0 + ((p + 1) / 2) * (gx1 - gx0), y = gy - f(p) * gh; if (i) ctx.lineTo(x, y); else ctx.moveTo(x, y); }
    ctx.stroke();
    label(ctx, 'Light of the pair', gx0, gy - gh - 18, { colour: SOFT, size: 10 }); label(ctx, 'Time', gx1, gy + 20, { align: 'right', colour: FAINT, size: 9 });
    say('One star passes in front of the other', 'The light dips, and the dips give the sizes of the stars');
  },
};

export const scenes: Scene[] = [lens, share, dip];
