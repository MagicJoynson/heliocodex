// Page-weight budget. Run after the build (`npm run build` does it). It only warns: it always exits 0.
// Text (HTML, JavaScript, CSS) is measured after Brotli compression, as the host sends it. Pictures and textures are measured as stored.
import { readdirSync, statSync, readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { brotliCompressSync } from 'node:zlib';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', 'dist');
const KB = 1024;
const BUDGET = {
  html: 100 * KB, // any one page of HTML
  script: 200 * KB, // any one JavaScript file
  styles: 80 * KB, // all CSS together
  image: 500 * KB, // any one picture on a page (3D textures are fetched only inside the 3D view and are exempt)
  texture: 8 * 1024 * KB, // any one 3D texture
  firstView: 500 * KB, // pictures a page loads straight away, that is every <img> not marked lazy
};
// pages that hold a long list on purpose, with their own ceiling
const HTML_EXCEPTIONS = { 'atlas/saturn.html': 130 * KB }; // every one of Saturn's moons, drawn and listed
const KEY_PAGES = ['index.html', 'stars/sirius.html', 'learn/the-milky-way/index.html', 'sky.html', 'explore.html'];

const warnings = [];
let failed = false;
const warn = (what, size, limit, where) => warnings.push(`${what}: ${(size / KB).toFixed(1)} KB, limit ${(limit / KB).toFixed(0)} KB (${where})`);
function* walk(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) yield* walk(p);
    else yield p;
  }
}
try {
  if (!existsSync(root)) throw new Error('no dist folder: build first');
  let css = 0;
  for (const p of walk(root)) {
    const text = /\.(html|js|css)$/.test(p);
    const size = text ? brotliCompressSync(readFileSync(p)).length : statSync(p).size, rel = p.slice(root.length + 1).replaceAll('\\', '/');
    if (p.endsWith('.html') && size > (HTML_EXCEPTIONS[rel] ?? BUDGET.html)) warn('HTML page', size, HTML_EXCEPTIONS[rel] ?? BUDGET.html, rel);
    else if (p.endsWith('.js') && size > BUDGET.script) warn('Script', size, BUDGET.script, rel);
    else if (p.endsWith('.css')) css += size;
    else if (rel.startsWith('textures/') && size > BUDGET.texture) warn('3D texture', size, BUDGET.texture, rel);
    else if (/\.(jpe?g|png|webp|avif)$/.test(p) && !rel.startsWith('textures/') && size > BUDGET.image) warn('Picture', size, BUDGET.image, rel);
  }
  if (css > BUDGET.styles) warn('All CSS together', css, BUDGET.styles, '_astro');
  for (const page of KEY_PAGES) {
    const file = join(root, page);
    if (!existsSync(file)) continue;
    let total = 0;
    for (const m of readFileSync(file, 'utf8').matchAll(/<img\b[^>]*>/g)) {
      if (/loading="lazy"/.test(m[0])) continue;
      const src = /\bsrc="([^"]+)"/.exec(m[0])?.[1];
      if (!src || !src.startsWith('/')) continue;
      const f = join(root, src.split('?')[0]);
      if (existsSync(f)) total += statSync(f).size;
    }
    if (total > BUDGET.firstView) warn('Pictures loaded at once', total, BUDGET.firstView, page);
  }
} catch (e) {
  failed = true;
  console.warn(`Budget check could not run: ${e.message}`);
}
if (failed) process.exitCode = 0;
else if (warnings.length) console.warn(`\nPage-weight budget: ${warnings.length} over\n` + warnings.map((w) => `  over budget, ${w}`).join('\n') + '\n');
else console.log('Page-weight budget: all within limits');
