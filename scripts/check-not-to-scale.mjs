// Runs every step of every story scene, at 390 and 1440 px, and flags any scene whose caption
// says "not to scale" but has no NOT TO SCALE mark, or whose mark overlaps any other text on the canvas.
// Needs `npm run build` and `npx astro preview --port 4399` running, and Playwright (NODE_PATH=$(npm root -g)).
import { readdirSync } from 'node:fs';
import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)('playwright');
const base = process.env.BASE || 'http://localhost:4399';
const ids = readdirSync(new URL('../src/lib/learn/scenes/', import.meta.url)).filter((f) => f.endsWith('.ts')).map((f) => f.slice(0, -3));
const CAP = /not (drawn )?to scale|far from scale/i;
const browser = await chromium.launch();
const problems = []; let steps = 0, marked = 0;
for (const [w, h] of [[390, 844], [1440, 900]]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
  await ctx.addInitScript(() => {
    const P = CanvasRenderingContext2D.prototype, fill = P.fillText, clear = P.clearRect;
    P.clearRect = function (...a) { if (a[2] >= this.canvas.width * 0.9) this.canvas.__t = []; this.canvas.__clip = null; this.__st = []; return clear.apply(this, a); };
    const rect = P.rect, clip = P.clip, restore = P.restore, save = P.save;
    P.rect = function (x, y, w, h) { const m = this.getTransform(); this.__r = { x0: m.e + x * m.a, x1: m.e + (x + w) * m.a, y0: m.f + y * m.d, y1: m.f + (y + h) * m.d }; return rect.call(this, x, y, w, h); };
    P.clip = function (...a) { this.canvas.__clip = this.__r; return clip.apply(this, a); };
    P.save = function () { (this.__st ||= []).push(this.canvas.__clip); return save.call(this); };
    P.restore = function () { this.canvas.__clip = (this.__st || []).pop() ?? null; return restore.call(this); };
    P.fillText = function (text, x, y, ...r) {
      const m = this.getTransform(), tw = this.measureText(text), a = this.textAlign;
      const asc = tw.actualBoundingBoxAscent, desc = tw.actualBoundingBoxDescent;
      const left = a === 'right' || a === 'end' ? x - tw.width : a === 'center' ? x - tw.width / 2 : x;
      const b = { text, x0: m.e + left * m.a, x1: m.e + (left + tw.width) * m.a, y0: m.f + (y - asc) * m.d, y1: m.f + (y + desc) * m.d }, c = this.canvas.__clip;
      // text cut off by a clip never shows, so it cannot overlap anything
      if (c) { b.x0 = Math.max(b.x0, c.x0); b.x1 = Math.min(b.x1, c.x1); b.y0 = Math.max(b.y0, c.y0); b.y1 = Math.min(b.y1, c.y1); }
      if (!c || (b.x1 > b.x0 && b.y1 > b.y0)) (this.canvas.__t ||= []).push(b);
      return fill.call(this, text, x, y, ...r);
    };
  });
  const p = await ctx.newPage();
  for (const id of ids) {
    await p.goto(`${base}/learn/${id}`, { waitUntil: 'networkidle' }).catch(() => {});
    const n = await p.locator('.story-steps > *').count();
    for (let i = 0; i < n; i++) {
      await p.locator('.story-steps > *').nth(i).scrollIntoViewIfNeeded(); await p.waitForTimeout(450);
      steps++;
      const r = await p.evaluate(() => {
        const cap = document.querySelector('.story-stage [data-caption]')?.textContent || '';
        const t = document.querySelector('.story-stage canvas')?.__t || [];
        return { cap, t };
      });
      if (!CAP.test(r.cap)) continue;
      const tag = r.t.find((q) => q.text === 'NOT TO SCALE');
      const where = `${id} step ${i + 1} @${w}`;
      if (!tag) { problems.push(`${where}: caption says not to scale but there is no mark`); continue; }
      marked++;
      const pad = 0, mid = (tag.y0 + tag.y1) / 2, box = { x0: tag.x0 - 8, x1: tag.x1 + 8, y0: mid - 13, y1: mid + 13 }; // the outlined box round the text
      for (const q of r.t) {
        if (q === tag || q.text === "NOT TO SCALE") continue;
        if (q.x1 > box.x0 - pad && q.x0 < box.x1 + pad && q.y1 > box.y0 - pad && q.y0 < box.y1 + pad) problems.push(`${where}: "${q.text}" overlaps the mark`);
      }
    }
  }
  await ctx.close();
}
await browser.close();
console.log(`${steps} steps, ${marked} marked`);
if (problems.length) { console.log(problems.join('\n')); process.exit(1); }
console.log('no overlaps');
