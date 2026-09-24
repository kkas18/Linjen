// sitemap.xml (kapittel 8) uten ekstra avhengigheter.
import type { APIRoute } from 'astro';
import { hentEpoker } from '../lib/epoker';
import { url } from '../lib/url';

export const GET: APIRoute = async ({ site }) => {
  const sider = [
    '/',
    '/nettverket/',
    '/signal/',
    '/materiell/',
    '/kilder/',
    '/om/',
    ...(await hentEpoker()).map((e) => `/epoker/${e.data.slug}/`),
  ];
  const adresser = sider
    .map((s) => `  <url><loc>${new URL(url(s), site).href}</loc></url>`)
    .join('\n');
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${adresser}
</urlset>
`;
  return new Response(xml, { headers: { 'Content-Type': 'application/xml' } });
};
