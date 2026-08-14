export type StageCatalogEntry = {
  id: string;
  themeId: string;
  hasAudio: boolean;
  poster: string;
  sources: { src: string; type: string }[];
};

export const STAGE_SELECT_EVENT = 'stage-select';

const VIDEO_THEME_ID = 'nightmare-crimson';

function entryPlaysVideo(entry: StageCatalogEntry): boolean {
  return entry.themeId === VIDEO_THEME_ID && entry.sources.length > 0;
}

export function applyStageEntry(entry: StageCatalogEntry, keepMuted: boolean) {
  const root = document.documentElement;
  const atmosphere = document.querySelector<HTMLElement>('[data-atmosphere]');
  const video = atmosphere?.querySelector<HTMLVideoElement>('[data-bg-video]');
  const poster = atmosphere?.querySelector<HTMLImageElement>('[data-bg-poster]');
  if (!atmosphere || !video) return;

  root.dataset.theme = entry.themeId;
  atmosphere.dataset.hasAudio = entry.hasAudio && entryPlaysVideo(entry) ? 'true' : 'false';
  atmosphere.dataset.activeId = entry.id;

  video.poster = entry.poster;
  if (poster) poster.src = entry.poster;

  video.querySelectorAll('source').forEach((node) => node.remove());
  video.removeAttribute('src');

  const notify = () => {
    atmosphere.dispatchEvent(new CustomEvent('bg-state-change', { bubbles: true }));
  };

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (!entryPlaysVideo(entry) || reduceMotion.matches) {
    video.pause();
    video.load();
    atmosphere.dataset.bgState = 'fallback';
    notify();
    return;
  }

  for (const source of entry.sources) {
    const el = document.createElement('source');
    el.src = source.src;
    el.type = source.type;
    video.append(el);
  }

  video.muted = keepMuted;
  video.load();
  notify();

  const playAttempt = video.play();
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

export function syncStageUi(activeId: string) {
  document.querySelectorAll<HTMLElement>('[data-jukebox-option]').forEach((option) => {
    const on = option.dataset.jukeboxOption === activeId;
    option.setAttribute('aria-pressed', on ? 'true' : 'false');
    if (on) option.setAttribute('aria-current', 'true');
    else option.removeAttribute('aria-current');
  });

  document.querySelectorAll<HTMLElement>('[data-lyrics-for]').forEach((node) => {
    node.hidden = node.dataset.lyricsFor !== activeId;
  });

  document.querySelectorAll<HTMLButtonElement>('[data-stage-button]').forEach((button) => {
    const on = button.dataset.stageButton === activeId;
    button.setAttribute('aria-pressed', on ? 'true' : 'false');
  });
}

export function initStageSwitch(catalog: StageCatalogEntry[], defaultId: string) {
  const byId = new Map(catalog.map((entry) => [entry.id, entry]));
  let activeId = defaultId;

  const select = (id: string) => {
    const entry = byId.get(id);
    if (!entry || id === activeId) {
      syncStageUi(activeId);
      return;
    }
    const video = document.querySelector<HTMLVideoElement>('[data-bg-video]');
    const keepMuted = video ? video.muted : true;
    activeId = id;
    applyStageEntry(entry, keepMuted);
    syncStageUi(activeId);
  };

  document.addEventListener(STAGE_SELECT_EVENT, (event) => {
    const id = (event as CustomEvent<{ id?: string }>).detail?.id;
    if (id) select(id);
  });

  syncStageUi(activeId);
}
