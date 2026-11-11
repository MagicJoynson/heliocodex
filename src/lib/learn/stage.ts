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

export function label(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, opts: { align?: CanvasTextAlign; colour?: string; size?: number } = {}): void {
  ctx.font = `400 ${opts.size ?? 11}px ${MONO}`;
  ctx.textAlign = opts.align ?? 'left';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = opts.colour ?? FAINT;
  ctx.fillText(text.toUpperCase(), x, y);
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
    scene.draw({ ctx, w, h, still, pointer, say, t: still ? scene.stillAt ?? 0 : (performance.now() - started) / 1000 });
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
  size();
  return {
    redraw: kick,
    set(next) {
      if (next === scene) return;
      scene = next; started = performance.now(); last1 = last2 = '';
      if (say1) say1.textContent = ''; if (say2) say2.textContent = '';
      if (cap) cap.textContent = next.caption;
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
