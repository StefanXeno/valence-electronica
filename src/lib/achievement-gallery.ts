/**
 * Achievement gallery (036) — trophy toggle + panel wiring (V-Flip-style dock, bottom-right).
 *
 * Markup: `AchievementGallery.astro`. Exclusivity: opening the gallery closes content overlays,
 * the phone menu, and rub panels (`stage-overlay-close`), and the stage player collapses on the
 * `html.achievement-gallery-open` class. The gallery closes when any of those open.
 */

import {
  ACHIEVEMENT_GALLERY_OPEN_EVENT,
  ACHIEVEMENT_UNLOCKED_EVENT,
} from './achievement-toast';
import {
  countFound,
  formatCounter,
  getAchievement,
  getAchievements,
  readAchievementState,
  resetProgress,
  tileViews,
  type AchievementId,
  type AchievementState,
} from './achievements';
import { closeTrackRubPanel } from './track-rub';
import { playElementGlitch, prefersGlitchMotion } from './glitch';

/** Must match `PLAYER_STATE_EVENT` / `STAGE_OVERLAY_CLOSE_EVENT` in stage-player.ts. */
const PLAYER_STATE_EVENT = 'player-state-change';
const STAGE_OVERLAY_CLOSE_EVENT = 'stage-overlay-close';
export const GALLERY_OPEN_CLASS = 'achievement-gallery-open';

/** Slow ambient flicker on locked tiles while the gallery is open (glitch packs only). */
const LOCKED_GLITCH_EVERY_MS = 3600;
const PULSE_MS = 900;

function isLegalOverlayOpen(): boolean {
  return Boolean(document.querySelector('#legal-overlay [data-legal-panel]:not([hidden])'));
}

function isNavMenuOpen(): boolean {
  return document.documentElement.classList.contains('site-nav-menu-open');
}

/** Bind once per page. */
export function initAchievementGallery(): void {
  const toggle = document.querySelector<HTMLButtonElement>('[data-achievement-toggle]');
  const gallery = document.querySelector<HTMLElement>('[data-achievement-gallery]');
  const panel = gallery?.querySelector<HTMLElement>('[data-achievement-panel]');
  if (!toggle || !gallery || !panel || gallery.dataset.galleryInit === '1') return;
  gallery.dataset.galleryInit = '1';

  const counter = gallery.querySelector<HTMLElement>('[data-achievement-counter]');
  const closeBtn = gallery.querySelector<HTMLButtonElement>('[data-achievement-gallery-close]');
  const resetBtn = gallery.querySelector<HTMLButtonElement>('[data-achievement-reset]');
  const unlockedTemplate = gallery.querySelector<HTMLTemplateElement>(
    'template[data-achievement-unlocked-template]',
  );
  const counterTemplate = gallery.dataset.counterTemplate || '{found} / {total} found';

  let returnFocus: HTMLElement | null = null;
  let lockedGlitchTimer: number | undefined;

  const isOpen = () => gallery.dataset.galleryState === 'open';

  /** Put decoded copy into a secret tile once it is unlocked (never before). */
  const fillSecretTile = (tile: HTMLElement) => {
    if (!unlockedTemplate || tile.querySelector('[data-variant="unlocked"]')) return;
    const achievement = getAchievement(tile.dataset.achievementTile as AchievementId);
    if (!achievement) return;
    const node = unlockedTemplate.content.firstElementChild?.cloneNode(true);
    if (!(node instanceof HTMLElement)) return;
    const glyph = gallery.querySelector<HTMLTemplateElement>(
      `template[data-achievement-glyph="${achievement.glyph}"]`,
    );
    const glyphSlot = node.querySelector('[data-slot="glyph"]');
    if (glyph && glyphSlot) glyphSlot.append(glyph.content.cloneNode(true));
    node.querySelector('[data-slot="title"]')!.textContent = achievement.title;
    node.querySelector('[data-slot="subtitle"]')!.textContent = achievement.subtitle;
    tile.prepend(node);
  };

  /** Secret copy leaves the DOM again (reset). */
  const clearSecretTile = (tile: HTMLElement) => {
    if (tile.querySelector('[data-variant="secret"]')) {
      tile.querySelector('[data-variant="unlocked"]')?.remove();
    }
  };

  const render = (state: AchievementState) => {
    const list = getAchievements();
    const views = tileViews(list, state);
    for (const view of views) {
      const id = view.kind === 'unlocked' ? view.achievement.id : view.id;
      const tile = gallery.querySelector<HTMLElement>(`[data-achievement-tile="${id}"]`);
      if (!tile) continue;
      tile.dataset.tileKind = view.kind;
      if (view.kind === 'unlocked') fillSecretTile(tile);
      else clearSecretTile(tile);
      tile.querySelectorAll<HTMLElement>('[data-variant]').forEach((variant) => {
        const name = variant.dataset.variant;
        variant.hidden =
          view.kind === 'unlocked' ? name !== 'unlocked' : name === 'unlocked';
      });
    }
    if (counter) counter.textContent = formatCounter(counterTemplate, countFound(list, state), list.length);
    toggle.hidden = !(state.available && countFound(list, state) > 0);
  };

  const stopLockedGlitch = () => {
    window.clearInterval(lockedGlitchTimer);
    lockedGlitchTimer = undefined;
  };

  const flickerLocked = () => {
    if (!prefersGlitchMotion()) return;
    gallery
      .querySelectorAll<HTMLElement>(
        '[data-tile-kind="locked"] .achievement-tile__glyph--locked, [data-tile-kind="secret"] .achievement-tile__glyph--locked',
      )
      .forEach((glyph) => playElementGlitch(glyph));
  };

  const open = () => {
    if (isOpen() || toggle.hidden) return;
    returnFocus = document.activeElement instanceof HTMLElement ? document.activeElement : toggle;
    // One surface at a time: content overlay, phone menu, and rub panels close first.
    document.dispatchEvent(new CustomEvent(STAGE_OVERLAY_CLOSE_EVENT));
    if (document.querySelector('[data-track-rub-panel]:not([hidden])')) closeTrackRubPanel();
    render(readAchievementState());
    gallery.dataset.galleryState = 'open';
    panel.inert = false;
    toggle.setAttribute('aria-expanded', 'true');
    // Glitch packs: the panel cuts in with the shared glitch instead of the slide.
    if (prefersGlitchMotion()) playElementGlitch(panel);
    document.documentElement.classList.add(GALLERY_OPEN_CLASS);
    closeBtn?.focus();
    flickerLocked();
    if (prefersGlitchMotion()) lockedGlitchTimer = window.setInterval(flickerLocked, LOCKED_GLITCH_EVERY_MS);
  };

  const close = (opts: { restoreFocus?: boolean } = {}) => {
    if (!isOpen()) return;
    stopLockedGlitch();
    gallery.dataset.galleryState = 'closed';
    panel.inert = true;
    toggle.setAttribute('aria-expanded', 'false');
    document.documentElement.classList.remove(GALLERY_OPEN_CLASS);
    if (opts.restoreFocus !== false) {
      const target = returnFocus?.isConnected && !returnFocus.closest('[hidden]') ? returnFocus : toggle;
      if (!toggle.hidden || target !== toggle) target.focus({ preventScroll: true });
    }
    returnFocus = null;
  };

  const pulse = () => {
    toggle.classList.remove('is-pulse');
    void toggle.offsetWidth;
    toggle.classList.add('is-pulse');
    window.setTimeout(() => toggle.classList.remove('is-pulse'), PULSE_MS);
    if (prefersGlitchMotion()) playElementGlitch(toggle);
  };

  toggle.addEventListener('click', (event) => {
    event.stopPropagation();
    if (isOpen()) close();
    else open();
  });
  closeBtn?.addEventListener('click', () => close());

  // Outside tap/click collapses without stealing focus (like V-Flip). The toast opens the
  // gallery itself, so taps on it are left alone.
  document.addEventListener('pointerdown', (event) => {
    if (!isOpen() || !(event.target instanceof Element)) return;
    if (gallery.contains(event.target) || event.target.closest('[data-ve-achievement]')) return;
    close({ restoreFocus: false });
  });

  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape' || !isOpen()) return;
    event.preventDefault();
    close();
  });

  document.addEventListener(ACHIEVEMENT_GALLERY_OPEN_EVENT, () => open());

  document.addEventListener(ACHIEVEMENT_UNLOCKED_EVENT, () => {
    render(readAchievementState());
    pulse();
  });

  // Close when another surface takes over.
  document.addEventListener(PLAYER_STATE_EVENT, (event) => {
    if ((event as CustomEvent<{ state?: string }>).detail?.state === 'full') close({ restoreFocus: false });
  });
  const closeForOverlay = () => {
    if (isOpen() && (isLegalOverlayOpen() || isNavMenuOpen())) close({ restoreFocus: false });
  };
  const legalOverlay = document.getElementById('legal-overlay');
  if (legalOverlay) {
    new MutationObserver(closeForOverlay).observe(legalOverlay, {
      subtree: true,
      attributes: true,
      attributeFilter: ['hidden'],
    });
  }
  new MutationObserver(closeForOverlay).observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class'],
  });

  resetBtn?.addEventListener('click', () => {
    resetProgress();
    close({ restoreFocus: false });
    render(readAchievementState());
  });

  render(readAchievementState());
}
