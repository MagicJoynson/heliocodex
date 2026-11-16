// Fails if any two pieces of text on an atlas drawing overlap, or if text would be too small to read.
// Needs a running preview of the built site and Playwright (not a project dependency, so it is looked
// up from PLAYWRIGHT_PATH or the usual global places). Run: npm run build, npx astro preview --port 4399,
// then: node scripts/check-atlas-labels.mjs [http://localhost:4399]
// Each letter is treated as a small circle, so text set along a curved orbit is measured where it really is,
// not by the (much larger) box around the whole curve.
import { createRequire } from 'node:module';
import { readdirSync } from 'node:fs';

const base = process.argv[2] ?? 'http://localhost:4399';
const require = createRequire(import.meta.url);
let chromium;
for (const where of [process.env.PLAYWRIGHT_PATH, 'playwright', '/opt/node-tools/node_modules/playwright'].filter(Boolean)) {
  try { ({ chromium } = require(where)); break; } catch { /* try the next one */ }
}
if (!chromium) { console.error('Playwright not found. Set PLAYWRIGHT_PATH to its folder.'); process.exit(2); }

const pages = readdirSync(new URL('../dist/atlas', import.meta.url)).filter((f) => f.endsWith('.html')).map((f) => f.slice(0, -5));
const MIN_PX = 10;
const browser = await chromium.launch();
let bad = 0;
for (const width of [1440, 390]) {
  const page = await browser.newPage({ viewport: { width, height: 900 } });
  for (const name of pages) {
    await page.goto(`${base}/atlas/${name}`);
    await page.waitForTimeout(1200);
    const result = await page.evaluate(() => {
      const problems = [];
      document.querySelectorAll('svg.plate').forEach((svg, fig) => {
        const dots = [];
        for (const t of svg.querySelectorAll('text')) {
          if (!t.getClientRects().length || !t.textContent.trim()) continue;
          const px = parseFloat(getComputedStyle(t).fontSize) * (svg.getBoundingClientRect().width / svg.viewBox.baseVal.width);
          const m = t.getScreenCTM();
          const n = t.getNumberOfChars();
          const r = px * 0.5;
          // the page is allowed to hold wide drawings in a sideways-scrolling frame, so compare in drawing units
          const unit = svg.getBoundingClientRect().width / svg.viewBox.baseVal.width;
          const owner = t.textContent.trim().slice(0, 24);
          if (px < 10) problems.push({ fig, kind: 'small', text: owner, px: +px.toFixed(1) });
          for (let i = 0; i < n; i++) {
            if (!t.textContent[i] || t.textContent[i] === ' ') continue;
            const a = t.getStartPositionOfChar(i), b = t.getEndPositionOfChar(i);
            const x = ((a.x + b.x) / 2) * m.a + ((a.y + b.y) / 2) * m.c + m.e;
            const y = ((a.x + b.x) / 2) * m.b + ((a.y + b.y) / 2) * m.d + m.f;
            dots.push({ x: x / unit, y: y / unit, r: r / unit, owner, el: t });
          }
        }
        const seen = new Set();
        for (let i = 0; i < dots.length; i++) for (let j = i + 1; j < dots.length; j++) {
          const p = dots[i], q = dots[j];
          if (p.el === q.el) continue;
          if (Math.hypot(p.x - q.x, p.y - q.y) < p.r + q.r) {
            const key = [p.owner, q.owner].sort().join('|');
            if (!seen.has(key)) { seen.add(key); problems.push({ fig, kind: 'overlap', text: `${p.owner} / ${q.owner}` }); }
          }
        }
      });
      return problems;
    });
    for (const p of result) { bad++; console.log(`${width}px  /atlas/${name}  figure ${p.fig}  ${p.kind}  ${p.text}${p.px ? ' (' + p.px + 'px)' : ''}`); }
  }
  await page.close();
}
await browser.close();
console.log(bad ? `${bad} problem(s)` : 'atlas labels: no overlaps, none too small');
process.exit(bad ? 1 : 0);
