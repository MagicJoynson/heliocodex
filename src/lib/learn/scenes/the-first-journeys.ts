/**
 * Pictures for the lesson "The first journeys". Five are real photographs, one of them of a
 * replica. The drawing of the first flight round the Earth is to scale.
 */
import { type Scene, SOFT, ACCENT, clamp, label, stars } from '../stage';
import { TAU, photoScene, dot, line } from '../kit';

const backdrop = stars(90, 1961);
const EARTHSET = 'A real photograph: the Earth setting behind the far side of the Moon, taken by the crew of Artemis II from their spacecraft on 6 April 2026. Credit: NASA.';

export const lens = photoScene({ src: '/img/learn/earthset-artemis-ii.jpg', caption: EARTHSET, say: ['', ''], hero: true, cover: true, zoom: [1, 1.1], focus: [0.55, 0.5] });

const sputnik = photoScene({
  src: '/img/learn/sputnik-1-replica.jpg',
  caption: 'A real photograph of a replica of Sputnik 1, the first satellite, kept at the National Air and Space Museum in Washington. The ball is 58 cm across and the rods are its radio aerials. Credit: NASA/NSSDC.',
  say: ['4 October 1957', 'A metal ball 58 cm across, beeping as it went round'], zoom: [0.95, 1.08], focus: [0.6, 0.45],
});

// ---- 2. once round the Earth, to scale
const once: Scene = {
  caption: 'A drawing to scale. The disc is the Earth, 12,742 km across, drawn plain. The line round it is the path of Vostok 1 on 12 April 1961, which ran between 181 and 327 km above the ground. The dot is drawn large enough to see.',
  stillAt: 6.5,
  draw({ ctx, w, h, t, say }) {
    backdrop(ctx, w, h, 0.4);
    const cx = w / 2, cy = h * 0.4, R = Math.min(w * 0.3, h * 0.3), lead = w > 560 ? 26 : 10, km = R / 6371;
    const g = ctx.createRadialGradient(cx - R * 0.35, cy - R * 0.35, R * 0.1, cx, cy, R); g.addColorStop(0, '#5f8fc4'); g.addColorStop(1, '#16314f');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, R, 0, TAU); ctx.fill();
    // an ellipse with its low point at the start and its high point half-way round
    const a = (6371 + 254) * km, c = 73 * km, go = clamp((t - 0.8) / 8, 0, 1), ang = -Math.PI * 0.75;
    const at = (f: number): [number, number] => { const th = f * TAU, r = (a * a - c * c) / (a + c * Math.cos(th)) ; return [cx + Math.cos(ang - th) * r, cy + Math.sin(ang - th) * r]; };
    ctx.strokeStyle = 'rgba(236,231,220,.25)'; ctx.lineWidth = 1; ctx.beginPath(); for (let i = 0; i <= 120; i++) { const [x, y] = at(i / 120); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.stroke();
    ctx.strokeStyle = ACCENT; ctx.lineWidth = 1.6; ctx.beginPath(); for (let i = 0; i <= 120 * go; i++) { const [x, y] = at(i / 120); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.stroke();
    const [px, py] = at(go); dot(ctx, px, py, 3, '#fff');
    const [hx, hy] = at(0.5);
    line(ctx, [hx + 4, hy + 4, hx + lead, hy + lead], 'rgba(236,231,220,.5)'); label(ctx, 'Highest: 327 km', hx + lead + 4, hy + lead + 6, { align: 'left', colour: SOFT });
    label(ctx, 'The Earth', cx, cy - 22, { align: 'center', colour: '#fff' }); label(ctx, '12,742 km across', cx, cy - 6, { align: 'center', colour: SOFT });
    label(ctx, `${Math.round(go * 108)} minutes`, cx, cy + 20, { align: 'center', colour: ACCENT, size: 14 });
    say('12 April 1961: once round the Earth', 'To scale. Space is close: it is the speed that is hard');
  },
};

const earthrise = photoScene({
  src: '/img/learn/earthrise-apollo-8.jpg',
  caption: 'A real photograph: the Earth rising over the edge of the Moon, taken by Bill Anders from Apollo 8 on 24 December 1968. Credit: NASA / Bill Anders.',
  say: ['December 1968: the first people to leave the Earth', 'Apollo 8 circled the Moon ten times'], cover: true, zoom: [1, 1.1], focus: [0.5, 0.45],
});

const aldrin = photoScene({
  src: '/img/learn/aldrin-apollo-11.jpg',
  caption: 'A real photograph: Buzz Aldrin on the Moon on 20 July 1969, taken by Neil Armstrong, who is reflected in the visor. Credit: NASA.',
  say: ['20 July 1969', 'Two and a half hours outside, watched by 600 million people'], zoom: [0.98, 1.12], focus: [0.5, 0.4],
});

const sites = photoScene({
  src: '/img/learn/moon-near-side-lro.jpg',
  caption: 'A real picture of the side of the Moon that faces the Earth, built up from photographs by the Lunar Reconnaissance Orbiter. Credit: NASA/GSFC/Arizona State University. The numbers were added here, and mark where Apollo 11, 12, 14, 15, 16 and 17 landed, placed from NASA’s published positions.',
  say: ['Six landings, twelve people', 'July 1969 to December 1972'], zoom: [0.96, 1.04], focus: [0.5, 0.48],
  pointers: [
    { at: [0.693, 0.494], to: [0.8, 0.52], text: '11', align: 'left' }, { at: [0.3075, 0.5255], to: [0.2, 0.5], text: '12', align: 'right' },
    { at: [0.3547, 0.531], to: [0.4, 0.65], text: '14', align: 'left' }, { at: [0.5276, 0.2864], to: [0.44, 0.19], text: '15', align: 'right' },
    { at: [0.628, 0.5756], to: [0.68, 0.69], text: '16', align: 'left' }, { at: [0.7329, 0.3326], to: [0.83, 0.26], text: '17', align: 'left' },
  ],
});

const earthset = photoScene({ src: '/img/learn/earthset-artemis-ii.jpg', caption: EARTHSET, say: ['April 2026: people go back', '406,771 km from home, further than anyone before'], cover: true, zoom: [1, 1.14], focus: [0.58, 0.5] });

export const scenes: Scene[] = [sputnik, once, earthrise, aldrin, sites, earthset];
