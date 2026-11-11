/**
 * Pictures for the lesson "Gravity as bent space and time". The two photographs are real. The bent
 * sheet, the falling lift, Mercury's turning orbit and the two clocks are drawings of the idea, and
 * each exaggerates the effect enormously so that it can be seen at all.
 */
import { type Scene, SOFT, ACCENT, label, stars } from '../stage';
import { TAU, photoScene, sun, dot, line } from '../kit';

const backdrop = stars(130, 83);
const ECLIPSE = 'Credit: ESO/Landessternwarte Heidelberg-Königstuhl/F. W. Dyson, A. S. Eddington and C. Davidson, CC BY 4.0.';

export const lens = photoScene({
  src: '/img/learn/eclipse-1919-eso.jpg',
  caption: `A real photograph: the total eclipse of the Sun on 29 May 1919, restored from a copy of one of the plates used to test Einstein’s theory. The circles and names mark the stars that were measured and were added by ESO. ${ECLIPSE}`,
  say: ['', ''], hero: true, zoom: [1, 1.08], focus: [0.46, 0.45],
});

// ---- 1. the bend
const sheet: Scene = {
  caption: 'Space drawn as a sheet, bent by the Sun, with a planet going round in the dip. A drawing of the idea, not to scale: real space is bent in three directions, and time is bent with it.',
  stillAt: 3,
  draw({ ctx, w, h, t, say }) {
    backdrop(ctx, w, h, 0.4);
    const cx = w / 2, cy = h * 0.36, S = Math.min(w * 0.46, h * 0.9), N = 13;
    const at = (x: number, y: number): [number, number] => { const r = Math.hypot(x, y), z = 0.2 / (r * r * 5 + 0.22); return [cx + x * S, cy + y * S * 0.42 + z * S * 0.5]; };
    ctx.strokeStyle = 'rgba(236,231,220,.22)'; ctx.lineWidth = 1;
    for (let i = 0; i <= N; i++) {
      const u = -1 + (2 * i) / N;
      ctx.beginPath(); for (let k = 0; k <= 50; k++) { const [x, y] = at(u, -1 + (2 * k) / 50); k ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.stroke();
      ctx.beginPath(); for (let k = 0; k <= 50; k++) { const [x, y] = at(-1 + (2 * k) / 50, u); k ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.stroke();
    }
    const [sx, sy] = at(0, 0), a = t * 0.7, [px, py] = at(Math.cos(a) * 0.62, Math.sin(a) * 0.62), behind = Math.sin(a) < 0;
    if (behind) dot(ctx, px, py, 4.5, '#7fb4ff');
    sun(ctx, sx, sy - S * 0.03, S * 0.07, 1);
    if (!behind) dot(ctx, px, py, 4.5, '#7fb4ff');
    say('Mass bends space and time', 'The planet is going as straight as it can');
  },
};

// ---- 2. falling is floating
const person = (ctx: CanvasRenderingContext2D, x: number, y: number, s: number) => {
  ctx.strokeStyle = '#ece7dc'; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.arc(x, y - s * 1.5, s * 0.42, 0, TAU); ctx.stroke();
  line(ctx, [x, y - s * 1.08, x, y], '#ece7dc', 1.6); line(ctx, [x, y, x - s * 0.5, y + s], '#ece7dc', 1.6); line(ctx, [x, y, x + s * 0.5, y + s], '#ece7dc', 1.6); line(ctx, [x - s * 0.7, y - s * 0.6, x + s * 0.7, y - s * 0.75], '#ece7dc', 1.6);
};
const liftScene: Scene = {
  caption: 'Left, somebody in a lift that is falling freely. Right, somebody in a box far out in space. In both, a dropped apple hangs in the air, and nothing done inside the box can tell the two apart. A drawing of the idea.',
  stillAt: 2,
  draw({ ctx, w, h, t, say }) {
    backdrop(ctx, w, h, 0.5);
    const bw = Math.min(w * 0.3, h * 0.42), bh = bw * 1.35, y = h * 0.1, bob = Math.sin(t * 0.9) * 3;
    [w * 0.27, w * 0.73].forEach((cx, i) => {
      const x = cx - bw / 2;
      if (i === 0) for (let k = 0; k < 7; k++) { const lx = x - 14 - (k % 3) * 9 + (k > 3 ? bw + 28 + (k % 3) * 18 : 0), ly = y + ((t * 160 + k * 53) % (bh + 40)) - 20; line(ctx, [lx, ly, lx, ly - 22], 'rgba(236,231,220,.3)'); }
      ctx.strokeStyle = 'rgba(236,231,220,.7)'; ctx.lineWidth = 1.4; ctx.strokeRect(x, y, bw, bh);
      const s = bw * 0.13; person(ctx, cx - bw * 0.14, y + bh * 0.56 + bob * (i ? -1 : 1), s);
      dot(ctx, cx + bw * 0.22, y + bh * 0.42 - bob * (i ? -1 : 1), s * 0.3, '#d9534a');
      label(ctx, i ? 'Floating in deep space' : 'Falling freely', cx, y + bh + 16, { align: 'center', colour: i ? SOFT : ACCENT });
    });
    say('From inside, they are the same', 'So gravity is not a force you feel. It is the shape of space and time');
  },
};

// ---- 3. Mercury
const mercuryScene: Scene = {
  caption: 'Mercury’s stretched orbit slowly turning round the Sun. A drawing, enormously exaggerated: the real orbit turns by less than a sixth of a degree in a century, and only 43 seconds of arc of that was unexplained before Einstein.',
  stillAt: 9,
  draw({ ctx, w, h, t, say }) {
    backdrop(ctx, w, h, 0.5);
    const cx = w / 2, cy = h * 0.45, a = Math.min(w * 0.3, h * 0.34), e = 0.45, turn = 0.16, n = t * 1.6;
    const at = (m: number): [number, number] => { const r = (a * (1 - e * e)) / (1 + e * Math.cos(m)), ang = m * (1 + turn / TAU) ; return [cx + Math.cos(ang) * r, cy + Math.sin(ang) * r]; };
    ctx.lineWidth = 1; const back = Math.min(n, TAU * 5);
    for (let k = 0; k < 300; k++) { const m0 = n - back + (back * k) / 300, m1 = n - back + (back * (k + 1)) / 300, [x0, y0] = at(m0), [x1, y1] = at(m1); line(ctx, [x0, y0, x1, y1], `rgba(233,196,138,${0.08 + 0.5 * (k / 300)})`); }
    sun(ctx, cx, cy, a * 0.09, 1);
    const [px, py] = at(n); dot(ctx, px, py, 3.5, '#b9b6ae'); label(ctx, 'Mercury', px, py - 12, { align: 'center' });
    say('The whole orbit slowly turns', 'Einstein’s sums gave exactly the part nobody could explain');
  },
};

// ---- 4. the eclipse
const eclipse = photoScene({
  src: '/img/learn/eclipse-1919-eso.jpg',
  caption: `A real photograph: the total eclipse of 29 May 1919, taken at Sobral in Brazil and restored from a copy of the plate. The circles and names mark the stars whose places were measured, and were added by ESO. ${ECLIPSE}`,
  say: ['29 May 1919', 'The stars beside the Sun had moved, as Einstein said they would'],
  zoom: [0.96, 1.06], focus: [0.5, 0.5],
});

// ---- 5. two clocks
const face = (ctx: CanvasRenderingContext2D, x: number, y: number, r: number, turns: number) => {
  ctx.strokeStyle = '#ece7dc'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.stroke();
  for (let k = 0; k < 12; k++) { const a = (k / 12) * TAU; line(ctx, [x + Math.cos(a) * r * 0.86, y + Math.sin(a) * r * 0.86, x + Math.cos(a) * r * 0.96, y + Math.sin(a) * r * 0.96], 'rgba(236,231,220,.5)'); }
  const a = turns * TAU - TAU / 4; line(ctx, [x, y, x + Math.cos(a) * r * 0.78, y + Math.sin(a) * r * 0.78], ACCENT, 1.8); dot(ctx, x, y, 2, ACCENT);
};
const clocksScene: Scene = {
  caption: 'Two clocks at different heights above the ground. The higher one runs faster. A drawing, enormously exaggerated: for clocks a third of a metre apart the real difference is about 90 billionths of a second in 79 years.',
  stillAt: 6,
  draw({ ctx, w, h, t, say }) {
    backdrop(ctx, w, h, 0.4);
    const g = h * 0.74, r = Math.min(w * 0.11, h * 0.15), xa = w * 0.32, xb = w * 0.68, ya = g - r - 12, yb = h * 0.06 + r + 14;
    ctx.fillStyle = '#16171b'; ctx.fillRect(0, g, w, h - g); line(ctx, [0, g, w, g], 'rgba(236,231,220,.4)');
    line(ctx, [xb, g, xb, yb + r], 'rgba(236,231,220,.35)', 1.4); line(ctx, [xb - 16, g, xb + 16, g], 'rgba(236,231,220,.35)', 1.4);
    face(ctx, xa, ya, r, t / 6); face(ctx, xb, yb, r, (t / 6) * 1.12);
    label(ctx, 'Lower: runs slow', xa, g + 18, { align: 'center' }); label(ctx, 'Higher: runs fast', xb - r - 10, yb, { align: 'right', colour: ACCENT });
    say('Time itself runs slower lower down', 'Satellite clocks gain 45 millionths of a second a day from their height');
  },
};

// ---- 6. where it led
const hole = photoScene({
  src: '/img/learn/m87-black-hole-eht.jpg',
  caption: 'A real picture made from radio waves: the black hole at the centre of the galaxy M87, 55 million light years away, published in 2019. The orange is a colour chosen for the picture. Credit: EHT Collaboration, CC BY 4.0.',
  say: ['Predicted by the same equations', 'A black hole, pictured a century after the theory'],
  zoom: [0.8, 1.05], tag: 'Radio picture',
});

export const scenes: Scene[] = [sheet, liftScene, mercuryScene, eclipse, clocksScene, hole];
