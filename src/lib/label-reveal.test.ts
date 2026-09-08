import { describe, expect, it } from 'vitest';
import { hudLabelPosition } from './label-reveal';

const floater = { width: 180, height: 28 };
const viewport = { width: 1280, height: 800 };

describe('hudLabelPosition', () => {
  it('places end to the right of the title, vertically centered', () => {
    const placed = hudLabelPosition({
      trigger: { left: 80, top: 600, width: 160, height: 20 },
      floater,
      anchor: 'end',
      viewport,
    });
    expect(placed.left).toBe(80 + 160 + 6);
    expect(placed.top).toBe(610);
    expect(placed.transform).toBe('translate(0, -50%)');
  });

  it('flips end inward when the right side would leave the viewport', () => {
    const placed = hudLabelPosition({
      trigger: { left: 1100, top: 600, width: 160, height: 20 },
      floater,
      anchor: 'end',
      viewport,
    });
    expect(placed.left).toBe(1100 - 6 - 180);
    expect(placed.left).toBeGreaterThanOrEqual(8);
  });

  it('shifts a centered above label off the left dock so CU stays on screen', () => {
    const placed = hudLabelPosition({
      trigger: { left: 16, top: 700, width: 40, height: 40 },
      floater,
      anchor: 'above',
      viewport,
    });
    expect(placed.left - floater.width / 2).toBeGreaterThanOrEqual(8);
    expect(placed.transform).toBe('translate(-50%, -100%)');
  });
});
