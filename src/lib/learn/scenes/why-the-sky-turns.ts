/**
 * Pictures for the lesson "Why the sky turns". The photograph is real. The drawings show the Earth
 * turning under a fixed sky, the northern stars going round the pole star (the Plough, Cassiopeia and
 * Polaris are at their catalogued places), the sky from four latitudes, and why the stars come round
 * four minutes sooner than the Sun. They are drawings of the idea, and the last is far from to scale.
 */
import { type Scene, INK, SOFT, FAINT, ACCENT, clamp, ease, mix, label, stars, rng, nf } from '../stage';
import { TAU, photoScene, globe, sun, dot, line, ring } from '../kit';

const backdrop = stars(150, 23);
const RAD = Math.PI / 180;

export const lens = photoScene({
  src: '/img/learn/star-trails-paranal-eso.jpg',
  caption: 'A real photograph: the stars over ESO’s Paranal Observatory in Chile, with the shutter held open for 30 minutes. Credit: ESO/F. Char, CC BY 4.0.',
  say: ['', ''], hero: true, cover: true, zoom: [1, 1.08], focus: [0.47, 0.4],
});

// ---- 1. the whole sky moves
const trails = photoScene({
  src: '/img/learn/star-trails-paranal-eso.jpg',
  caption: 'A real photograph: half an hour of the night sky over Paranal in Chile. Each streak is one star, drawn out as the Earth turned. Credit: ESO/F. Char, CC BY 4.0. The mark was added here.',
  say: ['Thirty minutes of starlight', 'Every star has moved, and all by the same angle'],
  zoom: [1, 1.06], focus: [0.47, 0.42],
  pointers: [{ at: [0.475, 0.385], to: [0.72, 0.14], text: 'The one point that stays still' }],
});

// ---- 2. it is you that moves
const turnScene: Scene = {
  caption: 'The Earth seen from above its north pole, turning from west to east and carrying one person round with it, from day into night and back. A drawing, not to scale: the speeds are my own sums from the Earth’s size and the length of its day.',
  stillAt: 2,
  draw({ ctx, w, h, t, say }) {
    backdrop(ctx, w, h, 0.6);
    const s = Math.min(w, h), cx = w * 0.46, cy = h * 0.46, R = s * 0.24, a = -t * 0.5 + 0.6;
    // sunlight from the right
    for (let i = 0; i < 5; i++) { const y = cy + (i - 2) * R * 0.5; line(ctx, [w * 0.98, y, w * 0.98 - s * 0.09, y], 'rgba(255,214,140,.45)'); line(ctx, [w * 0.98 - s * 0.09, y, w * 0.98 - s * 0.075, y - 4], 'rgba(255,214,140,.45)'); line(ctx, [w * 0.98 - s * 0.09, y, w * 0.98 - s * 0.075, y + 4], 'rgba(255,214,140,.45)'); }
    label(ctx, 'Sunlight', w * 0.98, cy - R * 1.25, { align: 'right', colour: FAINT });
    // the globe: day side to the right
    dot(ctx, cx, cy, R, '#1b2a40');
    ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, R, -Math.PI / 2, Math.PI / 2); ctx.closePath(); ctx.fillStyle = '#5d7ea6'; ctx.fill(); ctx.restore();
    // lines of longitude turning with it
    for (let i = 0; i < 6; i++) { const b = a + (i * TAU) / 6; line(ctx, [cx, cy, cx + Math.cos(b) * R, cy + Math.sin(b) * R], 'rgba(236,231,220,.14)'); }
    dot(ctx, cx, cy, 2.5, INK); label(ctx, 'North Pole', cx + 8, cy + 12, { colour: SOFT });
    ring(ctx, cx, cy, R * 1.22, 'rgba(236,231,220,.18)', 1, [2, 5]);
    const ax = cx + Math.cos(a - 0.5) * R * 1.22, ay = cy + Math.sin(a - 0.5) * R * 1.22; line(ctx, [ax, ay, ax + Math.cos(a - 0.5 + 2.2) * 9, ay + Math.sin(a - 0.5 + 2.2) * 9], 'rgba(236,231,220,.5)'); line(ctx, [ax, ay, ax + Math.cos(a - 0.5 + 0.9) * 9, ay + Math.sin(a - 0.5 + 0.9) * 9], 'rgba(236,231,220,.5)');
    const px = cx + Math.cos(a) * R, py = cy + Math.sin(a) * R, day = Math.cos(a) > 0;
    dot(ctx, px, py, 5, ACCENT); label(ctx, 'You', px + Math.cos(a) * 16, py + Math.sin(a) * 16, { align: 'center', colour: ACCENT });
    say(day ? 'Turned towards the Sun: day' : 'Turned away from it: night', 'At the equator the ground moves at about 1,670 kilometres an hour');
  },
};

// ---- 3. round the pole star
const NORTH: { name?: string; set: [number, number][] }[] = [
  { name: 'The Plough', set: [[11.06, 61.75], [11.03, 56.38], [11.9, 53.69], [12.26, 57.03], [12.9, 55.96], [13.4, 54.93], [13.79, 49.31]] },
  { name: 'Cassiopeia', set: [[0.15, 59.15], [0.68, 56.54], [0.95, 60.72], [1.43, 60.24], [1.91, 63.67]] },
];
const POLARIS: [number, number] = [2.53, 89.26];
const field = (() => { const r = rng(5); return Array.from({ length: 150 }, () => ({ ra: r() * 24, far: 4 + r() * 110, s: 0.5 + r() * 1.1 })); })();
const poleScene: Scene = {
  caption: 'Looking north from the latitude of Britain, with the hours running fast. The Plough, Cassiopeia and the pole star are at their real places, and the fainter stars are made up. Stars inside the dashed circle never set. A drawing: a flat picture of a curved sky stretches things near the horizon.',
  stillAt: 0,
  draw({ ctx, w, h, t, say }) {
    const lat = 53, hy = h * 0.9, py = h * 0.47, cx = w / 2, k = (hy - py) / lat, hours = t * 0.9, lst = (hours * 15 + 150) * RAD;
    const at = (ra: number, far: number): [number, number] => { const ha = lst - ra * 15 * RAD; return [cx - Math.sin(ha) * far * k, py - Math.cos(ha) * far * k]; };
    ctx.save(); ctx.beginPath(); ctx.rect(0, 0, w, hy); ctx.clip();
    for (const f of field) { const [x, y] = at(f.ra, f.far); dot(ctx, x, y, f.s, 'rgba(236,231,220,.55)'); }
    ring(ctx, cx, py, lat * k, 'rgba(236,231,220,.25)', 1, [3, 5]);
    for (const g of NORTH) {
      const pts = g.set.map(([ra, dec]) => at(ra, 90 - dec));
      ctx.beginPath(); pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.strokeStyle = 'rgba(233,196,138,.4)'; ctx.lineWidth = 1; ctx.stroke();
      for (const [x, y] of pts) dot(ctx, x, y, 2.2, INK);
      const mx = pts.reduce((n, p) => n + p[0], 0) / pts.length, my = pts.reduce((n, p) => n + p[1], 0) / pts.length;
      label(ctx, g.name!, mx, my + (my > py ? 22 : -22), { align: 'center', colour: SOFT });
    }
    const [qx, qy] = at(POLARIS[0], 90 - POLARIS[1]); sun(ctx, qx, qy, 3.4, 1, '255,240,210'); label(ctx, 'The pole star', qx + 10, qy - 10, { colour: ACCENT });
    ctx.restore();
    ctx.fillStyle = '#0b0b0c'; ctx.fillRect(0, hy, w, h - hy); line(ctx, [0, hy, w, hy], 'rgba(236,231,220,.35)');
    label(ctx, 'North', cx, hy + 14, { align: 'center', colour: FAINT }); label(ctx, 'West', w * 0.06, hy + 14, { colour: FAINT }); label(ctx, 'East', w * 0.94, hy + 14, { align: 'right', colour: FAINT });
    say(`${nf(Math.floor(hours % 24))} hours gone`, 'The Plough goes right round the pole star and never sets');
  },
};

// ---- 4. from where you stand
const PLACES: [string, number, string][] = [['The North Pole', 90, 'The pole star is overhead, and no star rises or sets'], ['Edinburgh', 56, 'The pole star is 56 degrees up'], ['Cairo', 30, 'The pole star is 30 degrees up'], ['The equator', 0, 'The pole star is on the horizon, and every star rises straight up']];
const domeScene: Scene = {
  caption: 'The dome of the sky seen from the side, with north on the right, from four places. The slanting line points to the pole of the sky, and each dot is a star going round it. The height of the pole in degrees equals the latitude. A drawing of the geometry.',
  stillAt: 6.5,
  draw({ ctx, w, h, t, say }) {
    const per = 5, n = Math.floor(t / per) % PLACES.length, x = t % per, from = PLACES[(n + PLACES.length - 1) % PLACES.length][1], lat = mix(t < per ? PLACES[0][1] : from, PLACES[n][1], ease(x / 1.4));
    const cx = w / 2, hy = h * 0.8, R = Math.min(w * 0.42, h * 0.62), a = lat * RAD, ux = Math.cos(a), uy = -Math.sin(a);
    const sky = ctx.createLinearGradient(0, hy - R, 0, hy); sky.addColorStop(0, 'rgba(40,52,80,.5)'); sky.addColorStop(1, 'rgba(20,24,34,.2)');
    ctx.beginPath(); ctx.arc(cx, hy, R, Math.PI, TAU); ctx.closePath(); ctx.fillStyle = sky; ctx.fill(); ctx.strokeStyle = 'rgba(236,231,220,.3)'; ctx.lineWidth = 1; ctx.stroke();
    // the paths of the stars: straight lines across the axis in this side view
    ctx.save(); ctx.beginPath(); ctx.arc(cx, hy, R, Math.PI, TAU); ctx.closePath(); ctx.clip();
    for (let i = -4; i <= 4; i++) {
      const d = (i / 5) * R, half = Math.sqrt(R * R - d * d), mx = cx + ux * d, my = hy + uy * d;
      line(ctx, [mx - uy * half, my + ux * half, mx + uy * half, my - ux * half], 'rgba(236,231,220,.16)');
      const q = Math.cos(t * 0.7 + i * 1.3) * half; dot(ctx, mx + uy * q, my - ux * q, 2.2, INK);
    }
    ctx.restore();
    line(ctx, [cx, hy, cx + ux * R * 1.08, hy + uy * R * 1.08], ACCENT, 1.4); sun(ctx, cx + ux * R, hy + uy * R, 3, 1, '255,240,210');
    if (lat > 3) { ctx.beginPath(); ctx.arc(cx, hy, R * 0.22, -a, 0); ctx.strokeStyle = 'rgba(233,196,138,.6)'; ctx.stroke(); }
    label(ctx, `${nf(lat)}°`, cx + Math.cos(a / 2) * R * 0.3, hy - Math.sin(a / 2) * R * 0.3 - 2, { colour: ACCENT });
    line(ctx, [cx - R * 1.15, hy, cx + R * 1.15, hy], 'rgba(236,231,220,.4)'); dot(ctx, cx, hy, 3, INK);
    label(ctx, 'North', cx + R * 1.15, hy + 14, { align: 'right', colour: FAINT }); label(ctx, 'South', cx - R * 1.15, hy + 14, { colour: FAINT }); label(ctx, 'You', cx, hy + 14, { align: 'center', colour: SOFT });
    say(PLACES[n][0], PLACES[n][2]);
  },
};

// ---- 5. four minutes
const fourScene: Scene = {
  caption: 'Why the stars come round sooner than the Sun. In one full turn the Earth also moves along its orbit, so it has to turn a little more to face the Sun again. A drawing, hugely out of scale: the real move is about one degree a day, and the extra turn takes nearly four minutes.',
  stillAt: 7.5,
  draw({ ctx, w, h, t, say }) {
    backdrop(ctx, w, h, 0.5);
    const s = Math.min(w, h), loop = 11, x = t % loop, go = ease((x - 1) / 3.5), more = ease((x - 5.5) / 1.8), step = 0.5;
    const sx = w * 0.5, sy = h * 0.82, Ro = Math.min(h * 0.55, w * 0.42), f = Math.PI / 2 + step / 2 - go * step; // angle of the Earth round the Sun
    ctx.beginPath(); ctx.arc(sx, sy, Ro, Math.PI * 1.12, Math.PI * 1.88); ctx.strokeStyle = 'rgba(236,231,220,.2)'; ctx.setLineDash([2, 5]); ctx.stroke(); ctx.setLineDash([]);
    sun(ctx, sx, sy, s * 0.05); label(ctx, 'The Sun', sx, sy + s * 0.05 + 14, { align: 'center' });
    const ex = sx + Math.cos(f) * Ro, ey = sy - Math.sin(f) * Ro, r = s * 0.045;
    // the direction the marked place faces: one whole turn against the stars, then a little more
    const start = Math.PI / 2 + step / 2 + Math.PI, face = start + go * TAU - more * step;
    globe(ctx, ex, ey, r);
    line(ctx, [ex, ey, ex + Math.cos(face) * r * 2.6, ey - Math.sin(face) * r * 2.6], ACCENT, 1.6); dot(ctx, ex + Math.cos(face) * r, ey - Math.sin(face) * r, 3, ACCENT);
    // the far star is the same way from everywhere on the orbit
    if (go >= 1) { line(ctx, [ex, ey, ex + Math.cos(start) * r * 5, ey - Math.sin(start) * r * 5], 'rgba(236,231,220,.4)', 1, [3, 4]); label(ctx, 'To the same far star', ex + Math.cos(start) * r * 5 + (w > 520 ? 8 : -4), ey - Math.sin(start) * r * 5 + 14, { align: w > 520 ? 'left' : 'right', colour: SOFT }); }
    line(ctx, [ex, ey, sx, sy], 'rgba(255,214,140,.22)');
    say(go < 1 ? 'One full turn against the stars' : more < 1 ? 'The stars are back, but the Sun is not' : 'A little more turning brings the Sun back', go < 1 ? '23 hours and 56 minutes' : more < 1 ? 'The Earth has moved along its orbit' : 'Nearly four minutes more: 24 hours');
  },
};

// ---- the two still points (shown third)
const south = photoScene({
  src: '/img/learn/star-trails-paranal-eso.jpg',
  caption: 'The same real photograph, closer in. This is the south pole of the sky, and there is no bright star at the middle of the rings. Credit: ESO/F. Char, CC BY 4.0. The marks were added here.',
  say: ['One of the two still points: the southern pole of the sky', 'No bright star marks this one. The northern one has Polaris'],
  zoom: [1.5, 1.7], focus: [0.47, 0.4],
  pointers: [{ at: [0.17, 0.2], to: [0.3, 0.07], text: 'A neighbouring galaxy' }],
});

export const scenes: Scene[] = [trails, turnScene, south, poleScene, domeScene, fourScene];
