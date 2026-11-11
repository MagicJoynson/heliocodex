/**
 * How wide a black hole of a given mass is, drawn to scale beside something familiar.
 * The width is twice the Schwarzschild radius: 5.906 km for each mass of the Sun, the figure
 * worked out in the lesson's physics level.
 */
import { type Scene, INK, FAINT, ACCENT, label, nf } from '../stage';

const KM_PER_SUN = 5.906, EARTH_IN_SUNS = 3.003e-6;
export const MASS_RANGE = [Math.log10(EARTH_IN_SUNS), Math.log10(6.6e10)] as const;
export const PRESETS: { name: string; suns: number }[] = [
  { name: 'The Earth', suns: EARTH_IN_SUNS },
  { name: 'The Sun', suns: 1 },
  { name: 'A star of 10 Suns', suns: 10 },
  { name: 'Centre of our galaxy', suns: 4.3e6 },
  { name: 'The one photographed in 2019', suns: 6.5e9 },
  { name: 'The heaviest known', suns: 6.6e10 },
];
type Shape = 'disc' | 'tall' | 'peak' | 'orbit';
// Coin: Royal Mint, one penny specification, https://www.royalmint.com/discover/uk-coins/coin-design-and-specifications/one-penny-coin/
// Everest: 8,848.86 m, the joint survey by Nepal and China announced in December 2020.
const THINGS: { name: string; km: number; says: string; shape: Shape }[] = [
  { name: 'A 1p coin', km: 2.03e-5, says: '20 mm across', shape: 'disc' },
  { name: 'A front door', km: 0.002, says: '2 m high', shape: 'tall' },
  { name: 'Mount Everest', km: 8.849, says: '8.8 km high', shape: 'peak' },
  { name: 'The Moon', km: 3475, says: '3,475 km across', shape: 'disc' },
  { name: 'The Earth', km: 12742, says: '12,742 km across', shape: 'disc' },
  { name: 'The Sun', km: 1.3914e6, says: '1.39 million km across', shape: 'disc' },
  { name: 'The Earth\'s orbit', km: 2.992e8, says: '299 million km across', shape: 'orbit' },
  { name: 'Neptune\'s orbit', km: 8.997e9, says: '9 billion km across', shape: 'orbit' },
];

export function widthText(km: number): string {
  if (km >= 1e9) return `${nf(km / 1e9, km >= 1e10 ? 0 : 1)} billion km`;
  if (km >= 1e6) return `${nf(km / 1e6, km >= 1e7 ? 0 : 1)} million km`;
  if (km >= 100) return `${nf(km)} km`;
  if (km >= 1) return `${nf(km, 1)} km`;
  if (km >= 0.001) return `${nf(km * 1000, km >= 0.1 ? 0 : 1)} m`;
  return `${nf(km * 1e6, km * 1e6 >= 100 ? 0 : 1)} mm`;
}
export function massText(suns: number): string {
  if (suns < 0.9995) { const e = suns / EARTH_IN_SUNS; return e < 1.05 ? 'The mass of the Earth' : `The mass of ${nf(e, e < 10 ? 1 : 0)} Earths`; }
  if (suns >= 1e9) return `The mass of ${nf(suns / 1e9, suns >= 1e10 ? 0 : 1)} billion Suns`;
  if (suns >= 1e6) return `The mass of ${nf(suns / 1e6, suns >= 1e7 ? 0 : 1)} million Suns`;
  return suns < 1.05 ? 'The mass of the Sun' : `The mass of ${nf(suns, suns < 10 ? 1 : 0)} Suns`;
}

export function sizes(mass: { suns: number }): Scene {
  return {
    caption: 'A black hole and a familiar thing, drawn to the same scale. The width is 5.9 km for each mass of the Sun, from the formula in the physics level of this lesson. The 1p coin is 20.3 mm across (the Royal Mint) and Everest is 8,848.86 m high (the 2020 survey by Nepal and China).',
    draw({ ctx, w, h, say }) {
      const km = mass.suns * KM_PER_SUN;
      const thing = THINGS.reduce((best, x) => (Math.abs(Math.log(x.km / km)) < Math.abs(Math.log(best.km / km)) ? x : best));
      const room = Math.min(w * 0.4, h * 0.66), scale = room / Math.max(km, thing.km), y = h * 0.46;
      const hole = Math.max(km * scale, 3), other = Math.max(thing.km * scale, 3), hx = w * 0.27, tx = w * 0.73;
      ctx.fillStyle = '#000'; ctx.beginPath(); ctx.arc(hx, y, hole / 2, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = ACCENT; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(hx, y, hole / 2, 0, Math.PI * 2); ctx.stroke();
      ctx.strokeStyle = 'rgba(236,231,220,.7)';
      ctx.beginPath();
      if (thing.shape === 'tall' || thing.shape === 'peak') {
        // a height, not a width: a plain measuring bar
        ctx.moveTo(tx, y - other / 2); ctx.lineTo(tx, y + other / 2);
        ctx.moveTo(tx - 7, y - other / 2); ctx.lineTo(tx + 7, y - other / 2);
        ctx.moveTo(tx - 7, y + other / 2); ctx.lineTo(tx + 7, y + other / 2);
      }
      else { if (thing.shape === 'orbit') ctx.setLineDash([3, 5]); ctx.arc(tx, y, other / 2, 0, Math.PI * 2); }
      ctx.stroke(); ctx.setLineDash([]);
      const base = h - 30;
      label(ctx, 'Black hole', hx, base, { align: 'center', colour: ACCENT });
      label(ctx, widthText(km), hx, base + 16, { align: 'center', colour: INK });
      label(ctx, thing.name, tx, base, { align: 'center' });
      label(ctx, thing.says, tx, base + 16, { align: 'center', colour: FAINT });
      say(massText(mass.suns), `A black hole ${widthText(km)} wide`);
    },
  };
}
