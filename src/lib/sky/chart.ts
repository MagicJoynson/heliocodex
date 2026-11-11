/**
 * Draws the whole sky above one place as a round chart: the point overhead in the middle, the
 * horizon round the edge, north at the top and east on the left, as it looks when you lie on your
 * back with your head to the north.
 */
import { type Moment, type Vec, PLANETS, fromEngine, toSky, planetFromEarth, sunFromEarth, moonSky } from './place';

const RAD = Math.PI / 180, LY_PER_PC = 3.26156;
const INK = '236,231,220', ACCENT = '#e9c48a', MONO = '"IBM Plex Mono", ui-monospace, monospace', SERIF = 'Spectral, Georgia, serif';

export interface Figure { id: string; name: string; lines: [number, number][] }
export interface SkyData {
  /** x, y, z in parsecs (star file frame), absolute magnitude, colour index: five numbers a star, brightest first. */
  stars: Float32Array;
  names: Map<number, string>;
  figures: Figure[];
}
export interface Shown { figures: boolean; names: boolean; path: boolean }
export interface Mark {
  kind: 'star' | 'planet' | 'moon' | 'sun';
  id: string;
  name: string;
  x: number; y: number; r: number;
  altDeg: number; azDeg: number;
  /** Stars only. */
  mag?: number; ly?: number; index?: number; colour?: number; suns?: number;
  /** Planets only. */
  au?: number;
  /** The Moon only. */
  lit?: number; km?: number;
}

/** Brightness as seen from here, from brightness at a standard distance. */
const seenMag = (abs: number, pc: number) => abs + 5 * Math.log10(pc / 10);

/** A star's tint from its colour index: blue-white through white to orange. */
function tint(bv: number): string {
  const t = Math.max(-0.3, Math.min(1.8, bv));
  if (t < 0.3) { const k = (t + 0.3) / 0.6; return `${Math.round(185 + 55 * k)},${Math.round(205 + 35 * k)},255`; }
  if (t < 0.8) { const k = (t - 0.3) / 0.5; return `255,${Math.round(244 - 14 * k)},${Math.round(236 - 46 * k)}`; }
  const k = (t - 0.8) / 1; return `255,${Math.round(230 - 50 * k)},${Math.round(190 - 80 * k)}`;
}

export const PLANET_NAMES: Record<string, string> = { mercury: 'Mercury', venus: 'Venus', mars: 'Mars', jupiter: 'Jupiter', saturn: 'Saturn', uranus: 'Uranus', neptune: 'Neptune' };
const PLANET_TINT: Record<string, string> = { mercury: '#cfc8bd', venus: '#fff3d6', mars: '#ff9b6b', jupiter: '#ffe2b8', saturn: '#f1dca0', uranus: '#bfe9ee', neptune: '#9db8ff' };
const BY_EYE = new Set(['mercury', 'venus', 'mars', 'jupiter', 'saturn']);

export function draw(ctx: CanvasRenderingContext2D, size: number, data: SkyData, m: Moment, shown: Shown, picked: Mark | null): Mark[] {
  const c = size / 2, R = size / 2 - 26, marks: Mark[] = [];
  // overhead in the middle; equal steps of height shrink towards the middle so shapes keep their form
  const place = (altDeg: number, azDeg: number): [number, number] => {
    const r = R * Math.tan(((90 - altDeg) / 2) * RAD);
    return [c - r * Math.sin(azDeg * RAD), c - r * Math.cos(azDeg * RAD)];
  };
  ctx.clearRect(0, 0, size, size);
  // names are placed at the end, most important first, and one that would sit on another is left out
  const wanted: { text: string; x: number; y: number; font: string; colour: string; centred: boolean; rank: number; endAt?: number; must?: number }[] = [];
  // the faintest star drawn: fewer on a small chart, so a phone is not a blur of dots
  const faintest = Math.min(6.3, 4.4 + size / 420);

  const sunDir = sunFromEarth(m.T), sun = toSky(sunDir, m);
  // the ground of the chart: a little lighter while the Sun is near or above the horizon
  const day = Math.max(0, Math.min(1, (sun.altDeg + 12) / 12));
  const sky = ctx.createRadialGradient(c, c, 0, c, c, R);
  sky.addColorStop(0, `rgb(${Math.round(9 + 14 * day)},${Math.round(10 + 22 * day)},${Math.round(14 + 40 * day)})`);
  sky.addColorStop(1, `rgb(${Math.round(14 + 22 * day)},${Math.round(15 + 30 * day)},${Math.round(20 + 46 * day)})`);
  ctx.fillStyle = sky; ctx.beginPath(); ctx.arc(c, c, R, 0, Math.PI * 2); ctx.fill();

  ctx.save();
  ctx.beginPath(); ctx.arc(c, c, R, 0, Math.PI * 2); ctx.clip();

  // rings at a third and two thirds of the way up
  ctx.strokeStyle = `rgba(${INK},.07)`; ctx.lineWidth = 1;
  for (const alt of [30, 60]) { ctx.beginPath(); ctx.arc(c, c, R * Math.tan(((90 - alt) / 2) * RAD), 0, Math.PI * 2); ctx.stroke(); }

  // every star's place, once
  const n = data.stars.length / 5, at = new Float32Array(n * 2), up = new Uint8Array(n), mags = new Float32Array(n);
  const dim = 1 - 0.75 * day;
  for (let i = 0; i < n; i++) {
    const x = data.stars[i * 5], y = data.stars[i * 5 + 1], z = data.stars[i * 5 + 2], pc = Math.hypot(x, y, z);
    const s = toSky(fromEngine(x, y, z), m);
    mags[i] = seenMag(data.stars[i * 5 + 3], pc);
    if (s.altDeg < -1) continue;
    const [px, py] = place(s.altDeg, s.azDeg);
    at[i * 2] = px; at[i * 2 + 1] = py; up[i] = 1;
    const mag = mags[i];
    if (mag > faintest) continue;
    const r = Math.max(0.45, (6.6 - mag) * 0.5 * (size / 1100 + 0.42));
    ctx.fillStyle = `rgba(${tint(data.stars[i * 5 + 4])},${Math.min(1, (0.3 + (6.5 - mag) * 0.17) * dim)})`;
    ctx.beginPath(); ctx.arc(px, py, r, 0, Math.PI * 2); ctx.fill();
    if (mag < 4.6) marks.push({ kind: 'star', id: `star:${i}`, index: i, name: data.names.get(i) ?? '', x: px, y: py, r, altDeg: s.altDeg, azDeg: s.azDeg, mag, ly: pc * LY_PER_PC, colour: data.stars[i * 5 + 4], suns: Math.pow(10, (4.83 - data.stars[i * 5 + 3]) / 2.5) });
  }

  // the path the Sun, Moon and planets keep to
  if (shown.path) {
    ctx.strokeStyle = 'rgba(233,196,138,.3)'; ctx.setLineDash([2, 6]); ctx.beginPath();
    let pen = false;
    for (let lon = 0; lon <= 360; lon += 3) {
      const s = toSky([Math.cos((lon - m.slide / RAD) * RAD), Math.sin((lon - m.slide / RAD) * RAD), 0], m);
      if (s.altDeg < -2) { pen = false; continue; }
      const [px, py] = place(s.altDeg, s.azDeg);
      if (pen) ctx.lineTo(px, py); else ctx.moveTo(px, py);
      pen = true;
    }
    ctx.stroke(); ctx.setLineDash([]);
  }

  // the figures, and a name where enough of a figure is up
  const labels: { name: string; x: number; y: number }[] = [];
  for (const f of data.figures) {
    let sx = 0, sy = 0, count = 0, total = 0;
    ctx.strokeStyle = `rgba(${INK},.2)`; ctx.lineWidth = 1; ctx.beginPath();
    for (const [a, b] of f.lines) {
      total += 2;
      if (a >= n || b >= n || !up[a] || !up[b]) continue;
      if (shown.figures) { ctx.moveTo(at[a * 2], at[a * 2 + 1]); ctx.lineTo(at[b * 2], at[b * 2 + 1]); }
      sx += at[a * 2] + at[b * 2]; sy += at[a * 2 + 1] + at[b * 2 + 1]; count += 2;
    }
    if (shown.figures) ctx.stroke();
    if (count >= total * 0.6 && count > 0) labels.push({ name: f.name, x: sx / count, y: sy / count });
  }
  if (shown.names) {
    const figureFont = `italic 300 ${Math.max(11, Math.min(15, size / 62))}px ${SERIF}`, starFont = `400 ${Math.max(9, Math.min(11, size / 86))}px ${MONO}`;
    for (const l of labels) if (Math.hypot(l.x - c, l.y - c) < R - 24) wanted.push({ text: l.name, x: l.x, y: l.y, font: figureFont, colour: `rgba(${INK},.55)`, centred: true, rank: 3 });
    for (const s of marks) if (s.kind === 'star' && s.name && (s.mag ?? 9) < 1.6) wanted.push({ text: s.name.toUpperCase(), x: s.x + s.r + 5, y: s.y + 1, font: starFont, colour: `rgba(${INK},.7)`, centred: false, rank: 2 + (s.mag ?? 0) / 10 });
  }

  // planets
  const bodyFont = `400 ${Math.max(12, Math.min(16, size / 56))}px ${SERIF}`;
  const seen = PLANETS.map((id) => { const p = planetFromEarth(id, m.T), s = toSky(p.dir, m), [px, py] = place(Math.max(s.altDeg, -89), s.azDeg); return { id, p, s, px, py }; }).filter((k) => k.s.altDeg >= 0);
  for (const { id, p, s, px, py } of seen) {
    const eye = BY_EYE.has(id), r = eye ? 4 : 2.2;
    ctx.fillStyle = PLANET_TINT[id]; ctx.beginPath(); ctx.arc(px, py, r, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = ACCENT; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(px, py, r + 4, 0, Math.PI * 2); ctx.stroke();
    // another planet close on the right: this name goes on the left, so it does not sit on that planet's dot
    const crowded = seen.some((k) => k.id !== id && Math.abs(k.py - py) < 14 && k.px > px && k.px - px < 90);
    wanted.push({ text: PLANET_NAMES[id], x: px + r + 9, y: py, font: bodyFont, colour: eye ? ACCENT : 'rgba(233,196,138,.7)', centred: false, rank: eye ? 0 : 1, endAt: crowded ? px - r - 9 : undefined, must: r + 9 });
    marks.push({ kind: 'planet', id, name: PLANET_NAMES[id], x: px, y: py, r: r + 4, altDeg: s.altDeg, azDeg: s.azDeg, au: p.au });
  }

  // the Moon, with the right amount of its face lit and the lit edge turned towards the Sun
  const moon = moonSky(m);
  if (moon.altDeg > -1) {
    const [px, py] = place(moon.altDeg, moon.azDeg), r = Math.max(8, size / 80);
    const [sx, sy] = place(Math.max(sun.altDeg, -89), sun.azDeg), turn = Math.atan2(sy - py, sx - px);
    ctx.save(); ctx.translate(px, py); ctx.rotate(turn);
    ctx.fillStyle = '#2a2a2c'; ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#efe9da'; ctx.beginPath();
    ctx.arc(0, 0, r, -Math.PI / 2, Math.PI / 2);
    // the inner edge of the lit part is half an ellipse: thin for a crescent, bulging for a gibbous Moon
    const k = 1 - 2 * moon.lit;
    ctx.ellipse(0, 0, Math.abs(k) * r, r, 0, Math.PI / 2, -Math.PI / 2, k > 0);
    ctx.fill(); ctx.restore();
    wanted.push({ text: 'The Moon', x: px + r + 7, y: py, font: bodyFont, colour: `rgb(${INK})`, centred: false, rank: -1, must: r + 7 });
    marks.push({ kind: 'moon', id: 'moon', name: 'The Moon', x: px, y: py, r, altDeg: moon.altDeg, azDeg: moon.azDeg, lit: moon.lit, km: moon.km });
  }
  if (sun.altDeg > -1) {
    const [px, py] = place(sun.altDeg, sun.azDeg);
    const glow = ctx.createRadialGradient(px, py, 0, px, py, 46);
    glow.addColorStop(0, 'rgba(255,236,190,1)'); glow.addColorStop(0.2, 'rgba(255,205,120,.7)'); glow.addColorStop(1, 'rgba(255,170,80,0)');
    ctx.fillStyle = glow; ctx.beginPath(); ctx.arc(px, py, 46, 0, Math.PI * 2); ctx.fill();
    marks.push({ kind: 'sun', id: 'sun', name: 'The Sun', x: px, y: py, r: 12, altDeg: sun.altDeg, azDeg: sun.azDeg });
  }
  const taken: [number, number, number, number][] = [];
  ctx.textBaseline = 'middle';
  for (const l of wanted.sort((a, b) => a.rank - b.rank)) {
    ctx.font = l.font;
    const wide = ctx.measureText(l.text).width, first = l.endAt !== undefined ? l.endAt - wide : l.centred ? l.x - wide / 2 : l.x;
    // a planet or the Moon is always named: if the name will not go on the usual side it is tried on the other, then above and below
    const dotX = l.must === undefined ? 0 : l.x - l.must, spots: [number, number][] = [[first, l.y]];
    if (l.must !== undefined) spots.push([dotX + l.must, l.y], [dotX - l.must - wide, l.y], [dotX - wide / 2, l.y - l.must - 6], [dotX - wide / 2, l.y + l.must + 6]);
    const boxOf = ([x, y]: [number, number]): [number, number, number, number] => [x - 3, y - 8, x + wide + 3, y + 8];
    const inside = ([x, y]: [number, number]) => Math.max(Math.hypot(x - c, y - c), Math.hypot(x + wide - c, y - c)) < R - 4;
    const free = (b: [number, number, number, number]) => !taken.some((t) => b[0] < t[2] && b[2] > t[0] && b[1] < t[3] && b[3] > t[1]);
    const spot = spots.find((s) => inside(s) && free(boxOf(s))) ?? (l.must !== undefined ? spots.find(inside) : undefined);
    if (!spot) continue;
    taken.push(boxOf(spot));
    ctx.textAlign = 'left'; ctx.fillStyle = l.colour; ctx.fillText(l.text, spot[0], spot[1]);
  }
  if (picked) {
    const now = marks.find((k) => k.id === picked.id);
    if (now) { ctx.strokeStyle = ACCENT; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(now.x, now.y, now.r + 9, 0, Math.PI * 2); ctx.stroke(); }
  }
  ctx.restore();

  // the horizon, with the four ways marked. East is on the left because you are looking up, not down.
  ctx.strokeStyle = `rgba(${INK},.4)`; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(c, c, R, 0, Math.PI * 2); ctx.stroke();
  ctx.font = `400 ${Math.max(10, size / 78)}px ${MONO}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = `rgba(${INK},.7)`;
  for (const [word, az] of [['N', 0], ['E', 90], ['S', 180], ['W', 270]] as const) {
    const r = R + 14; ctx.fillText(word, c - r * Math.sin(az * RAD), c - r * Math.cos(az * RAD));
  }
  return marks;
}

export { wayOf, heightOf } from './words';

/** How many stars the sky map's own file holds. They are stored brightest first, so this is every star the eye can see. */
export const SKY_STARS = 7200;

/** Fetch the stars the eye can see, their names and the constellation figures. */
export async function load(): Promise<SkyData> {
  const [bin, names, figures] = await Promise.all([
    fetch('/data/sky/stars.bin').then((r) => r.arrayBuffer()),
    fetch('/data/deep/stars.json').then((r) => r.json() as Promise<[number, string][]>),
    fetch('/data/deep/constellations.json').then((r) => r.json() as Promise<Figure[]>),
  ]);
  return { stars: new Float32Array(bin.slice(0, bin.byteLength - (bin.byteLength % 20))), names: new Map(names), figures };
}
