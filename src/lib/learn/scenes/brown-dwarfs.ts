/**
 * Pictures for the lesson "Brown dwarfs". Two are real telescope pictures and one is a map worked
 * out from measurements. The sizes and the distances are drawn to scale. The rest are diagrams.
 */
import { type Scene, SOFT, ACCENT, clamp, ease, mix, label, stars } from '../stage';
import { TAU, photoScene, sun, dot, line } from '../kit';

const backdrop = stars(80, 1995);
const MAP = 'A map, not a photograph: the brown dwarf Luhman 16B at six moments in one turn of about five hours, worked out from the changes in its light as seen by the Very Large Telescope in Chile. Light patches are gaps in the cloud. The colours were chosen. Credit: ESO/I. Crossfield, CC BY 4.0.';
const BD = '#b0486b';

const FIELD = 'A real picture in infrared light from NASA’s WISE satellite. The small green dot in the very middle is a brown dwarf called WISE 1828+2650, one of the coldest known. The blue dots are stars and galaxies. Infrared has no colour, so the colours were chosen. Credit: NASA/JPL-Caltech/UCLA.';

export const lens = photoScene({ src: '/img/learn/wise-1828-coldest-brown-dwarf.jpg', caption: FIELD, say: ['', ''], hero: true, cover: true, zoom: [1, 1.08], focus: [0.5, 0.5] });

function ball(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, colour: string, halo = 1.25) {
  const g = ctx.createRadialGradient(x, y, r * 0.2, x, y, r * halo); g.addColorStop(0, colour); g.addColorStop(1 / halo, colour); g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r * halo, 0, TAU); ctx.fill();
}

// ---- 1. the ladder of mass
const ladder: Scene = {
  caption: 'A chart of mass, counted in Jupiters. The scale is not an even one: each faint upright line is ten times the mass of the one before. Planets are on the left, brown dwarfs in the middle and stars on the right. The two limits, at 13 and 80 Jupiters, are rules of thumb.',
  stillAt: 4,
  draw({ ctx, w, h, t, say }) {
    const x0 = w * 0.07, x1 = w * 0.93, y = h * 0.42, bh = Math.max(14, h * 0.1), X = (m: number) => x0 + ((Math.log10(m) + 0.3) / 3.6) * (x1 - x0), k = ease(clamp(t / 2, 0, 1));
    for (const m of [1, 10, 100, 1000]) { line(ctx, [X(m), y - bh * 1.6, X(m), y + bh * 1.6], 'rgba(236,231,220,.12)'); label(ctx, `${m.toLocaleString('en-GB')}`, X(m), y + bh * 1.6 + 14, { align: 'center', colour: SOFT, size: 10 }); }
    const zone = (a: number, b: number, colour: string) => { ctx.fillStyle = colour; ctx.fillRect(X(a), y - bh / 2, (X(b) - X(a)) * k, bh); };
    zone(0.5, 13, 'rgba(201,164,124,.55)'); zone(13, 80, BD); zone(80, 2000, 'rgba(255,190,110,.75)');
    label(ctx, 'Planets', X(2.5), y - bh / 2 - 9, { align: 'center', colour: '#c9a47c', size: 11 });
    label(ctx, 'Brown dwarfs', X(32), y - bh / 2 - 9, { align: 'center', colour: '#e58aa8', size: 11 });
    label(ctx, 'Stars', X(400), y - bh / 2 - 9, { align: 'center', colour: '#ffcf8a', size: 11 });
    dot(ctx, X(1), y, 3, '#fff'); dot(ctx, X(1047), y, 3, '#fff');
    label(ctx, 'Jupiter', X(1), y - bh * 1.6 - 6, { align: 'center', colour: '#fff', size: 11 });
    label(ctx, 'The Sun', X(1047), y - bh * 1.6 - 6, { align: 'center', colour: '#fff', size: 11 });
    label(ctx, 'Mass, in Jupiters', x0, y + bh * 1.6 + 30, { align: 'left', colour: SOFT, size: 10 });
    say('In between', 'From 13 to 80 times the mass of Jupiter');
  },
};

// ---- 2. the same size, very different masses
const sizes: Scene = {
  caption: 'A drawing to scale of sizes only. Jupiter, a heavy brown dwarf and one of the smallest stars are all nearly the same width, though the brown dwarf here has 60 times Jupiter’s mass and the star 90 times. The width of the brown dwarf is a typical one from theory. The colours are a guide and no more.',
  stillAt: 2,
  draw({ ctx, w, h, t, say }) {
    backdrop(ctx, w, h, 0.25);
    const wide = w > 560, y = h * 0.36, R = Math.min(w * 0.11, h * 0.2), k = ease(clamp(t / 1.5, 0, 1));
    const items: [string, string, number, string, boolean][] = [['Jupiter', '1 Jupiter of mass', 1, '#c9a47c', false], ['A brown dwarf', '60 Jupiters', 0.95, BD, true], ['A small star', '90 Jupiters', 1.1, '#e8795a', true]];
    items.forEach(([name, mass, rr, colour, lit], i) => {
      const x = w * (0.2 + i * 0.3), r = R * rr * k;
      if (lit) ball(ctx, x, y, r, colour, i === 2 ? 1.35 : 1.15); else { dot(ctx, x, y, r, colour); ctx.save(); ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.clip(); ctx.fillStyle = 'rgba(120,80,50,.45)'; for (const b of [-0.45, -0.1, 0.3]) ctx.fillRect(x - r, y + b * r, r * 2, r * 0.16); ctx.restore(); }
      label(ctx, wide ? name : name.replace('A ', ''), x, y + R * 1.2 + 16, { align: 'center', colour: '#fff', size: wide ? 12 : 11 });
      label(ctx, wide ? mass : mass.replace(' of mass', ''), x, y + R * 1.2 + 32, { align: 'center', colour: i === 0 ? SOFT : ACCENT, size: 11 });
    });
    say('The same width, 60 times the weight', 'More gas only squeezes it tighter');
  },
};

const found = photoScene({
  src: '/img/learn/gliese-229b-discovery.jpg',
  caption: 'Two real pictures of the brown dwarf Gliese 229B, the small dot, beside the glare of the red dwarf it circles. Left: the discovery picture from Palomar Observatory in California, 27 October 1994. Right: the Hubble Space Telescope, 17 November 1995. The streak is made inside the telescope. The colours were chosen to show brightness. Credit: T. Nakajima and S. Kulkarni (Caltech), S. Durrance and D. Golimowski (JHU), NASA.',
  say: ['1995: the proof', 'The dot is a brown dwarf, 19 light years away'], tag: 'Two real pictures', zoom: [1, 1.05], focus: [0.5, 0.5],
});

// ---- 4. cooling for ever
const cooling: Scene = {
  caption: 'A diagram. A brown dwarf has no fire to keep it warm, so it cools and dims for the whole of its life. The curve shows the temperature falling quickly at first and then ever more slowly. Its shape is a guide: the true curve depends on the mass. The colours are roughly what the eye would see.',
  stillAt: 7,
  draw({ ctx, w, h, t, say }) {
    backdrop(ctx, w, h, 0.3);
    const k = clamp((t % 10) / 7.5, 0, 1), cx = w * 0.24, cy = h * 0.36, r = Math.min(w * 0.13, h * 0.2);
    const c1 = [232, 121, 90], c2 = [176, 72, 107], c3 = [52, 30, 44], a = k < 0.4 ? k / 0.4 : (k - 0.4) / 0.6, from = k < 0.4 ? c1 : c2, to = k < 0.4 ? c2 : c3;
    const col = `rgb(${Math.round(mix(from[0], to[0], a))},${Math.round(mix(from[1], to[1], a))},${Math.round(mix(from[2], to[2], a))})`;
    ball(ctx, cx, cy, r, col, 1.1 + 0.4 * (1 - k));
    const x0 = w * 0.48, x1 = w * 0.94, top = h * 0.12, base = h * 0.62, f = (u: number) => 1 / (1 + 9 * u), pts: number[] = [];
    line(ctx, [x0, top, x0, base, x1, base], 'rgba(236,231,220,.3)');
    for (let i = 0; i <= 80; i++) { const u = i / 80; if (u > k) break; pts.push(x0 + u * (x1 - x0), base - f(u) * (base - top)); }
    if (pts.length >= 4) line(ctx, pts, ACCENT, 1.8);
    dot(ctx, x0 + k * (x1 - x0), base - f(k) * (base - top), 3.5, '#fff');
    label(ctx, 'Hotter', x0 + 6, top + 4, { align: 'left', colour: SOFT, size: 10 });
    label(ctx, 'Young', x0, base + 15, { align: 'left', colour: SOFT, size: 10 }); label(ctx, 'Billions of years', x1, base + 15, { align: 'right', colour: SOFT, size: 10 });
    label(ctx, k < 0.25 ? 'Like a small star' : k < 0.7 ? 'Cooler than a flame' : 'Colder than a kitchen', cx, cy + r * 1.5 + 14, { align: 'center', colour: '#fff', size: 11 });
    say('Nothing to keep it warm', 'A brown dwarf cools and fades for its whole life');
  },
};

const weather = photoScene({ src: '/img/learn/luhman-16b-weather-map.jpg', caption: MAP, say: ['Weather on the nearest brown dwarf', 'Banks of cloud turning into view, mapped in 2014'], tag: 'Map from measurements', zoom: [1, 1.06], focus: [0.5, 0.5] });

// ---- 6. the neighbours
const NEAR: [string, number, string, boolean][] = [['Alpha Centauri, 3 stars', 4.37, '', false], ['Barnard’s Star', 5.96, '', false], ['Luhman 16, 2 brown dwarfs', 6.51, 'found 2013', true], ['WISE 0855', 7.43, 'found 2014', true]];
const near: Scene = {
  caption: 'A chart to scale of the four nearest systems to the Sun, by distance in light years. Direction is not shown. The two in pink are brown dwarfs, and neither was known before 2013. The distance for Alpha Centauri is that of its two bright stars. Its third star, Proxima, is a little nearer at 4.25.',
  stillAt: 5,
  draw({ ctx, w, h, t, say }) {
    backdrop(ctx, w, h, 0.25);
    const wide = w > 560, x0 = w * 0.08, x1 = w * 0.94, top = h * 0.1, rowH = (h * 0.6) / NEAR.length, X = (ly: number) => x0 + (ly / 8) * (x1 - x0);
    for (let ly = 2; ly <= 8; ly += 2) { line(ctx, [X(ly), top - 4, X(ly), top + rowH * NEAR.length], 'rgba(236,231,220,.1)'); label(ctx, `${ly}`, X(ly), top + rowH * NEAR.length + 14, { align: 'center', colour: SOFT, size: 10 }); }
    label(ctx, 'light years', X(8) - 4, top + rowH * NEAR.length + 28, { align: 'right', colour: SOFT, size: 10 });
    sun(ctx, x0, top + (rowH * NEAR.length) / 2, 5);
    NEAR.forEach(([name, ly, note, brown], i) => {
      const k = ease(clamp((t - 0.4 - i * 0.9) / 0.9, 0, 1)), y = top + i * rowH + rowH * 0.62, colour = brown ? '#e58aa8' : '#ffe9c0';
      line(ctx, [x0, y, x0 + (X(ly) - x0) * k, y], brown ? 'rgba(229,138,168,.5)' : 'rgba(236,231,220,.3)');
      if (k >= 0.99) { dot(ctx, X(ly), y, brown ? 3.5 : 4.5, colour); }
      if (k > 0.05) label(ctx, wide && note ? `${name}, ${note}` : name, x0 + 12, y - 9, { align: 'left', colour, size: wide ? 12 : 11 });
    });
    say('Hiding next door', 'Two of our four nearest neighbours, unseen until 2013');
  },
};

export const scenes: Scene[] = [ladder, sizes, found, cooling, weather, near];
