/**
 * Pictures for the lesson "The active Sun", all from the lesson's own figures. A big group of sunspots
 * is about ten Earths wide; the Sun is 1,392,700 km across and the Earth 12,742 km. Sunspot centres
 * are about 3,900 °C and the surface round them about 5,500 °C. A flare's light takes 8 minutes to
 * reach us, a typical cloud about two days and the cloud of 1859 17.6 hours. The dates are the ones
 * the lesson gives. The look of the Sun and the spots is a drawing of the idea.
 */
import { type Scene, SOFT, ACCENT, FAINT, clamp, ease, label, stars, rng } from '../stage';
import { TAU, dot, line, ring } from '../kit';

const backdrop = stars(100, 811);
const SUN_KM = 1392700, EARTH_KM = 12742;

// ---- 1. a spot group beside the Earth, to scale
export const lens: Scene = {
  caption: 'The Sun with a big group of sunspots, and the Earth beside it at the same scale. The Sun is 1,392,700 km across and the Earth 12,742 km, so the Earth is a small dot. A big group can be ten Earths wide. The look of the disc and the spots is a drawing of the idea.',
  stillAt: 3,
  draw({ ctx, w, h, t, say }) {
    backdrop(ctx, w, h, 0.25);
    const roomX = w > 760 ? w * 0.34 : 0, roomW = w - roomX, cx = roomX + roomW * 0.46, cy = h * (roomX ? 0.46 : 0.3), R = Math.min(roomW * 0.3, h * (roomX ? 0.29 : 0.17));
    const g = ctx.createRadialGradient(cx - R * 0.2, cy - R * 0.2, R * 0.1, cx, cy, R); g.addColorStop(0, '#ffe2a8'); g.addColorStop(0.7, '#f5a742'); g.addColorStop(1, '#c9701f');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, R, 0, TAU); ctx.fill();
    const px = (km: number) => (km / SUN_KM) * 2 * R, group = px(10 * EARTH_KM), r = rng(5), gx = cx - R * 0.22, gy = cy + R * 0.28;
    for (let i = 0; i < 7; i++) { const a = r() * TAU, d = Math.sqrt(r()) * group * 0.4, s = group * (0.07 + r() * 0.1); dot(ctx, gx + Math.cos(a) * d, gy + Math.sin(a) * d * 0.6, s, 'rgba(60,28,10,.85)'); }
    const ex = Math.min(cx + R + 60, w - 70), ey = cy - R * 0.5, k = 0.5 + 0.5 * Math.sin(t * 1.6);
    dot(ctx, ex, ey, Math.max(1.6, px(EARTH_KM) / 2), '#7fb2e5'); ring(ctx, ex, ey, 6 + k * 3, 'rgba(127,178,229,.35)');
    label(ctx, 'The Earth, to scale', ex, ey + 22, { align: 'center', colour: SOFT, size: 10 });
    line(ctx, [gx, gy + group * 0.5, gx, cy + R + 14], 'rgba(233,196,138,.6)'); label(ctx, 'A big group: about ten Earths wide', gx, cy + R + 26, { align: 'center', colour: ACCENT, size: 10 });
    say('Spots as big as planets', 'Small only because the Sun is so much bigger');
  },
};

// ---- 2. why a spot looks dark
const spotTemp: Scene = {
  caption: 'The temperature of the middle of a sunspot beside that of the surface around it, from the lesson: about 3,900 °C and about 5,500 °C. A spot is cooler, but it is still very bright. It only looks dark beside its surroundings.',
  stillAt: 4,
  draw({ ctx, w, h, t, say }) {
    backdrop(ctx, w, h, 0.25);
    const x0 = w * 0.3, x1 = w * 0.9, y0 = h * 0.28, k = ease(clamp(t / 2.5, 0, 1)), top = 6000;
    line(ctx, [x0, y0 - 30, x0, y0 + 150], 'rgba(236,231,220,.4)');
    ([['Surface around a spot', 5500, '#f5a742'], ['Middle of a sunspot', 3900, '#a35a24']] as [string, number, string][]).forEach(([name, v, col], i) => {
      const y = y0 + i * 80, len = (v / top) * (x1 - x0) * k;
      label(ctx, name, x0 - 10, y, { align: 'right', colour: SOFT, size: 10 });
      ctx.fillStyle = col; ctx.fillRect(x0, y - 16, len, 32);
      if (k > 0.95) label(ctx, `About ${v.toLocaleString('en-GB')} °C`, x0 + len + 10, y, { align: 'left', colour: SOFT, size: 11 });
    });
    label(ctx, 'Temperature, from zero', x0, y0 + 190, { colour: FAINT, size: 9 });
    say('Cooler, not cold', 'It only looks dark beside the brighter surface');
  },
};

// ---- 3. the dates the lesson gives, on one line
const EVENTS: [number, string][] = [[1610, 'Galileo sees spots'], [1826, 'Schwabe starts counting'], [1859, 'Carrington storm'], [1908, 'Hale finds magnetism'], [1989, 'Quebec blackout'], [2024, 'Strongest storm in 20 years']];
const timeline: Scene = {
  caption: 'Dates from the lesson on one line from 1600 to 2030. The shaded stretch, about 1645 to 1715, is the Maunder Minimum, when sunspots almost vanished. The eleven-year beat is an average, and single cycles have run from about nine to fourteen years.',
  stillAt: 6,
  draw({ ctx, w, h, t, say }) {
    backdrop(ctx, w, h, 0.25);
    const x0 = w * 0.07, x1 = w * 0.93, y = h * 0.5, X = (yr: number) => x0 + ((yr - 1600) / 430) * (x1 - x0), k = ease(clamp(t / 3, 0, 1));
    ctx.fillStyle = 'rgba(159,192,230,.22)'; ctx.fillRect(X(1645), y - 18, (X(1715) - X(1645)) * k, 36);
    label(ctx, 'Maunder Minimum', (X(1645) + X(1715)) / 2, y - 30, { align: 'center', colour: SOFT, size: 9 });
    line(ctx, [x0, y, x0 + (x1 - x0) * k, y], 'rgba(236,231,220,.5)', 1.4);
    for (let yr = 1600; yr <= 2000; yr += 100) { line(ctx, [X(yr), y - 5, X(yr), y + 5], 'rgba(236,231,220,.5)'); label(ctx, String(yr), X(yr), y + 18, { align: 'center', colour: FAINT, size: 9 }); }
    EVENTS.forEach(([yr, name], i) => {
      if (X(yr) > x0 + (x1 - x0) * k) return;
      const up = i % 2 === 0, ly = up ? y - 74 - (i % 4) * 8 : y + 62 + (i % 4) * 8;
      line(ctx, [X(yr), y, X(yr), up ? ly + 8 : ly - 8], 'rgba(233,196,138,.5)'); dot(ctx, X(yr), y, 3.2, ACCENT);
      label(ctx, `${yr}`, X(yr), ly, { align: 'center', colour: ACCENT, size: 10 }); label(ctx, name, X(yr), ly + (up ? -14 : 14), { align: 'center', colour: SOFT, size: 9 });
    });
    say('We have watched the Sun for four hundred years', 'And the eleven-year beat is only an average');
  },
};

// ---- 4. how long the news takes to arrive
const race: Scene = {
  caption: 'A race from the Sun to the Earth, 150 million km. Light from a flare takes 8 minutes. The cloud of 1859 took 17.6 hours and a typical cloud takes about two days, both worked out from the distance and the time. The clock runs about four hours of real time for each second you watch.',
  stillAt: 8,
  draw({ ctx, w, h, t, say }) {
    backdrop(ctx, w, h, 0.25);
    const x0 = w * 0.1, x1 = w * 0.9, y0 = h * 0.26, step = h * 0.15, hours = t * 4;
    dot(ctx, x0, y0 + step, 9, '#ffcf6a'); label(ctx, 'Sun', x0, y0 + step + 22, { align: 'center', colour: SOFT, size: 10 });
    dot(ctx, x1, y0 + step, 6, '#7fb2e5'); label(ctx, 'Earth', x1, y0 + step + 24, { align: 'center', colour: SOFT, size: 10 });
    ([['Light from a flare', 8 / 60, '#fff6e0', '8 minutes'], ['The cloud of 1859', 17.6, '#d0584a', '17.6 hours'], ['A typical cloud', 48, '#9fc0e6', 'about 2 days']] as [string, number, string, string][]).forEach(([name, hr, col, when], i) => {
      const y = y0 + i * step, f = clamp(hours / hr, 0, 1), x = x0 + (x1 - x0) * f;
      line(ctx, [x0, y, x1, y], 'rgba(236,231,220,.12)');
      dot(ctx, x, y, 5, col); label(ctx, name, x0, y - 16, { align: 'left', colour: SOFT, size: 10 });
      if (f >= 1) label(ctx, `Arrives: ${when}`, x1, y - 16, { align: 'right', colour: ACCENT, size: 10 });
    });
    label(ctx, hours < 1 ? `${Math.round(hours * 60)} minutes gone` : `${hours.toFixed(1)} hours gone`, w / 2, h * 0.9, { align: 'center', colour: SOFT, size: 11 });
    say('Light comes first, the storm cloud later', 'A warning of hours to days');
  },
};

// one picture to each step of the first look: its paragraphs and photographs, in order
export const scenes: Scene[] = [lens, lens, timeline, race, timeline, lens, spotTemp, race, race, race, race];
