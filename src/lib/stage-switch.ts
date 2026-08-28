import {
  applyThemeAttributes,
  packAllowsHudGlitch,
  packAllowsMute,
  packSupportsLoopingVideo,
  resolveThemePack,
} from './theme-packs';
import {
  berlinCalendarParts,
  resolveScheduledDefault,
  type StageSchedule,
} from './stage-schedule';
import {
  clearAdvanceTimer,
  getPlaybackMode,
  initPlaybackDefaults,
  pickOtherId,
  readVideoDuration,
  restartAdvanceClock,
  setLoop,
  setShuffle,
  watchIntroGate,
} from './playback';
import { createContinuousGlitch, isGlitchThemeActive } from './glitch';

export type StageCatalogEntry = {
  id: string;
  label: string;
  themeId: string;
  hasAudio: boolean;
  poster: string;
  sources: { src: string; type: string }[];
};

export const STAGE_SELECT_EVENT = 'stage-select';

const CROSSFADE_SMOOTH_MS = 1000;
const CROSSFADE_GLITCH_MS = 720;

type ThemeHandoffMode = 'instant' | 'smooth' | 'glitch';

let themeCrossfadeTimer: number | undefined;
let syncPlaybackToggleGlitch: (() => void) | undefined;
let handoffGeneration = 0;
let metadataVideo: HTMLVideoElement | null = null;
let metadataHandler: (() => void) | null = null;

function resolveThemeHandoff(
  fromEntry: StageCatalogEntry | undefined,
  toEntry: StageCatalogEntry,
): { mode: ThemeHandoffMode; leavingGlitch: boolean; durationMs: number } {
  const fromGlitch = packAllowsHudGlitch(resolveThemePack(fromEntry?.themeId));
  const toGlitch = packAllowsHudGlitch(resolveThemePack(toEntry.themeId));

  if (fromGlitch || toGlitch) {
    return {
      mode: 'glitch',
      leavingGlitch: fromGlitch && !toGlitch,
      durationMs: CROSSFADE_GLITCH_MS,
    };
  }

  return { mode: 'smooth', leavingGlitch: false, durationMs: CROSSFADE_SMOOTH_MS };
}

function applyThemeForHandoff(
  attrs: ReturnType<typeof applyThemeAttributes>,
  animated: boolean,
  handoff: { mode: ThemeHandoffMode; leavingGlitch: boolean; durationMs: number },
): void {
  window.clearTimeout(themeCrossfadeTimer);

  if (!animated || handoff.mode === 'instant') {
    delete document.documentElement.dataset.stageCrossfade;
    document.documentElement.dataset.theme = attrs.themeId;
    document.documentElement.dataset.hudGlitch = attrs.hudGlitch;
    return;
  }

  document.documentElement.dataset.stageCrossfade = handoff.mode;

  requestAnimationFrame(() => {
    document.documentElement.dataset.theme = attrs.themeId;
    if (!handoff.leavingGlitch) {
      document.documentElement.dataset.hudGlitch = attrs.hudGlitch;
    }

    themeCrossfadeTimer = window.setTimeout(() => {
      delete document.documentElement.dataset.stageCrossfade;
      if (handoff.leavingGlitch) {
        document.documentElement.dataset.hudGlitch = attrs.hudGlitch;
      }
      syncPlaybackToggleGlitch?.();
    }, handoff.durationMs);
  });
}

function getAtmosphereVideos() {
  const atmosphere = document.querySelector<HTMLElement>('[data-atmosphere]');
  const current = atmosphere?.querySelector<HTMLVideoElement>('[data-bg-video]');
  const next = atmosphere?.querySelector<HTMLVideoElement>('[data-bg-video-next]');
  const poster = atmosphere?.querySelector<HTMLImageElement>('[data-bg-poster]');
  return { atmosphere, current, next, poster };
}

function entryHasPlayableAudio(entry: StageCatalogEntry): boolean {
  const pack = resolveThemePack(entry.themeId);
  const playsVideo = packSupportsLoopingVideo(pack, entry.sources.length > 0);
  return packAllowsMute(pack, entry.hasAudio, playsVideo);
}

function isVideoUnmuted(video: HTMLVideoElement | null): boolean {
  return Boolean(video && !(video.muted || video.volume === 0));
}

function shuffleCandidateIds(
  catalogIds: string[],
  byId: Map<string, StageCatalogEntry>,
  preferAudio: boolean,
): string[] {
  if (!preferAudio) return catalogIds;
  return catalogIds.filter((id) => {
    const entry = byId.get(id);
    return entry ? entryHasPlayableAudio(entry) : false;
  });
}
function updateAtmosphereMeta(
  atmosphere: HTMLElement,
  entry: StageCatalogEntry,
  playsVideo: boolean,
) {
  const pack = resolveThemePack(entry.themeId);
  atmosphere.dataset.hasAudio = packAllowsMute(pack, entry.hasAudio, playsVideo)
    ? 'true'
    : 'false';
  atmosphere.dataset.activeId = entry.id;
}

function loadVideoSources(
  video: HTMLVideoElement,
  entry: StageCatalogEntry,
  keepMuted: boolean,
  volume: number,
) {
  video.poster = entry.poster;
  video.querySelectorAll('source').forEach((node) => node.remove());
  video.removeAttribute('src');
  for (const source of entry.sources) {
    const el = document.createElement('source');
    el.src = source.src;
    el.type = source.type;
    video.append(el);
  }
  video.muted = keepMuted;
  video.volume = volume;
  video.load();
}

function resetVideoBuffer(video: HTMLVideoElement) {
  video.pause();
  video.classList.remove('atmosphere__video--active');
  video.style.transition = '';
  video.style.opacity = '0';
  video.querySelectorAll('source').forEach((node) => node.remove());
  video.removeAttribute('src');
  video.muted = true;
  video.load();
}

/** After crossfade, the playing element becomes `[data-bg-video]`; the old one is cleared. */
function swapAtmosphereVideos(current: HTMLVideoElement, next: HTMLVideoElement) {
  current.removeAttribute('data-bg-video');
  next.removeAttribute('data-bg-video-next');
  next.setAttribute('data-bg-video', '');
  current.setAttribute('data-bg-video-next', '');

  current.classList.remove('atmosphere__video--current');
  current.classList.add('atmosphere__video--next');
  next.classList.remove('atmosphere__video--next');
  next.classList.add('atmosphere__video--current');
}

function bindActiveVideoMetadataListener(onMetadata: () => void) {
  const video = document.querySelector<HTMLVideoElement>('[data-bg-video]');
  if (metadataVideo && metadataHandler) {
    metadataVideo.removeEventListener('loadedmetadata', metadataHandler);
  }
  metadataVideo = video;
  metadataHandler = onMetadata;
  video?.addEventListener('loadedmetadata', onMetadata);
}

export function applyStageEntry(entry: StageCatalogEntry, keepMuted: boolean) {
  const { atmosphere, current, poster } = getAtmosphereVideos();
  if (!atmosphere || !current) return;

  const pack = resolveThemePack(entry.themeId);
  const attrs = applyThemeAttributes(pack);
  applyThemeForHandoff(attrs, false, { mode: 'instant', leavingGlitch: false, durationMs: 0 });

  const hasSources = entry.sources.length > 0;
  const playsVideo = packSupportsLoopingVideo(pack, hasSources);
  updateAtmosphereMeta(atmosphere, entry, playsVideo);

  if (poster) poster.src = entry.poster;

  const notify = () => {
    atmosphere.dispatchEvent(new CustomEvent('bg-state-change', { bubbles: true }));
  };

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (!playsVideo || reduceMotion.matches) {
    current.pause();
    current.poster = entry.poster;
    current.querySelectorAll('source').forEach((node) => node.remove());
    current.removeAttribute('src');
    current.load();
    atmosphere.dataset.bgState = 'fallback';
    notify();
    return;
  }

  loadVideoSources(current, entry, keepMuted, current.volume);
  notify();

  const playAttempt = current.play();
  if (playAttempt) {
    playAttempt
      .then(() => {
        atmosphere.dataset.bgState = 'playing';
        notify();
      })
      .catch(() => {
        atmosphere.dataset.bgState = 'fallback';
        notify();
      });
    return;
  }

  notify();
}

async function crossfadeStageEntry(
  entry: StageCatalogEntry,
  keepMuted: boolean,
  fromEntry: StageCatalogEntry | undefined,
  generation: number,
  isStale: () => boolean,
): Promise<boolean> {
  if (isStale()) return false;

  const { atmosphere, current, next, poster } = getAtmosphereVideos();
  if (!atmosphere || !current) return false;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const pack = resolveThemePack(entry.themeId);
  const attrs = applyThemeAttributes(pack);
  const hasSources = entry.sources.length > 0;
  const playsVideo = packSupportsLoopingVideo(pack, hasSources);
  const handoff = resolveThemeHandoff(fromEntry, entry);

  if (!next || !playsVideo || reduceMotion) {
    if (isStale()) return false;
    applyStageEntry(entry, keepMuted);
    delete document.documentElement.dataset.stageCrossfade;
    return !isStale();
  }

  if (isStale()) return false;

  applyThemeForHandoff(attrs, true, handoff);
  syncPlaybackToggleGlitch?.();
  updateAtmosphereMeta(atmosphere, entry, playsVideo);

  const notify = () => {
    atmosphere.dispatchEvent(new CustomEvent('bg-state-change', { bubbles: true }));
  };

  const volume = current.volume;
  loadVideoSources(next, entry, keepMuted, volume);

  await new Promise<void>((resolve) => {
    const done = () => resolve();
    next.addEventListener('loadeddata', done, { once: true });
    next.addEventListener('error', done, { once: true });
  });

  if (isStale()) return false;

  current.muted = true;
  next.classList.add('atmosphere__video--active');
  next.style.opacity = '0';

  const playAttempt = next.play();
  if (playAttempt) await playAttempt.catch(() => {});

  if (isStale()) return false;

  const crossfadeEase =
    handoff.mode === 'glitch' ? 'steps(4, end)' : 'cubic-bezier(0.45, 0, 0.55, 1)';

  requestAnimationFrame(() => {
    if (isStale()) return;
    next.style.transition = `opacity ${handoff.durationMs}ms ${crossfadeEase}`;
    current.style.transition = next.style.transition;
    next.style.opacity = '1';
    current.style.opacity = '0';
  });

  await new Promise((resolve) => window.setTimeout(resolve, handoff.durationMs));

  if (isStale()) return false;

  swapAtmosphereVideos(current, next);

  resetVideoBuffer(current);

  next.classList.remove('atmosphere__video--active');
  next.style.transition = '';
  next.style.opacity = '1';

  if (poster) poster.src = entry.poster;

  atmosphere.dataset.bgState = 'playing';
  notify();
  return generation === handoffGeneration;
}

export function syncStageUi(activeId: string) {
  document.querySelectorAll<HTMLElement>('[data-jukebox-option]').forEach((option) => {
    const on = option.dataset.jukeboxOption === activeId;
    option.setAttribute('aria-pressed', on ? 'true' : 'false');
  });

  document.querySelectorAll<HTMLElement>('[data-track-info-for]').forEach((node) => {
    node.hidden = node.dataset.trackInfoFor !== activeId;
  });

  document.querySelectorAll<HTMLButtonElement>('[data-stage-button]').forEach((button) => {
    const on = button.dataset.stageButton === activeId;
    button.setAttribute('aria-pressed', on ? 'true' : 'false');
    button.hidden = on;
  });

  document.querySelectorAll<HTMLElement>('[data-discog-playing]').forEach((node) => {
    const on = node.dataset.discogPlaying === activeId;
    node.hidden = !on;
  });

  document.querySelectorAll<HTMLElement>('[data-discog-item]').forEach((item) => {
    const on = item.dataset.discogItem === activeId;
    if (on) {
      item.dataset.discogActive = 'true';
    } else {
      delete item.dataset.discogActive;
    }
  });

  document.querySelectorAll<HTMLButtonElement>('[data-shuffle-toggle]').forEach((button) => {
    button.setAttribute('aria-pressed', getPlaybackMode().shuffle ? 'true' : 'false');
  });

  document.querySelectorAll<HTMLButtonElement>('[data-loop-toggle]').forEach((button) => {
    button.setAttribute('aria-pressed', getPlaybackMode().loop ? 'true' : 'false');
  });

  syncPlaybackToggleGlitch?.();
}

function initPlaybackToggleGlitch(): () => void {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const toggles = document.querySelectorAll<HTMLButtonElement>(
    '[data-shuffle-toggle], [data-loop-toggle]',
  );
  const loops = new Map<HTMLButtonElement, ReturnType<typeof createContinuousGlitch>>();

  toggles.forEach((btn) => {
    loops.set(
      btn,
      createContinuousGlitch(btn, () => {
        if (reduceMotion.matches || !isGlitchThemeActive()) return false;
        return btn.getAttribute('aria-pressed') === 'true';
      }),
    );
  });

  const sync = () => {
    toggles.forEach((btn) => {
      const control = loops.get(btn);
      if (!control) return;
      if (btn.getAttribute('aria-pressed') === 'true' && isGlitchThemeActive()) {
        control.start();
      } else {
        control.stop();
      }
    });
  };

  reduceMotion.addEventListener('change', sync);
  new MutationObserver(sync).observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-hud-glitch'],
  });

  return sync;
}

export function initStageSwitch(
  catalog: StageCatalogEntry[],
  staticFallbackId: string,
  schedule?: StageSchedule,
  playbackDefaults?: { shuffleDefault: boolean; loopDefault: boolean },
) {
  const byId = new Map(catalog.map((entry) => [entry.id, entry]));
  const catalogIds = catalog.map((entry) => entry.id);
  const catalogIdSet = new Set(catalogIds);
  let activeId = staticFallbackId;

  if (playbackDefaults) {
    initPlaybackDefaults(playbackDefaults.shuffleDefault, playbackDefaults.loopDefault);
  }

  if (schedule?.rules.length) {
    activeId = resolveScheduledDefault(
      schedule,
      berlinCalendarParts(),
      catalogIdSet,
      staticFallbackId,
    );
  }

  if (activeId !== staticFallbackId) {
    const scheduled = byId.get(activeId);
    if (scheduled) {
      applyStageEntry(scheduled, true);
    } else {
      activeId = staticFallbackId;
    }
  }

  const restartClock = () => {
    const entry = byId.get(activeId);
    if (!entry) return;
    const video = document.querySelector<HTMLVideoElement>('[data-bg-video]');
    restartAdvanceClock(entry, readVideoDuration(video), () => hop());
  };

  const hop = () => {
    const video = document.querySelector<HTMLVideoElement>('[data-bg-video]');
    const pool = shuffleCandidateIds(catalogIds, byId, isVideoUnmuted(video));
    const isAllowed = (id: string) => pool.includes(id);
    const nextId = pickOtherId(catalogIds, activeId, isAllowed);
    if (!nextId) return;
    select(nextId, true);
  };

  const select = (id: string, fromHop = false) => {
    const entry = byId.get(id);
    if (!entry) return;
    if (id === activeId && !fromHop) {
      syncStageUi(activeId);
      return;
    }

    const video = document.querySelector<HTMLVideoElement>('[data-bg-video]');
    const keepMuted = video ? video.muted : true;
    const priorEntry = byId.get(activeId);

    handoffGeneration += 1;
    const generation = handoffGeneration;
    activeId = id;
    syncStageUi(activeId);

    const isStale = () => generation !== handoffGeneration;

    void crossfadeStageEntry(entry, keepMuted, priorEntry, generation, isStale).then(
      (completed) => {
        if (!completed) return;
        syncStageUi(activeId);
        bindActiveVideoMetadataListener(restartClock);
        restartClock();
      },
    );
  };

  document.addEventListener(STAGE_SELECT_EVENT, (event) => {
    const id = (event as CustomEvent<{ id?: string }>).detail?.id;
    if (id) select(id);
  });

  document.addEventListener('click', (event) => {
    const target = (event.target as HTMLElement | null)?.closest<HTMLElement>(
      '[data-jukebox-option], [data-stage-button]',
    );
    const id = target?.dataset.jukeboxOption ?? target?.dataset.stageButton;
    if (id) select(id);
  });

  document.addEventListener('click', (event) => {
    const shuffleBtn = (event.target as HTMLElement | null)?.closest<HTMLButtonElement>(
      '[data-shuffle-toggle]',
    );
    if (shuffleBtn) {
      event.preventDefault();
      const next = !getPlaybackMode().shuffle;
      setShuffle(next);
      syncStageUi(activeId);
      if (next && !getPlaybackMode().loop) restartClock();
      else clearAdvanceTimer();
      return;
    }

    const loopBtn = (event.target as HTMLElement | null)?.closest<HTMLButtonElement>(
      '[data-loop-toggle]',
    );
    if (loopBtn) {
      event.preventDefault();
      const next = !getPlaybackMode().loop;
      setLoop(next);
      syncStageUi(activeId);
      if (!next && getPlaybackMode().shuffle) restartClock();
    }
  });

  bindActiveVideoMetadataListener(restartClock);

  watchIntroGate(
    () => clearAdvanceTimer(),
    () => restartClock(),
  );

  syncPlaybackToggleGlitch = initPlaybackToggleGlitch();

  syncStageUi(activeId);
  syncPlaybackToggleGlitch();
  restartClock();
}
