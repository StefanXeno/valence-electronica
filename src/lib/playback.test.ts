import { describe, expect, it } from 'vitest';
import { dwellSeconds, NO_AUDIO_DWELL_SEC, pickOtherId } from './playback';

describe('dwellSeconds', () => {
  it('returns video duration for audio entries with known duration', () => {
    expect(dwellSeconds({ hasAudio: true }, 12.5)).toBe(12.5);
  });

  it('falls back to 45s for audio without duration', () => {
    expect(dwellSeconds({ hasAudio: true }, null)).toBe(NO_AUDIO_DWELL_SEC);
    expect(dwellSeconds({ hasAudio: true }, undefined)).toBe(NO_AUDIO_DWELL_SEC);
    expect(dwellSeconds({ hasAudio: true }, 0)).toBe(NO_AUDIO_DWELL_SEC);
  });

  it('waits several passes when asked (landing theme)', () => {
    expect(dwellSeconds({ hasAudio: true }, 25.6, 5)).toBeCloseTo(128);
  });

  it('counts the pass that is playing, so the hop lands on a loop boundary', () => {
    expect(dwellSeconds({ hasAudio: true }, 25.6, 1, 10)).toBeCloseTo(15.6);
    expect(dwellSeconds({ hasAudio: true }, 25.6, 5, 10)).toBeCloseTo(118);
  });

  it('ignores missing or invalid positions and loop counts below one', () => {
    expect(dwellSeconds({ hasAudio: true }, 20, 1, Number.NaN)).toBe(20);
    expect(dwellSeconds({ hasAudio: true }, 20, 0)).toBe(20);
  });

  it('returns 45s for no-audio entries regardless of duration', () => {
    expect(dwellSeconds({ hasAudio: false }, 120)).toBe(NO_AUDIO_DWELL_SEC);
    expect(dwellSeconds({ hasAudio: false }, null)).toBe(NO_AUDIO_DWELL_SEC);
  });
});

describe('pickOtherId', () => {
  const ids = ['a', 'b', 'c'];

  it('never returns the current id', () => {
    for (let i = 0; i < 30; i += 1) {
      expect(pickOtherId(ids, 'b')).not.toBe('b');
    }
  });

  it('returns undefined when no other ids exist', () => {
    expect(pickOtherId(['solo'], 'solo')).toBeUndefined();
    expect(pickOtherId([], 'solo')).toBeUndefined();
  });

  it('respects an allow-list predicate', () => {
    for (let i = 0; i < 30; i += 1) {
      const next = pickOtherId(ids, 'a', (id) => id === 'c');
      expect(next).toBe('c');
    }
  });

  it('returns undefined when no allowed alternatives exist', () => {
    expect(pickOtherId(ids, 'b', (id) => id === 'b')).toBeUndefined();
  });
});
