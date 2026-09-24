// @ts-check
import { defineConfig } from 'astro/config';

// `site` og `base` kan overstyres med miljøvariabler (f.eks. ved eget domene: BASE_PATH=/).
const site = process.env.SITE_URL ?? 'https://kkas18.github.io';
const base = process.env.BASE_PATH ?? '/Linjen';

export default defineConfig({
  site,
  base,
  output: 'static',
  trailingSlash: 'always',
  build: {
    format: 'directory',
  },
  image: {
    service: { entrypoint: 'astro/assets/services/sharp' },
  },
});
