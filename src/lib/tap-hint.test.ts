import { describe, expect, it } from 'vitest';
import { createTapHint } from './tap-hint';

function tap(hint: ReturnType<typeof createTapHint>, t: number, move = 0) {
  hint.down(100, 100, t);
  return hint.up(100 + move, 100, t + 40);
}

describe('createTapHint', () => {
  it('fires on the third quick tap', () => {
    const hint = createTapHint();
    expect(tap(hint, 0)).toBe(false);
    expect(tap(hint, 300)).toBe(false);
    expect(tap(hint, 600)).toBe(true);
  });

  it('does not fire when taps are spread beyond the window', () => {
    const hint = createTapHint();
    expect(tap(hint, 0)).toBe(false);
    expect(tap(hint, 900)).toBe(false);
    expect(tap(hint, 1800)).toBe(false);
  });

  it('keeps counting with a sliding window', () => {
    const hint = createTapHint();
    tap(hint, 0);
    tap(hint, 1200);
    // First tap has dropped out of the 1.5 s window, so this is only the second.
    expect(tap(hint, 1700)).toBe(false);
    expect(tap(hint, 1900)).toBe(true);
  });

  it('ignores drags beyond the slop', () => {
    const hint = createTapHint();
    tap(hint, 0);
    tap(hint, 200);
    expect(tap(hint, 400, 25)).toBe(false);
  });

  it('ignores an up without a matching down', () => {
    const hint = createTapHint();
    tap(hint, 0);
    tap(hint, 200);
    expect(hint.up(100, 100, 400)).toBe(false);
  });

  it('resets after firing and on reset()', () => {
    const hint = createTapHint();
    tap(hint, 0);
    tap(hint, 100);
    expect(tap(hint, 200)).toBe(true);
    expect(tap(hint, 300)).toBe(false);
    hint.reset();
    expect(tap(hint, 400)).toBe(false);
    expect(tap(hint, 500)).toBe(false);
  });
});
