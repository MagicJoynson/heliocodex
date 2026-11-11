// Everything the guide in the 3D view can show, as one file it fetches the first time it is opened.
import type { APIRoute } from 'astro';
import { allFacts, allLessons, allTerms, STRAND_NAMES } from '../../lib/v2/margin/content';
import type { MarginData } from '../../lib/v2/margin/pick';
import { pageStars } from '../../lib/sky/starlist';

export const GET: APIRoute = async () => {
  const [lessons, facts, terms] = await Promise.all([allLessons(), allFacts(), allTerms()]);
  const data: MarginData = {
    strands: STRAND_NAMES,
    lessons: lessons.map((l) => ({ id: l.id, title: l.data.title, strand: l.data.strand, summary: l.data.summary, target: l.data.view?.target, distanceKm: l.data.view?.distanceKm, terms: l.data.terms })),
    facts: facts.map((f) => ({ id: f.id, text: f.text, about: f.about, basis: f.basis, source: f.source, target: f.view?.target, distanceKm: f.view?.distanceKm })),
    stars: Object.fromEntries(pageStars().map((s) => [s.index, [s.name, s.slug]])),
    terms: terms.map((t) => ({ id: t.id, term: t.term, short: t.short, more: t.more, lesson: t.lesson })),
  };
  return new Response(JSON.stringify(data), { headers: { 'content-type': 'application/json; charset=utf-8' } });
};
