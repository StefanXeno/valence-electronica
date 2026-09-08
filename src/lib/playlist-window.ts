/** FR-005 / FR-015 / FR-016 — three-slot playlist window (no DOM). */

export type PlaylistSlot = 'top' | 'middle' | 'bottom';

/** Real theme-track index in `0 … n-1`, or a padded inert slot. */
export type WindowIndex = number | 'placeholder';

export interface PlaylistWindow {
  n: number;
  currentIndex: number;
  slot: PlaylistSlot;
  indices: [WindowIndex, WindowIndex, WindowIndex];
}

function clampIndex(n: number, i: number): number {
  if (n <= 0) return 0;
  if (!Number.isFinite(i)) return 0;
  return Math.min(Math.max(0, Math.trunc(i)), n - 1);
}

function asIndex(n: number, value: number): WindowIndex {
  if (n <= 0 || value < 0 || value > n - 1) return 'placeholder';
  return value;
}

/**
 * Initial / re-window around current index `i` in a newest-first list of `n`.
 * Missing indices are placeholders — never duplicated reals.
 */
export function playlistWindow(n: number, currentIndex: number): PlaylistWindow {
  const count = Number.isFinite(n) && n > 0 ? Math.trunc(n) : 0;
  const i = clampIndex(count, currentIndex);

  if (count === 0) {
    return {
      n: 0,
      currentIndex: 0,
      slot: 'top',
      indices: ['placeholder', 'placeholder', 'placeholder'],
    };
  }

  // First (including n === 1): current sits TOP.
  if (i === 0) {
    return {
      n: count,
      currentIndex: i,
      slot: 'top',
      indices: [asIndex(count, i), asIndex(count, i + 1), asIndex(count, i + 2)],
    };
  }

  // Last and not first: current sits BOTTOM.
  if (i === count - 1) {
    return {
      n: count,
      currentIndex: i,
      slot: 'bottom',
      indices: [asIndex(count, i - 2), asIndex(count, i - 1), asIndex(count, i)],
    };
  }

  // Neither first nor last: current sits MIDDLE.
  return {
    n: count,
    currentIndex: i,
    slot: 'middle',
    indices: [asIndex(count, i - 1), asIndex(count, i), asIndex(count, i + 1)],
  };
}

/** Re-apply FR-005 only when the new current is outside the visible three-row window. */
export function shouldRewindow(
  visibleRealIndices: readonly number[],
  newCurrentIndex: number,
): boolean {
  if (!Number.isFinite(newCurrentIndex)) return true;
  return !visibleRealIndices.includes(newCurrentIndex);
}
