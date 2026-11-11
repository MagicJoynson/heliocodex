/**
 * Pictures for the lesson "Falling into a black hole". The first is a real radio picture and the
 * second a frame from a NASA computer simulation. The rest are diagrams of what NASA's 2024
 * calculation describes, and none of them is to scale.
 */
import { type Scene, SOFT, ACCENT, clamp, ease, mix, label, stars } from '../stage';
import { TAU, photoScene, dot, line } from '../kit';

const backdrop = stars(110, 733);
const SIM = 'A computer simulation, not a photograph: a black hole and its disc of hot gas as general relativity says they would look, worked out at NASA in 2019. The colours were chosen. Credit: NASA’s Goddard Space Flight Center/Jeremy Schnittman.';

export const lens = photoScene({ src: '/img/learn/black-hole-disc-simulation-nasa.jpg', caption: SIM, say: ['', ''], hero: true, cover: true, zoom: [1, 1.12], focus: [0.42, 0.5] });

const ours = photoScene({
  src: '/img/learn/sagittarius-a-star-eht.jpg',
  caption: 'A real picture made from radio waves: Sagittarius A*, the black hole at the centre of our galaxy, published on 12 May 2022. The orange is a colour chosen for the picture. Credit: EHT Collaboration, CC BY 4.0.',
  say: ['The real thing', '4.3 million Suns, and the place this fall is aimed at'], zoom: [0.85, 1], focus: [0.5, 0.5], tag: 'Radio picture',
});

const approach = photoScene({
  src: '/img/learn/black-hole-disc-simulation-nasa.jpg', caption: SIM, tag: 'Computer simulation',
  say: ['The view on the way in', 'Only the gas shines, and its light is bent right round the hole'], zoom: [0.95, 1.1], focus: [0.42, 0.5],
  pointers: [{ at: [0.31, 0.44], to: [0.12, 0.1], text: 'Ring of bent light', align: 'left' }, { at: [0.6, 0.62], to: [0.86, 0.9], text: 'Hot gas', align: 'right' }],
});

function hole(ctx: CanvasRenderingContext2D, x: number, y: number, r: number) {
  const g = ctx.createRadialGradient(x, y, r, x, y, r * 1.5); g.addColorStop(0, 'rgba(233,160,90,.55)'); g.addColorStop(1, 'rgba(233,160,90,0)');
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r * 1.5, 0, TAU); ctx.fill();
  ctx.fillStyle = '#000'; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill();
  ctx.strokeStyle = 'rgba(233,196,138,.9)'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.stroke();
}

// ---- 3. the fall
const fall: Scene = {
  caption: 'A diagram, not to scale, of the path in NASA’s calculation: nearly twice round, then across the edge. Nothing marks the edge for the one who is falling.',
  stillAt: 9,
  draw({ ctx, w, h, t, say }) {
    backdrop(ctx, w, h, 0.4);
    const cx = w / 2, cy = h * 0.43, R = Math.min(w * 0.4, h * 0.36), rh = R * 0.16, k = clamp(t / 8, 0, 1);
    hole(ctx, cx, cy, rh);
    const at = (u: number): [number, number] => { const r = mix(R, rh * 0.5, u ** 1.6), a = -0.6 + u * TAU * 2.1; return [cx + Math.cos(a) * r, cy + Math.sin(a) * r * 0.8]; };
    ctx.strokeStyle = 'rgba(236,231,220,.55)'; ctx.lineWidth = 1.2; ctx.beginPath();
    for (let i = 0; i <= 160; i++) { const u = (i / 160) * k, [x, y] = at(u); if (Math.hypot(x - cx, y - cy) < rh) break; i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
    ctx.stroke();
    const [px, py] = at(k), inside = Math.hypot(px - cx, py - cy) < rh;
    if (!inside) dot(ctx, px, py, 4, '#fff');
    label(ctx, 'The edge is the bright circle', cx, cy + R * 0.8 + 22, { align: 'center', colour: ACCENT });
    label(ctx, 'Start: 640 million km out', cx + R, cy - R * 0.8 - 10, { align: 'right', colour: SOFT });
    say(inside ? 'Across, with no sign of it' : 'About three hours to the edge', 'From there every direction leads inward');
  },
};

function face(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, turn: number, colour: string) {
  ctx.strokeStyle = 'rgba(236,231,220,.7)'; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.stroke();
  for (let i = 0; i < 12; i++) { const a = (i / 12) * TAU; line(ctx, [x + Math.cos(a) * r * 0.86, y + Math.sin(a) * r * 0.86, x + Math.cos(a) * r * 0.96, y + Math.sin(a) * r * 0.96], 'rgba(236,231,220,.45)'); }
  const a = turn * TAU - TAU / 4; line(ctx, [x, y, x + Math.cos(a) * r * 0.8, y + Math.sin(a) * r * 0.8], colour, 2); dot(ctx, x, y, 2.5, colour);
}

// ---- 4. two clocks
const clocks: Scene = {
  caption: 'A diagram. Both clocks are the same clock: on the left as the faller reads it, on the right as a far-off friend sees it through a telescope. The friend sees it slow towards a stop and never sees the crossing.',
  draw({ ctx, w, h, t, say }) {
    backdrop(ctx, w, h, 0.35);
    const r = Math.min(w * 0.17, h * 0.24), y = h * 0.4, x1 = w * 0.28, x2 = w * 0.72, T = t % 14;
    const own = T / 4, seen = 1.6 * (1 - Math.exp(-T / 3.2)) / 1; // the seen clock creeps towards a fixed reading
    face(ctx, x1, y, r, own, '#fff'); face(ctx, x2, y, r, seen * 0.55, ACCENT);
    label(ctx, 'Your own clock', x1, y + r + 22, { align: 'center' }); label(ctx, 'Keeps going', x1, y + r + 38, { align: 'center', colour: SOFT });
    label(ctx, 'As your friend sees it', x2, y + r + 22, { align: 'center', colour: ACCENT }); label(ctx, T > 9 ? 'Almost stopped' : 'Slowing', x2, y + r + 38, { align: 'center', colour: SOFT });
    say('One fall, two stories', 'From far away you seem to freeze just outside the edge');
  },
};

// ---- 5. pulled into a thread
const stretch: Scene = {
  caption: 'A diagram, not to scale. The pull is stronger on the nearer end of a falling body than on the farther end, so the body is drawn out long and squeezed thin.',
  stillAt: 7,
  draw({ ctx, w, h, t, say }) {
    backdrop(ctx, w, h, 0.35);
    const k = ease(clamp((t % 10) / 7, 0, 1)), cy = h * 0.42, hx = w * 0.9, rh = Math.min(w, h) * 0.2;
    hole(ctx, hx + rh * 0.4, cy, rh);
    const mid = mix(w * 0.16, w * 0.42, k), len = mix(26, Math.min(w * 0.36, 280), k ** 1.5), thick = mix(26, 3, k ** 0.8);
    ctx.fillStyle = 'rgba(236,231,220,.9)'; ctx.beginPath(); ctx.ellipse(mid, cy, len / 2, thick / 2, 0, 0, TAU); ctx.fill();
    const ax = mid + len / 2 + 8, bx = mid - len / 2 - 8;
    line(ctx, [ax, cy - 22, ax + 34, cy - 22], ACCENT, 2.2); line(ctx, [ax + 34, cy - 22, ax + 27, cy - 27], ACCENT, 2.2); line(ctx, [ax + 34, cy - 22, ax + 27, cy - 17], ACCENT, 2.2);
    line(ctx, [bx + 8, cy - 22, bx + 22, cy - 22], SOFT, 1.6); line(ctx, [bx + 22, cy - 22, bx + 17, cy - 26], SOFT, 1.6); line(ctx, [bx + 22, cy - 22, bx + 17, cy - 18], SOFT, 1.6);
    label(ctx, 'Strong pull', ax + 4, cy - 34, { align: 'left', colour: ACCENT }); label(ctx, 'Weaker', bx + 8, cy - 34, { align: 'left', colour: SOFT });
    say('Stretched one way, squeezed the other', 'In NASA’s fall, 12.8 seconds after crossing the edge');
  },
};

// ---- 6. the fly-by
const flyby: Scene = {
  caption: 'A diagram of NASA’s second journey: close round the black hole and away again. The two clocks agreed at the start. At the end the traveller’s is 36 minutes behind.',
  stillAt: 9,
  draw({ ctx, w, h, t, say }) {
    backdrop(ctx, w, h, 0.35);
    const wide = w > 560, k = clamp(t / 8, 0, 1), cx = wide ? w * 0.3 : w * 0.5, cy = wide ? h * 0.42 : h * 0.24, R = wide ? Math.min(w * 0.22, h * 0.34) : Math.min(w * 0.3, h * 0.2), rh = R * 0.2;
    hole(ctx, cx, cy, rh);
    const at = (u: number): [number, number] => { const s = Math.sin(u * Math.PI), r = mix(R, rh * 1.5, s ** 0.7), a = -2.2 + u * TAU * 2.2; return [cx + Math.cos(a) * r, cy + Math.sin(a) * r * 0.8]; };
    ctx.strokeStyle = 'rgba(236,231,220,.5)'; ctx.lineWidth = 1.2; ctx.beginPath();
    for (let i = 0; i <= 200; i++) { const [x, y] = at((i / 200) * k); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
    ctx.stroke(); const [px, py] = at(k); dot(ctx, px, py, 4, '#fff');
    const r = wide ? Math.min(w * 0.075, h * 0.13) : Math.min(w * 0.13, h * 0.11), y = wide ? h * 0.4 : h * 0.62, xa = wide ? w * 0.66 : w * 0.3, xb = wide ? w * 0.87 : w * 0.7;
    face(ctx, xa, y, r, k * 6, '#fff'); face(ctx, xb, y, r, k * 5.4, ACCENT);
    label(ctx, 'Stayed behind', xa, y + r + 20, { align: 'center' }); label(ctx, 'Went round', xb, y + r + 20, { align: 'center', colour: ACCENT });
    if (k >= 1) label(ctx, '36 minutes behind', xb, y + r + 36, { align: 'center', colour: SOFT });
    say('Round and home again', 'Six hours away, and 36 minutes younger than her friends');
  },
};

export const scenes: Scene[] = [ours, approach, fall, clocks, stretch, flyby];
