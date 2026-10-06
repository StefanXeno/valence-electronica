/**
 * Hidden stage player (035) — DOM wiring.
 *
 * Boots the stage engine (`stage-switch.ts`), the background play/pause toggle, and
 * the player state machine (`player-state.ts`). Visibility is CSS-driven from
 * `data-player-state` on `[data-stage-player]`.
 */

import { maybeUnlockAchievement } from './achievement-toast';
import { initEqFlatten } from './eq-flatten';
import { createContinuousGlitch, isGlitchThemeActive } from './glitch';
import { setPlayerPaused } from './playback';
import { markPlayerDiscovered } from './player-discovery';
import {
  nextPlayerState,
  type PlayerEvent,
  type PlayerState,
} from './player-state';
import { initStageSwitch, type StageCatalogEntry } from './stage-switch';
import type { StageSchedule } from './stage-schedule';

export const PLAYER_STATE_EVENT = 'player-state-change';
export const ACHIEVEMENT_PLAYER_FOUND_STORAGE_KEY = 've-achievement-player-found';

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
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  root
    .querySelectorAll<HTMLElement>(
      '[data-shuffle-toggle], [data-bg-play-toggle], [data-jukebox-option], [data-mute-control]',
    )
    .forEach((btn) => {
      let over = false;
      const glitch = createContinuousGlitch(btn, () => {
        if (!over || reduceMotion.matches || !isGlitchThemeActive()) return false;
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

export function initStagePlayer(): void {
  const root = playerRoot();
  if (!root || root.dataset.stagePlayerReady === 'true') return;
  root.dataset.stagePlayerReady = 'true';

  const panel = root.querySelector<HTMLElement>('[data-player-panel]');
  const vinyl = root.querySelector<HTMLButtonElement>('[data-player-vinyl]');
  const closeBtn = root.querySelector<HTMLButtonElement>('[data-player-close]');
  if (!panel || !vinyl) return;

  bootStageSwitch(root);
  initBgVideoToggle(root);
  initEqFlatten();
  bindHoverGlitch(root);

  // MVP: start in the minimal vinyl until discovery (US1) lands.
  let state: PlayerState = 'minimal';

  const render = () => {
    root.dataset.playerState = state;
    const full = state === 'full';
    panel.inert = !full;
    vinyl.setAttribute('aria-expanded', full ? 'true' : 'false');
    // Hidden player must not be reachable by Tab; hint/minimal/full keep the vinyl.
    vinyl.tabIndex = state === 'hidden' ? -1 : 0;
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

  const dispatch = (event: PlayerEvent, opts: { restoreFocus?: boolean } = {}) => {
    const { state: next, effects } = nextPlayerState(state, event);
    if (next === state && !Object.values(effects).some(Boolean)) return;
    const previous = state;
    state = next;
    render();

    if (effects.markDiscovered) unlockDiscovery();
    if (effects.focusVinyl && opts.restoreFocus !== false) vinyl.focus({ preventScroll: true });
    if (next === 'full' && previous !== 'full') {
      root
        .querySelector<HTMLElement>('[data-jukebox-option][aria-pressed="true"]')
        ?.scrollIntoView({ block: 'nearest' });
    }

    root.dispatchEvent(
      new CustomEvent(PLAYER_STATE_EVENT, { bubbles: true, detail: { state: next } }),
    );
  };

  vinyl.addEventListener('click', (event) => {
    event.stopPropagation();
    if (state === 'full') {
      dispatch('CLOSE');
      return;
    }
    dispatch('ACTIVATE_VINYL');
  });

  closeBtn?.addEventListener('click', (event) => {
    event.stopPropagation();
    dispatch('CLOSE');
  });

  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape' || state !== 'full') return;
    // The legal/content overlay owns Escape while it is open.
    if (isLegalOverlayOpen()) return;
    dispatch('CLOSE');
  });

  // Outside tap/click collapses without stealing focus.
  document.addEventListener('pointerdown', (event) => {
    if (state !== 'full') return;
    const target = event.target;
    if (target instanceof Node && root.contains(target)) return;
    dispatch('CLOSE', { restoreFocus: false });
  });

  render();
}
