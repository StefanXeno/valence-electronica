/**
 * Counts quick taps on empty stage for the hidden player hint (035). Pure — the caller
 * feeds pointer positions and timestamps.
 */

export type TapHintOptions = {
  /** Max time from the first to the last counted tap. */
  windowMs: number;
  /** Taps needed to fire. */
  taps: number;
  /** Max pointer travel between down and up for a tap (px). */
  slopPx: number;
};

export type TapHint = {
  down(x: number, y: number, t: number): void;
  /** Returns true when this tap completes the sequence (counter resets). */
  up(x: number, y: number, t: number): boolean;
  reset(): void;
};

export const TAP_HINT_DEFAULTS: TapHintOptions = { windowMs: 1500, taps: 3, slopPx: 10 };

export function createTapHint(options: TapHintOptions = TAP_HINT_DEFAULTS): TapHint {
  let start: { x: number; y: number } | null = null;
  let stamps: number[] = [];

  return {
    down(x, y) {
      start = { x, y };
    },
    up(x, y, t) {
      const from = start;
      start = null;
      if (!from || Math.hypot(x - from.x, y - from.y) >= options.slopPx) return false;

      stamps = [...stamps, t].filter((stamp) => t - stamp <= options.windowMs);
      if (stamps.length < options.taps) return false;
      stamps = [];
      return true;
    },
    reset() {
      start = null;
      stamps = [];
    },
  };
}
