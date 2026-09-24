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
    ar: z.number().int().optional(), // fotoår (6.4)
    arkiv: z.string().optional(),
    lisens: z.string().min(1, 'Bildet mangler lisens'),
    kilde: z.url('Bildet mangler gyldig kilde-URL'),
  });

// Felles skjema for stasjoner: epokene på forsiden og fortellingen på /signal/.
const stasjon = (ctx: SchemaContext) =>
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
    // Før/etter-glider. Bildene kan mangle; da vises plassholdere.
    forEtter: z
      .object({
        sted: z.string().optional(),
        for: bilde(ctx).optional(),
        etter: bilde(ctx).optional(),
      })
      .nullable()
      .default(null),
  });

const epoker = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/epoker' }),
  schema: stasjon,
});

const signal = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/signal' }),
  schema: stasjon,
});

const materiellSkjema = (ctx: SchemaContext) =>
  z.object({
    rekkefolge: z.number().int().positive(),
    type: z.string(), // typebetegnelse, vises i Plex Mono
    iDrift: z.string(), // f.eks. «1966–2006»
    setning: z.string(),
    bilde: bilde(ctx).optional(),
  });

const materiell = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/materiell' }),
  schema: materiellSkjema,
});

// Fase 5: engelsk innhold i egne filer, samme skjema og samme slug som den norske motparten.
const epokerEn = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/en/epoker' }),
  schema: stasjon,
});

const signalEn = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/en/signal' }),
  schema: stasjon,
});

const materiellEn = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/en/materiell' }),
  schema: materiellSkjema,
});

export const collections = { epoker, materiell, signal, epokerEn, signalEn, materiellEn };
