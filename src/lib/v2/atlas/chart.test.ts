// Run with: npm run test:atlas
import { allBodies } from '../../../data/bodies/index';
import type { KeplerOrbit } from './types';
import { dotAt, fitsOn, pointAt, fmtDays, fmtKm, labelArc, orbitD, orbitPoints, reachKm, scaleBar, sortIntoFamilies, tiltDeg, topView, viewAbove } from './chart';
import { plates } from './plates';
import { groups, shown, solarSystem } from './plates/solar-system';
import { AU_KM, fmtAu, fmtYears, isPlanet, planetOrbit } from './sun';
import { keplerPosition } from './kepler';
import { landmarks } from './landmarks';
import { bodyMarks, landmarkMarks, layout, readLength, RULES, spread, TOP } from './ruler';
import { positionAU } from '../../orbit';
import { chainFor, LADDER, pick, PLACE_NAMES, type MarginData } from '../margin/pick';
import { places } from './places';
import { groupOf, groups as smallGroups, inStep, offChart, shown as smallShown, smallBodiesPlate } from './plates/small-bodies';
import { smallBodies, smallSpread } from '../../../data/bodies/index';

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

test('every plate: each moon in one family, every family drawn, every orbit inside its drawing, every name on a drawn moon', () => {
  const expected: Record<string, number> = { earth: 1, mars: 2, jupiter: 115, saturn: 292, uranus: 29, neptune: 16, pluto: 5, orcus: 1, haumea: 2, quaoar: 1, makemake: 1, gonggong: 1, eris: 1 };
  for (const [id, spec] of Object.entries(plates)) {
    const moons = allBodies.filter((b) => b.parent === id && b.orbit.type === 'kepler') as { id: string; orbit: KeplerOrbit }[];
    assert.equal(moons.length, expected[id], `${id} has ${moons.length} moons`);
    for (const m of moons) assert.ok(m.orbit.aKm > 0 && m.orbit.e >= 0 && m.orbit.e < 1, `${m.id} has a broken orbit`);
    const fams = sortIntoFamilies(moons, spec.families, id, JD_2026);
    assert.equal([...fams.values()].reduce((n, l) => n + l.length, 0), moons.length);
    const drawn = new Set(spec.figures.flatMap((f) => f.families));
    for (const f of spec.families) { assert.ok(drawn.has(f.id), `${id}: family ${f.id} is on no drawing`); assert.ok(fams.get(f.id)!.length > 0, `${id}: family ${f.id} is empty`); }
    const shown = new Set<string>();
    for (const f of spec.figures) {
      const p = topView(id, f.spanKm, 440, f.view);
      const here = f.families.flatMap((fam) => fams.get(fam)!).filter((b) => fitsOn(p, b.orbit, JD_2026));
      for (const b of here) shown.add(b.id);
      for (const b of here) for (const [x, y] of orbitPoints(p, b.orbit, JD_2026, 90)) assert.ok(Math.abs(x) <= p.half && Math.abs(y) <= p.half, `${b.id} leaves ${id} drawing ${f.id}`);
      for (const name of Object.keys(f.names)) assert.ok(here.some((b) => b.id === name), `${name} is named on ${id} drawing ${f.id} but not drawn there`);
      if (f.marks) assert.ok(spec.figures.some((g) => g.id === f.marks), `${id} drawing ${f.id} marks a drawing that does not exist`);
    }
    for (const m of moons) assert.ok(shown.has(m.id), `${m.id} is on no drawing of ${id}`);
  }
});

test('tilt: Uranus, on its side, still has flat close moons; its far moons are measured from the plane of the planets', () => {
  assert.ok(tiltDeg(moon('titania'), 'uranus', JD_2026) < 1);
  assert.ok(tiltDeg(moon('margaret'), 'uranus', JD_2026) < 90, 'Margaret goes the usual way');
  assert.ok(tiltDeg(moon('sycorax'), 'uranus', JD_2026) > 90, 'Sycorax goes backwards');
  assert.ok(tiltDeg(moon('triton'), 'neptune', JD_2026) > 150, 'Triton goes backwards');
  assert.ok(Math.abs(tiltDeg(moon('moon'), 'earth', JD_2026) - 5.1) < 0.3, 'the Moon is tilted about 5 degrees to the plane of the planets');
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

test('planets: the atlas orbit follows the site\'s own planet positions for twenty years either way', () => {
  for (const id of ['mercury', 'venus', 'earth', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune']) {
    const o = planetOrbit(id, JD_2026);
    for (const days of [0, 400, -400, 7305, -7305]) {
      const k = keplerPosition(o, 'sun', JD_2026 + days), a = positionAU(id, (JD_2026 + days - 2451545) / 36525);
      const off = Math.hypot(k[0] - a[0] * AU_KM, k[1] - a[1] * AU_KM, k[2] - a[2] * AU_KM) / o.aKm;
      assert.ok(off < 2e-4, `${id} is ${(off * 57.3).toFixed(3)} degrees out after ${days} days`);
    }
  }
});

test('planets: on 10 November the Earth is where the calendar says, with the Sun at longitude 228', () => {
  const k = keplerPosition(planetOrbit('earth', JD_2026), 'sun', JD_2026);
  const lon = ((Math.atan2(k[1], k[0]) * 180) / Math.PI + 360) % 360;
  assert.ok(Math.abs(lon - 48) < 1.5, `Earth at longitude ${lon.toFixed(1)}`);
  assert.ok(Math.abs(Math.hypot(k[0], k[1], k[2]) / AU_KM - 0.990) < 0.004, 'and a little inside one au, as it is in November');
});

test('Solar System plates: every world is in one list and on a drawing, and nothing leaves a frame', () => {
  const worlds = allBodies.filter((b) => b.parent === 'sun' && (b.kind === 'planet' || b.kind === 'dwarf'));
  assert.equal(worlds.length, 17);
  const orbitOf = (id: string) => (isPlanet(id) ? planetOrbit(id, JD_2026) : moon(id));
  for (const w of worlds) {
    assert.equal(groups.filter((g) => g.ids.includes(w.id)).length, 1, `${w.id} should be in exactly one list`);
    assert.ok(Object.values(shown).some((ids) => ids.includes(w.id)), `${w.id} is on no drawing`);
  }
  assert.equal(groups.flatMap((g) => g.ids).length, 17, 'no list names a world that is not in the data');
  for (const f of solarSystem.figures) {
    const p = topView('sun', f.spanKm, 440, f.view, f.centreKm);
    for (const id of shown[f.id]) assert.ok(fitsOn(p, orbitOf(id), JD_2026), `${id} leaves drawing ${f.id}`);
    for (const id of [...Object.keys(f.names), ...Object.keys(f.leaders ?? {})]) assert.ok(shown[f.id].includes(id), `${id} is named on drawing ${f.id} but not drawn there`);
    for (const id of shown[f.id]) if (id !== 'neptune' || f.id !== 'sedna') assert.ok(f.names[id] !== undefined || f.leaders?.[id], `${id} has no name on drawing ${f.id}`);
    if (f.marks) assert.ok(solarSystem.figures.some((g) => g.id === f.marks));
  }
});

test('an off-centre drawing moves everything together', () => {
  const o = planetOrbit('neptune', JD_2026);
  const a = topView('sun', 76 * AU_KM, 440, 'ecliptic'), b = topView('sun', 76 * AU_KM, 440, 'ecliptic', [19 * AU_KM, -38 * AU_KM]);
  assert.deepEqual(b.origin.map(Math.round), [-110, 220]);
  const [ax, ay] = dotAt(a, o, JD_2026), [bx, by] = dotAt(b, o, JD_2026);
  assert.ok(Math.abs(bx - ax + 110) < 1e-6 && Math.abs(by - ay - 220) < 1e-6);
  // a bearing is measured from the Sun, not from the middle of the page
  const [px, py] = pointAt(b, o, JD_2026, 90);
  assert.ok(px > b.origin[0] && Math.abs(py - b.origin[1]) < 4, 'bearing 90 is straight to the right of the Sun');
});

test('distances and years round the Sun read plainly', () => {
  assert.equal(fmtAu(0.387098 * AU_KM), '0.387 au');
  assert.equal(fmtAu(5.2 * AU_KM), '5.20 au');
  assert.equal(fmtAu(543.7 * AU_KM), '544 au');
  assert.equal(fmtYears(87.97), '88 days');
  assert.equal(fmtYears(4332.6), '11.9 years');
  assert.equal(fmtYears(60190), '165 years');
  assert.equal(fmtKm(4_498_400_000), '4.5 billion km');
  assert.equal(fmtKm(778_500_000), '779 million km');
});

test('landmarks: what the reader sees agrees with where the mark is put', () => {
  assert.equal(new Set(landmarks.map((l) => l.id)).size, landmarks.length, 'two landmarks share an id');
  for (const l of landmarks) {
    const said = readLength(l.value);
    assert.ok(said !== null, `${l.id}: no length in "${l.value}"`);
    assert.ok(Math.abs(Math.log10(said! / l.metres)) < 0.02, `${l.id}: says ${l.value} but is put at ${l.metres.toPrecision(4)} m`);
    assert.ok(l.metres >= 1 && Math.log10(l.metres) < TOP, `${l.id} is off the ruler`);
    assert.match(l.source.url, /^https:\/\//, `${l.id} has no source`);
    assert.ok(l.note.length > 30 && !/[—–]/.test(l.note + l.name + l.value), `${l.id}: note too short, or a dash crept in`);
  }
});

test('ruler: the rules are in order and each says the length it stands at', () => {
  for (let k = 0; k < RULES.length; k++) {
    if (k > 0) assert.ok(RULES[k].at > RULES[k - 1].at);
    assert.ok(Math.abs(Math.log10(readLength(RULES[k].unit)!) - RULES[k].at) < 1e-9, `${RULES[k].unit} is at ${RULES[k].at}`);
  }
  assert.ok(Math.abs(RULES[16].at - 15.976) < 0.001, 'a light year is 9.46e15 m');
});

test('ruler: labels spread apart by the least movement', () => {
  assert.deepEqual(spread([1, 5], [1, 1], 0, 10), [1, 5]);
  assert.deepEqual(spread([5, 5], [1, 1], 0, 10), [4.5, 5.5]);
  assert.deepEqual(spread([0.2, 0.3], [1, 1], 0, 10), [0.5, 1.5]);
  assert.deepEqual(spread([9.9, 9.95], [1, 2], 0, 10), [7.5, 9]);
  assert.equal(spread([1, 2, 3], [1, 1, 1], 0, 2.5), null);
});

test('ruler: nothing touches, nothing is lost, and the planets and landmarks are always written', () => {
  const marks = [...landmarkMarks(), ...bodyMarks(allBodies, JD_2026)];
  assert.equal(new Set(marks.map((m) => m.id)).size, marks.length, 'two marks share an id');
  for (const opt of [{ columns: 2 as const, slot: 1.65 / 16, tall: 2.6 / 16, under: 1.8 / 16, maxShift: 0.3 }, { columns: 1 as const, slot: 1.65 / 24, tall: 2.6 / 24, under: 2.9 / 24, maxShift: 0.3 }]) {
    const out = layout(marks, RULES, opt);
    assert.equal(out.placed.length + out.more.reduce((n, m) => n + m.count, 0), marks.length, 'every mark is written or counted');
    for (const m of marks) if (m.rank <= 1) assert.ok(out.placed.some((p) => p.id === m.id), `${m.id} is not written with ${opt.columns} columns`);
    const h = (lines: number) => (lines === 2 ? opt.tall : opt.slot);
    for (let c = 0; c < opt.columns; c++) {
      const col = [
        ...out.placed.filter((p) => p.column === c).map((p) => ({ id: p.id, top: p.at - h(p.lines) / 2, bottom: p.at + h(p.lines) / 2 })),
        ...out.more.filter((m) => m.column === c).map((m) => ({ id: m.text, top: m.at - opt.slot / 2, bottom: m.at + opt.slot / 2 })),
        ...RULES.map((r) => ({ id: r.unit, top: r.at, bottom: r.at + opt.under })),
      ].sort((a, b) => a.top - b.top);
      for (let i = 1; i < col.length; i++) assert.ok(col[i].top >= col[i - 1].bottom - 1e-9, `${col[i - 1].id} and ${col[i].id} touch`);
    }
    for (const p of out.placed) if (p.rank > 1) assert.ok(Math.abs(p.at - p.y) <= opt.maxShift + 1e-9, `${p.id} is moved too far`);
    for (const p of out.placed) assert.ok(p.rank < 4, 'unmeasured moons are counted, not written');
  }
  const earth = marks.find((m) => m.id === 'earth-orbit')!;
  assert.ok(Math.abs(earth.metres - 1.496e11) < 1e9 && earth.value === '1.00 au');
  assert.equal(marks.find((m) => m.id === 'moon-width')!.value, '3,475 km wide');
});

test('dwarf-planet moons: seen from above its own orbit a moon keeps its true distance, and the usual way round is anticlockwise', () => {
  for (const id of ['dysnomia', 'vanth', 'hiiaka', 'weywot']) {
    const b = allBodies.find((x) => x.id === id)!, o = b.orbit as KeplerOrbit;
    const p = topView(b.parent!, o.aKm * 1.4, 440, viewAbove(o));
    const pts = orbitPoints(p, o, JD_2026, 90);
    for (const [x, y] of pts) {
      const km = Math.hypot(x, y) * p.kmPerUnit;
      assert.ok(km > o.aKm * (1 - o.e) * 0.995 && km < o.aKm * (1 + o.e) * 1.005, `${id} drawn ${Math.round(km)} km out`);
    }
    const [x0, y0] = dotAt(p, o, JD_2026), [x1, y1] = dotAt(p, o, JD_2026 + o.periodDays / 50);
    const turn = x0 * y1 - y0 * x1; // page y runs downwards, so anticlockwise is negative
    assert.ok(o.iDeg > 90 ? turn > 0 : turn < 0, `${id} goes round the wrong way on the page`);
  }
});

test('dwarf-planet moons: five are placed from JPL positions, and the two with no known direction are not', () => {
  const far = allBodies.filter((b) => b.kind === 'moon' && ['orcus', 'haumea', 'quaoar', 'makemake', 'gonggong', 'eris'].includes(b.parent!));
  assert.equal(far.length, 7);
  assert.deepEqual(far.filter((b) => (b.orbit as KeplerOrbit).fit).map((b) => b.id).sort(), ['dysnomia', 'hiiaka', 'namaka', 'vanth', 'weywot']);
  for (const b of far.filter((x) => !(x.orbit as KeplerOrbit).fit)) assert.ok(b.orientationUnknown && b.orbitNote, `${b.id} must say its direction is unknown`);
  for (const b of far) assert.ok(b.sources.length > 0 && !b.sources.some((s) => s.url.includes('/sats/')), `${b.id} must not cite the planetary satellite tables`);
});

// ---- the guide's choice of what to show (margin/pick.ts)
const whoIs = (id: string) => allBodies.find((b) => b.id === id);
const sample: MarginData = {
  strands: { moons: 'Moons', planets: 'Planets', stars: 'Stars' },
  lessons: [
    { id: 'what-a-star-is', title: 'What a star is', strand: 'stars', summary: '', target: 'sun', terms: ['fusion'] },
    { id: 'tides', title: 'Tides', strand: 'moons', summary: '', target: 'io', terms: ['tide', 'orbit'] },
    { id: 'gas-giants', title: 'Gas giants', strand: 'planets', summary: '', target: 'jupiter', terms: ['orbit'] },
  ],
  facts: [
    { id: 'f-jupiter', text: '', about: ['jupiter'], basis: 'measured', source: { label: '', url: '' } },
    { id: 'f-io-second', text: '', about: ['jupiter', 'io'], basis: 'measured', source: { label: '', url: '' } },
    { id: 'f-io', text: '', about: ['io'], basis: 'measured', source: { label: '', url: '' } },
    { id: 'f-mars', text: '', about: ['mars'], basis: 'measured', source: { label: '', url: '' } },
  ],
  terms: [{ id: 'tide', term: 'Tide', short: '' }, { id: 'orbit', term: 'Orbit', short: '' }, { id: 'fusion', term: 'Fusion', short: '' }],
};

test('the guide: close to a moon, the moon comes first, then its planet, then the Solar System', () => {
  assert.deepEqual(chainFor({ near: 'io', band: 'orbit', km: 500 }, whoIs), ['io', 'jupiter', 'sun', 'solar-system']);
  assert.deepEqual(chainFor({ near: 'io', band: 'system', km: 7e8 }, whoIs)[0], 'solar-system');
  assert.deepEqual(chainFor({ near: 'neptune', band: 'galactic', km: 1e17 }, whoIs)[0], 'milky-way');
});

test('the guide: facts about the place come first and nothing from elsewhere gets in', () => {
  const got = pick({ near: 'io', band: 'orbit', km: 500 }, sample, whoIs);
  assert.equal(got.subject, 'io');
  assert.deepEqual(got.facts.map((f) => f.id), ['f-io', 'f-io-second']);
  assert.deepEqual(got.wider.map((f) => f.id), ['f-jupiter']);
  assert.deepEqual(got.lessons.map((l) => l.id), ['tides', 'gas-giants', 'what-a-star-is']);
  assert.deepEqual(got.terms.map((t) => t.id), ['tide', 'orbit', 'fusion']);
  assert.ok(![...got.facts, ...got.wider].some((f) => f.id === 'f-mars'));
});

test('the guide: a place with nothing written about it gives empty lists, not an error', () => {
  const got = pick({ near: 'sedna', band: 'orbit', km: 900 }, { ...sample, facts: [], lessons: [] }, whoIs);
  assert.equal(got.subject, 'sedna');
  assert.equal(got.facts.length + got.lessons.length + got.terms.length, 0);
});

test('small bodies: every one is in a list, on a drawing or excused, inside its frame and named', () => {
  assert.equal(smallBodies.length, 26);
  const orbitOf = (id: string) => (isPlanet(id) ? planetOrbit(id, JD_2026) : (allBodies.find((b) => b.id === id)!.orbit as KeplerOrbit));
  for (const b of smallBodies) {
    assert.ok(smallGroups.some((g) => g.id === groupOf(b.group)), `${b.id} is in no list`);
    assert.ok(!!offChart[b.id] !== Object.values(smallShown).some((l) => l.includes(b.id)), `${b.id} must be on a drawing or excused, not both or neither`);
    const o = orbitOf(b.id);
    assert.ok(o.aKm > 0 && o.e >= 0 && o.e < 1 && o.periodDays > 0, `${b.id} has a broken orbit`);
    // Kepler's third law: years squared is au cubed, for anything going round the Sun
    assert.ok(Math.abs((o.periodDays / 365.25) ** 2 / (o.aKm / AU_KM) ** 3 - 1) < 0.01, `${b.id}: period and size of orbit disagree`);
  }
  for (const f of smallBodiesPlate.figures) {
    const p = topView('sun', f.spanKm, 440, f.view, f.centreKm);
    for (const id of smallShown[f.id]) assert.ok(fitsOn(p, orbitOf(id), JD_2026), `${id} leaves drawing ${f.id}`);
    for (const id of smallShown[f.id]) assert.ok(f.names[id] !== undefined || f.leaders?.[id], `${id} has no name on drawing ${f.id}`);
    for (const id of [...Object.keys(f.names), ...Object.keys(f.leaders ?? {})]) assert.ok(smallShown[f.id].includes(id), `${id} is named on ${f.id} but not drawn`);
  }
});

test('small bodies: Halley was nearest the Sun in February 1986 and is far out and going backwards now', () => {
  const o = allBodies.find((b) => b.id === 'halley')!.orbit as KeplerOrbit;
  const at = (jd: number) => Math.hypot(...keplerPosition(o, 'sun', jd)) / AU_KM;
  // 9 February 1986; JPL's elements for Halley date from 1968 and give 0.575 au for its nearest, against the 0.587 au of 1986
  assert.ok(Math.abs(at(2446470.5) - (o.aKm * (1 - o.e)) / AU_KM) < 0.002 && at(2446470.5) < 0.6, `Halley at perihelion: ${at(2446470.5).toFixed(3)} au`);
  assert.ok(at(JD_2026) > 34 && at(JD_2026) < 35.3, `Halley in 2026: ${at(JD_2026).toFixed(1)} au`);
  assert.ok(o.iDeg > 90);
});

test('small bodies: the count has gaps where Jupiter says and a pile where Neptune says', () => {
  const s = smallSpread.inner, at = (au: number) => s.counts[Math.round((au - s.fromAu) / s.stepAu - 0.5)];
  const J = planetOrbit('jupiter', JD_2026).aKm / AU_KM, N = planetOrbit('neptune', JD_2026).aKm / AU_KM;
  assert.ok(Math.abs(inStep(J, 3, 1) - 2.50) < 0.01 && Math.abs(inStep(J, 2, 1) - 3.28) < 0.01 && Math.abs(inStep(N, 2, 3) - 39.4) < 0.1);
  for (const [p, q] of [[3, 1], [5, 2], [2, 1]]) { const g = inStep(J, p, q); assert.ok(at(g) < 0.25 * Math.max(at(g - 0.08), at(g + 0.08)), `no gap at ${p}:${q}`); }
  const o = smallSpread.outer, k = Math.floor((inStep(N, 2, 3) - o.fromAu) / o.stepAu);
  assert.ok(Math.max(o.counts[k - 1], o.counts[k], o.counts[k + 1]) > 3 * o.counts[k - 5], 'no pile of bodies in step with Neptune');
  assert.ok(smallSpread.counted > 1_000_000);
});

test('the guide: every place the engine can name far from any world has a name and a subject', () => {
  for (const id of ['solar-system', 'oort-cloud', 'neighbourhood', 'night-sky', 'milky-way', 'local-group', 'cosmic-web', 'cmb']) {
    assert.ok(PLACE_NAMES[id], `${id} has no name`);
    for (const band of ['system', 'interstellar', 'galactic', 'cosmic'] as const) {
      const got = pick({ near: id, band, km: 1e12 }, sample, whoIs);
      assert.equal(got.subject, id, `${id} in band ${band} is not its own subject`);
    }
  }
});

test('the places beyond the worlds: one list, in the engine’s order, each saying what is measured and crediting its data', () => {
  assert.deepEqual(places.map((p) => p.id), LADDER);
  for (const p of places) {
    assert.equal(p.name, PLACE_NAMES[p.id]);
    assert.ok(p.what.length > 20 && p.drawn.length > 40, `${p.id} does not say what is drawn there`);
    assert.equal(p.model, /\bmodels?\b/.test(p.drawn), `${p.id}: the model flag and the words disagree`);
    for (const c of p.credits) assert.match(c.url, /^https:\/\//);
  }
  // the four data sets the 3D view is built from are each credited somewhere
  const credited = places.flatMap((p) => p.credits.map((c) => c.label)).join(' ');
  for (const need of ['HYG', 'McConnachie 2012', 'Huchra et al. 2012', 'WMAP']) assert.ok(credited.includes(need), `${need} is not credited`);
  assert.ok(places.find((p) => p.id === 'neighbourhood')!.credits[0].licence, 'the star catalogue’s licence is not given');
  // a place leads to the one beyond it and the one inside it
  assert.deepEqual(chainFor({ near: 'milky-way', band: 'galactic', km: 1e18 }, whoIs), ['milky-way', 'local-group', 'night-sky']);
  assert.deepEqual(chainFor({ near: 'cmb', band: 'cosmic', km: 1e24 }, whoIs), ['cmb', 'cosmic-web']);
});

console.log(failed.length ? `\n${failed.length} failed` : '\nall passed');
if (failed.length) throw new Error(`${failed.length} atlas tests failed`);
