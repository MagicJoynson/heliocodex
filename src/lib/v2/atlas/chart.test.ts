// Run with: npm run test:atlas
import { allBodies } from '../../../data/bodies/index';
import type { KeplerOrbit } from './types';
import { dotAt, fmtDays, fmtKm, labelArc, orbitD, orbitPoints, reachKm, scaleBar, sortIntoFamilies, tiltDeg, topView } from './chart';
import { plates } from './plates';

// A few lines of test harness, so the project needs no test library.
const failed: string[] = [];
function test(name: string, fn: () => void) {
  try { fn(); console.log(`ok    ${name}`); } catch (e) { failed.push(name); console.log(`FAIL  ${name}\n      ${(e as Error).message}`); }
}
const assert = {
  ok(cond: unknown, msg = 'expected a true value') { if (!cond) throw new Error(msg); },
  equal(a: unknown, b: unknown, msg?: string) { if (a !== b) throw new Error(msg ?? `${String(a)} is not ${String(b)}`); },
  deepEqual(a: unknown, b: unknown, msg?: string) { if (JSON.stringify(a) !== JSON.stringify(b)) throw new Error(msg ?? `${JSON.stringify(a)} is not ${JSON.stringify(b)}`); },
  match(s: string, re: RegExp, msg?: string) { if (!re.test(s)) throw new Error(msg ?? `${s.slice(0, 60)} does not match ${re}`); },
};

const JD_2026 = 2461354.5; // 10 Nov 2026
const moon = (id: string) => {
  const b = allBodies.find((x) => x.id === id);
  if (!b || b.orbit.type !== 'kepler') throw new Error(`no orbit for ${id}`);
  return b.orbit as KeplerOrbit;
};
const jovian = allBodies.filter((b) => b.parent === 'jupiter' && b.orbit.type === 'kepler') as { id: string; orbit: KeplerOrbit }[];

// Positions from JPL Horizons (centre 500@599, ecliptic J2000, km), fetched 10 Nov 2026.
const HORIZONS: Record<string, { jd: number; km: [number, number, number] }[]> = {
  io: [
    { jd: 2451545.0, km: [399714.236329573, 129266.6509466162, 10663.25607327993] },
    { jd: 2457174.5, km: [328313.0062391441, 267029.2960555992, 14460.14164805682] },
    { jd: 2461354.5, km: [227607.3008472865, -353614.1081689099, -9535.785606883117] },
  ],
  callisto: [
    { jd: 2451545.0, km: [325079.7306331359, 1852260.033701718, 64754.7663980982] },
    { jd: 2457174.5, km: [-1844676.30853182, -438228.9294755807, -38798.52052139633] },
    { jd: 2461354.5, km: [1869054.023694535, 14969.98183567033, 25615.81129143457] },
  ],
  himalia: [
    { jd: 2451545.0, km: [-4919977.604526566, 8938733.453115566, 4851926.082559068] },
    { jd: 2457174.5, km: [-1763707.617734628, -12007308.07309014, -3784382.382631406] },
    { jd: 2461354.5, km: [-10526427.43219885, 346263.6856838295, 3389252.309648047] },
  ],
};

test('a dot lands where JPL Horizons puts the moon', () => {
  // allowed miss, in drawing units of a plate that just holds the orbit (880 units across)
  const allowed: Record<string, number> = { io: 1, callisto: 2, himalia: 25 };
  for (const [id, rows] of Object.entries(HORIZONS)) {
    const o = moon(id);
    const p = topView('jupiter', o.aKm * (1 + o.e) * 1.05);
    for (const r of rows) {
      const [x, y] = dotAt(p, o, r.jd);
      const [hx, hy] = p.project(...r.km);
      const miss = Math.hypot(x - hx, y - hy);
      assert.ok(miss < allowed[id], `${id} at JD ${r.jd}: ${miss.toFixed(2)} units out`);
    }
  }
});

test('the view is from above the north pole: usual-way moons go anticlockwise on the page', () => {
  const turn = (id: string) => {
    const o = moon(id), p = topView('jupiter', o.aKm * 2);
    const [x0, y0] = dotAt(p, o, JD_2026), [x1, y1] = dotAt(p, o, JD_2026 + o.periodDays / 100);
    return x0 * y1 - y0 * x1; // negative is anticlockwise when y runs down the page
  };
  for (const id of ['io', 'europa', 'ganymede', 'callisto', 'himalia']) assert.ok(turn(id) < 0, `${id} should go anticlockwise`);
  for (const id of ['carme', 'ananke', 'pasiphae']) assert.ok(turn(id) > 0, `${id} should go clockwise`);
});

test('the great moons lie in the plane of the page and at their true distance', () => {
  for (const id of ['io', 'europa', 'ganymede', 'callisto']) {
    const o = moon(id);
    assert.ok(tiltDeg(o, 'jupiter', JD_2026) < 1, `${id} tilt`);
    const p = topView('jupiter', 2_000_000);
    const [x, y] = dotAt(p, o, JD_2026);
    const km = Math.hypot(x, y) * p.kmPerUnit;
    assert.ok(Math.abs(km - o.aKm) < o.aKm * (o.e + 0.002), `${id} drawn ${Math.round(km)} km out, orbit ${o.aKm}`);
  }
  assert.ok(tiltDeg(moon('carme'), 'jupiter', JD_2026) > 150);
});

test('every dot sits on its own orbit line', () => {
  for (const b of jovian) {
    const p = topView('jupiter', b.orbit.aKm * (1 + b.orbit.e) * 1.05);
    const [x, y] = dotAt(p, b.orbit, JD_2026);
    const pts = orbitPoints(p, b.orbit, JD_2026, 720);
    const near = Math.min(...pts.map(([a, c]) => Math.hypot(a - x, c - y)));
    assert.ok(near < 2, `${b.id} is ${near.toFixed(2)} units off its line`);
  }
});

test('orbit paths are closed and inside the plate', () => {
  const spec = plates.jupiter;
  const fams = sortIntoFamilies(jovian, spec.families, 'jupiter', JD_2026);
  for (const f of spec.figures) {
    const p = topView('jupiter', f.spanKm);
    for (const fam of f.families) for (const b of fams.get(fam)!) {
      const d = orbitD(p, b.orbit, JD_2026);
      assert.match(d, /^M-?[\d.]+ -?[\d.]+L.*Z$/);
      for (const [x, y] of orbitPoints(p, b.orbit, JD_2026)) assert.ok(Math.abs(x) <= p.half && Math.abs(y) <= p.half, `${b.id} leaves figure ${f.id}`);
    }
  }
});

test('every moon of Jupiter is in exactly one family and on at least one figure', () => {
  const spec = plates.jupiter;
  const fams = sortIntoFamilies(jovian, spec.families, 'jupiter', JD_2026);
  const total = [...fams.values()].reduce((n, l) => n + l.length, 0);
  assert.equal(total, jovian.length);
  assert.equal(total, 115);
  const drawn = new Set(spec.figures.flatMap((f) => f.families));
  for (const f of spec.families) assert.ok(drawn.has(f.id), `family ${f.id} is on no figure`);
  assert.deepEqual(Object.fromEntries([...fams].map(([k, v]) => [k, v.length])), { 'ring-moons': 4, galilean: 4, themisto: 1, himalia: 11, carpo: 2, valetudo: 1, ananke: 29, carme: 41, pasiphae: 22 });
  for (const f of spec.figures) for (const id of Object.keys(f.names)) {
    assert.ok(f.families.some((fam) => fams.get(fam)!.some((b) => b.id === id)), `${id} is named on figure ${f.id} but not drawn there`);
  }
});

test('names run left to right wherever they sit on the orbit', () => {
  const o = moon('callisto'), p = topView('jupiter', 2_050_000);
  for (const at of [0, 45, 90, 135, 180, 225, 270, 315]) {
    const nums = labelArc(p, o, JD_2026, at, 120).slice(1).split('L').map((s) => s.split(' ').map(Number));
    if (at !== 90 && at !== 270) assert.ok(nums[0][0] < nums[nums.length - 1][0], `at ${at}`);
    const mid = nums[Math.floor(nums.length / 2)];
    const bearing = ((Math.atan2(mid[0], -mid[1]) * 180) / Math.PI + 360) % 360;
    assert.ok(Math.min(Math.abs(bearing - at), 360 - Math.abs(bearing - at)) < 3, `asked ${at}, got ${bearing.toFixed(1)}`);
  }
});

test('scale bars and figures read plainly', () => {
  assert.deepEqual(scaleBar(4659, 220), { km: 1_000_000, units: 1_000_000 / 4659 });
  assert.equal(scaleBar(527, 220).km, 100_000);
  assert.equal(scaleBar(80_682, 220).km, 10_000_000);
  assert.equal(fmtKm(421_800), '421,800 km');
  assert.equal(fmtKm(1_070_400), '1.07 million km');
  assert.equal(fmtKm(23_463_200), '23.5 million km');
  assert.equal(fmtDays(1.769), '42.5 hours');
  assert.equal(fmtDays(16.69), '16.69 days');
  assert.equal(fmtDays(743.6), '744 days');
  assert.ok(reachKm([moon('pasiphae')]) > 30_000_000);
});

console.log(failed.length ? `\n${failed.length} failed` : '\nall passed');
if (failed.length) throw new Error(`${failed.length} atlas tests failed`);
