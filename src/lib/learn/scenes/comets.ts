/**
 * Pictures for the lesson "Comets". The orbit and the chart of distance are worked out from the
 * orbit of Halley's Comet as the Jet Propulsion Laboratory's Small-Body Database gives it:
 * eccentricity 0.968, nearest to the Sun 0.575 astronomical units, farthest 35.3, and a period of
 * 27,700 days. The planets' rings are their mean distances. The tails are a drawing of the idea.
 */
import { type Scene, SOFT, ACCENT, FAINT, clamp, ease, label, stars } from '../stage';
import { TAU, dot, line, ring } from '../kit';

const backdrop = stars(110, 503);
const E = 0.968, Q_NEAR = 0.575, A = Q_NEAR / (1 - E), Q_FAR = A * (1 + E), B = A * Math.sqrt(1 - E * E), PERIOD = 27700 / 365.25;
const PLANETS: [string, number][] = [['Mercury', 0.387], ['Venus', 0.723], ['Earth', 1], ['Mars', 1.524], ['Jupiter', 5.203], ['Saturn', 9.537], ['Uranus', 19.19], ['Neptune', 30.07]];

/** Kepler's equation, solved for the angle E, from the fraction of an orbit gone since the nearest approach. */
function anomaly(frac: number): number {
  const M = TAU * (frac - Math.floor(frac));
  let x = M < Math.PI ? M + E * 0.85 : M - E * 0.85;
  for (let i = 0; i < 40; i++) x -= (x - E * Math.sin(x) - M) / (1 - E * Math.cos(x));
  return x;
}
/** Where the comet is, in astronomical units, with the Sun at the centre and the nearest approach to the left. */
const place = (frac: number) => { const u = anomaly(frac); return { x: -A * (Math.cos(u) - E), y: B * Math.sin(u), r: A * (1 - E * Math.cos(u)) }; };

const CURVE = Array.from({ length: 241 }, (_, i) => place(i / 240).r);
const INSIDE_JUPITER = (() => { let n = 0; for (let i = 0; i < 4000; i++) if (place(i / 4000).r < 5.203) n++; return (n / 4000) * PERIOD; })();

// ---- 1. the orbit, to scale
export const lens: Scene = {
  caption: 'The orbit of Halley’s Comet drawn to scale beside the orbits of the planets, as the Jet Propulsion Laboratory’s Small-Body Database gives it. The comet’s path is seen from above the Sun, and the direction it points in is not shown. The comet moves faster than real time, about five years each second.',
  stillAt: 7,
  draw({ ctx, w, h, t, say }) {
    backdrop(ctx, w, h, 0.35);
    // at the top of the page the words take the left third, so the drawing keeps to the right
    const roomX = w > 760 ? w * 0.34 : 0, roomW = w - roomX;
    const s = Math.min((roomW * 0.92) / (30.07 + Q_FAR), ((roomX ? 0.4 : 0.2) * h) / 30.07), sx = roomX + roomW * 0.04 + 30.07 * s, sy = h * (roomX ? 0.47 : 0.27);
    for (const [name, au] of PLANETS) {
      ring(ctx, sx, sy, au * s, 'rgba(236,231,220,.22)');
      if (au > 4 && (roomW > 500 || name === 'Jupiter' || name === 'Neptune')) label(ctx, name, sx, sy - au * s - 8, { align: 'center', colour: FAINT, size: 10 });
    }
    ctx.strokeStyle = 'rgba(233,196,138,.55)'; ctx.lineWidth = 1.2; ctx.beginPath();
    for (let i = 0; i <= 240; i++) { const p = place(i / 240); const x = sx + p.x * s, y = sy + p.y * s; if (i) ctx.lineTo(x, y); else ctx.moveTo(x, y); }
    ctx.stroke();
    dot(ctx, sx, sy, 4, '#ffd98a');
    const years = (t * 5) % PERIOD, p = place(years / PERIOD);
    dot(ctx, sx + p.x * s, sy + p.y * s, 3.2, '#f4efe4');
    label(ctx, `${Math.floor(years)} years after 1986`, roomX + roomW / 2, h * (roomX ? 0.13 : 0.1), { align: 'center', colour: ACCENT });
    label(ctx, 'Farthest: 35 AU', sx + Q_FAR * s, sy - 16, { align: 'right', colour: SOFT, size: 10 });
    say('A path from inside Venus’s orbit to beyond Neptune’s', 'It takes about 76 years to go round once');
  },
};

// ---- 2. how far from the Sun, over one orbit
const distance: Scene = {
  caption: 'How far Halley’s Comet is from the Sun over one trip round its orbit, worked out from the orbit in the Small-Body Database. The dashed lines are the mean distances of Jupiter and Neptune. It spends most of its time far out, where it moves slowly.',
  stillAt: 6,
  draw({ ctx, w, h, t, say }) {
    backdrop(ctx, w, h, 0.3);
    const x0 = w * 0.1, x1 = w * 0.94, y0 = h * 0.12, y1 = h * 0.78, X = (f: number) => x0 + f * (x1 - x0), Y = (au: number) => y1 - (au / 36) * (y1 - y0), k = ease(clamp(t / 4, 0, 1));
    line(ctx, [x0, y0, x0, y1, x1, y1], 'rgba(236,231,220,.4)');
    for (const [name, au] of [['Jupiter', 5.203], ['Neptune', 30.07]] as [string, number][]) { line(ctx, [x0, Y(au), x1, Y(au)], 'rgba(236,231,220,.3)', 1, [4, 6]); label(ctx, name, x1, Y(au) - 9, { align: 'right', size: 10 }); }
    ctx.strokeStyle = ACCENT; ctx.lineWidth = 1.6; ctx.beginPath();
    const n = Math.floor(240 * k);
    for (let i = 0; i <= n; i++) { const x = X(i / 240), y = Y(CURVE[i]); if (i) ctx.lineTo(x, y); else ctx.moveTo(x, y); }
    ctx.stroke();
    label(ctx, 'Nearest, 1986', x0 + 4, y1 + 16, { colour: SOFT, size: 10 });
    label(ctx, 'Back again, 2061', x1, y1 + 16, { align: 'right', colour: SOFT, size: 10 });
    label(ctx, 'Distance from the Sun, in astronomical units (0 to 36)', x0, y0 - 10, { colour: SOFT, size: 10 });
    label(ctx, `Inside Jupiter’s orbit for about ${Math.round(INSIDE_JUPITER)} of its ${Math.round(PERIOD)} years`, w / 2, h * 0.92, { align: 'center', colour: ACCENT });
    say('Nearly all its life is spent in the cold', 'Only a few years in each trip are warm enough for a tail');
  },
};

// ---- 3. tails point away from the Sun
const tails: Scene = {
  caption: 'A comet at four places along its path. Its tail always points away from the Sun, even when the comet is leaving, and it is longest near the Sun. A drawing of the idea, not to scale.',
  stillAt: 4,
  draw({ ctx, w, h, t, say }) {
    backdrop(ctx, w, h, 0.3);
    const sx = w * 0.14, sy = h * 0.5, k = ease(clamp(t / 2, 0, 1));
    dot(ctx, sx, sy, 9, '#ffd98a');
    label(ctx, 'The Sun', sx, sy + 26, { align: 'center', colour: SOFT, size: 10 });
    const spots: [number, number, number, string][] = [[0.38, -0.55, 0.3, 'Going in'], [0.52, -0.2, 0.95, 'Close to the Sun'], [0.7, 0.3, 0.6, 'Going out'], [0.9, 0.65, 0.14, 'Far away']];
    for (const [fx, fy, strength, name] of spots) {
      const cx = sx + (w * 0.8) * (fx - 0.14), cy = sy + h * 0.3 * fy, dx = cx - sx, dy = cy - sy, d = Math.hypot(dx, dy), ux = dx / d, uy = dy / d, len = strength * w * 0.22 * k;
      const g = ctx.createLinearGradient(cx, cy, cx + ux * len, cy + uy * len); g.addColorStop(0, 'rgba(190,220,255,.8)'); g.addColorStop(1, 'rgba(190,220,255,0)');
      ctx.strokeStyle = g; ctx.lineWidth = 3 + strength * 4; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + ux * len, cy + uy * len); ctx.stroke(); ctx.lineCap = 'butt';
      dot(ctx, cx, cy, 3, '#f4efe4');
      label(ctx, name, cx, cy - 18, { align: 'center', colour: SOFT, size: 10 });
    }
    say('The tail is pushed away by the Sun', 'It points away even when the comet is heading out');
  },
};

export const scenes: Scene[] = [lens, distance, tails];
