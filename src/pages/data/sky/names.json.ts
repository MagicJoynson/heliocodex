// A name and a page for every star on the sky map, in the order of the star file. An entry that is
// a plain string is a star known only by a catalogue number, which shares the catalogue page. A list
// is a star with a page of its own: its name, then its address when that is not simply the name in small letters.
import type { APIRoute } from 'astro';
import { allStars } from '../../../lib/sky/starlist';
import { slugOf } from '../../../lib/sky/star';
import { SKY_STARS } from '../../../lib/sky/chart';

export const GET: APIRoute = () => {
  const out: (string | string[])[] = Array.from({ length: SKY_STARS }, () => '');
  for (const s of allStars()) if (s.index < SKY_STARS) out[s.index] = !s.slug ? s.name : slugOf(s.name) === s.slug ? [s.name] : [s.name, s.slug];
  return new Response(JSON.stringify(out), { headers: { 'content-type': 'application/json' } });
};
