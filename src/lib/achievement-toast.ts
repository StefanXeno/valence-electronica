/**
 * Shared game-style achievement toast (rub, infinite-spin, …).
 * Visual shell lives in TrackRubOverlay.astro — this module only drives show/hide + copy/glyph.
 */

export type AchievementGlyph = 'rub' | 'infinite';

const ACHIEVEMENT_HOLD_MS = 4200;
const ACHIEVEMENT_EXIT_MS = 400;

let achievementHideTimer: ReturnType<typeof setTimeout> | null = null;
let achievementRemoveTimer: ReturnType<typeof setTimeout> | null = null;

function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function clearAchievementTimers() {
  if (achievementHideTimer) {
    clearTimeout(achievementHideTimer);
    achievementHideTimer = null;
  }
  if (achievementRemoveTimer) {
    clearTimeout(achievementRemoveTimer);
    achievementRemoveTimer = null;
  }
}

export function hasAchievement(storageKey: string): boolean {
  try {
    return localStorage.getItem(storageKey) === '1';
  } catch {
    // Storage blocked — treat as unlocked so we never spam the toast.
    return true;
  }
}

export function markAchievement(storageKey: string): void {
  try {
    localStorage.setItem(storageKey, '1');
  } catch {
    // Site stays usable without persistence.
  }
}

/** Show the shared toast; no-op if the DOM shell is missing. */
export function showAchievementToast(options: {
  title: string;
  sub: string;
  glyph: AchievementGlyph;
}): void {
  const root = document.querySelector<HTMLElement>('[data-ve-achievement]');
  if (!root) return;

  clearAchievementTimers();

  const titleEl = root.querySelector<HTMLElement>('[data-ve-achievement-title]');
  const subEl = root.querySelector<HTMLElement>('[data-ve-achievement-sub]');
  const announce = root.querySelector<HTMLElement>('[data-ve-achievement-announce]');

  if (titleEl) titleEl.textContent = options.title;
  if (subEl) subEl.textContent = options.sub;

  root.querySelectorAll<HTMLElement>('[data-ve-achievement-glyph]').forEach((node) => {
    const match = node.dataset.veAchievementGlyph === options.glyph;
    node.hidden = !match;
  });

  root.hidden = false;
  root.classList.remove('is-out');
  // Retrigger entrance if the node was already in the tree.
  root.classList.remove('is-in');
  void root.offsetWidth;
  root.classList.add('is-in');

  // Populate after unhiding so polite live regions actually announce.
  if (announce) {
    announce.textContent = `Achievement unlocked: ${options.title}. ${options.sub}`;
  }

  const holdMs = prefersReducedMotion() ? 2800 : ACHIEVEMENT_HOLD_MS;
  const exitMs = prefersReducedMotion() ? 0 : ACHIEVEMENT_EXIT_MS;

  achievementHideTimer = setTimeout(() => {
    root.classList.remove('is-in');
    root.classList.add('is-out');
    achievementRemoveTimer = setTimeout(() => {
      root.classList.remove('is-out');
      root.hidden = true;
      if (announce) announce.textContent = '';
      achievementRemoveTimer = null;
    }, exitMs);
    achievementHideTimer = null;
  }, holdMs);
}

/** Persist then show — skips when already unlocked in localStorage. */
export function maybeUnlockAchievement(options: {
  storageKey: string;
  title: string;
  sub: string;
  glyph: AchievementGlyph;
}): void {
  if (hasAchievement(options.storageKey)) return;
  // Persist before animating so a second trigger during the hold never doubles up.
  markAchievement(options.storageKey);
  showAchievementToast(options);
}
