import { describe, expect, it } from 'vitest';
import { cubicBezier, mixRgba, parseCssColor, rgbaToCss, stepsEnd } from './theme-tween';

describe('parseCssColor', () => {
  it('reads comma and space syntax with optional alpha', () => {
    expect(parseCssColor('rgb(10, 12, 4)')).toEqual([10, 12, 4, 1]);
    expect(parseCssColor('rgba(20, 24, 8, 0.82)')).toEqual([20, 24, 8, 0.82]);
    expect(parseCssColor('rgb(8 10 2 / 72%)')).toEqual([8, 10, 2, 0.72]);
  });

  it('rejects anything else', () => {
    expect(parseCssColor('')).toBeNull();
    expect(parseCssColor('#fff')).toBeNull();
  });
});

describe('mixRgba', () => {
  it('interpolates channels and alpha', () => {
    expect(mixRgba([0, 0, 0, 0], [200, 100, 50, 1], 0.5)).toBe('rgba(100, 50, 25, 0.5)');
    expect(mixRgba([1, 2, 3, 0.4], [9, 9, 9, 1], 0)).toBe(rgbaToCss([1, 2, 3, 0.4]));
  });
});

describe('easings', () => {
  it('cubicBezier hits the ends and is symmetric for 0.45,0,0.55,1', () => {
    const ease = cubicBezier(0.45, 0, 0.55, 1);
    expect(ease(0)).toBe(0);
    expect(ease(1)).toBe(1);
    expect(ease(0.5)).toBeCloseTo(0.5, 3);
    expect(ease(0.25)).toBeLessThan(0.25);
  });

  it('stepsEnd(4) holds the start and jumps in quarters', () => {
    const step = stepsEnd(4);
    expect(step(0.1)).toBe(0);
    expect(step(0.3)).toBe(0.25);
    expect(step(0.99)).toBe(0.75);
    expect(step(1)).toBe(1);
  });
});
