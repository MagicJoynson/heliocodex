// The stars that share one page: those known only by a catalogue number. Built from the star file's list.
import type { APIRoute } from 'astro';
import { allStars } from '../../../lib/sky/starlist';

export const GET: APIRoute = () => {
  const stars = allStars().filter((s) => !s.slug), cons = Object.fromEntries(stars.map((s) => [s.con, s.constellation]));
  const round = (n: number) => Math.round(n * 1e5) / 1e5;
  return new Response(JSON.stringify({
    source: 'HYG star database 4.4 by David Nash, CC BY-SA 4.0',
    fields: ['index', 'hip', 'hd', 'con', 'spect', 'distPc', 'appMag', 'bv', 'lumSun', 'east', 'north', 'up', 'rank', 'companionOf'],
    cons,
    stars: stars.map((s) => [s.index, s.hip, s.hd, s.con, s.spect, s.distPc, s.appMag, s.bv, s.lumSun, ...s.dir.map(round), s.rank ?? null, s.companionOf ?? null]),
  }), { headers: { 'content-type': 'application/json' } });
};
