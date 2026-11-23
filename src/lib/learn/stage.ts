/**
 * The moving pictures in lessons. A scene is a plain function that draws one frame on a 2D canvas.
 * This file sizes the canvas, runs the clock only while the picture is on screen, and holds a
 * still frame for readers who have asked their device for less motion.
 */
export interface Frame {
  ctx: CanvasRenderingContext2D;
  /** Size in CSS pixels. */
  w: number;
  h: number;
  /** Seconds since the scene started. Frozen at a chosen moment when `still` is set. */
  t: number;
  still: boolean;
  /** Pointer position in CSS pixels, or null when it is not over the picture. */
  pointer: { x: number; y: number } | null;
  /** Two short lines of figures shown beside the picture as real text. */
  say(first: string, second?: string): void;
}
export interface Scene {
  draw(f: Frame): void;
  /** The moment, in seconds, that makes the best still picture. */
  stillAt?: number;
  /** One sentence saying what is drawn and what it is based on. */
  caption: string;
  /** Settles when anything the scene must fetch, such as a photograph, has arrived. */
  ready?: Promise<unknown>;
}

export const INK = '#ece7dc', SOFT = '#c4bdaf', FAINT = '#8a8478', ACCENT = '#e9c48a', NIGHT = '#0b0b0c';
export const MONO = '"IBM Plex Mono", ui-monospace, monospace';
export const SERIF = 'Spectral, Georgia, serif';

export const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const ease = (x: number) => { const c = clamp(x); return c * c * (3 - 2 * c); };
export const mix = (a: number, b: number, k: number) => a + (b - a) * k;

/** A small repeatable random number maker, so a star field is the same on every visit. */
export function rng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let x = a;
    x = Math.imul(x ^ (x >>> 15), x | 1);
    x ^= x + Math.imul(x ^ (x >>> 7), x | 61);
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}

/** The room a scene has to draw in; set by `mount` before each frame so labels can keep inside it. */
const room = new WeakMap<CanvasRenderingContext2D, { w: number; h: number; boxes: { x0: number; x1: number; y0: number; y1: number }[] }>();

export function label(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, opts: { align?: CanvasTextAlign; colour?: string; size?: number; nudge?: boolean; plate?: boolean | string } = {}): void {
  const size = opts.size ?? 11, align = opts.align ?? 'left', up = text.toUpperCase();
  ctx.font = `400 ${size}px ${MONO}`;
  ctx.textAlign = align;
  ctx.textBaseline = 'middle';
  ctx.fillStyle = opts.colour ?? FAINT;
  const r = room.get(ctx);
  if (!r) { ctx.fillText(up, x, y); return; }
  // keep every label inside the drawing: a long one goes on two lines, and each line is moved in from the edges
  const margin = 4, fit = r.w - margin * 2;
  let lines = [up];
  if (ctx.measureText(up).width > fit) {
    const words = up.split(' ');
    let best = 1, gap = Infinity;
    for (let i = 1; i < words.length; i++) {
      const g = Math.abs(ctx.measureText(words.slice(0, i).join(' ')).width - ctx.measureText(words.slice(i).join(' ')).width);
      if (g < gap) { gap = g; best = i; }
    }
    lines = [words.slice(0, best).join(' '), words.slice(best).join(' ')];
  }
  const lh = size + 3, half = size / 2 + 1, GAP = 3;
  const widths = lines.map((line) => ctx.measureText(line).width);
  const placed = (dy: number) => lines.map((_, i) => {
    const left = align === 'right' ? x - widths[i] : align === 'center' ? x - widths[i] / 2 : x;
    const nl = Math.min(Math.max(left, margin), Math.max(margin, r.w - margin - widths[i]));
    return { x: nl, y: 0, i, dy, box: { x0: nl, x1: nl + widths[i], y0: 0, y1: 0 } };
  });
  const top = half + 2, bottom = r.h - half - (lines.length - 1) * lh - 2;
  const base = Math.min(Math.max(y - (lines.length - 1) * lh / 2, top), bottom);
  // off by default, because a label belongs to the thing it names and only the scene knows which: with `nudge`, a label that would
  // touch one already drawn is moved up or down, a line at a time, to the nearest free place
  let chosen = base, found = false;
  for (const dy of (opts.nudge ? [0, lh, -lh, 2 * lh, -2 * lh, 3 * lh, -3 * lh, 4 * lh, -4 * lh] : [0])) {
    const yy = base + dy;
    if (dy && (yy < top || yy > bottom)) continue;
    const clash = placed(0).some((q) => {
      const b = { x0: q.box.x0 - GAP, x1: q.box.x1 + GAP, y0: yy + q.i * lh - half + 1 - GAP, y1: yy + q.i * lh + half - 1 + GAP };
      return r.boxes.some((o) => b.x1 > o.x0 && o.x1 > b.x0 && b.y1 > o.y0 && o.y1 > b.y0);
    });
    if (!clash) { chosen = yy; found = true; break; }
  }
  if (!found) chosen = base;
  ctx.textAlign = 'left';
  const log = (globalThis as { __labelMoves?: unknown[] }).__labelMoves; // only set by scripts/check-not-to-scale.mjs
  placed(0).forEach((q) => {
    if (log) log.push({ canvas: ctx.canvas, text: lines[q.i], dx: q.x - (align === 'right' ? x - widths[q.i] : align === 'center' ? x - widths[q.i] / 2 : x), dy: chosen + q.i * lh - (y + (q.i - (lines.length - 1) / 2) * lh) });
    const yy = chosen + q.i * lh;
    r.boxes.push({ x0: q.box.x0, x1: q.box.x1, y0: yy - half + 1, y1: yy + half - 1 });
    // `plate`: a dark patch behind the words, for a label that has to sit among lines (draw it after the lines)
    if (opts.plate) {
      // soft-edged, so that it reads as a calm patch behind the words and not as a box
      const pc = typeof opts.plate === 'string' ? opts.plate : 'rgba(11,11,12,.88)', sc = ctx.shadowColor, sb = ctx.shadowBlur;
      ctx.fillStyle = pc; ctx.shadowColor = pc; ctx.shadowBlur = 9;
      ctx.fillRect(q.box.x0 - 3, yy - half, widths[q.i] + 6, half * 2);
      ctx.shadowColor = sc; ctx.shadowBlur = sb; ctx.fillStyle = opts.colour ?? FAINT;
    }
    ctx.fillText(lines[q.i], q.x, yy);
  });
}

/** A quiet scatter of background stars. */
export function stars(count: number, seed: number): (ctx: CanvasRenderingContext2D, w: number, h: number, alpha?: number) => void {
  const r = rng(seed), pts = Array.from({ length: count }, () => [r(), r(), 0.3 + r() * 0.9, 0.25 + r() * 0.55]);
  return (ctx, w, h, alpha = 1) => {
    for (const [x, y, size, a] of pts) {
      ctx.fillStyle = `rgba(236,231,220,${a * alpha})`;
      ctx.fillRect(x * w, y * h, size, size);
    }
  };
}

export const nf = (n: number, digits = 0) => n.toLocaleString('en-GB', { maximumFractionDigits: digits, minimumFractionDigits: digits });

const NOT_TO_SCALE = /not (drawn )?to scale|far from scale/i;
const STRIP = 30;
/** A small outlined "Not to scale" mark in a strip reserved above the drawing, 13 px so it reads on a 360 px phone. */
function tag(ctx: CanvasRenderingContext2D, w: number): void {
  ctx.save();
  ctx.font = "13px 'IBM Plex Mono', ui-monospace, monospace";
  ctx.letterSpacing = '0px'; ctx.textAlign = 'left'; ctx.globalAlpha = 1;
  const text = 'NOT TO SCALE', pad = 8, tw = ctx.measureText(text).width, x = w - tw - pad * 2 - 4, y = 3;
  ctx.fillStyle = 'rgba(7,8,13,.7)'; ctx.fillRect(x, y, tw + pad * 2, 26);
  ctx.strokeStyle = 'rgba(236,231,220,.45)'; ctx.lineWidth = 1; ctx.strokeRect(x + .5, y + .5, tw + pad * 2 - 1, 25);
  ctx.fillStyle = 'rgba(236,231,220,.92)'; ctx.textBaseline = 'middle'; ctx.fillText(text, x + pad, y + 13.5);
  ctx.restore();
}

interface Mounted { stop(): void; set(scene: Scene): void; /** Draw again now, for a picture that changes only when the reader moves a control. */ redraw(): void }

/**
 * Put a scene on a canvas. `host` must hold a <canvas>, and may hold elements marked
 * data-say="1", data-say="2" and data-caption for the words that go with the picture.
 */
export function mount(host: HTMLElement, first: Scene): Mounted {
  const canvas = host.querySelector('canvas')!;
  const ctx = canvas.getContext('2d')!;
  const say1 = host.querySelector<HTMLElement>('[data-say="1"]'), say2 = host.querySelector<HTMLElement>('[data-say="2"]');
  const cap = host.querySelector<HTMLElement>('[data-caption]');
  const calm = matchMedia('(prefers-reduced-motion: reduce)');
  let scene = first, started = performance.now(), w = 0, h = 0, raf = 0, seen = false, pointer: Frame['pointer'] = null;
  let last1 = '', last2 = '';
  const say = (a: string, b = '') => {
    if (say1 && a !== last1) say1.textContent = last1 = a;
    if (say2 && b !== last2) say2.textContent = last2 = b;
  };
  function size(): void {
    const box = canvas.getBoundingClientRect(), ratio = Math.min(devicePixelRatio || 1, 2);
    w = box.width; h = box.height;
    canvas.width = Math.round(w * ratio); canvas.height = Math.round(h * ratio);
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  }
  function frame(): void {
    raf = 0;
    if (!w || !h) return;
    const still = calm.matches;
    ctx.clearRect(0, 0, w, h);
    room.set(ctx, { w, h, boxes: [] });
    const t = still ? scene.stillAt ?? 0 : (performance.now() - started) / 1000;
    // a drawing of an idea says so on the picture itself, where it cannot be scrolled away from the caption;
    // the mark gets its own strip above the drawing so it never covers a label
    if (NOT_TO_SCALE.test(scene.caption) && h > STRIP * 3) {
      ctx.save(); ctx.translate(0, STRIP);
      // anything a scene draws above its own top edge is cut off here, as it was at the top of the canvas, never into the strip
      ctx.beginPath(); ctx.rect(0, 0, w, h - STRIP); ctx.clip();
      room.set(ctx, { w, h: h - STRIP, boxes: [] });
      scene.draw({ ctx, w, h: h - STRIP, still, pointer: pointer && { x: pointer.x, y: pointer.y - STRIP }, say, t });
      ctx.restore(); tag(ctx, w);
    } else scene.draw({ ctx, w, h, still, pointer, say, t });
    if (!still && seen) raf = requestAnimationFrame(frame);
  }
  const kick = () => { if (!raf) raf = requestAnimationFrame(frame); };
  const watch = new IntersectionObserver(([e]) => { seen = e.isIntersecting; if (seen) kick(); }, { rootMargin: '80px' });
  watch.observe(canvas);
  const sized = new ResizeObserver(() => { size(); kick(); });
  sized.observe(canvas);
  const move = (e: PointerEvent) => { const b = canvas.getBoundingClientRect(); pointer = { x: e.clientX - b.left, y: e.clientY - b.top }; };
  const leave = () => { pointer = null; };
  canvas.addEventListener('pointermove', move);
  canvas.addEventListener('pointerleave', leave);
  calm.addEventListener('change', kick);
  document.fonts?.ready.then(kick);
  if (cap) cap.textContent = scene.caption;
  scene.ready?.then(kick, kick);
  size();
  return {
    redraw: kick,
    set(next) {
      if (next === scene) return;
      scene = next; started = performance.now(); last1 = last2 = '';
      if (say1) say1.textContent = ''; if (say2) say2.textContent = '';
      if (cap) cap.textContent = next.caption;
      next.ready?.then(kick, kick);
      // one picture gives way to the next with a short fade, not a jump
      if (!calm.matches) canvas.animate?.([{ opacity: 0 }, { opacity: 1 }], { duration: 420, easing: 'ease-out' });
      kick();
    },
    stop() { cancelAnimationFrame(raf); watch.disconnect(); sized.disconnect(); canvas.removeEventListener('pointermove', move); canvas.removeEventListener('pointerleave', leave); },
  };
}

/**
 * A story: one picture that stays put while the paragraphs scroll past it. The scene changes
 * to match whichever paragraph is nearest the middle of the window.
 */
export function story(root: HTMLElement, scenes: Scene[]): void {
  const stage = root.querySelector<HTMLElement>('[data-stage]')!;
  const steps = [...root.querySelectorAll<HTMLElement>('[data-step]')];
  const mounted = mount(stage, scenes[0]);
  let current = -1, queued = false;
  function pick(): void {
    queued = false;
    // on a phone the picture is pinned to the top, so the words are read in the space under it
    const under = stage.getBoundingClientRect().bottom;
    const mid = innerWidth <= 860 ? (Math.min(under, innerHeight * 0.7) + innerHeight) / 2 : innerHeight * 0.5;
    let best = 0, gap = Infinity;
    steps.forEach((s, i) => {
      const b = (s.firstElementChild ?? s).getBoundingClientRect(), d = Math.abs((b.top + b.bottom) / 2 - mid);
      if (d < gap) { gap = d; best = i; }
    });
    if (best === current) return;
    current = best;
    steps.forEach((s, i) => s.toggleAttribute('data-on', i === best));
    mounted.set(scenes[Math.min(best, scenes.length - 1)]);
  }
  const ask = () => { if (!queued) { queued = true; requestAnimationFrame(pick); } };
  addEventListener('scroll', ask, { passive: true });
  addEventListener('resize', ask);
  pick();
}
