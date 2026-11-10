// The moons of the dwarf planets beyond Pluto. Each chart is one drawing, looking straight down on
// the moon's own orbit, because for most of these worlds nobody knows which way the world itself
// is tipped. Figures come from the body list, so the words cannot drift from the data.
import type { PlateSpec } from './types';
import type { KeplerOrbit } from '../types';
import { allBodies } from '../../../../data/bodies/index';
import { viewAbove } from '../chart';

const HORIZONS = { label: 'NASA/JPL Horizons: orbit solutions for the moons of trans-Neptunian objects, fitted here over 2000 to 2030', url: 'https://ssd.jpl.nasa.gov/horizons/' };
const SBDB = { label: 'NASA/JPL Small-Body Database', url: 'https://ssd.jpl.nasa.gov/tools/sbdb_lookup.html' };

interface Hand {
  parent: string;
  title: string;
  lead: string;
  /** The moon whose orbit the drawing looks down on. None when no orbit's direction is known. */
  above?: string;
  spanKm: number;
  names: Record<string, number>;
  note: string;
  caution?: string;
  rings?: PlateSpec['rings'];
  sources?: PlateSpec['sources'];
}

function chart(h: Hand): PlateSpec {
  const world = allBodies.find((b) => b.id === h.parent)!;
  const moons = allBodies.filter((b) => b.parent === h.parent);
  const lead = h.above ? (allBodies.find((b) => b.id === h.above)!.orbit as KeplerOrbit) : undefined;
  const papers = [...new Map(moons.flatMap((m) => m.sources).concat(world.sources).filter((s) => s.url !== HORIZONS.url && s.url !== SBDB.url).map((s) => [s.url, s])).values()];
  return {
    parent: h.parent,
    title: h.title,
    lead: h.lead,
    equatorKm: world.meanRadiusKm ?? 0,
    rings: h.rings ?? [],
    caution: h.caution,
    viewNote: lead
      ? `You are looking straight down on the orbit of ${moons.find((m) => m.id === h.above)!.name}, from its northern side. Which way ${world.name} itself is tipped is not well known, so its moon’s path is the surest thing to look down on.`
      : `Nobody knows yet which way this orbit faces in space, so it is drawn flat on the page, as if seen from straight above. Its size and shape are right. Its direction is not shown.`,
    tiltNote: 'Tilt is measured from the plane of the planets, and above 90° means the moon goes round backwards compared with the planets.',
    families: [{ id: 'moons', name: moons.length === 1 ? 'The moon' : 'The moons', note: h.note, has: () => true }],
    figures: [{
      id: 'moons', numeral: 'I', title: `${world.name} and its ${moons.length === 1 ? 'moon' : 'moons'}`,
      caption: lead
        ? `${world.name} and the ${moons.length === 1 ? 'orbit of its moon' : 'orbits of its moons'}, to scale, seen from above the orbit.`
        : `${world.name} and the orbit of its moon, to scale. The orbit’s direction in space is not known.`,
      families: ['moons'], spanKm: h.spanKm, names: h.names, view: lead ? viewAbove(lead) : 'ecliptic',
    }],
    sources: [...(lead ? [HORIZONS] : []), ...papers, ...(h.sources ?? []), SBDB],
  };
}

export const haumea = chart({
  parent: 'haumea', above: 'hiiaka',
  title: 'The moons of Haumea',
  lead: 'Haumea has two known moons, both found in 2005. Hiʻiaka is the larger and further out. Namaka is closer in, on a stretched path that is tipped against Hiʻiaka’s. Haumea also has a thin ring.',
  spanKm: 62_000, names: { hiiaka: 40, namaka: 200 },
  rings: [{ name: 'Ring', innerKm: 2252, outerKm: 2322 }],
  note: 'Hiʻiaka pulls on Namaka hard enough that Namaka’s path keeps changing, so a simple orbit follows it only roughly. That is why its line is broken.',
  caution: 'The ring is about 2,287 km from Haumea’s centre and about 70 km wide. It was found in 2017, when Haumea passed in front of a star and the star blinked out briefly on either side.',
});

export const makemake = chart({
  parent: 'makemake',
  title: 'The moon of Makemake',
  lead: 'Makemake has one known moon, found in Hubble pictures taken in 2015. It is about 1,300 times fainter than Makemake and has no name yet, only the label S/2015 (136472) 1.',
  spanKm: 28_000, names: { 's-2015-136472-1': 40 },
  note: 'A first orbit was worked out in 2025 from twelve Hubble sightings: a circle about 22,250 km in radius, give or take 780 km, taking 18 days. It has not yet been published in a journal. From Earth the orbit is seen almost edge-on.',
  sources: [{ label: 'Parker et al. 2016, Astrophysical Journal Letters 825, L9 (the discovery)', url: 'https://doi.org/10.3847/2041-8205/825/1/L9' }],
});

export const eris = chart({
  parent: 'eris', above: 'dysnomia',
  title: 'The moon of Eris',
  lead: 'Eris has one known moon, Dysnomia, found in 2005. Its path is very nearly a circle. Timing it gave the mass of Eris, which turned out to be greater than Pluto’s.',
  spanKm: 46_000, names: { dysnomia: 40 },
  note: 'Dysnomia’s width comes from the heat it gives off, measured with the ALMA radio telescope, and is uncertain by about a sixth either way.',
  sources: [{ label: 'Brown & Butler 2018, Astronomical Journal 156, 164 (the sizes of Dysnomia and Vanth)', url: 'https://doi.org/10.3847/1538-3881/aad9f2' }],
});

export const gonggong = chart({
  parent: 'gonggong',
  title: 'The moon of Gonggong',
  lead: 'Gonggong has one known moon, Xiangliu, noticed in 2016 in Hubble pictures taken years earlier. Its path is clearly stretched: at its nearest it is little more than half as far from Gonggong as at its furthest.',
  spanKm: 38_000, names: { xiangliu: 40 },
  note: 'The Hubble pictures fit two mirror-image orbits equally well, tipped opposite ways. The size and shape drawn are those of the one that goes round the usual way; the other differs by about one part in a hundred.',
});

export const quaoar = chart({
  parent: 'quaoar', above: 'weywot',
  title: 'The moon of Quaoar',
  lead: 'Quaoar has one known moon, Weywot, found in 2006.',
  spanKm: 21_000, names: { weywot: 40 },
  note: 'This is JPL’s orbit for Weywot, which rests on a handful of sightings from 2006 to 2011. JPL warns it may be poor outside those years and puts it as much as 3,600 km out by 2025, about 15° round the orbit, so the dot is a rough guide.',
  caution: 'Quaoar also has rings, the first of them reported in 2023. They are not drawn here yet.',
  sources: [{ label: 'Morgado et al. 2023, Nature 614, 239 (the first ring)', url: 'https://doi.org/10.1038/s41586-022-05629-6' }],
});

export const orcus = chart({
  parent: 'orcus', above: 'vanth',
  title: 'The moon of Orcus',
  lead: 'Orcus has one known moon, Vanth, found in 2005. Vanth is nearly half as wide as Orcus, so the two make a double world rather like Pluto and Charon. Its path is almost a perfect circle.',
  spanKm: 11_500, names: { vanth: 40 },
  note: 'Vanth’s width was measured in 2017, when it passed in front of a star.',
  sources: [{ label: 'Sickafoose et al. 2019, Icarus 319, 657 (Vanth passing in front of a star)', url: 'https://doi.org/10.1016/j.icarus.2018.10.016' }],
  caution: 'The drawing holds Orcus still at the centre. In truth the two circle a point between them.',
});
