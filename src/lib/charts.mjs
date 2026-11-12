// Drawn charts in lessons are SVG files in public/img/learn/charts. Written into a lesson as an <img>,
// they would be drawn in the browser's own fonts and could not take the page's styles. This step puts
// each chart's drawing into the page itself at build time, so its words are set in the site's type
// (see .chart in reading.css). The <img> stays as written in the lesson, so the file is still the one
// place a chart lives. Astro's content cache does not notice a change here: delete .astro/data-store.json.
import { defineMdastPlugin } from 'satteri';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../../public', import.meta.url));
const IMG = /<img\s+[^>]*src="(\/img\/learn\/charts\/([\w-]+)\.svg)"[^>]*>/g;
const attr = (tag, name) => (new RegExp(`\\b${name}="([^"]*)"`).exec(tag) ?? [])[1] ?? '';
const esc = (s) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

function inline(tag, src, name) {
  const svg = readFileSync(root + src, 'utf8').replace(/<\?xml[^>]*>\s*/, '');
  const alt = attr(tag, 'alt');
  // ids are made unique to the chart, so two charts on one page cannot borrow each other's gradients
  const body = svg
    .replace(/\bid="([^"]+)"/g, `id="${name}-$1"`)
    .replace(/url\(#([^)]+)\)/g, `url(#${name}-$1)`)
    .replace(/href="#([^"]+)"/g, `href="#${name}-$1"`);
  return body.replace(/<svg\b([^>]*)>/, (_m, a) => {
    const kept = a.replace(/\s(width|height|font-family)="[^"]*"/g, '');
    return `<svg${kept} class="chart" role="img" aria-label="${esc(alt)}" data-src="${src}">`;
  });
}

export const charts = defineMdastPlugin({
  name: 'charts',
  html(node, ctx) {
    if (!node.value.includes('/img/learn/charts/')) return;
    ctx.setField(node, 'value', node.value.replace(IMG, (tag, src, name) => inline(tag, src, name)));
  },
});
