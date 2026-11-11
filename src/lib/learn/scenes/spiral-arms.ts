/**
 * Pictures for the lesson "Spiral arms". The three photographs are real. The two moving plans are
 * drawings of the idea, made with simple rules and not with a full model of a galaxy: in the first
 * every star keeps the same speed, and in the second every star follows a slightly oval path.
 */
import { type Scene, ACCENT, label, stars, rng } from '../stage';
import { TAU, photoScene, dot } from '../kit';

const backdrop = stars(90, 307);
const M51 = 'the Whirlpool Galaxy, M51, 25 million light years away, by the Hubble Space Telescope in January 2005. The colour is built from pictures taken through separate filters. Credit: NASA, ESA, S. Beckwith (STScI) and the Hubble Heritage Team (STScI/AURA), CC BY 4.0.';

export const lens = photoScene({ src: '/img/learn/whirlpool-m51-hubble.jpg', caption: `A real photograph: ${M51}`, say: ['', ''], hero: true, cover: true, zoom: [1, 1.1], focus: [0.42, 0.5] });

// ---- 1. the Whirlpool
const whirlpool = photoScene({
  src: '/img/learn/whirlpool-m51-hubble.jpg', caption: `A real photograph: ${M51}`,
  say: ['The Whirlpool Galaxy', 'Two arms, winding out from the middle'], zoom: [0.95, 1.1], focus: [0.42, 0.5],
});

// ---- 2. why fixed arms would wind up
const ARM = (() => { const r = rng(11), out: [number, number, number][] = []; for (let i = 0; i < 520; i++) { const a = 0.12 + 0.88 * r(), side = i % 2 ? Math.PI : 0; out.push([a, side + (r() - 0.5) * 0.16, r()]); } return out; })();
const winding: Scene = {
  caption: 'Two straight arms made of fixed stars, in a disc where every star moves at the same speed. The inner stars get round sooner, and in a few turns the arms are wound into a blur. A drawing made with that one simple rule, not a full model of a galaxy.',
  stillAt: 4.5,
  draw({ ctx, w, h, t, say }) {
    backdrop(ctx, w, h, 0.3);
    const cx = w / 2, cy = h * 0.4, R = Math.min(w * 0.4, h * 0.36), c = t % 13, turns = Math.max(0, c - 1) * 1.5;
    for (const [a, ph, b] of ARM) { const th = ph - (turns * TAU * 0.12) / a; dot(ctx, cx + Math.cos(th) * a * R, cy + Math.sin(th) * a * R * 0.92, 0.9 + b, `rgba(190,215,255,${0.45 + b * 0.5})`); }
    dot(ctx, cx, cy, 4, '#ffe9b8');
    label(ctx, `Turns of the outer edge: ${(turns * 0.12).toFixed(1)}`, cx, cy + R + 22, { align: 'center', colour: ACCENT });
    say('If an arm were a fixed string of stars', 'It would wind up within a few turns');
  },
};

// ---- 3. a pattern the stars pass through
const OVALS = (() => { const r = rng(23), out: [number, number, number][] = []; for (let i = 0; i < 2800; i++) out.push([0.16 + 0.84 * r(), r() * TAU, r()]); return out; })();
const jam: Scene = {
  caption: 'Every dot is a star on its own slightly oval path, and each oval is turned a little more than the one inside it. Where the paths crowd together, two arms appear. The stars keep moving and the arms stay where they are: follow the orange one. A drawing made with that simple rule, not a full model of a galaxy.',
  stillAt: 4,
  draw({ ctx, w, h, t, say }) {
    backdrop(ctx, w, h, 0.3);
    const cx = w / 2, cy = h * 0.4, R = Math.min(w * 0.4, h * 0.36), e = 0.36;
    const at = (a: number, m: number): [number, number] => { const tw = a * 5.2, x = Math.cos(m) * a, y = Math.sin(m) * a * (1 - e), c = Math.cos(tw), s = Math.sin(tw); return [cx + (x * c - y * s) * R, cy + (x * s + y * c) * R * 0.92]; };
    OVALS.forEach(([a, m0, b], i) => { const [x, y] = at(a, m0 - (t * 0.22) / a); if (i === 7) return; dot(ctx, x, y, 0.6 + b * 0.7, `rgba(190,215,255,${0.3 + b * 0.45})`); });
    const [hx, hy] = at(0.62, -(t * 0.22) / 0.62); dot(ctx, hx, hy, 4, ACCENT);
    dot(ctx, cx, cy, 4, '#ffe9b8');
    say('The arm is a pattern, like a traffic jam', 'Stars drift in, bunch up, and come out the other side');
  },
};

// ---- 4. reading the arm
const detail = photoScene({
  src: '/img/learn/whirlpool-m51-hubble.jpg', caption: `A real photograph: ${M51}`,
  say: ['Gas is squeezed as it enters the arm', 'Dark dust first, then pink clouds, then blue new stars'],
  cover: true, zoom: [1.5, 1.8], focus: [0.42, 0.5],
});

// ---- 5. a bar
const bar = photoScene({
  src: '/img/learn/ngc-1300-hubble.jpg',
  caption: 'A real photograph: the barred spiral galaxy NGC 1300, about 60 million light years away, by the Hubble Space Telescope. The colour is built from pictures taken through separate filters. Credit: NASA, ESA and the Hubble Heritage Team (STScI/AURA), CC BY 4.0.',
  say: ['A bar across the middle', 'An arm starts from each end of it'], zoom: [0.95, 1.1], focus: [0.5, 0.5],
});

// ---- 6. one like ours
const like = photoScene({
  src: '/img/learn/ngc-6744-eso.jpg',
  caption: 'A real photograph: the spiral galaxy NGC 6744, about 30 million light years away, taken with the 2.2-metre telescope at La Silla in Chile through four filters. The red marks glowing hydrogen gas. Credit: ESO, CC BY 4.0.',
  say: ['Nobody has seen our galaxy from outside', 'It is thought to look much like this one'], zoom: [0.95, 1.08], focus: [0.5, 0.5],
});

export const scenes: Scene[] = [whirlpool, winding, jam, detail, bar, like];
