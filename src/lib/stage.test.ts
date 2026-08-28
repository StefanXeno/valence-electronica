import { describe, expect, it } from 'vitest';
import { berlinToday, collectUpcomingShows } from './stage-upcoming';

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
});
