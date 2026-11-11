/**
 * Pictures for the lesson "The event horizon". The moving parts follow the "river" way of writing
 * Einstein's answer for a black hole that is not spinning (Painlevé and Gullstrand's coordinates):
 * space flows inward at the speed of light times the square root of (edge radius / distance), and
 * light sent straight out makes headway at the speed of light less that flow.
 */
import { type Scene, INK, SOFT, ACCENT, clamp, label, stars, rng, nf } from '../stage';
import { TAU, photoScene, dot, ring, line } from '../kit';

const backdrop = stars(120, 31);

// flecks carried by the flow: each has a direction and a phase along its way in
const flecks = (() => { const r = rng(5); return Array.from({ length: 260 }, () => ({ a: r() * TAU, p: r(), s: 0.6 + r() * 1.2 })); })();
/** Distance of a fleck that started at `far` (in edge radii), after a share `p` of its whole fall. */
function fall(far: number, p: number): number {
  // free fall from rest far away: distance^(3/2) shrinks at a steady rate
  return Math.pow(Math.max(Math.pow(far, 1.5) * (1 - p), 0), 2 / 3);
}
function river(ctx: CanvasRenderingContext2D, cx: number, cy: number, unit: number, far: number, t: number, alpha = 1): void {
  for (const f of flecks) {
    const p = (f.p + t * 0.035) % 1, r = fall(far, p);
    if (r < 1) continue;
    const r2 = fall(far, Math.min(p + 0.012, 1)), a = clamp((far - r) / 1.5) * alpha * 0.55;
    ctx.strokeStyle = `rgba(236,231,220,${a})`; ctx.lineWidth = f.s;
    ctx.beginPath(); ctx.moveTo(cx + Math.cos(f.a) * r * unit, cy + Math.sin(f.a) * r * unit);
    ctx.lineTo(cx + Math.cos(f.a) * Math.max(r2, 1) * unit, cy + Math.sin(f.a) * Math.max(r2, 1) * unit); ctx.stroke();
  }
}
function hole(ctx: CanvasRenderingContext2D, cx: number, cy: number, unit: number): void {
  dot(ctx, cx, cy, unit, '#000');
  ring(ctx, cx, cy, unit, 'rgba(233,196,138,.55)');
}

export const lens: Scene = {
  caption: 'Space flowing into a black hole, as Einstein\'s equations describe it for a hole that is not spinning. The flow reaches the speed of light at the edge.',
  stillAt: 8,
  draw({ ctx, w, h, t }) {
    const s = Math.min(w, h), wide = w > 760, cx = w * (wide ? 0.68 : 0.5), cy = h * (wide ? 0.46 : 0.34), unit = s * 0.085;
    backdrop(ctx, w, h, 0.6);
    river(ctx, cx, cy, unit, 7, t);
    hole(ctx, cx, cy, unit);
  },
};

// ---- 1. an edge with nothing there
// M87's black hole: 6.5 billion Suns at 2.95 km of edge radius each. A probe falling freely from far
// away takes two thirds of (edge radius / speed of light) from the edge to the centre by its own clock.
const M87_EDGE_KM = 6.5e9 * 2.953, EDGE_TO_CENTRE_H = ((2 / 3) * M87_EDGE_KM) / 299792.458 / 3600;
const edgeScene: Scene = {
  caption: `A probe falling straight into a black hole, timed by its own clock, from Einstein's equations for a hole that is not spinning. For one the size of M87's, edge to centre works out here at about ${nf(EDGE_TO_CENTRE_H)} hours.`,
  stillAt: 7.4,
  draw({ ctx, w, h, t, say }) {
    backdrop(ctx, w, h, 0.6);
    const s = Math.min(w, h), cx = w / 2, cy = h * 0.56, unit = s * 0.16, loop = 12, x = t % loop;
    dot(ctx, cx, cy, unit, '#000');
    ring(ctx, cx, cy, unit, 'rgba(233,196,138,.5)', 1, [3, 5]);
    label(ctx, 'The event horizon', cx + unit * 0.75, cy + unit * 0.75 + 12, { colour: ACCENT });
    label(ctx, 'Nothing is here to touch', cx + unit * 0.75, cy + unit * 0.75 + 28);
    // the fall, from 2.9 edge radii to the centre, takes the first 9 seconds of each turn
    const far = 2.9, r = fall(far, clamp(x / 9)), py = cy - r * unit;
    line(ctx, [cx, cy - far * unit, cx, py], 'rgba(236,231,220,.25)');
    if (r > 0.02) {
      dot(ctx, cx, py, 3.2, r < 1 ? ACCENT : INK);
      label(ctx, 'Probe', cx + 10, py, { colour: r < 1 ? ACCENT : SOFT });
    }
    // hours by the probe's clock, measured from the moment it crosses (for a hole the size of M87's)
    const whole = Math.pow(far, 1.5), hours = (clamp(x / 9) * whole - (whole - 1)) * EDGE_TO_CENTRE_H;
    say(r >= 1 ? `${nf(-hours)} hours before the edge` : r > 0.02 ? `${nf(hours)} hours past the edge, and nothing felt` : 'At the centre', r >= 1 ? 'The way back is still open' : 'No way back');
  },
};

// ---- 2. the river and the waterfall
// The water's speed grows towards the falls as 1 / square root of the distance left, the same rule
// as the flow of space above. Each swimmer swims upstream at the same best speed.
const swimmers = [0.1, 0.3, 0.46, 0.62, 0.8];
const riverScene: Scene = {
  caption: 'A river that runs faster towards a waterfall, and five swimmers who all swim upstream at the same speed. A drawing of the idea, not a real river: the water speeds up by the same rule as space near a black hole.',
  stillAt: 5,
  draw({ ctx, w, h, t, say }) {
    const x0 = w * 0.06, x1 = w * 0.9, y = h * 0.46, deep = h * 0.2, loop = 11, tt = t % loop;
    const at = (u: number) => x0 + (x1 - x0) * u;           // u: 0 far upstream, 1 the lip of the falls
    const speed = (u: number) => 0.5 / Math.sqrt(Math.max(1 - u, 0.02)); // 1 = the swimmer's best
    const noReturn = 0.75;                                  // where the water matches the swimmer
    // water
    const water = ctx.createLinearGradient(0, y, 0, y + deep);
    water.addColorStop(0, 'rgba(70,110,160,.5)'); water.addColorStop(1, 'rgba(30,50,80,.15)');
    ctx.fillStyle = water; ctx.fillRect(x0, y, x1 - x0, deep);
    line(ctx, [x0, y, x1, y], 'rgba(160,190,230,.7)');
    // the fall itself
    for (let i = 0; i < 9; i++) {
      const k = ((t * 0.9 + i / 9) % 1);
      line(ctx, [x1 + 2 + i * 1.5, y + k * h * 0.4, x1 + 2 + i * 1.5, y + k * h * 0.4 + 14], `rgba(160,190,230,${0.5 * (1 - k)})`);
    }
    // flecks on the surface show how fast the water runs
    for (let i = 0; i < 26; i++) {
      // a fleck's place after time: integrate 1/sqrt(1-u) gives 1-u = (1 - 0.75 s)^(2/3)
      const sft = ((i / 26 + t * 0.05) % 1), u = 1 - Math.pow(1 - sft, 2 / 3), len = 4 + speed(u) * 9;
      line(ctx, [at(u), y + 6 + (i % 4) * (deep / 5), Math.min(at(u) + len, x1), y + 6 + (i % 4) * (deep / 5)], 'rgba(200,220,245,.35)');
    }
    // swimmers: each starts at its place and swims upstream as hard as it can
    swimmers.forEach((u0, i) => {
      let u = u0;
      for (let k = 0, n = Math.floor(tt * 30); k < n && u < 1 && u > 0; k++) u += (speed(u) - 1) * 0.0022;
      if (u >= 1) return;
      const lost = u0 > noReturn;
      dot(ctx, at(Math.max(u, 0)), y - 5, 3.4, lost ? ACCENT : INK);
      line(ctx, [at(Math.max(u, 0)) - 5, y - 5, at(Math.max(u, 0)) - 12, y - 5], lost ? 'rgba(233,196,138,.6)' : 'rgba(236,231,220,.5)');
      if (i === 0) label(ctx, 'Swimming upstream', at(Math.max(u, 0)) - 14, y - 22, { colour: SOFT });
    });
    line(ctx, [at(noReturn), y - 3, at(noReturn), y + deep], 'rgba(233,196,138,.35)', 1, [2, 4]);
    label(ctx, 'Here the water matches the swimmer', at(noReturn), y + deep + 16, { align: 'center', colour: ACCENT });
    label(ctx, 'Slow water', x0, y + deep + 16); label(ctx, 'The falls', x1, y - 16, { align: 'right' });
    say('Upstream of the line, every swimmer gets away', 'Past it, every swimmer goes over');
  },
};

// ---- 3. space is the river
const LAMPS = [
  { r: 3, a: -0.87, text: 'Far out: light leaves easily' },
  { r: 1.6, a: -0.3, text: 'Close: light crawls out' },
  { r: 1, a: 0.3, text: 'On the edge: light stands still' },
  { r: 0.7, a: 0.87, text: 'Inside: light is carried in' },
];
const spaceScene: Scene = {
  caption: 'Four lamps near a black hole, each sending flashes of light straight outward. Light moves outward at the speed of light less the inward flow of space, from Einstein\'s equations for a hole that is not spinning.',
  stillAt: 9,
  draw({ ctx, w, h, t, say }) {
    const s = Math.min(w, h), cx = w * 0.3, cy = h * 0.5, unit = Math.min(s * 0.11, (w * 0.66) / 4.9), far = 4.4;
    river(ctx, cx, cy, unit, far + 0.2, t, 0.6);
    dot(ctx, cx, cy, unit, '#000');
    for (const lamp of LAMPS) {
      const ux = Math.cos(lamp.a), uy = Math.sin(lamp.a), held = lamp.r <= 1, colour = held ? '233,196,138' : '236,231,220';
      line(ctx, [cx + ux * lamp.r * unit, cy + uy * lamp.r * unit, cx + ux * far * unit, cy + uy * far * unit], `rgba(${colour},.14)`);
      // each flash is followed for 7 seconds from the moment it leaves the lamp
      for (let k = 0; k < 4; k++) {
        const age = (t + k * 1.75) % 7;
        let r = lamp.r;
        for (let i = 0, n = Math.floor(age * 40); i < n && r > 0.05; i++) r += (1 - Math.sqrt(1 / r)) * 0.012;
        if (r <= 0.06 || r > far) continue;
        dot(ctx, cx + ux * r * unit, cy + uy * r * unit, 2.2, `rgba(${colour},${0.95 * (1 - age / 7)})`);
      }
      dot(ctx, cx + ux * lamp.r * unit, cy + uy * lamp.r * unit, 3.4, held ? ACCENT : INK);
      label(ctx, lamp.text, Math.min(cx + ux * far * unit + 8, w - 4), cy + uy * far * unit + (uy < 0 ? -12 : 12), { align: 'right', colour: held ? ACCENT : SOFT });
    }
    ring(ctx, cx, cy, unit, 'rgba(233,196,138,.6)');
    say('At the edge, space flows in at the speed of light', 'To get back you would have to go faster');
  },
};

// ---- 4. the photograph
const photoOfM87 = photoScene({
  src: '/img/learn/m87-black-hole-eht.jpg',
  caption: 'A real photograph, not a drawing: the black hole in the galaxy M87, in radio waves, by the Event Horizon Telescope. Published 10 April 2019. Credit: EHT Collaboration, CC BY 4.0. The marks were added here. The event horizon itself is about two fifths the width of the dark patch.',
  say: ['M87*, about 55 million light years away', 'As heavy as 6.5 billion Suns'],
  zoom: [0.98, 1.12],
  pointers: [
    { at: [0.52, 0.5], to: [0.8, 0.3], text: 'The shadow' },
    { at: [0.41, 0.61], to: [0.2, 0.74], text: 'Hot gas' },
  ],
});

export const scenes: Scene[] = [edgeScene, riverScene, spaceScene, photoOfM87];
