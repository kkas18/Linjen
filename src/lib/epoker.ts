import { getCollection, type CollectionEntry } from 'astro:content';

export type Epoke = CollectionEntry<'epoker'>;

/** Alle epoker i rekkefølge langs linjen. */
export async function hentEpoker(): Promise<Epoke[]> {
  return (await getCollection('epoker')).sort((a, b) => a.data.rekkefolge - b.data.rekkefolge);
}

/** Året slik det vises i stasjonsskilt og etiketter. */
export function arTekst(data: Epoke['data']): string {
  return data.arVisning ?? String(data.ar ?? '');
}

/** Delen av visningsåret som står etter selve tallet, f.eks. «–1960-tallet». */
export function arHale(data: Epoke['data']): string {
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
