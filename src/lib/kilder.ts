// Kilder og bildekreditering (6.4), samlet automatisk fra innholdsfilene.
import { z } from 'astro/zod';
import data from '../data/kilder.json';
import { ordbok, rute, type Lang } from '../i18n';
import { hentEpoker, hentMateriell, hentSignal } from './epoker';

const kilde = z.object({
  forfatter: z.string().optional(),
  tittel: z.string(),
  utgitt: z.union([z.number().int(), z.string()]).optional(),
  utgiver: z.string().optional(),
  lenke: z.url().optional(),
});

export type Kilde = z.infer<typeof kilde>;
export const litteratur: Kilde[] = z.array(kilde).parse(data);

export interface Kreditering {
  alt: string;
  fotograf?: string;
  ar?: number;
  arkiv?: string;
  lisens: string;
  kilde: string;
  brukt: { tekst: string; href: string };
}

type Bilde = {
  alt: string;
  fotograf?: string;
  ar?: number;
  arkiv?: string;
  lisens: string;
  kilde: string;
};

/** Alle bilder i innholdet med kreditering og hvor de er brukt, på valgt språk. */
export async function alleKrediteringer(lang: Lang = 'nb'): Promise<Kreditering[]> {
  const t = ordbok(lang).kilder;
  const liste: Kreditering[] = [];
  const legg = (b: Bilde | undefined, tekst: string, href: string) => {
    if (!b) return;
    const { alt, fotograf, ar, arkiv, lisens, kilde } = b;
    liste.push({ alt, fotograf, ar, arkiv, lisens, kilde, brukt: { tekst, href } });
  };

  for (const e of await hentEpoker(lang)) {
    const href = rute(lang, 'epoke', e.data.slug);
    legg(e.data.hovedbilde, e.data.tittel, href);
    e.data.galleri.forEach((b) => legg(b, `${e.data.tittel} (${t.galleri})`, href));
    legg(e.data.forEtter?.for, `${e.data.tittel} (${t.for})`, href);
    legg(e.data.forEtter?.etter, `${e.data.tittel} (${t.etter})`, href);
  }
  for (const s of await hentSignal(lang)) {
    legg(s.data.hovedbilde, `${t.signal}: ${s.data.tittel}`, rute(lang, 'signal'));
  }
  for (const m of await hentMateriell(lang)) {
    legg(m.data.bilde, `${t.materiell}: ${m.data.type}`, rute(lang, 'materiell'));
  }
  return liste;
}
