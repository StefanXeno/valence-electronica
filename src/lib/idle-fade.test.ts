import { describe, expect, it } from 'vitest';
import { distanceToRect, parseSecondsParam, proximityOpacity } from './idle-fade';

describe('parseSecondsParam', () => {
  it('turns positive seconds into milliseconds', () => {
    expect(parseSecondsParam('6')).toBe(6000);
    expect(parseSecondsParam('2.5')).toBe(2500);
  });

  it('ignores missing, empty, zero, negative and junk values', () => {
    for (const value of [null, '', ' ', '0', '-3', 'abc', 'Infinity']) {
      expect(parseSecondsParam(value)).toBeUndefined();
    }
  });
});

describe('distanceToRect', () => {
  const rect = { left: 10, top: 10, right: 30, bottom: 30 };

  it('is 0 inside the rect', () => {
    expect(distanceToRect(20, 20, rect)).toBe(0);
  });

  it('measures to the nearest edge or corner', () => {
    expect(distanceToRect(40, 20, rect)).toBe(10);
    expect(distanceToRect(33, 34, rect)).toBe(5);
  });
});

describe('proximityOpacity', () => {
  it('is fully visible when near and invisible when far', () => {
    expect(proximityOpacity(0, 24, 260)).toBe(1);
    expect(proximityOpacity(24, 24, 260)).toBe(1);
    expect(proximityOpacity(260, 24, 260)).toBe(0);
    expect(proximityOpacity(900, 24, 260)).toBe(0);
  });

  it('rises as the cursor gets closer', () => {
    const far = proximityOpacity(200, 24, 260);
    const mid = proximityOpacity(142, 24, 260);
    const close = proximityOpacity(60, 24, 260);
    expect(mid).toBeCloseTo(0.5);
    expect(far).toBeLessThan(mid);
    expect(close).toBeGreaterThan(mid);
  });
});
