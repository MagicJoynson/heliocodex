/**
 * Pictures for the lesson "What life needs". Four are real photographs. The three ingredients are
 * a diagram, and the thermometer is drawn to scale.
 */
import { type Scene, SOFT, ACCENT, clamp, ease, label, stars } from '../stage';
import { TAU, photoScene, dot, line } from '../kit';

const backdrop = stars(60, 515);
const EARTH = 'A real photograph: the whole Earth, taken by the crew of Apollo 17 on 7 December 1972 on their way to the Moon. Credit: NASA.';
const SPRING = 'A real photograph from the air: the Grand Prismatic Spring in Yellowstone National Park, July 2001. The walkway at lower right gives the scale. Credit: Jim Peaco, US National Park Service.';

export const lens = photoScene({ src: '/img/learn/grand-prismatic-spring-nps.jpg', caption: SPRING, say: ['', ''], hero: true, cover: true, zoom: [1, 1.1], focus: [0.45, 0.5] });

const home = photoScene({ src: '/img/learn/earth-blue-marble-apollo-17.jpg', caption: EARTH, say: ['The only example', 'Everything known about life comes from here'], zoom: [0.85, 1], focus: [0.5, 0.5] });

// ---- 2. three things
const THREE: [string, string, string][] = [['Liquid water', 'Where the chemistry happens', 'rgba(110,170,255,1)'], ['Six elements', 'C H N O P S', 'rgba(170,220,150,1)'], ['Energy', 'Light or chemicals', 'rgba(255,200,110,1)']];
const needs: Scene = {
  caption: 'A diagram. The three things every known living thing needs. The letters are the chemists’ signs for carbon, hydrogen, nitrogen, oxygen, phosphorus and sulphur.',
  stillAt: 6,
  draw({ ctx, w, h, t, say }) {
    backdrop(ctx, w, h, 0.3);
    const wide = w > 560, r = wide ? Math.min(w * 0.11, h * 0.2) : Math.min(w * 0.14, h * 0.11);
    THREE.forEach(([a, b, colour], i) => {
      const k = ease(clamp((t - i * 1.3) / 1.2, 0, 1)); if (k <= 0) return;
      const x = wide ? w * (0.2 + i * 0.3) : w * 0.24, y = wide ? h * 0.36 : h * (0.17 + i * 0.25);
      const g = ctx.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, colour.replace(',1)', `,${0.55 * k})`)); g.addColorStop(1, colour.replace(',1)', ',0)'));
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill();
      ctx.strokeStyle = colour.replace(',1)', `,${0.9 * k})`); ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(x, y, r * 0.72 * k, 0, TAU); ctx.stroke();
      if (i === 0) { ctx.fillStyle = colour.replace(',1)', `,${k})`); ctx.beginPath(); ctx.moveTo(x, y - r * 0.36); ctx.bezierCurveTo(x + r * 0.42, y + r * 0.1, x + r * 0.22, y + r * 0.38, x, y + r * 0.38); ctx.bezierCurveTo(x - r * 0.22, y + r * 0.38, x - r * 0.42, y + r * 0.1, x, y - r * 0.36); ctx.fill(); }
      if (i === 1) for (let j = 0; j < 6; j++) { const a = (j / 6) * TAU + t * 0.2; dot(ctx, x + Math.cos(a) * r * 0.36, y + Math.sin(a) * r * 0.36, r * 0.09, colour.replace(',1)', `,${k})`)); }
      if (i === 2) for (let j = 0; j < 8; j++) { const a = (j / 8) * TAU, p = 0.2 + 0.06 * Math.sin(t * 3 + j); line(ctx, [x + Math.cos(a) * r * p, y + Math.sin(a) * r * p, x + Math.cos(a) * r * 0.48, y + Math.sin(a) * r * 0.48], colour.replace(',1)', `,${k})`), 2); }
      if (wide) { label(ctx, a, x, y + r + 22, { align: 'center', colour: '#fff' }); label(ctx, b, x, y + r + 38, { align: 'center', colour: SOFT }); }
      else { label(ctx, a, x + r + 14, y - 3, { align: 'left', colour: '#fff' }); label(ctx, b, x + r + 14, y + 13, { align: 'left', colour: SOFT }); }
    });
    say('Three things, and time', 'Water, the right ingredients, and energy');
  },
};

const vent = photoScene({
  src: '/img/learn/black-smoker-atlantic-noaa.jpg',
  caption: 'A real photograph: a "black smoker", a vent on the floor of the Atlantic Ocean pouring out hot water dark with minerals, lit by the lamps of a submersible. Credit: P. Rona, OAR/National Undersea Research Program, NOAA.',
  say: ['No sunlight needed', 'Life here runs on chemicals in water hotter than 370 °C'], zoom: [1, 1.12], focus: [0.5, 0.55],
});

const spring = photoScene({
  src: '/img/learn/grand-prismatic-spring-nps.jpg', caption: SPRING, say: ['Colour made by living things', 'The orange and yellow bands are mats of microbes'], zoom: [1, 1.12], focus: [0.45, 0.5],
  pointers: [{ at: [0.24, 0.62], to: [0.1, 0.92], text: 'Microbes', align: 'left' }, { at: [0.84, 0.66], to: [0.95, 0.9], text: 'Walkway', align: 'right' }],
});

const bear = photoScene({
  src: '/img/learn/tardigrade-sem.jpg',
  caption: 'A real picture from an electron microscope, which shows no colour: a water bear of the kind Milnesium tardigradum. Credit: Schokraie and others (2012), PLoS ONE, CC BY 2.5, lightened and turned round by Wikimedia Commons user Epipelagic.',
  say: ['A water bear', 'Twelve days in open space, and home alive'], zoom: [0.9, 1.02], focus: [0.5, 0.5], tag: 'Microscope picture',
});

// ---- 6. how hot
const MARKS: [number, string, string][] = [[0, 'Water freezes', SOFT], [37, 'Your body', '#fff'], [80, 'Hot-spring microbes thrive', ACCENT], [100, 'Water boils at sea level', SOFT], [122, 'Hottest known growth', 'rgba(255,140,110,1)']];
const heat: Scene = {
  caption: 'A thermometer drawn to scale, in degrees Celsius. The mark at 122 is the hottest at which any living thing is known to grow: a microbe from a sea-floor vent, grown under high pressure so that the water stays liquid.',
  stillAt: 6,
  draw({ ctx, w, h, t, say }) {
    backdrop(ctx, w, h, 0.3);
    const wide = w > 560, x = wide ? w * 0.3 : w * 0.16, y0 = h * 0.78, y1 = h * 0.08, k = ease(clamp(t / 4, 0, 1)), Y = (c: number) => y0 - ((c + 10) / 150) * (y0 - y1), top = -10 + 132 * k;
    ctx.fillStyle = 'rgba(236,231,220,.12)'; ctx.fillRect(x - 7, y1, 14, y0 - y1);
    const g = ctx.createLinearGradient(0, y0, 0, y1); g.addColorStop(0, 'rgba(110,170,255,.9)'); g.addColorStop(0.5, 'rgba(255,200,110,.9)'); g.addColorStop(1, 'rgba(255,110,90,.95)');
    ctx.fillStyle = g; ctx.fillRect(x - 7, Y(top), 14, y0 - Y(top));
    MARKS.forEach(([c, text, colour]) => {
      if (c > top) return; const y = Y(c);
      line(ctx, [x + 9, y, x + 26, y], colour, 1.5); label(ctx, `${c} °C`, x - 14, y + 4, { align: 'right', colour });
      label(ctx, text, x + 32, y + 4, { align: 'left', colour });
    });
    say('How hot can life go?', 'As far as is known, 122 degrees, and only where water is still liquid');
  },
};

export const scenes: Scene[] = [home, needs, vent, spring, bear, heat];
