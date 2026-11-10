// The eight places past the worlds that the 3D view can fly out to, from the whole Solar System to
// the oldest light. One list, used by the atlas, the Codex and the sources page, so that the name,
// the credit and the words on what is measured and what is a model can never drift apart.
//
// The ids are the engine's (Context.near and flyTo), in order going outwards.
// flies there, measured from the Sun, and is only used to put the places in order on a scale.
import type { Source } from './types';

export interface Credit extends Source { licence?: string }

export interface Place {
  id: string;
  name: string;
  /** One plain sentence on what you see from there. */
  what: string;
  /** What the 3D view draws there, and how far to trust it. */
  drawn: string;
  /** True when part of what is drawn there is a model and not a map. */
  model: boolean;
  /** The flat chart of this place in the atlas, where there is one. */
  chart?: string;
  credits: Credit[];
}

export const HYG: Credit = { label: 'HYG star database v4.4, David Nash', url: 'https://codeberg.org/astronexus/hyg', licence: 'CC BY-SA 4.0' };
/** The line figures of the constellations, for the layer that draws them. */
export const D3_CELESTIAL: Credit = { label: 'd3-celestial, Olaf Frohn (constellation lines)', url: 'https://github.com/ofrohn/d3-celestial', licence: 'BSD 3-Clause' };
export const MCCONNACHIE: Credit = { label: 'McConnachie 2012, Astronomical Journal 144, 4', url: 'https://doi.org/10.1088/0004-6256/144/1/4' };
export const TWO_MRS: Credit = { label: 'Huchra et al. 2012, Astrophysical Journal Supplement 199, 26 (the 2MASS Redshift Survey)', url: 'https://doi.org/10.1088/0067-0049/199/2/26' };
export const WMAP: Credit = { label: 'WMAP nine-year map, NASA / WMAP Science Team', url: 'https://lambda.gsfc.nasa.gov/product/wmap/dr5/ilc_map_get.html' };

export const places: Place[] = [
  { id: 'solar-system', chart: '/atlas/solar-system', name: 'The Solar System', model: true,
    what: 'Every planet’s orbit in one view, with the Sun a point of light in the middle.',
    drawn: 'The worlds are where they really are today. The haze of the Kuiper belt past Neptune is a model: only a few thousand of its bodies have ever been seen.',
    credits: [] },
  { id: 'oort-cloud', name: 'The Oort cloud', model: true,
    what: 'The shell of far comets round the Sun, about a light year and a half out.',
    drawn: 'The Oort cloud drawn here is a model. Nobody has seen it. Its size and shape are worked back from the comets that fall in from it. The stars beyond it are real, and the constellation figures are lines drawn between them.',
    credits: [HYG, D3_CELESTIAL] },
  { id: 'neighbourhood', chart: '/atlas/stars#figure-near', name: 'The Sun’s neighbourhood', model: false,
    what: 'The stars within a few dozen light years, with the Sun one among them.',
    drawn: 'Every star is a real one, at its measured distance and with its measured colour. The constellation figures are lines drawn between their stars’ real places, so from out here they pull out of shape. Further off they fade away.',
    credits: [HYG, D3_CELESTIAL] },
  { id: 'night-sky', chart: '/atlas/stars#figure-sky', name: 'The night sky', model: false,
    what: 'Every star you can see from the Earth, from far enough away to see them as a cloud.',
    drawn: 'Every star is a real one, at its measured distance. The further away a star is, the less sure its distance.',
    credits: [HYG] },
  { id: 'milky-way', chart: '/atlas/galaxies#figure-milky-way', name: 'The Milky Way', model: true,
    what: 'Our whole galaxy from outside, which no camera has ever seen.',
    drawn: 'The shape of the Milky Way here is a model, built from its measured size, its bar and the pitch of its arms. It is not a map: nobody knows where every arm runs.',
    credits: [] },
  { id: 'local-group', chart: '/atlas/galaxies#figure-local-group', name: 'The Local Group', model: true,
    what: 'The Milky Way, Andromeda and the hundred or so small galaxies around them.',
    drawn: 'Each galaxy is at its measured place. The shapes of Andromeda, Triangulum and the two Magellanic Clouds are models, set at their real size and tilt.',
    credits: [MCCONNACHIE] },
  { id: 'cosmic-web', chart: '/atlas/galaxies#figure-web', name: 'The cosmic web', model: false,
    what: 'Tens of thousands of galaxies, gathered into clusters, threads and empty voids.',
    drawn: 'Every point is a real galaxy. Its place on the sky is measured, and its distance is worked out from how fast it is moving away from us.',
    credits: [TWO_MRS] },
  { id: 'cmb', name: 'The edge of what we can see', model: false,
    what: 'The oldest light there is, coming from every direction at once.',
    drawn: 'The mottled sphere is a real map of the oldest light, made by the WMAP spacecraft. Its colours stand for differences in temperature of less than a thousandth of a degree.',
    credits: [WMAP] },
];

export const placeById = new Map(places.map((p) => [p.id, p]));
