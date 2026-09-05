import { isGlitchThemeActive } from './glitch';

/** Glitch morph close — matches existing jukebox / stage-panel timing. */
export const GLITCH_PANEL_CLOSE_MS = 280;

/** Shared default-theme open/close duration (width + height, one shot). */
export const SMOOTH_PANEL_PHASE_MS = 280;

/** Phone content-pill morph — matches `--phone-panel-morph-dur`. */
export const PHONE_PANEL_PHASE_MS = 320;

export function panelCloseDelayMs(reducedMotion: boolean): number {
  if (reducedMotion) return 0;
  return isGlitchThemeActive() ? GLITCH_PANEL_CLOSE_MS : SMOOTH_PANEL_PHASE_MS;
}

/**
 * Default theme: open is CSS-only. Width and height start together —
 * no `is-panel-opening` shell-then-body delay.
 */
export function runSmoothPanelOpen(_panel: HTMLElement, _reducedMotion: boolean): void {
  // Intentionally empty. `[open]` / `.is-open` interpolate width + max-height
  // from t=0 with the same 280ms cubic-bezier(0.4, 0, 0.2, 1).
}

/** Default theme (non-glitch, motion on): use CSS morph instead of glitch. */
export function shouldSmoothPanelOpen(reducedMotion: boolean): boolean {
  return !reducedMotion && !isGlitchThemeActive();
}
