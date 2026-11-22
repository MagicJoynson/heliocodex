/**
 * Pictures for the lesson "Double and multiple stars". The shares are from the survey of 454
 * Sun-like stars by Raghavan and others (2010), as the lesson gives them. Sirius A and B have
 * 2.06 and 1.02 times the Sun's mass and take 50.13 years to go round each other. Their paths are
 * drawn as circles to show the idea, though the real orbit is a stretched oval. Alpha Centauri A and B
 * have 1.13 and 0.97 Suns of mass, about 24 astronomical units apart on average, and take 79.91 years
 * to go round. Kepler-16b goes round its two stars every 229 days while they circle each other every
 * 41 days. The scenes follow the paragraphs of the lesson's first look, one to a step.
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
    dot(ctx, cx, cy, 2.4, 'rgba(236,231,220,.8)');
    dot(ctx, ax, ay, 8, '#fff6e0'); dot(ctx, bx, by, 5, '#9fc0e6');
    // the names stand still in a key under the picture, each with its own dot, so nothing a star or the balance point does can run into them
    const lx = Math.max(14, cx - 80);
    [['#fff6e0', 8, 'Sirius A, 2.06 Suns', SOFT], ['#9fc0e6', 5, 'Sirius B, 1.02 Suns', SOFT], ['rgba(236,231,220,.8)', 2.4, 'Balance point', FAINT]].forEach(([colour, r, name, ink], k) => {
      const ky = h - 46 + k * 15; dot(ctx, lx, ky, Math.min(r as number, 5), colour as string); label(ctx, name as string, lx + 14, ky, { colour: ink as string, size: 10 });
    });
    say('Neither star stands still', `They go round a point between them every ${PERIOD} years`);
  },
};

// ---- 2. how many stars share a home
const SHARES: [string, number, string][] = [['One star alone', 56, '#9fc0e6'], ['Two stars', 33, '#e9c48a'], ['Three stars', 8, '#d0584a'], ['Four or more', 3, '#c9a0dc']];
const share: Scene = {
  caption: 'How the 454 Sun-like stars in the survey by Raghavan and others (2010) were found to be grouped, as a share of systems. Counted star by star and not system by system, about two in three of these stars have a partner: the 44 in 100 systems with company hold at least 102 stars, against 56 alone. That sum is ours, from the survey’s figures.',
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
    say('Most Sun-like systems hold a single star', 'But counting stars, about two in three have a partner');
  },
};

// ---- 3. Alpha Centauri A and B, against our own planets
const centauri: Scene = {
  caption: 'Alpha Centauri A and B going round their balance point, 24 times the Earth’s distance from the Sun apart on average, drawn against the orbits of Uranus and Neptune for scale. Their masses are 1.13 and 0.97 Suns and they take 79.91 years to go round. The real orbit is a stretched oval and the stars are not to scale. Motion speeded up. The third star, Proxima, is about 13,000 times the Earth’s distance from the Sun away, far off the edge of the picture.',
  stillAt: 4,
  draw({ ctx, w, h, t, say }) {
    backdrop(ctx, w, h, 0.3);
    const cx = w / 2, cy = h * 0.45, s = Math.min(w * 0.44, h * 0.38) / 30.07, MA2 = 1.13, MB2 = 0.97, sep = 24;
    for (const [name, au] of [['Uranus', 19.19], ['Neptune', 30.07]] as [string, number][]) { ring(ctx, cx, cy, au * s, 'rgba(236,231,220,.2)'); label(ctx, `${name}’s orbit`, cx, cy - au * s - 9, { align: 'center', colour: FAINT, size: 9 }); }
    const rA = (MB2 / (MA2 + MB2)) * sep * s, rB = (MA2 / (MA2 + MB2)) * sep * s, a = (t / 12) * TAU;
    dot(ctx, cx + Math.cos(a) * rA, cy + Math.sin(a) * rA, 6, '#fff3d0'); dot(ctx, cx - Math.cos(a) * rB, cy - Math.sin(a) * rB, 5, '#ffcf8a');
    label(ctx, 'A', cx + Math.cos(a) * rA, cy + Math.sin(a) * rA - 13, { align: 'center', colour: SOFT, size: 10 }); label(ctx, 'B', cx - Math.cos(a) * rB, cy - Math.sin(a) * rB + 15, { align: 'center', colour: SOFT, size: 10 });
    label(ctx, 'One orbit: 79.91 years', cx, cy + 30.07 * s + 22, { align: 'center', colour: ACCENT, size: 10 });
    say('Two stars about as far apart as Uranus is from the Sun', 'A third, Proxima, circles them far beyond the picture');
  },
};

// ---- 5. a planet with two suns
const kepler: Scene = {
  caption: 'A planet going round two stars at once, drawn after the lesson’s figures for Kepler-16b: the two stars circle each other every 41 days and the planet circles both every 229 days, so the pair turns about five and a half times for each lap of the planet. The sizes and distances are not to scale.',
  stillAt: 5,
  draw({ ctx, w, h, t, say }) {
    backdrop(ctx, w, h, 0.3);
    const cx = w / 2, cy = h * 0.45, R = Math.min(w * 0.4, h * 0.34), pa = (t / 229) * 24 * TAU * 0.5, sa = (t / 41) * 24 * TAU * 0.5, r1 = R * 0.12, r2 = R * 0.2;
    ring(ctx, cx, cy, R, 'rgba(159,192,230,.3)', 1, [3, 5]);
    dot(ctx, cx + Math.cos(sa) * r1, cy + Math.sin(sa) * r1, 6, '#ffd9a0'); dot(ctx, cx - Math.cos(sa) * r2 * 0.5, cy - Math.sin(sa) * r2 * 0.5, 4, '#e88f5a');
    dot(ctx, cx + Math.cos(pa) * R, cy + Math.sin(pa) * R, 4.5, '#9fc0e6');
    // the planet's name rides on the outside of its orbit, away from the stars and from the two steady labels inside and below it
    const ux = Math.cos(pa), uy = Math.sin(pa), px = cx + ux * R, py = cy + uy * R;
    if (Math.abs(ux) > 0.5) label(ctx, 'Kepler-16b', px + ux * 10, py + uy * 6, { align: ux > 0 ? 'left' : 'right', colour: SOFT, size: 10 });
    else label(ctx, 'Kepler-16b', px, py + uy * 14, { align: 'center', colour: SOFT, size: 10 });
    label(ctx, 'Stars: 41 days', cx, cy + r2 + 22, { align: 'center', colour: FAINT, size: 9 });
    label(ctx, 'Planet: 229 days', Math.max(4, cx - R - 4), h - 10, { align: 'left', colour: ACCENT, size: 10 });
    say('A planet that has two suns', 'The pair turns about five and a half times for each lap of the planet');
  },
};

export const scenes: Scene[] = [lens, share, centauri, lens, kepler];
