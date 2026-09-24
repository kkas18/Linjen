import { defineCollection, type SchemaContext } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';

// Felles bildefelter (kapittel 7). Bygget feiler hvis alt, lisens eller kilde mangler.
const bilde = ({ image }: SchemaContext) =>
  z.object({
    fil: image(),
    alt: z.string().min(1, 'Bildet mangler alt-tekst'),
    bildetekst: z.string().optional(),
    fotograf: z.string().optional(),
    arkiv: z.string().optional(),
    lisens: z.string().min(1, 'Bildet mangler lisens'),
    kilde: z.url('Bildet mangler gyldig kilde-URL'),
  });

const epoker = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/epoker' }),
  schema: (ctx) =>
    z.object({
      slug: z.string(),
      rekkefolge: z.number().int().positive(),
      ar: z.number().int(),
      arSlutt: z.number().int().nullable().optional(),
      tittel: z.string(),
      etikett: z.string(),
      ingress: z.string(),
      tema: z.enum(['lys', 'tunnel']),
      hovedbilde: bilde(ctx).optional(),
      faktaruter: z
        .array(z.object({ etikett: z.string(), verdi: z.string() }))
        .max(4)
        .default([]),
      galleri: z.array(bilde(ctx)).default([]),
      forEtter: z
        .object({ for: bilde(ctx), etter: bilde(ctx) })
        .nullable()
        .default(null),
    }),
});

export const collections = { epoker };
