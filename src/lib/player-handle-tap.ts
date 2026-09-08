/** Pair two pointer taps, and ignore a click/echo that would undo a toggle. */
export const HANDLE_DOUBLE_TAP_MS = 450;

/** Same as dock `TAP_SLOP_PX` — finger travel still counts as a tap, not a drag. */
export const HANDLE_TAP_SLOP_PX = 8;

/** Press longer than this is a hold, not a tap. */
export const HANDLE_TAP_MAX_MS = 350;

/** True when this tap lands inside the double-tap window after a toggle. */
export function isHandleDoubleTapEcho(
  nowMs: number,
  lastToggleMs: number,
  windowMs = HANDLE_DOUBLE_TAP_MS,
): boolean {
  const dt = nowMs - lastToggleMs;
  return dt >= 0 && dt < windowMs;
}

/** Pointerup with little movement and a short press — a tap, not a drag/hold. */
export function isHandlePointerTap(
  travelPx: number,
  durationMs: number,
  slopPx = HANDLE_TAP_SLOP_PX,
  maxMs = HANDLE_TAP_MAX_MS,
): boolean {
  return travelPx < slopPx && durationMs >= 0 && durationMs <= maxMs;
}

/**
 * First tap records the time. Second tap inside the window consumes the pair
 * (`paired: true`) so the dock can toggle even when `click` never fires.
 */
export function consumeHandlePointerTap(
  nowMs: number,
  lastPointerTapMs: number | null,
  windowMs = HANDLE_DOUBLE_TAP_MS,
): { paired: boolean; nextLastPointerTapMs: number | null } {
  if (lastPointerTapMs != null) {
    const dt = nowMs - lastPointerTapMs;
    if (dt >= 0 && dt < windowMs) {
      return { paired: true, nextLastPointerTapMs: null };
    }
  }
  return { paired: false, nextLastPointerTapMs: nowMs };
}
