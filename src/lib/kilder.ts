// Kilder og bildekreditering (6.4), samlet automatisk fra innholdsfilene.
import { z } from 'astro/zod';
import { getCollection } from 'astro:content';
import data from '../data/kilder.json';
import { url } from './url';

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

/** Alle bilder i innholdet med kreditering og hvor de er brukt. */
export async function alleKrediteringer(): Promise<Kreditering[]> {
  const liste: Kreditering[] = [];
  const legg = (b: Bilde | undefined, tekst: string, href: string) => {
    if (!b) return;
    const { alt, fotograf, ar, arkiv, lisens, kilde } = b;
    liste.push({ alt, fotograf, ar, arkiv, lisens, kilde, brukt: { tekst, href } });
  };

  for (const e of await getCollection('epoker')) {
    const href = url(`/epoker/${e.data.slug}/`);
    legg(e.data.hovedbilde, e.data.tittel, href);
    e.data.galleri.forEach((b) => legg(b, `${e.data.tittel} (galleri)`, href));
    legg(e.data.forEtter?.for, `${e.data.tittel} (før)`, href);
    legg(e.data.forEtter?.etter, `${e.data.tittel} (etter)`, href);
  }
  for (const s of await getCollection('signal')) {
    legg(s.data.hovedbilde, `Signal: ${s.data.tittel}`, url('/signal/'));
  }
  for (const m of await getCollection('materiell')) {
    legg(m.data.bilde, `Materiell: ${m.data.type}`, url('/materiell/'));
  }
  return liste;
}
