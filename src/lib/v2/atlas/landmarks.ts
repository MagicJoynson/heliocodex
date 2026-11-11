// The marks on the ruler that are not bodies in the data: a person, a mountain, a light year,
// the nearest star, the edge of what can be seen. Written by hand, each with where it comes from.
//
// `metres` places the mark. `value` is what the reader sees, and chart.test.ts checks that the two
// agree, so a slip in one of them fails the build.
import type { Source } from './types';

export interface Landmark {
  id: string;
  name: string;
  value: string;
  metres: number;
  /** A size goes on one side of the ruler and a distance on the other. */
  side: 'size' | 'distance';
  /** One or two plain sentences for the list under the ruler. */
  note: string;
  /** 'derived' is worked out here from a measured figure. 'theory' has never been seen. */
  known?: 'derived' | 'theory';
  source: Source;
}

const LY = 9.4607304725808e15, AU = 1.495978707e11;

export const landmarks: Landmark[] = [
  // ---- sizes
  { id: 'person', name: 'An adult', value: 'about 1.7 m tall', metres: 1.7, side: 'size',
    note: 'The ruler starts at the scale of a person, because it is the one size everybody knows.',
    source: { label: 'Our World in Data, human height', url: 'https://ourworldindata.org/human-height' } },
  { id: 'blue-whale', name: 'A blue whale', value: 'up to 33 m long', metres: 33, side: 'size',
    note: 'The largest animal that has ever lived.',
    source: { label: 'NOAA Fisheries, blue whale', url: 'https://www.fisheries.noaa.gov/species/blue-whale' } },
  { id: 'space-station', name: 'The Space Station', value: '109 m across', metres: 109, side: 'size',
    note: 'The International Space Station, measured across its solar panels. It is the largest thing people have built off the Earth.',
    source: { label: 'NASA, International Space Station facts and figures', url: 'https://www.nasa.gov/international-space-station/space-station-facts-and-figures/' } },
  { id: 'everest', name: 'Mount Everest', value: '8,849 m high', metres: 8849, side: 'size',
    note: 'The height above sea level agreed by Nepal and China in 2020.',
    source: { label: 'BBC News, 8 December 2020: Mount Everest’s new height', url: 'https://www.bbc.co.uk/news/world-asia-55218443' } },
  { id: 'neutron-star', name: 'A neutron star', value: 'about 25 km wide', metres: 25_400, side: 'size',
    note: 'More mass than the Sun, pressed into a ball the width of a city. This is the one whose width has been measured best, a pulsar called PSR J0030+0451.',
    source: { label: 'Riley et al. 2019, Astrophysical Journal Letters 887, L21 (NICER telescope)', url: 'https://doi.org/10.3847/2041-8213/ab481c' } },
  { id: 'sirius-b', name: 'Sirius B, a white dwarf', value: '11,300 km wide', metres: 1.127e7, side: 'size',
    note: 'The dead core of a star like the Sun. It has the mass of the Sun in a ball a little smaller than the Earth.',
    source: { label: 'Bond et al. 2017, Astrophysical Journal 840, 70 (Hubble Space Telescope)', url: 'https://doi.org/10.3847/1538-4357/aa6af8' } },
  { id: 'milky-way-black-hole', name: 'The Milky Way’s black hole', value: 'about 24 million km wide', metres: 2.42e10, side: 'size', known: 'derived',
    note: 'The width of the event horizon of Sagittarius A*, the black hole at the centre of our galaxy. Worked out here from its measured mass, 4.1 million Suns, for a hole that is not spinning.',
    source: { label: 'GRAVITY Collaboration 2019, Astronomy & Astrophysics 625, L10 (the mass)', url: 'https://doi.org/10.1051/0004-6361/201935656' } },
  { id: 'betelgeuse', name: 'Betelgeuse, a red supergiant', value: 'about 1.1 billion km wide', metres: 1.063e12, side: 'size',
    note: 'A swollen star near the end of its life. Put where the Sun is, it would swallow Mars and reach most of the way to Jupiter. Its width is known to about a tenth.',
    source: { label: 'Joyce et al. 2020, Astrophysical Journal 902, 63', url: 'https://doi.org/10.3847/1538-4357/abb8db' } },
  { id: 'm87-black-hole', name: 'The black hole in M87', value: 'about 38 billion km wide', metres: 3.84e13, side: 'size', known: 'derived',
    note: 'The first black hole to have its picture taken. Its event horizon is four times as wide as Neptune’s orbit. Worked out here from its measured mass, 6.5 billion Suns, for a hole that is not spinning.',
    source: { label: 'European Southern Observatory, 10 April 2019: first image of a black hole (the mass)', url: 'https://www.eso.org/public/news/eso1907/' } },
  { id: 'milky-way', name: 'The Milky Way’s disc', value: 'about 100,000 light years wide', metres: 1e5 * LY, side: 'size',
    note: 'Our galaxy: a flat disc of a few hundred billion stars. Its edge is not sharp, and counts that include the thin outer parts come out larger.',
    source: { label: 'NASA, galaxies', url: 'https://science.nasa.gov/universe/galaxies/' } },
  { id: 'laniakea', name: 'The Laniakea supercluster', value: 'about 520 million light years wide', metres: 5.2e8 * LY, side: 'size',
    note: 'The great gathering of about a hundred thousand galaxies that ours belongs to, mapped by which way the galaxies are flowing.',
    source: { label: 'Tully et al. 2014, Nature 513, 71', url: 'https://doi.org/10.1038/nature13674' } },
  { id: 'observable-universe', name: 'Everything we can see', value: 'about 93 billion light years wide', metres: 9.3e10 * LY, side: 'size',
    note: 'The observable universe: the part whose light has had time to reach us. It is wider than twice its age in light years because space has stretched while the light was travelling. Nobody knows how much lies beyond.',
    source: { label: 'Gott et al. 2005, Astrophysical Journal 624, 463: A Map of the Universe', url: 'https://doi.org/10.1086/428890' } },

  // ---- distances
  { id: 'edge-of-space', name: 'Where space begins', value: '100 km up', metres: 1e5, side: 'distance',
    note: 'There is no sharp top to the air. This height, the Kármán line, is the one the world’s air sports body uses to say where flying ends and spaceflight begins.',
    source: { label: 'Fédération Aéronautique Internationale, the 100 km boundary', url: 'https://www.fai.org/page/icare-boundary' } },
  { id: 'geostationary', name: 'Weather and TV satellites', value: '35,786 km up', metres: 3.5786e7, side: 'distance',
    note: 'At this height a satellite goes round once a day, so it stays over the same spot on the turning Earth.',
    source: { label: 'European Space Agency, types of orbits', url: 'https://www.esa.int/Enabling_Support/Space_Transportation/Types_of_orbits' } },
  { id: 'light-second', name: 'One light second', value: '299,792 km', metres: 299_792_458, side: 'distance',
    note: 'How far light goes in a second. The metre is defined from this number, so it is exact.',
    source: { label: 'International Bureau of Weights and Measures, the defining constants of the SI', url: 'https://www.bipm.org/en/measurement-units/si-defining-constants' } },
  { id: 'webb', name: 'The Webb telescope', value: '1.5 million km from the Earth', metres: 1.5e9, side: 'distance',
    note: 'The James Webb Space Telescope keeps station on the far side of the Earth from the Sun, about four times as far away as the Moon.',
    source: { label: 'NASA, Webb’s orbit', url: 'https://science.nasa.gov/mission/webb/orbit/' } },
  { id: 'heliopause', name: 'The edge of the Sun’s wind', value: '121 au from the Sun', metres: 121 * AU, side: 'distance',
    note: 'Where Voyager 1 left the bubble blown by the Sun and entered the thin gas between the stars, in August 2012. Voyager 2 crossed at 119 au in another direction: the edge moves in and out.',
    source: { label: 'Gurnett et al. 2013, Science 341, 1489', url: 'https://doi.org/10.1126/science.1241681' } },
  { id: 'voyager-1', name: 'Voyager 1 in November 2026', value: '172 au from the Sun', metres: 172.3 * AU, side: 'distance',
    note: 'The furthest thing people have made, launched in 1977 and still moving outward by about 3.6 au a year. This month it reaches one light day from the Earth.',
    source: { label: 'NASA/JPL Horizons, position for 10 November 2026', url: 'https://ssd.jpl.nasa.gov/horizons/' } },
  { id: 'oort-inner', name: 'The Oort cloud begins', value: 'from about 2,000 au', metres: 2000 * AU, side: 'distance', known: 'theory',
    note: 'A vast shell of icy bodies thought to surround the Sun. Nobody has seen it. It is worked out from the long-period comets that fall in from it. Its inner edge is put at between 2,000 and 5,000 au.',
    source: { label: 'NASA, Oort cloud facts', url: 'https://science.nasa.gov/solar-system/oort-cloud/facts/' } },
  { id: 'oort-outer', name: 'The Oort cloud ends', value: 'perhaps 100,000 au', metres: 1e5 * AU, side: 'distance', known: 'theory',
    note: 'The outer edge is put at anywhere from 10,000 to 100,000 au. Out here the Sun’s hold is so weak that a passing star can knock a comet loose.',
    source: { label: 'NASA, Oort cloud facts', url: 'https://science.nasa.gov/solar-system/oort-cloud/facts/' } },
  { id: 'proxima', name: 'Proxima Centauri', value: '4.2 light years', metres: 4.2465 * LY, side: 'distance',
    note: 'The nearest star to the Sun, a small red dwarf with at least one planet.',
    source: { label: 'European Southern Observatory, 24 August 2016: a planet found round the nearest star', url: 'https://www.eso.org/public/news/eso1629/' } },
  { id: 'trappist-1', name: 'TRAPPIST-1', value: 'about 40 light years', metres: 40.7 * LY, side: 'distance',
    note: 'A dim red star with seven planets about the size of the Earth.',
    source: { label: 'NASA, TRAPPIST-1', url: 'https://science.nasa.gov/exoplanets/trappist1/' } },
  { id: 'pleiades', name: 'The Pleiades', value: '444 light years', metres: 444 * LY, side: 'distance',
    note: 'The Seven Sisters, a young cluster of stars easy to see by eye on winter evenings.',
    source: { label: 'Abramson 2018, Research Notes of the AAS 2, 150 (from the Gaia satellite)', url: 'https://doi.org/10.3847/2515-5172/aada8b' } },
  { id: 'galactic-centre', name: 'The centre of the Milky Way', value: '26,700 light years', metres: 26_673 * LY, side: 'distance',
    note: 'Measured by watching a star swing round the black hole there.',
    source: { label: 'GRAVITY Collaboration 2019, Astronomy & Astrophysics 625, L10', url: 'https://doi.org/10.1051/0004-6361/201935656' } },
  { id: 'large-magellanic-cloud', name: 'The Large Magellanic Cloud', value: '162,000 light years', metres: 161_740 * LY, side: 'distance',
    note: 'A small galaxy in orbit round ours, seen by eye from the southern half of the Earth. Its distance is the first step for measuring everything further.',
    source: { label: 'Pietrzyński et al. 2019, Nature 567, 200', url: 'https://doi.org/10.1038/s41586-019-0999-4' } },
  { id: 'andromeda', name: 'The Andromeda galaxy', value: '2.5 million light years', metres: 2.5e6 * LY, side: 'distance',
    note: 'The nearest large galaxy, and the furthest thing most people can see without a telescope.',
    source: { label: 'NASA, Messier 31', url: 'https://science.nasa.gov/mission/hubble/science/explore-the-night-sky/hubble-messier-catalog/messier-31/' } },
  { id: 'm87', name: 'The galaxy M87', value: '55 million light years', metres: 5.5e7 * LY, side: 'distance',
    note: 'A giant galaxy in the Virgo cluster, the nearest big cluster of galaxies.',
    source: { label: 'European Southern Observatory, 10 April 2019: first image of a black hole', url: 'https://www.eso.org/public/news/eso1907/' } },
  { id: 'edge', name: 'The edge of what we can see', value: 'about 46 billion light years', metres: 4.65e10 * LY, side: 'distance',
    note: 'Where the matter that sent out the oldest light we receive is now. It is an edge to what we can see, not an edge to the universe.',
    source: { label: 'Gott et al. 2005, Astrophysical Journal 624, 463: A Map of the Universe', url: 'https://doi.org/10.1086/428890' } },
];
