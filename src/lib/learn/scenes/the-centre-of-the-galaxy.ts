/**
 * Pictures for the lesson "The centre of the galaxy". The photographs are real. The orbit of the
 * star S2 is a drawing: its period and its speed at closest approach are the measured ones, but the
 * shape of the path is only roughly right and the black hole is drawn far too big to be seen at all.
 */
import { type Scene, ACCENT, label, stars } from '../stage';
import { TAU, photoScene, sun, dot } from '../kit';

const backdrop = stars(160, 23);

export const lens = photoScene({
  src: '/img/learn/galactic-centre-infrared-vista.jpg',
  caption: 'A real photograph in infrared light: the central parts of the Milky Way, from the VISTA telescope in Chile. Credit: ESO/VVV Survey/D. Minniti; acknowledgement Ignacio Toledo and Martin Kornmesser. CC BY 4.0.',
  say: ['', ''], hero: true, zoom: [1, 1.1], focus: [0.5, 0.35],
});

// ---- 1. ordinary light
const visible = photoScene({
  src: '/img/learn/galactic-centre-visible-eso.jpg',
  caption: 'A real photograph in ordinary light: the Milky Way from Sagittarius to Scorpius, 34 degrees of sky from side to side, built from about 1,200 exposures taken at Paranal in Chile. Credit: ESO/S. Guisard, CC BY 4.0. The mark was added here.',
  say: ['Looking towards the middle of the galaxy', 'Clouds of dust lie in the way'],
  cover: true, zoom: [1, 1.12], focus: [0.4, 0.5],
  pointers: [{ at: [0.4, 0.47], to: [0.62, 0.82], text: 'Lanes of dust' }],
});

// ---- 2. infrared
const infrared = photoScene({
  src: '/img/learn/galactic-centre-infrared-vista.jpg',
  caption: 'A real photograph in infrared light, shown in colours the eye can see: the central parts of the Milky Way, stitched from thousands of pictures by the VISTA telescope in Chile. Credit: ESO/VVV Survey/D. Minniti; acknowledgement Ignacio Toledo and Martin Kornmesser. CC BY 4.0. The mark was added here.',
  say: ['The same direction, in infrared', 'Infrared slips through the dust and the centre shows'],
  cover: true, zoom: [1, 1.25], focus: [0.5, 0.36],
  pointers: [{ at: [0.515, 0.335], to: [0.68, 0.14], text: 'The centre, 27,000 light years away' }],
});

// ---- 3. the crowd in the middle
const crowd = photoScene({
  src: '/img/learn/galactic-centre-stars-naco.jpg',
  caption: 'A real photograph in infrared light, shown in colours the eye can see: the stars at the very centre of the Milky Way, from the Very Large Telescope in Chile. The picture is about three light years across (my own sum from its width on the sky). Credit: ESO/S. Gillessen et al., CC BY 4.0.',
  say: ['Three light years from side to side', 'Round the Sun, a space this size holds no other star'],
  zoom: [0.92, 1.05],
});

// ---- 4. one star's orbit
const E = 0.88;
const kepler = (M: number) => { let x = M; for (let i = 0; i < 8; i++) x -= (x - E * Math.sin(x) - M) / (1 - E * Math.cos(x)); return x; };
const orbitScene: Scene = {
  caption: 'The star S2 going round the centre of the galaxy once every 16 years, speeding up enormously as it comes close. A drawing: the period is the measured one, the shape of the path is only roughly right, and nothing is to scale.',
  stillAt: 3.2,
  draw({ ctx, w, h, t, say }) {
    backdrop(ctx, w, h, 0.5);
    const a = Math.min(w * 0.42, h * 0.7), b = a * Math.sqrt(1 - E * E), tilt = -0.42, fx = w * 0.5 + a * E * Math.cos(tilt), fy = h * 0.47 + a * E * Math.sin(tilt);
    const at = (x: number): [number, number] => { const px = a * (Math.cos(x) - E), py = b * Math.sin(x); return [fx + px * Math.cos(tilt) - py * Math.sin(tilt), fy + px * Math.sin(tilt) + py * Math.cos(tilt)]; };
    ctx.strokeStyle = 'rgba(236,231,220,.42)'; ctx.lineWidth = 1.2; ctx.setLineDash([2, 5]); ctx.beginPath(); for (let i = 0; i <= 120; i++) { const [x, y] = at((i / 120) * TAU); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.stroke(); ctx.setLineDash([]);
    // the thing it goes round: nothing to see
    dot(ctx, fx, fy, 3.5, '#000'); ctx.strokeStyle = 'rgba(232,163,61,.8)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(fx, fy, 4.5, 0, TAU); ctx.stroke();
    label(ctx, 'Nothing to be seen here', fx + 8, fy + 20, { align: 'right', colour: ACCENT });
    const lap = 12, years = (((t / lap) * 16 + 8) % 16), M = (years / 16) * TAU, x = kepler(M);
    for (let i = 14; i >= 0; i--) { const [tx, ty] = at(kepler(M - i * 0.012)); dot(ctx, tx, ty, 2.4 * (1 - i / 15), `rgba(190,215,255,${0.5 * (1 - i / 15)})`); }
    const [sx, sy] = at(x); sun(ctx, sx, sy, 4.5, 1, '200,220,255'); label(ctx, 'S2', sx, sy - 14, { align: 'center' });
    const near = years < 0.6 || years > 15.4;
    say(`Year ${Math.floor(years) + 1} of 16`, near ? 'Closest: more than 25 million km an hour' : 'Far out, it crawls. Close in, it whips round');
  },
};

// ---- 5. the black hole itself
const hole = photoScene({
  src: '/img/learn/sagittarius-a-star-eht.jpg',
  caption: 'A real picture made from radio waves: Sagittarius A*, the black hole at the centre of our galaxy, published on 12 May 2022. The orange is a colour chosen for the picture. From the Earth it looks about the size of a doughnut on the Moon. Credit: EHT Collaboration, CC BY 4.0.',
  say: ['Four million Suns, and almost no light', 'Glowing gas round the dark middle of a black hole'],
  zoom: [0.8, 1.05], tag: 'Radio picture',
});

export const scenes: Scene[] = [visible, infrared, crowd, orbitScene, hole];
