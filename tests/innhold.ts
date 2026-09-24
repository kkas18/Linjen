// Leser epokene fra innholdsfilene, så testene følger innholdet i stedet for å
// være låst til bestemte titler, slugs eller antall bilder.
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

export interface EpokeInfo {
  slug: string;
  rekkefolge: number;
  tema: string;
  harForEtter: boolean;
}

const MAPPE = join(process.cwd(), 'src/content/epoker');

function felt(frontmatter: string, navn: string): string {
  const verdi = frontmatter.match(new RegExp(`^${navn}:[ \\t]*(.*)$`, 'm'))?.[1] ?? '';
  return verdi.trim().replace(/^'(.*)'$/, '$1');
}

/** Alle epoker i rekkefølge langs linjen. */
export const EPOKER: EpokeInfo[] = readdirSync(MAPPE)
  .filter((f) => f.endsWith('.md'))
  .map((f) => {
    const fm = readFileSync(join(MAPPE, f), 'utf8').match(/^---\n([\s\S]*?)\n---/)?.[1] ?? '';
    return {
      slug: felt(fm, 'slug'),
      rekkefolge: Number(felt(fm, 'rekkefolge')),
      tema: felt(fm, 'tema'),
      // `forEtter: null` = ingen glider; en blokk under feltet = glider finnes
      harForEtter: felt(fm, 'forEtter') !== 'null',
    };
  })
  .sort((a, b) => a.rekkefolge - b.rekkefolge);

if (EPOKER.length === 0) throw new Error('Fant ingen epoker i src/content/epoker');

/** Et representativt utvalg: første, første tunnelepoke (om den finnes) og siste. */
export const UTVALG: string[] = [
  ...new Set([
    EPOKER[0].slug,
    (EPOKER.find((e) => e.tema === 'tunnel') ?? EPOKER[Math.floor(EPOKER.length / 2)]).slug,
    EPOKER[EPOKER.length - 1].slug,
  ]),
];

export const FORSTE = EPOKER[0].slug;

/** Første epoke med før/etter-glider, eller undefined hvis ingen har det. */
export const MED_FOR_ETTER = EPOKER.find((e) => e.harForEtter)?.slug;
