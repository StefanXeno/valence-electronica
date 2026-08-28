export const LISTEN_PLATFORMS = [
  'bandcamp',
  'spotify',
  'youtube',
  'soundcloud',
  'tidal',
] as const;

export type ListenPlatform = (typeof LISTEN_PLATFORMS)[number];

export interface ListenLink {
  platform: ListenPlatform;
  url: string;
  label: string;
}

export interface Credit {
  role: string;
  name: string;
}

export interface CatalogTrack {
  id: string;
  title: string;
  sortDate: Date;
  blurb?: string;
  kind?: string;
  listenLinks: ListenLink[];
  credits: Credit[];
  mentions?: string;
}

/** Discography row derived from a jukebox file (single source of truth). */
export interface DiscographyEntry {
  id: string;
  title: string;
  year: number;
  kind?: string;
  url?: string;
  /** Stage id when this release can be played on stage (same as id). */
  jukeboxId?: string;
}

export const PLATFORM_LABELS: Record<ListenPlatform, string> = {
  bandcamp: 'Bandcamp',
  spotify: 'Spotify',
  youtube: 'YouTube',
  soundcloud: 'SoundCloud',
  tidal: 'Tidal',
};

function isListenPlatform(value: string): value is ListenPlatform {
  return (LISTEN_PLATFORMS as readonly string[]).includes(value);
}

export function isHttpUrl(value?: string): value is string {
  if (!value?.trim()) return false;
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

export function parseListenLinks(
  raw: { platform: string; url: string }[] | undefined,
  trackId: string,
): ListenLink[] {
  if (!raw?.length) return [];
  const links: ListenLink[] = [];
  for (const row of raw) {
    const platform = row.platform?.trim().toLowerCase();
    if (!platform || !isListenPlatform(platform)) {
      console.warn(`[catalog] omitted listen link on "${trackId}" (unknown platform "${row.platform}")`);
      continue;
    }
    if (!isHttpUrl(row.url)) {
      console.warn(`[catalog] omitted listen link on "${trackId}" (invalid url)`);
      continue;
    }
    links.push({ platform, url: row.url, label: PLATFORM_LABELS[platform] });
  }
  return links;
}

/** Prefer Bandcamp for discography title links, then Spotify, then first valid link. */
export function pickPrimaryListenUrl(links: ListenLink[]): string | undefined {
  const order: ListenPlatform[] = ['bandcamp', 'spotify', 'youtube', 'soundcloud', 'tidal'];
  for (const platform of order) {
    const match = links.find((link) => link.platform === platform);
    if (match) return match.url;
  }
  return links[0]?.url;
}

export function parseCredits(
  raw: { role: string; name: string }[] | undefined,
  trackId: string,
): Credit[] {
  if (!raw?.length) return [];
  const credits: Credit[] = [];
  for (const row of raw) {
    const role = row.role?.trim();
    const name = row.name?.trim();
    if (!role || !name) {
      console.warn(`[catalog] omitted credit on "${trackId}" (missing role or name)`);
      continue;
    }
    credits.push({ role, name });
  }
  return credits;
}

function dateKey(value: Date): number {
  return Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate());
}

/** Sort newest first; tie-break title ascending. */
export function sortCatalogTracks(tracks: CatalogTrack[]): CatalogTrack[] {
  return [...tracks].sort(
    (a, b) => dateKey(b.sortDate) - dateKey(a.sortDate) || a.title.localeCompare(b.title),
  );
}

export async function getValidCatalogTracks(): Promise<CatalogTrack[]> {
  const { getCollection } = await import('astro:content');
  const raw = await getCollection('jukebox');
  const items: CatalogTrack[] = [];

  for (const entry of raw) {
    if (entry.id.startsWith('__empty__')) continue;
    const title = entry.data.label?.trim();
    const sortDate = entry.data.sortDate;
    if (!title) {
      console.warn(`[catalog] omitted jukebox "${entry.id}" (missing label)`);
      continue;
    }
    if (!sortDate) {
      console.warn(`[catalog] omitted jukebox "${entry.id}" from catalog (missing sortDate)`);
      continue;
    }
    items.push({
      id: entry.id,
      title,
      sortDate,
      blurb: entry.data.blurb?.trim() || undefined,
      listenLinks: parseListenLinks(entry.data.listenLinks, entry.id),
      credits: parseCredits(entry.data.credits, entry.id),
      mentions: entry.data.mentions?.trim() || undefined,
    });
  }

  return sortCatalogTracks(items);
}

export async function getDiscographyFromJukebox(
  validStageIds: ReadonlySet<string>,
): Promise<DiscographyEntry[]> {
  const { getCollection } = await import('astro:content');
  const raw = await getCollection('jukebox');
  const items: DiscographyEntry[] = [];

  for (const entry of raw) {
    if (entry.id.startsWith('__empty__')) continue;
    if (entry.data.inDiscography === false) continue;

    const title = entry.data.label?.trim();
    const sortDate = entry.data.sortDate;
    if (!title) {
      console.warn(`[catalog] omitted jukebox "${entry.id}" (missing label)`);
      continue;
    }
    if (!sortDate) continue;

    const listenLinks = parseListenLinks(entry.data.listenLinks, entry.id);
    items.push({
      id: entry.id,
      title,
      year: sortDate.getUTCFullYear(),
      kind: entry.data.kind?.trim() || undefined,
      url: pickPrimaryListenUrl(listenLinks),
      jukeboxId: validStageIds.has(entry.id) ? entry.id : undefined,
    });
  }

  return items.sort((a, b) => b.year - a.year || a.title.localeCompare(b.title));
}
