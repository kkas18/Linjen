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
      // `ar` brukes til sortering og opptelling. null = «i dag» (ingen opptelling).
      ar: z.number().int().nullable(),
      arSlutt: z.number().int().nullable().optional(),
      // Visningsform når året ikke er ett enkelt tall, f.eks. «1945–1960-tallet» eller «I dag →».
      arVisning: z.string().optional(),
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

const materiell = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/materiell' }),
  schema: (ctx) =>
    z.object({
      rekkefolge: z.number().int().positive(),
      type: z.string(), // typebetegnelse, vises i Plex Mono
      iDrift: z.string(), // f.eks. «1966–2006»
      setning: z.string(),
      bilde: bilde(ctx).optional(),
    }),
});

export const collections = { epoker, materiell };
