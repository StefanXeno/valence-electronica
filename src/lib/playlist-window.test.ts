import { describe, expect, it } from 'vitest';
import {
  playlistWindow,
  shouldRewindow,
  type WindowIndex,
} from './playlist-window';

function indicesOf(n: number, i: number): [WindowIndex, WindowIndex, WindowIndex] {
  return playlistWindow(n, i).indices;
}

describe('playlistWindow', () => {
  it('puts the first track (including n === 1) in the top slot', () => {
    const fourFirst = playlistWindow(4, 0);
    expect(fourFirst.slot).toBe('top');
    expect(fourFirst.indices).toEqual([0, 1, 2]);

    const solo = playlistWindow(1, 0);
    expect(solo.slot).toBe('top');
    expect(solo.indices).toEqual([0, 'placeholder', 'placeholder']);
    expect(solo.n).toBe(1);
    expect(solo.currentIndex).toBe(0);
  });

  it('puts the last track (when not first) in the bottom slot', () => {
    const last = playlistWindow(4, 3);
    expect(last.slot).toBe('bottom');
    expect(last.indices).toEqual([1, 2, 3]);

    const twoLast = playlistWindow(2, 1);
    expect(twoLast.slot).toBe('bottom');
    expect(twoLast.indices).toEqual(['placeholder', 0, 1]);
  });

  it('puts a middle current in the middle slot', () => {
    const mid = playlistWindow(4, 1);
    expect(mid.slot).toBe('middle');
    expect(mid.indices).toEqual([0, 1, 2]);

    const laterMid = playlistWindow(4, 2);
    expect(laterMid.slot).toBe('middle');
    expect(laterMid.indices).toEqual([1, 2, 3]);
  });

  it('pads n === 2 first-current with a trailing placeholder', () => {
    expect(indicesOf(2, 0)).toEqual([0, 1, 'placeholder']);
    expect(playlistWindow(2, 0).slot).toBe('top');
  });

  it('never duplicates a real index to fill a slot', () => {
    const windows = [playlistWindow(1, 0), playlistWindow(2, 0), playlistWindow(2, 1)];
    for (const win of windows) {
      const reals = win.indices.filter((idx): idx is number => idx !== 'placeholder');
      expect(new Set(reals).size).toBe(reals.length);
    }
  });

  it('marks out-of-range window indices as placeholders', () => {
    expect(indicesOf(0, 0)).toEqual(['placeholder', 'placeholder', 'placeholder']);
    expect(indicesOf(1, 0).filter((idx) => idx === 'placeholder')).toHaveLength(2);
  });
});

describe('shouldRewindow', () => {
  it('is false when the new current already intersects the visible window', () => {
    expect(shouldRewindow([0, 1, 2], 1)).toBe(false);
    expect(shouldRewindow([1, 2, 3], 3)).toBe(false);
  });

  it('is true when the new current is outside the visible window', () => {
    expect(shouldRewindow([0, 1, 2], 3)).toBe(true);
    expect(shouldRewindow([1, 2, 3], 0)).toBe(true);
    expect(shouldRewindow([], 0)).toBe(true);
  });
});
