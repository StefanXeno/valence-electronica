import { describe, expect, it } from 'vitest';
import { clampTransitionGlitchMs } from './glitch';
import { isOpenStagePanelChromeHit, qualifiesAsAmbientGlitchTarget } from './glitch-ambient';

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

describe('isOpenStagePanelChromeHit', () => {
  it('skips only the open panel summary/shell', () => {
    expect(isOpenStagePanelChromeHit({ insideOpenStagePanel: true, isPanelChrome: true })).toBe(
      true,
    );
  });

  it('lets listen-on and other inner HUD hits through while the panel is open', () => {
    expect(isOpenStagePanelChromeHit({ insideOpenStagePanel: true, isPanelChrome: false })).toBe(
      false,
    );
  });

  it('does not skip a closed panel summary', () => {
    expect(isOpenStagePanelChromeHit({ insideOpenStagePanel: false, isPanelChrome: true })).toBe(
      false,
    );
  });
});
