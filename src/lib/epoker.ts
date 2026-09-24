import { getCollection, type CollectionEntry } from 'astro:content';
import type { Lang } from '../i18n';

export type Epoke = CollectionEntry<'epoker'> | CollectionEntry<'epokerEn'>;

/** Alt som kan vises som en stasjon (epoker og signalhistorien har samme skjema). */
export type Stasjon = Epoke | CollectionEntry<'signal'> | CollectionEntry<'signalEn'>;

const etterRekkefolge = <T extends { data: { rekkefolge: number } }>(liste: T[]) =>
  liste.sort((a, b) => a.data.rekkefolge - b.data.rekkefolge);

/**
 * Sjekker at hvert språk har de samme stasjonene (samme slug), så språkvelgeren alltid
 * finner motparten. Bygget stopper hvis en oversettelse mangler.
 */
function sjekkSamsvar(navn: string, nb: { data: { slug: string } }[], en: typeof nb): void {
  const a = new Set(nb.map((e) => e.data.slug));
  const b = new Set(en.map((e) => e.data.slug));
  const mangler = [...a].filter((s) => !b.has(s)).map((s) => `en/${navn}/${s}`);
  const ekstra = [...b].filter((s) => !a.has(s)).map((s) => `${navn}/${s}`);
  if (mangler.length || ekstra.length) {
    throw new Error(
      `Innholdet på nb og en samsvarer ikke. Mangler: ${[...mangler, ...ekstra].join(', ')}`,
    );
  }
}

/** Alle epoker i rekkefølge langs linjen, på valgt språk. */
export async function hentEpoker(lang: Lang = 'nb'): Promise<Epoke[]> {
  const nb = etterRekkefolge(await getCollection('epoker'));
  const en = etterRekkefolge(await getCollection('epokerEn'));
  sjekkSamsvar('epoker', nb, en);
  return lang === 'en' ? en : nb;
}

/** Signalhistorien (/signal/), på valgt språk. */
export async function hentSignal(lang: Lang = 'nb') {
  const nb = etterRekkefolge(await getCollection('signal'));
  const en = etterRekkefolge(await getCollection('signalEn'));
  sjekkSamsvar('signal', nb, en);
  return lang === 'en' ? en : nb;
}

/** Materiell i kronologisk rekkefølge, på valgt språk. */
export async function hentMateriell(lang: Lang = 'nb') {
  return etterRekkefolge(await getCollection(lang === 'en' ? 'materiellEn' : 'materiell'));
}

/** Året slik det vises i stasjonsskilt og etiketter. */
export function arTekst(data: Stasjon['data']): string {
  return data.arVisning ?? String(data.ar ?? '');
}

/** Delen av visningsåret som står etter selve tallet, f.eks. «–1960-tallet». */
export function arHale(data: Stasjon['data']): string {
  if (data.ar === null || !data.arVisning) return '';
  const tall = String(data.ar);
  return data.arVisning.startsWith(tall) ? data.arVisning.slice(tall.length) : '';
}

const MER = '<!-- mer -->';

/** Teksten før `<!-- mer -->` vises på forsiden; hele teksten på epokesiden. */
export function utdrag(html: string): string {
  const i = html.indexOf(MER);
  return i === -1 ? html : html.slice(0, i);
}
