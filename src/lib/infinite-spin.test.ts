import { describe, expect, it } from 'vitest';
import { createSpinTracker } from './infinite-spin';

/** Feed a circular arc starting on the circle's edge (as a real drawing does). */
function drawArc(
  tracker: ReturnType<typeof createSpinTracker>,
  turns: number,
  { radius = 60, wobble = 0, from = 0 } = {},
): boolean {
  let done = false;
  const steps = Math.ceil(turns * 90);
  for (let i = 0; i <= steps; i++) {
    const a = from + (i / 90) * Math.PI * 2;
    const r = radius + (i % 2 ? wobble : -wobble);
    done = tracker.addPoint(200 + Math.cos(a) * r, 200 + Math.sin(a) * r) || done;
  }
  return done;
}

describe('createSpinTracker', () => {
  it('unlocks on a single circle started from its edge', () => {
    expect(drawArc(createSpinTracker(), 1)).toBe(true);
  });

  it('unlocks on a wobbly circle', () => {
    expect(drawArc(createSpinTracker(), 0.85, { wobble: 4 })).toBe(true);
  });

  it('does not unlock on half a circle', () => {
    expect(drawArc(createSpinTracker(), 0.5)).toBe(false);
  });

  it('ignores tiny circles', () => {
    expect(drawArc(createSpinTracker(), 2, { radius: 12 })).toBe(false);
  });

  it('ignores straight lines and back-and-forth scribbles', () => {
    const t = createSpinTracker();
    for (let i = 0; i < 20; i++) {
      t.addPoint(100, 100);
      t.addPoint(300, 300);
    }
    expect(t.isComplete()).toBe(false);
  });

  it('keeps progress across a lift', () => {
    const t = createSpinTracker();
    expect(drawArc(t, 0.45)).toBe(false);
    t.newStroke();
    expect(drawArc(t, 0.45, { from: Math.PI })).toBe(true);
  });
});
