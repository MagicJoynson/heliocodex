/**
 * Pictures for the lesson "Robot explorers". Five are real photographs taken by spacecraft or of
 * what one brought back. The line of distances is to scale.
 */
import { type Scene, SOFT, ACCENT, clamp, ease, label, stars } from '../stage';
import { photoScene, dot, line } from '../kit';

const backdrop = stars(110, 1977);
const SATURN = 'A real picture, joined from many photographs: Saturn from behind, with the Sun hidden by the planet, taken by the Cassini spacecraft on 19 July 2013. The colours are close to what the eye would see. Credit: NASA/JPL-Caltech/SSI.';

export const lens = photoScene({ src: '/img/learn/saturn-backlit-cassini-2013.jpg', caption: SATURN, say: ['', ''], hero: true, cover: true, zoom: [1, 1.1], focus: [0.5, 0.5] });

// ---- 1. how far machines have gone
const FAR = 25.9; // billion km: Voyager 1 on 18 November 2026
const MARKS: [string, number, number][] = [['Jupiter', 0.78, -1], ['Saturn', 1.43, 1], ['Neptune', 4.5, -2], ['Pluto', 5.9, 2]];
const reach: Scene = {
  caption: 'A line to scale, from the Sun on the left to Voyager 1 on the right, 25.9 billion km away in November 2026. The planets are marked at their average distances from the Sun. The furthest people have been, 406,771 km, is one 64,000th of the line: far less than the width of the first dot.',
  stillAt: 9,
  draw({ ctx, w, h, t, say }) {
    backdrop(ctx, w, h, 0.4);
    const x0 = w * 0.08, x1 = w * 0.92, y = h * 0.4, go = ease(clamp((t - 0.6) / 6, 0, 1)), X = (d: number) => x0 + (d / FAR) * (x1 - x0);
    line(ctx, [x0, y, x1, y], 'rgba(236,231,220,.22)');
    line(ctx, [x0, y, X(FAR * go), y], ACCENT, 1.6);
    dot(ctx, x0, y, 3.5, '#ffd98a');
    for (const [name, d, lv] of MARKS) {
      if (FAR * go < d) continue;
      const x = X(d), yy = y + lv * 24 * (Math.abs(lv) === 2 ? 0.95 : 1);
      line(ctx, [x, y, x, yy + (lv < 0 ? 6 : -6)], 'rgba(236,231,220,.45)'); dot(ctx, x, y, 2, '#fff');
      label(ctx, name, x + 3, yy, { align: 'left', colour: SOFT });
    }
    dot(ctx, X(FAR * go), y, 3, '#fff');
    if (go >= 1) { label(ctx, 'Voyager 1', x1, y - 28, { align: 'right', colour: ACCENT }); label(ctx, '25.9 billion km', x1, y - 12, { align: 'right', colour: SOFT }); }
    label(ctx, 'The Sun and the Earth', x0, y + h * 0.26, { align: 'left', colour: '#fff' });
    label(ctx, 'People: too short a trip to draw', x0, y + h * 0.26 + 16, { align: 'left', colour: SOFT });
    line(ctx, [x0, y + 6, x0, y + h * 0.26 - 10], 'rgba(236,231,220,.3)');
    say('How far the machines have gone', 'About 64,000 times further than any person');
  },
};

const neptune = photoScene({
  src: '/img/learn/neptune-voyager-2.jpg',
  caption: 'A real photograph: Neptune from Voyager 2 in August 1989, from about 7 million km away, with its great dark storm. It was made from pictures taken through green and orange filters, and the blue is deeper than the eye would see. Credit: NASA/JPL.',
  say: ['Neptune, August 1989', 'Voyager 2 is still the only visitor it has had'], zoom: [0.9, 1.05], focus: [0.5, 0.5],
});

const landing = photoScene({
  src: '/img/learn/perseverance-landing-descent-stage.jpg',
  caption: 'A real photograph: the Perseverance rover hanging on its ropes just above the surface of Mars on 18 February 2021, taken by a camera on the rocket-powered frame lowering it. The streaks are dust blown away by the engines. Credit: NASA/JPL-Caltech.',
  say: ['Touching down on Mars', 'Lowered on ropes, with nobody steering'], cover: true, zoom: [1, 1.12], focus: [0.5, 0.5],
});

const selfie = photoScene({
  src: '/img/learn/curiosity-selfie-vera-rubin-ridge.jpg',
  caption: 'A real picture, joined from many photographs: the Curiosity rover on Mars in January 2018, taken with the camera on the end of its own arm. Credit: NASA/JPL-Caltech/MSSS.',
  say: ['A geologist on wheels', 'On Mars since 6 August 2012'], cover: true, zoom: [1, 1.14], focus: [0.52, 0.55],
});

const saturn = photoScene({ src: '/img/learn/saturn-backlit-cassini-2013.jpg', caption: SATURN, say: ['Saturn from behind, 19 July 2013', 'Cassini stayed for 13 years'], zoom: [1, 1.25], focus: [0.5, 0.5] });

const bennu = photoScene({
  src: '/img/learn/bennu-sample-canister-2023.jpg',
  caption: 'A real photograph: the sample container of the OSIRIS-REx spacecraft with its lid just removed, at the Johnson Space Center in Houston in September 2023. The dark dust is from the asteroid Bennu. Credit: NASA/Erika Blumenfeld and Joseph Aebersold.',
  say: ['A piece of an asteroid, brought home', '121.6 grams, collected in a few seconds'], zoom: [0.98, 1.12], focus: [0.5, 0.45],
});

export const scenes: Scene[] = [reach, neptune, landing, selfie, saturn, bennu];
