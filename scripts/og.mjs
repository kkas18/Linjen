// Genererer Open Graph-bilder (1200 × 630) ved bygg: tar skjermbilde av hver side under
// dist/og-mal/ med de ekte fontene, lagrer dist/og/<slug>.png og fjerner malene fra dist/.
// Kjøres automatisk av `npm run build`. Sett CHROMIUM_PATH hvis Playwright ikke finner nettleseren.

import { mkdir, readdir, rm } from 'node:fs/promises';
import { chromium } from '@playwright/test';
import { startServer } from './statisk-server.mjs';

const base = (process.env.BASE_PATH ?? '/Linjen').replace(/\/$/, '');
const port = 4341;

const sider = (await readdir('dist/og-mal', { withFileTypes: true }))
  .filter((d) => d.isDirectory())
  .map((d) => d.name);

const server = await startServer({ port });
const nettleser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH });
try {
  await mkdir('dist/og', { recursive: true });
  const side = await nettleser.newPage({ viewport: { width: 1200, height: 630 } });
  for (const slug of sider) {
    await side.goto(`http://localhost:${port}${base}/og-mal/${slug}/`, {
      waitUntil: 'networkidle',
    });
    await side.evaluate(() => document.fonts.ready);
    await side.screenshot({ path: `dist/og/${slug}.png` });
  }
  console.warn(`OG-bilder: ${sider.length} generert i dist/og/`);
} finally {
  await nettleser.close();
  server.close();
  await rm('dist/og-mal', { recursive: true, force: true });
}
