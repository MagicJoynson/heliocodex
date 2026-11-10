import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://heliocodex.com',
  output: 'static',
  trailingSlash: 'never',
  build: { format: 'file' },
});
