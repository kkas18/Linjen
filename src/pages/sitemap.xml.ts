// sitemap.xml (kapittel 8) uten ekstra avhengigheter, med nb/en-alternativer (fase 5).
import type { APIRoute } from 'astro';
import { hentEpoker } from '../lib/epoker';
import { rute, SPRAK, type Side } from '../i18n';

export const GET: APIRoute = async ({ site }) => {
  const sider: { side: Side; slug?: string }[] = [
    { side: 'forside' },
    { side: 'nettverket' },
    { side: 'signal' },
    { side: 'materiell' },
    { side: 'kilder' },
    { side: 'om' },
    ...(await hentEpoker()).map((e) => ({ side: 'epoke' as const, slug: e.data.slug })),
  ];
  const abs = (href: string) => new URL(href, site).href;

  const adresser = sider.flatMap(({ side, slug }) => {
    const alternativer = SPRAK.map(
      (l) => `    <xhtml:link rel="alternate" hreflang="${l}" href="${abs(rute(l, side, slug))}"/>`,
    ).join('\n');
    return SPRAK.map(
      (lang) => `  <url>\n    <loc>${abs(rute(lang, side, slug))}</loc>\n${alternativer}\n  </url>`,
    );
  });

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${adresser.join('\n')}
</urlset>
`;
  return new Response(xml, { headers: { 'Content-Type': 'application/xml' } });
};
