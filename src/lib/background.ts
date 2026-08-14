import { getCollection } from 'astro:content';
import type { CollectionEntry } from 'astro:content';

export interface MediaSource {
  src: string;
  type: string;
}

export interface BackgroundVideo {
  id: string;
  title?: string;
  label: string;
  themeId: string;
  hasAudio: boolean;
  poster: string;
  sources: MediaSource[];
  lyricsEmpty: boolean;
}

export interface BackgroundConfig {
  defaultVideoId: string;
  videos: BackgroundVideo[];
}

/** Theme packs defined in `src/styles/themes.css`. Unknown ids fall back to `default`. */
export const KNOWN_THEME_IDS = ['default', 'nightmare-crimson', 'cyan-pulse'] as const;

export type KnownThemeId = (typeof KNOWN_THEME_IDS)[number];

function isUsableEntry(entry: CollectionEntry<'jukebox'>): boolean {
  const { label, poster } = entry.data;
  return Boolean(label?.trim() && poster?.trim());
}

function toVideo(entry: CollectionEntry<'jukebox'>): BackgroundVideo {
  const sources = (entry.data.sources ?? [])
    .filter((source): source is MediaSource => Boolean(source.src?.trim() && source.type?.trim()))
    .map((source) => ({ src: source.src as string, type: source.type as string }));

  return {
    id: entry.id,
    title: entry.data.label,
    label: entry.data.label ?? entry.id,
    themeId: resolveThemeId(entry.data.themeId ?? 'default'),
    hasAudio: Boolean(entry.data.hasAudio) && sources.length > 0,
    poster: entry.data.poster as string,
    sources,
    lyricsEmpty: !entry.body?.trim(),
  };
}

export async function getValidJukeboxEntries(): Promise<BackgroundVideo[]> {
  const raw = await getCollection('jukebox');
  const valid = raw.filter(isUsableEntry).map(toVideo);
  if (raw.length !== valid.length) {
    const dropped = raw.filter((entry) => !isUsableEntry(entry)).map((entry) => entry.id);
    console.warn(`[stage] omitted unusable jukebox entries: ${dropped.join(', ')}`);
  }
  return valid;
}

export async function getBackgroundConfig(): Promise<BackgroundConfig> {
  const videos = await getValidJukeboxEntries();
  const raw = await getCollection('jukebox');
  const flagged = raw.find((entry) => entry.data.default && isUsableEntry(entry));
  const defaultVideoId = flagged?.id ?? videos[0]?.id ?? '';
  if (!flagged && videos.length > 0) {
    console.warn(`[stage] no default jukebox flag; using "${defaultVideoId}"`);
  }
  return { defaultVideoId, videos };
}

/** Resolve the configured default video; throws if none are usable. */
export async function getDefaultVideo(): Promise<BackgroundVideo> {
  const config = await getBackgroundConfig();
  const video = config.videos.find((entry) => entry.id === config.defaultVideoId);
  if (!video) {
    throw new Error('jukebox collection: no usable default entry');
  }
  return video;
}

export function resolveThemeId(themeId: string): KnownThemeId {
  return (KNOWN_THEME_IDS as readonly string[]).includes(themeId)
    ? (themeId as KnownThemeId)
    : 'default';
}
