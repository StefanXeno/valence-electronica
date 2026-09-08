import { isGlitchThemeActive } from './glitch';

/** Glitch morph close — matches existing jukebox / stage-panel timing. */
export const GLITCH_PANEL_CLOSE_MS = 280;

/** Shared default-theme duration. Sequential two-stage uses this per stage. */
export const SMOOTH_PANEL_PHASE_MS = 280;

/** Phone content-pill morph — matches `--phone-panel-morph-dur`. */
export const PHONE_PANEL_PHASE_MS = 320;

/** Phone playlist sheet morph (`player-dock` PLAYLIST_MORPH_MS). */
export const PLAYLIST_MORPH_MS = 380;

/** Phone playlist / sheet ease. Desktop playlist is a view-switch (no width morph). */
export const PLAYLIST_MORPH_EASE = 'cubic-bezier(0.22, 1, 0.36, 1)';

/** Width stage committed (open size). Height may still be collapsed. */
export const TWO_STAGE_WIDTH_CLASS = 'is-two-stage-width';

/** Height stage committed (open size). */
export const TWO_STAGE_HEIGHT_CLASS = 'is-two-stage-height';

export function panelCloseDelayMs(reducedMotion: boolean): number {
  if (reducedMotion) return 0;
  return isGlitchThemeActive() ? GLITCH_PANEL_CLOSE_MS : SMOOTH_PANEL_PHASE_MS;
}

/**
 * Legacy vinyl / simultaneous morph hook. Desktop bar uses
 * {@link createTwoStageMotion} (width then height). Desktop playlist
 * is a view-switch + optional height-only grow-up — not two-stage.
 */
export function runSmoothPanelOpen(_panel: HTMLElement, _reducedMotion: boolean): void {
  // Intentionally empty for the leftover vinyl path. Sequential grow is
  // createTwoStageMotion — do not run width+height together there.
}

/** Default theme (non-glitch, motion on): use CSS morph instead of glitch. */
export function shouldSmoothPanelOpen(reducedMotion: boolean): boolean {
  return !reducedMotion && !isGlitchThemeActive();
}

export type TwoStageHandle = {
  /** Queue the last committed open/close. Mid-flight toggles replace the target. */
  request: (open: boolean) => void;
  /** Instant both stages (resize / reduced-motion snap). */
  snap: (open: boolean) => void;
  /** Drop in-flight timers; leave classes as-is. */
  cancel: () => void;
  getTarget: () => boolean;
};

export type TwoStageMotionOptions = {
  reducedMotion: () => boolean;
  /** Toggle [open] / .is-open. Player chrome MUST stay visible on desktop. */
  applySemanticOpen: (open: boolean) => void;
  /** Per-stage duration. Default {@link SMOOTH_PANEL_PHASE_MS}. */
  stageMs?: number;
};

/**
 * Sequential grow-in-place: open = width then height; close = height then width.
 * Each stage is {@link SMOOTH_PANEL_PHASE_MS} (0 when reduced motion).
 * Overlapping requests settle to the last committed action (FR-010).
 */
export function createTwoStageMotion(
  element: HTMLElement,
  options: TwoStageMotionOptions,
): TwoStageHandle {
  let gen = 0;
  let target = false;
  let timer: number | undefined;

  const clearTimer = () => {
    if (timer !== undefined) {
      window.clearTimeout(timer);
      timer = undefined;
    }
  };

  const phaseMs = () =>
    options.reducedMotion() ? 0 : (options.stageMs ?? SMOOTH_PANEL_PHASE_MS);

  const wait = (ms: number, token: number): Promise<boolean> => {
    return new Promise((resolve) => {
      if (ms <= 0) {
        resolve(token === gen);
        return;
      }
      timer = window.setTimeout(() => {
        timer = undefined;
        resolve(token === gen);
      }, ms);
    });
  };

  const applyOpenClasses = (width: boolean, height: boolean) => {
    element.classList.toggle(TWO_STAGE_WIDTH_CLASS, width);
    element.classList.toggle(TWO_STAGE_HEIGHT_CLASS, height);
  };

  const runToward = async (open: boolean, token: number) => {
    const instant = phaseMs() === 0;
    const hasWidth = element.classList.contains(TWO_STAGE_WIDTH_CLASS);
    const hasHeight = element.classList.contains(TWO_STAGE_HEIGHT_CLASS);

    if (open) {
      options.applySemanticOpen(true);
      if (instant) {
        if (token !== gen) return;
        applyOpenClasses(true, true);
        return;
      }
      if (!hasWidth) {
        applyOpenClasses(true, false);
        if (!(await wait(phaseMs(), token))) return;
      }
      if (token !== gen) return;
      applyOpenClasses(true, true);
      return;
    }

    if (instant) {
      applyOpenClasses(false, false);
      options.applySemanticOpen(false);
      return;
    }
    if (hasHeight) {
      applyOpenClasses(hasWidth || hasHeight, false);
      if (!(await wait(phaseMs(), token))) return;
    }
    if (token !== gen) return;
    applyOpenClasses(false, false);
    options.applySemanticOpen(false);
  };

  return {
    request(open) {
      target = open;
      gen += 1;
      clearTimer();
      void runToward(open, gen);
    },
    snap(open) {
      gen += 1;
      clearTimer();
      target = open;
      applyOpenClasses(open, open);
      options.applySemanticOpen(open);
    },
    cancel() {
      gen += 1;
      clearTimer();
    },
    getTarget() {
      return target;
    },
  };
}
