import { describe, expect, it } from 'vitest';
import {
  applyThemeAttributes,
  packAllowsHudGlitch,
  packAllowsMute,
  packSupportsLoopingVideo,
  resolveThemePack,
  resolveThemeId,
} from './theme-packs';

describe('resolveThemePack', () => {
  it('returns nightmare-crimson for a known id', () => {
    const pack = resolveThemePack('nightmare-crimson');
    expect(pack.id).toBe('nightmare-crimson');
    expect(pack.capabilities.hudGlitch).toBe(true);
  });

  it('falls back to default for unknown ids', () => {
    expect(resolveThemePack('not-a-real-pack').id).toBe('default');
  });

  it('falls back to default for empty theme id', () => {
    expect(resolveThemePack('').id).toBe('default');
    expect(resolveThemePack(null).id).toBe('default');
  });

  it('resolveThemeId mirrors pack id', () => {
    expect(resolveThemeId('electric-cyan')).toBe('electric-cyan');
    expect(resolveThemeId('bogus')).toBe('default');
  });
});

describe('applyThemeAttributes', () => {
  it('enables HUD glitch for nightmare-crimson', () => {
    const attrs = applyThemeAttributes(resolveThemePack('nightmare-crimson'));
    expect(attrs.themeId).toBe('nightmare-crimson');
    expect(attrs.hudGlitch).toBe('true');
  });

  it('disables HUD glitch for electric-cyan', () => {
    const attrs = applyThemeAttributes(resolveThemePack('electric-cyan'));
    expect(attrs.hudGlitch).toBe('false');
  });
});

describe('pack capability helpers', () => {
  it('packSupportsLoopingVideo requires sources', () => {
    const pack = resolveThemePack('nightmare-crimson');
    expect(packSupportsLoopingVideo(pack, true)).toBe(true);
    expect(packSupportsLoopingVideo(pack, false)).toBe(false);
  });

  it('packAllowsMute requires audio-eligible pack, entry audio, and video', () => {
    const pack = resolveThemePack('nightmare-crimson');
    expect(packAllowsMute(pack, true, true)).toBe(true);
    expect(packAllowsMute(pack, false, true)).toBe(false);
    expect(packAllowsMute(resolveThemePack('default'), true, true)).toBe(false);
  });

  it('packAllowsHudGlitch matches pack registry', () => {
    expect(packAllowsHudGlitch(resolveThemePack('nightmare-crimson'))).toBe(true);
    expect(packAllowsHudGlitch(resolveThemePack('acid-lime'))).toBe(false);
  });
});
