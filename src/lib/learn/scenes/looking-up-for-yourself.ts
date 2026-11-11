/**
 * Pictures for the lesson "Looking up for yourself". The photographs are real, and the picture of the
 * Earth at night is built from satellite measurements. The one drawing shows stars coming into view
 * as the eyes get used to the dark. Its stars are made up and their number is not a count.
 */
import { type Scene, FAINT, ACCENT, clamp, label, rng, nf } from '../stage';
import { photoScene, dot, line } from '../kit';

export const lens = photoScene({
  src: '/img/learn/milky-way-panorama-eso.jpg',
  caption: 'A real photograph: the whole Milky Way, pieced together over several months. Credit: ESO/S. Brunier, CC BY 4.0.',
  say: ['', ''], hero: true, cover: true, zoom: [1, 1.08], focus: [0.5, 0.5],
});

// ---- 1. give your eyes time
const sky = (() => { const r = rng(404); return Array.from({ length: 520 }, () => ({ x: r(), y: r() * 0.74, f: r() ** 0.45, s: 0.5 + r() * 1.3 })); })();
const eyesScene: Scene = {
  caption: 'The same patch of sky as your eyes get used to the dark, with the minutes running fast. A drawing of the idea: the stars are made up, and how many you really see depends on how dark your sky is.',
  stillAt: 9,
  draw({ ctx, w, h, t, say }) {
    const loop = 13, x = t % loop, minutes = clamp(x / 9) * 30, depth = 0.1 + 0.9 * (minutes / 30) ** 0.7;
    for (const s of sky) { const a = clamp((depth - s.f) * 6); if (a > 0) dot(ctx, s.x * w, s.y * h, s.s * (1.5 - s.f), `rgba(236,231,220,${a * (1 - s.f * 0.55)})`); }
    // a rooftop, to stand under
    ctx.fillStyle = '#0d0d10'; ctx.beginPath(); ctx.moveTo(0, h); ctx.lineTo(0, h * 0.84); ctx.lineTo(w * 0.16, h * 0.84); ctx.lineTo(w * 0.24, h * 0.76); ctx.lineTo(w * 0.32, h * 0.84); ctx.lineTo(w * 0.62, h * 0.84); ctx.lineTo(w * 0.62, h * 0.8); ctx.lineTo(w * 0.8, h * 0.8); ctx.lineTo(w * 0.8, h * 0.84); ctx.lineTo(w, h * 0.84); ctx.lineTo(w, h); ctx.closePath(); ctx.fill();
    const x0 = w * 0.1, x1 = w * 0.9, y = h * 0.9; line(ctx, [x0, y, x1, y], 'rgba(236,231,220,.25)');
    for (const m of [0, 15, 30]) { const px = x0 + ((x1 - x0) * m) / 30; line(ctx, [px, y - 4, px, y + 4], 'rgba(236,231,220,.4)'); label(ctx, `${m} min`, px, y + 14, { align: m === 0 ? 'left' : m === 30 ? 'right' : 'center', colour: FAINT }); }
    dot(ctx, x0 + ((x1 - x0) * minutes) / 30, y, 4, ACCENT);
    say(`${nf(Math.floor(minutes))} minutes in the dark`, minutes < 2 ? 'Straight out of a lit room: only the brightest stars' : minutes < 15 ? 'More stars every minute' : minutes < 30 ? 'Still improving' : 'As good as your eyes will get');
  },
};

// ---- 2. get away from the lights
const lights = photoScene({
  src: '/img/learn/earth-at-night-black-marble.jpg',
  caption: 'A picture built from satellite measurements: Europe, Africa and the Middle East at night, from readings by the Suomi NPP satellite in 2012 laid over a daytime map. Credit: NASA Earth Observatory/NOAA NGDC. The marks were added here.',
  say: ['Every light here is shining up into the sky', 'The glow hides the fainter stars from everyone beneath it'],
  zoom: [1.15, 1.4], focus: [0.45, 0.3],
  pointers: [{ at: [0.36, 0.2], to: [0.16, 0.1], text: 'Europe', align: 'left' }, { at: [0.4, 0.5], to: [0.2, 0.62], text: 'The Sahara: dark', align: 'left' }],
});

// ---- 3. what a dark sky shows
const milkyWay = photoScene({
  src: '/img/learn/milky-way-panorama-eso.jpg',
  caption: 'A real photograph: the whole sky, pieced together so the Milky Way runs across the middle. By eye it has no colour and is far fainter than this. Credit: ESO/S. Brunier, CC BY 4.0. The mark was added here.',
  say: ['The Milky Way: our own galaxy, seen from inside', 'From a dark place it is a pale band right across the sky'],
  zoom: [1, 1.1], focus: [0.5, 0.5],
  pointers: [{ at: [0.71, 0.7], to: [0.86, 0.9], text: 'Two neighbouring galaxies' }],
});

// ---- 4. start with the easy things
const moon = photoScene({
  src: '/img/learn/moon-near-side-lro.jpg',
  caption: 'A real photograph: the near side of the Moon, by NASA’s Lunar Reconnaissance Orbiter. Credit: NASA/GSFC/Arizona State University.',
  say: ['Start with the Moon', 'Its dark seas and biggest craters show in any binoculars'],
  zoom: [1, 1.25], focus: [0.5, 0.75],
});

// ---- 5. then binoculars
const clouds = photoScene({
  src: '/img/learn/omega-centauri-hubble.jpg',
  caption: 'A real photograph: stars in the cluster Omega Centauri, by the Hubble Space Telescope. Binoculars show a cluster like this as a soft ball of light, and it takes a telescope to split it into stars. Credit: NASA, ESA and the Hubble SM4 ERO Team, CC BY 4.0.',
  say: ['Binoculars before a telescope', 'A smudge by eye turns out to be thousands of stars'],
  cover: true, zoom: [1, 1.12],
});

export const scenes: Scene[] = [eyesScene, lights, milkyWay, moon, clouds];

