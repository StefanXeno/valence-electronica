import { describe, expect, it } from 'vitest';
import { clampTransitionGlitchMs } from './glitch';
import {
  preferLeafSurfaces,
  qualifiesAsAmbientGlitchTarget,
  qualifiesAsWildAmbientGlitchTarget,
} from './glitch-ambient';

describe('clampTransitionGlitchMs', () => {
  it('covers phone 320 and playlist 380 windows', () => {
    expect(clampTransitionGlitchMs(320)).toBe(320);
    expect(clampTransitionGlitchMs(380)).toBe(380);
    expect(clampTransitionGlitchMs(560)).toBe(560);
  });

  it('stays inside the soft one-shot bar', () => {
    expect(clampTransitionGlitchMs(120)).toBe(280);
    expect(clampTransitionGlitchMs(2000)).toBe(900);
  });
});

describe('qualifiesAsAmbientGlitchTarget', () => {
  const yes = {
    glitchHit: true,
    interactive: true,
    disabled: false,
    hidden: false,
    placeholder: false,
    tagline: false,
    slider: false,
  };

  it('accepts a clickable glitch-hit control', () => {
    expect(qualifiesAsAmbientGlitchTarget(yes)).toBe(true);
  });

  it('rejects static copy without an interactive role', () => {
    expect(qualifiesAsAmbientGlitchTarget({ ...yes, interactive: false })).toBe(false);
  });

  it('rejects elements that are not glitch-hit', () => {
    expect(qualifiesAsAmbientGlitchTarget({ ...yes, glitchHit: false })).toBe(false);
  });

  it('rejects disabled, hidden, placeholder, tagline, and volume slider', () => {
    expect(qualifiesAsAmbientGlitchTarget({ ...yes, disabled: true })).toBe(false);
    expect(qualifiesAsAmbientGlitchTarget({ ...yes, hidden: true })).toBe(false);
    expect(qualifiesAsAmbientGlitchTarget({ ...yes, placeholder: true })).toBe(false);
    expect(qualifiesAsAmbientGlitchTarget({ ...yes, tagline: true })).toBe(false);
    expect(qualifiesAsAmbientGlitchTarget({ ...yes, slider: true })).toBe(false);
  });
});

describe('qualifiesAsWildAmbientGlitchTarget', () => {
  const base = {
    glitchHit: false,
    interactive: false,
    disabled: false,
    hidden: false,
    placeholder: false,
    tagline: true,
    slider: false,
  };

  it('allows tagline and non-interactive stage chrome', () => {
    expect(qualifiesAsWildAmbientGlitchTarget(base)).toBe(true);
    expect(qualifiesAsWildAmbientGlitchTarget({ ...base, tagline: false })).toBe(true);
  });

  it('still rejects hidden, disabled, placeholder, and sliders', () => {
    expect(qualifiesAsWildAmbientGlitchTarget({ ...base, hidden: true })).toBe(false);
    expect(qualifiesAsWildAmbientGlitchTarget({ ...base, disabled: true })).toBe(false);
    expect(qualifiesAsWildAmbientGlitchTarget({ ...base, placeholder: true })).toBe(false);
    expect(qualifiesAsWildAmbientGlitchTarget({ ...base, slider: true })).toBe(false);
  });
});

describe('preferLeafSurfaces', () => {
  it('drops parents when a descendant is also selected', () => {
    const parent = { id: 'p' } as unknown as HTMLElement;
    const child = { id: 'c' } as unknown as HTMLElement;
    parent.contains = (node: Node) => node === child;
    child.contains = () => false;
    expect(preferLeafSurfaces([parent, child])).toEqual([child]);
  });
});
