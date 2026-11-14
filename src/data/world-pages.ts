// Full pages for worlds that began as outlines. Each chapter matches a heading in CHAPTERS (src/lib/worlds.ts).
// Every figure is from the sources listed with it. Counts carry their date. No first person.
export interface WorldPage {
  /** One sentence under the name. */
  lead: string;
  /** Only where a figure is published for it. */
  temperature?: { value: string; note: string };
  /** The lead picture. Where it is a close view, `globe` (the whole world) leads and this moves into the first chapter. */
  picture: { src: string; alt: string; caption: string; width: number; height: number };
  globe?: { src: string; alt: string; caption: string; width: number; height: number };
  chapters: { title: string; paras: string[] }[];
  sources: { label: string; url: string }[];
}

export const WORLD_PAGES: Record<string, WorldPage> = {
  titan: {
    lead: 'Saturn’s largest moon, the only moon with thick air, and the only world besides the Earth known to have rain, rivers and seas on its surface.',
    temperature: { value: '−179 °C', note: 'At the ground, measured by the Huygens probe in 2005.' },
    globe: {
      src: '/img/learn/titan-cassini-2012.jpg', width: 900, height: 900,
      alt: 'A smooth, hazy orange ball with a darker cap of haze at the top and a faint blue rim.',
      caption: '<b>A photograph.</b> Titan in natural colour, from NASA’s Cassini spacecraft, released in April 2012. The haze hides the ground; the darker cap at the top is a hood of haze over the north pole. Credit: NASA/JPL-Caltech/Space Science Institute.',
    },
    picture: {
      src: '/img/learn/titan-infrared-cassini-2015.jpg', width: 900, height: 900,
      alt: 'A sea-green globe with soft dark bands across its middle, forming a sideways letter H, and a few sharper rectangular patches near its left edge.',
      caption: '<b>A real picture, in infrared.</b> Titan seen through its haze by NASA’s Cassini spacecraft on 13 November 2015. Infrared light passes through the haze that hides the ground in ordinary light. The dark bands are fields of dunes, and the sharper patches are parts seen from closer. The colours were chosen, each standing for one wavelength of infrared. Credit: NASA/JPL/University of Arizona/University of Idaho.',
    },
    chapters: [
      { title: 'What it looks like up close', paras: [
        'From outside, Titan is a featureless orange ball. Its air is thick with a haze of carbon-rich dust that hides the ground completely in ordinary light. The Cassini spacecraft saw through it with radar and with infrared cameras, and found a world that looks surprisingly like the Earth: dunes, river channels, lakes and seas, mountains and plains.',
        'The dunes circle the moon near its equator. They are made of dark grains of carbon-rich material that settled out of the haze, and the biggest stand about 100 metres high. Near the north pole lie the seas. The largest, Kraken Mare, is bigger than the Caspian Sea. The next, Ligeia Mare, is bigger than Lake Superior.',
        'The seas hold no water. At about −179 °C, water on Titan is rock-hard ice, and the liquid is methane and ethane, the gases that make up natural gas on the Earth. On Titan they fall as rain, run in rivers and collect in lakes, much as water does here.',
      ] },
      { title: 'What it is made of', paras: [
        'Titan is 5,150 km across, the second-largest moon in the Solar System and wider than the planet Mercury. Its density, 1.88 times that of water, says it is roughly half rock and half ice.',
        'It is the only moon with thick air. The pressure at the ground is about one and a half times the pressure at sea level on the Earth, and the air is mostly nitrogen, like ours, with a few per cent of methane. Because the air is so thick and the gravity so weak, a person could fly there by flapping wings strapped to their arms.',
        'Under the ice there is probably an ocean of salty water. Cassini measured how much Titan flexes as it goes round Saturn on its slightly oval path. It flexes far more than a solid ball of ice and rock would, which points to a liquid layer deep inside.',
      ] },
      { title: 'How it was found', paras: [
        'The Dutch astronomer Christiaan Huygens found Titan on 25 March 1655, with a telescope he had built himself. It was the first moon found going round Saturn, and only the sixth moon known after our own Moon and Jupiter’s four big ones.',
        'Huygens simply called it Saturn’s moon. The name Titan was suggested in 1847 by the astronomer John Herschel, after the giants of Greek myth who were the brothers and sisters of Saturn, or Cronus.',
      ] },
      { title: 'Spacecraft that have seen it', paras: [
        'Pioneer 11 passed in 1979 and Voyager 1 in November 1980. Voyager 1 flew close, but its cameras saw nothing but haze.',
        'The Cassini spacecraft went into orbit round Saturn in 2004 and stayed until 2017, flying past Titan 127 times on purpose. It carried the European Space Agency’s Huygens probe, which parachuted through Titan’s air on 14 January 2005 and landed on a damp plain of rounded pebbles, which it photographed. Its pictures are on ESA’s Huygens pages, linked in the sources below. It was the first landing on any world in the outer Solar System, and it is still the most distant.',
        'NASA plans to send Dragonfly, a flying robot the size of a car, with eight rotors. Its launch is planned for 2028 and its arrival for 2034. It is to hop from place to place, sampling the ground.',
      ] },
      { title: 'What is still unknown', paras: [
        'Sunlight breaks methane down. At the rate it is destroyed, Titan’s methane should all be gone within a few tens of millions of years, a short time for a world 4.5 billion years old. Something must be topping it up, perhaps gas escaping from inside, but nobody knows what.',
        'Nor is it known how deep the ocean is, what is dissolved in it, or whether the rich chemistry of the surface ever mixes with it. Titan is one of the few places where the raw materials for life, carbon compounds and liquid water, may both be present.',
      ] },
    ],
    sources: [
      { label: 'NASA, Titan', url: 'https://science.nasa.gov/saturn/moons/titan/' },
      { label: 'ESA, Huygens', url: 'https://www.esa.int/Science_Exploration/Space_Science/Cassini-Huygens' },
      { label: 'NASA, Dragonfly', url: 'https://science.nasa.gov/mission/dragonfly/' },
      { label: 'Wikipedia, Titan (moon)', url: 'https://en.wikipedia.org/wiki/Titan_(moon)' },
    ],
  },

  europa: {
    lead: 'An ice-covered moon of Jupiter with a salty ocean underneath, holding about twice as much water as all the Earth’s oceans.',
    temperature: { value: '−160 °C', note: 'The warmest it gets, at the equator. The poles are colder.' },
    picture: {
      src: '/img/learn/europa-galileo.jpg', width: 1100, height: 1488,
      alt: 'Half of a pale blue-white globe criss-crossed by long rust-brown lines and blotches, fading into shadow on the right.',
      caption: '<b>A photograph.</b> Europa, pieced together from pictures taken by NASA’s Galileo spacecraft in 1995 and 1998, in colours close to what the eye would see. The brown lines are cracks in the ice. Credit: NASA/JPL-Caltech/SETI Institute.',
    },
    chapters: [
      { title: 'What it looks like up close', paras: [
        'Europa is a ball of white ice scored with long brown lines. It is one of the smoothest solid bodies in the Solar System, with no mountains and very few craters. Rocks from space must have hit it as often as they hit its neighbours, so something keeps wiping the surface clean. Counting the few craters that are there gives an age for the surface of somewhere between 40 and 90 million years: young, for a world.',
        'Close up, the lines are ridges and cracks, often in pairs, that run for hundreds of kilometres. In places the ice has broken into rafts that have shifted and frozen again in new positions, like pack ice on a polar sea. The brown colour is thought to come from salts and sulphur compounds brought up from below and darkened by Jupiter’s radiation.',
      ] },
      { title: 'What it is made of', paras: [
        'Europa is 3,122 km across, a little smaller than our Moon. Inside is rock round a metal core. Outside is a shell of ice, and under the ice, almost certainly, an ocean of salty water about a hundred kilometres deep. It holds about twice as much water as all the Earth’s oceans.',
        'The best evidence came from the Galileo spacecraft in the late 1990s. As Europa moves through Jupiter’s magnetic field, it makes a magnetic field of its own that switches back and forth. That is what a layer of salty, electrically conducting water would do, and it fits nothing else as well.',
        'In 2023 the Webb telescope found carbon dioxide frozen into the surface in a broken-up region called Tara Regio. The way it is spread out suggests that the carbon came up from the ocean.',
      ] },
      { title: 'How it was found', paras: [
        'Galileo Galilei found Europa with his telescope in January 1610. On 7 January he saw Io and Europa as a single point of light. On 8 January they had moved apart and he saw them as two. He named the four moons after the Medici family who were his patrons.',
        'The names used now came from the German astronomer Simon Marius, who claimed to have seen the moons at about the same time and published his names in 1614. Europa was a woman loved by Zeus, Jupiter in Roman myth.',
      ] },
      { title: 'Spacecraft that have seen it', paras: [
        'Pioneer 10 and 11 passed Jupiter in 1973 and 1974, and Voyager 1 and 2 in 1979. The Voyagers gave the first clear pictures of the cracked ice. The Galileo spacecraft went into orbit round Jupiter in 1995 and flew past Europa many times until 2003. NASA’s Juno spacecraft flew 352 km above it on 29 September 2022.',
        'NASA’s Europa Clipper was launched on 14 October 2024 and is due at Jupiter in 2030, to fly past Europa about fifty times. The European Space Agency’s JUICE, launched in April 2023, will pass Europa twice on its way to Ganymede.',
      ] },
      { title: 'What is still unknown', paras: [
        'Nobody knows how thick the ice is. Estimates run from a few kilometres to more than twenty, and the answer matters: thin ice would let water and the surface mix.',
        'The Hubble Space Telescope has twice seen what may be plumes of water vapour above Europa, in 2012 and 2016, but the signs were faint and have not been confirmed.',
        'Above all, nobody knows whether the ocean has what life would need besides water: a supply of energy and the right chemistry. Europa Clipper is built to find out whether it could. It will not look for life itself.',
      ] },
    ],
    sources: [
      { label: 'NASA, Europa', url: 'https://science.nasa.gov/jupiter/jupiter-moons/europa/' },
      { label: 'NASA, Europa Clipper', url: 'https://science.nasa.gov/mission/europa-clipper/' },
      { label: 'NASA, Webb finds carbon source on surface of Jupiter’s moon Europa (2023)', url: 'https://science.nasa.gov/missions/webb/nasas-webb-finds-carbon-source-on-surface-of-jupiters-moon-europa/' },
      { label: 'Wikipedia, Europa (moon)', url: 'https://en.wikipedia.org/wiki/Europa_(moon)' },
    ],
  },

  io: {
    lead: 'The most volcanic world known, heated from inside by Jupiter’s tides.',
    picture: {
      src: '/img/learn/io-galileo-1999.jpg', width: 900, height: 900,
      alt: 'Io as a yellow, orange and pale green globe dotted with black spots and red rings.',
      caption: '<b>A photograph, stitched together from many.</b> Io, from NASA’s Galileo spacecraft on 3 July 1999, in colours close to what the eye would see. The dark spots are volcanoes. Credit: NASA/JPL/University of Arizona.',
    },
    chapters: [
      { title: 'What it looks like up close', paras: [
        'Io is the most volcanic place known. More than 400 active volcanoes have been found on it, and there are no craters from falling rocks at all, because lava and ash bury them faster than they are made. The yellows, oranges and whites are sulphur and frozen sulphur dioxide. The black spots are fresh lava.',
        'Some of its volcanoes throw plumes of gas and dust hundreds of kilometres up, which fall back in rings around the vent. One, Loki Patera, is a lake of lava about 200 km across whose crust founders and is renewed every year or so. The lavas are hotter than any erupting on the Earth today, above 1,200 °C.',
      ] },
      { title: 'What it is made of', paras: [
        'Io is 3,643 km across, a little bigger than our Moon. It is rock, with a core of iron and iron sulphide, and almost no water. With a density of 3.53 times that of water, it is the densest moon in the Solar System.',
        'Its heat comes from tides. Io goes round Jupiter in 1.77 days. Europa takes twice as long and Ganymede four times as long, so the three keep falling into line and tugging on each other. The tugs keep Io’s path slightly oval, so Jupiter’s pull on it is always changing. Io is squeezed and relaxed every orbit, and its ground rises and falls by up to about 100 metres. That flexing heats the inside, as bending a wire back and forth heats it.',
      ] },
      { title: 'How it was found', paras: [
        'Galileo Galilei found Io on 7 January 1610, at first seeing it and Europa as one point of light. Io is named after a woman loved by Zeus in Greek myth.',
        'Its volcanoes were predicted before they were seen. In a paper published on 2 March 1979, three scientists, Stan Peale, Patrick Cassen and Ray Reynolds, worked out that the tides should melt Io’s insides. Voyager 1 passed Io three days later. On 8 March the engineer Linda Morabito, studying a Voyager picture, noticed a pale cloud standing off the edge of the moon. It was a volcanic plume.',
      ] },
      { title: 'Spacecraft that have seen it', paras: [
        'Voyager 1 and 2 found nine erupting volcanoes in 1979. The Galileo spacecraft, in orbit round Jupiter from 1995 to 2003, flew close past Io several times, though each pass through Jupiter’s radiation damaged it a little more. The New Horizons spacecraft photographed a great plume from the volcano Tvashtar on its way to Pluto in 2007.',
        'NASA’s Juno spacecraft flew about 1,500 km above Io on 30 December 2023 and again on 3 February 2024, the closest any spacecraft had come for more than twenty years.',
      ] },
      { title: 'What is still unknown', paras: [
        'It was long suggested that under the crust lies a global ocean of molten rock. Juno’s measurements of how Io flexes, published in December 2024, found no sign of a shallow one. How the heat gets out, and where in Io it is made, are still being worked out.',
        'It is also not known how long Io has been like this. The tidal lock-step with Europa and Ganymede that heats it may not be as old as the moons themselves.',
      ] },
    ],
    sources: [
      { label: 'NASA, Io', url: 'https://science.nasa.gov/jupiter/jupiter-moons/io/' },
      { label: 'NASA, Juno Io flybys', url: 'https://science.nasa.gov/mission/juno/' },
      { label: 'Wikipedia, Io (moon)', url: 'https://en.wikipedia.org/wiki/Io_(moon)' },
      { label: 'Wikipedia, Volcanism on Io (the 1979 prediction and discovery)', url: 'https://en.wikipedia.org/wiki/Volcanism_on_Io' },
    ],
  },

  ganymede: {
    lead: 'The largest moon in the Solar System, wider than Mercury, and the only moon with its own magnetic field.',
    picture: {
      src: '/img/learn/ganymede-juno-2021.jpg', width: 898, height: 1050,
      alt: 'Part of a large grey globe with dark old ground, paler grooved bands and bright craters with rays.',
      caption: '<b>A photograph.</b> Ganymede from NASA’s Juno spacecraft on 7 June 2021. It was taken through one filter, so it is in black and white. Credit: NASA/JPL-Caltech/SwRI/MSSS.',
    },
    chapters: [
      { title: 'What it looks like up close', paras: [
        'Ganymede has two kinds of ground. About a third is dark and old, crowded with craters. The rest is paler and younger, cut into long bands of parallel grooves and ridges, as if the ice had been pulled apart and filled in again. Bright craters with rays of thrown-out ice are scattered over both.',
        'The largest dark region, Galileo Regio, is about 3,200 km across. Its craters have softened over billions of years, because ice at Ganymede’s temperatures slowly flows.',
      ] },
      { title: 'What it is made of', paras: [
        'Ganymede is the largest moon in the Solar System, 5,268 km across. It is wider than the planet Mercury, though it has less than half Mercury’s mass, because it is roughly half ice. Inside are layers: an iron core, a rocky mantle, and thick ice on top.',
        'It is the only moon known to make its own magnetic field, found by the Galileo spacecraft in 1996. The field is strong enough to make auroras, glowing bands of light round its poles.',
        'Those auroras gave away an ocean. In 2015 a team using the Hubble Space Telescope watched them rock back and forth as Jupiter’s own field swept past. They rocked less than they should have, as if something inside was pushing back. A deep layer of salty water, conducting electricity, would do exactly that. It probably holds more water than all the Earth’s oceans.',
      ] },
      { title: 'How it was found', paras: [
        'Galileo Galilei saw Ganymede on 7 January 1610, as one of the points of light beside Jupiter that he soon realised were going round it. That was the first time anyone had seen bodies going round something other than the Earth.',
        'Ganymede is named after a young man whom Zeus carried off to serve the gods.',
      ] },
      { title: 'Spacecraft that have seen it', paras: [
        'Pioneer 10 passed in 1973, and Voyager 1 and 2 photographed the grooved ground in 1979. The Galileo spacecraft flew past six times between 1996 and 2000. NASA’s Juno flew 1,038 km above it on 7 June 2021 and took the picture above.',
        'The European Space Agency’s JUICE was launched in April 2023. It is planned to go into orbit round Ganymede in December 2034, the first spacecraft to orbit any moon other than our own.',
      ] },
      { title: 'What is still unknown', paras: [
        'The ocean may not be a single layer. Ice is squeezed into different, denser forms under great pressure, and the water may lie between sheets of ice, or touch the rock at the bottom. That matters for chemistry: water in touch with rock picks up much more from it.',
        'It is also not well understood how a moon this size keeps its iron core churning enough to make a magnetic field. Mars, a larger world, lost its own field billions of years ago.',
      ] },
    ],
    sources: [
      { label: 'NASA, Ganymede', url: 'https://science.nasa.gov/jupiter/jupiter-moons/ganymede/' },
      { label: 'NASA, Hubble observations suggest a subsurface ocean on Jupiter’s largest moon (2015)', url: 'https://science.nasa.gov/missions/hubble/nasas-hubble-observations-suggest-underground-ocean-on-jupiters-largest-moon/' },
      { label: 'ESA, JUICE', url: 'https://www.esa.int/Science_Exploration/Space_Science/Juice' },
      { label: 'Wikipedia, Ganymede (moon)', url: 'https://en.wikipedia.org/wiki/Ganymede_(moon)' },
    ],
  },
  callisto: {
    lead: 'One of the most heavily cratered worlds in the Solar System, its surface almost unchanged for about four billion years.',
    picture: {
      src: '/img/learn/callisto-galileo.jpg', width: 740, height: 753,
      alt: 'A dark brown globe peppered all over with bright white spots, the scars of craters.',
      caption: '<b>A photograph.</b> Callisto from NASA’s Galileo spacecraft. The bright spots are craters, where impacts dug up cleaner ice. Credit: NASA/JPL/DLR.',
    },
    chapters: [
      { title: 'What it looks like up close', paras: [
        'Callisto is covered in craters from edge to edge, more thickly than almost anywhere else in the Solar System. Its dark surface has hardly changed in about four billion years. There are no great mountains, no volcanoes and no long cracks. Nothing inside has stirred enough to wipe the slate clean.',
        'The largest scar is Valhalla, a bright centre ringed by ridges that spread out to about 3,800 km across, like ripples frozen round a stone dropped in a pond. Up close the ground is softer than expected, with few small craters, as if frost has been slowly boiling off and leaving dark dust behind.',
      ] },
      { title: 'What it is made of', paras: [
        'Callisto is 4,821 km across, the third-largest moon in the Solar System and almost as wide as Mercury. It is roughly half rock and half ice, and the two have not fully separated inside, unlike in Ganymede. That points to a gentle history, without much heating.',
        'It goes round Jupiter in 16.7 days, well outside the lock-step that heats Io, Europa and Ganymede, so it gets almost no heat from tides. Even so, the Galileo spacecraft found that Callisto makes a changing magnetic field as Jupiter’s sweeps past, which may mean a salty ocean deep under the ice.',
        'It also lies beyond the worst of Jupiter’s radiation. For that reason a NASA study in 2003 picked it as the best place for a future human base among Jupiter’s moons.',
      ] },
      { title: 'How it was found', paras: [
        'Galileo Galilei found Callisto in January 1610, with the other three large moons. Being furthest out, it strays furthest from Jupiter, and it is the one most easily seen in a small telescope.',
        'Callisto was a nymph loved by Zeus, who in the myth was turned into a bear and set in the sky as the Great Bear.',
      ] },
      { title: 'Spacecraft that have seen it', paras: [
        'Pioneer 10 and 11 passed in 1973 and 1974, and Voyager 1 and 2 photographed half its surface in 1979. The Galileo spacecraft flew past Callisto eight times between 1996 and 2001.',
        'The European Space Agency’s JUICE, launched in April 2023, is planned to fly past Callisto 21 times in the early 2030s before settling into orbit round Ganymede.',
      ] },
      { title: 'What is still unknown', paras: [
        'Whether the ocean is really there. The changing magnetic field could also come partly from Callisto’s thin, electrically charged upper air, and some researchers think that explains it without any ocean. JUICE’s many passes should settle it.',
        'It is also not known why Callisto and Ganymede, so alike in size and make-up, grew up so differently inside.',
      ] },
    ],
    sources: [
      { label: 'NASA, Callisto', url: 'https://science.nasa.gov/jupiter/jupiter-moons/callisto/' },
      { label: 'ESA, JUICE', url: 'https://www.esa.int/Science_Exploration/Space_Science/Juice' },
      { label: 'Wikipedia, Callisto (moon)', url: 'https://en.wikipedia.org/wiki/Callisto_(moon)' },
    ],
  },

  enceladus: {
    lead: 'A small, brilliant moon of Saturn that sprays water from a hidden ocean out into space.',
    globe: {
      src: '/img/learn/enceladus-cassini-2015.jpg', width: 900, height: 900,
      alt: 'A bright white moon, cratered at the top and crossed lower down by long cracks and ridges.',
      caption: '<b>A photograph.</b> Enceladus from NASA’s Cassini spacecraft in October 2015, as it closed in for its nearest pass over the south pole. Old craters in the north give way to younger, cracked ground. Credit: NASA/JPL-Caltech/Space Science Institute.',
    },
    picture: {
      src: '/img/learn/enceladus-jets-cassini.jpg', width: 1100, height: 680,
      alt: 'The dark edge of a moon with bright jets of spray rising from it into space.',
      caption: '<b>A photograph.</b> Jets of water from the hidden ocean of Enceladus, lit from behind by the Sun. Two pictures by NASA’s Cassini spacecraft joined together. Credit: NASA/JPL/Space Science Institute.',
    },
    chapters: [
      { title: 'What it looks like up close', paras: [
        'Enceladus is a small, brilliant white ball of ice. It reflects nearly all the sunlight that falls on it, more than any other large body in the Solar System, because its surface is kept coated in fresh snow.',
        'Near its south pole run four long, parallel cracks, each about 130 km long, nicknamed the tiger stripes. From them more than a hundred jets of water vapour and ice grains spray out into space. Some of the spray falls back as snow. The rest escapes and feeds one of Saturn’s rings, the faint, wide E ring.',
      ] },
      { title: 'What it is made of', paras: [
        'Enceladus is only 504 km across, small enough to fit inside Great Britain. Under its ice is a global ocean of salty water, sitting on a rocky core. The Cassini spacecraft showed in 2015 that the icy shell wobbles too much as it goes round Saturn to be frozen to the rock beneath: something liquid must separate them.',
        'Cassini flew straight through the jets and tasted them. It found water, salt, carbon compounds, tiny grains of silica that form in hot water reacting with rock, and hydrogen gas, which on the Earth is food for some microbes. In 2023 a study of Cassini’s data found phosphates, the last of the main ingredients that life on the Earth needs.',
      ] },
      { title: 'How it was found', paras: [
        'William Herschel found Enceladus on 28 August 1789, using the largest telescope in the world at the time, his 40-foot reflector. His son John named it in 1847, after one of the giants of Greek myth.',
      ] },
      { title: 'Spacecraft that have seen it', paras: [
        'Voyager 1 and 2 passed in 1980 and 1981 and showed that parts of the surface were strangely smooth and uncratered. The Cassini spacecraft, at Saturn from 2004 to 2017, found the jets in 2005 and flew through them several times, once only 25 km above the surface, in October 2008.',
        'No spacecraft is on its way yet. Missions to orbit Enceladus or land beside the tiger stripes are being studied.',
      ] },
      { title: 'What is still unknown', paras: [
        'Enceladus is too small to have stayed warm for 4.5 billion years on its own. The heat comes from Saturn’s tides, but nobody knows whether the ocean is ancient or formed recently, which matters for whether life could have had time to start.',
        'The biggest question is the simplest: is anything living there? Every ingredient that is known to be needed has now been found in the spray.',
      ] },
    ],
    sources: [
      { label: 'NASA, Enceladus', url: 'https://science.nasa.gov/saturn/moons/enceladus/' },
      { label: 'NASA, Cassini finds global ocean in Saturn’s moon Enceladus (2015)', url: 'https://science.nasa.gov/missions/cassini/cassini-finds-global-ocean-in-saturns-moon-enceladus/' },
      { label: 'Wikipedia, Enceladus', url: 'https://en.wikipedia.org/wiki/Enceladus' },
    ],
  },

  triton: {
    lead: 'Neptune’s largest moon, the only large moon that goes round its planet backwards, with geysers of nitrogen.',
    temperature: { value: '−235 °C', note: 'Measured by Voyager 2 in 1989, one of the coldest surfaces known.' },
    picture: {
      src: '/img/learn/triton-voyager2-1989.jpg', width: 1200, height: 933,
      alt: 'A lit crescent-shaped part of a globe, pinkish and pale grey, its lower half covered in bright patchy frost and its upper half in a wrinkled texture.',
      caption: '<b>A photograph, stitched together from many.</b> Triton from NASA’s Voyager 2 in August 1989. The colours were made from pictures through orange, violet and ultraviolet filters, so they are close to, but not exactly, what the eye would see. The pale frost at the bottom is the southern ice cap. Credit: NASA/JPL/USGS.',
    },
    chapters: [
      { title: 'What it looks like up close', paras: [
        'Triton is pink-grey and very cold, about −235 °C at the surface, one of the coldest places ever measured in the Solar System. Much of what Voyager 2 saw was a wrinkled plain that the scientists called cantaloupe terrain, after the skin of the melon.',
        'Across the bright southern ice cap ran dozens of dark streaks, all pointing the same way. They were laid down by geysers: plumes of nitrogen gas and dark dust that shot about 8 km up and were then carried sideways by the thin wind. Very few craters were seen, so the surface is young, probably less than about 100 million years old.',
      ] },
      { title: 'What it is made of', paras: [
        'Triton is 2,705 km across, Neptune’s largest moon by far. Under a crust of frozen nitrogen, water ice and carbon dioxide lies a large rocky core. It has a very thin air of nitrogen, about a seventy-thousandth of the pressure at the Earth’s surface.',
        'It is the only large moon in the Solar System that goes round its planet backwards, against the direction the planet spins. No moon could form that way from the disc round a young planet. Triton was almost certainly captured: a world like Pluto from the Kuiper belt that strayed too close to Neptune and was caught.',
        'Neptune’s tides are slowly pulling it inwards. In some billions of years it will come close enough to be torn apart, and Neptune may then have a ring grander than Saturn’s.',
      ] },
      { title: 'How it was found', paras: [
        'The English brewer and astronomer William Lassell found Triton on 10 October 1846, only 17 days after Neptune itself had been found. The name, after a sea god, son of Poseidon, was suggested by the French writer Camille Flammarion in 1880.',
      ] },
      { title: 'Spacecraft that have seen it', paras: [
        'Only one: Voyager 2, which passed about 40,000 km from Triton on 25 August 1989 after twelve years in space. It photographed about 40 per cent of the surface. Everything known about Triton up close comes from those few days.',
      ] },
      { title: 'What is still unknown', paras: [
        'More than half of Triton has never been seen. Nobody knows whether the geysers are driven by sunlight warming the ice, or by heat from inside. Heat from the tides that followed its capture may have been enough to melt an ocean under the ice, and it might still be there.',
        'A mission to fly past Triton, called Trident, was proposed to NASA, but it was not chosen in 2021. No spacecraft is planned.',
      ] },
    ],
    sources: [
      { label: 'NASA, Triton', url: 'https://science.nasa.gov/neptune/moons/triton/' },
      { label: 'NASA Image Library, Global color mosaic of Triton (PIA00317)', url: 'https://images.nasa.gov/details/PIA00317' },
      { label: 'Wikipedia, Triton (moon)', url: 'https://en.wikipedia.org/wiki/Triton_(moon)' },
    ],
  },

  moon: {
    lead: 'The Earth’s only natural satellite, and the only other world people have walked on.',
    temperature: { value: '−133 to 121 °C', note: 'From night to day at the equator. There is no air to even it out.' },
    picture: {
      src: '/img/learn/moon-near-side-lro.jpg', width: 1100, height: 1100,
      alt: 'The whole face of the Moon in grey, with large dark smooth patches across the upper half and bright, heavily cratered ground in the lower half.',
      caption: '<b>A photograph.</b> The side of the Moon that always faces the Earth, pieced together from about 1,300 pictures taken by NASA’s Lunar Reconnaissance Orbiter in December 2010. Credit: NASA/GSFC/Arizona State University.',
    },
    chapters: [
      { title: 'What it looks like up close', paras: [
        'The Moon has two kinds of ground. The bright highlands are old rock, battered by craters. The dark patches, still called seas from the days when people thought they might be water, are wide plains of solidified lava that flooded the largest basins more than three billion years ago. They cover about a sixth of the surface, almost all on the side facing the Earth.',
        'The far side, which never faces us, is nearly all highland, with hardly any seas. It holds the largest crater on the Moon, the South Pole–Aitken basin, about 2,500 km across. In craters near the poles where sunlight never reaches, there is ice: in 2009 NASA’s LCROSS mission crashed a rocket stage into one and saw water in the cloud it threw up.',
      ] },
      { title: 'What it is made of', paras: [
        'The Moon is 3,475 km across, a little over a quarter of the Earth’s width. It has a crust, a rocky mantle and a small iron core. Its rocks are a very close chemical match for the Earth’s outer rock, which is the strongest evidence that it formed from the debris of a giant collision with the young Earth about 4.5 billion years ago.',
        'It is slowly moving away. Mirrors left by the Apollo crews are still used to time laser pulses from the Earth, and they show the Moon drifting about 3.8 cm further away every year.',
      ] },
      { title: 'How it was found', paras: [
        'It has always been known. Galileo Galilei, looking through a telescope in 1609, was among the first to see that its face was rough, with mountains and craters, and not a perfect polished sphere.',
        'The Greek astronomer Hipparchus worked out its distance in the second century BC from the way a solar eclipse looked from two different places. His answer was close to the true figure.',
      ] },
      { title: 'Spacecraft that have seen it', paras: [
        'The Soviet Luna 2 was the first spacecraft to reach it, crashing on purpose in September 1959. Luna 3 sent back the first pictures of the far side the next month, and Luna 9 made the first soft landing in 1966. On 20 July 1969 Apollo 11 landed the first people, and by the end of 1972 twelve astronauts had walked on the Moon and brought back 382 kg of rock and soil.',
        'In 2019 China’s Chang’e 4 made the first landing on the far side, and in 2024 Chang’e 6 brought back the first samples from it. In April 2026 the four astronauts of Artemis II flew round the Moon, the first people to travel there since 1972.',
      ] },
      { title: 'What is still unknown', paras: [
        'How much ice the dark polar craters hold, and whether it is enough to be useful to people living there, is still being measured. It is one reason several countries are aiming their landers at the south pole.',
        'The giant collision explains most of what is known, but not everything. The Moon’s rocks match the Earth’s so closely that, in most versions of the story, it is hard to see why more of the other body did not show.',
      ] },
    ],
    sources: [
      { label: 'NASA, Earth’s Moon', url: 'https://science.nasa.gov/moon/' },
      { label: 'NASA, LCROSS impact data indicates water on the Moon (2009)', url: 'https://www.nasa.gov/news-release/lcross-impact-data-indicates-water-on-moon/' },
      { label: 'Wikipedia, Moon', url: 'https://en.wikipedia.org/wiki/Moon' },
    ],
  },
};
