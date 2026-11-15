/**
 * Pictures for the lesson "The distance ladder", one to each step of its first look. All are drawings of the
 * idea and not to scale. The only figure they state is the lesson's: Hubble's Cepheid in Andromeda beats
 * about once a month (the photographs show 31.4 days).
 */
import { type Scene, SOFT, ACCENT, FAINT, clamp, label, stars, rng } from '../stage';
import { TAU, dot, line } from '../kit';

const backdrop = stars(90, 1923);
const room = (w: number) => (w > 760 ? w * 0.34 : 0);

const glow = (ctx: CanvasRenderingContext2D, x: number, y: number, r: number, rgb: string, a: number) => { const g = ctx.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, `rgba(${rgb},${a})`); g.addColorStop(1, `rgba(${rgb},0)`); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill(); };
// brightness over one beat, 0 to 1: a quick rise and a slower fade, as a Cepheid does
const beat = (u: number) => { const f = u - Math.floor(u); return f < 0.25 ? f / 0.25 : 1 - (f - 0.25) / 0.75; };

// ---- 1. a variable star brightens and fades (the hero)
export const lens: Scene = {
  caption: 'A variable star, a drawing of the idea: it grows brighter, fades and brightens again, over and over. The line below follows its brightness.',
  stillAt: 3,
  draw({ ctx, w, h, t, say }) {
    backdrop(ctx, w, h, 0.25);
    const rx = room(w), cx = rx + (w - rx) / 2, cy = h * (rx ? 0.36 : 0.22), b = beat(t / 4);
    glow(ctx, cx, cy, 14 + b * 40, '255,225,170', 0.15 + b * 0.5); dot(ctx, cx, cy, 4 + b * 3, '#fff1cf');
    const gw = Math.min((w - rx) * 0.6, 420), gx = cx - gw / 2, gy = cy + 76, gh = 46;
    line(ctx, [gx, gy + gh, gx + gw, gy + gh], 'rgba(236,231,220,.25)');
    ctx.strokeStyle = 'rgba(233,196,138,.9)'; ctx.lineWidth = 1.5; ctx.beginPath();
    for (let i = 0; i <= 120; i++) { const u = i / 120 * 3, x = gx + (i / 120) * gw, y = gy + gh - beat(u + t / 4) * gh; i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
    ctx.stroke();
    label(ctx, 'Its brightness over time', cx, gy + gh + 22, { align: 'center', colour: ACCENT, size: 10 });
    say('Most stars look the same night after night', 'Some grow brighter, fade and brighten again');
  },
};

// ---- 2. a Cepheid: the slower the beat, the brighter
const beatScene: Scene = {
  caption: 'Two Cepheids, a drawing of the idea: each swells and shrinks on a steady beat. The one that beats slowly is really the brighter star. The sizes and speeds are only for show.',
  stillAt: 4,
  draw({ ctx, w, h, t, say }) {
    backdrop(ctx, w, h, 0.2);
    const narrow = w < 520, xs = narrow ? [w * 0.28, w * 0.72] : [w * 0.3, w * 0.7], cy = h * 0.3;
    [[1.6, 0.45, 'Quick beat', 'Fainter'], [4, 1, 'Slow beat', 'Brighter']].forEach(([p, br, n, m], i) => {
      const b = beat(t / (p as number)), x = xs[i], r = (8 + b * 5) * (0.8 + (br as number) * 0.5);
      glow(ctx, x, cy, r * 4.5, '255,225,170', (0.2 + b * 0.25) * (br as number)); dot(ctx, x, cy, r, '#fff1cf');
      label(ctx, n as string, x, cy + 70, { align: 'center', colour: SOFT, size: 10 }); label(ctx, m as string, x, cy + 90, { align: 'center', colour: ACCENT, size: 10 });
    });
    say('A Cepheid swells and shrinks on a steady beat', 'The slower the beat, the brighter the star really is');
  },
};

// ---- 3. a torch nearby or a lighthouse far off
const lighthouse: Scene = {
  caption: 'A light in the dark, a drawing of the idea. A faint light could be a weak torch close by or a strong lighthouse far off, and the eye cannot tell which. If you know how bright it really is, how faint it looks gives its distance.',
  stillAt: 3,
  draw({ ctx, w, h, say }) {
    backdrop(ctx, w, h, 0.15);
    const y = h * 0.3, xe = w * 0.12, xn = w * 0.5, xf = w * 0.88;
    dot(ctx, xe, y, 4, '#9fc0e6'); label(ctx, 'You', xe, y + 24, { align: 'center', colour: SOFT, size: 10 });
    glow(ctx, xn, y, 14, '255,225,170', 0.5); dot(ctx, xn, y, 2.5, '#fff1cf'); label(ctx, 'A weak torch, close', xn, y + 36, { align: 'center', colour: ACCENT, size: 10 });
    glow(ctx, xf - 6, y, 14, '255,225,170', 0.5); dot(ctx, xf - 6, y, 2.5, '#fff1cf'); label(ctx, 'A strong lighthouse, far', xf - 6, y + 56, { align: w < 520 ? 'right' : 'center', colour: ACCENT, size: 10 });
    label(ctx, 'Both can look equally faint', w / 2, y - 60, { align: 'center', colour: SOFT, size: 10 });
    say('A light in the dark does not tell you how far away it is', 'Know how bright it really is and its faintness gives the distance');
  },
};

// ---- 4. Hubble's Cepheid in Andromeda
const far: Scene = {
  caption: 'The 1923 discovery, a drawing of the idea and not to scale. A Cepheid in the hazy patch called Andromeda beat about once a month, so it had to be very bright, yet it looked very faint. It was far too distant to be part of our own galaxy: Andromeda was a galaxy of its own.',
  stillAt: 5,
  draw({ ctx, w, h, t, say }) {
    backdrop(ctx, w, h, 0.15);
    const y = h * 0.3, xo = w * 0.22, xa = w * 0.8, R = Math.min(w * 0.14, 60);
    ctx.save(); ctx.translate(xo, y); ctx.scale(1, 0.4); glow(ctx, 0, 0, R, '200,220,255', 0.45); ctx.restore(); label(ctx, 'Our galaxy', xo, y + R * 0.4 + 26, { align: 'center', colour: SOFT, size: 10 });
    ctx.save(); ctx.translate(xa, y); ctx.rotate(-0.4); ctx.scale(1, 0.35); glow(ctx, 0, 0, R, '200,220,255', 0.4); ctx.restore(); label(ctx, 'Andromeda', xa, y + R * 0.4 + 26, { align: 'center', colour: ACCENT, size: 10 });
    const b = beat(t / 3); dot(ctx, xa + 6, y - 6, 1.4 + b * 1.2, '#fff1cf');
    line(ctx, [xo + R * 0.9, y, xa - R * 0.9, y], 'rgba(236,231,220,.25)');
    label(ctx, 'Very faint, yet a slow beat: far too distant', w / 2, y - 70, { align: 'center', colour: SOFT, size: 10 });
    say('Hubble found a Cepheid in Andromeda in 1923', 'It was far outside our own galaxy');
  },
};

// ---- 5. four photographs of the beat
const curve: Scene = {
  caption: 'One whole beat of a Cepheid, drawn as a graph of its brightness, a drawing of the idea. The four photographs of Hubble’s star were taken on four dates: faint in the first two, bright in the last two, and the star goes through the whole beat every 31.4 days.',
  stillAt: 4,
  draw({ ctx, w, h, t, say }) {
    backdrop(ctx, w, h, 0.15);
    const gx = w * 0.1, gw = w * 0.8, gy = h * 0.12, gh = h * 0.3, k = clamp(t / 3, 0, 1);
    line(ctx, [gx, gy + gh, gx + gw, gy + gh], 'rgba(236,231,220,.25)'); line(ctx, [gx, gy, gx, gy + gh], 'rgba(236,231,220,.25)');
    ctx.strokeStyle = 'rgba(233,196,138,.9)'; ctx.lineWidth = 1.5; ctx.beginPath();
    for (let i = 0; i <= 100 * k; i++) { const x = gx + (i / 100) * gw, y = gy + gh - 4 - beat(i / 100) * (gh - 8); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
    ctx.stroke();
    if (k > 0.99) [0, 0.07, 0.2, 0.27].forEach((u) => dot(ctx, gx + u * gw, gy + gh - 4 - beat(u) * (gh - 8), 4.5, '#fff1cf'));
    label(ctx, 'One whole beat: 31.4 days', gx + gw / 2, gy + gh + 24, { align: 'center', colour: ACCENT, size: 10 });
    label(ctx, 'Brighter', gx - 4, gy - 8, { align: 'left', colour: FAINT, size: 9 });
    say('Four photographs of one star', 'Faint, faint, bright, bright: one whole beat every 31.4 days');
  },
};

// one picture to each step of the first look (five steps; a photograph shares the step of the paragraph after it)
export const scenes: Scene[] = [lens, beatScene, lighthouse, far, curve];
