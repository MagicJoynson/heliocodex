/**
 * Pictures for the lesson "How a rocket works". The three photographs are real. The bar of what a
 * Saturn V was made of is to scale. The other two drawings are diagrams.
 */
import { type Scene, SOFT, ACCENT, clamp, ease, label, stars, rng } from '../stage';
import { photoScene, line } from '../kit';

const backdrop = stars(70, 1926);
const APOLLO = 'A real photograph: the Saturn V rocket carrying Apollo 11 lifts off from the Kennedy Space Center in Florida on 16 July 1969. Credit: NASA.';

export const lens = photoScene({ src: '/img/learn/apollo-11-launch-1969.jpg', caption: APOLLO, say: ['', ''], hero: true, zoom: [0.96, 1.06], focus: [0.5, 0.5] });

/** A plain rocket body pointing up, its base at (x, y). */
function body(ctx: CanvasRenderingContext2D, x: number, y: number, wd: number, ht: number, fill = '#ece7dc'): void {
  ctx.fillStyle = fill;
  ctx.beginPath(); ctx.moveTo(x - wd / 2, y); ctx.lineTo(x - wd / 2, y - ht * 0.78); ctx.quadraticCurveTo(x - wd / 2, y - ht * 0.95, x, y - ht); ctx.quadraticCurveTo(x + wd / 2, y - ht * 0.95, x + wd / 2, y - ht * 0.78); ctx.lineTo(x + wd / 2, y); ctx.closePath(); ctx.fill();
}
function flame(ctx: CanvasRenderingContext2D, x: number, y: number, wd: number, len: number, t: number): void {
  const l = len * (0.9 + 0.1 * Math.sin(t * 23)), g = ctx.createLinearGradient(x, y, x, y + l);
  g.addColorStop(0, 'rgba(255,244,214,.95)'); g.addColorStop(0.35, 'rgba(255,170,80,.7)'); g.addColorStop(1, 'rgba(255,120,60,0)');
  ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(x - wd / 2, y); ctx.quadraticCurveTo(x - wd * 0.7, y + l * 0.5, x, y + l); ctx.quadraticCurveTo(x + wd * 0.7, y + l * 0.5, x + wd / 2, y); ctx.closePath(); ctx.fill();
}
function arrow(ctx: CanvasRenderingContext2D, x: number, y0: number, y1: number, colour: string): void {
  const d = Math.sign(y1 - y0);
  line(ctx, [x, y0, x, y1], colour, 2);
  ctx.fillStyle = colour; ctx.beginPath(); ctx.moveTo(x, y1 + d * 9); ctx.lineTo(x - 6, y1); ctx.lineTo(x + 6, y1); ctx.closePath(); ctx.fill();
}

// ---- 1. gas one way, rocket the other
const P = rng(11);
const PUFFS = Array.from({ length: 90 }, () => ({ o: P(), dx: (P() - 0.5) * 2, s: 0.6 + P() * 0.8 }));
const push: Scene = {
  caption: 'A diagram, not to scale. Hot gas is thrown out of the bottom of the rocket. The gas goes down, and the rocket is pushed up with the same force.',
  stillAt: 5,
  draw({ ctx, w, h, t, say }) {
    backdrop(ctx, w, h, 0.3);
    const x = w / 2, base = h * (0.46 - 0.04 * Math.sin(t * 0.5)), wd = Math.min(w, h) * 0.085, ht = wd * 4.2;
    for (const p of PUFFS) {
      const k = (p.o + t * 0.45 * p.s) % 1, y = base + k * h * 0.42, xx = x + p.dx * wd * (0.3 + k * 1.6);
      ctx.fillStyle = `rgba(255,${200 - k * 90},${150 - k * 110},${0.7 * (1 - k)})`; ctx.beginPath(); ctx.arc(xx, y, 2 + k * 5, 0, Math.PI * 2); ctx.fill();
    }
    flame(ctx, x, base, wd * 0.8, wd * 2.2, t);
    body(ctx, x, base, wd, ht);
    const off = w > 560 ? wd * 2.6 : wd * 1.9;
    arrow(ctx, x - off, base - ht * 0.25, base - ht * 0.85, ACCENT);
    arrow(ctx, x + off, base + wd * 0.6, base + wd * 3.4, 'rgba(255,170,90,1)');
    label(ctx, 'The rocket', x - off - 12, base - ht * 0.6, { align: 'right', colour: ACCENT }); label(ctx, 'is pushed up', x - off - 12, base - ht * 0.6 + 16, { align: 'right', colour: ACCENT });
    label(ctx, 'The gas', x + off + 12, base + wd * 1.8, { align: 'left', colour: 'rgba(255,190,120,1)' }); label(ctx, 'is thrown down', x + off + 12, base + wd * 1.8 + 16, { align: 'left', colour: 'rgba(255,190,120,1)' });
    say('Every push comes with a push back', 'Throw gas one way and you go the other');
  },
};

const goddard = photoScene({
  src: '/img/learn/goddard-first-rocket-1926.jpg',
  caption: 'A real photograph: Robert Goddard beside the first rocket to fly on liquid fuel, in its launch frame at Auburn, Massachusetts, on 16 March 1926. The engine is at the top and the fuel tanks are below it. Credit: NASA. The mark was added here.',
  say: ['16 March 1926', 'It flew for 2.5 seconds, 12.5 metres up, and landed 56 metres away'], zoom: [0.98, 1.08], focus: [0.45, 0.45],
  pointers: [{ at: [0.5, 0.2], to: [0.8, 0.12], text: 'The rocket', align: 'left' }],
});

// ---- 3. what a Moon rocket is made of
const PARTS: [string, number, string][] = [['Fuel and oxygen', 0.9, 'rgba(255,170,90,.85)'], ['Tanks and engines', 0.085, 'rgba(236,231,220,.75)'], ['Sent on to the Moon', 0.015, '#fff']];
const made: Scene = {
  caption: 'A bar to scale of the Saturn V at lift-off, by mass. About nine tenths was fuel and the oxygen to burn it. About one and a half per cent, 43.5 tonnes, was the spacecraft sent on to the Moon. The split is worked out here from published masses, which varied a little from flight to flight.',
  stillAt: 6,
  draw({ ctx, w, h, t, say }) {
    backdrop(ctx, w, h, 0.25);
    const wide = w > 560, x0 = w * 0.08, x1 = w * 0.92, y = h * 0.17, bh = h * 0.12, k = ease(clamp((t - 0.4) / 2.5, 0, 1)), row = wide ? 44 : 30;
    let x = x0;
    PARTS.forEach(([name, f, col], i) => {
      const ww = (x1 - x0) * f, shown = clamp((k - (x - x0) / (x1 - x0)) / f, 0, 1);
      ctx.fillStyle = col; ctx.fillRect(x, y, ww * shown, bh);
      if (shown >= 0.99) {
        const pct = ['about 90%', 'about 8.5%', 'about 1.5%'][i], yy = y + bh + 26 + i * row, colour = i === 0 ? ACCENT : i === 2 ? '#fff' : SOFT, mx = x + ww / 2;
        if (i > 0) line(ctx, [mx, y + bh + 3, mx, yy - 4, mx - 8, yy - 4], 'rgba(236,231,220,.5)');
        const lx = i === 0 ? x0 : mx - 14, al: CanvasTextAlign = i === 0 ? 'left' : 'right';
        if (wide) { label(ctx, name, lx, yy, { align: al, colour }); label(ctx, pct, lx, yy + 16, { align: al, colour: SOFT }); }
        else label(ctx, `${name}: ${pct}`, lx, yy, { align: al, colour, size: 11 });
      }
      x += ww;
    });
    label(ctx, wide ? 'The Saturn V on the launch pad: more than 2,800 tonnes' : 'Saturn V at lift-off: over 2,800 tonnes', x0, y - 12, { align: 'left', colour: SOFT });
    say('Nearly all of it is fuel', 'About one and a half per cent went on to the Moon');
  },
};

// ---- 4. stages falling away
const STAGES = [{ f: 0.38, name: 'First stage', note: 'burns for about 2½ minutes' }, { f: 0.24, name: 'Second stage', note: 'burns for about 6½ minutes' }, { f: 0.16, name: 'Third stage', note: 'to orbit, then to the Moon' }];
const staging: Scene = {
  caption: 'A diagram, not to scale, of a three-stage rocket such as the Saturn V. Each stage burns until it is empty and then falls away, so the stage above has less to push. The burn times are those of the Saturn V.',
  stillAt: 4.2,
  draw({ ctx, w, h, t, say }) {
    backdrop(ctx, w, h, 0.3);
    const tt = t % 14, wide = w > 560, x = wide ? w * 0.36 : w * 0.24, wd = Math.min(w * 0.1, h * 0.12), full = h * 0.6, top = h * 0.08;
    const drop = [ease(clamp((tt - 3) / 3, 0, 1)), ease(clamp((tt - 6.5) / 3, 0, 1))];
    const lit = tt < 3 ? 0 : tt < 6.5 ? 1 : 2;
    let y = top + full;
    STAGES.forEach((s, i) => {
      const hh = full * s.f / 0.94, d = i < 2 ? drop[i] : 0, yy = y + d * h * 0.5, xx = x - d * wd * (i ? 2.2 : 1.4), a = 1 - d;
      if (a > 0.02) {
        ctx.save(); ctx.globalAlpha = a; ctx.translate(xx, yy - hh / 2); ctx.rotate(-d * 0.9);
        ctx.fillStyle = i === lit ? '#ece7dc' : d > 0 ? 'rgba(170,165,155,1)' : 'rgba(236,231,220,.85)'; ctx.fillRect(-wd / 2 * (1 - i * 0.1), -hh / 2 + 2, wd * (1 - i * 0.1), hh - 4);
        ctx.restore();
      }
      if (i === lit) flame(ctx, x, y, wd * 0.7, wd * 1.8, t);
      const ly = y - hh / 2, lx = x + wd * 1.1;
      if (d < 0.5) { line(ctx, [x + wd * 0.55, ly, lx - 4, ly], 'rgba(236,231,220,.4)'); label(ctx, s.name, lx, ly - 2, { align: 'left', colour: i === lit ? ACCENT : SOFT }); label(ctx, s.note, lx, ly + 14, { align: 'left', colour: SOFT, size: wide ? 12 : 11 }); }
      y -= hh;
    });
    // the spacecraft on top
    const sw = wd * 0.5; ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.moveTo(x - sw / 2, y); ctx.lineTo(x, y - sw * 1.5); ctx.lineTo(x + sw / 2, y); ctx.closePath(); ctx.fill();
    label(ctx, 'The spacecraft', x + wd * 1.1, y - sw * 0.6, { align: 'left', colour: '#fff' });
    say('Drop what you no longer need', 'Each stage falls away when it is empty');
  },
};

const saturn = photoScene({ src: '/img/learn/apollo-11-launch-1969.jpg', caption: APOLLO + ' The rocket is 111 metres tall.', say: ['16 July 1969: leaving for the Moon', '111 metres tall, burning nearly 14 tonnes a second'], zoom: [0.96, 1.1], focus: [0.5, 0.45] });

const landing = photoScene({
  src: '/img/learn/falcon-9-booster-landing-2026.jpg',
  caption: 'A real photograph: the first stage of a SpaceX Falcon 9 rocket lands at Cape Canaveral in Florida on 1 October 2026, after launching four people towards the International Space Station. Credit: NASA/John Kraus.',
  say: ['A rocket that comes back', 'More than 650 landings by November 2026'], cover: true, zoom: [1, 1.14], focus: [0.5, 0.35],
});

export const scenes: Scene[] = [push, goddard, made, staging, saturn, landing];
