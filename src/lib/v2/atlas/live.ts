// The part of an atlas plate that needs a script: putting each moon where it is right now,
// pointing to the Sun, and lighting an orbit when its row in the list is touched.
// Without this the page still shows every orbit and the whole list.
import type { KeplerOrbit } from './types';
import { dotAt, topView, type ViewFrom } from './chart';
import { julianDate, keplerPosition } from './kepler';
import { centuriesSinceJ2000, elements, positionAU } from '../../orbit';

interface Data { parent: string; dots?: string; parentOrbit?: KeplerOrbit; figures: { id: string; spanKm: number; view?: ViewFrom; centreKm?: [number, number]; ids: string[]; adrift?: boolean }[]; orbits: Record<string, KeplerOrbit> }

const holder = document.getElementById('plate-data');
if (holder) {
  const data = JSON.parse(holder.textContent || '{}') as Data;
  const fmt = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'UTC' });

  const place = () => {
    const now = new Date(), jd = julianDate(now);
    // the planet from the Sun, so the Sun lies the other way. Dwarf planets carry their own orbit.
    const s = elements[data.parent] ? positionAU(data.parent, centuriesSinceJ2000(now)) : data.parentOrbit ? keplerPosition(data.parentOrbit, 'sun', jd) : null;
    for (const f of data.figures) {
      const svg = document.querySelector<SVGSVGElement>(`svg.plate[data-figure="${f.id}"]`);
      if (!svg) continue;
      const p = topView(data.parent, f.spanKm, 440, f.view, f.centreKm);
      for (const id of f.ids) {
        const g = svg.querySelector<SVGGElement>(`[data-dot="${id}"]`);
        if (!g) continue;
        const [x, y] = dotAt(p, data.orbits[id], jd);
        g.setAttribute('transform', `translate(${x.toFixed(1)} ${y.toFixed(1)})`);
      }
      const [sx, sy] = s ? p.project(-s[0], -s[1], -s[2]) : [0, 0];
      const len = Math.hypot(sx, sy) || 1, r = p.half + 30;
      const arrow = svg.querySelector<SVGGElement>('[data-sunward]');
      // a drawing whose direction in space is not known cannot say which way the Sun lies, and has nothing placed
      if (arrow && s && !f.adrift) {
        arrow.setAttribute('transform', `translate(${((sx / len) * r).toFixed(1)} ${((sy / len) * r).toFixed(1)})`);
        arrow.querySelector('path')?.setAttribute('transform', `rotate(${((Math.atan2(sy, sx) * 180) / Math.PI).toFixed(1)})`);
        const label = arrow.querySelector('text');
        label?.setAttribute('x', (-(sx / len) * 52).toFixed(1));
        label?.setAttribute('y', (-(sy / len) * 46 + 6).toFixed(1));
        arrow.style.display = '';
      }
      const when = svg.querySelector('[data-when]');
      if (when) when.textContent = f.adrift ? 'The orbit only: its direction is not known' : `${data.dots ?? 'Moons'} placed for ${fmt.format(now)} UTC`;
      svg.classList.add('live');
    }
  };
  place();
  setInterval(place, 60_000);
  document.documentElement.classList.add('plates-live');

  // a row in the list lights its orbit, and an orbit lights its row
  let lit = '';
  const light = (id: string) => {
    if (id === lit) return;
    if (lit) for (const el of document.querySelectorAll(`[data-body="${lit}"], [data-dot="${lit}"]`)) el.classList.remove('on');
    lit = id;
    if (id) for (const el of document.querySelectorAll(`[data-body="${CSS.escape(id)}"], [data-dot="${CSS.escape(id)}"]`)) el.classList.add('on');
  };
  const idOf = (t: EventTarget | null) => (t instanceof Element ? t.closest<HTMLElement | SVGElement>('[data-body]')?.dataset.body ?? '' : '');
  document.addEventListener('pointerover', (e) => light(idOf(e.target)));
  document.addEventListener('focusin', (e) => light(idOf(e.target)));
  const fromHash = () => light(decodeURIComponent(location.hash.slice(1)));
  window.addEventListener('hashchange', fromHash);
  if (location.hash) fromHash();
}
