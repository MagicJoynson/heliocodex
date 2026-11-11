/**
 * Pictures for the lesson "Stars that change". The photographs are real. The drawings show a star
 * beside a graph of its light: Delta Cephei pulsing, Mira fading out of sight and back, and the two
 * stars of Algol hiding each other. The periods and the sizes of the changes are the published ones.
 * The stars themselves are drawings of the idea and are not to scale.
 */
import { type Scene, INK, SOFT, FAINT, ACCENT, clamp, mix, label, stars, nf } from '../stage';
import { TAU, photoScene, sun, dot, line } from '../kit';

const backdrop = stars(130, 88);

/** A graph of light against time, with a marker at the present moment. `f` gives height, 0 to 1, for a phase. */
function graph(ctx: CanvasRenderingContext2D, w: number, h: number, f: (p: number) => number, phase: number, cycles: number, top: string, bottom: string): void {
  const x0 = w * 0.1, x1 = w * 0.92, y0 = h * 0.9, y1 = h * 0.64, now = x0 + (x1 - x0) * 0.68;
  line(ctx, [x0, y0, x1, y0], 'rgba(236,231,220,.22)'); line(ctx, [x0, y0, x0, y1 - 6], 'rgba(236,231,220,.22)');
  label(ctx, top, x0, y1 - 16, { colour: FAINT }); label(ctx, bottom, x0, y0 + 13, { colour: FAINT });
  ctx.beginPath();
  for (let x = x0; x <= now; x += 2) { const p = phase - ((now - x) / (x1 - x0)) * cycles, y = mix(y0, y1, f(((p % 1) + 1) % 1)); if (x === x0) ctx.moveTo(x, y); else ctx.lineTo(x, y); }
  ctx.strokeStyle = ACCENT; ctx.lineWidth = 1.6; ctx.stroke();
  dot(ctx, now, mix(y0, y1, f(((phase % 1) + 1) % 1)), 4, INK);
}

export const lens = photoScene({
  src: '/img/learn/rs-puppis-hubble.jpg',
  caption: 'A real photograph: RS Puppis, a pulsing star about 6,500 light years away, by the Hubble Space Telescope. Credit: NASA, ESA and the Hubble Heritage Team (STScI/AURA)-Hubble/Europe Collaboration. Acknowledgment: H. Bond (STScI and Penn State University), CC BY 4.0.',
  say: ['', ''], hero: true, zoom: [1, 1.1], focus: [0.5, 0.5],
});

// ---- 1. a star that is not steady
const rsPuppis = photoScene({
  src: '/img/learn/rs-puppis-hubble.jpg',
  caption: 'A real photograph: RS Puppis, by the Hubble Space Telescope. Each time the star brightens, the light travels out through the dust round it and lights it shell by shell. Credit: NASA, ESA and the Hubble Heritage Team (STScI/AURA)-Hubble/Europe Collaboration. Acknowledgment: H. Bond (STScI and Penn State University), CC BY 4.0. The mark was added here.',
  say: ['This star brightens and fades every 40 days or so', 'At its brightest it gives almost five times the light'],
  zoom: [0.96, 1.08], pointers: [{ at: [0.5, 0.5], to: [0.76, 0.16], text: 'One star, never steady' }],
});

// ---- 2. a star that breathes: Delta Cephei
const cepheid = (p: number) => (p < 0.28 ? p / 0.28 : 1 - (p - 0.28) / 0.72); // quick to brighten, slow to fade
const pulseScene: Scene = {
  caption: 'Delta Cephei swelling and shrinking, with a graph of its light. It takes 5.366 days over each pulse, and at its brightest gives about twice the light it does at its faintest. A drawing: the change in size is exaggerated, and the days are speeded up.',
  stillAt: 1.2,
  draw({ ctx, w, h, t, say }) {
    backdrop(ctx, w, h, 0.5);
    const P = 5.366, days = t * 1.1, p = (days / P) % 1, b = cepheid(p), s = Math.min(w, h);
    // widest a little after brightest, as a pulsing star is
    const size = 0.5 + 0.5 * Math.sin((p - 0.3) * TAU);
    sun(ctx, w / 2, h * 0.32, s * mix(0.085, 0.105, size), mix(0.55, 1, b), b > 0.5 ? '255,236,190' : '255,214,150');
    graph(ctx, w, h, cepheid, days / P, 3, 'Brightest', 'Faintest');
    say(`Day ${nf(days % P, 1)} of 5.4`, b > 0.75 ? 'Near its brightest: about twice the light' : b < 0.25 ? 'Near its faintest' : p < 0.28 ? 'Brightening quickly' : 'Fading slowly');
  },
};

// ---- 3. Mira
const mira = (p: number) => 0.5 + 0.5 * Math.cos((p < 0.38 ? p / 0.38 * 0.5 + 0.5 : (p - 0.38) / 0.62 * 0.5) * TAU); // 1 at p = 0.38
const miraScene: Scene = {
  caption: 'Mira over its cycle of about 332 days, with a graph of its brightness in magnitudes, the astronomer’s scale on which a bigger number is fainter. The dashed line is about the faintest the eye can see on a dark night. A drawing: Mira’s real peaks differ from one cycle to the next.',
  stillAt: 4.2,
  draw({ ctx, w, h, t, say }) {
    backdrop(ctx, w, h, 0.55);
    const P = 332, days = t * 30, p = (days / P) % 1, k = mira(p), mag = mix(10, 3, k), seen = mag <= 6, s = Math.min(w, h);
    // brightness the eye would see, pressed into a range a screen can show
    sun(ctx, w / 2, h * 0.3, s * mix(0.012, 0.075, k * k), mix(0.25, 1, k), '255,170,120');
    if (!seen) label(ctx, 'Too faint to see without a telescope', w / 2, h * 0.3 + s * 0.09, { align: 'center', colour: SOFT });
    graph(ctx, w, h, mira, days / P, 2.2, 'Magnitude 3', 'Magnitude 10');
    const x0 = w * 0.1, x1 = w * 0.92, y6 = mix(h * 0.9, h * 0.64, (10 - 6) / 7);
    line(ctx, [x0, y6, x1, y6], 'rgba(236,231,220,.4)', 1, [3, 4]); label(ctx, 'Eye’s limit', x1, y6 - 8, { align: 'right', colour: FAINT });
    say(`Day ${nf(Math.floor(days % P))} of 332: magnitude ${nf(mag, 1)}`, seen ? 'You can see it with your own eyes' : 'It has gone from the sky as the eye sees it');
  },
};

// ---- 4. Algol
const algolLight = (p: number) => { const d = Math.min(p, 1 - p), e = Math.abs(p - 0.5); return d < 0.066 ? mix(0.3, 1, clamp(d / 0.066) ** 2) : e < 0.066 ? mix(0.94, 1, clamp(e / 0.066) ** 2) : 1; };
const algolScene: Scene = {
  caption: 'The two stars of Algol, seen almost edge on as we see them, with a graph of their light added together. Every 2.867 days the fainter star covers most of the brighter one, and the light drops to about a third for a few hours. A drawing of the idea, not to scale, and no telescope can show the two apart like this.',
  stillAt: 0,
  draw({ ctx, w, h, t, say }) {
    backdrop(ctx, w, h, 0.5);
    const P = 2.867, days = t * 0.42 + P * 0.93, p = (days / P) % 1, s = Math.min(w, h), cx = w / 2, cy = h * 0.3, a = p * TAU, R = s * 0.2;
    const bx = cx - Math.sin(a) * R * 0.3, by = cy + Math.cos(a) * R * 0.02, fx = cx + Math.sin(a) * R * 0.7, fy = cy - Math.cos(a) * R * 0.05;
    const bright = () => sun(ctx, bx, by, s * 0.042, 1, '215,228,255'), faint = () => { dot(ctx, fx, fy, s * 0.052, '#b8672f'); dot(ctx, fx - s * 0.012, fy - s * 0.012, s * 0.034, 'rgba(226,140,80,.55)'); };
    if (Math.cos(a) > 0) { bright(); faint(); } else { faint(); bright(); }
    graph(ctx, w, h, algolLight, days / P, 2.4, 'Usual brightness', 'A third');
    const dip = Math.min(p, 1 - p) < 0.066;
    say(dip ? 'The fainter star is in front' : Math.abs(p - 0.5) < 0.066 ? 'The brighter star is in front: hardly any change' : 'Both stars in view', dip ? 'Algol drops to about a third of its usual light' : 'One circuit takes 2 days and 21 hours');
  },
};

// ---- 5. Betelgeuse
const betelgeuse = photoScene({
  src: '/img/learn/betelgeuse-dimming-vlt.jpg',
  caption: 'Real photographs: the face of Betelgeuse in January 2019 and in December 2019, by the SPHERE instrument on ESO’s Very Large Telescope. The dates are part of the published picture. Credit: ESO/M. Montargès et al., CC BY 4.0.',
  say: ['Betelgeuse before it faded, and during', 'A cloud of its own dust hid the lower part of the star'],
  zoom: [1, 1.04], focus: [0.5, 0.5],
});

// ---- 6. the Sun, for comparison
const steadyScene: Scene = {
  caption: 'How much the light of each star changes, drawn as bars. The whole bar is the star at its brightest, and the filled part is the light left at its faintest. The Sun’s change of about one part in a thousand is too small to show. Mira and Algol were worked out here from the published magnitudes.',
  stillAt: 3,
  draw({ ctx, w, h, t, say }) {
    backdrop(ctx, w, h, 0.35);
    const rows: [string, number, string][] = [['The Sun', 0.999, 'Changes by 0.1 per cent'], ['Delta Cephei', 0.5, 'Falls to a half'], ['Betelgeuse, early 2020', 0.36, 'Fell to about a third'], ['Algol', 0.3, 'Falls to about a third'], ['Mira', 1 / 600, 'Falls to about one part in 600']];
    const x0 = w * 0.08, x1 = w * 0.92, k = clamp(t / 2.5), i = Math.floor(t / 3) % rows.length;
    rows.forEach(([name, low, _note], j) => {
      const y = h * (0.14 + j * 0.16), full = x1 - x0, lowX = x0 + full * mix(1, low, k);
      label(ctx, name, x0, y - 12, { colour: j === i ? INK : SOFT });
      line(ctx, [x0, y, x1, y], 'rgba(236,231,220,.14)', 7);
      line(ctx, [x0, y, Math.max(lowX, x0 + 1.5), y], j === 0 ? '#ffd68c' : ACCENT, 7);
      line(ctx, [x1, y - 7, x1, y + 7], 'rgba(236,231,220,.5)');
    });
    label(ctx, 'Filled: the light left at its faintest', x0, h * 0.94, { colour: FAINT });
    say(rows[i][0], rows[i][2]);
  },
};

export const scenes: Scene[] = [rsPuppis, pulseScene, miraScene, algolScene, betelgeuse, steadyScene];
