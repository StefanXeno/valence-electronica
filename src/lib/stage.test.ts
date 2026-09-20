import { describe, expect, it } from 'vitest';
import {
  berlinToday,
  collectUpcomingShows,
  formatShowLocality,
  groupShowsByYear,
  isTicketAvailable,
  toCountryCode,
} from './stage-upcoming';

/** Minimal valid show — required: date, city, country, title, venue. */
function show(
  overrides: Partial<Parameters<typeof collectUpcomingShows>[0][number]> & { id: string },
): Parameters<typeof collectUpcomingShows>[0][number] {
  return {
    date: new Date(Date.UTC(2026, 9, 1)),
    city: 'Berlin',
    country: 'Germany',
    title: 'Night',
    venue: 'Club',
    ...overrides,
  };
}

describe('berlinToday', () => {
  it('returns a UTC midnight date for the Berlin calendar day', () => {
    const today = berlinToday();
    expect(today.getUTCHours()).toBe(0);
    expect(today.getUTCMinutes()).toBe(0);
    expect(today.getUTCFullYear()).toBeGreaterThanOrEqual(2025);
  });
});

describe('collectUpcomingShows', () => {
  it('includes past and future shows, newest first', () => {
    const items = collectUpcomingShows([
      show({ id: 'past', date: new Date(Date.UTC(2026, 7, 27)), title: 'Past' }),
      show({ id: 'today', date: new Date(Date.UTC(2026, 7, 28)), title: 'Tonight' }),
      show({
        id: 'future',
        date: new Date(Date.UTC(2026, 9, 1)),
        city: 'Hamburg',
        title: 'Future',
      }),
    ]);

    expect(items.map((item) => item.id)).toEqual(['future', 'today', 'past']);
  });

  it('sorts shows newest first by date', () => {
    const items = collectUpcomingShows([
      show({ id: 'later', date: new Date(Date.UTC(2026, 11, 1)) }),
      show({ id: 'sooner', date: new Date(Date.UTC(2026, 8, 15)) }),
    ]);

    expect(items.map((item) => item.id)).toEqual(['later', 'sooner']);
  });

  it('skips entries missing required fields', () => {
    const items = collectUpcomingShows([
      show({ id: 'bad-city', city: '' }),
      show({ id: 'bad-country', country: '' }),
      show({ id: 'bad-title', title: '' }),
      show({ id: 'bad-venue', venue: '' }),
      show({ id: 'good', date: new Date(Date.UTC(2026, 9, 2)) }),
    ]);

    expect(items).toHaveLength(1);
    expect(items[0]?.id).toBe('good');
  });

  it('skips underscore template ids', () => {
    const items = collectUpcomingShows([
      show({
        id: '_example',
        date: new Date(Date.UTC(2099, 0, 1)),
        title: 'Example Night',
        ticketUrl: 'https://tickets.example.com',
      }),
      show({ id: 'real', date: new Date(Date.UTC(2026, 9, 2)) }),
    ]);

    expect(items.map((item) => item.id)).toEqual(['real']);
  });

  it('accepts https ticket URLs only', () => {
    const today = new Date(Date.UTC(2026, 7, 28));
    const items = collectUpcomingShows(
      [
        show({
          id: 'tickets',
          date: new Date(Date.UTC(2026, 9, 3)),
          ticketUrl: 'https://tickets.example.com',
        }),
        show({
          id: 'no-tickets',
          date: new Date(Date.UTC(2026, 9, 4)),
          ticketUrl: 'not-a-url',
        }),
      ],
      today,
    );

    expect(items.find((item) => item.id === 'tickets')?.ticketUrl).toBe(
      'https://tickets.example.com',
    );
    expect(items.find((item) => item.id === 'no-tickets')?.ticketUrl).toBeUndefined();
  });

  it('accepts https venue and event URLs only', () => {
    const today = new Date(Date.UTC(2026, 7, 28));
    const items = collectUpcomingShows(
      [
        show({
          id: 'venue-info',
          date: new Date(Date.UTC(2026, 9, 5)),
          venue: 'Venue',
          ticketUrl: 'https://tickets.example.com',
          venueUrl: 'https://venue.example.com',
          eventUrl: 'https://event.example.com',
        }),
        show({
          id: 'bad-urls',
          date: new Date(Date.UTC(2026, 9, 6)),
          venue: 'Venue',
          venueUrl: 'not-a-url',
          eventUrl: 'also-bad',
        }),
      ],
      today,
    );

    const venueInfo = items.find((item) => item.id === 'venue-info');
    expect(venueInfo?.venueUrl).toBe('https://venue.example.com');
    expect(venueInfo?.eventUrl).toBe('https://event.example.com');
    expect(venueInfo?.ticketUrl).toBe('https://tickets.example.com');
    expect(items.find((item) => item.id === 'bad-urls')?.venueUrl).toBeUndefined();
    expect(items.find((item) => item.id === 'bad-urls')?.eventUrl).toBeUndefined();
  });

  it('hides ticket links starting the calendar day after the event', () => {
    const eventDay = new Date(Date.UTC(2026, 7, 28));
    const dayAfter = new Date(Date.UTC(2026, 7, 29));
    const entry = show({
      id: 'gig',
      date: eventDay,
      venue: 'Venue',
      ticketUrl: 'https://tickets.example.com',
      venueUrl: 'https://venue.example.com',
      eventUrl: 'https://event.example.com',
    });

    const onEventDay = collectUpcomingShows([entry], eventDay);
    expect(onEventDay[0]?.ticketUrl).toBe('https://tickets.example.com');
    expect(onEventDay[0]?.venueUrl).toBe('https://venue.example.com');
    expect(onEventDay[0]?.eventUrl).toBe('https://event.example.com');

    const afterEvent = collectUpcomingShows([entry], dayAfter);
    expect(afterEvent[0]?.ticketUrl).toBeUndefined();
    expect(afterEvent[0]?.venueUrl).toBe('https://venue.example.com');
    expect(afterEvent[0]?.eventUrl).toBe('https://event.example.com');
  });

  it('trims the required event title', () => {
    const items = collectUpcomingShows(
      [show({ id: 'named', date: new Date(Date.UTC(2026, 9, 7)), title: '  Example Night  ' })],
      new Date(Date.UTC(2026, 7, 28)),
    );

    expect(items[0]?.title).toBe('Example Night');
  });

  it('normalizes country names to ISO short codes', () => {
    const items = collectUpcomingShows([
      show({ id: 'named', country: 'Germany' }),
      show({ id: 'coded', country: 'de', date: new Date(Date.UTC(2026, 9, 2)) }),
    ]);

    expect(items.find((item) => item.id === 'named')?.country).toBe('DE');
    expect(items.find((item) => item.id === 'coded')?.country).toBe('DE');
  });
});

describe('toCountryCode / formatShowLocality', () => {
  it('maps common names and formats City, CC', () => {
    expect(toCountryCode('Germany')).toBe('DE');
    expect(toCountryCode('deutschland')).toBe('DE');
    expect(toCountryCode('at')).toBe('AT');
    expect(formatShowLocality('Augsburg', 'Germany')).toBe('Augsburg, DE');
  });
});

describe('isTicketAvailable', () => {
  it('is true on the event day and false the next Berlin calendar day', () => {
    const event = new Date(Date.UTC(2026, 7, 28));
    expect(isTicketAvailable(event, new Date(Date.UTC(2026, 7, 27)))).toBe(true);
    expect(isTicketAvailable(event, new Date(Date.UTC(2026, 7, 28)))).toBe(true);
    expect(isTicketAvailable(event, new Date(Date.UTC(2026, 7, 29)))).toBe(false);
  });
});

describe('groupShowsByYear', () => {
  it('groups shows into newest-first year buckets', () => {
    const groups = groupShowsByYear([
      show({ id: 'augsburg', date: new Date(Date.UTC(2026, 11, 5)), city: 'Augsburg' }),
      show({ id: 'berlin', date: new Date(Date.UTC(2027, 1, 20)) }),
    ]);

    expect(groups.map((group) => group.year)).toEqual([2027, 2026]);
    expect(groups[0]?.shows.map((s) => s.id)).toEqual(['berlin']);
    expect(groups[1]?.shows.map((s) => s.id)).toEqual(['augsburg']);
  });

  it('keeps multiple shows in the same year', () => {
    const groups = groupShowsByYear([
      show({ id: 'two', date: new Date(Date.UTC(2026, 10, 1)), city: 'Hamburg' }),
      show({ id: 'one', date: new Date(Date.UTC(2026, 8, 1)) }),
    ]);

    expect(groups).toHaveLength(1);
    expect(groups[0]?.year).toBe(2026);
    expect(groups[0]?.shows.map((s) => s.id)).toEqual(['two', 'one']);
  });
});
