import { describe, expect, it } from 'vitest';
import {
  isContentOverlaySlug,
  overlayPathForSlug,
  slugFromOverlayPath,
  stripBasePath,
} from './content-overlay';

describe('content-overlay routes', () => {
  it('recognizes SiteNav content slugs only', () => {
    expect(isContentOverlaySlug('about')).toBe(true);
    expect(isContentOverlaySlug('shop')).toBe(true);
    expect(isContentOverlaySlug('imprint')).toBe(false);
    expect(isContentOverlaySlug('privacy')).toBe(false);
    expect(isContentOverlaySlug('info')).toBe(false);
  });

  it('maps content slugs to top-level paths and legal under /legal/', () => {
    expect(overlayPathForSlug('about', '/valence-electronica')).toBe(
      '/valence-electronica/about',
    );
    expect(overlayPathForSlug('imprint', '/valence-electronica')).toBe(
      '/valence-electronica/legal/imprint',
    );
    expect(overlayPathForSlug('tour', '')).toBe('/tour');
  });

  it('parses slug from content and legal pathnames', () => {
    const base = '/valence-electronica';
    expect(slugFromOverlayPath(`${base}/about`, base)).toBe('about');
    expect(slugFromOverlayPath(`${base}/legal/privacy`, base)).toBe('privacy');
    expect(slugFromOverlayPath(`${base}/`, base)).toBe(null);
    expect(slugFromOverlayPath(`${base}/unknown`, base)).toBe(null);
  });

  it('strips base path for matching', () => {
    expect(stripBasePath('/valence-electronica/tour', '/valence-electronica')).toBe('/tour');
    expect(stripBasePath('/tour', '')).toBe('/tour');
  });
});
