import { moonCount, MOONS_AS_OF_TEXT } from './moon-counts';
// Hand-written editorial content for each body. Numbers that come from NASA
// fact sheets and JPL elements live in facts.json (built by scripts/build-facts.py).
// Atmosphere compositions and temperatures below are copied from the NASA NSSDC
// fact sheets (see /sources).

export type Kind = 'star' | 'terrestrial' | 'gas giant' | 'ice giant';

export interface Mission {
  year: string;
  name: string;
  agency: string;
  note: string;
}

export interface Body {
  slug: string;
  name: string;
  kind: Kind;
  order: number;
  tagline: string;
  /** Used by the 3D scene and page accent */
  color: string;
  summary: string[];
  sections: { title: string; paragraphs: string[] }[];
  atmosphere?: { gas: string; share: number; note?: string }[];
  atmosphereNote?: string;
  temps?: { label: string; value: string }[];
  keyMoons?: { name: string; note: string }[];
  rings?: string;
  missions: Mission[];
  quickFacts: string[];
  discovery: string;
  /** Rotation is retrograde (clockwise seen from above the north pole of the Sun) */
  retrograde?: boolean;
  tiltDeg: number;
}

export const bodies: Body[] = [
  {
    slug: 'sun',
    name: 'Sun',
    kind: 'star',
    order: 0,
    tagline: 'The star that holds everything else in place.',
    color: '#ffb347',
    discovery: 'Known since prehistory',
    tiltDeg: 7.25,
    summary: [
      'The Sun is a G2V star, an ordinary yellow dwarf about 4.6 billion years old. It holds 99.86 per cent of the mass of the whole solar system, and its gravity is the reason anything here orbits anything.',
      'It shines by fusing hydrogen into helium in its core, converting about four million tonnes of matter into energy every second. That energy takes thousands of years to work its way out through the star, then about eight minutes and twenty seconds to cross space to Earth.',
    ],
    sections: [
      {
        title: 'Structure',
        paragraphs: [
          'The core is where fusion happens, at roughly 15.7 million kelvin. Around it sits the radiative zone, where energy moves outward as light that is absorbed and re-emitted countless times. Above that is the convection zone, where hot plasma rises and cooler plasma sinks like water in a boiling pan.',
          'What we see as the Sun\'s surface is the photosphere, a layer only about 500 km thick with an effective temperature of 5,772 K. Above it lie the chromosphere and then the corona, which is strangely hotter than the surface, at over a million kelvin. Why is still an active research question.',
        ],
      },
      {
        title: 'Activity and the solar cycle',
        paragraphs: [
          'Sunspots are cooler, darker patches where strong magnetic fields hold back the heat. Their number rises and falls over a cycle of about 11 years, and the Sun\'s magnetic poles flip at each peak.',
          'Flares and coronal mass ejections throw charged particles into space. When they reach Earth they cause auroras and can disturb satellites, radio and power grids.',
        ],
      },
      {
        title: 'Rotation',
        paragraphs: [
          'The Sun is not solid, so it does not spin as one piece. The equator turns in about 25 days, while regions near the poles take more than 30.',
        ],
      },
    ],
    atmosphere: [
      { gas: 'Hydrogen', share: 90.965, note: 'by number of atoms' },
      { gas: 'Helium', share: 8.889, note: 'by number of atoms' },
    ],
    atmosphereNote: 'Photosphere composition. Heavier elements make up the remaining 0.15 per cent or so, mostly oxygen, carbon, neon and nitrogen.',
    temps: [
      { label: 'Core', value: '~15.7 million K' },
      { label: 'Photosphere (effective)', value: '5,772 K' },
      { label: 'Corona', value: '> 1 million K' },
    ],
    missions: [
      { year: '1990', name: 'Ulysses', agency: 'ESA / NASA', note: 'First spacecraft to fly over the Sun\'s poles.' },
      { year: '1995', name: 'SOHO', agency: 'ESA / NASA', note: 'Continuous observation from the point between the Sun and Earth. Still operating.' },
      { year: '2010', name: 'Solar Dynamics Observatory', agency: 'NASA', note: 'High-resolution images of the Sun every few seconds.' },
      { year: '2018', name: 'Parker Solar Probe', agency: 'NASA', note: 'Flies through the corona. The closest any spacecraft has been to the Sun.' },
      { year: '2020', name: 'Solar Orbiter', agency: 'ESA / NASA', note: 'Views the Sun\'s polar regions from an inclined orbit.' },
    ],
    quickFacts: [
      'About 1.3 million Earths would fit inside it.',
      'Light from the Sun takes about 499 seconds to reach Earth.',
      'It is roughly halfway through its life as a hydrogen-burning star.',
    ],
  },
  {
    slug: 'mercury',
    name: 'Mercury',
    kind: 'terrestrial',
    order: 1,
    tagline: 'Small, fast and cooked on one side.',
    color: '#9a948b',
    discovery: 'Known since antiquity',
    tiltDeg: 0.03,
    summary: [
      'Mercury is the smallest planet and the closest to the Sun. It races round in 88 days, which is why the Romans named it after their messenger god.',
      'It looks a lot like the Moon: grey, heavily cratered and airless. Yet it is much denser than the Moon, because it carries an unusually large metal core that makes up most of its radius.',
    ],
    sections: [
      {
        title: 'A very strange day',
        paragraphs: [
          'Mercury turns three times for every two orbits of the Sun. This 3:2 spin-orbit resonance means one sunrise to the next takes about 176 Earth days, twice as long as its year. A traveller on the surface would see the Sun slow, stop and briefly move backwards in the sky near perihelion.',
        ],
      },
      {
        title: 'Heat and ice',
        paragraphs: [
          'With almost no atmosphere to hold heat, the surface swings from around 430 °C in daylight to about -180 °C at night. Yet radar and MESSENGER found water ice inside craters near the poles that never see sunlight, where it is cold enough to survive.',
        ],
      },
      {
        title: 'A shrinking world',
        paragraphs: [
          'As Mercury\'s big iron core cooled, the whole planet contracted. The crust wrinkled into long cliffs called lobate scarps, some hundreds of kilometres long and up to a few kilometres high.',
          'The Caloris Basin, an impact scar about 1,550 km across, is one of the largest in the solar system.',
        ],
      },
    ],
    atmosphereNote: 'Not a true atmosphere but an exosphere: a thin cloud of atoms blasted off the surface by sunlight and the solar wind. NASA lists sodium, magnesium, oxygen, hydrogen, potassium, calcium and iron, with surface pressure below about 5 x 10^-15 bar.',
    temps: [
      { label: 'Daytime surface', value: 'about 430 °C' },
      { label: 'Night surface', value: 'about -180 °C' },
      { label: 'Mean', value: '167 °C' },
    ],
    missions: [
      { year: '1974-75', name: 'Mariner 10', agency: 'NASA', note: 'First visit, three flybys. Mapped about 45 per cent of the surface.' },
      { year: '2011-15', name: 'MESSENGER', agency: 'NASA', note: 'First spacecraft to orbit Mercury. Mapped the whole planet and found polar ice.' },
      { year: '2018', name: 'BepiColombo', agency: 'ESA / JAXA', note: 'Two orbiters launched together. Due to arrive at Mercury in late 2026.' },
    ],
    quickFacts: [
      'A year is shorter than two of its own days.',
      'It has no moons and no rings.',
      'Its core is thought to be around 85 per cent of its radius.',
    ],
  },
  {
    slug: 'venus',
    name: 'Venus',
    kind: 'terrestrial',
    order: 2,
    tagline: 'Earth\'s twin in size, and a furnace in every other way.',
    color: '#e3b778',
    discovery: 'Known since antiquity',
    tiltDeg: 177.36,
    retrograde: true,
    summary: [
      'Venus is almost the same size and mass as Earth, but it took the opposite path. A runaway greenhouse effect has left it with the hottest surface of any planet, hotter than Mercury even though it is nearly twice as far from the Sun.',
      'Thick clouds of sulphuric acid hide the surface from view. Only radar can see through them.',
    ],
    sections: [
      {
        title: 'The crushing atmosphere',
        paragraphs: [
          'The surface pressure is about 92 bar, the same as being roughly 900 metres under the sea on Earth. The air is 96.5 per cent carbon dioxide, which traps heat so well that the surface stays near 464 °C day and night, hot enough to melt lead.',
          'The yellowish clouds sit some 50 to 70 km up and are made of sulphuric acid droplets. They whip around the planet in about four Earth days, far faster than the planet itself turns.',
        ],
      },
      {
        title: 'Backwards and slow',
        paragraphs: [
          'Venus rotates in the opposite direction to most planets, taking about 243 Earth days to turn once. That is longer than its 225-day year. Because of the retrograde spin, the Sun rises in the west there.',
        ],
      },
      {
        title: 'Surface',
        paragraphs: [
          'Radar from Magellan showed a young surface, mostly volcanic plains with thousands of volcanoes and very few impact craters. It suggests much of the planet was resurfaced a few hundred million years ago. Whether Venus is volcanically active today is still being studied.',
        ],
      },
    ],
    atmosphere: [
      { gas: 'Carbon dioxide', share: 96.5 },
      { gas: 'Nitrogen', share: 3.5 },
    ],
    atmosphereNote: 'Near the surface, by volume. Trace gases include sulphur dioxide (150 ppm), argon (70 ppm) and water vapour (20 ppm).',
    temps: [
      { label: 'Surface', value: '464 °C' },
      { label: 'Surface pressure', value: '92 bar' },
    ],
    missions: [
      { year: '1962', name: 'Mariner 2', agency: 'NASA', note: 'First successful flyby of another planet.' },
      { year: '1970', name: 'Venera 7', agency: 'USSR', note: 'First spacecraft to transmit from the surface of another planet.' },
      { year: '1975', name: 'Venera 9', agency: 'USSR', note: 'First images from the surface of Venus.' },
      { year: '1990-94', name: 'Magellan', agency: 'NASA', note: 'Radar-mapped almost the entire surface.' },
      { year: '2015', name: 'Akatsuki', agency: 'JAXA', note: 'Studies the atmosphere and winds from orbit.' },
    ],
    quickFacts: [
      'It is the brightest planet in our sky.',
      'A day there lasts longer than a year.',
      'It has no moons and no rings.',
    ],
  },
  {
    slug: 'earth',
    name: 'Earth',
    kind: 'terrestrial',
    order: 3,
    tagline: 'The only place we know of with life.',
    color: '#4a86c5',
    discovery: 'Home',
    tiltDeg: 23.44,
    summary: [
      'Earth is the largest of the four rocky planets and the only one with liquid water oceans on its surface. Water covers about 71 per cent of it.',
      'Its atmosphere, magnetic field, plate tectonics and large Moon all work together to keep conditions stable, which is part of why life has been able to persist here for billions of years.',
    ],
    sections: [
      {
        title: 'Seasons and the Moon',
        paragraphs: [
          'Earth\'s axis is tilted by 23.44 degrees, which is what gives us seasons. The tilt is kept steady by the Moon, whose gravity stops the axis from wobbling wildly over long periods.',
          'The Moon is unusually big compared to its planet. The leading explanation is that a Mars-sized body hit the young Earth and the debris formed the Moon.',
        ],
      },
      {
        title: 'Air and oceans',
        paragraphs: [
          'The air is 78 per cent nitrogen and 21 per cent oxygen. The oxygen is there because of life: photosynthesis put it there over billions of years. Carbon dioxide is only about 420 parts per million but has an outsized effect on temperature.',
        ],
      },
      {
        title: 'A shifting surface',
        paragraphs: [
          'The crust is broken into plates that move a few centimetres a year. Their collisions build mountains and trigger earthquakes and volcanoes, while old crust is recycled back into the interior. No other planet we know of does this.',
        ],
      },
    ],
    atmosphere: [
      { gas: 'Nitrogen', share: 78.08 },
      { gas: 'Oxygen', share: 20.95 },
      { gas: 'Argon', share: 0.934 },
    ],
    atmosphereNote: 'Dry air, by volume. Carbon dioxide is about 420 ppm. Water vapour varies but is typically around 1 per cent.',
    temps: [
      { label: 'Mean surface', value: '15 °C' },
      { label: 'Surface pressure', value: '1.014 bar' },
    ],
    keyMoons: [{ name: 'Moon', note: 'The fifth largest moon in the solar system. About a quarter of Earth\'s diameter.' }],
    missions: [
      { year: '1957', name: 'Sputnik 1', agency: 'USSR', note: 'First artificial satellite.' },
      { year: '1972', name: 'Landsat 1', agency: 'NASA', note: 'Start of continuous satellite imaging of Earth\'s land.' },
      { year: '1999', name: 'Terra', agency: 'NASA', note: 'Flagship Earth-observing satellite measuring land, ocean and atmosphere.' },
    ],
    quickFacts: [
      'The only planet whose name does not come from a god.',
      'The fastest-spinning rocky planet at 23 hours 56 minutes per turn.',
      'It has one moon.',
    ],
  },
  {
    slug: 'mars',
    name: 'Mars',
    kind: 'terrestrial',
    order: 4,
    tagline: 'A cold desert that used to have water.',
    color: '#c1583a',
    discovery: 'Known since prehistory',
    tiltDeg: 25.19,
    summary: [
      'Mars is about half the diameter of Earth. Iron oxide in its dust gives it the rusty colour that earned it the name of the red planet.',
      'It has the tallest volcano and the largest canyon we know of, polar ice caps and seasons. Orbiters and rovers have found clear evidence that liquid water once flowed across its surface billions of years ago.',
    ],
    sections: [
      {
        title: 'Giant landforms',
        paragraphs: [
          'Olympus Mons is a shield volcano around 22 km high, roughly two and a half times the height of Everest above sea level. Valles Marineris is a canyon system about 4,000 km long, wide enough to span the width of the United States.',
        ],
      },
      {
        title: 'Thin air',
        paragraphs: [
          'The atmosphere is 95 per cent carbon dioxide but very thin, with a surface pressure of about 6 millibars, less than 1 per cent of Earth\'s. That is too low for liquid water to stay stable on the surface for long, and too thin to keep the planet warm.',
          'Dust storms can grow big enough to cover the entire planet for weeks.',
        ],
      },
      {
        title: 'Ancient water',
        paragraphs: [
          'Dry river valleys, delta deposits and minerals that form only in water show that Mars was once much wetter and probably warmer. Today water survives mostly as ice at the poles and underground.',
        ],
      },
      {
        title: 'Two small moons',
        paragraphs: [
          'Phobos and Deimos are small, lumpy and dark. Phobos orbits so close that it circles Mars three times a day, and is slowly spiralling inwards.',
        ],
      },
    ],
    atmosphere: [
      { gas: 'Carbon dioxide', share: 95.1 },
      { gas: 'Nitrogen', share: 2.59 },
      { gas: 'Argon', share: 1.94 },
      { gas: 'Oxygen', share: 0.16 },
    ],
    atmosphereNote: 'By volume. Carbon monoxide 0.06 per cent. Surface pressure about 6.4 millibars.',
    temps: [
      { label: 'Mean', value: '-59 °C' },
      { label: 'Typical daily range', value: '-89 to -31 °C (Viking 1 site)' },
    ],
    keyMoons: [
      { name: 'Phobos', note: 'About 22 km across. Orbits in just over 7.5 hours.' },
      { name: 'Deimos', note: 'About 12 km across. Orbits in about 30 hours.' },
    ],
    missions: [
      { year: '1965', name: 'Mariner 4', agency: 'NASA', note: 'First close images of Mars.' },
      { year: '1976', name: 'Viking 1 and 2', agency: 'NASA', note: 'First landers to operate for long on the surface.' },
      { year: '1997', name: 'Pathfinder and Sojourner', agency: 'NASA', note: 'First rover on Mars.' },
      { year: '2004', name: 'Spirit and Opportunity', agency: 'NASA', note: 'Twin rovers that found evidence of past water.' },
      { year: '2012', name: 'Curiosity', agency: 'NASA', note: 'Found an ancient lakebed environment in Gale crater. Still operating.' },
      { year: '2021', name: 'Perseverance and Ingenuity', agency: 'NASA', note: 'Collecting rock samples. Ingenuity made the first powered flights on another planet.' },
      { year: '2021', name: 'Tianwen-1 and Hope', agency: 'CNSA / UAE', note: 'China\'s orbiter and Zhurong rover; the UAE\'s Hope orbiter.' },
    ],
    quickFacts: [
      'A day (sol) is 24 hours 39 minutes.',
      'A year lasts about 687 Earth days.',
      'Gravity is 38 per cent of Earth\'s.',
    ],
  },
  {
    slug: 'jupiter',
    name: 'Jupiter',
    kind: 'gas giant',
    order: 5,
    tagline: 'More massive than all the other planets put together.',
    color: '#c99b6d',
    discovery: 'Known since prehistory',
    tiltDeg: 3.13,
    summary: [
      'Jupiter is the largest planet by far. It has about two and a half times the mass of all the other planets combined, and more than 1,300 Earths could fit inside it.',
      'It is a ball of hydrogen and helium with no solid surface. Deeper down, the pressure turns hydrogen into a liquid metal, which is thought to generate its powerful magnetic field.',
    ],
    sections: [
      {
        title: 'Bands and storms',
        paragraphs: [
          'Fast rotation, a day of under ten hours, stretches the clouds into bright zones and darker belts. Winds in them reach about 150 m/s.',
          'The Great Red Spot is a storm wider than Earth that has been observed for well over a century and is slowly shrinking.',
        ],
      },
      {
        title: 'A miniature solar system',
        paragraphs: [
          `Jupiter has ${moonCount('jupiter')} known moons in JPL's list as of ${MOONS_AS_OF_TEXT}, and the number keeps growing as smaller ones are found. The four large Galilean moons, discovered by Galileo in 1610, are worlds in their own right.`,
          'Io is the most volcanic body known. Europa hides a salty ocean under its ice shell. Ganymede is the largest moon in the solar system, bigger than Mercury, and has its own magnetic field. Callisto is an ancient cratered ball of rock and ice.',
        ],
      },
      {
        title: 'Radiation and rings',
        paragraphs: [
          'Jupiter\'s magnetic field traps intense radiation, dangerous to both spacecraft and any future visitors. It also has a faint, dusty ring system.',
        ],
      },
    ],
    atmosphere: [
      { gas: 'Hydrogen (H2)', share: 89.8 },
      { gas: 'Helium', share: 10.2 },
    ],
    atmosphereNote: 'By volume, with an uncertainty of 2 per cent each. Minor: methane 3,000 ppm, ammonia 260 ppm. Clouds of ammonia ice, water ice and ammonium hydrosulphide.',
    temps: [
      { label: 'At 1 bar level', value: '-108 °C (165 K)' },
      { label: 'At 0.1 bar', value: '-161 °C (112 K)' },
    ],
    keyMoons: [
      { name: 'Io', note: 'Hundreds of active volcanoes, heated by tides from Jupiter.' },
      { name: 'Europa', note: 'Subsurface ocean beneath an icy crust.' },
      { name: 'Ganymede', note: 'Largest moon in the solar system.' },
      { name: 'Callisto', note: 'Heavily cratered and very old.' },
    ],
    rings: 'A faint ring system made of dust, mostly knocked off the small inner moons by meteoroid impacts.',
    missions: [
      { year: '1973', name: 'Pioneer 10', agency: 'NASA', note: 'First spacecraft to fly past Jupiter.' },
      { year: '1979', name: 'Voyager 1 and 2', agency: 'NASA', note: 'Discovered Jupiter\'s rings and Io\'s volcanoes.' },
      { year: '1995-2003', name: 'Galileo', agency: 'NASA', note: 'First orbiter, and dropped a probe into the atmosphere.' },
      { year: '2016', name: 'Juno', agency: 'NASA', note: 'Polar orbiter studying the interior, magnetic field and storms.' },
      { year: '2023-24', name: 'JUICE and Europa Clipper', agency: 'ESA / NASA', note: 'Both launched to study the icy moons. They arrive in the 2030s.' },
    ],
    quickFacts: [
      'Its day is the shortest of any planet, about 9 hours 56 minutes.',
      'It gives off more heat than it receives from the Sun.',
      'One orbit of the Sun takes almost 12 Earth years.',
    ],
  },
  {
    slug: 'saturn',
    name: 'Saturn',
    kind: 'gas giant',
    order: 6,
    tagline: 'The ringed planet, light enough to float on water.',
    color: '#e0c48f',
    discovery: 'Known since prehistory',
    tiltDeg: 26.73,
    summary: [
      'Saturn is the second largest planet and the least dense. Its average density is below that of water, so in a big enough bath it would float.',
      'Its rings are the biggest and brightest in the solar system. They stretch hundreds of thousands of kilometres across yet are mostly only about ten metres thick.',
    ],
    sections: [
      {
        title: 'The rings',
        paragraphs: [
          'The rings are billions of pieces of mostly water ice, from dust grains to boulders the size of houses. They are named alphabetically in the order they were found, so the main bright ones are A, B and C.',
          'Their age is debated. Some measurements suggest they are young, perhaps only a few hundred million years old, while other work points to a much older origin.',
        ],
      },
      {
        title: 'A hexagon at the pole',
        paragraphs: [
          'A six-sided jet stream circles Saturn\'s north pole. Each side is wider than Earth. There is a huge storm at each pole too.',
        ],
      },
      {
        title: 'Moons',
        paragraphs: [
          `JPL lists ${moonCount('saturn')} moons for Saturn as of ${MOONS_AS_OF_TEXT}, the most of any planet. Titan is larger than Mercury and the only moon with a dense atmosphere. Its lakes and seas are made of liquid methane and ethane.`,
          'Enceladus sprays water from cracks near its south pole, giving direct evidence of a subsurface ocean.',
        ],
      },
    ],
    atmosphere: [
      { gas: 'Hydrogen (H2)', share: 96.3 },
      { gas: 'Helium', share: 3.25 },
    ],
    atmosphereNote: 'By volume, uncertainty about 2.4 per cent each. Minor: methane 4,500 ppm, ammonia 125 ppm.',
    temps: [
      { label: 'At 1 bar level', value: '-139 °C (134 K)' },
      { label: 'At 0.1 bar', value: '-189 °C (84 K)' },
    ],
    keyMoons: [
      { name: 'Titan', note: 'Thick nitrogen atmosphere, methane lakes. Larger than Mercury.' },
      { name: 'Enceladus', note: 'Water plumes from a subsurface ocean.' },
      { name: 'Mimas', note: 'Has a giant crater that makes it look like the Death Star.' },
      { name: 'Iapetus', note: 'Two-toned: one side dark, one side bright.' },
    ],
    rings: 'Main rings A, B and C, plus the thin Cassini Division gap between A and B, and fainter outer rings including one fed by Enceladus.',
    missions: [
      { year: '1979', name: 'Pioneer 11', agency: 'NASA', note: 'First flyby.' },
      { year: '1980-81', name: 'Voyager 1 and 2', agency: 'NASA', note: 'Detailed images of the rings and moons.' },
      { year: '2004-17', name: 'Cassini-Huygens', agency: 'NASA / ESA / ASI', note: 'Thirteen years in orbit. The Huygens probe landed on Titan in January 2005.' },
      { year: 'planned', name: 'Dragonfly', agency: 'NASA', note: 'A rotorcraft lander planned for Titan, with launch scheduled for 2028.' },
    ],
    quickFacts: [
      'Winds reach about 400 m/s near the equator.',
      'A day is about 10 hours 33 minutes.',
      'One orbit takes nearly 29.5 Earth years.',
    ],
  },
  {
    slug: 'uranus',
    name: 'Uranus',
    kind: 'ice giant',
    order: 7,
    tagline: 'The planet that rolls on its side.',
    color: '#8fd1d6',
    discovery: 'William Herschel, 13 March 1781',
    tiltDeg: 97.77,
    retrograde: true,
    summary: [
      'Uranus was the first planet found with a telescope. William Herschel spotted it in 1781 and at first thought it was a comet.',
      'It is an ice giant: mostly water, ammonia and methane ices wrapped in a thick hydrogen and helium atmosphere. Methane absorbs red light, which gives the planet its pale blue-green colour.',
    ],
    sections: [
      {
        title: 'Tipped on its side',
        paragraphs: [
          'Uranus\'s axis is tilted by nearly 98 degrees, so it effectively rolls around the Sun. Each pole gets about 42 years of continuous sunlight followed by 42 years of darkness. The most likely cause is a giant collision early in its history.',
        ],
      },
      {
        title: 'Cold and quiet',
        paragraphs: [
          'Uranus is the coldest planetary atmosphere measured, with a temperature near 53 K at the 0.1 bar level. Unlike the other giants, it gives off hardly any internal heat. From Voyager 2\'s flyby in 1986 it looked almost featureless, though telescopes have since found seasonal storms.',
        ],
      },
      {
        title: 'Rings and moons',
        paragraphs: [
          `There are 13 known rings, narrow and dark. JPL lists ${moonCount('uranus')} moons as of ${MOONS_AS_OF_TEXT}, named mostly after characters from Shakespeare and Pope rather than from mythology. The five largest are Miranda, Ariel, Umbriel, Titania and Oberon.`,
        ],
      },
    ],
    atmosphere: [
      { gas: 'Hydrogen (H2)', share: 82.5 },
      { gas: 'Helium', share: 15.2 },
      { gas: 'Methane', share: 2.3 },
    ],
    atmosphereNote: 'By volume, uncertainty about 3.3 per cent for H2 and He.',
    temps: [
      { label: 'At 1 bar level', value: '-197 °C (76 K)' },
      { label: 'At 0.1 bar', value: '-220 °C (53 K)' },
    ],
    keyMoons: [
      { name: 'Miranda', note: 'A patchwork of cliffs and grooves, with a cliff up to about 20 km high.' },
      { name: 'Titania', note: 'The largest moon of Uranus.' },
      { name: 'Oberon', note: 'Old, heavily cratered surface.' },
    ],
    rings: '13 known rings, narrow and very dark. The brightest is called the epsilon ring.',
    missions: [
      { year: '1986', name: 'Voyager 2', agency: 'NASA', note: 'The only spacecraft ever to visit Uranus. Found 10 new moons.' },
    ],
    quickFacts: [
      'A year lasts about 84 Earth years.',
      'It rotates backwards compared with most planets.',
      'It has never had a dedicated orbiter.',
    ],
  },
  {
    slug: 'neptune',
    name: 'Neptune',
    kind: 'ice giant',
    order: 8,
    tagline: 'The farthest planet, found by maths before sight.',
    color: '#4166d5',
    discovery: 'Galle and d\'Arrest, 23 September 1846, from predictions by Le Verrier',
    tiltDeg: 28.32,
    summary: [
      'Neptune is the eighth and most distant planet, 30 times farther from the Sun than Earth. Sunlight there is about a thousand times dimmer than at Earth.',
      'Astronomers worked out that it must exist by studying small irregularities in the orbit of Uranus. Urbain Le Verrier calculated where to look, and Johann Galle found it within one degree of that spot.',
    ],
    sections: [
      {
        title: 'Fast winds',
        paragraphs: [
          'Neptune has the fastest winds of any planet, up to about 580 m/s, more than 2,000 km/h. That is supersonic by Earth standards. It is a surprise given how little sunlight reaches it: the planet generates substantial heat from inside.',
          'Voyager 2 saw a Great Dark Spot in 1989, but when Hubble looked later it had vanished and others appeared elsewhere.',
        ],
      },
      {
        title: 'Triton',
        paragraphs: [
          'Neptune\'s largest moon orbits backwards, against the direction the planet turns. That strongly suggests Triton was a Kuiper Belt object captured by Neptune. Voyager 2 spotted geysers of nitrogen on its frozen surface.',
        ],
      },
      {
        title: 'Rings',
        paragraphs: [
          'Neptune has five main rings, named after astronomers involved in its discovery. The outermost, Adams, contains bright clumps of material called arcs.',
        ],
      },
    ],
    atmosphere: [
      { gas: 'Hydrogen (H2)', share: 80.0 },
      { gas: 'Helium', share: 19.0 },
      { gas: 'Methane', share: 1.5 },
    ],
    atmosphereNote: 'By volume. Uncertainty about 3.2 per cent for H2 and He, 0.5 per cent for methane.',
    temps: [
      { label: 'At 1 bar level', value: '-201 °C (72 K)' },
      { label: 'At 0.1 bar', value: '-218 °C (55 K)' },
    ],
    keyMoons: [
      { name: 'Triton', note: 'Retrograde orbit, probably a captured Kuiper Belt object. Nitrogen geysers.' },
      { name: 'Proteus', note: 'Second largest, dark and irregular.' },
      { name: 'Nereid', note: 'Has one of the most eccentric orbits of any moon.' },
    ],
    rings: 'Five main rings (Galle, Le Verrier, Lassell, Arago and Adams), faint and dusty.',
    missions: [
      { year: '1989', name: 'Voyager 2', agency: 'NASA', note: 'Only spacecraft to have visited Neptune. Flew past on 25 August.' },
    ],
    quickFacts: [
      'A year lasts about 165 Earth years. It completed its first orbit since discovery in 2011.',
      'Its day is about 16 hours.',
      'It is not visible to the naked eye.',
    ],
  },
];

export const planets = bodies.filter((b) => b.kind !== 'star');

export function getBody(slug: string) {
  return bodies.find((b) => b.slug === slug);
}
