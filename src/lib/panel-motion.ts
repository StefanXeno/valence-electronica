import { isGlitchThemeActive } from './glitch';

/** Glitch morph close — matches existing jukebox / stage-panel timing. */
export const GLITCH_PANEL_CLOSE_MS = 280;

/** Default-theme duration for each open/close phase (shell, then body). */
export const SMOOTH_PANEL_PHASE_MS = 280;

export function panelCloseDelayMs(reducedMotion: boolean): number {
  if (reducedMotion) return 0;
  return isGlitchThemeActive() ? GLITCH_PANEL_CLOSE_MS : SMOOTH_PANEL_PHASE_MS;
}

/** Default theme: expand shell first, then body (reverse of close). */
export function runSmoothPanelOpen(panel: HTMLElement, reducedMotion: boolean): void {
  if (reducedMotion || isGlitchThemeActive()) return;

  panel.classList.add('is-panel-opening');
  window.setTimeout(() => {
    panel.classList.remove('is-panel-opening');
  }, SMOOTH_PANEL_PHASE_MS);
}

/** Default theme: intercept `<summary>` open so motion can run in two phases. */
export function shouldSmoothPanelOpen(reducedMotion: boolean): boolean {
  return !reducedMotion && !isGlitchThemeActive();
}
