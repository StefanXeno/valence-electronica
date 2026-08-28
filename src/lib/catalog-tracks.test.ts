import { describe, expect, it } from 'vitest';
import {
  mergeDiscographyEntries,
  parseCredits,
  parseListenLinks,
  pickPrimaryListenUrl,
  sortCatalogTracks,
  sortDiscographyEntries,
  toDiscographyEntry,
  type CatalogTrack,
  type DiscographyEntry,
} from './catalog-tracks';

function track(id: string, title: string, sortDate: string, extra?: Partial<CatalogTrack>): CatalogTrack {
  return {
    id,
    title,
    sortDate: new Date(sortDate),
    listenLinks: [],
    credits: [],
    ...extra,
  };
}

function row(
  id: string,
  title: string,
  sortDate: string,
  extra?: Partial<DiscographyEntry>,
): DiscographyEntry {
  const date = new Date(sortDate);
  return {
    id,
    title,
    year: date.getUTCFullYear(),
    sortDate: date,
    ...extra,
  };
}

describe('sortCatalogTracks', () => {
  it('sorts by sortDate descending', () => {
    const sorted = sortCatalogTracks([
      track('a', 'Alpha', '2024-01-01'),
      track('b', 'Beta', '2025-06-01'),
      track('c', 'Gamma', '2023-12-01'),
    ]);
    expect(sorted.map((t) => t.id)).toEqual(['b', 'a', 'c']);
  });

  it('tie-breaks by title ascending', () => {
    const sorted = sortCatalogTracks([
      track('a', 'Zulu', '2025-01-01'),
      track('b', 'Alpha', '2025-01-01'),
    ]);
    expect(sorted.map((t) => t.title)).toEqual(['Alpha', 'Zulu']);
  });
});

describe('sortDiscographyEntries', () => {
  it('sorts by full calendar date within the same year', () => {
    const sorted = sortDiscographyEntries([
      row('a', 'Early', '2025-03-01'),
      row('b', 'Late', '2025-11-01'),
    ]);
    expect(sorted.map((e) => e.id)).toEqual(['b', 'a']);
  });
});

describe('parseListenLinks', () => {
  it('omits invalid platform and url', () => {
    const links = parseListenLinks(
      [
        { platform: 'bandcamp', url: 'https://bandcamp.com/album' },
        { platform: 'tiktok', url: 'https://tiktok.com/x' },
        { platform: 'spotify', url: 'not-a-url' },
      ],
      'test',
    );
    expect(links).toHaveLength(1);
    expect(links[0].platform).toBe('bandcamp');
    expect(links[0].label).toBe('Bandcamp');
  });
});

describe('pickPrimaryListenUrl', () => {
  it('prefers bandcamp then spotify', () => {
    const url = pickPrimaryListenUrl([
      { platform: 'youtube', url: 'https://youtube.com/x', label: 'YouTube' },
      { platform: 'spotify', url: 'https://spotify.com/x', label: 'Spotify' },
      { platform: 'bandcamp', url: 'https://bandcamp.com/x', label: 'Bandcamp' },
    ]);
    expect(url).toBe('https://bandcamp.com/x');
  });
});

describe('parseCredits', () => {
  it('omits rows missing role or name', () => {
    const credits = parseCredits(
      [
        { role: 'Producer', name: 'Valence' },
        { role: '', name: 'Ghost' },
        { role: 'Mix', name: '' },
      ],
      'test',
    );
    expect(credits).toEqual([{ role: 'Producer', name: 'Valence' }]);
  });
});

describe('toDiscographyEntry', () => {
  it('omits track rows missing sortDate', () => {
    expect(toDiscographyEntry('x', { label: 'No Date' }, { source: 'track' })).toBeUndefined();
  });

  it('sets jukeboxId when stage-valid', () => {
    const entry = toDiscographyEntry(
      'nightmare',
      { label: 'Nightmare', sortDate: new Date('2025-01-01') },
      { source: 'jukebox', validStageIds: new Set(['nightmare']) },
    );
    expect(entry?.jukeboxId).toBe('nightmare');
  });

  it('omits jukeboxId for catalog-only source', () => {
    const entry = toDiscographyEntry(
      'old-single',
      { label: 'Old', sortDate: new Date('2015-01-01') },
      { source: 'track' },
    );
    expect(entry?.jukeboxId).toBeUndefined();
  });
});

describe('mergeDiscographyEntries', () => {
  it('includes catalog-only rows alongside jukebox rows', () => {
    const merged = mergeDiscographyEntries(
      [row('stage', 'Stage Track', '2025-06-01', { jukeboxId: 'stage' })],
      [row('catalog', 'Catalog Only', '2015-01-01')],
    );
    expect(merged.map((e) => e.id)).toEqual(['stage', 'catalog']);
  });

  it('sorts merged list by date then title', () => {
    const merged = mergeDiscographyEntries(
      [row('b', 'Beta', '2024-06-01')],
      [row('a', 'Alpha', '2025-01-15'), row('c', 'Charlie', '2025-01-01')],
    );
    expect(merged.map((e) => e.id)).toEqual(['a', 'c', 'b']);
  });
});
