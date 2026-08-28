/**
 * Theme pack registry — single source for capabilities (video, audio, HUD glitch).
 * Color tokens live in `src/styles/themes.css`. Keep `PACK_CSS_THEME_IDS` in sync
 * with `[data-theme='…']` blocks in that file.
 */

export type ThemePackId =
  | 'default'
  | 'nightmare-crimson'
  | 'cyan-pulse'
  | 'electric-cyan'
  | 'steel-slate'
  | 'acid-lime';

export interface ThemePackCapabilities {
  loopingVideo: boolean;
  audioEligible: boolean;
  hudGlitch: boolean;
}

export interface ThemePack {
  id: ThemePackId;
  capabilities: ThemePackCapabilities;
}

/** Ids with a CSS token block in `themes.css` (`default` includes `:root`). */
export const PACK_CSS_THEME_IDS = [
  'default',
  'nightmare-crimson',
  'cyan-pulse',
  'electric-cyan',
  'steel-slate',
  'acid-lime',
] as const;

export const THEME_PACKS: Record<ThemePackId, ThemePack> = {
  default: {
    id: 'default',
    capabilities: { loopingVideo: false, audioEligible: false, hudGlitch: false },
  },
  'nightmare-crimson': {
    id: 'nightmare-crimson',
    capabilities: { loopingVideo: true, audioEligible: true, hudGlitch: true },
  },
  'cyan-pulse': {
    id: 'cyan-pulse',
    capabilities: { loopingVideo: false, audioEligible: false, hudGlitch: false },
  },
  'electric-cyan': {
    id: 'electric-cyan',
    capabilities: { loopingVideo: true, audioEligible: true, hudGlitch: false },
  },
  'steel-slate': {
    id: 'steel-slate',
    capabilities: { loopingVideo: true, audioEligible: true, hudGlitch: false },
  },
  'acid-lime': {
    id: 'acid-lime',
    capabilities: { loopingVideo: true, audioEligible: true, hudGlitch: false },
  },
};

const DEFAULT_PACK_ID: ThemePackId = 'default';

const warnedKeys = new Set<string>();

function warnOnce(key: string, message: string): void {
  if (warnedKeys.has(key)) return;
  warnedKeys.add(key);
  console.warn(message);
}

export function isRegistryThemeId(id: string): id is ThemePackId {
  return id in THEME_PACKS;
}

export function isPackComplete(id: string): boolean {
  return isRegistryThemeId(id) && (PACK_CSS_THEME_IDS as readonly string[]).includes(id);
}

export function getThemePack(id: ThemePackId): ThemePack {
  return THEME_PACKS[id];
}

/** Option A: unknown or incomplete id → warn + full default pack (FR-005 / FR-006). */
export function resolveThemePack(rawThemeId: string | undefined | null): ThemePack {
  const raw = rawThemeId?.trim() || DEFAULT_PACK_ID;

  if (!isRegistryThemeId(raw)) {
    warnOnce(`unknown:${raw}`, `[theme] unknown themeId "${raw}"; using default`);
    return getThemePack(DEFAULT_PACK_ID);
  }

  if (!isPackComplete(raw)) {
    warnOnce(
      `incomplete:${raw}`,
      `[theme] pack "${raw}" incomplete (missing CSS); using default`,
    );
    return getThemePack(DEFAULT_PACK_ID);
  }

  return getThemePack(raw);
}

export function resolveThemeId(rawThemeId: string | undefined | null): ThemePackId {
  return resolveThemePack(rawThemeId).id;
}

export function packSupportsLoopingVideo(pack: ThemePack, hasSources: boolean): boolean {
  return pack.capabilities.loopingVideo && hasSources;
}

export function packAllowsMute(
  pack: ThemePack,
  entryHasAudio: boolean,
  willPlayVideo: boolean,
): boolean {
  return pack.capabilities.audioEligible && entryHasAudio && willPlayVideo;
}

export function packAllowsHudGlitch(pack: ThemePack): boolean {
  return pack.capabilities.hudGlitch;
}

export function applyThemeAttributes(pack: ThemePack): {
  themeId: ThemePackId;
  hudGlitch: 'true' | 'false';
} {
  return {
    themeId: pack.id,
    hudGlitch: packAllowsHudGlitch(pack) ? 'true' : 'false',
  };
}
