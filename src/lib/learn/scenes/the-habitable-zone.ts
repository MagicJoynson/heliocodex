/**
 * Pictures for the lesson "The habitable zone". The four photographs are real. The two plans are
 * drawn to scale: the Sun's zone from Kopparapu and others (2013), and the TRAPPIST-1 planets at
 * the distances given in the TRAPPIST-1 lesson. Suns and planets are drawn far too large to be seen.
 */
import { type Scene, SOFT, ACCENT, label, stars } from '../stage';
import { TAU, photoScene, sun, dot } from '../kit';

const backdrop = stars(110, 211);
const VENUS = 'A real photograph with chosen colours: Venus, by NASA’s Mariner 10 spacecraft in February 1974. The colour was built from pictures taken through orange and ultraviolet filters. Credit: NASA/JPL-Caltech.';

export const lens = photoScene({
  src: '/img/learn/earth-blue-marble-apollo-17.jpg',
  caption: 'A real photograph: the whole Earth, taken by the crew of Apollo 17 on 7 December 1972 on their way to the Moon. Credit: NASA.',
  say: ['', ''], hero: true, zoom: [0.9, 1], focus: [0.5, 0.5],
});

// ---- 1. the Sun's zone, to scale
const WORLDS: [string, number, number, string][] = [['Venus', 0.72, 0.615, '#e8dcc0'], ['Earth', 1, 1, '#5a9bff'], ['Mars', 1.52, 1.881, '#d9774a']];
const zone: Scene = {
  caption: 'The Sun’s habitable zone, the green band, with the orbits of Venus, the Earth and Mars, seen from above. Distances are to scale. The edges, at 0.99 and 1.70 times the Earth’s distance, are one estimate (Kopparapu and others, 2013). The Sun and planets are drawn far too large.',
  stillAt: 3,
  draw({ ctx, w, h, t, say }) {
    backdrop(ctx, w, h, 0.4);
    const cx = w / 2, cy = h * 0.4, au = Math.min(w * 0.46, h * 0.37) / 1.78;
    ctx.fillStyle = 'rgba(90,190,120,.2)'; ctx.beginPath(); ctx.arc(cx, cy, 1.7 * au, 0, TAU); ctx.arc(cx, cy, 0.99 * au, 0, TAU, true); ctx.fill();
    ctx.strokeStyle = 'rgba(120,210,150,.5)'; ctx.lineWidth = 1; for (const r of [0.99, 1.7]) { ctx.beginPath(); ctx.arc(cx, cy, r * au, 0, TAU); ctx.stroke(); }
    sun(ctx, cx, cy, au * 0.09, 1);
    WORLDS.forEach(([name, a, yr, c], i) => {
      ctx.strokeStyle = 'rgba(236,231,220,.3)'; ctx.beginPath(); ctx.arc(cx, cy, a * au, 0, TAU); ctx.stroke();
      const ang = -0.5 + i * 0.9 - (t * 0.5) / yr, x = cx + Math.cos(ang) * a * au, y = cy + Math.sin(ang) * a * au;
      dot(ctx, x, y, 4, c); label(ctx, name, x + 8, y - 6, { align: 'left' });
    });
    label(ctx, 'The zone', cx, cy - 1.35 * au + 4, { align: 'center', colour: '#8fdcaa' });
    say('Not too hot, not too cold', 'Venus is outside. The Earth and Mars are inside');
  },
};

// ---- 2 to 4. three planets
const venus = photoScene({ src: '/img/learn/venus-mariner-10.jpg', caption: VENUS, say: ['Venus: too close', 'About 464 °C at the ground, under crushing air'], zoom: [0.8, 0.95], focus: [0.5, 0.5] });
const mars = photoScene({
  src: '/img/learn/mars-viking-global.jpg',
  caption: 'A real picture pieced together from about 1,000 photographs by NASA’s Viking 1 orbiter, taken through red and violet filters, with the green worked out from those two. The long scar below the middle is the canyon Valles Marineris. Credit: NASA/JPL/USGS.',
  say: ['Mars: in the zone, and frozen', 'About −65 °C, with hardly any air'], zoom: [0.8, 0.95], focus: [0.5, 0.5], tag: 'Photo mosaic',
});
const earth = photoScene({
  src: '/img/learn/earth-blue-marble-apollo-17.jpg',
  caption: 'A real photograph: the whole Earth, taken by the crew of Apollo 17 on 7 December 1972 on their way to the Moon. Credit: NASA.',
  say: ['The Earth: only just inside', 'Its air adds about 33 degrees. Without it, the seas would freeze'], zoom: [0.8, 0.95], focus: [0.5, 0.5],
});

// ---- 5. a red dwarf's zone, to the same scale as Mercury's orbit
const T1: [string, number, number][] = [['b', 1.7, 1.5], ['c', 2.4, 2.4], ['d', 3.3, 4.0], ['e', 4.4, 6.1], ['f', 5.8, 9.2], ['g', 7.0, 12.4], ['h', 9.3, 18.8]];
const dwarf: Scene = {
  caption: 'The seven planets of the red star TRAPPIST-1, with part of Mercury’s orbit round the Sun drawn to the same scale. Planets e, f and g, in green, lie in that star’s habitable zone. Distances are to scale. The star and planets are drawn far too large.',
  stillAt: 3,
  draw({ ctx, w, h, t, say }) {
    backdrop(ctx, w, h, 0.4);
    const wide = w > 560, cx = wide ? w * 0.36 : w * 0.34, cy = h * 0.4, mk = Math.min(wide ? w * 0.3 : w * 0.3, h * 0.36) / 9.3;
    ctx.strokeStyle = 'rgba(236,231,220,.35)'; ctx.setLineDash([5, 6]); ctx.beginPath(); ctx.arc(cx, cy, 58 * mk, -0.42, 0.42); ctx.stroke(); ctx.setLineDash([]);
    const mx = Math.min(w - 8, cx + 58 * mk * Math.cos(0.3) - 8);
    label(ctx, wide ? 'Mercury’s orbit' : 'Mercury', mx, cy + 58 * mk * Math.sin(0.3) + 16, { align: 'right', colour: SOFT });
    const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, 9); g.addColorStop(0, '#ffd0b0'); g.addColorStop(0.5, '#e0563a'); g.addColorStop(1, 'rgba(224,86,58,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, 9, 0, TAU); ctx.fill();
    T1.forEach(([name, a, yr], i) => {
      const inZone = i >= 3 && i <= 5; ctx.strokeStyle = inZone ? 'rgba(120,210,150,.75)' : 'rgba(236,231,220,.25)'; ctx.lineWidth = inZone ? 1.4 : 1; ctx.beginPath(); ctx.arc(cx, cy, a * mk, 0, TAU); ctx.stroke();
      const ang = i * 1.7 - (t * 2.2) / yr, x = cx + Math.cos(ang) * a * mk, y = cy + Math.sin(ang) * a * mk; dot(ctx, x, y, 2.6, inZone ? '#8fdcaa' : '#b9b6ae');
      if (inZone) label(ctx, name, x + 6, y - 5, { align: 'left', colour: '#8fdcaa' });
    });
    label(ctx, 'TRAPPIST-1', cx, cy + 9.3 * mk + 20, { align: 'center', colour: ACCENT });
    say('A dim star has a zone close in', 'Three planets in it, all far inside where Mercury would be');
  },
};

// ---- 6. water outside the zone
const enceladus = photoScene({
  src: '/img/learn/enceladus-jets-cassini.jpg',
  caption: 'A real photograph: jets of water ice spraying from cracks near the south pole of Saturn’s moon Enceladus, with the Sun behind them. Two pictures by NASA’s Cassini spacecraft joined together. Credit: NASA/JPL/Space Science Institute.',
  say: ['Enceladus, far outside the zone', 'Liquid water all the same, under the ice'], zoom: [0.95, 1.1], focus: [0.6, 0.6],
});

export const scenes: Scene[] = [zone, venus, mars, earth, dwarf, enceladus];
