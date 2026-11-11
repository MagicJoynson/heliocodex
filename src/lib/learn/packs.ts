/**
 * Lesson packs: everything the site has on one subject, gathered from every strand and put in the
 * order that makes it easiest to follow. A lesson can sit in more than one pack. `coming` names
 * lessons that are planned and not yet written, so a pack never pretends to be complete.
 */
export interface Pack {
  id: string;
  name: string;
  /** One or two plain sentences on what the pack covers and who it is for. */
  blurb: string;
  photo: { src: string; width: number; height: number; alt: string; caption: string };
  stages: { title: string; about: string; lessons: string[] }[];
  coming: string[];
  /** Places on the site to go and see the subject for yourself. */
  look: { href: string; text: string; about: string }[];
}

const P = '/img/learn/';
export const PACKS: Pack[] = [
  {
    id: 'start-here',
    name: 'Space in ten lessons',
    blurb: 'The shortest way round the whole subject. Ten first looks, from how big it all is to how it began, each needing nothing but curiosity.',
    photo: { src: `${P}earthrise-apollo-8.jpg`, width: 1100, height: 1100, alt: 'The blue and white Earth, half lit, above the grey horizon of the Moon.', caption: 'Earthrise: the Earth seen from the Moon by the crew of Apollo 8 on 24 December 1968. Credit: NASA / Bill Anders.' },
    stages: [
      { title: 'Where we are', about: 'The size of things, and the two ideas that explain why anything moves the way it does.', lessons: ['how-big-is-space', 'what-gravity-is', 'what-an-orbit-is'] },
      { title: 'Our own corner', about: 'The Sun and what goes round it.', lessons: ['what-the-sun-is', 'three-kinds-of-planet', 'what-a-moon-is'] },
      { title: 'The stars', about: 'What the points of light are, and what becomes of them.', lessons: ['what-a-star-is', 'how-stars-live-and-die'] },
      { title: 'Everything else', about: 'Our galaxy, and the universe it is one small part of.', lessons: ['the-milky-way', 'the-expanding-universe'] },
    ],
    coming: [],
    look: [{ href: '/', text: 'Fly through it in 3D', about: 'From the Sun out to the oldest light, with everything where it is measured to be.' }, { href: '/sky', text: 'Tonight’s sky', about: 'What is overhead where you are, right now.' }],
  },
  {
    id: 'the-night-sky',
    name: 'The sky above you',
    blurb: 'For anyone who wants to go outside and understand what they are looking at: why the sky changes, what the patterns are, and which of the lights are which.',
    photo: { src: `${P}orion-nebula-hubble.jpg`, width: 1100, height: 1100, alt: 'A great glowing cloud of pink, orange and grey gas with a bright hollow near the middle.', caption: 'The Orion Nebula, which you can see by eye as the fuzzy middle "star" of Orion’s sword. Credit: NASA, ESA, M. Robberto (STScI/ESA) and the Hubble Space Telescope Orion Treasury Project Team, CC BY 4.0.' },
    stages: [
      { title: 'Getting your bearings', about: 'How to look, how far away things are, and the units used to say so.', lessons: ['looking-up-for-yourself', 'how-big-is-space', 'measuring-distance'] },
      { title: 'What changes, and why', about: 'The night, the year, the month, and the shadows that cause eclipses.', lessons: ['why-the-sky-turns', 'the-sky-through-the-year', 'seasons', 'phases-and-eclipses', 'tides'] },
      { title: 'The stars overhead', about: 'The patterns, the colours, and what the eye can and cannot see.', lessons: ['constellations', 'the-stars-you-can-see', 'colour-and-brightness', 'star-clusters'] },
    ],
    coming: [],
    look: [{ href: '/sky', text: 'Tonight’s sky', about: 'The stars, planets and constellations over your own horizon at this moment.' }, { href: '/stars', text: 'Meet a star', about: 'A page for every star you can see without a telescope.' }],
  },
  {
    id: 'the-solar-system',
    name: 'Everything about the Solar System',
    blurb: 'The Sun and all that goes round it: planets, moons, rings, comets and the cold edge, and the rules that keep them moving.',
    photo: { src: `${P}sun-sunspots-sdo.jpg`, width: 1024, height: 990, alt: 'The whole Sun as an orange disc with a cluster of dark spots below the middle.', caption: 'The Sun in October 2014, with a group of sunspots wider than ten Earths. Credit: NASA/SDO.' },
    stages: [
      { title: 'The Sun', about: 'The star in the middle, which holds almost all of the mass.', lessons: ['what-the-sun-is', 'how-the-sun-shines', 'the-active-sun', 'the-suns-reach'] },
      { title: 'The planets', about: 'Three kinds of world, how they formed, and why their skies differ.', lessons: ['three-kinds-of-planet', 'what-counts-as-a-planet', 'the-earth-as-a-planet', 'how-the-planets-formed', 'air-and-the-greenhouse', 'rings'] },
      { title: 'The moons', about: 'More than two hundred of them, some with oceans under the ice.', lessons: ['what-a-moon-is', 'the-moon', 'ocean-moons', 'moons-in-step', 'tides', 'phases-and-eclipses'] },
      { title: 'The small things, and the edge', about: 'Asteroids, comets, falling rocks and the cloud that surrounds it all.', lessons: ['rubble-and-ice', 'comets', 'falling-rocks', 'things-that-hit-the-earth', 'the-oort-cloud'] },
      { title: 'How it all moves', about: 'Orbits, the laws they follow, and how spacecraft use them.', lessons: ['what-an-orbit-is', 'keplers-laws', 'balance-points', 'leaving-and-arriving'] },
    ],
    coming: ['Inside planets and their magnetic shields'],
    look: [{ href: '/', text: 'Fly round the planets in 3D', about: 'Every planet and moon where it is today.' }, { href: '/atlas', text: 'The atlas', about: 'Maps of the worlds that have been mapped.' }],
  },
  {
    id: 'stars',
    name: 'Everything about stars',
    blurb: 'What a star is, how to read one from its light, the stars round us, and how they are born, live and die. Start at the top and each lesson sets up the next.',
    photo: { src: `${P}omega-centauri-hubble.jpg`, width: 1100, height: 562, alt: 'A field packed with thousands of stars: many yellow-white, some bright blue, some orange and red.', caption: 'About 100,000 stars in the heart of the cluster Omega Centauri, in their real colours. Credit: NASA, ESA and the Hubble SM4 ERO Team, CC BY 4.0.' },
    stages: [
      { title: 'What a star is', about: 'Begin with the one star we can see close up.', lessons: ['what-the-sun-is', 'what-a-star-is', 'how-the-sun-shines'] },
      { title: 'Reading a star', about: 'Colour, brightness and distance: how anything is known about a point of light.', lessons: ['colour-and-brightness', 'reading-starlight', 'measuring-distance'] },
      { title: 'The stars round us', about: 'The neighbours, the ones you can see, and the company they keep.', lessons: ['the-nearest-stars', 'the-stars-you-can-see', 'double-and-multiple-stars', 'stars-that-change', 'star-clusters'] },
      { title: 'Birth, life and death', about: 'From a cold cloud to whatever is left at the end.', lessons: ['nebulae-and-star-birth', 'how-stars-live-and-die', 'supernovae', 'white-dwarfs', 'neutron-stars-and-pulsars', 'what-a-black-hole-is'] },
      { title: 'What stars leave us', about: 'Almost every atom heavier than helium was made by a star.', lessons: ['where-the-elements-come-from'] },
      { title: 'Stars as measuring sticks', about: 'How certain stars give the distances to other galaxies.', lessons: ['the-distance-ladder'] },
    ],
    coming: ['Brown dwarfs', 'Red dwarfs, the commonest stars', 'Giants and supergiants'],
    look: [{ href: '/stars', text: 'Meet a star', about: 'A page for every star you can see without a telescope, with its distance, colour and place in your sky.' }, { href: '/sky', text: 'Tonight’s sky', about: 'Find the stars from these lessons over your own horizon.' }],
  },
  {
    id: 'black-holes',
    name: 'Black holes and dead stars',
    blurb: 'What is left when a star dies, from an ember the size of the Earth to a place light cannot leave, and how we came to photograph one.',
    photo: { src: `${P}m87-black-hole-eht.jpg`, width: 1200, height: 1200, alt: 'A blurred orange ring, brighter along its lower edge, round a dark centre.', caption: 'The black hole in the galaxy M87, published on 10 April 2019. A photograph, not a drawing. Credit: EHT Collaboration, CC BY 4.0.' },
    stages: [
      { title: 'What you need first', about: 'Gravity, and why a star cannot last for ever.', lessons: ['what-gravity-is', 'how-stars-live-and-die'] },
      { title: 'How stars end', about: 'The explosion, and the three things a star can leave behind.', lessons: ['supernovae', 'white-dwarfs', 'neutron-stars-and-pulsars', 'what-a-black-hole-is'] },
      { title: 'Closer in', about: 'The edge itself, the ripples when two collide, and the giants in the middles of galaxies.', lessons: ['the-event-horizon', 'gravitational-waves', 'active-galaxies-and-quasars'] },
    ],
    coming: ['Magnetars and gamma-ray bursts', 'Do black holes last for ever?'],
    look: [{ href: '/?go=milky-way', text: 'Fly out to the Milky Way', about: 'Our own giant black hole sits at its centre, 27,000 light years from here.' }],
  },
  {
    id: 'gravity',
    name: 'Gravity and getting about',
    blurb: 'One rule that covers a dropped ball, the Moon, the tides and every spacecraft ever flown.',
    photo: { src: `${P}iss-over-earth.jpg`, width: 1100, height: 728, alt: 'The International Space Station, with its long solar panels, above the blue and white Earth.', caption: 'The International Space Station, falling round the Earth once every 93 minutes. Credit: NASA.' },
    stages: [
      { title: 'The idea', about: 'What gravity is, and why an orbit is a fall that never lands.', lessons: ['what-gravity-is', 'what-an-orbit-is', 'keplers-laws'] },
      { title: 'What it does', about: 'Tides, moons kept in step, and places where pulls balance.', lessons: ['tides', 'moons-in-step', 'balance-points'] },
      { title: 'Using it, and its limits', about: 'How spacecraft travel, and what happens when gravity itself makes waves.', lessons: ['leaving-and-arriving', 'gravitational-waves'] },
      { title: 'Einstein\u2019s picture', about: 'Why time and space depend on how you move, and what that does to gravity.', lessons: ['space-and-time-are-not-fixed', 'gravity-as-bent-space-and-time', 'gravity-as-a-lens'] },
    ],
    coming: ['How a rocket works'],
    look: [{ href: '/', text: 'Watch the orbits in 3D', about: 'Every planet and moon moving under the rule these lessons describe.' }],
  },
  {
    id: 'light',
    name: 'Light, and how we know',
    blurb: 'Almost everything known about space was learnt from light alone. These lessons show how much a beam of it can tell you.',
    photo: { src: `${P}antares-surface-vlti.jpg`, width: 1100, height: 1100, alt: 'A blurred orange disc with brighter and darker patches, on black.', caption: 'The face of another star: Antares, 550 light years away, built up from four telescopes working as one. Credit: ESO/K. Ohnaka, CC BY 4.0.' },
    stages: [
      { title: 'What light carries', about: 'The only messenger we have from almost everywhere.', lessons: ['light-the-only-messenger', 'the-whole-spectrum'] },
      { title: 'Reading it', about: 'Temperature, make-up and motion, all from colour.', lessons: ['colour-and-brightness', 'reading-starlight'] },
      { title: 'Gathering it, and measuring with it', about: 'Telescopes, and the chain of methods that gives distances.', lessons: ['telescopes', 'measuring-distance', 'the-distance-ladder'] },
      { title: 'Beyond light', about: 'Particles and ripples that bring news light cannot.', lessons: ['messengers-other-than-light'] },
    ],
    coming: ['Telescopes in space', 'Redshift and the Doppler effect'],
    look: [{ href: '/sources', text: 'Where the pictures come from', about: 'Every photograph on the site, with who took it and how.' }],
  },
  {
    id: 'galaxies-and-the-universe',
    name: 'Galaxies and the universe',
    blurb: 'From our own galaxy outward to the largest structures there are, and back in time to the first few minutes.',
    photo: { src: `${P}m87-jet-hubble.jpg`, width: 1222, height: 1276, alt: 'A bright yellow galaxy centre with a narrow, knotted blue streak pointing away from it.', caption: 'The centre of the galaxy M87 and the jet thrown out from beside its black hole. Credit: The Hubble Heritage Team (STScI/AURA) and NASA/ESA, CC BY 4.0.' },
    stages: [
      { title: 'Our galaxy and the others', about: 'The Milky Way from inside, and the kinds of galaxy there are.', lessons: ['the-milky-way', 'the-centre-of-the-galaxy', 'kinds-of-galaxy', 'when-galaxies-collide', 'active-galaxies-and-quasars'] },
      { title: 'The biggest picture', about: 'How galaxies are spread through space, and how their distances are found.', lessons: ['the-distance-ladder', 'the-cosmic-web'] },
      { title: 'The universe itself', about: 'Its expansion, its first minutes, and the two things in it nobody has yet explained.', lessons: ['the-expanding-universe', 'the-first-minutes', 'dark-matter-and-dark-energy'] },
    ],
    coming: ['The stuff between the stars', 'Spiral arms', 'How galaxies form and change', 'Galaxy clusters', 'How we know there was a Big Bang', 'The history of the universe on one timeline', 'How it ends', 'How big is the universe'],
    look: [{ href: '/?go=cosmic-web', text: 'Fly out to the cosmic web', about: 'About 43,000 real galaxies, each where it was measured to be.' }],
  },
  {
    id: 'other-worlds-and-life',
    name: 'Other worlds and life',
    blurb: 'Planets round other stars, the places nearer home where there may be water, and the oldest question of all.',
    photo: { src: `${P}pale-blue-dot-voyager.jpg`, width: 1100, height: 1088, alt: 'A dark picture crossed by faint bands of light, with one tiny pale speck in the right-hand band.', caption: 'The only world known to have life, from 6 billion km away: the pale speck in the right-hand band of light. Voyager 1, 14 February 1990. Credit: NASA/JPL-Caltech.' },
    stages: [
      { title: 'Worlds round other stars', about: 'How they are found, and one system with seven of them.', lessons: ['planets-round-other-stars', 'how-planets-are-found', 'the-kinds-of-planet-out-there', 'trappist-1'] },
      { title: 'What makes a world fit to live on', about: 'Air, warmth and water, here and on the moons of the giant planets.', lessons: ['air-and-the-greenhouse', 'ocean-moons'] },
      { title: 'The question', about: 'What is known, what is not, and how people are looking.', lessons: ['are-we-alone'] },
    ],
    coming: ['The habitable zone', 'What life needs', 'Looking for life in the Solar System', 'Listening for someone else'],
    look: [{ href: '/?go=neighbourhood', text: 'Fly out among the nearest stars', about: 'The Sun\u2019s neighbours, each where it was measured to be. Many are now known to have planets.' }],
  },
];

export const packLessons = (pack: Pack) => pack.stages.flatMap((s) => s.lessons);
/** The packs a lesson belongs to, with its place in each and its neighbours there. */
export function packsOf(lesson: string): { pack: Pack; place: number; of: number; before: string | null; after: string | null }[] {
  return PACKS.flatMap((pack) => {
    const all = packLessons(pack), i = all.indexOf(lesson);
    return i < 0 ? [] : [{ pack, place: i + 1, of: all.length, before: all[i - 1] ?? null, after: all[i + 1] ?? null }];
  });
}
