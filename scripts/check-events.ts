/**
 * Compares the Sky events calendar (src/lib/sky/calendar.ts) with NASA/JPL Horizons, the reference ephemeris.
 * Needs the network, so it is run by hand, not in the build:  npm run check:events
 * For each kind of event it finds the same instant in Horizons (geocentric, apparent) and prints the difference.
 */
import { execFileSync } from 'node:child_process';
import { calendar, type Item } from '../src/lib/sky/calendar';

const ID: Record<string, string> = { mercury: '199', venus: '299', mars: '499', jupiter: '599', saturn: '699', uranus: '799', neptune: '899', sun: '10', moon: '301' };
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
const iso = (d: Date) => d.toISOString().slice(0, 16).replace('T', ' ');

async function horizons(body: string, q: string, from: Date, to: Date, stepMin: number): Promise<string[][]> {
  const u = new URL('https://ssd.jpl.nasa.gov/api/horizons.api');
  const set = (k: string, v: string) => u.searchParams.set(k, v);
  set('format', 'text'); set('COMMAND', `'${ID[body]}'`); set('OBJ_DATA', "'NO'"); set('MAKE_EPHEM', "'YES'"); set('EPHEM_TYPE', "'OBSERVER'"); set('CENTER', "'500@399'");
  set('START_TIME', `'${iso(from)}'`); set('STOP_TIME', `'${iso(to)}'`); set('STEP_SIZE', `'${stepMin}m'`); set('QUANTITIES', `'${q}'`); set('CSV_FORMAT', "'YES'"); set('TIME_DIGITS', "'MINUTES'"); set('ANG_FORMAT', "'DEG'");
  let text = '';
  // curl, because it follows the proxy settings of the environment that node's own fetch ignores
  for (let k = 0; k < 4; k++) { try { text = execFileSync('curl', ['-s', '-m', '40', u.toString()], { encoding: 'utf8', maxBuffer: 1 << 26 }); } catch { text = ''; } if (text.includes('$$SOE')) break; await wait(1500); }
  const rows = text.split('$$SOE')[1]?.split('$$EOE')[0]?.trim().split('\n') ?? [];
  await wait(350);
  return rows.map((r) => r.split(',').map((c) => c.trim()));
}
const when = (s: string) => new Date(s.replace(/^(\d{4})-(\w{3})-(\d\d) (\d\d:\d\d)$/, (_, y, m, d, t) => `${y}-${String('JanFebMarAprMayJunJulAugSepOctNovDec'.indexOf(m) / 3 + 1).padStart(2, '0')}-${d}T${t}:00Z`));
const norm180 = (x: number) => ((x + 540) % 360) - 180;

/** The planet's apparent ecliptic longitude minus the Sun's, over a window (quantity 31). */
async function lonDiff(id: string, c: Date, hours: number) {
  const a = new Date(c.getTime() - hours * 3600000), b = new Date(c.getTime() + hours * 3600000);
  const [p, s] = [await horizons(id, '31', a, b, 60), await horizons('sun', '31', a, b, 60)];
  // the date, then the longitude, is the first and (after two flag columns) the next columns
  return p.map((r, i) => ({ t: when(r[0]).getTime(), d: norm180(parseFloat(r[3]) - parseFloat(s[i][3])) }));
}
const zero = (v: { t: number; d: number }[], target: number) => {
  for (let i = 1; i < v.length; i++) {
    const a = norm180(v[i - 1].d - target), b = norm180(v[i].d - target);
    if (Math.abs(a) < 90 && a * b <= 0) return v[i - 1].t + (v[i].t - v[i - 1].t) * (a / (a - b));
  }
  return NaN;
};
const peak = (v: { t: number; y: number }[], sign: number) => {
  let k = 0; for (let i = 1; i < v.length; i++) if (sign * v[i].y > sign * v[k].y) k = i;
  if (k === 0 || k === v.length - 1) return { t: NaN, y: NaN };
  const [y0, y1, y2] = [v[k - 1].y, v[k].y, v[k + 1].y], h = v[k].t - v[k - 1].t, off = (0.5 * (y0 - y2)) / (y0 - 2 * y1 + y2);
  return { t: v[k].t + off * h, y: y1 - 0.25 * (y0 - y2) * off };
};

type Row = { what: string; ours: string; theirs: string; diff: string };
const rows: Row[] = [];
const hm = (min: number) => (Math.abs(min) < 90 ? `${min.toFixed(0)} min` : `${(min / 60).toFixed(1)} h`);

const items = calendar(new Date('2026-12-01T00:00:00Z'), new Date('2028-12-01T00:00:00Z'));
const pick = (kind: string, n: number, f: (i: Item) => boolean = () => true) => items.filter((i) => i.kind === kind && f(i)).slice(0, n);

for (const it of [...pick('opposition', 6)]) {
  const id = it.title.split(' ')[0].toLowerCase();
  const t = zero(await lonDiff(id, it.at, 48), 180);
  rows.push({ what: it.title, ours: iso(it.at), theirs: iso(new Date(t)), diff: hm((it.at.getTime() - t) / 60000) });
}
for (const it of pick('sun', 3, (i) => /Mercury|Venus/.test(i.title) || true)) {
  const id = it.title.split(' ')[0].toLowerCase();
  const t = zero(await lonDiff(id, it.at, 48), 0);
  rows.push({ what: it.title, ours: iso(it.at), theirs: iso(new Date(t)), diff: hm((it.at.getTime() - t) / 60000) });
}
for (const it of pick('elongation', 4)) {
  const id = it.title.split(' ')[0].toLowerCase();
  const a = new Date(it.at.getTime() - 48 * 3600000), b = new Date(it.at.getTime() + 48 * 3600000);
  const e = (await horizons(id, '23', a, b, 60)).map((r) => ({ t: when(r[0]).getTime(), y: parseFloat(r[3]) }));
  const p = peak(e, 1);
  rows.push({ what: `${it.title} (${it.figure})`, ours: iso(it.at), theirs: `${iso(new Date(p.t))}, ${p.y.toFixed(1)}°`, diff: hm((it.at.getTime() - p.t) / 60000) });
}
for (const it of pick('pair', 3)) {
  const [A, B] = it.title.replace(' close', '').split(' and ').map((s) => s.toLowerCase());
  const a = new Date(it.at.getTime() - 36 * 3600000), b = new Date(it.at.getTime() + 36 * 3600000);
  const [pa, pb] = [await horizons(A, '1', a, b, 20), await horizons(B, '1', a, b, 20)];
  const sep = pa.map((r, i) => {
    const [ra1, d1, ra2, d2] = [parseFloat(r[3]), parseFloat(r[4]), parseFloat(pb[i][3]), parseFloat(pb[i][4])].map((x, k) => (k % 2 ? x : x) * Math.PI / 180);
    return { t: when(r[0]).getTime(), y: Math.acos(Math.min(1, Math.sin(d1) * Math.sin(d2) + Math.cos(d1) * Math.cos(d2) * Math.cos(ra1 - ra2))) * 180 / Math.PI };
  });
  const p = peak(sep, -1);
  rows.push({ what: `${it.title} (${it.figure})`, ours: iso(it.at), theirs: `${iso(new Date(p.t))}, ${Math.abs(p.y).toFixed(2)}° apart`, diff: hm((it.at.getTime() - p.t) / 60000) });
}
for (const [kind, sign] of [['near', 1], ['far', -1]] as const) for (const it of pick(kind, 3)) {
  const a = new Date(it.at.getTime() - 24 * 3600000), b = new Date(it.at.getTime() + 24 * 3600000);
  const d = (await horizons('moon', '20', a, b, 10)).map((r) => ({ t: when(r[0]).getTime(), y: parseFloat(r[3]) * 149597870.7 }));
  const p = peak(d, sign === 1 ? -1 : 1);
  const ours = parseFloat((it.figure ?? "0").replace(/[, km]/g, ""));
  rows.push({ what: `${it.title} (${it.figure})`, ours: iso(it.at), theirs: `${iso(new Date(p.t))}, ${Math.round(Math.abs(p.y)).toLocaleString('en-GB')} km`, diff: `${hm((it.at.getTime() - p.t) / 60000)}, ${Math.round(ours - Math.abs(p.y)).toLocaleString('en-GB')} km` });
}
console.log('| Event | Ours (UT) | JPL Horizons (UT) | Difference |\n|---|---|---|---|');
for (const r of rows) console.log(`| ${r.what} | ${r.ours} | ${r.theirs} | ${r.diff} |`);
