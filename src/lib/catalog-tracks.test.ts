import { describe, expect, it } from 'vitest';
import {
  parseCredits,
  parseListenLinks,
  pickPrimaryListenUrl,
  sortCatalogTracks,
  type CatalogTrack,
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
