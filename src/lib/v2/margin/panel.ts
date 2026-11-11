// The Codex in the 3D view. It listens to the engine for where the camera is and shows what is
// worth knowing there, with the lessons, the glossary and the atlas one tab away.
//
// It talks to the engine only through engine/index.ts. Everything it shows is built with
// textContent, never from HTML strings, so nothing in the content files can inject markup.
import type { Context, Engine } from '../engine/index';
import type { Body } from '../atlas/types';
import { allBodies } from '../../../data/bodies/index';
import { fmtKm } from '../atlas/chart';
import { fmtAu } from '../atlas/sun';
import { LIGHT_YEAR_M, RULES, TOP } from '../atlas/ruler';
import { places, placeById } from '../atlas/places';
import { pick, PLACE_NAMES, type MarginData, type MFact, type MLesson, type MTerm } from './pick';

type Kids = (Node | string | null | undefined | false)[];
function el<K extends keyof HTMLElementTagNameMap>(tag: K, attrs: Record<string, string> | null, ...kids: Kids): HTMLElementTagNameMap[K] {
  const e = document.createElement(tag);
  if (attrs) for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v);
  for (const k of kids) if (k) e.append(k);
  return e;
}

const byId = new Map(allBodies.map((b) => [b.id, b]));
const who = (id: string) => byId.get(id);
const nameOf = (id: string) => byId.get(id)?.name ?? PLACE_NAMES[id] ?? id;
const theName = (id: string) => (id === 'earth' ? 'the Earth' : nameOf(id).replace(/^The /, 'the '));
const moonsOf = (id: string) => allBodies.filter((b) => b.parent === id && b.kind === 'moon');
const chartFor = (b: Body) => (b.kind === 'asteroid' || b.kind === 'comet' ? `/atlas/small-bodies#${b.id}` : b.id === 'sun' || b.parent === 'sun' ? `/atlas/solar-system${b.id === 'sun' ? '' : `#${b.id}`}` : `/atlas/${b.parent}#${b.id}`);

const BAND: Record<Context['band'], string> = {
  surface: 'Just above', orbit: 'Close to', system: 'Between the worlds', interstellar: 'Beyond the planets', galactic: 'Out in the galaxy', cosmic: 'Between the galaxies',
};
// the band's words are wrong for these two: the Local Group is not in the galaxy, and the oldest light is past every galaxy
const KICKER: Record<string, string> = { 'local-group': 'Among the nearest galaxies', cmb: 'As far as light has come' };
const BASIS = { measured: '', 'worked-out': 'Worked out', theory: 'From a model' } as const;

/** One plain sentence on what a body is, from the data. */
function whatIs(b: Body): string {
  const wide = b.meanRadiusKm ? `${fmtKm(b.meanRadiusKm * 2)} wide` : '';
  const n = moonsOf(b.id).length;
  const moons = n === 0 ? '' : n === 1 ? ' It has one moon.' : ` It has ${n} known moons.`;
  if (b.kind === 'star') return `The star at the centre of the Solar System, ${wide}.`;
  if (b.kind === 'planet') return `A planet, ${wide}.${moons || ' It has no moons.'}`;
  if (b.kind === 'dwarf') return `A dwarf planet${wide ? `, ${wide}` : ''}.${moons}`;
  if (b.kind === 'moon') return wide ? `A moon of ${theName(b.parent!)}, ${wide}.` : `A small moon of ${theName(b.parent!)}. Nobody has measured how wide it is.`;
  if (b.kind === 'asteroid') return wide ? `An asteroid, ${wide}.` : 'An asteroid.';
  if (b.kind === 'comet') return wide ? `A comet. Its solid core is ${wide}.` : 'A comet.';
  return '';
}

function howFar(c: Context): string {
  if (c.band === 'surface' || c.band === 'orbit') return `${fmtKm(c.km)} above ${c.near === 'sun' ? 'the surface' : 'the ground'}`;
  const ly = (c.km * 1000) / LIGHT_YEAR_M;
  if (ly <= 0.1) return `${fmtAu(c.km)} from the Sun`;
  const big = ly >= 1e9 ? [1e9, ' billion'] as const : ly >= 1e6 ? [1e6, ' million'] as const : [1, ''] as const;
  return `${(ly / big[0]).toLocaleString('en-GB', { maximumSignificantDigits: 3 })}${big[1]} light years from the Sun`;
}

export function mountMargin(engine: Engine): void {
  const $ = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;
  const tab = $<HTMLButtonElement>('margin-tab'), panel = $('margin'), said = $('margin-said'), scroller = $('margin-body');
  if (!tab || !panel) return;
  const tabs = [...panel.querySelectorAll<HTMLButtonElement>('[role="tab"]')];
  const pane = (name: string) => $(`mp-${name}`);
  const phone = matchMedia('(max-width: 760px)');

  let open = false, current = 'here', ctx: Context | null = null, data: MarginData | null = null, loading: Promise<void> | null = null;
  let shownFor = '';
  const built = new Set<string>();

  const load = () => (loading ??= fetch('/v2/margin.json').then((r) => { if (!r.ok) throw new Error(String(r.status)); return r.json(); }).then((d: MarginData) => { data = d; }).catch(() => { loading = null; throw new Error('load'); }));

  // ---- going places
  function fly(target: string, distanceKm?: number): void {
    if (phone.matches) setOpen(false);
    engine.flyTo({ target, distanceKm }).catch((e: Error) => { if (e?.name !== 'AbortError') said.textContent = `The 3D view cannot go to ${theName(target)} yet.`; });
  }
  function flyButton(target: string, label: string, distanceKm?: number, cls = 'm-act'): HTMLButtonElement | null {
    if (!engine.canFlyTo(target)) return null;
    const b = el('button', { type: 'button', class: cls }, label);
    b.addEventListener('click', () => fly(target, distanceKm));
    return b;
  }

  // ---- pieces shared by the panes
  const factItem = (f: MFact) => el('li', null,
    el('p', null, f.text),
    el('span', { class: 'm-src' }, BASIS[f.basis] ? el('b', null, BASIS[f.basis]) : null, el('a', { href: f.source.url, target: '_blank', rel: 'noopener' }, f.source.label)),
    f.target && f.target !== ctx?.near ? el('div', { class: 'm-acts' }, flyButton(f.target, 'Show me', f.distanceKm)) : null);
  const lessonItem = (l: MLesson) => el('li', null,
    el('p', { class: 'm-title' }, l.title),
    el('p', null, l.summary),
    el('div', { class: 'm-acts' }, l.target ? flyButton(l.target, 'Show me', l.distanceKm) : null, readButton(l)));
  function readButton(l: MLesson): HTMLAnchorElement {
    // a real link, so it still works if the script that follows fails, and opens in a new tab on a modified click
    const a = el('a', { class: 'm-act', href: `/learn/${l.id}` }, 'Read the lesson');
    a.addEventListener('click', (e) => { if (e.ctrlKey || e.metaKey || e.shiftKey || e.button !== 0) return; e.preventDefault(); read(l.id); });
    return a;
  }
  const termItem = (t: MTerm) => el('div', null, el('dt', null, t.term), el('dd', null, t.short, t.more ? el('span', { class: 'm-more' }, t.more) : null));

  // ---- Here
  function renderHere(): void {
    const p = pane('here');
    if (!ctx || !data) { p.replaceChildren(el('p', { class: 'm-wait' }, ctx ? 'Fetching the Codex…' : 'Finding out where you are…')); return; }
    const got = pick(ctx, data, who);
    // While real heights are missing the engine stands a generated world in for the real one and says so in the readout.
    const standIn = /^This ground is generated/.test(document.getElementById('gen')?.textContent ?? '');
    // the catalogue star the view has flown to, where the engine says so, and its page if it has one
    const starAt = (ctx as Context & { star?: number }).star, meet = starAt === undefined ? undefined : data.stars?.[starAt];
    const key = `${got.subject}|${ctx.band}|${ctx.near}|${standIn}|${meet?.[1] ?? ''}`;
    if (key === shownFor) { const d = p.querySelector('.m-dist'); if (d) d.textContent = howFar(ctx); return; }
    shownFor = key;
    const b = who(got.subject), near = who(ctx.near);
    const kids: Kids = [
      el('p', { class: 'm-kicker' }, KICKER[got.subject] ?? BAND[ctx.band]),
      el('h2', null, standIn ? 'The test world' : nameOf(got.subject)),
      el('p', { class: 'm-dist' }, howFar(ctx)),
    ];
    if (standIn) kids.push(el('p', { class: 'm-drawn' }, `Standing in for ${theName(got.subject)}. This ground is generated, not measured. What follows is about the real ${nameOf(got.subject)}.`));
    if (b) {
      kids.push(el('p', { class: 'm-what' }, whatIs(b)));
      if (b.look.type === 'impression') kids.push(el('p', { class: 'm-drawn' }, b.look.note));
      kids.push(el('div', { class: 'm-acts' }, el('a', { class: 'm-act', href: chartFor(b), target: '_blank', rel: 'noopener' }, 'See it on the chart')));
    } else if (placeById.has(got.subject)) {
      const pl = placeById.get(got.subject)!;
      kids.push(el('p', { class: 'm-what' }, pl.what));
      kids.push(el('p', { class: 'm-drawn' }, pl.model ? el('b', null, 'Partly a model. ') : null, pl.drawn, ' ',
        ...pl.credits.flatMap((c) => [el('a', { href: c.url, target: '_blank', rel: 'noopener' }, c.label), c.licence ? ` (${c.licence})` : '', '. ']),
        el('a', { href: '/sources#beyond', target: '_blank', rel: 'noopener' }, 'All the sources')));
      const i = places.indexOf(pl);
      kids.push(el('div', { class: 'm-acts' }, pl.chart ? el('a', { class: 'm-act', href: pl.chart, target: '_blank', rel: 'noopener' }, 'See it on the chart') : null, i > 0 ? flyButton(places[i - 1].id, `In to ${theName(places[i - 1].id)}`) : flyButton('sun', 'In to the Sun'), i < places.length - 1 ? flyButton(places[i + 1].id, `Out to ${theName(places[i + 1].id)}`) : null));
    } else if (near) {
      kids.push(el('p', { class: 'm-what' }, `The nearest world is ${theName(near.id)}.`), el('div', { class: 'm-acts' }, flyButton(near.id, `Go to ${theName(near.id)}`)));
    }
    if (meet) kids.push(el('p', { class: 'm-what' }, `You are at ${meet[0]}.`), el('div', { class: 'm-acts' }, el('a', { class: 'm-act', href: `/stars/${meet[1]}`, target: '_blank', rel: 'noopener' }, `Meet ${meet[0]}`)));
    kids.push(el('h3', null, 'Worth knowing'));
    kids.push(got.facts.length ? el('ul', null, ...got.facts.map(factItem)) : el('p', { class: 'm-none' }, 'Nothing has been written about this place yet.'));
    if (got.wider.length) kids.push(el('h3', null, b ? 'And round about' : 'Nearby'), el('ul', null, ...got.wider.map(factItem)));
    if (got.lessons.length) kids.push(el('h3', null, 'Lessons for here'), el('ul', null, ...got.lessons.map(lessonItem)));
    if (got.terms.length) kids.push(el('h3', null, 'Words you will meet'), el('dl', null, ...got.terms.map(termItem)));
    p.replaceChildren(...(kids.filter(Boolean) as Node[]));
    if (open && current === 'here' && !reading) { scroller.scrollTop = 0; said.textContent = `The Codex now shows ${nameOf(got.subject)}.`; }
  }

  // ---- Lessons
  function renderLessons(): void {
    if (!data) return;
    const d = data;
    const groups = Object.keys(d.strands).map((s) => ({ s, list: d.lessons.filter((l) => l.strand === s) })).filter((g) => g.list.length);
    pane('lessons').replaceChildren(
      el('p', { class: 'm-kicker' }, `${d.lessons.length} lessons`),
      el('p', null, 'Each one starts in plain words and goes as deep as you like.'),
      ...groups.map((g) => el('details', null, el('summary', null, d.strands[g.s], el('span', null, `${g.list.length}`)), el('ul', null, ...g.list.map(lessonItem)))));
  }

  // ---- Words
  function renderWords(): void {
    if (!data) return;
    const d = data;
    const box = el('input', { type: 'search', placeholder: 'Find a word', 'aria-label': 'Find a word in the glossary', autocomplete: 'off', spellcheck: 'false' });
    const list = el('dl', null), none = el('p', { class: 'm-none' });
    const show = () => {
      const q = box.value.trim().toLowerCase();
      const hits = q ? d.terms.filter((t) => t.term.toLowerCase().includes(q)).concat(d.terms.filter((t) => !t.term.toLowerCase().includes(q) && t.short.toLowerCase().includes(q))) : d.terms;
      list.replaceChildren(...hits.map(termItem));
      none.textContent = hits.length ? '' : `No word here matches “${box.value.trim()}”.`;
    };
    box.addEventListener('input', show);
    pane('words').replaceChildren(el('p', { class: 'm-kicker' }, `${d.terms.length} words`), box, none, list);
    show();
  }

  // ---- Atlas
  let you: HTMLElement | null = null, youLabel: HTMLElement | null = null;
  function placeYou(): void {
    if (!you || !youLabel || !ctx) return;
    const y = Math.min(TOP, Math.max(0, Math.log10(Math.max(1, ctx.km * 1000))));
    you.style.setProperty('--y', y.toFixed(3));
    youLabel.textContent = `You are ${howFar(ctx).replace('the ground', theName(ctx.near)).replace('the surface', 'the Sun')}`;
  }
  function renderAtlas(): void {
    const ruler = el('div', { class: 'm-ruler', role: 'img', 'aria-label': 'A scale in powers of ten from one metre to ten billion light years, with a line showing how far out you are' });
    for (const r of RULES) { const i = el('i', null); i.style.setProperty('--y', String(r.at)); const s = el('span', null, r.unit); s.style.setProperty('--y', String(r.at)); ruler.append(i, s); }
    youLabel = el('b', null);
    you = el('div', { class: 'm-you' }, youLabel);
    ruler.append(you);
    const group = (b: Body) => {
      const measured = moonsOf(b.id).filter((m) => m.meanRadiusKm).sort((p, q) => q.meanRadiusKm! - p.meanRadiusKm!);
      const all = moonsOf(b.id).length;
      return el('details', null,
        el('summary', null, b.name, el('span', null, all === 0 ? 'no moons' : all === 1 ? '1 moon' : `${all} moons`)),
        el('div', { class: 'm-fly' }, flyButton(b.id, b.name, undefined, ''), ...measured.slice(0, 24).map((m) => flyButton(m.id, m.name, undefined, '')),
          all > 0 ? el('a', { href: `/atlas/${b.id}`, target: '_blank', rel: 'noopener' }, all > measured.length ? `All ${all} on the chart` : 'The chart') : null));
    };
    const sunRound = allBodies.filter((b) => b.parent === 'sun');
    pane('atlas').replaceChildren(
      el('p', { class: 'm-kicker' }, 'How far out you are'),
      ruler,
      el('p', null, el('a', { href: '/atlas#ruler', target: '_blank', rel: 'noopener' }, 'The full ruler, with everything marked on it')),
      el('h3', null, 'Fly to'),
      el('div', { class: 'm-fly' }, flyButton('sun', 'The Sun', undefined, '')),
      ...sunRound.filter((b) => b.kind === 'planet').map(group),
      el('h3', null, 'Dwarf planets'),
      ...sunRound.filter((b) => b.kind === 'dwarf').map(group),
      el('h3', null, 'Further out'),
      el('div', { class: 'm-fly' }, ...places.map((pl) => flyButton(pl.id, pl.name, undefined, ''))),
      el('h3', null, 'Charts'),
      el('p', null, el('a', { href: '/atlas/solar-system', target: '_blank', rel: 'noopener' }, 'The Solar System from above'), ', ', el('a', { href: '/atlas/stars', target: '_blank', rel: 'noopener' }, 'the stars round the Sun'), ', ', el('a', { href: '/atlas/galaxies', target: '_blank', rel: 'noopener' }, 'our galaxy and the others'), ' and ', el('a', { href: '/atlas', target: '_blank', rel: 'noopener' }, 'all the charts'), '.'));
    placeYou();
  }

  // ---- reading a lesson
  // The lesson's words are taken from its own page, so the panel and the page can never differ.
  const reader = $('mp-read'), pages = new Map<string, Promise<Document>>();
  let reading: string | null = null, cameFrom = 0;
  const page = (id: string) => {
    let got = pages.get(id);
    if (!got) {
      got = fetch(`/learn/${id}`).then((r) => { if (!r.ok) throw new Error(String(r.status)); return r.text(); }).then((t) => new DOMParser().parseFromString(t, 'text/html'));
      got.catch(() => pages.delete(id));
      pages.set(id, got);
    }
    return got;
  };
  function back(): void {
    if (!reading) return;
    reading = null;
    reader.hidden = true; reader.replaceChildren();
    pane(current).hidden = false;
    scroller.scrollTop = cameFrom;
    tabs.find((t) => t.id === `mt-${current}`)?.focus({ preventScroll: true });
  }
  function read(id: string): void {
    const l = data?.lessons.find((x) => x.id === id);
    if (!l) return;
    if (!reading) cameFrom = scroller.scrollTop;
    reading = id;
    const tabName = tabs.find((t) => t.id === `mt-${current}`)?.textContent ?? '';
    const backBtn = el('button', { type: 'button', class: 'm-back' }, `Back to ${tabName}`);
    backBtn.addEventListener('click', back);
    const body = el('div', null, el('p', { class: 'm-wait' }, 'Fetching the lesson…'));
    reader.replaceChildren(backBtn,
      el('p', { class: 'm-kicker' }, data!.strands[l.strand] ?? ''),
      el('h2', null, l.title),
      el('p', { class: 'm-lead' }, l.summary),
      el('div', { class: 'm-acts' }, l.target ? flyButton(l.target, 'Show me', l.distanceKm) : null, el('a', { class: 'm-act', href: `/learn/${id}`, target: '_blank', rel: 'noopener' }, 'Open the full page')),
      body);
    for (const t of tabs) pane(t.id.slice(3)).hidden = true;
    reader.hidden = false;
    scroller.scrollTop = 0;
    reader.focus({ preventScroll: true });
    page(id).then((doc) => {
      if (reading !== id) return;
      // a lesson with equations names their stylesheet, which this page does not carry until one is read
      const sheet = doc.querySelector('link[data-equations]')?.getAttribute('href');
      if (sheet && !document.querySelector('link[data-equations]')) document.head.append(el('link', { rel: 'stylesheet', href: sheet, 'data-equations': '' }));
      const parts: Node[] = [];
      for (const sec of doc.querySelectorAll('section.row[id]')) {
        const prose = sec.querySelector('.prose');
        if (!prose) continue;
        const copy = document.importNode(prose, true) as HTMLElement;
        copy.className = 'm-prose';
        copy.querySelectorAll('script, style, iframe, object, embed').forEach((n) => n.remove());
        copy.querySelectorAll('table').forEach((t) => { const w = el('div', { class: 'm-scroll', tabindex: '0' }); t.replaceWith(w); w.append(t); });
        copy.querySelectorAll('a[href]').forEach((a) => {
          const m = /^\/learn\/([a-z0-9-]+)$/.exec(a.getAttribute('href') ?? '');
          if (m && data!.lessons.some((x) => x.id === m[1])) a.addEventListener('click', (e) => { const me = e as MouseEvent; if (me.ctrlKey || me.metaKey || me.shiftKey) return; e.preventDefault(); read(m[1]); });
          else { a.setAttribute('target', '_blank'); a.setAttribute('rel', 'noopener'); }
        });
        const note = sec.querySelector('.hang .note')?.textContent ?? '';
        parts.push(el('h3', null, sec.querySelector('.hang h2')?.textContent ?? '', note ? el('small', null, note) : null), copy);
      }
      const words = l.terms.map((t) => data!.terms.find((x) => x.id === t)).filter((t): t is MTerm => !!t);
      if (words.length) parts.push(el('h3', null, 'Words used here'), el('dl', null, ...words.map(termItem)));
      const sources = [...doc.querySelectorAll('.sources a[href]')].map((a) => el('li', null, el('a', { href: a.getAttribute('href')!, target: '_blank', rel: 'noopener', class: 'm-src' }, a.textContent ?? '')));
      if (sources.length) parts.push(el('h3', null, 'Where this comes from'), el('ul', null, ...sources));
      body.replaceChildren(...parts);
    }).catch(() => { if (reading === id) body.replaceChildren(el('p', { class: 'm-none' }, 'The lesson could not be fetched. Check your connection, or open the full page.')); });
  }

  // ---- showing and hiding
  function render(name: string): void {
    if (name === 'here') { renderHere(); return; }
    if (built.has(name)) return;
    if (name === 'atlas') { renderAtlas(); built.add(name); return; }
    if (!data) { pane(name).replaceChildren(el('p', { class: 'm-wait' }, 'Fetching the Codex…')); return; }
    if (name === 'lessons') renderLessons(); else renderWords();
    built.add(name);
  }
  function select(name: string, focus = false): void {
    if (reading) { reading = null; reader.hidden = true; reader.replaceChildren(); }
    current = name;
    for (const t of tabs) {
      const on = t.id === `mt-${name}`;
      t.setAttribute('aria-selected', String(on)); t.tabIndex = on ? 0 : -1;
      pane(t.id.slice(3)).hidden = !on;
      if (on && focus) t.focus();
    }
    scroller.scrollTop = 0;
    render(name);
  }
  function setOpen(to: boolean): void {
    if (open === to) return;
    open = to;
    document.body.classList.toggle('margin-open', open);
    panel.inert = !open;
    tab.setAttribute('aria-expanded', String(open));
    if (open) {
      render(current);
      load().then(() => { if (open) render(current); }, () => { pane(current).replaceChildren(el('p', { class: 'm-none' }, 'The Codex could not be fetched. Check your connection and open it again.')); });
      tabs.find((t) => t.getAttribute('aria-selected') === 'true')?.focus({ preventScroll: true });
    } else if (panel.contains(document.activeElement)) tab.focus({ preventScroll: true });
  }

  tab.addEventListener('click', () => setOpen(!open));
  $('margin-close').addEventListener('click', () => setOpen(false));
  for (const t of tabs) t.addEventListener('click', () => select(t.id.slice(3)));
  panel.querySelector('[role="tablist"]')!.addEventListener('keydown', (e) => {
    const k = (e as KeyboardEvent).key, i = tabs.findIndex((t) => t.id === `mt-${current}`);
    if (k === 'ArrowRight' || k === 'ArrowLeft') { e.preventDefault(); select(tabs[(i + (k === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length].id.slice(3), true); }
  });
  // typing in the search box must not fly the camera: keep those keys from reaching the engine
  const typing = (t: EventTarget | null) => t instanceof HTMLInputElement || t instanceof HTMLTextAreaElement;
  for (const type of ['keydown', 'keyup'] as const) panel.addEventListener(type, (e) => { if (typing(e.target) && (e as KeyboardEvent).key !== 'Escape') e.stopPropagation(); });
  addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && open) { setOpen(false); return; }
    if ((e.key === 'm' || e.key === 'M') && !e.ctrlKey && !e.metaKey && !e.altKey && !typing(e.target) && !tab.hidden) setOpen(!open);
  });

  engine.onContext((c) => {
    ctx = c;
    if (!open) return;
    if (current === 'here') renderHere();
    placeYou();
  });

  // the tab appears once the way in is over, so it never sits on the Skip button
  const reveal = () => { if (document.body.classList.contains('arrived')) { tab.hidden = false; return true; } return false; };
  if (!reveal()) { const watch = new MutationObserver(() => { if (reveal()) watch.disconnect(); }); watch.observe(document.body, { attributes: true, attributeFilter: ['class'] }); }
}
