/**
 * Pictures for the lesson "The kinds of planet out there". The chart is real: every dot is a
 * confirmed planet from NASA's Exoplanet Archive, placed by its measured (or, for some, estimated)
 * width and the length of its year. The lava world is a drawing of something nobody has seen.
 * The picture of PDS 70b is a real one.
 */
import { type Scene, type Frame, SOFT, clamp, ease, label, stars } from '../stage';
import { TAU, photoScene, sun, dot, ring } from '../kit';
import { planets, PLOTTED } from '../data/exoplanets';

const backdrop = stars(110, 61);
let all: [number, number][] | null = null;
const CHART = 'Each dot is a real planet round another star, from NASA’s Exoplanet Archive on 11 November 2026. Across: the length of its year. Up: its width. Each step on either scale is ten times the last.';

// our own planets: year in days, width in Earths
const OURS: [string, number, number, number, number, CanvasTextAlign][] = [
  ['Mercury', 88, 0.383, -9, 0, 'right'], ['Venus', 224.7, 0.949, -9, -3, 'right'], ['Earth', 365.25, 1, 9, 0, 'left'], ['Mars', 687, 0.532, 9, 3, 'left'],
  ['Jupiter', 4333, 11.21, 0, -13, 'center'], ['Saturn', 10759, 9.45, 9, 4, 'left'], ['Uranus', 30687, 4.01, -9, 0, 'right'], ['Neptune', 60190, 3.88, 0, 13, 'center'],
];

type Pick = (logYear: number, logWidth: number) => boolean;
/** Draw the chart. `pick` chooses the dots to light up; the rest are dimmed. */
function chart(f: Frame, o: { reveal?: number; pick?: Pick; ours?: number } = {}) {
  const { ctx, w, h } = f; all ??= planets();
  const wide = w > 560, x0 = wide ? w * 0.13 : 60, x1 = w * (wide ? 0.95 : 0.97), y0 = h * 0.06, y1 = h * (wide ? 0.8 : 0.78);
  const X = (lp: number) => x0 + ((lp + 0.8) / 6.2) * (x1 - x0), Y = (lr: number) => y1 - ((lr + 0.55) / 2.05) * (y1 - y0);
  ctx.strokeStyle = 'rgba(236,231,220,.1)'; ctx.lineWidth = 1;
  for (const [text, lp] of (wide ? [['1 day', 0], ['10 days', 1], ['100 days', 2], ['1,000 days', 3], ['10,000 days', 4], ['100,000 days', 5]] : [['1', 0], ['10', 1], ['100', 2], ['1,000', 3], ['10,000', 4]]) as [string, number][]) {
    ctx.beginPath(); ctx.moveTo(X(lp), y0); ctx.lineTo(X(lp), y1); ctx.stroke(); label(ctx, text, X(lp), y1 + 12, { align: 'center', colour: SOFT, size: 10 });
  }
  for (const [text, r] of [['Earth', 1], ['Neptune', 3.88], ['Jupiter', 11.21]] as [string, number][]) {
    const y = Y(Math.log10(r)); ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x1, y); ctx.stroke(); label(ctx, text, x0 - 6, y, { align: 'right', colour: SOFT, size: 10 });
  }
  label(ctx, wide ? 'Length of its year' : 'Length of its year, in days', (x0 + x1) / 2, y1 + 28, { align: 'center', colour: SOFT, size: 10 });
  label(ctx, 'Width', x0 - 6, y0 + 4, { align: 'right', colour: SOFT, size: 10 });
  const n = Math.floor(clamp(o.reveal ?? 1) * all.length), s = wide ? 2 : 1.5;
  for (let pass = 0; pass < 2; pass++) {
    ctx.fillStyle = pass ? 'rgba(232,163,61,.9)' : o.pick ? 'rgba(236,231,220,.16)' : 'rgba(236,231,220,.5)';
    for (let i = 0; i < n; i++) {
      const [lp, lr] = all[i]; if (lp < -0.8 || lp > 5.4) continue;
      const lit = !!o.pick && o.pick(lp, lr); if (lit !== !!pass) continue;
      ctx.fillRect(X(lp) - s / 2, Y(lr) - s / 2, s, s);
    }
    if (!o.pick) break;
  }
  if (o.ours) {
    ctx.globalAlpha = o.ours;
    for (const [name, days, r, dx, dy, align] of OURS) {
      const x = X(Math.log10(days)), y = Y(Math.log10(r));
      dot(ctx, x, y, 3.2, '#7fb4ff'); ring(ctx, x, y, 5.5, 'rgba(127,180,255,.6)');
      label(ctx, name, x + dx, y + dy, { align, colour: '#a9cbff', size: 10 });
    }
    ctx.globalAlpha = 1;
  }
  return { n };
}

// ---- 1. every planet known
const allScene: Scene = {
  caption: CHART,
  stillAt: 9,
  draw(f) { backdrop(f.ctx, f.w, f.h, 0.3); const { n } = chart(f, { reveal: f.t / 7 }); f.say(`${n.toLocaleString('en-GB')} planets`, 'Small at the bottom, giants at the top. Short years on the left'); },
};

// ---- 2. where our own would be
const oursScene: Scene = {
  caption: `${CHART} The blue marks are the eight planets of our own Solar System, placed the same way.`,
  stillAt: 6,
  draw(f) { backdrop(f.ctx, f.w, f.h, 0.3); chart(f, { ours: ease((f.t - 0.8) / 2) }); f.say('Our own eight planets, in blue', 'They sit where hardly anything has been found'); },
};

// ---- 3. how we look
const seenScene: Scene = {
  caption: `${CHART} Lit up: the planets with a year shorter than Mercury’s 88 days, which is 5,019 of the ${PLOTTED.toLocaleString('en-GB')} (counted here).`,
  stillAt: 6,
  draw(f) { backdrop(f.ctx, f.w, f.h, 0.3); const k = f.t > 1.5; chart(f, { pick: k ? (lp) => lp < Math.log10(88) : undefined, ours: 0.9 }); f.say(k ? 'A year shorter than Mercury’s: more than four in five' : 'Which are the easy ones to find?', 'Big and close in is easiest to catch. The rest are still hiding'); },
};

// ---- 4. hot Jupiters
const hotScene: Scene = {
  caption: `${CHART} Lit up: giants more than 8 times as wide as the Earth with a year of less than 10 days. There are 768 on the chart (counted here).`,
  stillAt: 6,
  draw(f) { backdrop(f.ctx, f.w, f.h, 0.3); chart(f, { pick: f.t > 1.2 ? (lp, lr) => lp < 1 && lr > Math.log10(8) : undefined, ours: 0.9 }); f.say('Hot Jupiters', 'Giants with a year of a few days. Ours takes twelve years'); },
};

// ---- 5. between the Earth and Neptune
const betweenScene: Scene = {
  caption: `${CHART} Lit up: planets from 1.25 to 4 times as wide as the Earth. There are 3,294, more than half of the chart (counted here).`,
  stillAt: 6,
  draw(f) { backdrop(f.ctx, f.w, f.h, 0.3); chart(f, { pick: f.t > 1.2 ? (_, lr) => lr >= Math.log10(1.25) && lr < Math.log10(4) : undefined, ours: 0.9 }); f.say('Between the Earth and Neptune', 'The commonest kind found, and we have none'); },
};

// ---- 6. a lava world
const lavaScene: Scene = {
  caption: 'The planet 55 Cancri e, which goes round its star in 18 hours with one face always towards it. A drawing of the idea: nobody has seen this planet, and nothing here is to scale.',
  stillAt: 3,
  draw({ ctx, w, h, t, say }) {
    backdrop(ctx, w, h, 0.5);
    const s = Math.min(w, h), wide = w > 560, sx = w * (wide ? 0.36 : 0.5), sy = h * 0.46, R = s * (wide ? 0.2 : 0.16), a = t * 0.5, orbit = s * 0.42;
    const px = sx + Math.cos(a) * (wide ? orbit * 1.25 : w * 0.36), py = sy + Math.sin(a) * orbit * 0.34, behind = Math.sin(a) < 0, r = s * 0.06;
    const planet = () => {
      ctx.save(); ctx.beginPath(); ctx.arc(px, py, r, 0, TAU); ctx.clip();
      const dx = sx - px, dy = sy - py, d = Math.hypot(dx, dy), ux = dx / d, uy = dy / d;
      const g = ctx.createLinearGradient(px + ux * r, py + uy * r, px - ux * r, py - uy * r);
      g.addColorStop(0, '#ffe1a0'); g.addColorStop(0.35, '#ff8a2a'); g.addColorStop(0.6, '#8a2412'); g.addColorStop(1, '#2a0d0a');
      ctx.fillStyle = g; ctx.fillRect(px - r, py - r, r * 2, r * 2); ctx.restore();
    };
    if (behind) planet();
    sun(ctx, sx, sy, R, 1, '255,214,150');
    if (!behind) planet();
    label(ctx, '55 Cancri e', px, py - r - 10, { align: 'center' });
    const hours = ((a / TAU) * 18) % 18;
    say(`Hour ${Math.floor(hours) + 1} of an 18-hour year`, 'The side facing the star is hot enough to melt rock');
  },
};

// ---- 7. one that has been seen
const SPHERE = 'Credit: ESO/A. Müller et al., CC BY 4.0.';
const born = photoScene({
  src: '/img/learn/pds-70b-sphere-eso.jpg',
  caption: `A real picture in infrared light, shown in a colour chosen for it: the planet PDS 70b forming in the disc round a young star, from the Very Large Telescope in Chile, 2018. The black circle is a mask that hides the star. ${SPHERE} The marks were added here.`,
  say: ['A planet being born', 'A few times the mass of Jupiter, at about 1,000 degrees'],
  zoom: [0.9, 1.08],
  pointers: [{ at: [0.585, 0.552], to: [0.8, 0.8], text: 'The planet' }, { at: [0.495, 0.485], to: [0.22, 0.14], text: 'The star, hidden', align: 'left' }],
});

export const lens = photoScene({
  src: '/img/learn/pds-70b-sphere-eso.jpg',
  caption: `A real picture in infrared light: the bright spot is a planet forming round the young star PDS 70, whose own light is hidden behind the black circle. ${SPHERE}`,
  say: ['', ''], hero: true, zoom: [1, 1.1], focus: [0.5, 0.5],
});

export const scenes: Scene[] = [allScene, oursScene, seenScene, hotScene, betweenScene, lavaScene, born];
