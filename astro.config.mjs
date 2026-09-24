// @ts-check
import { defineConfig } from 'astro/config';
import AstroPWA from '@vite-pwa/astro';
import { APPNAVN, BAKGRUNNSFARGE, KORTNAVN, TEMAFARGE } from './pwa.config.mjs';

// `site` og `base` kan overstyres med miljøvariabler (f.eks. ved eget domene: BASE_PATH=/).
const site = process.env.SITE_URL ?? 'https://kkas18.github.io';
const base = process.env.BASE_PATH ?? '/Linjen';
const baseMedSkrastrek = base.endsWith('/') ? base : `${base}/`;

export default defineConfig({
  site,
  base,
  output: 'static',
  // Fase 5: norsk på dagens adresser, engelsk under /en/ (egne sidefiler, se src/i18n/).
  i18n: {
    locales: ['nb', 'en'],
    defaultLocale: 'nb',
    routing: { prefixDefaultLocale: false },
  },
  trailingSlash: 'always',
  build: {
    format: 'directory',
    // Små stilark legges rett i HTML: ingen render-blokkerende forespørsler (LCP < 2,0 s).
    inlineStylesheets: 'always',
  },
  image: {
    service: { entrypoint: 'astro/assets/services/sharp' },
  },
  integrations: [
    AstroPWA({
      registerType: 'autoUpdate',
      injectRegister: false, // registreres i Base.astro
      base: baseMedSkrastrek,
      scope: baseMedSkrastrek,
      manifest: {
        name: APPNAVN,
        short_name: KORTNAVN,
        description: 'Historien om Sporveien – fra hestesporveien i 1875 til i dag.',
        lang: 'nb',
        start_url: baseMedSkrastrek,
        scope: baseMedSkrastrek,
        display: 'standalone',
        theme_color: TEMAFARGE,
        background_color: BAKGRUNNSFARGE,
        icons: [
          { src: 'icons/ikon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/ikon-512.png', sizes: '512x512', type: 'image/png' },
          {
            src: 'icons/ikon-maskerbar-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        // Forhåndslagre bare skallet (CSS, JS, latinske fonter, ikoner). Sider og bilder lagres når de besøkes.
        globPatterns: ['**/*.{css,js}', '**/*latin*.woff2', 'favicon.svg', 'icons/*.png'],
        globIgnores: ['og/**', 'og-mal/**'],
        navigateFallback: null,
        runtimeCaching: [
          {
            urlPattern: ({ request }) => request.mode === 'navigate',
            handler: 'NetworkFirst',
            options: { cacheName: 'linjen-sider', networkTimeoutSeconds: 3 },
          },
          {
            urlPattern: ({ request }) => request.destination === 'image',
            handler: 'CacheFirst',
            options: {
              cacheName: 'linjen-bilder',
              expiration: { maxEntries: 300, maxAgeSeconds: 60 * 60 * 24 * 90 },
            },
          },
          {
            urlPattern: ({ request }) => request.destination === 'font',
            handler: 'CacheFirst',
            options: { cacheName: 'linjen-fonter' },
          },
        ],
      },
    }),
  ],
});
