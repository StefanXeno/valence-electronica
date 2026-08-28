/** Dwell for no-audio entries and unknown-duration audio fallback (seconds). */
export const NO_AUDIO_DWELL_SEC = 45;

export type PlaybackCatalogEntry = {
  id: string;
  hasAudio: boolean;
};

export function dwellSeconds(
  entry: Pick<PlaybackCatalogEntry, 'hasAudio'>,
  videoDurationSec?: number | null,
): number {
  if (!entry.hasAudio) return NO_AUDIO_DWELL_SEC;
  if (
    videoDurationSec != null &&
    Number.isFinite(videoDurationSec) &&
    videoDurationSec > 0
  ) {
    return videoDurationSec;
  }
  return NO_AUDIO_DWELL_SEC;
}

export function pickOtherId(
  ids: string[],
  current: string,
  isAllowed: (id: string) => boolean = () => true,
): string | undefined {
  const others = ids.filter((id) => id !== current && isAllowed(id));
  if (others.length === 0) return undefined;
  return others[Math.floor(Math.random() * others.length)]!;
}

export function isIntroActive(): boolean {
  const html = document.documentElement;
  return html.hasAttribute('data-intro-pending') || html.hasAttribute('data-intro-active');
}

export type PlaybackMode = {
  shuffle: boolean;
  loop: boolean;
};

let mode: PlaybackMode = { shuffle: true, loop: false };
let advanceTimer: ReturnType<typeof setTimeout> | undefined;

export function initPlaybackDefaults(shuffleDefault: boolean, loopDefault: boolean): void {
  mode = { shuffle: shuffleDefault, loop: loopDefault };
}

export function getPlaybackMode(): PlaybackMode {
  return { ...mode };
}

export function setShuffle(value: boolean): void {
  mode.shuffle = value;
  if (!value) clearAdvanceTimer();
}

export function setLoop(value: boolean): void {
  mode.loop = value;
  if (value) clearAdvanceTimer();
}

export function clearAdvanceTimer(): void {
  if (advanceTimer !== undefined) {
    clearTimeout(advanceTimer);
    advanceTimer = undefined;
  }
}

export function scheduleAdvance(dwellSec: number, fire: () => void): void {
  clearAdvanceTimer();
  if (!mode.shuffle || mode.loop || isIntroActive()) return;
  advanceTimer = setTimeout(() => {
    advanceTimer = undefined;
    if (!mode.shuffle || mode.loop || isIntroActive()) return;
    fire();
  }, Math.max(0, dwellSec) * 1000);
}

export function restartAdvanceClock(
  entry: Pick<PlaybackCatalogEntry, 'hasAudio'>,
  videoDurationSec: number | null | undefined,
  fire: () => void,
): void {
  if (!mode.shuffle || mode.loop || isIntroActive()) {
    clearAdvanceTimer();
    return;
  }
  scheduleAdvance(dwellSeconds(entry, videoDurationSec), fire);
}

export function watchIntroGate(onClear: () => void, onRestart: () => void): () => void {
  const observer = new MutationObserver(() => {
    if (isIntroActive()) {
      clearAdvanceTimer();
      onClear();
    } else {
      onRestart();
    }
  });
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-intro-pending', 'data-intro-active'],
  });
  return () => observer.disconnect();
}

export function readVideoDuration(video: HTMLVideoElement | null): number | null {
  if (!video) return null;
  const duration = video.duration;
  return Number.isFinite(duration) && duration > 0 ? duration : null;
}
