/**
 * Pictures for the lesson "How big is space". One scale runs through all of them, the lesson's own:
 * the Sun as a football 22 cm wide. On it, 1 au is 23.7 m, Neptune is 712 m out and the nearest
 * star, Proxima Centauri at 4.25 light years, is about 6,300 km away.
 */
import { type Scene, INK, SOFT, FAINT, ACCENT, clamp, ease, label, stars, nf } from '../stage';
import { photoScene, sun, dot, ring, line } from '../kit';

const backdrop = stars(110, 3);
const SUN_KM = 1_392_700, AU_KM = 149_597_871, LIGHT_KM_S = 299_792.458;
const BALL_M = 0.22, M_PER_AU = (AU_KM / SUN_KM) * BALL_M;      // 23.6 m
const PLANETS: [string, number, number][] = [                     // name, distance in au, width in km
  ['Mercury', 0.387, 4879], ['Venus', 0.723, 12104], ['Earth', 1, 12742], ['Mars', 1.524, 6779],
  ['Jupiter', 5.203, 139820], ['Saturn', 9.537, 116460], ['Uranus', 19.19, 50724], ['Neptune', 30.07, 49244],
];
const PROXIMA_AU = 268_550, PROXIMA_M = PROXIMA_AU * M_PER_AU;

// ---- the top of the page: light leaving the Sun, at its real speed, to scale
export const lens: Scene = {
  caption: 'Light leaving the Sun, drawn to scale and in real time. The Sun is 4.6 light seconds wide, so even light takes a while to get anywhere.',
  stillAt: 9,
  draw({ ctx, w, h, t }) {
    backdrop(ctx, w, h, 0.6);
    const s = Math.min(w, h), wide = w > 760, cx = w * (wide ? 0.62 : 0.5), cy = h * (wide ? 0.4 : 0.3), R = s * 0.07;
    const pxPerSec = (2 * R) / (SUN_KM / LIGHT_KM_S), loop = 26, age = t % loop, reach = R + age * pxPerSec;
    ring(ctx, cx, cy, reach, `rgba(233,196,138,${0.75 * (1 - age / loop)})`, 1.2);
    sun(ctx, cx, cy, R);
    const a = -0.5, lx = cx + Math.cos(a) * reach, ly = cy + Math.sin(a) * reach;
    if (lx < w - 150 && ly > 40) {
      label(ctx, `Light, ${nf(age)} s after leaving`, lx + 8, ly - 8, { colour: ACCENT });
      label(ctx, `${nf(Math.round((age * LIGHT_KM_S) / 100000) * 100000)} km gone. Earth: 8 min 19 s`, lx + 8, ly + 8);
    }
  },
};

// ---- 1. a football on the centre spot
function pitch(ctx: CanvasRenderingContext2D, cx: number, cy: number, pxPerM: number, alpha = 1): void {
  const L = 105 * pxPerM, W = 68 * pxPerM, c = `rgba(236,231,220,${0.4 * alpha})`;
  ctx.fillStyle = `rgba(40,70,50,${0.35 * alpha})`; ctx.fillRect(cx - L / 2, cy - W / 2, L, W);
  ctx.strokeStyle = c; ctx.lineWidth = 1; ctx.strokeRect(cx - L / 2, cy - W / 2, L, W);
  line(ctx, [cx, cy - W / 2, cx, cy + W / 2], c);
  ring(ctx, cx, cy, 9.15 * pxPerM, c);
  for (const side of [-1, 1]) {
    ctx.strokeRect(side > 0 ? cx + L / 2 - 16.5 * pxPerM : cx - L / 2, cy - 20.16 * pxPerM, 16.5 * pxPerM, 40.32 * pxPerM);
    ctx.strokeRect(side > 0 ? cx + L / 2 - 5.5 * pxPerM : cx - L / 2, cy - 9.16 * pxPerM, 5.5 * pxPerM, 18.32 * pxPerM);
  }
}
const ballScene: Scene = {
  caption: 'A football pitch, 105 m by 68 m, seen from above, closing in on a football on the centre spot. Everything is to scale.',
  stillAt: 9,
  draw({ ctx, w, h, t, say }) {
    const loop = 13, x = t % loop, k = ease((x - 1.5) / 6.5), cx = w / 2, cy = h * 0.47;
    const pxPerM = (w * 0.86 / 105) * Math.pow(105 / 1.6, k);
    pitch(ctx, cx, cy, pxPerM);
    const r = (BALL_M / 2) * pxPerM;
    if (r > 6) sun(ctx, cx, cy, r, clamp((r - 6) / 10)); else dot(ctx, cx, cy, Math.max(r, 0.8), '#ffd88c');
    if (k > 0.9) label(ctx, 'The Sun: a football, 22 cm', cx, cy + r * 2.9 + 14, { align: 'center', colour: ACCENT });
    else if (k < 0.1) label(ctx, 'The Sun is on the centre spot', cx, cy - 9.15 * pxPerM - 14, { align: 'center', colour: SOFT });
    say('The Sun, 1.39 million km wide', 'shrunk to a football 22 cm wide');
  },
};

// ---- 2. the planets round the pitch
const planetsScene: Scene = {
  caption: 'The orbits of the Earth, Jupiter and Neptune drawn round the same pitch, to scale. The planets themselves are too small to draw at this size, so each is marked with a dot.',
  stillAt: 11,
  draw({ ctx, w, h, t, say }) {
    const loop = 16, x = t % loop, k = ease((x - 1) / 9), cx = w / 2, cy = h * 0.47, s = Math.min(w, h);
    const view = 70 * Math.pow(1600 / 70, k);                     // metres across the shorter side
    const pxPerM = (s * 0.94) / view;
    pitch(ctx, cx, cy, pxPerM, clamp(1.2 - k * 0.6));
    const shown: [string, string, string][] = [['Earth', 'a peppercorn', '24 m'], ['Jupiter', 'a large marble', '120 m'], ['Neptune', 'a pea', '700 m']];
    shown.forEach(([name, what, far], i) => {
      const au = PLANETS.find((p) => p[0] === name)![1], r = au * M_PER_AU * pxPerM;
      if (r < 10) return;
      const a = clamp((r - 10) / 30) * clamp((s * 0.9 - r) / 40 + 0.4);
      ring(ctx, cx, cy, r, `rgba(236,231,220,${0.3 * a})`);
      const ang = -0.9 - i * 0.5 + t * 0.03 / (i + 1), px = cx + Math.cos(ang) * r, py = cy + Math.sin(ang) * r;
      if (px > 14 && px < w - 14 && py > 22 && py < h - 8) {
        dot(ctx, px, py, 2.4, `rgba(233,196,138,${a})`);
        ctx.globalAlpha = a; label(ctx, `${name}, ${what}, ${far}`, px + (px > cx ? -8 : 8), py - 11, { colour: SOFT, align: px > cx ? 'right' : 'left' }); ctx.globalAlpha = 1;
      }
    });
    dot(ctx, cx, cy, Math.max((BALL_M / 2) * pxPerM, 1.2), '#ffd88c');
    say(`This picture is ${nf(Math.round(view / 10) * 10)} m across`, k > 0.95 ? 'The pitch is the small mark in the middle' : 'Pulling back from the pitch');
  },
};

// ---- 3. everything in between is empty
const emptyScene: Scene = {
  caption: 'The straight line from the Sun to Neptune, to scale, folded into rows like lines of writing so that it fits. The Sun is the first mark. Each planet is drawn at its true size where it would be more than a speck, and as the smallest dot the screen can show where it would not.',
  stillAt: 30,
  draw({ ctx, w, h, t, say }) {
    const x0 = w * 0.05, rowW = w * 0.9, gap = w < 520 ? 9 : 12, rows = Math.max(12, Math.floor((h * 0.86) / gap)), y0 = (h - rows * gap) / 2 + gap / 2;
    const total = rows * rowW, pxPerAu = total / 30.5, loop = 34, k = clamp((t % loop) / 22), upto = k * total;
    for (let r = 0; r < rows; r++) {
      const from = r * rowW; if (from > upto) break;
      line(ctx, [x0, y0 + r * gap, x0 + Math.min(rowW, upto - from), y0 + r * gap], 'rgba(236,231,220,.13)');
    }
    const place = (au: number): [number, number, boolean] => { const d = au * pxPerAu, r = Math.floor(d / rowW); return [x0 + (d - r * rowW), y0 + r * gap, d <= upto]; };
    const sunPx = (SUN_KM / AU_KM) * pxPerAu;
    dot(ctx, x0, y0, Math.max(sunPx / 2, 1.5), '#ffd88c');
    label(ctx, 'Sun', x0 + 8, y0 - 9, { colour: ACCENT });
    let last = 'the Sun';
    for (const [name, au, km] of PLANETS) {
      const [px, py, seen] = place(au); if (!seen) continue;
      last = name;
      dot(ctx, px, py, Math.max(((km / AU_KM) * pxPerAu) / 2, 0.9), INK);
      const left = px > x0 + rowW - 70;
      label(ctx, name, px + (left ? -6 : 6), py - 8, { colour: SOFT, align: left ? 'right' : 'left', size: w < 520 ? 9 : 11 });
    }
    const au = (upto / pxPerAu);
    say(`${nf(au * M_PER_AU)} m from the football: ${nf(au * AU_KM / 1e6)} million km`, k >= 1 ? 'All the rest of the line is empty space' : `Last thing passed: ${last}`);
  },
};

// ---- 4. the next football
const MARKS: [number, string][] = [[1_000, '1 km'], [10_000, '10 km'], [100_000, '100 km'], [1_000_000, '1,000 km']];
const nextScene: Scene = {
  caption: 'Pulling back from Neptune\'s orbit until the nearest star comes into view, on the same scale. Each ring is ten times wider than the one before. Proxima Centauri is 4.25 light years away, which on this scale is about 6,300 km.',
  stillAt: 14.5,
  draw({ ctx, w, h, t, say }) {
    backdrop(ctx, w, h, 0.35);
    const loop = 19, x = t % loop, k = ease((x - 1) / 12), cx = w * 0.2, cy = h * 0.6;
    const view = 1_800 * Math.pow((PROXIMA_M * 1.25) / 1_800, k), pxPerM = (w * 0.76) / view;
    const fadeFor = (r: number) => clamp((r - 6) / 24) * clamp((Math.hypot(w, h) - r) / 80);
    for (const [m, name] of MARKS) {
      const r = m * pxPerM, a = fadeFor(r); if (a <= 0) continue;
      ring(ctx, cx, cy, r, `rgba(236,231,220,${0.16 * a})`, 1, [2, 6]);
      ctx.globalAlpha = a; if (cx + r * 0.94 + 70 < w) label(ctx, name, cx + r * 0.94 + 6, cy - r * 0.34, {}); ctx.globalAlpha = 1;
    }
    const nep = 712 * pxPerM;
    if (nep > 3) { ring(ctx, cx, cy, nep, `rgba(236,231,220,${0.4 * clamp(nep / 20)})`); if (nep > 26) label(ctx, 'Neptune\'s orbit, 712 m', cx + nep * 0.72 + 8, cy - nep * 0.72, { colour: SOFT }); }
    dot(ctx, cx, cy, 2, '#ffd88c'); label(ctx, 'The Sun and all its planets', cx - 4, cy + 16, { colour: k > 0.4 ? ACCENT : FAINT });
    const px = cx + PROXIMA_M * pxPerM;
    if (px < w + 20) {
      const a = clamp((w + 20 - px) / 60);
      line(ctx, [cx + 6, cy, px - 6, cy], `rgba(233,196,138,${0.3 * a})`, 1, [1, 5]);
      dot(ctx, px, cy, 2, `rgba(255,170,130,${a})`);
      ctx.globalAlpha = a; label(ctx, 'Proxima Centauri', px, cy - 24, { colour: ACCENT, align: 'right' }); label(ctx, 'the next football', px, cy - 10, { align: 'right' }); ctx.globalAlpha = 1;
    }
    say(`This picture is ${view < 10_000 ? `${nf(Math.round(view / 100) * 100)} m` : `${nf(Math.round(view / 1000))} km`} across`, k >= 1 ? 'About 6,300 km to the next star: London to Chicago' : 'Nothing but empty space so far');
  },
};

// ---- 5. the real thing
const paleBlueDot = photoScene({
  src: '/img/learn/pale-blue-dot-voyager.jpg',
  caption: 'A real photograph: the Earth from 6 billion km away, taken by Voyager 1 on 14 February 1990 from beyond Neptune. The Earth is the speck in the band of light, which is sunlight scattered inside the camera. Credit: NASA/JPL-Caltech. The mark was added here.',
  say: ['The Earth, from 40 times as far as the Sun', 'Everyone who has ever lived is on that speck'],
  cover: true, focus: [0.56, 0.5], zoom: [1, 1.35],
  pointers: [{ at: [0.6, 0.522], to: [0.72, 0.42], text: 'The Earth' }],
});

export const scenes: Scene[] = [ballScene, planetsScene, emptyScene, nextScene, paleBlueDot];
