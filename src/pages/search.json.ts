// Everything the header search can find, built once at build time: planets, moons and small worlds,
// stars, constellations, glossary words, lessons and the main pages. Each entry is [title, kind, url, also].
import type { APIRoute } from 'astro';
import { allBodies } from '../data/bodies/index';
import { outlineWorlds, PLANET_PAGES, KIND_NAMES, nameOf } from '../lib/worlds';
import { allStars, pageStars } from '../lib/sky/starlist';
import { slugOf } from '../lib/sky/star';
import { allTerms, allLessons } from '../lib/v2/margin/content';
import { sections } from '../lib/nav';

export const GET: APIRoute = async () => {
  const out: [string, string, string, string?][] = [];
  for (const id of PLANET_PAGES) {
    const b = allBodies.find((x) => x.id === id)!;
    out.push([b.name.replace(/^The /, ''), id === 'sun' ? 'Star' : 'Planet', `/${id}`]);
  }
  for (const b of outlineWorlds) {
    const kind = b.kind === 'moon' ? `Moon of ${nameOf(b.parent).replace(/^the /, '')}` : KIND_NAMES[b.kind];
    out.push([b.name.replace(/^The /, ''), kind, `/worlds/${b.id}`, b.id === 'moon' ? 'Luna' : undefined]);
  }
  const cons = new Set<string>();
  for (const s of allStars()) if (s.constellation) cons.add(s.constellation);
  for (const c of [...cons].sort()) out.push([c, 'Constellation', `/stars/in/${slugOf(c)}`]);
  for (const t of await allTerms()) out.push([t.term, 'Glossary', `/glossary#${t.id}`, t.also.join(' ') || undefined]);
  for (const l of await allLessons()) out.push([l.data.title, 'Lesson', `/learn/${l.id}`]);
  for (const s of sections) out.push([s.label, 'Page', s.href]);
  for (const s of pageStars()) {
    const also = [s.catalogue, s.hip ? `HIP ${s.hip}` : '', s.hd ? `HD ${s.hd}` : ''].filter((x) => x && x !== s.name).join(' ');
    out.push([s.name, s.proper ? 'Star' : 'Star (catalogue)', `/stars/${s.slug}`, also || undefined]);
  }
  return new Response(JSON.stringify(out.map((e) => (e[3] ? e : e.slice(0, 3)))), { headers: { 'content-type': 'application/json' } });
};
