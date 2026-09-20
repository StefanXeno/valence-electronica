/**
 * Easter egg: circular pointer / finger spin while the Infinite stage is active.
 * ~0.9 revolutions around the down-point unlocks a one-shot achievement toast.
 * Tuned to be forgiving — imperfect circles / wobble still count.
 */

import { hasAchievement, maybeUnlockAchievement } from './achievement-toast';

/** Stage / jukebox id for the Infinite track (not the steel-slate theme pack id). */
const INFINITE_STAGE_ID = 'infinite';

export const ACHIEVEMENT_INFINITE_SPIN_STORAGE_KEY = 've-achievement-infinite-spin';

const TAU = Math.PI * 2;
/** Just under one full turn — easy easter egg, not a precision test. */
const REVOLUTIONS_NEEDED = 0.9;
/** Floor so pure cursor jitter near the down-point cannot unlock. */
const MIN_RADIUS_PX = 28;
/** Longer window so a slightly interrupted circle can still finish. */
const IDLE_RESET_MS = 3200;
/** Ignore micro pointer jitter before sampling a new angle. */
const MOVE_THRESHOLD_PX = 5;
/** Tiny angular ticks (noise) never add or subtract progress. */
const ANGLE_DEADZONE_RAD = 0.04; // ~2.3°
/**
 * Opposite-direction ticks are absorbed (wobble) without subtracting from
 * accumulated progress. Only a sustained reverse past this cancels the gesture.
 */
const REVERSE_CANCEL_RAD = Math.PI * 0.65; // ~117° clear reverse → reset

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
  lastX: number;
  lastY: number;
  lastAngle: number | null;
  /** +1 / -1 once a meaningful direction is established; 0 until then. */
  direction: number;
  accumulated: number;
  /** How much reverse angle has been absorbed since last forward progress. */
  reverseDebt: number;
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
    lastX: event.clientX,
    lastY: event.clientY,
    lastAngle: null,
    direction: 0,
    accumulated: 0,
    reverseDebt: 0,
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

  // Pixel deadzone — tiny twitches never sample a new angle.
  const moveDx = event.clientX - session.lastX;
  const moveDy = event.clientY - session.lastY;
  if (Math.hypot(moveDx, moveDy) < MOVE_THRESHOLD_PX) {
    armIdle(session);
    return;
  }
  session.lastX = event.clientX;
  session.lastY = event.clientY;

  const angle = Math.atan2(dy, dx);
  if (session.lastAngle === null) {
    session.lastAngle = angle;
    armIdle(session);
    return;
  }

  const delta = normalizeDelta(angle - session.lastAngle);
  session.lastAngle = angle;

  // Angular deadzone — noise neither adds nor subtracts.
  if (Math.abs(delta) < ANGLE_DEADZONE_RAD) {
    armIdle(session);
    return;
  }

  if (session.direction === 0) {
    session.direction = Math.sign(delta);
    session.accumulated += delta;
    session.reverseDebt = 0;
  } else if (Math.sign(delta) === session.direction) {
    session.accumulated += delta;
    session.reverseDebt = 0;
  } else {
    // Opposite tick: absorb wobble; only clear cancel resets progress.
    session.reverseDebt += Math.abs(delta);
    if (session.reverseDebt >= REVERSE_CANCEL_RAD) {
      endSession();
      return;
    }
    // Below cancel: ignore — do not subtract from accumulated.
  }

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
