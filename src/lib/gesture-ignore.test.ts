import { describe, expect, it } from 'vitest';
import {
  CHROME_SELECTOR,
  INTERACTIVE_SELECTOR,
  joinSelectors,
  matchesGestureIgnore,
  OUTBOUND_AND_PLAY_SELECTOR,
  STAGE_GESTURE_IGNORE_SELECTOR,
} from './gesture-ignore';

const parts = (selector: string) => selector.split(',').map((part) => part.trim());

describe('gesture ignore selectors', () => {
  it('layers outbound/play ⊂ interactive ⊂ stage gestures', () => {
    for (const part of parts(OUTBOUND_AND_PLAY_SELECTOR)) {
      expect(parts(INTERACTIVE_SELECTOR)).toContain(part);
    }
    for (const part of [...parts(INTERACTIVE_SELECTOR), ...parts(CHROME_SELECTOR)]) {
      expect(parts(STAGE_GESTURE_IGNORE_SELECTOR)).toContain(part);
    }
  });

  it('keeps buttons out of the outbound/play layer so rubs can start on row toggles', () => {
    expect(parts(OUTBOUND_AND_PLAY_SELECTOR)).not.toContain('button');
  });

  it('covers the stage player and the overlays', () => {
    expect(parts(STAGE_GESTURE_IGNORE_SELECTOR)).toEqual(
      expect.arrayContaining(['[data-stage-player]', '#legal-overlay', '[data-site-nav]']),
    );
  });

  it('has no empty or duplicate parts', () => {
    const all = parts(STAGE_GESTURE_IGNORE_SELECTOR);
    expect(all.every(Boolean)).toBe(true);
    expect(new Set(all).size).toBe(all.length);
  });

  it('joinSelectors drops empty parts', () => {
    expect(joinSelectors('a', undefined, ' ', '[data-x]')).toBe('a, [data-x]');
  });

  it('matchesGestureIgnore rejects non-elements', () => {
    expect(matchesGestureIgnore(null, 'a')).toBe(false);
  });
});
