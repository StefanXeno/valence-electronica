import { describe, expect, it } from 'vitest';
import {
  berlinToday,
  collectUpcomingShows,
  groupShowsByYear,
  resolveShowTitle,
} from './stage-upcoming';

describe('berlinToday', () => {
  it('returns a UTC midnight date for the Berlin calendar day', () => {
    const today = berlinToday();
    expect(today.getUTCHours()).toBe(0);
    expect(today.getUTCMinutes()).toBe(0);
    expect(today.getUTCFullYear()).toBeGreaterThanOrEqual(2025);
  });
});

describe('collectUpcomingShows', () => {
  const today = new Date(Date.UTC(2026, 7, 28));

  it('omits past shows and keeps today inclusive', () => {
    const items = collectUpcomingShows(
      [
        {
          id: 'past',
          date: new Date(Date.UTC(2026, 7, 27)),
          city: 'Berlin',
          venue: 'Past Club',
        },
        {
          id: 'today',
          date: new Date(Date.UTC(2026, 7, 28)),
          city: 'Berlin',
          venue: 'Tonight',
        },
        {
          id: 'future',
          date: new Date(Date.UTC(2026, 9, 1)),
          city: 'Hamburg',
          venue: 'Future Hall',
        },
      ],
      today,
    );

    expect(items.map((item) => item.id)).toEqual(['today', 'future']);
  });

  it('sorts upcoming shows ascending by date', () => {
    const items = collectUpcomingShows(
      [
        {
          id: 'later',
          date: new Date(Date.UTC(2026, 11, 1)),
          city: 'Berlin',
          venue: 'B',
        },
        {
          id: 'sooner',
          date: new Date(Date.UTC(2026, 8, 15)),
          city: 'Berlin',
          venue: 'A',
        },
      ],
      today,
    );

    expect(items.map((item) => item.id)).toEqual(['sooner', 'later']);
  });

  it('skips entries missing required fields', () => {
    const items = collectUpcomingShows(
      [
        {
          id: 'bad',
          date: new Date(Date.UTC(2026, 9, 1)),
          city: '',
          venue: 'Venue',
        },
        {
          id: 'good',
          date: new Date(Date.UTC(2026, 9, 2)),
          city: 'Berlin',
          venue: 'Venue',
        },
      ],
      today,
    );

    expect(items).toHaveLength(1);
    expect(items[0]?.id).toBe('good');
  });

  it('skips underscore template ids even when upcoming', () => {
    const items = collectUpcomingShows(
      [
        {
          id: '_example',
          date: new Date(Date.UTC(2099, 0, 1)),
          city: 'Example City',
          venue: 'Example Venue',
          title: 'Example Night',
          ticketUrl: 'https://tickets.example.com',
        },
        {
          id: 'real',
          date: new Date(Date.UTC(2026, 9, 2)),
          city: 'Berlin',
          venue: 'Venue',
        },
      ],
      today,
    );

    expect(items.map((item) => item.id)).toEqual(['real']);
  });

  it('accepts https ticket URLs only', () => {
    const items = collectUpcomingShows(
      [
        {
          id: 'tickets',
          date: new Date(Date.UTC(2026, 9, 3)),
          city: 'Berlin',
          venue: 'Venue',
          ticketUrl: 'https://tickets.example.com',
        },
        {
          id: 'no-tickets',
          date: new Date(Date.UTC(2026, 9, 4)),
          city: 'Berlin',
          venue: 'Venue',
          ticketUrl: 'not-a-url',
        },
      ],
      today,
    );

    expect(items[0]?.ticketUrl).toBe('https://tickets.example.com');
    expect(items[1]?.ticketUrl).toBeUndefined();
  });

  it('accepts https venue info URLs only', () => {
    const items = collectUpcomingShows(
      [
        {
          id: 'venue-info',
          date: new Date(Date.UTC(2026, 9, 5)),
          city: 'Berlin',
          venue: 'Venue',
          ticketUrl: 'https://tickets.example.com',
          venueUrl: 'https://venue.example.com',
        },
        {
          id: 'bad-venue-url',
          date: new Date(Date.UTC(2026, 9, 6)),
          city: 'Berlin',
          venue: 'Venue',
          venueUrl: 'not-a-url',
        },
      ],
      today,
    );

    expect(items[0]?.venueUrl).toBe('https://venue.example.com');
    expect(items[0]?.ticketUrl).toBe('https://tickets.example.com');
    expect(items[1]?.venueUrl).toBeUndefined();
  });

  it('keeps an optional event title when provided', () => {
    const items = collectUpcomingShows(
      [
        {
          id: 'named',
          date: new Date(Date.UTC(2026, 9, 7)),
          city: 'Berlin',
          venue: 'Example Club',
          title: '  Example Night  ',
        },
      ],
      today,
    );

    expect(items[0]?.title).toBe('Example Night');
  });
});

describe('resolveShowTitle', () => {
  it('uses the event title when present and falls back to venue', () => {
    expect(resolveShowTitle('Example Night', 'Example Club')).toBe('Example Night');
    expect(resolveShowTitle('   ', 'Example Club')).toBe('Example Club');
    expect(resolveShowTitle(undefined, 'Example Venue')).toBe('Example Venue');
  });
});

describe('groupShowsByYear', () => {
  it('groups sorted shows into ascending year buckets', () => {
    const groups = groupShowsByYear([
      {
        id: 'augsburg',
        date: new Date(Date.UTC(2026, 11, 5)),
        city: 'Augsburg',
        venue: 'Example Venue',
      },
      {
        id: 'berlin',
        date: new Date(Date.UTC(2027, 1, 20)),
        city: 'Berlin',
        venue: 'Example Club',
      },
    ]);

    expect(groups.map((group) => group.year)).toEqual([2026, 2027]);
    expect(groups[0]?.shows.map((show) => show.id)).toEqual(['augsburg']);
    expect(groups[1]?.shows.map((show) => show.id)).toEqual(['berlin']);
  });

  it('keeps multiple shows in the same year', () => {
    const groups = groupShowsByYear([
      {
        id: 'one',
        date: new Date(Date.UTC(2026, 8, 1)),
        city: 'Berlin',
        venue: 'A',
      },
      {
        id: 'two',
        date: new Date(Date.UTC(2026, 10, 1)),
        city: 'Hamburg',
        venue: 'B',
      },
    ]);

    expect(groups).toHaveLength(1);
    expect(groups[0]?.year).toBe(2026);
    expect(groups[0]?.shows.map((show) => show.id)).toEqual(['one', 'two']);
  });
});
