/**
 * The record: one layout for every object on the site (moons and small worlds, stars, and later the
 * planets' own data sheets). The data sheet always lists the same quantities in the same places, so any
 * two records can be compared at a glance: distance, size, temperature, then mass or light, then the rest.
 * A quantity that is not known is left out, never drawn as an empty cell.
 * Builds HTML strings so both Astro pages and the star pages (which are built as strings) can use it.
 */
export type CellKey = 'distance' | 'size' | 'temperature' | 'mass' | 'light' | 'orbit' | 'day' | 'seen' | 'density' | 'moons' | 'type' | 'found';
export interface Cell { key: CellKey; label: string; value: string; unit?: string; note?: string }
const ORDER: CellKey[] = ['distance', 'size', 'temperature', 'mass', 'light', 'orbit', 'day', 'seen', 'density', 'moons', 'type', 'found'];
const LABEL: Record<CellKey, string> = { distance: 'Distance', size: 'Size', temperature: 'Temperature', mass: 'Mass', light: 'Light given out', orbit: 'Once round', day: 'A day', moons: 'Moons', seen: 'Seen from the Earth', density: 'Density', type: 'Type', found: 'Found' };

export const esc = (s: string) => s.replace(/[&<>"]/g, (c) => `&#${c.charCodeAt(0)};`);

export function sheet(cells: Cell[]): string {
  const have = new Map(cells.map((c) => [c.key, c]));
  const list = ORDER.filter((k) => have.has(k)).map((k) => have.get(k)!);
  return `<dl class="rec-sheet">${list.map((c) => `<div class="rc" data-k="${c.key}"><dt>${c.label || LABEL[c.key]}</dt><dd><b>${c.value}</b>${c.unit ? ` <span>${c.unit}</span>` : ''}</dd>${c.note ? `<p>${c.note}</p>` : ''}</div>`).join('')}</dl>`;
}

/** The top of a record: where it sits, its name and kind on one line, and one sentence. */
export function head(o: { crumbs: [string, string][]; name: string; kind: string; lead?: string; badge?: string }): string {
  return `<header class="rec-head"><p class="rec-crumbs">${o.crumbs.map(([t, h]) => `<a href="${h}">${esc(t)}</a>`).join(' <span aria-hidden="true">/</span> ')}</p>
  <div class="rec-title"><h1>${esc(o.name)}</h1><p class="rec-kind">${esc(o.kind)}</p>${o.badge ? `<p class="rec-badge">${o.badge}</p>` : ''}</div>
  ${o.lead ? `<p class="rec-lead">${o.lead}</p>` : ''}</header>`;
}

/** A number with a few significant figures, written the British way. */
export const sig = (n: number, s = 3) => Number(n.toPrecision(s)).toLocaleString('en-GB', { maximumFractionDigits: 6 });
/** A ratio said plainly: "2.3 per cent of the Earth's", "0.40 times the Earth's", "11 times the Earth's". */
export function ratio(x: number, what: string): string {
  if (x < 0.1) return `${sig(x * 100, 2)} per cent of ${what}`;
  if (x < 10) return `${x.toFixed(2)} times ${what}`;
  return `${sig(x, 2)} times ${what}`;
}
