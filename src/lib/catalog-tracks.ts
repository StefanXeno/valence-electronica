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

/** Discography row — jukebox-backed or catalog-only (tracks collection). */
export interface DiscographyEntry {
  id: string;
  title: string;
  year: number;
  sortDate: Date;
  kind?: string;
  url?: string;
  /** Stage id when this release can be played on stage (same as id). */
  jukeboxId?: string;
}

export interface CatalogMetadataFields {
  label?: string;
  sortDate?: Date;
  kind?: string;
  listenLinks?: { platform: string; url: string }[];
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

export function dateKey(value: Date): number {
  return Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate());
}

/** Sort newest first; tie-break title ascending. */
export function sortCatalogTracks(tracks: CatalogTrack[]): CatalogTrack[] {
  return [...tracks].sort(
    (a, b) => dateKey(b.sortDate) - dateKey(a.sortDate) || a.title.localeCompare(b.title),
  );
}

export function sortDiscographyEntries(entries: DiscographyEntry[]): DiscographyEntry[] {
  return [...entries].sort(
    (a, b) => dateKey(b.sortDate) - dateKey(a.sortDate) || a.title.localeCompare(b.title),
  );
}

export function toDiscographyEntry(
  id: string,
  data: CatalogMetadataFields,
  options: { source: 'jukebox' | 'track'; validStageIds?: ReadonlySet<string> },
): DiscographyEntry | undefined {
  const title = data.label?.trim();
  const sortDate = data.sortDate;
  if (!title) {
    const kind = options.source === 'jukebox' ? 'jukebox' : 'track';
    console.warn(`[catalog] omitted ${kind} "${id}" (missing label)`);
    return undefined;
  }
  if (!sortDate) {
    if (options.source === 'track') {
      console.warn(`[catalog] omitted track "${id}" (missing sortDate)`);
    }
    return undefined;
  }

  const listenLinks = parseListenLinks(data.listenLinks, id);
  const jukeboxId =
    options.source === 'jukebox' && options.validStageIds?.has(id) ? id : undefined;

  return {
    id,
    title,
    year: sortDate.getUTCFullYear(),
    sortDate,
    kind: data.kind?.trim() || undefined,
    url: pickPrimaryListenUrl(listenLinks),
    jukeboxId,
  };
}

/** Merge jukebox-derived rows with catalog-only rows; track rows must already exclude jukebox ids. */
export function mergeDiscographyEntries(
  jukeboxRows: DiscographyEntry[],
  trackRows: DiscographyEntry[],
): DiscographyEntry[] {
  return sortDiscographyEntries([...jukeboxRows, ...trackRows]);
}

export async function getMergedDiscography(
  validStageIds: ReadonlySet<string>,
): Promise<DiscographyEntry[]> {
  const { getCollection } = await import('astro:content');
  const [jukeboxRaw, tracksRaw] = await Promise.all([
    getCollection('jukebox'),
    getCollection('tracks'),
  ]);

  const jukeboxIds = new Set<string>();
  const jukeboxRows: DiscographyEntry[] = [];

  for (const entry of jukeboxRaw) {
    if (entry.id.startsWith('__empty__')) continue;
    jukeboxIds.add(entry.id);
    if (entry.data.inDiscography === false) continue;

    const row = toDiscographyEntry(entry.id, entry.data, {
      source: 'jukebox',
      validStageIds,
    });
    if (row) jukeboxRows.push(row);
  }

  const trackRows: DiscographyEntry[] = [];
  for (const entry of tracksRaw) {
    if (entry.id.startsWith('__empty__')) continue;
    if (jukeboxIds.has(entry.id)) {
      console.info(`[catalog] track "${entry.id}" skipped (jukebox entry wins)`);
      continue;
    }
    const row = toDiscographyEntry(entry.id, entry.data, { source: 'track' });
    if (row) trackRows.push(row);
  }

  return mergeDiscographyEntries(jukeboxRows, trackRows);
}

/** @deprecated Use getMergedDiscography — kept as alias for callers migrating incrementally. */
export async function getDiscographyFromJukebox(
  validStageIds: ReadonlySet<string>,
): Promise<DiscographyEntry[]> {
  return getMergedDiscography(validStageIds);
}
