/**
 * Pictures for the lesson "Giants and supergiants". Four are real pictures. The two drawings are
 * to scale, apart from the smallest dots, which would otherwise be too small to see.
 */
import { type Scene, SOFT, ACCENT, clamp, ease, mix, label, stars } from '../stage';
import { TAU, photoScene, dot } from '../kit';

const backdrop = stars(80, 1920);
const ANTARES = 'A real picture of the face of another star: the red supergiant Antares, 550 light years away, built up from four telescopes working as one at the European Southern Observatory in 2017. Credit: ESO/K. Ohnaka, CC BY 4.0.';

export const lens = photoScene({ src: '/img/learn/antares-surface-vlti.jpg', caption: ANTARES, say: ['', ''], hero: true, cover: true, zoom: [1.25, 1.35], focus: [0.2, 0.5] });

function disc(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, inner: string, outer: string) {
  const g = ctx.createRadialGradient(x, y, r * 0.1, x, y, r); g.addColorStop(0, inner); g.addColorStop(0.92, outer); g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill();
}

// ---- 1. the Sun swells
const PLANETS: [string, number][] = [['Mercury', 83], ['Venus', 155], ['The Earth', 215]];
const swell: Scene = {
  caption: 'A drawing to scale. The three rings are the paths of Mercury, Venus and the Earth as they are today. The Sun in the middle grows from its present size to about 250 times as wide, which theory says it will reach in about 5 billion years. The paths of the planets will widen a little by then, which is not drawn.',
  stillAt: 8,
  draw({ ctx, w, h, t, say }) {
    backdrop(ctx, w, h, 0.25);
    const cx = w / 2, cy = h * 0.37, unit = Math.min(w * 0.42, h * 0.33) / 262, k = ease(clamp((t - 1) / 6, 0, 1)), R = Math.max(1.6, unit * mix(1, 250, k));
    const c = (a: number, b: number) => Math.round(mix(a, b, k));
    disc(ctx, cx, cy, R * 1.04, `rgb(255,${c(244, 190)},${c(200, 120)})`, `rgb(${c(255, 226)},${c(214, 96)},${c(106, 60)})`);
    PLANETS.forEach(([name, au], i) => {
      const r = au * unit; ctx.strokeStyle = R > r ? 'rgba(20,10,5,.45)' : 'rgba(236,231,220,.35)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(cx, cy, r, 0, TAU); ctx.stroke();
      const a = -0.5 + i * 0.5 + t * (0.5 - i * 0.14); dot(ctx, cx + Math.cos(a) * r, cy + Math.sin(a) * r, 2.2, R > r ? '#3a1d10' : '#cfd8e6');
      label(ctx, name, cx + r * 0.72 + 5, cy - r * 0.72 - 3, { align: 'left', colour: R > r ? '#2a1408' : SOFT, size: 10 });
    });
    label(ctx, k < 0.05 ? 'The Sun today' : k < 0.99 ? `${Math.round(mix(1, 250, k))} times as wide` : 'The Sun as a red giant', cx, cy + 262 * unit + 15, { align: 'center', colour: ACCENT, size: 11 });
    say('The Sun, 5 billion years from now', 'Swollen past Venus, and perhaps past the Earth');
  },
};

// ---- 2. sizes, nested
const STARS: [string, number, string, string][] = [['Antares', 680, '#ffb07a', '#d9603f'], ['Rigel', 74, '#ffffff', '#bcd3ff'], ['Aldebaran', 45, '#ffd9a8', '#e8935a'], ['Arcturus', 25, '#ffe2b0', '#eda35f'], ['The Sun', 1, '#fff3c9', '#ffd76a']];
const parade: Scene = {
  caption: 'A drawing to scale of five stars, each touching the same point on the left so that their widths can be compared. The view pulls back until the supergiant Antares fits. Arcturus and Aldebaran are red giants and Rigel is a blue supergiant. The Sun is the small dot at the left, drawn larger than it should be once the view has pulled back.',
  stillAt: 9,
  draw({ ctx, w, h, t, say }) {
    backdrop(ctx, w, h, 0.2);
    const wide = w > 560, x0 = w * 0.06, y = h * 0.4, maxR = Math.min((w * 0.88) / 2, h * 0.36), k = ease(clamp((t - 2.5) / 5, 0, 1)), span = 80 * Math.pow(680 / 80, k), px = maxR / span;
    ctx.save(); ctx.beginPath(); ctx.rect(0, 0, w, h * 0.77); ctx.clip();
    for (const [, r, inner, outer] of STARS) { const rr = Math.max(1.5, r * px); disc(ctx, x0 + rr, y, rr, inner, outer); }
    ctx.restore();
    label(ctx, wide ? 'Widths, the Sun = 1:  Arcturus 25,  Aldebaran 45,  Rigel 74 (blue-white),  Antares 680' : 'Arcturus 25, Aldebaran 45, Rigel 74, Antares 680', w / 2, h * 0.86, { align: 'center', colour: SOFT, size: wide ? 11 : 10 });
    say('Giants, and then supergiants', 'Antares is 680 times as wide as the Sun');
  },
};

const antares = photoScene({ src: '/img/learn/antares-surface-vlti.jpg', caption: ANTARES, say: ['The face of Antares', 'In the Sun’s place it would reach well beyond Mars'], zoom: [0.95, 1.08], focus: [0.5, 0.5], tag: 'Real picture' });

const dimming = photoScene({
  src: '/img/learn/betelgeuse-dimming-vlt.jpg',
  caption: 'Real photographs: the face of Betelgeuse in January 2019 and in December 2019, by the SPHERE instrument on ESO’s Very Large Telescope. The dates are part of the published picture. Credit: ESO/M. Montargès et al., CC BY 4.0.',
  say: ['Betelgeuse, before and during its fading', 'A cloud of its own dust hid part of its face'], zoom: [1, 1.05], focus: [0.5, 0.5], tag: 'Two real pictures',
});

const woh = photoScene({
  src: '/img/learn/woh-g64-vlti.jpg',
  caption: 'A real picture, built up from telescopes working as one at the European Southern Observatory and published on 21 November 2024: the red supergiant WOH G64, 160,000 light years away in the Large Magellanic Cloud. The bright oval is the star wrapped in a cocoon of its own dust, and the faint ring is more dust further out. The colour was chosen. Credit: ESO/K. Ohnaka et al., CC BY 4.0.',
  say: ['One of the biggest stars known', 'The first star in another galaxy to be seen close up'], zoom: [0.95, 1.08], focus: [0.5, 0.5], tag: 'Real picture',
});

const crab = photoScene({
  src: '/img/learn/crab-nebula-hubble.jpg',
  caption: 'A real photograph: the Crab Nebula, 6,500 light years away, by the Hubble Space Telescope. It is the wreck of a heavy star whose explosion people saw in the year 1054. Credit: NASA, ESA, J. Hester and A. Loll (Arizona State University), CC BY 4.0.',
  say: ['How a supergiant ends', 'The wreck of one that blew up in 1054'], cover: true, zoom: [1, 1.12], focus: [0.5, 0.5],
});

export const scenes: Scene[] = [swell, parade, antares, dimming, woh, crab];
