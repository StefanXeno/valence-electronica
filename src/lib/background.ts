import background from '../data/background.json';

export interface MediaSource {
  src: string;
  type: string;
}

export interface BackgroundVideo {
  id: string;
  title?: string;
  themeId: string;
  hasAudio: boolean;
  poster: string;
  sources: MediaSource[];
}

export interface BackgroundConfig {
  defaultVideoId: string;
  videos: BackgroundVideo[];
}

/** Theme packs defined in `src/styles/themes.css`. Unknown ids fall back to `default`. */
export const KNOWN_THEME_IDS = ['default', 'nightmare-crimson', 'cyan-pulse'] as const;

export type KnownThemeId = (typeof KNOWN_THEME_IDS)[number];

export function getBackgroundConfig(): BackgroundConfig {
  return background as BackgroundConfig;
}

/** Resolve the configured default video; throws if `defaultVideoId` is invalid. */
export function getDefaultVideo(): BackgroundVideo {
  const config = getBackgroundConfig();
  const video = config.videos.find((entry) => entry.id === config.defaultVideoId);
  if (!video) {
    throw new Error(
      `background.json: defaultVideoId "${config.defaultVideoId}" not found in videos[]`,
    );
  }
  return video;
}

export function resolveThemeId(themeId: string): KnownThemeId {
  return (KNOWN_THEME_IDS as readonly string[]).includes(themeId)
    ? (themeId as KnownThemeId)
    : 'default';
}
