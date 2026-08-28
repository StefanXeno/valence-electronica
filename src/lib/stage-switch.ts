import {
  applyThemeAttributes,
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

export type StageCatalogEntry = {
  id: string;
  label: string;
  themeId: string;
  hasAudio: boolean;
  poster: string;
  sources: { src: string; type: string }[];
};

export const STAGE_SELECT_EVENT = 'stage-select';
const CROSSFADE_MS = 700;

let themeCrossfadeTimer: number | undefined;

function applyThemeForHandoff(
  attrs: ReturnType<typeof applyThemeAttributes>,
  animated: boolean,
): void {
  window.clearTimeout(themeCrossfadeTimer);

  if (!animated) {
    delete document.documentElement.dataset.stageCrossfade;
    document.documentElement.dataset.theme = attrs.themeId;
    document.documentElement.dataset.hudGlitch = attrs.hudGlitch;
    return;
  }

  document.documentElement.dataset.stageCrossfade = 'true';
  requestAnimationFrame(() => {
    document.documentElement.dataset.theme = attrs.themeId;
    document.documentElement.dataset.hudGlitch = attrs.hudGlitch;
    themeCrossfadeTimer = window.setTimeout(() => {
      delete document.documentElement.dataset.stageCrossfade;
    }, CROSSFADE_MS);
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

export function applyStageEntry(entry: StageCatalogEntry, keepMuted: boolean) {
  const { atmosphere, current, poster } = getAtmosphereVideos();
  if (!atmosphere || !current) return;

  const pack = resolveThemePack(entry.themeId);
  const attrs = applyThemeAttributes(pack);
  applyThemeForHandoff(attrs, false);

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

async function crossfadeStageEntry(entry: StageCatalogEntry, keepMuted: boolean): Promise<void> {
  const { atmosphere, current, next, poster } = getAtmosphereVideos();
  if (!atmosphere || !current) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const pack = resolveThemePack(entry.themeId);
  const attrs = applyThemeAttributes(pack);
  const hasSources = entry.sources.length > 0;
  const playsVideo = packSupportsLoopingVideo(pack, hasSources);

  if (!next || !playsVideo || reduceMotion) {
    applyStageEntry(entry, keepMuted);
    delete document.documentElement.dataset.stageCrossfade;
    return;
  }

  applyThemeForHandoff(attrs, true);
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

  current.muted = true;
  next.classList.add('atmosphere__video--active');
  next.style.opacity = '0';

  const playAttempt = next.play();
  if (playAttempt) await playAttempt.catch(() => {});

  requestAnimationFrame(() => {
    next.style.transition = `opacity ${CROSSFADE_MS}ms cubic-bezier(0.4, 0, 0.2, 1)`;
    current.style.transition = next.style.transition;
    next.style.opacity = '1';
    current.style.opacity = '0';
  });

  await new Promise((resolve) => window.setTimeout(resolve, CROSSFADE_MS));

  swapAtmosphereVideos(current, next);

  resetVideoBuffer(current);

  next.classList.remove('atmosphere__video--active');
  next.style.transition = '';
  next.style.opacity = '1';

  if (poster) poster.src = entry.poster;

  atmosphere.dataset.bgState = 'playing';
  notify();
}

export function syncStageUi(activeId: string) {
  document.querySelectorAll<HTMLElement>('[data-jukebox-option]').forEach((option) => {
    const on = option.dataset.jukeboxOption === activeId;
    option.setAttribute('aria-pressed', on ? 'true' : 'false');
  });

  document.querySelectorAll<HTMLElement>('[data-lyrics-for]').forEach((node) => {
    node.hidden = node.dataset.lyricsFor !== activeId;
  });

  document.querySelectorAll<HTMLElement>('[data-track-info-for]').forEach((node) => {
    node.hidden = node.dataset.trackInfoFor !== activeId;
  });

  document.querySelectorAll<HTMLButtonElement>('[data-stage-button]').forEach((button) => {
    const on = button.dataset.stageButton === activeId;
    button.setAttribute('aria-pressed', on ? 'true' : 'false');
  });

  document.querySelectorAll<HTMLButtonElement>('[data-shuffle-toggle]').forEach((button) => {
    button.setAttribute('aria-pressed', getPlaybackMode().shuffle ? 'true' : 'false');
  });

  document.querySelectorAll<HTMLButtonElement>('[data-loop-toggle]').forEach((button) => {
    button.setAttribute('aria-pressed', getPlaybackMode().loop ? 'true' : 'false');
  });
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
    activeId = id;

    void crossfadeStageEntry(entry, keepMuted).then(() => {
      syncStageUi(activeId);
      restartClock();
    });
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

  const video = document.querySelector<HTMLVideoElement>('[data-bg-video]');
  video?.addEventListener('loadedmetadata', () => restartClock());

  watchIntroGate(
    () => clearAdvanceTimer(),
    () => restartClock(),
  );

  syncStageUi(activeId);
  restartClock();
}
