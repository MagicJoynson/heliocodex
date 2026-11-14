// Run with: npm run test:search
import assert from 'node:assert/strict';
import { rank, slips, type Entry } from './search';
import { readFileSync } from 'node:fs';

const failed: string[] = [];
const test = (name: string, fn: () => void) => { try { fn(); console.log('ok   ' + name); } catch (e) { failed.push(name); console.log('FAIL ' + name + '\n     ' + (e as Error).message); } };

// The real index from a build (npm run build first), so the tests meet the same names visitors do.
const all = JSON.parse(readFileSync('dist/search.json', 'utf8')) as Entry[];
const top = (q: string, n = 3) => rank(all, q, 8).slice(0, n).map((e) => e[0]);

test('slips counts a swapped pair as one', () => { assert.equal(slips('mras', 'mars'), 1); assert.equal(slips('jupitor', 'jupiter'), 1); assert.equal(slips('abc', 'xyz'), 3); });
for (const [typed, want] of [
  ['jupitor', 'Jupiter'], ['betelguese', 'Betelgeuse'], ['saturm', 'Saturn'], ['nepture', 'Neptune'], ['andormeda', 'Andromeda'],
  ['parralax', 'Parallax'], ['plutto', 'Pluto'], ['uranis', 'Uranus'], ['mecury', 'Mercury'], ['siruis', 'Sirius'], ['cassiopia', 'Cassiopeia'], ['pleiedes', 'Pleiades'], ['andromida galaxy', 'Andromeda'], ['magelanic', 'Magellanic'],
] as const) test(`typo "${typed}" finds ${want}`, () => assert.ok(top(typed, 4).some((n) => n.toLowerCase().includes(want.toLowerCase())), `got ${top(typed, 4).join(', ')}`));
test('landmarks are found as typed', () => { for (const [q, w] of [['pleiades', 'Pleiades'], ['seven sisters', 'Pleiades'], ['m31', 'Andromeda galaxy'], ['sagittarius a', 'black hole'], ['lmc', 'Magellanic']] as const) assert.ok(top(q, 3).some((n) => n.includes(w)), `${q}: ${top(q, 3).join(', ')}`); });
for (const [typed, want] of [['jup', 'Jupiter'], ['europa', 'Europa'], ['betel', 'Betelgeuse'], ['mars', 'Mars']] as const)
  test(`as typed "${typed}" still puts ${want} first`, () => assert.equal(top(typed, 1)[0], want));
for (const [typed, want] of [['proxima centuri', 'Proxima'], ['ursa magor', 'Ursa Major'], ['millky way', 'Milky Way'], ['blackhole', 'Black hole']] as const)
  test(`typo "${typed}" finds ${want}`, () => assert.ok(top(typed, 4).some((n) => n.toLowerCase().includes(want.toLowerCase())), `got ${top(typed, 4).join(', ')}`));
for (const q of ['europa', 'mars', 'uranus', 'nebula', 'eclipse']) test(`"${q}" gets no guessed neighbours`, () => {
  const stray = rank(all, q, 8).filter((e) => !e[0].toLowerCase().includes(q) && !(e[3] ?? '').toLowerCase().includes(q));
  assert.equal(stray.length, 0, `stray: ${stray.map((e) => e[0]).join(', ')}`);
});
test('short words are not guessed at', () => assert.equal(rank(all, 'xyq').length, 0));
test('catalogue numbers are matched as typed only', () => assert.ok(rank(all, 'HD 99999999').length === 0));
test('empty query gives nothing', () => assert.equal(rank(all, '   ').length, 0));
test('as-typed matches are never pushed down by near misses', () => {
  const hits = rank(all, 'moon', 8);
  assert.ok(hits[0][0].toLowerCase().startsWith('moon') || hits[0][0] === 'The Moon' || /moon/i.test(hits[0][0]));
});
test('ranking all 3,600 entries is fast', () => { const t = performance.now(); for (let i = 0; i < 20; i++) rank(all, 'betelguese'); assert.ok((performance.now() - t) / 20 < 25, `${((performance.now() - t) / 20).toFixed(1)} ms each`); });

console.log(failed.length ? `\n${failed.length} failed` : '\nall passed');
if (failed.length) throw new Error(`${failed.length} search tests failed`);
