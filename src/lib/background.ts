import { getCollection } from 'astro:content';
import type { CollectionEntry } from 'astro:content';
import { resolveThemeId, type ThemePackId } from './theme-packs';
import { loadStageSchedule, validateStageSchedule, type StageSchedule } from './stage-schedule';

export type { ThemePackId };
export { resolveThemeId, resolveThemePack } from './theme-packs';
export type { StageSchedule } from './stage-schedule';

export interface MediaSource {
  src: string;
  type: string;
}

export interface BackgroundVideo {
  id: string;
  title?: string;
  label: string;
  themeId: ThemePackId;
  hasAudio: boolean;
  poster: string;
  sources: MediaSource[];
  lyricsEmpty: boolean;
}

export interface BackgroundConfig {
  /** Static fallback jukebox id (`default: true` entry). SSR and no-JS use this. */
  defaultVideoId: string;
  schedule: StageSchedule;
  videos: BackgroundVideo[];
}

function toVideo(entry: CollectionEntry<'jukebox'>): BackgroundVideo {
  const sources: MediaSource[] = entry.data.sources ?? [];

  return {
    id: entry.id,
    title: entry.data.label,
    label: entry.data.label,
    themeId: resolveThemeId(entry.data.themeId ?? 'default'),
    hasAudio: Boolean(entry.data.hasAudio) && sources.length > 0,
    poster: entry.data.poster,
    sources,
    lyricsEmpty: !entry.body?.trim(),
  };
}

async function buildBackgroundConfig(): Promise<BackgroundConfig> {
  const raw = await getCollection('jukebox');
  const videos = raw.map(toVideo);
  const flagged = raw.find((entry) => entry.data.default);
  const defaultVideoId = flagged?.id ?? videos[0]?.id ?? '';
  if (!flagged && videos.length > 0) {
    console.warn(`[stage] no default jukebox flag; using "${defaultVideoId}"`);
  }
  const schedule = loadStageSchedule();
  validateStageSchedule(schedule, new Set(videos.map((entry) => entry.id)));
  return { defaultVideoId, schedule, videos };
}

/**
 * Several components resolve the stage per page. Memoized so schedule validation
 * and the default-flag warning run once per build rather than once per caller.
 */
let configPromise: Promise<BackgroundConfig> | undefined;

export function getBackgroundConfig(): Promise<BackgroundConfig> {
  // Dev rebuilds every call so content edits show up on reload.
  if (import.meta.env.DEV) return buildBackgroundConfig();
  configPromise ??= buildBackgroundConfig();
  return configPromise;
}

/** Label, poster, and source shape are enforced by the collection schema at build time. */
export async function getValidJukeboxEntries(): Promise<BackgroundVideo[]> {
  return (await getBackgroundConfig()).videos;
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
