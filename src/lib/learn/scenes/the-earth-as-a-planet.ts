/**
 * Pictures for the lesson "The Earth as a planet". The photographs are real. The inside of the Earth
 * is drawn to scale from NASA's rounded thicknesses, and so is the magnified slice through the sea.
 * The hundred dots of air are a count, not a picture of anything.
 */
import { type Scene, SOFT, ACCENT, clamp, ease, label, stars } from '../stage';
import { TAU, photoScene, globe, dot, line, ring } from '../kit';

const backdrop = stars(120, 31);
const MARBLE = '/img/learn/earth-blue-marble-apollo-17.jpg';

export const lens = photoScene({
  src: MARBLE,
  caption: 'A real photograph: the whole Earth, taken by the crew of Apollo 17 on 7 December 1972 on their way to the Moon. Credit: NASA.',
  say: ['', ''], hero: true, zoom: [1, 1.08], focus: [0.5, 0.5],
});

// ---- 1. the whole Earth
const marble = photoScene({
  src: MARBLE,
  caption: 'A real photograph: the whole Earth, taken by the crew of Apollo 17 on 7 December 1972 on their way to the Moon. Credit: NASA. The marks were added here.',
  say: ['Home, from the outside', 'Taken by people, on their way to the Moon'],
  zoom: [0.94, 1.02],
  pointers: [
    { at: [0.36, 0.2], to: [0.12, 0.06], text: 'Africa', align: 'left' },
    { at: [0.63, 0.11], to: [0.86, 0.05], text: 'Arabia' },
    { at: [0.58, 0.42], to: [0.9, 0.36], text: 'Madagascar' },
    { at: [0.5, 0.88], to: [0.16, 0.95], text: 'Antarctica', align: 'left' },
  ],
});

// ---- 2. the inside, to scale
const LAYERS = [
  { to: 1221, colour: '#f6e6b4', name: 'Inner core', note: 'solid metal, up to 5,400 °C' },
  { to: 3521, colour: '#e79a3a', name: 'Outer core', note: 'liquid metal' },
  { to: 6341, colour: '#a8462a', name: 'Mantle', note: 'hot rock, 2,900 km thick' },
  { to: 6371, colour: '#d9d2c2', name: 'Crust', note: 'about 30 km under the land' },
];
const insideScene: Scene = {
  caption: 'The Earth with a slice cut away, drawn to scale from NASA’s rounded figures. The crust is the thin pale line round the edge. A drawing: the colours are only to tell the layers apart.',
  stillAt: 9,
  draw({ ctx, w, h, t, say }) {
    backdrop(ctx, w, h, 0.45);
    const wide = w > 560, cx = wide ? w * 0.34 : w / 2, cy = wide ? h * 0.47 : h * 0.31, R = wide ? Math.min(w * 0.24, h * 0.36) : Math.min(w * 0.36, h * 0.25);
    const open = ease(t / 2.5), shown = clamp((t - 2) / 5) * LAYERS.length;
    globe(ctx, cx, cy, R);
    // the cut: a wedge opening from the top round to the right
    ctx.save(); ctx.beginPath(); ctx.moveTo(cx, cy); ctx.arc(cx, cy, R, -TAU / 4, -TAU / 4 + (TAU / 4) * open); ctx.closePath(); ctx.clip();
    for (let i = LAYERS.length - 1; i >= 0; i--) dot(ctx, cx, cy, (LAYERS[i].to / 6371) * R, LAYERS[i].colour);
    ctx.restore();
    line(ctx, [cx, cy, cx, cy - R], 'rgba(11,11,12,.55)'); if (open > 0.98) line(ctx, [cx, cy, cx + R, cy], 'rgba(11,11,12,.55)');
    LAYERS.forEach((l, i) => {
      const k = clamp(shown - i); if (k <= 0) return;
      ctx.globalAlpha = k;
      const from = i ? LAYERS[i - 1].to : 0, mid = ((from + l.to) / 2 / 6371) * R;
      if (wide) {
        const a = -TAU / 8 + (i - 1.5) * 0.3, px = cx + Math.cos(a) * mid, py = cy + Math.sin(a) * mid, lx = w * 0.64, ly = h * (0.72 - i * 0.16);
        line(ctx, [px, py, lx - 8, ly], 'rgba(236,231,220,.45)'); dot(ctx, px, py, 2, '#0b0b0c');
        label(ctx, l.name, lx, ly - 7, { align: 'left', colour: i === 3 ? ACCENT : undefined }); label(ctx, l.note, lx, ly + 9, { align: 'left', colour: SOFT, size: 11 });
      } else {
        const ly = h * 0.62 + i * h * 0.075;
        dot(ctx, w * 0.1, ly, 5, l.colour); label(ctx, l.name, w * 0.1 + 14, ly, { align: 'left' }); label(ctx, l.note, w * 0.42, ly, { align: 'left', colour: SOFT, size: 11 });
      }
      ctx.globalAlpha = 1;
    });
    say('What is under your feet', '6,371 kilometres down to the middle');
  },
};

// ---- 3. how thin the sea is
const seaScene: Scene = {
  caption: 'Left, the Earth. On a globe this size the sea is far too thin to draw. Right, a slice through the sea floor 20 km from top to bottom, greatly magnified and to scale: the sea is 3.6 km deep on average. A drawing.',
  stillAt: 7,
  draw({ ctx, w, h, t, say }) {
    backdrop(ctx, w, h, 0.45);
    const wide = w > 560, gx = wide ? w * 0.24 : w / 2, gy = wide ? h * 0.46 : h * 0.2, R = wide ? Math.min(w * 0.16, h * 0.3) : h * 0.13;
    const px = wide ? w * 0.52 : w * 0.08, py = wide ? h * 0.14 : h * 0.4, pw = wide ? w * 0.42 : w * 0.84, ph = wide ? h * 0.6 : h * 0.4;
    globe(ctx, gx, gy, R);
    const k = ease((t - 1) / 2.5), mx = gx + R * 0.72, my = gy - R * 0.7;
    ctx.strokeStyle = ACCENT; ctx.lineWidth = 1; ctx.strokeRect(mx - 4, my - 4, 8, 8);
    if (k <= 0) { say('Seas cover 71 per cent of the Earth', 'How deep are they, for the size of the planet?'); return; }
    ctx.globalAlpha = k;
    line(ctx, [mx + 4, my - 4, px, py], 'rgba(232,163,61,.4)'); line(ctx, [mx + 4, my + 4, px, py + ph], 'rgba(232,163,61,.4)');
    const km = ph / 20, top = py + 5 * km, sea = 3.6 * km, crust = 5 * km;
    ctx.fillStyle = '#101218'; ctx.fillRect(px, py, pw, 5 * km);
    ctx.fillStyle = '#2a5f96'; ctx.fillRect(px, top, pw, sea);
    ctx.fillStyle = '#4a453e'; ctx.fillRect(px, top + sea, pw, crust);
    ctx.fillStyle = '#a8462a'; ctx.fillRect(px, top + sea + crust, pw, py + ph - top - sea - crust);
    // a gentle swell on the surface
    ctx.strokeStyle = 'rgba(255,255,255,.5)'; ctx.beginPath(); for (let x = 0; x <= pw; x += 4) { const y = top + Math.sin(x * 0.05 + t * 1.4) * 1.2; x ? ctx.lineTo(px + x, y) : ctx.moveTo(px + x, y); } ctx.stroke();
    ctx.strokeStyle = 'rgba(236,231,220,.35)'; ctx.strokeRect(px, py, pw, ph);
    label(ctx, 'Air', px + 10, py + 2.5 * km, { align: 'left', colour: SOFT });
    label(ctx, 'The sea: 3.6 km', px + 10, top + sea / 2, { align: 'left', colour: '#fff' });
    label(ctx, 'Rock of the sea floor: about 5 km', px + 10, top + sea + crust / 2, { align: 'left', colour: '#fff' });
    label(ctx, 'The mantle begins', px + 10, top + sea + crust + (py + ph - top - sea - crust) / 2, { align: 'left', colour: '#fff' });
    // scale bar
    const bx = px + pw - 14; line(ctx, [bx, top, bx, top + 5 * km], '#ece7dc', 1.4); line(ctx, [bx - 4, top, bx + 4, top], '#ece7dc'); line(ctx, [bx - 4, top + 5 * km, bx + 4, top + 5 * km], '#ece7dc');
    label(ctx, '5 km', bx - 8, top + 2.5 * km, { align: 'right', colour: SOFT, size: 11 });
    ctx.globalAlpha = 1;
    say('A film of water on a ball of rock', 'All the seas together are thinner than the line round this globe');
  },
};

// ---- 4. the air, counted
const airScene: Scene = {
  caption: 'The air near the ground, counted out as a hundred parts: 78 of nitrogen, 21 of oxygen and 1 of everything else. A drawing of the numbers, not of the air.',
  stillAt: 9,
  draw({ ctx, w, h, t, say }) {
    backdrop(ctx, w, h, 0.35);
    const cols = w > 560 ? 20 : 10, rows = 100 / cols, gap = Math.min((w * 0.84) / cols, (h * 0.56) / rows), x0 = w / 2 - (gap * (cols - 1)) / 2, y0 = h * 0.14 + gap / 2;
    const n = Math.floor(clamp(t / 6) * 100);
    for (let i = 0; i < n; i++) {
      const colour = i < 78 ? '#6f9fd6' : i < 99 ? '#ece7dc' : ACCENT;
      dot(ctx, x0 + (i % cols) * gap, y0 + Math.floor(i / cols) * gap, gap * 0.3, colour);
    }
    const ky = y0 + rows * gap + 6, key: [string, string, number][] = [['#6f9fd6', 'Nitrogen 78', 0], ['#ece7dc', 'Oxygen 21', 78], [ACCENT, w > 560 ? 'Everything else 1' : 'The rest 1', 99]];
    key.forEach(([c, text, from], i) => { if (n <= from) return; const kx = w * (w > 560 ? 0.14 + i * 0.29 : 0.08 + i * 0.32); dot(ctx, kx, ky, 4, c); label(ctx, text, kx + 10, ky, { align: 'left', size: w > 560 ? 13 : 11 }); });
    say(n < 78 ? 'Mostly nitrogen' : n < 99 ? 'A fifth of it is the oxygen we breathe' : 'A hundred parts of air', 'The one odd part includes argon and carbon dioxide');
  },
};

// ---- 5. the lights
const lights = photoScene({
  src: '/img/learn/aurora-from-iss.jpg',
  caption: 'A real photograph: the southern lights over the Indian Ocean, taken from the International Space Station on 12 June 2025. The picture is as the camera took it, with the Earth at the top. Credit: NASA.',
  say: ['The magnet at work', 'Particles from the Sun, steered down to the poles, make the air glow'],
  cover: true, zoom: [1, 1.1], focus: [0.4, 0.45],
  pointers: [{ at: [0.2, 0.4], to: [0.22, 0.75], text: 'The southern lights', align: 'left' }],
});

// ---- 6. life
const life = photoScene({
  src: MARBLE,
  caption: 'A real photograph: Africa and the seas round it, from the Apollo 17 picture of the whole Earth, 7 December 1972. Credit: NASA.',
  say: ['The only world known to have life', 'It began in the sea about 3.8 billion years ago'],
  cover: true, zoom: [1.5, 1.75], focus: [0.44, 0.34],
});

export const scenes: Scene[] = [marble, insideScene, seaScene, airScene, lights, life];
