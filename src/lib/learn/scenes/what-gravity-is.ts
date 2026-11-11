/**
 * Pictures for the lesson "What gravity is". Falls and jumps run in real time under the measured
 * pull at the surface (9.81 m/s² on the Earth, 1.62 on the Moon). The fading of the pull with
 * distance is Newton's rule: four times weaker at twice the distance from the centre.
 */
import { type Scene, INK, SOFT, FAINT, ACCENT, clamp, ease, label, stars, nf } from '../stage';
import { TAU, photoScene, globe, dot, ring, line } from '../kit';

const backdrop = stars(120, 17);
const G_EARTH = 9.81, G_MOON = 1.62, R_EARTH = 6371, MOON_KM = 384_400;

// ---- the top of the page: the Earth and the Moon, to scale
export const lens: Scene = {
  caption: 'The Earth and the Moon with their sizes and the gap between them to scale, seen at a slant. The Moon is 30 Earths away and takes 27.3 days to go round; here a lap takes half a minute.',
  stillAt: 4,
  draw({ ctx, w, h, t }) {
    backdrop(ctx, w, h, 0.7);
    const wide = w > 760, cx = w * (wide ? 0.62 : 0.5), cy = h * (wide ? 0.42 : 0.3);
    const orbit = Math.min(w * (wide ? 0.33 : 0.44), h * 0.6), R = orbit / (MOON_KM / R_EARTH), a = -t * (TAU / 30) + 0.6, squash = 0.36;
    ctx.strokeStyle = 'rgba(236,231,220,.14)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.ellipse(cx, cy, orbit, orbit * squash, 0, 0, TAU); ctx.stroke();
    const mx = cx + Math.cos(a) * orbit, my = cy + Math.sin(a) * orbit * squash, moon = () => globe(ctx, mx, my, Math.max(R * 0.2727, 1.3), '200,198,190', '70,70,72');
    if (Math.sin(a) < 0) moon();
    globe(ctx, cx, cy, Math.max(R, 3));
    if (Math.sin(a) >= 0) moon();
    label(ctx, 'Moon', mx > w - 60 ? mx - 8 : mx + 8, my - 8, { colour: SOFT, align: mx > w - 60 ? 'right' : 'left' });
  },
};

// ---- 1. drop a ball
const dropScene: Scene = {
  caption: 'A ball dropped from 45 m, the height of a 15-storey building, falling in real time under the Earth\'s pull with the air left out. The marks show where it is after each second.',
  stillAt: 2.6,
  draw({ ctx, w, h, t, say }) {
    const top = h * 0.1, ground = h * 0.88, pxPerM = (ground - top) / 45, x = w * 0.5, loop = 5.2, tt = Math.min(t % loop, Math.sqrt(90 / G_EARTH));
    line(ctx, [w * 0.2, ground, w * 0.8, ground], 'rgba(236,231,220,.35)');
    line(ctx, [x - 46, top, x - 46, ground], 'rgba(236,231,220,.18)');
    for (let m = 0; m <= 45; m += 5) { line(ctx, [x - 50, top + m * pxPerM, x - 42, top + m * pxPerM], 'rgba(236,231,220,.3)'); if (m % 15 === 0) label(ctx, `${m} m`, x - 56, top + m * pxPerM, { align: 'right' }); }
    for (let sec = 1; sec <= 3; sec++) {
      const d = 0.5 * G_EARTH * sec * sec; if (sec > tt) break;
      ring(ctx, x, top + d * pxPerM, 5, 'rgba(236,231,220,.4)');
      label(ctx, `${sec} s: ${nf(d, 1)} m fallen`, x + 14, top + d * pxPerM, { colour: SOFT });
    }
    const fallen = 0.5 * G_EARTH * tt * tt;
    dot(ctx, x, top + fallen * pxPerM, 5, ACCENT);
    say(`Falling at ${nf(G_EARTH * tt * 3.6)} km/h`, 'Every second it gains another 35 km/h');
  },
};

// ---- 2. everything pulls on everything
// Two bodies, one three times as heavy as the other, let go at rest. Time runs in steps under
// Newton's law; the pair is worked out once and replayed.
const pair = (() => {
  const m1 = 3, m2 = 1, out: [number, number][] = [];
  let x1 = -0.25, x2 = 0.75, v1 = 0, v2 = 0;                   // centre of mass at 0
  for (let i = 0; i < 4000 && x2 - x1 > 0.13; i++) {
    const d = x2 - x1, f = 0.00002 / (d * d);
    v1 += f * m2; v2 -= f * m1; x1 += v1; x2 += v2;
    if (i % 4 === 0) out.push([x1, x2]);
  }
  return out;
})();
const pullScene: Scene = {
  caption: 'Two bodies let go in empty space, one three times as heavy as the other, moving under Newton\'s law of gravity. The pull on each is the same size. The heavy one is simply harder to move. Sizes and distances are for show.',
  stillAt: 3,
  draw({ ctx, w, h, t, say }) {
    backdrop(ctx, w, h, 0.5);
    const loop = 9, tt = t % loop, k = clamp((tt - 0.8) / 6), i = Math.min(Math.floor(k * k * pair.length), pair.length - 1);
    const [x1, x2] = pair[i], cx = w * 0.42, cy = h * 0.48, span = Math.min(w * 0.6, h * 0.9), r1 = span * 0.075, r2 = r1 * Math.cbrt(1 / 3);
    const a = cx + x1 * span, b = cx + x2 * span;
    line(ctx, [cx, cy - 26, cx, cy + 26], 'rgba(233,196,138,.5)', 1, [2, 4]);
    label(ctx, 'They meet here', cx, cy + 40, { align: 'center', colour: ACCENT });
    globe(ctx, a, cy, r1); globe(ctx, b, cy, r2, '200,198,190', '70,70,72');
    // equal and opposite arrows
    const arrow = (from: number, dir: number) => { const len = span * 0.09; line(ctx, [from, cy, from + dir * len, cy, from + dir * (len - 6), cy - 4, from + dir * len, cy, from + dir * (len - 6), cy + 4], ACCENT, 1.4); };
    if (b - a > r1 + r2 + span * 0.22) { arrow(a + r1 + 4, 1); arrow(b - r2 - 4, -1); }
    say('You pull on the Earth exactly as hard as it pulls on you', 'The Earth is too heavy for you to notice it move');
  },
};

// ---- 3. how much stuff
const UP = Math.sqrt(2 * G_EARTH * 0.5);                       // take-off speed for a 50 cm jump on the Earth
const jumpScene: Scene = {
  caption: 'The same jump on the Earth and on the Moon, in real time. Leaving the ground at the same speed, the jumper rises 50 cm on the Earth and just over 3 m on the Moon, because the Moon\'s pull is a sixth as strong.',
  stillAt: 1.9,
  draw({ ctx, w, h, t, say }) {
    const ground = h * 0.84, pxPerM = (h * 0.66) / 3.4, loop = 5.4, tt = t % loop;
    const places: [string, number, number, string, string][] = [['Earth', G_EARTH, w * 0.3, '93,126,166', '27,42,64'], ['Moon', G_MOON, w * 0.7, '200,198,190', '70,70,72']];
    for (const [name, g, x, lit, dark] of places) {
      const air = (2 * UP) / g, at = Math.min(tt, air), y = Math.max(UP * at - 0.5 * g * at * at, 0), top = (UP * UP) / (2 * g);
      ctx.save(); ctx.beginPath(); ctx.rect(x - w * 0.19, ground, w * 0.38, h - ground); ctx.clip(); ctx.globalAlpha = 0.4; globe(ctx, x, ground + w * 0.6, w * 0.6, lit, dark); ctx.restore();
      line(ctx, [x - 34, ground - top * pxPerM, x + 34, ground - top * pxPerM], 'rgba(236,231,220,.25)', 1, [2, 4]);
      label(ctx, `${nf(top, 1)} m`, x + 40, ground - top * pxPerM, { colour: SOFT });
      // the jumper: a head and a body
      const feet = ground - y * pxPerM, tall = 1.7 * pxPerM;
      line(ctx, [x, feet, x, feet - tall * 0.78], INK, 2); dot(ctx, x, feet - tall * 0.88, tall * 0.1, INK);
      label(ctx, name, x, ground + 20, { align: 'center', colour: ACCENT });
      label(ctx, `${nf(air, 1)} s in the air`, x, ground + 36, { align: 'center', colour: SOFT });
    }
    say('On the Moon you weigh a sixth as much', 'and the same jump takes you six times as high');
  },
};

// ---- 4. how far away
const HEIGHTS: [number, string][] = [[408, 'Space station'], [6371, 'One Earth-width out'], [20_200, 'Sat-nav satellites'], [35_786, 'TV satellites']];
const farScene: Scene = {
  caption: 'How the Earth\'s pull fades with height, from Newton\'s law: it goes as one over the square of the distance from the Earth\'s centre. The Earth and the heights are to scale.',
  stillAt: 8,
  draw({ ctx, w, h, t, say }) {
    backdrop(ctx, w, h, 0.4);
    const R = Math.min(w * 0.075, h * 0.12), cx = w * 0.06 + R, base = h * 0.8, top = h * 0.14, reach = 7.4;       // Earth radii shown
    const X = (r: number) => cx + ((r - 1) / (reach - 1)) * (w * 0.9 - cx - R) + R, Y = (pull: number) => base - pull * (base - top);
    globe(ctx, cx, base - R * 0.2, R);
    // the curve of pull against distance
    ctx.strokeStyle = 'rgba(236,231,220,.55)'; ctx.lineWidth = 1.2; ctx.beginPath();
    for (let r = 1; r <= reach; r += 0.05) { if (r === 1) ctx.moveTo(X(r), Y(1)); else ctx.lineTo(X(r), Y(1 / (r * r))); }
    ctx.stroke();
    line(ctx, [X(1), base, X(reach), base], 'rgba(236,231,220,.2)');
    label(ctx, 'Pull', X(1) + 8, top - 4, { colour: FAINT }); label(ctx, 'Height', X(reach), base + 16, { align: 'right' });
    for (const [km, name] of HEIGHTS) {
      const r = 1 + km / R_EARTH, p = 1 / (r * r);
      dot(ctx, X(r), Y(p), 2.6, INK);
      if (w > 520 || km !== 20_200) { const end = X(r) > w * 0.7; label(ctx, `${name}: ${nf(p * 100, p < 0.1 ? 1 : 0)}%`, X(r) + (end ? 0 : 7), Y(p) - (end ? 24 : 11), { colour: SOFT, align: end ? 'right' : 'left' }); }
    }
    const loop = 13, k = ease(((t % loop) - 0.6) / 9), r = 1 + k * (reach - 1), p = 1 / (r * r);
    line(ctx, [X(r), base, X(r), Y(p)], 'rgba(233,196,138,.5)');
    dot(ctx, X(r), Y(p), 4, ACCENT);
    say(`${nf((r - 1) * R_EARTH, 0)} km up: ${nf(p * 100, p < 0.1 ? 1 : 0)}% of your weight on the ground`, 'At the Moon\'s distance: 0.03%, and still enough to hold the Moon');
  },
};

// ---- 5. falling together
const floating = photoScene({
  src: '/img/learn/astronaut-floating-iss.jpg',
  caption: 'A real photograph: astronaut Greg Chamitoff floating in the Destiny laboratory of the International Space Station, 13 October 2008. Credit: NASA.',
  say: ['Gravity here is 89% as strong as on the ground', 'He floats because he and the station are falling together'],
  cover: true, zoom: [1, 1.08], focus: [0.5, 0.48],
});

export const scenes: Scene[] = [dropScene, pullScene, jumpScene, farScene, floating];
