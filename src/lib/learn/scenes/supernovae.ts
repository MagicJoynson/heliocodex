/**
 * Pictures for the lesson "Supernovae". The photographs are real. The drawings show the two ways a
 * star can blow up, as the lesson tells them: a heavy star's iron core falling in and bouncing, and a
 * white dwarf fed by a partner until it nears 1.4 Suns. They are drawings of the idea and not to scale.
 */
import { type Scene, INK, SOFT, FAINT, ACCENT, clamp, ease, mix, label, stars, rng, nf } from '../stage';
import { TAU, photoScene, globe, sun, dot, ring, line } from '../kit';

const backdrop = stars(140, 67);

export const lens = photoScene({
  src: '/img/learn/cassiopeia-a-webb.jpg',
  caption: 'A real photograph: Cassiopeia A, the wreck of a star that blew up in our own galaxy, in infrared light by the James Webb Space Telescope. It is about 10 light years across. Credit: NASA, ESA, CSA, STScI, D. Milisavljevic (Purdue University), T. Temim (Princeton University), I. De Looze (University of Gent), CC BY 4.0.',
  say: ['', ''], hero: true, zoom: [1, 1.1], focus: [0.5, 0.5],
});

// ---- 1. one star against a galaxy
const outshine = photoScene({
  src: '/img/learn/supernova-1994d-hubble.jpg',
  caption: 'A real photograph: Supernova 1994D at the edge of the galaxy NGC 4526, by the Hubble Space Telescope. Credit: NASA/ESA, The Hubble Key Project Team and The High-Z Supernova Search Team, CC BY 4.0. The marks were added here.',
  say: ['One star, nearly as bright as the middle of its galaxy', 'It faded again within months'],
  zoom: [0.96, 1.06],
  pointers: [{ at: [0.243, 0.83], to: [0.42, 0.9], text: 'One exploding star' }, { at: [0.5, 0.49], to: [0.74, 0.2], text: 'Billions of stars' }],
});

// ---- 2. a core gives way
const LAYERS: [number, string, string][] = [[1, '120,60,40', 'Hydrogen'], [0.78, '170,90,50', 'Helium'], [0.58, '205,130,70', 'Carbon and oxygen'], [0.4, '225,175,110', 'Silicon'], [0.22, '150,160,175', 'Iron']];
const collapseScene: Scene = {
  caption: 'The inside of a heavy star at the end of its life, with its fuels in layers and iron in the middle, then the core falling in and the blast going out. A drawing of the idea, not to scale: the real core is far smaller than this, and its fall takes less than a second.',
  stillAt: 2,
  draw({ ctx, w, h, t, say }) {
    backdrop(ctx, w, h, 0.5);
    const s = Math.min(w, h), cx = w / 2, cy = h * 0.5, R = s * 0.34, loop = 14, x = t % loop;
    const fall = ease((x - 4) / 0.7), blast = clamp((x - 4.7) / 6), gone = ease((x - 5) / 5);
    // the layers, pushed outward and thinned by the blast as it passes
    LAYERS.forEach(([f, rgb, name], i) => {
      const core = i === LAYERS.length - 1, r = core ? R * f * mix(1, 0.12, fall) : R * f * (1 + blast * (2.4 - f));
      const a = core ? 1 : clamp(1 - gone * 1.15);
      if (a <= 0 || r <= 0) return;
      ctx.globalAlpha = a; dot(ctx, cx, cy, r, `rgb(${rgb})`); ctx.globalAlpha = 1;
      if (x < 4 && w > 520) { line(ctx, [cx + R * (f - 0.09) * 0.72, cy - R * (f - 0.09) * 0.7, cx + R * 1.12, cy - R * (1.05 - i * 0.2)], 'rgba(236,231,220,.35)'); label(ctx, name, cx + R * 1.12 + 6, cy - R * (1.05 - i * 0.2), { colour: core ? INK : SOFT }); }
    });
    if (x < 4 && w <= 520) label(ctx, 'Iron core', cx, cy + R + 16, { align: 'center', colour: SOFT });
    // the blast: a bright ring leaving the middle
    if (blast > 0 && blast < 1) { ring(ctx, cx, cy, R * (0.1 + blast * 2.6), `rgba(255,240,210,${0.9 * (1 - blast)})`, 3); ring(ctx, cx, cy, R * (0.1 + blast * 2.6) - 5, `rgba(233,196,138,${0.4 * (1 - blast)})`, 6); }
    if (fall >= 1) { sun(ctx, cx, cy, 3.2, 1, '200,220,255'); if (gone > 0.6) label(ctx, 'What is left: a neutron star', cx + 12, cy - 14, { colour: ACCENT }); }
    say(x < 4 ? 'The core is iron, and iron gives no energy back' : x < 4.7 ? 'The core falls in on itself in less than a second' : 'It bounces, and the rest of the star is blown away', x < 4 ? 'Nothing is left to hold it up' : x < 4.7 ? 'Squeezed until it can be squeezed no further' : 'The blast, not the fall, is what we see');
  },
};

// ---- 3. a white dwarf is overfed
const grains = (() => { const r = rng(9); return Array.from({ length: 46 }, () => ({ p: r(), o: (r() - 0.5) * 0.06, s: 0.7 + r() * 0.9 })); })();
const debris = (() => { const r = rng(21); return Array.from({ length: 120 }, () => ({ a: r() * TAU, v: 0.35 + r() * 0.65, s: 0.8 + r() * 1.6 })); })();
const feedScene: Scene = {
  caption: 'A white dwarf pulling gas from a partner star until its mass nears 1.4 Suns and it blows apart. A drawing of the idea, not to scale and enormously speeded up. What kind of partner does the feeding is still argued over.',
  stillAt: 5,
  draw({ ctx, w, h, t, say }) {
    backdrop(ctx, w, h, 0.5);
    const s = Math.min(w, h), loop = 15, x = t % loop, grow = clamp((x - 0.8) / 8), mass = mix(1, 1.4, grow), bang = clamp((x - 8.8) / 5);
    const bx = w * 0.3, by = h * 0.38, br = s * 0.18, wx = w * 0.7, wy = h * 0.44, wr = s * 0.022;
    // the partner, and the stream it loses
    const g = ctx.createRadialGradient(bx, by, br * 0.1, bx, by, br * 1.25); g.addColorStop(0, 'rgba(255,190,120,1)'); g.addColorStop(0.75, 'rgba(230,120,60,.95)'); g.addColorStop(1, 'rgba(230,120,60,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(bx, by, br * 1.25, 0, TAU); ctx.fill();
    label(ctx, 'The partner star', bx, by + br * 1.25 + 16, { align: 'center' });
    if (bang <= 0) {
      for (const gr of grains) {
        const p = (gr.p + t * 0.16) % 1, e = p * p, px = mix(bx + br, wx, e), py = mix(by, wy, e) - Math.sin(p * Math.PI) * s * (0.1 + gr.o);
        dot(ctx, px, py, gr.s, `rgba(255,205,150,${0.75 * Math.sin(p * Math.PI)})`);
      }
      sun(ctx, wx, wy, wr * (1 + grow * 0.25), 1, '225,235,255');
      label(ctx, 'White dwarf', wx, wy + wr + 26, { align: 'center', colour: SOFT });
    } else {
      // the whole star goes at once: a flash, then pieces flying off, and nothing left in the middle
      const flash = 1 - clamp(bang * 4);
      if (flash > 0) sun(ctx, wx, wy, s * 0.12 * (1 - flash * 0.5), flash, '255,245,225');
      for (const d of debris) { const r = bang * s * 0.55 * d.v; dot(ctx, wx + Math.cos(d.a) * r, wy + Math.sin(d.a) * r, d.s, `rgba(255,${Math.round(230 - 90 * d.v)},${Math.round(190 - 110 * d.v)},${0.9 * (1 - bang)})`); }
      if (bang > 0.45) label(ctx, 'Nothing is left behind', wx, wy + 26, { align: 'center', colour: ACCENT });
    }
    // the scales
    const x0 = w * 0.12, x1 = w * 0.88, y = h * 0.9, X = (m: number) => x0 + ((m - 0.9) / 0.6) * (x1 - x0);
    line(ctx, [x0, y, x1, y], 'rgba(236,231,220,.25)');
    for (const m of [1, 1.1, 1.2, 1.3, 1.4]) { line(ctx, [X(m), y - 4, X(m), y + 4], 'rgba(236,231,220,.4)'); label(ctx, nf(m, 1), X(m), y + 15, { align: 'center', colour: m === 1.4 ? ACCENT : FAINT }); }
    line(ctx, [X(1.4), y - 22, X(1.4), y + 4], 'rgba(233,196,138,.7)', 1, [2, 3]); label(ctx, 'The limit', X(1.4), y - 30, { align: 'center', colour: ACCENT });
    label(ctx, 'Mass, in Suns', x0, y - 14);
    if (bang <= 0) dot(ctx, X(mass), y, 4, INK);
    say(bang > 0 ? 'The whole star burns at once' : `The white dwarf now weighs ${nf(mass, 2)} Suns`, bang > 0 ? 'These explosions are all nearly the same brightness' : 'No white dwarf can be heavier than 1.4');
  },
};

// ---- 4. the one in 1987
const sn1987a = photoScene({
  src: '/img/learn/supernova-1987a-hubble.jpg',
  caption: 'A real photograph: what is left of Supernova 1987A, in the Large Magellanic Cloud, by the Hubble Space Telescope. The rings are gas the star threw off long before it exploded, lit up by the blast. Credit: ESA/Hubble and NASA, CC BY 4.0. The mark was added here.',
  say: ['168,000 light years away, and seen without a telescope', '25 neutrinos from its core were caught on the Earth'],
  zoom: [1, 1.5], focus: [0.5, 0.5],
  pointers: [{ at: [0.53, 0.5], to: [0.7, 0.72], text: 'This ring is one light year across' }],
});

// ---- 5. what is left
const crab = photoScene({
  src: '/img/learn/crab-nebula-hubble.jpg',
  caption: 'A real photograph: the Crab Nebula, 6,500 light years away, by the Hubble Space Telescope. It is the wreck of the supernova people saw in the year 1054. Credit: NASA, ESA, J. Hester and A. Loll (Arizona State University), CC BY 4.0.',
  say: ['The wreck of the supernova of 1054', 'Nearly a thousand years on, it is still spreading'],
  zoom: [0.94, 1.04],
});

// ---- 6. what we owe them
const STUFF: [string, string][] = [['Oxygen', '150,200,255'], ['Silicon', '225,175,110'], ['Iron', '200,205,215'], ['Carbon', '255,150,120']];
const motes = (() => { const r = rng(33); return Array.from({ length: 220 }, (_, i) => ({ a: r() * TAU, v: 0.25 + r() * 0.75, k: i % 4, s: 0.8 + r() * 1.3, home: r() * TAU, hr: Math.sqrt(r()) })); })();
const giftScene: Scene = {
  caption: 'What a star has made, thrown out by a supernova and gathered again into a new cloud, a new star and a planet. A drawing of the idea, not to scale: the real thing takes millions of years and mixes the gas of many stars.',
  stillAt: 4,
  draw({ ctx, w, h, t, say }) {
    backdrop(ctx, w, h, 0.5);
    const s = Math.min(w, h), loop = 18, x = t % loop, out = ease((x - 0.6) / 6), back = ease((x - 8) / 6), born = ease((x - 13) / 2.5);
    const ax = w * 0.3, ay = h * 0.45, bx = w * 0.7, by = h * 0.5;
    if (x < 1.2) sun(ctx, ax, ay, s * 0.05 * (1 - x / 1.2), 1 - x / 1.4, '255,245,225');
    for (const m of motes) {
      const ox = ax + Math.cos(m.a) * out * s * 0.42 * m.v, oy = ay + Math.sin(m.a) * out * s * 0.42 * m.v;
      const hx = bx + Math.cos(m.home) * m.hr * s * 0.13 * (1 - born * 0.75), hy = by + Math.sin(m.home) * m.hr * s * 0.13 * (1 - born * 0.75);
      dot(ctx, mix(ox, hx, back), mix(oy, hy, back), m.s, `rgba(${STUFF[m.k][1]},${0.85 * (1 - born * 0.7)})`);
    }
    if (born > 0) { sun(ctx, bx, by, s * 0.03 * born, born); globe(ctx, bx + s * 0.16, by + s * 0.05, 3.2 * born); if (born > 0.8) label(ctx, 'A new star, and a planet', bx, by + s * 0.2, { align: 'center', colour: ACCENT }); }
    STUFF.forEach(([name, rgb], i) => { const lx = w * 0.06, ly = h * 0.1 + i * 16; dot(ctx, lx, ly, 3, `rgb(${rgb})`); label(ctx, name, lx + 10, ly, { colour: SOFT }); });
    say(back < 0.05 ? 'A supernova throws out what the star has made' : born <= 0 ? 'The gas drifts into a new cloud' : 'New stars and planets form from it', 'The iron in your blood was made in a star');
  },
};

export const scenes: Scene[] = [outshine, collapseScene, feedScene, sn1987a, crab, giftScene];
