/**
 * Hidden stage player (035) — DOM wiring.
 *
 * Boots the stage engine (`stage-switch.ts`), the background play/pause toggle, and
 * the player state machine (`player-state.ts`). Visibility is CSS-driven from
 * `data-player-state` on `[data-stage-player]`.
 */

import { maybeUnlockAchievement } from './achievement-toast';
import { initEqFlatten } from './eq-flatten';
import { matchesGestureIgnore, STAGE_GESTURE_IGNORE_SELECTOR } from './gesture-ignore';
import { createContinuousGlitch, isGlitchThemeActive } from './glitch';
import { isIntroActive, setPlayerPaused } from './playback';
import { isPlayerDiscovered, markPlayerDiscovered } from './player-discovery';
import {
  initialPlayerState,
  nextPlayerState,
  type PlayerEvent,
  type PlayerState,
} from './player-state';
import { initStageSwitch, type StageCatalogEntry } from './stage-switch';
import type { StageSchedule } from './stage-schedule';
import { createTapHint } from './tap-hint';
import { prefersReducedMotion } from './viewport';

export const PLAYER_STATE_EVENT = 'player-state-change';
/** Ask the content overlay / phone menu to close after a discography play (035). */
export const STAGE_OVERLAY_CLOSE_EVENT = 'stage-overlay-close';
export const ACHIEVEMENT_PLAYER_FOUND_STORAGE_KEY = 've-achievement-player-found';

/** How long the peeking vinyl waits for a tap before sliding away. */
const HINT_MS = 4000;

function playerRoot(): HTMLElement | null {
  return document.querySelector<HTMLElement>('[data-stage-player]');
}

type CatalogRow = { id: string; label: string };

/** Now-playing title follows the active stage entry label (never the theme id). */
export function syncNowPlayingLabel(activeId: string): void {
  const root = playerRoot();
  const el = root?.querySelector<HTMLElement>('[data-now-playing]');
  if (!root?.dataset.stageCatalog || !el) return;

  let catalog: CatalogRow[] = [];
  try {
    catalog = JSON.parse(root.dataset.stageCatalog) as CatalogRow[];
  } catch {
    return;
  }

  el.textContent = catalog.find((row) => row.id === activeId)?.label?.trim() ?? '';
}

function bootStageSwitch(root: HTMLElement): void {
  if (!root.dataset.stageCatalog) return;

  let catalog: StageCatalogEntry[];
  let schedule: StageSchedule = { timezone: 'Europe/Berlin', rules: [] };

  try {
    catalog = JSON.parse(root.dataset.stageCatalog) as StageCatalogEntry[];
  } catch (error) {
    console.error('[stage-player] invalid data-stage-catalog JSON', error);
    return;
  }

  if (root.dataset.stageSchedule) {
    try {
      schedule = JSON.parse(root.dataset.stageSchedule) as StageSchedule;
    } catch (error) {
      console.error('[stage-player] invalid data-stage-schedule JSON', error);
    }
  }

  initStageSwitch(catalog, root.dataset.stageFallback ?? '', schedule, {
    shuffleDefault: root.dataset.shuffleDefault !== 'false',
    loopDefault: root.dataset.loopDefault === 'true',
  });
}

/**
 * Play/pause the stage `<video>` (that *is* the music).
 * Writes `html[data-player-paused]` so the EQ + shuffle clock freeze together.
 */
function initBgVideoToggle(root: HTMLElement): void {
  const btn = root.querySelector<HTMLButtonElement>('[data-bg-play-toggle]');
  if (!btn) return;

  const playLabel = btn.dataset.playLabel ?? 'Play';
  const pauseLabel = btn.dataset.pauseLabel ?? 'Pause';
  const playIcon = btn.querySelector<HTMLElement>('[data-bg-play-icon="play"]');
  const pauseIcon = btn.querySelector<HTMLElement>('[data-bg-play-icon="pause"]');
  const atmosphere = document.querySelector<HTMLElement>('[data-atmosphere]');
  const getVideo = () => document.querySelector<HTMLVideoElement>('[data-bg-video]');

  let boundVideo: HTMLVideoElement | null = null;

  const sync = () => {
    const video = getVideo();
    const fallback = atmosphere?.getAttribute('data-bg-state') === 'fallback';
    const playing = Boolean(video && !fallback && !video.paused && !video.ended);
    btn.disabled = !video || fallback;
    const label = playing ? pauseLabel : playLabel;
    btn.setAttribute('aria-label', label);
    btn.dataset.hudLabel = label;
    if (playIcon) playIcon.hidden = playing;
    if (pauseIcon) pauseIcon.hidden = !playing;
    // Fallback / missing video is not a user pause — leave shuffle + EQ alone.
    setPlayerPaused(Boolean(video && !fallback && !playing));
  };

  const bindVideoEvents = () => {
    const video = getVideo();
    if (boundVideo === video) return;
    boundVideo?.removeEventListener('play', sync);
    boundVideo?.removeEventListener('pause', sync);
    boundVideo = video;
    video?.addEventListener('play', sync);
    video?.addEventListener('pause', sync);
  };

  btn.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();
    const video = getVideo();
    if (!video || atmosphere?.getAttribute('data-bg-state') === 'fallback') return;
    if (video.paused) {
      void video.play()?.catch(() => {});
    } else {
      video.pause();
    }
    sync();
  });

  atmosphere?.addEventListener('bg-state-change', () => {
    bindVideoEvents();
    sync();
  });

  bindVideoEvents();
  sync();
}

/** Continuous hover glitch on player controls (Nightmare pack only). */
function bindHoverGlitch(root: HTMLElement): void {
  root
    .querySelectorAll<HTMLElement>(
      '[data-shuffle-toggle], [data-bg-play-toggle], [data-jukebox-option], [data-mute-control]',
    )
    .forEach((btn) => {
      let over = false;
      const glitch = createContinuousGlitch(btn, () => {
        if (!over || prefersReducedMotion() || !isGlitchThemeActive()) return false;
        if (btn.classList.contains('is-glitching')) return false;
        if (btn.matches('[data-shuffle-toggle]') && btn.getAttribute('aria-pressed') === 'true') {
          return false;
        }
        if (btn instanceof HTMLButtonElement && btn.disabled) return false;
        return true;
      });
      btn.addEventListener('pointerenter', () => {
        over = true;
        glitch.start();
      });
      btn.addEventListener('pointerleave', () => {
        over = false;
        glitch.stop();
      });
    });
}

function isLegalOverlayOpen(): boolean {
  return Boolean(document.querySelector('#legal-overlay [data-legal-panel]:not([hidden])'));
}

function isNavMenuOpen(): boolean {
  return document.documentElement.classList.contains('site-nav-menu-open');
}

function isRubPanelOpen(): boolean {
  return Boolean(document.querySelector('[data-track-rub-panel]:not([hidden])'));
}

function isOverlayOpen(): boolean {
  return isLegalOverlayOpen() || isNavMenuOpen() || isRubPanelOpen();
}

/** Primary taps on empty stage only — chrome, overlays and the intro never count. */
function isStageTap(event: PointerEvent): boolean {
  if (!event.isPrimary) return false;
  if (event.pointerType === 'mouse' && event.button !== 0) return false;
  if (matchesGestureIgnore(event.target, STAGE_GESTURE_IGNORE_SELECTOR)) return false;
  return !isIntroActive() && !isOverlayOpen();
}

/** Discography play inside the overlay / phone menu → close it so the stage change shows. */
function bindOverlayCloseOnPlay(): void {
  document.addEventListener('click', (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;
    if (!target.closest('[data-stage-button]')) return;
    if (!target.closest('#legal-overlay, [data-site-nav-menu]')) return;
    document.dispatchEvent(new CustomEvent(STAGE_OVERLAY_CLOSE_EVENT));
  });
}

export function initStagePlayer(): void {
  const root = playerRoot();
  if (!root || root.dataset.stagePlayerReady === 'true') return;
  root.dataset.stagePlayerReady = 'true';

  const panel = root.querySelector<HTMLElement>('[data-player-panel]');
  const vinyl = root.querySelector<HTMLButtonElement>('[data-player-vinyl]');
  const closeBtn = root.querySelector<HTMLButtonElement>('[data-player-close]');
  const reveal = root.querySelector<HTMLButtonElement>('[data-player-reveal]');
  if (!panel || !vinyl) return;

  bootStageSwitch(root);
  initBgVideoToggle(root);
  initEqFlatten();
  bindHoverGlitch(root);
  bindOverlayCloseOnPlay();

  let state: PlayerState = initialPlayerState(isPlayerDiscovered());
  let hintTimer: number | undefined;
  let hintExtended = false;

  const render = () => {
    root.dataset.playerState = state;
    const full = state === 'full';
    panel.inert = !full;
    vinyl.setAttribute('aria-expanded', full ? 'true' : 'false');
    // Hidden player is not reachable by Tab — the reveal button stands in for it.
    vinyl.tabIndex = state === 'hidden' ? -1 : 0;
    if (reveal) reveal.hidden = state !== 'hidden';
  };

  const clearHintTimer = () => {
    window.clearTimeout(hintTimer);
    hintTimer = undefined;
  };

  const startHintTimer = () => {
    clearHintTimer();
    hintTimer = window.setTimeout(() => dispatch('HINT_TIMEOUT'), HINT_MS);
  };

  const unlockDiscovery = () => {
    markPlayerDiscovered();
    maybeUnlockAchievement({
      storageKey: ACHIEVEMENT_PLAYER_FOUND_STORAGE_KEY,
      title: root.dataset.achievementTitle ?? 'Found it!',
      sub: root.dataset.achievementSub ?? 'You discovered the hidden player.',
      glyph: 'rub',
    });
  };

  const focusCurrentSong = () => {
    const current =
      root.querySelector<HTMLElement>('[data-jukebox-option][aria-pressed="true"]') ??
      root.querySelector<HTMLElement>('[data-jukebox-option]');
    current?.scrollIntoView({ block: 'nearest' });
    current?.focus({ preventScroll: true });
  };

  // Arrow (not a hoisted function) so TS keeps the narrowed root/vinyl/panel.
  const dispatch = (event: PlayerEvent, opts: { restoreFocus?: boolean } = {}): void => {
    const { state: next, effects } = nextPlayerState(state, event);
    if (next === state && !Object.values(effects).some(Boolean)) return;
    const previous = state;
    state = next;
    render();

    if (effects.startHintTimer) {
      hintExtended = false;
      startHintTimer();
    }
    if (effects.extendHintTimer && !hintExtended) {
      hintExtended = true;
      startHintTimer();
    }
    if (next !== 'hint') clearHintTimer();

    if (effects.markDiscovered) unlockDiscovery();
    if (effects.focusVinyl && opts.restoreFocus !== false) vinyl.focus({ preventScroll: true });
    if (next === 'full' && previous !== 'full') focusCurrentSong();

    if (next !== previous) {
      root.dispatchEvent(
        new CustomEvent(PLAYER_STATE_EVENT, { bubbles: true, detail: { state: next } }),
      );
    }
  };

  vinyl.addEventListener('click', (event) => {
    event.stopPropagation();
    if (state === 'full') {
      dispatch('CLOSE');
      return;
    }
    dispatch('ACTIVATE_VINYL');
  });

  reveal?.addEventListener('click', (event) => {
    event.stopPropagation();
    dispatch('KEYBOARD_REVEAL');
  });

  closeBtn?.addEventListener('click', (event) => {
    event.stopPropagation();
    dispatch('CLOSE');
  });

  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape' || state !== 'full') return;
    // Overlays and the phone menu own Escape while they are open.
    if (isOverlayOpen()) return;
    dispatch('CLOSE');
  });

  // Outside tap/click collapses without stealing focus.
  document.addEventListener('pointerdown', (event) => {
    if (state !== 'full') return;
    const target = event.target;
    if (target instanceof Node && root.contains(target)) return;
    dispatch('CLOSE', { restoreFocus: false });
  });

  // Hidden → hint: three quick taps on empty stage.
  const taps = createTapHint();
  const tapsCount = () => state === 'hidden' || state === 'hint';

  document.addEventListener(
    'pointerdown',
    (event) => {
      if (!tapsCount() || !isStageTap(event)) {
        taps.reset();
        return;
      }
      taps.down(event.clientX, event.clientY, event.timeStamp);
    },
    { passive: true },
  );

  document.addEventListener(
    'pointerup',
    (event) => {
      if (!tapsCount() || !isStageTap(event)) return;
      if (taps.up(event.clientX, event.clientY, event.timeStamp)) dispatch('TAP_HINT');
    },
    { passive: true },
  );

  document.addEventListener('pointercancel', () => taps.reset(), { passive: true });

  // A content overlay or the phone menu opening collapses the full player (no stacking).
  const collapseForOverlay = () => {
    if (state === 'full' && (isLegalOverlayOpen() || isNavMenuOpen())) dispatch('OVERLAY_OPENED');
  };
  const legalOverlay = document.getElementById('legal-overlay');
  if (legalOverlay) {
    new MutationObserver(collapseForOverlay).observe(legalOverlay, {
      subtree: true,
      attributes: true,
      attributeFilter: ['hidden'],
    });
  }
  new MutationObserver(collapseForOverlay).observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class'],
  });

  render();
}
