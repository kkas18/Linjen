// Språkstøtte (fase 5): ordbøker, rutekart nb ↔ en og hjelpere.
import { nb, type Ordbok } from './nb';
import { en } from './en';
import { url } from '../lib/url';

export const SPRAK = ['nb', 'en'] as const;
export type Lang = (typeof SPRAK)[number];

const ordboker: Record<Lang, Ordbok> = { nb, en };

/** Ordboken for et språk. Bruk: const t = ordbok(lang); t.nav.epoker */
export function ordbok(lang: Lang): Ordbok {
  return ordboker[lang];
}

/** Språket for gjeldende side (Astro.currentLocale), med norsk som standard. */
export function sprak(currentLocale: string | undefined): Lang {
  return currentLocale === 'en' ? 'en' : 'nb';
}

export type Side = 'forside' | 'epoke' | 'nettverket' | 'signal' | 'materiell' | 'kilder' | 'om';

// Stier uten base. Engelske sider har engelske navn under /en/.
const STIER: Record<Side, Record<Lang, string>> = {
  forside: { nb: '/', en: '/en/' },
  epoke: { nb: '/epoker/:slug/', en: '/en/eras/:slug/' },
  nettverket: { nb: '/nettverket/', en: '/en/network/' },
  signal: { nb: '/signal/', en: '/en/signalling/' },
  materiell: { nb: '/materiell/', en: '/en/rolling-stock/' },
  kilder: { nb: '/kilder/', en: '/en/sources/' },
  om: { nb: '/om/', en: '/en/about/' },
};

/** Sti uten base for en side på et språk (til sitemap og sammenligning). */
export function sti(lang: Lang, side: Side, slug = ''): string {
  return STIER[side][lang].replace(':slug', slug);
}

/** Lenke (med base) til en side på et språk. */
export function rute(lang: Lang, side: Side, slug = ''): string {
  return url(sti(lang, side, slug));
}

/** Finner siden en sti (uten base) tilhører, så språkvelgeren kan lenke til samme side. */
export function finnSide(stiUtenBase: string): { side: Side; slug: string } | null {
  for (const side of Object.keys(STIER) as Side[]) {
    for (const lang of SPRAK) {
      const monster = STIER[side][lang];
      const regex = new RegExp(`^${monster.replace(':slug', '([^/]+)')}$`);
      const treff = stiUtenBase.match(regex);
      if (treff) return { side, slug: treff[1] ?? '' };
    }
  }
  return null;
}

/** Fjerner base fra en sti, f.eks. /Linjen/en/network/ → /en/network/. */
export function utenBase(pathname: string): string {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  return base && pathname.startsWith(base) ? pathname.slice(base.length) || '/' : pathname;
}

/** Den tilsvarende siden på det andre språket (for språkvelger og hreflang). */
export function alternativ(pathname: string, til: Lang): string {
  const funnet = finnSide(utenBase(pathname));
  return funnet ? rute(til, funnet.side, funnet.slug) : rute(til, 'forside');
}
