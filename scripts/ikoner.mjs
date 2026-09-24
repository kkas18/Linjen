// Genererer app-ikoner og favicon fra én SVG: trikkemerket på sporlinjen, på tunnelfarge.
// Bruk: npm run ikoner  (resultatet sjekkes inn i public/icons/)
// Farger speiler tokens.css: --c-tunnel, --c-skinne-mork, --c-trikkebla, --c-flate.

import { mkdir, writeFile } from 'node:fs/promises';
import sharp from 'sharp';

const TUNNEL = '#0F1216';
const SKINNE = '#3A414B';
const BLA = '#1D4F9A';
const HVIT = '#FFFFFF';

/** Ikon på 512 × 512. `skala` < 1 gir luft rundt motivet (maskerbart ikon). */
function svg(skala = 1) {
  const s = (v) => v * skala;
  const midt = 256;
  const b = s(96); // trikkens bredde (forhold 12 × 28)
  const h = s(224);
  const x = midt - b / 2;
  const y = midt - h / 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" fill="${TUNNEL}"/>
  <rect x="${midt - s(8)}" y="0" width="${s(16)}" height="512" fill="${SKINNE}"/>
  <rect x="${x}" y="${y}" width="${b}" height="${h}" fill="${BLA}"/>
  <rect x="${x + s(16)}" y="${y + s(24)}" width="${b - s(32)}" height="${s(40)}" fill="${HVIT}"/>
  <rect x="${x + s(16)}" y="${y + h - s(64)}" width="${b - s(32)}" height="${s(40)}" fill="${HVIT}"/>
</svg>`;
}

await mkdir('public/icons', { recursive: true });
await writeFile('public/favicon.svg', svg());
for (const storrelse of [192, 512]) {
  await sharp(Buffer.from(svg()))
    .resize(storrelse)
    .png()
    .toFile(`public/icons/ikon-${storrelse}.png`);
}
await sharp(Buffer.from(svg(0.7)))
  .resize(512)
  .png()
  .toFile('public/icons/ikon-maskerbar-512.png');
await sharp(Buffer.from(svg())).resize(180).png().toFile('public/icons/apple-touch-icon.png');
console.warn('Ikoner generert i public/icons/ og public/favicon.svg');
