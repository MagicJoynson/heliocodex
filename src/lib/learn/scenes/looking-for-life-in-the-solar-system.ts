/**
 * Pictures for the lesson "Looking for life in the Solar System". Five are real photographs taken
 * by spacecraft. The last is a drawing with distances from the Sun to scale; the zone's edges are
 * the estimate of Kopparapu and others (2013), as in the lesson on the habitable zone.
 */
import { type Scene, SOFT, ACCENT, clamp, ease, label, stars } from '../stage';
import { photoScene, dot, line, sun } from '../kit';

const backdrop = stars(70, 921);
const EUROPA = 'A real photograph: Europa, pieced together from pictures taken by NASA’s Galileo spacecraft in 1995 and 1998, in colours close to what the eye would see. The brown lines are cracks in the ice. Credit: NASA/JPL-Caltech/SETI Institute.';

export const lens = photoScene({ src: '/img/learn/europa-galileo.jpg', caption: EUROPA, say: ['', ''], hero: true, zoom: [1, 1.1], focus: [0.42, 0.45] });

const mars = photoScene({
  src: '/img/learn/mars-viking-global.jpg',
  caption: 'A real picture pieced together from about 1,000 photographs by NASA’s Viking 1 orbiter, taken through red and violet filters, with the green worked out from those two. Credit: NASA/JPL/USGS.',
  say: ['Mars, 1976', 'Two landers tested the soil and found no clear sign of life'], zoom: [0.8, 0.95], focus: [0.5, 0.5], tag: 'Photo mosaic',
});

const rock = photoScene({
  src: '/img/learn/mars-cheyava-falls-perseverance.jpg',
  caption: 'A real photograph taken on Mars on 18 July 2024 by NASA’s Perseverance rover: the rock named Cheyava Falls. The white bands are veins of a mineral left by water. The small pale spots with dark rims lie in the reddish band between them. Credit: NASA/JPL-Caltech/MSSS. The mark was added here.',
  say: ['A spotted rock in an old river valley', 'A possible sign of life, not yet a proof'], cover: true, zoom: [1, 1.2], focus: [0.42, 0.5],
  pointers: [{ at: [0.4, 0.42], to: [0.5, 0.08], text: 'The spots', align: 'left' }],
});

const europa = photoScene({ src: '/img/learn/europa-galileo.jpg', caption: EUROPA, say: ['Europa: a sea under the ice', 'More than twice the water of all the Earth’s oceans'], zoom: [0.9, 1.05], focus: [0.45, 0.5] });

const enceladus = photoScene({
  src: '/img/learn/enceladus-jets-cassini.jpg',
  caption: 'A real photograph: jets of water ice spraying from cracks near the south pole of Saturn’s moon Enceladus, with the Sun behind them. Two pictures by NASA’s Cassini spacecraft joined together. Credit: NASA/JPL/Space Science Institute.',
  say: ['Enceladus: an ocean that sprays into space', 'Cassini flew through the jets and tasted them'], zoom: [1, 1.12], focus: [0.5, 0.5],
});

const titan = photoScene({
  src: '/img/learn/titan-infrared-cassini-2015.jpg',
  caption: 'A real picture, in infrared: Titan seen through its haze by NASA’s Cassini spacecraft on 13 November 2015. The dark bands are fields of dunes. The colours were chosen, each standing for one wavelength of infrared. Credit: NASA/JPL/University of Arizona/University of Idaho.',
  say: ['Titan: seen through its haze', 'Minus 179 °C at the ground'], zoom: [0.95, 1.08], focus: [0.5, 0.5], tag: 'Infrared picture',
});

// ---- 6. where they are
const WORLDS: [number, string, string, string][] = [[1, 'Earth', '', '#6ea8ff'], [1.52, 'Mars', '', '#e0764a'], [5.2, 'Jupiter', 'Europa', '#e6c9a0'], [9.58, 'Saturn', 'Enceladus, Titan', '#e9d59a']];
const where: Scene = {
  caption: 'A drawing with distances from the Sun to scale; the sizes are not. The green band is where sunshine could keep water liquid on a planet with suitable air, by one estimate. Three of the four places being searched lie far beyond it.',
  stillAt: 6,
  draw({ ctx, w, h, t, say }) {
    backdrop(ctx, w, h, 0.35);
    const x0 = w * 0.08, x1 = w * 0.94, y = h * 0.42, k = ease(clamp(t / 4, 0, 1)), X = (au: number) => x0 + (au / 10) * (x1 - x0);
    ctx.fillStyle = 'rgba(90,190,120,.28)'; ctx.fillRect(X(0.99), y - h * 0.16, X(1.7) - X(0.99), h * 0.32);
    line(ctx, [x0, y, x0 + (x1 - x0) * k, y], 'rgba(236,231,220,.45)');
    sun(ctx, x0, y, Math.min(w, h) * 0.035);
    WORLDS.forEach(([au, name, moons, colour], i) => {
      const x = X(au); if (x > x0 + (x1 - x0) * k) return;
      dot(ctx, x, y, i < 2 ? 4 : 7, colour);
      const up = i % 2 === 0, yy = up ? y - 26 : y + 30;
      label(ctx, name, x, yy, { align: i === 3 ? 'right' : i === 0 ? 'right' : i === 1 ? 'left' : 'center', colour: '#fff' });
      if (moons) label(ctx, moons, x, yy + (up ? -15 : 15), { align: i === 3 ? 'right' : 'center', colour: ACCENT });
    });
    if (k > 0.3) label(ctx, 'Sunshine zone', X(1.35), y - h * 0.16 - 10, { align: 'left', colour: '#8fdcaa' });
    label(ctx, 'Sun', x0, y + 34, { align: 'center', colour: SOFT });
    say('Where the four places are', 'Three of them are kept warm from inside, not by the Sun');
  },
};

export const scenes: Scene[] = [mars, rock, europa, enceladus, titan, where];
