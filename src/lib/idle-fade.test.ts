import { describe, expect, it } from 'vitest';
import { parseSecondsParam } from './idle-fade';

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
