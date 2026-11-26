// Everything the header search can find, built once at build time: planets, moons and small worlds,
// stars, constellations, glossary words, lessons and the main pages. Each entry is [title, kind, url, also, text, go, lessons]:
// `go` is the id /explore?go= takes, `lessons` the ids of lessons about it, both only where there are some.
import type { APIRoute } from 'astro';
import { allBodies } from '../data/bodies/index';
import { outlineWorlds, PLANET_PAGES, KIND_NAMES, kindName, nameOf } from '../lib/worlds';
import { allStars, pageStars } from '../lib/sky/starlist';
import { slugOf } from '../lib/sky/star';
import { allTerms, allLessons, allFacts } from '../lib/v2/margin/content';
import { sections } from '../lib/nav';
import { landmarks } from '../lib/v2/atlas/landmarks';
import { goFor, goStar, lessonsAbout } from '../lib/objects';

// What people call a world instead of its name. Each is plain description that is true of that world.
const NICKNAME: Record<string, string> = {
  mars: 'red planet valles marineris', venus: 'morning star evening star', mercury: 'smallest planet', jupiter: 'largest planet gas giant', saturn: 'ringed planet gas giant',
  uranus: 'ice giant tilted sideways', neptune: 'ice giant', earth: 'home planet blue planet our world', sun: 'our star',
  ganymede: 'biggest moon largest moon', titan: 'hazy moon thick atmosphere', io: 'volcanic moon', europa: 'ocean moon icy moon', enceladus: 'geysers icy moon', pluto: 'former planet',
};

export const GET: APIRoute = async () => {
  type E = [string, string, string, string?, string?, string?, string?];
  const out: E[] = [];
  const lessonList = await allLessons();
  const factList = await allFacts();
  const about = (id: string, name: string) => lessonsAbout(lessonList, id, name, 3, factList).map((l) => l.id).join(' ') || undefined;
  for (const id of PLANET_PAGES) {
    const b = allBodies.find((x) => x.id === id)!;
    out.push([b.name.replace(/^The /, ''), id === 'sun' ? 'Star' : 'Planet', `/${id}`, NICKNAME[id], undefined, goFor(b) ?? undefined, about(id, b.name.replace(/^The /, ''))]);
  }
  for (const b of outlineWorlds) {
    const kind = b.kind === 'moon' ? `Moon of ${nameOf(b.parent).replace(/^the /, '')}` : kindName(b);
    out.push([b.name.replace(/^The /, ''), kind, `/worlds/${b.id}`, b.id === 'moon' ? 'Luna' : NICKNAME[b.id], undefined, goFor(b) ?? undefined, about(b.id, b.name.replace(/^The /, ''))]);
  }
  const cons = new Set<string>();
  for (const s of allStars()) if (s.constellation) cons.add(s.constellation);
  for (const c of [...cons].sort()) out.push([c, 'Constellation', `/stars/in/${slugOf(c)}`]);
  // The last field is words a question can find, never shown: first the questions a lesson answers, divided by |, then after || a glossary meaning, or a lesson's summary and its facts.
  for (const t of await allTerms()) out.push([t.term, 'Glossary', `/glossary#${t.id}`, t.also.join(' ') || undefined, `||${t.short} ${t.more ?? ''}`.trim()]);
  const facts = factList;
  for (const l of lessonList) out.push([l.data.title, 'Lesson', `/learn/${l.id}`, undefined, `${l.data.asks.join('|')}||${[l.data.summary, ...facts.filter((f) => f.about.includes(l.id)).map((f) => f.text)].join(' ')}`]);
  for (const s of sections) out.push([s.label, 'Page', s.href]);
  out.push(['A fact at a time', 'Page', '/learn/facts/random', 'random fact surprising']);
  for (const s of pageStars()) {
    // "Alpha-1 Centauri" is also found as "Alpha Centauri", the way people type a double star's name
    const plain = s.catalogue?.replace(/^(\w+)-\d+ /, '$1 ');
    const also = [...new Set([s.catalogue, plain])].filter((x) => x && x !== s.name).concat([s.hip ? `HIP ${s.hip}` : '', s.hd ? `HD ${s.hd}` : '']).filter(Boolean).join(' ');
    out.push([s.name, s.proper ? 'Star' : 'Star (catalogue)', `/stars/${s.slug}`, also || undefined, undefined, goStar(s.index)]);
  }
  // The nebula the 3D view flies to. Its page is the lesson about star birth, which is about it.
  out.push(['Orion Nebula', 'Nebula', '/learn/nebulae-and-star-birth', 'M42 Messier 42 great nebula', undefined, 'orion-nebula', 'nebulae-and-star-birth']);
  // The Atlas's landmarks: the Pleiades, the Magellanic Cloud, Andromeda, the Milky Way's black hole. Each opens its entry in the Atlas.
  const ALSO: Record<string, string> = {
    pleiades: 'Seven Sisters M45', andromeda: 'M31 Messier 31', m87: 'Messier 87 Virgo A', 'large-magellanic-cloud': 'LMC',
    'galactic-centre': 'Sagittarius A Sgr galactic center', 'milky-way-black-hole': 'Sagittarius A Sgr', 'observable-universe': 'universe', edge: 'cmb cosmic microwave background', 'space-station': 'ISS International',
  };
  const have = new Set(out.map((e) => e[0].toLowerCase()));
  for (const l of landmarks) {
    if (l.id === 'person') continue;
    const title = l.name.replace(/^(The|An|A) /, '').split(',')[0].replace(/^./, (c) => c.toUpperCase());
    if (have.has(title.toLowerCase())) continue;
    out.push([title, 'Atlas landmark', `/atlas#mark-${l.id}`, ALSO[l.id]]);
  }
  // Trailing empty fields are left off, so most entries stay three or four items long.
  const trim = (e: E) => { const a: (string | undefined)[] = [e[0], e[1], e[2], e[3] ?? '', e[4] ?? '', e[5] ?? '', e[6] ?? '']; while (a.length > 3 && !a[a.length - 1]) a.pop(); return a; };
  return new Response(JSON.stringify(out.map(trim)), { headers: { 'content-type': 'application/json' } });
};
