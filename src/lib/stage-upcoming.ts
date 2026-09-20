export type ShowEntryInput = {
  id: string;
  date: Date;
  city: string;
  country: string;
  title: string;
  venue: string;
  ticketUrl?: string;
  venueUrl?: string;
  eventUrl?: string;
};

export interface UpcomingShowItem {
  id: string;
  date: Date;
  city: string;
  country: string;
  title: string;
  venue: string;
  ticketUrl?: string;
  venueUrl?: string;
  eventUrl?: string;
}

/** Common touring country names → ISO 3166-1 alpha-2. */
const COUNTRY_CODES: Record<string, string> = {
  germany: 'DE',
  deutschland: 'DE',
  austria: 'AT',
  österreich: 'AT',
  oesterreich: 'AT',
  switzerland: 'CH',
  schweiz: 'CH',
  netherlands: 'NL',
  'the netherlands': 'NL',
  niederlande: 'NL',
  belgium: 'BE',
  belgien: 'BE',
  france: 'FR',
  frankreich: 'FR',
  italy: 'IT',
  italien: 'IT',
  spain: 'ES',
  spanien: 'ES',
  poland: 'PL',
  polen: 'PL',
  'czech republic': 'CZ',
  czechia: 'CZ',
  tschechien: 'CZ',
  'united kingdom': 'GB',
  uk: 'GB',
  england: 'GB',
  'united states': 'US',
  usa: 'US',
};

/** Resolve a country field to a short code (Germany → DE). Already-coded values pass through. */
export function toCountryCode(country: string): string {
  const trimmed = country.trim();
  if (/^[A-Za-z]{2}$/.test(trimmed)) return trimmed.toUpperCase();
  return COUNTRY_CODES[trimmed.toLowerCase()] ?? trimmed;
}

/** City + country for the place line: "Augsburg, DE". */
export function formatShowLocality(city: string, country: string): string {
  return `${city.trim()}, ${toCountryCode(country)}`;
}

function dateKey(value: Date): number {
  return Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate());
}

function isHttpUrl(value?: string): value is string {
  if (!value?.trim()) return false;
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

export function berlinToday(): Date {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Berlin',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date());
  const year = Number(parts.find((part) => part.type === 'year')?.value);
  const month = Number(parts.find((part) => part.type === 'month')?.value);
  const day = Number(parts.find((part) => part.type === 'day')?.value);
  return new Date(Date.UTC(year, month - 1, day));
}

/**
 * Tickets stay available through the event's Berlin calendar day.
 * From the next calendar day onward, the ticket link is hidden.
 */
export function isTicketAvailable(showDate: Date, today: Date): boolean {
  return dateKey(today) <= dateKey(showDate);
}

/** All usable shows (past and future), newest first. */
export function collectUpcomingShows(
  entries: ShowEntryInput[],
  today: Date = berlinToday(),
): UpcomingShowItem[] {
  const items: UpcomingShowItem[] = [];

  for (const entry of entries) {
    // Skip loader placeholders and underscore templates (e.g. `_example.md`).
    if (entry.id.startsWith('__empty__') || entry.id.startsWith('_')) continue;
    const title = entry.title?.trim();
    const venue = entry.venue?.trim();
    if (!entry.date || !entry.city?.trim() || !entry.country?.trim() || !title || !venue) {
      continue;
    }
    const ticketUrl =
      isHttpUrl(entry.ticketUrl) && isTicketAvailable(entry.date, today)
        ? entry.ticketUrl
        : undefined;
    items.push({
      id: entry.id,
      date: entry.date,
      city: entry.city.trim(),
      country: toCountryCode(entry.country),
      title,
      venue,
      ticketUrl,
      venueUrl: isHttpUrl(entry.venueUrl) ? entry.venueUrl : undefined,
      eventUrl: isHttpUrl(entry.eventUrl) ? entry.eventUrl : undefined,
    });
  }

  return items.sort((a, b) => b.date.getTime() - a.date.getTime());
}

export type ShowYearGroup<T extends { date: Date }> = {
  year: number;
  shows: T[];
};

/** Bucket shows into calendar-year groups, newest year first. */
export function groupShowsByYear<T extends { date: Date }>(shows: T[]): ShowYearGroup<T>[] {
  const groups = new Map<number, T[]>();

  for (const show of shows) {
    const year = show.date.getUTCFullYear();
    const bucket = groups.get(year);
    if (bucket) bucket.push(show);
    else groups.set(year, [show]);
  }

  return [...groups.entries()]
    .sort(([yearA], [yearB]) => yearB - yearA)
    .map(([year, yearShows]) => ({ year, shows: yearShows }));
}
