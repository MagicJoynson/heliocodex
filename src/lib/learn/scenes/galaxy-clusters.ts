/**
 * Pictures for the lesson "Galaxy clusters". The two Hubble photographs and the Chandra X-ray
 * picture are real. The size comparison is to scale. The bars of seen and unseen mass and the
 * groups falling together are drawings of the idea.
 */
import { type Scene, SOFT, ACCENT, clamp, ease, label, stars, rng } from '../stage';
import { TAU, photoScene, dot, line } from '../kit';

const backdrop = stars(100, 401);
const COMA = 'A real photograph: part of the Coma Cluster, about 300 million light years away, by the Hubble Space Telescope. The colour is built from pictures taken through separate filters. Credit: NASA, ESA and the Hubble Heritage Team (STScI/AURA), with thanks to D. Carter and the Coma HST ACS Treasury Team, CC BY 4.0.';

export const lens = photoScene({ src: '/img/learn/coma-cluster-hubble.jpg', caption: COMA, say: ['', ''], hero: true, cover: true, zoom: [1, 1.1], focus: [0.6, 0.55] });

const coma = photoScene({ src: '/img/learn/coma-cluster-hubble.jpg', caption: COMA, say: ['Every smudge is a galaxy', 'The Coma Cluster holds thousands of them'], cover: true, zoom: [1, 1.12], focus: [0.6, 0.55] });

// ---- 2. size, to scale
const size: Scene = {
  caption: 'The Coma Cluster, more than 20 million light years across, with the Milky Way, 100,000 light years across, drawn to the same scale: the small orange mark. The scattered dots only stand for the cluster’s galaxies and are not a map of them.',
  stillAt: 3,
  draw({ ctx, w, h, t, say }) {
    backdrop(ctx, w, h, 0.3);
    const cx = w / 2, cy = h * 0.38, R = Math.min(w * 0.42, h * 0.33), r = rng(9), k = ease(clamp(t / 2, 0, 1));
    ctx.strokeStyle = 'rgba(236,231,220,.3)'; ctx.setLineDash([4, 6]); ctx.beginPath(); ctx.arc(cx, cy, R, 0, TAU); ctx.stroke(); ctx.setLineDash([]);
    for (let i = 0; i < 380 * k; i++) { const a = r() * TAU, d = Math.pow(r(), 1.6) * R * 0.96; dot(ctx, cx + Math.cos(a) * d, cy + Math.sin(a) * d * 0.94, 0.7 + r() * 0.9, `rgba(240,215,160,${0.35 + r() * 0.5})`); }
    const mw = Math.max(1.6, (2 * R) / 200), mx = cx - R * 0.5, my = cy + R * 0.55;
    ctx.fillStyle = ACCENT; ctx.fillRect(mx - mw / 2, my - mw / 2, mw, mw);
    line(ctx, [mx, my + 4, mx, my + 22], 'rgba(233,196,138,.7)'); label(ctx, 'The Milky Way, to scale', mx, my + 36, { align: 'center', colour: ACCENT });
    line(ctx, [cx - R, cy + R + 14, cx + R, cy + R + 14], 'rgba(236,231,220,.5)'); label(ctx, '20 million light years', cx, cy + R + 30, { align: 'center', colour: SOFT });
    say('The largest thing gravity holds together', '200 Milky Ways would fit across it, side by side');
  },
};

// ---- 3. hot gas
const gas = photoScene({
  src: '/img/learn/bullet-cluster-xray-chandra.jpg',
  caption: 'A real picture in X-rays, with the colour chosen for it: the hot gas of the Bullet Cluster, two clusters that have run through each other about 3.8 billion light years away, by NASA’s Chandra X-ray Observatory. The bright cone on the right is the gas of the smaller cluster. Credit: X-ray: NASA/CXC/CfA/M. Markevitch et al.',
  say: ['Between the galaxies, hot gas', 'It outweighs all the cluster’s galaxies put together'], zoom: [0.95, 1.08], focus: [0.5, 0.5], tag: 'X-ray picture',
});

// ---- 4. what cannot be seen
const missing: Scene = {
  caption: 'The mass of a cluster that can be seen, in its galaxies and its hot gas, beside the mass its gravity shows it must have: about seven times as much. A drawing of the idea; the split between galaxies and gas is only roughly shown.',
  stillAt: 4,
  draw({ ctx, w, h, t, say }) {
    backdrop(ctx, w, h, 0.4);
    const x0 = w * 0.1, bw = w * 0.8, y1 = h * 0.16, y2 = h * 0.46, bh = h * 0.1, k = ease(clamp((t - 1) / 2.2, 0, 1)), unit = bw / 7;
    label(ctx, 'What can be seen', x0, y1 - 10, { align: 'left', colour: SOFT });
    ctx.fillStyle = '#e9c48a'; ctx.fillRect(x0, y1, unit * 0.25, bh); ctx.fillStyle = '#d0584a'; ctx.fillRect(x0 + unit * 0.25, y1, unit * 0.75, bh);
    label(ctx, 'Galaxies and hot gas', x0 + unit + 10, y1 + bh * 0.62, { align: 'left' });
    label(ctx, 'What gravity says is there', x0, y2 - 10, { align: 'left', colour: SOFT });
    ctx.fillStyle = '#e9c48a'; ctx.fillRect(x0, y2, unit * 0.25, bh); ctx.fillStyle = '#d0584a'; ctx.fillRect(x0 + unit * 0.25, y2, unit * 0.75, bh);
    ctx.fillStyle = '#3d4a66'; ctx.fillRect(x0 + unit, y2, unit * 6 * k, bh);
    if (k > 0.9) label(ctx, 'Dark matter', x0 + unit * 4, y2 + bh + 20, { align: 'center', colour: ACCENT });
    say('Not enough to hold it together', 'About six times more mass is there, unseen');
  },
};

// ---- 5. weighing by lens
const weigh = photoScene({
  src: '/img/learn/abell-370-hubble.jpg',
  caption: 'A real photograph by the Hubble Space Telescope: the galaxy cluster Abell 370. The thin arcs are galaxies far behind it, their light bent by the cluster’s gravity. The colour is built from pictures taken through separate filters, some in infrared. Credit: NASA, ESA/Hubble, HST Frontier Fields, CC BY 4.0.',
  say: ['Weighing a cluster by the light it bends', 'The arcs say: far more mass than can be seen'], cover: true, zoom: [1, 1.12], focus: [0.42, 0.62],
});

// ---- 6. growing
const G = (() => { const r = rng(17); return Array.from({ length: 7 }, (_, g) => ({ a: (g / 7) * TAU + r() * 0.5, d: 0.55 + r() * 0.4, n: Array.from({ length: 9 + Math.floor(r() * 8) }, () => [r() * TAU, Math.sqrt(r()), r()] as [number, number, number]) })); })();
const grow: Scene = {
  caption: 'Small groups of galaxies falling together to make a cluster. A drawing of the idea, enormously speeded up: the real thing takes billions of years.',
  stillAt: 7,
  draw({ ctx, w, h, t, say }) {
    backdrop(ctx, w, h, 0.4);
    const cx = w / 2, cy = h * 0.4, R = Math.min(w * 0.42, h * 0.36), k = ease(clamp(((t % 14) - 1) / 8, 0, 1));
    for (const g of G) {
      const d = g.d * R * (1 - k * 0.86), a = g.a + k * 1.2, gx = cx + Math.cos(a) * d, gy = cy + Math.sin(a) * d * 0.9, spread = R * (0.1 + k * 0.16);
      for (const [pa, pr, b] of g.n) dot(ctx, gx + Math.cos(pa + t * 0.2) * pr * spread, gy + Math.sin(pa + t * 0.2) * pr * spread, 1 + b * 1.2, `rgba(240,215,160,${0.45 + b * 0.5})`);
    }
    label(ctx, k < 0.5 ? 'Groups of a few dozen galaxies' : 'One cluster', cx, cy + R + 16, { align: 'center', colour: ACCENT });
    say('Clusters are built from smaller groups', 'They are still growing today');
  },
};

export const scenes: Scene[] = [coma, size, gas, missing, weigh, grow];
