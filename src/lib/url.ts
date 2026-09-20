/** Prefix an absolute path with the configured base path (GitHub Pages subpath). */
export function withBase(path: string): string {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  return `${base}${path}`;
}

/** Square artwork shown when a release has no `cover` asset yet. */
export const COVER_PLACEHOLDER_PATH = '/images/covers/placeholder.svg';

export function coverOrPlaceholder(coverUrl?: string): string {
  return withBase(coverUrl?.trim() || COVER_PLACEHOLDER_PATH);
}
