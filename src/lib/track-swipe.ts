/**
 * Easter egg: drag a `[data-swipeable]` discography row (Taking Over) sideways. The row
 * follows the pointer with some resistance and springs back on release; pulling it far
 * enough either way unlocks the "Taking Over" achievement.
 */

import { unlockAchievement } from './achievement-toast';
import { matchesGestureIgnore, OUTBOUND_AND_PLAY_SELECTOR } from './gesture-ignore';

export const SWIPE_ACHIEVEMENT_ID = 'taking-over';
/** Horizontal travel before the drag claims the gesture (vertical wins → page scroll). */
const LOCK_PX = 10;
/** Pointer travel (not row offset) that counts as "taken over". */
export const TRIGGER_PX = 110;
const RESISTANCE = 0.55;
const MAX_SHIFT_PX = 150;
const SPRING_MS = 420;

type SwipeSession = {
  el: HTMLElement;
  pointerId: number;
  startX: number;
  startY: number;
  dx: number;
  locked: boolean;
};

let session: SwipeSession | null = null;
/** Eat the click that follows a drag, so the row does not expand. */
let suppressClickUntil = 0;

/** Row offset for a pointer travel: damped, capped, sign kept. */
export function swipeOffset(dx: number): number {
  const shift = Math.min(Math.abs(dx) * RESISTANCE, MAX_SHIFT_PX);
  return Math.sign(dx) * shift;
}

export function isSwipeTriggered(dx: number): boolean {
  return Math.abs(dx) >= TRIGGER_PX;
}

function setOffset(el: HTMLElement, px: number) {
  el.style.transform = px === 0 ? '' : `translateX(${px.toFixed(1)}px)`;
}

function springBack(el: HTMLElement) {
  el.classList.remove('is-swiping');
  el.style.transition = `transform ${SPRING_MS}ms cubic-bezier(0.34, 1.56, 0.64, 1)`;
  setOffset(el, 0);
  window.setTimeout(() => {
    if (session?.el !== el) el.style.transition = '';
  }, SPRING_MS);
}

function onPointerDown(event: PointerEvent) {
  if (event.pointerType === 'mouse' && event.button !== 0) return;
  const target = event.target;
  if (!(target instanceof Element)) return;
  // Outbound / play controls keep their clicks; the row toggle may start a drag.
  if (matchesGestureIgnore(target, OUTBOUND_AND_PLAY_SELECTOR)) return;
  const el = target.closest<HTMLElement>('[data-swipeable]');
  if (!el) return;

  session = {
    el,
    pointerId: event.pointerId,
    startX: event.clientX,
    startY: event.clientY,
    dx: 0,
    locked: false,
  };
}

function onPointerMove(event: PointerEvent) {
  const s = session;
  if (!s || event.pointerId !== s.pointerId) return;
  const dx = event.clientX - s.startX;
  const dy = event.clientY - s.startY;

  if (!s.locked) {
    if (Math.abs(dx) < LOCK_PX && Math.abs(dy) < LOCK_PX) return;
    if (Math.abs(dy) > Math.abs(dx)) {
      session = null; // vertical intent — let the page scroll
      return;
    }
    s.locked = true;
    s.el.style.transition = '';
    s.el.classList.add('is-swiping');
    try {
      s.el.setPointerCapture(s.pointerId);
    } catch {
      /* ignore */
    }
  }

  if (event.cancelable) event.preventDefault();
  s.dx = dx;
  setOffset(s.el, swipeOffset(dx));
}

function finish(event: PointerEvent, cancelled: boolean) {
  const s = session;
  if (!s || event.pointerId !== s.pointerId) return;
  session = null;
  if (!s.locked) return;

  suppressClickUntil = performance.now() + 400;
  try {
    s.el.releasePointerCapture(s.pointerId);
  } catch {
    /* already released */
  }
  springBack(s.el);
  if (!cancelled && isSwipeTriggered(s.dx)) unlockAchievement(SWIPE_ACHIEVEMENT_ID);
}

function onClick(event: MouseEvent) {
  if (performance.now() >= suppressClickUntil) return;
  const target = event.target;
  if (!(target instanceof Element) || !target.closest('[data-swipeable]')) return;
  event.preventDefault();
  event.stopPropagation();
}

/** Bind the gesture once per page. */
export function initTrackSwipe(): void {
  if (typeof document === 'undefined') return;
  if (document.documentElement.dataset.trackSwipeInit === '1') return;
  document.documentElement.dataset.trackSwipeInit = '1';

  document.addEventListener('pointerdown', onPointerDown, { passive: true });
  document.addEventListener('pointermove', onPointerMove, { passive: false });
  document.addEventListener('pointerup', (event) => finish(event, false), { passive: true });
  document.addEventListener('pointercancel', (event) => finish(event, true), { passive: true });
  document.addEventListener('click', onClick, true);
}
