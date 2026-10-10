/**
 * Easter egg: circular pointer / finger spin while the Infinite stage is active.
 * ~0.75 of a drawn circle unlocks a one-shot achievement toast.
 *
 * Progress is the path's own turning (sum of heading changes), not the angle
 * around the press point: a circle drawn from its edge only sweeps half a turn
 * around that point, which made the old detector demand nearly two circles.
 * Tuned to be forgiving — wobbly, egg-shaped, or multi-stroke circles still count.
 */

import { unlockAchievement } from './achievement-toast';
import { shouldToast } from './achievements';
import { matchesGestureIgnore, STAGE_GESTURE_IGNORE_SELECTOR } from './gesture-ignore';

/** Stage / jukebox id for the Infinite track (not the steel-slate theme pack id). */
const INFINITE_STAGE_ID = 'infinite';

const TAU = Math.PI * 2;
/** Three quarters of a circle — easy easter egg, not a precision test. */
export const REVOLUTIONS_NEEDED = 0.75;
/** Both bounding-box sides must reach this, so jitter or a straight line never unlocks. */
export const MIN_EXTENT_PX = 40;
/** Distance between heading samples — smooths out pointer noise. */
const SAMPLE_STEP_PX = 6;
/** Sharper bends are a back-and-forth scribble, not curving — they add nothing. */
const MAX_TURN_RAD = Math.PI * 0.8;
/** Window to keep going (also across a short lift) before progress resets. */
const IDLE_RESET_MS = 3200;

function normalizeDelta(delta: number): number {
  // Wrap to (-π, π] so each sample is the shortest turn.
  let d = delta;
  while (d > Math.PI) d -= TAU;
  while (d <= -Math.PI) d += TAU;
  return d;
}

/** Pure path-turning tracker (no DOM) — feed points, ask whether a circle was drawn. */
export function createSpinTracker() {
  let lastX: number | null = null;
  let lastY: number | null = null;
  let lastHeading: number | null = null;
  let turned = 0;
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;

  return {
    /** Start a new stroke: keep progress, but don't link headings across the lift. */
    newStroke() {
      lastX = null;
      lastY = null;
      lastHeading = null;
    },
    /** Add a pointer sample; returns true once enough of a circle has been drawn. */
    addPoint(x: number, y: number): boolean {
      minX = Math.min(minX, x);
      maxX = Math.max(maxX, x);
      minY = Math.min(minY, y);
      maxY = Math.max(maxY, y);

      if (lastX === null || lastY === null) {
        lastX = x;
        lastY = y;
        return false;
      }
      const dx = x - lastX;
      const dy = y - lastY;
      if (Math.hypot(dx, dy) < SAMPLE_STEP_PX) return false;
      lastX = x;
      lastY = y;

      const heading = Math.atan2(dy, dx);
      if (lastHeading !== null) {
        const delta = normalizeDelta(heading - lastHeading);
        if (Math.abs(delta) < MAX_TURN_RAD) turned += delta;
      }
      lastHeading = heading;

      return this.isComplete();
    },
    isComplete(): boolean {
      const bigEnough = maxX - minX >= MIN_EXTENT_PX && maxY - minY >= MIN_EXTENT_PX;
      return bigEnough && Math.abs(turned) >= TAU * REVOLUTIONS_NEEDED;
    },
  };
}

type SpinSession = {
  pointerId: number;
  tracker: ReturnType<typeof createSpinTracker>;
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
  return matchesGestureIgnore(target, STAGE_GESTURE_IGNORE_SELECTOR);
}

function unlockInfiniteSpin() {
  endSession();
  unlockAchievement('infinite-spin');
}

function onPointerDown(event: PointerEvent) {
  if (event.button !== 0 && event.pointerType === 'mouse') return;
  if (!isInfiniteStageActive()) return;
  if (!shouldToast('infinite-spin')) return;
  if (shouldIgnoreTarget(event.target)) return;

  if (session) {
    // Continue a circle after a short lift instead of starting over.
    session.pointerId = event.pointerId;
    session.tracker.newStroke();
  } else {
    session = { pointerId: event.pointerId, tracker: createSpinTracker(), idleTimer: null };
  }
  session.tracker.addPoint(event.clientX, event.clientY);
  armIdle(session);
}

function onPointerMove(event: PointerEvent) {
  if (!session || event.pointerId !== session.pointerId) return;
  if (!isInfiniteStageActive()) {
    endSession();
    return;
  }

  armIdle(session);
  if (session.tracker.addPoint(event.clientX, event.clientY)) {
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
