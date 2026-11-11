/**
 * Pictures for the lesson "What the Sun is". Figures match the lesson: the nearest star is 270,000
 * times further than the Sun; the Sun is 109 Earths wide and holds 99.86% of the Solar System's
 * mass; the core is the inner quarter of the radius and the radiative zone reaches 70% of it.
 */
import { type Scene, INK, SOFT, FAINT, ACCENT, clamp, ease, label, stars, rng, nf } from '../stage';
import { TAU, photoScene, sun, dot, ring, line } from '../kit';

const backdrop = stars(170, 41);

export const lens = photoScene({
  src: '/img/learn/sun-filament-sdo.jpg',
  caption: 'A real photograph: the Sun in extreme ultraviolet light on 10 February 2015, by NASA\'s Solar Dynamics Observatory. The dark line is a ribbon of cooler gas held above the surface, 67 Earths long. Credit: NASA/SDO.',
  say: ['', ''], hero: true, zoom: [1.02, 1.12], focus: [0.5, 0.52],
});

// ---- 1. a star seen close up
const closeScene: Scene = {
  caption: 'The Sun as it would look from further and further away, until it is as far as the nearest other star. Its width on the sky shrinks in step with the distance, and its brightness with the distance squared. The background stars are made up.',
  stillAt: 12,
  draw({ ctx, w, h, t, say }) {
    const loop = 16, x = t % loop, k = ease((x - 1.5) / 9), far = Math.pow(270_000, k), s = Math.min(w, h), cx = w / 2, cy = h * 0.47;
    backdrop(ctx, w, h, 0.15 + 0.85 * k);
    const r = (s * 0.3) / far;
    if (r > 1.2) sun(ctx, cx, cy, r, 1); else {
      // too small to show as a disc: a point of light, like any other star
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, 9); g.addColorStop(0, 'rgba(255,240,205,1)'); g.addColorStop(0.25, 'rgba(255,225,160,.5)'); g.addColorStop(1, 'rgba(255,225,160,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, 9, 0, TAU); ctx.fill();
      if (k > 0.97) { line(ctx, [cx + 14, cy - 14, cx + 40, cy - 40], 'rgba(236,231,220,.5)'); label(ctx, 'The Sun', cx + 46, cy - 42, { colour: ACCENT }); }
    }
    say(far < 1.05 ? 'The Sun from the Earth' : `${nf(far < 100 ? Math.round(far * 10) / 10 : Math.round(far / (far > 10000 ? 1000 : 10)) * (far > 10000 ? 1000 : 10), far < 100 ? 1 : 0)} times further away`, k >= 1 ? 'From the nearest star, the Sun is one more star in the sky' : `${nf(Math.pow(far, 2) < 1e6 ? Math.round(far * far) : Number((far * far).toPrecision(2)))} times fainter`);
  },
};

// ---- 2. no ground, and a real look at the surface
const surface = photoScene({
  src: '/img/learn/sun-sunspots-sdo.jpg',
  caption: 'A real photograph: the Sun in ordinary light on 23 October 2014, by NASA\'s Solar Dynamics Observatory. The dark patches are sunspots, cooler than the gas round them. This group was the largest for 24 years, about 130,000 km across. Credit: NASA/SDO. The marks and the Earth for size were added here.',
  say: ['The edge looks sharp, but it is gas all the way', 'It is only where the gas becomes too thick to see into'],
  zoom: [0.96, 1.04],
  pointers: [{ at: [0.49, 0.665], to: [0.3, 0.86], text: 'Sunspots' }, { at: [0.905, 0.25], to: [0.99, 0.12], text: 'Not a surface', align: 'right' }],
  over({ ctx, t }, [x, y, pw, ph]) {
    const k = ease((t - 3) / 1.5); if (k <= 0) return;
    const ex = x + pw * 0.64, ey = y + ph * 0.665, r = Math.max((pw * 0.93) / 109 / 2, 1.2);
    ctx.globalAlpha = k; dot(ctx, ex, ey, r, '#2f5fa8'); ring(ctx, ex, ey, r + 5, 'rgba(11,11,12,.7)');
    ctx.font = '400 11px "IBM Plex Mono", monospace'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillStyle = 'rgba(11,11,12,.9)'; ctx.fillText('THE EARTH, TO SCALE', ex + r + 10, ey);
    ctx.globalAlpha = 1;
  },
});

// ---- 3. how big
const bigScene: Scene = {
  caption: 'Earths laid side by side across the Sun, to scale: 109 of them. Below, the mass of the Solar System as a bar, with the Sun\'s share and everything else\'s.',
  stillAt: 12,
  draw({ ctx, w, h, t, say }) {
    const s = Math.min(w, h * 0.9), R = s * 0.4, cx = w / 2, cy = h * 0.42, loop = 16, n = Math.floor(clamp(((t % loop) - 0.8) / 7) * 109), e = (2 * R) / 109;
    const g = ctx.createRadialGradient(cx, cy, R * 0.2, cx, cy, R); g.addColorStop(0, 'rgba(255,214,140,.5)'); g.addColorStop(0.85, 'rgba(255,170,80,.34)'); g.addColorStop(1, 'rgba(255,150,60,.2)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, R, 0, TAU); ctx.fill();
    ring(ctx, cx, cy, R, 'rgba(255,200,120,.5)');
    for (let i = 0; i < n; i++) dot(ctx, cx - R + e * (i + 0.5), cy, Math.max(e / 2 - 0.35, 0.7), i === n - 1 ? '#bcd6ff' : '#5d8fd6');
    label(ctx, `${n} Earth${n === 1 ? '' : 's'}`, cx, cy - 16, { align: 'center', colour: INK });
    // the mass bar
    const x0 = w * 0.1, x1 = w * 0.9, y = h * 0.93, k = ease(((t % loop) - 8.5) / 2);
    if (k > 0) {
      ctx.globalAlpha = k;
      line(ctx, [x0, y, x0 + (x1 - x0) * 0.9986, y], '#ffd08a', 5); line(ctx, [x0 + (x1 - x0) * 0.9986, y, x1, y], '#5d8fd6', 5);
      label(ctx, 'The Sun: 99.86% of all the mass', x0, y - 14, { colour: ACCENT }); label(ctx, 'All the rest', x1, y - 14, { align: 'right', colour: SOFT });
      ctx.globalAlpha = 1;
    }
    say('109 Earths across', '1.3 million Earths would fit inside');
  },
};

// ---- 4. the furnace and the long way out
const walker = (() => {
  // light in the radiative zone: sent off in a new direction again and again, drifting slowly out
  const r = rng(9), pts: number[] = []; let x = 0.02, y = 0;
  for (let i = 0; i < 900; i++) {
    pts.push(x, y);
    const a = r() * TAU, step = 0.03; let nx = x + Math.cos(a) * step, ny = y + Math.sin(a) * step;
    const d = Math.hypot(nx, ny), out = 0.18 + (i / 900) * 0.54;            // never beyond a slowly growing reach
    if (d > out) { nx *= out / d; ny *= out / d; }
    if (d < 0.02) { nx = 0.03; ny = 0; }
    x = nx; y = ny;
  }
  return pts;
})();
const insideScene: Scene = {
  caption: 'The Sun cut open, with its layers to scale: the core is the inner quarter of the radius and the middle zone reaches 70% of it. The wandering line shows how light is knocked about on its way out. It is a sketch of the idea: the real path has vastly more turns and takes many thousands of years.',
  stillAt: 14,
  draw({ ctx, w, h, t, say }) {
    const s = Math.min(w, h), R = s * 0.42, cx = w * 0.5, cy = h * 0.48, loop = 20, x = t % loop;
    const body = ctx.createRadialGradient(cx, cy, 0, cx, cy, R);
    body.addColorStop(0, '#fff3d0'); body.addColorStop(0.25, '#ffd98f'); body.addColorStop(0.26, '#f7b65e'); body.addColorStop(0.7, '#e08a3a'); body.addColorStop(0.71, '#c96a2a'); body.addColorStop(1, '#a8481c');
    ctx.fillStyle = body; ctx.beginPath(); ctx.arc(cx, cy, R, 0, TAU); ctx.fill();
    // rolling gas in the outer layer
    for (let i = 0; i < 16; i++) {
      const a = (i / 16) * TAU, ph = (t * 0.25 + i * 0.37) % 1, r0 = R * 0.74, r1 = R * 0.96, rr = r0 + (r1 - r0) * (ph < 0.5 ? ph * 2 : 2 - ph * 2), side = ph < 0.5 ? -0.07 : 0.07;
      dot(ctx, cx + Math.cos(a + side) * rr, cy + Math.sin(a + side) * rr, 2, `rgba(255,${ph < 0.5 ? 225 : 170},${ph < 0.5 ? 170 : 110},.75)`);
    }
    // the wandering light
    const n = Math.floor(clamp((x - 0.5) / 12) * (walker.length / 2)), pts: number[] = [];
    for (let i = 0; i < n; i++) pts.push(cx + walker[i * 2] * R, cy + walker[i * 2 + 1] * R);
    if (pts.length > 3) { line(ctx, pts, 'rgba(60,30,10,.75)', 1); dot(ctx, pts[pts.length - 2], pts[pts.length - 1], 2.6, '#201008'); }
    if (x > 12.5) { const k = clamp((x - 12.5) / 1.2), a = Math.atan2(walker[walker.length - 1], walker[walker.length - 2]); line(ctx, [cx + Math.cos(a) * R, cy + Math.sin(a) * R, cx + Math.cos(a) * (R + k * s * 0.3), cy + Math.sin(a) * (R + k * s * 0.3)], ACCENT, 1.4); }
    const tag = (text: string, r: number, a: number) => { ctx.shadowColor = 'rgba(0,0,0,.6)'; ctx.shadowBlur = 5; label(ctx, text, cx + Math.cos(a) * r * R, cy + Math.sin(a) * r * R, { align: 'center', colour: '#1a0d05', size: w < 520 ? 9 : 11 }); ctx.shadowBlur = 0; };
    ctx.shadowColor = 'transparent';
    label(ctx, 'Core', cx, cy - R * 0.12, { align: 'center', colour: '#3a2408' });
    tag('Light struggles out', 0.48, -Math.PI / 2); tag('Gas boils up and sinks', 0.85, -Math.PI / 2);
    say(x < 12.5 ? 'In the core: 15.7 million degrees' : 'Out at last: 8 minutes 19 seconds to the Earth', x < 12.5 ? 'Light made here takes many thousands of years to get out' : 'after many thousands of years inside the Sun');
    void FAINT;
  },
};

export const scenes: Scene[] = [closeScene, surface, bigScene, insideScene];
