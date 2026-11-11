/**
 * Pictures for the lesson "Things that hit the Earth". The photographs are real, and the map of the
 * Yucatán is real measurements shown in made-up colours. The ladder of sizes, the burst over a town,
 * the swarm of near-Earth objects and the changed orbit are drawings of the idea, not to scale.
 */
import { type Scene, SOFT, ACCENT, clamp, ease, mix, label, stars, rng } from '../stage';
import { TAU, photoScene, globe, sun, dot, line, ring } from '../kit';

const backdrop = stars(130, 47);
const APL = 'Credit: NASA/Johns Hopkins APL.';

export const lens = photoScene({
  src: '/img/learn/dimorphos-dart-11-seconds.jpg',
  caption: `A real photograph: the asteroid Dimorphos, 160 metres long, from the DART spacecraft eleven seconds before it crashed into it on 26 September 2022. ${APL}`,
  say: ['', ''], hero: true, zoom: [1, 1.1], focus: [0.5, 0.5],
});

// ---- 1. a hole in Arizona
const crater = photoScene({
  src: '/img/learn/meteor-crater-from-iss.jpg',
  caption: 'A real photograph: Meteor Crater in Arizona, taken from the International Space Station on 26 January 2026, about 420 km up. Credit: NASA. The mark was added here.',
  say: ['A hole 1.2 kilometres wide', 'Made about 50,000 years ago by something 30 to 50 metres across'],
  cover: true, zoom: [1.05, 1.6], focus: [0.51, 0.49],
  pointers: [{ at: [0.53, 0.47], to: [0.66, 0.3], text: 'Meteor Crater' }],
});

// ---- 2. the buried one
const yucatan = photoScene({
  src: '/img/learn/chicxulub-yucatan-heights.jpg',
  caption: 'Not a photograph: a map of the height of the land in the north of Mexico’s Yucatán Peninsula, measured by radar from the Space Shuttle in February 2000. The colours show height, green lowest. The faint dark arc is the buried edge of the Chicxulub crater. Credit: NASA/JPL. The mark was added here.',
  say: ['The edge of a crater 180 kilometres wide', 'About 65 million years old, and almost rubbed out'],
  zoom: [0.96, 1.03], tag: 'Radar map',
  pointers: [{ at: [0.36, 0.41], to: [0.3, 0.16], text: 'The edge of the crater', align: 'left' }],
});

// ---- 3. how often
const LADDER: [string, number, string, string][] = [
  ['10 m', 3, 'once in 10 years', 'a fireball and a bang'],
  ['50 m', 6, 'once in 1,000 years', 'a crater like Arizona’s'],
  ['140 m', 10, 'once in 20,000 years', 'a crater 1 to 2 km wide'],
  ['1 km', 16, 'once in 700,000 years', 'a crater 10 km wide'],
  ['10 km', 26, 'once in 100 million years', 'changes the whole world'],
];
const ladderScene: Scene = {
  caption: 'How often an object of each size arrives, on average, from NASA’s figures. A drawing: the dots only hint at the sizes. Drawn truly, the last would be a thousand times as wide as the first.',
  stillAt: 9,
  draw({ ctx, w, h, t, say }) {
    backdrop(ctx, w, h, 0.4);
    const wide = w > 560, shown = clamp(t / 6) * LADDER.length, x0 = wide ? w * 0.22 : w * 0.12, y0 = h * 0.08, step = (h * (wide ? 0.68 : 0.72)) / LADDER.length;
    LADDER.forEach(([size, r, often, what], i) => {
      const k = clamp(shown - i); if (k <= 0) return;
      ctx.globalAlpha = k;
      const y = y0 + step * (i + 0.5), rr = Math.min(r * (wide ? 1.5 : 0.7), step * 0.44);
      dot(ctx, x0, y, rr, i === 4 ? '#c98a5a' : '#9a958b'); ring(ctx, x0, y, rr, 'rgba(236,231,220,.35)');
      const tx = x0 + (wide ? 60 : 30);
      if (wide) { label(ctx, size, tx, y - 9, { align: 'left', colour: ACCENT, size: 14 }); label(ctx, often, tx + 80, y - 9, { align: 'left', size: 14 }); label(ctx, what, tx, y + 11, { align: 'left', colour: SOFT, size: 12 }); }
      else { label(ctx, size, tx, y, { align: 'left', colour: ACCENT }); label(ctx, often, tx + 52, y, { align: 'left' }); }
      ctx.globalAlpha = 1;
    });
    say('The bigger, the rarer', shown < 4.5 ? 'Small ones come often and do little' : 'The very big ones are a hundred million years apart');
  },
};

// ---- 4. a burst over a town
const town = (() => { const r = rng(5); return Array.from({ length: 26 }, () => ({ w: 0.02 + r() * 0.03, h: 0.04 + r() * 0.1, lit: r() })); })();
const burstScene: Scene = {
  caption: 'What happened over Chelyabinsk on 15 February 2013: a rock the size of a house came in fast, burst in the air, and the blast reached the ground afterwards. A drawing of the idea, not to scale.',
  stillAt: 4.6,
  draw({ ctx, w, h, t, say }) {
    const loop = 11, x = t % loop, g = h * 0.74, fly = clamp(x / 3), bx = mix(-w * 0.05, w * 0.62, fly), by = mix(h * 0.02, h * 0.3, fly), flash = x > 3 ? Math.max(0, 1 - (x - 3) / 1.6) : 0;
    const sky = ctx.createLinearGradient(0, 0, 0, g); sky.addColorStop(0, `rgb(${Math.round(14 + flash * 120)},${Math.round(18 + flash * 115)},${Math.round(30 + flash * 100)})`); sky.addColorStop(1, `rgb(${Math.round(40 + flash * 150)},${Math.round(44 + flash * 130)},${Math.round(58 + flash * 90)})`);
    ctx.fillStyle = sky; ctx.fillRect(0, 0, w, g);
    const top = ctx.createLinearGradient(0, 0, 0, h * 0.2); top.addColorStop(0, 'rgba(11,11,12,1)'); top.addColorStop(1, 'rgba(11,11,12,0)'); ctx.fillStyle = top; ctx.fillRect(0, 0, w, h * 0.2);
    // the trail it leaves
    const tx = mix(-w * 0.05, w * 0.62, Math.min(fly, 1));
    const tr = ctx.createLinearGradient(-w * 0.05, 0, tx, 0); tr.addColorStop(0, 'rgba(255,255,255,0)'); tr.addColorStop(1, `rgba(255,240,215,${x < 3 ? 0.9 : Math.max(0.25, 0.9 - (x - 3) * 0.1)})`);
    ctx.strokeStyle = tr; ctx.lineWidth = x < 3 ? 2 : 3.5; ctx.beginPath(); ctx.moveTo(-w * 0.05, h * 0.02); ctx.lineTo(tx, mix(h * 0.02, h * 0.3, Math.min(fly, 1))); ctx.stroke();
    if (x < 3) sun(ctx, bx, by, 5, 1, '255,235,200'); else if (flash > 0) sun(ctx, bx, by, 14 + (1 - flash) * 40, flash, '255,245,225');
    // the blast spreading out
    const wave = (x - 3.2) / 3.4;
    if (wave > 0 && wave < 1.6) { ctx.strokeStyle = `rgba(255,255,255,${0.5 * (1 - wave / 1.6)})`; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(bx, by, wave * w * 0.5, 0, TAU); ctx.stroke(); }
    // the town
    ctx.fillStyle = '#0b0b0c'; ctx.fillRect(0, g, w, h - g);
    let px = 0; const hit = wave > 0 ? wave * w * 0.5 : 0;
    for (const b of town) {
      const bw = b.w * w, bh = b.h * h; ctx.fillStyle = '#16171b'; ctx.fillRect(px, g - bh, bw - 2, bh);
      const reached = hit > Math.hypot(px + bw / 2 - bx, g - by);
      ctx.fillStyle = reached ? 'rgba(232,163,61,.2)' : 'rgba(232,163,61,.75)';
      for (let yy = g - bh + 5; yy < g - 5; yy += 8) for (let xx = px + 4; xx < px + bw - 7; xx += 7) if ((Math.sin(xx * 12.9 + yy * 78.2) * 43758) % 1 < b.lit * 0.6 - 0.1 || b.lit > 0.7) ctx.fillRect(xx, yy, 3, 4);
      px += bw;
      if (px > w) break;
    }
    for (const [x0, x1] of [[0, w * 0.08], [w, w * 0.92]]) { const f = ctx.createLinearGradient(x0, 0, x1, 0); f.addColorStop(0, 'rgba(11,11,12,1)'); f.addColorStop(1, 'rgba(11,11,12,0)'); ctx.fillStyle = f; ctx.fillRect(Math.min(x0, x1), 0, w * 0.08, h); }
    say(x < 3 ? 'A rock the size of a house' : x < 5 ? 'It bursts in the air' : 'Then the blast arrives, and the windows go', 'Chelyabinsk, Russia, 15 February 2013');
  },
};

// ---- 5. the watch
const swarm = (() => { const r = rng(91), out = []; while (out.length < 420) { const a = 0.75 + r() * 1.7, e = r() * 0.65; if (a * (1 - e) < 1.3) out.push({ a, e, w: r() * TAU, m: r() * TAU, at: r() }); } return out; })();
const watchScene: Scene = {
  caption: 'The Sun, the Earth’s orbit, and a few hundred dots standing for the 43,238 near-Earth objects known on 11 November 2026. A drawing: the paths are made up to look like real ones, and nothing is to scale.',
  stillAt: 9,
  draw({ ctx, w, h, t, say }) {
    backdrop(ctx, w, h, 0.4);
    const cx = w / 2, cy = h * 0.46, au = Math.min(w, h) * 0.21, found = clamp(t / 8);
    sun(ctx, cx, cy, au * 0.09, 1);
    ring(ctx, cx, cy, au, 'rgba(120,170,230,.5)', 1.2);
    const ea = -t * 0.25; globe(ctx, cx + Math.cos(ea) * au, cy + Math.sin(ea) * au, 4.5);
    for (const s of swarm) {
      if (s.at > found) continue;
      const M = s.m - t * 0.25 * Math.pow(s.a, -1.5), v = M + 2 * s.e * Math.sin(M), r = (s.a * (1 - s.e * s.e)) / (1 + s.e * Math.cos(v));
      const px = cx + Math.cos(v + s.w) * r * au, py = cy + Math.sin(v + s.w) * r * au;
      if (px < 0 || px > w || py < 0 || py > h * 0.9) continue;
      dot(ctx, px, py, 1.1, 'rgba(236,231,220,.7)');
    }
    label(ctx, 'The Earth’s orbit', cx, cy + au + 14, { align: 'center', colour: SOFT });
    say(`${Math.round(found * 43238).toLocaleString('en-GB')} found`, 'Each one has a known path that can be worked out years ahead');
  },
};

// ---- 6. the target
const target = photoScene({
  src: '/img/learn/dimorphos-dart-11-seconds.jpg',
  caption: `A real photograph: Dimorphos from 68 km away, eleven seconds before DART hit it. It is the last picture that shows the whole asteroid, which is 160 metres long. ${APL}`,
  say: ['Eleven seconds to go', 'A heap of boulders 160 metres long, coming up at 22,500 km an hour'],
  zoom: [0.8, 1.25],
});

// ---- 7. the orbit that changed
const orbitScene: Scene = {
  caption: 'Dimorphos going round its larger companion Didymos, seen from above. The faint ghost shows where it would have been without the crash. A drawing of the idea, not to scale and enormously speeded up.',
  stillAt: 11,
  draw({ ctx, w, h, t, say }) {
    backdrop(ctx, w, h, 0.45);
    const s = Math.min(w, h), cx = w / 2, cy = h * 0.47, R0 = s * 0.36, R1 = R0 * 0.94, loop = 22, x = t % loop, hitAt = 3;
    const a0 = -0.9 - x * 0.5, after = Math.max(0, x - hitAt), a1 = -0.9 - Math.min(x, hitAt) * 0.5 - after * 0.5 * (715 / 683) * 1.12;
    ring(ctx, cx, cy, R0, 'rgba(236,231,220,.22)', 1, [3, 5]);
    dot(ctx, cx, cy, s * 0.07, '#8f8a80'); label(ctx, 'Didymos', cx, cy + s * 0.07 + 14, { align: 'center' });
    const k = ease(after / 2), R = mix(R0, R1, k);
    if (after > 0) { ring(ctx, cx, cy, R1, 'rgba(232,163,61,.5)', 1.2); dot(ctx, cx + Math.cos(a0) * R0, cy + Math.sin(a0) * R0, s * 0.016, 'rgba(236,231,220,.28)'); }
    const mx = cx + Math.cos(a1) * R, my = cy + Math.sin(a1) * R;
    // DART coming in head-on
    if (x < hitAt) { const ahead = a1 - (1 - x / hitAt) * 0.9, sx = cx + Math.cos(ahead) * R0, sy = cy + Math.sin(ahead) * R0; dot(ctx, sx, sy, 2, ACCENT); label(ctx, 'DART', sx, sy - 12, { align: 'center', colour: ACCENT }); }
    const flash = after > 0 ? Math.max(0, 1 - after / 1.2) : 0; if (flash > 0) sun(ctx, mx, my, s * 0.06, flash, '255,235,200');
    dot(ctx, mx, my, s * 0.016, '#c9c4b8'); label(ctx, 'Dimorphos', mx, my - s * 0.016 - 10, { align: 'center', colour: after > 0 ? ACCENT : undefined });
    say(after <= 0 ? 'Before: once round in 11 hours 55 minutes' : 'After: once round in 11 hours 23 minutes', after <= 0 ? 'DART comes in head-on' : 'A smaller, quicker orbit: it pulls ahead of where it would have been');
  },
};

export const scenes: Scene[] = [crater, yucatan, ladderScene, burstScene, watchScene, target, orbitScene];
