// Full pages for worlds that began as outlines. Each chapter matches a heading in CHAPTERS (src/lib/worlds.ts).
// Every figure is from the sources listed with it. Counts carry their date. No first person.
export interface WorldPage {
  picture: { src: string; alt: string; caption: string; width: number; height: number };
  chapters: { title: string; paras: string[] }[];
  sources: { label: string; url: string }[];
}

export const WORLD_PAGES: Record<string, WorldPage> = {
  titan: {
    picture: {
      src: '/img/learn/titan-surface-huygens.jpg', width: 311, height: 623,
      alt: 'An orange, hazy plain strewn with rounded pale pebbles, the nearest a hand’s width across.',
      caption: '<b>A photograph.</b> The surface of Titan, taken on 14 January 2005 by the European Space Agency’s Huygens probe after it landed. The colour was worked out from the probe’s own measurements of the light. Credit: NASA/JPL/ESA/University of Arizona.',
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
        'The Cassini spacecraft went into orbit round Saturn in 2004 and stayed until 2017, flying past Titan 127 times on purpose. It carried the European Space Agency’s Huygens probe, which parachuted through Titan’s air on 14 January 2005 and landed on a damp plain of rounded pebbles. It was the first landing on any world in the outer Solar System, and it is still the most distant.',
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
};
