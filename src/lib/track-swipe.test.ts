import { describe, expect, it } from 'vitest';
import { isSwipeTriggered, swipeOffset, TRIGGER_PX } from './track-swipe';

describe('swipeOffset', () => {
  it('damps the pointer travel and keeps its direction', () => {
    expect(swipeOffset(100)).toBeCloseTo(55);
    expect(swipeOffset(-100)).toBeCloseTo(-55);
    expect(swipeOffset(0)).toBe(0);
  });

  it('caps how far the row can travel', () => {
    expect(swipeOffset(5000)).toBe(150);
    expect(swipeOffset(-5000)).toBe(-150);
  });
});

describe('isSwipeTriggered', () => {
  it('fires in either direction once the travel is long enough', () => {
    expect(isSwipeTriggered(TRIGGER_PX)).toBe(true);
    expect(isSwipeTriggered(-TRIGGER_PX)).toBe(true);
    expect(isSwipeTriggered(TRIGGER_PX - 1)).toBe(false);
  });
});
