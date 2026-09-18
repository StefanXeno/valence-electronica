import { describe, expect, it } from 'vitest';
import { isStageNavPanelId } from './stage-nav-overlay';

describe('isStageNavPanelId', () => {
  it('accepts nav content sheet ids', () => {
    expect(isStageNavPanelId('about')).toBe(true);
    expect(isStageNavPanelId('discography')).toBe(true);
    expect(isStageNavPanelId('tour')).toBe(true);
    expect(isStageNavPanelId('contact')).toBe(true);
    expect(isStageNavPanelId('shop')).toBe(true);
  });

  it('rejects legal and unknown ids (Imprint/Privacy use LegalOverlay)', () => {
    expect(isStageNavPanelId('info')).toBe(false);
    expect(isStageNavPanelId('imprint')).toBe(false);
    expect(isStageNavPanelId('privacy')).toBe(false);
    expect(isStageNavPanelId('socials')).toBe(false);
    expect(isStageNavPanelId('')).toBe(false);
  });
});
