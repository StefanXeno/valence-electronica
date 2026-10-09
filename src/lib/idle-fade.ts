/**
 * Idle fade for the corner HUD (V-Flip vinyl + achievement trophy).
 *
 * After `IDLE_MS` without pointer, touch, wheel, scroll or key input, `<html>` gets
 * `data-ui-idle`; any input removes it again. The components own the CSS (which states
 * fade, hover/focus exceptions); fade speeds are `--ui-idle-fade-out` / `--ui-idle-fade-in`.
 *
 * Tuning (dev + pre-release builds only): `?idle=<seconds>` and `?idlefade=<seconds>`.
 */
import { ACHIEVEMENT_UNLOCKED_EVENT } from './achievement-toast';
import { isPreviewBuild } from './url';

export const IDLE_MS = 4000;

const ACTIVITY_EVENTS = ['pointermove', 'pointerdown', 'wheel', 'keydown', 'touchstart', 'scroll'];

/** Positive seconds from a query value → milliseconds; anything else → undefined. */
export function parseSecondsParam(value: string | null): number | undefined {
  if (value === null || value.trim() === '') return undefined;
  const seconds = Number(value);
  return Number.isFinite(seconds) && seconds > 0 ? Math.round(seconds * 1000) : undefined;
}

export function initIdleFade(): void {
  const html = document.documentElement;
  if (html.dataset.idleFadeReady === 'true') return;
  html.dataset.idleFadeReady = 'true';

  let idleMs = IDLE_MS;
  if (import.meta.env.DEV || isPreviewBuild()) {
    const params = new URLSearchParams(window.location.search);
    idleMs = parseSecondsParam(params.get('idle')) ?? IDLE_MS;
    const fadeMs = parseSecondsParam(params.get('idlefade'));
    if (fadeMs !== undefined) html.style.setProperty('--ui-idle-fade-out', `${fadeMs}ms`);
  }

  let timer: number | undefined;
  const wake = () => {
    if (html.hasAttribute('data-ui-idle')) html.removeAttribute('data-ui-idle');
    window.clearTimeout(timer);
    timer = window.setTimeout(() => html.setAttribute('data-ui-idle', ''), idleMs);
  };

  for (const type of ACTIVITY_EVENTS) {
    window.addEventListener(type, wake, { passive: true, capture: true });
  }
  // A fresh unlock pulses the trophy — bring it back so the pulse is seen.
  document.addEventListener(ACHIEVEMENT_UNLOCKED_EVENT, wake);
  wake();
}
