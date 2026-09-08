import { describe, expect, it } from 'vitest';
import {
  HANDLE_DOUBLE_TAP_MS,
  HANDLE_TAP_MAX_MS,
  HANDLE_TAP_SLOP_PX,
  consumeHandlePointerTap,
  isHandleDoubleTapEcho,
  isHandlePointerTap,
} from './player-handle-tap';

describe('isHandleDoubleTapEcho', () => {
  it('treats a second tap inside the window as the extra half of a double-tap', () => {
    expect(isHandleDoubleTapEcho(HANDLE_DOUBLE_TAP_MS, 0)).toBe(false);
    expect(isHandleDoubleTapEcho(HANDLE_DOUBLE_TAP_MS - 1, 0)).toBe(true);
    expect(isHandleDoubleTapEcho(0, 0)).toBe(true);
    expect(isHandleDoubleTapEcho(200, 0, HANDLE_DOUBLE_TAP_MS)).toBe(true);
  });

  it('allows a later single-tap to toggle again', () => {
    expect(isHandleDoubleTapEcho(HANDLE_DOUBLE_TAP_MS, 0)).toBe(false);
    expect(isHandleDoubleTapEcho(1000, 0)).toBe(false);
  });
});

describe('isHandlePointerTap', () => {
  it('accepts a short press inside slop', () => {
    expect(isHandlePointerTap(0, 80)).toBe(true);
    expect(isHandlePointerTap(HANDLE_TAP_SLOP_PX - 1, HANDLE_TAP_MAX_MS)).toBe(true);
  });

  it('rejects drag travel, holds, and negative duration', () => {
    expect(isHandlePointerTap(HANDLE_TAP_SLOP_PX, 80)).toBe(false);
    expect(isHandlePointerTap(0, HANDLE_TAP_MAX_MS + 1)).toBe(false);
    expect(isHandlePointerTap(0, -1)).toBe(false);
  });
});

describe('consumeHandlePointerTap', () => {
  it('records the first tap and pairs the second inside the window', () => {
    const first = consumeHandlePointerTap(100, null);
    expect(first).toEqual({ paired: false, nextLastPointerTapMs: 100 });

    const second = consumeHandlePointerTap(100 + HANDLE_DOUBLE_TAP_MS - 1, first.nextLastPointerTapMs);
    expect(second).toEqual({ paired: true, nextLastPointerTapMs: null });
  });

  it('starts a new pair after the window', () => {
    const late = consumeHandlePointerTap(100 + HANDLE_DOUBLE_TAP_MS, 100);
    expect(late).toEqual({ paired: false, nextLastPointerTapMs: 100 + HANDLE_DOUBLE_TAP_MS });
  });
});
