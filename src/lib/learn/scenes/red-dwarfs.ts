/**
 * Pictures for the lesson "Red dwarfs, the commonest stars". One is a real photograph. The sizes
 * of the stars and the two orbits are drawn to scale. The rest are charts and diagrams.
 */
import { type Scene, SOFT, ACCENT, clamp, ease, label, stars } from '../stage';
import { TAU, photoScene, dot, line } from '../kit';

const backdrop = stars(80, 1915);
const PROXIMA = 'A real photograph by the Hubble Space Telescope: Proxima Centauri, the nearest star to the Sun, 4.25 light years away. The four spikes are made inside the telescope. Credit: ESA/Hubble and NASA, CC BY 4.0.';
const RED = '#e8795a';

export const lens = photoScene({ src: '/img/learn/proxima-centauri-hubble.jpg', caption: PROXIMA, say: ['', ''], hero: true, cover: true, zoom: [1.3, 1.4], focus: [0.25, 0.5] });

function glow(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, colour: string, halo = 1.9) {
  const g = ctx.createRadialGradient(x, y, r * 0.2, x, y, r * halo); g.addColorStop(0, colour); g.addColorStop(1 / halo, colour); g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r * halo, 0, TAU); ctx.fill();
}

// ---- 1. the 60 nearest stars
const census: Scene = {
  caption: 'A chart, not a map. Each dot is one of the 60 stars nearest to the Sun. The 50 red ones are red dwarfs. The 10 pale ones are every other kind of star put together. The count is the one given by Wikipedia’s article on red dwarfs.',
  stillAt: 4,
  draw({ ctx, w, h, t, say }) {
    const wide = w > 560, cols = wide ? 15 : 12, rows = Math.ceil(60 / cols), x0 = w * 0.1, x1 = w * 0.9, top = h * 0.1, gap = Math.min((x1 - x0) / (cols - 1), (h * 0.52) / (rows - 1)), ox = w / 2 - (gap * (cols - 1)) / 2;
    for (let i = 0; i < 60; i++) {
      const cx = ox + (i % cols) * gap, cy = top + Math.floor(i / cols) * gap, k = ease(clamp((t - 0.2 - i * 0.04) / 0.5, 0, 1));
      if (k <= 0) continue;
      const red = i >= 10; ctx.globalAlpha = k; glow(ctx, cx, cy, red ? gap * 0.17 : gap * 0.24, red ? RED : '#fff1cf', 1.7); ctx.globalAlpha = 1;
    }
    const by = top + (rows - 1) * gap + gap * 0.9;
    label(ctx, '10 of every other kind', x0, by, { align: 'left', colour: '#fff1cf', size: 11 });
    label(ctx, '50 red dwarfs', x1, by, { align: 'right', colour: RED, size: 11 });
    say('The 60 nearest stars', 'Fifty are red dwarfs, and none can be seen by eye');
  },
};

const proxima = photoScene({ src: '/img/learn/proxima-centauri-hubble.jpg', caption: PROXIMA, say: ['Proxima Centauri, the nearest star', 'A hundred times too faint to see without a telescope'], zoom: [1, 1.15], focus: [0.5, 0.5] });

// ---- 3. sizes, to scale
const sizes: Scene = {
  caption: 'A drawing to scale of sizes only. The curve on the left is part of the edge of the Sun. Beside it are the red dwarf Proxima Centauri, the red dwarf TRAPPIST-1, which is one of the smallest stars known, and the planet Jupiter. The colours are a guide and no more.',
  stillAt: 2,
  draw({ ctx, w, h, t, say }) {
    backdrop(ctx, w, h, 0.25);
    const wide = w > 560, y = h * 0.4, R = wide ? h * 0.95 : h * 0.8, sx = w * 0.3 - R, k = ease(clamp(t / 1.5, 0, 1));
    const g = ctx.createRadialGradient(sx, y, R * 0.6, sx, y, R); g.addColorStop(0, '#fff3c9'); g.addColorStop(0.97, '#ffd76a'); g.addColorStop(1, '#e8a23a');
    ctx.save(); ctx.beginPath(); ctx.rect(0, 0, w, h * 0.76); ctx.clip(); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(sx, y, R, 0, TAU); ctx.fill(); ctx.restore();
    const items: [string, string, number, string][] = [['Proxima', 'a seventh of the Sun', 0.15, RED], ['TRAPPIST-1', 'a ninth', 0.119, '#d9603f'], ['Jupiter', 'a planet', 0.1005, '#c9a47c']];
    items.forEach(([name, note, rr, colour], i) => {
      const x = w * (0.47 + i * 0.2), r = R * rr * k;
      if (i < 2) glow(ctx, x, y, r, colour, 1.18); else dot(ctx, x, y, r, colour);
      label(ctx, name, x, y + R * 0.15 + 20, { align: 'center', colour: '#fff', size: wide ? 12 : 11 });
      if (wide) label(ctx, note, x, y + R * 0.15 + 36, { align: 'center', colour: SOFT, size: 11 });
    });
    label(ctx, 'The Sun', w * 0.04, h * 0.1, { align: 'left', colour: '#3a2a08', size: 12 });
    say('Small stars', 'The smallest are hardly wider than Jupiter');
  },
};

// ---- 4. how long stars last
const BARS: [string, number, string][] = [['The universe so far', 13.8, 'rgba(236,231,220,.75)'], ['A star like the Sun', 10, '#ffd76a'], ['Proxima Centauri', 4000, RED], ['The smallest red dwarfs', 10000, '#d9603f']];
const lives: Scene = {
  caption: 'A chart with an even scale that zooms out as you watch. It starts wide enough for 20 billion years and ends wide enough for 10 trillion. The bars for the age of the universe and for the life of the Sun shrink almost to nothing. The lifetimes are from theory: nobody has watched a star for this long.',
  stillAt: 9,
  draw({ ctx, w, h, t, say }) {
    const wide = w > 560, x0 = w * 0.07, x1 = w * 0.93, top = h * 0.06, rowH = (h * 0.66) / BARS.length, k = ease(clamp((t - 1.5) / 6, 0, 1)), span = 20 * Math.pow(500, k);
    BARS.forEach(([name, gyr, colour], i) => {
      const y = top + i * rowH, len = Math.min(1, gyr / span) * (x1 - x0), over = gyr > span;
      ctx.fillStyle = colour; ctx.fillRect(x0, y + rowH * 0.52, Math.max(1.5, len), Math.max(4, rowH * 0.26));
      if (over) { ctx.fillStyle = colour; ctx.beginPath(); ctx.moveTo(x1, y + rowH * 0.52 - 3); ctx.lineTo(x1 + 8, y + rowH * 0.65); ctx.lineTo(x1, y + rowH * 0.78 + 3); ctx.fill(); }
      label(ctx, name, x0, y + rowH * 0.32, { align: 'left', colour: '#fff', size: wide ? 12 : 11 });
      label(ctx, gyr >= 1000 ? `${gyr / 1000} trillion years` : `${gyr} billion years`, x1, y + rowH * 0.32, { align: 'right', colour: SOFT, size: wide ? 12 : 10 });
    });
    const s = span >= 1000 ? `${(span / 1000).toFixed(span >= 9990 ? 0 : 1)} trillion years` : `${Math.round(span)} billion years`;
    label(ctx, `The chart is ${s} wide`, w / 2, top + BARS.length * rowH + 16, { align: 'center', colour: ACCENT, size: 11 });
    say('How long they last', 'A small red dwarf outlives the Sun a thousand times over');
  },
};

// ---- 5. a flare
const flare: Scene = {
  caption: 'A diagram. The star brightens suddenly and fades over a few minutes, as Proxima Centauri did in March 2016, when it became 68 times as bright as usual. The line below shows the brightness rising and falling. Its shape is typical of a flare and is not the real record.',
  stillAt: 2.6,
  draw({ ctx, w, h, t, say }) {
    backdrop(ctx, w, h, 0.3);
    const tt = t % 7, f = tt < 2 ? 0 : tt < 2.25 ? (tt - 2) / 0.25 : Math.exp(-(tt - 2.25) / 0.9), cx = w / 2, y = h * 0.27, r = Math.min(h * 0.09, 26);
    if (f > 0.01) { const g = ctx.createRadialGradient(cx, y, 0, cx, y, r * (2 + f * 5)); g.addColorStop(0, `rgba(255,255,255,${0.9 * f})`); g.addColorStop(0.3, `rgba(200,220,255,${0.5 * f})`); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, y, r * (2 + f * 5), 0, TAU); ctx.fill(); }
    glow(ctx, cx, y, r, RED, 1.6);
    if (f > 0.01) dot(ctx, cx + r * 0.45, y - r * 0.4, r * 0.3 * Math.min(1, f * 2), `rgba(255,255,255,${Math.min(1, f * 1.5)})`);
    const x0 = w * 0.1, x1 = w * 0.9, base = h * 0.7, peak = h * 0.5, pts: number[] = [];
    for (let i = 0; i <= 140; i++) { const s = (i / 140) * 7; if (s > tt) break; const v = s < 2 ? 0 : s < 2.25 ? (s - 2) / 0.25 : Math.exp(-(s - 2.25) / 0.9); pts.push(x0 + (i / 140) * (x1 - x0), base - v * (base - peak)); }
    line(ctx, [x0, base, x1, base], 'rgba(236,231,220,.15)');
    if (pts.length >= 4) line(ctx, pts, ACCENT, 1.6);
    label(ctx, 'Usual brightness', x0, base + 15, { align: 'left', colour: SOFT, size: 11 });
    if (tt > 2.2) label(ctx, '68 times as bright', x0 + (2.6 / 7) * (x1 - x0), peak + 4, { align: 'left', colour: ACCENT, size: 11 });
    say('Small, but not quiet', 'A flare can outshine the whole star for a few minutes');
  },
};

// ---- 6. a close-in planet, beside Mercury's orbit
const orbit: Scene = {
  caption: 'A drawing with the two orbits to scale and the stars and planets drawn far too large. The grey ring is the path of Mercury, the closest planet to the Sun. The small ring is the path of Proxima b round its red dwarf, eight times closer in. The planet is drawn with one face always towards the star, which is likely but not known.',
  stillAt: 1,
  draw({ ctx, w, h, t, say }) {
    backdrop(ctx, w, h, 0.25);
    const wide = w > 560, cx = w / 2, y = h * 0.4, R = Math.min(w * 0.4, h * 0.36), r = R * (0.0485 / 0.387) * 1.0, a = t * 1.4;
    ctx.strokeStyle = 'rgba(236,231,220,.3)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(cx, y, R, 0, TAU); ctx.stroke();
    const ma = t * 0.18; dot(ctx, cx + Math.cos(ma) * R, y + Math.sin(ma) * R, 3, '#b9b2a6');
    ctx.strokeStyle = 'rgba(232,121,90,.6)'; ctx.beginPath(); ctx.arc(cx, y, r, 0, TAU); ctx.stroke();
    glow(ctx, cx, y, Math.max(3, r * 0.28), RED, 1.8);
    const px = cx + Math.cos(a) * r, py = y + Math.sin(a) * r, pr = Math.max(2.5, r * 0.16);
    dot(ctx, px, py, pr, '#27313f'); ctx.fillStyle = '#9fc2e8'; ctx.beginPath(); ctx.arc(px, py, pr, a + Math.PI / 2, a + (3 * Math.PI) / 2); ctx.fill();
    label(ctx, wide ? 'The path of Mercury, for scale: a year of 88 days' : 'Mercury’s path: 88 days', cx, y + R + 16, { align: 'center', colour: SOFT, size: 11 });
    line(ctx, [cx + r * 0.9, y - r * 0.9, cx + R * 0.45, y - R * 0.55], 'rgba(232,121,90,.6)');
    label(ctx, wide ? 'Proxima b: a year of 11 days' : 'Proxima b: 11 days', cx + R * 0.45 + 4, y - R * 0.55 - 4, { align: 'left', colour: RED, size: 11 });
    say('Planets that huddle close', 'Warm enough for water, but in the path of every flare');
  },
};

export const scenes: Scene[] = [census, proxima, sizes, lives, flare, orbit];

