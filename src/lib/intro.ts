export const INTRO_STORAGE_KEY = 'valence-intro-seen';
export const INTRO_REPLAY_QUERY = 'replay-intro';

/** Dev-only preview route (see src/pages/dev/intro.astro). Not used in production builds. */
export const INTRO_DEV_PREVIEW_PATH = '/dev/intro';

export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function hasIntroBeenSeen(): boolean {
  try {
    return localStorage.getItem(INTRO_STORAGE_KEY) === '1';
  } catch {
    return false;
  }
}

export function markIntroSeen(): void {
  try {
    localStorage.setItem(INTRO_STORAGE_KEY, '1');
  } catch {
    // Storage blocked — intro may replay; site stays usable.
  }
}

/** True when `?replay-intro` is present — honoured in dev builds only. */
export function hasReplayIntroQuery(): boolean {
  if (typeof window === 'undefined') return false;
  if (!import.meta.env.DEV) return false;
  return new URLSearchParams(window.location.search).has(INTRO_REPLAY_QUERY);
}

/** True when the animated intro should run on this landing load. */
export function shouldPlayIntro(introName: string): boolean {
  const name = introName.trim();
  if (!name) return false;
  if (prefersReducedMotion()) return false;
  if (hasReplayIntroQuery()) return true;
  return !hasIntroBeenSeen();
}
