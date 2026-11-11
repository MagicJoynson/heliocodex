/**
 * Pieces shared by the lesson pictures: real photographs set into a scene, lit globes, a glowing
 * sun, and a few small helpers. Each lesson's own file holds what is particular to it.
 */
import { type Scene, type Frame, INK, ACCENT, clamp, ease, mix, label } from './stage';

export const TAU = Math.PI * 2;

interface Loaded { img: HTMLImageElement | null; ready: Promise<void> }
const loaded = new Map<string, Loaded>();
/** Fetch a photograph once, however many scenes show it. */
export function photo(src: string): Loaded {
  let l = loaded.get(src);
  if (!l) {
    const img = typeof Image === 'undefined' ? null : new Image();
    const ready = new Promise<void>((done) => { if (!img) return done(); img.onload = img.onerror = () => done(); img.src = src; });
    loaded.set(src, l = { img, ready });
  }
  return l;
}

/** A line from a point on a photograph out to a word beside it. Positions are fractions of the photograph. */
export interface Pointer { at: [number, number]; to: [number, number]; text: string; align?: CanvasTextAlign }

export interface PhotoOptions {
  src: string;
  /** Says it is a photograph, what of, who took it and under what licence. */
  caption: string;
  say: [string, string?];
  /** The part of the picture to keep in the middle, as fractions. */
  focus?: [number, number];
  /** How much of the room the picture fills at the start and after it has drifted closer. */
  zoom?: [number, number];
  /** Fill the room and let the edges run off, for a picture with no black border of its own. */
  cover?: boolean;
  /** For the top of a page: keep the picture to the right, clear of the words. */
  hero?: boolean;
  pointers?: Pointer[];
  /** The small word in the corner, for a picture that is real data but not a photograph. */
  tag?: string;
  /** Anything more to draw over the photograph. `box` is where it was put: left, top, width, height. */
  over?(f: Frame, box: [number, number, number, number]): void;
}

/** A scene that shows a real photograph, drifting slowly closer, with its edges melted into the page. */
export function photoScene(o: PhotoOptions): Scene {
  const p = photo(o.src);
  return {
    caption: o.caption,
    stillAt: 12,
    ready: p.ready,
    draw(f) {
      const { ctx, w, h, t } = f, img = p.img;
      if (!img?.naturalWidth) { label(ctx, 'Fetching the photograph', w / 2, h / 2, { align: 'center' }); return; }
      const [z0, z1] = o.zoom ?? [1, 1.1], z = mix(z0, z1, ease(t / 12));
      const ratio = img.naturalWidth / img.naturalHeight;
      const wide = o.hero && w > 760, roomX = wide ? w * 0.34 : 0, roomW = w - roomX;
      const fit = o.cover || o.hero ? Math.max(roomW / ratio, h) : Math.min(roomW / ratio, h * 0.98);
      const ph = fit * z, pw = ph * ratio, [fx, fy] = o.focus ?? [0.5, 0.5];
      let x = roomX + roomW / 2 - pw * fx, y = h * (o.hero ? 0.5 : 0.49) - ph * fy;
      // a picture that fills its room never shows a bare strip along one side
      if (o.cover || o.hero) { if (pw >= roomW) x = clamp(x, roomX + roomW - pw, roomX); if (ph >= h) y = clamp(y, h - ph, 0); }
      ctx.drawImage(img, x, y, pw, ph);
      // the edges of the photograph are melted into the page, so it never sits in a hard box
      const soft = Math.min(w, h) * (o.hero ? 0.3 : 0.12);
      const fade = (x0: number, y0: number, x1: number, y1: number, rx: number, ry: number, rw: number, rh: number) => {
        const g = ctx.createLinearGradient(x0, y0, x1, y1);
        g.addColorStop(0, 'rgba(11,11,12,1)'); g.addColorStop(1, 'rgba(11,11,12,0)');
        ctx.fillStyle = g; ctx.fillRect(rx, ry, rw, rh);
      };
      const l = Math.max(x, o.hero ? roomX - soft * 0.6 : 0), r = Math.min(x + pw, w), top = Math.max(y, 0), bot = Math.min(y + ph, h);
      ctx.fillStyle = 'rgb(11,11,12)';
      ctx.fillRect(0, 0, l, h); ctx.fillRect(r, 0, w - r, h); ctx.fillRect(0, 0, w, top); ctx.fillRect(0, bot, w, h - bot);
      fade(l, 0, l + soft, 0, l - 1, 0, soft + 1, h); fade(r, 0, r - soft, 0, r - soft, 0, soft + 1, h);
      if (!o.hero) { fade(0, top, 0, top + soft * 0.7, 0, top - 1, w, soft * 0.7 + 1); fade(0, bot, 0, bot - soft * 0.7, 0, bot - soft * 0.7, w, soft * 0.7 + 1); }
      const k = ease((t - 2) / 1.5);
      if (k > 0 && o.pointers) {
        ctx.globalAlpha = k;
        for (const q of o.pointers) {
          const ax = x + pw * q.at[0], ay = y + ph * q.at[1], by = clamp(y + ph * q.to[1], 30, h - 12);
          let bx = clamp(x + pw * q.to[0], 12, w - 12);
          const right = (q.align ?? (bx > ax ? 'left' : 'right')) === 'left';
          ctx.font = '400 11px "IBM Plex Mono", monospace'; const tw = ctx.measureText(q.text.toUpperCase()).width + 12;
          bx = right ? Math.min(bx, w - tw) : Math.max(bx, tw);
          ctx.strokeStyle = 'rgba(236,231,220,.6)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(bx, by); ctx.stroke();
          ctx.shadowColor = 'rgba(0,0,0,.9)'; ctx.shadowBlur = 6;
          label(ctx, q.text, bx + (right ? 6 : -6), by, { colour: INK, align: right ? 'left' : 'right' });
          ctx.shadowBlur = 0;
        }
        ctx.globalAlpha = 1;
      }
      o.over?.(f, [x, y, pw, ph]);
      if (!o.hero) label(ctx, o.tag ?? 'Photograph', 14, 18, { colour: ACCENT });
      f.say(o.say[0], o.say[1] ?? '');
    },
  };
}

/** A globe lit from the upper left. Colours are "r,g,b". */
export function globe(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, lit = '93,126,166', dark = '27,42,64'): void {
  if (r <= 0) return;
  const g = ctx.createRadialGradient(x - r * 0.4, y - r * 0.5, r * 0.1, x, y, r);
  g.addColorStop(0, `rgb(${lit})`); g.addColorStop(1, `rgb(${dark})`);
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill();
}

/** A sun: a bright disc of radius r with a glow round it. Colour is "r,g,b" for the disc. */
export function sun(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, alpha = 1, colour = '255,214,140'): void {
  if (r <= 0 || alpha <= 0) return;
  const out = r * 2.6, g = ctx.createRadialGradient(x, y, 0, x, y, out);
  g.addColorStop(0, `rgba(255,246,222,${alpha})`); g.addColorStop(0.3, `rgba(${colour},${alpha})`);
  g.addColorStop(0.385, `rgba(${colour},${0.95 * alpha})`); g.addColorStop(0.42, `rgba(${colour},${0.26 * alpha})`); g.addColorStop(1, `rgba(${colour},0)`);
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, out, 0, TAU); ctx.fill();
}

export function dot(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, colour: string): void {
  ctx.fillStyle = colour; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill();
}
export function line(ctx: CanvasRenderingContext2D, pts: number[], colour: string, width = 1, dash?: number[]): void {
  ctx.strokeStyle = colour; ctx.lineWidth = width; if (dash) ctx.setLineDash(dash);
  ctx.beginPath(); for (let i = 0; i < pts.length; i += 2) { if (i) ctx.lineTo(pts[i], pts[i + 1]); else ctx.moveTo(pts[i], pts[i + 1]); }
  ctx.stroke(); if (dash) ctx.setLineDash([]);
}
export function ring(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, colour: string, width = 1, dash?: number[]): void {
  if (r <= 0) return;
  ctx.strokeStyle = colour; ctx.lineWidth = width; if (dash) ctx.setLineDash(dash);
  ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.stroke(); if (dash) ctx.setLineDash([]);
}
/** Words in the reading face, for a name written on a picture. */
export function words(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, opts: { align?: CanvasTextAlign; colour?: string; size?: number; italic?: boolean } = {}): void {
  ctx.font = `${opts.italic ? 'italic ' : ''}300 ${opts.size ?? 15}px Spectral, Georgia, serif`;
  ctx.textAlign = opts.align ?? 'left'; ctx.textBaseline = 'middle'; ctx.fillStyle = opts.colour ?? INK; ctx.fillText(text, x, y);
}
