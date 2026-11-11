/**
 * Pictures for the lesson "Neutron stars and pulsars". Figures match the lesson: a ball about
 * 20 km across holding more than the Sun's mass, a sugar cube of it weighing about a billion
 * tonnes, and the Crab pulsar turning 30 times a second.
 */
import { type Scene, INK, SOFT, FAINT, ACCENT, clamp, ease, mix, label, stars, rng, nf } from '../stage';
import { TAU, photoScene, sun, dot, ring, line } from '../kit';

const backdrop = stars(150, 97);

/** A pulsar: a small ball with two beams, turning. Returns how nearly a beam points at the angle `to`. */
function pulsar(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, reach: number, turn: number, to: number): number {
  let hit = 0;
  for (const side of [0, Math.PI]) {
    const a = turn + side, wide = 0.11;
    const g = ctx.createRadialGradient(cx, cy, r, cx, cy, reach);
    g.addColorStop(0, 'rgba(190,220,255,.85)'); g.addColorStop(1, 'rgba(190,220,255,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.arc(cx, cy, reach, a - wide, a + wide); ctx.closePath(); ctx.fill();
    const off = Math.abs(((a - to + Math.PI) % TAU + TAU) % TAU - Math.PI);
    hit = Math.max(hit, clamp(1 - off / (wide * 1.6)));
  }
  const g = ctx.createRadialGradient(cx - r * 0.3, cy - r * 0.3, 0, cx, cy, r * 2.4);
  g.addColorStop(0, '#fff'); g.addColorStop(0.4, '#cfe0ff'); g.addColorStop(0.42, 'rgba(160,190,255,.35)'); g.addColorStop(1, 'rgba(160,190,255,0)');
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, r * 2.4, 0, TAU); ctx.fill();
  return hit;
}

export const lens: Scene = {
  caption: 'A pulsar: a spinning neutron star sweeping two beams round like a lighthouse. A drawing, slowed down enormously. The real ones turn from once every few seconds to hundreds of times a second.',
  stillAt: 1.2,
  draw({ ctx, w, h, t }) {
    backdrop(ctx, w, h, 0.7);
    const wide = w > 760, cx = w * (wide ? 0.66 : 0.5), cy = h * (wide ? 0.44 : 0.32);
    pulsar(ctx, cx, cy, 7, Math.max(w, h) * 0.6, t * 1.1, 0);
  },
};

// ---- 1. the core caves in
const debris = (() => { const r = rng(4); return Array.from({ length: 220 }, () => ({ a: r() * TAU, v: 0.5 + r(), s: 0.8 + r() * 1.6 })); })();
const collapseScene: Scene = {
  caption: 'The middle of a dying giant star caving in. A core about as wide as the Earth falls to a ball about 20 km across in under a second, and the rest of the star is blown away. The shrinking is to scale until the ball would be too small to see. Here it is slowed down.',
  stillAt: 9.5,
  draw({ ctx, w, h, t, say }) {
    backdrop(ctx, w, h, 0.5);
    const loop = 15, x = t % loop, k = ease((x - 1.5) / 4.5), boom = clamp((x - 6) / 7), s = Math.min(w, h), cx = w / 2, cy = h * 0.47;
    const km = 12_700 * Math.pow(20 / 12_700, k), r = Math.max((s * 0.3) * (km / 12_700), 2.2);
    if (boom > 0) for (const d of debris) { const far = boom * d.v * s * 0.62; dot(ctx, cx + Math.cos(d.a) * far, cy + Math.sin(d.a) * far, d.s, `rgba(255,${Math.round(mix(230, 140, boom))},${Math.round(mix(200, 90, boom))},${0.9 * (1 - boom)})`); }
    if (boom > 0 && boom < 0.25) { const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, s * 0.5); g.addColorStop(0, `rgba(255,255,255,${1 - boom * 4})`); g.addColorStop(1, 'rgba(255,255,255,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, w, h); }
    ring(ctx, cx, cy, s * 0.3, 'rgba(236,231,220,.16)', 1, [2, 5]);
    const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r); g.addColorStop(0, '#fff'); g.addColorStop(1, k < 1 ? '#ffb070' : '#bcd6ff');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, r, 0, TAU); ctx.fill();
    if (k < 0.05) label(ctx, 'The core, as wide as the Earth', cx, cy + s * 0.3 + 16, { align: 'center' });
    if (k >= 1) { line(ctx, [cx + 6, cy - 6, cx + 34, cy - 34], 'rgba(236,231,220,.5)'); label(ctx, 'Neutron star, 20 km', cx + 38, cy - 38, { colour: ACCENT }); }
    say(k < 1 ? `Core ${nf(Math.round(km / (km > 1000 ? 100 : 10)) * (km > 1000 ? 100 : 10))} km across` : 'About 20 km across: the size of a city', k < 1 ? 'More than the mass of the Sun, falling in' : 'The rest of the star is blown away: a supernova');
  },
};

// ---- 2. the densest thing known
const LADDER: [string, number][] = [['Water', 0], ['Lead', 1.05], ['The centre of the Sun', 2.18], ['A white dwarf', 6], ['A neutron star', 15]];   // powers of ten, grams in a sugar cube
const WEIGHTS = ['1 gram', '11 grams', '150 grams', 'about a tonne', 'about a billion tonnes'];
const denseScene: Scene = {
  caption: 'What one sugar cube of different things would weigh, on a ladder where each step up is ten times heavier. The figures for the Sun\'s centre and the neutron star are the lesson\'s. The white dwarf\'s is a typical one.',
  stillAt: 13,
  draw({ ctx, w, h, t, say }) {
    const x = w * (w < 520 ? 0.08 : 0.2), top = h * 0.1, base = h * 0.88, loop = 17, at = clamp(((t % loop) - 0.8) / 11) * 15, Y = (p: number) => base - (p / 15) * (base - top);
    line(ctx, [x, base, x, top], 'rgba(236,231,220,.25)');
    for (let p = 0; p <= 15; p++) line(ctx, [x - (p % 3 ? 3 : 6), Y(p), x, Y(p)], 'rgba(236,231,220,.3)');
    line(ctx, [x, base, x, Y(at)], ACCENT, 2);
    let last = 0;
    LADDER.forEach(([name, p], i) => {
      const on = at >= p; if (on) last = i;
      dot(ctx, x, Y(p), 3.2, on ? ACCENT : 'rgba(236,231,220,.3)');
      if (h < 420) label(ctx, `${name}: ${WEIGHTS[i]}`, x + 14, Y(p), { colour: on ? INK : FAINT });
      else { label(ctx, name, x + 14, Y(p) - 7, { colour: on ? INK : FAINT }); label(ctx, WEIGHTS[i], x + 14, Y(p) + 8, { colour: on ? SOFT : 'rgba(138,132,120,.5)' }); }
    });
    // the cube itself
    const c = Math.min(w, h) * 0.05, bx = w * (w < 520 ? 0.82 : 0.72), by = h * (w < 520 ? 0.6 : 0.47);
    ctx.fillStyle = `rgba(${Math.round(mix(120, 207, at / 15))},${Math.round(mix(160, 224, at / 15))},255,.9)`; ctx.fillRect(bx - c / 2, by - c / 2, c, c);
    label(ctx, 'One sugar cube', bx, by + c / 2 + 16, { align: 'center' });
    say(`A sugar cube of this: ${WEIGHTS[last]}`, last === 4 ? 'As much as a mountain' : `${LADDER[last][0]}`);
  },
};

// ---- 3. the lighthouse
const lighthouseScene: Scene = {
  caption: 'A pulsar seen from above its spin, with the Earth off to one side. Each time a beam crosses the Earth we record a flash, drawn as a spike on the trace below. A drawing, slowed down: one turn here takes four seconds.',
  stillAt: 0.05,
  draw({ ctx, w, h, t, say }) {
    backdrop(ctx, w, h, 0.5);
    const s = Math.min(w, h), cx = w * 0.4, cy = h * 0.4, ex = w * 0.86, ey = h * 0.4, turn = (t * TAU) / 4;
    const hit = pulsar(ctx, cx, cy, 6, Math.hypot(w, h) * 0.6, turn, 0);
    dot(ctx, ex, ey, 5 + hit * 3, hit > 0.2 ? '#cfe0ff' : '#5d8fd6'); label(ctx, 'Earth', ex, ey + 20, { align: 'center', colour: SOFT });
    // the trace: the last few seconds of what a radio telescope would record
    const x0 = w * 0.08, x1 = w * 0.92, y = h * 0.86, span = 7;
    ctx.strokeStyle = 'rgba(236,231,220,.7)'; ctx.lineWidth = 1.2; ctx.beginPath();
    for (let i = 0; i <= 240; i++) {
      const tt = t - span + (i / 240) * span, ph = ((tt % 2) + 2) % 2, d = Math.min(ph, 2 - ph), v = Math.exp(-(d * d) / 0.004);
      const px = x0 + (i / 240) * (x1 - x0), py = y - v * s * 0.11; if (i) ctx.lineTo(px, py); else ctx.moveTo(px, py);
    }
    ctx.stroke();
    label(ctx, 'What we record', x0, y + 16); label(ctx, 'Now', x1, y + 16, { align: 'right' });
    say('Each sweep of a beam past the Earth is one flash', 'The flashes keep time better than most clocks');
  },
};

// ---- 4. the Crab
const crabHeart = photoScene({
  src: '/img/learn/crab-pulsar-hubble.jpg',
  caption: 'A real photograph: the heart of the Crab Nebula by the Hubble Space Telescope. The neutron star is the right-hand one of the two bright stars near the middle. The rings round it are waves driven out by its spin. Credit: NASA and ESA; J. Hester (Arizona State University) and M. Weisskopf (NASA Marshall), CC BY 4.0. The mark was added here.',
  say: ['What is left of the star that exploded in 1054', 'It turns 30 times every second'],
  cover: true, zoom: [1, 1.22], focus: [0.6, 0.5],
  pointers: [{ at: [0.637, 0.48], to: [0.78, 0.3], text: 'The pulsar' }],
});

// ---- 5. heavier still
const limitScene: Scene = {
  caption: 'What a dead star\'s core becomes, by its mass. The lesson\'s limits are used: up to about 1.4 Suns a white dwarf, about 1 to 3 Suns a neutron star when a massive star explodes, and beyond that a black hole. The upper limit is not known exactly.',
  stillAt: 9,
  draw({ ctx, w, h, t, say }) {
    backdrop(ctx, w, h, 0.5);
    const x0 = w * 0.1, x1 = w * 0.9, y = h * 0.8, loop = 15, m = 0.6 + ease(((t % loop) - 1) / 10) * 3.6, X = (v: number) => x0 + ((v - 0.5) / 4) * (x1 - x0), s = Math.min(w, h), cx = w / 2, cy = h * 0.4;
    line(ctx, [x0, y, x1, y], 'rgba(236,231,220,.25)');
    for (let v = 1; v <= 4; v++) { line(ctx, [X(v), y, X(v), y + 6], 'rgba(236,231,220,.35)'); label(ctx, `${v}`, X(v), y + 18, { align: 'center' }); }
    label(ctx, 'Mass of the crushed core, in Suns', x1, y + 38, { align: 'right' });
    line(ctx, [X(1.4), y - 12, X(1.4), y], 'rgba(233,196,138,.6)'); line(ctx, [X(3), y - 12, X(3), y], 'rgba(233,196,138,.6)');
    dot(ctx, X(m), y, 4.5, ACCENT);
    const kind = m < 1.4 ? 0 : m < 3 ? 1 : 2;
    if (kind === 0) { sun(ctx, cx, cy, s * 0.07, 1, '225,235,255'); }
    else if (kind === 1) pulsar(ctx, cx, cy, 5, s * 0.5, t * 2, 9);
    else { dot(ctx, cx, cy, s * 0.03, '#000'); ring(ctx, cx, cy, s * 0.03, ACCENT); ring(ctx, cx, cy, s * 0.06, 'rgba(233,196,138,.25)'); }
    label(ctx, ['White dwarf: the size of the Earth', 'Neutron star: the size of a city', 'Black hole: nothing can hold it up'][kind], cx, cy + s * 0.2, { align: 'center', colour: kind === 2 ? ACCENT : INK });
    say(`A core of ${nf(m, 1)} Suns`, ['becomes a white dwarf', 'becomes a neutron star', 'becomes a black hole'][kind]);
  },
};

export const scenes: Scene[] = [collapseScene, denseScene, lighthouseScene, crabHeart, limitScene];
