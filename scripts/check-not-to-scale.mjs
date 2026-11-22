// Runs every step of every story scene, and every other canvas on each lesson page, at 390 and 1440 px,
// at four moments of its animation, and flags:
//   - a caption that says "not to scale" but has no NOT TO SCALE mark;
//   - any canvas text (fillText or strokeText) that overlaps, or comes within 2 px of, any other text, the mark included;
//   - any canvas text that runs past the edge of the drawing (below the mark's strip when there is one).
// Needs `npm run build` and `npx astro preview --port 4399` running, and Playwright (NODE_PATH=$(npm root -g)).
// Set ONLY=lesson-id,lesson-id to check a few lessons.
import { readdirSync } from 'node:fs';
import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)('playwright');
const base = process.env.BASE || 'http://localhost:4399';
const only = process.env.ONLY?.split(',');
const ids = readdirSync(new URL('../src/lib/learn/scenes/', import.meta.url)).filter((f) => f.endsWith('.ts')).map((f) => f.slice(0, -3)).filter((id) => !only || only.includes(id));
const CAP = /not (drawn )?to scale|far from scale/i, GAP = 2, SKEWS = [0, 3300, 4100, 5900];
const browser = await chromium.launch();
const problems = new Set(); let looked = 0, marked = 0;

function check(where, t, W, H, top) {
  for (const q of t) {
    if (q.text === 'NOT TO SCALE') continue;
    const a = q.raw;
    if (a.x0 < -0.5 || a.x1 > W + 0.5 || a.y0 < top - 0.5 || a.y1 > H + 0.5) problems.add(`${where}: "${q.text}" crosses the edge`);
  }
  const tag = t.find((q) => q.text === 'NOT TO SCALE'), same = (a, b) => a.text === b.text && Math.abs(a.x0 - b.x0) < 1.5 && Math.abs(a.y0 - b.y0) < 1.5;
  if (tag) { // the outlined box is wider and taller than its text
    const mid = (tag.y0 + tag.y1) / 2; tag.x0 -= 8; tag.x1 += 8; tag.y0 = mid - 13; tag.y1 = mid + 13;
  }
  for (let i = 0; i < t.length; i++) for (let j = i + 1; j < t.length; j++) {
    const a = t[i], b = t[j];
    if (same(a, b)) continue;
    if (a.x1 + GAP > b.x0 && b.x1 + GAP > a.x0 && a.y1 + GAP > b.y0 && b.y1 + GAP > a.y0) problems.add(`${where}: "${a.text}" and "${b.text}" touch or overlap`);
  }
}

for (const [w, h] of [[390, 844], [1440, 900]]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
  await ctx.addInitScript(() => {
    window.__skew = 0; const now = performance.now.bind(performance); performance.now = () => now() + window.__skew;
    const P = CanvasRenderingContext2D.prototype, fill = P.fillText, stroke = P.strokeText, clear = P.clearRect;
    P.clearRect = function (...a) { if (a[2] >= this.canvas.width * 0.9) { this.canvas.__t = []; this.canvas.__clip = null; this.__st = []; } return clear.apply(this, a); };
    const rect = P.rect, clip = P.clip, restore = P.restore, save = P.save;
    P.rect = function (x, y, w, h) { const m = this.getTransform(); this.__r = { x0: m.e + x * m.a, x1: m.e + (x + w) * m.a, y0: m.f + y * m.d, y1: m.f + (y + h) * m.d }; return rect.call(this, x, y, w, h); };
    P.clip = function (...a) { this.canvas.__clip = this.__r; return clip.apply(this, a); };
    P.save = function () { (this.__st ||= []).push(this.canvas.__clip); return save.call(this); };
    P.restore = function () { this.canvas.__clip = (this.__st || []).pop() ?? null; return restore.call(this); };
    const note = (self, text, x, y) => {
      const m = self.getTransform(), tw = self.measureText(text), a = self.textAlign;
      const left = a === 'right' || a === 'end' ? x - tw.width : a === 'center' ? x - tw.width / 2 : x;
      const raw = { x0: m.e + left * m.a, x1: m.e + (left + tw.width) * m.a, y0: m.f + (y - tw.actualBoundingBoxAscent) * m.d, y1: m.f + (y + tw.actualBoundingBoxDescent) * m.d };
      const b = { text, raw, ...raw }, c = self.canvas.__clip;
      // text cut off by a clip never shows, so it cannot overlap anything
      if (c) { b.x0 = Math.max(b.x0, c.x0); b.x1 = Math.min(b.x1, c.x1); b.y0 = Math.max(b.y0, c.y0); b.y1 = Math.min(b.y1, c.y1); }
      if (!c || (b.x1 > b.x0 && b.y1 > b.y0)) (self.canvas.__t ||= []).push(b);
    };
    P.fillText = function (text, x, y, ...r) { note(this, text, x, y); return fill.call(this, text, x, y, ...r); };
    P.strokeText = function (text, x, y, ...r) { note(this, text, x, y); return stroke.call(this, text, x, y, ...r); };
  });
  const p = await ctx.newPage();
  // sample the canvas at the given index (of all canvases on the page) at several moments
  const sample = async (id, label, index, story) => {
    for (const skew of SKEWS) {
      await p.evaluate((s) => { window.__skew = s; }, skew); await p.waitForTimeout(skew ? 160 : 450);
      const r = await p.evaluate(([ix, st]) => {
        const cv = document.querySelectorAll('canvas')[ix]; if (!cv) return null;
        const box = cv.getBoundingClientRect();
        const cap = (st ? document.querySelector('.story-stage [data-caption]') : cv.closest('figure, .stage-fig, section')?.querySelector('[data-caption], figcaption'))?.textContent || '';
        return { cap, t: (cv.__t || []).map((q) => ({ ...q })), W: box.width, H: box.height };
      }, [index, story]);
      if (!r || !r.t.length && !CAP.test(r.cap)) continue;
      looked++;
      const isMarked = CAP.test(r.cap), where = `${id} ${label} @${w}`;
      if (isMarked) { if (!r.t.some((q) => q.text === 'NOT TO SCALE')) { problems.add(`${where}: caption says not to scale but there is no mark`); continue; } marked++; }
      check(where, r.t, r.W, r.H, isMarked ? 30 : 0);
    }
    await p.evaluate(() => { window.__skew = 0; });
  };
  for (const id of ids) {
    await p.goto(`${base}/learn/${id}`, { waitUntil: 'networkidle' }).catch(() => {});
    const n = await p.locator('.story-steps > *').count();
    const storyIndex = await p.evaluate(() => [...document.querySelectorAll('canvas')].indexOf(document.querySelector('.story-stage canvas')));
    for (let i = 0; i < n; i++) {
      await p.locator('.story-steps > *').nth(i).scrollIntoViewIfNeeded();
      await sample(id, `step ${i + 1}`, storyIndex, true);
    }
    const count = await p.locator('canvas').count();
    for (let k = 0; k < count; k++) {
      if (k === storyIndex) continue;
      await p.locator('canvas').nth(k).scrollIntoViewIfNeeded().catch(() => {});
      await sample(id, `canvas ${k + 1}`, k, false);
    }
  }
  await ctx.close();
}
await browser.close();
console.log(`${looked} samples, ${marked} with the mark`);
if (problems.size) { console.log([...problems].sort().join('\n')); process.exit(1); }
console.log('no overlaps, no cut-off text');
