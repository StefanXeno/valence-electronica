/**
 * Top-level overlay routes for SiteNav content (About / Tour / …).
 * Legal pages stay under `/legal/{slug}`; content uses `/{slug}`.
 * Both open through LegalOverlay + LegalPanel (same click / history / Escape path).
 */

export const CONTENT_OVERLAY_SLUGS = [
  'about',
  'discography',
  'tour',
  'contact',
  'shop',
] as const;

export type ContentOverlaySlug = (typeof CONTENT_OVERLAY_SLUGS)[number];

const CONTENT_SET = new Set<string>(CONTENT_OVERLAY_SLUGS);

export function isContentOverlaySlug(slug: string): slug is ContentOverlaySlug {
  return CONTENT_SET.has(slug);
}

/** Strip configured base path; return site-relative pathname (leading `/`). */
export function stripBasePath(pathname: string, basePath: string): string {
  if (basePath && pathname.startsWith(basePath)) {
    return pathname.slice(basePath.length) || '/';
  }
  return pathname;
}

/**
 * Resolve overlay slug from a pathname.
 * `/legal/imprint` → imprint; `/about` → about; `/` → null.
 */
export function slugFromOverlayPath(pathname: string, basePath: string): string | null {
  const stripped = stripBasePath(pathname, basePath);
  const legalMatch = stripped.match(/^\/legal\/([^/]+)\/?$/);
  if (legalMatch) return decodeURIComponent(legalMatch[1]);
  const contentMatch = stripped.match(/^\/([^/]+)\/?$/);
  if (contentMatch && isContentOverlaySlug(contentMatch[1])) {
    return decodeURIComponent(contentMatch[1]);
  }
  return null;
}

/** History URL for an overlay slug (content top-level, legal under `/legal/`). */
export function overlayPathForSlug(slug: string, basePath: string): string {
  if (isContentOverlaySlug(slug)) {
    return `${basePath}/${slug}`;
  }
  return `${basePath}/legal/${slug}`;
}
