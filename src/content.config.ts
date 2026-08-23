import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import type { Loader } from 'astro/loaders';
import { z } from 'astro/zod';

/**
 * Astro's glob loader skips empty folders, so `getCollection()` warns
 * "does not exist or is empty". Seed an empty Map in the store instead.
 * Do not import `node:*` here — `astro check` has no Node types.
 */
function globAllowEmpty(options: { pattern: string; base: string }): Loader {
  const inner = glob(options);
  return {
    name: 'glob-allow-empty',
    load: async (context) => {
      await inner.load(context);
      if (context.store.keys().length > 0) return;
      context.store.set({ id: '__empty__', data: {} });
      context.store.delete('__empty__');
    },
  };
}

const legal = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/legal' }),
  schema: z.object({
    title: z.string().min(1),
  }),
});

const mediaSource = z.object({
  src: z.string().optional(),
  type: z.string().optional(),
});

const jukebox = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/jukebox' }),
  schema: z.object({
    label: z.string().optional(),
    themeId: z.string().optional(),
    hasAudio: z.boolean().optional(),
    poster: z.string().optional(),
    default: z.boolean().optional(),
    sources: z.array(mediaSource).optional(),
  }),
});

const about = defineCollection({
  loader: globAllowEmpty({ pattern: '**/*.md', base: './src/content/about' }),
  schema: z.object({}),
});

const releases = defineCollection({
  loader: globAllowEmpty({ pattern: '**/*.md', base: './src/content/releases' }),
  schema: z.object({
    title: z.string().optional(),
    year: z.number().optional(),
    kind: z.string().optional(),
    url: z.string().optional(),
    jukeboxId: z.string().optional(),
  }),
});

const shows = defineCollection({
  loader: globAllowEmpty({ pattern: '**/*.md', base: './src/content/shows' }),
  schema: z.object({
    date: z.coerce.date().optional(),
    city: z.string().optional(),
    venue: z.string().optional(),
    ticketUrl: z.string().optional(),
  }),
});

const ui = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/ui' }),
  schema: z.object({
    aboutTitle: z.string().optional(),
    lyricsTitle: z.string().optional(),
    discographyTitle: z.string().optional(),
    tourTitle: z.string().optional(),
    stageButtonLabel: z.string().optional(),
    emptyLyrics: z.string().optional(),
    emptyReleases: z.string().optional(),
    emptyShows: z.string().optional(),
    jukeboxLabel: z.string().optional(),
    socialsLabel: z.string().optional(),
    comingSoon: z.string().optional(),
    ticketLabel: z.string().optional(),
    introLead: z.string().optional(),
    introName: z.string().optional(),
  }),
});

export const collections = { legal, jukebox, about, releases, shows, ui };
