// Nettverksdata (6.1), validert ved bygg så feil i data stopper bygget.
import { z } from 'astro/zod';
import data from '../data/nettverk.json';

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

export const TYPENAVN: Record<(typeof TYPER)[number], string> = {
  hest: 'Hestesporvei',
  trikk: 'Trikk',
  forstadsbane: 'Forstadsbane',
  tbane: 'T-bane',
};
