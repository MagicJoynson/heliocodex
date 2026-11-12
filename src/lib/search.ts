/** The header search: loads /search.json once, ranks matches, and drives the result list from the keyboard. */
export type Entry = [string, string, string, string?];
let index: Promise<Entry[]> | null = null;
export const loadIndex = () => (index ??= fetch('/search.json').then((r) => r.json() as Promise<Entry[]>));

const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[’']/g, '');
const KIND_RANK: Record<string, number> = { Planet: 0, Star: 2, Page: 1, Constellation: 2, Glossary: 3, Lesson: 3, 'Star (catalogue)': 6 };
const kindRank = (k: string) => KIND_RANK[k] ?? (k.startsWith('Moon') || k === 'Dwarf planet' ? 1 : k === 'Asteroid' || k === 'Comet' ? 2 : 4);

/** The best matches for a query: whole-name first, then start of name, start of a word, then anywhere. */
export function rank(all: Entry[], query: string, max = 8): Entry[] {
  const q = norm(query.trim());
  if (!q) return [];
  const scored: [number, Entry][] = [];
  for (const e of all) {
    const name = norm(e[0]), also = e[3] ? norm(e[3]) : '';
    let s = -1;
    if (name === q) s = 0;
    else if (name.startsWith(q)) s = 10;
    else if (name.split(/[\s-]+/).some((w) => w.startsWith(q))) s = 20;
    else if (also && also.split(/\s+/).some((w) => w.startsWith(q))) s = 25;
    else if (q.length > 2 && (name.includes(q) || also.includes(q))) s = 30;
    if (s >= 0) scored.push([s + kindRank(e[1]) * 2 + name.length / 100, e]);
  }
  return scored.sort((a, b) => a[0] - b[0]).slice(0, max).map((x) => x[1]);
}

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => `&#${c.charCodeAt(0)};`);

export function wireSearch(form: HTMLFormElement, btn: HTMLButtonElement) {
  const input = form.querySelector<HTMLInputElement>('input')!, list = form.querySelector<HTMLUListElement>('ul')!;
  let hits: Entry[] = [], at = -1;
  const show = (open: boolean) => { list.hidden = !open; input.setAttribute('aria-expanded', String(open)); };
  const paint = () => {
    list.innerHTML = hits.length
      ? hits.map((h, i) => `<li role="option" id="find-${i}" aria-selected="${i === at}"><a href="${h[2]}" tabindex="-1"><b>${esc(h[0])}</b><span>${esc(h[1])}</span></a></li>`).join('')
      : `<li class="none">Nothing found for “${esc(input.value.trim())}”.</li>`;
    if (at >= 0) input.setAttribute('aria-activedescendant', `find-${at}`); else input.removeAttribute('aria-activedescendant');
    show(input.value.trim().length > 0);
  };
  input.addEventListener('focus', () => { loadIndex(); });
  input.addEventListener('input', async () => { const all = await loadIndex(); hits = rank(all, input.value); at = hits.length ? 0 : -1; paint(); });
  input.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown' && hits.length) { e.preventDefault(); at = (at + 1) % hits.length; paint(); }
    else if (e.key === 'ArrowUp' && hits.length) { e.preventDefault(); at = (at - 1 + hits.length) % hits.length; paint(); }
    else if (e.key === 'Escape') { show(false); if (document.body.classList.contains('finding')) { document.body.classList.remove('finding'); btn.setAttribute('aria-expanded', 'false'); btn.focus(); } }
  });
  form.addEventListener('submit', (e) => { if (at >= 0 && hits[at]) { e.preventDefault(); location.href = hits[at][2]; } });
  document.addEventListener('click', (e) => { if (!form.contains(e.target as Node) && e.target !== btn) show(false); });
  document.addEventListener('keydown', (e) => {
    if (e.key === '/' && !(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)) { e.preventDefault(); openSmall(true); input.focus(); }
  });
  const openSmall = (open: boolean) => { document.body.classList.toggle('finding', open); btn.setAttribute('aria-expanded', String(open)); };
  btn.addEventListener('click', () => { const open = !document.body.classList.contains('finding'); openSmall(open); if (open) input.focus(); });
}
