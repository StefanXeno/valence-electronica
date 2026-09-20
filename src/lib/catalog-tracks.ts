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

export interface ParsedReleaseKind {
  /** e.g. EP, Compilation, Single */
  type: string;
  /** Name inside parentheses, e.g. INITIATE */
  collection?: string;
  /** Original kind string */
  raw: string;
}

/** Discography row — jukebox-backed or catalog-only (tracks collection). */
export interface DiscographyEntry {
  id: string;
  title: string;
  year: number;
  sortDate: Date;
  kind?: string;
  /** Parsed kind type (EP / Compilation / Single / …). */
  kindType?: string;
  /** Collection name when kind is `EP (NAME)` / `Compilation (NAME)`. */
  collection?: string;
  /** Display artist (from credits role Artist). */
  artist?: string;
  url?: string;
  listenLinks: ListenLink[];
  /** Stage id when this release can be played on stage (same as id). */
  jukeboxId?: string;
  /** Cover art under public/ when available (jukebox cover/poster or track cover). */
  coverUrl?: string;
  /** Expanded-panel notes: blurb, or tracks-collection body. */
  notes?: string;
}

/** Single track or EP/Compilation group inside a year. */
export type DiscographyBlock =
  | { type: 'single'; entry: DiscographyEntry }
  | {
      type: 'collection';
      kindType: string;
      collection: string;
      /** Full label, e.g. `Compilation (INITIATE)`. */
      label: string;
      coverUrl?: string;
      sortDate: Date;
      year: number;
      entries: DiscographyEntry[];
    };

export interface DiscographyYearGroup {
  year: number;
  blocks: DiscographyBlock[];
}

export interface CatalogMetadataFields {
  label?: string;
  sortDate?: Date;
  kind?: string;
  listenLinks?: { platform: string; url: string }[];
  coverUrl?: string;
  notes?: string;
  blurb?: string;
  credits?: { role: string; name: string }[];
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

/** Artist credit when role is Artist (remixes / collabs). */
export function pickArtistName(
  credits: Credit[] | undefined,
  fallback?: string,
): string | undefined {
  const hit = credits?.find((credit) => credit.role.trim().toLowerCase() === 'artist');
  return hit?.name.trim() || fallback?.trim() || undefined;
}

/** Parse `Compilation (INITIATE)` / `EP (ANGELS)` / `Single`. */
export function parseReleaseKind(kind?: string): ParsedReleaseKind | undefined {
  const raw = kind?.trim();
  if (!raw) return undefined;
  const match = raw.match(/^(.+?)\s*\((.+)\)\s*$/);
  if (match) {
    return { type: match[1].trim(), collection: match[2].trim(), raw };
  }
  return { type: raw, raw };
}

export function isCollectionKind(parsed?: ParsedReleaseKind): boolean {
  if (!parsed?.collection) return false;
  const type = parsed.type.toLowerCase();
  return type === 'ep' || type === 'compilation' || type === 'album';
}

/** Majority-share cover across collection members (ties → first seen). */
export function pickSharedCoverUrl(entries: DiscographyEntry[]): string | undefined {
  const counts = new Map<string, number>();
  const order: string[] = [];
  for (const entry of entries) {
    if (!entry.coverUrl) continue;
    if (!counts.has(entry.coverUrl)) order.push(entry.coverUrl);
    counts.set(entry.coverUrl, (counts.get(entry.coverUrl) ?? 0) + 1);
  }
  let best: string | undefined;
  let bestCount = 0;
  for (const url of order) {
    const count = counts.get(url) ?? 0;
    if (count > bestCount) {
      best = url;
      bestCount = count;
    }
  }
  return best;
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

/** Newest first — theme playlist / legacy callers. */
export function sortDiscographyEntries(entries: DiscographyEntry[]): DiscographyEntry[] {
  return [...entries].sort(
    (a, b) => dateKey(b.sortDate) - dateKey(a.sortDate) || a.title.localeCompare(b.title),
  );
}

/** Oldest first — catalog discography timeline. */
export function sortDiscographyEntriesAsc(entries: DiscographyEntry[]): DiscographyEntry[] {
  return [...entries].sort(
    (a, b) => dateKey(a.sortDate) - dateKey(b.sortDate) || a.title.localeCompare(b.title),
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

  const notes = data.notes?.trim() || data.blurb?.trim() || undefined;
  const coverUrl = data.coverUrl?.trim() || undefined;
  const credits = parseCredits(data.credits, id);
  const parsed = parseReleaseKind(data.kind);

  return {
    id,
    title,
    year: sortDate.getUTCFullYear(),
    sortDate,
    kind: data.kind?.trim() || undefined,
    kindType: parsed?.type,
    collection: parsed?.collection,
    artist: pickArtistName(credits),
    url: pickPrimaryListenUrl(listenLinks),
    listenLinks,
    jukeboxId,
    coverUrl,
    notes,
  };
}

function blockSortDate(block: DiscographyBlock): Date {
  return block.type === 'single' ? block.entry.sortDate : block.sortDate;
}

function blockSortTitle(block: DiscographyBlock): string {
  return block.type === 'single' ? block.entry.title : block.label;
}

/**
 * Bucket into calendar years (newest first). Within each year, EP/Compilation
 * tracks sharing the same kind string become one collection block; singles stay
 * individual. Timeline order is newest → oldest.
 */
export function groupDiscographyByYear(entries: DiscographyEntry[]): DiscographyYearGroup[] {
  const sorted = sortDiscographyEntries(entries);
  const collectionBuckets = new Map<string, DiscographyEntry[]>();
  const singles: DiscographyEntry[] = [];

  for (const entry of sorted) {
    const parsed = parseReleaseKind(entry.kind);
    if (isCollectionKind(parsed) && entry.kind) {
      const key = entry.kind.trim();
      const bucket = collectionBuckets.get(key);
      if (bucket) bucket.push(entry);
      else collectionBuckets.set(key, [entry]);
    } else {
      singles.push(entry);
    }
  }

  const blocks: DiscographyBlock[] = singles.map((entry) => ({ type: 'single' as const, entry }));

  for (const [rawKind, members] of collectionBuckets) {
    const parsed = parseReleaseKind(rawKind);
    if (!parsed?.collection) continue;
    const ordered = sortDiscographyEntries(members);
    const coverUrl = pickSharedCoverUrl(ordered);
    const withCover = ordered.map((entry) => ({
      ...entry,
      coverUrl: coverUrl ?? entry.coverUrl,
    }));
    // Newest track date places the collection in the year timeline.
    const sortDate = ordered[0]?.sortDate;
    if (!sortDate) continue;
    blocks.push({
      type: 'collection',
      kindType: parsed.type,
      collection: parsed.collection,
      label: rawKind,
      coverUrl,
      sortDate,
      year: sortDate.getUTCFullYear(),
      entries: withCover,
    });
  }

  blocks.sort(
    (a, b) =>
      dateKey(blockSortDate(b)) - dateKey(blockSortDate(a)) ||
      blockSortTitle(a).localeCompare(blockSortTitle(b)),
  );

  const years = new Map<number, DiscographyBlock[]>();
  for (const block of blocks) {
    const year = block.type === 'single' ? block.entry.year : block.year;
    const bucket = years.get(year);
    if (bucket) bucket.push(block);
    else years.set(year, [block]);
  }

  return [...years.entries()]
    .sort(([yearA], [yearB]) => yearB - yearA)
    .map(([year, yearBlocks]) => ({ year, blocks: yearBlocks }));
}

/** Stage/theme switcher — has a jukebox id, even when hasAudio is false (e.g. Show Me How). */
export function isThemeTrack(entry: DiscographyEntry): boolean {
  return Boolean(entry.jukeboxId);
}

/** Drop catalog-only releases that cannot change the stage / background. */
export function filterThemeTracks(entries: DiscographyEntry[]): DiscographyEntry[] {
  return entries.filter(isThemeTrack);
}

/**
 * Theme playlist: every valid jukebox/stage entry, including `inDiscography: false`
 * and hasAudio: false. Catalog-only tracks are never included.
 */
export async function getThemeTrackDiscography(
  validStageIds: ReadonlySet<string>,
): Promise<DiscographyEntry[]> {
  const { getCollection } = await import('astro:content');
  const jukeboxRaw = await getCollection('jukebox');
  const rows: DiscographyEntry[] = [];

  for (const entry of jukeboxRaw) {
    if (entry.id.startsWith('__empty__')) continue;
    if (!validStageIds.has(entry.id)) continue;

    const row = toDiscographyEntry(
      entry.id,
      {
        ...entry.data,
        sortDate: entry.data.sortDate ?? new Date(0),
        coverUrl: entry.data.cover ?? entry.data.poster,
        notes: entry.data.blurb?.trim() || undefined,
        credits: entry.data.credits,
      },
      { source: 'jukebox', validStageIds },
    );
    if (row?.jukeboxId) rows.push(row);
  }

  return sortDiscographyEntries(rows);
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

    const row = toDiscographyEntry(
      entry.id,
      {
        ...entry.data,
        coverUrl: entry.data.cover ?? entry.data.poster,
        // Stage body is lyrics — discography notes use blurb only.
        notes: entry.data.blurb?.trim() || undefined,
        credits: entry.data.credits,
      },
      {
        source: 'jukebox',
        validStageIds,
      },
    );
    if (row) jukeboxRows.push(row);
  }

  const trackRows: DiscographyEntry[] = [];
  for (const entry of tracksRaw) {
    if (entry.id.startsWith('__empty__')) continue;
    if (jukeboxIds.has(entry.id)) {
      console.info(`[catalog] track "${entry.id}" skipped (jukebox entry wins)`);
      continue;
    }
    const row = toDiscographyEntry(
      entry.id,
      {
        ...entry.data,
        coverUrl: entry.data.cover,
        notes: entry.data.blurb?.trim() || entry.body?.trim() || undefined,
        credits: entry.data.credits,
      },
      { source: 'track' },
    );
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
