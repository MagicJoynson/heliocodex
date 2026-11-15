/** The header and home-page search: loads /search.json once, ranks matches, and drives the result list from the keyboard. */
export type Entry = [string, string, string, string?, string?];
let index: Promise<Entry[]> | null = null;
export const loadIndex = () => (index ??= fetch('/search.json').then((r) => { if (!r.ok) throw new Error(String(r.status)); return r.json() as Promise<Entry[]>; }).catch((e) => { index = null; throw e; }));

const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[’']/g, '');
const KIND_RANK: Record<string, number> = { Planet: 0, Star: 2, Page: 1, Constellation: 2, Glossary: 3, Lesson: 3, 'Star (catalogue)': 6 };
const kindRank = (k: string) => KIND_RANK[k] ?? (k.startsWith('Moon') || k === 'Dwarf planet' ? 1 : k === 'Asteroid' || k === 'Comet' ? 2 : 4);

/** Edit distance that counts a swapped pair of letters as one slip (optimal string alignment). Gives up past `cap`. */
export function slips(a: string, b: string, cap = 3): number {
  if (Math.abs(a.length - b.length) > cap) return cap + 1;
  let prev2: number[] = [], prev = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    const cur = [i];
    let rowMin = i;
    for (let j = 1; j <= b.length; j++) {
      let d = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) d = Math.min(d, prev2[j - 2] + 1);
      cur[j] = d;
      if (d < rowMin) rowMin = d;
    }
    if (rowMin > cap) return cap + 1;
    prev2 = prev; prev = cur;
  }
  return prev[b.length];
}

/** How many slips a typed word may have: none for very short words, one up to five letters, two beyond that. */
const allowed = (len: number) => (len < 4 ? 0 : len < 6 ? 1 : 2);

/** The closest a typed word comes to a name's words, as slips: against each whole word, and against its opening letters while still typing. */
function fuzzy(q: string, words: string[]): number {
  const max = allowed(q.length);
  if (!max) return Infinity;
  let best = Infinity;
  for (const w of words) {
    if (w.length < 3) continue;
    let d = slips(q, w, max);
    if (d > max && w.length > q.length) d = Math.min(d, slips(q, w.slice(0, q.length), max) + 1);
    if (d < best) best = d;
  }
  return best <= max ? best : Infinity;
}

/** The hidden text of an entry: the questions it answers, then the words of its summary. */
function splitText(raw?: string): { asks?: string[]; askWords?: string[]; textWords?: string[] } {
  if (!raw) return {};
  const cut = raw.indexOf('||');
  const asks = (cut < 0 ? '' : raw.slice(0, cut)).split('|').map((a) => norm(a).replace(/[^a-z0-9 ]+/g, ' ').replace(/\s+/g, ' ').trim()).filter(Boolean);
  const words = (t: string) => [...new Set(norm(t).split(/[^a-z0-9]+/).filter((w) => w.length > 2))];
  return { asks, askWords: words(asks.join(' ')), textWords: words(cut < 0 ? raw : raw.slice(cut + 2)) };
}

/** Names split into words once, so each keystroke only compares. */
type Prepared = { name: string; also: string; nameWords: string[]; alsoWords: string[]; words: string[]; joined: string; asks?: string[]; askWords?: string[]; textWords?: string[] };
const prepared = new WeakMap<Entry[], Prepared[]>();
function prepare(all: Entry[]): Prepared[] {
  let p = prepared.get(all);
  if (!p) {
    p = all.map((e) => {
      const name = norm(e[0]), also = e[3] ? norm(e[3]) : '';
      const nameWords = name.split(/[\s-]+/), alsoWords = also ? also.split(/\s+/) : [];
      return { name, also, nameWords, alsoWords, words: [...nameWords, ...alsoWords], joined: name.replace(/[\s-]+/g, ''), ...splitText(e[4]) };
    });
    prepared.set(all, p);
  }
  return p;
}

/** Slips for a whole query against one name: each typed word must be a start of, or a slip away from, one of the name's words;
 *  a query typed as one word ("blackhole") may also be a slip away from the joined name. */
function nearness(tokens: string[], e: Prepared): number {
  let total = 0;
  for (const t of tokens) {
    if (e.words.some((w) => w.startsWith(t))) continue;
    const d = fuzzy(t, e.words);
    if (d === Infinity) { total = Infinity; break; }
    total += d;
  }
  if (total === Infinity && tokens.length === 1) total = fuzzy(tokens[0], [e.joined]);
  return total;
}

/** Little words that carry no meaning in a question, so "why is the sky blue" looks for sky and blue. */
const LITTLE = new Set('why how what when where which who does did can could would should will are was were the and for you your our its it is do to of in on at an a we i me my be been has have had than then that this these those there into from with about happen happens work works make made many much long old know get tell call called exist here'.split(' '));
/** A word with a plural or a verb ending trimmed, so "tides" meets "tide" and "eclipses" meets "eclipse". */
const stem = (t: string) => (t.length > 4 ? t.replace(/(ing|ed|es|s)$/, '') : t);

/** The best matches for a query: whole-name first, then start of name, start of a word, then anywhere; and, when nothing
 *  matches well as typed, names with a slip or two ("jupitor", "betelguese", "proxima centuri"). Catalogue numbers are only matched as typed. */
export function rank(all: Entry[], query: string, max = 8): Entry[] {
  const q = norm(query.trim()).replace(/\s+/g, ' ');
  if (!q) return [];
  const list = prepare(all);
  const tokens = q.split(' ');
  const tryFuzzy = q.length >= 4 && !/\d/.test(q) && tokens.some((t) => t.length >= 4);
  const meaning = tokens.filter((t) => t.length > 2 && !LITTLE.has(t)).map(stem);
  const scored: [number, Entry][] = [];
  const near: [number, Entry][] = [];
  let bestAsTyped = Infinity;
  for (let i = 0; i < all.length; i++) {
    const e = all[i], { name, also, nameWords, alsoWords } = list[i];
    let s = -1;
    if (name === q) s = 0;
    else if (name.startsWith(q)) s = 10;
    else if (nameWords.some((w) => w.startsWith(q))) s = 20;
    else if (alsoWords.some((w) => w.startsWith(q))) s = 25;
    else if (q.length > 2 && (name.includes(q) || also.includes(q))) s = 30;
    // A question. The exact question a lesson answers comes first; then lessons whose questions or title hold every meaningful word; then any text that does.
    if (s < 0 && meaning.length && e[4]) {
      const L = list[i], inWords = (t: string) => L.words.some((w) => (tokens.length > 1 ? w === t || stem(w) === t : w.startsWith(t))), inAsk = (t: string) => !!L.askWords?.some((w) => w.startsWith(t));
      if (L.asks?.includes(q.replace(/[^a-z0-9 ]+/g, ' ').replace(/\s+/g, ' ').trim())) s = 5;
      else if (meaning.every((t) => inWords(t))) s = 32;
      else if (meaning.every((t) => inWords(t) || inAsk(t))) s = tokens.length > 1 ? 34 : 36;
      else if (tokens.length > 1 && meaning.every((t) => inWords(t) || inAsk(t) || L.textWords!.some((w) => w.startsWith(t)))) s = 46;
    }
    // A longer question that names a place or a star ("how far is the moon"): offer it first. The whole word must match.
    if (s < 0 && tokens.length > 1 && nameWords.length === 1 && e[1] !== 'Page' && e[1] !== 'Star (catalogue)' && kindRank(e[1]) <= 2 && meaning.some((t) => t.length >= 3 && stem(nameWords[0]) === t)) s = 33;
    if (s >= 0) { scored.push([s + kindRank(e[1]) * 2 + name.length / 100, e]); if (s < bestAsTyped) bestAsTyped = s; }
    else if (tryFuzzy && e[1] !== 'Star (catalogue)') {
      const d = nearness(tokens, list[i]);
      if (d < Infinity) near.push([d * 8 + kindRank(e[1]) + name.length / 100, e]);
    }
  }
  // Nothing has every word of a question: offer what has most of them.
  if (scored.length < 3 && meaning.length > 1) {
    const some: [number, Entry][] = [], have = new Set(scored.map((x) => x[1]));
    for (let i = 0; i < all.length; i++) {
      const e = all[i];
      if (!e[4] || have.has(e)) continue;
      const w = [...list[i].words, ...(list[i].textWords ?? [])];
      const hit = meaning.filter((t) => w.some((x) => x.startsWith(t))).length;
      if (hit >= 2) some.push([60 - hit * 6 + kindRank(e[1]), e]);
    }
    scored.push(...some);
  }
  const out = scored.sort((a, b) => a[0] - b[0]).map((x) => x[1]);
  // As-typed matches always come first. Near misses are offered only when the query found no name or word it begins.
  if (bestAsTyped > 25 && out.length < max) out.push(...near.sort((a, b) => a[0] - b[0]).map((x) => x[1]).slice(0, max - out.length));
  return out.slice(0, max);
}

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => `&#${c.charCodeAt(0)};`);

/** Wires a search box to a result list. `btn` is the header's small-screen toggle; the home page's box has none. */
export function wireSearch(form: HTMLFormElement, btn?: HTMLButtonElement) {
  const input = form.querySelector<HTMLInputElement>('input')!, list = form.querySelector<HTMLUListElement>('ul')!;
  // Tells a screen reader how many suggestions there are, since the list itself is not announced as it changes.
  const status = document.createElement('div');
  status.setAttribute('role', 'status');
  status.style.cssText = 'position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap';
  form.append(status);
  let hits: Entry[] = [], at = -1, asked = '';
  const show = (open: boolean) => { list.hidden = !open; input.setAttribute('aria-expanded', String(open)); };
  const paint = () => {
    const typed = input.value.trim();
    list.innerHTML = hits.length
      ? hits.map((h, i) => `<li role="option" id="${list.id}-${i}" aria-selected="${i === at}" data-href="${esc(h[2])}"><b>${esc(h[0])}</b><span>${esc(h[1])}</span></li>`).join('')
      : `<li class="none" role="presentation">Nothing found for “${esc(typed)}”. Try one word, such as a name or a topic.</li>`;
    if (at >= 0) input.setAttribute('aria-activedescendant', `${list.id}-${at}`); else input.removeAttribute('aria-activedescendant');
    status.textContent = typed ? (hits.length ? `${hits.length} suggestion${hits.length > 1 ? 's' : ''}. Use the up and down arrow keys, then Enter.` : `Nothing found for ${typed}.`) : '';
    show(typed.length > 0);
  };
  form.addEventListener('focusout', (e) => { if (e.relatedTarget && e.relatedTarget !== input) show(false); });
  list.addEventListener('click', (e) => { const li = (e.target as Element).closest<HTMLElement>('li[data-href]'); if (li) location.href = li.dataset.href!; });
  input.addEventListener('focus', () => { loadIndex(); });
  input.addEventListener('input', async () => {
    asked = input.value;
    let all: Entry[] = [];
    try { all = await loadIndex(); } catch { /* offline: Enter still goes to the search page */ }
    if (asked !== input.value) return; // a newer keystroke is already on its way
    hits = rank(all, input.value); at = hits.length ? 0 : -1; paint();
  });
  input.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown' && hits.length) { e.preventDefault(); if (list.hidden) show(true); else at = (at + 1) % hits.length; paint(); }
    else if (e.key === 'ArrowUp' && hits.length) { e.preventDefault(); at = (at - 1 + hits.length) % hits.length; paint(); }
    else if (e.key === 'Escape') {
      e.preventDefault(); // the browser would otherwise empty a search box
      if (!list.hidden) { show(false); e.stopPropagation(); }
      else if (btn && document.body.classList.contains('finding')) { document.body.classList.remove('finding'); btn.setAttribute('aria-expanded', 'false'); btn.focus(); }
    }
  });
  form.addEventListener('submit', (e) => { if (!list.hidden && at >= 0 && hits[at]) { e.preventDefault(); location.href = hits[at][2]; } });
  document.addEventListener('click', (e) => { if (!form.contains(e.target as Node) && e.target !== btn) show(false); });
  if (!btn) return;
  document.addEventListener('keydown', (e) => {
    if (e.key === '/' && !(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)) { e.preventDefault(); openSmall(true); input.focus(); }
  });
  const openSmall = (open: boolean) => { document.body.classList.toggle('finding', open); btn.setAttribute('aria-expanded', String(open)); };
  btn.addEventListener('click', () => { const open = !document.body.classList.contains('finding'); openSmall(open); if (open) input.focus(); });
}
