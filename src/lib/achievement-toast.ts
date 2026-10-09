/**
 * Shared game-style achievement toast (036).
 * Visual shell lives in AchievementToast.astro — this module drives show/hide, copy, and glyph.
 * Copy comes from the registry payload (`getAchievement`), never from the trigger modules.
 */

import {
  getAchievement,
  markUnlocked,
  shouldToast,
  type AchievementId,
} from './achievements';
import { prefersReducedMotion } from './viewport';

/** Fired on `document` after every first unlock; the gallery listens. */
export const ACHIEVEMENT_UNLOCKED_EVENT = 'achievement-unlocked';
/** Fired on `document` when the toast card is activated; the gallery opens. */
export const ACHIEVEMENT_GALLERY_OPEN_EVENT = 'achievement-gallery-open';

const ACHIEVEMENT_HOLD_MS = 4200;
const ACHIEVEMENT_EXIT_MS = 400;

let achievementHideTimer: ReturnType<typeof setTimeout> | null = null;
let achievementRemoveTimer: ReturnType<typeof setTimeout> | null = null;
/** Pointer over or focus inside the card — the hold timer waits. */
let held = false;

function toastRoot(): HTMLElement | null {
  return document.querySelector<HTMLElement>('[data-ve-achievement]');
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

function hideNow(root: HTMLElement) {
  clearAchievementTimers();
  root.classList.remove('is-in', 'is-out');
  root.hidden = true;
  held = false;
  const announce = root.querySelector<HTMLElement>('[data-ve-achievement-announce]');
  if (announce) announce.textContent = '';
}

function startHold(root: HTMLElement) {
  clearAchievementTimers();
  const holdMs = prefersReducedMotion() ? 2800 : ACHIEVEMENT_HOLD_MS;
  const exitMs = prefersReducedMotion() ? 0 : ACHIEVEMENT_EXIT_MS;

  achievementHideTimer = setTimeout(() => {
    achievementHideTimer = null;
    if (held) return;
    root.classList.remove('is-in');
    root.classList.add('is-out');
    achievementRemoveTimer = setTimeout(() => {
      achievementRemoveTimer = null;
      hideNow(root);
    }, exitMs);
  }, holdMs);
}

/** Wire hover/focus hold and activation once per page. */
function bindToast(root: HTMLElement) {
  if (root.dataset.veAchievementBound === '1') return;
  root.dataset.veAchievementBound = '1';
  const card = root.querySelector<HTMLElement>('[data-ve-achievement-open]');
  if (!card) return;

  const hold = () => {
    if (root.hidden) return;
    held = true;
    // Cancel a running exit so the card comes back while it is being read.
    clearAchievementTimers();
    root.classList.remove('is-out');
    root.classList.add('is-in');
  };
  const release = () => {
    if (root.hidden || !held) return;
    held = false;
    startHold(root);
  };

  card.addEventListener('pointerenter', hold);
  card.addEventListener('focusin', hold);
  card.addEventListener('pointerleave', release);
  card.addEventListener('focusout', release);
  card.addEventListener('click', (event) => {
    event.stopPropagation();
    hideNow(root);
    document.dispatchEvent(new CustomEvent(ACHIEVEMENT_GALLERY_OPEN_EVENT));
  });
}

function showAchievementToast(id: AchievementId): void {
  const root = toastRoot();
  const achievement = getAchievement(id);
  if (!root || !achievement) return;

  bindToast(root);
  clearAchievementTimers();
  held = false;

  const titleEl = root.querySelector<HTMLElement>('[data-ve-achievement-title]');
  const subEl = root.querySelector<HTMLElement>('[data-ve-achievement-sub]');
  const announce = root.querySelector<HTMLElement>('[data-ve-achievement-announce]');

  if (titleEl) titleEl.textContent = achievement.title;
  if (subEl) subEl.textContent = achievement.subtitle;

  root.querySelectorAll<HTMLElement>('[data-ve-achievement-glyph]').forEach((node) => {
    node.hidden = node.dataset.veAchievementGlyph !== achievement.glyph;
  });

  root.hidden = false;
  root.classList.remove('is-out');
  // Retrigger entrance if the node was already in the tree.
  root.classList.remove('is-in');
  void root.offsetWidth;
  root.classList.add('is-in');

  // Populate after unhiding so polite live regions actually announce.
  if (announce) {
    const label = root.dataset.achievementUnlockedLabel || 'Achievement unlocked';
    announce.textContent = `${label}: ${achievement.title}. ${achievement.subtitle}`;
  }

  startHold(root);
}

/** Persist, toast, and announce a first unlock; a no-op when already unlocked or storage is blocked. */
export function unlockAchievement(id: AchievementId): void {
  if (!shouldToast(id)) return;
  // Persist before animating so a second trigger during the hold never doubles up.
  if (!markUnlocked(id)) return;
  showAchievementToast(id);
  document.dispatchEvent(new CustomEvent(ACHIEVEMENT_UNLOCKED_EVENT, { detail: { id } }));
}
