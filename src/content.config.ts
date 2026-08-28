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

/** Trimmed so a whitespace-only value is a build error, not an invisible blank. */
const filledText = z.string().trim().min(1);

/** Media lives in public/ and is referenced from the site root. */
const publicPath = filledText.refine((value) => value.startsWith('/'), {
  message: 'must start with "/" and point into public/, e.g. /images/posters/clip.jpg',
});

const mediaSource = z.object({
  src: publicPath,
  type: filledText,
});

const listenPlatform = z.enum(['bandcamp', 'spotify', 'youtube', 'soundcloud', 'tidal']);

const listenLink = z.object({
  platform: listenPlatform,
  url: z.url(),
});

const credit = z.object({
  role: filledText,
  name: filledText,
});

const jukebox = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/jukebox' }),
  schema: z.object({
    label: filledText,
    sortDate: z.coerce.date().optional(),
    blurb: z.string().optional(),
    kind: z.string().optional(),
    inDiscography: z.boolean().optional(),
    listenLinks: z.array(listenLink).optional(),
    credits: z.array(credit).optional(),
    mentions: z.string().optional(),
    themeId: filledText.optional(),
    hasAudio: z.boolean().optional(),
    poster: publicPath,
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
    title: filledText,
    year: z.number().int().min(1900).max(2100),
    kind: filledText.optional(),
    url: z.url().optional(),
    jukeboxId: filledText.optional(),
  }),
});

const shows = defineCollection({
  loader: globAllowEmpty({ pattern: '**/*.md', base: './src/content/shows' }),
  schema: z.object({
    date: z.coerce.date(),
    city: filledText,
    venue: filledText,
    ticketUrl: z.url().optional(),
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
    jukeboxPanelTitle: z.string().optional(),
    jukeboxPanelTooltip: z.string().optional(),
    socialsLabel: z.string().optional(),
    comingSoon: z.string().optional(),
    ticketLabel: z.string().optional(),
    introLead: z.string().optional(),
    introName: z.string().optional(),
    jukeboxIcon: z.string().optional(),
    aboutIcon: z.string().optional(),
    lyricsIcon: z.string().optional(),
    discographyIcon: z.string().optional(),
    tourIcon: z.string().optional(),
    trackInfoTitle: z.string().optional(),
    trackInfoIcon: z.string().optional(),
    releasedLabel: z.string().optional(),
    listenOnLabel: z.string().optional(),
    emptyTrackLinks: z.string().optional(),
    shuffleLabel: z.string().optional(),
    loopLabel: z.string().optional(),
    shuffleIcon: z.string().optional(),
    loopIcon: z.string().optional(),
    shuffleDefault: z.boolean().optional(),
    loopDefault: z.boolean().optional(),
    unmuteTooltip: z.string().optional(),
    muteTooltip: z.string().optional(),
    volumeSliderTooltip: z.string().optional(),
  }),
});

export const collections = { legal, jukebox, about, releases, shows, ui };
