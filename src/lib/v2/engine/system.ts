import { positionAU, centuriesSinceJ2000 } from '../../orbit';
import { keplerPosition, eclToEngine } from '../atlas/kepler';
import type { Body, KeplerOrbit } from '../atlas/types';
import { AU, eclToWorld, type V3 } from './vec';

/**
 * Where everything is, on the engine's clock. Heliocentric, metres, engine frame (y = ecliptic
 * north). The clock follows real time unless set; it can run faster or backwards.
 *
 * Positions are worked out on demand and cached for the current tick, so asking for a moon costs
 * one Kepler solve plus its parent's (already cached) position.
 */
export function createSystem(bodies: Body[]) {
  const byId = new Map(bodies.map((b) => [b.id, b]));
  let simMs = Date.now();
  let rate = 1;
  let following = true;
  let tick = 0;
  const cache = new Map<string, { tick: number; p: V3 }>();
  const ecl: V3 = [0, 0, 0];

  function advance(wallSecs: number) {
    if (following && rate === 1) simMs = Date.now();
    else simMs += wallSecs * 1000 * rate;
    tick++;
  }
  const jd = () => simMs / 86_400_000 + 2_440_587.5;

  /** Heliocentric position of a body, metres, or null if it is unknown or cannot be placed. */
  function pos(id: string): V3 | null {
    const c = cache.get(id);
    if (c && c.tick === tick) return c.p;
    const b = byId.get(id);
    if (!b) return null;
    let p: V3 | null = null;
    const o = b.orbit;
    if (o.type === 'fixed') p = [0, 0, 0];
    else if (o.type === 'jpl-approx') {
      const a = eclToWorld(positionAU(o.slug, centuriesSinceJ2000(simMs)));
      p = [a[0] * AU, a[1] * AU, a[2] * AU];
    } else if (o.type === 'kepler' && b.parent) {
      const parent = pos(b.parent);
      if (parent) {
        keplerPosition(o as KeplerOrbit, b.parent, jd(), ecl);
        const e = eclToEngine(ecl[0], ecl[1], ecl[2]);
        p = [parent[0] + e[0] * 1000, parent[1] + e[1] * 1000, parent[2] + e[2] * 1000];
      }
    }
    if (p) cache.set(id, { tick, p });
    return p;
  }

  return {
    advance, pos, jd,
    body: (id: string) => byId.get(id),
    get timeMs() { return simMs; },
    get rate() { return rate; },
    setTime(iso: string | null) {
      if (iso === null) { following = true; simMs = Date.now(); }
      else { const t = Date.parse(iso); if (!Number.isNaN(t)) { simMs = t; following = false; } }
      tick++;
    },
    setRate(r: number) { rate = Number.isFinite(r) ? r : 1; if (rate !== 1) following = false; },
  };
}

export type System = ReturnType<typeof createSystem>;
