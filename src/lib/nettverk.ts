// Nettverksdata (6.1), validert ved bygg så feil i data stopper bygget.
import { z } from 'astro/zod';
import data from '../data/nettverk.json';
import navnEn from '../data/nettverk.en.json';
import type { Lang } from '../i18n';

export const TYPER = ['hest', 'trikk', 'forstadsbane', 'tbane'] as const;

const segment = z
  .object({
    id: z.string().min(1),
    type: z.enum(TYPER),
    apnet: z.number().int().min(1875),
    nedlagt: z.number().int().nullable(),
    // Kun absolutte/relative M, L, H, V, Z-kommandoer: skjematisk kart med rette linjer.
    path: z.string().regex(/^[MLHVZmlhvz0-9.,\s-]+$/, 'Ugyldig path'),
    navn: z.string().min(1),
  })
  .refine((s) => s.nedlagt === null || s.nedlagt > s.apnet, {
    message: 'nedlagt må være etter apnet',
  });

export type Segment = z.infer<typeof segment>;

export const segmenter: Segment[] = z.array(segment).parse(data);

// Engelske segmentnavn ligger i egen fil (nettverk.en.json), nøklet på id.
const engelsk = z.record(z.string(), z.string()).parse(navnEn);
const manglerEngelsk = segmenter.filter((s) => !engelsk[s.id]).map((s) => s.id);
if (manglerEngelsk.length) {
  throw new Error(`nettverk.en.json mangler navn for: ${manglerEngelsk.join(', ')}`);
}

/** Segmentnavn på valgt språk. */
export function segmentnavn(s: Segment, lang: Lang): string {
  return lang === 'en' ? engelsk[s.id] : s.navn;
}
