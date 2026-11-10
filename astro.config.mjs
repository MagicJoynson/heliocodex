import { defineConfig } from 'astro/config';
import { satteri } from '@astrojs/markdown-satteri';
import { equations } from './src/lib/maths.mjs';

export default defineConfig({
  site: 'https://heliocodex.com',
  output: 'static',
  trailingSlash: 'never',
  build: { format: 'file' },
  markdown: { processor: satteri({ features: { math: true }, mdastPlugins: [equations] }) },
});
