/**
 * What a star's page does once it is open: the year its light left, where the star is in the
 * visitor's sky at this moment, and the slow glow of its drawn face.
 */
import { moment, toSky, type Vec } from './place';
import { CITIES, guess } from './cities';
import { wayOf, heightOf } from './words';
import { readPlace } from './remember';

export function enliven(page: HTMLElement): void {
  const lyEl = page.querySelector<HTMLElement>('[data-ly]'), left = page.querySelector<HTMLElement>('[data-left]');
  if (lyEl && left) {
    const ly = Number(lyEl.dataset.ly), year = new Date().getFullYear() - Math.round(ly);
    if (ly > 0 && year > 0) left.textContent = `in about ${year}`;
  }
  const now = page.querySelector<HTMLElement>('[data-now]');
  if (now) {
    const first = guess(), saved = readPlace() ?? { name: CITIES[first][0], lat: CITIES[first][1], lon: CITIES[first][2] };
    const dir = page.dataset.dir!.split(',').map(Number) as Vec, given = page.dataset.name!, name = /^An? (unnamed|companion)/.test(given) ? 'This star' : given;
    const s = toSky(dir, moment(new Date(), saved.lat, saved.lon));
    // how high it gets and how low it sinks as the sky turns, from its height over a day
    let top = -90, low = 90;
    for (let h = 0; h < 24; h += 0.25) { const a = toSky(dir, moment(new Date(Date.now() + h * 3600000), saved.lat, saved.lon)).altDeg; top = Math.max(top, a); low = Math.min(low, a); }
    const from = saved.name === 'Where you are' ? 'where you are' : saved.name;
    now.textContent = top < 0 ? `${name} never rises above the horizon from ${from}. You would have to travel ${saved.lat > 0 ? 'south' : 'north'} to see it.`
      : s.altDeg > 0 ? `${name} is up now from ${from}: ${heightOf(s.altDeg)} in the ${wayOf(s.azDeg)}, ${Math.round(s.altDeg)}° above the horizon.${low > 0 ? ' From there it never sets.' : ''}`
      : `${name} is below the horizon from ${from} at this moment. At its highest it stands ${Math.round(top)}° up.`;
    const more = document.createElement('p');
    more.innerHTML = 'The place is the one you last chose on <a href="/sky">the sky map</a>, or a guess from your device\'s clock.';
    now.after(more);
  }

  // the star's face: a soft glow in its own colour, larger for a star that gives out more light
  const canvas = page.querySelector('canvas'); if (!canvas) return;
  const ctx = canvas.getContext('2d')!, rgb = page.dataset.rgb!, lum = Number(page.dataset.lum), calm = matchMedia('(prefers-reduced-motion: reduce)');
  function face(t: number): void {
    const box = canvas!.getBoundingClientRect(), ratio = Math.min(devicePixelRatio || 1, 2), w = box.width, h = box.height;
    if (canvas!.width !== Math.round(w * ratio)) { canvas!.width = Math.round(w * ratio); canvas!.height = Math.round(h * ratio); }
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0); ctx.clearRect(0, 0, w, h);
    const s = Math.min(w, h), core = s * (0.06 + 0.014 * Math.max(-3, Math.min(5, Math.log10(lum)))), breathe = 1 + 0.025 * Math.sin(t / 1700);
    const halo = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, s * 0.5);
    halo.addColorStop(0, `rgba(${rgb},.5)`); halo.addColorStop(0.25, `rgba(${rgb},.13)`); halo.addColorStop(1, `rgba(${rgb},0)`);
    ctx.fillStyle = halo; ctx.fillRect(0, 0, w, h);
    const disc = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, core * 2.6 * breathe);
    disc.addColorStop(0, 'rgba(255,255,255,1)'); disc.addColorStop(0.3, `rgba(${rgb},1)`); disc.addColorStop(0.55, `rgba(${rgb},.5)`); disc.addColorStop(1, `rgba(${rgb},0)`);
    ctx.fillStyle = disc; ctx.beginPath(); ctx.arc(w / 2, h / 2, core * 2.6 * breathe, 0, Math.PI * 2); ctx.fill();
    if (!calm.matches && !document.hidden) requestAnimationFrame(face);
  }
  requestAnimationFrame(face);
  addEventListener('resize', () => { if (calm.matches) face(0); });
}
