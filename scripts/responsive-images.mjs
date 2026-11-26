// Smaller pictures for smaller screens. Runs after the build (`npm run build` does it).
// For every photograph an HTML page shows with <img>, it writes WebP copies 480 and 960 pixels wide next to the
// original in dist/, and gives the <img> a srcset (the copies, then the original) so a phone fetches a small one.
// The original JPEG or PNG stays as the src, for any browser that cannot use WebP. Nothing is added to the repository.
import { readdirSync, statSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const dist = join(dirname(fileURLToPath(import.meta.url)), '..', 'dist');
const STEPS = [480, 960];
const MIN = 520; // pictures narrower than this are left as they are
function* pages(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) yield* pages(p);
    else if (name.endsWith('.html')) yield p;
  }
}

const made = new Map(); // src -> { widths: [[url, w]], natural }
async function variants(src) {
  if (made.has(src)) return made.get(src);
  let out = null;
  const file = join(dist, src);
  if (existsSync(file)) {
    const img = sharp(file), meta = await img.metadata();
    if (meta.width >= MIN) {
      const base = src.replace(/\.(jpe?g|png|webp)$/i, '');
      const widths = [];
      const steps = STEPS.filter((s) => s < meta.width - 40);
      await Promise.all(steps.map((w) => sharp(file).resize({ width: w }).webp({ quality: 78, effort: 2 }).toFile(join(dist, `${base}-${w}w.webp`))));
      for (const w of steps) widths.push([`${base}-${w}w.webp`, w]);
      // the original itself is the largest choice, so a wide screen gets exactly what it got before
      widths.push([src, meta.width]);
      out = { widths, natural: meta.width };
    }
  }
  made.set(src, out);
  return out;
}

let pagesChanged = 0, imgs = 0;
const IMG = /<img\b[^>]*>/g;
for (const page of pages(dist)) {
  const html = readFileSync(page, 'utf8');
  const found = [...html.matchAll(IMG)].map((m) => m[0]).filter((t) => !/\bsrcset=/.test(t) && /\bsrc="(\/img\/[^"?#]+\.(?:jpe?g|png|webp))"/i.test(t));
  if (!found.length) continue;
  let next = html;
  for (const tag of new Set(found)) {
    const src = tag.match(/\bsrc="([^"]+)"/)[1];
    const v = await variants(src);
    if (!v) continue;
    const attrW = Number(tag.match(/\bwidth="(\d+)"/)?.[1] ?? v.natural);
    // the width it is drawn at on a wide screen is at most its width attribute; on a phone, at most the screen
    const sizes = attrW < 480 ? `${attrW}px` : `(max-width: 760px) 100vw, ${Math.min(attrW, v.natural)}px`;
    const set = v.widths.map(([u, w]) => `${u} ${w}w`).join(', ');
    next = next.split(tag).join(tag.replace(/<img\b/, `<img srcset="${set}" sizes="${sizes}"`));
    imgs++;
  }
  if (next !== html) { writeFileSync(page, next); pagesChanged++; }
}
console.log(`responsive images: ${made.size} pictures checked, ${[...made.values()].filter(Boolean).length} given smaller copies, ${imgs} tags on ${pagesChanged} pages`);
