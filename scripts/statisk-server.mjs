// Minimal statisk server for dist/ under base-stien. Brukes av OG-generatoren og Playwright-testene,
// så vi slipper `astro preview` (som kjører som bakgrunnstjeneste i Astro 7).
// Bruk som modul: startServer({ port, base }) eller fra CLI: node scripts/statisk-server.mjs [port]

import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const TYPER = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json',
  '.webmanifest': 'application/manifest+json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.xml': 'application/xml',
  '.txt': 'text/plain; charset=utf-8',
};

export function startServer({
  port = 4340,
  base = process.env.BASE_PATH ?? '/Linjen',
  rot = 'dist',
} = {}) {
  const prefiks = base.replace(/\/$/, '');
  const server = createServer(async (req, res) => {
    const sti = decodeURIComponent(new URL(req.url ?? '/', 'http://x').pathname);
    if (prefiks && !sti.startsWith(`${prefiks}/`) && sti !== prefiks) {
      res.writeHead(404).end();
      return;
    }
    let fil = normalize(join(rot, sti.slice(prefiks.length)));
    if (!fil.startsWith(normalize(rot))) {
      res.writeHead(403).end();
      return;
    }
    try {
      if ((await stat(fil)).isDirectory()) fil = join(fil, 'index.html');
      const innhold = await readFile(fil);
      res.writeHead(200, { 'content-type': TYPER[extname(fil)] ?? 'application/octet-stream' });
      res.end(innhold);
    } catch {
      const side404 = await readFile(join(rot, '404.html')).catch(() => null);
      res.writeHead(404, { 'content-type': TYPER['.html'] });
      res.end(side404 ?? 'Ikke funnet');
    }
  });
  return new Promise((ok) => server.listen(port, () => ok(server)));
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const port = Number(process.argv[2] ?? 4340);
  await startServer({ port });
  console.warn(`Serverer dist/ på http://localhost:${port}${process.env.BASE_PATH ?? '/Linjen'}/`);
}
