/**
 * Idle fade for the corner HUD (V-Flip vinyl + achievement trophy).
 *
 * After `IDLE_MS` without a click/tap or key press, `<html>` gets `data-ui-idle`; the next
 * click/tap or key press removes it again (the HUD fades back in). All fade CSS for the pair
 * lives in `src/styles/corner-hud.css` (`--corner-hud-*` tokens).
 *
 * Desktop (fine pointer + hover): moving the mouse does not wake the HUD. While idle, each
 * control's opacity follows the cursor's distance to it instead (`--hud-proximity`, 0–1):
 * fully visible within `NEAR_PX`, invisible beyond `FAR_PX`. `data-ui-tracking` switches the
 * CSS to a short transition so the fade follows the mouse.
 *
 * While a panel is open (V-Flip, achievements, phone menu, content overlay) the HUD never
 * goes idle, so clicks inside it cannot make the other control fade out and back in.
 *
 * Tuning (dev + pre-release builds only): `?idle=<seconds>`, `?idlefade=<seconds>`,
 * `?near=<px>`, `?far=<px>`.
 */
import { ACHIEVEMENT_UNLOCKED_EVENT } from './achievement-toast';
import { isPreviewBuild } from './url';

export const IDLE_MS = 4000;
export const NEAR_PX = 24;
export const FAR_PX = 260;

/** Control that is measured → element that fades (and carries `--hud-proximity`). */
const PROXIMITY_TARGETS: ReadonlyArray<{ control: string; host: string }> = [
  { control: '[data-player-vinyl]', host: '.stage-player' },
  { control: '[data-achievement-toggle]', host: '[data-achievement-gallery]' },
];

/** Open V-Flip / achievements / phone menu / content sheets / rub panel (same checks as stage-player.ts). */
function isPanelOpen(): boolean {
  const html = document.documentElement;
  return (
    html.classList.contains('site-nav-menu-open') ||
    html.classList.contains('achievement-gallery-open') ||
    Boolean(
      document.querySelector(
        ".stage-player[data-player-state='full'], [data-achievement-gallery][data-gallery-state='open'], #legal-overlay [data-legal-panel]:not([hidden]), [data-track-rub-panel]:not([hidden])",
      ),
    )
  );
}

/** Positive number from a query value; anything else → undefined. */
export function parsePositiveParam(value: string | null): number | undefined {
  if (value === null || value.trim() === '') return undefined;
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : undefined;
}

/** Positive seconds from a query value → milliseconds; anything else → undefined. */
export function parseSecondsParam(value: string | null): number | undefined {
  const seconds = parsePositiveParam(value);
  return seconds === undefined ? undefined : Math.round(seconds * 1000);
}

/** Distance from a point to the nearest edge of a rect (0 inside it). */
export function distanceToRect(
  x: number,
  y: number,
  rect: { left: number; top: number; right: number; bottom: number },
): number {
  const dx = Math.max(rect.left - x, 0, x - rect.right);
  const dy = Math.max(rect.top - y, 0, y - rect.bottom);
  return Math.hypot(dx, dy);
}

/** 1 within `near`, 0 beyond `far`, smoothstep in between (gentle at both ends). */
export function proximityOpacity(distance: number, near: number, far: number): number {
  if (distance <= near) return 1;
  if (distance >= far) return 0;
  const t = 1 - (distance - near) / (far - near);
  return t * t * (3 - 2 * t);
}

export function initIdleFade(): void {
  const html = document.documentElement;
  if (html.dataset.idleFadeReady === 'true') return;
  html.dataset.idleFadeReady = 'true';

  let idleMs = IDLE_MS;
  let near = NEAR_PX;
  let far = FAR_PX;
  if (import.meta.env.DEV || isPreviewBuild()) {
    const params = new URLSearchParams(window.location.search);
    idleMs = parseSecondsParam(params.get('idle')) ?? IDLE_MS;
    const fadeMs = parseSecondsParam(params.get('idlefade'));
    if (fadeMs !== undefined) html.style.setProperty('--corner-hud-fade-out', `${fadeMs}ms`);
    near = parsePositiveParam(params.get('near')) ?? NEAR_PX;
    far = Math.max(parsePositiveParam(params.get('far')) ?? FAR_PX, near + 1);
  }

  const desktop = window.matchMedia('(hover: hover) and (pointer: fine)');
  const isIdle = () => html.hasAttribute('data-ui-idle');

  // —— Proximity (desktop, idle only) ——
  let pointer: { x: number; y: number } | undefined;
  let frame = 0;

  const applyProximity = () => {
    frame = 0;
    for (const { control, host } of PROXIMITY_TARGETS) {
      const hostEl = document.querySelector<HTMLElement>(host);
      if (!hostEl) continue;
      const controlEl = document.querySelector<HTMLElement>(control);
      const rect = controlEl?.getBoundingClientRect();
      const value =
        pointer && rect && rect.width > 0
          ? proximityOpacity(distanceToRect(pointer.x, pointer.y, rect), near, far)
          : 0;
      hostEl.style.setProperty('--hud-proximity', value.toFixed(3));
    }
  };

  const scheduleProximity = () => {
    if (!frame) frame = window.requestAnimationFrame(applyProximity);
  };

  window.addEventListener(
    'pointermove',
    (event) => {
      if (event.pointerType !== 'mouse') return;
      pointer = { x: event.clientX, y: event.clientY };
      if (!isIdle() || !desktop.matches) return;
      html.setAttribute('data-ui-tracking', '');
      scheduleProximity();
    },
    { passive: true, capture: true },
  );

  document.addEventListener('mouseleave', () => {
    pointer = undefined;
    if (isIdle()) scheduleProximity();
  });

  // —— Idle timer ——
  let timer: number | undefined;
  const goIdle = () => {
    // Panels hold the HUD awake; check again once the idle time has passed.
    if (isPanelOpen()) {
      timer = window.setTimeout(goIdle, idleMs);
      return;
    }
    // Start from the cursor's current distance, so a nearby control only dims partway.
    if (desktop.matches) applyProximity();
    html.setAttribute('data-ui-idle', '');
  };

  const wake = () => {
    html.removeAttribute('data-ui-idle');
    html.removeAttribute('data-ui-tracking');
    window.clearTimeout(timer);
    timer = window.setTimeout(goIdle, idleMs);
  };

  for (const type of ['pointerdown', 'keydown', 'touchstart']) {
    window.addEventListener(type, wake, { passive: true, capture: true });
  }
  // Without a mouse, movement (pen, hybrid) still counts as activity.
  window.addEventListener(
    'pointermove',
    (event) => {
      if (!desktop.matches || event.pointerType !== 'mouse') wake();
    },
    { passive: true, capture: true },
  );
  // A fresh unlock pulses the trophy — bring it back so the pulse is seen.
  document.addEventListener(ACHIEVEMENT_UNLOCKED_EVENT, wake);
  wake();
}
