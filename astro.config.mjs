import { defineConfig } from 'astro/config';
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
  markdown: { processor: satteri({ features: { math: true }, mdastPlugins: [equations, charts] }) },
});
