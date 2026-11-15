import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { satteri } from '@astrojs/markdown-satteri';
import { equations } from './src/lib/maths.mjs';
import { charts } from './src/lib/charts.mjs';

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
      filter: (page) => !/^https:\/\/heliocodex\.com\/(search|v2|stars\/catalogue|404)\/?$/.test(page),
    }),
  ],
  markdown: { processor: satteri({ features: { math: true }, mdastPlugins: [equations, charts] }) },
});
