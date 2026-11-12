// The written side of the site: lessons, glossary terms and short facts.
// Plain files under src/content, checked here so a typo fails the build instead of reaching a reader.
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const source = z.object({ label: z.string(), url: z.url() });

/** A place to send the 3D camera. Mirrors View in src/lib/v2/atlas/types.ts. */
const view = z.object({
  target: z.string(),
  place: z.object({ latDeg: z.number(), lonDeg: z.number(), altKm: z.number() }).optional(),
  distanceKm: z.number().optional(),
  facing: z.string().optional(),
  timeIso: z.string().optional(),
  highlight: z.array(z.string()).optional(),
});

export const STRANDS = [
  'finding-your-way', 'gravity-and-orbits', 'light', 'the-sun', 'planets', 'moons', 'small-bodies',
  'stars', 'stellar-remnants', 'other-worlds', 'the-galaxy', 'galaxies', 'the-universe', 'life', 'exploring-space',
] as const;

export const LEVELS = ['first-look', 'how-it-works', 'the-physics', 'the-frontier'] as const;

// One folder per lesson: lesson.yaml holds what every level shares.
const lessons = defineCollection({
  loader: glob({ pattern: '*/lesson.yaml', base: './src/content/lessons', generateId: ({ entry }) => entry.split('/')[0] }),
  schema: z.object({
    title: z.string(),
    strand: z.enum(STRANDS),
    /** Reading order inside the strand. */
    order: z.number(),
    /** One sentence for lists and search results. */
    summary: z.string().max(180),
    /** What "Show me" does once the 3D view is wired in. */
    view: view.optional(),
    /** What the 3D view will show, in words, until it can. */
    scene: z.string().optional(),
    /** Glossary ids used in the text. */
    terms: z.array(z.string()).min(3).max(8),
    /** Lesson ids worth reading first, and next. */
    needs: z.array(z.string()).default([]),
    next: z.array(z.string()).default([]),
  }),
});

// ...and one Markdown file per level, named after the level.
const lessonLevels = defineCollection({
  loader: glob({ pattern: '*/{first-look,how-it-works,the-physics,the-frontier}.md', base: './src/content/lessons', generateId: ({ entry }) => entry.replace(/\.md$/, '') }),
  schema: z.object({
    sources: z.array(source).min(1),
    /** For levels that go out of date. */
    lastChecked: z.coerce.date().optional(),
  }),
});

// Glossary and facts are short, so each file holds a list on one subject.
const glossary = defineCollection({
  loader: glob({ pattern: '*.yaml', base: './src/content/glossary' }),
  schema: z.object({
    terms: z.array(z.object({
      id: z.string().regex(/^[a-z0-9-]+$/),
      term: z.string(),
      /** Other spellings and short forms, for search. */
      also: z.array(z.string()).default([]),
      /** One plain sentence. */
      short: z.string(),
      /** One fuller sentence for the reader who wants it. */
      more: z.string().optional(),
      /** Related glossary ids. */
      see: z.array(z.string()).default([]),
      lesson: z.string().optional(),
      view: view.optional(),
    })),
  }),
});

const facts = defineCollection({
  loader: glob({ pattern: '*.yaml', base: './src/content/facts' }),
  schema: z.object({
    facts: z.array(z.object({
      id: z.string().regex(/^[a-z0-9-]+$/),
      text: z.string().max(320),
      /** Body ids, scale places or lesson ids this belongs with. */
      about: z.array(z.string()).min(1),
      /** measured: someone observed it. worked-out: follows from measurements by arithmetic. theory: a model's answer. */
      basis: z.enum(['measured', 'worked-out', 'theory']).default('measured'),
      source,
      view: view.optional(),
    })),
  }),
});

// The legal pages: one Markdown file each, so the wording can be read and changed like any other text.
const legal = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/legal' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    /** One or two sentences under the title. */
    lead: z.string(),
    /** The date the current wording took effect. */
    updated: z.coerce.date(),
  }),
});

export const collections = { lessons, lessonLevels, glossary, facts, legal };
