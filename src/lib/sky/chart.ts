/**
 * Draws the sky above one place the way it is seen: you face one way, the ground is at your feet
 * and the sky rises over it. Looking straight up gives the whole sky as a round chart, with the
 * horizon round the edge and east on the left, as it looks lying on your back with your head to the north.
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
/** Which way the eye is turned: bearing (north 0°, east 90°), height above the horizon, and how many degrees fit across the shorter side of the picture. */
export interface View { azDeg: number; altDeg: number; fovDeg: number }
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

/** Where each star stands for one moment, as east, north and up. Worked out once and kept while only the view turns. */
const stood = new WeakMap<Moment, { dirs: Float32Array; mags: Float32Array }>();
function standing(data: SkyData, m: Moment) {
  let got = stood.get(m);
  if (!got) {
    const n = data.stars.length / 5, dirs = new Float32Array(n * 3), mags = new Float32Array(n);
    for (let i = 0; i < n; i++) {
      const x = data.stars[i * 5], y = data.stars[i * 5 + 1], z = data.stars[i * 5 + 2];
      const s = toSky(fromEngine(x, y, z), m), ca = Math.cos(s.altDeg * RAD);
      dirs[i * 3] = Math.sin(s.azDeg * RAD) * ca; dirs[i * 3 + 1] = Math.cos(s.azDeg * RAD) * ca; dirs[i * 3 + 2] = Math.sin(s.altDeg * RAD);
      mags[i] = seenMag(data.stars[i * 5 + 3], Math.hypot(x, y, z));
    }
    stood.set(m, (got = { dirs, mags }));
  }
  return got;
}

/** Room the page needs kept: how far down the sky may reach before the controls begin, and boxes no name should be written in. */
export interface Room { foot: number; clear: [number, number, number, number][]; /** Where the round chart may begin, when words run right across the top. */ top?: number }

/** The widest view worth having: the whole sky as a round chart that fits the room. */
export function wholeSky(w: number, h: number, room: Room): View {
  const short = Math.min(w, h), across = Math.max(120, Math.min(w, room.foot - (room.top ?? 0)) - 44);
  return { azDeg: 180, altDeg: 90, fovDeg: (4 * Math.atan(short / across)) / RAD };
}

export function draw(ctx: CanvasRenderingContext2D, w: number, h: number, data: SkyData, m: Moment, view: View, shown: Shown, picked: Mark | null, room: Room = { foot: h, clear: [] }): Mark[] {
  const marks: Mark[] = [], cx = w / 2, short = Math.min(w, h);
  // the eye: forward, right and up, each as east, north, up
  const az0 = view.azDeg * RAD, alt0 = view.altDeg * RAD;
  const f: Vec = [Math.sin(az0) * Math.cos(alt0), Math.cos(az0) * Math.cos(alt0), Math.sin(alt0)];
  const r: Vec = [Math.cos(az0), -Math.sin(az0), 0];
  const u: Vec = [r[1] * f[2] - r[2] * f[1], r[2] * f[0] - r[0] * f[2], r[0] * f[1] - r[1] * f[0]];
  // a projection that keeps small shapes true anywhere in the picture (stereographic)
  const S = short / 2 / (2 * Math.tan((view.fovDeg / 4) * RAD));
  // looking low, the horizon is set near the foot of the picture, so the sky fills it; looking high, the view centres itself
  const high = Math.max(0, Math.min(1, (view.altDeg - 30) / 40)), k0 = high * high * (3 - 2 * high);
  const cy = (room.foot - 26 - 2 * S * Math.tan(alt0 / 2)) * (1 - k0) + ((room.foot + (room.top ?? 0)) / 2 + 6) * k0;
  const put = (e: number, n: number, up: number, least = -0.72): [number, number] | null => {
    const d = e * f[0] + n * f[1] + up * f[2];
    if (d < least) return null;
    const k = (2 * S) / (1 + Math.max(d, -0.96));
    return [cx + k * (e * r[0] + n * r[1] + up * r[2]), cy - k * (e * u[0] + n * u[1] + up * u[2])];
  };
  const place = (altDeg: number, azDeg: number, least?: number) => { const ca = Math.cos(altDeg * RAD); return put(Math.sin(azDeg * RAD) * ca, Math.cos(azDeg * RAD) * ca, Math.sin(altDeg * RAD), least); };
  const onScreen = (x: number, y: number, pad = 30) => x > -pad && x < w + pad && y > -pad && y < h + pad;

  const sunDir = sunFromEarth(m.T), sun = toSky(sunDir, m);
  // how much daylight: none with the Sun 12° or more under the horizon, full once it is up
  const day = Math.max(0, Math.min(1, (sun.altDeg + 12) / 12)), dusk = Math.max(0, 1 - Math.abs(sun.altDeg + 4) / 14);

  // ---- the sky: darkest overhead, paler towards the horizon
  ctx.clearRect(0, 0, w, h);
  const top = put(0, 0, 1, -2)!, edge = place(0, view.azDeg, -2)!, reach = Math.max(Math.hypot(edge[0] - top[0], edge[1] - top[1]), 1);
  const air = ctx.createRadialGradient(top[0], top[1], 0, top[0], top[1], reach);
  const tone = (n: [number, number, number], d: [number, number, number]) => `rgb(${n.map((v, i) => Math.round(v + (d[i] - v) * day)).join(',')})`;
  air.addColorStop(0, tone([5, 7, 14], [38, 78, 138])); air.addColorStop(0.55, tone([8, 11, 22], [58, 104, 164]));
  air.addColorStop(0.86, tone([15, 20, 36], [104, 146, 190])); air.addColorStop(1, tone([27, 33, 52], [158, 184, 206]));
  ctx.fillStyle = air; ctx.fillRect(0, 0, w, h);
  // the glow over where the Sun has set or is about to rise
  if (dusk > 0) {
    const at = place(Math.min(sun.altDeg, 2), sun.azDeg, -0.9);
    if (at) {
      const glow = ctx.createRadialGradient(at[0], at[1], 0, at[0], at[1], S * 1.5);
      glow.addColorStop(0, `rgba(255,170,96,${0.5 * dusk})`); glow.addColorStop(0.3, `rgba(214,120,96,${0.24 * dusk})`); glow.addColorStop(0.65, `rgba(120,96,150,${0.1 * dusk})`); glow.addColorStop(1, 'rgba(120,96,150,0)');
      ctx.fillStyle = glow; ctx.fillRect(0, 0, w, h);
    }
  }

  // names are placed at the end, most important first, and one that would sit on another is left out
  const wanted: { text: string; x: number; y: number; font: string; colour: string; centred: boolean; rank: number; endAt?: number; must?: number; back?: number }[] = [];
  // fainter stars come in as the view closes in, so a wide view is not a blur of dots
  const faintest = Math.max(4.6, Math.min(6.5, 2.1 + 1.7 * Math.log10(S))), grow = Math.max(0.8, Math.min(1.5, Math.sqrt(S / 300)));
  const dim = 1 - 0.8 * day;

  // ---- stars
  const { dirs, mags } = standing(data, m), n = mags.length, at = new Float32Array(n * 2), up = new Uint8Array(n);
  for (let i = 0; i < n; i++) {
    const e = dirs[i * 3], no = dirs[i * 3 + 1], z = dirs[i * 3 + 2];
    if (z < -0.02) continue;
    const p = put(e, no, z);
    if (!p) continue;
    at[i * 2] = p[0]; at[i * 2 + 1] = p[1]; up[i] = 1;
    const mag = mags[i];
    if (mag > faintest || !onScreen(p[0], p[1])) continue;
    // a brighter star is a bigger dot; low down, the thicker air dims it
    const low = Math.min(1, 0.45 + z * 4), size = Math.max(0.55, 3.5 * Math.pow(10, -0.155 * mag)) * grow, rgb = tint(data.stars[i * 5 + 4]);
    const alpha = Math.min(1, (0.34 + (faintest - mag) * 0.2) * dim * low);
    if (mag < 2.4 && dim > 0.3) {
      const halo = ctx.createRadialGradient(p[0], p[1], 0, p[0], p[1], size * 4.5);
      halo.addColorStop(0, `rgba(${rgb},${0.34 * alpha})`); halo.addColorStop(1, `rgba(${rgb},0)`);
      ctx.fillStyle = halo; ctx.beginPath(); ctx.arc(p[0], p[1], size * 4.5, 0, Math.PI * 2); ctx.fill();
    }
    ctx.fillStyle = `rgba(${rgb},${alpha})`;
    ctx.beginPath(); ctx.arc(p[0], p[1], size, 0, Math.PI * 2); ctx.fill();
    if (mag < 4.8 && z > 0) marks.push({ kind: 'star', id: `star:${i}`, index: i, name: data.names.get(i) ?? '', x: p[0], y: p[1], r: size, altDeg: Math.asin(z) / RAD, azDeg: ((Math.atan2(e, no) / RAD) + 360) % 360, mag, ly: Math.hypot(data.stars[i * 5], data.stars[i * 5 + 1], data.stars[i * 5 + 2]) * LY_PER_PC, colour: data.stars[i * 5 + 4], suns: Math.pow(10, (4.83 - data.stars[i * 5 + 3]) / 2.5) });
  }

  // ---- the path the Sun, Moon and planets keep to
  if (shown.path) {
    ctx.strokeStyle = 'rgba(233,196,138,.3)'; ctx.lineWidth = 1; ctx.setLineDash([2, 6]); ctx.beginPath();
    let pen = false;
    for (let lon = 0; lon <= 360; lon += 2) {
      const s = toSky([Math.cos((lon - m.slide / RAD) * RAD), Math.sin((lon - m.slide / RAD) * RAD), 0], m), p = s.altDeg < -1 ? null : place(s.altDeg, s.azDeg);
      if (!p) { pen = false; continue; }
      if (pen) ctx.lineTo(p[0], p[1]); else ctx.moveTo(p[0], p[1]);
      pen = true;
    }
    ctx.stroke(); ctx.setLineDash([]);
  }

  // ---- the figures, and a name where enough of a figure is in sight
  const labels: { name: string; x: number; y: number }[] = [];
  ctx.strokeStyle = `rgba(${INK},${0.22 * (1 - 0.5 * day)})`; ctx.lineWidth = 1;
  for (const fig of data.figures) {
    let sx = 0, sy = 0, count = 0, total = 0;
    ctx.beginPath();
    for (const [a, b] of fig.lines) {
      total += 2;
      if (a >= n || b >= n || !up[a] || !up[b]) continue;
      if (shown.figures) { ctx.moveTo(at[a * 2], at[a * 2 + 1]); ctx.lineTo(at[b * 2], at[b * 2 + 1]); }
      sx += at[a * 2] + at[b * 2]; sy += at[a * 2 + 1] + at[b * 2 + 1]; count += 2;
    }
    if (shown.figures) ctx.stroke();
    if (count >= total * 0.6 && count > 0) labels.push({ name: fig.name, x: sx / count, y: sy / count });
  }
  if (shown.names) {
    const figureFont = `italic 300 ${Math.max(12, Math.min(17, S / 22))}px ${SERIF}`, starFont = `400 ${Math.max(9.5, Math.min(11.5, S / 34))}px ${MONO}`;
    const named = S > 260 ? 2.7 : 2.1;
    for (const l of labels) if (onScreen(l.x, l.y, -20)) wanted.push({ text: l.name, x: l.x, y: l.y, font: figureFont, colour: `rgba(${INK},.5)`, centred: true, rank: 3 });
    for (const s of marks) if (s.kind === 'star' && s.name && (s.mag ?? 9) < named) wanted.push({ text: s.name.toUpperCase(), x: s.x + s.r + 6, y: s.y + 1, font: starFont, colour: `rgba(${INK},.72)`, centred: false, rank: 2 + (s.mag ?? 0) / 10, back: 2 * (s.r + 6) });
  }

  // ---- planets
  const bodyFont = `400 ${Math.max(13, Math.min(17, S / 20))}px ${SERIF}`;
  const seen = PLANETS.map((id) => { const p = planetFromEarth(id, m.T), s = toSky(p.dir, m); return { id, p, s, at: s.altDeg < 0 ? null : place(s.altDeg, s.azDeg) }; }).filter((k) => k.at);
  for (const { id, p, s, at: [px, py] = [0, 0] } of seen as { id: string; p: { au: number }; s: { altDeg: number; azDeg: number }; at: [number, number] }[]) {
    const eye = BY_EYE.has(id), rad = (eye ? 4 : 2.2) * grow;
    if (eye && dim > 0.3) {
      const halo = ctx.createRadialGradient(px, py, 0, px, py, rad * 4);
      halo.addColorStop(0, 'rgba(255,236,200,.3)'); halo.addColorStop(1, 'rgba(255,236,200,0)');
      ctx.fillStyle = halo; ctx.beginPath(); ctx.arc(px, py, rad * 4, 0, Math.PI * 2); ctx.fill();
    }
    ctx.fillStyle = PLANET_TINT[id]; ctx.beginPath(); ctx.arc(px, py, rad, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = ACCENT; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(px, py, rad + 4, 0, Math.PI * 2); ctx.stroke();
    // another planet close on the right: this name goes on the left, so it does not sit on that planet's dot
    const crowded = seen.some((k) => k.id !== id && Math.abs(k.at![1] - py) < 14 && k.at![0] > px && k.at![0] - px < 90);
    wanted.push({ text: PLANET_NAMES[id], x: px + rad + 9, y: py, font: bodyFont, colour: eye ? ACCENT : 'rgba(233,196,138,.75)', centred: false, rank: eye ? 0 : 1, endAt: crowded ? px - rad - 9 : undefined, must: rad + 9 });
    marks.push({ kind: 'planet', id, name: PLANET_NAMES[id], x: px, y: py, r: rad + 4, altDeg: s.altDeg, azDeg: s.azDeg, au: p.au });
  }

  // ---- the Moon, with the right amount of its face lit and the lit edge turned towards the Sun
  const moon = moonSky(m), moonAt = moon.altDeg > -1 ? place(moon.altDeg, moon.azDeg) : null;
  if (moonAt) {
    const [px, py] = moonAt, rad = Math.max(8, S / 34);
    const sunAt = place(sun.altDeg, sun.azDeg, -2)!, turn = Math.atan2(sunAt[1] - py, sunAt[0] - px);
    if (dim > 0.3) {
      const halo = ctx.createRadialGradient(px, py, rad * 0.8, px, py, rad * (2 + 4 * moon.lit));
      halo.addColorStop(0, `rgba(239,233,218,${0.22 * moon.lit + 0.04})`); halo.addColorStop(1, 'rgba(239,233,218,0)');
      ctx.fillStyle = halo; ctx.beginPath(); ctx.arc(px, py, rad * (2 + 4 * moon.lit), 0, Math.PI * 2); ctx.fill();
    }
    ctx.save(); ctx.translate(px, py); ctx.rotate(turn);
    ctx.fillStyle = '#26272b'; ctx.beginPath(); ctx.arc(0, 0, rad, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#efe9da'; ctx.beginPath();
    ctx.arc(0, 0, rad, -Math.PI / 2, Math.PI / 2);
    // the inner edge of the lit part is half an ellipse: thin for a crescent, bulging for a gibbous Moon
    const k = 1 - 2 * moon.lit;
    ctx.ellipse(0, 0, Math.abs(k) * rad, rad, 0, Math.PI / 2, -Math.PI / 2, k > 0);
    ctx.fill(); ctx.restore();
    wanted.push({ text: 'The Moon', x: px + rad + 8, y: py, font: bodyFont, colour: `rgb(${INK})`, centred: false, rank: -1, must: rad + 8 });
    marks.push({ kind: 'moon', id: 'moon', name: 'The Moon', x: px, y: py, r: rad, altDeg: moon.altDeg, azDeg: moon.azDeg, lit: moon.lit, km: moon.km });
  }
  if (sun.altDeg > -1) {
    const p = place(sun.altDeg, sun.azDeg);
    if (p) {
      const glow = ctx.createRadialGradient(p[0], p[1], 0, p[0], p[1], S * 0.22);
      glow.addColorStop(0, 'rgba(255,246,220,1)'); glow.addColorStop(0.12, 'rgba(255,226,160,.9)'); glow.addColorStop(0.4, 'rgba(255,190,110,.25)'); glow.addColorStop(1, 'rgba(255,170,80,0)');
      ctx.fillStyle = glow; ctx.beginPath(); ctx.arc(p[0], p[1], S * 0.22, 0, Math.PI * 2); ctx.fill();
      wanted.push({ text: 'The Sun', x: p[0] + 22, y: p[1], font: bodyFont, colour: `rgb(${INK})`, centred: false, rank: -2, must: 22 });
      marks.push({ kind: 'sun', id: 'sun', name: 'The Sun', x: p[0], y: p[1], r: 12, altDeg: sun.altDeg, azDeg: sun.azDeg });
    }
  }

  // ---- the ground: everything outside the line where the sky meets it
  const rim: [number, number][] = [];
  for (let az = 0; az < 360; az += 2) rim.push(place(0, az, -2)!);
  ctx.beginPath(); ctx.rect(-2, -2, w + 4, h + 4);
  rim.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.closePath();
  const soil = ctx.createLinearGradient(0, edge[1], 0, edge[1] + S * 0.5);
  soil.addColorStop(0, tone([9, 10, 13], [30, 38, 40])); soil.addColorStop(1, tone([6, 6, 8], [16, 20, 22]));
  ctx.fillStyle = soil; ctx.fill('evenodd');
  // haze where the two meet
  ctx.beginPath(); rim.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.closePath();
  ctx.strokeStyle = `rgba(${INK},.3)`; ctx.lineWidth = 1; ctx.stroke();
  // the eight ways, written on the ground under the horizon
  const wayFont = `400 ${Math.max(10, Math.min(12, S / 30))}px ${MONO}`, drop = Math.min(5, view.fovDeg / 26);
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  for (const [word, az] of [['N', 0], ['NE', 45], ['E', 90], ['SE', 135], ['S', 180], ['SW', 225], ['W', 270], ['NW', 315]] as const) {
    const p = place(-drop, az, -0.3);
    if (!p || !onScreen(p[0], p[1], -8) || p[1] > room.foot - 6) continue;
    ctx.font = wayFont; ctx.fillStyle = word.length === 1 ? ACCENT : `rgba(${INK},.55)`; ctx.fillText(word, p[0], p[1]);
  }

  // ---- names
  const taken: [number, number, number, number][] = [...room.clear, [0, room.foot - 24, w, h]];
  ctx.textBaseline = 'middle';
  // a name must not run down into the ground: it has to sit inside the line of the horizon
  const below = (x: number, y: number) => {
    let inside = false;
    for (let i = 0, j = rim.length - 1; i < rim.length; j = i++) {
      const [xi, yi] = rim[i], [xj, yj] = rim[j];
      if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
    }
    return !inside;
  };
  for (const l of wanted.sort((a, b) => a.rank - b.rank)) {
    ctx.font = l.font;
    const wide = ctx.measureText(l.text).width, first = l.endAt !== undefined ? l.endAt - wide : l.centred ? l.x - wide / 2 : l.x;
    // a planet or the Moon is always named: if the name will not go on the usual side it is tried on the other, then above and below
    const dotX = l.must === undefined ? 0 : l.x - l.must, spots: [number, number][] = [[first, l.y]];
    if (l.must !== undefined) spots.push([dotX + l.must, l.y], [dotX - l.must - wide, l.y], [dotX - wide / 2, l.y - l.must - 6], [dotX - wide / 2, l.y + l.must + 6]);
    // a star's name goes to its left when there is no room on the right
    if (l.back !== undefined) spots.push([l.x - l.back - wide, l.y]);
    const boxOf = ([x, y]: [number, number]): [number, number, number, number] => [x - 3, y - 8, x + wide + 3, y + 8];
    const inside = ([x, y]: [number, number]) => x > 6 && x + wide < w - 6 && y > 12 && y < h - 12 && !below(x, y) && !below(x + wide, y);
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
