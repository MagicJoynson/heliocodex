/**
 * Pictures for the lesson "Magnetars and gamma-ray bursts". Three are real telescope pictures.
 * The chart and the two moving drawings are diagrams and are not to scale.
 */
import { type Scene, SOFT, ACCENT, clamp, ease, label, stars } from '../stage';
import { TAU, photoScene, dot, line } from '../kit';

const backdrop = stars(90, 1967);
const RINGS = 'A real X-ray picture from NASA’s Swift satellite, taken about an hour after the burst GRB 221009A was first detected on 9 October 2022. The bright spot is the fading glow of the burst. The rings are its X-rays bouncing off sheets of dust in our own galaxy. The dark upright line is a flaw in the camera, and the colour was chosen. Credit: NASA/Swift/A. Beardmore (University of Leicester).';

export const lens = photoScene({ src: '/img/learn/grb-221009a-swift-rings.jpg', caption: RINGS, say: ['', ''], hero: true, cover: true, zoom: [1.3, 1.42], focus: [0.2, 0.5] });

// ---- 1. the ladder of magnets
const MAGNETS: [string, string, number][] = [['The Earth’s field', '0.00005', 5e-5], ['A strong hand magnet', '1.25', 1.25], ['An ordinary neutron star', '100 million', 1e8], ['A magnetar', 'up to 100 billion', 1e11]];
const magnets: Scene = {
  caption: 'A chart of magnetic strength, in the unit called the tesla. The scale is not an even one: each faint upright line is a thousand times stronger than the one before. On an even scale, if the magnetar’s bar were as long as the distance from London to New York, the hand magnet’s would be thinner than a hair. Worked out here.',
  stillAt: 6,
  draw({ ctx, w, h, t, say }) {
    const wide = w > 560, x0 = w * 0.07, x1 = w * 0.93, top = h * 0.06, rowH = (h * 0.66) / MAGNETS.length, lo = -6, hi = 11.3, X = (v: number) => x0 + ((Math.log10(v) - lo) / (hi - lo)) * (x1 - x0);
    for (let e = -6; e <= 9; e += 3) line(ctx, [X(10 ** e), top, X(10 ** e), top + rowH * MAGNETS.length], 'rgba(236,231,220,.1)');
    MAGNETS.forEach(([name, val, v], i) => {
      const k = ease(clamp((t - 0.3 - i * 1) / 1, 0, 1)), y = top + i * rowH;
      ctx.fillStyle = i === 3 ? '#b9a7ff' : 'rgba(233,196,138,.6)'; ctx.fillRect(x0, y + rowH * 0.55, (X(v) - x0) * k, Math.max(4, rowH * 0.26));
      if (k > 0.05) { label(ctx, name, x0, y + rowH * 0.32, { align: 'left', colour: '#fff', size: wide ? 12 : 11 }); label(ctx, val, x1, y + rowH * 0.32, { align: 'right', colour: i === 3 ? '#b9a7ff' : SOFT, size: wide ? 12 : 10 }); }
    });
    say('The strongest magnets there are', 'A hundred billion times a strong hand magnet');
  },
};

const ring = photoScene({
  src: '/img/learn/magnetar-sgr-1900-ring-spitzer.jpg',
  caption: 'A real picture in infrared light from NASA’s Spitzer Space Telescope: a ring of warm dust about seven light years across round the magnetar SGR 1900+14, 20,000 light years away. The magnetar itself is in the middle of the ring and does not show in infrared. The bright spots are ordinary stars. Infrared has no colour, so the colours were chosen. Credit: NASA/JPL-Caltech.',
  say: ['A ring round a magnetar', 'The magnetar is unseen in the middle, 20,000 light years away'], tag: 'Infrared picture', zoom: [1, 1.12], focus: [0.5, 0.5],
});

// ---- 3. a starquake
const quake: Scene = {
  caption: 'A diagram, not to scale. The ball is a magnetar and the loops are its magnetic field. When the strain cracks the crust, the field snaps into a new shape and a flash of gamma rays spreads outward at the speed of light. Then the strain slowly builds again.',
  stillAt: 3.4,
  draw({ ctx, w, h, t, say }) {
    backdrop(ctx, w, h, 0.3);
    const tt = t % 8, cx = w / 2, cy = h * 0.4, r = Math.min(w * 0.05, h * 0.07), strain = clamp(tt / 3, 0, 1), after = tt - 3, flash = after > 0 ? Math.exp(-after / 0.5) : 0;
    const twist = after > 0 ? 0.25 * Math.exp(-after / 1.2) : strain * 0.25;
    ctx.lineWidth = 1.2;
    for (let i = 1; i <= 4; i++) for (const side of [-1, 1]) {
      const L = r * (1.6 + i * 1.5); ctx.strokeStyle = `rgba(185,167,255,${0.6 - i * 0.09})`; ctx.beginPath();
      for (let j = 0; j <= 40; j++) { const th = (j / 40) * Math.PI, rr = L * Math.sin(th) ** 2, a = th + twist * Math.sin(th * 2 + i) * side, x = cx + side * rr * Math.sin(a), y = cy - rr * Math.cos(a) * 0.9; if (j === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y); }
      ctx.stroke();
    }
    if (after > 0 && after < 3) { const R = after * Math.min(w, h) * 0.45; ctx.strokeStyle = `rgba(255,255,255,${clamp(1 - after / 3, 0, 1)})`; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(cx, cy, R, 0, TAU); ctx.stroke(); }
    const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r * (1.5 + flash * 5)); g.addColorStop(0, '#fff'); g.addColorStop(0.35, flash > 0.05 ? '#fff' : '#cfd6ff'); g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, r * (1.5 + flash * 5), 0, TAU); ctx.fill();
    dot(ctx, cx, cy, r, '#dfe4ff');
    if (after > 0) { ctx.strokeStyle = '#3a3f66'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(cx - r * 0.5, cy - r * 0.2); ctx.lineTo(cx - r * 0.1, cy + r * 0.1); ctx.lineTo(cx + r * 0.1, cy - r * 0.15); ctx.lineTo(cx + r * 0.55, cy + r * 0.3); ctx.stroke(); }
    label(ctx, after < 0 ? 'The strain builds' : after < 2.5 ? 'The crust cracks: a flash of gamma rays' : 'Quiet again', cx, h * 0.8, { align: 'center', colour: after >= 0 && after < 2.5 ? ACCENT : SOFT, size: 11 });
    say('A starquake', 'In a tenth of a second, the Sun’s output for 150,000 years');
  },
};

// ---- 4. the jets of a burst
const jets: Scene = {
  caption: 'A diagram, not to scale. The centre of a very heavy star has fallen in to make a black hole, and two thin jets burst out through the star in opposite directions. The gamma rays travel along the jets. Someone looking down a jet sees a burst. Someone off to the side sees nothing until the star itself blows apart.',
  stillAt: 5,
  draw({ ctx, w, h, t, say }) {
    backdrop(ctx, w, h, 0.3);
    const wide = w > 560, cx = w * 0.5, cy = h * 0.4, r = Math.min(w * 0.11, h * 0.2), k = clamp((t % 9) / 4, 0, 1), len = k * w * 0.46, ang = 0.09;
    for (const s of [-1, 1]) {
      const g = ctx.createLinearGradient(cx, 0, cx + s * len, 0); g.addColorStop(0, 'rgba(255,255,255,.95)'); g.addColorStop(0.5, 'rgba(185,167,255,.7)'); g.addColorStop(1, 'rgba(185,167,255,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + s * len, cy - len * ang); ctx.lineTo(cx + s * len, cy + len * ang); ctx.fill();
    }
    const sg = ctx.createRadialGradient(cx, cy, r * 0.1, cx, cy, r); sg.addColorStop(0, '#fff'); sg.addColorStop(0.25, '#bcd3ff'); sg.addColorStop(1, 'rgba(120,150,255,.12)');
    ctx.fillStyle = sg; ctx.beginPath(); ctx.arc(cx, cy, r, 0, TAU); ctx.fill();
    dot(ctx, cx, cy, Math.max(2.5, r * 0.09), '#000');
    dot(ctx, w * 0.95, cy, 3, '#5f8fc4'); label(ctx, wide ? 'In the beam: a burst is seen' : 'Sees a burst', w * 0.96, cy + 18, { align: 'right', colour: ACCENT, size: 11 });
    dot(ctx, cx + r * 0.6, h * 0.08, 3, '#5f8fc4'); label(ctx, wide ? 'Off to the side: nothing is seen' : 'Sees nothing', cx + r * 0.6 + 8, h * 0.08 + 4, { align: 'left', colour: SOFT, size: 11 });
    label(ctx, 'A dying star', cx, cy + r + 16, { align: 'center', colour: SOFT, size: 11 });
    say('Two thin jets', 'A burst is seen only if a jet points at us');
  },
};

const boat = photoScene({ src: '/img/learn/grb-221009a-swift-rings.jpg', caption: RINGS, say: ['The brightest burst ever recorded', '9 October 2022, from 2.4 billion light years away'], tag: 'X-ray picture', zoom: [1, 1.1], focus: [0.5, 0.5] });

const kilonova = photoScene({
  src: '/img/learn/kilonova-ngc4993-hubble.jpg',
  caption: 'A real photograph: the galaxy NGC 4993, 130 million light years away, by the Hubble Space Telescope. The boxed dot is the glow left by two neutron stars that crashed together, and the three panels show it fading between 22 and 28 August 2017. The box and dates are part of the published picture. Credit: NASA and ESA. Acknowledgment: A.J. Levan (U. Warwick), N.R. Tanvir (U. Leicester), and A. Fruchter and O. Fox (STScI), CC BY 4.0.',
  say: ['Two neutron stars collided here', 'A short burst, and a glow rich in new gold'], zoom: [1, 1.1], focus: [0.5, 0.45],
});

export const scenes: Scene[] = [magnets, ring, quake, jets, boat, kilonova];
