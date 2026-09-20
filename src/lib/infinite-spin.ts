/**
 * Easter egg: circular pointer / finger spin while the Infinite stage is active.
 * ~1.25 revolutions around the down-point unlocks a one-shot achievement toast.
 */

import { hasAchievement, maybeUnlockAchievement } from './achievement-toast';

/** Stage / jukebox id for the Infinite track (not the steel-slate theme pack id). */
const INFINITE_STAGE_ID = 'infinite';

export const ACHIEVEMENT_INFINITE_SPIN_STORAGE_KEY = 've-achievement-infinite-spin';

const TAU = Math.PI * 2;
/** Slightly over one turn cuts false positives from wobbles / scroll. */
const REVOLUTIONS_NEEDED = 1.25;
const MIN_RADIUS_PX = 48;
const IDLE_RESET_MS = 1800;

/** Controls / chrome — observe only; never start a spin session from these. */
const IGNORE_SELECTOR = [
  'a',
  'button',
  'input',
  'textarea',
  'select',
  'label',
  'summary',
  '[role="button"]',
  '[data-discog-play]',
  '[data-stage-button]',
  '[data-stage-panel]',
  '[data-stage-panel-trigger]',
  '[data-jukebox]',
  '[data-player-dock]',
  '[data-track-rub-panel]',
  '[data-mute-control]',
  '[data-volume-control]',
  '[data-shuffle-toggle]',
  '[data-loop-toggle]',
  '[data-bg-play-toggle]',
  '.site-nav',
  '.discog__listen',
  '.discog__listen-links',
].join(', ');

type SpinSession = {
  pointerId: number;
  cx: number;
  cy: number;
  lastAngle: number | null;
  accumulated: number;
  idleTimer: ReturnType<typeof setTimeout> | null;
};

let session: SpinSession | null = null;

function isInfiniteStageActive(): boolean {
  const atmosphere = document.querySelector<HTMLElement>('[data-atmosphere]');
  return atmosphere?.dataset.activeId === INFINITE_STAGE_ID;
}

function clearIdle(s: SpinSession) {
  if (s.idleTimer) {
    clearTimeout(s.idleTimer);
    s.idleTimer = null;
  }
}

function armIdle(s: SpinSession) {
  clearIdle(s);
  s.idleTimer = setTimeout(() => {
    if (session === s) endSession();
  }, IDLE_RESET_MS);
}

function endSession() {
  if (!session) return;
  clearIdle(session);
  session = null;
}

function shouldIgnoreTarget(target: EventTarget | null): boolean {
  return target instanceof Element && Boolean(target.closest(IGNORE_SELECTOR));
}

function normalizeDelta(delta: number): number {
  // Wrap to (-π, π] so each sample is the shortest turn.
  let d = delta;
  while (d > Math.PI) d -= TAU;
  while (d <= -Math.PI) d += TAU;
  return d;
}

function unlockInfiniteSpin() {
  endSession();
  maybeUnlockAchievement({
    storageKey: ACHIEVEMENT_INFINITE_SPIN_STORAGE_KEY,
    title: 'Infinite',
    sub: 'You tried to spin infinitely on the Infinite track',
    glyph: 'infinite',
  });
}

function onPointerDown(event: PointerEvent) {
  if (event.button !== 0 && event.pointerType === 'mouse') return;
  if (!isInfiniteStageActive()) return;
  if (hasAchievement(ACHIEVEMENT_INFINITE_SPIN_STORAGE_KEY)) return;
  if (shouldIgnoreTarget(event.target)) return;

  endSession();
  session = {
    pointerId: event.pointerId,
    cx: event.clientX,
    cy: event.clientY,
    lastAngle: null,
    accumulated: 0,
    idleTimer: null,
  };
  armIdle(session);
}

function onPointerMove(event: PointerEvent) {
  if (!session || event.pointerId !== session.pointerId) return;
  if (!isInfiniteStageActive()) {
    endSession();
    return;
  }

  const dx = event.clientX - session.cx;
  const dy = event.clientY - session.cy;
  const radius = Math.hypot(dx, dy);
  if (radius < MIN_RADIUS_PX) {
    armIdle(session);
    return;
  }

  const angle = Math.atan2(dy, dx);
  if (session.lastAngle === null) {
    session.lastAngle = angle;
    armIdle(session);
    return;
  }

  session.accumulated += normalizeDelta(angle - session.lastAngle);
  session.lastAngle = angle;
  armIdle(session);

  if (Math.abs(session.accumulated) >= TAU * REVOLUTIONS_NEEDED) {
    unlockInfiniteSpin();
  }
}

function onPointerUp(event: PointerEvent) {
  if (!session || event.pointerId !== session.pointerId) return;
  // Brief grace so a multi-stroke circle can continue after a short lift.
  armIdle(session);
}

function onPointerCancel(event: PointerEvent) {
  if (!session || event.pointerId !== session.pointerId) return;
  endSession();
}

/** Bind circular-spin detection once per page (passive — does not steal UI). */
export function initInfiniteSpin(): void {
  if (typeof document === 'undefined') return;
  if (document.documentElement.dataset.infiniteSpinInit === '1') return;
  document.documentElement.dataset.infiniteSpinInit = '1';

  document.addEventListener('pointerdown', onPointerDown, { passive: true });
  document.addEventListener('pointermove', onPointerMove, { passive: true });
  document.addEventListener('pointerup', onPointerUp, { passive: true });
  document.addEventListener('pointercancel', onPointerCancel, { passive: true });
}
