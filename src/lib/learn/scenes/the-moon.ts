/**
 * Pictures for the lesson "The Moon". The photographs are real. The Earth and the Moon in the second
 * scene are drawn to their true sizes and true distance, and the flash of light crosses in real time.
 * The collision and the turning Moon are drawings of the idea and are not to scale.
 */
import { type Scene, SOFT, ACCENT, clamp, ease, mix, label, stars, rng } from '../stage';
import { TAU, photoScene, globe, sun, dot, line, ring } from '../kit';

const backdrop = stars(140, 12);
const LRO = 'Credit: NASA/GSFC/Arizona State University.';

export const lens = photoScene({
  src: '/img/learn/moon-near-side-lro.jpg',
  caption: `A real photograph: the side of the Moon that faces the Earth, from about 1,300 pictures by NASA’s Lunar Reconnaissance Orbiter. ${LRO}`,
  say: ['', ''], hero: true, zoom: [1, 1.08], focus: [0.5, 0.5],
});

// ---- 1. the face we know
const near = photoScene({
  src: '/img/learn/moon-near-side-lro.jpg',
  caption: `A real photograph: the near side of the Moon, by NASA’s Lunar Reconnaissance Orbiter. ${LRO} The marks were added here.`,
  say: ['The face you can see from your garden', 'Dark seas of old lava, and bright ground crowded with craters'],
  zoom: [0.96, 1.04],
  pointers: [{ at: [0.3, 0.27], to: [0.14, 0.08], text: 'A sea of old lava', align: 'left' }, { at: [0.52, 0.8], to: [0.8, 0.93], text: 'Older, cratered ground' }],
});

// ---- 2. true sizes, true distance
const gapScene: Scene = {
  caption: 'The Earth and the Moon at their true sizes and their true distance apart. The flash is light crossing the gap at its real speed, which takes 1.28 seconds (my own sum from the distance and the speed of light). A drawing, to scale.',
  stillAt: 0.6,
  draw({ ctx, w, h, t, say }) {
    backdrop(ctx, w, h, 0.5);
    const x0 = w * 0.07, x1 = w * 0.93, y = h * 0.45, km = (x1 - x0) / 384400, re = Math.max(2, 6371 * km), rm = Math.max(1, 1738 * km);
    globe(ctx, x0, y, re); dot(ctx, x1, y, rm, '#b9b6ae');
    label(ctx, 'The Earth', x0, y + re + 16, { align: 'left' }); label(ctx, 'The Moon', x1, y + re + 16, { align: 'right' });
    // thirty Earths, side by side
    const show = clamp((t % 12) / 4);
    for (let i = 1; i < 30; i++) if (i / 30 < show) ring(ctx, x0 + i * re * 2, y, re, 'rgba(236,231,220,.16)');
    // light, out and back
    const trip = 1.28, p = (t % (trip * 2 + 1.4)) / trip, lx = p < 1 ? mix(x0, x1, p) : p < 2 ? mix(x1, x0, p - 1) : -99;
    if (lx > 0) { sun(ctx, lx, y - re - 12, 2.2, 1, '255,245,225'); line(ctx, [lx, y - re - 12, lx + (p < 1 ? -14 : 14), y - re - 12], 'rgba(255,245,225,.5)'); }
    line(ctx, [x0, h * 0.72, x1, h * 0.72], 'rgba(236,231,220,.25)'); line(ctx, [x0, h * 0.72 - 4, x0, h * 0.72 + 4], 'rgba(236,231,220,.4)'); line(ctx, [x1, h * 0.72 - 4, x1, h * 0.72 + 4], 'rgba(236,231,220,.4)');
    label(ctx, '384,400 kilometres', w / 2, h * 0.72 + 14, { align: 'center', colour: SOFT });
    say(show < 1 ? 'Thirty Earths would fit in the gap' : 'Light crosses it in a second and a quarter', 'Nearly every picture you have seen draws them far too close');
  },
};

// ---- 3. the collision
const bits = (() => { const r = rng(77); return Array.from({ length: 170 }, () => ({ a: r() * TAU, d: 0.5 + r() * 0.9, s: 0.7 + r() * 1.5, v: 0.6 + r() * 0.8 })); })();
const hitScene: Scene = {
  caption: 'How the Moon is thought to have formed: a body perhaps the size of Mars strikes the young Earth, the wreckage goes into orbit, and it gathers into the Moon. A drawing of the idea, not to scale and enormously speeded up.',
  stillAt: 7,
  draw({ ctx, w, h, t, say }) {
    backdrop(ctx, w, h, 0.5);
    const s = Math.min(w, h), cx = w * 0.46, cy = h * 0.47, R = s * 0.13, loop = 16, x = t % loop, come = clamp(x / 2.6), out = ease((x - 2.6) / 3), gather = ease((x - 7) / 5);
    // the young Earth, still hot
    const g = ctx.createRadialGradient(cx - R * 0.3, cy - R * 0.3, R * 0.1, cx, cy, R); g.addColorStop(0, x > 2.6 && x < 9 ? '#ffb070' : '#c98a5a'); g.addColorStop(1, '#5a2f22');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, R, 0, TAU); ctx.fill();
    if (come < 1) { const tx = mix(w * 1.02, cx + R * 1.3, come * come), ty = mix(h * 0.08, cy - R * 0.5, come * come); dot(ctx, tx, ty, R * 0.53, '#8a5a48'); label(ctx, 'Theia', tx, ty - R * 0.53 - 10, { align: 'center', colour: SOFT }); }
    else {
      const flash = 1 - clamp((x - 2.6) / 1.2); if (flash > 0) sun(ctx, cx + R * 0.9, cy - R * 0.35, R * 1.4, flash, '255,235,200');
      const mx = cx + Math.cos(-t * 0.25) * R * 3, my = cy + Math.sin(-t * 0.25) * R * 3 * 0.45;
      for (const b of bits) {
        const a = b.a - t * 0.35 * b.v, d = R * (1.15 + out * 1.9 * b.d), bx = cx + Math.cos(a) * d, by = cy + Math.sin(a) * d * 0.45;
        dot(ctx, mix(bx, mx, gather), mix(by, my, gather), b.s, `rgba(255,${Math.round(190 - 60 * b.d)},${Math.round(120 - 50 * b.d)},${0.85 * (1 - gather * 0.9)})`);
      }
      if (gather > 0.15) { dot(ctx, mx, my, R * 0.27 * gather, '#b9b6ae'); if (gather > 0.8) label(ctx, 'The Moon', mx, my - R * 0.27 - 10, { align: 'center', colour: ACCENT }); }
    }
    label(ctx, 'The young Earth', cx, cy + R + 16, { align: 'center' });
    say(come < 1 ? 'About 4.5 billion years ago' : gather <= 0 ? 'The wreckage goes into orbit' : 'It gathers into the Moon', come < 1 ? 'Something perhaps the size of Mars is on its way' : 'Moon rock is a very close match for Earth rock');
  },
};

// ---- 4. one face
const faceScene: Scene = {
  caption: 'The Moon going round the Earth, seen from above. It turns once for each trip round, so the marked side always faces us. A drawing, not to scale.',
  stillAt: 2,
  draw({ ctx, w, h, t, say }) {
    backdrop(ctx, w, h, 0.5);
    const s = Math.min(w, h), cx = w / 2, cy = h * 0.46, Ro = Math.min(w * 0.36, h * 0.36), a = -t * 0.42, mx = cx + Math.cos(a) * Ro, my = cy + Math.sin(a) * Ro, r = s * 0.045;
    ring(ctx, cx, cy, Ro, 'rgba(236,231,220,.16)', 1, [2, 5]); globe(ctx, cx, cy, s * 0.07); label(ctx, 'The Earth', cx, cy + s * 0.07 + 16, { align: 'center' });
    dot(ctx, mx, my, r, '#b9b6ae');
    // the near side: a dark patch that always points at the Earth
    dot(ctx, mx - Math.cos(a) * r * 0.5, my - Math.sin(a) * r * 0.5, r * 0.38, '#6f6d68'); line(ctx, [mx - Math.cos(a) * r, my - Math.sin(a) * r, mx - Math.cos(a) * r * 2.1, my - Math.sin(a) * r * 2.1], ACCENT, 1.4);
    const days = ((t * 0.42) / TAU) * 27.3;
    say(`Day ${Math.floor(days % 27.3) + 1} of 27`, 'One turn for each trip round: the same face stays towards us');
  },
};

// ---- 5. the far side
const far = photoScene({
  src: '/img/learn/moon-far-side-lro.jpg',
  caption: `A real photograph: the far side of the Moon, which cannot be seen from the Earth, by NASA’s Lunar Reconnaissance Orbiter. ${LRO}`,
  say: ['The side nobody saw until 1959', 'Hardly any seas: craters upon craters'],
  zoom: [0.96, 1.04],
});

// ---- 6. people
const aldrin = photoScene({
  src: '/img/learn/aldrin-apollo-11.jpg',
  caption: 'A real photograph: Buzz Aldrin on the Moon on 20 July 1969, taken by Neil Armstrong, who can be seen reflected in the visor. Credit: NASA.',
  say: ['20 July 1969', 'Twelve people have walked on the Moon. The last left in December 1972'],
  zoom: [1, 1.12], focus: [0.5, 0.3],
});

export const scenes: Scene[] = [near, gapScene, hitScene, faceScene, far, aldrin];

