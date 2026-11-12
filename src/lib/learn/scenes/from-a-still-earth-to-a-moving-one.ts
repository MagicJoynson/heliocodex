/**
 * Pictures for the lesson "From a still Earth to a moving one". Two are real photographs, one of
 * the sky and one of a page printed in 1610. The other four are moving drawings: two diagrams,
 * and two that are to scale.
 */
import { type Scene, SOFT, ACCENT, clamp, ease, label, stars } from '../stage';
import { TAU, photoScene, sun, dot, line } from '../kit';

const backdrop = stars(90, 1543);
const ECLIPSE = 'Seven real photographs set side by side: the Moon passing into the Earth’s shadow on 14 March 2025, seen from New Orleans. The edge of the shadow is curved, as only the shadow of a ball always is. In the last two the Moon is wholly in shadow and lit red by sunlight bent through the Earth’s air. Credit: NASA/Eric Bordelon.';

export const lens = photoScene({ src: '/img/learn/lunar-eclipse-sequence-2025.jpg', caption: ECLIPSE, say: ['', ''], hero: true, zoom: [1, 1.3], focus: [0.7, 0.5] });

const shadow = photoScene({
  src: '/img/learn/lunar-eclipse-sequence-2025.jpg',
  caption: ECLIPSE,
  say: ['The Earth’s shadow on the Moon', 'Its edge is always curved'], zoom: [1, 1.5], focus: [0.6, 0.5],
});

// ---- 2. a circle riding on a circle
const wheels: Scene = {
  caption: 'A diagram of the old explanation, not to scale. The Earth is still, in the middle. The planet goes round a small circle while the centre of that circle goes round a large one. The trail shows the path that results, with a backward loop each time the planet swings inward.',
  stillAt: 9,
  draw({ ctx, w, h, t, say }) {
    backdrop(ctx, w, h, 0.3);
    const cx = w / 2, cy = h * 0.4, R = Math.min(w * 0.3, h * 0.25), r = R * 0.36, sp = 0.35, K = 6;
    const at = (tt: number): [number, number, number, number] => { const a = tt * sp, x0 = cx + Math.cos(a) * R, y0 = cy + Math.sin(a) * R; return [x0 + Math.cos(a * K) * r, y0 + Math.sin(a * K) * r, x0, y0]; };
    ctx.strokeStyle = 'rgba(236,231,220,.22)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(cx, cy, R, 0, TAU); ctx.stroke();
    ctx.strokeStyle = ACCENT; ctx.lineWidth = 1.4; ctx.beginPath();
    for (let i = 0; i <= 260; i++) { const [x, y] = at(Math.max(0, t - 15) + (Math.min(t, 15) * i) / 260); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
    ctx.stroke();
    const [px, py, ex, ey] = at(t);
    ctx.strokeStyle = 'rgba(236,231,220,.45)'; ctx.beginPath(); ctx.arc(ex, ey, r, 0, TAU); ctx.stroke();
    line(ctx, [cx, cy, ex, ey, px, py], 'rgba(236,231,220,.3)');
    dot(ctx, cx, cy, 5, '#5f8fc4'); dot(ctx, px, py, 3.5, '#fff');
    label(ctx, 'The Earth, still', cx, cy - 16, { align: 'center', colour: SOFT });
    label(ctx, 'The planet', px + 10, py - 12, { align: 'left', colour: '#fff' });
    say('Circles upon circles', 'Ptolemy’s answer to the backward loops, about AD 150');
  },
};

// ---- 3. the Earth overtakes Mars
const overtake: Scene = {
  caption: 'A drawing with the two orbits to scale and the stars brought in close. The Sun is in the middle, the Earth is on the inner path and Mars on the outer. The line runs from the Earth through Mars to where Mars appears among the stars. As the faster Earth passes, that point runs backwards for a while, then forwards again.',
  stillAt: 7,
  draw({ ctx, w, h, t, say }) {
    backdrop(ctx, w, h, 0.3);
    const cx = w / 2, cy = h * 0.6, r1 = Math.min(w * 0.2, h * 0.15), r2 = r1 * 1.52, sky = h * 0.13;
    const T = 12, tau = ((t % T) / T - 0.5) * 0.56; // years either side of the overtaking
    const pos = (ty: number): [number, number, number, number] => { const a = -Math.PI / 2 + TAU * ty, b = -Math.PI / 2 + (TAU * ty) / 1.88; return [cx + Math.cos(a) * r1, cy + Math.sin(a) * r1, cx + Math.cos(b) * r2, cy + Math.sin(b) * r2]; };
    const seen = (ty: number): number => { const [ex, ey, mx, my] = pos(ty); return ex + ((sky - ey) * (mx - ex)) / (my - ey); };
    ctx.strokeStyle = 'rgba(236,231,220,.2)'; ctx.lineWidth = 1; for (const r of [r1, r2]) { ctx.beginPath(); ctx.arc(cx, cy, r, 0, TAU); ctx.stroke(); }
    sun(ctx, cx, cy, Math.max(5, r1 * 0.16));
    line(ctx, [w * 0.06, sky, w * 0.94, sky], 'rgba(236,231,220,.3)');
    // the trail among the stars, stepped down a little as time passes so the doubling back shows
    ctx.strokeStyle = ACCENT; ctx.lineWidth = 1.6; ctx.beginPath();
    for (let i = 0; i <= 80; i++) { const ty = -0.28 + ((tau + 0.28) * i) / 80, x = clamp(seen(ty), w * 0.06, w * 0.94), y = sky + 5 + ((ty + 0.28) / 0.56) * h * 0.13; i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
    ctx.stroke();
    const [ex, ey, mx, my] = pos(tau), sx = clamp(seen(tau), w * 0.06, w * 0.94);
    line(ctx, [ex, ey, sx, sky], 'rgba(236,231,220,.35)', 1, [3, 4]);
    dot(ctx, ex, ey, 4, '#5f8fc4'); dot(ctx, mx, my, 3.5, '#d9825b'); dot(ctx, sx, sky, 3, '#fff');
    label(ctx, 'Earth', ex + 8, ey + 4, { align: 'left', colour: SOFT }); label(ctx, 'Mars', mx + 8, my - 4, { align: 'left', colour: SOFT });
    label(ctx, 'Where Mars is seen among the stars', w * 0.06, sky - 11, { align: 'left', colour: SOFT, size: 11 });
    say('Copernicus, 1543: put the Sun in the middle', 'The loop is only the Earth overtaking');
  },
};

const jupiter = photoScene({
  src: '/img/learn/galileo-jupiter-moons-1610.jpg',
  caption: 'A real photograph of a page of Galileo’s book of March 1610, in Latin. In each small drawing the circle is Jupiter and the stars are its moons, as he saw them on one night. “Ori.” is east and “Occ.” is west. Public domain, by way of Wikimedia Commons.',
  say: ['January 1610: moons going round Jupiter', 'Not everything circles the Earth'], zoom: [1, 1.25], focus: [0.5, 0.3], tag: 'Printed page, 1610',
});

// ---- 5. the true shape of an orbit
const E = 0.0934;
const ellipse: Scene = {
  caption: 'A drawing to scale of the path of Mars. The solid line is the true path, an ellipse. The dotted line is a circle of the same size centred on the Sun, for comparison. The cross is the centre of the ellipse: the Sun is to one side of it. The planet is shown speeding up as it nears the Sun, as it really does.',
  stillAt: 4,
  draw({ ctx, w, h, t, say }) {
    backdrop(ctx, w, h, 0.3);
    const a = Math.min(w * 0.3, h * 0.3), b = a * Math.sqrt(1 - E * E), cx = w / 2, cy = h * 0.4, sx = cx - a * E;
    ctx.strokeStyle = 'rgba(236,231,220,.35)'; ctx.setLineDash([2, 5]); ctx.beginPath(); ctx.arc(sx, cy, a, 0, TAU); ctx.stroke(); ctx.setLineDash([]);
    ctx.strokeStyle = ACCENT; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.ellipse(cx, cy, a, b, 0, 0, TAU); ctx.stroke();
    line(ctx, [cx - 4, cy, cx + 4, cy], SOFT); line(ctx, [cx, cy - 4, cx, cy + 4], SOFT);
    sun(ctx, sx, cy, Math.max(5, a * 0.07));
    // Kepler's equation, solved by a few rounds of correction
    const M = (t * 0.7) % TAU; let Ea = M; for (let i = 0; i < 5; i++) Ea = M + E * Math.sin(Ea);
    const px = cx - a * Math.cos(Ea), py = cy - b * Math.sin(Ea);
    line(ctx, [sx, cy, px, py], 'rgba(236,231,220,.3)'); dot(ctx, px, py, 3.5, '#d9825b');
    if (w > 560) { label(ctx, 'Nearest: fastest', cx - a - 8, cy, { align: 'right', colour: SOFT }); label(ctx, 'Furthest: slowest', cx + a + 8, cy, { align: 'left', colour: SOFT }); }
    else {
      label(ctx, 'Nearest:', cx - a - 7, cy - 8, { align: 'right', colour: SOFT, size: 11 }); label(ctx, 'fastest', cx - a - 7, cy + 7, { align: 'right', colour: SOFT, size: 11 });
      label(ctx, 'Furthest:', cx + a + 7, cy - 8, { align: 'left', colour: SOFT, size: 11 }); label(ctx, 'slowest', cx + a + 7, cy + 7, { align: 'left', colour: SOFT, size: 11 });
    }
    say('Kepler, 1609: not a circle', 'An ellipse, with the Sun to one side');
  },
};

// ---- 6. the apple and the Moon
const fall: Scene = {
  caption: 'A drawing, with the two falls not to the same scale. In one second an apple near the ground falls 4.9 metres. In the same second the Moon, sixty times further from the centre of the Earth, falls 1.4 millimetres towards it: 3,600 times less. The numbers are worked out here.',
  stillAt: 5,
  draw({ ctx, w, h, t, say }) {
    backdrop(ctx, w, h, 0.3);
    const k = ease(clamp((t % 6) / 2.2, 0, 1)), top = h * 0.14, drop = h * 0.5, xa = w * 0.27, xm = w * 0.7;
    line(ctx, [xa - 40, top + drop + 8, xa + 40, top + drop + 8], 'rgba(236,231,220,.5)');
    line(ctx, [xa, top, xa, top + drop * k * k], 'rgba(233,196,138,.5)', 1, [3, 4]);
    dot(ctx, xa, top + drop * k * k, 6, '#c8553d');
    label(ctx, 'An apple', xa, top - 16, { align: 'center', colour: '#fff' });
    label(ctx, '4.9 metres', xa + 14, top + drop * 0.5, { align: 'left', colour: ACCENT });
    // the Moon: a straight path, and the bend away from it
    const L = Math.min(w * 0.4, 220), bend = 16 * k * k;
    line(ctx, [xm - L / 2, top + 20, xm + L / 2, top + 20], 'rgba(236,231,220,.3)', 1, [3, 4]);
    ctx.strokeStyle = ACCENT; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(xm - L / 2, top + 20); ctx.quadraticCurveTo(xm - L / 2 + (L * k) / 2, top + 20, xm - L / 2 + L * k, top + 20 + bend); ctx.stroke();
    dot(ctx, xm - L / 2 + L * k, top + 20 + bend, 7, '#cfcabd');
    label(ctx, 'The Moon', xm, top - 16, { align: 'center', colour: '#fff' });
    label(ctx, 'Straight on, if nothing pulled', xm, top + 6, { align: 'center', colour: SOFT, size: 11 });
    if (k >= 1) { label(ctx, '1.4 millimetres', xm, top + 62, { align: 'center', colour: ACCENT }); label(ctx, 'towards the Earth', xm, top + 78, { align: 'center', colour: SOFT }); }
    say('Newton, 1687: one pull for both', 'The Moon is falling too, 3,600 times more gently');
  },
};

export const scenes: Scene[] = [shadow, wheels, overtake, jupiter, ellipse, fall];
