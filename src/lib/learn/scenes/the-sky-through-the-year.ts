/**
 * Pictures for the lesson "The sky through the year". The photograph is real. The drawings look down
 * on the Earth's orbit from the north: the constellations are set round the edge in their real
 * directions from the Sun, but nothing is to scale, since the nearest of those stars is hundreds of
 * thousands of times further off than the Sun. The last drawing shows the pole of the sky going round
 * its 26,000 year circle, with Polaris and Thuban at their catalogued places.
 */
import { type Scene, INK, SOFT, FAINT, ACCENT, label, stars, nf } from '../stage';
import { TAU, photoScene, globe, sun, dot, line, ring } from '../kit';

const backdrop = stars(120, 31);
const RAD = Math.PI / 180;
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
/** The twelve traditional constellations of the zodiac, with the direction of the middle of each, in degrees along the ecliptic. */
const ZODIAC: [string, number][] = [['Pisces', 5], ['Aries', 35], ['Taurus', 65], ['Gemini', 100], ['Cancer', 128], ['Leo', 150], ['Virgo', 195], ['Libra', 225], ['Scorpius', 247], ['Sagittarius', 283], ['Capricornus', 312], ['Aquarius', 338]];
/** The Sun's direction from the Earth, in degrees along the ecliptic, and the month, for a time in the drawing. */
function when(t: number): { L: number; month: string } {
  const day = (t * 9 + 345) % 365.25, L = (((day - 79.5) * 360) / 365.25 + 360) % 360, d = new Date(Date.UTC(2027, 0, 1 + Math.floor(day)));
  return { L, month: MONTHS[d.getUTCMonth()] };
}
const nearest = (deg: number) => ZODIAC.reduce((best, z) => (Math.abs(((z[1] - deg + 540) % 360) - 180) < Math.abs(((best[1] - deg + 540) % 360) - 180) ? z : best))[0];

function orbit(ctx: CanvasRenderingContext2D, w: number, h: number, L: number): { cx: number; cy: number; R: number; ex: number; ey: number; out: number } {
  const cx = w / 2, cy = h * 0.47, R = Math.min(w * 0.2, h * 0.2), out = (L + 180) * RAD, ex = cx + Math.cos(out) * R, ey = cy - Math.sin(out) * R;
  ring(ctx, cx, cy, R, 'rgba(236,231,220,.18)', 1, [2, 5]); sun(ctx, cx, cy, Math.max(6, R * 0.16));
  // the Earth, with its night side away from the Sun
  globe(ctx, ex, ey, Math.max(4, R * 0.1));
  return { cx, cy, R, ex, ey, out };
}

export const lens = photoScene({
  src: '/img/learn/zodiacal-light-la-silla-eso.jpg',
  caption: 'A real photograph: the sky after sunset over ESO’s La Silla Observatory in Chile. The cone of pale light lies along the path the Sun takes through the stars. Credit: ESO/Y. Beletsky, CC BY 4.0.',
  say: ['', ''], hero: true, cover: true, zoom: [1, 1.06], focus: [0.5, 0.45],
});

// ---- 1 and 2. the night side looks out a different way
const nightScene = (both: boolean): Scene => ({
  caption: 'The Earth’s orbit seen from above the north. The arrow is the way you look out at midnight. Orion and Scorpius are set in their real directions, on opposite sides of the sky. A drawing, not to scale: the stars are vastly further away than this.',
  stillAt: 0,
  draw({ ctx, w, h, t, say }) {
    backdrop(ctx, w, h, 0.4);
    const { L, month } = when(t), { cx, cy, R, ex, ey, out } = orbit(ctx, w, h, L), far = Math.min(w * 0.44, h * 0.42);
    const marks: [string, number][] = both ? [['Orion', 84], ['Scorpius', 247]] : [['Orion', 84]];
    for (const [name, deg] of marks) { const x = cx + Math.cos(deg * RAD) * far, y = cy - Math.sin(deg * RAD) * far; for (let i = 0; i < 5; i++) dot(ctx, x + Math.cos(i * 2.4) * 9, y + Math.sin(i * 1.7) * 9, 1.6, INK); label(ctx, name, x, y + 24, { align: 'center', colour: SOFT }); }
    line(ctx, [ex, ey, ex + Math.cos(out) * R * 0.9, ey - Math.sin(out) * R * 0.9], ACCENT, 1.5);
    const tx = ex + Math.cos(out) * R * 0.9, ty = ey - Math.sin(out) * R * 0.9; line(ctx, [tx, ty, tx - Math.cos(out - 0.5) * 8, ty + Math.sin(out - 0.5) * 8], ACCENT, 1.5); line(ctx, [tx, ty, tx - Math.cos(out + 0.5) * 8, ty + Math.sin(out + 0.5) * 8], ACCENT, 1.5);
    const facing = (deg: number) => Math.cos((L + 180 - deg) * RAD);
    const o = facing(84), s = facing(247);
    say(month, o > 0.5 ? 'At midnight you look out towards Orion' : both && s > 0.5 ? 'At midnight you look out towards Scorpius. Orion is behind the Sun' : o < -0.5 ? 'Orion is up by day, lost in the Sun’s glare' : 'Orion is low in the evening or the morning sky');
  },
});

// ---- 3. the Sun in front of the zodiac
const zodiacScene: Scene = {
  caption: 'The same view, with the twelve traditional constellations of the zodiac round the edge in their real directions. The line from the Earth through the Sun shows which one the Sun is in front of. A drawing, not to scale.',
  stillAt: 0,
  draw({ ctx, w, h, t, say }) {
    backdrop(ctx, w, h, 0.35);
    const { L, month } = when(t), { cx, cy, ex, ey } = orbit(ctx, w, h, L), far = Math.min(w * 0.42, h * 0.41), now = nearest(L), narrow = w < 520;
    line(ctx, [ex, ey, cx + Math.cos(L * RAD) * far * 0.9, cy - Math.sin(L * RAD) * far * 0.9], 'rgba(255,214,140,.55)', 1, [3, 4]);
    for (const [name, deg] of ZODIAC) { const x = cx + Math.cos(deg * RAD) * far, y = cy - Math.sin(deg * RAD) * far, on = name === now; dot(ctx, x, y, on ? 3 : 2, on ? ACCENT : 'rgba(236,231,220,.5)'); label(ctx, narrow && !on ? name.slice(0, 3) : name, x + Math.cos(deg * RAD) * 12, y - Math.sin(deg * RAD) * 12, { align: Math.cos(deg * RAD) > 0.3 ? 'left' : Math.cos(deg * RAD) < -0.3 ? 'right' : 'center', colour: on ? ACCENT : FAINT }); }
    say(`${month}: the Sun is in front of ${now}`, 'It is up by day, so you cannot see it');
  },
};

// ---- 4. the line across the sky
const glow = photoScene({
  src: '/img/learn/zodiacal-light-la-silla-eso.jpg',
  caption: 'A real photograph: the zodiacal light after sunset at La Silla in Chile, in September 2009. It is sunlight scattered by dust between the planets. Credit: ESO/Y. Beletsky, CC BY 4.0. The mark was added here.',
  say: ['The path of the Sun, the Moon and the planets', 'From a truly dark place you can see it as a cone of light'],
  zoom: [1, 1.05], focus: [0.5, 0.45],
  pointers: [{ at: [0.5, 0.42], to: [0.78, 0.2], text: 'Dust lit by the Sun' }],
});

// ---- 5. the slow wobble
const eclip = (lon: number, lat: number, cx: number, cy: number, k: number): [number, number] => [cx + Math.cos(lon * RAD) * (90 - lat) * k, cy - Math.sin(lon * RAD) * (90 - lat) * k];
const wobble: Scene = {
  caption: 'The patch of sky the Earth’s axis points to, going once round its circle in about 26,000 years. Polaris and Thuban are at their catalogued places. The years are worked out here from that period and are rough. A drawing.',
  stillAt: 100,
  draw({ ctx, w, h, t, say }) {
    backdrop(ctx, w, h, 0.5);
    const cx = w / 2, cy = h * 0.47, k = Math.min(w * 0.36, h * 0.38) / 23.44, span = 5200, year = Math.min(2026, -3000 + ((t * 420) % (span + 1500))), lon = 90 + ((2026 - year) / 26000) * 360;
    ring(ctx, cx, cy, 23.44 * k, 'rgba(236,231,220,.25)', 1, [3, 5]); dot(ctx, cx, cy, 2, FAINT); label(ctx, 'The middle of the circle', cx, cy + 14, { align: 'center', colour: FAINT });
    const [px, py] = eclip(88.56, 66.1, cx, cy, k), [tx, ty] = eclip(157.42, 66.35, cx, cy, k);
    dot(ctx, px, py, 3, INK); label(ctx, 'Polaris', px + 8, py - 10, { colour: SOFT }); dot(ctx, tx, ty, 2.4, INK); label(ctx, 'Thuban', tx - 8, ty - 10, { align: 'right', colour: SOFT });
    const [x, y] = eclip(lon, 66.56, cx, cy, k); ring(ctx, x, y, 7, ACCENT, 1.5); line(ctx, [x - 11, y, x + 11, y], ACCENT); line(ctx, [x, y - 11, x, y + 11], ACCENT);
    say(year < 0 ? `About ${nf(Math.round(-year / 100) * 100)} BC` : year < 2026 ? `About the year ${Math.round(year / 100) * 100}` : 'Today', year < -2000 ? 'The pole of the sky is near Thuban' : year < 1500 ? 'No bright star marks the pole' : 'The pole of the sky is near Polaris');
  },
};

export const scenes: Scene[] = [nightScene(false), nightScene(true), zodiacScene, glow, wobble];
