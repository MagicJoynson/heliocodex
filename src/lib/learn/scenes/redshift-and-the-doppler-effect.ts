/**
 * Pictures for the lesson "Redshift and the Doppler effect". Two are real telescope pictures. The
 * other four are diagrams, none of them to scale.
 */
import { type Scene, SOFT, ACCENT, clamp, ease, label, stars } from '../stage';
import { TAU, photoScene, dot, line } from '../kit';

const backdrop = stars(80, 1842);
const HUDF = 'A real photograph: the Hubble Ultra Deep Field, with nearly 10,000 galaxies. The smallest, reddest ones are the most distant, and their light has been stretched the most. Credit: NASA, ESA, S. Beckwith (STScI) and the HUDF Team, CC BY 4.0.';
const M31 = 'A real photograph: the Andromeda galaxy, pieced together from more than 600 pictures taken by the Hubble Space Telescope over ten years. The jagged edge is where the separate pictures stop. Credit: NASA, ESA, B. Williams (University of Washington), CC BY 4.0.';

export const lens = photoScene({ src: '/img/learn/hubble-ultra-deep-field.jpg', caption: HUDF, say: ['', ''], hero: true, cover: true, zoom: [1.3, 1.5], focus: [0.4, 0.6] });

/** A colour for a wavelength in nanometres, good enough for a drawing of a rainbow. */
function hue(nm: number): string {
  const f = clamp((nm - 400) / 300, 0, 1);
  return `hsl(${Math.round(270 - f * 270)}, 85%, ${nm < 420 || nm > 680 ? 38 : 52}%)`;
}

// ---- 1. a siren and its waves
const siren: Scene = {
  caption: 'A diagram, not to scale. The dot is a siren moving to the right. Each ring is one wave of sound, spreading from the place where the siren was when it made it. The rings are crowded together ahead of the siren and spread out behind it.',
  stillAt: 5.2,
  draw({ ctx, w, h, t, say }) {
    const wide = w > 560, y = h * 0.4, x0 = w * 0.18, x1 = w * 0.82, period = 8, tt = t % period, speed = (x1 - x0) / period, wave = speed * 2.6, gap = 0.42;
    const sx = x0 + speed * tt;
    ctx.save(); ctx.beginPath(); ctx.rect(0, 0, w, h * 0.78); ctx.clip();
    const fade = clamp(Math.min(tt, period - tt) / 0.6, 0, 1);
    for (let born = Math.ceil((tt - 5) / gap) * gap; born <= tt; born += gap) {
      const r = (tt - born) * wave, a = clamp(1 - r / (w * 0.7), 0, 1) * 0.55 * fade;
      if (a <= 0) continue;
      ctx.strokeStyle = `rgba(236,231,220,${a})`; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(x0 + speed * born, y, r, 0, TAU); ctx.stroke();
    }
    ctx.restore();
    dot(ctx, sx, y, 5, ACCENT);
    dot(ctx, w * 0.05, y, 3, '#e2826b'); dot(ctx, w * 0.95, y, 3, '#8fb4ff');
    label(ctx, wide ? 'Behind: a lower note' : 'Lower note', w * 0.04, h * 0.72, { align: 'left', colour: '#e2826b', size: 11 });
    label(ctx, wide ? 'Ahead: a higher note' : 'Higher note', w * 0.96, h * 0.72, { align: 'right', colour: '#8fb4ff', size: 11 });
    say('A siren chases its own waves', 'Squeezed in front, stretched behind');
  },
};

// ---- 2. the lines in a spectrum, shifted
const LINES = [410.2, 434.0, 486.1, 656.3];
const ROWS: [string, string, number][] = [['Coming towards us', 'Towards us', -1], ['Standing still', 'Still', 0], ['Moving away', 'Moving away', 1]];
const lines: Scene = {
  caption: 'A diagram. Each band is the rainbow of a star, crossed by the four dark lines that hydrogen makes in visible light. In the middle band they are where they are measured in a laboratory. The shifts drawn are those of a star moving at a twentieth of the speed of light, far faster than any real star, so that they can be seen.',
  stillAt: 4,
  draw({ ctx, w, h, t, say }) {
    const wide = w > 560, x0 = w * 0.06, x1 = w * 0.94, top = h * 0.08, rowH = (h * 0.62) / 3, bandH = rowH * 0.46, X = (nm: number) => x0 + ((nm - 390) / 320) * (x1 - x0), k = ease(clamp((t - 0.6) / 2.2, 0, 1));
    ROWS.forEach(([long, short, dir], i) => {
      const y = top + i * rowH + rowH * 0.4;
      for (let x = x0; x < x1; x += 2) { ctx.fillStyle = hue(390 + ((x - x0) / (x1 - x0)) * 320); ctx.fillRect(x, y, 2.5, bandH); }
      for (const nm of LINES) { const x = X(nm * (1 + 0.05 * dir * k)); ctx.fillStyle = '#05060a'; ctx.fillRect(x - 1.5, y, 3, bandH); if (dir !== 0) { ctx.fillStyle = 'rgba(255,255,255,.35)'; ctx.fillRect(X(nm) - 0.5, y - 3, 1, 3); } }
      label(ctx, wide ? long : short, x0, y - 7, { align: 'left', colour: dir === 0 ? '#fff' : SOFT, size: wide ? 12 : 11 });
      if (dir !== 0 && k >= 0.99) label(ctx, dir < 0 ? 'Lines shifted to the blue' : 'Lines shifted to the red', x1, y - 7, { align: 'right', colour: dir < 0 ? '#8fb4ff' : '#e2826b', size: wide ? 12 : 10 });
    });
    say('The dark lines give it away', 'Every line moves the same way, by the same fraction');
  },
};

const andromeda = photoScene({ src: '/img/learn/andromeda-hubble-mosaic.jpg', caption: M31, say: ['Andromeda, measured in 1912', 'Coming towards us at about 300 km every second'], cover: true, zoom: [1, 1.14], focus: [0.4, 0.5] });

// ---- 4. light stretched as space grows
const stretch: Scene = {
  caption: 'A diagram, not to scale. A galaxy on the left sends out light towards us on the right. While the light is on its way, the space it is crossing grows, shown by the grid spreading out, and each wave is stretched with it. The same number of waves is drawn throughout.',
  stillAt: 6,
  draw({ ctx, w, h, t, say }) {
    backdrop(ctx, w, h, 0.25);
    const k = ease(clamp((t - 0.5) / 5, 0, 1)), cx = w / 2, y = h * 0.4, half = w * (0.16 + 0.28 * k), xa = cx - half, xb = cx + half, amp = Math.min(h * 0.09, 22), n = 7;
    for (let i = -8; i <= 8; i++) { const gx = cx + (i / 4) * half; if (gx > 4 && gx < w - 4) line(ctx, [gx, h * 0.12, gx, h * 0.68], 'rgba(236,231,220,.08)'); }
    const steps = 160; ctx.lineWidth = 2;
    for (let i = 0; i < steps; i++) {
      const f0 = i / steps, f1 = (i + 1) / steps;
      ctx.strokeStyle = hue(430 + 240 * k); ctx.beginPath();
      ctx.moveTo(xa + (xb - xa) * f0, y + Math.sin(f0 * n * TAU - t * 3) * amp); ctx.lineTo(xa + (xb - xa) * f1, y + Math.sin(f1 * n * TAU - t * 3) * amp); ctx.stroke();
    }
    dot(ctx, xa, y, 5, '#cdb8ff'); dot(ctx, xb, y, 4, '#5f8fc4');
    label(ctx, 'A far galaxy', xa, h * 0.66, { align: 'center', colour: SOFT, size: 11 }); label(ctx, 'Us', xb, h * 0.66, { align: 'center', colour: SOFT, size: 11 });
    label(ctx, k < 0.5 ? 'Blue when it set out' : 'Red by the time it arrives', cx, h * 0.12, { align: 'center', colour: hue(430 + 240 * k), size: 12 });
    say('Space grows, and stretches the light', 'The longer the journey, the redder the light');
  },
};

const jades = photoScene({
  src: '/img/learn/jades-gs-z14-0-webb.jpg',
  caption: 'A real photograph in infrared light by the James Webb Space Telescope, published on 30 May 2024. Infrared has no colour, so the colours were chosen. The box and the enlarged view of the galaxy JADES-GS-z14-0 are part of the published picture. Credit: NASA, ESA, CSA, STScI, B. Robertson (UC Santa Cruz), B. Johnson (CfA), S. Tacchella (Cambridge), P. Cargile (CfA), CC BY 4.0.',
  say: ['Light stretched to 15 times its length', 'It set out as ultraviolet and arrived as infrared'], zoom: [1, 1.25], focus: [0.72, 0.28], tag: 'Infrared photograph',
});

// ---- 6. a star swung to and fro by a planet
const wobble: Scene = {
  caption: 'A diagram, very far from scale. A planet and its star circle the point between them, seen from the side. Below is one dark line in the star’s light, which slides towards the blue as the star comes towards us and towards the red as it goes away. The real shift is millions of times smaller than drawn.',
  stillAt: 1.2,
  draw({ ctx, w, h, t, say }) {
    backdrop(ctx, w, h, 0.25);
    const wide = w > 560, cx = w / 2, y = h * 0.27, a = t * 1.1, R = Math.min(w * 0.3, 150), r = R * 0.12, tilt = 0.28;
    ctx.strokeStyle = 'rgba(236,231,220,.18)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.ellipse(cx, y, R, R * tilt, 0, 0, TAU); ctx.stroke();
    const px = cx + Math.cos(a) * R, py = y + Math.sin(a) * R * tilt, sx = cx - Math.cos(a) * r, sy = y - Math.sin(a) * r * tilt, v = Math.cos(a);
    const front = Math.sin(a) > 0; if (!front) dot(ctx, px, py, 3.5, '#9db7d8');
    const col = v > 0.15 ? '#ffb89a' : v < -0.15 ? '#bcd3ff' : '#ffe9c0';
    const g = ctx.createRadialGradient(sx, sy, 0, sx, sy, 26); g.addColorStop(0, col); g.addColorStop(0.4, col); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(sx, sy, 26, 0, TAU); ctx.fill();
    if (front) dot(ctx, px, py, 3.5, '#9db7d8');
    const bx0 = w * 0.12, bx1 = w * 0.88, by = h * 0.56, bh = Math.max(12, h * 0.07);
    for (let x = bx0; x < bx1; x += 2) { ctx.fillStyle = hue(440 + ((x - bx0) / (bx1 - bx0)) * 220); ctx.fillRect(x, by, 2.5, bh); }
    const lx = (bx0 + bx1) / 2 + v * (bx1 - bx0) * 0.12; ctx.fillStyle = '#05060a'; ctx.fillRect(lx - 2, by, 4, bh);
    ctx.fillStyle = 'rgba(255,255,255,.5)'; ctx.fillRect((bx0 + bx1) / 2 - 0.5, by - 4, 1, 4);
    label(ctx, v > 0.15 ? (wide ? 'The star is moving away from us' : 'Star moving away') : v < -0.15 ? (wide ? 'The star is coming towards us' : 'Star coming towards us') : 'Moving across', cx, by + bh + 16, { align: 'center', colour: v > 0.15 ? '#e2826b' : v < -0.15 ? '#8fb4ff' : SOFT, size: 11 });
    say('A planet gives itself away', 'It swings its star, and the star’s lines slide to and fro');
  },
};

export const scenes: Scene[] = [siren, lines, andromeda, stretch, jades, wobble];
