import { describe, expect, it } from 'vitest';
import {
  filterThemeTracks,
  groupDiscographyByYear,
  mergeDiscographyEntries,
  parseCredits,
  parseListenLinks,
  parseReleaseKind,
  pickArtistName,
  pickPrimaryListenUrl,
  pickSharedCoverUrl,
  sortCatalogTracks,
  sortCollectionTracks,
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
    listenLinks: [],
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

describe('filterThemeTracks', () => {
  it('keeps stage-bound rows and drops catalog-only releases', () => {
    const filtered = filterThemeTracks([
      row('show-me-how', 'Show Me How', '2026-02-26', { jukeboxId: 'show-me-how' }),
      row('catalog', 'Catalog Only', '2015-01-01'),
    ]);
    expect(filtered.map((e) => e.id)).toEqual(['show-me-how']);
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

  it('sorts merged list newest first by date then title', () => {
    const merged = mergeDiscographyEntries(
      [row('b', 'Beta', '2024-06-01')],
      [row('a', 'Alpha', '2025-01-15'), row('c', 'Charlie', '2025-01-01')],
    );
    expect(merged.map((e) => e.id)).toEqual(['a', 'c', 'b']);
  });
});

describe('parseReleaseKind', () => {
  it('splits Compilation (INITIATE)', () => {
    expect(parseReleaseKind('Compilation (INITIATE)')).toEqual({
      type: 'Compilation',
      collection: 'INITIATE',
      raw: 'Compilation (INITIATE)',
    });
  });

  it('keeps bare Single without collection', () => {
    expect(parseReleaseKind('Single')).toEqual({ type: 'Single', raw: 'Single' });
  });
});

describe('pickSharedCoverUrl', () => {
  it('picks the majority cover across collection members', () => {
    const cover = pickSharedCoverUrl([
      row('a', 'A', '2026-01-01', { coverUrl: '/images/covers/show-me-how.webp' }),
      row('b', 'B', '2026-01-02', { coverUrl: '/images/covers/show-me-how-ep.webp' }),
      row('c', 'C', '2026-01-03', { coverUrl: '/images/covers/show-me-how-ep.webp' }),
    ]);
    expect(cover).toBe('/images/covers/show-me-how-ep.webp');
  });
});

describe('sortCollectionTracks', () => {
  it('orders by trackOrder ascending', () => {
    const sorted = sortCollectionTracks([
      row('warmth', 'Warmth', '2026-01-06', { trackOrder: 3 }),
      row('arkangel', 'Arkangel', '2026-01-05', { trackOrder: 1 }),
      row('hyperion', 'Hyperion', '2026-01-07', { trackOrder: 2 }),
    ]);
    expect(sorted.map((e) => e.id)).toEqual(['arkangel', 'hyperion', 'warmth']);
  });

  it('sinks missing trackOrder after numbered tracks', () => {
    const sorted = sortCollectionTracks([
      row('b', 'Beta', '2020-01-02'),
      row('a', 'Alpha', '2020-01-01', { trackOrder: 1 }),
    ]);
    expect(sorted.map((e) => e.id)).toEqual(['a', 'b']);
  });
});

describe('groupDiscographyByYear', () => {
  it('buckets by year, newest year first', () => {
    const groups = groupDiscographyByYear([
      row('a', 'Alpha', '2025-01-15', { kind: 'Single', kindType: 'Single' }),
      row('b', 'Beta', '2024-06-01', { kind: 'Single', kindType: 'Single' }),
      row('c', 'Charlie', '2025-11-01', { kind: 'Single', kindType: 'Single' }),
    ]);
    expect(groups.map((g) => g.year)).toEqual([2025, 2024]);
    expect(
      groups[0].blocks.map((block) =>
        block.type === 'single' ? block.entry.id : block.label,
      ),
    ).toEqual(['c', 'a']);
  });

  it('groups Compilation / EP tracks under one collection block', () => {
    const groups = groupDiscographyByYear([
      row('joyride', 'Joyride', '2014-01-01', {
        kind: 'Compilation (INITIATE)',
        kindType: 'Compilation',
        collection: 'INITIATE',
        trackOrder: 1,
        coverUrl: '/images/covers/initiate.webp',
      }),
      row('keys', 'Keys', '2014-01-03', {
        kind: 'Compilation (INITIATE)',
        kindType: 'Compilation',
        collection: 'INITIATE',
        trackOrder: 13,
        coverUrl: '/images/covers/initiate.webp',
      }),
      row('spirited', 'Spirited', '2014-06-01', { kind: 'Single', kindType: 'Single' }),
    ]);
    expect(groups).toHaveLength(1);
    expect(groups[0].blocks).toHaveLength(2);
    // Newest block first: Spirited (Jun) before INITIATE (placed by newest member Keys = Jan 3)
    expect(groups[0].blocks[0]).toMatchObject({ type: 'single' });
    expect(groups[0].blocks[1]).toMatchObject({
      type: 'collection',
      label: 'Compilation (INITIATE)',
      collection: 'INITIATE',
    });
    if (groups[0].blocks[1].type !== 'collection') throw new Error('expected collection');
    expect(groups[0].blocks[1].entries.map((e) => e.id)).toEqual(['joyride', 'keys']);
  });

  it('uses trackOrder for collection tracklist, not newest-first date', () => {
    const groups = groupDiscographyByYear([
      row('warmth', 'Warmth', '2026-01-06', {
        kind: 'EP (ANGELS)',
        kindType: 'EP',
        collection: 'ANGELS',
        trackOrder: 3,
      }),
      row('arkangel', 'Arkangel', '2026-01-05', {
        kind: 'EP (ANGELS)',
        kindType: 'EP',
        collection: 'ANGELS',
        trackOrder: 1,
      }),
      row('hyperion', 'Hyperion', '2026-01-07', {
        kind: 'EP (ANGELS)',
        kindType: 'EP',
        collection: 'ANGELS',
        trackOrder: 2,
      }),
    ]);
    expect(groups).toHaveLength(1);
    expect(groups[0].blocks).toHaveLength(1);
    if (groups[0].blocks[0].type !== 'collection') throw new Error('expected collection');
    expect(groups[0].blocks[0].entries.map((e) => e.id)).toEqual([
      'arkangel',
      'hyperion',
      'warmth',
    ]);
  });
});

describe('toDiscographyEntry cover and notes', () => {
  it('passes through coverUrl and notes', () => {
    const entry = toDiscographyEntry(
      'x',
      {
        label: 'Covered',
        sortDate: new Date('2020-01-01'),
        coverUrl: '/images/posters/x.jpg',
        notes: 'Short note',
      },
      { source: 'track' },
    );
    expect(entry?.coverUrl).toBe('/images/posters/x.jpg');
    expect(entry?.notes).toBe('Short note');
  });

  it('falls back notes from blurb', () => {
    const entry = toDiscographyEntry(
      'x',
      {
        label: 'Blurbed',
        sortDate: new Date('2020-01-01'),
        blurb: 'From blurb',
      },
      { source: 'jukebox', validStageIds: new Set(['x']) },
    );
    expect(entry?.notes).toBe('From blurb');
  });

  it('reads artist from credits role Artist', () => {
    const entry = toDiscographyEntry(
      'gas',
      {
        label: 'Gasoline (Valence Remix)',
        sortDate: new Date('2017-01-06'),
        credits: [{ role: 'Artist', name: 'Halsey' }],
      },
      { source: 'track' },
    );
    expect(entry?.artist).toBe('Halsey');
    expect(pickArtistName([{ role: 'Artist', name: 'Halsey' }], 'Valence')).toBe('Halsey');
  });

  it('passes through trackOrder', () => {
    const entry = toDiscographyEntry(
      'arkangel',
      {
        label: 'Arkangel',
        sortDate: new Date('2026-01-05'),
        kind: 'EP (ANGELS)',
        trackOrder: 1,
      },
      { source: 'track' },
    );
    expect(entry?.trackOrder).toBe(1);
  });

  it('passes through rubbable when true', () => {
    const entry = toDiscographyEntry(
      'taking-over',
      {
        label: 'Taking Over',
        sortDate: new Date('2025-07-12'),
        rubbable: true,
      },
      { source: 'jukebox', validStageIds: new Set(['taking-over']) },
    );
    expect(entry?.rubbable).toBe(true);
  });

  it('omits rubbable when false or unset', () => {
    const off = toDiscographyEntry(
      'x',
      { label: 'X', sortDate: new Date('2020-01-01'), rubbable: false },
      { source: 'track' },
    );
    const unset = toDiscographyEntry(
      'y',
      { label: 'Y', sortDate: new Date('2020-01-01') },
      { source: 'track' },
    );
    expect(off?.rubbable).toBeUndefined();
    expect(unset?.rubbable).toBeUndefined();
  });
});
