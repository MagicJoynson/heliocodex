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

  pluto: {
    lead: 'The best known of the dwarf planets, a small, cold world at the edge of the Solar System with a heart-shaped plain of nitrogen ice, mountains of water ice and a thin blue haze.',
    temperature: { value: '−230 °C', note: 'About, on average, at the surface. NASA gives −232 °C.' },
    picture: {
      src: '/img/learn/pluto-new-horizons.jpg', width: 1100, height: 1100,
      alt: 'The globe of Pluto: a large pale, smooth, heart-shaped plain on the right, dark reddish ground at the lower left, and cratered country round the rest.',
      caption: '<b>A photograph, with the colours stretched.</b> Pluto on 14 July 2015, from NASA’s New Horizons spacecraft, which combined blue, red and infrared pictures. The colours are enhanced so that the differences between one kind of ground and another show up. The pale heart is Sputnik Planitia. Credit: NASA/Johns Hopkins University Applied Physics Laboratory/Southwest Research Institute.',
    },
    chapters: [
      { title: 'What it looks like', paras: [
        'Until 2015 Pluto was a smudge of a few pixels. Then New Horizons flew past and showed a world with more kinds of country than anyone had guessed. The most striking is a bright plain about 1,000 km across, shaped like a heart and named Sputnik Planitia. It is a sheet of frozen nitrogen with almost no craters, which means it is young, probably less than 10 million years old, and still being renewed. The ice slowly turns over in cells a few tens of kilometres wide, rather like a pan of thick porridge on a very low heat.',
        'Round the plain are mountains of water ice, some about 3 km high. At Pluto’s temperature water ice is as hard as rock, and nitrogen ice is soft enough to flow. Other areas are dark red, stained by carbon-rich material that forms when sunlight and cosmic rays break down the methane in the thin air.',
        'Pluto does have an atmosphere, mostly nitrogen with a little methane. At the ground it is about a hundred-thousandth as dense as the Earth’s, but it is thick enough to carry layers of blue haze that New Horizons photographed against the Sun.',
      ] },
      { title: 'What it is made of', paras: [
        'Pluto is 2,377 km across, about two-thirds the width of our Moon. Inside it is rock, probably with a core, under a thick mantle of water ice. The surface is a thin coat of more volatile ices: nitrogen, methane and carbon monoxide.',
        'Its path round the Sun is a long oval, tilted by 17° to the paths of the planets. Pluto takes nearly 250 years to go round once, and from 1979 to 1999 it was nearer the Sun than Neptune was. The two never come close to one another, because they are locked in a pattern that keeps them apart.',
      ] },
      { title: 'How it was found and named', paras: [
        'Clyde Tombaugh found it on 18 February 1930 at the Lowell Observatory in Arizona, by comparing photographic plates taken a few nights apart in January and spotting a dot that had moved. Astronomers had been searching for a ninth planet, and for 76 years Pluto was counted as one.',
        'The name was suggested in March 1930 by Venetia Burney, an 11-year-old schoolgirl in Oxford, after the Roman god of the underworld. In 2006 the International Astronomical Union put Pluto in a new class, dwarf planets, because it is smaller than the Moon, shares its region with many similar bodies and has not cleared them from its path.',
      ] },
      { title: 'Its moons, if any', paras: [
        'Pluto has five known moons. Charon, found in 1978, is about half its width, so large that the two circle a point in the space between them and not a point inside Pluto. The others are small and irregular: Styx, Nix, Kerberos and Hydra.',
      ] },
      { title: 'What is still unknown', paras: [
        'How the heart plain came to be, and why it lies where it does, is still argued. Its position suggests that something heavy lies under it, possibly a layer of liquid water. Whether Pluto has an ocean is not settled.',
        'New Horizons flew past at about 12,500 km on 14 July 2015, nine and a half years after it launched, and took only a few hours of close pictures. Nobody has been back, and about half of Pluto was photographed only at low resolution.',
      ] },
    ],
    sources: [
      { label: 'NASA, Pluto', url: 'https://science.nasa.gov/dwarf-planets/pluto/' },
      { label: 'NASA, New Horizons', url: 'https://science.nasa.gov/mission/new-horizons/' },
      { label: 'IAU, Definition of a planet (2006)', url: 'https://www.iau.org/news/pressreleases/detail/iau0603/' },
    ],
  },

  charon: {
    lead: 'The largest moon of Pluto, so big beside it that the two are called a double world, with a red cap at its north pole and a canyon that wraps round its middle.',
    picture: {
      src: '/img/learn/charon-new-horizons.jpg', width: 1100, height: 1100,
      alt: 'A grey globe with a rust-red cap at the top, a broad belt of cracked ground across its middle and craters scattered below.',
      caption: '<b>A photograph, with the colours stretched.</b> Charon just before the closest approach of NASA’s New Horizons spacecraft on 14 July 2015. Blue, red and infrared pictures were combined, and the colours are enhanced to bring out differences in the ground. Credit: NASA/Johns Hopkins University Applied Physics Laboratory/Southwest Research Institute.',
    },
    chapters: [
      { title: 'What it looks like up close', paras: [
        'Charon is a grey ball of ice, and it was expected to be dull. It is not. Round its middle runs a belt of cliffs and canyons, one of them, Serenity Chasma, several kilometres deep. South of the belt lies a smoother plain with far fewer craters, as if the surface had been renewed.',
        'The most striking thing is the dark red cap at the north pole. The leading explanation is that methane gas escaping from Pluto’s thin air is carried across the gap, freezes on Charon’s cold pole in the long winter, and is turned red by sunlight.',
      ] },
      { title: 'What it is made of', paras: [
        'Charon is 1,212 km across, a little over half the width of Pluto. Its density, 1.7 times that of water, says it is a mixture of about half ice and half rock. It holds about an eighth of Pluto’s mass, a bigger share than any other moon holds of its planet or dwarf planet.',
        'The two circle a point about 2,000 km from the centre of Pluto, outside it, in the space between them, and each keeps the same face to the other. Charon goes round once in 6.4 days, the same time Pluto takes to turn once, so from one side of Pluto it never rises or sets.',
      ] },
      { title: 'How it was found', paras: [
        'James Christy found Charon in 1978 at the United States Naval Observatory in Flagstaff, Arizona. He noticed that Pluto looked lumpy on his photographic plates, and that the lump moved round it. He named it Charon after the ferryman of the dead in Greek myth, and partly after his wife Charlene, so that it is said “Shar-on”.',
        'Its discovery let astronomers weigh Pluto for the first time. Pluto turned out to be far lighter than the early guesses, and much smaller than a planet.',
      ] },
      { title: 'Spacecraft that have seen it', paras: [
        'Only New Horizons, in July 2015. It passed Charon at about 27,000 km and photographed one hemisphere of it in detail.',
      ] },
      { title: 'What is still unknown', paras: [
        'The broad cracks round the middle are what would be expected if an ocean inside Charon froze and expanded. Whether it did, and when, is unknown. How the Pluto and Charon pair formed is also unsettled, though a great collision early in the history of the Solar System is the leading idea.',
      ] },
    ],
    sources: [
      { label: 'NASA, Charon', url: 'https://science.nasa.gov/dwarf-planets/pluto/moons/charon/' },
      { label: 'NASA, New Horizons', url: 'https://science.nasa.gov/mission/new-horizons/' },
    ],
  },

  ceres: {
    lead: 'The largest body in the asteroid belt and the only dwarf planet in the inner Solar System, a dark, cratered world with bright patches of salt.',
    picture: {
      src: '/img/learn/ceres-dawn.jpg', width: 1100, height: 1100,
      alt: 'A grey, round, heavily cratered world, with a small cluster of brilliant white spots inside one crater near the middle.',
      caption: '<b>A picture made from photographs.</b> Ceres from NASA’s Dawn spacecraft, a view centred on Occator crater, put together from pictures taken from about 385 km up. The bright spots are salt left behind by seeping brine. Credit: NASA/JPL-Caltech/UCLA/MPS/DLR/IDA.',
    },
    chapters: [
      { title: 'What it looks like', paras: [
        'From a distance Ceres is a dull, dark ball, a little lighter than charcoal. Close up it is covered in craters, though fewer big ones than expected, which suggests that its crust is soft enough to slump and flatten them over time.',
        'Its surprises are the bright spots. The brightest are in Occator crater, which is about 92 km wide. Dawn found that they are mostly sodium carbonate, a salt related to washing soda, left when salty water from below reached the surface and the water evaporated. Ahuna Mons, a mountain about 4 km high with steep sides, is thought to be a volcano that erupted slush and brine, and not molten rock.',
      ] },
      { title: 'What it is made of', paras: [
        'Ceres is about 940 km across and round, which is what puts it among the dwarf planets. It holds about a quarter to a third of all the mass in the asteroid belt. It is a mix of rock and ice, with clay-like minerals that need water to form, and it has ice just under the surface and in craters at the poles that never see the Sun.',
        'It takes 4.6 years to go round the Sun, in a path only slightly stretched, in the middle of the belt.',
      ] },
      { title: 'How it was found and named', paras: [
        'The Italian astronomer Giuseppe Piazzi found it on 1 January 1801 from Palermo in Sicily. Astronomers had been looking for a missing planet between Mars and Jupiter, and Ceres was in the right place. It was called a planet for about fifty years, until many more bodies were found in the same region and it was reclassed as an asteroid. In 2006 it was given a new label, dwarf planet.',
        'Piazzi named it after Ceres, the Roman goddess of grain and harvests, who was the patron of Sicily.',
      ] },
      { title: 'Its moons, if any', paras: [
        'It has none that have been found.',
      ] },
      { title: 'What is still unknown', paras: [
        'NASA’s Dawn spacecraft entered orbit round Ceres on 6 March 2015, and its fuel ran out in 2018. It is still there, and will stay in orbit for at least 20 years. How much brine remains below the surface, how far down it lies, and whether it is warm and salty enough to be of interest in the search for life are all still being worked out from Dawn’s measurements.',
      ] },
    ],
    sources: [
      { label: 'NASA, Ceres', url: 'https://science.nasa.gov/dwarf-planets/ceres/' },
      { label: 'NASA, Dawn', url: 'https://science.nasa.gov/mission/dawn/' },
      { label: 'De Sanctis and others, Nature 536 (2016): bright carbonate deposits on Ceres', url: 'https://www.nature.com/articles/nature18290' },
    ],
  },

  vesta: {
    lead: 'The second largest body in the asteroid belt and the brightest, a battered, not quite round rock that is the source of many of the meteorites found on the Earth.',
    picture: {
      src: '/img/learn/vesta-dawn-2011.jpg', width: 900, height: 882,
      alt: 'A grey, battered, not quite round world covered in craters, with long grooves running round its middle.',
      caption: '<b>A photograph.</b> Vesta on 24 July 2011, from NASA’s Dawn spacecraft at a distance of about 5,200 km. The long grooves run parallel to the equator. Credit: NASA/JPL-Caltech/UCLA/MPS/DLR/IDA.',
    },
    chapters: [
      { title: 'What it looks like', paras: [
        'Vesta is not round. It measures about 573 km by 557 km by 446 km, with a large dent at its south pole, where an impact once removed a great part of it. The dent is a basin named Rheasilvia, about 500 km across, nearly as wide as Vesta itself. A mountain rises from its centre to about 20 km, more than twice the height of Everest above sea level.',
        'The grooves round the middle are troughs, the longest several hundred kilometres, thought to be cracks formed by the great impacts. Elsewhere Vesta is covered in craters of every size.',
      ] },
      { title: 'What it is made of', paras: [
        'Unlike most asteroids, Vesta has a layered inside: a core of iron and nickel, a mantle of rock and a crust of volcanic rock. It was once hot enough to melt, and its crust is old lava that cooled early in the Solar System’s history.',
        'Its density is about 3.5 times that of water, as rock and metal together would be. It takes 3.6 years to go round the Sun.',
      ] },
      { title: 'How it was found', paras: [
        'The German astronomer Heinrich Olbers found it on 29 March 1807 in Bremen, the fourth asteroid to be found. His friend Carl Friedrich Gauss, who had worked out the orbit, was allowed to name it, and chose Vesta, the Roman goddess of the hearth.',
        'It is the brightest asteroid in the sky because its surface is pale and it is large. At its best it is just visible to the naked eye under a dark sky.',
      ] },
      { title: 'Spacecraft that have visited', paras: [
        'NASA’s Dawn spacecraft orbited Vesta from July 2011 to September 2012, then left for Ceres. It mapped the whole surface and measured Vesta’s gravity, which is how the layers inside were worked out.',
      ] },
      { title: 'Could it hit the Earth?', paras: [
        'Not in any way that can be foreseen. Vesta stays in the main belt, between Mars and Jupiter. But pieces of it have reached us. Chips knocked off by the impacts that made Rheasilvia and the older basin beside it drifted out of the belt, and a whole class of meteorites found on the Earth, the howardites, eucrites and diogenites, match Vesta’s rock so closely that they are thought to be its fragments.',
      ] },
    ],
    sources: [
      { label: 'NASA, Vesta', url: 'https://science.nasa.gov/solar-system/asteroids/4-vesta/' },
      { label: 'NASA, Dawn', url: 'https://science.nasa.gov/mission/dawn/' },
    ],
  },

  phobos: {
    lead: 'The larger and nearer of Mars’s two small moons, a lumpy, cratered rock that circles the planet three times a day and is slowly falling towards it.',
    picture: {
      src: '/img/learn/phobos-hirise-5800km.jpg', width: 1100, height: 1087,
      alt: 'A brown, lumpy, heavily cratered moon cut off by the edge of the frame, with a large crater at the lower right and long shallow grooves running across it.',
      caption: '<b>A photograph, with processed colour.</b> Phobos on 23 March 2008, from the HiRISE camera on NASA’s Mars Reconnaissance Orbiter at a distance of about 5,800 km. The colours come from three bands of light and are not exactly what an eye would see. The big crater is Stickney. Credit: NASA/JPL-Caltech/University of Arizona.',
    },
    chapters: [
      { title: 'What it looks like up close', paras: [
        'Phobos is shaped like a potato, about 27 km by 22 km by 18 km, and covered in craters. The largest, Stickney, is about 9 km wide, nearly half the moon’s width, and the impact that made it must almost have broken Phobos apart. Across the surface run long shallow grooves, and what made them is still argued: cracks from the force of that impact, or the pull of Mars, or lines of debris thrown up when rocks hit Mars itself.',
        'Phobos is dark, reflecting only about 7 per cent of the light that falls on it.',
      ] },
      { title: 'What it is made of', paras: [
        'Its density is 1.87 times that of water, too low for solid rock. It is probably a loose pile of rubble, with a good deal of empty space inside.',
        'Phobos is only about 6,000 km above Mars’s surface, closer to its planet than any other moon in the Solar System. It goes round in 7 hours and 39 minutes, faster than Mars turns, so from Mars it rises in the west and sets in the east, and does so about three times in a Martian day.',
      ] },
      { title: 'How it was found and named', paras: [
        'The American astronomer Asaph Hall found both moons of Mars at the United States Naval Observatory in Washington, Deimos on 12 August 1877 and Phobos six nights later, on 18 August. Stickney was named for his wife, Angeline Stickney, who had urged him to keep searching.',
        'The names are Greek for fear, which is Phobos, and dread, which is Deimos. They were suggested by Henry Madan, a schoolmaster at Eton. In Greek myth they were the sons of Ares, the god of war, whom the Romans knew as Mars.',
      ] },
      { title: 'Spacecraft that have seen it', paras: [
        'Mariner 9 saw it in 1971 and the Viking orbiters photographed it closely in the 1970s. The European Mars Express has passed near it many times since 2004. Two Soviet probes sent to it in 1988 both failed.',
        'Japan’s Martian Moons eXploration mission, MMX, launched on 20 October 2026. It is meant to land on Phobos, collect at least 10 grams of ground, and return it to the Earth in about 2031.',
      ] },
      { title: 'What is still unknown', paras: [
        'Where Phobos came from. One idea is that it is an asteroid captured by Mars. Another is that it formed from debris thrown up by a huge impact on Mars. The rock is the test: asteroid rock and Martian rock look different in a laboratory, which is one reason to bring a sample back.',
        'Mars’s pull is dragging Phobos inwards by about 2 metres a century. In some tens of millions of years it will either crash onto Mars or be torn apart into a ring.',
      ] },
    ],
    sources: [
      { label: 'NASA, Phobos', url: 'https://science.nasa.gov/mars/moons/phobos/' },
      { label: 'JAXA, Martian Moons eXploration', url: 'https://www.mmx.jaxa.jp/en/' },
      { label: 'NASA Image and Video Library, PIA10369', url: 'https://images.nasa.gov/details/PIA10369' },
    ],
  },

  deimos: {
    lead: 'The smaller and farther of Mars’s two moons, a smooth-looking little rock that hangs in the Martian sky for days at a time.',
    picture: {
      src: '/img/learn/deimos-mro-2009.jpg', width: 1100, height: 564,
      alt: 'Two views of the same small, pale, egg-shaped moon on black, with a few craters and a scale bar of 2 kilometres.',
      caption: '<b>Two photographs, with processed colour.</b> Deimos from the HiRISE camera on NASA’s Mars Reconnaissance Orbiter, in February 2009, in two different lights about five and a half hours apart, with a scale bar of 2 km. The colours are processed and are not exactly what an eye would see. Credit: NASA/JPL-Caltech/University of Arizona.',
    },
    chapters: [
      { title: 'What it looks like up close', paras: [
        'Deimos is about 15 km by 12 km by 10 km, roughly half the size of Phobos, with a smoother look. It has craters, but many are half-buried. A blanket of dust and loose rock, perhaps tens of metres deep, seems to have filled them in.',
      ] },
      { title: 'What it is made of', paras: [
        'Its density, 1.47 times that of water, is lower than Phobos’s, so it is probably loose rubble held together by weak gravity, with more empty space than rock.',
        'It circles Mars at 23,500 km, taking 30.3 hours for each trip. That is only a little longer than a Martian day, so from the ground Deimos moves very slowly. It takes about two and a half days to cross the sky from rising in the east to setting in the west, and from Mars it looks like a bright star, not a disc.',
      ] },
      { title: 'How it was found', paras: [
        'Asaph Hall found it on 12 August 1877 at the United States Naval Observatory in Washington. He had been searching for weeks. He found Phobos six nights later. The name is Greek for dread. Henry Madan, a schoolmaster at Eton, suggested the names of both moons.',
      ] },
      { title: 'Spacecraft that have seen it', paras: [
        'The Viking orbiters photographed Deimos closely in 1977, and Mars Express and the Mars Reconnaissance Orbiter have taken pictures since. No spacecraft has landed on it. Japan’s MMX mission, which launched on 20 October 2026 to bring back a sample from Phobos, is also meant to pass close to Deimos.',
      ] },
      { title: 'What is still unknown', paras: [
        'Where it came from, as with Phobos: a captured asteroid or the leftovers of an impact on Mars. Unlike Phobos, it is not falling in. It is a little beyond the distance at which a moon goes round in exactly one Martian day, so Mars’s tides push it very slowly outwards.',
      ] },
    ],
    sources: [
      { label: 'NASA, Deimos', url: 'https://science.nasa.gov/mars/moons/deimos/' },
      { label: 'JAXA, Martian Moons eXploration', url: 'https://www.mmx.jaxa.jp/en/' },
      { label: 'NASA Image and Video Library, PIA11826', url: 'https://images.nasa.gov/details/PIA11826' },
    ],
  },

  mimas: {
    lead: 'A small, icy moon of Saturn with one enormous crater, a third of its width across, that makes it one of the most recognisable worlds in the Solar System.',
    picture: {
      src: '/img/learn/mimas-cassini-2010.jpg', width: 1100, height: 1100,
      alt: 'A grey, round, heavily cratered moon with one very large crater with a central peak on the right-hand side.',
      caption: '<b>A mosaic of photographs.</b> Mimas in February 2010, put together from six pictures by NASA’s Cassini spacecraft. The big crater on the right is Herschel. Credit: NASA/JPL-Caltech/Space Science Institute.',
    },
    chapters: [
      { title: 'What it looks like up close', paras: [
        'Mimas is almost wholly covered in craters, but one dominates. Herschel is about 130 km wide, a third of the moon’s width, with steep walls and a central peak that rises about 6 km. It is so large for its host that the impact that made it very nearly broke Mimas apart.',
        'The rest of the surface is pitted with smaller craters of every age, one on top of another.',
      ] },
      { title: 'What it is made of', paras: [
        'Mimas is 396 km across, the smallest round moon of Saturn. Its density, 1.15 times that of water, is barely more than ice, so it is nearly all water ice with only a little rock.',
        'It circles Saturn at 186,000 km, closer than any of the other big moons, taking 22.6 hours. Its pull keeps the Cassini Division clear. A particle in the inner edge of that gap would go round Saturn twice for each of Mimas’s trips, so it would be tugged at the same point every time, and thrown out of its orbit.',
      ] },
      { title: 'How it was found', paras: [
        'William Herschel found it on 17 September 1789 with his great 40-foot telescope, a few weeks after he had found Enceladus. His son John Herschel proposed the names of Saturn’s moons from Greek myth in 1847, including Mimas, one of the giants.',
      ] },
      { title: 'Spacecraft that have seen it', paras: [
        'Voyager 1 and 2 photographed it in 1980 and 1981. Cassini flew by many times between 2004 and 2017, passing closest, at about 9,500 km, on 13 February 2010.',
      ] },
      { title: 'What is still unknown', paras: [
        'Mimas wobbles as it orbits, and in 2024 a study of its wobble, using Cassini measurements, concluded that the moon may have an ocean 20 to 30 km under its ice that formed only 5 to 15 million years ago. That would be a surprise, since the surface shows no sign of one, and the idea is still being tested.',
      ] },
    ],
    sources: [
      { label: 'NASA, Mimas', url: 'https://science.nasa.gov/saturn/moons/mimas/' },
      { label: 'Lainey and others, Nature 626 (2024): a recently formed ocean inside Saturn’s moon Mimas', url: 'https://www.nature.com/articles/s41586-023-06975-9' },
    ],
  },

  iapetus: {
    lead: 'A moon of Saturn with one side as dark as coal and the other as bright as snow, and a ridge round its equator that makes it look like a walnut.',
    picture: {
      src: '/img/learn/iapetus-cassini-2009.jpg', width: 1100, height: 539,
      alt: 'Two round views of the same moon side by side: the left one almost entirely dark brown, the right one pale cream with scattered dark craters.',
      caption: '<b>Two processed photographs.</b> Iapetus from NASA’s Cassini spacecraft: its dark side on the left and its bright side on the right. Credit: NASA/JPL/Space Science Institute.',
    },
    chapters: [
      { title: 'What it looks like up close', paras: [
        'One side of Iapetus, the side that leads as it goes round Saturn, is dark brown. It is called Cassini Regio. The other side is pale, and the two meet in a ragged line, with the bright side about ten times as reflective as the dark.',
        'Round the equator runs a ridge, about 1,300 km long and in places up to 20 km high, which gives the moon its walnut shape. Nobody knows for certain how it formed.',
      ] },
      { title: 'What it is made of', paras: [
        'Iapetus is 1,469 km across, the third largest of Saturn’s moons. Its density, 1.09 times that of water, shows that it is nearly all water ice.',
        'The dark colour is probably a coating. Dust from Phoebe, a dark outer moon, spirals inward and falls on the side that leads. The dark dust absorbs sunlight and warms, ice evaporates off the warm patches and freezes again on the bright ground, which darkens the one and brightens the other until the contrast is as sharp as it is.',
        'Iapetus is a long way out, 3.56 million km from Saturn, and takes 79.3 days to go round, in a path tilted away from the plane of the rings.',
      ] },
      { title: 'How it was found', paras: [
        'Giovanni Domenico Cassini found it on 25 October 1671 at the Paris Observatory. He noticed that he could see it only when it was on the western side of Saturn, and guessed that one side was darker than the other. It was not photographed in detail until the Voyager spacecraft in 1980 and 1981, and then Cassini.',
      ] },
      { title: 'Spacecraft that have seen it', paras: [
        'Voyager 1 and 2 saw it from afar. The Cassini spacecraft, named after the discoverer, flew close to it on 10 September 2007, its only close approach, and photographed the dark and bright sides and the ridge.',
      ] },
      { title: 'What is still unknown', paras: [
        'What made the ridge is not settled. One idea is that Iapetus once spun much faster, and the ridge is a relic of that. Another is that a ring of debris around Iapetus fell to its equator. Neither is generally accepted.',
      ] },
    ],
    sources: [
      { label: 'NASA, Iapetus', url: 'https://science.nasa.gov/saturn/moons/iapetus/' },
      { label: 'NASA Image and Video Library, PIA11690', url: 'https://images.nasa.gov/details/PIA11690' },
    ],
  },

  miranda: {
    lead: 'The smallest and innermost of the five big moons of Uranus, with a patchwork surface of grooves, ridges and cliffs unlike any other moon.',
    picture: {
      src: '/img/learn/miranda-voyager2-1986.jpg', width: 571, height: 574,
      alt: 'A grey, round moon crossed by a patchwork of ridged and grooved ground, with a band of grooved, striped ground on the left, a bright chevron at the bottom and craters scattered over the rest.',
      caption: '<b>A photograph.</b> Miranda on 24 January 1986, from NASA’s Voyager 2 spacecraft. Voyager passed closer to Miranda than to any other moon of Uranus. Only the south, which was lit by the Sun, was seen. Credit: NASA/JPL-Caltech.',
    },
    chapters: [
      { title: 'What it looks like up close', paras: [
        'Miranda looks as though it has been broken up and put back together. Old, cratered ground sits beside younger ground cut by ridges and grooves, and three huge oval patches, called coronae, are marked with bands of parallel stripes and a bright chevron. Cliffs and canyons cut the surface, and one cliff, Verona Rupes, may be as much as 20 km high, possibly the tallest cliff known in the Solar System.',
        'Nothing like this was expected on a moon only 470 km across. A body that small should have frozen solid soon after it formed, and kept its old, cratered face.',
      ] },
      { title: 'What it is made of', paras: [
        'Miranda is 472 km across, about a seventh of the width of our Moon. Its density, 1.18 times that of water, means it is mostly water ice with some rock.',
        'It goes round Uranus in 1.4 days at 129,900 km, in a path that is tilted by 4.4° to the planet’s equator, more than the other big moons. That tilt, and the patchwork surface, may be left over from a time when Miranda was pulled and warmed by a clash of orbits with its neighbours.',
      ] },
      { title: 'How it was found', paras: [
        'The Dutch-American astronomer Gerard Kuiper found it on 16 February 1948 at the McDonald Observatory in Texas, nearly a century after Lassell found Ariel and Umbriel. He named it after the daughter of Prospero in Shakespeare’s play The Tempest, in keeping with the names that John Herschel had given to the earlier moons, from Shakespeare and from Alexander Pope.',
      ] },
      { title: 'Spacecraft that have seen it', paras: [
        'Only Voyager 2, on 24 January 1986. Because Uranus is tipped over on its side, in 1986 the south pole pointed at the Sun and the north was in darkness, so only Miranda’s southern half was photographed.',
      ] },
      { title: 'What is still unknown', paras: [
        'How the patchwork formed. One idea is that Miranda was shattered by an impact and pulled itself back together. Another is that the inside was warmed by tides and rose in blobs, forming the coronae. Half the moon has never been seen. A future mission to Uranus, which the most recent American survey of planetary science ranked first among new large missions, would give a second look.',
      ] },
    ],
    sources: [
      { label: 'NASA, Miranda', url: 'https://science.nasa.gov/uranus/moons/miranda/' },
      { label: 'NASA Image and Video Library, PIA18185', url: 'https://images.nasa.gov/details/PIA18185' },
    ],
  },

  ariel: {
    lead: 'The brightest of the big moons of Uranus, an icy world scored with long canyons whose smooth floors suggest that ice once flowed across them.',
    picture: {
      src: '/img/learn/ariel-voyager2-1986.jpg', width: 845, height: 650,
      alt: 'The curved edge of a pinkish-grey moon, with bright patches, craters and long straight valleys running across it.',
      caption: '<b>A photograph, in colour.</b> Part of Ariel on 24 January 1986, from NASA’s Voyager 2 spacecraft. The straight valleys are fault canyons, and the ground between them is cratered. Credit: NASA/JPL.',
    },
    chapters: [
      { title: 'What it looks like up close', paras: [
        'Ariel has fewer big craters than its neighbours, which means its surface is younger, with older ground resurfaced. Canyons cross it for hundreds of kilometres, several kilometres deep and with flat floors that look as though soft ice, or a slush of ice and ammonia, has welled up and spread.',
        'Voyager 2 photographed only the half that faced the Sun in 1986, mostly the south.',
      ] },
      { title: 'What it is made of', paras: [
        'Ariel is 1,158 km across, about a third of the width of our Moon. Its density, 1.54 times that of water, is a mixture of ice and rock in roughly equal parts.',
        'It goes round Uranus in 2.5 days at 190,900 km, in the plane of the planet’s equator.',
      ] },
      { title: 'How it was found', paras: [
        'The English brewer and astronomer William Lassell found it on 24 October 1851, with a telescope he built himself, and found Umbriel the same year. John Herschel named them in 1852 after spirits from the poetry of Alexander Pope. Ariel is also a spirit in Shakespeare’s The Tempest.',
      ] },
      { title: 'Spacecraft that have seen it', paras: [
        'Only Voyager 2, on 24 January 1986, which passed Ariel at about 127,000 km.',
      ] },
      { title: 'What is still unknown', paras: [
        'What the canyon floors are made of, how recently they were resurfaced, and whether any warmth is left inside. The north has not been seen at all.',
      ] },
    ],
    sources: [
      { label: 'NASA, Ariel', url: 'https://science.nasa.gov/uranus/moons/ariel/' },
      { label: 'NASA Image and Video Library, PIA00041', url: 'https://images.nasa.gov/details/PIA00041' },
    ],
  },

  umbriel: {
    lead: 'The darkest of the big moons of Uranus, an old, heavily cratered ball of ice with one mysterious bright ring.',
    picture: {
      src: '/img/learn/umbriel-voyager2-1986.jpg', width: 400, height: 400,
      alt: 'A dark grey, round moon thickly covered in craters, with a small bright patch on the top edge.',
      caption: '<b>A photograph.</b> Umbriel on 24 January 1986, from NASA’s Voyager 2 spacecraft, the most detailed picture of it. The small bright patch at the top edge is the bright ring. Credit: NASA/JPL.',
    },
    chapters: [
      { title: 'What it looks like up close', paras: [
        'Umbriel is a dull, dark world that reflects less light than any of the other four big moons of Uranus, and it is thickly covered in old craters. That suggests little has changed on it since the early Solar System.',
        'The exception is a bright ring about 140 km across, thought to lie on the floor of a crater called Wunda, near the edge of the picture. Nobody knows what the bright material is.',
      ] },
      { title: 'What it is made of', paras: [
        'Umbriel is 1,169 km across. Its density, 1.52 times that of water, says it is roughly half ice and half rock. It goes round Uranus in 4.1 days at 266,000 km.',
      ] },
      { title: 'How it was found', paras: [
        'William Lassell found it on 24 October 1851 in England, on the same night as Ariel, and John Herschel named it in 1852 after a gloomy sprite in a poem by Alexander Pope.',
      ] },
      { title: 'Spacecraft that have seen it', paras: [
        'Only Voyager 2, on 24 January 1986, which saw only its southern half.',
      ] },
      { title: 'What is still unknown', paras: [
        'Why it is so much darker than Ariel, though the two are about the same size, and what the bright ring is made of.',
      ] },
    ],
    sources: [
      { label: 'NASA, Umbriel', url: 'https://science.nasa.gov/uranus/moons/umbriel/' },
      { label: 'NASA Image and Video Library, PIA00040', url: 'https://images.nasa.gov/details/PIA00040' },
    ],
  },

  titania: {
    lead: 'The largest moon of Uranus, a world of ice and rock marked by a canyon system and covered in craters.',
    picture: {
      src: '/img/learn/titania-voyager2-1986.jpg', width: 784, height: 560,
      alt: 'A pale grey, round moon with bright streaks and many circular craters, and a long curved valley near its right edge.',
      caption: '<b>A photograph.</b> Titania on 24 January 1986, from NASA’s Voyager 2 spacecraft at a distance of about 500,000 km. A long canyon curves near the right-hand edge. Credit: NASA/JPL.',
    },
    chapters: [
      { title: 'What it looks like up close', paras: [
        'Titania is covered in craters, with a few big ones, and cut by canyons. The longest, Messina Chasmata, runs for about 1,500 km, which shows that the crust has stretched and cracked as the inside changed.',
      ] },
      { title: 'What it is made of', paras: [
        'Titania is 1,578 km across, a little under half the width of our Moon, and the eighth largest moon in the Solar System. Its density, 1.65 times that of water, says it is about half ice and half rock.',
        'It goes round Uranus in 8.7 days at 436,000 km.',
      ] },
      { title: 'How it was found', paras: [
        'William Herschel found it on 11 January 1787, along with Oberon, only six years after he had found Uranus itself. It was John Herschel, his son, who named them, in 1852, after the king and queen of the fairies in Shakespeare’s A Midsummer Night’s Dream.',
      ] },
      { title: 'Spacecraft that have seen it', paras: [
        'Only Voyager 2, on 24 January 1986, from about 365,000 km.',
      ] },
      { title: 'What is still unknown', paras: [
        'Whether it has kept any warmth, and whether a liquid layer lies deep inside. Voyager’s pictures cover only the southern half.',
      ] },
    ],
    sources: [
      { label: 'NASA, Titania', url: 'https://science.nasa.gov/uranus/moons/titania/' },
      { label: 'NASA Image and Video Library, PIA01979', url: 'https://images.nasa.gov/details/PIA01979' },
    ],
  },

  oberon: {
    lead: 'The outermost of the five big moons of Uranus, an old, heavily cratered world whose crater floors are dark and whose bright rays mark fresh impacts.',
    picture: {
      src: '/img/learn/oberon-voyager2-1986.jpg', width: 500, height: 500,
      alt: 'A pale, pinkish-grey, round moon thickly covered in craters, some with bright rays spreading from them and some with dark floors.',
      caption: '<b>A photograph, in colour.</b> Oberon on 24 January 1986, from NASA’s Voyager 2 spacecraft. Several large craters have bright rays, and some have dark floors. Credit: NASA/JPL.',
    },
    chapters: [
      { title: 'What it looks like up close', paras: [
        'Oberon is crowded with craters, which marks it as old. Several have bright rays of fresh ice thrown out around them, and some have floors that are dark, as though a dark material had risen from below and filled them.',
      ] },
      { title: 'What it is made of', paras: [
        'Oberon is 1,523 km across. Its density, 1.66 times that of water, says it is about half ice and half rock. It is the farthest of the five from Uranus, at 583,500 km, and goes round once in 13.5 days.',
      ] },
      { title: 'How it was found', paras: [
        'William Herschel found it on 11 January 1787, on the same night as Titania. John Herschel named it in 1852 after the king of the fairies in A Midsummer Night’s Dream.',
      ] },
      { title: 'Spacecraft that have seen it', paras: [
        'Only Voyager 2, on 24 January 1986, which photographed it from about 470,000 km.',
      ] },
      { title: 'What is still unknown', paras: [
        'What the dark material on the crater floors is, and whether it came from inside Oberon or from outside it. The northern half has never been seen.',
      ] },
    ],
    sources: [
      { label: 'NASA, Oberon', url: 'https://science.nasa.gov/uranus/moons/oberon/' },
      { label: 'NASA Image and Video Library, PIA00034', url: 'https://images.nasa.gov/details/PIA00034' },
    ],
  },

  hyperion: {
    lead: 'A small moon of Saturn shaped like a battered sponge, which tumbles chaotically as it goes round and is full of holes.',
    picture: {
      src: '/img/learn/hyperion-cassini-2011.jpg', width: 940, height: 940,
      alt: 'A grey, lumpy, crescent-shaped moon pitted all over with deep craters, lit from one side against black.',
      caption: '<b>A photograph.</b> The sunlit southern part of Hyperion, from NASA’s Cassini spacecraft. The moon’s south pole is near the bottom of the lit ground. Credit: NASA/JPL/Space Science Institute.',
    },
    chapters: [
      { title: 'What it looks like up close', paras: [
        'Hyperion is the most unusual-looking moon of Saturn. It is not round, but lumpy, about 360 km by 260 km by 205 km, and covered in deep, sharp-edged craters that give it the look of a sea sponge. Dark material has collected on the crater floors.',
        'The reason for the sponge look is the moon’s make-up. It is so loose, and so full of empty space, that a falling rock does not throw out much debris. It punches in and packs the material down, leaving a deep hole.',
      ] },
      { title: 'What it is made of', paras: [
        'Hyperion’s density, 0.54 times that of water, is lower than ice. It must therefore be mostly ice with a great deal of empty space inside, perhaps two-fifths of its volume.',
        'It tumbles. Its axis of spin wobbles chaotically, so that nobody can predict which way it will be pointing years ahead. It was the first moon found to behave like this. It goes round Saturn every 21.3 days at 1.48 million km, in a path stretched enough that its distance changes by about a tenth, locked in step with Titan: it goes round three times for every four of Titan’s trips.',
      ] },
      { title: 'How it was found', paras: [
        'William Bond and his son George Bond found it on 16 September 1848 at Harvard College Observatory in Massachusetts, and William Lassell found it independently two days later in England. John Herschel had suggested names from Greek myth for Saturn’s moons, and Hyperion was one of the Titans, a brother of Cronus.',
      ] },
      { title: 'Spacecraft that have seen it', paras: [
        'Voyager 2 saw it in 1981, and its tumbling was worked out afterwards. The Cassini spacecraft flew past it several times, the closest, in September 2005, at about 500 km.',
      ] },
      { title: 'What is still unknown', paras: [
        'How such a loose, porous body could form and survive. One idea is that Hyperion is a piece of a larger moon that was broken up long ago.',
      ] },
    ],
    sources: [
      { label: 'NASA, Hyperion', url: 'https://science.nasa.gov/saturn/moons/hyperion/' },
      { label: 'NASA Image and Video Library, PIA12748', url: 'https://images.nasa.gov/details/PIA12748' },
    ],
  },

  eros: {
    lead: 'A long, peanut-shaped asteroid that passes inside the orbit of Mars, and the first asteroid that a spacecraft orbited and then landed on.',
    picture: {
      src: '/img/learn/eros-near-2000.jpg', width: 760, height: 838,
      alt: 'A grey, elongated, cratered rock with a saddle-shaped dip in the middle, lit from the right against black.',
      caption: '<b>A picture made from photographs.</b> The northern half of Eros, put together from pictures taken by NASA’s NEAR Shoemaker spacecraft in 2000. The dip in the middle is the saddle. Credit: NASA/JPL/JHUAPL.',
    },
    chapters: [
      { title: 'What it looks like', paras: [
        'Eros is shaped like a bent loaf, about 34 km long and 11 km wide, and it turns end over end every five hours and 16 minutes. A broad dip, the saddle, bends it in the middle. The surface is covered in craters, the largest, Himeros, about 11 km across, and in loose boulders and a layer of fine dust.',
        'NEAR Shoemaker also found that the dust is not evenly spread. It has settled in pools in the low places, with flat floors, and the high ground is scoured clean.',
      ] },
      { title: 'What it is made of', paras: [
        'Eros is made of rock, a stony asteroid of the kind that is common among the near-Earth asteroids. It is one of the largest of them. It is not a pile of rubble, as some asteroids are: its ridges and grooves run across the whole body, which suggests that it is one solid piece, cracked but not shattered.',
        'It takes 1.76 years to go round the Sun, at an average of 1.46 au, in a path stretched enough to take it from just outside the Earth’s orbit to a little beyond Mars’s.',
      ] },
      { title: 'How it was found', paras: [
        'Gustav Witt in Berlin and Auguste Charlois in Nice found it independently on the same night, 13 August 1898. It was the first near-Earth asteroid to be found. It was named after the Greek god of love.',
        'Because it comes close, Eros was one of the best ways to measure the distance to the Sun. Astronomers watched it in 1900 to 1901 and again in 1930 to 1931 and used the shift in its position against the stars to work out the size of the Solar System.',
      ] },
      { title: 'Spacecraft that have visited', paras: [
        'NASA’s NEAR Shoemaker spacecraft flew past Eros in December 1998, went into orbit round it on 14 February 2000, and spent a year mapping it. On 12 February 2001 it came down gently on the surface, though it was never designed to land, and went on sending signals for about two weeks. It was the first landing on an asteroid.',
      ] },
      { title: 'Could it hit the Earth?', paras: [
        'Not in the foreseeable future. Eros’s orbit does not cross the Earth’s, and it never comes closer than about 22 million km, which is about 57 times the distance to the Moon.',
      ] },
    ],
    sources: [
      { label: 'NASA, 433 Eros', url: 'https://science.nasa.gov/solar-system/asteroids/433-eros/' },
      { label: 'NASA, NEAR Shoemaker', url: 'https://science.nasa.gov/mission/near-shoemaker/' },
      { label: 'NASA Image and Video Library, PIA02923', url: 'https://images.nasa.gov/details/PIA02923' },
    ],
  },

  ida: {
    lead: 'A long, battered asteroid in the main belt, and the first asteroid found to have a moon of its own.',
    picture: {
      src: '/img/learn/ida-dactyl-galileo.jpg', width: 580, height: 400,
      alt: 'A large, elongated, cratered rock in a tawny colour with a tiny round moon to its right, and a small boxed inset showing the same rock in grey.',
      caption: '<b>A photograph, with the colours stretched.</b> Ida and its small moon Dactyl, from NASA’s Galileo spacecraft in 1993. The colours are enhanced to show differences in the ground, and the small inset is Ida in more natural light. Credit: NASA/JPL/USGS.',
    },
    chapters: [
      { title: 'What it looks like', paras: [
        'Ida is about 60 km long and 25 km wide, shaped like a lumpy loaf, and thickly covered in craters. Its surface is a layer of loose dust and broken rock, and a few huge boulders lie on it. It spins once every 4.6 hours.',
        'Its crater count, which grows with age, suggests that its surface is a billion years old or more, older than that of Gaspra.',
      ] },
      { title: 'What it is made of', paras: [
        'Ida is a stony asteroid and belongs to the Koronis family, a group of asteroids that are probably the pieces of a larger body broken up by a collision long ago. It goes round the Sun in 4.8 years at 2.86 au, in the main belt.',
      ] },
      { title: 'How it was found', paras: [
        'The Austrian astronomer Johann Palisa found it on 29 September 1884 in Vienna. It is named after Mount Ida in Crete, where, in Greek myth, a nymph named Ida nursed the infant Zeus.',
      ] },
      { title: 'Spacecraft that have visited', paras: [
        'NASA’s Galileo spacecraft, on its way to Jupiter, passed Ida on 28 August 1993 at about 2,400 km. Months later, Ann Harch, a member of the Galileo imaging team, spotted a small object beside Ida in the pictures. It was Dactyl, a moon about 1.4 km across, the first confirmed moon of an asteroid. It is named after the Dactyls, mythical beings who lived on Mount Ida.',
      ] },
      { title: 'Could it hit the Earth?', paras: [
        'No. Ida stays in the main belt, well beyond Mars.',
      ] },
    ],
    sources: [
      { label: 'NASA, 243 Ida', url: 'https://science.nasa.gov/solar-system/asteroids/243-ida/' },
      { label: 'NASA, Galileo', url: 'https://science.nasa.gov/mission/galileo/' },
      { label: 'NASA Image and Video Library, PIA00333', url: 'https://images.nasa.gov/details/PIA00333' },
    ],
  },

  gaspra: {
    lead: 'A small, angular asteroid in the main belt, and the first asteroid that a spacecraft photographed close up.',
    picture: {
      src: '/img/learn/gaspra-galileo-1991.jpg', width: 1024, height: 1024,
      alt: 'A grey, angular, lumpy rock with a few craters and flat faces, lit from the left against black.',
      caption: '<b>A picture made from photographs.</b> Gaspra from NASA’s Galileo spacecraft on 29 October 1991, a mosaic of two pictures taken from 5,300 km about ten minutes before the closest approach. Credit: NASA/JPL.',
    },
    chapters: [
      { title: 'What it looks like', paras: [
        'Gaspra is about 18 km long and 9 km wide, and angular, with flat faces and a few shallow dents. It has fewer craters than Ida, which means that it is younger, perhaps tens to a few hundred million years old. Grooves and ridges run across it.',
      ] },
      { title: 'What it is made of', paras: [
        'Gaspra is a stony asteroid and is thought to belong to the Flora family. It goes round the Sun in 3.3 years at 2.2 au, in the inner part of the main belt, in a path that is noticeably stretched.',
      ] },
      { title: 'How it was found', paras: [
        'The Russian astronomer Grigory Neujmin found it on 30 July 1916 at the Simeiz Observatory in Crimea. It is named after the resort town of Gaspra, on the Crimean coast.',
      ] },
      { title: 'Spacecraft that have visited', paras: [
        'NASA’s Galileo spacecraft, on its way to Jupiter, passed Gaspra on 29 October 1991 at about 1,600 km. It was the first close look at any asteroid. Galileo’s main antenna had failed to open, so the pictures came back slowly over the following year.',
      ] },
      { title: 'Could it hit the Earth?', paras: [
        'No. Gaspra stays in the main belt, between Mars and Jupiter.',
      ] },
    ],
    sources: [
      { label: 'NASA, Galileo', url: 'https://science.nasa.gov/mission/galileo/' },
      { label: 'NASA Image and Video Library, PIA00118', url: 'https://images.nasa.gov/details/PIA00118' },
    ],
  },

  mathilde: {
    lead: 'A very dark, very light-weight asteroid, 52 km across, which has been hit by craters nearly as large as itself and has not broken.',
    picture: {
      src: '/img/learn/mathilde-near-1997.jpg', width: 640, height: 398,
      alt: 'Two views of a dark, rounded and craggy rock, the left one partly in shadow and the right one lit from the left.',
      caption: '<b>Two photographs.</b> Mathilde from NASA’s NEAR Shoemaker spacecraft, on its flyby of 27 June 1997. Only part of the asteroid was lit and seen. Credit: NASA/JPL/JHUAPL.',
    },
    chapters: [
      { title: 'What it looks like', paras: [
        'Mathilde is as black as charcoal, and covered in craters, several nearly as wide as the asteroid’s own radius, the biggest about 33 km across. A hit that large would be expected to smash a solid body to pieces. That Mathilde survived suggests that it is loose and soft inside, so that an impact is absorbed and not passed through.',
        'NEAR Shoemaker saw only about 60 per cent of the surface, the rest being in darkness during the flyby.',
      ] },
      { title: 'What it is made of', paras: [
        'Measuring how Mathilde pulled the spacecraft as it passed gave its mass, and so its density: about 1.3 times that of water, which is about half what the dark, carbon-rich rock it seems to be made of would weigh if it were solid. About half of Mathilde must therefore be empty space. It is probably a rubble pile, held together only by its own gravity.',
        'It turns very slowly, once every 17.4 days, one of the slowest-spinning asteroids known. It goes round the Sun in 4.3 years at 2.65 au.',
      ] },
      { title: 'How it was found', paras: [
        'Johann Palisa found it on 12 November 1885 in Vienna and named it after Mathilde Loewy, the wife of Moritz Loewy, an astronomer at the Paris Observatory.',
      ] },
      { title: 'Spacecraft that have visited', paras: [
        'NASA’s NEAR Shoemaker spacecraft, on its way to Eros, passed Mathilde on 27 June 1997 at about 1,200 km. It was the first visit to a dark, carbon-rich asteroid.',
      ] },
      { title: 'Could it hit the Earth?', paras: [
        'No. Mathilde stays in the main belt.',
      ] },
    ],
    sources: [
      { label: 'NASA, 253 Mathilde', url: 'https://science.nasa.gov/solar-system/asteroids/253-mathilde/' },
      { label: 'NASA Image and Video Library, PIA02479', url: 'https://images.nasa.gov/details/PIA02479' },
    ],
  },

  didymos: {
    lead: 'A small double asteroid that passes near the Earth, and the target of the first test in which a spacecraft moved a space rock.',
    picture: {
      src: '/img/learn/dimorphos-dart-2-seconds.jpg', width: 1100, height: 1100,
      alt: 'A grey surface completely covered in sharp-edged boulders and rubble, lit from one side, filling the whole picture.',
      caption: '<b>A photograph.</b> The surface of Dimorphos, the small moon of Didymos, about two seconds before NASA’s DART spacecraft hit it on 26 September 2022. Credit: NASA/Johns Hopkins APL.',
    },
    chapters: [
      { title: 'What it looks like', paras: [
        'Didymos is a rounded, spinning-top-shaped rock about 780 m across, which turns once every 2.3 hours. It has a small moon, Dimorphos, about 160 m wide. The surface of Dimorphos, seen by DART, is a heap of boulders with hardly any fine dust.',
      ] },
      { title: 'What it is made of', paras: [
        'Both are loose piles of rock, held together by their weak gravity. They go round the Sun in 2.1 years, in a path that reaches from about the Earth’s orbit to well beyond Mars’s.',
      ] },
      { title: 'How it was found', paras: [
        'Didymos was found in April 1996 by the Spacewatch survey at Kitt Peak in Arizona. Its moon was found in 2003, when astronomers noticed its brightness dipping regularly as the two passed in front of each other. The name is Greek for twin.',
      ] },
      { title: 'Spacecraft that have visited', paras: [
        'NASA’s DART spacecraft flew into Dimorphos at about 6 km a second on 26 September 2022, to find out whether a hit could change an asteroid’s path. It shortened the moon’s orbit round Didymos by 32 minutes, from about 11 hours 55 minutes to about 11 hours 23 minutes, a bigger change than the mission had set as its goal.',
        'The European Space Agency’s Hera spacecraft, launched in October 2024, is due at the pair in November 2026 to measure the crater and the masses of the two bodies.',
      ] },
      { title: 'Could it hit the Earth?', paras: [
        'Neither Didymos nor Dimorphos is a danger. The test was made on a harmless pair so that the result could be measured, and the orbit of Didymos round the Sun was not changed in any way that matters.',
      ] },
    ],
    sources: [
      { label: 'NASA, DART', url: 'https://science.nasa.gov/mission/dart/' },
      { label: 'NASA, DART confirms asteroid moon’s orbit changed (2022)', url: 'https://www.nasa.gov/news-release/nasa-confirms-dart-mission-impact-changed-asteroids-motion-in-space/' },
      { label: 'ESA, Hera', url: 'https://www.esa.int/Space_Safety/Hera' },
    ],
  },

  'hartley-2': {
    lead: 'A small comet with a peanut-shaped nucleus whose jets are driven by carbon dioxide, and whose water is like the Earth’s.',
    picture: {
      src: '/img/learn/comet-hartley-2-epoxi-2010.jpg', width: 509, height: 444,
      alt: 'A grey, peanut-shaped lump of rock and ice against black, with bright jets spraying from its right-hand end.',
      caption: '<b>A photograph.</b> The nucleus of comet Hartley 2 from NASA’s EPOXI mission on 4 November 2010, with jets of dust and ice spraying from its ends. Credit: NASA/JPL-Caltech/UMD.',
    },
    chapters: [
      { title: 'Its tail and its head', paras: [
        'The nucleus of Hartley 2 is only about 2 km long, shaped like a peanut, with a narrow waist between two rough lobes. The jets that spray from it were found to be driven by carbon dioxide, which turns to gas at a lower temperature than water. They carry out lumps of ice the size of golf balls and bigger, which could be seen as a cloud round the nucleus.',
        'It spins unusually, tumbling as well as turning, and its rotation changes from one orbit to the next.',
      ] },
      { title: 'Its path round the Sun', paras: [
        'Hartley 2 goes round the Sun once every 6.5 years, in a path that carries it from beyond Jupiter’s orbit to just outside the Earth’s. Jupiter’s pull has shaped it, which makes it one of the comets of the Jupiter family.',
        'Measurements made by the Herschel space telescope in 2011 showed that its water has the same mix of ordinary and heavy hydrogen as the Earth’s oceans. That supports the idea that comets like this one may have brought some of the Earth’s water.',
      ] },
      { title: 'How it was found', paras: [
        'The British-born astronomer Malcolm Hartley found it on 15 March 1986 with the Schmidt telescope at Siding Spring Observatory in New South Wales. Its official name is 103P/Hartley.',
      ] },
      { title: 'Spacecraft that have visited', paras: [
        'NASA’s EPOXI mission, the second job of the Deep Impact spacecraft, flew past Hartley 2 on 4 November 2010 at about 700 km and took the pictures shown here.',
      ] },
      { title: 'When to see it', paras: [
        'Hartley 2 is faint. It was easy in binoculars in the autumn of 2010, when it passed close to the Earth, but at most other returns it needs a telescope.',
      ] },
    ],
    sources: [
      { label: 'NASA, comet Hartley 2', url: 'https://science.nasa.gov/solar-system/comets/103p-hartley-hartley-2/' },
      { label: 'NASA, EPOXI', url: 'https://science.nasa.gov/mission/deep-impact-epoxi/' },
      { label: 'Hartogh and others, Nature 478 (2011): ocean-like water in comet Hartley 2', url: 'https://www.nature.com/articles/nature10519' },
    ],
  },

  'wild-2': {
    lead: 'A comet whose dust was caught by a spacecraft and brought back to the Earth, and whose grains turned out to include minerals made near the young Sun.',
    picture: {
      src: '/img/learn/wild-2-stardust-2004.jpg', width: 390, height: 352,
      alt: 'A pitted, rounded grey lump on a grey background, with steep-sided hollows and rough ground.',
      caption: '<b>A photograph.</b> The nucleus of comet Wild 2, from the navigation camera of NASA’s Stardust spacecraft on 2 January 2004. Credit: NASA/JPL-Caltech.',
    },
    chapters: [
      { title: 'Its tail and its head', paras: [
        'The nucleus of Wild 2 is about 4 to 5 km across and, to the surprise of the scientists, rough and full of pits, with steep walls and flat floors, some of them nearly 2 km wide. Fresh comets were expected to be smooth. Jets of dust and gas were seen rising from its surface.',
      ] },
      { title: 'Its path round the Sun', paras: [
        'Wild 2 goes round the Sun in 6.4 years, between about 1.6 au and 5.3 au. Until 1974 it travelled in a much wider path, but a close pass by Jupiter that year bent its orbit inwards, to its present path. That makes it a young visitor to the inner Solar System, so its surface has not yet been worn down by many visits.',
      ] },
      { title: 'How it was found', paras: [
        'The Swiss astronomer Paul Wild found it on 6 January 1978 at Zimmerwald, near Bern, from photographs. It is named for him, and is said “Vilt”. Its official name is 81P/Wild.',
      ] },
      { title: 'Spacecraft that have visited', paras: [
        'NASA’s Stardust spacecraft flew through the cloud of dust round Wild 2 on 2 January 2004, passing about 240 km from the nucleus. It caught grains in a tray of aerogel, a spongelike glass that stops them without destroying them, and sent a capsule back to the Earth. The capsule landed in the Utah desert on 15 January 2006.',
        'The grains were a surprise. Some were minerals that form only at very high temperatures, so they must have been made close to the young Sun and carried far out to the cold zone where the comet formed. An amino acid, glycine, was also found in the samples.',
      ] },
      { title: 'When to see it', paras: [
        'Wild 2 is always faint, and needs a good telescope even at its brightest.',
      ] },
    ],
    sources: [
      { label: 'NASA, Stardust', url: 'https://science.nasa.gov/mission/stardust/' },
      { label: 'NASA, comet Wild 2', url: 'https://science.nasa.gov/solar-system/comets/81p-wild/' },
      { label: 'NASA Image and Video Library, PIA05571', url: 'https://images.nasa.gov/details/PIA05571' },
    ],
  },

  'tempel-1': {
    lead: 'The comet that NASA hit on purpose in 2005, to see what a comet is like under its surface.',
    picture: {
      src: '/img/learn/tempel-1-deep-impact-2005.jpg', width: 900, height: 900,
      alt: 'A grey, lumpy, cratered comet nucleus lit from the left, with a huge burst of white light and rays at its lower right edge.',
      caption: '<b>A photograph.</b> Comet Tempel 1 on 4 July 2005, 67 seconds after NASA’s Deep Impact probe hit it, taken by the camera on the main spacecraft. The flash is sunlight on the cloud thrown up by the hit. Credit: NASA/JPL-Caltech/UMD.',
    },
    chapters: [
      { title: 'Its tail and its head', paras: [
        'The nucleus of Tempel 1 is about 6 km across on average, longer than it is wide, like an uneven potato. Its surface is a patchwork: rough, layered ground, a few craters and smooth areas that look as though something once flowed across them.',
        'The impact showed that the nucleus is made mostly of fine dust, as fine as talcum powder, with ice mixed in. The cloud thrown up held more dust than expected, and the surface seems to be made of loose, fluffy material with little strength. Scientists began to describe comets as icy dirtballs as much as dirty snowballs.',
      ] },
      { title: 'Its path round the Sun', paras: [
        'Tempel 1 goes round the Sun in 5.6 years, from about the orbit of Mars to almost as far out as Jupiter’s, in a path tilted 10° to the planets’.',
      ] },
      { title: 'How it was found', paras: [
        'The German astronomer Wilhelm Tempel found it on 3 April 1867 from Marseille, where he was working at the observatory. Its official name is 9P/Tempel 1.',
      ] },
      { title: 'Spacecraft that have visited', paras: [
        'NASA’s Deep Impact spacecraft released a copper-cored impactor of about 370 kg on 3 July 2005, which hit the nucleus the next day at about 10 km a second. The main spacecraft watched from about 500 km away.',
        'In February 2011 NASA’s Stardust spacecraft, on a second mission, flew past Tempel 1 and photographed the crater, about 150 m wide.',
      ] },
      { title: 'When to see it', paras: [
        'Tempel 1 is faint and needs a telescope, even at its best.',
      ] },
    ],
    sources: [
      { label: 'NASA, comet Tempel 1', url: 'https://science.nasa.gov/solar-system/comets/9p-tempel-1/' },
      { label: 'NASA, Deep Impact', url: 'https://science.nasa.gov/mission/deep-impact-epoxi/' },
      { label: 'NASA Image and Video Library, PIA02137', url: 'https://images.nasa.gov/details/PIA02137' },
    ],
  },

  borrelly: {
    lead: 'A comet with a bowling-pin shape, one of the darkest objects known in the Solar System, which a spacecraft flew past in 2001.',
    picture: {
      src: '/img/learn/borrelly-deep-space-1-2001.jpg', width: 500, height: 500,
      alt: 'A bright white, elongated, bowling-pin-shaped comet nucleus on black, with faint jets of dust streaming from it to the lower left.',
      caption: '<b>A photograph, brightened.</b> Comet Borrelly on 22 September 2001, from NASA’s Deep Space 1 spacecraft. The picture is enhanced to show dust streaming off, which is why the nucleus looks so white. Credit: NASA/JPL.',
    },
    chapters: [
      { title: 'Its tail and its head', paras: [
        'The nucleus of Borrelly is about 8 km long and 4 km wide, like a bowling pin. It is far darker than it looks in the picture above. It reflects only about 3 per cent of the light that falls on it, darker than charcoal.',
        'Deep Space 1 found that the surface is hot and dry for a comet, with no ice showing. Jets of gas and dust come from a few spots on it. They show in the picture as streams, and are fed from ice below the surface.',
      ] },
      { title: 'Its path round the Sun', paras: [
        'Borrelly goes round the Sun in 6.9 years, from just outside the Earth’s orbit to beyond Jupiter’s, in a path tilted 29° to the planets’.',
      ] },
      { title: 'How it was found', paras: [
        'The French astronomer Alphonse Borrelly found it on 28 December 1904 at the Marseille Observatory. Its official name is 19P/Borrelly.',
      ] },
      { title: 'Spacecraft that have visited', paras: [
        'NASA’s Deep Space 1 passed Borrelly on 22 September 2001 at about 2,200 km. The spacecraft’s main job was to test new technology, such as a gas-ion engine. Its flyby of Borrelly, at the end of its mission, was a bonus, and returned the sharpest pictures of a comet up to then.',
      ] },
      { title: 'When to see it', paras: [
        'Borrelly is faint, and needs a telescope even at its best.',
      ] },
    ],
    sources: [
      { label: 'NASA, comet Borrelly', url: 'https://science.nasa.gov/solar-system/comets/19p-borrelly/' },
      { label: 'NASA, Deep Space 1', url: 'https://science.nasa.gov/mission/deep-space-1/' },
      { label: 'NASA Image and Video Library, PIA03501', url: 'https://images.nasa.gov/details/PIA03501' },
    ],
  },

  bennu: {
    lead: 'A small, dark asteroid shaped like a spinning top, from which NASA brought back a sample in 2023.',
    picture: {
      src: '/img/learn/bennu-osiris-rex-regolith.jpg', width: 1100, height: 731,
      alt: 'A rough grey surface strewn with rocks of every size, with two smaller close-up views at the right, one of rubble and one of a smoother patch.',
      caption: '<b>Photographs.</b> A part of Bennu’s northern hemisphere, about 180 m wide, from NASA’s OSIRIS-REx spacecraft: a wide view at the left and two close-ups at the right. There are boulders everywhere, and a smooth “pond” of finer material. Credit: NASA/Goddard/University of Arizona.',
    },
    chapters: [
      { title: 'What it looks like', paras: [
        'Bennu is about 490 m across, roughly as tall as the Empire State Building, round at its middle and narrowing to the poles, like a spinning top. It turns once every 4.3 hours. Its surface is very dark and strewn with boulders, some as big as a house, with a few ponds of finer material.',
        'OSIRIS-REx also saw Bennu throw off small particles in 2019, the first time a spacecraft watched an asteroid do so.',
      ] },
      { title: 'What it is made of', paras: [
        'Bennu is a loose pile of rubble, held together by its weak gravity, made of dark, carbon-rich rock. It takes 1.2 years to go round the Sun, in a path that crosses the Earth’s.',
        'The sample was studied by many laboratories. It contained clays that hold water, carbon-rich compounds, salts left by water that once evaporated, and 14 of the 20 amino acids that living things use. These are ingredients of life; they are not life, and they are made without it.',
      ] },
      { title: 'How it was found', paras: [
        'It was found on 11 September 1999 by the LINEAR survey in New Mexico. It was named in 2013 after a contest, which was won by Michael Puzio, a nine-year-old in North Carolina, who suggested Bennu, an Egyptian bird associated with creation.',
      ] },
      { title: 'Spacecraft that have visited', paras: [
        'NASA’s OSIRIS-REx reached Bennu in December 2018, mapped it, touched the surface on 20 October 2020 and collected rock and dust, then left in May 2021. Its capsule landed in the Utah desert on 24 September 2023 with about 121.6 grams. The spacecraft itself went on to a new target, the asteroid Apophis, under a new name, OSIRIS-APEX.',
      ] },
      { title: 'Could it hit the Earth?', paras: [
        'There is a small chance. After OSIRIS-REx measured its path, NASA worked out that the highest single risk is about 1 in 2,700 on 24 September 2182, and the total risk to the year 2300 is about 1 in 1,750. So the odds are overwhelmingly that it will miss.',
      ] },
    ],
    sources: [
      { label: 'NASA, OSIRIS-REx', url: 'https://science.nasa.gov/mission/osiris-rex/' },
      { label: 'NASA, Bennu', url: 'https://science.nasa.gov/solar-system/asteroids/101955-bennu/' },
      { label: 'NASA Image and Video Library, Bennu’s northern hemisphere close up', url: 'https://images.nasa.gov/details/2019-02-25_regolith_image_compilation' },
    ],
  },

  'hale-bopp': {
    lead: 'One of the brightest comets of the last century, visible to the naked eye for about eighteen months around 1997.',
    picture: {
      src: '/img/learn/comet-hale-bopp-1997-eso.jpg', width: 1100, height: 773,
      alt: 'A comet with a bright head and two tails against a field of stars: a straight blue one and a wide, curved, cream-coloured one.',
      caption: '<b>A photograph.</b> Comet Hale-Bopp on 14 March 1997. It has two tails. The straight blue one is gas, blown directly away from the Sun by the wind. The wide pale one is dust, which lags behind along the comet’s path. Credit: ESO/E. Slawik, CC BY 4.0.',
    },
    chapters: [
      { title: 'Its tail and its head', paras: [
        'Hale-Bopp’s nucleus is one of the largest comets seen in modern times, possibly 60 km across, several times the size of the nucleus of Halley’s comet. That is why it was so bright, and why it was visible for so long. At its best it had two tails, a long curving tail of dust and a straight, blue tail of gas, and a third, a faint tail of sodium, which had not been seen before in a comet.',
      ] },
      { title: 'Its path round the Sun', paras: [
        'Its path is a very long oval, tilted nearly at right angles to the planets’. Its last visit was about 4,200 years ago, and it will not return for about 2,500 years. Its nearest approach to the Sun was 0.91 au on 1 April 1997, and its nearest to the Earth was 1.3 au on 22 March 1997, about 200 million km.',
        'A pass near Jupiter in 1996 shortened its period, from about 4,200 years to about 2,500.',
      ] },
      { title: 'How it was found', paras: [
        'Two Americans found it independently, on the same night, 23 July 1995. Alan Hale, near Cloudcroft in New Mexico, saw it by chance while he was observing another comet. Thomas Bopp, in the Arizona desert, found it with a friend’s telescope. The comet was still far out, beyond Jupiter’s orbit, and much brighter than a comet should be at that distance, which showed it would be a great one.',
      ] },
      { title: 'Spacecraft that have visited', paras: [
        'None. It was watched from the ground and from space telescopes, including Hubble.',
      ] },
      { title: 'When to see it', paras: [
        'Not again for thousands of years. It was easy to see without a telescope for about eighteen months, in 1996 and 1997.',
      ] },
    ],
    sources: [
      { label: 'NASA, comet Hale-Bopp', url: 'https://science.nasa.gov/solar-system/comets/c-1995-o1-hale-bopp/' },
      { label: 'ESO, Comet Hale-Bopp', url: 'https://www.eso.org/public/images/phot-mar14-hbs-2/' },
    ],
  },
};
