/**
 * Pictures for the lesson "Living in space". Five are real photographs. The chart of a day on the
 * station is to scale.
 */
import { type Scene, SOFT, ACCENT, clamp, label, stars } from '../stage';
import { photoScene, line } from '../kit';

const backdrop = stars(70, 2000);
const FREE = 'A real photograph: Bruce McCandless flying free of the Space Shuttle Challenger on 7 February 1984, the first person in space with no line to a spacecraft. A crewmate took it through a window. Credit: NASA.';

export const lens = photoScene({ src: '/img/learn/mccandless-untethered-1984.jpg', caption: FREE, say: ['', ''], hero: true, cover: true, zoom: [1, 1.1], focus: [0.52, 0.3] });

const station = photoScene({
  src: '/img/learn/iss-over-earth.jpg',
  caption: 'A real photograph: the International Space Station over the Earth, taken from the Space Shuttle Atlantis on 23 May 2010. It is 109 metres from end to end. Credit: NASA.',
  say: ['A house in orbit', 'Lived in without a break since November 2000'], cover: true, zoom: [1, 1.12], focus: [0.5, 0.5],
});

const floating = photoScene({
  src: '/img/learn/astronaut-floating-iss.jpg',
  caption: 'A real photograph: astronaut Greg Chamitoff floating in the Destiny laboratory of the International Space Station on 13 October 2008. Credit: NASA.',
  say: ['Floating is falling', 'Gravity here is still nine tenths as strong as on the ground'], cover: true, zoom: [1, 1.12], focus: [0.5, 0.45],
});

const treadmill = photoScene({
  src: '/img/learn/iss-treadmill-walker-2010.jpg',
  caption: 'A real photograph: astronaut Shannon Walker running on the treadmill of the International Space Station on 12 July 2010. The harness and cords pull her down onto it. Credit: NASA. The mark was added here.',
  say: ['Two hours of exercise, every day', 'Without it, bones lose 1 to 1.5 per cent a month'], cover: true, zoom: [1, 1.1], focus: [0.5, 0.5],
  pointers: [{ at: [0.5, 0.62], to: [0.72, 0.74], text: 'The harness', align: 'left' }],
});

// ---- 4. sixteen sunrises
const day: Scene = {
  caption: 'A chart to scale of 24 hours on the International Space Station, which goes round the Earth about every 90 minutes. Each bright stripe is a spell in sunlight and each dark one a spell in the Earth’s shadow. The split between light and dark changes through the year, and is drawn here as three fifths light. The lower bar is a day on the ground.',
  stillAt: 9,
  draw({ ctx, w, h, t, say }) {
    backdrop(ctx, w, h, 0.25);
    const x0 = w * 0.08, x1 = w * 0.92, y = h * 0.2, bh = h * 0.13, y2 = y + bh + h * 0.17, go = clamp((t - 0.5) / 8, 0, 1), W = x1 - x0;
    label(ctx, 'On the station: 16 sunrises', x0, y - 12, { align: 'left', colour: ACCENT });
    for (let i = 0; i < 16; i++) {
      const xa = x0 + (i / 16) * W;
      ctx.fillStyle = '#f1dba8'; ctx.fillRect(xa, y, (W / 16) * 0.6, bh);
      ctx.fillStyle = '#1a2233'; ctx.fillRect(xa + (W / 16) * 0.6, y, (W / 16) * 0.4, bh);
    }
    ctx.fillStyle = 'rgba(11,11,12,.72)'; ctx.fillRect(x0 + W * go, y, W * (1 - go), bh);
    label(ctx, 'On the ground: one', x0, y2 - 12, { align: 'left', colour: SOFT });
    ctx.fillStyle = '#1a2233'; ctx.fillRect(x0, y2, W, bh); ctx.fillStyle = '#f1dba8'; ctx.fillRect(x0 + W * 0.25, y2, W * 0.5, bh);
    ctx.fillStyle = 'rgba(11,11,12,.72)'; ctx.fillRect(x0 + W * go, y2, W * (1 - go), bh);
    line(ctx, [x0 + W * go, y - 4, x0 + W * go, y2 + bh + 4], '#fff', 1.4);
    for (const hr of [0, 6, 12, 18, 24]) label(ctx, hr === 24 ? 'midnight' : hr === 0 ? 'midnight' : hr === 12 ? 'noon' : `${hr}:00`, x0 + (hr / 24) * W, y2 + bh + 18, { align: hr === 0 ? 'left' : hr === 24 ? 'right' : 'center', colour: SOFT, size: 11 });
    label(ctx, `So far: ${Math.min(16, Math.floor(go * 16 + 0.999))}`, x1, y - 12, { align: 'right', colour: SOFT });
    say('A day with sixteen dawns', 'Once round the Earth every 90 minutes');
  },
};

const cupola = photoScene({
  src: '/img/learn/iss-cupola-saint-jacques-2019.jpg',
  caption: 'A real photograph: David Saint-Jacques of the Canadian Space Agency in the seven-windowed cupola of the International Space Station on 15 January 2019. Credit: NASA.',
  say: ['The best window there is', 'Seven panes, looking straight down'], cover: true, zoom: [1, 1.1], focus: [0.55, 0.45],
});

const free = photoScene({ src: '/img/learn/mccandless-untethered-1984.jpg', caption: FREE, say: ['7 February 1984: flying free', 'A spacesuit is a spacecraft shaped like a person'], zoom: [1, 1.2], focus: [0.52, 0.3] });

export const scenes: Scene[] = [station, floating, treadmill, day, cupola, free];
