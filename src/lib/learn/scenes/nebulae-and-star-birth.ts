/**
 * Pictures for the lesson "Nebulae and star birth", one to each part of its first look. All of them are
 * drawings of the idea, with the dust, stars and motion placed at random and not to scale. The only
 * figures they state are the lesson's: a nebula is a cloud of gas and dust, the Orion Nebula lies just
 * below the three stars of Orion's belt for people in the northern half of the world, and a dying star
 * puffs its outer layers away, leaving a small hot core.
 */
import { type Scene, SOFT, ACCENT, clamp, ease, label, stars, rng } from '../stage';
import { TAU, dot, line, ring } from '../kit';

const backdrop = stars(110, 1013);
const room = (w: number) => (w > 760 ? w * 0.34 : 0);

// ---- 1. a cloud of gas and dust
const PUFFS = (() => { const r = rng(7); return Array.from({ length: 38 }, () => ({ a: r() * TAU, d: Math.pow(r(), 0.6), s: 0.18 + r() * 0.3, hue: r() })); })();
export const lens: Scene = {
  caption: 'A nebula, which is Latin for cloud: a huge cloud of gas and dust between the stars. A drawing of the idea, not a real nebula, with the puffs of gas placed at random.',
  stillAt: 4,
  draw({ ctx, w, h, t, say }) {
    backdrop(ctx, w, h, 0.3);
    const rx = room(w), cx = rx + (w - rx) / 2, cy = h * (rx ? 0.46 : 0.3), R = Math.min((w - rx) * 0.36, h * (rx ? 0.32 : 0.2));
    for (const p of PUFFS) {
      const a = p.a + t * 0.02, x = cx + Math.cos(a) * p.d * R, y = cy + Math.sin(a) * p.d * R * 0.75, s = p.s * R;
      const g = ctx.createRadialGradient(x, y, 0, x, y, s); const c = p.hue < 0.5 ? '230,110,120' : '120,150,230'; g.addColorStop(0, `rgba(${c},.28)`); g.addColorStop(1, `rgba(${c},0)`);
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, s, 0, TAU); ctx.fill();
    }
    label(ctx, 'A cloud of gas and dust', cx, cy + R * 0.75 + 36, { align: 'center', colour: ACCENT, size: 10 });
    say('The space between the stars is not quite empty', 'Here and there it holds huge clouds');
  },
};

// ---- 2. a clump falls in on itself
const CLUMP = (() => { const r = rng(19); return Array.from({ length: 140 }, () => ({ a: r() * TAU, d: 0.35 + r() * 0.65, b: r() })); })();
const collapse: Scene = {
  caption: 'A clump of gas falling in on itself, a drawing of the idea and enormously speeded up. As the clump grows its gravity gets stronger and it pulls in more. The middle is squeezed and heats up, and that hot ball is the start of a new star.',
  stillAt: 9,
  draw({ ctx, w, h, t, say }) {
    backdrop(ctx, w, h, 0.25);
    const cx = w / 2, cy = h * 0.42, R = Math.min(w * 0.38, h * 0.32), u = ((t % 14) / 14), fall = ease(clamp(u / 0.8, 0, 1)), heat = ease(clamp((u - 0.55) / 0.35, 0, 1));
    for (const p of CLUMP) { const d = p.d * (1 - fall * 0.88), a = p.a + fall * 1.5 * (1 - p.d); dot(ctx, cx + Math.cos(a) * d * R, cy + Math.sin(a) * d * R, 0.8 + p.b * 1.2, `rgba(${200 + heat * 55},${190 - heat * 40},${180 - heat * 100},${0.35 + p.b * 0.5})`); }
    const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, R * 0.35); g.addColorStop(0, `rgba(255,230,170,${heat * 0.9})`); g.addColorStop(1, 'rgba(255,200,120,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, R * 0.35, 0, TAU); ctx.fill();
    label(ctx, heat > 0.5 ? 'The middle is squeezed and heats up' : 'Gravity pulls the gas together', cx, cy + R + 24, { align: 'center', colour: ACCENT, size: 10 });
    say('Gravity pulls the thin gas into clumps', 'In the end a clump falls in on itself and a star begins');
  },
};

// ---- 3. Orion's belt and the nebula below it
const orion: Scene = {
  caption: 'Where to look for the Orion Nebula, a drawing of the idea: the three stars in a row that make Orion’s belt, and just below them, as seen from the northern half of the world, a faint fuzzy patch. The positions are only roughly drawn and the patch is much fainter to the eye than it is here.',
  stillAt: 4,
  draw({ ctx, w, h, t, say }) {
    backdrop(ctx, w, h, 0.4);
    const cx = w / 2, cy = h * 0.3, sp = Math.min(w * 0.14, 70), tw = (i: number) => 0.8 + 0.2 * Math.sin(t * 2 + i * 2);
    const g = ctx.createRadialGradient(cx, cy + sp * 1.9, 0, cx, cy + sp * 1.9, sp * 1.2); g.addColorStop(0, 'rgba(230,140,150,.45)'); g.addColorStop(1, 'rgba(230,140,150,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy + sp * 1.9, sp * 1.2, 0, TAU); ctx.fill();
    for (let i = -1; i <= 1; i++) { dot(ctx, cx + i * sp, cy - i * sp * 0.12, 4.5 * tw(i), '#e6eeff'); }
    line(ctx, [cx + sp + 14, cy - sp * 0.12, cx + sp + 40, cy - sp * 0.12], 'rgba(236,231,220,.4)'); label(ctx, 'Orion’s belt', cx + sp + 48, cy - sp * 0.12, { align: 'left', colour: SOFT, size: 10 });
    line(ctx, [cx + sp * 1.2 + 6, cy + sp * 1.9, cx + sp * 1.2 + 34, cy + sp * 1.9], 'rgba(236,231,220,.4)'); label(ctx, 'The Orion Nebula', cx + sp * 1.2 + 42, cy + sp * 1.9, { align: 'left', colour: ACCENT, size: 10 });
    say('Look below the three stars of the belt', 'A faint fuzzy patch: thousands of young stars inside');
  },
};

// ---- 4. a dying star puffs its layers away
const shell: Scene = {
  caption: 'A star like the Sun at the end of its life, a drawing of the idea: it throws its outer layers back into space as a glowing cloud and leaves a small hot core. Greatly speeded up.',
  stillAt: 8,
  draw({ ctx, w, h, t, say }) {
    backdrop(ctx, w, h, 0.25);
    const cx = w / 2, cy = h * 0.42, R = Math.min(w * 0.36, h * 0.3), u = (t % 12) / 12, k = ease(clamp(u / 0.85, 0, 1)), fade = 1 - ease(clamp((u - 0.85) / 0.15, 0, 1));
    const r = R * (0.12 + 0.88 * k);
    ctx.lineWidth = 12 + 10 * k; ctx.strokeStyle = `rgba(120,210,200,${0.35 * fade})`; ctx.beginPath(); ctx.arc(cx, cy, r * 0.8, 0, TAU); ctx.stroke();
    ctx.lineWidth = 8; ctx.strokeStyle = `rgba(235,130,110,${0.4 * fade})`; ctx.beginPath(); ctx.arc(cx, cy, r, 0, TAU); ctx.stroke();
    dot(ctx, cx, cy, 3.5, '#f4f7ff'); ring(ctx, cx, cy, 8, 'rgba(244,247,255,.25)');
    label(ctx, 'Gas thrown back into space', cx, cy + R + 28, { align: 'center', colour: ACCENT, size: 10 });
    say('Some nebulae mark the end of a star', 'It throws its outer layers back into space');
  },
};

// ---- 5. the cycle
const cycle: Scene = {
  caption: 'The round the lesson ends on, a drawing of the idea: gas gathers into clouds, clouds make stars, dying stars throw their gas back, and that gas drifts into new clouds.',
  stillAt: 6,
  draw({ ctx, w, h, t, say }) {
    backdrop(ctx, w, h, 0.25);
    const cx = w / 2, cy = h * 0.42, R = Math.min(w * 0.3, h * 0.26), names = ['A cloud of gas and dust', 'New stars', 'A dying star', 'Gas thrown back'];
    ring(ctx, cx, cy, R, 'rgba(236,231,220,.22)', 1, [4, 6]);
    names.forEach((name, i) => {
      const a = -Math.PI / 2 + (i / 4) * TAU, x = cx + Math.cos(a) * R, y = cy + Math.sin(a) * R;
      dot(ctx, x, y, 7, ['#e66f78', '#e6eeff', '#ffb36b', '#78d2c8'][i]);
      label(ctx, name, x + Math.cos(a) * 16, y + Math.sin(a) * 16 + (Math.sin(a) > 0.5 ? 6 : 0), { align: Math.cos(a) > 0.3 ? 'left' : Math.cos(a) < -0.3 ? 'right' : 'center', colour: SOFT, size: 10 });
    });
    const a = -Math.PI / 2 + ((t / 8) % 1) * TAU; dot(ctx, cx + Math.cos(a) * R, cy + Math.sin(a) * R, 3.4, '#f4efe4');
    label(ctx, 'And round again', cx, cy, { align: 'center', colour: ACCENT, size: 10 });
    say('The gas is used again', 'New stars are made from what old stars gave back');
  },
};

// one picture to each step of the first look: its paragraphs and photographs, in order
export const scenes: Scene[] = [lens, collapse, orion, shell, cycle];
