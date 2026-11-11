/**
 * Pictures for the lesson "Where the elements come from". The photographs are real. The chart of the
 * elements follows NASA's "Origins of the elements" (NASA's Goddard Space Flight Center, with data from
 * Jennifer Johnson of Ohio State University): each element is coloured by where most of it was made, and
 * an element with two colours has two main sources. The other drawings show an idea and are not to scale.
 */
import { type Scene, INK, SOFT, FAINT, ACCENT, clamp, ease, mix, label, stars, rng } from '../stage';
import { TAU, photoScene, dot, line, sun } from '../kit';

const backdrop = stars(120, 41);

// ---- the chart
const SYMBOLS = 'H He Li Be B C N O F Ne Na Mg Al Si P S Cl Ar K Ca Sc Ti V Cr Mn Fe Co Ni Cu Zn Ga Ge As Se Br Kr Rb Sr Y Zr Nb Mo Tc Ru Rh Pd Ag Cd In Sn Sb Te I Xe Cs Ba La Ce Pr Nd Pm Sm Eu Gd Tb Dy Ho Er Tm Yb Lu Hf Ta W Re Os Ir Pt Au Hg Tl Pb Bi Po At Rn Fr Ra Ac Th Pa U Np Pu Am Cm Bk Cf Es Fm Md No Lr Rf Db Sg Bh Hs Mt Ds Rg Cn Nh Fl Mc Lv Ts Og'.split(' ');
/** Where most of each element was made, in order of atomic number, read off NASA's chart. */
const MADE = ('B B L C C L L H H H H H H H H HW H HW H HW H W W W W W W W HW HW H H H H H H H L L L L LM D M M LM M LM M LM M LM M M ' +
  'M L LM L LM LM D M M M M M M M M M M LM LM LM M M M M M LM L L M D D D D D D M D M D M ' + 'X '.repeat(24)).trim().split(' ');
type Key = 'B' | 'C' | 'L' | 'H' | 'W' | 'M' | 'D' | 'X';
const ORIGIN: Record<Key, { rgb: string; name: string; short: string; such: string }> = {
  B: { rgb: '200,170,240', name: 'The first minutes of the universe', short: 'The first minutes', such: 'Hydrogen and helium' },
  C: { rgb: '120,215,205', name: 'Fast particles hitting atoms in space', short: 'Particles hitting atoms', such: 'Beryllium and boron' },
  L: { rgb: '240,150,80', name: 'Small stars at the end of their lives', short: 'Small stars', such: 'Carbon, nitrogen and lead' },
  H: { rgb: '130,170,250', name: 'Heavy stars and their supernovae', short: 'Heavy stars', such: 'Oxygen, magnesium and silicon' },
  W: { rgb: '235,235,225', name: 'White dwarfs that blow up', short: 'White dwarfs', such: 'Iron, nickel and chromium' },
  M: { rgb: '240,205,110', name: 'Neutron stars crashing together', short: 'Neutron stars', such: 'Gold, platinum and uranium' },
  D: { rgb: '225,120,140', name: 'Heavier atoms breaking down', short: 'Atoms breaking down', such: 'Radon and radium' },
  X: { rgb: '110,110,118', name: 'Made only by people', short: 'Made by people', such: 'Everything past plutonium' },
};
const ORDER: Key[] = ['B', 'H', 'L', 'W', 'M', 'C', 'D', 'X'];

/** Column and row of each element in the usual layout, with the two long rows set below. */
function place(z: number): [number, number] {
  if (z === 1) return [0, 0]; if (z === 2) return [17, 0];
  if (z <= 10) return [z <= 4 ? z - 3 : z + 7, 1];
  if (z <= 18) return [z <= 12 ? z - 11 : z - 1, 2];
  if (z <= 36) return [z - 19, 3];
  if (z <= 54) return [z - 37, 4];
  if (z >= 57 && z <= 71) return [z - 57 + 2, 7.4];
  if (z >= 89 && z <= 103) return [z - 89 + 2, 8.4];
  if (z <= 56) return [z - 55, 5];
  if (z <= 86) return [z - 72 + 3, 5];
  if (z <= 88) return [z - 87, 6];
  return [z - 104 + 3, 6];
}

/** Draws the chart. `tone(z, keys)` gives how strongly to colour a cell, 0 to 1, or -1 for a plain cell. */
function chart(ctx: CanvasRenderingContext2D, w: number, top: number, room: number, tone: (z: number, keys: Key[]) => number, pick?: (z: number) => boolean): number {
  const cell = Math.min((w - 16) / 18, room / 9.4), x0 = (w - cell * 18) / 2, pad = cell > 22 ? 1.5 : 1;
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.font = `600 ${Math.max(7, Math.round(cell * 0.4))}px "IBM Plex Mono", ui-monospace, monospace`;
  for (let z = 1; z <= 118; z++) {
    const [c, r] = place(z), x = x0 + c * cell + pad, y = top + r * cell + pad, s = cell - pad * 2, keys = MADE[z - 1].split('') as Key[], k = tone(z, keys);
    if (k < 0) { ctx.fillStyle = pick?.(z) ? ACCENT : 'rgba(236,231,220,.1)'; ctx.fillRect(x, y, s, s); }
    else if (keys.length === 1) { ctx.fillStyle = `rgba(${ORIGIN[keys[0]].rgb},${mix(0.16, 0.92, k)})`; ctx.fillRect(x, y, s, s); }
    else {
      // two sources: the cell is cut corner to corner
      ctx.fillStyle = `rgba(${ORIGIN[keys[0]].rgb},${mix(0.16, 0.92, k)})`; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + s, y); ctx.lineTo(x, y + s); ctx.closePath(); ctx.fill();
      ctx.fillStyle = `rgba(${ORIGIN[keys[1]].rgb},${mix(0.16, 0.92, k)})`; ctx.beginPath(); ctx.moveTo(x + s, y); ctx.lineTo(x + s, y + s); ctx.lineTo(x, y + s); ctx.closePath(); ctx.fill();
    }
    if (cell >= 15) { ctx.fillStyle = k < 0 ? (pick?.(z) ? '#14110c' : 'rgba(236,231,220,.55)') : k > 0.5 ? '#14110c' : 'rgba(236,231,220,.5)'; ctx.fillText(SYMBOLS[z - 1], x + s / 2, y + s / 2 + 0.5); }
  }
  return top + cell * 9.4;
}

// ---- hero
export const lens = photoScene({
  src: '/img/learn/orion-nebula-hubble.jpg',
  caption: 'A real photograph: the Orion Nebula, by the Hubble Space Telescope. New stars are forming here out of gas that earlier stars left behind. Credit: NASA, ESA, M. Robberto (STScI/ESA) and the Hubble Space Telescope Orion Treasury Project Team, CC BY 4.0.',
  say: ['', ''], hero: true, zoom: [1, 1.1], focus: [0.5, 0.5],
});

// ---- 1. ninety or so kinds of atom
const SHOWN: [number, string, string][] = [[8, 'Oxygen', '8 protons in each atom'], [26, 'Iron', '26 protons in each atom'], [79, 'Gold', '79 protons in each atom'], [6, 'Carbon', '6 protons in each atom']];
const kindsScene: Scene = {
  caption: 'The elements, set out in the usual chart. Each square is one kind of atom, in order of the number of protons in it. A drawing.',
  stillAt: 1,
  draw({ ctx, w, h, t, say }) {
    backdrop(ctx, w, h, 0.35);
    const [z, name, about] = SHOWN[Math.floor(t / 3.2) % SHOWN.length];
    chart(ctx, w, h * 0.1, h * 0.72, () => -1, (n) => n === z);
    say(name, about);
  },
};

// ---- 2. the first minutes
const firstScene: Scene = {
  caption: 'Sixteen particles from the first minutes of the universe: fourteen protons and two neutrons. The two neutrons and two of the protons join into one helium nucleus, and twelve protons are left as hydrogen. A drawing of the counting, not of the real thing.',
  stillAt: 9,
  draw({ ctx, w, h, t, say }) {
    backdrop(ctx, w, h, 0.4);
    const s = Math.min(w, h), loop = 14, x = t % loop, join = ease((x - 2.5) / 2.5), sort = ease((x - 6) / 2.5);
    const cx = w / 2, cy = h * 0.42, r = Math.max(5, s * 0.022), gap = s * 0.13;
    let hyd = 0;
    for (let i = 0; i < 16; i++) {
      const neutron = i === 5 || i === 10, inHelium = neutron || i === 6 || i === 9;
      const gx = cx + ((i % 4) - 1.5) * gap + Math.sin(t * 1.3 + i * 2.1) * 3 * (1 - join), gy = cy + (Math.floor(i / 4) - 1.5) * gap * 0.8 + Math.cos(t * 1.1 + i * 1.7) * 3 * (1 - join);
      let px = gx, py = gy;
      if (inHelium) { const q = [5, 6, 9, 10].indexOf(i), hx = cx + (q % 2 ? 1 : -1) * r * 0.85, hy = cy + (q < 2 ? -1 : 1) * r * 0.85; px = mix(gx, hx, join); py = mix(gy, hy, join); px = mix(px, hx + w * 0.26, sort); }
      else { const col = hyd % 4, row = Math.floor(hyd / 4); hyd++; px = mix(gx, cx - w * 0.2 + (col - 1.5) * r * 3, sort); py = mix(gy, cy + (row - 1) * r * 3, sort); }
      dot(ctx, px, py, r, neutron ? '#8fa6c8' : '#f0a070');
    }
    if (sort > 0.9) { label(ctx, '12 hydrogen', cx - w * 0.2, cy + r * 7.5, { align: 'center', colour: INK }); label(ctx, '1 helium', cx + w * 0.26, cy + r * 7.5, { align: 'center', colour: INK }); }
    const ky = h * 0.1; dot(ctx, w * 0.07, ky, 4, '#f0a070'); label(ctx, 'Proton', w * 0.07 + 10, ky, { colour: SOFT }); dot(ctx, w * 0.07, ky + 16, 4, '#8fa6c8'); label(ctx, 'Neutron', w * 0.07 + 10, ky + 16, { colour: SOFT });
    say(x < 2.5 ? 'For every two neutrons there were fourteen protons' : sort < 0.9 ? 'The neutrons end up inside helium' : 'A quarter of the weight is helium', sort < 0.9 ? 'A proton on its own is already hydrogen' : 'Nearly all the rest is hydrogen');
  },
};

// ---- 3. inside a star
const STEPS: { from: number[]; to: number; spare?: number; say: string; temp: string; name: string }[] = [
  { from: [1, 1, 1, 1], to: 4, say: 'Four hydrogens make one helium', temp: '30 million', name: 'Helium' },
  { from: [4, 4, 4], to: 12, say: 'Three heliums make one carbon', temp: '200 million', name: 'Carbon' },
  { from: [12, 4], to: 16, say: 'A carbon and a helium make an oxygen', temp: '200 million', name: 'Oxygen' },
  { from: [16, 16], to: 28, spare: 4, say: 'Two oxygens make a silicon, with a helium to spare', temp: '2 billion', name: 'Silicon' },
  { from: [28, 4, 4, 4, 4, 4, 4, 4], to: 56, say: 'Silicon takes on helium, step by step, up to iron', temp: '3.3 billion', name: 'Iron' },
];
function nucleus(ctx: CanvasRenderingContext2D, x: number, y: number, n: number, u: number): number {
  for (let i = 0; i < n; i++) { const rr = u * 1.05 * Math.sqrt(i + 0.35), a = i * 2.39996; dot(ctx, x + Math.cos(a) * rr, y + Math.sin(a) * rr, u * 0.62, i % 2 ? '#8fa6c8' : '#f0a070'); }
  return u * 1.05 * Math.sqrt(n) + u;
}
const forgeScene: Scene = {
  caption: 'How the middle of a heavy star builds bigger atoms out of smaller ones. Each dot is one proton or neutron. A drawing of the idea: the temperatures are NASA’s figures for a heavy star, and the real steps have more stages than are shown.',
  stillAt: 6,
  draw({ ctx, w, h, t, say }) {
    const per = 4.4, i = Math.floor(t / per) % STEPS.length, x = t % per, step = STEPS[i], k = ease((x - 0.8) / 1.8), done = x > 2.6;
    const s = Math.min(w, h), cx = w / 2, cy = h * 0.42, u = Math.max(2.4, s * (i === 4 ? 0.011 : 0.016)), heat = i / 4;
    // the core, hotter at every step
    const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, s * 0.5); g.addColorStop(0, `rgba(${Math.round(mix(120, 235, heat))},${Math.round(mix(50, 215, heat))},${Math.round(mix(30, 255, heat))},.34)`); g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    if (!done) {
      const n = step.from.length;
      step.from.forEach((m, j) => { const a = (j / n) * TAU + t * 0.25, d = s * 0.3 * (1 - k); nucleus(ctx, cx + Math.cos(a) * d, cy + Math.sin(a) * d, m, u); });
    } else {
      const flash = 1 - clamp((x - 2.6) / 0.7); if (flash > 0) sun(ctx, cx, cy, s * 0.16, flash * 0.8, '255,245,225');
      const r = nucleus(ctx, cx, cy, step.to, u);
      if (step.spare) nucleus(ctx, cx + r + s * 0.05 + (x - 2.6) * s * 0.06, cy - (x - 2.6) * s * 0.03, step.spare, u);
      label(ctx, step.name, cx, cy + r + 16, { align: 'center', colour: ACCENT });
    }
    // the ladder along the bottom
    const names = ['Hydrogen', ...STEPS.map((st) => st.name)], y = h * 0.9, x0 = w * 0.08, x1 = w * 0.92;
    line(ctx, [x0, y, x1, y], 'rgba(236,231,220,.22)');
    names.forEach((name, j) => { const px = mix(x0, x1, j / (names.length - 1)), at = j === i + 1 && done, was = j <= i; dot(ctx, px, y, at ? 4.5 : 3, at ? ACCENT : was ? INK : 'rgba(236,231,220,.3)'); if (w > 520 || at) label(ctx, name, px, y + 15, { align: j === 0 ? 'left' : j === names.length - 1 ? 'right' : 'center', colour: at ? ACCENT : FAINT }); });
    say(step.say, `The core is at about ${step.temp} kelvins`);
  },
};

// ---- 4. small stars hand it back
const ringScene = photoScene({
  src: '/img/learn/ring-nebula-hubble.jpg',
  caption: 'A real photograph: the Ring Nebula, by the Hubble Space Telescope. A star like the Sun has puffed its outer layers off into space. Credit: NASA, ESA and C. Robert O’Dell (Vanderbilt University), CC BY 4.0. The mark was added here.',
  say: ['A small star hands its atoms back gently', 'Carbon and nitrogen drift off with the gas'],
  zoom: [0.94, 1.04], pointers: [{ at: [0.5, 0.5], to: [0.78, 0.2], text: 'What is left of the star' }],
});

// ---- 5. heavy stars throw it out
const casA = photoScene({
  src: '/img/learn/cassiopeia-a-webb.jpg',
  caption: 'A real photograph: Cassiopeia A, the wreck of a heavy star that blew up in our own galaxy, in infrared light by the James Webb Space Telescope. Credit: NASA, ESA, CSA, STScI, D. Milisavljevic (Purdue University), T. Temim (Princeton University), I. De Looze (University of Gent), CC BY 4.0.',
  say: ['A heavy star throws out what it has built', 'This cloud is about 10 light years across, and still spreading'],
  zoom: [0.96, 1.08],
});

// ---- 6. the crash of 2017
const kilonova = photoScene({
  src: '/img/learn/kilonova-ngc4993-hubble.jpg',
  caption: 'A real photograph: the galaxy NGC 4993, 130 million light years away, by the Hubble Space Telescope. The boxed dot is the glow left by two neutron stars that crashed together, and the three panels show it fading between 22 and 28 August 2017. The box and dates are part of the published picture. Credit: NASA and ESA. Acknowledgment: A.J. Levan (U. Warwick), N.R. Tanvir (U. Leicester), and A. Fruchter and O. Fox (STScI), CC BY 4.0.',
  say: ['Two neutron stars crashed together here', 'The glow faded within days'],
  zoom: [1, 1.08], focus: [0.5, 0.5],
});

// ---- 7. the whole chart, by where each element was made
const chartScene: Scene = {
  caption: 'Where most of each element was made, after NASA’s chart "Origins of the elements" (NASA’s Goddard Space Flight Center, with data from Jennifer Johnson, Ohio State University). A square with two colours has two main sources. A drawing, and a best estimate: the shares for many elements are not certain.',
  stillAt: ORDER.length * 2.8 + 1,
  draw({ ctx, w, h, t, say }) {
    backdrop(ctx, w, h, 0.3);
    const per = 2.8, loop = ORDER.length * per + 5, x = t % loop, i = Math.floor(x / per), all = i >= ORDER.length, key = ORDER[Math.min(i, ORDER.length - 1)];
    const bottom = chart(ctx, w, h * 0.04, h * (w > 620 ? 0.66 : 0.6), (_z, keys) => (all ? 1 : keys.includes(key) ? 1 : 0.12));
    // the key
    const wide = w > 620, rows = ORDER.length / 2, ky = bottom + 12, step = clamp((h * 0.97 - ky) / rows, 12, 15), kx = wide ? w * 0.1 : w * 0.06;
    ORDER.forEach((o, j) => {
      const lx = kx + Math.floor(j / rows) * w * 0.44, ly = ky + (j % rows) * step, on = all || o === key;
      ctx.fillStyle = `rgba(${ORIGIN[o].rgb},${on ? 0.95 : 0.3})`; ctx.fillRect(lx, ly - 4, 8, 8);
      label(ctx, wide ? ORIGIN[o].name : ORIGIN[o].short, lx + 14, ly, { colour: on ? INK : FAINT });
    });
    say(all ? 'Every element, by where most of it was made' : ORIGIN[key].name, all ? 'Hydrogen and helium from the start, nearly all the rest from stars' : ORIGIN[key].such);
  },
};

export const scenes: Scene[] = [kindsScene, firstScene, forgeScene, ringScene, casA, kilonova, chartScene];
