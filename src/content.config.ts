import { fileURLToPath } from 'node:url';
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import type { Loader, LoaderContext } from 'astro/loaders';
import { z } from 'astro/zod';

/**
 * Astro's glob loader skips empty folders (no store entry, no file watcher).
 * `getCollection()` then warns "does not exist or is empty" on every request.
 * Tour/releases/about are allowed to be empty, so keep an empty collection in
 * the store and watch the directory so the first Markdown file still hot-loads.
 */
function globAllowEmpty(options: { pattern: string; base: string }): Loader {
  const inner = glob(options);
  let watching = false;

  const ensureCollection = (context: LoaderContext) => {
    if (context.store.keys().length > 0) return;
    context.store.set({ id: '__empty__', data: {} });
    context.store.delete('__empty__');
  };

  return {
    name: 'glob-allow-empty',
    load: async (context) => {
      const run = async () => {
        await inner.load(context);
        ensureCollection(context);
      };

      await run();

      if (!context.watcher || watching) return;
      watching = true;

      const dir = fileURLToPath(
        new URL(options.base.replace(/\/?$/, '/'), context.config.root),
      );
      context.watcher.add(dir);

      const isInCollection = (changedPath: string) => {
        const file = changedPath.replaceAll('\\', '/');
        const root = dir.replaceAll('\\', '/').replace(/\/?$/, '/');
        return file.startsWith(root) && file.endsWith('.md');
      };

      const onFs = async (changedPath: string) => {
        if (!isInCollection(changedPath)) return;
        // Inner glob already watches once it has seen at least one file.
        if (context.store.keys().length > 0) return;
        await run();
      };

      context.watcher.on('add', onFs);
      context.watcher.on('change', onFs);
      context.watcher.on('unlink', onFs);
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
  }),
});

export const collections = { legal, jukebox, about, releases, shows, ui };
