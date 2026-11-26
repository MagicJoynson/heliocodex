import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { satteri } from '@astrojs/markdown-satteri';
import { equations } from './src/lib/maths.mjs';
import { charts } from './src/lib/charts.mjs';
import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';

// <lastmod> for the sitemap: the date of the last commit that changed the files a page is made from. Where git
// cannot say (no history in the build), the page is listed without a date rather than with a made-up one.
const changed = new Map();
function lastCommit(paths) {
  const key = paths.join('|');
  if (!changed.has(key)) {
    let when = '';
    try { when = execFileSync('git', ['log', '-1', '--format=%cI', '--', ...paths], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim(); } catch { /* no git here */ }
    changed.set(key, when);
  }
  return changed.get(key);
}
function sourcesOf(url) {
  const p = new URL(url).pathname.replace(/\/$/, '') || '/index';
  const m = p.match(/^\/learn\/(?!facts|packs|subject)([^/]+)/);
  if (m && existsSync(`src/content/lessons/${m[1]}`)) return [`src/content/lessons/${m[1]}`, 'src/components/learn', 'src/pages/learn/[lesson].astro'];
  if (p.startsWith('/stars/in/')) return ['src/pages/stars/in', 'src/lib/sky/finding.ts', 'public/data/deep/stars-meta.json'];
  if (p.startsWith('/stars/')) return ['src/pages/stars/[star].astro', 'src/lib/sky/star.ts', 'public/data/deep/stars-meta.json'];
  if (p.startsWith('/worlds/')) return ['src/pages/worlds/[id].astro', 'src/data/world-pages.ts', 'src/data/bodies'];
  if (p.startsWith('/atlas/')) return ['src/pages/atlas', 'src/lib/v2/atlas'];
  if (/^\/(accessibility|cookies|licences|privacy|terms)$/.test(p)) return [`src/pages${p}.astro`, `src/content/legal${p}.md`];
  const page = `src/pages${p}.astro`;
  return existsSync(page) ? [page] : ['src/pages'];
}

export default defineConfig({
  site: 'https://heliocodex.com',
  output: 'static',
  trailingSlash: 'never',
  build: { format: 'file' },
  // /bodies was a second list of the planets; the Solar System page (/worlds) is now the one way in
  redirects: { '/bodies': '/worlds' },
  // The sitemap is written at build time, so it follows the pages. Pages marked noindex or that
  // only exist as tools (search, the catalogue-number page, the v2 test page) are left out.
  integrations: [
    sitemap({
      filter: (page) => !/^https:\/\/heliocodex\.com\/(search|v2|stars\/catalogue|learn\/packs|404)\/?$/.test(page),
      serialize: (item) => { const when = lastCommit(sourcesOf(item.url)); return when ? { ...item, lastmod: when } : item; },
    }),
  ],
  markdown: { processor: satteri({ features: { math: true }, mdastPlugins: [equations, charts] }) },
});
